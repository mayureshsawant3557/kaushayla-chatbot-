import React, { useState, useContext, useEffect, useRef } from "react";
import {
    Volume2,
    Minus,
    Plus,
    Phone,
    X,
    VolumeX,
} from "lucide-react";

import { ThemeContext } from "../Context/ThemeContext";
import "../../i18n";
import { useTranslation } from "react-i18next";

const Header = () => {
    const [showHelplinePopup, setShowHelplinePopup] = useState(false);

    const {
        color,
        setGlobalColor,
        language,
        setGlobalLanguage,
        toggleColor,
    } = useContext(ThemeContext);

    const { t, i18n } = useTranslation();

    // Screen Reader State
    const [readerState, setReaderState] = useState("idle");
    const [voicesLoaded, setVoicesLoaded] = useState(false);

    const currentUtteranceRef = useRef(null);
    const voicesRef = useRef([]);
    const utteranceQueueRef = useRef([]);
    const isReadingRef = useRef(false);

    // =========================
    // INITIAL LOAD
    // =========================
    useEffect(() => {
        const storedLanguage = localStorage.getItem("language");

        if (storedLanguage) {
            i18n.changeLanguage(storedLanguage);
            setGlobalLanguage(storedLanguage);
        }

        loadVoices();

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = () => {
                loadVoices();
            };
        }

        return () => {
            stopEverything();
        };
    }, [i18n, setGlobalLanguage]);

    // =========================
    // LOAD AVAILABLE VOICES
    // =========================
    const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        voicesRef.current = availableVoices;
        setVoicesLoaded(true);

        const marathiVoices = availableVoices.filter(v =>
            v.lang.includes("mr") || v.lang.includes("मराठी")
        );
        // if (marathiVoices.length > 0) {
        //     console.log("Marathi voices available:", marathiVoices);
        // } else {
        //     console.log("No dedicated Marathi voice found, will use fallback");
        // }
    };

    // =========================
    // STOP EVERYTHING
    // =========================
    const stopEverything = () => {
        isReadingRef.current = false;
        utteranceQueueRef.current = [];
        window.speechSynthesis.cancel();
        currentUtteranceRef.current = null;
    };

    // =========================
    // GET VOICE BY LANGUAGE
    // =========================
    const getVoiceByLanguage = (lang) => {
        const voices = voicesRef.current;
        if (voices.length === 0) return null;

        if (lang === "mr") {
            const marathiVoicePriority = [
                voices.find((v) => v.lang === "mr-IN"),
                voices.find((v) => v.lang === "mr"),
                voices.find((v) => v.lang.includes("mr-IN")),
                voices.find((v) => v.lang.includes("mr")),
                voices.find((v) => v.lang === "mr-IN" && v.name.includes("Google")),
                voices.find((v) => v.lang === "hi-IN"),
                voices.find((v) => v.lang.includes("hi")),
                voices.find((v) => v.lang.includes("IN")),
            ];
            for (const voice of marathiVoicePriority) {
                if (voice) return voice;
            }
            return null;
        }

        const englishVoicePriority = [
            voices.find((v) => v.lang === "en-US"),
            voices.find((v) => v.lang === "en-GB"),
            voices.find((v) => v.lang.includes("en")),
        ];
        for (const voice of englishVoicePriority) {
            if (voice) return voice;
        }
        return null;
    };

    // =========================
    // SPEAK A SINGLE UTTERANCE (Promise-based)
    // =========================
    const speakSingle = (text, lang) => {
        return new Promise((resolve) => {
            if (!text || text.trim().length === 0) {
                resolve();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text.trim());
            utterance.lang = lang === "mr" ? "mr-IN" : "en-US";

            const selectedVoice = getVoiceByLanguage(lang);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            if (lang === "mr") {
                utterance.rate = 0.85;
                utterance.pitch = 1.05;
            } else {
                utterance.rate = 0.95;
                utterance.pitch = 1;
            }

            utterance.volume = 1;

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve(); // resolve even on error to continue queue

            currentUtteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        });
    };

    // =========================
    // PROCESS QUEUE SEQUENTIALLY
    // =========================
    const processQueue = async (queue, lang) => {
        isReadingRef.current = true;
        setReaderState("reading");

        for (let i = 0; i < queue.length; i++) {
            // Check if stopped mid-way
            if (!isReadingRef.current) break;

            const chunk = queue[i];
            await speakSingle(chunk, lang);

            // Small pause between sections
            await new Promise((res) => setTimeout(res, 150));
        }

        if (isReadingRef.current) {
            isReadingRef.current = false;
            setReaderState("idle");
        }
    };

    // =========================
    // CHANGE LANGUAGE
    // =========================
    const changeLanguage = (newLanguage) => {
        i18n.changeLanguage(newLanguage);
        setGlobalLanguage(newLanguage);
        localStorage.setItem("language", newLanguage);

        if (readerState !== "idle") {
            stopEverything();
            setReaderState("idle");
        }

        setTimeout(() => {
            const announcement = newLanguage === "mr"
                ? ""
                : "";
            speakSingle(announcement, newLanguage);
        }, 300);
    };

    // =========================
    // EXTRACT PAGE CONTENT — HEADER TO FOOTER ORDER
    // =========================
    const getPageContentInOrder = () => {
        /**
         * Strategy:
         * 1. Find landmark sections: header, nav, main, footer (in DOM order)
         * 2. Walk each section's text nodes in DOM order
         * 3. Skip hidden, script, style, already-seen text
         * 4. Split into readable chunks (per element)
         */

        const chunks = [];
        const seenTexts = new Set();

        // Tags to skip entirely
        const SKIP_TAGS = new Set([
            "SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH",
            "META", "HEAD", "LINK", "CODE", "PRE"
        ]);

        // Classes to skip (no-read = helpline popup & button, sr-only = screen reader only elements)
        const SKIP_CLASSES = ["no-read", "sr-only"];

        const isVisible = (el) => {
            if (!el || !el.getBoundingClientRect) return false;
            const style = window.getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
            return true;
        };

        const shouldSkipElement = (el) => {
            if (SKIP_TAGS.has(el.tagName)) return true;
            // Check if element itself OR any ancestor has a skip class
            if (SKIP_CLASSES.some(cls => el.closest(`.${cls}`))) return true;
            if (!isVisible(el)) return true;
            return false;
        };

        // Walk DOM tree and extract text from leaf/near-leaf elements in order
        const walkNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (text && text.length > 1) {
                    // Bubble up to find parent element for visibility check
                    const parent = node.parentElement;
                    if (parent && isVisible(parent) && !shouldSkipElement(parent)) {
                        if (!seenTexts.has(text)) {
                            seenTexts.add(text);
                            chunks.push(text);
                        }
                    }
                }
                return;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return;
            if (shouldSkipElement(node)) return;

            // For block-level / semantic elements, walk children
            const children = node.childNodes;
            for (let i = 0; i < children.length; i++) {
                walkNode(children[i]);
            }
        };

        // Define reading order: header → nav → main (sections/articles) → footer
        // We walk the full document body in DOM order to preserve natural flow
        walkNode(document.body);

        // Filter junk
        const filtered = chunks.filter((text) => {
            if (text.length < 2) return false;
            if (/^\d+$/.test(text)) return false; // pure numbers
            if (text.includes("{") || text.includes("}")) return false;
            if (text.includes("function(") || text.includes("=>")) return false;
            return true;
        });

        return filtered;
    };

    // =========================
    // BUTTON ACTION
    // =========================
    const handleVolumeClick = () => {
        if (!voicesLoaded) {
            loadVoices();
            setTimeout(() => handleVolumeClick(), 500);
            return;
        }

        if (readerState === "idle") {
            startReading();
        } else if (readerState === "reading") {
            pauseReading();
        } else if (readerState === "paused") {
            resumeReading();
        }
    };

    // =========================
    // START READING — HEADER TO FOOTER
    // =========================
    const startReading = async () => {
        const startMessage = language === "mr"
            ? ""
            : "";

        // Speak the intro message first
        await speakSingle(startMessage, language);

        // Now get all content in DOM order and read sequentially
        const contentChunks = getPageContentInOrder();

        if (contentChunks.length === 0) {
            const noContent = language === "mr"
                ? "."
                : ".";
            await speakSingle(noContent, language);
            setReaderState("idle");
            return;
        }

        utteranceQueueRef.current = contentChunks;
        await processQueue(contentChunks, language);
    };

    // =========================
    // PAUSE
    // =========================
    const pauseReading = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            isReadingRef.current = false;
            setReaderState("paused");
        }
    };

    // =========================
    // RESUME
    // =========================
    const resumeReading = () => {
        window.speechSynthesis.resume();
        isReadingRef.current = true;
        setReaderState("reading");
    };

    // =========================
    // STOP
    // =========================
    const handleStop = () => {
        stopEverything();
        setReaderState("idle");
    };

    // =========================
    // THEME
    // =========================
    const isDarkMode = color.includes("bg-blue-900");

    // =========================
    // VOLUME BUTTON TITLE
    // =========================
    const volumeTitle = (() => {
        if (readerState === "idle") {
            return language === "mr" ? "" : "";
        } else if (readerState === "") {
            return language === "mr" ? "" : "";
        } else {
            return language === "mr" ? "" : "";
        }
    })();

    return (
        <>
            <nav className="no-read px-2 py-1 bg-[#3b3b3b] overflow-x-auto">
                <div className="flex items-center justify-end min-w-max">

                    {/* SCREEN READER */}
                    <div className="border-r border-gray-500 pr-2">
                        <div className="flex items-center">
                            <button
                                onClick={handleVolumeClick}
                                title={volumeTitle}
                                aria-label={volumeTitle}
                                aria-pressed={readerState !== "idle"}
                                className={`block px-2 text-white hover:text-gray-300 transition-colors duration-200 ${
                                    readerState !== "idle" ? "text-blue-400" : ""
                                }`}
                            >
                                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 hover:w-6 hover:h-6" />
                            </button>

                            {readerState !== "idle" && (
                                <button
                                    onClick={handleStop}
                                    title={language === "mr" ? "" : " "}
                                    aria-label="Stop Screen Reader"
                                    className="px-1 text-red-400 hover:text-red-300"
                                >
                                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* FONT SIZE */}
                    <div className="flex border-r border-gray-500 pr-2">
                        <a href="#" className="block px-1 text-white hover:text-gray-300 text-sm sm:text-base">
                            A <Minus className="inline-block w-2 h-2 sm:w-3 sm:h-3" />
                        </a>
                        <a href="#" className="block px-1 text-white hover:text-gray-300 text-sm sm:text-base">
                            A
                        </a>
                        <a href="#" className="block px-1 text-white hover:text-gray-300 text-sm sm:text-base">
                            A <Plus className="inline-block w-2 h-2 sm:w-3 sm:h-3" />
                        </a>
                    </div>

                    {/* THEME TOGGLE */}
                    <div className="border-r border-gray-500 pr-2">
                        <a
                            href="#"
                            className="block px-2 text-white hover:text-gray-300"
                            onClick={(e) => { e.preventDefault(); toggleColor(); }}
                            title="Toggle Theme"
                        >
                            <div className="text-sm sm:text-base">
                                {isDarkMode ? "🌙" : "☀️"}
                            </div>
                        </a>
                    </div>

                    {/* COLOR OPTIONS */}
                    <div className="flex items-center border-r border-gray-500 pr-2 pl-1">
                        <div className="flex space-x-1">
                            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-blue-900 cursor-pointer hover:ring-1 sm:hover:ring-2 hover:ring-white"
                                onClick={() => setGlobalColor("bg-blue-900")}></div>
                            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-600 cursor-pointer hover:ring-1 sm:hover:ring-2 hover:ring-white"
                                onClick={() => setGlobalColor("bg-red-600")}></div>
                            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-green-600 cursor-pointer hover:ring-1 sm:hover:ring-2 hover:ring-white"
                                onClick={() => setGlobalColor("bg-green-600")}></div>
                        </div>
                    </div>

                    {/* LANGUAGE */}
                    <div className="border-r border-gray-500 pr-2 pl-1">
                        <select
                            id="language-dropdown"
                            value={language}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="form-control px-1 py-0.5 sm:px-2 sm:py-1 rounded-lg text-xs sm:text-sm bg-white"
                        >
                            <option value="en">English</option>
                            <option value="mr">मराठी</option>
                        </select>
                    </div>

                    {/* HELPLINE BUTTON — no-read class so screen reader skips it */}
                    <div className="no-read ml-1 sm:ml-3">
                        <button
                            onClick={() => setShowHelplinePopup(true)}
                            className="flex items-center bg-[#BC460B] hover:opacity-90 text-white font-bold py-0.5 px-2 sm:py-1 sm:px-3 rounded-lg text-xs sm:text-sm"
                        >
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 transform -scale-x-100" aria-hidden="true" />
                            <span>{t("HELPLINE")}</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* HELPLINE POPUP — no-read class so screen reader skips it completely */}
            {showHelplinePopup && (
                <div className="no-read fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 sm:mx-0">
                        <div className={`${color} text-white p-4 rounded-t-lg flex justify-between items-center`}>
                            <h2 className="text-lg sm:text-xl font-semibold">
                                {t("Helpline_Numbers")}
                            </h2>
                            <button
                                onClick={() => setShowHelplinePopup(false)}
                                className="text-white hover:text-gray-300 transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} className="sm:w-6 sm:h-6" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                            <p className="text-gray-700 text-sm sm:text-lg">{t("Helpline_Time")}</p>
                            <p className="text-gray-700 text-sm sm:text-lg">
                                {t("Phone")} : <span className="font-semibold">9321235321</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;