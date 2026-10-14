import numpy as np
import json

# تحميل الموديل
data = np.load('model.npz')
W, b = data['W'], data['b']

with open('vocab.json', encoding='utf-8') as f:
    meta = json.load(f)
vocab = meta['vocab']
labels = meta['labels']

# تحويل لـ JSON
model_json = {
    'W': W.tolist(),
    'b': b.tolist(),
    'vocab': vocab,
    'labels': labels
}

# حفظ في مجلد التطبيق
with open('../app/model.json', 'w', encoding='utf-8') as f:
    json.dump(model_json, f, ensure_ascii=False)

print(f"تم التصدير بنجاح")
print(f"  - حجم W: {W.shape}")
print(f"  - حجم b: {b.shape}")
print(f"  - عدد الكلمات: {len(vocab)}")
print(f"  - التصنيفات: {labels}")
