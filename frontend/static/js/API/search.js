let allProducts = [];

async function loadAllProducts() {
  const res = await fetch('/api/products');
  allProducts = await res.json();
  displayProducts(allProducts);
}

function displayProducts(list) {
  const container = document.getElementById('product-filter');
  container.innerHTML = '';

  list.forEach(p => {
    const card = document.createElement('div');
    card.className = "card";

    const img = document.createElement('img');
    img.src = p.image_main[0] || "https://product-images-toa-shop.s3.ap-northeast-3.amazonaws.com/pro_images_S3/broken-image-example.png";
    card.appendChild(img);

    const title = document.createElement('h3');
    title.textContent = p.name;
    card.appendChild(title);

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
}

function filterProducts() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allProducts.filter(p => p.name.toLowerCase().includes(input));
  displayProducts(filtered);
}

window.addEventListener('DOMContentLoaded', loadAllProducts);

