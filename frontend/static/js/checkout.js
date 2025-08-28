let cartItems = [];

// Generate background particles
function createParticles() {
    const particlesContainer = document.querySelector('.bg-particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = particle.style.height = Math.random() * 4 + 2 + 'px';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Load cart items from API
async function loadCartItems() {
    try {
        const res = await fetch("/api/cart", { credentials: "include" });
        if (!res.ok) {
            const data = await res.json();
            showToast(data.error || "⚠ Please login to view checkout");
            window.location.href = "/login";
            return;
        }

        cartItems = await res.json();
        renderCart();
        updateSummary();
    } catch (err) {
        console.error("Load cart error:", err);
        showToast("⚠ Failed to load cart items");
        cartItems = [];
        renderCart();
    }
}

// Render cart items
function renderCart() {
    const container = document.getElementById('cart-items-container');
    const cartCount = document.getElementById('cart-count');

    if (cartItems.length === 0) {
        container.innerHTML = `
          <div class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some amazing products to get started!</p>
            <a href="/" class="back-to-shop">← Back to Shop</a>
          </div>
        `;
        cartCount.textContent = '0';
        updateSummary();
        return;
    }

    let totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    container.innerHTML = cartItems.map((item, index) => {
        const imageUrl = item.image_main && item.image_main.length > 0 
            ? item.image_main[0] 
            : 'https://via.placeholder.com/80x80?text=No+Image';

        return `
          <div class="cart-item" data-cart-id="${item.cart_id}">
            <div class="item-image">
              <img src="${imageUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80?text=Error'">
            </div>
            <div class="item-details">
              <div class="item-name">${item.name}</div>
              <div class="item-price">${item.price} THB each</div>
              <div class="item-stock">Stock: ${item.stock}</div>
            </div>
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="updateQuantity(${item.cart_id}, ${item.quantity - 1}, ${item.stock})">-</button>
              <span class="quantity-display">${item.quantity}</span>
              <button class="quantity-btn" onclick="updateQuantity(${item.cart_id}, ${item.quantity + 1}, ${item.stock})">+</button>
            </div>
            <div class="item-total">
              ${(item.price * item.quantity).toFixed(2)} THB
            </div>
            <button class="remove-btn" onclick="removeItem(${item.cart_id})">Remove</button>
          </div>
        `;
    }).join('');

    cartCount.textContent = totalItems;
}

// Update item quantity
async function updateQuantity(cartId, newQuantity, maxStock) {
    if (newQuantity < 1) {
        removeItem(cartId);
        return;
    }

    if (newQuantity > maxStock) {
        showToast(`⚠ Maximum stock available: ${maxStock}`);
        return;
    }

    try {
        const res = await fetch(`/api/cart/${cartId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ quantity: newQuantity })
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || "⚠ Failed to update quantity");
            return;
        }

        showToast("✅ Quantity updated");
        await loadCartItems(); // Reload cart items
        await updateCartCount(); // Update header cart count
    } catch (err) {
        console.error("Update quantity error:", err);
        showToast("⚠ Failed to update quantity");
    }
}

// Remove item from cart
async function removeItem(cartId) {
    try {
        const res = await fetch(`/api/cart/${cartId}`, {
            method: "DELETE",
            credentials: "include"
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || "⚠ Failed to remove item");
            return;
        }

        showToast("✅ Item removed from cart");
        await loadCartItems(); // Reload cart items
        await updateCartCount(); // Update header cart count
    } catch (err) {
        console.error("Remove item error:", err);
        showToast("⚠ Failed to remove item");
    }
}

// Update order summary
function updateSummary() {
    let subtotal = 0;

    cartItems.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    // Calculate discounts and fees
    const discount = subtotal > 2000 ? subtotal * 0.1 : 0; // 10% discount if over 2000 THB
    const shipping = subtotal > 1500 ? 0 : 150; // Free shipping over 1500 THB
    const tax = (subtotal - discount) * 0.07; // 7% VAT
    const total = subtotal - discount + tax + shipping;

    // Update UI
    document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)} THB`;
    document.getElementById('discount').textContent = `-${discount.toFixed(2)} THB`;
    document.getElementById('tax').textContent = `${tax.toFixed(2)} THB`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `${shipping.toFixed(2)} THB`;
    document.getElementById('total').textContent = `${total.toFixed(2)} THB`;

    // Update benefits text
    updateBenefitsText(subtotal);
}

// Update benefits text based on subtotal
function updateBenefitsText(subtotal) {
    const benefitsContainer = document.querySelector('.benefits');
    if (!benefitsContainer) return;

    const shippingText = subtotal > 1500 
        ? "Free shipping applied!" 
        : `Add ${(1500 - subtotal).toFixed(2)} THB more for free shipping`;

    benefitsContainer.innerHTML = `
        <div class="benefit-item">
            <span>🚚</span>
            <span>${shippingText}</span>
        </div>
        <div class="benefit-item">
            <span>🔒</span>
            <span>Secure payment processing</span>
        </div>
        <div class="benefit-item">
            <span>↩️</span>
            <span>30-day return policy</span>
        </div>
        ${subtotal > 2000 ? `
        <div class="benefit-item discount-applied">
            <span>🎉</span>
            <span>10% discount applied!</span>
        </div>
        ` : ''}
    `;
}

// Clear entire cart
async function clearCart() {
    if (!confirm("Are you sure you want to clear your entire cart?")) {
        return;
    }

    try {
        const res = await fetch("/api/cart", {
            method: "DELETE",
            credentials: "include"
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || "⚠ Failed to clear cart");
            return;
        }

        showToast("✅ Cart cleared");
        await loadCartItems(); // Reload cart items
        await updateCartCount(); // Update header cart count
    } catch (err) {
        console.error("Clear cart error:", err);
        showToast("⚠ Failed to clear cart");
    }
}

// Proceed to payment (placeholder)
function proceedToPayment() {
    if (cartItems.length === 0) {
        showToast("⚠ Your cart is empty!");
        return;
    }

    // Calculate final total
    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const discount = subtotal > 2000 ? subtotal * 0.1 : 0;
    const shipping = subtotal > 1500 ? 0 : 150;
    const tax = (subtotal - discount) * 0.07;
    const finalTotal = subtotal - discount + tax + shipping;

    // For now, show confirmation
    if (confirm(`Proceed to payment?\nTotal: ${finalTotal.toFixed(2)} THB`)) {
        showToast("🚧 Payment integration coming soon!");
        // TODO: Implement actual payment integration
        // window.location.href = "/payment";
    }
}

// Show toast notification
function showToast(message, type = "info") {
    // Create toast if it doesn't exist
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.className = toast.className.replace("show", "").trim();
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function () {
    createParticles();
    await loadCartItems();

    // Add event listeners for action buttons
    const clearCartBtn = document.querySelector('.clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToPayment);
    }
});
