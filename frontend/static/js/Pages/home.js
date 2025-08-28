// ---------------- Modal ----------------
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

// ---------------- Toast ----------------
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.className = toast.className.replace("show", "").trim();
  }, 3000);
}

// ---------------- Password toggle ----------------
function togglePassword(inputId, el) {
  const passwordField = document.getElementById(inputId);
  if (!passwordField) return;
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

// ---------------- Auth ----------------
async function handleLogin() {
  const email = document.querySelector('#signinModal input[type="email"]').value;
  const password = document.getElementById("signinPassword").value;

  if (!email || !password) {
    showToast("❌ Please fill in all required fields", "error");
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
      showToast(data.error || "❌ Login failed", "error");
      return;
    }

    // Save user
    localStorage.setItem("customer", JSON.stringify({
      customerId: data.customerId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName
    }));

    closeLoginOrRegisterModal();
    renderAuthButtons();
    showToast(`✅ Welcome, ${data.firstName || "user"}!`, "success");
  } catch (err) {
    console.error("Login error:", err);
    showToast("❌ Login failed, please try again", "error");
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
    showToast("❌ Please fill in all required fields", "error");
    return;
  }
  if (password !== confirmPassword) {
    showToast("❌ Passwords do not match", "error");
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
      showToast(data.error || "❌ Register failed", "error");
      return;
    }

    switchModal("registerModal", "signinModal");
    showToast("✅ Register successful, please login", "success");
  } catch (err) {
    console.error("Register error:", err);
    showToast("❌ Register failed, please try again", "error");
  }
}

// ---------------- UI Render ----------------
function renderAuthButtons() {
  const authButtons = document.querySelector(".auth-buttons");
  const profile = document.querySelector(".profile");
  const customer = JSON.parse(localStorage.getItem("customer"));

  if (customer) {
    if (authButtons) authButtons.style.display = "none";
    if (profile) {
      profile.style.display = "flex";
      profile.innerHTML = `
        <img src="https://product-images-toa-shop.s3.ap-northeast-3.amazonaws.com/profile.jpg"
             alt="Profile"
             class="profile-img"
             onclick="toggleProfileMenu()">
        <div class="dropdown-menu" id="profileDropdown">
          <button onclick="openCart()">🛒 Cart</button>
          <button onclick="handleLogout()">🚪 Logout</button>
        </div>
      `;
    }
  } else {
    if (authButtons) authButtons.style.display = "flex";
    if (profile) profile.style.display = "none";
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
  showToast("👋 Logged out", "success");
}

// ---------------- DOM Ready ----------------
document.addEventListener("DOMContentLoaded", function () {
  closeLoginOrRegisterModal();
  renderAuthButtons();

  // Enter key login/register
  document.querySelector('#signinModal input[type="email"]').addEventListener('keypress', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById("signinPassword").addEventListener('keypress', e => {
    if (e.key === 'Enter') handleLogin();
  });
  ["firstName", "lastName", "phone", "email", "regPassword", "regConfirmPassword"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleRegister();
      });
    });
});
