# Tech Stack & Architecture Overview — English Vocabulary App

This document provides a comprehensive technical breakdown of the architecture, services, and technologies utilized in the **English Vocabulary Learning Web Application**.

---

## 🏗️ 1. Architecture & Design Pattern
The application follows a **Modular MVC + Service Layer** architecture, strictly separated into dedicated ES6 modules to ensure high maintainability, testability, and separation of concerns.

- **`index.html`**: Root markup containing semantic layout elements, modal dialogs, and modular script imports.
- **`css/`**: Modular stylesheets (`main.css` for design tokens & layout variables, `components.css` for UI components, cards, grid size variations, and modals).
- **`js/`**:
  - `i18n.js`: Internationalization dictionary supporting 13 languages.
  - `audio.js`: Multi-tier high-quality text-to-speech audio service (StreamElements & Dictionary audio).
  - `storage.js`: LocalStorage repository & user-scoped Firestore cloud synchronization engine.
  - `auth.js`: Firebase Authentication service (Login, Registration, Logout, Account deletion).
  - `ui.js`: View renderer, card templates, stat counters, and dynamic DOM bindings.
  - `app.js`: Main controller wiring up event listeners, lifecycle, and initialization.

---

## 🌐 2. Frontend & UI Technologies
- **HTML5 & CSS3**: Responsive grid layouts, CSS custom properties (design tokens), flexbox, and glassmorphism styling.
- **Font Awesome (6.4.0)**: Professional icon suite for audio buttons, navigation, status pills, and user profile actions.
- **Google Fonts (Inter)**: High-readability font family across all weights (400 to 800).
- **Vanilla JavaScript (ES6+ Modules)**: Clean, asynchronous code using `async/await`, arrow functions, closures, and IIFE encapsulation.

---

## 🌍 3. Internationalization (i18n)
- Custom localization engine supporting **13 languages**:
  - 🇷🇺 Russian (`ru`)
  - 🇬🇧 English (`en`)
  - 🇺🇦 Ukrainian (`uk`)
  - 🇪🇸 Spanish (`es`)
  - 🇩🇪 German (`de`)
  - 🇫🇷 French (`fr`)
  - 🇮🇹 Italian (`it`)
  - 🇵🇱 Polish (`pl`)
  - 🇵🇹 Portuguese (`pt`)
  - 🇳🇱 Dutch (`nl`)
  - 🇸🇪 Swedish (`sv`)
  - 🇬🇷 Greek (`el`)
  - 🇨🇳 Chinese (`zh`)

---

## 🔊 4. Audio Pronunciation Engine
- **StreamElements TTS API & Free Dictionary API**: Integrates pristine human-like English audio pronunciation streams.
- **Click-Free Lifecycle Management**: Prevents audio overlapping and abrupt waveform cut-offs to eliminate clicking/popping artifacts.

---

## ☁️ 5. Backend & Cloud (Firebase 10.x SDK)
- **Firebase Authentication**: Secure Email/Password authentication, session persistence, and real-time auth state observers.
- **Cloud Firestore (NoSQL Database)**:
  - User-scoped private subcollections: `/users/{userId}/words/{wordId}`.
  - Native Firestore Timestamps (`serverTimestamp()`) for precise chronological sorting.
  - Automatic document ID generation (`addDoc`) for professional database identifiers.
- **Firebase Hosting**:
  - High-performance global CDN deployment.
  - Custom `Cache-Control` header rules (`no-cache, no-store, must-revalidate`) combined with query parameter versioning (`?v=...`) for instant, cache-busting updates upon deployment.

---

## 🛠️ 6. Tooling, DevOps & Automation
- **Git & GitHub**: Version control and public repository hosting (`demadima/english-learn`).
- **Firebase CLI**: Hosting configuration, security rules enforcement (`firestore.rules`), and deployment orchestration (`firebase deploy`).
- **Python (Firebase Admin SDK)**: Server-side database seed and management automation scripts (`seed_user.py`).
