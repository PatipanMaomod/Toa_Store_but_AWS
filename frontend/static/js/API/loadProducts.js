//loadProducts.js

async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    const products = await res.json();

    productsGrid.innerHTML = "";

    if (products.length === 0) {
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";

    products.forEach((p) => {
      const card = document.createElement("div");
      card.className = "product-card";

      // 🔥 แสดงรูปหลายรูป (วน loop ใน images)
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
          <div class="product-actions">
            <button class="btn-small btn-edit">แก้ไข</button>
            <button class="btn-small btn-delete">ลบ</button>
          </div>
        </div>
      `;

      // ปุ่มแก้ไข
      card.querySelector(".btn-edit").onclick = () => openProductModal(p);

      // ปุ่มลบ
      card.querySelector(".btn-delete").onclick = async () => {
        if (confirm("คุณต้องการลบสินค้านี้หรือไม่?")) {
          await fetch(`/api/products/${p.id}`, { method: "DELETE" });
          showToast("ลบสำเร็จ", "สินค้าถูกลบเรียบร้อยแล้ว");
          loadProducts();
        }
      };

      productsGrid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    showToast("Error", "ไม่สามารถโหลดสินค้าได้");
  }
}
