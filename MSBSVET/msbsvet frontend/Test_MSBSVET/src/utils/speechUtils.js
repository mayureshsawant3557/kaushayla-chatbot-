/**
 * speechUtils.js
 * Unified Speech-to-Text (STT) and Text-to-Speech (TTS) utilities for MSBSVET AI Assistant.
 * Preserves Header.jsx screen-reader voice selection patterns and priority rules.
 */

/**
 * Remove markdown symbols, raw URLs, code fences, and emojis so speech sounds natural.
 */
export function cleanTextForSpeech(rawText) {
    if (!rawText) return '';

    let text = rawText;

    // Remove markdown code fences and code blocks
    text = text.replace(/```[\s\S]*?```/g, ' ');
    text = text.replace(/`([^`]+)`/g, '$1');

    // Remove URLs
    text = text.replace(/https?:\/\/[^\s)]+/g, ' ');

    // Convert markdown links [Label](url) -> Label
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove markdown headers, bold, italics, strikethrough, blockquotes
    text = text.replace(/^#+\s+/gm, ' ');
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
    text = text.replace(/(\*|_)(.*?)\1/g, '$2');
    text = text.replace(/~~(.*?)~~/g, '$1');
    text = text.replace(/^\s*>\s+/gm, ' ');

    // Remove bullet points and numbered list markers
    text = text.replace(/^\s*[-*+]\s+/gm, ' ');
    text = text.replace(/^\s*\d+\.\s+/gm, ' ');

    // Remove emojis and symbols
    text = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');

    // Remove excessive symbols and whitespace
    text = text.replace(/[|\\~^_{}[\]]/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}

/**
 * Check if browser supports Web Speech Synthesis.
 */
export function isSpeechSynthesisSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Check if browser supports Web Speech Recognition.
 */
export function isSpeechRecognitionSupported() {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

/**
 * Select the best available voice based on language matching Header.jsx priority.
 */
/**
 * Select the best available voice based on language matching Header.jsx priority.
 * Strictly avoids using Hindi if any Marathi voice is available in the browser.
 */
/**
 * Language detector supporting Devanagari Marathi, Roman Marathi, and English.
 */
export function detectLanguage(text) {
    if (!text || typeof text !== 'string') return 'mr';
    
    // 1. Check for Devanagari Unicode characters (Marathi)
    if (/[\u0900-\u097F]/.test(text)) {
        return 'mr';
    }

    // 2. Check for common Roman Marathi keywords
    const lower = text.toLowerCase();
    const marathiRomanKeywords = [
        'aahe', 'ahe', 'mala', 'majha', 'maza', 'maze', 'tumche', 'tumcha',
        'kiti', 'kuthe', 'kasa', 'kashi', 'karaycha', 'karaychi', 'karayche',
        'shikaycha', 'namaskar', 'dakhva', 'dakhav', 'sangaa', 'sang', 'kay',
        'bharun', 'chala', 'nako', 'chukla', 'ho', 'nahit', 'nav', 'gav', 'shikshan'
    ];
    if (marathiRomanKeywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower))) {
        return 'mr';
    }

    // Default to English
    return 'en';
}

/**
 * Select the best available voice strictly based on language.
 * Strict rule: NEVER select a Hindi voice just because Marathi is unavailable.
 */
export function getVoiceByLanguage(availableVoices, lang) {
    if (!availableVoices || availableVoices.length === 0) return null;

    if (lang === 'mr') {
        // 1. Strictly look for genuine Marathi voices first
        const marathiVoices = availableVoices.filter((v) => {
            const l = (v.lang || '').toLowerCase();
            const n = (v.name || '').toLowerCase();
            return l === 'mr-in' || l === 'mr' || l.startsWith('mr') || n.includes('marathi') || n.includes('मराठी');
        });

        if (marathiVoices.length > 0) {
            return (
                marathiVoices.find((v) => v.lang === 'mr-IN') ||
                marathiVoices.find((v) => v.name.includes('Google') || v.name.includes('Microsoft')) ||
                marathiVoices[0]
            );
        }

        // 2. If no dedicated Marathi voice installed in OS, use Header.jsx fallback priority for Devanagari phonetics
        const indianFallbacks = [
            availableVoices.find((v) => v.lang === 'hi-IN'),
            availableVoices.find((v) => (v.lang || '').includes('hi')),
            availableVoices.find((v) => (v.lang || '').includes('IN')),
        ];
        for (const voice of indianFallbacks) {
            if (voice) return voice;
        }

        return availableVoices.find((v) => v.default) || availableVoices[0] || null;
    }

    // English: Prefer Indian English (en-IN) for local terms, then en-US, en-GB
    const englishVoicePriority = [
        availableVoices.find((v) => v.lang === 'en-IN'),
        availableVoices.find((v) => (v.lang || '').includes('en-IN')),
        availableVoices.find((v) => v.lang === 'en-US'),
        availableVoices.find((v) => v.lang === 'en-GB'),
        availableVoices.find((v) => (v.lang || '').toLowerCase().startsWith('en')),
    ];
    for (const voice of englishVoicePriority) {
        if (voice) return voice;
    }
    return availableVoices.find((v) => v.default) || availableVoices[0] || null;
}

// Track active speech session to prevent overlap, duplicate playback, or orphaned loops
let activeSpeechSessionId = 0;
let currentAudio = null;
let currentAudioUrl = null;
let _sharedAudioContext = null;
let _currentSourceNode = null;
let _hasUnlockedAudio = false;

/**
 * Get or initialize persistent AudioContext for web audio playback.
 */
export function getSharedAudioContext() {
    if (typeof window === 'undefined') return null;
    try {
        if (!_sharedAudioContext) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                _sharedAudioContext = new AudioCtx();
            }
        }
        if (_sharedAudioContext && _sharedAudioContext.state === 'suspended') {
            _sharedAudioContext.resume().catch(() => {});
        }
    } catch (e) {
        console.warn('[Kaushalya Voice] AudioContext init warning:', e);
    }
    return _sharedAudioContext;
}

/**
 * Prime and unlock browser audio playback on user gesture.
 * Can be called multiple times safely.
 */
export function unlockAudio() {
    try {
        const ctx = getSharedAudioContext();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        if (!_hasUnlockedAudio) {
            // Play minimal silent audio buffer to unlock HTMLAudioElement in Chrome/Edge
            const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
            silentAudio.volume = 0.01;
            const p = silentAudio.play();
            if (p !== undefined) {
                p.then(() => {
                    _hasUnlockedAudio = true;
                    if (typeof window !== 'undefined') {
                        window.__MSBSVET_AUDIO_UNLOCKED = true;
                    }
                }).catch(() => {});
            }
        }
    } catch (e) {
        // Silently ignore unlock errors
    }
}

// Auto-register interaction listeners so the very first tap or click unlocks audio
if (typeof window !== 'undefined') {
    const handleInitialUserGesture = () => {
        unlockAudio();
    };
    ['click', 'touchstart', 'keydown'].forEach(evt => {
        window.addEventListener(evt, handleInitialUserGesture, { passive: true, once: false });
    });
}

// Playback watchdog timer to prevent getting stuck in "Speaking..." state
let _speechWatchdogTimer = null;
function clearSpeechWatchdog() {
    if (_speechWatchdogTimer) {
        clearTimeout(_speechWatchdogTimer);
        _speechWatchdogTimer = null;
    }
}
function armSpeechWatchdog(sessionId, timeoutMs, onTimeout) {
    clearSpeechWatchdog();
    _speechWatchdogTimer = setTimeout(() => {
        if (sessionId === activeSpeechSessionId) {
            console.warn(`[Kaushalya Voice] [SID:${sessionId}] Playback watchdog expired (${timeoutMs}ms). Resetting state.`);
            stopSpeaking();
            if (onTimeout) onTimeout();
        }
    }, timeoutMs);
}

/**
 * Stop any currently active speech synthesis or neural audio stream immediately.
 */
export function stopSpeaking() {
    activeSpeechSessionId++; // Invalidate any running sentence chunk loop or fetch promise
    clearSpeechWatchdog();

    // Immediately stop active Web Audio BufferSourceNode
    if (_currentSourceNode) {
        try {
            _currentSourceNode.onended = null;
            _currentSourceNode.stop();
            _currentSourceNode.disconnect();
        } catch (e) {
            // Ignore if already stopped
        }
        _currentSourceNode = null;
    }

    // Immediately stop and destroy neural HTML5 audio playback without triggering onerror
    if (currentAudio) {
        try {
            currentAudio.onplay = null;
            currentAudio.onended = null;
            currentAudio.onerror = null;
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio.src = '';
        } catch (e) {
            console.warn('Error stopping neural audio:', e);
        }
        currentAudio = null;
    }
    if (currentAudioUrl) {
        try {
            URL.revokeObjectURL(currentAudioUrl);
        } catch (e) {}
        currentAudioUrl = null;
    }

    // Stop browser Web Speech Synthesis
    if (isSpeechSynthesisSupported()) {
        try {
            window.speechSynthesis.cancel();
        } catch (e) {
            console.warn('Error stopping speech synthesis:', e);
        }
    }
}

/**
 * Check if neural audio or Web Audio is currently playing.
 */
export function isSpeaking() {
    return _currentSourceNode !== null || (currentAudio !== null && !currentAudio.paused);
}

/**
/**
 * Split text into natural sentence/clause chunks for speech synthesis.
 * Uses punctuation marks (. ? ! । \n) while keeping chunks under maxChars.
 */
export function splitTextIntoSpeechChunks(text, maxChars = 110) {
    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return [];

    const rawParts = cleaned.split(/([।\.!?\n:;]+)/);
    const sentences = [];
    let temp = '';
    for (const part of rawParts) {
        if (!part) continue;
        temp += part;
        if (/[।\.!?\n:;]/.test(part)) {
            const s = temp.trim();
            if (s) sentences.push(s);
            temp = '';
        }
    }
    if (temp.trim()) sentences.push(temp.trim());
    if (sentences.length === 0) sentences.push(cleaned);

    const chunks = [];
    let remainingSentences = sentences;
    if (sentences.length > 1 && sentences[0].length <= maxChars) {
        chunks.push(sentences[0]);
        remainingSentences = sentences.slice(1);
    }

    let current = '';
    for (const s of remainingSentences) {
        if (!current) {
            current = s;
        } else if ((current + ' ' + s).length <= maxChars) {
            current = `${current} ${s}`.trim();
        } else {
            chunks.push(current);
            current = s;
        }
    }
    if (current) chunks.push(current);

    // If any chunk is still longer than maxChars, break by spaces
    const finalChunks = [];
    for (const c of chunks) {
        if (c.length <= maxChars) {
            finalChunks.push(c);
        } else {
            const words = c.split(' ');
            let sub = '';
            for (const w of words) {
                if (!sub) {
                    sub = w;
                } else if ((sub + ' ' + w).length <= maxChars) {
                    sub = `${sub} ${w}`;
                } else {
                    finalChunks.push(sub.trim());
                    sub = w;
                }
            }
            if (sub.trim()) finalChunks.push(sub.trim());
        }
    }

    return finalChunks.filter(c => c && c.trim().length > 0);
}

export function splitIntoSentences(text) {
    return splitTextIntoSpeechChunks(text);
}

/**
 * Prepare text for spoken output:
 * Cleans markdown, URLs, and formatting without discarding entire answers.
 */
export function prepareTextForSpeech(rawText) {
    return cleanTextForSpeech(rawText);
}

/**
 * Play speech via Web Speech API as a fallback.
 */
function speakViaWebSpeech(textToSpeak, lang, sessionId, onStart, onEnd, onError) {
    if (!isSpeechSynthesisSupported()) {
        if (onError) onError(new Error("Web Speech Synthesis unsupported"));
        if (onEnd) onEnd();
        return;
    }
    try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        const voices = window.speechSynthesis.getVoices();
        const voice = getVoiceByLanguage(voices, lang);
        if (voice) utterance.voice = voice;
        utterance.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
        utterance.rate = 1.0;
        utterance.onstart = () => {
            if (sessionId === activeSpeechSessionId && onStart) onStart();
        };
        utterance.onend = () => {
            if (sessionId === activeSpeechSessionId && onEnd) onEnd();
        };
        utterance.onerror = (e) => {
            if (sessionId === activeSpeechSessionId) {
                console.warn('[Kaushalya Voice] Web Speech utterance error:', e);
                if (onError) onError(e);
                if (onEnd) onEnd(); // Guarantee reset so UI never gets stuck
            }
        };
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.error('[Kaushalya Voice] Web Speech fallback failed:', e);
        if (onError) onError(e);
        if (onEnd) onEnd();
    }
}

/**
 * Continuously speak text aloud using Somya-IndicTTS GGUF engine via backend service.
 * Plays sequential sentence chunks with prefetching for gapless, continuous speech.
 * 
 * @param {string} text - The text to speak
 * @param {string} lang - 'mr' or 'en'
 * @param {function} onStart - Callback when speech starts
 * @param {function} onEnd - Callback when speech finishes
 * @param {function} onError - Callback if speech fails
 * @returns {number} Session ID of the active speech
 */
export function speakText(text, lang = 'mr', { onStart, onEnd, onError } = {}) {
    // Immediately stop any currently playing speech or session
    stopSpeaking();
    unlockAudio();

    const chunks = splitTextIntoSpeechChunks(text);
    if (!chunks.length) {
        if (onEnd) onEnd();
        return null;
    }

    const sessionId = ++activeSpeechSessionId;
    const AI_BACKEND_URL = (
        (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AI_BACKEND_URL)
            ? import.meta.env.VITE_AI_BACKEND_URL
            : (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL
                ? `${import.meta.env.VITE_BACKEND_URL}/api`
                : '/api')
    ).replace(/\/+$/, '');

    const normalizedLang = (lang === 'mr' || lang === 'mr-IN' || lang === 'marathi')
        ? 'mr'
        : ((lang === 'hi' || lang === 'hi-IN' || lang === 'hindi') ? 'hi' : 'en');
    const selectedEngine = normalizedLang === 'mr' ? 'somya' : 'google';
    const allowFallback = normalizedLang !== 'mr';
    console.log(`[Kaushalya Voice] [SID:${sessionId}] Starting playback pipeline for ${chunks.length} chunk(s) via ${selectedEngine.toUpperCase()} (${normalizedLang})`);

    // Arm initial watchdog (will be refreshed as chunks play)
    armSpeechWatchdog(sessionId, 45000, () => {
        if (onEnd) onEnd();
    });

    let currentChunkIdx = 0;
    let hasTriggeredStart = false;
    const chunkPromises = {};
    const decodedBufferPromises = {};
    const abortController = new AbortController();

    const fetchChunkBuffer = (index) => {
        if (index >= chunks.length) return null;
        if (chunkPromises[index]) return chunkPromises[index];

        const targetText = chunks[index];
        const timeoutId = setTimeout(() => {
            try { abortController.abort(); } catch (e) {}
        }, 40000);

        const p = fetch(`${AI_BACKEND_URL}/tts/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: targetText,
                language: normalizedLang,
                engine: selectedEngine,
                speed: 1.12,
                allow_fallback: allowFallback
            }),
            signal: abortController.signal
        }).then(async (res) => {
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`TTS server HTTP ${res.status}`);
            const provider = res.headers.get('X-TTS-Provider') || res.headers.get('X-TTS-Engine') || 'somya';
            const isFallback = res.headers.get('X-TTS-Fallback') === 'true';
            if (isFallback) {
                console.warn(`[Kaushalya Voice] [SID:${sessionId}] Diagnostic Notice: Fallback provider used: ${provider}`);
            } else {
                console.log(`[Kaushalya Voice] [SID:${sessionId}] Verified Somya IndicTTS audio received (${provider})`);
            }
            return res.arrayBuffer();
        }).catch(err => {
            clearTimeout(timeoutId);
            throw err;
        });

        chunkPromises[index] = p;
        return p;
    };

    const getDecodedBuffer = (index) => {
        if (decodedBufferPromises[index]) return decodedBufferPromises[index];
        const rawPromise = fetchChunkBuffer(index);
        if (!rawPromise) return null;

        const audioCtx = getSharedAudioContext();
        if (!audioCtx || typeof audioCtx.decodeAudioData !== 'function') {
            return null;
        }

        const p = rawPromise.then(async (arrayBuffer) => {
            if (audioCtx.state === 'suspended') {
                await audioCtx.resume().catch(() => {});
            }
            return await audioCtx.decodeAudioData(arrayBuffer.slice(0));
        });

        decodedBufferPromises[index] = p;
        return p;
    };

    // Prefetch chunk 0 first without colliding on single-slot GPU
    fetchChunkBuffer(0);
    getDecodedBuffer(0);

    const playNextChunk = async () => {
        if (sessionId !== activeSpeechSessionId) return;

        if (currentChunkIdx >= chunks.length) {
            // All chunks played continuously to completion
            console.log(`[Kaushalya Voice] [SID:${sessionId}] Completed playback of all ${chunks.length} chunk(s).`);
            clearSpeechWatchdog();
            stopSpeaking();
            if (onEnd) onEnd();
            return;
        }

        const idx = currentChunkIdx;
        const chunkText = chunks[idx];

        // Prefetch upcoming chunk in advance
        if (idx + 1 < chunks.length) {
            fetchChunkBuffer(idx + 1);
            getDecodedBuffer(idx + 1);
        }

        try {
            // TIER 1: Web Audio API playback using pre-decoded buffer
            const audioCtx = getSharedAudioContext();
            const decodedPromise = getDecodedBuffer(idx);

            if (audioCtx && decodedPromise) {
                try {
                    const audioBuffer = await decodedPromise;
                    if (sessionId !== activeSpeechSessionId) return;

                    if (!hasTriggeredStart) {
                        hasTriggeredStart = true;
                        if (onStart) onStart();
                    }

                    // Refresh watchdog based on current buffer duration
                    armSpeechWatchdog(sessionId, Math.max(12000, (audioBuffer.duration + 6) * 1000), () => {
                        if (onEnd) onEnd();
                    });

                    const sourceNode = audioCtx.createBufferSource();
                    sourceNode.buffer = audioBuffer;
                    sourceNode.connect(audioCtx.destination);
                    _currentSourceNode = sourceNode;

                    sourceNode.onended = () => {
                        if (sessionId === activeSpeechSessionId) {
                            _currentSourceNode = null;
                            currentChunkIdx++;
                            playNextChunk();
                        }
                    };

                    sourceNode.start(0);
                    return;
                } catch (decodeErr) {
                    console.warn(`[Kaushalya Voice] [SID:${sessionId}] Web Audio buffer failed for chunk ${idx}, falling back to Audio element:`, decodeErr);
                }
            }

            // TIER 2: HTMLAudioElement fallback
            const arrayBuffer = await fetchChunkBuffer(idx);
            if (sessionId !== activeSpeechSessionId) return;

            const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
            currentAudioUrl = URL.createObjectURL(blob);
            const audio = new Audio(currentAudioUrl);
            currentAudio = audio;
            audio.playbackRate = 1.12;
            audio.preservesPitch = true;

            audio.onplay = () => {
                if (!hasTriggeredStart) {
                    hasTriggeredStart = true;
                    if (onStart) onStart();
                }
            };

            audio.onended = () => {
                if (sessionId === activeSpeechSessionId) {
                    currentChunkIdx++;
                    playNextChunk();
                }
            };

            audio.onerror = () => {
                if (sessionId === activeSpeechSessionId) {
                    currentChunkIdx++;
                    playNextChunk();
                }
            };

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((e) => {
                    console.warn(`[Kaushalya Voice] [SID:${sessionId}] Audio play prevented:`, e);
                    if (onError) onError(e);
                    if (onEnd) onEnd();
                });
            }

        } catch (err) {
            if (sessionId !== activeSpeechSessionId) return;
            console.warn(`[Kaushalya Voice] [SID:${sessionId}] Chunk ${idx} synthesis failed: ${err.message}. Silent robotic voice substitution is suppressed.`);
            if (onError) onError(err);
            if (onEnd) onEnd();
        }
    };

    playNextChunk();
    return sessionId;
}


/**
 * Create and configure a SpeechRecognition instance for speech input.
 */
export function createSpeechRecognizer({ lang = 'mr', onResult, onError, onEnd, onStart }) {
    if (!isSpeechRecognitionSupported()) {
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = new SpeechRecognition();

    recognizer.continuous = false;
    recognizer.lang = (lang === 'mr' || lang === 'mr-IN')
        ? 'mr-IN'
        : ((lang === 'hi' || lang === 'hi-IN') ? 'hi-IN' : 'en-IN');

    if (onStart) recognizer.onstart = onStart;
    if (onEnd) recognizer.onend = onEnd;
    if (onError) recognizer.onerror = onError;

    recognizer.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        if (onResult) {
            onResult({
                finalTranscript: finalTranscript.trim(),
                interimTranscript: interimTranscript.trim(),
                isFinal: finalTranscript.trim().length > 0
            });
        }
    };

    return recognizer;
}
