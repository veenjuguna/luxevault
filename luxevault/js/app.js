/* ============================================================
   LUXEVAULT — app.js
   ============================================================ */

// ── Mobile nav toggle ───────────────────────────────────────
const hamburger = document.getElementById('lx-hamburger');
const mobileMenu = document.getElementById('lx-mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('d-none');
  });
}

// ── Toast system ────────────────────────────────────────────
window.lxToast = function(message, type = 'info') {
  let container = document.getElementById('lx-toasts');
  if (!container) {
    container = document.createElement('div');
    container.id = 'lx-toasts';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const colors = { success: 'var(--lx-success)', error: 'var(--lx-danger)', info: '#2980b9' };
  const toast = document.createElement('div');
  toast.className = `lx-toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}" style="color:${colors[type]};flex-shrink:0"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.cssText += 'opacity:0;transform:translateX(32px);transition:all .28s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// ── Cart count (localStorage) ────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem('lx_cart') || '[]'); } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('lx_cart', JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.lx-cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

window.addToCart = function(id, name, brand, price, imgSrc) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx > -1) { cart[idx].qty += 1; }
  else { cart.push({ id, name, brand, price, imgSrc, qty: 1 }); }
  saveCart(cart);
  lxToast(`<strong>${name}</strong> added to your bag`, 'success');
};

window.removeFromCart = function(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCartPage();
};

window.updateQty = function(id, qty) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx > -1) { cart[idx].qty = Math.max(1, qty); saveCart(cart); renderCartPage(); }
};

// ── Render cart page ─────────────────────────────────────────
function renderCartPage() {
  const container = document.getElementById('cart-items-container');
  const summaryContainer = document.getElementById('cart-summary-container');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `<div class="lx-empty">
      <div class="lx-empty-icon">🛍️</div>
      <h3 class="font-serif mb-2">Your bag is empty</h3>
      <p class="mb-4">Discover our luxury collection</p>
      <a href="products.html" class="btn btn-lx-gold">Explore Collection</a>
    </div>`;
    if (summaryContainer) summaryContainer.innerHTML = '';
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 50000 ? 0 : 500;

  container.innerHTML = cart.map(item => `
    <div class="lx-cart-item">
      <img src="${item.imgSrc || 'https://picsum.photos/seed/' + item.id + '/200/200'}" class="lx-cart-thumb" alt="${item.name}" onerror="this.style.background='var(--lx-bg3)';this.src=''">
      <div>
        <div class="text-gold" style="font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;font-weight:600;margin-bottom:4px">${item.brand}</div>
        <div class="font-serif" style="font-size:1rem;color:var(--lx-text);margin-bottom:10px">${item.name}</div>
        <div class="lx-qty">
          <button onclick="updateQty(${item.id}, ${item.qty - 1})">−</button>
          <input type="number" value="${item.qty}" min="1" onchange="updateQty(${item.id}, +this.value)">
          <button onclick="updateQty(${item.id}, ${item.qty + 1})">+</button>
        </div>
      </div>
      <div class="text-end">
        <div style="font-weight:600;color:var(--lx-text);margin-bottom:12px">KES ${(item.price * item.qty).toLocaleString()}</div>
        <button onclick="removeFromCart(${item.id})" class="btn btn-sm" style="color:var(--lx-dim);font-size:.75rem;padding:4px 8px;border:1px solid var(--lx-border)">Remove</button>
      </div>
    </div>
  `).join('');

  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <div class="lx-summary">
        <div class="lx-summary-title">Order Summary</div>
        <div class="lx-summary-row"><span>Subtotal</span><span>KES ${subtotal.toLocaleString()}</span></div>
        <div class="lx-summary-row"><span>Delivery</span><span>${delivery === 0 ? '<span class="text-gold">FREE</span>' : 'KES 500'}</span></div>
        <div class="lx-summary-row lx-summary-total">
          <span>Total</span>
          <span class="text-gold">KES ${(subtotal + delivery).toLocaleString()}</span>
        </div>
        <a href="checkout.html" class="btn btn-lx-gold w-100 mt-3"><i class="fas fa-lock me-2"></i>Secure Checkout</a>
        <a href="products.html" class="btn btn-lx-outline w-100 mt-2 text-center d-block">Continue Shopping</a>
        <div class="text-center mt-3" style="font-size:.72rem;color:var(--lx-dim)"><i class="fas fa-mobile-alt me-1"></i>Secure M-Pesa checkout</div>
      </div>`;
  }
}

