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

        images = p.image_main && p.image_main.length > 0
            ? p.image_main
            : ["/static/img/no-image.png"];

        const container = document.getElementById('product-detail');
        // ล้างเนื้อหาเดิม
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // สร้างและเพิ่ม element
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

loadProduct();