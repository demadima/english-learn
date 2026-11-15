/**
 * Storage & Cloud Repository Module
 * Guest mode: LocalStorage / words.json
 * Logged-in mode: Strictly Firestore Cloud Storage (0 words if empty, no auto-seeding demo words).
 */
const StorageRepository = (() => {
    let words = [];
    let db = null;
    let fs = null;

    window.addEventListener('firebase-ready', async () => {
        db = window.firebaseDb;
        fs = window.firebaseFirestore;
        await load();
    });

    async function load() {
        const user = typeof AuthService !== 'undefined' ? AuthService.getUser() : null;

        // If user is logged in, load strictly from cloud
        if (db && fs && user) {
            await syncFromCloud();
            return words;
        }

        // If guest mode, load from localStorage or words.json
        const stored = localStorage.getItem('english_words_app');
        if (stored) {
            try {
                words = JSON.parse(stored);
            } catch (e) {
                words = [];
            }
        } else {
            try {
                const response = await fetch('words.json');
                if (response.ok) {
                    words = await response.json();
                } else {
                    words = window.initialWordsData ? [...window.initialWordsData] : [];
                }
            } catch (err) {
                words = window.initialWordsData ? [...window.initialWordsData] : [];
            }
        }

        normalizeTimestamps(words);
        saveLocal();

        if (typeof UIRenderer !== 'undefined') {
            UIRenderer.updateStats(words);
            UIRenderer.renderCards(words);
        }

        return words;
    }

    function normalizeTimestamps(list) {
        list.forEach(w => {
            if (w.createdAt) {
                if (typeof w.createdAt.toMillis === 'function') {
                    w.createdAt = w.createdAt.toMillis();
                } else if (w.createdAt.seconds) {
                    w.createdAt = w.createdAt.seconds * 1000;
                } else if (typeof w.createdAt !== 'number') {
                    w.createdAt = Date.now();
                }
            } else {
                w.createdAt = Date.now();
            }
        });
    }

    async function syncFromCloud() {
        const user = AuthService.getUser();
        if (!db || !fs || !user) return;
        try {
            const wordsRef = fs.collection(db, "users", user.uid, "words");
            const querySnapshot = await fs.getDocs(wordsRef);
            const cloudWords = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                data.id = docSnap.id;
                cloudWords.push(data);
            });
            normalizeTimestamps(cloudWords);

            // Cloud is the absolute source of truth for logged-in users.
            // If Firestore collection is empty, words list is empty (0 words). No auto-seeding!
            words = cloudWords;
            saveLocal();

            if (typeof UIRenderer !== 'undefined') {
                UIRenderer.updateStats(words);
                UIRenderer.renderCards(words);
            }
        } catch (e) {
            console.log('Cloud sync error:', e);
        }
    }

    function saveLocal() {
        localStorage.setItem('english_words_app', JSON.stringify(words));
    }

    function getWords() {
        return words;
    }

    async function addWord(wordObj) {
        wordObj.createdAt = Date.now();
        const user = AuthService.getUser();
        if (db && fs && user) {
            try {
                const cleanWord = {
                    word: wordObj.word,
                    transcription: wordObj.transcription || '',
                    translation: wordObj.translation,
                    status: wordObj.status || 'red',
                    createdAt: fs.serverTimestamp ? fs.serverTimestamp() : Date.now()
                };
                const docRef = await fs.addDoc(fs.collection(db, "users", user.uid, "words"), cleanWord);
                wordObj.id = docRef.id;
                await fs.setDoc(docRef, { id: docRef.id }, { merge: true });
            } catch (e) {
                console.error('Cloud add error:', e);
                wordObj.id = wordObj.id || Date.now().toString();
            }
        } else {
            wordObj.id = wordObj.id || Date.now().toString();
        }

        words.unshift(wordObj);
        saveLocal();
    }

    async function updateStatus(id, newStatus) {
        const target = words.find(w => w.id === id);
        if (target && target.status !== newStatus) {
            target.status = newStatus;
            saveLocal();
            const user = AuthService.getUser();
            if (db && fs && user) {
                try {
                    await fs.setDoc(fs.doc(db, "users", user.uid, "words", target.id), { status: newStatus }, { merge: true });
                } catch (e) {
                    console.error('Cloud update error:', e);
                }
            }
        }
    }

    async function deleteWord(id) {
        words = words.filter(w => w.id !== id);
        saveLocal();
        const user = AuthService.getUser();
        if (db && fs && user) {
            try {
                await fs.deleteDoc(fs.doc(db, "users", user.uid, "words", id));
            } catch (e) {
                console.error('Cloud delete error:', e);
            }
        }
    }

    async function setWords(newWordsArray) {
        words = newWordsArray;
        normalizeTimestamps(words);
        saveLocal();
        const user = AuthService.getUser();
        if (db && fs && user) {
            try {
                const wordsRef = fs.collection(db, "users", user.uid, "words");
                for (const word of words) {
                    delete word.id;
                    const cleanWord = {
                        word: word.word,
                        transcription: word.transcription || '',
                        translation: word.translation,
                        status: word.status || 'red',
                        createdAt: fs.serverTimestamp ? fs.serverTimestamp() : Date.now()
                    };
                    const docRef = await fs.addDoc(wordsRef, cleanWord);
                    word.id = docRef.id;
                    word.createdAt = Date.now();
                    await fs.setDoc(docRef, { id: docRef.id }, { merge: true });
                }
                saveLocal();
            } catch (e) {
                console.error('Cloud batch set error:', e);
            }
        }
    }

    function exportJson() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "words.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    return {
        load,
        save: saveLocal,
        getWords,
        addWord,
        updateStatus,
        deleteWord,
        setWords,
        exportJson,
        syncFromCloud
    };
})();
