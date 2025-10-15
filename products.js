import './style.css';
// 1. Impor Supabase
import { createClient } from '@supabase/supabase-js';

// 2. Koneksi ke Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Variabel global
let allProducts = [];
let filteredProducts = [];
let currentFilter = 'all';
let currentSort = 'newest';
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

// --- FUNGSI UNTUK HALAMAN PRODUK ---

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

function displayProducts(products) {
  const grid = document.getElementById('products-grid');
  const countText = document.getElementById('product-count-text');
  if (!grid || !countText) return;

  if (products.length === 0) {
    grid.innerHTML = '<div class="loading">No products found in this category.</div>';
    countText.textContent = '0 products';
    return;
  }

  countText.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
  grid.innerHTML = products.map(product => createProductCard(product)).join('');

  document.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      const product = allProducts.find(p => p.id === productId);
      if (product) {
        openOrderModal(product);
      }
    });
  });
}

function filterProducts(category) {
  currentFilter = category;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  const activeButton = document.querySelector(`[data-filter="${category}"]`);
  if (activeButton) activeButton.classList.add('active');
  filteredProducts = category === 'all' ? [...allProducts] : allProducts.filter(p => p.category === category);
  sortProducts(currentSort);
}

function sortProducts(sortBy) {
  currentSort = sortBy;
  let sorted = [...filteredProducts];
  switch (sortBy) {
    case 'price-low': sorted.sort((a, b) => a.price - b.price); break;
    case 'price-high': sorted.sort((a, b) => b.price - a.price); break;
    case 'name': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
  }
  displayProducts(sorted);
}

function setupNavigation() {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
  }
}

function setupProductPage() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.hash = btn.dataset.filter;
    });
  });
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => sortProducts(e.target.value));
  }
}

// --- INISIALISASI ---

async function loadAllProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    allProducts = data;
    
    handleHashChange();
  } catch (error) {
    console.error('Error loading products:', error);
    const grid = document.getElementById('products-grid');
    if (grid) {
      grid.innerHTML = '<div class="loading">Failed to load products. Please try again later.</div>';
    }
  }
}

const handleHashChange = () => {
  const category = window.location.hash.substring(1) || 'all';
  const validCategories = ['all', 'keyboards', 'keycaps', 'switches', 'stabilizers'];

  if (validCategories.includes(category)) {
    filterProducts(category);
  } else {
    filterProducts('all');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupProductPage();
  setupModal();
  loadAllProducts(); 
  
  window.addEventListener('hashchange', handleHashChange);
});