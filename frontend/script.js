/* ==============================================
   app.js — Library Book Reservation System
   Client-side SPA logic
   ============================================== */

const API = '/api';
const app = { user: null, token: null };

// ---- Auth helpers ----
function saveAuth(data) {
  app.user = { _id: data._id, name: data.name, email: data.email, role: data.role };
  app.token = data.token;
  localStorage.setItem('auth', JSON.stringify({ user: app.user, token: app.token }));
}
function loadAuth() {
  const saved = localStorage.getItem('auth');
  if (saved) { const d = JSON.parse(saved); app.user = d.user; app.token = d.token; }
}
function logout() {
  app.user = null; app.token = null;
  localStorage.removeItem('auth');
  navigate('landing');
}
function isLoggedIn() { return !!app.token; }

// ---- API fetch wrapper ----
async function apiCall(endpoint, { method = 'GET', body = null, query = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (app.token) headers['Authorization'] = 'Bearer ' + app.token;
  let url = API + endpoint;
  if (query) { const q = new URLSearchParams(query); url += '?' + q.toString(); }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// ---- Toast notifications ----
function toast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) { container = document.createElement('div'); container.id = 'toast-container'; container.className = 'toast-container'; document.body.appendChild(container); }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  el.innerHTML = '<span>' + (icons[type] || '') + '</span><span>' + msg + '</span>';
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ---- Confirm dialog ----
function confirmAction(title, message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <div class="confirm-icon">⚠️</div>
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="confirm-actions">
          <button class="btn btn-ghost" id="confirmCancel">Cancel</button>
          <button class="btn btn-danger" id="confirmOk">Confirm</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#confirmOk').onclick = () => { overlay.remove(); resolve(true); };
    overlay.querySelector('#confirmCancel').onclick = () => { overlay.remove(); resolve(false); };
  });
}

// ---- Date formatting ----
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
function isOverdue(dueDate) { return dueDate && new Date(dueDate) < new Date(); }

// ---- Navigation / Routing ----
function navigate(page) { window.location.hash = '#' + page; }

const routes = {
  landing: renderLanding,
  login: renderLogin,
  register: renderRegister,
  'student-dashboard': renderStudentDashboard,
  'student-books': renderStudentBooks,
  'student-reservations': renderStudentReservations,
  'librarian-dashboard': renderLibrarianDashboard,
  'librarian-books': renderLibrarianBooks,
  'librarian-reservations': renderLibrarianReservations,
  'librarian-reports': renderLibrarianReports,
};

function router() {
  loadAuth();
  const hash = window.location.hash.replace('#', '') || 'landing';
  const root = document.getElementById('root');
  if (routes[hash]) {
    routes[hash](root);
  } else {
    root.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>Page not found</p></div>';
  }
}
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// ===========================================================
// PAGES
// ===========================================================

// ---- LANDING PAGE ----
function renderLanding(root) {
  root.innerHTML = `
  <div class="landing">
    <nav class="landing-nav">
      <div class="logo"><span>📚</span> LibraryHub</div>
      <div class="nav-btns">
        <a href="#login" class="btn btn-outline">Login</a>
        <a href="#register" class="btn btn-primary">Get Started</a>
      </div>
    </nav>
    <div class="landing-hero">
      <h1>Smart Library<br>Book Reservation</h1>
      <p>A modern platform for students to discover, reserve, and manage library books — and for librarians to efficiently track inventory and issues.</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
        <a href="#register" class="btn btn-primary btn-lg">Register as Student</a>
        <a href="#login" class="btn btn-outline btn-lg">Login</a>
      </div>
      <div class="landing-features">
        <div class="feature-card"><div class="icon">🔍</div><h3>Search & Discover</h3><p>Find books by title, author, or category instantly.</p></div>
        <div class="feature-card"><div class="icon">📋</div><h3>Easy Reservations</h3><p>Reserve books online with real-time availability tracking.</p></div>
        <div class="feature-card"><div class="icon">📊</div><h3>Admin Dashboard</h3><p>Manage inventory, approve requests, and track statistics.</p></div>
      </div>
    </div>
  </div>`;
}

