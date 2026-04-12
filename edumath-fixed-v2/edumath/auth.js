/**
 * EDU MATH — Auth & Security System
 * 
 * Architecture:
 * - Auth: localStorage-based session (production → replace with Supabase/Firebase)
 * - API calls: routed through /api/chat (Vercel Edge Function) — API key NEVER in frontend
 * - Plan enforcement: every premium feature checks auth before rendering
 * 
 * HOW TO CONNECT REAL BACKEND (Supabase example):
 *   1. npm install @supabase/supabase-js
 *   2. Replace authDB.login() with: supabase.auth.signInWithPassword({email, password})
 *   3. Replace authDB.register() with: supabase.auth.signUp({email, password, options:{data:{name,grade,plan}}})
 *   4. Replace AuthManager.getSession() with: supabase.auth.getSession()
 */

// ── Simulated user database (replace with Supabase/Firebase in production) ──
const authDB = {
  users: JSON.parse(localStorage.getItem('em_users') || '[]'),

  save() { localStorage.setItem('em_users', JSON.stringify(this.users)); },

  findByEmail(email) {
    return this.users.find(u => u.email === email.toLowerCase().trim());
  },

  async register({ name, email, password, grade, role = 'student' }) {
    if (this.findByEmail(email)) throw new Error('هذا البريد الإلكتروني مسجل مسبقاً');
    if (password.length < 6) throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');

    const user = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      // ⚠️ Production: use bcrypt hash — this is demo only
      passwordHash: btoa(password),
      grade,
      role,
      plan: 'free',
      trialEnds: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days trial
      joinedAt: Date.now(),
      progress: {},
      streak: 0,
      points: 0,
    };
    this.users.push(user);
    this.save();
    return user;
  },

  async login(email, password) {
    const user = this.findByEmail(email);
    if (!user) throw new Error('البريد الإلكتروني غير موجود');
    if (user.passwordHash !== btoa(password)) throw new Error('كلمة المرور غير صحيحة');
    return user;
  },

  updateUser(id, data) {
    const i = this.users.findIndex(u => u.id === id);
    if (i === -1) return;
    this.users[i] = { ...this.users[i], ...data };
    this.save();
    return this.users[i];
  }
};

// ── Session Manager ──
const AuthManager = {
  SESSION_KEY: 'em_session',

  getSession() {
    try {
      const s = JSON.parse(localStorage.getItem(this.SESSION_KEY));
      if (!s || !s.userId) return null;
      // re-fetch fresh user data
      const user = authDB.users.find(u => u.id === s.userId);
      return user || null;
    } catch { return null; }
  },

  setSession(user) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({
      userId: user.id,
      createdAt: Date.now()
    }));
  },

  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  isLoggedIn() { return !!this.getSession(); },

  getUser() { return this.getSession(); },

  getPlan() {
    const u = this.getUser();
    if (!u) return 'guest';
    if (u.plan === 'teacher') return 'teacher';
    if (u.plan === 'student') return 'student';
    // Check trial
    if (u.trialEnds && Date.now() < u.trialEnds) return 'trial';
    return 'free';
  },

  canAccess(feature) {
    const plan = this.getPlan();
    const rules = {
      lessons_basic:    ['guest', 'free', 'trial', 'student', 'teacher'],
      lessons_all:      ['trial', 'student', 'teacher'],
      exercises_basic:  ['free', 'trial', 'student', 'teacher'],
      exercises_all:    ['trial', 'student', 'teacher'],
      assistant:        ['trial', 'student', 'teacher'],
      assistant_limited:['trial', 'student', 'teacher'],
      exams:            ['trial', 'student', 'teacher'],
      teacher_dashboard:['teacher'],
    };
    return (rules[feature] || []).includes(plan);
  }
};

