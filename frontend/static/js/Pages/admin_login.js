document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  const msg = document.getElementById("loginMsg");

  msg.textContent = ""; // เคลียร์ข้อความเก่า

  if (!username || !password) {
    msg.textContent = "❌ กรุณากรอก Username และ Password";
    return;
  }

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ เก็บข้อมูล admin ไว้ใน localStorage
      localStorage.setItem("user", JSON.stringify({
        id: data.adminId,
        username: data.username,
        role: data.role
      }));

      // 👉 redirect ไปหน้า management
      window.location.href = "/admin/management";
    } else {
      msg.textContent = "❌ " + (data.error || "เข้าสู่ระบบล้มเหลว");
    }
  } catch (err) {
    console.error("Login Error:", err);
    msg.textContent = "❌ Server error: " + err.message;
  }
});
