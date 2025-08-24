// simple particles
function createParticles() {
    const container = document.querySelector('.bg-particles');
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.width = p.style.height = Math.random() * 6 + 'px';
        p.style.animationDuration = (Math.random() * 8 + 4) + 's';
        p.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(p);
    }
}
document.addEventListener('DOMContentLoaded', createParticles);

// upload handler
document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const status = document.getElementById('status');
    if (!fileInput.files.length) {
        status.textContent = 'กรุณาเลือกไฟล์ภาพ';
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    status.textContent = 'กำลังอัปโหลด...';


    try {
        const res = await fetch('/api/upload-to-s3', { method: 'POST', body: formData });
        if (res.ok) {
            const data = await res.json();
            status.innerHTML = `✅ อัปโหลดสำเร็จ!<br><a href="${data.url}" target="_blank">${data.url}</a>`;
        } else {
            status.textContent = 'เกิดข้อผิดพลาดในการอัปโหลด';
        }
    } catch (err) {
        status.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
    }
});