// ---- LOGIN ----
function renderLogin(root) {
  root.innerHTML = `
  <div class="auth-page">
    <div class="auth-card">
      <div class="logo-auth">📚</div>
      <h2>Welcome Back</h2>
      <p class="subtitle">Sign in to your account</p>
      <form id="loginForm">
        <div class="form-group"><label>Email Address</label><input type="email" id="loginEmail" required placeholder="you@example.com"></div>
        <div class="form-group"><label>Password</label><input type="password" id="loginPass" required placeholder="Enter your password" minlength="6"></div>
        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;" id="loginBtn">Sign In</button>
      </form>
      <p style="text-align:center;margin-top:20px;color:var(--text-light);font-size:0.9rem;">
        Don't have an account? <a href="#register">Register here</a>
      </p>
      <div style="margin-top:18px;padding:14px;background:var(--secondary);border-radius:8px;font-size:0.82rem;color:var(--text-light);">
        <strong>Demo Accounts:</strong><br>
        Librarian: admin@library.com / admin123<br>
        Student: student@library.com / student123
      </div>
    </div>
  </div>`;
  document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Signing in...';
    try {
      const data = await apiCall('/auth/login', { method: 'POST', body: { email: document.getElementById('loginEmail').value, password: document.getElementById('loginPass').value } });
      saveAuth(data);
      toast('Welcome back, ' + data.name + '!');
      navigate(data.role === 'librarian' ? 'librarian-dashboard' : 'student-dashboard');
    } catch (err) { toast(err.message, 'error'); }
    btn.disabled = false; btn.textContent = 'Sign In';
  };
}

// ---- REGISTER ----
function renderRegister(root) {
  root.innerHTML = `
  <div class="auth-page">
    <div class="auth-card">
      <div class="logo-auth">📚</div>
      <h2>Create Account</h2>
      <p class="subtitle">Join the library today</p>
      <form id="regForm">
        <div class="form-group"><label>Full Name</label><input type="text" id="regName" required placeholder="Your name"></div>
        <div class="form-group"><label>Email Address</label><input type="email" id="regEmail" required placeholder="you@example.com"></div>
        <div class="form-group"><label>Password</label><input type="password" id="regPass" required placeholder="Minimum 6 characters" minlength="6"></div>
        <div class="form-group"><label>Contact Number</label><input type="text" id="regContact" placeholder="Optional"></div>
        <div class="form-group"><label>Register as</label>
          <select id="regRole"><option value="student">Student</option><option value="librarian">Librarian (Admin)</option></select>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;" id="regBtn">Create Account</button>
      </form>
      <p style="text-align:center;margin-top:20px;color:var(--text-light);font-size:0.9rem;">Already have an account? <a href="#login">Sign In</a></p>
    </div>
  </div>`;
  document.getElementById('regForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('regBtn');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Creating...';
    try {
      const data = await apiCall('/auth/register', { method: 'POST', body: {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPass').value,
        contact: document.getElementById('regContact').value,
        role: document.getElementById('regRole').value,
      }});
      saveAuth(data);
      toast('Account created successfully!');
      navigate(data.role === 'librarian' ? 'librarian-dashboard' : 'student-dashboard');
    } catch (err) { toast(err.message, 'error'); }
    btn.disabled = false; btn.textContent = 'Create Account';
  };
}

// ===========================================================
// STUDENT PAGES
// ===========================================================

function studentLayout(root, activeNav, content) {
  if (!isLoggedIn() || app.user.role !== 'student') { navigate('login'); return; }
  root.innerHTML = `
  <div class="dashboard">
    <nav class="sidebar">
      <div class="sidebar-header"><span class="logo-icon">📚</span><h2>LibraryHub</h2></div>
      <div class="sidebar-nav">
        <a href="#student-dashboard" class="${activeNav==='dashboard'?'active':''}"><span class="nav-icon">📊</span> Dashboard</a>
        <a href="#student-books" class="${activeNav==='books'?'active':''}"><span class="nav-icon">📖</span> Browse Books</a>
        <a href="#student-reservations" class="${activeNav==='reservations'?'active':''}"><span class="nav-icon">📋</span> My Reservations</a>
      </div>
      <div class="sidebar-footer">
        <div class="avatar">${app.user.name.charAt(0).toUpperCase()}</div>
        <div class="user-info"><div class="name">${app.user.name}</div><div class="role">${app.user.role}</div></div>
      </div>
    </nav>
    <div class="main-content">
      <div class="topbar">
        <h1 id="pageTitle"></h1>
        <div class="topbar-right"><button class="btn btn-ghost btn-sm" onclick="logout()">🚪 Logout</button></div>
      </div>
      <div class="page-content" id="pageContent"></div>
    </div>
  </div>`;
  content();
}

