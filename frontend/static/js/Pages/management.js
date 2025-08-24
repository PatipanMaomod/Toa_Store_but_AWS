// DOM elements
const productsGrid = document.getElementById("productsGrid");
const emptyState = document.getElementById("emptyState");
const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");
const modalTitle = document.getElementById("modalTitle");
const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");

let editingId = null;

// ✅ Toast
function showToast(title, message) {
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ✅ Modal
function openProductModal(product = null) {
  productModal.classList.add("active");
  if (product) {
    modalTitle.textContent = "แก้ไขสินค้า";
    editingId = product.id;
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productDescription").value = product.description;
    document.getElementById("productImage").value = product.image_url_main;
  } else {
    modalTitle.textContent = "เพิ่มสินค้าใหม่";
    editingId = null;
    productForm.reset();
  }
}

function closeProductModal() {
  productModal.classList.remove("active");
}

// ✅ โหลดสินค้า
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

      card.innerHTML = `
        <img src="${p.image_url_main}" alt="${p.name}" class="product-image">
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

// ✅ Submit ฟอร์ม
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("productName").value,
    price: parseFloat(document.getElementById("productPrice").value),
    description: document.getElementById("productDescription").value,
    image_url_main: document.getElementById("productImage").value,
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

// ✅ Init
document.getElementById("addProductBtn").addEventListener("click", () => openProductModal());
loadProducts();
