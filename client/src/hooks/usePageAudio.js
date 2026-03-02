import { useEffect, useRef, useState, useCallback } from "react";

const STORAGE_KEY = "audioEnabled";

export default function usePageAudio() {
    const utteranceRef = useRef(null);
    const [audioEnabled, setAudioEnabled] = useState(() => {
        try {
            const v = localStorage.getItem(STORAGE_KEY);
            return v === null ? true : v === "true";
        } catch (e) {
            return true;
        }
    });

    const speak = useCallback((text, opts = {}) => {
        if (!text) return;
        if (!audioEnabled) return;

        try {
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = opts.lang || "hi-IN";
            utterance.rate = opts.rate || 1;
            utterance.pitch = opts.pitch || 1;

            utteranceRef.current = utterance;
            speechSynthesis.speak(utterance);
        } catch (e) {
            // silence failures in unsupported environments
            // console.warn(e);
        }
    }, [audioEnabled]);

    const toggleAudio = useCallback(() => {
        setAudioEnabled((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, String(next));
            } catch (e) { }
            if (!next) speechSynthesis.cancel();
            return next;
        });
    }, []);

    useEffect(() => {
        return () => {
            try {
                speechSynthesis.cancel();
            } catch (e) { }
        };
    }, []);

    return [speak, audioEnabled, toggleAudio];
}