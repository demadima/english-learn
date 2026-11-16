import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('/Users/dimadema/Desktop/Dima/MyProjects/AI Workers/English learn/keys/eng-vocab-app-2026-firebase-adminsdk-fbsvc-3768f065bb.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()
user_id = 'mCSlwNeILZgraaXU3lWLXlotpZ43'
words_ref = db.collection('users').document(user_id).collection('words')

# Delete all existing documents
docs = words_ref.stream()
count = 0
for doc in docs:
    doc.reference.delete()
    count += 1
    print(f'Deleted doc: {doc.id}')

print(f'Successfully deleted all {count} words from user account: {user_id}')
