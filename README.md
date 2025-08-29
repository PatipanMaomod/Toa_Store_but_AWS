# Teburu — E-commerce Web Application (AWS)

เอกสารนี้เป็น `README.md` สำหรับโปรเจกต์เว็บขายของออนไลน์ (Frontend + Backend + Database + Storage + CI/CD + Auto-scaling)

---

## 📌 สรุปโปรเจกต์

**Teburu** เป็นเว็บขายของออนไลน์ที่ประกอบด้วย

* Frontend: Static SPA (built) โฮสต์บน **S3 + CloudFront**
* Backend API: Node.js/Express (หรือภาษาใดก็ได้) รันบน **EC2** (behind ALB)
* Database: **RDS MySQL** (หรือ **Aurora MySQL**)
* Object Storage: **S3** (รูปสินค้า, avatars)
* CI/CD: **GitHub Actions** (build → test → deploy)
* Load balancing & Auto-scaling: **ALB + Auto Scaling Group**
* Monitoring: **CloudWatch** (metrics, logs, alarms)

---

## 🏛️ สถาปัตยกรรม (Architecture)

```mermaid
flowchart LR
  subgraph CDN
    A[S3 Static Website] -->|CloudFront| B[Users]
  end
  subgraph Compute
    B2[ALB] --> ASG[Auto Scaling Group (EC2)]
    ASG --> API[Backend API (Express)]
  end
  API --> RDS[(RDS MySQL / Aurora)]
  API --> S3[(S3 - Images)]
  API --> CloudWatch
```

---

## 🧱 ส่วนประกอบ (High-level)

* Customer Register / Login (JWT or Session)
* Product management (CRUD)
* Cart & Checkout
* Admin panel (manage orders, staff)
* Image upload → S3
* DB schema: customers, users (staff), products, cart\_items, orders, order\_items, product\_images

---

## 🔧 ตัวอย่างโครงสร้างฐานข้อมูล (SQL snippet)

```sql
CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT,
  s3_key VARCHAR(1024),
  is_primary BOOL DEFAULT FALSE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

---

## ☁️ AWS Setup — ขั้นตอนสั้น ๆ

1. **S3 + CloudFront**

   * สร้าง S3 Bucket (static-website) และตั้ง policy ให้ public-read สำหรับไฟล์ static (หรือใช้ Origin Access Identity ของ CloudFront)
   * สร้าง CloudFront distribution ชี้ไปที่ S3
2. **RDS**

   * สร้าง RDS MySQL (หรือ Aurora Serverless / Provisioned)
   * ตั้งค่า subnet group, security groups ให้ EC2/ALB สามารถเข้าถึง
3. **EC2 + ALB + ASG**

   * สร้าง AMI หรือ EC2 user-data สำหรับ deploy app (systemd / PM2)
   * สร้าง Launch Template → Auto Scaling Group
   * สร้าง ALB, target group ชี้ไปยัง ASG
   * Health check: `/healthz` endpoint
4. **S3 for images**

   * สร้าง separate bucket (eg. `teburu-images`), ตั้ง CORS และ lifecycle rules (expire unused uploads)
   * ให้ backend เขียนไฟล์โดยใช้ IAM role (ไม่ใช้ access keys เก็บใน code)
5. **IAM**

   * สร้าง IAM Role for EC2 with permissions: `s3:PutObject/GetObject`, `ssm:SendCommand` (ถ้าต้องการ)
6. **CloudWatch**

   * สร้าง log group และส่ง logs จาก app (CloudWatch Agent / awslogs)
   * CloudWatch Alarms: CPU > 70%, High latency, 5XX error rate

---

## 🔁 Auto-scaling (Recommended policies)

* **Scale-out**: CPUUtilization > 70% for 2 consecutive 1-minute datapoints → +1 instance
* **Scale-in**: CPUUtilization < 30% for 3 consecutive 1-minute datapoints → -1 instance
* ใช้ **Target Tracking** (target CPU 50%) เป็นทางเลือกที่ง่ายและเสถียร

---

## 📈 Load Testing (k6 example)

ไฟล์: `loadtest/k6-script.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01']
  }
};

