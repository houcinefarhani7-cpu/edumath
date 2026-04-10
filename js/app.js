/* ===== EDU MATH — app.js ===== */
const CONFIG = { whatsapp:'21694804447', siteName:'EDU MATH', apiKey:'' };
const DB = {
  get:(k)=>JSON.parse(localStorage.getItem('edumath_'+k)||'[]'),
  set:(k,v)=>localStorage.setItem('edumath_'+k,JSON.stringify(v)),
  getOne:(k)=>JSON.parse(localStorage.getItem('edumath_'+k)||'null'),
  setOne:(k,v)=>localStorage.setItem('edumath_'+k,JSON.stringify(v)),
};
function openWhatsApp(msg=''){
  const text=msg||'مرحباً، أريد الاشتراك في منصة EDU MATH 🎓';
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
}
function showToast(msg,type='success'){
  const ex=document.getElementById('__toast');if(ex)ex.remove();
  const colors={success:'#1D9E75',error:'#E24B4A',info:'#1a8fe0',warning:'#EF9F27'};
  const t=document.createElement('div');t.id='__toast';
  t.style.cssText=`position:fixed;top:24px;left:50%;transform:translateX(-50%);background:${colors[type]||colors.success};color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 6px 24px rgba(0,0,0,.2);z-index:9999;display:flex;align-items:center;gap:8px;direction:rtl;font-family:'Segoe UI',Tahoma,sans-serif;animation:fadeUp .3s ease`;
  t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3000);
}
function getNavHTML(activePage=''){
  return `
  <nav class="navbar">
    <a href="${activePage==='home'?'index.html':'../index.html'}" class="nav-brand">
      <svg width="32" height="32" viewBox="0 0 40 40">
        <polygon points="20,3 36,12 36,28 20,37 4,28 4,12" fill="rgba(26,143,224,0.12)" stroke="#1a8fe0" stroke-width="1.5"/>
        <text x="20" y="26" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="700" fill="#1a8fe0">∑</text>
      </svg>EDU MATH
    </a>
    <ul class="nav-links">
      <li><a href="${activePage==='home'?'index.html':'../index.html'}" ${activePage==='home'?'class="active"':''}>الرئيسية</a></li>
      <li><a href="${activePage==='home'?'pages/':''}lessons.html" ${activePage==='lessons'?'class="active"':''}>الدروس</a></li>
      <li><a href="${activePage==='home'?'pages/':''}exercises.html" ${activePage==='exercises'?'class="active"':''}>التمارين</a></li>
      <li><a href="${activePage==='home'?'pages/':''}exams.html" ${activePage==='exams'?'class="active"':''}>الامتحانات</a></li>
      <li><a href="${activePage==='home'?'pages/':''}assistant.html" ${activePage==='assistant'?'class="active"':''}>المساعد 🤖</a></li>
      <li><a href="${activePage==='home'?'pages/':''}payment.html" ${activePage==='payment'?'class="active"':''}>الاشتراك</a></li>
    </ul>
    <div style="display:flex;gap:10px">
      <button class="btn btn-outline" onclick="window.location.href='${activePage==='home'?'pages/':''}login.html'">دخول</button>
      <button class="btn btn-primary" onclick="window.location.href='${activePage==='home'?'pages/':''}login.html'">ابدأ مجاناً</button>
    </div>
  </nav>`;
}
function getWAFloat(){
  return `<div class="wa-float"><button class="wa-float-btn" onclick="openWhatsApp()" title="واتساب"><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button></div>`;
}
document.addEventListener('DOMContentLoaded',()=>{
  if(!document.querySelector('.wa-float')){document.body.insertAdjacentHTML('beforeend',getWAFloat());}
});
