async function loadProducts() {
    try {
        const res = await fetch("/api/products");
        const products = await res.json();

        const productsGrid = document.getElementById("productsGrid");
        productsGrid.textContent = ""; // ล้างเก่าด้วย textContent

        if (products.length === 0) {
            const emptyMsg = document.createElement("p");
            emptyMsg.textContent = "ยังไม่มีสินค้า";
            productsGrid.appendChild(emptyMsg);
            return;
        }

        products.forEach((p) => {
            // สร้าง card
            const card = document.createElement("div");
            card.classList.add("product-card");

            // ถ้ามีรูปหลายรูป
            if (p.images && p.images.length > 0) {
                const imagesContainer = document.createElement("div");
                imagesContainer.classList.add("product-images");

                p.images.forEach(imgUrl => {
                    const img = document.createElement("img");
                    img.src = imgUrl;
                    img.alt = p.name;
                    img.classList.add("product-image");
                    imagesContainer.appendChild(img);
                });

                card.appendChild(imagesContainer);
            }

            // สร้างเนื้อหา
            const content = document.createElement("div");
            content.classList.add("product-content");

            const title = document.createElement("h3");
            title.classList.add("product-title");
            title.textContent = p.name;

            const desc = document.createElement("p");
            desc.classList.add("product-description");
            desc.textContent = p.description;

            const price = document.createElement("div");
            price.classList.add("product-price");
            price.textContent = `฿${p.price.toLocaleString()}`;

            content.append(title, desc, price);
            card.appendChild(content);

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

function loginSuccess(user) {
    // ซ่อนปุ่ม Sign In, Join Us, Admin
    document.getElementById("authButtons").style.display = "none";

    // แสดงรูปโปรไฟล์
    const profile = document.getElementById("profile");
    profile.style.display = "block";

    // สามารถเปลี่ยนรูปเป็นของ user ที่ login ได้
    if (user && user.image) {
        profile.querySelector("img").src = user.image;
    }
}

// ตัวอย่าง เรียกใช้หลังจาก submit form login สำเร็จ
function handleLogin() {
    // ... validate login ...
    loginSuccess({ image: "/static/images/myavatar.png" });
    closeModal('signinModal');
}


// ✅ ให้โหลดอัตโนมัติเมื่อเปิดหน้า
document.addEventListener("DOMContentLoaded", loadProducts);