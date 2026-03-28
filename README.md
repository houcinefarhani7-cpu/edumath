# 🎓 EDU MATH — منصة رياضيات المرحلة الإعدادية التونسية

> منصة تعليمية تفاعلية مدعومة بالذكاء الاصطناعي Claude AI
> مصممة وفق المنهج التونسي الرسمي — السنوات 7، 8، 9 أساسي 🇹🇳

---

## 📁 هيكل المشروع

```
edumath/
├── index.html              ← الصفحة الرئيسية
├── css/
│   └── style.css           ← التصميم العام
├── js/
│   └── app.js              ← JavaScript الرئيسي
└── pages/
    ├── login.html          ← تسجيل الدخول (3 أدوار)
    ├── lessons.html        ← صفحة الدروس
    ├── exercises.html      ← بنك التمارين
    ├── dashboard.html      ← لوحة التلميذ
    ├── teacher.html        ← لوحة الأستاذ
    ├── assistant.html      ← المساعد الذكي
    ├── generator.html      ← مولّد التمارين
    ├── exams.html          ← الامتحانات الجهوية
    └── payment.html        ← الاشتراك والدفع
```

---

## 🚀 الإطلاق السريع

### 1. محلياً (بدون إنترنت)
افتح `index.html` مباشرة في المتصفح — يعمل بدون سيرفر!

### 2. على Vercel (مجاناً)
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجّل بـ Google
3. اسحب مجلد `edumath` وأفلته
4. اضغط Deploy ✅
5. رابطك: `edumath-xxx.vercel.app`

### 3. على Netlify (مجاناً)
1. اذهب إلى [netlify.com](https://netlify.com)
2. اسحب المجلد → Deploy Site
3. رابطك: `edumath-xxx.netlify.app`

---

## ⚙️ الإعدادات المطلوبة

افتح `js/app.js` وعدّل:

```javascript
const CONFIG = {
  whatsapp: '21694804447',      // رقم واتساب (موجود)
  siteName: 'EDU MATH',
  siteUrl: 'https://edumath.tn',
  apiKey: 'YOUR_API_KEY_HERE',  // ← أضف مفتاح Claude API هنا
};
```

### الحصول على مفتاح Claude API (مجاني للبدء):
1. اذهب إلى [console.anthropic.com](https://console.anthropic.com)
2. أنشئ حساباً مجانياً
3. انتقل إلى API Keys → Create Key
4. انسخ المفتاح وضعه في `CONFIG.apiKey`

---

## 💳 طرق الدفع

- **D17**: `+216 94 804 447`
- **واتساب**: `+216 94 804 447`

---

## 📦 الباقات

| الباقة | السعر | المدة |
|--------|-------|-------|
| مجاني (تجربة) | 0 DT | 7 أيام |
| طالب | 15 DT | / شهر |
| أستاذ | 40 DT | / شهر |

---

## 🛠️ التقنيات المستخدمة

- **HTML5 + CSS3 + JavaScript** — بدون frameworks
- **Claude AI (Sonnet 4.6)** — المساعد الذكي
- **localStorage** — قاعدة بيانات التلاميذ
- **WhatsApp API** — التواصل والدفع
- **D17** — الدفع الإلكتروني التونسي

---

## 📞 التواصل

- **واتساب**: +216 94 804 447
- **البريد**: info@edumath.tn
- **الموقع**: edumath.tn

---

## 📄 الترخيص

© 2025 EDU MATH 🇹🇳 — جميع الحقوق محفوظة

---

*صُنع بـ ❤️ مع Claude AI من Anthropic*