// ── Secure API Proxy ──
// ⚠️ KEY SECURITY: API key lives ONLY in Vercel Edge Function /api/chat
// Frontend sends messages → Edge Function adds key → Anthropic API
// See /api/chat.js for the server-side implementation
const SecureAPI = {
  /**
   * Chat with Claude — goes through server proxy
   * In production: POST to /api/chat (Vercel Edge Function)
   * The edge function adds Authorization header with real API key
   */
  async chat(messages, systemPrompt) {
    const user = AuthManager.getUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    // Check rate limit per user
    const key = `em_rate_${user.id}_${new Date().toDateString()}`;
    const count = parseInt(localStorage.getItem(key) || '0');
    const limit = AuthManager.getPlan() === 'student' || AuthManager.getPlan() === 'teacher' ? 50 : 10;
    if (count >= limit) throw new Error(`لقد استخدمت حد الرسائل اليومي (${limit} رسالة). جرّب غداً أو رقّ باشتراكك.`);
    localStorage.setItem(key, count + 1);

    // ── PRODUCTION: uncomment this block and remove the demo response below ──
    /*
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.id,          // Edge function validates this
        'X-Session-Token': AuthManager.getSession()?.token || '',
      },
      body: JSON.stringify({ messages, systemPrompt })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'خطأ في الاتصال');
    }
    const data = await response.json();
    return data.content;
    */

    // ── DEMO MODE: Direct Anthropic API call (replace with proxy in production) ──
    // ⚠️ This is acceptable ONLY for demo/development — never ship API key in frontend
    const DEMO_KEY = window.ANTHROPIC_KEY || '';
    if (!DEMO_KEY) {
      return this._demoResponse(messages[messages.length - 1].content);
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DEMO_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.content[0].text;
  },

  _demoResponse(question) {
    // Fallback demo responses when no API key configured
    const demos = {
      default: `**تنبيه:** المساعد الذكي يعمل في الوضع التجريبي حالياً.\n\nسؤالك: "${question}"\n\n**للإجابة الحقيقية** يحتاج المدير إلى ربط مفتاح Anthropic API عبر Edge Function.\n\n**مثال على حل:**\nلحل هذا النوع من المسائل خطوة بخطوة:\n1. حدد المعطيات\n2. طبق القاعدة المناسبة\n3. تحقق من الإجابة`,
    };
    return Promise.resolve(demos.default);
  }
};

// ── UI Helpers ──
const Toast = {
  show(msg, type = 'info', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), duration);
  }
};

