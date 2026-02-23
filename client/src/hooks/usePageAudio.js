import { useEffect, useRef } from "react";

export default function usePageAudio(text, autoPlay = true) {
    const utteranceRef = useRef(null);

    const speak = () => {
        if (!text) return;

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "hi-IN";
        utterance.rate = 1;
        utterance.pitch = 1;

        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (autoPlay && text) {
            speak();
        }

        return () => {
            speechSynthesis.cancel();
        };
    }, [text, autoPlay]);

    return speak; // return replay function
}