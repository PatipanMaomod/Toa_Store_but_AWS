    document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("adminUsername").value.trim();
      const password = document.getElementById("adminPassword").value.trim();
      const msg = document.getElementById("loginMsg");

      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
          // ✅ บันทึก user ลง localStorage
          localStorage.setItem("user", JSON.stringify({
            id: data.adminId,
            username: data.username,
            role: data.role
          }));

          window.location.href = "/admin/management"; // ไปหน้า admin
        } else {
          msg.textContent = "❌ " + (data.error || "เข้าสู่ระบบล้มเหลว");
        }
      } catch (err) {
        msg.textContent = "❌ Server error: " + err.message;
      }
    });