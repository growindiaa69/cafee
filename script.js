// Navigation & Drawer Elements
const searchForm = document.querySelector('.search-form');
const searchBtn = document.querySelector('#search-btn');
const cartItem = document.querySelector('.cart-items-container');
const cartBtn = document.querySelector('#cart-btn');
const navbar = document.querySelector('.navbar');
const menuBtn = document.querySelector('#menu-btn');

// Search Toggle
if (searchBtn && searchForm) {
    searchBtn.addEventListener('click', () => {
        searchForm.classList.toggle('active');
        document.addEventListener('click', (e) => {
            if (!e.composedPath().includes(searchBtn) && !e.composedPath().includes(searchForm)) {
                searchForm.classList.remove('active');
            }
        });
    });
}

// Cart Drawer Toggle
if (cartBtn && cartItem) {
    cartBtn.addEventListener('click', () => {
        cartItem.classList.toggle('active');
        document.addEventListener('click', (e) => {
            if (!e.composedPath().includes(cartBtn) && !e.composedPath().includes(cartItem)) {
                cartItem.classList.remove('active');
            }
        });
    });
}

// Mobile Menu Toggle
if (menuBtn && navbar) {
    menuBtn.addEventListener('click', () => {
        navbar.classList.toggle('active');
        document.addEventListener('click', (e) => {
            if (!e.composedPath().includes(navbar) && !e.composedPath().includes(menuBtn)) {
                navbar.classList.remove('active');
            }
        });
    });
}

// FAQ Accordion Toggle (AEO Enhancement)
document.querySelectorAll('.faq-box').forEach(box => {
    const question = box.querySelector('.faq-question');
    if (question) {
        question.addEventListener('click', () => {
            const wasActive = box.classList.contains('active');
            document.querySelectorAll('.faq-box').forEach(b => b.classList.remove('active'));
            if (!wasActive) {
                box.classList.add('active');
            }
        });
    }
});

/* ==========================================================================
   CART SYSTEM (LOCALSTORAGE, DEDICATED CART PAGE & POPUP DRAWER)
   ========================================================================== */

const CART_STORAGE_KEY = 'aroma_crust_cart';

// Retrieve cart from localStorage
function getCart() {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error loading cart:', e);
        return [];
    }
}

// Save cart to localStorage and re-render UI
function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart:', e);
    }
    updateCartBadge();
    renderCartDrawer();
    renderCartPage();
}

// Show Toast Notification
function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Add Item to Cart
function addToCart(product) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.name === product.name);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: 'item_' + Date.now(),
            name: product.name,
            price: parseFloat(product.price),
            image: product.image,
            quantity: 1
        });
    }

    saveCart(cart);
    showToast(`Added "${product.name}" to cart!`);
}

// Update Cart Badge on #cart-btn
function updateCartBadge() {
    if (!cartBtn) return;
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    let badge = cartBtn.querySelector('.cart-badge');
    if (totalCount > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            cartBtn.appendChild(badge);
        }
        badge.textContent = totalCount;
    } else if (badge) {
        badge.remove();
    }
}

