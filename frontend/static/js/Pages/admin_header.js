// โหลด header.html เข้าไปในแต่ละหน้า
document.addEventListener("DOMContentLoaded", async () => {
    const placeholder = document.getElementById("header-placeholder");
    if (placeholder) {
        const res = await fetch("/admin/header");
        placeholder.innerHTML = await res.text();
        renderAuthButtons();
    }
});



function openCart() {
    alert("🛒 ตะกร้าสินค้า (ยังไม่ทำ)");
}




function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.className = toast.className.replace("show", "").trim();
    }, 3000);
}




document.addEventListener("DOMContentLoaded", function () {
    closeLoginOrRegisterModal();
    renderAuthButtons();

});



async function renderAuthButtons() {
    const authButtons = document.querySelector(".auth-buttons");
    const profile = document.querySelector(".profile");

    try {
        const res = await fetch("/api/admin/me", { credentials: "include" });
        if (!res.ok) throw new Error("Not logged in");

        const admin = await res.json();
        authButtons.style.display = "none";
        profile.style.display = "flex";

        profile.innerHTML = `
        <img src="https://product-images-toa-shop.s3.ap-northeast-3.amazonaws.com/profile.jpg"
            alt="Profile"
            class="profile-img"
            onclick="toggleProfileMenu()">

        <div class="dropdown-menu" id="profileDropdown">
            <span>${admin.username || "Admin"}</span>
            <hr>
            <button onclick="handleLogout()">🚪 Logout</button>
        </div>
        `;
    } catch {
        authButtons.style.display = "flex";
        profile.style.display = "none";
    }
}

function toggleProfileMenu() {
    document.querySelector(".profile").classList.toggle("active");
}



