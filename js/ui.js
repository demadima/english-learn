/**
 * UI Renderer & View Component Manager
 * Handles DOM rendering, i18n text bindings, size variations, and reveal mode.
 */
const UIRenderer = (() => {
    let activeFilter = 'all';
    let searchQuery = '';
    let currentSize = localStorage.getItem('english_card_size') || 'm';
    let currentRevealMode = localStorage.getItem('english_reveal_translation_mode') || 'hover';

    function setSize(size) {
        currentSize = size;
        localStorage.setItem('english_card_size', size);
        const grid = document.getElementById('wordsGrid');
        if (grid) {
            grid.setAttribute('data-size', size);
        }
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-size') === size);
        });
    }

    function setRevealMode(mode) {
        currentRevealMode = mode;
        localStorage.setItem('english_reveal_translation_mode', mode);
        const grid = document.getElementById('wordsGrid');
        if (grid) {
            grid.setAttribute('data-reveal', mode);
        }
        document.querySelectorAll('.reveal-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-reveal-mode') === mode);
        });
    }

    function setFilter(filter) {
        activeFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
        });
    }

    function setSearchQuery(query) {
        searchQuery = query;
    }

    function updateStats(words) {
        const counts = {
            all: words.length,
            green: words.filter(w => w.status === 'green').length,
            yellow: words.filter(w => w.status === 'yellow').length,
            red: words.filter(w => w.status === 'red').length
        };

        document.getElementById('statTotal').textContent = counts.all;
        document.getElementById('statGreen').textContent = counts.green;
        document.getElementById('statYellow').textContent = counts.yellow;
        document.getElementById('statRed').textContent = counts.red;

        document.getElementById('countAll').textContent = counts.all;
        document.getElementById('countGreen').textContent = counts.green;
        document.getElementById('countYellow').textContent = counts.yellow;
        document.getElementById('countRed').textContent = counts.red;
    }

    function applyLanguage() {
        const lang = I18nService.getLang();
        const t = I18nService.t();

        const langSelect = document.getElementById('langSelect');
        if (langSelect) langSelect.value = lang;

        document.getElementById('appTitle').innerHTML = '<i class="fa-solid fa-graduation-cap"></i> ' + t.title;
        document.getElementById('appSubtitle').textContent = t.subtitle;

        document.getElementById('labelStatTotal').textContent = t.statTotal;
        document.getElementById('labelStatGreen').textContent = t.statGreen;
        document.getElementById('labelStatYellow').textContent = t.statYellow;
        document.getElementById('labelStatRed').textContent = t.statRed;

        document.getElementById('searchInput').placeholder = t.searchPlaceholder;

        document.getElementById('textFilterAll').textContent = t.filterAll;
        document.getElementById('textFilterGreen').textContent = t.filterGreen;
        document.getElementById('textFilterYellow').textContent = t.filterYellow;
        document.getElementById('textFilterRed').textContent = t.filterRed;

        document.getElementById('labelSize').innerHTML = '<i class="fa-solid fa-expand"></i> ' + t.sizeLabel;
        document.getElementById('labelReveal').innerHTML = '<i class="fa-solid fa-eye"></i> ' + t.revealLabel;
        document.getElementById('textRevealHover').textContent = t.revealHover;
        document.getElementById('textRevealAlways').textContent = t.revealAlways;

        document.getElementById('textAddWord').textContent = t.addWordBtn;

        document.getElementById('textExportBtn').textContent = t.exportBtn;
        document.getElementById('textImportBtn').textContent = t.importBtn;

        document.getElementById('modalTitleText').textContent = t.modalTitle;
        document.getElementById('labelNewWord').textContent = t.modalWord;
        document.getElementById('newWord').placeholder = t.modalWordPlaceholder;
        document.getElementById('labelNewTranscription').textContent = t.modalTranscription;
        document.getElementById('newTranscription').placeholder = t.modalTranscriptionPlaceholder;
        document.getElementById('labelNewTranslation').textContent = t.modalTranslation;
        document.getElementById('newTranslation').placeholder = t.modalTranslationPlaceholder;
        document.getElementById('labelNewStatus').textContent = t.modalStatus;

        document.getElementById('optStatusRed').textContent = t.modalStatusRed;
        document.getElementById('optStatusYellow').textContent = t.modalStatusYellow;
        document.getElementById('optStatusGreen').textContent = t.modalStatusGreen;

        document.getElementById('cancelAddModalBtn').textContent = t.btnCancel;
        document.getElementById('submitAddModalBtn').textContent = t.btnAdd;

        renderCards(StorageRepository.getWords());
    }

    function renderCards(words) {
        const grid = document.getElementById('wordsGrid');
        if (!grid) return;

        grid.innerHTML = '';
        grid.setAttribute('data-size', currentSize);
        grid.setAttribute('data-reveal', currentRevealMode);
        const t = I18nService.t();

        const filteredWords = words.filter(item => {
            const matchesFilter = activeFilter === 'all' || item.status === activeFilter;
            const matchesSearch = item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  item.translation.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        if (filteredWords.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-folder-open"></i>
                    <h3>${t.emptyTitle}</h3>
                    <p>${t.emptyDesc}</p>
                </div>
            `;
            return;
        }

        filteredWords.forEach(item => {
            const card = document.createElement('div');
            card.className = `word-card status-${item.status}`;

            card.innerHTML = `
                <div class="card-header">
                    <button class="audio-play-btn" title="Listen">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                    <div class="card-actions">
                        <button class="icon-btn delete-btn" title="${t.confirmDelete}">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </div>

                <div class="word-main">
                    <div class="word-title">${escapeHtml(item.word)}</div>
                    <div class="word-transcription">${escapeHtml(item.transcription || '')}</div>
                </div>

                <div class="translation-container">
                    <div class="translation-mask">
                        <i class="fa-regular fa-eye"></i> ${t.hoverMask}
                    </div>
                    <div class="translation-text">
                        ${escapeHtml(item.translation)}
                    </div>
                </div>

                <div class="status-selector">
                    <button class="status-opt ${item.status === 'green' ? 'active' : ''}" data-status="green">
                        ${t.statusGreenOpt}
                    </button>
                    <button class="status-opt ${item.status === 'yellow' ? 'active' : ''}" data-status="yellow">
                        ${t.statusYellowOpt}
                    </button>
                    <button class="status-opt ${item.status === 'red' ? 'active' : ''}" data-status="red">
                        ${t.statusRedOpt}
                    </button>
                </div>
            `;

            // Audio button
            const audioBtn = card.querySelector('.audio-play-btn');
            audioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                AudioService.speak(item.word, audioBtn);
            });

            // Translation toggle
            const translationBox = card.querySelector('.translation-container');
            translationBox.addEventListener('click', () => {
                translationBox.classList.toggle('revealed');
            });

            // Delete button
            const deleteBtn = card.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`${t.confirmDelete} "${item.word}"?`)) {
                    StorageRepository.deleteWord(item.id);
                    updateStats(StorageRepository.getWords());
                    renderCards(StorageRepository.getWords());
                }
            });

            // Status buttons
            const statusOpts = card.querySelectorAll('.status-opt');
            statusOpts.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newStatus = btn.getAttribute('data-status');
                    StorageRepository.updateStatus(item.id, newStatus);
                    updateStats(StorageRepository.getWords());
                    renderCards(StorageRepository.getWords());
                });
            });

            grid.appendChild(card);
        });
    }

    function escapeHtml(str) {
        return (str || '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    return {
        setSize,
        setRevealMode,
        setFilter,
        setSearchQuery,
        updateStats,
        applyLanguage,
        renderCards,
        getSize: () => currentSize,
        getRevealMode: () => currentRevealMode
    };
})();
