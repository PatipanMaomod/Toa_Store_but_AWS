# 🛒 E-commerce Web Application on AWS  

โปรเจกต์นี้เป็นเว็บขายของออนไลน์ ที่มีระบบเก็บข้อมูลลูกค้า ข้อมูลพนักงาน ข้อมูลสินค้า และระบบตะกร้าสินค้า โดยมีการจัดเก็บข้อมูลและรูปภาพ รวมถึงการทดสอบประสิทธิภาพและการปรับขยายระบบอัตโนมัติ (Auto-scaling)  

---

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)  
- **Frontend / Static Website**: Deploy ขึ้นบน **AWS S3 + CloudFront**  
- **Backend API**: รันบน **AWS EC2**  
- **Database**: ใช้ **AWS RDS (MySQL / Aurora)**  
- **Storage**: เก็บไฟล์รูปภาพสินค้าใน **AWS S3**  
- **CI/CD**: ใช้ **GitHub Actions** เชื่อมต่อการ Deploy อัตโนมัติ  
- **Load Balancing & Auto-scaling**: ใช้ **AWS ALB + Auto Scaling Group**  
- **Monitoring**: ใช้ **CloudWatch** ตรวจสอบการทำงาน  

---

## ⚙️ ส่วนประกอบหลักของระบบ  
- ระบบสมาชิก (Customer Register/Login)  
- ระบบจัดการสินค้า (เพิ่ม/ลบ/แก้ไข)  
- ระบบตะกร้าสินค้า และสั่งซื้อสินค้า  
- ระบบแอดมินจัดการพนักงานและคำสั่งซื้อ  
- จัดเก็บรูปภาพใน **AWS S3**  
- ข้อมูลที่จัดเก็บใน **MySQL**  

---

## 🚀 Deployment  
- Frontend ถูก Build และอัปโหลดไปที่ **AWS S3**  
- Backend API ถูก Deploy บน **EC2** ผ่าน **GitHub Actions**  
- Database ใช้ **AWS RDS MySQL**  
- รูปภาพถูกอัปโหลดและเก็บใน **S3 Bucket**  

**Screenshot:** (แทรกภาพหน้าจอผลการ Deploy S3 / EC2 ที่สำเร็จ)  

---

## 🔄 GitHub Actions Pipeline  
Pipeline ที่ใช้ในโปรเจกต์นี้:  
1. **Build** → ตรวจสอบโค้ด  
2. **Test** → Run Unit Test  
3. **Deploy** → อัปโหลดไปที่ S3 / Restart EC2  

**Screenshot:** (แทรกภาพหน้าจอการทำงานของ GitHub Actions Pipeline)  

---

## 📊 Load Testing  
ใช้ **Apache JMeter / k6** ในการทำ Load Test  
- ทดสอบ **1000 concurrent users**  
- ตรวจสอบ Response Time และ Error Rate  

**ผลลัพธ์การทดสอบ (Screenshot):**  
- Avg Response Time: ~200ms  
- Error Rate: < 1%  

### 📈 ผลการทดสอบ Load Test + Auto-scaling  

| Users (VUs) | Avg Response (ms) | P95 (ms) | Error % | Requests/sec | CPU Utilization | Instance Count | หมายเหตุ |  
| ----------- | ----------------- | -------- | ------- | ------------ | --------------- | -------------- | -------------------------- |  
| 0 → 50 | ~150 | ~200 | 0% | ~20–25 | ~30% | 1 | ระบบตอบสนองได้ปกติ |  
| 100 | ~170 | ~220 | 0% | ~40–45 | ~55% | 2 (Scale-out) | Trigger Auto Scaling เพิ่ม |  
| 200 | ~160 | ~235 | 0% | ~75 | ~70–80% | 2 | รองรับโหลดสูงได้ดี |  
| ลดกลับ 0 | ~120 | ~180 | 0% | ~10 | ~20% | 1 (Scale-in) | ระบบคืนสภาพปกติ |  

---

## 📈 Auto-scaling  
ระบบรองรับการขยาย EC2 Instance โดยอัตโนมัติเมื่อโหลดสูง  
- **Scaling Policy**: CPU > 70% → เพิ่ม Instance  
- **Scaling Down**: CPU < 30% → ลด Instance  

**Screenshot:** (แทรกภาพหน้าจอการ Auto-scaling ที่เกิดขึ้นจริงจาก AWS Console)  
