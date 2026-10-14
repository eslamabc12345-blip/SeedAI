// ===== محرك SeedAI =====
// يعمل بنفس منطق نسخة Python، لكن في المتصفح

let MODEL = null;

// ===== تحميل الموديل =====
async function loadModel() {
  try {
    const response = await fetch('model.json');
    MODEL = await response.json();
    console.log('✅ تم تحميل الموديل');
    console.log('   عدد الكلمات:', Object.keys(MODEL.vocab).length);
    console.log('   التصنيفات:', MODEL.labels);
    return true;
  } catch (e) {
    console.error('❌ فشل تحميل الموديل:', e);
    return false;
  }
}

// ===== تحويل النص لمتجه BoW =====
function vectorize(text) {
  const vocabSize = Object.keys(MODEL.vocab).length;
  const v = new Array(vocabSize).fill(0);
  const words = text.trim().split(/\s+/);
  for (const w of words) {
    if (MODEL.vocab[w] !== undefined) {
      v[MODEL.vocab[w]] += 1;
    }
  }
  return v;
}

// ===== Softmax =====
function softmax(z) {
  const maxZ = Math.max(...z);
  const expZ = z.map(v => Math.exp(v - maxZ));
  const sum = expZ.reduce((a, b) => a + b, 0);
  return expZ.map(v => v / sum);
}

// ===== ضرب المصفوفة: (1×N) × (N×M) = (1×M) =====
function matmul(x, W) {
  const n = x.length;
  const m = W[0].length;
  const result = new Array(m).fill(0);
  for (let j = 0; j < m; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += x[i] * W[i][j];
    }
    result[j] = sum;
  }
  return result;
}

// ===== التنبؤ =====
function predict(text) {
  if (!MODEL) return null;
  const x = vectorize(text);
  const z = matmul(x, MODEL.W).map((v, i) => v + MODEL.b[i]);
  const probs = softmax(z);
  
  let maxIdx = 0;
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > probs[maxIdx]) maxIdx = i;
  }
  
  const result = {
    label: MODEL.labels[maxIdx],
    confidence: probs[maxIdx],
    allProbs: {}
  };
  MODEL.labels.forEach((l, i) => {
    result.allProbs[l] = probs[i];
  });
  return result;
}

// ===== ترجمة التصنيف للعربي =====
function labelToArabic(label) {
  const map = {
    'shakwa': 'شكوى',
    'istifsar': 'استفسار',
    'talab': 'طلب',
    'raay': 'رأي'
  };
  return map[label] || label;
}
