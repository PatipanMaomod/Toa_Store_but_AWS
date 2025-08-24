function openProductModal(product = null) {
  productModal.classList.add("active");
  if (product) {
    modalTitle.textContent = "แก้ไขสินค้า";
    editingId = product.id;
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productDescription").value = product.description;
    // ✅ โหลด array images กลับไปใส่ textarea
    document.getElementById("productImages").value = (product.images || []).join("\n");
  } else {
    modalTitle.textContent = "เพิ่มสินค้าใหม่";
    editingId = null;
    productForm.reset();
  }
}

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const imagesText = document.getElementById("productImages").value.trim();
  const images = imagesText ? imagesText.split("\n").map(url => url.trim()) : [];

  const data = {
    name: document.getElementById("productName").value,
    price: parseFloat(document.getElementById("productPrice").value),
    description: document.getElementById("productDescription").value,
    images // ✅ ส่งเป็น array
  };

  try {
    if (editingId) {
      await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      showToast("อัปเดตสำเร็จ", "แก้ไขสินค้าเรียบร้อยแล้ว");
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      showToast("เพิ่มสำเร็จ", "เพิ่มสินค้าใหม่เรียบร้อยแล้ว");
    }
    closeProductModal();
    loadProducts();
  } catch (err) {
    console.error(err);
    showToast("Error", "บันทึกสินค้าไม่สำเร็จ");
  }
});
