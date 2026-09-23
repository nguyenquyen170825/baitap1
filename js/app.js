document.addEventListener('DOMContentLoaded', () => {
  let currentCategory = 'Tất cả';
  let searchQuery = '';

  const categoryListContainer = document.getElementById('category-list');
  const productsGridContainer = document.getElementById('products-grid');
  const partnerRowContainer = document.getElementById('partners-row');
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');

  // Format currency: 500000 -> 500.000đ
  function formatCurrency(amount) {
    if (!amount && amount !== 0) return '';
    return amount.toLocaleString('vi-VN') + 'đ';
  }

  // Load Categories
  async function loadCategories() {
    try {
      const response = await fetch('/api/categories');
      const categories = await response.json();

      categoryListContainer.innerHTML = categories.map(cat => `
        <li class="category-item ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">
          <a href="#" class="category-link">${cat}</a>
        </li>
      `).join('');

      // Add click listener
      document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const selectedCat = item.getAttribute('data-category');
          if (selectedCat !== currentCategory) {
            currentCategory = selectedCat;
            document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            loadProducts();
          }
        });
      });
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  // Load Products
  async function loadProducts() {
    productsGridContainer.innerHTML = '<div class="loading-spinner">Đang tải sản phẩm...</div>';

    try {
      const url = new URL('/api/products', window.location.origin);
      if (currentCategory && currentCategory !== 'Tất cả') {
        url.searchParams.append('category', currentCategory);
      }
      if (searchQuery) {
        url.searchParams.append('q', searchQuery);
      }

      const response = await fetch(url);
      const products = await response.json();

      if (products.length === 0) {
        productsGridContainer.innerHTML = `
          <div class="loading-spinner" style="grid-column: 1 / -1;">
            Không tìm thấy sản phẩm nào phù hợp.
          </div>`;
        return;
      }

      productsGridContainer.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
          ${product.discount ? `<span class="product-badge ${product.badgeType || 'discount'}">${product.discount}</span>` : ''}
          <div class="product-img-wrapper">
            <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy" />
          </div>
          <div class="product-info">
            <h3 class="product-title" title="${product.name}">${product.name}</h3>
            <div class="product-price-box">
              <span class="price-current">${formatCurrency(product.price)}</span>
              ${product.oldPrice ? `<span class="price-old">${formatCurrency(product.oldPrice)}</span>` : ''}
            </div>
          </div>
        </div>
      `).join('');

    } catch (err) {
      console.error('Failed to load products:', err);
      productsGridContainer.innerHTML = '<div class="loading-spinner">Lỗi khi tải dữ liệu sản phẩm.</div>';
    }
  }

  // Load Partner Logos
  async function loadPartners() {
    try {
      const response = await fetch('/api/partners');
      const partners = await response.json();

      partnerRowContainer.innerHTML = partners.map(p => `
        <div class="partner-item" title="${p.name}">
          <img src="${p.logo}" alt="${p.name}" />
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load partners:', err);
    }
  }

  // Handle Search Form
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      searchQuery = searchInput.value.trim();
      // Reset category selection when typing search query to search across all products
      if (searchQuery && currentCategory !== 'Tất cả') {
        currentCategory = 'Tất cả';
        document.querySelectorAll('.category-item').forEach(el => {
          if (el.getAttribute('data-category') === 'Tất cả') {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        });
      }
      loadProducts();
    });
  }

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value.trim();
        if (searchQuery && currentCategory !== 'Tất cả') {
          currentCategory = 'Tất cả';
          document.querySelectorAll('.category-item').forEach(el => {
            if (el.getAttribute('data-category') === 'Tất cả') {
              el.classList.add('active');
            } else {
              el.classList.remove('active');
            }
          });
        }
        loadProducts();
      }, 300);
    });
  }

  // Initial Load
  loadCategories();
  loadProducts();
  loadPartners();
});
