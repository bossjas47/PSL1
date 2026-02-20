/**
 * PSL Esport — Shared Firebase Config
 * Firebase client config (public identifier — ไม่ใช่ secret)
 * ความปลอดภัยควบคุมผ่าน Firebase Security Rules
 *
 * ⚠️ Secrets ทั้งหมด (API Key, Webhook, ฯลฯ) → เก็บใน Firestore เท่านั้น
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, browserLocalPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ─── Firebase Public Config ────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyC450kePwL6FdVXUSVli0bEP3DdnQs0qzU",
    authDomain:        "psl-esport.firebaseapp.com",
    projectId:         "psl-esport",
    storageBucket:     "psl-esport.firebasestorage.app",
    messagingSenderId: "225108570173",
    appId:             "1:225108570173:web:b6483c02368908f3783a54"
};

// ─── Singleton: ป้องกัน initializeApp ซ้ำกรณี hot reload ─────────────────────
const app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db   = getFirestore(app);
const auth = getAuth(app);

// ─── Force LOCAL persistence ให้ auth state อยู่ข้ามหน้า ────────────────────────
setPersistence(auth, browserLocalPersistence).catch(() => {});

export { app, db, auth };

// ─── Config Cache ─────────────────────────────────────────────────────────────
let _siteConfig = null, _siteTs = 0;
let _appConfig  = null, _appTs  = 0;
const TTL = 5 * 60 * 1000;

export async function getSiteConfig() {
    if (_siteConfig && Date.now() - _siteTs < TTL) return _siteConfig;
    try {
        const s = await getDoc(doc(db, "system", "settings"));
        _siteConfig = s.exists() ? s.data() : {};
        _siteTs = Date.now();
    } catch { _siteConfig = _siteConfig || {}; }
    return _siteConfig;
}

export async function getAppConfig() {
    if (_appConfig && Date.now() - _appTs < TTL) return _appConfig;
    try {
        const s = await getDoc(doc(db, "system", "config"));
        _appConfig = s.exists() ? s.data() : {};
        _appTs = Date.now();
    } catch { _appConfig = _appConfig || {}; }
    return _appConfig;
}

export async function getEasySlipKey() {
    return (await getAppConfig()).easyslipApiKey || null;
}

export async function initDiscordLink(id = "discordLink") {
    try {
        const cfg = await getSiteConfig();
        const el  = document.getElementById(id);
        if (el && cfg.discordLink) el.href = cfg.discordLink;
    } catch {}
}
