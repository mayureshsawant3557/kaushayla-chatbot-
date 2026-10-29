/**
 * MSBSVET KAUSHALYA AI CHATBOT — INTEGRATION LAYER 3
 * speech_input.js: Browser Speech-to-Text and Frontend Voice Input Coordination.
 * 
 * Responsibilities:
 * 1. Web Speech API (SpeechRecognition / webkitSpeechRecognition) Lifecycle Management.
 * 2. Supported Locales: Marathi ('mr-IN'), Indian English ('en-IN'), and Hindi ('hi-IN').
 * 3. Interim transcript streaming and debounced final transcript submission.
 * 4. Duplicate transcript suppression & repeated event prevention.
 * 5. Audio Context unlocking & state coordination with neural voice playback.
 * 6. Graceful error handling for microphone permissions, network drops, and unsupported browsers.
 */

import {
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    detectLanguage,
    cleanTextForSpeech,
    unlockAudio,
    stopSpeaking
} from './speechUtils.js';

// Supported BCP-47 Speech Recognition Locales
export const SUPPORTED_SPEECH_LOCALES = {
    mr: 'mr-IN',
    en: 'en-IN',
    hi: 'hi-IN'
};

/**
 * Resolves appropriate BCP-47 locale tag from application language key.
 * @param {string} langKey - 'mr', 'en', or 'hi'
 * @returns {string} - e.g. 'mr-IN'
 */
export function resolveSpeechLocale(langKey = 'mr') {
    const key = (langKey || 'mr').toLowerCase();
    return SUPPORTED_SPEECH_LOCALES[key] || SUPPORTED_SPEECH_LOCALES.mr;
}

/**
 * Maps raw browser SpeechRecognitionErrorEvent codes to bilingual user feedback.
 * @param {string} errorCode - Browser error code
 * @param {string} lang - 'mr' or 'en'
 * @returns {string} - User-friendly message
 */
export function getFriendlySpeechErrorMessage(errorCode, lang = 'mr') {
    const isMr = lang === 'mr';
    switch (errorCode) {
        case 'not-allowed':
        case 'service-not-allowed':
            return isMr
                ? 'मायक्रोफोन परवानगी नाकारली आहे. कृपया ब्राउझर सेटिंग्जमध्ये मायक्रोफोन सुरू करा.'
                : 'Microphone permission was denied. Please allow microphone access in your browser.';
        case 'no-speech':
            return isMr
                ? 'कोणताही आवाज ऐकू आला नाही. कृपया पुन्हा बोला.'
                : 'No speech detected. Please try speaking again.';
        case 'network':
            return isMr
                ? 'व्हॉइस इनपुटसाठी नेटवर्क समस्या आली आहे. कृपया इंटरनेट तपासा.'
                : 'Network error encountered during voice recognition. Please check your connection.';
        case 'audio-capture':
            return isMr
                ? 'मायक्रोफोन सापडला नाही किंवा तो सुरू नाही.'
                : 'No microphone was found or audio capture failed.';
        default:
            return isMr
                ? `व्हॉइस इनपुट त्रुटी: ${errorCode}`
                : `Voice input error: ${errorCode}`;
    }
}

/**
 * SpeechInputCoordinator
 * Singleton-capable coordinator managing Web Speech API state, interim streaming,
 * auto-endpointing, and duplicate transcript prevention.
 */
export class SpeechInputCoordinator {
    constructor() {
        this.recognizer = null;
        this.isListening = false;
        this.lastFinalTranscript = '';
        this.lastSubmissionTimestamp = 0;
        this.duplicateWindowMs = 1200; // Prevent resubmitting exact same final transcript within 1.2s
        this.silenceTimeoutId = null;
        this.silenceGraceMs = 1800; // Auto-endpointing grace period
    }

    /**
     * Checks if the active browser supports Web Speech API.
     */
    isSupported() {
        return isSpeechRecognitionSupported();
    }

