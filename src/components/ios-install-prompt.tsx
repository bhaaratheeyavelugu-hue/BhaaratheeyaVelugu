"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IOSInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Detect iOS (iPhone, iPad, iPod)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        // Also catch newer iPads requesting desktop site
        const isMacTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

        // Detect if already installed & running in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone === true);

        // Check if user dismissed it previously
        const hasPromptBeenDismissed = localStorage.getItem("iosInstallPromptDismissed") === "true";

        if ((isIOS || isMacTouch) && !isStandalone && !hasPromptBeenDismissed) {
            // Delay prompt slightly so it's not jarring on infinite loop
            const timer = setTimeout(() => setShowPrompt(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismissPrompt = () => {
        setShowPrompt(false);
        localStorage.setItem("iosInstallPromptDismissed", "true");
    };

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="fixed bottom-4 left-4 right-4 bg-[var(--paper-elevated)] border border-[var(--paper-border)] shadow-xl p-4 rounded-xl z-[9999] flex items-start gap-4"
            >
                <div className="bg-[var(--paper)] rounded-lg p-2.5 shrink-0 shadow-sm border border-[var(--paper-border)]">
                    <img src="/logo.png" alt="App Icon" className="w-10 h-10 object-contain" />
                </div>
                <div className="flex-1">
                    <h3 className="text-[var(--ink)] font-bold mb-1 text-sm">Install App</h3>
                    <p className="text-[var(--ink-muted)] text-xs leading-relaxed">
                        Read Bhaaratheeya Velugu easily! Tap <span className="inline-flex items-center justify-center bg-gray-100 rounded px-1.5 py-0.5 text-blue-500 mx-0.5 border border-gray-200"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></span> and then <strong>"Add to Home Screen"</strong>
                    </p>
                </div>
                <button onClick={dismissPrompt} className="text-[var(--ink-muted)] hover:text-[var(--ink)] p-1 -mr-2 -mt-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