// ---- STUDENT DASHBOARD ----
function renderStudentDashboard(root) {
  studentLayout(root, 'dashboard', async () => {
    document.getElementById('pageTitle').textContent = 'Dashboard';
    const pc = document.getElementById('pageContent');
    pc.innerHTML = '<div class="page-loader"><div class="spinner spinner-dark" style="width:36px;height:36px;"></div></div>';
    try {
      const [books, reservations] = await Promise.all([apiCall('/books'), apiCall('/reservations/my')]);
      const pending = reservations.filter(r => r.status === 'Pending').length;
      const approved = reservations.filter(r => r.status === 'Approved').length;
      const issued = reservations.filter(r => r.status === 'Issued').length;
      const overdue = reservations.filter(r => r.status === 'Issued' && isOverdue(r.dueDate)).length;
      const totalAvail = books.reduce((s, b) => s + b.availableQuantity, 0);

      pc.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-icon blue">📖</div><div class="stat-info"><h3>${totalAvail}</h3><p>Available Books</p></div></div>
          <div class="stat-card"><div class="stat-icon yellow">⏳</div><div class="stat-info"><h3>${pending}</h3><p>Pending Reservations</p></div></div>
          <div class="stat-card"><div class="stat-icon green">✓</div><div class="stat-info"><h3>${approved}</h3><p>Approved</p></div></div>
          <div class="stat-card"><div class="stat-icon red">📕</div><div class="stat-info"><h3>${issued}</h3><p>Books With Me</p></div></div>
          ${overdue > 0 ? `<div class="stat-card"><div class="stat-icon red">⚠️</div><div class="stat-info"><h3>${overdue}</h3><p>Overdue!</p></div></div>` : ''}
        </div>

        <div class="section-card">
          <div class="section-header"><h2>📖 Recently Added Books</h2><a href="#student-books" class="btn btn-primary btn-sm">View All</a></div>
          <div class="section-body"><div class="books-grid" id="recentBooks"></div></div>
        </div>

        ${issued > 0 ? `
        <div class="section-card">
          <div class="section-header"><h2>📕 My Issued Books</h2></div>
          <div class="section-body"><div class="table-responsive"><table><thead><tr><th>Book</th><th>Issued On</th><th>Due Date</th><th>Status</th></tr></thead><tbody id="issuedTable"></tbody></table></div></div>
        </div>` : ''}
      `;

      // Recent books (first 6)
      const grid = document.getElementById('recentBooks');
      books.slice(0, 6).forEach(b => grid.appendChild(createBookCard(b, true)));

      // Issued table
      if (issued > 0) {
        const tbody = document.getElementById('issuedTable');
        reservations.filter(r => r.status === 'Issued').forEach(r => {
          const od = isOverdue(r.dueDate);
          const row = document.createElement('tr');
          row.innerHTML = `<td><strong>${r.bookId?.title || 'Unknown'}</strong></td><td>${fmtDate(r.issuedDate)}</td><td>${fmtDate(r.dueDate)}</td><td>${od ? '<span class="badge badge-overdue">⚠ Overdue</span>' : '<span class="badge badge-issued">Active</span>'}</td>`;
          tbody.appendChild(row);
        });
      }
    } catch (e) { pc.innerHTML = '<p style="color:red;">' + e.message + '</p>'; }
  });
}

function createBookCard(book, showReserve) {
  const card = document.createElement('div');
  card.className = 'book-card';
  const avail = book.availableQuantity > 0;
  card.innerHTML = `
    <div class="book-card-img">${book.coverImage ? `<img src="${book.coverImage}" alt="${book.title}" onerror="this.parentElement.innerHTML='<div class=placeholder>📖</div>'">` : '<div class="placeholder">📖</div>'}</div>
    <div class="book-card-body">
      <h3>${book.title}</h3>
      <div class="author">by ${book.author}</div>
      <div class="meta">
        ${book.category ? `<span class="category-tag">${book.category}</span>` : ''}
        <span class="qty">${book.availableQuantity}/${book.quantity} available</span>
      </div>
    </div>
    <div class="book-card-footer">
      <span class="badge ${avail ? 'badge-available' : 'badge-danger'}">${avail ? '● Available' : '● Unavailable'}</span>
      ${showReserve ? `<button class="btn btn-primary btn-sm reserve-btn" data-id="${book._id}" ${!avail ? 'disabled' : ''}>Reserve</button>` : ''}
    </div>`;
  if (showReserve) {
    card.querySelector('.reserve-btn')?.addEventListener('click', async (e) => {
      const btn = e.target; btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
      try { await apiCall('/reservations', { method: 'POST', body: { bookId: book._id } }); toast('Reservation placed! Status: Pending'); router(); }
      catch (err) { toast(err.message, 'error'); btn.disabled = false; btn.textContent = 'Reserve'; }
    });
  }
  return card;
}

// ---- STUDENT BOOKS ----
function renderStudentBooks(root) {
  studentLayout(root, 'books', async () => {
    document.getElementById('pageTitle').textContent = 'Browse Books';
    const pc = document.getElementById('pageContent');
    pc.innerHTML = `
      <div class="filter-bar">
        <div class="search-box"><span class="search-icon">🔍</span><input type="text" id="searchInput" placeholder="Search by title, author, or ISBN..."></div>
        <select class="filter-select" id="catFilter"><option value="All">All Categories</option></select>
        <select class="filter-select" id="statusFilter"><option value="All">All Status</option><option value="Available">Available</option></select>
      </div>
      <div class="books-grid" id="booksGrid"></div>
    `;
    let allBooks = [];
    const render = () => {
      const search = document.getElementById('searchInput').value.toLowerCase();
      const cat = document.getElementById('catFilter').value;
      const status = document.getElementById('statusFilter').value;
      let filtered = allBooks;
      if (search) filtered = filtered.filter(b => b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search) || (b.isbn || '').toLowerCase().includes(search));
      if (cat !== 'All') filtered = filtered.filter(b => b.category === cat);
      if (status === 'Available') filtered = filtered.filter(b => b.availableQuantity > 0);
      const grid = document.getElementById('booksGrid');
      grid.innerHTML = '';
      if (!filtered.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><p>No books found</p></div>'; return; }
      filtered.forEach(b => grid.appendChild(createBookCard(b, true)));
    };
    try {
      allBooks = await apiCall('/books');
      const cats = [...new Set(allBooks.map(b => b.category).filter(Boolean))];
      const catSel = document.getElementById('catFilter');
      cats.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; catSel.appendChild(o); });
      render();
      document.getElementById('searchInput').addEventListener('input', render);
      document.getElementById('catFilter').addEventListener('change', render);
      document.getElementById('statusFilter').addEventListener('change', render);
    } catch (e) { pc.innerHTML = '<p style="color:red;">' + e.message + '</p>'; }
  });
}

// ---- STUDENT RESERVATIONS ----
function renderStudentReservations(root) {
  studentLayout(root, 'reservations', async () => {
    document.getElementById('pageTitle').textContent = 'My Reservations';
    const pc = document.getElementById('pageContent');
    pc.innerHTML = '<div class="page-loader"><div class="spinner spinner-dark" style="width:36px;height:36px;"></div></div>';
    try {
      const list = await apiCall('/reservations/my');
      if (!list.length) { pc.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No reservations yet. <a href="#student-books">Browse books</a> to get started!</p></div>'; return; }
      pc.innerHTML = `
        <div class="section-card"><div class="section-header"><h2>All Reservations (${list.length})</h2></div>
          <div class="section-body"><div class="table-responsive"><table><thead><tr>
            <th>Book</th><th>Reserved On</th><th>Status</th><th>Due Date</th><th>Actions</th>
          </tr></thead><tbody id="resTable"></tbody></table></div></div>
        </div>`;
      const tbody = document.getElementById('resTable');
      list.forEach(r => {
        const od = r.status === 'Issued' && isOverdue(r.dueDate);
        const badgeClass = { Pending: 'badge-pending', Approved: 'badge-approved', Rejected: 'badge-rejected', Issued: 'badge-issued', Returned: 'badge-returned' }[r.status] || 'badge-info';
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${r.bookId?.title || 'Unknown'}</strong><br><small style="color:var(--text-light)">${r.bookId?.author || ''}</small></td>
          <td>${fmtDate(r.reservationDate)}</td>
          <td><span class="badge ${badgeClass}">${r.status}</span>${od ? ' <span class="badge badge-overdue">Overdue</span>' : ''}</td>
          <td>${fmtDate(r.dueDate)}</td>
          <td>${r.status === 'Pending' ? `<button class="btn btn-danger btn-sm cancel-btn" data-id="${r._id}">Cancel</button>` : '—'}</td>`;
        tbody.appendChild(row);
      });
      document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const ok = await confirmAction('Cancel Reservation', 'Are you sure you want to cancel this reservation?');
          if (!ok) return;
          try { await apiCall('/reservations/' + btn.dataset.id, { method: 'DELETE' }); toast('Reservation cancelled'); router(); }
          catch (e) { toast(e.message, 'error'); }
        });
      });
    } catch (e) { pc.innerHTML = '<p style="color:red;">' + e.message + '</p>'; }
  });
}

