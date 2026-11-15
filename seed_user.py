import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('/Users/dimadema/Desktop/Dima/MyProjects/AI Workers/English learn/keys/eng-vocab-app-2026-firebase-adminsdk-fbsvc-3768f065bb.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
user_id = 'mCSlwNeILZgraaXU3lWLXlotpZ43'
words_ref = db.collection('users').document(user_id).collection('words')

# 1. Delete existing documents
docs = words_ref.stream()
count = 0
for doc in docs:
    doc.reference.delete()
    count += 1
    print(f'Deleted doc: {doc.id}')

print(f'Total deleted documents: {count}')

words_to_add = [
    {
        "word": "van",
        "transcription": "/væn/",
        "translation": "фургон, микроавтобус (n.) — a delivery van",
        "status": "green"
    },
    {
        "word": "fence",
        "transcription": "/fens/",
        "translation": "забор, изгородь (n.); ограждать (v.) — to fence the garden",
        "status": "green"
    },
    {
        "word": "frequency",
        "transcription": "/ˈfriːkwənsi/",
        "translation": "частота, частотность (n.) — the frequency of use",
        "status": "green"
    },
    {
        "word": "considerate",
        "transcription": "/kənˈsɪdərət/",
        "translation": "внимательный к другим, предупредительный — it was considerate of you",
        "status": "yellow"
    },
    {
        "word": "convince",
        "transcription": "/kənˈvɪns/",
        "translation": "убеждать, уговаривать (v.) — to convince sb to do sth",
        "status": "yellow"
    },
    {
        "word": "subtract",
        "transcription": "/səbˈtrækt/",
        "translation": "вычитать (v.) — subtract 5 from 10",
        "status": "yellow"
    },
    {
        "word": "sustain",
        "transcription": "/səbˈsteɪn/",
        "translation": "поддерживать, сохранять (v.) — to sustain growth",
        "status": "red"
    },
    {
        "word": "approach",
        "transcription": "/əˈprəʊtʃ/",
        "translation": "подход (n.); приближаться (v.) — a new approach to learning",
        "status": "red"
    },
    {
        "word": "curious",
        "transcription": "/ˈkjʊəriəs/",
        "translation": "любопытный, познавательный (adj.) — I am curious to know",
        "status": "green"
    },
    {
        "word": "essential",
        "transcription": "/ɪˈsenʃl/",
        "translation": "необходимый, важнейший (adj.) — water is essential for life",
        "status": "yellow"
    },
    {
        "word": "resilient",
        "transcription": "/rɪˈzɪliənt/",
        "translation": "устойчивый, жизнестойкий (adj.) — a resilient economy",
        "status": "red"
    }
]

for word_data in words_to_add:
    new_doc_ref = words_ref.document()
    word_data["id"] = new_doc_ref.id
    word_data["createdAt"] = firestore.SERVER_TIMESTAMP # Native Firestore Timestamp
    new_doc_ref.set(word_data)
    print(f'Added word "{word_data["word"]}" with ID: {new_doc_ref.id} (Native Timestamp)')

print("Successfully seeded Firestore with native Timestamps for user:", user_id)
