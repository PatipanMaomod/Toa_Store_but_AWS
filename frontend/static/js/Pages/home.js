function openModal(id) {
  document.getElementById(id).style.display = "block";
}
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// render ปุ่มใน header
function renderAuthButtons() {
  const auth = document.getElementById("authButtons");
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    auth.innerHTML = `
      <span class="welcome">Hello, ${user.name || user.email}</span>
      <button class="btn" onclick="logout()">Logout</button>
    `;
  } else {
    auth.innerHTML = `
      <button class="btn" onclick="openModal('signinModal')">SIGN IN</button>
      <button class="btn" onclick="openModal('registerModal')">JOIN US</button>
      <button class="btn" onclick="openModal('adminModal')">Admin</button>
    `;
  }
}

async function handleLogin() {
  const email = document.getElementById("signinEmail").value;
  const password = document.getElementById("signinPassword").value;

  // 🔥 TODO: เรียก API จริง เช่น POST /api/login
  if (email && password) {
    localStorage.setItem("user", JSON.stringify({ email }));
    closeModal("signinModal");
    renderAuthButtons();
  } else {
    alert("กรอกอีเมลและรหัสผ่านให้ครบ");
  }
}

async function handleRegister() {
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirmPassword").value;

  if (!email || !password) {
    alert("กรอกข้อมูลให้ครบ");
    return;
  }
  if (password !== confirm) {
    alert("รหัสผ่านไม่ตรงกัน");
    return;
  }

  // 🔥 TODO: เรียก API register จริง
  localStorage.setItem("user", JSON.stringify({ email }));
  closeModal("registerModal");
  renderAuthButtons();
}

function handleAdminLogin() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  // 🔥 TODO: เรียก API admin login จริง
  if (email && password) {
    localStorage.setItem("user", JSON.stringify({ email, role: "admin" }));
    closeModal("adminModal");
    renderAuthButtons();
  } else {
    alert("กรอกอีเมลและรหัสผ่าน");
  }
}

function logout() {
  localStorage.removeItem("user");
  renderAuthButtons();
}

// init
document.addEventListener("DOMContentLoaded", renderAuthButtons);
