// frontend/static/js/session-check.js
setInterval(async () => {
  try {
    const res = await fetch("/api/customers/me", { credentials: "include" });
    if (!res.ok) {
      alert("Session หมดอายุแล้ว กรุณา login ใหม่");
      window.location.href = "/";
    }
  } catch (err) {
    console.error("Session check error:", err);
    window.location.href = "/";
  }
}, 5000);