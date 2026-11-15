/**
 * Audio Service using Native Web Speech API (W3C Standard)
 * 100% reliable, zero network dependency, no CORS blocks, instant execution.
 */
const AudioService = (() => {
    function init() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = () => {
                    window.speechSynthesis.getVoices();
                };
            }
        }
    }

    function stopAll() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        document.querySelectorAll('.audio-play-btn').forEach(btn => btn.classList.remove('playing'));
    }

    function speak(wordText, buttonElem) {
        stopAll();

        if (!('speechSynthesis' in window)) {
            alert('Speech synthesis is not supported in your browser.');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(wordText);
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        // Select best available English voice
        const availableVoices = window.speechSynthesis.getVoices();
        const enVoice = availableVoices.find(v => v.lang === 'en-US' || v.lang === 'en_US') ||
                        availableVoices.find(v => v.lang && v.lang.startsWith('en')) ||
                        availableVoices[0];

        if (enVoice) {
            utterance.voice = enVoice;
        }

        if (buttonElem) {
            buttonElem.classList.add('playing');
        }

        utterance.onend = () => {
            if (buttonElem) buttonElem.classList.remove('playing');
        };

        utterance.onerror = (e) => {
            if (buttonElem) buttonElem.classList.remove('playing');
            console.log('Speech error:', e);
        };

        window.speechSynthesis.speak(utterance);
    }

    return {
        init,
        stopAll,
        speak
    };
})();