// ── Auth Modal Controller ──
const AuthModal = {
  modal: null,

  init() {
    // Create modal HTML
    const html = `
    <div class="modal-overlay" id="authModal">
      <div class="modal">
        <button class="modal-close" onclick="AuthModal.close()">×</button>
        <div class="modal-tabs">
          <button class="modal-tab active" onclick="AuthModal.switchTab('login')">تسجيل الدخول</button>
          <button class="modal-tab" onclick="AuthModal.switchTab('register')">حساب جديد</button>
        </div>

        <!-- LOGIN -->
        <div id="tabLogin">
          <div class="security-notice">🔒 اتصال آمن — بياناتك محمية</div>
          <div class="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" id="loginEmail" placeholder="example@email.com" />
          </div>
          <div class="form-group">
            <label>كلمة المرور</label>
            <input type="password" id="loginPass" placeholder="••••••••" />
            <div class="form-error" id="loginError"></div>
          </div>
          <button class="btn-full" onclick="AuthModal.login()">دخول</button>
          <div class="form-success" id="loginSuccess"></div>
        </div>

        <!-- REGISTER -->
        <div id="tabRegister" style="display:none">
          <div class="security-notice">🎁 تجربة مجانية 7 أيام كاملة — بدون بطاقة بنكية</div>
          <div class="form-group">
            <label>الاسم الكامل</label>
            <input type="text" id="regName" placeholder="محمد الأمين..." />
          </div>
          <div class="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" id="regEmail" placeholder="example@email.com" />
          </div>
          <div class="form-group">
            <label>كلمة المرور</label>
            <input type="password" id="regPass" placeholder="6 أحرف على الأقل" />
          </div>
          <div class="form-group">
            <label>السنة الدراسية</label>
            <select id="regGrade">
              <option value="">اختر سنتك...</option>
              <option value="7">السنة السابعة أساسي</option>
              <option value="8">السنة الثامنة أساسي</option>
              <option value="9">السنة التاسعة أساسي</option>
              <option value="teacher">أستاذ</option>
            </select>
          </div>
          <div class="form-error" id="regError"></div>
          <button class="btn-full" onclick="AuthModal.register()">إنشاء حساب مجاني</button>
          <div class="form-success" id="regSuccess"></div>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    this.modal = document.getElementById('authModal');
    this.modal.addEventListener('click', e => { if (e.target === this.modal) this.close(); });
  },

  open(tab = 'login') {
    this.modal.classList.add('open');
    this.switchTab(tab);
  },
  close() { this.modal.classList.remove('open'); },

  switchTab(tab) {
    document.getElementById('tabLogin').style.display    = tab === 'login'    ? '' : 'none';
    document.getElementById('tabRegister').style.display = tab === 'register' ? '' : 'none';
    document.querySelectorAll('.modal-tab').forEach((el, i) => {
      el.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
    });
  },

  async login() {
    const email = document.getElementById('loginEmail').value;
    const pass  = document.getElementById('loginPass').value;
    const errEl = document.getElementById('loginError');
    const okEl  = document.getElementById('loginSuccess');
    errEl.style.display = 'none';

    try {
      const user = await authDB.login(email, pass);
      AuthManager.setSession(user);
      okEl.textContent = `مرحباً ${user.name}! جاري التحميل...`;
      okEl.style.display = 'block';
      setTimeout(() => { this.close(); NavBar.refresh(); Toast.show(`أهلاً ${user.name} 👋`, 'success'); }, 800);
    } catch(e) {
      errEl.textContent = e.message;
      errEl.style.display = 'block';
    }
  },

  async register() {
    const name  = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pass  = document.getElementById('regPass').value;
    const grade = document.getElementById('regGrade').value;
    const errEl = document.getElementById('regError');
    const okEl  = document.getElementById('regSuccess');
    errEl.style.display = 'none';

    if (!name || !email || !pass || !grade) {
      errEl.textContent = 'يرجى ملء جميع الحقول'; errEl.style.display = 'block'; return;
    }

    try {
      const role = grade === 'teacher' ? 'teacher' : 'student';
      const user = await authDB.register({ name, email, password: pass, grade, role });
      AuthManager.setSession(user);
      okEl.textContent = '✅ تم إنشاء حسابك! التجربة المجانية نشطة 7 أيام.';
      okEl.style.display = 'block';
      setTimeout(() => { this.close(); NavBar.refresh(); Toast.show(`مرحباً ${user.name}! تجربتك المجانية نشطة 🎉`, 'success'); }, 1000);
    } catch(e) {
      errEl.textContent = e.message;
      errEl.style.display = 'block';
    }
  }
};

// ── NavBar Controller ──
const NavBar = {
  refresh() {
    const actionsEl = document.getElementById('navActions');
    if (!actionsEl) return;
    const user = AuthManager.getUser();

    if (!user) {
      actionsEl.innerHTML = `
        <button class="btn-login" onclick="AuthModal.open('login')">دخول</button>
        <button class="btn-primary" onclick="AuthModal.open('register')">ابدأ مجاناً</button>`;
    } else {
      const plan = AuthManager.getPlan();
      const planLabels = { free:'مجاني', trial:'تجريبي', student:'طالب', teacher:'أستاذ' };
      const planClass  = { free:'plan-free', trial:'plan-student', student:'plan-student', teacher:'plan-teacher' };
      const initials = user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
      actionsEl.innerHTML = `
        <span class="plan-badge ${planClass[plan] || 'plan-free'}">${planLabels[plan] || 'مجاني'}</span>
        <div class="user-avatar" tabindex="0">
          ${initials}
          <div class="user-menu">
            <a href="#" style="font-weight:500;color:var(--ink);pointer-events:none">${user.name}</a>
            <div class="user-menu-divider"></div>
            <a href="../pages/dashboard.html">لوحة التحكم</a>
            <a href="../pages/payment.html">رفع الاشتراك ⭐</a>
            <div class="user-menu-divider"></div>
            <button class="logout" onclick="NavBar.logout()">تسجيل الخروج</button>
          </div>
        </div>`;
    }
  },

  logout() {
    AuthManager.clearSession();
    this.refresh();
    Toast.show('تم تسجيل الخروج', 'info');
    setTimeout(() => location.href = location.pathname.includes('/pages/') ? '../index.html' : 'index.html', 600);
  }
};

// ── Lock Premium Content ──
function lockIfNeeded(containerSelector, feature, upgradeMsg) {
  if (AuthManager.canAccess(feature)) return;
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.style.position = 'relative';
  const overlay = document.createElement('div');
  overlay.className = 'locked-overlay';
  overlay.innerHTML = `
    <div class="lock-icon">🔒</div>
    <p>${upgradeMsg || 'هذا المحتوى متاح للمشتركين فقط'}</p>
    <button class="btn-primary" style="font-size:.85rem;padding:.4rem .9rem"
      onclick="AuthModal.open('${AuthManager.isLoggedIn() ? 'login' : 'register'}')">
      ${AuthManager.isLoggedIn() ? 'ترقية الاشتراك' : 'ابدأ مجاناً 7 أيام'}
    </button>`;
  container.appendChild(overlay);
}

// ── Trial Banner ──
function showTrialBannerIfNeeded() {
  const user = AuthManager.getUser();
  if (!user || user.plan !== 'free') return;
  if (!user.trialEnds || Date.now() >= user.trialEnds) return;
  const days = Math.ceil((user.trialEnds - Date.now()) / 86400000);
  const banner = document.createElement('div');
  banner.style.cssText = 'background:linear-gradient(90deg,#1a7a4a,#2ecc71);color:#fff;text-align:center;padding:.6rem;font-size:.9rem;';
  banner.innerHTML = `🎁 تجربتك المجانية تنتهي خلال <strong>${days} أيام</strong> — <a href="pages/payment.html" style="color:#fff;font-weight:700;text-decoration:underline">اشترك الآن</a>`;
  document.body.prepend(banner);
}

// ── Bootstrap on DOM ready ──
document.addEventListener('DOMContentLoaded', () => {
  AuthModal.init();
  NavBar.refresh();
  showTrialBannerIfNeeded();
  document.dispatchEvent(new Event('authReady'));
});
