/* ════════════════════════════════════════════
   EDU MATH — Auth System
   Uses localStorage for demo. In production:
   replace API calls with your backend/Supabase.
   ════════════════════════════════════════════ */

const AUTH_KEY = 'edumath_user';
const USERS_KEY = 'edumath_users';

/* ── Helpers ─────────────────────────── */
function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
  catch { return null; }
}
function saveCurrentUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}
function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = getRootPath() + 'index.html';
}

function getRootPath() {
  // Works from both /index.html and /pages/*.html
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../';
  return '';
}

/* ── Modal control ─────────────────────────── */
function openAuth(tab = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  switchTab(tab);
}
function closeAuth() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
function closeAuthOnBg(e) {
  if (e.target === e.currentTarget) closeAuth();
}
function switchTab(tab) {
  document.getElementById('form-login').classList.add('hidden');
  document.getElementById('form-register').classList.add('hidden');
  document.getElementById('form-success').classList.add('hidden');
  document.getElementById('tab-login').classList.remove('active');
  document.getElementById('tab-register').classList.remove('active');
  document.getElementById(`form-${tab}`).classList.remove('hidden');
  document.getElementById(`tab-${tab}`).classList.add('active');
}

/* ── Password toggle ─────────────────────────── */
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
  else { input.type = 'password'; btn.textContent = '👁'; }
}

/* ── Password strength ─────────────────────────── */
function checkPwStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw) || /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw))   score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

document.addEventListener('DOMContentLoaded', () => {
  const regPw = document.getElementById('reg-pw');
  const bar = document.getElementById('pw-strength');
  if (regPw && bar) {
    regPw.addEventListener('input', () => {
      const score = checkPwStrength(regPw.value);
      const colors = ['#ef4444', '#f59e0b', '#10b981', '#1a56db'];
      const widths = ['25%', '50%', '75%', '100%'];
      bar.style.setProperty('--pw-w', regPw.value ? widths[score - 1] || '10%' : '0%');
      bar.style.setProperty('--pw-c', regPw.value ? colors[score - 1] || '#ef4444' : '#e5e7eb');
    });
  }

  // Update nav based on auth state
  updateNavAuth();
  // Escape key closes modal
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuth(); });
});

/* ── Update navbar for logged in user ─────────────────────────── */
function updateNavAuth() {
  const user = getCurrentUser();
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;
  if (user) {
    navActions.innerHTML = `
      <div class="nav-user-menu" style="position:relative">
        <button class="btn-ghost" onclick="toggleUserMenu()" style="display:flex;align-items:center;gap:.5rem">
          <span style="width:26px;height:26px;background:var(--primary);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700">
            ${user.firstName ? user.firstName[0].toUpperCase() : '؟'}
          </span>
          ${user.firstName || 'حسابي'} ▾
        </button>
        <div id="userDropdown" class="user-dropdown hidden">
          <div style="padding:.75rem 1rem;border-bottom:1px solid var(--border);font-size:.85rem;color:var(--text-3)">
            ${user.email}
          </div>
          <a href="${getRootPath()}pages/lessons.html" style="display:block;padding:.6rem 1rem;font-size:.9rem;transition:background .2s" onmouseover="this.style.background='var(--bg-3)'" onmouseout="this.style.background=''">📚 دروسي</a>
          <a href="${getRootPath()}pages/assistant.html" style="display:block;padding:.6rem 1rem;font-size:.9rem;transition:background .2s" onmouseover="this.style.background='var(--bg-3)'" onmouseout="this.style.background=''">🤖 المساعد</a>
          <button onclick="logout()" style="width:100%;text-align:right;padding:.6rem 1rem;font-size:.9rem;background:none;border:none;border-top:1px solid var(--border);cursor:pointer;color:var(--danger);font-family:var(--font)">🚪 تسجيل الخروج</button>
        </div>
      </div>
    `;
    // Inject dropdown style
    if (!document.getElementById('dropdown-style')) {
      const s = document.createElement('style');
      s.id = 'dropdown-style';
      s.textContent = `.user-dropdown{position:absolute;top:calc(100% + 8px);left:0;min-width:200px;background:var(--bg);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-lg);z-index:200;animation:modalIn .15s ease}`;
      document.head.appendChild(s);
    }
  }
}

function toggleUserMenu() {
  document.getElementById('userDropdown')?.classList.toggle('hidden');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-user-menu')) {
    document.getElementById('userDropdown')?.classList.add('hidden');
  }
});

/* ── Show error ─────────────────────────── */
function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
}
function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('visible');
}

