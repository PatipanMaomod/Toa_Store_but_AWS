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

function addToCart(product) {
  cart.push(product);
  document.getElementById('cart-count').textContent = cart.length;
  renderCart();
  
  // Add success animation
  const button = event.target;
  const originalText = button.textContent;
  button.textContent = '✓ Added!';
  button.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
  
  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = 'linear-gradient(45deg, #ffd369, #ff6b6b)';
  }, 1500);
}

function renderCart() {
  let cartItems = document.getElementById('cart-items');
  cartItems.innerHTML = '';
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; color: #aaa; margin: 20px 0;">Your cart is empty</p>';
    return;
  }
  
  cart.forEach((item, index) => {
    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item}</span>
        <button onclick="removeFromCart(${index})" title="Remove item">×</button>
      </div>
    `;
  });
}

function removeFromCart(index) {
  cart.splice(index, 1);
  document.getElementById('cart-count').textContent = cart.length;
  renderCart();
}

function toggleCart() {
  document.getElementById('cart-panel').classList.toggle('active');
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty! Add some amazing products first! 🛒");
  } else {
    // Pass cart data to checkout page via URL parameters
    const cartData = encodeURIComponent(JSON.stringify(cart));
    window.location.href = `checkout.html?cart=${cartData}`;
  }
}

// Initialize particles when page loads
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  renderCart();
});

// Close cart when clicking outside
document.addEventListener('click', function(event) {
  const cartPanel = document.getElementById('cart-panel');
  const cartButton = document.querySelector('.cart');
  
  if (!cartPanel.contains(event.target) && !cartButton.contains(event.target)) {
    cartPanel.classList.remove('active');
  }
});