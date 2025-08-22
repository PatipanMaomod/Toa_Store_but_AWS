async function loadProducts() {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '<p>กำลังโหลดสินค้า...</p>';

  try {
    const res = await fetch('http://localhost:4000/api/products');
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = '<p>ยังไม่มีสินค้า</p>';
      return;
    }

    grid.innerHTML = products.map(p => `
      <article class="card">
        <img class="thumb" alt="${p.name}" src="${p.image_url_main || 'img/no-image.png'}" />
        <div class="card-body">
          <h3>${p.name}</h3>
          <div class="sku">SKU: ${p.description}</div>
          <div class="price">฿${p.price.toLocaleString()}</div>
          <a class="btn" href="product.html?id=${p.id}">ดูรายละเอียด</a>
        </div>
      </article>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<p style="color:red">โหลดสินค้าไม่สำเร็จ: ${err.message}</p>`;
  }
}

loadProducts();
