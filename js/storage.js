/**
 * Storage & Data Repository Module
 * Manages vocabulary state, localStorage persistence, and JSON import/export.
 */
const StorageRepository = (() => {
    let words = [];

    async function load() {
        const stored = localStorage.getItem('english_words_app');
        if (stored) {
            try {
                words = JSON.parse(stored);
                return words;
            } catch (e) {
                console.error('LocalStorage error', e);
            }
        }

        try {
            const response = await fetch('words.json');
            if (response.ok) {
                words = await response.json();
            } else {
                throw new Error('words.json not found');
            }
        } catch (err) {
            if (window.initialWordsData) {
                words = [...window.initialWordsData];
            } else {
                words = [];
            }
        }

        save();
        return words;
    }

    function save() {
        localStorage.setItem('english_words_app', JSON.stringify(words));
    }

    function getWords() {
        return words;
    }

    function addWord(wordObj) {
        words.unshift(wordObj);
        save();
    }

    function updateStatus(id, newStatus) {
        const target = words.find(w => w.id === id);
        if (target && target.status !== newStatus) {
            target.status = newStatus;
            save();
        }
    }

    function deleteWord(id) {
        words = words.filter(w => w.id !== id);
        save();
    }

    function setWords(newWordsArray) {
        words = newWordsArray;
        save();
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
        save,
        getWords,
        addWord,
        updateStatus,
        deleteWord,
        setWords,
        exportJson
    };
})();
