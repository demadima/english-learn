/**
 * Firebase Authentication Service
 * Manages user sign up, sign in, sign out, account deletion, and auth state observers.
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

    async function deleteAccount() {
        if (!currentUser) return;
        const db = window.firebaseDb;
        const fs = window.firebaseFirestore;
        const uid = currentUser.uid;
        const { deleteUser } = window.firebaseAuthModule;

        try {
            // 1. Delete all user words in Firestore
            if (db && fs) {
                const wordsRef = fs.collection(db, "users", uid, "words");
                const snapshot = await fs.getDocs(wordsRef);
                const deletePromises = snapshot.docs.map(docSnap => fs.deleteDoc(docSnap.ref));
                await Promise.all(deletePromises);
            }

            // 2. Delete Firebase Auth user account
            await deleteUser(currentUser);
            localStorage.clear();
            window.location.reload();
        } catch (error) {
            console.error('Delete account error:', error);
            if (error.code === 'auth/requires-recent-login') {
                throw new Error('В целях безопасности для удаления аккаунта требуется повторный вход. Пожалуйста, выйдите из системы, войдите снова и повторите удаление.');
            }
            throw error;
        }
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
        logout,
        deleteAccount
    };
})();
