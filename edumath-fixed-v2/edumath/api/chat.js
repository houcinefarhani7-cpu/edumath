/**
 * /api/chat.js — Vercel Edge Function (SERVER-SIDE)
 *
 * ✅ API key lives HERE only — NEVER in frontend JS
 * ✅ Rate limiting per user per day
 * ✅ Input sanitization & validation
 *
 * Setup:
 *   1. Deploy to Vercel
 *   2. Add ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables
 *   3. Done — frontend calls /api/chat without ever seeing the key
 */

export const config = { runtime: 'edge' };

const rateLimits = new Map(); // Use Upstash Redis in production

export default async function handler(request) {
  const CORS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://edumath-online.vercel.app',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-User-Id',
  };

  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS });
  if (request.method !== 'POST') return new Response('{}', { status: 405, headers: CORS });

  const userId = request.headers.get('X-User-Id');
  if (!userId) return new Response(JSON.stringify({ message: 'يجب تسجيل الدخول أولاً' }), { status: 401, headers: CORS });

  // Rate limit
  const key = `${userId}:${new Date().toDateString()}`;
  const count = (rateLimits.get(key) || 0) + 1;
  rateLimits.set(key, count);
  if (count > 50) return new Response(JSON.stringify({ message: 'تجاوزت حد الرسائل اليومي. جرب غداً.' }), { status: 429, headers: CORS });

  let body;
  try { body = await request.json(); } catch { return new Response('{}', { status: 400, headers: CORS }); }

  const messages = (body.messages || [])
    .filter(m => ['user','assistant'].includes(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-20);

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) return new Response(JSON.stringify({ message: 'مفتاح API غير مكون' }), { status: 500, headers: CORS });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: body.systemPrompt || 'أنت مساعد رياضيات للمرحلة الإعدادية التونسية. أجب بالعربية دائماً.',
      messages,
    }),
  });

  const data = await res.json();
  if (!res.ok) return new Response(JSON.stringify({ message: 'خطأ في خدمة الذكاء الاصطناعي' }), { status: 502, headers: CORS });

  return new Response(JSON.stringify({ content: data.content[0].text, remaining: 50 - count }), { status: 200, headers: CORS });
}
