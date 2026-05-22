// 共享逻辑：登录态、购物车、书籍数据加载、UI 渲染辅助
// 案例 app 故意保持简单：状态全部存 localStorage，无后端。

function requireLogin() {
  const user = localStorage.getItem('user');
  if (!user) {
    location.href = '/login.html';
  }
}

function renderTopbar() {
  const welcome = document.getElementById('welcome');
  const logout = document.getElementById('logout');
  const cartCount = document.getElementById('cart-count');
  const user = localStorage.getItem('user');
  if (welcome) welcome.textContent = user ? `你好，${user}` : '';
  if (logout) {
    logout.onclick = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      location.href = '/login.html';
    };
  }
  if (cartCount) {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = total;
  }
}

let _booksCache = null;
function loadBooks() {
  if (_booksCache) return Promise.resolve(_booksCache);
  return fetch('/data/books.json').then(r => r.json()).then(books => {
    _booksCache = books;
    return books;
  });
}

function bookCard(book) {
  return `
    <li>
      <a class="book-card" href="/book.html?id=${book.id}">
        <span class="cover" aria-hidden="true">${book.cover}</span>
        <h3>${book.title}</h3>
        <p class="author">${book.author}</p>
        <p class="price">¥${book.price}</p>
        ${book.discontinued ? '<p class="badge-discontinued">已下架</p>' : ''}
      </a>
    </li>
  `;
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(bookId) {
  const cart = getCart();
  const existing = cart.find(item => item.id === bookId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: bookId, qty: 1 });
  }
  saveCart(cart);
}

function updateQty(bookId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === bookId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    saveCart(cart.filter(i => i.id !== bookId));
  } else {
    saveCart(cart);
  }
}

function removeFromCart(bookId) {
  saveCart(getCart().filter(i => i.id !== bookId));
}

function clearCart() {
  localStorage.removeItem('cart');
}
