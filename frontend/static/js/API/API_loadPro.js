
// ================= Loader แบบ Pro =================
async function loadPro_pro() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    const container = document.getElementById('product-list-pro');
    container.innerHTML = '';

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = "card";

      const img = document.createElement('img');
      img.src = p.image_main[0] || "https://product-images-toa-shop.s3.ap-northeast-3.amazonaws.com/pro_images_S3/broken-image-example.png";
      card.appendChild(img);

      const title = document.createElement('h3');
      title.textContent = p.name;
      card.appendChild(title);

      const desc = document.createElement('p');
      desc.textContent = p.description;
      card.appendChild(desc);

      const price = document.createElement('p');
      price.textContent = `ราคา: ${p.price} บาท`;
      card.appendChild(price);

      const btnGroup = document.createElement('div');
      btnGroup.className = "btn-group";


      // ปุ่ม Add to Cart
      const btn = document.createElement('button');
      btn.textContent = "Add to Cart";
      btn.onclick = () => addToCart(p);

      // ปุ่ม View Details
      const viewBtn = document.createElement('button');
      viewBtn.textContent = "View Details";
      viewBtn.onclick = () => {
        window.location.href = `/product/${p.id}`;
      };

      btnGroup.appendChild(btn);
      btnGroup.appendChild(viewBtn);
      card.appendChild(btnGroup)


      container.appendChild(card);
    });
  } catch (err) {
    console.error("โหลดสินค้าล้มเหลว:", err);
  }
}



// ================= Loader แบบ Home =================
async function loadPor_home() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    const container = document.getElementById('product-list-home');
    container.innerHTML = '';

    // 👉 เอาแค่ 3 ตัวแรก
    const top3 = products.slice(0, 3);

    top3.forEach(p => {
      const card = document.createElement('div');
      card.className = "card";

      const img = document.createElement('img');
      img.src = p.image_main[0] || "https://product-images-toa-shop.s3.ap-northeast-3.amazonaws.com/pro_images_S3/broken-image-example.png";
      card.appendChild(img);

      const title = document.createElement('h3');
      title.textContent = p.name;
      card.appendChild(title);

      // คลิกทั้งการ์ดไปยัง /product/:id
      card.addEventListener('click', () => {
        window.location.href = `/product/${p.id}`;
      });
      card.style.cursor = "pointer";

      container.appendChild(card);
    });
  } catch (err) {
    console.error("โหลดสินค้าล้มเหลว:", err);
  }
}


// ================= Loader แบบ edit =================


function closeModal() {
  document.getElementById("editProductForm").style.display = "none";
}

let deletedImages = []; // เก็บ url ที่ผู้ใช้เลือกจะลบ
async function loadProductById(id) {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error("ไม่พบสินค้า id=" + id);

    const product = await res.json();

    // ใส่ค่าลง form
    document.getElementById("editName").value = product.name || "";
    document.getElementById("editPrice").value = product.price || "";
    document.getElementById("editDesc").value = product.description || "";
    document.getElementById("editQty").value = product.stock || "";

    // reset deletedImages เวลาโหลดใหม่
    deletedImages = [];

    // แสดงรูป + ปุ่มลบ
    const preview = document.getElementById("editPreview");
    preview.innerHTML = "";
    product.image_main.forEach(url => {
      const wrapper = document.createElement("div");
      wrapper.className = "inline-block relative m-1";

      const img = document.createElement("img");
      img.src = url;
      img.className = "w-20 h-20 object-cover rounded border";

      const btn = document.createElement("button");
      btn.textContent = "✖";
      btn.className = "absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center";
      btn.onclick = () => {
        deletedImages.push(url);   // เก็บไว้ว่าอันนี้จะถูกลบ
        wrapper.remove();          // เอาออกจาก preview เลย
      };

      wrapper.appendChild(img);
      wrapper.appendChild(btn);
      preview.appendChild(wrapper);
    });

    // เก็บ id ของ product ไว้ใน modal (dataset)
    document.getElementById("editProductForm").dataset.productId = product.id;

    // เปิด modal
    document.getElementById("editProductForm").style.display = "flex";
  } catch (err) {
    console.error("โหลดสินค้าล้มเหลว:", err);
  }
}



// ================= Loader แบบ management =================

async function loadPro_mag() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    const container = document.getElementById('product-list-mag');
    container.innerHTML = '';

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = "card border rounded p-2 shadow text-center";

      const img = document.createElement('img');
      img.src = p.image_main[0] || "https://via.placeholder.com/150";
      img.className = "w-32 h-32 object-cover mx-auto";
      card.appendChild(img);

      const title = document.createElement('h3');
      title.textContent = p.name;
      title.className = "font-semibold mt-2";
      card.appendChild(title);

      const editBtn = document.createElement('button');
      editBtn.textContent = "Edit";
      editBtn.onclick = () => loadProductById(p.id);
      card.appendChild(editBtn);

      container.appendChild(card);
    });
  } catch (err) {
    console.error("โหลดสินค้าล้มเหลว:", err);
  }
}

// ================= Run =================
loadPor_home();
loadPro_pro();
loadPro_mag();  
