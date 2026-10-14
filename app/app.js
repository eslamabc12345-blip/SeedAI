// ===== التنقل بين الشاشات =====
function go(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
  if (navBtn) navBtn.classList.add('active');
}

// ===== القائمة الجانبية (مؤقت) =====
function toggleMenu() {
  alert('القائمة الجانبية — قريبًا');
}

// ===== إرسال من الصفحة الرئيسية =====
function sendMessage() {
  const input = document.getElementById('mainInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  go('chat');
  setTimeout(() => {
    document.getElementById('chatInput').value = text;
    sendChat();
  }, 200);
}

// ===== إرسال في المحادثة =====
function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addMessage(text, 'user');

  // مؤشر الكتابة
  const typingId = showTyping();

  setTimeout(() => {
    removeTyping(typingId);
    const reply = generateReply(text);
    addMessage(reply, 'bot');
  }, 400);
}

// ===== توليد الرد =====
function generateReply(text) {
  // 1. جرّب التحيات والشكر أولاً
  const quick = quickReply(text);
  if (quick) return quick;

  // 2. جرّب الموديل
  if (typeof MODEL !== 'undefined' && MODEL) {
    const result = predict(text);
    if (result) {
      const arabicLabel = labelToArabic(result.label);
      const conf = (result.confidence * 100).toFixed(1);

      // لو الثقة ضعيفة، قول للمستخدم
      if (result.confidence < 0.4) {
        return `مش متأكد من نوع الرسالة 🤔\n\nأقرب تصنيف: ${arabicLabel} (ثقة ${conf}%)\n\nجرّب تكتب تفاصيل أكتر، أو استخدم أداة البحث.`;
      }

      return getReplyForLabel(result.label, text, conf);
    }
  }

  // 3. لو الموديل لسه مش محمّل
  return 'جاري تحميل المحرك... جرّب تاني بعد لحظة 🌱';
}

// ===== ردود سريعة (تحية، شكر، إلخ) =====
function quickReply(text) {
  const t = text.toLowerCase().trim();

  if (/^(سلام|السلام عليكم|اهلا|أهلا|هاي|هلا)$/i.test(t)) {
    return 'وعليكم السلام! 🌱\nكيف أقدر أساعدك النهاردة؟';
  }
  if (t.includes('صباح الخير')) return 'صباح النور! ☀️ كيف أقدر أساعدك؟';
  if (t.includes('مساء الخير')) return 'مساء النور! 🌙 كيف أقدر أساعدك؟';
  if (t.includes('شكرا') || t.includes('شكرًا')) return 'العفو! 💚 أنا هنا في أي وقت.';
  if (t.includes('اسمك') || t.includes('من انت') || t.includes('مين انت')) {
    return 'أنا SeedAI 🌱\nمساعدك الذكي — بذرة ذكاء تنمو معك.';
  }
  if (t === 'exit' || t === 'خروج') return 'إلى اللقاء! 👋';
  return null;
}

// ===== ردود حسب التصنيف =====
function getReplyForLabel(label, text, conf) {
  const replies = {
    'shakwa': `أفهم إن فيه مشكلة 😔\n\nسجّلت شكوتك. ممكن توضّح:\n• إيه المشكلة بالظبط؟\n• امتى حصلت؟\n\n(تصنيف: شكوى — ثقة ${conf}%)`,

    'istifsar': `تمام، سؤال وجيه 🤔\n\nللإجابة الدقيقة، محتاج تفاصيل أكتر.\nقريبًا هقدر أبحثلك في الإنترنت وأجيبلك المعلومة.\n\n(تصنيف: استفسار — ثقة ${conf}%)`,

    'talab': `تمام، استلمت طلبك ✅\n\nممكن توضّح:\n• إيه اللي محتاجه بالظبط؟\n• امتى؟\n\n(تصنيف: طلب — ثقة ${conf}%)`,

    'raay': `شكرًا لمشاركة رأيك 💚\n\nرأيك مهم ويساعدني أتحسّن.\n\n(تصنيف: رأي — ثقة ${conf}%)`
  };
  return replies[label] || `استلمت رسالتك: "${text}"\n\n(تصنيف: ${label} — ثقة ${conf}%)`;
}

// ===== إضافة رسالة للشات =====
function addMessage(text, sender) {
  const chatBody = document.getElementById('chatBody');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${sender}`;
  if (sender === 'bot') {
    msg.innerHTML = `
      <div class="chat-avatar">🌱</div>
      <div class="chat-bubble">${escapeHtml(text)}</div>
    `;
  } else {
    msg.innerHTML = `
      <div class="chat-bubble">${escapeHtml(text)}</div>
      <div class="chat-avatar">👤</div>
    `;
  }
  chatBody.appendChild(msg);
  msg.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ===== مؤشر الكتابة =====
function showTyping() {
  const chatBody = document.getElementById('chatBody');
  const msg = document.createElement('div');
  msg.className = 'chat-msg bot';
  const id = 'typing-' + Date.now();
  msg.id = id;
  msg.innerHTML = `
    <div class="chat-avatar">🌱</div>
    <div class="chat-bubble">...</div>
  `;
  chatBody.appendChild(msg);
  msg.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ===== حماية من HTML injection =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, '<br>');
}

// ===== عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', async () => {
  // تحميل الموديل
  await loadModel();

  // تشيبات الستايل
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendChat();
    });
  }

  const mainInput = document.getElementById('mainInput');
  if (mainInput) {
    mainInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
});

// ===== إنشاء صورة (مؤقت) =====
function generateImage() {
  const prompt = document.getElementById('imagePrompt').value.trim();
  if (!prompt) return;
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = '<div class="preview-placeholder">🎨<br><span>جاري الإنشاء...</span></div>';
  setTimeout(() => {
    preview.innerHTML = '<div class="preview-placeholder">🖼️<br><span>قريبًا مع المحرك</span></div>';
  }, 1200);
}
