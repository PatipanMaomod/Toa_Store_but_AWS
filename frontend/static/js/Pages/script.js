// Year
document.getElementById('y').textContent = new Date().getFullYear();

// Simple slider
const slides = [...document.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.dot')];
let i = 0, timer;
function show(n) {
    slides.forEach((s, idx) => s.classList.toggle('active', idx === n));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === n));
    i = n;
}
function next() { show((i + 1) % slides.length); }
function play() { clearInterval(timer); timer = setInterval(next, 5000); }
dots.forEach(d => d.addEventListener('click', e => { show(+d.dataset.slide); play(); }));
play();

// Keyboard nav for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); play(); }
    if (e.key === 'ArrowLeft') { show((i - 1 + slides.length) % slides.length); play(); }
});


let cart = [];

function addToCart(product) {
    // หา index ของสินค้าที่มีอยู่แล้ว
    let index = cart.findIndex(item => item.name === product);
    if (index !== -1) {
        cart[index].quantity++;
    } else {
        cart.push({ name: product, quantity: 1 });
    }
    updateCartCount();
    renderCart();
}

function renderCart() {
    let cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    cart.forEach((item, index) => {
        cartItems.innerHTML += `
          <div class="cart-item">
            <span>${item.name} (x${item.quantity})</span>
            <button onclick="removeFromCart(${index})" style="background:red; color:#fff; border:none; padding:2px 6px; border-radius:4px; cursor:pointer;">X</button>
          </div>
        `;
    });
}

function removeFromCart(index) {
    cart[index].quantity--;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    let totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalQty;
}

function toggleCart() {
    document.getElementById('cart-panel').classList.toggle('active');
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
    } else {
        alert("Proceeding to checkout with: " + cart.map(i => `${i.name} x${i.quantity}`).join(", "));
        window.location.href = "checkout.html";
    }
}
