import './style.css';
// 1. Impor Supabase
import { createClient } from '@supabase/supabase-js';

// 2. Koneksi ke Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Variabel global
let allProducts = []; // Akan diisi dari Supabase
let selectedProduct = null;
const whatsappNumber = '6281234567890';

// --- FUNGSI UNTUK MODAL PEMESANAN ---

function openOrderModal(product) {
  selectedProduct = product;
  const modal = document.getElementById('order-modal');
  const productInfo = document.getElementById('modal-product-info');

  productInfo.innerHTML = `
    <div class="modal-product-name">${product.name}</div>
    <div class="modal-product-price">${formatPrice(product.price)}</div>
  `;

  document.getElementById('quantity').value = 1;
  updateOrderTotal();
  modal.classList.add('active');
}

function closeOrderModal() {
  const modal = document.getElementById('order-modal');
  modal.classList.remove('active');
  document.getElementById('order-form').reset();
  selectedProduct = null;
}

function updateOrderTotal() {
  if (!selectedProduct) return;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const total = selectedProduct.price * quantity;
  document.getElementById('order-total').textContent = formatPrice(total);
}

function submitOrder(e) {
  e.preventDefault();
  if (!selectedProduct) return;

  const customerName = document.getElementById('customer-name').value;
  const customerEmail = document.getElementById('customer-email').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const customerAddress = document.getElementById('customer-address').value;
  const quantity = document.getElementById('quantity').value;
  const notes = document.getElementById('order-notes').value;
  const total = selectedProduct.price * parseInt(quantity);

  const message = `Halo Ether Craft, saya ingin memesan:\n\n` +
                  `*Produk:* ${selectedProduct.name}\n` +
                  `*Jumlah:* ${quantity}\n` +
                  `*Total Harga:* ${formatPrice(total)}\n\n` +
                  `*Detail Penerima:*\n` +
                  `Nama: ${customerName}\n` +
                  `Email: ${customerEmail}\n` +
                  `Telepon: ${customerPhone}\n` +
                  `Alamat: ${customerAddress}\n\n` +
                  `*Catatan:* ${notes || '-'}\n\n` +
                  `Mohon diproses, terima kasih!`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  closeOrderModal();
}

function setupModal() {
  const modal = document.getElementById('order-modal');
  if (!modal) return;

  const closeBtn = document.querySelector('.modal-close');
  closeBtn.addEventListener('click', closeOrderModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeOrderModal();
    }
  });

  document.getElementById('quantity').addEventListener('input', updateOrderTotal);
  document.getElementById('order-form').addEventListener('submit', submitOrder);
}


// --- FUNGSI UNTUK MENAMPILKAN PRODUK DI HOME ---

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(price);
}

function createProductCard(product) {
  return `
    <div class="product-card" data-category="${product.category}">
      <img src="${product.image_url}" alt="${product.name}" class="product-image" />
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(product.price)}</span>
          <span class="product-stock">Stock: ${product.stock}</span>
        </div>
        <button class="btn btn-primary order-btn" 
                data-product-id="${product.id}" 
                ${product.stock === 0 ? 'disabled' : ''}>
          ${product.stock === 0 ? 'Out of Stock' : 'Order Now'}
        </button>
      </div>
    </div>
  `;
}

// Fungsi ini akan dijalankan setelah data dari Supabase dimuat
function displayHomepageProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Logika untuk memilih 6 produk
  const keyboards = allProducts.filter(p => p.category === 'keyboards').slice(0, 2);
  const keycaps = allProducts.filter(p => p.category === 'keycaps').slice(0, 2);
  const switches = allProducts.filter(p => p.category === 'switches').slice(0, 1);
  const stabilizers = allProducts.filter(p => p.category === 'stabilizers').slice(0, 1);

  const productsToDisplay = [...keyboards, ...keycaps, ...switches, ...stabilizers];

  if (productsToDisplay.length === 0) {
    grid.innerHTML = '<div class="loading">No products to display.</div>';
    return;
  }

  grid.innerHTML = productsToDisplay.map(product => createProductCard(product)).join('');

  // Tambahkan event listener ke tombol "Order Now"
  document.querySelectorAll('#products-grid .order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      const product = allProducts.find(p => p.id === productId);
      if (product) {
        openOrderModal(product);
      }
    });
  });
}

// --- FUNGSI SETUP LAINNYA ---

function setupNavigation() {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
  document.querySelectorAll('.nav-menu a').forEach(link => {
    if (link.pathname === window.location.pathname || (window.location.pathname === '/' && (link.pathname === '/index.html' || link.pathname === '/'))) {
      link.classList.add('active');
    }
  });
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 70;
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

function setupCustomBuildButton() {
  const customBuildBtn = document.getElementById('custom-build-btn');
  if (customBuildBtn) {
    const message = 'Hello! I am interested in your custom keyboard build service.';
    customBuildBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
}

// --- INISIALISASI ---

async function loadData() {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    allProducts = data; 
    displayHomepageProducts(); 
  } catch (error) {
    console.error('Error loading products:', error);
    const grid = document.getElementById('products-grid');
    if (grid) {
      grid.innerHTML = '<div class="loading">Failed to load products. Please try again later.</div>';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupCustomBuildButton();
  setupModal();
  loadData(); 
});