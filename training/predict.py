import numpy as np
import json, sys

# تحميل الموديل
data = np.load('model.npz')
W, b = data['W'], data['b']

with open('vocab.json', encoding='utf-8') as f:
    meta = json.load(f)
vocab = meta['vocab']
label_names = meta['labels']

def vectorize(text):
    v = np.zeros(len(vocab))
    for w in text.split():
        if w in vocab:
            v[vocab[w]] += 1
    return v

def softmax(z):
    z = z - np.max(z, axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)

def predict(text):
    x = vectorize(text).reshape(1, -1)
    probs = softmax(x @ W + b)[0]
    idx = np.argmax(probs)
    return label_names[idx], probs[idx], dict(zip(label_names, probs))

# لو المستخدم كتب جملة كـ argument
if len(sys.argv) > 1:
    text = ' '.join(sys.argv[1:])
    label, conf, all_probs = predict(text)
    print(f"الجملة: {text}")
    print(f"التصنيف: {label} (ثقة: {conf:.2%})")
    print("كل الاحتمالات:")
    for k, v in sorted(all_probs.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v:.2%}")
else:
    # وضع تفاعلي
    print("اكتب جملة للتجربة (اكتب exit للخروج):")
    while True:
        text = input(">>> ").strip()
        if text.lower() in ('exit', 'quit', ''):
            break
        label, conf, all_probs = predict(text)
        print(f"  التصنيف: {label} (ثقة: {conf:.2%})")
