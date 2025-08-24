async function loadProducts() {
    try {
        const res = await fetch("/api/products");
        const products = await res.json();

        const productsGrid = document.getElementById("productsGrid");
        productsGrid.innerHTML = "";

        if (products.length === 0) {
            productsGrid.innerHTML = "<p>ยังไม่มีสินค้า</p>";
            return;
        }

        products.forEach((p) => {
            const card = document.createElement("div");
            card.className = "product-card";

            // 🔥 รูปหลายรูป
            let imagesHtml = "";
            if (p.images && p.images.length > 0) {
                imagesHtml = `
          <div class="product-images">
            ${p.images.map(img => `<img src="${img}" alt="${p.name}" class="product-image">`).join("")}
          </div>
        `;
            }

            card.innerHTML = `
        ${imagesHtml}
        <div class="product-content">
          <h3 class="product-title">${p.name}</h3>
          <p class="product-description">${p.description}</p>
          <div class="product-price">฿${p.price.toLocaleString()}</div>
        </div>
      `;

            productsGrid.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

// ✅ ให้โหลดอัตโนมัติเมื่อเปิดหน้า
document.addEventListener("DOMContentLoaded", loadProducts);
async function loadProducts() {
    try {
        const res = await fetch("/api/products");
        const products = await res.json();

        const productsGrid = document.getElementById("productsGrid");
        productsGrid.innerHTML = "";

        if (products.length === 0) {
            productsGrid.innerHTML = "<p>ยังไม่มีสินค้า</p>";
            return;
        }

        products.forEach((p) => {
            const card = document.createElement("div");
            card.className = "product-card";

            // 🔥 รูปหลายรูป
            let imagesHtml = "";
            if (p.images && p.images.length > 0) {
                imagesHtml = `
          <div class="product-images">
            ${p.images.map(img => `<img src="${img}" alt="${p.name}" class="product-image">`).join("")}
          </div>
        `;
            }

            card.innerHTML = `
        ${imagesHtml}
        <div class="product-content">
          <h3 class="product-title">${p.name}</h3>
          <p class="product-description">${p.description}</p>
          <div class="product-price">฿${p.price.toLocaleString()}</div>
        </div>
      `;

            productsGrid.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

// ✅ ให้โหลดอัตโนมัติเมื่อเปิดหน้า
document.addEventListener("DOMContentLoaded", loadProducts);
