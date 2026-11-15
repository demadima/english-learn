/**
 * Firebase Authentication Service
 * Manages user sign up, sign in, sign out, and auth state observers.
 */
const AuthService = (() => {
    let auth = null;
    let currentUser = null;

    window.addEventListener('firebase-ready', () => {
        auth = window.firebaseAuth;
        const { onAuthStateChanged } = window.firebaseAuthModule;

        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            updateAuthUI(user);
            if (typeof StorageRepository !== 'undefined') {
                StorageRepository.load();
            }
        });
    });

    function getUser() {
        return currentUser;
    }

    async function login(email, password) {
        const { signInWithEmailAndPassword } = window.firebaseAuthModule;
        return await signInWithEmailAndPassword(auth, email, password);
    }

    async function register(email, password) {
        const { createUserWithEmailAndPassword } = window.firebaseAuthModule;
        return await createUserWithEmailAndPassword(auth, email, password);
    }

    async function logout() {
        const { signOut } = window.firebaseAuthModule;
        return await signOut(auth);
    }

    function updateAuthUI(user) {
        const authContainer = document.getElementById('userProfileBar');
        const userEmailSpan = document.getElementById('userEmailSpan');
        const openAuthModalBtn = document.getElementById('openAuthModalBtn');

        if (user) {
            if (openAuthModalBtn) openAuthModalBtn.style.display = 'none';
            if (authContainer) {
                authContainer.style.display = 'flex';
                if (userEmailSpan) userEmailSpan.textContent = user.email;
            }
        } else {
            if (openAuthModalBtn) openAuthModalBtn.style.display = 'inline-flex';
            if (authContainer) authContainer.style.display = 'none';
        }
    }

    return {
        getUser,
        login,
        register,
        logout
    };
})();