    /**
     * Initialize and start speech recognition session.
     * 
     * @param {Object} options
     * @param {string} options.lang - 'mr', 'en', or 'hi'
     * @param {Function} options.onStart - Callback on session start
     * @param {Function} options.onInterim - Callback receiving interim transcript string
     * @param {Function} options.onFinal - Callback receiving final debounced transcript string
     * @param {Function} options.onError - Callback receiving error message string
     * @param {Function} options.onEnd - Callback on session completion
     */
    start({ lang = 'mr', onStart, onInterim, onFinal, onError, onEnd } = {}) {
        if (!this.isSupported()) {
            const err = lang === 'mr'
                ? 'आपल्या ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही. कृपया Google Chrome किंवा Microsoft Edge वापरा.'
                : 'Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.';
            if (onError) onError(err);
            return false;
        }

        // 1. Immediately abort any active recognition or neural speech playback
        this.stop();
        stopSpeaking();
        unlockAudio();

        const SpeechRecognition = typeof window !== 'undefined'
            ? (window.SpeechRecognition || window.webkitSpeechRecognition)
            : null;

        if (!SpeechRecognition) {
            return false;
        }

        try {
            this.recognizer = new SpeechRecognition();
            this.recognizer.continuous = false;
            this.recognizer.interimResults = true;
            this.recognizer.lang = resolveSpeechLocale(lang);
            this.recognizer.maxAlternatives = 1;

            this.recognizer.onstart = () => {
                this.isListening = true;
                if (onStart) onStart();
            };

            this.recognizer.onresult = (event) => {
                let interim = '';
                let finalStr = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const res = event.results[i];
                    const text = res[0] ? res[0].transcript : '';
                    if (res.isFinal) {
                        finalStr += text;
                    } else {
                        interim += text;
                    }
                }

                // Handle interim text streaming for immediate visual feedback
                const cleanInterim = interim.trim();
                if (cleanInterim && onInterim) {
                    onInterim(cleanInterim);
                }

                // Handle final verified utterance
                const cleanFinal = finalStr.trim();
                if (cleanFinal) {
                    const now = Date.now();
                    const isDuplicate = (cleanFinal === this.lastFinalTranscript) &&
                                        ((now - this.lastSubmissionTimestamp) < this.duplicateWindowMs);

                    if (!isDuplicate) {
                        this.lastFinalTranscript = cleanFinal;
                        this.lastSubmissionTimestamp = now;

                        // Cleanly stop listening before dispatching final text
                        this.isListening = false;
                        if (onFinal) {
                            onFinal(cleanFinal);
                        }
                    }
                }
            };

            this.recognizer.onerror = (event) => {
                this.isListening = false;
                const errCode = event.error || 'unknown';
                // Silence 'no-speech' gracefully without loud user alarms
                if (errCode === 'no-speech') {
                    if (onEnd) onEnd();
                    return;
                }
                const friendlyMsg = getFriendlySpeechErrorMessage(errCode, lang);
                if (onError) onError(friendlyMsg);
            };

            this.recognizer.onend = () => {
                this.isListening = false;
                if (onEnd) onEnd();
            };

            this.recognizer.start();
            return true;
        } catch (e) {
            this.isListening = false;
            if (onError) {
                onError(getFriendlySpeechErrorMessage('audio-capture', lang));
            }
            return false;
        }
    }

    /**
     * Stop active recognition session cleanly.
     */
    stop() {
        if (this.recognizer) {
            try {
                this.recognizer.onstart = null;
                this.recognizer.onresult = null;
                this.recognizer.onerror = null;
                this.recognizer.onend = null;
                this.recognizer.stop();
            } catch (e) {
                // Ignore if already stopped
            }
            this.recognizer = null;
        }
        this.isListening = false;
        if (this.silenceTimeoutId) {
            clearTimeout(this.silenceTimeoutId);
            this.silenceTimeoutId = null;
        }
    }

    /**
     * Abort active recognition session immediately.
     */
    abort() {
        if (this.recognizer) {
            try {
                this.recognizer.abort();
            } catch (e) {
                // Ignore
            }
            this.recognizer = null;
        }
        this.isListening = false;
    }
}

// Global coordinator singleton
export const speechInputCoordinator = new SpeechInputCoordinator();
export default speechInputCoordinator;
