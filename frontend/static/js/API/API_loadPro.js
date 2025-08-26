
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

      const btn = document.createElement('button');
      btn.textContent = "Add to Cart";
      btn.onclick = () => addToCart(p);
      card.appendChild(btn);


      // ปุ่ม View Details
      const viewBtn = document.createElement('button');
      viewBtn.textContent = "View Details";
      viewBtn.onclick = () => {
        window.location.href = `/product/${p.id}`;
      };
      card.appendChild(viewBtn);


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

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = "card";

      const img = document.createElement('img');
      img.src = p.image_main[0] || "https://product-images-toa-shop.s3.ap-northeast-3.amazonaws.com/pro_images_S3/broken-image-example.png";
      card.appendChild(img);


      const title = document.createElement('h3');
      title.textContent = p.name;
      card.appendChild(title);

      //ทำให้คลิกทั้งการ์ดไปยัง /product/:id
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


// ================= Loader แบบ management =================


function openModal(product) {
  const modal = document.getElementById("editProductForm");
  modal.style.display = "block";
  
  if (product) {
    document.getElementById("editName").value = product.name || "";
    document.getElementById("editPrice").value = product.price || "";
  }
}

function closeModal() {
  document.getElementById("editProductForm").style.display = "none";
}


async function loadPro_mag() {

  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    const container = document.getElementById('product-list-mag');
    container.innerHTML = '';

    // วาดการ์ดสินค้า
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = "card border rounded p-2 shadow text-center";

      // รูปสินค้า
      const img = document.createElement('img');
      img.src = p.image_main[0] ||
        "https://product-images-toa-shop.s3.ap-northeast-3.amazonaws.com/pro_images_S3/broken-image-example.png";
      img.className = "w-32 h-32 object-cover mx-auto";
      card.appendChild(img);

      // ชื่อสินค้า
      const title = document.createElement('h3');
      title.textContent = p.name;
      title.className = "font-semibold mt-2";
      card.appendChild(title);

      // ปุ่มแก้ไข
      const editBtn = document.createElement('button');
      editBtn.textContent = "Edit";
      editBtn.onclick = () => openModal(p);  
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