// ===========================================================
// LIBRARIAN PAGES
// ===========================================================

function librarianLayout(root, activeNav, content) {
  if (!isLoggedIn() || app.user.role !== 'librarian') { navigate('login'); return; }
  root.innerHTML = `
  <div class="dashboard">
    <nav class="sidebar">
      <div class="sidebar-header"><span class="logo-icon">📚</span><h2>LibraryHub<br><small style="font-size:0.7rem;opacity:0.6;">Admin Panel</small></h2></div>
      <div class="sidebar-nav">
        <a href="#librarian-dashboard" class="${activeNav==='dashboard'?'active':''}"><span class="nav-icon">📊</span> Dashboard</a>
        <a href="#librarian-books" class="${activeNav==='books'?'active':''}"><span class="nav-icon">📖</span> Manage Books</a>
        <a href="#librarian-reservations" class="${activeNav==='reservations'?'active':''}"><span class="nav-icon">📋</span> Reservations</a>
        <a href="#librarian-reports" class="${activeNav==='reports'?'active':''}"><span class="nav-icon">📈</span> Reports</a>
      </div>
      <div class="sidebar-footer">
        <div class="avatar">${app.user.name.charAt(0).toUpperCase()}</div>
        <div class="user-info"><div class="name">${app.user.name}</div><div class="role">Administrator</div></div>
      </div>
    </nav>
    <div class="main-content">
      <div class="topbar">
        <h1 id="pageTitle"></h1>
        <div class="topbar-right"><button class="btn btn-ghost btn-sm" onclick="logout()">🚪 Logout</button></div>
      </div>
      <div class="page-content" id="pageContent"></div>
    </div>
  </div>
  <div class="modal-overlay" id="modalOverlay"><div class="modal" id="modalBox"></div></div>`;
  content();
}

