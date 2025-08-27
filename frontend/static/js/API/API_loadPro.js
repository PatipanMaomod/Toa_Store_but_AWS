// ================= Cart Shared =================
let cart = [];

function addToCart(product) {
  cart.push(product);
  document.getElementById('cart-count').textContent = cart.length;
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  cartItems.innerHTML = '';
  cart.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = "cart-item";
    div.innerHTML = `<span>${item.name} - ฿${item.price}</span>
                     <button onclick="removeFromCart(${i})">×</button>`;
    cartItems.appendChild(div);
  });
}

function removeFromCart(i) {
  cart.splice(i, 1);
  document.getElementById('cart-count').textContent = cart.length;
  renderCart();
}

function toggleCart() {
  document.getElementById('cart-panel').classList.toggle('active');
}

function checkout() {
  alert("Checkout process started!");
}

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
      card.style.cursor = "pointer"; // เปลี่ยนเคอร์เซอร์เมื่อโฮเวอร์

      container.appendChild(card);
    });
  } catch (err) {
    console.error("โหลดสินค้าล้มเหลว:", err);
  }
}

// ================= Run =================
loadPor_home();
loadPro_pro();