export default function () {
  const res = http.get('https://your-domain.com/api/products');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

---

## 🧪 Health Check & Observability

* `/healthz` returns 200 and DB connectivity check
* Application logs → CloudWatch Log Group
* Metrics to monitor: Latency (p95), ErrorRate (5xx), DB connections, Disk usage

---

## 🔐 Security Best Practices

* ใช้ HTTPS (CloudFront + ALB certificate via ACM)
* เก็บ secrets ใน **AWS Secrets Manager** หรือ **SSM Parameter Store** (ไม่ใส่ env vars ใน repo)
* S3 bucket policy: ใช้ origin access identity (OAI) กับ CloudFront เพื่อป้องกัน public access
* Database: เปิดเฉพาะ internal VPC access, enable encryption at rest

---

## ⚙️ GitHub Actions — ตัวอย่าง workflow (deploy to S3 & trigger EC2 restart)

ไฟล์: `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install
        run: npm ci
      - name: Test
        run: npm test
      - name: Build frontend
        run: npm run build --workspace=frontend
      - name: Deploy to S3
        uses: aws-actions/s3-sync@v2
        with:
          args: --acl public-read --delete
        env:
          AWS_S3_BUCKET: ${{ secrets.S3_BUCKET }}
          AWS_REGION: ${{ secrets.AWS_REGION }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      - name: Trigger backend deploy (SSM RunCommand)
        uses: aws-actions/aws-ssm-run-command@v1
        with:
          instance-ids: ${{ secrets.EC2_INSTANCE_IDS }}
          commands: 'cd /var/www/backend && git pull && npm ci && pm2 restart all'
        env:
          AWS_REGION: ${{ secrets.AWS_REGION }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

> หมายเหตุ: ระวังการเก็บ AWS credentials ใน `secrets` ให้ใช้งาน role-based deploy (eg. GitHub OIDC) ถ้าเป็นไปได้

---

## 🧾 Support Page (support.html) — โครงร่างพื้นฐาน

```html
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Support - Teburu</title>
  <link rel="stylesheet" href="/static/css/support.css">
</head>
<body>
  <header>
    <h1>ติดต่อฝ่ายสนับสนุน</h1>
  </header>
  <main>
    <section>
      <h2>ติดต่อผ่านอีเมล</h2>
      <p>support@teburu.example</p>
    </section>
    <section>
      <h2>ติดต่อผ่านฟอร์ม</h2>
      <form id="contact-form">
        <label>ชื่อ<input name="name" required></label>
        <label>อีเมล<input type="email" name="email" required></label>
        <label>ข้อความ<textarea name="message" required></textarea></label>
        <button type="submit">ส่ง</button>
      </form>
    </section>
  </main>
  <script>
    document.getElementById('contact-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      await fetch('/api/support', { method: 'POST', body: JSON.stringify(Object.fromEntries(data)), headers: {'Content-Type': 'application/json'} });
      alert('ส่งเรียบร้อย');
    });
  </script>
</body>
</html>
```

---

## ✅ Checklist สำหรับ Production Ready

* [ ] HTTPS ทั้งระบบ (ACM cert + ALB/CloudFront)
* [ ] Secrets → Secrets Manager / SSM
* [ ] Backups สำหรับ RDS (daily + point-in-time)
* [ ] WAF (ป้องกัน SQLi, XSS) ถ้าจำเป็น
* [ ] IAM least-privilege
* [ ] Monitoring + Alarms
* [ ] Load test (k6 / JMeter) + tune autoscaling

---

## 📎 ไฟล์แนบที่สร้างใน repo ของคุณ (ตัวอย่างที่ควรมี)

* `README.md` (ไฟล์นี้)
* `infrastructure/` (CloudFormation / Terraform templates)
* `deploy/github-actions.yml`
* `loadtest/k6-script.js`
* `support/support.html`
* `docs/architecture-diagram.png` (สร้างจาก mermaid หรือ draw\.io)

---

ถ้าต้องการ ฉันสามารถ:

* สร้างไฟล์ GitHub Actions workflow เต็มรูปแบบ (ตาม provider ของคุณ)
* สร้าง Terraform / CloudFormation template สำหรับ S3, CloudFront, ALB, ASG, RDS
* สร้าง k6 script ให้ละเอียดกว่าเดิม (เช่น จำลองการซื้อสินค้า, การอัปโหลดรูป)
* ออกแบบภาพสถาปัตยกรรม (PNG / SVG) ให้ดาวน์โหลด

บอกฉันได้เลยว่าต้องการไฟล์ไหนต่อไป — ฉันจะสร้างให้ทันที :)