// ---- LIBRARIAN DASHBOARD ----
function renderLibrarianDashboard(root) {
  librarianLayout(root, 'dashboard', async () => {
    document.getElementById('pageTitle').textContent = 'Dashboard';
    const pc = document.getElementById('pageContent');
    pc.innerHTML = '<div class="page-loader"><div class="spinner spinner-dark" style="width:36px;height:36px;"></div></div>';
    try {
      const [stats, reservations] = await Promise.all([apiCall('/reports'), apiCall('/reservations')]);
      const pending = reservations.filter(r => r.status === 'Pending');
      const overdueList = reservations.filter(r => r.status === 'Issued' && isOverdue(r.dueDate));
      pc.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-icon blue">📖</div><div class="stat-info"><h3>${stats.totalBooks}</h3><p>Total Books</p></div></div>
          <div class="stat-card"><div class="stat-icon green">👥</div><div class="stat-info"><h3>${stats.totalStudents}</h3><p>Students</p></div></div>
          <div class="stat-card"><div class="stat-icon yellow">⏳</div><div class="stat-info"><h3>${stats.pendingReservations}</h3><p>Pending Requests</p></div></div>
          <div class="stat-card"><div class="stat-icon blue">📕</div><div class="stat-info"><h3>${stats.activeIssues}</h3><p>Active Issues</p></div></div>
          <div class="stat-card"><div class="stat-icon red">⚠️</div><div class="stat-info"><h3>${stats.overdueReturns}</h3><p>Overdue Returns</p></div></div>
          <div class="stat-card"><div class="stat-icon green">📗</div><div class="stat-info"><h3>${stats.booksIssuedToday}</h3><p>Issued Today</p></div></div>
        </div>

        ${pending.length ? `
        <div class="section-card">
          <div class="section-header"><h2>⏳ Pending Reservations (${pending.length})</h2><a href="#librarian-reservations" class="btn btn-primary btn-sm">View All</a></div>
          <div class="section-body"><div class="table-responsive"><table><thead><tr><th>Student</th><th>Book</th><th>Date</th><th>Actions</th></tr></thead><tbody id="pendingTable"></tbody></table></div></div>
        </div>` : ''}

        ${overdueList.length ? `
        <div class="section-card">
          <div class="section-header"><h2>⚠️ Overdue Books (${overdueList.length})</h2></div>
          <div class="section-body"><div class="table-responsive"><table><thead><tr><th>Student</th><th>Book</th><th>Due Date</th><th>Days Overdue</th></tr></thead><tbody id="overdueTable"></tbody></table></div></div>
        </div>` : ''}
      `;

      if (pending.length) {
        const tb = document.getElementById('pendingTable');
        pending.slice(0, 5).forEach(r => {
          const row = document.createElement('tr');
          row.innerHTML = `<td>${r.studentId?.name || '?'}<br><small style="color:var(--text-light)">${r.studentId?.email || ''}</small></td><td><strong>${r.bookId?.title || '?'}</strong></td><td>${fmtDate(r.reservationDate)}</td>
          <td><button class="btn btn-success btn-sm approve-btn" data-id="${r._id}">✓ Approve</button> <button class="btn btn-danger btn-sm reject-btn" data-id="${r._id}">✕ Reject</button></td>`;
          tb.appendChild(row);
        });
        attachReservationActions();
      }
      if (overdueList.length) {
        const ob = document.getElementById('overdueTable');
        overdueList.forEach(r => {
          const days = Math.ceil((Date.now() - new Date(r.dueDate).getTime()) / 86400000);
          const row = document.createElement('tr');
          row.innerHTML = `<td>${r.studentId?.name || '?'}</td><td>${r.bookId?.title || '?'}</td><td>${fmtDate(r.dueDate)}</td><td><span class="badge badge-overdue">${days} day${days>1?'s':''}</span></td>`;
          ob.appendChild(row);
        });
      }
    } catch (e) { pc.innerHTML = '<p style="color:red;">' + e.message + '</p>'; }
  });
}

function attachReservationActions() {
  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
      try { await apiCall('/reservations/' + btn.dataset.id + '/status', { method: 'PUT', body: { status: 'Approved' } }); toast('Reservation approved'); router(); }
      catch (e) { toast(e.message, 'error'); btn.disabled = false; btn.textContent = '✓ Approve'; }
    });
  });
  document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await confirmAction('Reject Reservation', 'Are you sure you want to reject this reservation?');
      if (!ok) return;
      try { await apiCall('/reservations/' + btn.dataset.id + '/status', { method: 'PUT', body: { status: 'Rejected' } }); toast('Reservation rejected'); router(); }
      catch (e) { toast(e.message, 'error'); }
    });
  });
  document.querySelectorAll('.issue-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
      try { await apiCall('/reservations/' + btn.dataset.id + '/issue', { method: 'PUT' }); toast('Book issued! Due in 7 days.'); router(); }
      catch (e) { toast(e.message, 'error'); btn.disabled = false; btn.textContent = '📤 Issue'; }
    });
  });
  document.querySelectorAll('.return-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await confirmAction('Return Book', 'Confirm this book has been returned?');
      if (!ok) return;
      try { await apiCall('/reservations/' + btn.dataset.id + '/return', { method: 'PUT' }); toast('Book returned successfully'); router(); }
      catch (e) { toast(e.message, 'error'); }
    });
  });
}

// ---- LIBRARIAN BOOKS ----
function renderLibrarianBooks(root) {
  librarianLayout(root, 'books', async () => {
    document.getElementById('pageTitle').textContent = 'Manage Books';
    const pc = document.getElementById('pageContent');

    const renderPage = async () => {
      pc.innerHTML = '<div class="page-loader"><div class="spinner spinner-dark" style="width:36px;height:36px;"></div></div>';
      try {
        const books = await apiCall('/books');
        pc.innerHTML = `
          <div class="filter-bar">
            <div class="search-box"><span class="search-icon">🔍</span><input type="text" id="searchInput" placeholder="Search books..."></div>
            <button class="btn btn-primary" id="addBookBtn">+ Add New Book</button>
          </div>
          <div class="section-card">
            <div class="section-body"><div class="table-responsive"><table><thead><tr>
              <th>Book</th><th>Category</th><th>ISBN</th><th>Total</th><th>Available</th><th>Status</th><th>Actions</th>
            </tr></thead><tbody id="booksTableBody"></tbody></table></div></div>
          </div>`;
        const tbody = document.getElementById('booksTableBody');
        const renderRows = (list) => {
          tbody.innerHTML = '';
          if (!list.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">No books found</td></tr>'; return; }
          list.forEach(b => {
            const row = document.createElement('tr');
            const statusBadge = b.availableQuantity > 0 ? 'badge-available' : 'badge-danger';
            row.innerHTML = `
              <td><div style="display:flex;align-items:center;gap:10px;">
                ${b.coverImage ? `<img src="${b.coverImage}" style="width:40px;height:54px;border-radius:4px;object-fit:cover;" onerror="this.style.display='none'">` : ''}
                <div><strong>${b.title}</strong><br><small style="color:var(--text-light)">${b.author}</small></div>
              </div></td>
              <td><span class="category-tag">${b.category || '—'}</span></td>
              <td style="font-size:0.82rem;">${b.isbn || '—'}</td>
              <td>${b.quantity}</td>
              <td>${b.availableQuantity}</td>
              <td><span class="badge ${statusBadge}">${b.availableQuantity > 0 ? 'Available' : 'Unavailable'}</span></td>
              <td>
                <button class="btn btn-ghost btn-sm edit-btn" data-id="${b._id}">✏️</button>
                <button class="btn btn-ghost btn-sm del-btn" data-id="${b._id}" style="color:var(--danger);">🗑️</button>
              </td>`;
            tbody.appendChild(row);
          });
          // Edit handlers
          document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openBookModal(list.find(b => b._id === btn.dataset.id)));
          });
          // Delete handlers
          document.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
              const ok = await confirmAction('Delete Book', 'This action cannot be undone. Delete this book?');
              if (!ok) return;
              try { await apiCall('/books/' + btn.dataset.id, { method: 'DELETE' }); toast('Book deleted'); renderPage(); }
              catch (e) { toast(e.message, 'error'); }
            });
          });
        };
        renderRows(books);
        document.getElementById('searchInput').addEventListener('input', (e) => {
          const s = e.target.value.toLowerCase();
          renderRows(books.filter(b => b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s)));
        });
        document.getElementById('addBookBtn').addEventListener('click', () => openBookModal(null));
      } catch (e) { pc.innerHTML = '<p style="color:red;">' + e.message + '</p>'; }
    };

    const openBookModal = (book) => {
      const overlay = document.getElementById('modalOverlay');
      const modal = document.getElementById('modalBox');
      const isEdit = !!book;
      modal.innerHTML = `
        <div class="modal-header"><h2>${isEdit ? 'Edit Book' : 'Add New Book'}</h2><button class="modal-close" id="closeModal">&times;</button></div>
        <div class="modal-body">
          <form id="bookForm">
            <div class="form-group"><label>Title *</label><input type="text" id="bTitle" required value="${isEdit ? book.title : ''}"></div>
            <div class="form-group"><label>Author *</label><input type="text" id="bAuthor" required value="${isEdit ? book.author : ''}"></div>
            <div class="form-group"><label>Category</label><input type="text" id="bCategory" value="${isEdit ? (book.category||'') : ''}" placeholder="e.g. Fiction, Science, Programming"></div>
            <div class="form-group"><label>ISBN</label><input type="text" id="bIsbn" value="${isEdit ? (book.isbn||'') : ''}"></div>
            <div class="form-group"><label>Description</label><textarea id="bDesc">${isEdit ? (book.description||'') : ''}</textarea></div>
            <div class="form-group"><label>Cover Image URL</label><input type="text" id="bCover" value="${isEdit ? (book.coverImage||'') : ''}" placeholder="https://..."></div>
            <div class="form-group"><label>Quantity *</label><input type="number" id="bQty" required min="1" value="${isEdit ? book.quantity : '1'}"></div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="cancelModal">Cancel</button>
          <button class="btn btn-primary" id="saveBook">${isEdit ? 'Update Book' : 'Add Book'}</button>
        </div>`;
      overlay.classList.add('active');
      const close = () => overlay.classList.remove('active');
      document.getElementById('closeModal').onclick = close;
      document.getElementById('cancelModal').onclick = close;
      overlay.onclick = (e) => { if (e.target === overlay) close(); };
      document.getElementById('saveBook').addEventListener('click', async () => {
        const data = {
          title: document.getElementById('bTitle').value, author: document.getElementById('bAuthor').value,
          category: document.getElementById('bCategory').value, isbn: document.getElementById('bIsbn').value,
          description: document.getElementById('bDesc').value, coverImage: document.getElementById('bCover').value,
          quantity: parseInt(document.getElementById('bQty').value) || 1,
        };
        if (!data.title || !data.author) { toast('Title and Author are required', 'error'); return; }
        const btn = document.getElementById('saveBook');
        btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Saving...';
        try {
          if (isEdit) await apiCall('/books/' + book._id, { method: 'PUT', body: data });
          else await apiCall('/books', { method: 'POST', body: data });
          toast(isEdit ? 'Book updated!' : 'Book added!');
          close(); renderPage();
        } catch (e) { toast(e.message, 'error'); btn.disabled = false; btn.textContent = isEdit ? 'Update Book' : 'Add Book'; }
      });
    };

    renderPage();
  });
}

// ---- LIBRARIAN RESERVATIONS ----
function renderLibrarianReservations(root) {
  librarianLayout(root, 'reservations', async () => {
    document.getElementById('pageTitle').textContent = 'Reservation Management';
    const pc = document.getElementById('pageContent');
    pc.innerHTML = '<div class="page-loader"><div class="spinner spinner-dark" style="width:36px;height:36px;"></div></div>';
    try {
      const list = await apiCall('/reservations');
      if (!list.length) { pc.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No reservations yet</p></div>'; return; }

      const statusTabs = ['All', 'Pending', 'Approved', 'Issued', 'Returned', 'Rejected'];
      pc.innerHTML = `
        <div class="filter-bar" style="margin-bottom:16px;">
          ${statusTabs.map(s => `<button class="btn ${s==='All'?'btn-primary':'btn-ghost'} btn-sm status-tab" data-status="${s}">${s} (${s==='All' ? list.length : list.filter(r=>r.status===s).length})</button>`).join('')}
        </div>
        <div class="section-card">
          <div class="section-body"><div class="table-responsive"><table><thead><tr>
            <th>Student</th><th>Book</th><th>Reserved</th><th>Status</th><th>Due Date</th><th>Actions</th>
          </tr></thead><tbody id="allResTable"></tbody></table></div></div>
        </div>`;

      const renderTable = (filter) => {
        const filtered = filter === 'All' ? list : list.filter(r => r.status === filter);
        const tbody = document.getElementById('allResTable');
        tbody.innerHTML = '';
        if (!filtered.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">No reservations</td></tr>'; return; }
        filtered.forEach(r => {
          const od = r.status === 'Issued' && isOverdue(r.dueDate);
          const badgeClass = { Pending: 'badge-pending', Approved: 'badge-approved', Rejected: 'badge-rejected', Issued: 'badge-issued', Returned: 'badge-returned' }[r.status];
          const row = document.createElement('tr');
          let actions = '';
          if (r.status === 'Pending') actions = `<button class="btn btn-success btn-sm approve-btn" data-id="${r._id}">✓ Approve</button> <button class="btn btn-danger btn-sm reject-btn" data-id="${r._id}">✕ Reject</button>`;
          else if (r.status === 'Approved') actions = `<button class="btn btn-primary btn-sm issue-btn" data-id="${r._id}">📤 Issue</button>`;
          else if (r.status === 'Issued') actions = `<button class="btn btn-success btn-sm return-btn" data-id="${r._id}">📥 Return</button>`;
          else actions = '—';
          row.innerHTML = `
            <td>${r.studentId?.name || '?'}<br><small style="color:var(--text-light)">${r.studentId?.email || ''}</small></td>
            <td><strong>${r.bookId?.title || '?'}</strong></td>
            <td>${fmtDate(r.reservationDate)}</td>
            <td><span class="badge ${badgeClass}">${r.status}</span>${od ? ' <span class="badge badge-overdue">Overdue</span>' : ''}</td>
            <td>${fmtDate(r.dueDate)}</td>
            <td>${actions}</td>`;
          tbody.appendChild(row);
        });
        attachReservationActions();
      };

      renderTable('All');
      document.querySelectorAll('.status-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.status-tab').forEach(t => { t.className = 'btn btn-ghost btn-sm status-tab'; });
          tab.className = 'btn btn-primary btn-sm status-tab';
          renderTable(tab.dataset.status);
        });
      });
    } catch (e) { pc.innerHTML = '<p style="color:red;">' + e.message + '</p>'; }
  });
}

// ---- LIBRARIAN REPORTS ----
function renderLibrarianReports(root) {
  librarianLayout(root, 'reports', async () => {
    document.getElementById('pageTitle').textContent = 'Reports & Statistics';
    const pc = document.getElementById('pageContent');
    pc.innerHTML = '<div class="page-loader"><div class="spinner spinner-dark" style="width:36px;height:36px;"></div></div>';
    try {
      const stats = await apiCall('/reports');
      pc.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-icon blue">📖</div><div class="stat-info"><h3>${stats.totalBooks}</h3><p>Total Books in Library</p></div></div>
          <div class="stat-card"><div class="stat-icon green">📗</div><div class="stat-info"><h3>${stats.totalAvailableBooks}</h3><p>Total Available Copies</p></div></div>
          <div class="stat-card"><div class="stat-icon green">👥</div><div class="stat-info"><h3>${stats.totalStudents}</h3><p>Registered Students</p></div></div>
          <div class="stat-card"><div class="stat-icon yellow">⏳</div><div class="stat-info"><h3>${stats.pendingReservations}</h3><p>Pending Reservations</p></div></div>
          <div class="stat-card"><div class="stat-icon blue">📕</div><div class="stat-info"><h3>${stats.activeIssues}</h3><p>Currently Issued</p></div></div>
          <div class="stat-card"><div class="stat-icon red">⚠️</div><div class="stat-info"><h3>${stats.overdueReturns}</h3><p>Overdue Returns</p></div></div>
          <div class="stat-card"><div class="stat-icon green">📗</div><div class="stat-info"><h3>${stats.booksIssuedToday}</h3><p>Issued Today</p></div></div>
        </div>

        ${stats.categoryBreakdown && stats.categoryBreakdown.length ? `
        <div class="section-card">
          <div class="section-header"><h2>📊 Books by Category</h2></div>
          <div class="section-body">
            <div class="table-responsive"><table><thead><tr><th>Category</th><th>Count</th><th>Distribution</th></tr></thead>
            <tbody>${stats.categoryBreakdown.map(c => {
              const pct = Math.round((c.count / stats.totalBooks) * 100);
              return `<tr><td><span class="category-tag">${c._id || 'Uncategorized'}</span></td><td>${c.count}</td>
              <td><div style="background:var(--border);border-radius:4px;height:20px;width:100%;max-width:300px;"><div style="background:var(--accent);height:100%;border-radius:4px;width:${pct}%;min-width:24px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.72rem;font-weight:600;">${pct}%</div></div></td></tr>`;
            }).join('')}</tbody></table></div>
          </div>
        </div>` : ''}
      `;
    } catch (e) { pc.innerHTML = '<p style="color:red;">' + e.message + '</p>'; }
  });
}
