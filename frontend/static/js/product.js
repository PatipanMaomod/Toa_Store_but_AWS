let cart = [];
let currentProduct = null;

// Product data with detailed information and multiple images
const productDetails = {
  'Gaming Keyboard': {
    price: '$149.99',
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6xRFNeGoO4njAGt0hambMZ28NbNBP4eICHQ&s',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=300&fit=crop'
    ],
    description: 'Experience the ultimate in gaming performance with our premium mechanical gaming keyboard. Featuring Cherry MX switches, customizable RGB lighting, and premium build quality that will elevate your gaming experience to the next level.',
    features: [
      'Cherry MX Blue mechanical switches',
      'Per-key RGB lighting with 16.7M colors',
      'Anti-ghosting technology',
      'Dedicated media controls',
      'Detachable USB-C cable',
      'Aluminum frame construction',
      'Gaming mode with Windows key lock'
    ]
  },
  'Gaming Mouse': {
    price: '$79.99',
    images: [
      'https://th.thermaltake.com/media/catalog/product/cache/6af153fd0a0c509bdfcdfb60a394dd9c/t/o/toughdesk500lrgb_01_1.jpg',
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop'
    ],
    description: 'Precision meets style in this high-performance gaming mouse. With advanced sensor technology and ergonomic design, it\'s built for marathon gaming sessions and competitive play.',
    features: [
      'PixArt 3360 optical sensor',
      'Up to 12,000 DPI',
      'RGB lighting with sync capability',
      'Ergonomic right-handed design',
      '6 programmable buttons',
      'Braided cable with gold-plated USB',
      'On-the-fly DPI switching'
    ]
  },
  'Gaming Headset': {
    price: '$199.99',
    images: [
      'https://th.thermaltake.com/media/catalog/product/cache/cc8b24283b13da6bc2ff91682c03b54b/0/1/01_6_1.jpg',
      'https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop'
    ],
    description: 'Immerse yourself in crystal-clear audio with our premium gaming headset. Featuring 7.1 surround sound, noise-cancelling microphone, and comfort-focused design for extended gaming sessions.',
    features: [
      '7.1 virtual surround sound',
      '50mm neodymium drivers',
      'Noise-cancelling microphone',
      'Memory foam ear cushions',
      'RGB lighting on ear cups',
      'Multi-platform compatibility',
      'Detachable microphone'
    ]
  }
};

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

// Product popup functions
function openProductPopup(productName) {
  const product = productDetails[productName];
  if (!product) return;
  
  currentProduct = productName;
  
  // Update popup content
  document.getElementById('popup-title').textContent = productName;
  document.getElementById('popup-price').textContent = product.price;
  document.getElementById('popup-description').textContent = product.description;
  
  // Set main image
  const mainImg = document.getElementById('popup-main-img');
  mainImg.src = product.images[0];
  mainImg.alt = productName;
  
  // Create thumbnail images
  const thumbnailsContainer = document.getElementById('popup-thumbnails');
  thumbnailsContainer.innerHTML = '';
  
  product.images.forEach((imageUrl, index) => {
    const thumbnail = document.createElement('img');
    thumbnail.src = imageUrl;
    thumbnail.alt = `${productName} view ${index + 1}`;
    thumbnail.className = `popup-thumbnail ${index === 0 ? 'active' : ''}`;
    thumbnail.onmouseenter = () => switchMainImage(imageUrl, thumbnail);
    thumbnailsContainer.appendChild(thumbnail);
  });
  
  // Update features list
  const featuresContainer = document.getElementById('popup-features');
  featuresContainer.innerHTML = `
    <h4>Key Features:</h4>
    <ul>
      ${product.features.map(feature => `<li>${feature}</li>`).join('')}
    </ul>
  `;
  
  // Show popup
  document.getElementById('popup-overlay').classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function switchMainImage(imageUrl, thumbnailElement) {
  // Update main image
  document.getElementById('popup-main-img').src = imageUrl;
  
  // Update active thumbnail
  document.querySelectorAll('.popup-thumbnail').forEach(thumb => {
    thumb.classList.remove('active');
  });
  thumbnailElement.classList.add('active');
}

function closeProductPopup() {
  document.getElementById('popup-overlay').classList.remove('active');
  document.body.style.overflow = 'auto'; // Restore scrolling
  currentProduct = null;
}

function addToCartFromPopup() {
  if (currentProduct) {
    addToCart(currentProduct);
    closeProductPopup();
  }
}

function buyNowFromPopup() {
  if (currentProduct) {
    // Clear cart and add only this product
    cart = [currentProduct];
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

// Close popup with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeProductPopup();
  }
});