// frontend/static/js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // โหลดตะกร้าจาก localStorage เมื่อหน้าเว็บโหลดเสร็จ
    loadCartFromStorage();
    updateCartCount();
    renderCartPanel();
});

// ฟังก์ชันสำหรับโหลดตะกร้าจาก localStorage
function loadCartFromStorage() {
    // ถ้ามี 'cart' ใน localStorage ให้ดึงมาใช้, ถ้าไม่มีให้ใช้ array ว่าง
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// ฟังก์ชันสำหรับบันทึกตะกร้าลง localStorage
function saveCartToStorage(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// ฟังก์ชันเพิ่มสินค้าลงตะกร้า
function addToCart(productName) {
    let cart = loadCartFromStorage();
    
    // เช็คว่ามีสินค้านี้ในตะกร้าหรือยัง
    let existingProduct = cart.find(item => item.name === productName);

    if (existingProduct) {
        // ถ้ามีแล้ว ให้เพิ่มจำนวน
        existingProduct.quantity++;
    } else {
        // ถ้ายังไม่มี ให้เพิ่มสินค้าใหม่เข้าไป
        cart.push({ name: productName, quantity: 1 });
    }

    // บันทึกตะกร้าล่าสุดลง localStorage
    saveCartToStorage(cart);

    // อัปเดตการแสดงผล
    updateCartCount();
    renderCartPanel();
    
    // แสดงตะกร้าสินค้าหลังจากเพิ่มของ
    toggleCart(true); 
}

// ฟังก์ชันอัปเดตตัวเลขบนไอคอนตะกร้า
function updateCartCount() {
    const cart = loadCartFromStorage();
    // นับจำนวนสินค้าทั้งหมดในตะกร้า
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalQty;
    }
}

// ฟังก์ชันแสดงรายการสินค้าในตะกร้า (Panel ด้านข้าง)
function renderCartPanel() {
    const cart = loadCartFromStorage();
    const cartItemsElement = document.getElementById('cart-items');
    
    if (cartItemsElement) {
        cartItemsElement.innerHTML = ''; // เคลียร์ของเก่าทิ้ง
        if (cart.length === 0) {
            cartItemsElement.innerHTML = '<p style="text-align:center;">Your cart is empty.</p>';
            return;
        }

        cart.forEach((item, index) => {
            cartItemsElement.innerHTML += `
              <div class="cart-item">
                <span>${item.name} (x${item.quantity})</span>
                <button onclick="removeFromCart(${index})" style="background:red; color:#fff; border:none; padding:2px 6px; border-radius:4px; cursor:pointer;">X</button>
              </div>
            `;
        });
    }
}

// ฟังก์ชันลบสินค้าออกจากตะกร้า
function removeFromCart(index) {
    let cart = loadCartFromStorage();
    
    // ลดจำนวนสินค้าลง 1
    cart[index].quantity--;
    
    // ถ้าจำนวนเหลือน้อยกว่าหรือเท่ากับ 0 ให้ลบสินค้านั้นออกจากตะกร้า
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCartToStorage(cart);
    updateCartCount();
    renderCartPanel();
}


// ฟังก์ชันเปิด/ปิดตะกร้าด้านข้าง
function toggleCart(forceOpen = false) {
    const cartPanel = document.getElementById('cart-panel');
    if (cartPanel) {
        if (forceOpen) {
            cartPanel.classList.add('active');
        } else {
            cartPanel.classList.toggle('active');
        }
    }
}

// ฟังก์ชันไปยังหน้า Checkout
function checkout() {
    const cart = loadCartFromStorage();
    if (cart.length === 0) {
        alert("Your cart is empty!");
    } else {
        // ไม่ต้องทำอะไรพิเศษ เพราะข้อมูลอยู่ใน localStorage แล้ว
        window.location.href = "checkout.html";
    }
}