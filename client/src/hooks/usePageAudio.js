import { useEffect, useRef, useState, useCallback } from "react";

// const STORAGE_KEY = "audioEnabled";


// export default function usePageAudio() {
//     const utteranceRef = useRef(null);
//     const [audioEnabled, setAudioEnabled] = useState(() => {
//         try {
//             const v = localStorage.getItem(STORAGE_KEY);
//             return v === null ? true : v === "true";
//         } catch (e) {
//             return true;
//         }
//     });

//     const speak = useCallback((text, opts = {}) => {
//         if (!text) return;
//         if (!audioEnabled) return;

//         try {
//             speechSynthesis.cancel();

//             const utterance = new SpeechSynthesisUtterance(text);
//             utterance.lang = opts.lang || "hi-IN";
//             utterance.rate = opts.rate || 1;
//             utterance.pitch = opts.pitch || 1;

//             utteranceRef.current = utterance;
//             speechSynthesis.speak(utterance);
//         } catch (e) {
//             // silence failures in unsupported environments
//             // console.warn(e);
//         }
//     }, [audioEnabled]);

//     const toggleAudio = useCallback(() => {
//         setAudioEnabled((prev) => {
//             const next = !prev;
//             try {
//                 localStorage.setItem(STORAGE_KEY, String(next));
//             } catch (e) { }
//             if (!next) speechSynthesis.cancel();
//             return next;
//         });
//     }, []);

//     useEffect(() => {
//         return () => {
//             try {
//                 speechSynthesis.cancel();
//             } catch (e) { }
//         };
//     }, []);

//     return [speak, audioEnabled, toggleAudio];
// }

const STORAGE_KEY = "audio_enabled";

// ✅ Find best Hindi voice available on device
const getBestHindiVoice = () => {
    const voices = speechSynthesis.getVoices();

    // Priority order — best to worst
    const preferred = [
        voices.find(v => v.lang === "hi-IN" && v.localService),  // local Hindi
        voices.find(v => v.lang === "hi-IN"),                      // any Hindi
        voices.find(v => v.lang.startsWith("hi")),                 // hi-*
        voices.find(v => v.lang === "en-IN"),                      // Indian English fallback
        voices.find(v => v.lang.startsWith("en")),                 // any English
    ];

    return preferred.find(Boolean) || null;
};

export default function usePageAudio() {
    const utteranceRef = useRef(null);
    const voiceRef = useRef(null);

    const [audioEnabled, setAudioEnabled] = useState(() => {
        try {
            const v = localStorage.getItem(STORAGE_KEY);
            return v === null ? true : v === "true";
        } catch (e) {
            return true;
        }
    });

    // ✅ Load voices — they load async on many browsers/devices
    useEffect(() => {
        const loadVoices = () => {
            voiceRef.current = getBestHindiVoice();
        };

        loadVoices(); // try immediately

        // ✅ Samsung/Chrome fires this event when voices are ready
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const speak = useCallback((text, opts = {}) => {
        if (!text || !audioEnabled) return;

        try {
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // ✅ Set best available voice
            if (voiceRef.current) {
                utterance.voice = voiceRef.current;
                utterance.lang = voiceRef.current.lang;
            } else {
                utterance.lang = "hi-IN";
            }

            // ✅ Tuned for Samsung A30 — slower rate, slightly lower pitch
            utterance.rate = opts.rate || 0.85;   // slower = clearer on budget phones
            utterance.pitch = opts.pitch || 0.9;  // slightly lower = more natural
            utterance.volume = opts.volume || 1;

            // ✅ Samsung A30 bug — long text gets cut off
            // Split into chunks if text is long
            if (text.length > 100) {
                const chunks = splitTextIntoChunks(text, 100);
                chunks.forEach((chunk, i) => {
                    const u = new SpeechSynthesisUtterance(chunk);
                    if (voiceRef.current) {
                        u.voice = voiceRef.current;
                        u.lang = voiceRef.current.lang;
                    } else {
                        u.lang = "hi-IN";
                    }
                    u.rate = opts.rate || 0.85;
                    u.pitch = opts.pitch || 0.9;
                    u.volume = 1;
                    speechSynthesis.speak(u);
                });
                return;
            }

            utteranceRef.current = utterance;
            speechSynthesis.speak(utterance);

        } catch (e) {
            // silence failures
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
            try { speechSynthesis.cancel(); } catch (e) { }
        };
    }, []);

    return [speak, audioEnabled, toggleAudio];
}

// ✅ Split long text at sentence boundaries
const splitTextIntoChunks = (text, maxLen) => {
    const chunks = [];
    // split at । or , or . 
    const sentences = text.split(/(?<=[।,\.])\s*/);
    let current = "";

    for (const sentence of sentences) {
        if ((current + sentence).length > maxLen) {
            if (current) chunks.push(current.trim());
            current = sentence;
        } else {
            current += sentence + " ";
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.length ? chunks : [text];
};