// ── Checkout page summary ─────────────────────────────────────
function renderCheckoutSummary() {
  const el = document.getElementById('checkout-order-summary');
  if (!el) return;
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 50000 ? 0 : 500;

  el.innerHTML = `
    ${cart.map(item => `
      <div class="d-flex align-items-center gap-3 py-2" style="border-bottom:1px solid var(--lx-border)">
        <img src="${item.imgSrc || 'https://picsum.photos/seed/' + item.id + '/80/80'}" style="width:44px;height:44px;object-fit:cover;border-radius:var(--lx-radius);background:var(--lx-bg3)" onerror="this.src=''">
        <div style="flex:1;min-width:0">
          <div style="font-size:.84rem;color:var(--lx-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.name}</div>
          <div style="font-size:.72rem;color:var(--lx-muted)">Qty: ${item.qty}</div>
        </div>
        <div style="font-size:.84rem;color:var(--lx-text);white-space:nowrap">KES ${(item.price * item.qty).toLocaleString()}</div>
      </div>`).join('')}
    <div class="lx-summary-row mt-3"><span>Subtotal</span><span>KES ${subtotal.toLocaleString()}</span></div>
    <div class="lx-summary-row"><span>Delivery</span><span>${delivery === 0 ? '<span class="text-gold">FREE</span>' : 'KES 500'}</span></div>
    <div class="lx-summary-row lx-summary-total"><span>Total</span><span class="text-gold">KES ${(subtotal + delivery).toLocaleString()}</span></div>`;
}

// ── Phone validation (Kenya) ──────────────────────────────────
function validKEPhone(v) { return /^(0|254|\+254)[17]\d{8}$/.test(v.replace(/\s/g,'')); }

// ── Checkout form ─────────────────────────────────────────────
const checkoutForm = document.getElementById('checkout-form');
if (checkoutForm) {
  checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const phone = this.querySelector('[name="phone"]').value;
    if (!validKEPhone(phone)) { lxToast('Enter a valid Kenyan phone number', 'error'); return; }
    const btn = this.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing…';
    setTimeout(() => { window.location.href = 'mpesa.html'; }, 1800);
  });
}

// ── M-Pesa polling mock ───────────────────────────────────────
if (document.getElementById('mpesa-status')) {
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (attempts >= 5) { // simulate success after ~25s for demo
      clearInterval(interval);
      document.getElementById('mpesa-status').innerHTML = `
        <div class="lx-alert lx-alert-success"><i class="fas fa-check-circle"></i> Payment confirmed! Redirecting…</div>`;
      setTimeout(() => { window.location.href = 'payment-success.html'; }, 1500);
    }
  }, 5000);
}

// ── Password toggle ───────────────────────────────────────────
document.querySelectorAll('[data-toggle-pwd]').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.togglePwd);
    const icon = btn.querySelector('i');
    if (input.type === 'password') { input.type = 'text'; icon.className = 'fas fa-eye-slash'; }
    else { input.type = 'password'; icon.className = 'fas fa-eye'; }
  });
});

// ── Register form validation ──────────────────────────────────
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    const p = this.querySelector('[name="password"]').value;
    const c = this.querySelector('[name="confirm"]').value;
    if (p !== c) { e.preventDefault(); lxToast('Passwords do not match', 'error'); return; }
    if (p.length < 8) { e.preventDefault(); lxToast('Password must be at least 8 characters', 'error'); return; }
  });
}

// ── Admin: product table search ───────────────────────────────
const adminSearch = document.getElementById('admin-search');
if (adminSearch) {
  adminSearch.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    document.querySelectorAll('#admin-table tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// ── Init on DOMContentLoaded ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('lx-page-fade');
  updateCartBadge();
  renderCartPage();
  renderCheckoutSummary();
});
