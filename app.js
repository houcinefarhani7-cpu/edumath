/* ===== EDU MATH — JavaScript الرئيسي ===== */
/* Version 1.0 | 2025 | edumath.tn */

// ===== CONFIG =====
const CONFIG = {
  whatsapp: '21694804447',
  siteName: 'EDU MATH',
  siteUrl: 'https://edumath.tn',
  apiKey: '', // أضف مفتاح Claude API هنا
};

// ===== DATABASE (localStorage) =====
const DB = {
  get: (key) => JSON.parse(localStorage.getItem('edumath_' + key) || '[]'),
  set: (key, val) => localStorage.setItem('edumath_' + key, JSON.stringify(val)),
  getOne: (key) => JSON.parse(localStorage.getItem('edumath_' + key) || 'null'),
  setOne: (key, val) => localStorage.setItem('edumath_' + key, JSON.stringify(val)),
};

// ===== CURRENT USER =====
let currentUser = DB.getOne('current_user');

// ===== WHATSAPP =====
function openWhatsApp(msg = '') {
  const text = msg || `مرحباً، أريد الاشتراك في منصة ${CONFIG.siteName} 🎓`;
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
}

// ===== TOAST NOTIFICATIONS =====
function showToast(msg, type = 'success', duration = 3000) {
  const existing = document.getElementById('toast-msg');
  if (existing) existing.remove();

  const colors = {
    success: '#1D9E75',
    error: '#E24B4A',
    info: '#1a8fe0',
    warning: '#EF9F27'
  };

  const toast = document.createElement('div');
  toast.id = 'toast-msg';
  toast.style.cssText = `
    position:fixed;top:24px;left:50%;transform:translateX(-50%);
    background:${colors[type]||colors.success};color:#fff;
    padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;
    box-shadow:0 6px 24px rgba(0,0,0,.2);z-index:9999;
    display:flex;align-items:center;gap:8px;
    animation:fadeUp .3s ease;direction:rtl;font-family:'Segoe UI',Tahoma,sans-serif;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ===== STUDENT REGISTRATION =====
function registerStudent(data) {
  const students = DB.get('students');

  // Check duplicate
  if (students.find(s => s.email === data.email && data.email)) {
    showToast('هذا البريد الإلكتروني مسجل مسبقاً', 'error');
    return null;
  }

  const student = {
    id: 'STU-' + Date.now().toString(36).toUpperCase(),
    ...data,
    regDate: new Date().toLocaleDateString('ar-TN'),
    regTimestamp: Date.now(),
    status: 'active',
    plan: data.plan || 'مجاني',
    trialDays: 7,
    trialStart: Date.now(),
    progress: {},
    streak: 0,
    points: 0,
    level: 1,
    badges: [],
    avatar: (data.fname?.charAt(0) || '') + (data.lname?.charAt(0) || ''),
    avatarColor: ['#1a8fe0','#1D9E75','#7F77DD','#EF9F27','#E24B4A'][Math.floor(Math.random()*5)]
  };

  students.unshift(student);
  DB.set('students', students);
  DB.setOne('current_user', student);
  currentUser = student;

  // Send WhatsApp notification
  const waMsg = `🎓 تسجيل جديد في EDU MATH!\n👤 ${student.fname} ${student.lname}\n📚 السنة ${student.year} أساسي\n🆔 ${student.id}\n📅 ${student.regDate}`;
  // Auto-notify (optional): openWhatsApp(waMsg);

  showToast(`✅ مرحباً ${student.fname}! تم تسجيلك بنجاح`);
  return student;
}

// ===== POINTS & GAMIFICATION =====
function addPoints(userId, points, reason = '') {
  const students = DB.get('students');
  const idx = students.findIndex(s => s.id === userId);
  if (idx === -1) return;

  students[idx].points = (students[idx].points || 0) + points;

  // Level up check
  const newLevel = Math.floor(students[idx].points / 100) + 1;
  if (newLevel > (students[idx].level || 1)) {
    students[idx].level = newLevel;
    showToast(`🎉 ترقية! أصبحت المستوى ${newLevel}`, 'success');
  }

  // Streak update
  const today = new Date().toDateString();
  if (students[idx].lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (students[idx].lastActiveDate === yesterday) {
      students[idx].streak = (students[idx].streak || 0) + 1;
    } else {
      students[idx].streak = 1;
    }
    students[idx].lastActiveDate = today;
  }

  DB.set('students', students);
  if (reason) showToast(`+${points} نقطة — ${reason}`, 'info');
  return students[idx];
}

// ===== PROGRESS TRACKING =====
function updateProgress(userId, subject, lessonId, score) {
  const students = DB.get('students');
  const idx = students.findIndex(s => s.id === userId);
  if (idx === -1) return;

  if (!students[idx].progress) students[idx].progress = {};
  if (!students[idx].progress[subject]) students[idx].progress[subject] = {};

  students[idx].progress[subject][lessonId] = {
    score,
    completedAt: new Date().toISOString(),
    done: score >= 60
  };

  DB.set('students', students);
  addPoints(userId, score >= 80 ? 20 : score >= 60 ? 10 : 5, 'حل تمرين');
}

// ===== WEEKLY REPORT (WhatsApp) =====
function generateWeeklyReport(studentId) {
  const students = DB.get('students');
  const s = students.find(st => st.id === studentId);
  if (!s) return;

  const report = `📊 *تقرير أسبوعي — EDU MATH*
━━━━━━━━━━━━━━━━━━━
👤 التلميذ: *${s.fname} ${s.lname}*
📚 السنة: *${s.year} أساسي*
🔥 أيام متتالية: *${s.streak || 0} يوم*
⭐ النقاط: *${s.points || 0} نقطة*
🏅 المستوى: *${s.level || 1}*
━━━━━━━━━━━━━━━━━━━
📅 ${new Date().toLocaleDateString('ar-TN')}
🌐 edumath.tn`;

  openWhatsApp(report);
}

// ===== NAVIGATION =====
function navigate(page) {
  const pages = {
    'home': 'index.html',
    'lessons': 'pages/lessons.html',
    'exercises': 'pages/exercises.html',
    'dashboard': 'pages/dashboard.html',
    'login': 'pages/login.html',
    'payment': 'pages/payment.html',
    'exams': 'pages/exams.html',
    'assistant': 'pages/assistant.html',
    'teacher': 'pages/teacher.html',
    'generator': 'pages/generator.html',
  };
  if (pages[page]) window.location.href = pages[page];
}

// ===== TRIAL SYSTEM =====
function checkTrial(user) {
  if (!user || user.plan !== 'مجاني') return { active: true };
  const daysUsed = Math.floor((Date.now() - user.trialStart) / 86400000);
  const daysLeft = Math.max(0, 7 - daysUsed);
  return {
    active: daysLeft > 0,
    daysLeft,
    expired: daysLeft === 0
  };
}

// ===== CLAUDE AI ASSISTANT =====
async function askClaude(question, year = '7', subject = 'عام', history = []) {
  if (!CONFIG.apiKey) {
    return getFallbackResponse(question, year, subject);
  }

  const systemPrompt = `أنت "كلود الخبير" — مساعد متخصص في رياضيات المرحلة الإعدادية التونسية.
السنة الدراسية: ${year} أساسي | الموضوع: ${subject}
اشرح بالعربية الواضحة مع خطوات مرقّمة وأمثلة تونسية.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [...history, { role: 'user', content: question }]
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text || getFallbackResponse(question, year, subject);
  } catch (e) {
    return getFallbackResponse(question, year, subject);
  }
}