/* ── Validate email ─────────────────────────── */
function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

/* ── LOGIN ─────────────────────────────── */
async function doLogin() {
  hideError('login-error');
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-pw').value;

  if (!email) return showError('login-error', 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف.');
  if (!pw)    return showError('login-error', 'يرجى إدخال كلمة المرور.');

  const btn  = document.getElementById('login-btn-text');
  const spin = document.getElementById('login-spinner');
  btn.textContent = 'جاري الدخول...';
  spin.classList.remove('hidden');
  document.querySelector('#form-login .btn-submit').disabled = true;

  await delay(800); // Simulate API call

  const users = getUsers();
  const user = users.find(u => (u.email === email || u.phone === email) && u.password === hashPw(pw));

  btn.textContent = 'دخول';
  spin.classList.add('hidden');
  document.querySelector('#form-login .btn-submit').disabled = false;

  if (!user) return showError('login-error', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');

  const { password, ...safeUser } = user;
  saveCurrentUser(safeUser);
  closeAuth();
  updateNavAuth();
  showToast(`مرحباً ${safeUser.firstName}! 👋`);
}

/* ── REGISTER ─────────────────────────────── */
async function doRegister() {
  hideError('reg-error');

  const firstName = document.getElementById('reg-first').value.trim();
  const lastName  = document.getElementById('reg-last').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const phone     = document.getElementById('reg-phone').value.trim();
  const grade     = document.getElementById('reg-grade').value;
  const pw        = document.getElementById('reg-pw').value;
  const terms     = document.getElementById('reg-terms').checked;

  if (!firstName) return showError('reg-error', 'يرجى إدخال الاسم الأول.');
  if (!email || !isValidEmail(email)) return showError('reg-error', 'يرجى إدخال بريد إلكتروني صحيح.');
  if (!grade)  return showError('reg-error', 'يرجى اختيار السنة الدراسية.');
  if (pw.length < 8) return showError('reg-error', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
  if (!terms)  return showError('reg-error', 'يجب قبول شروط الاستخدام للمتابعة.');

  const users = getUsers();
  if (users.find(u => u.email === email)) return showError('reg-error', 'هذا البريد الإلكتروني مسجّل مسبقاً.');

  const btn  = document.getElementById('reg-btn-text');
  const spin = document.getElementById('reg-spinner');
  btn.textContent = 'جاري التسجيل...';
  spin.classList.remove('hidden');
  document.querySelector('#form-register .btn-submit').disabled = true;

  await delay(1000);

  const newUser = {
    id: Date.now().toString(),
    firstName, lastName, email, phone, grade,
    password: hashPw(pw),
    plan: 'free',
    trialEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    progress: {},
    points: 0,
    level: 1
  };

  users.push(newUser);
  saveUsers(users);

  const { password, ...safeUser } = newUser;
  saveCurrentUser(safeUser);

  btn.textContent = 'إنشاء حساب مجاني';
  spin.classList.add('hidden');
  document.querySelector('#form-register .btn-submit').disabled = false;

  // Show success
  document.getElementById('form-register').classList.add('hidden');
  document.getElementById('form-success').classList.remove('hidden');
  updateNavAuth();
}

function goToDashboard() {
  closeAuth();
  window.location.href = getRootPath() + 'pages/lessons.html';
}

/* ── Simple hash (demo only — use bcrypt in production) ── */
function hashPw(pw) {
  let hash = 0;
  for (let i = 0; i < pw.length; i++) {
    hash = ((hash << 5) - hash) + pw.charCodeAt(i);
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + pw.length;
}

/* ── Utility ─────────────────────────── */
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ── Toast notifications ─────────────────────────── */
function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.style.cssText = `background:${type === 'success' ? '#10b981' : '#ef4444'};color:#fff;padding:.75rem 1.25rem;border-radius:10px;font-family:var(--font);font-size:.9rem;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,.2);animation:slideIn .3s ease;direction:rtl`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'slideOut .3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 3000);
}

const toastStyles = document.createElement('style');
toastStyles.textContent = `@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}} @keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}`;
document.head.appendChild(toastStyles);

/* ── Guard: require auth for protected pages ─────────────────────────── */
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    openAuth('login');
    return false;
  }
  return user;
}

/* ── Check if user has paid plan ─────────────────────────── */
function hasPaidPlan() {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.plan === 'student' || user.plan === 'teacher') return true;
  // Check if trial still active
  if (user.trialEnds && new Date(user.trialEnds) > new Date()) return true;
  return false;
}