// Render Cart Items in Header Drawer
function renderCartDrawer() {
    if (!cartItem) return;
    const cart = getCart();

    // Preserve the checkout link or button
    let checkoutLink = cartItem.querySelector('a.btn');
    if (!checkoutLink) {
        checkoutLink = document.createElement('a');
        checkoutLink.className = 'btn';
    }
    checkoutLink.href = './cart.html';
    checkoutLink.textContent = 'view cart & checkout';

    cartItem.innerHTML = '';

    if (cart.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.padding = '3rem 2rem';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.color = '#718096';
        emptyMsg.style.fontSize = '1.6rem';
        emptyMsg.innerHTML = '<i class="fas fa-shopping-basket" style="font-size:4rem; margin-bottom:1rem; color:#cbd5e1; display:block;"></i>Your cart is empty';
        cartItem.appendChild(emptyMsg);
        cartItem.appendChild(checkoutLink);
        return;
    }

    const itemsWrapper = document.createElement('div');
    itemsWrapper.style.maxHeight = 'calc(100vh - 22rem)';
    itemsWrapper.style.overflowY = 'auto';

    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <i class="fas fa-times" data-remove-id="${item.id}"></i>
            <img src="${item.image}" alt="${item.name}">
            <div class="content">
                <h3>${item.name}</h3>
                <div class="price">$${item.price.toFixed(2)} × ${item.quantity} = <b>$${(item.price * item.quantity).toFixed(2)}</b></div>
            </div>
        `;

        const removeIcon = itemDiv.querySelector('.fa-times');
        if (removeIcon) {
            removeIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromCart(item.id);
            });
        }
        itemsWrapper.appendChild(itemDiv);
    });

    const totalDiv = document.createElement('div');
    totalDiv.style.padding = '1.5rem 2rem';
    totalDiv.style.borderTop = '1px solid #edf2f7';
    totalDiv.style.display = 'flex';
    totalDiv.style.justifyContent = 'space-between';
    totalDiv.style.fontSize = '1.7rem';
    totalDiv.style.fontWeight = '700';
    totalDiv.style.color = 'var(--black-color)';
    totalDiv.innerHTML = `<span>Subtotal:</span><span style="color:var(--main-color);">$${subtotal.toFixed(2)}</span>`;

    cartItem.appendChild(itemsWrapper);
    cartItem.appendChild(totalDiv);
    cartItem.appendChild(checkoutLink);
}

// Remove Item from Cart
function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
}

// Update Item Quantity
function updateQuantity(id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(id);
    } else {
        saveCart(cart);
    }
}

// Clear entire cart
function clearCart() {
    saveCart([]);
}

// Render Dedicated Cart Page (cart.html)
function renderCartPage() {
    const cartContainer = document.getElementById('cart-page-content');
    if (!cartContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your Cart is Currently Empty</h3>
                <p>Looks like you haven't added any of our delicious wood-fired pizzas or smash burgers yet!</p>
                <a href="./menu.html" class="btn">Explore Our Menu</a>
            </div>
        `;
        return;
    }

    let subtotal = 0;
    let rowsHtml = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        rowsHtml += `
            <div class="cart-row">
                <div class="cart-product-info">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <h4>${item.name}</h4>
                        <span class="unit-price-mobile">$${item.price.toFixed(2)} each</span>
                    </div>
                </div>
                <div class="cart-price">$${item.price.toFixed(2)}</div>
                <div class="cart-qty-control">
                    <button class="cart-qty-btn minus-btn" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                    <span class="cart-qty-number">${item.quantity}</span>
                    <button class="cart-qty-btn plus-btn" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
                <div class="cart-subtotal">$${itemTotal.toFixed(2)}</div>
                <div>
                    <button class="cart-remove-btn" data-id="${item.id}" aria-label="Remove item">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    });

    const tax = subtotal * 0.08;
    const delivery = subtotal >= 50 ? 0.00 : 3.99;
    const grandTotal = subtotal + tax + delivery;

    cartContainer.innerHTML = `
        <div class="cart-grid">
            <div class="cart-items-wrapper">
                <div class="cart-table-header">
                    <span>Product</span>
                    <span>Price</span>
                    <span>Quantity</span>
                    <span>Subtotal</span>
                    <span></span>
                </div>
                <div class="cart-table-body">
                    ${rowsHtml}
                </div>
                <div class="cart-actions">
                    <a href="./menu.html" class="btn" style="background:#edf2f7; color:#2d3748; padding:1.2rem 2.4rem; font-size:1.4rem;">
                        <i class="fas fa-arrow-left" style="margin-right:0.8rem;"></i> Continue Shopping
                    </a>
                    <button class="clear-cart-btn" id="clear-cart-btn">
                        <i class="fas fa-trash-alt" style="margin-right:0.6rem;"></i> Clear Cart
                    </button>
                </div>
            </div>

            <div class="cart-summary-card">
                <h3>Order Summary</h3>
                <div class="summary-line">
                    <span>Items Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-line">
                    <span>Estimated Tax (8%):</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="summary-line">
                    <span>Delivery Fee:</span>
                    <span>${delivery === 0 ? '<b style="color:#38a169;">FREE</b>' : '$' + delivery.toFixed(2)}</span>
                </div>
                ${subtotal < 50 ? `<p style="font-size:1.3rem; color:#718096; margin-bottom:1rem; text-transform:none;">Add $${(50 - subtotal).toFixed(2)} more for <b>FREE delivery</b>!</p>` : ''}
                <div class="summary-line total-line">
                    <span>Grand Total:</span>
                    <span>$${grandTotal.toFixed(2)}</span>
                </div>
                <button class="btn checkout-btn" id="proceed-checkout-btn">
                    Proceed to Checkout <i class="fas fa-arrow-right" style="margin-left:0.8rem;"></i>
                </button>
            </div>
        </div>
    `;

    // Attach listeners for cart page controls
    cartContainer.querySelectorAll('.minus-btn').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, -1));
    });

    cartContainer.querySelectorAll('.plus-btn').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, 1));
    });

    cartContainer.querySelectorAll('.cart-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });

    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                clearCart();
            }
        });
    }

    const checkoutBtn = document.getElementById('proceed-checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const modal = document.getElementById('checkout-modal');
            if (modal) {
                modal.classList.add('active');
                clearCart();
            }
        });
    }
}

// Global Event Delegation for "Add to Cart" Clicks
document.addEventListener('click', (e) => {
    // Check if clicked button is "add to cart" inside .menu or .products
    const addToCartBtn = e.target.closest('.menu .box .btn, .products .box .product-btn a');
    if (!addToCartBtn) return;

    e.preventDefault();

    const box = addToCartBtn.closest('.box');
    if (!box) return;

    // Extract product details dynamically from card
    let name = '';
    let price = 0;
    let image = '';

    const nameEl = box.querySelector('h3, .name');
    if (nameEl) name = nameEl.textContent.trim();

    const priceEl = box.querySelector('.price');
    if (priceEl) {
        const text = priceEl.childNodes[0] ? priceEl.childNodes[0].textContent : priceEl.textContent;
        const match = text.match(/\$?(\d+(\.\d+)?)/);
        if (match) price = parseFloat(match[1]);
    }

    const imgEl = box.querySelector('img');
    if (imgEl) image = imgEl.getAttribute('src');

    if (name && price > 0) {
        addToCart({ name, price, image: image || './image/pngwing.com (1).png' });
    }
});

// Contact Form Handler
document.querySelectorAll('form').forEach(form => {
    // If it's the contact form with submit button
    const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
    if (submitBtn && form.closest('.contact')) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = form.querySelector('input[type="text"]');
            const name = nameInput && nameInput.value ? nameInput.value : 'there';
            showToast(`Thank you, ${name}! Your message has been received.`);
            form.reset();
        });
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCartDrawer();
    renderCartPage();
});
