// Product data with images and prices
const productData = {
  'Gaming Keyboard': { 
    icon: '⌨️', 
    price: 149.99,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6xRFNeGoO4njAGt0hambMZ28NbNBP4eICHQ&s'
  },
  'Gaming Mouse': { 
    icon: '🖱️', 
    price: 79.99,
    image: 'https://th.thermaltake.com/media/catalog/product/cache/6af153fd0a0c509bdfcdfb60a394dd9c/t/o/toughdesk500lrgb_01_1.jpg'
  },
  'Gaming Headset': { 
    icon: '🎧', 
    price: 199.99,
    image: 'https://th.thermaltake.com/media/catalog/product/cache/cc8b24283b13da6bc2ff91682c03b54b/0/1/01_6_1.jpg'
  }
};

let cart = [];

// Generate background particles
function createParticles() {
  const particlesContainer = document.querySelector('.bg-particles');
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.width = particle.style.height = Math.random() * 4 + 2 + 'px';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
    particlesContainer.appendChild(particle);
  }
}

// Get cart data from URL parameters or sessionStorage
function getCartData() {
  // Try to get from URL first (when redirected from products page)
  const urlParams = new URLSearchParams(window.location.search);
  const cartParam = urlParams.get('cart');
  
  if (cartParam) {
    try {
      const cartData = JSON.parse(decodeURIComponent(cartParam));
      // Convert simple array to object format with quantities
      const cartMap = {};
      cartData.forEach(item => {
        if (cartMap[item]) {
          cartMap[item].quantity++;
        } else {
          cartMap[item] = { name: item, quantity: 1 };
        }
      });
      return Object.values(cartMap);
    } catch (e) {
      console.error('Error parsing cart data:', e);
    }
  }
  
  // Fallback to localStorage or return empty cart
  try {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (e) {
    return [];
  }
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const cartCount = document.getElementById('cart-count');
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some amazing products to get started!</p>
      </div>
    `;
    cartCount.textContent = '0';
    updateSummary();
    return;
  }

  let totalItems = 0;
  container.innerHTML = cart.map((item, index) => {
    const product = productData[item.name] || { icon: '📦', price: 99.99 };
    totalItems += item.quantity;
    
    return `
      <div class="cart-item">
        <div class="item-image">
          ${product.icon}
        </div>
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-price">$${product.price.toFixed(2)} each</div>
        </div>
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="changeQuantity(${index}, -1)">-</button>
          <span class="quantity-display">${item.quantity}</span>
          <button class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  }).join('');
  
  cartCount.textContent = totalItems;
  updateSummary();
}

function changeQuantity(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function updateSummary() {
  let subtotal = 0;
  
  cart.forEach(item => {
    const product = productData[item.name] || { price: 99.99 };
    subtotal += product.price * item.quantity;
  });
  
  const discount = subtotal > 200 ? subtotal * 0.1 : 0; // 10% discount if over $200
  const tax = (subtotal - discount) * 0.08; // 8% tax
  const shipping = subtotal > 79 ? 0 : 9.99; // Free shipping over $79
  const total = subtotal - discount + tax + shipping;
  
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
  document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function submitForm(event) {
  event.preventDefault();
  
  if (cart.length === 0) {
    alert("Your cart is empty! Please add some products first.");
    return;
  }
  
  // Add loading state
  const form = event.target;
  const submitBtn = form.querySelector('.checkout-btn');
  const originalText = submitBtn.textContent;
  
  submitBtn.textContent = 'Processing...';
  submitBtn.classList.add('loading');
  
  // Simulate processing
  setTimeout(() => {
    const formData = new FormData(form);
    const customerInfo = {
      name: formData.get('fullName'),
      email: formData.get('email'),
      address: formData.get('address')
    };
    
    alert(`🎉 Order placed successfully!\n\nThank you, ${customerInfo.name}!\nConfirmation sent to: ${customerInfo.email}\n\nYour gaming gear will be shipped to:\n${customerInfo.address}`);
    
    // Clear cart and redirect
    localStorage.removeItem('cart');
    window.location.href = 'index.html';
  }, 2000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  cart = getCartData();
  renderCart();
  
  // Add form submit handler
  document.getElementById('checkout-form').addEventListener('submit', submitForm);
});