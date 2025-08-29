// Load header.html into each page
document.addEventListener("DOMContentLoaded", async () => {
    const placeholder = document.getElementById("header-placeholder");
    if (placeholder) {
        const res = await fetch("/header");
        placeholder.innerHTML = await res.text();
        renderAuthButtons();
        await updateCartCount(); // Update cart count after header loads
    }

    closeLoginOrRegisterModal();

    // Prevent redirect to login/register if already logged in
    const customer = JSON.parse(localStorage.getItem("customer"));
    if (customer && (window.location.pathname.includes('/login') || window.location.pathname.includes('/admin/register'))) {
        window.location.href = '/';
    }

    // Add event listeners for Enter key
    const signinEmail = document.querySelector('#signinModal input[type="email"]');
    if (signinEmail) signinEmail.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });
    const signinPassword = document.getElementById("signinPassword");
    if (signinPassword) signinPassword.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });

    const firstName = document.getElementById("firstName");
    if (firstName) firstName.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleRegister(); });
    const lastName = document.getElementById("lastName");
    if (lastName) lastName.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleRegister(); });
    const phone = document.getElementById("phone");
    if (phone) phone.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleRegister(); });
    const email = document.getElementById("email");
    if (email) email.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleRegister(); });
    const regPassword = document.getElementById("regPassword");
    if (regPassword) regPassword.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleRegister(); });
    const regConfirmPassword = document.getElementById("regConfirmPassword");
    if (regConfirmPassword) regConfirmPassword.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleRegister(); });
});

// Update cart item count
async function updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (!cartCount) return;

    try {
        const res = await fetch("/api/cart", { credentials: "include" });
        if (!res.ok) {
            cartCount.textContent = "0";
            return;
        }

        const cartItems = await res.json();
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    } catch (err) {
        console.error("Update cart count error:", err);
        cartCount.textContent = "0";
    }
}

// Render auth buttons and profile
async function renderAuthButtons() {
    const authButtons = document.querySelector(".auth-buttons");
    const profile = document.querySelector(".profile");
    const userName = document.getElementById("userName");

    try {
        const res = await fetch("/api/customers/me", { credentials: "include" });
        if (!res.ok) throw new Error("Not logged in");

        const customer = await res.json();
        authButtons.style.display = "none";
        profile.style.display = "flex";
        if (userName) userName.textContent = customer.firstName || "User";

        await updateCartCount(); // Update cart count after login
    } catch {
        authButtons.style.display = "flex";
        profile.style.display = "none";
    }
}

function toggleProfileMenu() {
    document.querySelector(".profile").classList.toggle("active");
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
            credentials: "include",
            body: JSON.stringify({ username: email, password })
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || "❌ Login failed");
            return;
        }

        localStorage.setItem("customer", JSON.stringify({
            customerId: data.customerId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
        }));

        closeLoginOrRegisterModal();
        renderAuthButtons();
        showToast(`✅ Welcome, ${data.firstName || "user"}!`);
        await updateCartCount(); // Update cart count after login
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

async function handleLogout() {
    try {
        await fetch("/api/customers/logout", {
            method: "POST",
            credentials: "include"
        });
        localStorage.removeItem("customer");
        renderAuthButtons();
        showToast("👋 Logged out", "success");
        await updateCartCount(); // Reset cart count after logout
    } catch (err) {
        console.error("Logout error:", err);
        showToast("❌ Logout failed");
    }
}

async function openCart() {
    const cartModal = document.getElementById("cartModal");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartModal || !cartItemsContainer || !cartTotal) {
        console.error("Cart modal elements not found");
        return;
    }

    try {
        const res = await fetch("/api/cart", { credentials: "include" });
        if (!res.ok) {
            const data = await res.json();
            showToast(data.error || "❌ Please login to view cart");
            return;
        }

        const cartItems = await res.json();
        cartItemsContainer.innerHTML = "";

        let total = 0;
        cartItems.forEach(item => {
            total += item.price * item.quantity;
            const itemElement = document.createElement("div");
            itemElement.className = "cart-item";
            itemElement.innerHTML = `
                <img src="${item.image_main[0] || 'https://via.placeholder.com/50'}" alt="${item.name}">
                <div>
                    <strong>${item.name}</strong><br>
                    <span>${item.price} THB</span>
                </div>
                <input type="number" value="${item.quantity}" min="1" max="${item.stock}" onchange="updateCartItem(${item.cart_id}, this.value)">
                <button onclick="removeCartItem(${item.cart_id})">Remove</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotal.textContent = total.toFixed(2);
        cartModal.style.display = "flex";
        await updateCartCount(); // Update cart count when opening cart
    } catch (err) {
        console.error("Cart error:", err);
        showToast("❌ Failed to load cart");
    }
}

function closeCartModal() {
    document.getElementById("cartModal").style.display = "none";
}

async function updateCartItem(cartId, quantity) {
    try {
        const res = await fetch(`/api/cart/${cartId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ quantity: parseInt(quantity) })
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || "❌ Failed to update cart");
            return;
        }

        showToast("✅ Cart updated");
        openCart(); // Refresh cart
    } catch (err) {
        console.error("Update cart error:", err);
        showToast("❌ Failed to update cart");
    }
}

async function removeCartItem(cartId) {
    try {
        const res = await fetch(`/api/cart/${cartId}`, {
            method: "DELETE",
            credentials: "include"
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || "❌ Failed to remove item");
            return;
        }

        showToast("✅ Item removed from cart");
        openCart(); // Refresh cart
        await updateCartCount(); // Update cart count
    } catch (err) {
        console.error("Remove cart item error:", err);
        showToast("❌ Failed to remove item");
    }
}

async function clearCart() {
    try {
        const res = await fetch("/api/cart", {
            method: "DELETE",
            credentials: "include"
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || "❌ Failed to clear cart");
            return;
        }

        showToast("✅ Cart cleared");
        openCart(); // Refresh cart
        await updateCartCount(); // Update cart count
    } catch (err) {
        console.error("Clear cart error:", err);
        showToast("❌ Failed to clear cart");
    }
}

async function clearCartAll() {
    try {
        const res = await fetch("/api/cart", {
            method: "DELETE",
            credentials: "include"
        });

        await updateCartCount(); 
    } catch (err) {
        console.error("Clear cart error:", err);
        showToast("❌ Failed to clear cart");
    }
}

function proceedToCheckout() {
    window.location.href = "/checkout";
}

async function addToCart(product) {
    try {
        const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ product_id: product.id, quantity: 1 })
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || "❌ Failed to add to cart");
            return;
        }

        showToast("✅ Added to cart");
        await updateCartCount(); // Update cart count after adding item
    } catch (err) {
        console.error("Add to cart error:", err);
        showToast("❌ Failed to add to cart");
    }
}



