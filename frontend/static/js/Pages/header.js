// โหลด header.html เข้าไปในแต่ละหน้า
document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("header-placeholder");
  if (placeholder) {
    const res = await fetch("/header");
    placeholder.innerHTML = await res.text();

    // รอให้ header ถูกโหลดแล้วค่อย bind function
    renderAuthButtons();
  }
});

// ---------------- Login / Logout ----------------
function renderAuthButtons() {
  const authButtons = document.querySelector(".auth-buttons");
  const profile = document.querySelector(".profile");
  const customer = JSON.parse(localStorage.getItem("customer"));

  if (customer) {
    authButtons.style.display = "none";
    profile.style.display = "flex";
  } else {
    authButtons.style.display = "flex";
    profile.style.display = "none";
  }
}

function handleLogout() {
  localStorage.removeItem("customer");
  renderAuthButtons();
}

function openCart() {
  alert("🛒 ตะกร้าสินค้า (ยังไม่ทำ)");
}

function openLoginModal() {
  document.getElementById("signinModal").style.display = "flex";
}

function openRegisterModal() {
  document.getElementById("registerModal").style.display = "flex";
}

function closeLoginOrRegisterModal() {
  document.getElementById("registerModal").style.display = "none";
  document.getElementById("signinModal").style.display = "none";
}
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.className = toast.className.replace("show", "").trim();
  }, 3000);
}



function togglePassword(inputId, el) {
  const passwordField = document.getElementById(inputId);
  if (passwordField.type === "password") {
    passwordField.type = "text";
    el.classList.remove("fa-eye");
    el.classList.add("fa-eye-slash");
  } else {
    passwordField.type = "password";
    el.classList.remove("fa-eye-slash");
    el.classList.add("fa-eye");
  }
}

function switchModal(closeId, openId) {
  document.getElementById(closeId).style.display = "none";
  document.getElementById(openId).style.display = "flex";
}

async function handleLogin() {
  const email = document.querySelector('#signinModal input[type="email"]').value;
  const password = document.getElementById("signinPassword").value;

  if (!email || !password) {
    showToast("❌ Please fill in all required fields");
    return;
  }

  try {
    const res = await fetch("/api/customers/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "❌ Login failed");
      return;
    }

    // เก็บข้อมูลผู้ใช้ใน localStorage
    localStorage.setItem("customer", JSON.stringify({
      customerId: data.customerId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName
    }));

    closeLoginOrRegisterModal();
    renderAuthButtons();
    showToast(`✅ Welcome, ${data.firstName || "user"}!`);

  } catch (err) {
    console.error("Login error:", err);
    showToast("❌ Login failed, please try again");
  }
}

async function handleRegister() {
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    showToast("❌ Please fill in all required fields");
    return;
  }
  if (password !== confirmPassword) {
    showToast("❌ Passwords do not match");
    return;
  }

  try {
    const res = await fetch("/api/customers/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        f_name: firstName,
        l_name: lastName,
        username: email,
        password
      })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "❌ Register failed");
      return;
    }

    switchModal("registerModal", "signinModal");
    showToast("✅ Register successful, please login");

  } catch (err) {
    console.error("Register error:", err);
    showToast("❌ Register failed, please try again");
  }
}




document.addEventListener("DOMContentLoaded", function () {
  // ปิด modal ทั้งสองเมื่อโหลดหน้า
  closeLoginOrRegisterModal();
  // Initialize auth buttons
  renderAuthButtons();

  // ตรวจสอบว่าไม่ redirect ไปหน้า login หรือ register ถ้าล็อกอินแล้ว
  const customer = JSON.parse(localStorage.getItem("customer"));
  if (customer && (window.location.pathname.includes('/login') || window.location.pathname.includes('/admin/register'))) {
    window.location.href = '/';
  }

  // Add event listeners for Enter key
  document.querySelector('#signinModal input[type="email"]').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById("signinPassword").addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleLogin();
  });

  document.getElementById("firstName").addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleRegister();
  });
  document.getElementById("lastName").addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleRegister();
  });
  document.getElementById("phone").addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleRegister();
  });
  document.getElementById("email").addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleRegister();
  });
  document.getElementById("regPassword").addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleRegister();
  });
  document.getElementById("regConfirmPassword").addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleRegister();
  });
});



function renderAuthButtons() {
  const authButtons = document.querySelector(".auth-buttons");
  const profile = document.querySelector(".profile");
  const customer = JSON.parse(localStorage.getItem("customer"));

  if (customer) {
    authButtons.style.display = "none";
    profile.style.display = "flex";

    profile.innerHTML = `
      <img src="https://product-images-toa-shop.s3.ap-northeast-3.amazonaws.com/profile.jpg"
           alt="Profile"
           class="profile-img"
           onclick="toggleProfileMenu()">

      <div class="dropdown-menu" id="profileDropdown">
        <span>${customer.firstName || "User"}</span>
        <hr>
        <button onclick="openCart()">🛒 Cart</button>
        <button onclick="handleLogout()">🚪 Logout</button>
      </div>
    `;
  } else {
    authButtons.style.display = "flex";
    profile.style.display = "none";
  }
}

function toggleProfileMenu() {
  document.querySelector(".profile").classList.toggle("active");
}

function openCart() {
  showToast("🛒 เปิดตะกร้า (ยังไม่ทำระบบ)");
}


function handleLogout() {
  localStorage.removeItem("customer");
  renderAuthButtons();
}

async function handleLogin() {
  const email = document.querySelector('#signinModal input[type="email"]').value;
  const password = document.getElementById("signinPassword").value;

  if (!email || !password) {
    showToast("❌ Please fill in all required fields");
    return;

  }

  try {
    const res = await fetch("/api/customers/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Login failed");
      return;
    }

    // เก็บข้อมูลผู้ใช้ใน localStorage
    localStorage.setItem("customer", JSON.stringify({
      customerId: data.customerId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName
    }));

    closeLoginOrRegisterModal();
    renderAuthButtons();
    showToast("✅ Login successful!");

  } catch (err) {
    console.error("Login error:", err);
  }
}


