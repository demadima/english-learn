/**
 * Main Application Controller
 * Orchestrates models, services, events, and views.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Audio Service
    AudioService.init();

    // 2. Load Words Data
    const words = await StorageRepository.load();

    // 3. Initialize UI Components, Reveal Mode & Language
    UIRenderer.setSize(UIRenderer.getSize());
    UIRenderer.setRevealMode(UIRenderer.getRevealMode());
    UIRenderer.setSortMode(UIRenderer.getSortMode());
    UIRenderer.updateStats(words);
    UIRenderer.applyLanguage();

    // 4. Bind Global Event Listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Language Switcher
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            I18nService.setLang(e.target.value);
            UIRenderer.applyLanguage();
        });
    }

    // Size Selector Buttons
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedSize = btn.getAttribute('data-size');
            UIRenderer.setSize(selectedSize);
        });
    });

    // Reveal Translation Mode Selector Buttons
    const revealBtns = document.querySelectorAll('.reveal-btn');
    revealBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-reveal-mode');
            UIRenderer.setRevealMode(mode);
        });
    });

    // Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            UIRenderer.setFilter(filter);
            UIRenderer.renderCards(StorageRepository.getWords());
        });
    });

    // Search Bar Input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            UIRenderer.setSearchQuery(e.target.value);
            UIRenderer.renderCards(StorageRepository.getWords());
        });
    }

    // Sort Select Handler
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            UIRenderer.setSortMode(e.target.value);
        });
    }

    // Export JSON Button
    const exportBtn = document.getElementById('exportJsonBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            StorageRepository.exportJson();
        });
    }

    // Import JSON File Button
    const importBtn = document.getElementById('importJsonBtn');
    const importInput = document.getElementById('importJsonInput');

    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());

        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const importedWords = JSON.parse(event.target.result);
                    if (Array.isArray(importedWords)) {
                        UIRenderer.showLoader("Загрузка и сохранение слов в базу...");
                        await StorageRepository.setWords(importedWords);
                        UIRenderer.hideLoader();

                        UIRenderer.updateStats(StorageRepository.getWords());
                        UIRenderer.renderCards(StorageRepository.getWords());

                        const t = I18nService.t();
                        alert(`${t.alertImportSuccess} ${importedWords.length}`);
                    } else {
                        alert('Invalid JSON format');
                    }
                } catch (err) {
                    UIRenderer.hideLoader();
                    const t = I18nService.t();
                    alert(`${t.alertImportError} ${err.message}`);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });
    }

    // Auth Modal & Form Handlers
    const authModal = document.getElementById('authModal');
    const openAuthModalBtn = document.getElementById('openAuthModalBtn');
    const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
    const cancelAuthModalBtn = document.getElementById('cancelAuthModalBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authForm = document.getElementById('authForm');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    let authMode = 'login'; // 'login' or 'register'

    if (authModal && openAuthModalBtn) {
        const openAuth = () => authModal.classList.add('active');
        const closeAuth = () => {
            authModal.classList.remove('active');
            if (authForm) authForm.reset();
            const err = document.getElementById('authErrorMsg');
            if (err) err.style.display = 'none';
        };

        openAuthModalBtn.addEventListener('click', openAuth);
        if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', closeAuth);
        if (cancelAuthModalBtn) cancelAuthModalBtn.addEventListener('click', closeAuth);

        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeAuth();
        });

        if (tabLoginBtn && tabRegisterBtn) {
            tabLoginBtn.addEventListener('click', () => {
                authMode = 'login';
                tabLoginBtn.classList.add('active');
                tabRegisterBtn.classList.remove('active');
                const t = I18nService.t();
                document.getElementById('submitAuthBtn').textContent = t.submitLogin;
            });

            tabRegisterBtn.addEventListener('click', () => {
                authMode = 'register';
                tabRegisterBtn.classList.add('active');
                tabLoginBtn.classList.remove('active');
                const t = I18nService.t();
                document.getElementById('submitAuthBtn').textContent = t.submitRegister;
            });
        }

        if (authForm) {
            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('authEmail').value.trim();
                const password = document.getElementById('authPassword').value.trim();
                const errDiv = document.getElementById('authErrorMsg');

                try {
                    if (errDiv) errDiv.style.display = 'none';
                    if (authMode === 'login') {
                        await AuthService.login(email, password);
                    } else {
                        await AuthService.register(email, password);
                    }
                    closeAuth();
                } catch (err) {
                    if (errDiv) {
                        errDiv.textContent = err.message;
                        errDiv.style.display = 'block';
                    }
                }
            });
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await AuthService.logout();
                window.location.reload();
            } catch (err) {
                console.error('Logout error', err);
            }
        });
    }

    // Modal Status Selector Pills
    const modalStatusOpts = document.querySelectorAll('.modal-status-opt');
    modalStatusOpts.forEach(btn => {
        btn.addEventListener('click', () => {
            modalStatusOpts.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const statusInput = document.getElementById('newStatus');
            if (statusInput) {
                statusInput.value = btn.getAttribute('data-status');
            }
        });
    });

    // Add Word Modal Dialog Handlers
    const modal = document.getElementById('addWordModal');
    const openModalBtn = document.getElementById('openAddModalBtn');
    const closeModalBtn = document.getElementById('closeAddModalBtn');
    const cancelModalBtn = document.getElementById('cancelAddModalBtn');
    const addForm = document.getElementById('addWordForm');

    if (modal && openModalBtn && addForm) {
        const openModal = () => {
            const user = AuthService.getUser();
            if (!user) {
                const t = I18nService.t();
                alert(t.authRequiredMsg);
                const authModal = document.getElementById('authModal');
                if (authModal) authModal.classList.add('active');
                return;
            }
            modal.classList.add('active');
        };
        const closeModal = () => {
            modal.classList.remove('active');
            addForm.reset();
            modalStatusOpts.forEach(b => b.classList.remove('active'));
            const redBtn = document.querySelector('.modal-status-opt.red');
            if (redBtn) redBtn.classList.add('active');
            const statusInput = document.getElementById('newStatus');
            if (statusInput) statusInput.value = 'red';
        };

        openModalBtn.addEventListener('click', openModal);
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const wordVal = document.getElementById('newWord').value.trim();
            const transVal = document.getElementById('newTranscription').value.trim();
            const translationVal = document.getElementById('newTranslation').value.trim();
            const statusVal = document.getElementById('newStatus').value || 'red';

            if (!wordVal || !translationVal) return;

            const newEntry = {
                id: Date.now().toString(),
                word: wordVal,
                transcription: transVal,
                translation: translationVal,
                status: statusVal
            };

            StorageRepository.addWord(newEntry);
            UIRenderer.updateStats(StorageRepository.getWords());
            UIRenderer.renderCards(StorageRepository.getWords());
            closeModal();
            AudioService.speak(newEntry.word);
        });
    }
}
