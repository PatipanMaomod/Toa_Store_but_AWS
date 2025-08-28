const pathParts = window.location.pathname.split('/');
const productId = pathParts[pathParts.length - 1];

let currentProduct = null;
let images = [];
<<<<<<< HEAD
=======
let cart = JSON.parse(localStorage.getItem('cart')) || []; // ใช้ localStorage เก็บตะกร้า
>>>>>>> Sora

async function loadProduct() {
    try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error("Product not found");
        const p = await res.json();
        currentProduct = p;

        images = p.image_main && p.image_main.length > 0
            ? p.image_main
            : ["/static/img/no-image.png"];

        const container = document.getElementById('product-detail');
<<<<<<< HEAD
        // ล้างเนื้อหาเดิม
=======
>>>>>>> Sora
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

<<<<<<< HEAD
        // สร้างและเพิ่ม element
=======
>>>>>>> Sora
        const title = document.createElement('h2');
        title.textContent = p.name;
        container.appendChild(title);

        const description = document.createElement('p');
        description.textContent = p.description || "No description";
        container.appendChild(description);

        const mainImage = document.createElement('img');
        mainImage.id = 'mainImage';
        mainImage.src = images[0];
        mainImage.addEventListener('click', () => openLightbox(mainImage.src));
        container.appendChild(mainImage);

        const thumbnailsDiv = document.createElement('div');
        thumbnailsDiv.className = 'thumbnails';
        images.forEach((url, i) => {
            const thumb = document.createElement('img');
            thumb.src = url;
            thumb.className = `thumb ${i === 0 ? 'active' : ''}`;
            thumb.addEventListener('click', () => {
                mainImage.src = images[i];
                document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
            thumbnailsDiv.appendChild(thumb);
        });
        container.appendChild(thumbnailsDiv);

        document.getElementById('price').textContent = `฿${p.price}`;
        document.getElementById('stock').textContent = p.stock;
        updateTotal();
<<<<<<< HEAD
=======
        updateCartPanel(); // อัปเดตตะกร้าเมื่อโหลดสินค้า
>>>>>>> Sora
    } catch (err) {
        const container = document.getElementById('product-detail');
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        const errorMsg = document.createElement('p');
        errorMsg.textContent = '❌ ไม่พบสินค้า';
        container.appendChild(errorMsg);
        console.error(err);
    }
}

function updateTotal() {
    const qty = parseInt(document.getElementById('quantity').value) || 1;
    const total = currentProduct.price * qty;
    document.getElementById('total').textContent = `฿${total}`;
}

<<<<<<< HEAD
=======
function addToCart() {
    const qty = parseInt(document.getElementById('quantity').value) || 1;
    const item = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        quantity: qty,
        image: images[0]
    };

    // ตรวจสอบว่าสินค้ามีในตะกร้าแล้วหรือไม่
    const existingItemIndex = cart.findIndex(item => item.id === currentProduct.id);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += qty;
    } else {
        cart.push(item);
    }

    // บันทึกตะกร้าใน localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartPanel();
    alert('เพิ่มสินค้าในตะกร้าสำเร็จ!');
}

function checkout() {
    // นำทางไปหน้า checkout
    window.location.href = '/checkout';
}

function updateCartPanel() {
    const cartItems = document.getElementById('cart-items');
    while (cartItems.firstChild) {
        cartItems.removeChild(cartItems.firstChild);
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>฿${item.price * item.quantity}</span>
            <button onclick="removeFromCart(${item.id})">✖</button>
        `;
        cartItems.appendChild(cartItem);
    });
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartPanel();
}

// ฟังก์ชันสำหรับ lightbox (สมมติว่ามี)
function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    lightboxImage.src = src;
    lightbox.style.display = 'flex';
}

function closeLightbox(event) {
    if (event.target.id === 'lightbox' || event.target.tagName === 'SPAN') {
        document.getElementById('lightbox').style.display = 'none';
    }
}

>>>>>>> Sora
loadProduct();