let cart = [];
let editingId = null;

// DOM elements
const productsGrid = document.getElementById("productsGrid");
const emptyState = document.getElementById("emptyState");
const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");
const modalTitle = document.getElementById("modalTitle");
const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const mainImageInput = document.getElementById("mainImage");
const additionalImagesInput = document.getElementById("additionalImages");
const mainImagePreview = document.getElementById("mainImagePreview");
const additionalImagesPreview = document.getElementById("additionalImagesPreview");

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

// Cart functions
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
        const cartData = encodeURIComponent(JSON.stringify(cart));
        window.location.href = `checkout.html?cart=${cartData}`;
    }
}

// Toast notification
function showToast(title, message) {
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// Modal functions
function openProductModal(product = null) {
    productModal.classList.add("active");
    mainImagePreview.innerHTML = '';
    additionalImagesPreview.innerHTML = '';
    
    if (product) {
        modalTitle.textContent = "แก้ไขสินค้า";
        editingId = product.id;
        document.getElementById("productId").value = product.id;
        document.getElementById("productName").value = product.name;
        document.getElementById("productPrice").value = product.price;
        document.getElementById("productDescription").value = product.description;
        
        // Display existing images if editing
        if (product.image_url_main) {
            const img = document.createElement("img");
            img.src = product.image_url_main;
            img.className = "image-preview";
            img.alt = "Main Image Preview";
            mainImagePreview.appendChild(img);
        }
        if (product.images_additional && product.images_additional.length > 0) {
            product.images_additional.forEach(url => {
                const img = document.createElement("img");
                img.src = url;
                img.className = "image-preview";
                img.alt = "Additional Image Preview";
                additionalImagesPreview.appendChild(img);
            });
        }
    } else {
        modalTitle.textContent = "เพิ่มสินค้าใหม่";
        editingId = null;
        productForm.reset();
    }
}

function closeProductModal() {
    productModal.classList.remove("active");
    mainImagePreview.innerHTML = '';
    additionalImagesPreview.innerHTML = '';
    productForm.reset();
}

// Image preview for main image
function setupImagePreview() {
    mainImageInput.addEventListener("change", () => {
        mainImagePreview.innerHTML = '';
        if (mainImageInput.files && mainImageInput.files[0]) {
            const file = mainImageInput.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.className = "image-preview";
                img.alt = "Main Image Preview";
                mainImagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });

    // Image preview for additional images
    additionalImagesInput.addEventListener("change", () => {
        additionalImagesPreview.innerHTML = '';
        if (additionalImagesInput.files && additionalImagesInput.files.length > 0) {
            Array.from(additionalImagesInput.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.className = "image-preview";
                    img.alt = "Additional Image Preview";
                    additionalImagesPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        }
    });
}

// Load products from API
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
                <img src="${p.image_main}" alt="${p.name}" class="product-image">
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

            // Edit button
            card.querySelector(".btn-edit").onclick = () => openProductModal(p);

            // Delete button
            card.querySelector(".btn-delete").onclick = async () => {
                if (confirm("คุณต้องการลบสินค้านี้หรือไม่?")) {
                    try {
                        await fetch(`/api/products/${p.id}`, { method: "DELETE" });
                        showToast("ลบสำเร็จ", "สินค้าถูกลบเรียบร้อยแล้ว");
                        loadProducts();
                    } catch (err) {
                        console.error(err);
                        showToast("Error", "ไม่สามารถลบสินค้าได้");
                    }
                }
            };

            productsGrid.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        showToast("Error", "ไม่สามารถโหลดสินค้าได้");
    }
}

// Submit product form
function setupFormSubmission() {
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", document.getElementById("productName").value);
        formData.append("price", parseFloat(document.getElementById("productPrice").value));
        formData.append("description", document.getElementById("productDescription").value);

        // Add main image
        if (mainImageInput.files[0]) {
            formData.append("image_main", mainImageInput.files[0]);
        }

        // Add additional images
        if (additionalImagesInput.files.length > 0) {
            Array.from(additionalImagesInput.files).forEach(file => {
                formData.append("images_additional", file);
            });
        }

        try {
            if (editingId) {
                await fetch(`/api/products/${editingId}`, {
                    method: "PUT",
                    body: formData,
                });
                showToast("อัปเดตสำเร็จ", "แก้ไขสินค้าเรียบร้อยแล้ว");
            } else {
                await fetch("/api/products", {
                    method: "POST",
                    body: formData,
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
}

// Event listeners for closing modal and cart
function setupEventListeners() {
    // Close cart when clicking outside
    document.addEventListener('click', function(event) {
        const cartPanel = document.getElementById('cart-panel');
        const cartButton = document.querySelector('.cart');
        
        if (!cartPanel.contains(event.target) && !cartButton.contains(event.target)) {
            cartPanel.classList.remove('active');
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeProductModal();
        }
    });

    // Add product button
    document.getElementById("addProductBtn").addEventListener("click", () => openProductModal());
}

// Initialize application
function init() {
    createParticles();
    renderCart();
    setupImagePreview();
    setupFormSubmission();
    setupEventListeners();
    loadProducts();
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);