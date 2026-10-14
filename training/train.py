import numpy as np
import csv, json

np.random.seed(42)

# 1. قراءة البيانات
texts, labels = [], []
with open('data.csv', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        texts.append(row['text'].strip())
        labels.append(row['label'].strip())

print(f"عدد الجمل: {len(texts)}")

# 2. بناء المفردات
vocab = {}
for t in texts:
    for w in t.split():
        if w not in vocab:
            vocab[w] = len(vocab)
print(f"حجم المفردات: {len(vocab)}")

# 3. تحويل النص لمتجه BoW
def vectorize(text):
    v = np.zeros(len(vocab))
    for w in text.split():
        if w in vocab:
            v[vocab[w]] += 1
    return v

X = np.array([vectorize(t) for t in texts])

# 4. التصنيفات
label_names = sorted(set(labels))
label_to_idx = {l: i for i, l in enumerate(label_names)}
y = np.array([label_to_idx[l] for l in labels])
print(f"التصنيفات: {label_names}")

# 5. موديل Softmax
n_features, n_classes = X.shape[1], len(label_names)
W = np.zeros((n_features, n_classes))
b = np.zeros(n_classes)

def softmax(z):
    z = z - np.max(z, axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)

# 6. التدريب
lr, epochs = 0.5, 500
n = len(y)

for epoch in range(epochs):
    probs = softmax(X @ W + b)
    dz = probs.copy()
    dz[np.arange(n), y] -= 1
    dz /= n
    W -= lr * (X.T @ dz)
    b -= lr * dz.sum(axis=0)
    if (epoch + 1) % 100 == 0:
        loss = -np.mean(np.log(probs[np.arange(n), y] + 1e-9))
        acc = np.mean(np.argmax(probs, axis=1) == y)
        print(f"Epoch {epoch+1}: loss={loss:.4f}, acc={acc:.4f}")

# 7. الحفظ
np.savez('model.npz', W=W, b=b)
with open('vocab.json', 'w', encoding='utf-8') as f:
    json.dump({'vocab': vocab, 'labels': label_names}, f, ensure_ascii=False)
print("تم حفظ model.npz و vocab.json")
