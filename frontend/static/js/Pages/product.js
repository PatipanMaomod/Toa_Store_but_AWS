const pathParts = window.location.pathname.split('/');
const productId = pathParts[pathParts.length - 1];

let currentProduct = null;
let images = [];

async function loadProduct() {
    try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error("Product not found");
        const p = await res.json();
        currentProduct = p;

        images = p.image_sub && p.image_sub.length > 0
            ? p.image_sub
            : ["/static/img/no-image.png"];

        const container = document.getElementById('product-detail');
        container.innerHTML = `
          <h2>${p.name}</h2>
          <p>${p.description || "No description"}</p>
          <img id="mainImage" src="${images[0]}">
          <div class="thumbnails">
            ${images.map((url, i) => `
              <img src="${url}" class="thumb ${i === 0 ? "active" : ""}">
            `).join('')}
          </div>
        `;

        const mainImage = document.getElementById('mainImage');
        mainImage.addEventListener('click', () => openLightbox(mainImage.src));

        document.querySelectorAll('.thumb').forEach((thumb, i) => {
            thumb.addEventListener('click', () => {
                mainImage.src = images[i];
                document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });

        document.getElementById('price').textContent = `฿${p.price}`;
        document.getElementById('stock').textContent = p.stock;
        updateTotal();
    } catch (err) {
        document.getElementById('product-detail').innerHTML = `<p>❌ ไม่พบสินค้า</p>`;
        console.error(err);
    }
}

function openLightbox(src) {
    document.getElementById('lightboxImage').src = src;
    document.getElementById('lightbox').style.display = 'flex';
}

function closeLightbox(event) {
    if (!event || event.target.id === 'lightbox' || event.target.tagName === 'SPAN') {
        document.getElementById('lightbox').style.display = 'none';
    }
}

function updateTotal() {
    const qty = parseInt(document.getElementById('quantity').value) || 1;
    const total = currentProduct.price * qty;
    document.getElementById('total').textContent = `฿${total}`;
}

function addToCart() {
    const qty = parseInt(document.getElementById('quantity').value) || 1;
    alert(`✅ Added ${qty} x ${currentProduct.name} to cart!`);
}

document.addEventListener('DOMContentLoaded', () => {
    loadProduct();
    document.getElementById('quantity').addEventListener('input', updateTotal);
});