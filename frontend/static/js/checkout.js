// Generate background particles
function createParticles() {
    const particlesContainer = document.querySelector('.bg-particles');
    if (!particlesContainer) return;
    
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

let cartItems = [];

// Load cart items from API
async function loadCartItems() {
    const container = document.getElementById('cart-items-container');
    const cartCount = document.getElementById('cart-count');

    if (!container || !cartCount) return;

    try {
        const res = await fetch("/api/cart", { credentials: "include" });
        if (!res.ok) {
            const data = await res.json();
            showToast(data.error || "กรุณาเข้าสู่ระบบเพื่อดูตะกร้าสินค้า");
            // Redirect to login if not authenticated
            window.location.href = "/";
            return;
        }

        cartItems = await res.json();
        renderCart();
        updateSummary();
        
    } catch (err) {
        console.error("Load cart error:", err);
        showToast("ไม่สามารถโหลดตะกร้าสินค้าได้");
    }
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const cartCount = document.getElementById('cart-count');

    if (!container || !cartCount) return;

    if (cartItems.length === 0) {
        container.innerHTML = `
          <div class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <h3>ตะกร้าสินค้าว่างเปล่า</h3>
            <p>เพิ่มสินค้าเพื่อเริ่มต้นการสั่งซื้อ!</p>
            <a href="/products" class="continue-shopping">กลับไปช็อปปิ้ง</a>
          </div>
        `;
        cartCount.textContent = '0';
        return;
    }

    let totalItems = 0;
    container.innerHTML = cartItems.map((item) => {
        totalItems += item.quantity;
        const imageUrl = item.image_main && item.image_main.length > 0 
            ? item.image_main[0] 
            : 'https://via.placeholder.com/80';

        return `
          <div class="cart-item">
            <div class="item-image">
              <img src="${imageUrl}" alt="${item.name}" />
            </div>
            <div class="item-details">
              <div class="item-name">${item.name}</div>
              <div class="item-price">฿${item.price.toFixed(2)} ต่อชิ้น</div>
              <div class="item-stock">คงเหลือ: ${item.stock} ชิ้น</div>
            </div>
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="changeQuantity(${item.cart_id}, ${item.quantity - 1})">-</button>
              <span class="quantity-display">${item.quantity}</span>
              <button class="quantity-btn" onclick="changeQuantity(${item.cart_id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">
              <div class="item-total-price">฿${(item.price * item.quantity).toFixed(2)}</div>
              <button class="remove-btn" onclick="removeItem(${item.cart_id})">ลบ</button>
            </div>
          </div>
        `;
    }).join('');

    cartCount.textContent = totalItems;
}

// Change quantity of cart item
async function changeQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
        removeItem(cartId);
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
            showToast(data.error || "ไม่สามารถอัพเดทจำนวนสินค้าได้");
            return;
        }

        // Reload cart items
        await loadCartItems();
        showToast("อัพเดทจำนวนสินค้าเรียบร้อย");
        
    } catch (err) {
        console.error("Update quantity error:", err);
        showToast("ไม่สามารถอัพเดทจำนวนสินค้าได้");
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
            showToast(data.error || "ไม่สามารถลบสินค้าได้");
            return;
        }

        // Reload cart items
        await loadCartItems();
        showToast("ลบสินค้าจากตะกร้าเรียบร้อย");
        
    } catch (err) {
        console.error("Remove item error:", err);
        showToast("ไม่สามารถลบสินค้าได้");
    }
}

function updateSummary() {
    let subtotal = 0;

    cartItems.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const discount = subtotal > 2000 ? subtotal * 0.1 : 0; // ส่วนลด 10% หากเกิน 2000 บาท
    const tax = (subtotal - discount) * 0.07; // VAT 7%
    const shipping = subtotal > 800 ? 0 : 50; // ฟรีค่าส่งเมื่อซื้อเกิน 800 บาท
    const total = subtotal - discount + tax + shipping;

    const subtotalEl = document.getElementById('subtotal');
    const discountEl = document.getElementById('discount');
    const taxEl = document.getElementById('tax');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `฿${subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-฿${discount.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `฿${tax.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'ฟรี' : `฿${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `฿${total.toFixed(2)}`;
}

// Load cart count for header
async function loadCartCount() {
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
        console.error("Load cart count error:", err);
        cartCount.textContent = "0";
    }
}

// Show toast notification
function showToast(message, type = "success") {
    // Create toast element if it doesn't exist
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

// Proceed to payment (placeholder)
async function proceedToCheckout() {
    if (cartItems.length === 0) {
        showToast("ตะกร้าสินค้าว่างเปล่า");
        return;
    }

    // Here you would implement actual payment processing
    // For now, just show a success message
    alert("การชำระเงินจะถูกพัฒนาในอนาคต\nขณะนี้เป็นเพียงการจำลองการทำงาน");
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function () {
    createParticles();
    await loadCartItems();
});