function getFallbackResponse(q, year, subject) {
  const lq = q.toLowerCase();
  if (lq.includes('أعداد') || lq.includes('صحيح')) {
    return `الأعداد الصحيحة هي: ...، −2، −1، 0، +1، +2، ...\n\nقاعدة الجمع:\n- نفس الإشارة: نجمع ونحتفظ بالإشارة\n- إشارتان مختلفتان: نطرح ونأخذ إشارة الأكبر\n\nمثال: (−8) + (+5) = −3`;
  }
  if (lq.includes('كسر')) {
    return `لجمع كسرين بمقامات مختلفة:\n1. نوحّد المقامات (م.م.أ)\n2. نجمع البسطين\n3. نبسّط النتيجة\n\nمثال: ½ + ⅓ = 3/6 + 2/6 = 5/6`;
  }
  return `سؤال ممتاز! اسألني عن الأعداد الصحيحة، الكسور، الهندسة، أو التناسبية وسأشرح لك خطوة بخطوة. 🎓`;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Add WA float button if not exists
  if (!document.querySelector('.wa-float')) {
    const waBtn = document.createElement('div');
    waBtn.className = 'wa-float';
    waBtn.innerHTML = `
      <button class="wa-float-btn" onclick="openWhatsApp()" title="تواصل معنا على واتساب">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </button>`;
    document.body.appendChild(waBtn);
  }

  console.log('✅ EDU MATH v1.0 — edumath.tn');
});
