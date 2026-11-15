/**
 * Audio Speech Synthesis Service
 * Handles SpeechSynthesis API & Google TTS fallback with overlap prevention.
 */
const AudioService = (() => {
    let currentAudio = null;

    function init() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
            }
        }
    }

    function stopAll() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        document.querySelectorAll('.audio-play-btn').forEach(btn => btn.classList.remove('playing'));
    }

    function speak(wordText, buttonElem) {
        stopAll();

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(wordText);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;

            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const enVoice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));
                if (enVoice) utterance.voice = enVoice;
            }

            if (buttonElem) buttonElem.classList.add('playing');

            utterance.onend = () => {
                if (buttonElem) buttonElem.classList.remove('playing');
            };

            utterance.onerror = (e) => {
                if (buttonElem) buttonElem.classList.remove('playing');
                if (e && (e.error === 'canceled' || e.error === 'interrupted')) {
                    return;
                }
                playGoogleTts(wordText, buttonElem);
            };

            window.speechSynthesis.speak(utterance);
        } else {
            playGoogleTts(wordText, buttonElem);
        }
    }

    function playGoogleTts(wordText, buttonElem) {
        stopAll();
        if (buttonElem) buttonElem.classList.add('playing');
        currentAudio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(wordText)}`);

        currentAudio.onended = () => {
            if (buttonElem) buttonElem.classList.remove('playing');
        };
        currentAudio.onerror = () => {
            if (buttonElem) buttonElem.classList.remove('playing');
        };
        currentAudio.play().catch(e => {
            if (buttonElem) buttonElem.classList.remove('playing');
            console.log('Audio error:', e);
        });
    }

    return {
        init,
        stopAll,
        speak
    };
})();
