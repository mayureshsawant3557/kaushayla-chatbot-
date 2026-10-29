import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
    Mic,
    MicOff,
    Send,
    X,
    Bot,
    Volume2,
    VolumeX,
    RotateCcw,
    ExternalLink,
    FileText,
    CheckCircle,
    AlertCircle,
    Building2,
    BookOpen,
    Download as DownloadIcon,
    ArrowRight,
    Minus,
    Maximize2,
    Minimize2,
    Check,
    Clock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../Context/ThemeContext';
import { useAuth } from '../../Hooks/AuthContext';
import {
    cleanTextForSpeech,
    isSpeechSynthesisSupported,
    isSpeechRecognitionSupported,
    speakText,
    stopSpeaking,
    createSpeechRecognizer,
    detectLanguage,
    unlockAudio
} from '../../utils/speechUtils';
import { speechInputCoordinator } from '../../utils/speech_input';
import { parseCandidateDateOfBirth } from '../../utils/dateParser';
import { parseCandidateName, isFillerOrStopword } from '../../utils/nameParser';
import {
    FORM_REGISTRY,
    getActiveForm,
    inspectLiveForm,
    applyAutofill,
    getNextStepGuidance
} from '../../utils/formRegistry';

// Comprehensive MSBSVET Portal Routes Directory with Bilingual Metadata
const PORTAL_ROUTES_MAP = {
    // Public routes
    '/React/Public/Home': { mr: 'मुख्य पृष्ठ (Home)', en: 'Home Page', auth: false },
    '/React/Public/institutes': { mr: 'संस्था निर्देशिका (Institutes Directory)', en: 'Institutes Directory', auth: false },
    '/React/Public/courses': { mr: 'अभ्यासक्रम निर्देशिका (Courses)', en: 'Courses Directory', auth: false },
    '/React/Public/coursesSTT': { mr: 'अल्पमुदत प्रशिक्षण (STT Courses)', en: 'Short Term Training Courses', auth: false },
    '/React/Public/ContactUs': { mr: 'संपर्क पृष्ठ (Contact Us)', en: 'Contact Us', auth: false },
    '/React/Public/CertificateVerification': { mr: 'प्रमाणपत्र पडताळणी (Certificate Verification)', en: 'Certificate Verification', auth: false },
    '/React/Public/AboutBoard': { mr: 'मंडळाबद्दल माहिती (About Board)', en: 'About Board', auth: false },
    '/React/Public/Vision': { mr: 'व्हिजन व मिशन (Vision & Mission)', en: 'Vision & Mission', auth: false },
    '/React/Public/mission': { mr: 'मिशन (Mission)', en: 'Mission', auth: false },
    '/React/Public/ExamCircular': { mr: 'परीक्षा परिपत्रक (Exam Circulars)', en: 'Exam Circulars', auth: false },
    '/React/Public/ExamPattern': { mr: 'परीक्षा पद्धती व पॅटर्न (Exam Pattern)', en: 'Exam Pattern', auth: false },
    '/React/Public/ExamTimeTable': { mr: 'सार्वजनिक परीक्षा वेळापत्रक (Public Timetable)', en: 'Public Exam Timetable', auth: false },
    '/React/Public/LegitDownload': { mr: 'अधिकृत डाउनलोड्स (Official Downloads)', en: 'Official Downloads', auth: false },
    '/React/Public/RTI': { mr: 'माहिती अधिकार (RTI)', en: 'Right to Information (RTI)', auth: false },
    '/React/Public/CitizenCharter': { mr: 'नागरिक सनद (Citizen Charter)', en: 'Citizen Charter', auth: false },
    '/React/Public/PromotingOrganizationRegistration': { mr: 'प्रवर्तक संस्था नोंदणी (Promoting Organization)', en: 'Promoting Organization Registration', auth: false },

    // Candidate routes
    '/React/Candidate/dashboard': { mr: 'कॅन्डिडेट डॅशबोर्ड (Candidate Dashboard)', en: 'Candidate Dashboard', auth: true },
    '/React/candidate/dashboard': { mr: 'कॅन्डिडेट डॅशबोर्ड (Candidate Dashboard)', en: 'Candidate Dashboard', auth: true },
    '/React/Candidate/HallTicket': { mr: 'हॉल तिकीट (Hall Ticket)', en: 'Candidate Hall Ticket', auth: true },
    '/React/Candidate/TimeTable': { mr: 'परीक्षा वेळापत्रक (Exam Timetable)', en: 'Candidate Exam Timetable', auth: true },
    '/React/Candidate/ExamResult': { mr: 'परीक्षेचा निकाल (Exam Result)', en: 'Candidate Exam Result', auth: true },
    '/React/Candidate/AttendanceReport': { mr: 'उपस्थिती अहवाल (Attendance Report)', en: 'Attendance Report', auth: true },
    '/React/Candidate/GrievanceForm': { mr: 'तक्रार नोंदणी (Grievance Form)', en: 'Grievance / Complaint Form', auth: true },
    '/React/Candidate/Assistance': { mr: 'विद्यार्थी सहाय्य (Student Assistance)', en: 'Student Assistance Desk', auth: true },
    '/React/Candidate/PayExamFee': { mr: 'परीक्षा शुल्क भरणा (Pay Exam Fee)', en: 'Pay Exam Fee', auth: true },
    '/React/Candidate/PayFeeReceipt': { mr: 'शुल्क पावती (Fee Receipt)', en: 'Fee Receipt', auth: true },
    '/React/Candidate/SeatingArrangement': { mr: 'बैठक व्यवस्था (Seating Arrangement)', en: 'Exam Seating Arrangement', auth: true },

    // Candidate Profile 10-Step Workflow Routes (Mounted in CandidateRoutes.jsx)
    '/React/Candidate/Primary': { mr: 'पायरी १: वैयक्तिक माहिती (Personal Details)', en: 'Step 1: Personal Details (Primary)', auth: true },
    '/React/Candidate/Address': { mr: 'पायरी २: पत्ता तपशील (Address Details)', en: 'Step 2: Address Details', auth: true },
    '/React/Candidate/Parent': { mr: 'पायरी ३: पालक तपशील (Parent Details)', en: 'Step 3: Parent & Guardian Details', auth: true },
    '/React/Candidate/Category': { mr: 'पायरी ४: प्रवर्ग व आरक्षण (Category Details)', en: 'Step 4: Category & Reservation Details', auth: true },
    '/React/Candidate/Qualification': { mr: 'पायरी ५: शैक्षणिक पात्रता (Qualification)', en: 'Step 5: Educational Qualification', auth: true },
    '/React/Candidate/Training': { mr: 'पायरी ६: व्यावसायिक प्रशिक्षण (Training)', en: 'Step 6: Previous Training Details', auth: true },
    '/React/Candidate/Additional': { mr: 'पायरी ७: अतिरिक्त माहिती (Additional Details)', en: 'Step 7: Additional Details', auth: true },
    '/React/Candidate/Bank': { mr: 'पायरी ८: बँक खाते तपशील (Bank Details)', en: 'Step 8: Bank Account Details', auth: true },
    '/React/Candidate/WorkExperience': { mr: 'पायरी ९: कामाचा अनुभव (Work Experience)', en: 'Step 9: Work Experience Details', auth: true },
    '/React/Candidate/LockApplicationForm': { mr: 'पायरी १०: अर्ज पडताळणी व लॉक (Lock Profile)', en: 'Step 10: Verify & Lock Application Form', auth: true },

    // Legacy / Subroute Aliases
    '/React/Candidate/CandidateProfile': { mr: 'उमेदवार प्रोफाइल (Candidate Profile)', en: 'Candidate Profile', auth: true },
    '/React/Candidate/CandidateProfile/AddressDetails': { mr: 'पत्ता तपशील (Address Details)', en: 'Address Details', auth: true },
    '/React/Candidate/CandidateProfile/BankDetails': { mr: 'बँक तपशील (Bank Details)', en: 'Bank Details', auth: true },
    '/React/Candidate/CandidateProfile/EducationQualification': { mr: 'शैक्षणिक पात्रता (Education Qualification)', en: 'Education Qualification', auth: true },
    '/React/Candidate/CandidateProfile/CategoryDetails': { mr: 'प्रवर्ग व आरक्षण (Category Details)', en: 'Category Details', auth: true },
    '/React/Candidate/CandidateProfile/ParentDetails': { mr: 'पालक तपशील (Parent Details)', en: 'Parent Details', auth: true },
    '/React/Candidate/CandidateProfile/WorkExperienceDetails': { mr: 'कामाचा अनुभव (Work Experience)', en: 'Work Experience Details', auth: true },
    '/React/Candidate/CandidateProfile/LockUnlockForm': { mr: 'अर्ज लॉक/अनलॉक (Form Lock / Unlock)', en: 'Application Form Lock / Unlock', auth: true },
    '/React/Candidate/CandidateProfile/AadharReverification': { mr: 'आधार पुनर्पडताळणी (Aadhaar Reverification)', en: 'Aadhaar Reverification', auth: true },
    '/React/Candidate/CandidateProfile/Academisthan': { mr: 'अकॅडेमिस्थान एलएमएस (Academisthan LMS)', en: 'Academisthan LMS', auth: true },
    '/React/Candidate/CandidateProfile/Bcls': { mr: 'बीसीएलएस जीवन रक्षक अभ्यासक्रम (BCLS)', en: 'BCLS Life Support Training', auth: true },

    // Auth & Registration
    '/React/auth/signin': { mr: 'लॉगिन पृष्ठ (Sign In)', en: 'Sign In Page', auth: false },
    '/React/auth/reset-password': { mr: 'पासवर्ड रीसेट (Reset Password)', en: 'Reset Password', auth: false },
    '/React/candidate/register': { mr: 'उमेदवार नोंदणी (Candidate Registration)', en: 'Candidate Registration', auth: false },
    '/React/staff/register': { mr: 'कर्मचारी नोंदणी (Staff Registration)', en: 'Staff Registration', auth: false },
    '/React/sdi/register': { mr: 'एसडीआय नोंदणी (SDI Registration)', en: 'SDI Registration', auth: false },

    // Reports
    '/React/reports/reportIndex': { mr: 'अहवाल व गॅझेट (Reports Index)', en: 'Reports & Gazettes Index', auth: true },

    // Institute Approval / LOI
    '/React/institute/approval/loi-generation': { mr: 'संस्था एलओआय निर्मिती (LOI Generation)', en: 'Institute LOI Generation', auth: true },
    '/React/institute/approval/scrutiny': { mr: 'संस्था तपासणी व छाननी (Institute Scrutiny)', en: 'Institute Scrutiny & Inspection', auth: true },
};

// Supported autofill field keys (Safe fields only - never allow passwords, OTPs, or tokens)
const SUPPORTED_AUTOFILL_FIELDS = [
    'itiRegistered',
    'registrationNumber',
    'firstName',
    'middleName',
    'lastName',
    'email',
    'primaryMobile',
    'secondaryMobile',
    'gender',
    'dob',
    'qualification',
    'coursePreference'
];


const SmartVoiceAssistant = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { color } = useContext(ThemeContext) || { color: 'bg-blue-600' };
    const { isLoggedIn, logout } = useAuth() || {};

    // Chat UI state
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [language, setLanguage] = useState('mr'); // 'mr' (Marathi) or 'en' (English)
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [assistantState, setAssistantState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
    const [interimTranscript, setInterimTranscript] = useState('');
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [speechError, setSpeechError] = useState(null);

    // Autofill confirmation state
    const [pendingAutofill, setPendingAutofill] = useState(null);

    // Multi-turn conversational registration state
    const [regFlow, setRegFlow] = useState(() => {
        try {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            const activeForm = getActiveForm(currentPath);
            // Never restore active registration flow on non-registration pages (e.g. Home, Courses)
            if (!activeForm) {
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.removeItem('msbsvet_reg_flow');
                }
                return { active: false, isPaused: false, step: 'idle', pausedStep: null, data: {}, formId: null };
            }
            const saved = sessionStorage.getItem('msbsvet_reg_flow');
            return saved ? JSON.parse(saved) : { active: false, isPaused: false, step: 'idle', pausedStep: null, data: {}, formId: activeForm.id };
        } catch {
            return { active: false, isPaused: false, step: 'idle', pausedStep: null, data: {}, formId: null };
        }
    });

    const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState(null);
    const [ttsEngine] = useState('somya');
    const [autoplayBlockedHint, setAutoplayBlockedHint] = useState(false);
    const [showFieldDetails, setShowFieldDetails] = useState(false);

    // Active registration form awareness based on route
    const currentActiveForm = getActiveForm(location.pathname) || getActiveForm(typeof window !== 'undefined' ? window.location.pathname : '');
    const isRegistrationPage = Boolean(currentActiveForm);
    const [liveFormState, setLiveFormState] = useState(() => inspectLiveForm(currentActiveForm));

    // Live form state polling & event listeners (real-time DOM & state sync)
    useEffect(() => {
        if (!currentActiveForm) {
            setLiveFormState(null);
            return;
        }

        const updateLiveState = () => {
            setLiveFormState(inspectLiveForm(currentActiveForm));
        };

        updateLiveState();
        const interval = setInterval(updateLiveState, 1200);
        window.addEventListener('input', updateLiveState, true);
        window.addEventListener('change', updateLiveState, true);
        window.addEventListener('msbsvet:autofill', updateLiveState);

        return () => {
            clearInterval(interval);
            window.removeEventListener('input', updateLiveState, true);
            window.removeEventListener('change', updateLiveState, true);
            window.removeEventListener('msbsvet:autofill', updateLiveState);
        };
    }, [currentActiveForm, location.pathname]);

    // Show form progress only when a supported registration form is open AND the user has interacted with it
    const hasUserInteracted = isRegistrationPage && Boolean(
        regFlow.active || 
        (liveFormState && liveFormState.fields && liveFormState.fields.filled.length > 0)
    );

    // Prime audio context on mount
    useEffect(() => {
        unlockAudio();
    }, []);

    // Save registration flow to sessionStorage ONLY when active and currently on a supported registration page
    useEffect(() => {
        try {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            const activeForm = getActiveForm(currentPath) || getActiveForm(location.pathname);
            if (regFlow.active && activeForm) {
                sessionStorage.setItem('msbsvet_reg_flow', JSON.stringify(regFlow));
            } else {
                sessionStorage.removeItem('msbsvet_reg_flow');
            }
        } catch (e) {
            // Ignore storage error
        }
    }, [regFlow, location.pathname]);

    // Listen for autoplay restriction events from speechUtils
    useEffect(() => {
        const handleAutoplayBlocked = () => {
            setAutoplayBlockedHint(true);
        };
        window.addEventListener('msbsvet-autoplay-blocked', handleAutoplayBlocked);
        return () => window.removeEventListener('msbsvet-autoplay-blocked', handleAutoplayBlocked);
    }, []);

    const handleEngineChange = (newEngine) => {
        setTtsEngine(newEngine);
        if (typeof window !== 'undefined') {
            window.__MSBSVET_TTS_ENGINE = newEngine;
        }
    };

    // References
    const recognizerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const isListeningRef = useRef(false);
    const isAssistantNavigatingRef = useRef(false);
    const hasSpokenGreetingRef = useRef(false);

    // Track meaningful button clicks safely across the portal
    const lastActionRef = useRef({
        action: null,
        target: null,
        timestamp: 0,
        status: 'idle',
        outcome: null
    });
    const [pendingOverwrite, setPendingOverwrite] = useState(null);

    useEffect(() => {
        const handleDocumentClick = (e) => {
            const btn = e.target.closest('button, a, input[type="submit"], [role="button"]');
            if (!btn) return;

            const btnText = (btn.textContent || btn.value || btn.getAttribute('aria-label') || '').trim();
            const btnId = btn.id || btn.name || btn.getAttribute('data-testid') || '';

            const isMeaningful = /(next|पुढे|verify|पडताळणी|submit|सबमिट|नोंदणी|register|course\s*details|कोर्स\s*तपशील|view|save|साठवा)/i.test(btnText) ||
                /(verify|submit|next|register)/i.test(btnId);

            if (isMeaningful) {
                const pathBefore = window.location.pathname;
                lastActionRef.current = {
                    action: btnText || btnId,
                    target: btnId || btnText.slice(0, 30),
                    timestamp: Date.now(),
                    status: 'pending',
                    outcome: 'initiated'
                };

                setTimeout(() => {
                    const pathAfter = window.location.pathname;
                    const errorEls = document.querySelectorAll('.text-red-500, [aria-invalid="true"], .border-red-500');
                    const hasVisibleErrors = Array.from(errorEls).some(el => el.textContent && el.textContent.trim().length > 0);

                    if (hasVisibleErrors) {
                        lastActionRef.current.status = 'failed';
                        lastActionRef.current.outcome = 'validation_error';
                    } else if (pathAfter !== pathBefore) {
                        lastActionRef.current.status = 'success';
                        lastActionRef.current.outcome = `navigated_to_${pathAfter}`;
                    } else {
                        lastActionRef.current.status = 'success';
                        lastActionRef.current.outcome = 'completed_on_page';
                    }
                }, 400);
            }
        };

        document.addEventListener('click', handleDocumentClick, true);
        return () => document.removeEventListener('click', handleDocumentClick, true);
    }, []);

    // Small, structured live page context for AI requests
    const getLivePageContext = useCallback(() => {
        const currentPath = window.location.pathname;
        const activeForm = getActiveForm(currentPath) || getActiveForm(location.pathname);
        const liveState = inspectLiveForm(activeForm);

        return {
            url: window.location.pathname + window.location.search,
            title: typeof document !== 'undefined' ? document.title : 'MSBSVET Portal',
            user_type: activeForm ? activeForm.userType : 'General',
            form_id: activeForm ? activeForm.id : null,
            active_section: liveState.active_section,
            fields: {
                filled: liveState.fields.filled,
                empty: liveState.fields.empty,
                invalid: liveState.fields.invalid,
                focused: liveState.fields.focused
            },
            progress: {
                required_total: liveState.required_count || 0,
                required_completed: liveState.completed_required_count || 0,
                optional_total: liveState.optional_count || 0,
                optional_completed: liveState.completed_optional_count || 0
            },
            visible_labels: liveState.visible_labels,
            last_action: lastActionRef.current,
            navigation_succeeded: true
        };
    }, [location.pathname]);

    // Session ID management (stable across conversation turns)
    const getSessionId = () => {
        let sid = sessionStorage.getItem('msbsvet_ai_session_id');
        if (!sid) {
            sid = `msbsvet_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            sessionStorage.setItem('msbsvet_ai_session_id', sid);
        }
        return sid;
    };

    const AI_BACKEND_URL = (
        (import.meta.env.VITE_AI_BACKEND_URL)
            ? import.meta.env.VITE_AI_BACKEND_URL
            : (import.meta.env.VITE_BACKEND_URL
                ? `${import.meta.env.VITE_BACKEND_URL}/api`
                : '/api')
    ).replace(/\/+$/, '');

    // Initial greeting with rich quick suggestions across all MSBSVET functional areas
    useEffect(() => {
        if (!isOpen) {
            hasSpokenGreetingRef.current = false;
            return;
        }

        if (isOpen && messages.length === 0 && !hasSpokenGreetingRef.current) {
            hasSpokenGreetingRef.current = true;
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            const onCandidateReg = currentPath.toLowerCase().includes('candidate/register');

            let greeting = '';
            let quickReplies = [];

            if (onCandidateReg) {
                setRegFlow({
                    active: true,
                    isPaused: false,
                    step: 'itiRegistered',
                    pausedStep: null,
                    data: {},
                    formId: 'candidate_registration'
                });
                greeting = language === 'mr'
                    ? "नमस्कार! मी उमेदवार नोंदणीसाठी तुम्हाला मदत करत आहे. तुम्ही यापूर्वी कोणत्याही ITI मध्ये नोंदणी केली आहे का? (होय / नाही)"
                    : "Hello! I am here to assist you with Candidate Registration. Have you previously registered with any ITI? (Yes / No)";
                quickReplies = language === 'mr' ? [
                    { label: '❌ नाही (नवीन नोंदणी)', query: 'नाही, नवीन नोंदणी करायची आहे' },
                    { label: '✅ होय (ITI नोंदणीकृत)', query: 'होय, मी ITI मध्ये नोंदणी केली आहे' },
                    { label: '📚 कोर्सेस दाखवा', query: 'courses dakhav' },
                    { label: '❓ फॉर्म कसा भरायचा?', query: 'form kasa bharaycha' }
                ] : [
                    { label: '❌ No (New Registration)', query: 'No, I want new registration' },
                    { label: '✅ Yes (ITI Registered)', query: 'Yes, I am ITI registered' },
                    { label: '📚 Show Courses', query: 'Show courses' },
                    { label: '❓ How to fill form?', query: 'How to fill form' }
                ];
            } else {
                greeting = language === 'mr'
                    ? "नमस्कार! मी कौशल्या, MSBSVET ची अधिकृत सहाय्यक आहे. मी तुम्हाला कशी मदत करू?"
                    : "Hello! I am Kaushalya, the official assistant of MSBSVET. How may I assist you today?";
                quickReplies = language === 'mr' ? [
                    { label: '🎫 हॉल तिकीट', query: 'हॉल तिकीट दाखवा' },
                    { label: '📅 परीक्षा वेळापत्रक', query: 'परीक्षेचे वेळापत्रक दाखवा' },
                    { label: '📊 परीक्षेचा निकाल', query: 'परीक्षेचा निकाल दाखवा' },
                    { label: '🎓 अभ्यासक्रम (Courses)', query: 'अभ्यासक्रम दाखवा' },
                    { label: '🏛️ संस्था शोधा', query: 'संस्था दाखवा' },
                    { label: '🏢 संस्था नोंदणी', query: 'संस्था नोंदणी कशी करावी' },
                    { label: '📝 तक्रार नोंदणी', query: 'तक्रार नोंदवा' },
                    { label: '👤 प्रोफाइल पत्ता', query: 'माझा पत्ता तपशील दाखवा' },
                ] : [
                    { label: '🎫 Hall Ticket', query: 'Show my hall ticket' },
                    { label: '📅 Time Table', query: 'Exam timetable' },
                    { label: '📊 Exam Result', query: 'Show my exam result' },
                    { label: '🎓 Courses', query: 'Show courses list' },
                    { label: '🏛️ Institutes', query: 'Search institutes' },
                    { label: '🏢 Institute Registration', query: 'How to register institute' },
                    { label: '📝 Grievance', query: 'Register a complaint' },
                    { label: '👤 Address Details', query: 'Show my address details' },
                ];
            }

            setMessages([{
                id: 'greeting_msg',
                sender: 'bot',
                text: greeting,
                structuredData: {
                    quick_replies: quickReplies
                },
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            // Automatically speak greeting aloud once when assistant is opened
            if (ttsEnabled) {
                speakText(greeting, language, {
                    engine: ttsEngine,
                    onStart: () => setAssistantState('speaking'),
                    onEnd: () => setAssistantState('idle'),
                    onError: () => setAssistantState('idle')
                });
            }
        }
    }, [isOpen]);

    // Auto-scroll messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, interimTranscript, assistantState, pendingAutofill]);

    // Route transition handler: cancels manual speech & resets registration state on non-registration pages
    useEffect(() => {
        if (isAssistantNavigatingRef.current) {
            // Navigation was initiated by assistant itself; allow speech to continue smoothly
            isAssistantNavigatingRef.current = false;
        } else {
            stopSpeaking();
            setAssistantState('idle');
        }

        // When navigating away from a registration form (e.g. to Home, Courses, etc.), reset stale flow
        const activeForm = getActiveForm(location.pathname) || getActiveForm(typeof window !== 'undefined' ? window.location.pathname : '');
        if (!activeForm) {
            if (regFlow.active) {
                setRegFlow({ active: false, isPaused: false, step: 'idle', pausedStep: null, data: {}, formId: null });
            }
            try {
                sessionStorage.removeItem('msbsvet_reg_flow');
            } catch (e) {}
        } else {
            // If switching between different registration forms (e.g. Candidate to Staff), reset regFlow for the new form
            if (regFlow.formId && regFlow.formId !== activeForm.id) {
                setRegFlow({ active: false, isPaused: false, step: 'idle', pausedStep: null, data: {}, formId: activeForm.id });
                try {
                    sessionStorage.removeItem('msbsvet_reg_flow');
                } catch (e) {}
            }
        }
    }, [location.pathname]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSpeaking();
            if (recognizerRef.current) {
                try {
                    recognizerRef.current.abort();
                } catch (e) {
                    // Ignore abort error
                }
            }
        };
    }, []);

    // Stop speaking action
    const handleStopSpeaking = () => {
        stopSpeaking();
        setAssistantState('idle');
    };

    // Safe route validation for all MSBSVET internal routes
    const resolveAllowedRoute = (url) => {
        if (!url || typeof url !== 'string') return null;

        let cleanUrl = url.trim();

        // Check if full URL or path
        try {
            if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
                const parsed = new URL(cleanUrl);
                const allowedHosts = ['msbsvet.edu.in', 'www.msbsvet.edu.in', 'localhost', '127.0.0.1'];
                if (!allowedHosts.includes(parsed.hostname.toLowerCase())) {
                    return null; // External host cannot be an internal route
                }
                cleanUrl = parsed.pathname;
            }
        } catch (e) {
            return null; // Malformed URL
        }

        // Prevent JavaScript injection or protocol abuse
        if (cleanUrl.toLowerCase().startsWith('javascript:') || cleanUrl.includes('<') || cleanUrl.includes('>')) {
            return null;
        }

        // Normalize /React prefix
        if (!cleanUrl.startsWith('/React') && cleanUrl.startsWith('/')) {
            cleanUrl = `/React${cleanUrl}`;
        }

        // Any clean internal route starting with /React/ is allowed
        if (cleanUrl.startsWith('/React/')) {
            return cleanUrl;
        }

        return null;
    };

    // Execute safe navigation with authentication guard and immediate voice feedback
    const handleNavigation = useCallback((targetUrl, requiresAuth = false, shouldSpeak = true) => {
        const safeRoute = resolveAllowedRoute(targetUrl);
        if (!safeRoute) {
            console.warn('Navigation rejected: URL invalid or external:', targetUrl);
            return false;
        }

        const lowerRoute = safeRoute.toLowerCase();
        const routeMeta = PORTAL_ROUTES_MAP[safeRoute];
        const isAuthProtected = (
            requiresAuth ||
            routeMeta?.auth ||
            (lowerRoute.includes('/candidate/') && !lowerRoute.includes('/candidate/register')) ||
            (lowerRoute.includes('/institute/') && !lowerRoute.includes('/institute/register')) ||
            (lowerRoute.includes('/staff/') && !lowerRoute.includes('/staff/register')) ||
            lowerRoute.includes('/reports/')
        );

        // Check authentication requirement
        if (isAuthProtected && !isLoggedIn) {
            const authMsg = language === 'mr'
                ? "या पृष्ठावर जाण्यासाठी आधी लॉगिन करणे आवश्यक आहे. मी तुम्हाला लॉगिन पेजवर नेत आहे."
                : "You need to log in first to access this page. Directing you to the login page.";

            setMessages(prev => [...prev, {
                id: `bot_auth_${Date.now()}`,
                sender: 'bot',
                text: authMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            isAssistantNavigatingRef.current = true;
            if (ttsEnabled) {
                setAssistantState('speaking');
                speakText(authMsg, language, {
                    onEnd: () => setAssistantState('idle'),
                    onError: () => setAssistantState('idle')
                });
            }

            // Navigate safely to signin
            navigate('/auth/signin');
            return true;
        }

        // Remove /React for React Router navigate since basename is /React
        const routerPath = safeRoute.replace(/^\/React/, '') || '/';
        isAssistantNavigatingRef.current = true;
        navigate(routerPath);

        // Spoken confirmation and feedback message (if shouldSpeak is true)
        if (shouldSpeak) {
            // Resolve friendly page label
            let pageLabel = routeMeta ? (language === 'mr' ? routeMeta.mr : routeMeta.en) : null;
            if (!pageLabel) {
                const parts = routerPath.split('/').filter(Boolean);
                const lastPart = parts[parts.length - 1] || 'Page';
                pageLabel = lastPart.replace(/([A-Z])/g, ' $1').trim();
            }

            const confirmMsg = language === 'mr'
                ? `तुम्हाला ${pageLabel} येथे घेऊन जात आहे.`
                : `Navigating to ${pageLabel}.`;

            setMessages(prev => [...prev, {
                id: `bot_nav_${Date.now()}`,
                sender: 'bot',
                text: confirmMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            if (ttsEnabled) {
                setAssistantState('speaking');
                speakText(confirmMsg, language, {
                    onEnd: () => setAssistantState('idle'),
                    onError: () => setAssistantState('idle')
                });
            }
        }

        return true;
    }, [isLoggedIn, language, navigate, ttsEnabled]);

    // Execute safe, real-time live form autofill to visible React registration forms
    const executeLiveFormAutofill = useCallback((fields, isConfirmedOverwrite = false) => {
        if (!fields || Object.keys(fields).length === 0) return;

        // Filter only supported, safe fields (never allow passwords, OTPs, or auth tokens)
        const safeData = {};
        for (const [key, rawVal] of Object.entries(fields)) {
            if (rawVal !== undefined && rawVal !== null && String(rawVal).trim()) {
                const val = String(rawVal).trim();
                // Never allow conversational filler/stopwords into name fields
                if (['firstName', 'middleName', 'lastName'].includes(key) && isFillerOrStopword(val)) {
                    continue;
                }
                if (['password', 'securityAnswer', 'otp', 'currentOtp', 'aadhaarNo'].includes(key)) {
                    continue;
                }
                safeData[key] = val;
            }
        }

        const currentPath = window.location.pathname;
        const activeForm = getActiveForm(currentPath) || FORM_REGISTRY.candidate_registration;

        if (!currentPath.includes('/candidate/register') && activeForm.id === 'candidate_registration') {
            navigate('/candidate/register');
        }

        // Force candidate ITI registration to 'no' to reveal candidate fields
        if (activeForm.id === 'candidate_registration' && safeData.itiRegistered === undefined) {
            safeData.itiRegistered = "no";
        }

        // Safe Overwrite Guard: Check if fields already have existing different values in DOM
        if (!isConfirmedOverwrite) {
            const liveState = inspectLiveForm(activeForm);
            const existingValues = liveState?.values_safe || {};
            const conflicts = [];

            for (const [k, newVal] of Object.entries(safeData)) {
                if (existingValues[k] && String(existingValues[k]).trim().toLowerCase() !== String(newVal).trim().toLowerCase()) {
                    const fieldDef = activeForm.fields.find(f => f.key === k);
                    const label = fieldDef ? (language === 'mr' ? fieldDef.labelMr : fieldDef.labelEn) : k;
                    conflicts.push({
                        key: k,
                        label,
                        oldVal: existingValues[k],
                        newVal
                    });
                }
            }

            if (conflicts.length > 0) {
                // Request user confirmation before overwriting
                setPendingOverwrite({ fields: safeData, conflicts, activeForm });
                const conflictNames = conflicts.map(c => `"${c.label}" (${c.oldVal} ➔ ${c.newVal})`).join(', ');
                const overwriteMsg = language === 'mr'
                    ? `फॉर्ममध्ये पुढील माहिती आधीच भरलेली आहे: ${conflictNames}. ती बदलून नवीन माहिती भरायची आहे का?`
                    : `The form already has existing data for: ${conflictNames}. Do you want to overwrite it?`;

                setMessages(prev => [...prev, {
                    id: `bot_overwrite_${Date.now()}`,
                    sender: 'bot',
                    text: overwriteMsg,
                    structuredData: {
                        quick_replies: language === 'mr' ? [
                            { label: '✅ होय, बदला (Overwrite)', query: 'होय, माहिती बदला' },
                            { label: '❌ नाही, तसेच ठेवा (Keep)', query: 'नाही, तसेच ठेवा' }
                        ] : [
                            { label: '✅ Yes, Overwrite', query: 'Yes, overwrite' },
                            { label: '❌ No, Keep Existing', query: 'No, keep existing' }
                        ]
                    },
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);

                if (ttsEnabled) {
                    speakText(overwriteMsg, language);
                }
                return;
            }
        }

        applyAutofill(activeForm, safeData);
    }, [navigate, language, ttsEnabled]);

    // Confirm autofill handler
    const handleConfirmAutofill = useCallback((data) => {
        if (!data) return;
        executeLiveFormAutofill(data);
        setPendingAutofill(null);
    }, [executeLiveFormAutofill]);

    // System action executor: allows chatbot to perform actions what user says (scroll, print, language, tts, logout, clear_chat)
    const executeSystemAction = useCallback((action) => {
        if (!action || !action.type) return;

        switch (action.type) {
            case 'scroll': {
                const direction = action.direction || action.target || 'down';
                if (direction === 'down') {
                    window.scrollBy({ top: 500, behavior: 'smooth' });
                } else if (direction === 'up') {
                    window.scrollBy({ top: -500, behavior: 'smooth' });
                } else if (direction === 'top') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (direction === 'bottom') {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }

                const scrollMsg = language === 'mr'
                    ? (direction === 'up' ? "पेज वर स्क्रोल केले आहे." : "पेज खाली स्क्रोल केले आहे.")
                    : (direction === 'up' ? "Scrolled up." : "Scrolled down.");
                setMessages(prev => [...prev, {
                    id: `bot_act_${Date.now()}`,
                    sender: 'bot',
                    text: scrollMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                if (ttsEnabled) speakText(scrollMsg, language);
                break;
            }

            case 'print': {
                const printMsg = language === 'mr' ? "प्रिंट विंडो उघडत आहे..." : "Opening print dialog...";
                setMessages(prev => [...prev, {
                    id: `bot_act_${Date.now()}`,
                    sender: 'bot',
                    text: printMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                if (ttsEnabled) speakText(printMsg, language);
                setTimeout(() => {
                    window.print();
                }, 300);
                break;
            }

            case 'language': {
                const targetLang = action.lang || (language === 'mr' ? 'en' : 'mr');
                stopSpeaking();
                setLanguage(targetLang);
                const langMsg = targetLang === 'mr' ? "भाषा मराठी केली आहे." : "Language switched to English.";
                setMessages(prev => [...prev, {
                    id: `bot_act_${Date.now()}`,
                    sender: 'bot',
                    text: langMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                if (ttsEnabled) speakText(langMsg, targetLang);
                break;
            }

            case 'tts': {
                const newTts = action.enabled !== undefined ? !!action.enabled : !ttsEnabled;
                if (!newTts) stopSpeaking();
                setTtsEnabled(newTts);
                const ttsMsg = newTts
                    ? (language === 'mr' ? "व्हॉइस ऑडिओ सुरू केला आहे." : "Voice enabled.")
                    : (language === 'mr' ? "व्हॉइस ऑडिओ बंद केला आहे." : "Voice disabled.");
                setMessages(prev => [...prev, {
                    id: `bot_act_${Date.now()}`,
                    sender: 'bot',
                    text: ttsMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                break;
            }

            case 'logout': {
                stopSpeaking();
                if (logout) {
                    try { logout(); } catch (e) { }
                }
                const logoutMsg = language === 'mr'
                    ? "तुम्हाला यशस्वीरित्या लॉग आउट केले आहे. सुरक्षिततेसाठी साइन इन पेजवर नेत आहे."
                    : "You have been logged out successfully. Directing to sign in page.";
                setMessages(prev => [...prev, {
                    id: `bot_act_${Date.now()}`,
                    sender: 'bot',
                    text: logoutMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                if (ttsEnabled) speakText(logoutMsg, language);
                navigate('/auth/signin');
                break;
            }

            case 'clear_chat': {
                stopSpeaking();
                sessionStorage.removeItem('msbsvet_ai_session_id');
                sessionStorage.removeItem('msbsvet_reg_flow');
                setRegFlow({ active: false, step: 'idle', data: {} });
                setPendingAutofill(null);
                setMessages([]);
                break;
            }

            case 'navigate': {
                if (action.url) {
                    handleNavigation(action.url, action.requires_auth);
                }
                break;
            }

            case 'fill_form': {
                if (action.data) {
                    executeLiveFormAutofill(action.data);
                }
                break;
            }

            default:
                break;
        }
    }, [language, ttsEnabled, logout, navigate, handleNavigation, executeLiveFormAutofill]);

    // Robust candidate field extractor supporting Marathi, Roman Marathi, and English
    const extractCandidateFields = (text) => {
        const extracted = {};
        if (!text || typeof text !== 'string') return extracted;
        const t = text.trim();

        // 1. Email (valid email format)
        const emailMatch = t.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) {
            extracted.email = emailMatch[1].trim();
        }

        // 2. Mobile (10-digit number starting with 6-9)
        const mobileMatch = t.match(/\b([6-9]\d{9})\b/);
        if (mobileMatch) {
            if (/(?:secondary|dusra|dusri|दूसरा|दुसरा|पर्यायी|second)\s*(?:mobile|क्रमांक|नंबर)?/i.test(t)) {
                extracted.secondaryMobile = mobileMatch[1].trim();
            } else {
                extracted.primaryMobile = mobileMatch[1].trim();
            }
        }

        // 3. Date of birth: Use comprehensive dateParser (handles Marathi words, Devanagari numerals, leap years)
        const parsedDob = parseCandidateDateOfBirth(t);
        if (parsedDob.isValid) {
            extracted.dob = parsedDob.display; // "DD/MM/YYYY" e.g. "17/08/2005"
            extracted.dobCanonical = parsedDob.formatted; // "YYYY-MM-DD" e.g. "2005-08-17"
        } else if (parsedDob.reason === 'Invalid calendar date') {
            extracted._dateError = 'Invalid calendar date';
        }

        // 4. ITI Registered / Previous Registration choice (Handles No/Nahi/Yes/Hoy for candidate page question)
        if (
            /(?:(?:iti|previous|purvi|आधी|पूर्वी|यापूर्वी)?\s*(?:registered|admission|pass|kela|केली)?\s*(?:aahe|hoy|yes|होय|केली\s*आहे)|^\s*(?:yes|ho|hoy|होय|हो)\s*$)/i.test(t) &&
            !parsedDob.isValid && !/(?:nahi|no|not|नाही|नको)/i.test(t)
        ) {
            extracted.itiRegistered = 'yes';
        } else if (
            /(?:(?:iti|previous|purvi|आधी|पूर्वी|यापूर्वी)?\s*(?:registered|admission|nondani|नोंदणी)?\s*(?:nahi|nahin|no|not|नाही|नको)|^\s*(?:no|nahi|नाही|नको|नवीन\s*नोंदणी|navin\s*registration)\s*$)/i.test(t)
        ) {
            extracted.itiRegistered = 'no';
        }
        const itiRegNoMatch = t.match(/\b(202[1-5]\d{4,8})\b/);
        if (itiRegNoMatch) {
            extracted.registrationNumber = itiRegNoMatch[1];
            extracted.itiRegistered = 'yes';
        }

        // 5. Gender
        if (/\b(male|purush|boy|man)\b/i.test(t) || t.includes('पुरुष') || t.includes('मुलगा')) {
            extracted.gender = 'M';
        } else if (/\b(female|mahila|stri|girl|woman)\b/i.test(t) || t.includes('महिला') || t.includes('स्त्री') || t.includes('मुलगी')) {
            extracted.gender = 'F';
        } else if (/\b(other|itar)\b/i.test(t) || t.includes('इतर')) {
            extracted.gender = 'O';
        }

        // 6. Name extraction using robust bilingual parser (handles 1-, 2-, 3-, and multi-token names)
        const hasNameIndicator = /(?:नाव|नांव|नावं|आडनाव|aadnav|nav|naav|naam|name|surname|मेरा\s+नाम|my\s+name|i\s+am|मी\s+[A-Za-z\u0900-\u097F]+)/i.test(t);
        if (hasNameIndicator) {
            const nameResult = parseCandidateName(t);
            if (nameResult.isValid && !nameResult.isAmbiguous) {
                if (nameResult.firstName) extracted.firstName = nameResult.firstName;
                if (nameResult.middleName) extracted.middleName = nameResult.middleName;
                if (nameResult.lastName) extracted.lastName = nameResult.lastName;
            }
        }

        // 9. Qualification patterns
        if (/(?:10th|10\s*वी|ssc|दहावी|dahaavi|tenth)/i.test(t)) {
            extracted.qualification = '10th Pass';
        } else if (/(?:12th|12\s*वी|hsc|बारावी|baraavi|twelfth)/i.test(t)) {
            extracted.qualification = '12th Pass';
        } else if (/(?:iti|आयटीआय)/i.test(t) && !parsedDob.isValid) {
            extracted.qualification = 'ITI Passed';
        } else if (/(?:diploma|डिप्लोमा)/i.test(t)) {
            extracted.qualification = 'Diploma';
        } else if (/(?:graduate|पदवीधर|degree|b\.?sc|b\.?com|b\.?a|b\.?e|b\.?tech)/i.test(t)) {
            extracted.qualification = 'Graduate';
        } else if (/(?:post\s*graduate|pg|पदव्युत्तर|m\.?sc|m\.?tech|m\.?a)/i.test(t)) {
            extracted.qualification = 'Post Graduate';
        }

        // 10. Course Preference patterns
        if (/(?:ai|artificial\s*intelligence|machine\s*learning|एमएल|एआय)/i.test(t)) {
            extracted.coursePreference = 'Artificial Intelligence & Machine Learning';
        } else if (/(?:electrician|इलेक्ट्रिशियन|वायरमन|wireman)/i.test(t)) {
            extracted.coursePreference = 'Electrician';
        } else if (/(?:copa|computer\s*operator|संगणक|कोपा)/i.test(t)) {
            extracted.coursePreference = 'Computer Operator and Programming Assistant (COPA)';
        } else if (/(?:solar|सौर\s*ऊर्जा|solar\s*technician)/i.test(t)) {
            extracted.coursePreference = 'Solar Technician (Electrical)';
        } else if (/(?:fitter|फिटर)/i.test(t)) {
            extracted.coursePreference = 'Fitter';
        } else if (/(?:welder|वेल्डर)/i.test(t)) {
            extracted.coursePreference = 'Welder';
        } else if (/(?:mechanic|motor|गाडी|ऑटोमोबाईल|mmv)/i.test(t)) {
            extracted.coursePreference = 'Mechanic Motor Vehicle (MMV)';
        } else if (/(?:digital\s*marketing|डिजिटल\s*मार्केटिंग)/i.test(t)) {
            extracted.coursePreference = 'Digital Marketing Executive';
        } else if (/(?:health|hospital|आरोग्य|रुग्णालय|nursing)/i.test(t)) {
            extracted.coursePreference = 'General Duty Assistant (Healthcare)';
        } else if (/(?:fashion|कपडे|ड्रेस|शिवणकाम|tailoring)/i.test(t)) {
            extracted.coursePreference = 'Fashion Designing and Garment Technology';
        }

        return extracted;
    };

    // Dynamic field-specific quick reply options for smooth, one-tap guidance
    const getFieldQuickReplies = (step, lang) => {
        if (step === 'itiRegistered') {
            return lang === 'mr' ? [
                { label: '❌ नाही (नवीन नोंदणी)', query: 'नाही, नवीन नोंदणी करायची आहे' },
                { label: '✅ होय (ITI नोंदणीकृत)', query: 'होय, मी ITI मध्ये नोंदणी केली आहे' }
            ] : [
                { label: '❌ No (New Registration)', query: 'No, I want new registration' },
                { label: '✅ Yes (ITI Registered)', query: 'Yes, I am ITI registered' }
            ];
        }
        if (step === 'firstName') {
            return lang === 'mr' ? [
                { label: '👤 मयुरेश अभय सावंत', query: 'माझं पूर्ण नाव मयुरेश अभय सावंत आहे' },
                { label: '👤 Mayuresh Sawant', query: 'Mayuresh Sawant' },
                { label: '⏸️ थांबवा (Pause)', query: 'Pause' }
            ] : [
                { label: '👤 Mayuresh Abhay Sawant', query: 'My full name is Mayuresh Abhay Sawant' },
                { label: '👤 Mayuresh Sawant', query: 'Mayuresh Sawant' },
                { label: '⏸️ Pause', query: 'Pause' }
            ];
        }
        if (step === 'dob') {
            return lang === 'mr' ? [
                { label: '📅 15/08/2002', query: '15/08/2002' },
                { label: '📅 01/01/2000', query: '01/01/2000' },
                { label: '⏸️ थांबवा (Pause)', query: 'Pause' }
            ] : [
                { label: '📅 15/08/2002', query: '15/08/2002' },
                { label: '📅 01/01/2000', query: '01/01/2000' },
                { label: '⏸️ Pause', query: 'Pause' }
            ];
        }
        if (step === 'gender') {
            return lang === 'mr' ? [
                { label: '👨 पुरुष (Male)', query: 'Male' },
                { label: '👩 महिला (Female)', query: 'Female' }
            ] : [
                { label: '👨 Male', query: 'Male' },
                { label: '👩 Female', query: 'Female' }
            ];
        }
        if (step === 'primaryMobile') {
            return [
                { label: '📱 9876543210', query: '9876543210' }
            ];
        }
        if (step === 'email') {
            return [
                { label: '✉️ mayuresh@example.com', query: 'mayuresh@example.com' }
            ];
        }
        if (step === 'review') {
            return lang === 'mr' ? [
                { label: '📝 माहिती दुरुस्त करा', query: 'माझे नाव बदला' },
                { label: '📚 कोर्सेस पहा', query: 'courses dakhav' }
            ] : [
                { label: '📝 Edit Details', query: 'Change my name' },
                { label: '📚 View Courses', query: 'Show courses' }
            ];
        }
        return [
            { label: '⏸️ नोंदणी थांबवा (Pause)', query: 'Pause' },
            { label: '📚 कोर्सेस दाखवा', query: 'courses dakhav' },
            { label: '❌ नोंदणी रद्द करा', query: 'नोंदणी रद्द करा' }
        ];
    };

    // Conversational Registration State Machine: Real-time Live Slot Filling
    const handleRegistrationFlowTurn = (rawQuery) => {
        const query = rawQuery.trim();
        const lower = query.toLowerCase();

        // 1. Cancellation intent check
        const cancelTriggers = ['रद्द करा', 'cancel', 'थांबवा आणि रद्द', 'stop registration', 'रद्द'];
        if (cancelTriggers.some(t => lower === t || lower.includes(t))) {
            setRegFlow({ active: false, isPaused: false, step: 'idle', pausedStep: null, data: {} });
            sessionStorage.removeItem('msbsvet_reg_flow');
            setPendingAutofill(null);

            const cancelMsg = language === 'mr'
                ? "नोंदणी प्रक्रिया रद्द केली आहे. तुम्हाला इतर काही माहिती हवी आहे का?"
                : "Candidate registration flow cancelled. How else may I assist you?";

            setMessages(prev => [...prev, {
                id: `reg_cancel_${Date.now()}`,
                sender: 'bot',
                text: cancelMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            if (ttsEnabled) {
                setAssistantState('speaking');
                speakText(cancelMsg, language, {
                    onEnd: () => setAssistantState('idle'),
                    onError: () => setAssistantState('idle')
                });
            }
            return true;
        }

        const activeFormDef = currentActiveForm || (regFlow.formId ? FORM_REGISTRY[regFlow.formId] : null) || FORM_REGISTRY.candidate_registration;
        const currentFormFields = activeFormDef.fields;
        const currentStep = regFlow.step;
        const curFieldObj = currentFormFields.find(f => f.key === currentStep);

        // 2. Check for Skip Requests (Only allowed for optional fields like middleName)
        const isSkipRequest = currentStep !== 'itiRegistered' && /^(?:skip|nako|nahi|नाही|नको|पुढे चला|next|sood|skip kara|वगळा)$/i.test(lower);
        if (isSkipRequest) {
            if (curFieldObj && (!curFieldObj.required || curFieldObj.optional)) {
                const updatedData = { ...regFlow.data, [currentStep]: '-' };
                const nextMissing = currentFormFields.filter(f => f.required).find(f => !updatedData[f.key]);
                const nextStep = nextMissing ? nextMissing.key : 'review';

                setRegFlow({ active: nextStep !== 'idle', isPaused: false, step: nextStep, data: updatedData });

                const skipMsg = language === 'mr'
                    ? `ठीक आहे, वडिलांचे नाव वगळले (Skipped) आहे. आता ${nextMissing ? nextMissing.promptMr : 'सर्व माहिती भरली आहे.'}`
                    : `Understood, middle name skipped. Now, ${nextMissing ? nextMissing.promptEn : 'all fields are filled.'}`;

                setMessages(prev => [...prev, {
                    id: `reg_bot_skip_${Date.now()}`,
                    sender: 'bot',
                    text: skipMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);

                if (ttsEnabled) {
                    speakText(skipMsg, language, {
                        onStart: () => setAssistantState('speaking'),
                        onEnd: () => setAssistantState('idle'),
                        onError: () => setAssistantState('idle')
                    });
                }
                return true;
            } else {
                const warnMsg = language === 'mr'
                    ? `हे आवश्यक (Mandatory) फील्ड आहे. कृपया माहिती दिल्याशिवाय पुढे जाता येणार नाही. ${curFieldObj ? curFieldObj.promptMr : ''}`
                    : `This is a mandatory field and cannot be skipped. Please provide the required information. ${curFieldObj ? curFieldObj.promptEn : ''}`;

                setMessages(prev => [...prev, {
                    id: `reg_bot_mand_${Date.now()}`,
                    sender: 'bot',
                    text: warnMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);

                if (ttsEnabled) {
                    speakText(warnMsg, language, {
                        onStart: () => setAssistantState('speaking'),
                        onEnd: () => setAssistantState('idle'),
                        onError: () => setAssistantState('idle')
                    });
                }
                return true;
            }
        }

        // 3. Extract any candidate fields provided in the utterance
        const extracted = extractCandidateFields(query);

        // Direct handling of previous ITI registration question
        if (currentStep === 'itiRegistered' && !extracted.itiRegistered) {
            if (/(?:nahi|nahin|no|not|नाही|नको|नवीन|navin|new|never|keli\s*nahi)/i.test(lower)) {
                extracted.itiRegistered = 'no';
            } else if (/(?:yes|hoy|ho|होय|हो|keli\s*aahe|केली\s*आहे|registered|iti\s*pass)/i.test(lower)) {
                extracted.itiRegistered = 'yes';
            } else {
                // If the user directly stated their name, accept and default itiRegistered to 'no' to open the form
                const nameCheck = parseCandidateName(query, 'firstName');
                if (nameCheck.isValid && (nameCheck.firstName || nameCheck.cleanFullName)) {
                    extracted.itiRegistered = 'no';
                    if (nameCheck.firstName) extracted.firstName = nameCheck.firstName;
                    if (nameCheck.middleName) extracted.middleName = nameCheck.middleName;
                    if (nameCheck.lastName) extracted.lastName = nameCheck.lastName;
                }
            }
        }

        // If an impossible calendar date was supplied (e.g. 31/02/2005)
        if (extracted._dateError === 'Invalid calendar date') {
            const errorMsg = language === 'mr'
                ? "ती तारीख कॅलेंडरनुसार वैध नाही (उदा. फेब्रुवारी महिन्यात ३१ दिवस नसतात). कृपया खरी जन्मतारीख सांगा (उदा. 17 ऑगस्ट 2005 किंवा 17/08/2005)."
                : "That date is an invalid calendar date (e.g. February cannot have 31 days). Please provide a valid date of birth (e.g. 17 August 2005 or 17/08/2005).";

            setMessages(prev => [...prev, {
                id: `reg_bot_err_${Date.now()}`,
                sender: 'bot',
                text: errorMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            if (ttsEnabled) {
                speakText(errorMsg, language, {
                    onStart: () => setAssistantState('speaking'),
                    onEnd: () => setAssistantState('idle'),
                    onError: () => setAssistantState('idle')
                });
            }
            return true;
        }

        // 4. Handle direct text input answering the current prompt
        if (currentStep === 'firstName' && !extracted.firstName) {
            const nameResult = parseCandidateName(query, 'firstName');
            if (nameResult.isValid) {
                if (nameResult.isAmbiguous && nameResult.clarificationPromptMr) {
                    const clarifyMsg = language === 'mr' ? nameResult.clarificationPromptMr : nameResult.clarificationPromptEn;
                    setMessages(prev => [...prev, {
                        id: `reg_bot_clarify_${Date.now()}`,
                        sender: 'bot',
                        text: clarifyMsg,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                    if (ttsEnabled) {
                        speakText(clarifyMsg, language, {
                            onStart: () => setAssistantState('speaking'),
                            onEnd: () => setAssistantState('idle'),
                            onError: () => setAssistantState('idle')
                        });
                    }
                    return true;
                }
                extracted.firstName = nameResult.firstName;
                if (nameResult.middleName && !extracted.middleName) extracted.middleName = nameResult.middleName;
                if (nameResult.lastName && !extracted.lastName) extracted.lastName = nameResult.lastName;
            } else {
                // User provided filler or invalid word (e.g. "आहे", "हो", "नाही")
                const retryMsg = language === 'mr'
                    ? "तुमचे नाव व्यवस्थित समजू शकले नाही. कृपया तुमचे पूर्ण नाव सांगा (उदा. मयुरेश अभय सावंत):"
                    : "I could not understand your name cleanly. Please state your full name (e.g. Mayuresh Abhay Sawant):";
                setMessages(prev => [...prev, {
                    id: `reg_bot_retry_${Date.now()}`,
                    sender: 'bot',
                    text: retryMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                if (ttsEnabled) {
                    speakText(retryMsg, language, {
                        onStart: () => setAssistantState('speaking'),
                        onEnd: () => setAssistantState('idle'),
                        onError: () => setAssistantState('idle')
                    });
                }
                return true;
            }
        } else if (currentStep === 'middleName' && !extracted.middleName) {
            const nameResult = parseCandidateName(query, 'middleName');
            if (nameResult.isValid && nameResult.middleName) {
                extracted.middleName = nameResult.middleName;
            }
        } else if (currentStep === 'lastName' && !extracted.lastName) {
            const nameResult = parseCandidateName(query, 'lastName');
            if (nameResult.isValid && nameResult.lastName) {
                extracted.lastName = nameResult.lastName;
            }
        } else if (currentStep === 'primaryMobile' && !extracted.primaryMobile) {
            const m = query.match(/\b([6-9]\d{9})\b/);
            if (m) extracted.primaryMobile = m[1];
        } else if (currentStep === 'email' && !extracted.email) {
            const m = query.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            if (m) extracted.email = m[1];
        } else if (currentStep === 'gender' && !extracted.gender) {
            if (/\b(male|purush|boy|man|m)\b/i.test(query) || query.includes('पुरुष')) extracted.gender = 'M';
            else if (/\b(female|mahila|stri|girl|woman|f)\b/i.test(query) || query.includes('महिला') || query.includes('स्त्री')) extracted.gender = 'F';
            else if (/\b(other|itar|o)\b/i.test(query) || query.includes('इतर')) extracted.gender = 'O';
        } else if (currentStep === 'dob' && !extracted.dob) {
            const parsed = parseCandidateDateOfBirth(query);
            if (parsed.isValid) {
                extracted.dob = parsed.display;
                extracted.dobCanonical = parsed.formatted;
            }
        } else if (currentStep === 'qualification' && !extracted.qualification) {
            const qClean = query.replace(/^(?:my qualification is|shikshan|majha shikshan|education is|me|mi)\s*/i, '').trim();
            if (qClean.length >= 2) {
                extracted.qualification = qClean;
            }
        } else if (currentStep === 'coursePreference' && !extracted.coursePreference) {
            const cClean = query.replace(/^(?:course pahije|course preference|majha course|mala|i want|apply for)\s*/i, '').trim();
            if (cClean.length >= 2) {
                extracted.coursePreference = cClean;
            }
        }

        // 5. Check for user corrections (e.g., "Email chukla aahe, ha correct email vapra...")
        const isCorrection = /(?:chukla|chukle|change|badla|correct|wrong|नवीन|new|सुधारा|दुरुस्त)\b/i.test(lower);

        // 6. Update accumulated registration data (protect existing valid fields from being overwritten by blanks or fillers)
        const updatedData = { ...regFlow.data };
        for (const [k, v] of Object.entries(extracted)) {
            if (v !== undefined && v !== null && String(v).trim().length > 0 && !isFillerOrStopword(String(v))) {
                updatedData[k] = v;
            }
        }

        // 7. REAL-TIME LIVE FORM UPDATE: If any fields extracted, immediately dispatch to visible React form!
        if (Object.keys(extracted).length > 0) {
            executeLiveFormAutofill(extracted);
        }

        // 8. Find next missing required field
        const reqFields = currentFormFields.filter(f => f.required);
        const nextMissing = reqFields.find(f => !updatedData[f.key]);
        const nextStep = nextMissing ? nextMissing.key : 'review';

        let botResponse = '';
        if (Object.keys(extracted).length > 0) {
            const fieldLabels = Object.keys(extracted)
                .map(k => {
                    const f = currentFormFields.find(rf => rf.key === k);
                    return f ? (language === 'mr' ? f.labelMr : f.labelEn) : k;
                })
                .join(', ');

            if (isCorrection) {
                botResponse = language === 'mr'
                    ? `माहिती (${fieldLabels}) दुरुस्त करून थेट फॉर्ममध्ये भरली आहे! ✅`
                    : `Your detail (${fieldLabels}) has been updated live on the form! ✅`;
            } else if (extracted.itiRegistered === 'no' && !extracted.firstName) {
                botResponse = language === 'mr'
                    ? "ठीक आहे! नवीन उमेदवार नोंदणीसाठी फॉर्म उघडला आहे. ✅"
                    : "Understood! The new candidate registration form is opened. ✅";
            } else if (extracted.itiRegistered === 'yes' && !extracted.registrationNumber) {
                botResponse = language === 'mr'
                    ? "ठीक आहे! तुम्ही यापूर्वी ITI मध्ये नोंदणी केली आहे. कृपया तुमचा आधीचा ITI नोंदणी क्रमांक (Registration Number) सांगा किंवा टाका:"
                    : "Understood! Since you are already ITI registered, please state or enter your previous ITI Registration Number:";
            } else {
                botResponse = language === 'mr'
                    ? `धन्यवाद! तुमची माहिती (${fieldLabels}) थेट फॉर्ममध्ये भरली आहे. ✅`
                    : `Thank you! Your ${fieldLabels} has been entered into the visible form. ✅`;
            }

            if (nextMissing) {
                botResponse += language === 'mr'
                    ? ` आता ${nextMissing.promptMr}`
                    : ` Now, ${nextMissing.promptEn}`;
            } else {
                // All required fields are complete! Transition to REVIEW state
                const genderLabel = updatedData.gender === 'M' ? (language === 'mr' ? 'पुरुष' : 'Male')
                    : updatedData.gender === 'F' ? (language === 'mr' ? 'स्त्री' : 'Female')
                    : (language === 'mr' ? 'इतर' : 'Other');

                const itiLabel = updatedData.itiRegistered === 'yes' ? (language === 'mr' ? 'होय (Yes)' : 'Yes') : (language === 'mr' ? 'नाही (No)' : 'No');

                botResponse += language === 'mr'
                    ? `\n\n🎉 अभिनंदन! ${activeFormDef.title.mr}साठी सर्व ${reqFields.length} आवश्यक फील्ड भरले आहेत:
• आयटीआय नोंदणी: ${itiLabel}
• पूर्ण नाव: ${updatedData.firstName || ''} ${updatedData.middleName && updatedData.middleName !== '-' ? updatedData.middleName : ''} ${updatedData.lastName || ''}
• जन्मतारीख: ${updatedData.dob || '-'}
• लिंग: ${genderLabel}
• मोबाईल: ${updatedData.primaryMobile || '-'}
• ईमेल: ${updatedData.email || '-'}
• शैक्षणिक पात्रता: ${updatedData.qualification || 'पूर्ण'}
• निवडलेला कोर्स: ${updatedData.coursePreference || 'नोंदणीकृत'}

⚠️ पुढील अधिकृत पडताळणी पायऱ्या (सुरक्षेसाठी मॅन्युअल):
1. मोबाईल नंबर शेजारील 'Verify' बटणावर क्लिक करून OTP तपासा.
2. सुरक्षा प्रश्न (Security Question) निवडा व पासवर्ड सेट करा.
3. कॅप्चा (Captcha) भरा.
4. सर्व माहिती तपासून स्वतः अधिकृत 'Register' बटणावर क्लिक करा.`
                    : `\n\n🎉 Congratulations! All ${reqFields.length} required registration fields have been filled live on the form:
• ITI Registered: ${itiLabel}
• Full Name: ${updatedData.firstName || ''} ${updatedData.middleName && updatedData.middleName !== '-' ? updatedData.middleName : ''} ${updatedData.lastName || ''}
• DOB: ${updatedData.dob || '-'}
• Gender: ${genderLabel}
• Mobile: ${updatedData.primaryMobile || '-'}
• Email: ${updatedData.email || '-'}
• Qualification: ${updatedData.qualification || 'Completed'}
• Preferred Course: ${updatedData.coursePreference || 'General'}

⚠️ Official remaining verification steps (Manual for candidate security):
1. Click 'Verify' next to your mobile number to verify OTP.
2. Select a Security Question and set your Password.
3. Fill the Captcha.
4. Review details and click 'Register'.`;
            }
        } else {
            // No fields extracted from the user's utterance — prompt politely for current missing field
            const targetMissing = currentFormFields.find(f => f.key === currentStep) || nextMissing;
            if (targetMissing) {
                botResponse = language === 'mr'
                    ? `माफ करा, मी माहिती समजून घेऊ शकलो नाही. ${targetMissing.promptMr}`
                    : `Pardon, I could not capture that clearly. ${targetMissing.promptEn}`;
            } else {
                botResponse = language === 'mr'
                    ? "कृपया स्क्रीनवरील फॉर्म तपासा आणि आवश्यक माहिती पूर्ण करून स्वतः सबमिट करा."
                    : "Please review the form on screen and complete remaining fields to submit.";
            }
        }

        const nextFlow = { active: nextStep !== 'idle', isPaused: false, step: nextStep, data: updatedData, formId: activeFormDef.id };
        setRegFlow(nextFlow);
        try {
            sessionStorage.setItem('msbsvet_reg_flow', JSON.stringify(nextFlow));
        } catch (e) {}

        setMessages(prev => [...prev, {
            id: `reg_bot_${Date.now()}`,
            sender: 'bot',
            text: botResponse,
            structuredData: {
                quick_replies: getFieldQuickReplies(nextStep, language)
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        if (ttsEnabled && botResponse) {
            setAssistantState('speaking');
            speakText(botResponse, language, {
                onEnd: () => setAssistantState('idle'),
                onError: () => setAssistantState('idle')
            });
        }

        return true;
    };

    // Action to select a course from Course Cards and link it to candidate registration
    const startOrResumeRegistrationForCourse = (courseName) => {
        executeLiveFormAutofill({ coursePreference: courseName });
        const formFields = FORM_REGISTRY.candidate_registration.fields;
        const reqFields = formFields.filter(f => f.required);
        const nextMissing = reqFields.find(f => !updated[f.key]);
        const nextStep = nextMissing ? nextMissing.key : 'review';

        setRegFlow({
            active: true,
            isPaused: false,
            step: nextStep,
            data: updated
        });

        // Ensure user is on candidate registration page
        if (!location.pathname.toLowerCase().includes('candidate/register')) {
            handleNavigation('/React/candidate/register', false, false);
        }

        const promptText = nextMissing
            ? (language === 'mr'
                ? `निवडलेला कोर्स '${courseName}' फॉर्ममध्ये सेट केला आहे! ✅ आता ${nextMissing.promptMr}`
                : `Selected course '${courseName}' set on form! ✅ Now, ${nextMissing.promptEn}`)
            : (language === 'mr'
                ? `निवडलेला कोर्स '${courseName}' सेट केला आहे. सर्व आवश्यक फील्ड पूर्ण झाली आहेत! कृपया फॉर्म तपासा.`
                : `Selected course '${courseName}' set. All required fields are complete! Please review the form.`);

        setMessages(prev => [...prev, {
            id: `reg_course_sel_${Date.now()}`,
            sender: 'bot',
            text: promptText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        if (ttsEnabled) {
            setAssistantState('speaking');
            speakText(promptText, language, {
                onEnd: () => setAssistantState('idle'),
                onError: () => setAssistantState('idle')
            });
        }
    };

    // Send question to FastAPI AI backend or handle instant conversational action
    const sendMessage = useCallback(async (textToSend) => {
        unlockAudio();
        const query = (textToSend || inputMessage).trim();
        if (!query) return;

        // Immediately stop STT and TTS on new user message
        if (isListeningRef.current && recognizerRef.current) {
            try { recognizerRef.current.stop(); } catch (e) { }
            isListeningRef.current = false;
        }
        stopSpeaking();
        setInterimTranscript('');
        setSpeechError(null);

        const userMsg = {
            id: `usr_${Date.now()}`,
            sender: 'user',
            text: query,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');

        const lowerQuery = query.toLowerCase().trim();

        // High-Priority Interruption & Intent Classification
        const isPauseQuery = /^(?:thamb|thamba|wait|pause|थांब|थांबा|hold\s*on|थांबव|थांबवा|एक\s*मिनिट)$/i.test(lowerQuery) ||
            /(?:thamb\s*re|thamba\s*jara|registration\s*thambwa|pause\s*registration|नोंदणी\s*थांबवा)/i.test(lowerQuery);

        const isResumeQuery = /^(?:resume|chalu\s*kara|suru\s*kara|continue|पुन्हा\s*सुरू\s*करा|सुरू\s*करा|चालू\s*करा|पुढे\s*चला|पुढे\s*जा)$/i.test(lowerQuery) ||
            /(?:resume\s*registration|continue\s*registration|नोंदणी\s*पुढे\s*करा|form\s*purna\s*karu|नोंदणी\s*सुरू\s*करा)/i.test(lowerQuery);

        const isCancelQuery = /^(?:cancel|रद्द\s*करा|रद्द|stop\s*registration|नोंदणी\s*रद्द\s*करा)$/i.test(lowerQuery) ||
            /(?:nondani\s*cancel|registration\s*cancel)/i.test(lowerQuery);

        const isCourseInquiry = /(?:courses?|कोर्स|कोर्सेस|अभ्यासक्रम).*(?:dakhav|dakhva|दाखव|दाखवा|ahet|आहेत|list|यादी|sathi|शोधा|बघायचे|search|पाहिजे|pahije)|(?:show|list|search|view).*(?:courses?|कोर्सेस?|अभ्यासक्रम)|(?:dakhav|दाखव|दाखवा).*(?:courses?|कोर्सेस?|कोर्स|अभ्यासक्रम)|(?:कोणते|kontya|available)\s*(?:courses?|कोर्सेस?|कोर्स|अभ्यासक्रम)|(?:ai|solar|electrician)\s*course/iu.test(lowerQuery);

        const isEligibilityInquiry = /(?:eligible|पात्रता|eligibility|पात्र\s*आहे\s*का|लागणारी\s*पात्रता|who\s*is\s*eligible)/i.test(lowerQuery);

        const isDocumentsInquiry = /(?:documents?|कागदपत्रे|कागदपत्र|document\s*list|कोणती\s*कागदपत्रे|documents\s*lagtat|कागदपत्रे\s*काय\s*लागतील|कागदपत्रे\s*लागतात|documents?\s*required|what\s*documents)/iu.test(lowerQuery);

        const isFormGuidanceInquiry = /(?:form\s*kasa\s*bharaycha|फॉर्म\s*कसा\s*भरायचा|form\s*kasa\s*bharo|how\s*to\s*fill\s*form|pudhe\s*kay\s*karu|पुढे\s*काय\s*करू|next\s*step|next\s*field|पुढील\s*पायरी|पायरी\s*काय\s*आहे)/iu.test(lowerQuery);

        const isStatusInquiry = /(?:status|स्थिती|अर्जाची\s*स्थिती|check\s*status|application\s*status|majhya\s*arjachi\s*sthiti)/iu.test(lowerQuery);

        const isCorrectionQuery = /(?:chukla|chukle|change|badla|correct|wrong|नवीन|new|सुधारा|दुरुस्त)\b/i.test(lowerQuery);

        // 0. Handle pending overwrite confirmation (Requirement B.8)
        if (pendingOverwrite) {
            const isYes = /^(?:yes|ho|hoy|ha|kar|kara|badal|badla|change|confirm|हो|होय|करा|बदला|होय करा)$/i.test(lowerQuery);
            const isNo = /^(?:no|nahi|nako|cancel|stop|नाही|नको|रद्द|थांबा)$/i.test(lowerQuery);
            if (isYes) {
                applyAutofill(pendingOverwrite.form, pendingOverwrite.values);
                const confirmMsg = language === 'mr'
                    ? "माहिती बदलली आहे ✅"
                    : "Information updated successfully ✅";
                setPendingOverwrite(null);
                setMessages(prev => [...prev, {
                    id: `overwrite_ok_${Date.now()}`,
                    sender: 'bot',
                    text: confirmMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                if (ttsEnabled) speakText(confirmMsg, language);
                return;
            } else if (isNo) {
                const cancelMsg = language === 'mr'
                    ? "बदल रद्द केला आहे. जुनी माहिती कायम ठेवली आहे."
                    : "Change cancelled. Existing information retained.";
                setPendingOverwrite(null);
                setMessages(prev => [...prev, {
                    id: `overwrite_cancel_${Date.now()}`,
                    sender: 'bot',
                    text: cancelMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                if (ttsEnabled) speakText(cancelMsg, language);
                return;
            }
        }

        // Live page awareness: inspect current active form if on one
        const currentActiveForm = getActiveForm(window.location.pathname);
        const liveFormState = inspectLiveForm(currentActiveForm);

        // If user asks "Pudhe kay karu?" or "Form kasa bharaycha?", give exact dynamic step based on real DOM state
        if (isFormGuidanceInquiry) {
            const guideText = getNextStepGuidance(currentActiveForm, liveFormState, language);
            setMessages(prev => [...prev, {
                id: `guide_${Date.now()}`,
                sender: 'bot',
                text: guideText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            if (ttsEnabled) speakText(guideText, language);
            return;
        }

        // Live form autofill when user is already on a registered form and provides form data
        if (currentActiveForm && !isCourseInquiry && !isEligibilityInquiry && !isDocumentsInquiry && !isStatusInquiry && !isCancelQuery && !isPauseQuery) {
            const liveExtracted = extractCandidateFields(query);
            const hasNameIndicator = /(?:नाव|नांव|नावं|आडनाव|aadnav|nav|naav|naam|name|surname|मेरा\s+नाम|my\s+name|i\s+am|मी\s+[A-Za-z\u0900-\u097F]+)/i.test(query);
            const nameCheck = hasNameIndicator ? parseCandidateName(query) : { isValid: false };

            if (!liveExtracted.firstName && !liveExtracted.itiRegistered && nameCheck.isValid && (nameCheck.firstName || nameCheck.cleanFullName)) {
                if (nameCheck.firstName) liveExtracted.firstName = nameCheck.firstName;
                if (nameCheck.middleName) liveExtracted.middleName = nameCheck.middleName;
                if (nameCheck.lastName) liveExtracted.lastName = nameCheck.lastName;
                if (!liveExtracted.itiRegistered && !liveFormState?.values_safe?.itiRegistered) {
                    liveExtracted.itiRegistered = 'no';
                }
            }

            if (nameCheck.isValid && nameCheck.needsClarification && nameCheck.clarificationPromptMr && !liveExtracted.firstName) {
                const askMsg = language === 'mr' ? nameCheck.clarificationPromptMr : (nameCheck.clarificationPromptEn || nameCheck.clarificationPromptMr);
                setMessages(prev => [...prev, {
                    id: `ambiguous_name_${Date.now()}`,
                    sender: 'bot',
                    text: askMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                if (ttsEnabled) speakText(askMsg, language);
                return;
            }

            if (Object.keys(liveExtracted).length > 0) {
                // Check if any extracted field is already filled with a different value (Requirement B.8)
                const conflicts = [];
                for (const [k, newVal] of Object.entries(liveExtracted)) {
                    const currentVal = liveFormState?.values_safe?.[k];
                    if (currentVal && String(currentVal).trim().toLowerCase() !== String(newVal).trim().toLowerCase()) {
                        conflicts.push({ key: k, oldVal: currentVal, newVal });
                    }
                }

                if (conflicts.length > 0) {
                    const fieldLabels = conflicts.map(c => {
                        const f = currentActiveForm.fields.find(fd => fd.key === c.key);
                        return language === 'mr' ? (f?.labelMr || c.key) : (f?.labelEn || c.key);
                    }).join(', ');
                    const conflictMsg = language === 'mr'
                        ? `तुमचे (${fieldLabels}) आधीच भरले आहे. ते बदलून नवीन माहिती भरायची आहे का? (हो / नाही)`
                        : `Your (${fieldLabels}) is already filled. Do you want to change it? (Yes / No)`;
                    setPendingOverwrite({ form: currentActiveForm, values: liveExtracted, conflicts });
                    setMessages(prev => [...prev, {
                        id: `overwrite_ask_${Date.now()}`,
                        sender: 'bot',
                        text: conflictMsg,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                    if (ttsEnabled) speakText(conflictMsg, language);
                    return;
                }

                // Apply autofill live to DOM & React state
                applyAutofill(currentActiveForm, liveExtracted);

                const mergedData = { ...(regFlow?.data || {}), ...(liveFormState?.values_safe || {}), ...liveExtracted };
                const remainingEmpty = currentActiveForm.fields.filter(f => f.required && !mergedData[f.key]);
                const nextReq = remainingEmpty[0];
                const nextStepKey = nextReq ? nextReq.key : 'review';

                const nextFlow = {
                    active: nextStepKey !== 'idle',
                    isPaused: false,
                    step: nextStepKey,
                    data: mergedData,
                    formId: currentActiveForm.id
                };
                setRegFlow(nextFlow);
                try {
                    sessionStorage.setItem('msbsvet_reg_flow', JSON.stringify(nextFlow));
                } catch (e) {}

                const filledNames = Object.keys(liveExtracted).map(k => {
                    const f = currentActiveForm.fields.find(fd => fd.key === k);
                    return f ? (language === 'mr' ? f.labelMr : f.labelEn) : k;
                }).join(', ');

                let fillMsg = '';
                if (liveExtracted.itiRegistered === 'no' && !liveExtracted.firstName) {
                    fillMsg = language === 'mr'
                        ? "ठीक आहे! नवीन उमेदवार नोंदणीसाठी फॉर्म उघडला आहे. ✅ आता तुमचे पूर्ण नाव सांगा किंवा पहिले नाव (First Name) काय आहे?"
                        : "Understood! The new candidate registration form is opened. ✅ To start, what is your full name or First Name?";
                } else if (liveExtracted.itiRegistered === 'yes' && !liveExtracted.registrationNumber) {
                    fillMsg = language === 'mr'
                        ? "ठीक आहे! तुम्ही यापूर्वी ITI मध्ये नोंदणी केली आहे. कृपया तुमचा आधीचा ITI नोंदणी क्रमांक (Registration Number) सांगा किंवा टाका:"
                        : "Understood! Since you are ITI registered, please state or enter your previous ITI Registration Number:";
                } else if (nextReq) {
                    fillMsg = language === 'mr'
                        ? `तुमची माहिती (${filledNames}) फॉर्ममध्ये भरली आहे. ✅ आता ${nextReq.promptMr}`
                        : `Your details (${filledNames}) have been entered. ✅ Next: ${nextReq.promptEn}`;
                } else {
                    fillMsg = language === 'mr'
                        ? `तुमची माहिती (${filledNames}) फॉर्ममध्ये भरली आहे. ✅ सर्व आवश्यक माहिती पूर्ण झाली आहे. कृपया फॉर्म तपासा आणि OTP पडताळणी करून सबमिट करा.`
                        : `Your details (${filledNames}) have been entered. ✅ All required fields are complete. Please review and submit via OTP.`;
                }

                setMessages(prev => [...prev, {
                    id: `bot_autofill_${Date.now()}`,
                    sender: 'bot',
                    text: fillMsg,
                    structuredData: {
                        quick_replies: getFieldQuickReplies(nextStepKey, language)
                    },
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                if (ttsEnabled) speakText(fillMsg, language);
                return;
            }
        }

        // 1. If currently in registration flow, handle Interruption, Pause, Resume, or Cancellation
        if (regFlow.active) {
            // A. User wants to Cancel registration
            if (isCancelQuery) {
                setRegFlow({ active: false, isPaused: false, step: 'idle', pausedStep: null, data: {} });
                sessionStorage.removeItem('msbsvet_reg_flow');
                setPendingAutofill(null);

                const cancelMsg = language === 'mr'
                    ? "नोंदणी प्रक्रिया पूर्णपणे रद्द केली आहे. तुम्हाला इतर काही माहिती हवी आहे का?"
                    : "Candidate registration flow has been cancelled. How else may I assist you?";

                setMessages(prev => [...prev, {
                    id: `reg_cancel_${Date.now()}`,
                    sender: 'bot',
                    text: cancelMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);

                if (ttsEnabled) {
                    speakText(cancelMsg, language, {
                        onStart: () => setAssistantState('speaking'),
                        onEnd: () => setAssistantState('idle'),
                        onError: () => setAssistantState('idle')
                    });
                }
                return;
            }

            // B. User explicitly asks to Pause ("Thamb", "Wait", "Pause", "थांबा")
            if (isPauseQuery) {
                setRegFlow(prev => ({ ...prev, isPaused: true, pausedStep: prev.step }));
                const activeFormDef = currentActiveForm || FORM_REGISTRY.candidate_registration;
                const reqFields = activeFormDef.fields.filter(f => f.required);
                const completedCount = reqFields.filter(f => regFlow.data && regFlow.data[f.key]).length;

                const pauseMsg = language === 'mr'
                    ? `नोंदणी प्रक्रिया तात्पुरती थांबवली आहे (${completedCount}/${reqFields.length} आवश्यक तपशील सुरक्षित आहेत). ⏸️\n\nजेव्हा तुम्हाला नोंदणी पुन्हा सुरू करायची असेल तेव्हा 'Resume' किंवा 'नोंदणी सुरू करा' म्हणा.`
                    : `Registration has been paused (${completedCount}/${reqFields.length} required fields saved). ⏸️\n\nWhenever you are ready to continue, simply say 'Resume' or click below.`;

                setMessages(prev => [...prev, {
                    id: `reg_pause_${Date.now()}`,
                    sender: 'bot',
                    text: pauseMsg,
                    structuredData: {
                        quick_replies: language === 'mr' ? [
                            { label: '▶️ नोंदणी पुन्हा सुरू करा (Resume)', query: 'Resume' },
                            { label: '📚 उपलब्ध कोर्सेस दाखवा', query: 'courses dakhav' },
                            { label: '❌ नोंदणी रद्द करा', query: 'नोंदणी रद्द करा' }
                        ] : [
                            { label: '▶️ Resume Registration', query: 'Resume' },
                            { label: '📚 Show Available Courses', query: 'Show available courses' },
                            { label: '❌ Cancel Registration', query: 'Cancel registration' }
                        ]
                    },
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);

                if (ttsEnabled) {
                    speakText(pauseMsg, language, {
                        onStart: () => setAssistantState('speaking'),
                        onEnd: () => setAssistantState('idle'),
                        onError: () => setAssistantState('idle')
                    });
                }
                return;
            }

            // C. User asks to Resume after pause
            if (regFlow.isPaused && isResumeQuery) {
                const activeFormDef = currentActiveForm || FORM_REGISTRY.candidate_registration;
                const reqFields = activeFormDef.fields.filter(f => f.required);
                const nextMissing = reqFields.find(f => !regFlow.data || !regFlow.data[f.key]);
                const completedCount = reqFields.filter(f => regFlow.data && regFlow.data[f.key]).length;
                const nextStep = nextMissing ? nextMissing.key : 'review';

                setRegFlow(prev => ({ ...prev, isPaused: false, step: nextStep }));

                let resumeMsg = '';
                if (nextMissing) {
                    resumeMsg = language === 'mr'
                        ? `नोंदणी पुन्हा सुरू करत आहोत! ✅ आपण ${completedCount}/${reqFields.length} आवश्यक पायऱ्या पूर्ण केल्या होत्या.\n\nआता ${nextMissing.promptMr}`
                        : `Resuming your registration! ✅ You had completed ${completedCount}/${reqFields.length} required fields.\n\nNow, ${nextMissing.promptEn}`;
                } else {
                    resumeMsg = language === 'mr'
                        ? "सर्व आवश्यक फील्ड भरले आहेत! कृपया स्क्रीनवरील तपशील तपासा."
                        : "All required fields are completed! Please review the details on screen.";
                }

                setMessages(prev => [...prev, {
                    id: `reg_resume_${Date.now()}`,
                    sender: 'bot',
                    text: resumeMsg,
                    structuredData: {
                        quick_replies: language === 'mr' ? [
                            { label: '⏸️ नोंदणी थांबवा (Pause)', query: 'Pause' },
                            { label: '❌ नोंदणी रद्द करा', query: 'नोंदणी रद्द करा' }
                        ] : [
                            { label: '⏸️ Pause Registration', query: 'Pause' },
                            { label: '❌ Cancel Registration', query: 'Cancel' }
                        ]
                    },
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);

                if (ttsEnabled) {
                    speakText(resumeMsg, language, {
                        onStart: () => setAssistantState('speaking'),
                        onEnd: () => setAssistantState('idle'),
                        onError: () => setAssistantState('idle')
                    });
                }
                return;
            }

            // D. SMART INTERRUPTION: User asks for courses, eligibility, documents, or general info during registration!
            if (isCourseInquiry || isEligibilityInquiry || isDocumentsInquiry) {
                // Pause registration workflow without losing any data!
                setRegFlow(prev => ({ ...prev, isPaused: true, pausedStep: prev.step }));
                // Proceed down to FastAPI AI Backend fetch so trusted RAG & courses are retrieved!
            } else if (isFormGuidanceInquiry) {
                const activeFormDef = currentActiveForm || FORM_REGISTRY.candidate_registration;
                const reqFields = activeFormDef.fields.filter(f => f.required);
                const nextMissing = reqFields.find(f => !regFlow.data || !regFlow.data[f.key]);
                const curStepInfo = nextMissing
                    ? (language === 'mr'
                        ? `तुम्ही सध्या ${activeFormDef.title.mr} भरत आहात. पुढील आवश्यक पायरी: ${nextMissing.promptMr}`
                        : `You are filling the ${activeFormDef.title.en}. Next step: ${nextMissing.promptEn}`)
                    : (language === 'mr'
                        ? "सर्व आवश्यक फील्ड भरले आहेत. कृपया फॉर्म तपासा आणि सबमिट करा."
                        : "All required fields are complete. Please review and submit the form.");

                setMessages(prev => [...prev, {
                    id: `reg_guide_${Date.now()}`,
                    sender: 'bot',
                    text: curStepInfo,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);

                if (ttsEnabled) {
                    speakText(curStepInfo, language, {
                        onStart: () => setAssistantState('speaking'),
                        onEnd: () => setAssistantState('idle'),
                        onError: () => setAssistantState('idle')
                    });
                }
                return;
            } else if (!regFlow.isPaused || isCorrectionQuery) {
                // Active slot filling turn
                handleRegistrationFlowTurn(query);
                return;
            }
        }

        // 2. Role-specific and General Registration routing
        const instituteKeywords = [
            'institute', 'institutes', 'instutite', 'institue', 'instiute', 'inst',
            'संस्था', 'संस्थेची', 'संस्थेचे', 'संस्थेसाठी', 'संस्थांची', 'sanstha',
            'इन्स्टिट्यूट', 'इन्स्टिट्युट', 'इंस्टिट्यूट', 'इंस्टिट्युट',
            'college', 'महाविद्यालय'
        ];
        const promotingOrgKeywords = [
            'promoting organization', 'promoting organisation', 'promoting org',
            'promotingpograntion', 'promoting pograntion', 'promoting', 'pograntion',
            'प्रवर्तक संस्था', 'प्रवर्तक', 'pravartak sanstha', 'pravartak'
        ];
        const staffKeywords = [
            'staff', 'कर्मचारी', 'शिक्षक', 'अध्यापक', 'employee', 'trainer', 'प्रशिक्षक'
        ];
        const candidateKeywords = [
            'candidate', 'उमेदवार', 'विद्यार्थी', 'student', 'कॅंडिडेट', 'कँडिडेट'
        ];
        const registrationKeywords = [
            'register', 'registration', 'reg', 'nondani', 'नोंदणी', 'रजिस्ट्रेशन',
            'karyachy', 'karaycha', 'karayche', 'karne', 'करा', 'करायची', 'करायचे', 'करायचा', 'करायचं', 'अर्ज'
        ];

        const isInstituteQuery = instituteKeywords.some(kw => lowerQuery.includes(kw));
        const isPromotingOrgQuery = promotingOrgKeywords.some(kw => lowerQuery.includes(kw));
        const isStaffQuery = staffKeywords.some(kw => lowerQuery.includes(kw));
        const isCandidateQuery = candidateKeywords.some(kw => lowerQuery.includes(kw));
        const isRegQuery = registrationKeywords.some(kw => lowerQuery.includes(kw)) ||
            /(?:नोंदणी|रजिस्ट्रेशन|register|registration|अर्ज\s*करायचा|अर्ज\s*करायचं)/i.test(lowerQuery);

        // A. Direct Institute / Promoting Organization Registration
        if (isPromotingOrgQuery || (isInstituteQuery && isRegQuery) || lowerQuery.trim() === 'institute' || lowerQuery.trim() === 'संस्था') {
            handleNavigation('/React/Public/PromotingOrganizationRegistration', false, false);

            const instMsg = language === 'mr'
                ? "नवीन संस्था (Institute) सुरू करण्यासाठी MSBSVET च्या नियमांनुसार आधी प्रवर्तक संस्था (Promoting Organization) ची नोंदणी करणे आवश्यक असते. मी तुम्हाला 'प्रवर्तक संस्था नोंदणी' पृष्ठावर घेऊन जात आहे.\n\nयेथे संस्थेचा प्रकार, नोंदणी तपशील आणि GR नंबर भरून नोंदणी पूर्ण करा. त्यानंतर तुम्ही संस्था LOI (Letter of Intent) साठी अर्ज करू शकता."
                : "To start a new Institute with MSBSVET, you must first register your Promoting Organization (प्रवर्तक संस्था). Navigating to the Promoting Organization Registration page.\n\nPlease complete the organization details and GR number here. Once approved, you can proceed to Institute LOI Generation.";

            const spokenInstMsg = language === 'mr'
                ? "नवीन संस्था सुरू करण्यासाठी आधी प्रवर्तक संस्था नोंदणी करणे आवश्यक असते. मी तुम्हाला प्रवर्तक संस्था नोंदणी पृष्ठावर घेऊन जात आहे."
                : "To start an Institute, Promoting Organization registration is required first. Navigating to Promoting Organization Registration.";

            setMessages(prev => [...prev, {
                id: `bot_inst_${Date.now()}`,
                sender: 'bot',
                text: instMsg,
                structuredData: {
                    actions: [{ type: 'navigate', url: '/React/Public/PromotingOrganizationRegistration' }],
                    quick_replies: language === 'mr' ? [
                        { label: '🏢 प्रवर्तक संस्था नोंदणी', query: 'प्रवर्तक संस्था नोंदणी' },
                        { label: '📜 संस्था LOI अर्ज', query: 'संस्था एलओआय निर्मिती' },
                        { label: '🏛️ संलग्न संस्था यादी', query: 'संस्था दाखवा' },
                    ] : [
                        { label: '🏢 Promoting Org Registration', query: 'Promoting organization registration' },
                        { label: '📜 Institute LOI Generation', query: 'Institute LOI Generation' },
                        { label: '🏛️ Institutes Directory', query: 'Show institutes' },
                    ]
                },
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            if (ttsEnabled) {
                speakText(spokenInstMsg, language, {
                    onStart: () => setAssistantState('speaking'),
                    onEnd: () => setAssistantState('idle'),
                    onError: () => setAssistantState('idle')
                });
            }
            return;
        }

        // B. Staff Registration
        if (isStaffQuery && (isRegQuery || lowerQuery.trim() === 'staff' || lowerQuery.trim() === 'कर्मचारी')) {
            handleNavigation('/React/staff/register', false, false);

            const staffMsg = language === 'mr'
                ? "MSBSVET पोर्टलवर कर्मचारी (Staff) नोंदणीसाठी मी तुम्हाला घेऊन जात आहे. येथे तुमची शैक्षणिक पात्रता, पदनाम आणि संपर्क तपशील आवश्यक आहेत.\n\nनोंदणी फॉर्म उघडला आहे. सुरुवात करण्यासाठी तुमचा मोबाईल नंबर किंवा नाव सांगा."
                : "Navigating to the MSBSVET Staff Registration page. You will need your educational qualifications, designation, and contact details.\n\nThe staff form is open. To begin, please provide your mobile number or full name.";

            const spokenStaffMsg = language === 'mr'
                ? "कर्मचारी नोंदणीसाठी मी तुम्हाला नोंदणी पृष्ठावर घेऊन जात आहे."
                : "Navigating to Staff Registration page.";

            setMessages(prev => [...prev, {
                id: `bot_staff_${Date.now()}`,
                sender: 'bot',
                text: staffMsg,
                structuredData: {
                    actions: [{ type: 'navigate', url: '/React/staff/register' }],
                    quick_replies: language === 'mr' ? [
                        { label: '📋 कागदपत्रे काय लागतील', query: 'कागदपत्रे काय लागतील' },
                        { label: '📝 फॉर्म कसा भरायचा', query: 'form kasa bharaycha' },
                        { label: '🔍 अर्जाची स्थिती', query: 'माझ्या अर्जाची स्थिती' },
                    ] : [
                        { label: '📋 Required Documents', query: 'Required documents' },
                        { label: '📝 Form Guidance', query: 'How to fill form' },
                        { label: '🔍 Application Status', query: 'Check application status' },
                    ]
                },
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            if (ttsEnabled) {
                speakText(spokenStaffMsg, language, {
                    onStart: () => setAssistantState('speaking'),
                    onEnd: () => setAssistantState('idle'),
                    onError: () => setAssistantState('idle')
                });
            }
            return;
        }

        // C. General Registration (Disambiguation when role is not specified)
        const isGeneralRegistration = isRegQuery && !isCandidateQuery && !isStaffQuery && !isInstituteQuery && !isPromotingOrgQuery &&
            !isCourseInquiry && !isDocumentsInquiry && !isStatusInquiry && !isFormGuidanceInquiry;

        if (isGeneralRegistration) {
            const isMr = language === 'mr' || /[\u0900-\u097F]/.test(query) || /karaych|kasa|mala|aahe/i.test(query);
            const genMsg = isMr
                ? "तुम्हाला कोणत्या प्रकारची नोंदणी करायची आहे — Candidate (उमेदवार), Staff (कर्मचारी), Institute (संस्था) की Promoting Organization (प्रवर्तक संस्था)?"
                : "Which type of registration do you want to complete — Candidate, Staff, Institute, or Promoting Organization?";

            setMessages(prev => [...prev, {
                id: `bot_gen_reg_${Date.now()}`,
                sender: 'bot',
                text: genMsg,
                structuredData: {
                    quick_replies: isMr ? [
                        { label: '🎓 उमेदवार नोंदणी (Candidate)', query: 'Candidate registration karaycha aahe' },
                        { label: '👨‍🏫 कर्मचारी नोंदणी (Staff)', query: 'Staff registration karaycha aahe' },
                        { label: '🏛️ संस्था नोंदणी (Institute)', query: 'Institute registration kasa karu?' },
                        { label: '🏢 प्रवर्तक संस्था (Promoting Org)', query: 'Promoting Organization registration' },
                    ] : [
                        { label: '🎓 Candidate Registration', query: 'I want to register as a candidate' },
                        { label: '👨‍🏫 Staff Registration', query: 'Staff registration' },
                        { label: '🏛️ Institute Registration', query: 'Institute registration' },
                        { label: '🏢 Promoting Organization', query: 'Promoting Organization registration' },
                    ]
                },
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            if (ttsEnabled) {
                speakText(genMsg, isMr ? 'mr' : 'en', {
                    onStart: () => setAssistantState('speaking'),
                    onEnd: () => setAssistantState('idle'),
                    onError: () => setAssistantState('idle')
                });
            }
            return;
        }

        // D. Candidate Registration
        const isCandidateRegistration = (isCandidateQuery && (isRegQuery || lowerQuery.trim() === 'candidate' || lowerQuery.trim() === 'उमेदवार')) ||
            /(?:candidate\s*registration|उमेदवार\s*नोंदणी|कॅंडिडेट\s*रजिस्ट्रेशन|कँडिडेट\s*रजिस्ट्रेशन|कॅंडिडेट\s*नोंदणी|register\s*as\s*(?:a\s*)?candidate|कॅंडिडेट\s*फॉर्म|candidate\s*form)/i.test(lowerQuery) ||
            /(?:majha\s*(?:purna\s*)?nav|majha\s*naav|maza\s*(?:purna\s*)?nav|mera\s*(?:pura\s*)?naam|my\s*(?:full\s*)?name|माझं\s*(?:पूर्ण\s*)?नाव|माझे\s*(?:पूर्ण\s*)?नाव|majha\s*first\s*name|my\s*first\s*name|आडनाव|aadnav|my\s*email|majha\s*email|majha\s*mobile|form\s*bhar)/i.test(lowerQuery);

        if (isCandidateRegistration) {
            handleNavigation('/React/candidate/register', false, false);
            executeLiveFormAutofill({});

            // Extract any fields provided in this initial utterance
            const initialExtracted = extractCandidateFields(query);
            if (Object.keys(initialExtracted).length > 0) {
                executeLiveFormAutofill(initialExtracted);
            }

            const formFields = FORM_REGISTRY.candidate_registration.fields;
            const reqFields = formFields.filter(f => f.required);
            const initialData = { ...initialExtracted };
            const nextMissing = reqFields.find(f => !initialData[f.key]);
            const firstStep = nextMissing ? nextMissing.key : 'review';

            let firstPrompt = '';
            let quickReplies = null;
            if (Object.keys(initialExtracted).length > 0) {
                const filledNames = Object.keys(initialExtracted)
                    .map(k => {
                        const f = formFields.find(rf => rf.key === k);
                        return f ? (language === 'mr' ? f.labelMr : f.labelEn) : k;
                    })
                    .join(', ');

                if (nextMissing) {
                    firstPrompt = language === 'mr'
                        ? `नक्की! तुमची माहिती (${filledNames}) फॉर्ममध्ये भरली आहे. ✅ आता ${nextMissing.promptMr}`
                        : `Certainly! Your ${filledNames} has been entered into the form live. ✅ Now, ${nextMissing.promptEn}`;
                } else {
                    firstPrompt = language === 'mr'
                        ? `नक्की! तुमची माहिती (${filledNames}) फॉर्ममध्ये भरली आहे. ✅ सर्व आवश्यक माहिती पूर्ण झाली आहे. कृपया फॉर्म तपासा आणि स्वतः सबमिट करा.`
                        : `Certainly! Your ${filledNames} has been entered into the form live. ✅ All required fields are complete. Please review the form to submit.`;
                }
            } else {
                if (firstStep === 'itiRegistered') {
                    firstPrompt = language === 'mr'
                        ? "नक्की! उमेदवार नोंदणीसाठी मी तुम्हाला मदत करतो. नोंदणी फॉर्म स्क्रीनवर उघडला आहे. तुम्ही यापूर्वी कोणत्याही ITI मध्ये नोंदणी केली आहे का? (होय / नाही)"
                        : "Certainly! I will help you with candidate registration. The form is opened on screen. Have you previously registered with any ITI? (Yes / No)";
                    quickReplies = language === 'mr' ? [
                        { label: '❌ नाही (नवीन नोंदणी)', query: 'नाही, नवीन नोंदणी करायची आहे' },
                        { label: '✅ होय (ITI नोंदणीकृत)', query: 'होय, मी ITI मध्ये नोंदणी केली आहे' }
                    ] : [
                        { label: '❌ No (New Registration)', query: 'No, I want new registration' },
                        { label: '✅ Yes (ITI Registered)', query: 'Yes, I am ITI registered' }
                    ];
                } else {
                    firstPrompt = language === 'mr'
                        ? "नक्की! उमेदवार नोंदणीसाठी मी तुम्हाला मदत करतो. नोंदणी फॉर्म स्क्रीनवर उघडला आहे. आधी तुमचे पहिले नाव (First Name) काय आहे?"
                        : "Certainly! I will help you with candidate registration. The form is opened on screen. To begin, what is your First Name?";
                }
            }

            setRegFlow({ active: true, step: firstStep, data: initialData, formId: 'candidate_registration' });

            setMessages(prev => [...prev, {
                id: `reg_start_${Date.now()}`,
                sender: 'bot',
                text: firstPrompt,
                ...(quickReplies ? { structuredData: { quick_replies: quickReplies } } : {}),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            if (ttsEnabled) {
                speakText(firstPrompt, language, {
                    onStart: () => setAssistantState('speaking'),
                    onEnd: () => setAssistantState('idle'),
                    onError: () => setAssistantState('idle')
                });
            }
            return;
        }

        // 3. Direct Browser & Action Commands (Instant Zero-Latency Execution)
        if (/(?:scroll\s*down|खाली\s*स्क्रोल|page\s*khali|खाली\s*जा|scroll\s*down\s*kar)/i.test(lowerQuery)) {
            executeSystemAction({ type: 'scroll', direction: 'down' });
            return;
        }
        if (/(?:scroll\s*up|वर\s*स्क्रोल|page\s*var|वर\s*जा|scroll\s*up\s*kar)/i.test(lowerQuery)) {
            executeSystemAction({ type: 'scroll', direction: 'up' });
            return;
        }
        if (/(?:scroll\s*to\s*top|सुरुवातीला\s*जा|top\s*var\s*ja)/i.test(lowerQuery)) {
            executeSystemAction({ type: 'scroll', direction: 'top' });
            return;
        }
        if (/(?:scroll\s*to\s*bottom|शेवटी\s*जा|तळाशी\s*जा)/i.test(lowerQuery)) {
            executeSystemAction({ type: 'scroll', direction: 'bottom' });
            return;
        }
        if (/(?:print\s*(?:page|this)?|प्रिंट\s*करा|page\s*print\s*kar)/i.test(lowerQuery)) {
            executeSystemAction({ type: 'print' });
            return;
        }
        if (/(?:switch\s*to\s*english|change\s*to\s*english|इंग्रजी\s*करा|इंग्लिश\s*करा)/i.test(lowerQuery)) {
            executeSystemAction({ type: 'language', lang: 'en' });
            return;
        }
        if (/(?:switch\s*to\s*marathi|change\s*to\s*marathi|मराठी\s*करा|मराठी\s*भाषा)/i.test(lowerQuery)) {
            executeSystemAction({ type: 'language', lang: 'mr' });
            return;
        }
        if (/(?:mute\s*(?:voice|audio)?|आवाज\s*बंद\s*करा|audio\s*band\s*kar)/i.test(lowerQuery)) {
            executeSystemAction({ type: 'tts', enabled: false });
            return;
        }
        if (/(?:unmute\s*(?:voice|audio)?|आवाज\s*सुरू\s*करा|audio\s*suru\s*kar)/i.test(lowerQuery)) {
            executeSystemAction({ type: 'tts', enabled: true });
            return;
        }
        if (/(?:log\s*out|logout|बाहेर\s*पडा|sign\s*out)/i.test(lowerQuery)) {
            executeSystemAction({ type: 'logout' });
            return;
        }
        if (/(?:clear\s*chat|reset\s*chat|नवीन\s*संभाषण|चॅट\s*क्लिअर\s*करा)/i.test(lowerQuery)) {
            executeSystemAction({ type: 'clear_chat' });
            return;
        }

        // 4. Direct Fast Navigation Across All MSBSVET Functional Pages
        if (/(?:hall\s*ticket|हॉल\s*तिकीट|hallticket)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/HallTicket', true);
            return;
        }
        if (/(?:time\s*table|timetable|वेळापत्रक)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/TimeTable', true);
            return;
        }
        if (/(?:exam\s*result|परीक्षेचा\s*निकाल|निकाल\s*दाखवा|marksheet|गुणपत्रिका)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/ExamResult', true);
            return;
        }
        if (/(?:attendance|उपस्थिती|attendance\s*report)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/AttendanceReport', true);
            return;
        }
        if (/(?:grievance|complaint|तक्रार|takrar)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/GrievanceForm', true);
            return;
        }
        if (/(?:assistance|सहाय्य|helpdesk|support)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/Assistance', true);
            return;
        }
        if (/(?:pay\s*exam\s*fee|fee\s*receipt|परीक्षा\s*शुल्क|शुल्क\s*पावती)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/PayExamFee', true);
            return;
        }

        // Screen Awareness Query: "Where am I?", "Which page is this?", "मी कोणत्या पेजवर आहे?"
        if (/(?:mi\s*atta\s*kontya\s*page|kontya\s*page\s*var|which\s*page\s*am\s*i\s*on|what\s*page\s*is\s*this|current\s*page|मी\s*कोणत्या\s*पेजवर|कोणत्या\s*पृष्ठावर)/i.test(lowerQuery)) {
            const currentPath = window.location.pathname;
            const routeMeta = PORTAL_ROUTES_MAP[currentPath] || PORTAL_ROUTES_MAP[currentPath.replace(/^\/React/, '')] || PORTAL_ROUTES_MAP[`/React${currentPath}`];
            const pageName = routeMeta ? (language === 'mr' ? routeMeta.mr : routeMeta.en) : (document.title || 'MSBSVET Portal');
            const pageMsg = language === 'mr'
                ? `सध्या तुम्ही '${pageName}' पृष्ठावर आहात. (मार्ग: ${currentPath})`
                : `You are currently on the '${pageName}' page. (Route: ${currentPath})`;
            setMessages(prev => [...prev, {
                id: `page_context_${Date.now()}`,
                sender: 'bot',
                text: pageMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            if (ttsEnabled) speakText(pageMsg, language);
            return;
        }

        // Profile Next Step Sequence Query: "next step", "पुढील पायरी", "pudhe kay karu"
        if (/(?:next\s*step|पुढील\s*पायरी|pudhil\s*payari|pudhchi\s*step|पुढची\s*step)/i.test(lowerQuery)) {
            const currentPath = window.location.pathname.toLowerCase();
            const stepOrder = [
                { id: 'primary', route: '/React/Candidate/Primary', mr: 'पायरी १: वैयक्तिक माहिती', en: 'Step 1: Personal Details' },
                { id: 'address', route: '/React/Candidate/Address', mr: 'पायरी २: पत्ता तपशील', en: 'Step 2: Address Details' },
                { id: 'parent', route: '/React/Candidate/Parent', mr: 'पायरी ३: पालक तपशील', en: 'Step 3: Parent Details' },
                { id: 'category', route: '/React/Candidate/Category', mr: 'पायरी ४: प्रवर्ग व आरक्षण', en: 'Step 4: Category Details' },
                { id: 'qualification', route: '/React/Candidate/Qualification', mr: 'पायरी ५: शैक्षणिक पात्रता', en: 'Step 5: Qualification' },
                { id: 'training', route: '/React/Candidate/Training', mr: 'पायरी ६: व्यावसायिक प्रशिक्षण', en: 'Step 6: Training' },
                { id: 'additional', route: '/React/Candidate/Additional', mr: 'पायरी ७: अतिरिक्त माहिती', en: 'Step 7: Additional' },
                { id: 'bank', route: '/React/Candidate/Bank', mr: 'पायरी ८: बँक तपशील', en: 'Step 8: Bank Details' },
                { id: 'workexperience', route: '/React/Candidate/WorkExperience', mr: 'पायरी ९: कामाचा अनुभव', en: 'Step 9: Work Experience' },
                { id: 'lockapplicationform', route: '/React/Candidate/LockApplicationForm', mr: 'पायरी १०: अर्ज पडताळणी व लॉक', en: 'Step 10: Lock Application' }
            ];

            const currentIndex = stepOrder.findIndex(s => currentPath.includes(s.id));
            if (currentIndex >= 0 && currentIndex < stepOrder.length - 1) {
                const nextStepObj = stepOrder[currentIndex + 1];
                handleNavigation(nextStepObj.route, true);
                return;
            } else if (currentIndex === stepOrder.length - 1) {
                const lockMsg = language === 'mr'
                    ? "तुम्ही शेवटच्या पायरीवर (पायरी १०: अर्ज पडताळणी व लॉक) आहात. कृपया सर्व माहिती तपासून स्वतः लॉक बटणावर क्लिक करा."
                    : "You are on the final step (Step 10: Lock Profile). Please review all details and click Lock Application.";
                setMessages(prev => [...prev, {
                    id: `bot_last_step_${Date.now()}`,
                    sender: 'bot',
                    text: lockMsg,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                if (ttsEnabled) speakText(lockMsg, language);
                return;
            }
        }

        // Complete Profile Guided Intent
        if (/(?:complete\s*my\s*profile|profile\s*purna|माझे\s*प्रोफाईल\s*पूर्ण|प्रोफाईल\s*भरा)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/Primary', true);
            const profMsg = language === 'mr'
                ? "उमेदवार प्रोफाइलमध्ये एकूण १० पायऱ्या आहेत: १. वैयक्तिक माहिती, २. पत्ता, ३. पालक, ४. प्रवर्ग, ५. शैक्षणिक पात्रता, ६. प्रशिक्षण, ७. अतिरिक्त, ८. बँक, ९. कामाचा अनुभव, १०. अर्ज लॉक. मी तुम्हाला पायरी १: वैयक्तिक माहितीवर नेत आहे."
                : "Candidate Profile consists of 10 steps: 1. Personal Details, 2. Address, 3. Parent, 4. Category, 5. Qualification, 6. Training, 7. Additional, 8. Bank, 9. Work Experience, 10. Lock Application. Navigating to Step 1: Personal Details.";
            setMessages(prev => [...prev, {
                id: `complete_profile_${Date.now()}`,
                sender: 'bot',
                text: profMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            if (ttsEnabled) speakText(profMsg, language);
            return;
        }

        // 10 Authenticated Candidate Profile Form Navigation
        if (/(?:personal\s*details|वैयक्तिक\s*माहिती|primary\s*details|primary\s*profile)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/Primary', true);
            return;
        }
        if (/(?:address\s*details|पत्ता\s*बदला|majha\s*address|पत्ता\s*तपशील|address\s*bhar|fill\s*address)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/Address', true);
            return;
        }
        if (/(?:parent\s*details|पालक\s*तपशील|वडिलांचे\s*नाव|आईचे\s*नाव|guardian\s*details)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/Parent', true);
            return;
        }
        if (/(?:category\s*details|प्रवर्ग|जातीचा\s*प्रवर्ग|reservation|आरक्षण)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/Category', true);
            return;
        }
        if (/(?:education\s*qualification|शैक्षणिक\s*पात्रता|qualification|शिक्षण\s*माहिती)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/Qualification', true);
            return;
        }
        if (/(?:training\s*details|प्रशिक्षण\s*माहिती|vocational\s*training)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/Training', true);
            return;
        }
        if (/(?:additional\s*details|अतिरिक्त\s*माहिती)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/Additional', true);
            return;
        }
        if (/(?:bank\s*details|बँक\s*खाते|बँक\s*तपशील|bank\s*account|ifsc)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/Bank', true);
            return;
        }
        if (/(?:work\s*experience|कामाचा\s*अनुभव|नोकरी\s*अनुभव)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/WorkExperience', true);
            return;
        }
        if (/(?:lock\s*unlock\s*form|अर्ज\s*लॉक|फॉर्म\s*लॉक|lock\s*profile|lock\s*form|lock\s*application)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/LockApplicationForm', true);
            const lockWarn = language === 'mr'
                ? "⚠️ अर्ज लॉक करण्यापूर्वी कृपया सर्व १० पायऱ्यांची माहिती तपासा. एकदा अर्ज लॉक केल्यास DVET च्या मान्यतेशिवाय बदल करता येत नाही."
                : "⚠️ Please review all 10 steps before locking. Once locked, changes cannot be made without DVET approval.";
            setMessages(prev => [...prev, {
                id: `lock_warn_${Date.now()}`,
                sender: 'bot',
                text: lockWarn,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            if (ttsEnabled) speakText(lockWarn, language);
            return;
        }
        if (/(?:academisthan|अकॅडेमिस्थान|lms)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/CandidateProfile/Academisthan', true);
            return;
        }
        if (/(?:bcls|जीवन\s*रक्षक|basic\s*life\s*support)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/CandidateProfile/Bcls', true);
            return;
        }
        if (/(?:aadhar\s*reverification|आधार\s*पुनर्पडताळणी|aadhaar)/i.test(lowerQuery)) {
            handleNavigation('/React/Candidate/CandidateProfile/AadharReverification', true);
            return;
        }
        if (/(?:reports|gazette|अहवाल|गॅझेट)/i.test(lowerQuery)) {
            handleNavigation('/React/reports/reportIndex', true);
            return;
        }
        if (/(?:reset\s*password|पासवर्ड\s*रीसेट|forgot\s*password)/i.test(lowerQuery)) {
            handleNavigation('/React/auth/reset-password', false);
            return;
        }
        if (/(?:loi\s*generation|एलओआय|institute\s*approval)/i.test(lowerQuery)) {
            handleNavigation('/React/institute/approval/loi-generation', true);
            return;
        }

        const dashboardPatterns = [
            'candidate dashboard var gheun ja', 'dashboard var gheun ja', 'डॅशबोर्डवर घेऊन जा',
            'डॅशबोर्ड उघडा', 'take me to candidate dashboard', 'take me to dashboard',
            'open dashboard', 'dashboard open kar', 'कॅन्डिडेट डॅशबोर्ड', 'candidate dashboard la ja'
        ];
        if (dashboardPatterns.some(p => lowerQuery.includes(p))) {
            handleNavigation('/React/Candidate/dashboard', true);
            return;
        }

        const registrationNavPatterns = [
            'registration page open kar', 'नोंदणी पेज उघडा', 'open registration page',
            'registration page dakhav', 'नोंदणी पृष्ठ उघडा', 'open candidate register'
        ];
        if (registrationNavPatterns.some(p => lowerQuery.includes(p))) {
            handleNavigation('/React/candidate/register', false);
            return;
        }

        const coursesNavPatterns = [
            'courses page dakhav', 'कोर्सेस पेज उघडा',
            'open courses page', 'show courses page', 'courses page var ja'
        ];
        if (coursesNavPatterns.some(p => lowerQuery.includes(p))) {
            handleNavigation('/React/Public/courses', false);
            return;
        }

        const institutesNavPatterns = [
            'institutes page dakhav', 'open institutes page', 'institutes page var ja'
        ];
        if (institutesNavPatterns.some(p => lowerQuery.includes(p))) {
            handleNavigation('/React/Public/institutes', false);
            return;
        }

        const certNavPatterns = [
            'certificate verification page dakhav', 'प्रमाणपत्र पडताळणी पेज उघडा', 'verify certificate'
        ];
        if (certNavPatterns.some(p => lowerQuery.includes(p))) {
            handleNavigation('/React/Public/CertificateVerification', false);
            return;
        }

        // 5. Send to FastAPI AI backend for RAG retrieval, intent classification, and structured actions
        setAssistantState('thinking');

        try {
            const response = await fetch(`${AI_BACKEND_URL}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: query,
                    session_id: getSessionId(),
                    current_page: window.location.pathname,
                    page_context: getLivePageContext()
                }),
            });

            if (!response.ok) {
                throw new Error(`AI Service HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Detect any autofill request from actions
            let detectedAutofill = null;
            if (data.actions && Array.isArray(data.actions)) {
                for (const act of data.actions) {
                    if (act.type === 'fill_form' && act.data) {
                        detectedAutofill = act.data;
                        break;
                    }
                }
            }

            if (detectedAutofill) {
                executeLiveFormAutofill(detectedAutofill);
                setPendingAutofill(detectedAutofill);
                setRegFlow(prev => {
                    const activeFormDef = currentActiveForm || FORM_REGISTRY.candidate_registration;
                    const reqFields = activeFormDef.fields.filter(f => f.required);
                    const merged = { ...(prev.data || {}), ...detectedAutofill };
                    const nextMissing = reqFields.find(f => !merged[f.key]);
                    return {
                        active: true,
                        isPaused: false,
                        step: nextMissing ? nextMissing.key : 'review',
                        data: merged
                    };
                });
            }

            let answerText = data.answer || "No response received.";
            const quickReplies = [...(data.quick_replies || [])];

            if (regFlow.active) {
                if (regFlow.isPaused) {
                    const pauseNotice = language === 'mr'
                        ? "नोंदणी प्रक्रिया तात्पुरती थांबवून मी तुम्हाला माहिती दाखवत आहे: ⏸️\n\n"
                        : "Pausing registration to provide this information: ⏸️\n\n";
                    answerText = pauseNotice + answerText;
                }
                quickReplies.unshift({
                    label: language === 'mr' ? '▶️ नोंदणी पुन्हा सुरू करा (Resume)' : '▶️ Resume Registration',
                    query: 'Resume'
                });
            }
            data.quick_replies = quickReplies;

            const botMsg = {
                id: `bot_${Date.now()}`,
                sender: 'bot',
                text: answerText,
                structuredData: data,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, botMsg]);

            // Execute all automated actions returned by backend
            if (data.actions && Array.isArray(data.actions)) {
                for (const act of data.actions) {
                    if (act.type === 'navigate' && act.url) {
                        // Allow navigation if registration is not active OR if registration is paused by an interruption
                        if (!regFlow.active || regFlow.isPaused) {
                            handleNavigation(act.url, act.requires_auth, false);
                        }
                        break;
                    } else if (act.type && act.type !== 'fill_form') {
                        executeSystemAction(act);
                    }
                }
            }

            // Spoken response via selected neural TTS engine
            if (ttsEnabled && answerText) {
                const answerLang = data.language || language;
                speakText(answerText, answerLang, {
                    engine: ttsEngine,
                    onStart: () => setAssistantState('speaking'),
                    onEnd: () => setAssistantState('idle'),
                    onError: () => setAssistantState('idle')
                });
            } else {
                setAssistantState('idle');
            }

        } catch (err) {
            console.error('AI Assistant fetch error:', err);
            const fallbackText = language === 'mr'
                ? "क्षमस्व, AI सर्व्हरशी संपर्क होऊ शकला नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा किंवा तुमचा प्रश्न टाईप करा."
                : "Sorry, I'm having trouble connecting to the AI backend. Please verify your connection or try again shortly.";

            setMessages(prev => [...prev, {
                id: `bot_err_${Date.now()}`,
                sender: 'bot',
                text: fallbackText,
                isError: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setAssistantState('idle');
        }
    }, [inputMessage, language, ttsEnabled, ttsEngine, AI_BACKEND_URL, regFlow, isLoggedIn, navigate, handleNavigation, executeSystemAction, executeLiveFormAutofill, pendingOverwrite, getLivePageContext]);

    // Start browser Speech Recognition
    const startListening = () => {
        if (!speechInputCoordinator.isSupported()) {
            setSpeechError(language === 'mr'
                ? "आपल्या ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही. कृपया Google Chrome किंवा Edge वापरा."
                : "Voice recognition is not supported in this browser. Please use Google Chrome or Edge.");
            return;
        }

        // Cancel any active TTS before opening mic
        stopSpeaking();
        setAssistantState('listening');
        setSpeechError(null);
        setInterimTranscript('');
        isListeningRef.current = true;

        speechInputCoordinator.start({
            lang: language,
            onStart: () => {
                setAssistantState('listening');
                isListeningRef.current = true;
            },
            onInterim: (interim) => {
                setInterimTranscript(interim);
            },
            onFinal: (finalText) => {
                setInterimTranscript('');
                isListeningRef.current = false;
                sendMessage(finalText);
            },
            onError: (friendlyErr) => {
                isListeningRef.current = false;
                setAssistantState('idle');
                setSpeechError(friendlyErr);
            },
            onEnd: () => {
                isListeningRef.current = false;
                if (assistantState === 'listening') {
                    setAssistantState('idle');
                }
            }
        });
    };

    // Stop listening
    const stopListening = () => {
        speechInputCoordinator.stop();
        isListeningRef.current = false;
        setAssistantState('idle');
        setInterimTranscript('');
    };

    // Format Markdown bold and bullet lines in bot messages
    const renderFormattedText = (text) => {
        if (!text) return null;

        const lines = text.split('\n');
        return (
            <div className="space-y-1 text-sm leading-relaxed">
                {lines.map((line, idx) => {
                    if (line.trim() === '') return <div key={idx} className="h-1" />;

                    // Parse bold formatting **text**
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                        <div key={idx}>
                            {parts.map((part, pIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={pIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Action Launcher Button */}
            {!isOpen && (
                <button
                    onClick={() => {
                        unlockAudio();
                        setIsOpen(true);
                    }}
                    className="relative group rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none"
                    style={{ width: '90px', height: '90px', padding: 0 }}
                    aria-label="Open MSBSVET AI Assistant"
                >
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-400 shadow-lg bg-white">
                        <img
                            src="/react/rotating_gear2.gif"
                            alt="Kaushalya Assistant"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Animated Online Status Badge */}
                    <span className="absolute bottom-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                    </span>
                </button>
            )}

            {/* Compact Minimized Toolbar */}
            {isOpen && isMinimized && (
                <div
                    className={`${color} text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 cursor-pointer select-none border border-white/20 hover:scale-105 transition-all`}
                    onClick={() => setIsMinimized(false)}
                >
                    <div className="w-8 h-8 rounded-full bg-white/20 p-1 flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">KAUSHALYA AI</span>
                        <span className="text-[10px] opacity-90 leading-tight">
                            {isRegistrationPage && hasUserInteracted && currentActiveForm ? `नोंदणी: ${liveFormState?.completed_required_count || 0}/${liveFormState?.required_count || currentActiveForm.fields.filter(f => f.required).length} भरले` : 'सक्रीय आहे / Active'}
                        </span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
                        className="p-1 hover:bg-white/20 rounded-full ml-1"
                        title="Expand / मोठे करा"
                    >
                        <Maximize2 size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            stopSpeaking();
                            if (isListeningRef.current) stopListening();
                            setIsOpen(false);
                        }}
                        className="p-1 hover:bg-white/20 rounded-full"
                        title="Close / बंद करा"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Full Chatbot Window */}
            {isOpen && !isMinimized && (
                <div className="w-[390px] sm:w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-80px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className={`${color} text-white p-3.5 flex justify-between items-center shadow-md select-none`}>
                        <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 rounded-full bg-white/20 p-1 flex items-center justify-center backdrop-blur-sm border border-white/30">
                                <Bot size={22} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base tracking-wide flex items-center gap-1.5 leading-tight">
                                    KAUSHALYA
                                    <span className="text-xs font-normal opacity-90 px-1.5 py-0.5 rounded bg-white/20">AI</span>
                                </h3>
                                <p className="text-[11px] opacity-80 leading-none mt-0.5">
                                    {assistantState === 'listening' ? '🎙️ ऐकत आहे / Listening...'
                                        : assistantState === 'thinking' ? '💭 विचार करत आहे / Thinking...'
                                        : assistantState === 'speaking' ? '🔊 बोलत आहे / Speaking...'
                                        : 'MSBSVET Official Assistant'}
                                </p>
                            </div>
                        </div>

                        {/* Top Controls: Language Switch, TTS Mute, Reset, Minimize, Close */}
                        <div className="flex items-center space-x-1.5">
                            {/* Language Toggle */}
                            <button
                                onClick={() => {
                                    stopSpeaking();
                                    setLanguage(prev => prev === 'mr' ? 'en' : 'mr');
                                }}
                                className="px-2 py-1 text-xs font-semibold rounded-md bg-white/20 hover:bg-white/30 transition-colors"
                                title="Switch Language / भाषा बदला"
                            >
                                {language === 'mr' ? 'मराठी' : 'ENG'}
                            </button>

                            {/* TTS Toggle */}
                            <button
                                onClick={() => {
                                    if (ttsEnabled) stopSpeaking();
                                    setTtsEnabled(!ttsEnabled);
                                }}
                                className={`p-1.5 rounded-full hover:bg-white/20 transition-colors ${!ttsEnabled ? 'opacity-60' : ''}`}
                                title={ttsEnabled ? "Mute Spoken Replies" : "Enable Spoken Replies"}
                            >
                                {ttsEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
                            </button>

                            {/* Reset Chat */}
                            <button
                                onClick={() => {
                                    stopSpeaking();
                                    sessionStorage.removeItem('msbsvet_ai_session_id');
                                    sessionStorage.removeItem('msbsvet_reg_flow');
                                    setRegFlow({ active: false, isPaused: false, step: 'idle', pausedStep: null, data: {} });
                                    setPendingAutofill(null);
                                    setMessages([]);
                                }}
                                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                                title="New Conversation"
                            >
                                <RotateCcw size={17} />
                            </button>

                            {/* Minimize Button */}
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                                title="Minimize / लहान करा"
                            >
                                <Minus size={17} />
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    stopSpeaking();
                                    if (isListeningRef.current) stopListening();
                                    setIsOpen(false);
                                }}
                                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Active Registration Form Progress Bar & Interruption Controls:
                        Rendered ONLY when user is on a supported registration page AND actively interacting with the form or workflow */}
                    {isRegistrationPage && hasUserInteracted && currentActiveForm && (
                        <div className={`px-3.5 py-2 text-xs border-b transition-all duration-200 select-none ${
                            regFlow.isPaused
                                ? 'bg-amber-50/95 border-amber-200 text-amber-900'
                                : 'bg-blue-50/95 border-blue-200 text-blue-900'
                        }`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="flex items-center gap-1.5 font-semibold text-xs truncate">
                                    <FileText size={14} className={regFlow.isPaused ? "text-amber-600" : "text-blue-600"} />
                                    <span className="truncate">
                                        {language === 'mr' ? currentActiveForm.title.mr : currentActiveForm.title.en}
                                        {regFlow.isPaused && <span className="ml-1 text-[11px] font-normal text-amber-700">({language === 'mr' ? 'थांबवली आहे' : 'Paused'})</span>}
                                    </span>
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="px-2 py-0.5 rounded-full bg-white text-[11px] font-bold border border-blue-200 text-blue-800 shadow-xs">
                                        {liveFormState?.completed_required_count || 0}/{liveFormState?.required_count || currentActiveForm.fields.filter(f => f.required).length} {language === 'mr' ? 'पूर्ण' : 'Filled'}
                                    </span>
                                    <button
                                        onClick={() => setShowFieldDetails(prev => !prev)}
                                        className="text-[11px] text-blue-700 hover:text-blue-900 font-medium underline px-1 py-0.5"
                                        title="Toggle field details"
                                    >
                                        {showFieldDetails ? (language === 'mr' ? 'लपवा ▲' : 'Hide ▲') : (language === 'mr' ? 'तपशील ▼' : 'Details ▼')}
                                    </button>
                                    {regFlow.active && (
                                        <>
                                            {regFlow.isPaused ? (
                                                <button
                                                    onClick={() => sendMessage('Resume')}
                                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-xs transition-all active:scale-95"
                                                    title="Resume Registration"
                                                >
                                                    ▶️
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => sendMessage('Pause')}
                                                    className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded text-[11px] font-semibold transition-all active:scale-95"
                                                    title="Pause Registration"
                                                >
                                                    ⏸️
                                                </button>
                                            )}
                                            <button
                                                onClick={() => sendMessage('Cancel')}
                                                className="px-1.5 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[11px] font-semibold transition-all active:scale-95"
                                                title="Cancel Registration"
                                            >
                                                ❌
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Slim Progress Bar */}
                            {(() => {
                                const total = liveFormState?.required_count || currentActiveForm.fields.filter(f => f.required).length || 1;
                                const completed = liveFormState?.completed_required_count || 0;
                                const pct = Math.min(100, Math.round((completed / total) * 100));
                                return (
                                    <div className="w-full bg-blue-100/80 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                );
                            })()}

                            {/* Expandable Field Breakdown */}
                            {showFieldDetails && (
                                <div className="grid grid-cols-2 gap-1 text-[11px] mt-2 pt-1.5 border-t border-blue-100 max-h-36 overflow-y-auto pr-0.5">
                                    {currentActiveForm.fields.map(f => {
                                        const isInvalid = liveFormState?.fields?.invalid?.includes(f.key);
                                        const isFilled = liveFormState?.fields?.filled?.includes(f.key);
                                        const safeVal = liveFormState?.values_safe?.[f.key] || (regFlow.data && regFlow.data[f.key]);

                                        return (
                                            <div
                                                key={f.key}
                                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10.5px] truncate ${
                                                    isInvalid
                                                        ? 'bg-red-50 border-red-200 text-red-800'
                                                        : isFilled
                                                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                                            : f.required
                                                                ? 'bg-white border-blue-100 text-gray-700'
                                                                : 'bg-gray-50 border-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {isInvalid ? (
                                                    <AlertCircle size={11} className="text-red-500 shrink-0" />
                                                ) : isFilled ? (
                                                    <Check size={11} className="text-emerald-600 font-bold shrink-0 stroke-[3]" />
                                                ) : f.required ? (
                                                    <Clock size={11} className="text-amber-500 font-bold shrink-0" />
                                                ) : (
                                                    <Minus size={11} className="text-gray-400 shrink-0" />
                                                )}
                                                <span className="truncate">
                                                    <span className="font-medium">{language === 'mr' ? f.labelMr : f.labelEn}:</span>{' '}
                                                    {safeVal ? String(safeVal) : isInvalid ? (language === 'mr' ? 'अवैध' : 'Invalid') : f.required ? (language === 'mr' ? 'बाकी' : 'Missing') : (language === 'mr' ? 'ऐच्छिक' : 'Optional')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Autoplay blocked notification */}
                    {autoplayBlockedHint && (
                        <div className="bg-sky-50 border-b border-sky-200 px-3 py-1.5 flex justify-between items-center text-xs text-sky-800">
                            <span className="flex items-center gap-1.5 text-[11px]">
                                <Volume2 size={13} className="text-sky-600 shrink-0 animate-pulse" />
                                <span>{language === 'mr' ? 'आवाज ऐकण्यासाठी मेसेजवरील "ऐका" बटणावर क्लिक करा.' : 'Click "Listen" on any message to hear spoken audio.'}</span>
                            </span>
                            <button onClick={() => setAutoplayBlockedHint(false)} className="text-sky-500 hover:text-sky-700 p-0.5">
                                <X size={13} />
                            </button>
                        </div>
                    )}

                    {/* Speaking Banner with Immediate Stop Button */}
                    {assistantState === 'speaking' && (
                        <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex justify-between items-center text-xs text-amber-800">
                            <span className="flex items-center gap-1.5 font-medium">
                                <Volume2 size={14} className="text-amber-600 animate-bounce" />
                                {language === 'mr' ? 'उत्तर बोलत आहे...' : 'Speaking response...'}
                            </span>
                            <button
                                onClick={handleStopSpeaking}
                                className="px-2.5 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs active:scale-95"
                            >
                                <VolumeX size={12} /> {language === 'mr' ? 'थांबवा' : 'Stop'}
                            </button>
                        </div>
                    )}

                    {/* Speech Error Banner */}
                    {speechError && (
                        <div className="bg-red-50 border-b border-red-200 px-3 py-1.5 flex justify-between items-center text-xs text-red-700">
                            <span className="flex items-center gap-1.5">
                                <AlertCircle size={14} className="text-red-500 shrink-0" />
                                <span>{speechError}</span>
                            </span>
                            <button onClick={() => setSpeechError(null)} className="p-0.5 text-red-500">
                                <X size={13} />
                            </button>
                        </div>
                    )}

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-gray-50/50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${msg.sender === 'user'
                                        ? `${color} text-white rounded-br-none`
                                        : msg.isError
                                            ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-none'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    {renderFormattedText(msg.text)}

                                    {/* Structured Course Cards */}
                                    {msg.structuredData?.courses && msg.structuredData.courses.length > 0 && (
                                        <div className="mt-3 space-y-2 border-t border-gray-100 pt-2">
                                            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                                <BookOpen size={13} className="text-blue-500" />
                                                {language === 'mr' ? 'शिफारस केलेले अभ्यासक्रम:' : 'Recommended Courses:'}
                                            </p>
                                            <div className="space-y-2">
                                                {msg.structuredData.courses.map((course, idx) => (
                                                    <div key={idx} className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 text-xs shadow-xs">
                                                        <div className="font-bold text-blue-900 text-xs leading-snug">{course.name}</div>
                                                        {course.duration && <div className="text-gray-600 text-[11px] mt-0.5">कालावधी: <span className="font-medium text-gray-800">{course.duration}</span></div>}
                                                        {course.eligibility && <div className="text-gray-600 text-[11px]">पात्रता: <span className="font-medium text-gray-800">{course.eligibility}</span></div>}
                                                        {course.registration_status && <div className="text-emerald-700 text-[11px]">नोंदणी: <span className="font-semibold">{course.registration_status}</span></div>}
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <button
                                                                onClick={() => startOrResumeRegistrationForCourse(course.name)}
                                                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
                                                            >
                                                                📝 {language === 'mr' ? 'या कोर्ससाठी नोंदणी करा' : 'Apply for Course'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleNavigation('/React/Public/courses')}
                                                                className="text-blue-700 font-medium hover:underline text-[11px] flex items-center gap-0.5"
                                                            >
                                                                तपशील पहा <ArrowRight size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Structured Institute Cards */}
                                    {msg.structuredData?.institutes && msg.structuredData.institutes.length > 0 && (
                                        <div className="mt-3 space-y-2 border-t border-gray-100 pt-2">
                                            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                                <Building2 size={13} className="text-emerald-500" />
                                                {language === 'mr' ? 'संस्थांची माहिती:' : 'Institutes:'}
                                            </p>
                                            <div className="space-y-1.5">
                                                {msg.structuredData.institutes.map((inst, idx) => (
                                                    <div key={idx} className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 text-xs">
                                                        <div className="font-semibold text-emerald-900">{inst.name}</div>
                                                        {inst.district && <div className="text-gray-600 text-[11px]">जिल्हा: {inst.district}</div>}
                                                        {inst.address && <div className="text-gray-500 text-[10px] truncate">{inst.address}</div>}
                                                        <button
                                                            onClick={() => handleNavigation('/React/Public/institutes')}
                                                            className="mt-1 text-emerald-700 font-medium hover:underline text-[11px] flex items-center gap-0.5"
                                                        >
                                                            संस्था शोधा <ArrowRight size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Actions (Navigation & System Actions) */}
                                    {msg.structuredData?.actions && msg.structuredData.actions.length > 0 && (
                                        <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                                            {msg.structuredData.actions.map((act, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => (act.type === 'navigate' || act.url) ? handleNavigation(act.url, act.requires_auth) : executeSystemAction(act)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition-colors border border-blue-200"
                                                >
                                                    <ExternalLink size={11} /> {act.label || (act.type === 'scroll' ? 'स्क्रोल करा' : act.type === 'print' ? 'प्रिंट करा' : 'पेज उघडा')}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quick Reply Chips */}
                                    {msg.structuredData?.quick_replies && msg.structuredData.quick_replies.length > 0 && (
                                        <div className="mt-2.5 flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                                            {msg.structuredData.quick_replies.map((qr, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => sendMessage(qr.query)}
                                                    className="px-2 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-normal transition-colors border border-gray-200"
                                                >
                                                    {qr.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bot message timestamp */}
                                    {msg.sender === 'bot' && (
                                        <div className="mt-1 flex items-center justify-end text-[10px] text-gray-400">
                                            <span>{msg.timestamp}</span>
                                        </div>
                                    )}
                                </div>
                                {msg.sender === 'user' && (
                                    <span className="text-[10px] text-gray-400 mt-0.5 px-1">{msg.timestamp}</span>
                                )}
                            </div>
                        ))}

                        {/* Thinking Indicator */}
                        {assistantState === 'thinking' && (
                            <div className="flex items-center space-x-2 bg-white p-2.5 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm w-fit">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                <span className="text-xs text-gray-500 ml-1">
                                    {language === 'mr' ? 'माहिती शोधत आहे...' : 'Retrieving answers...'}
                                </span>
                            </div>
                        )}

                        {/* Live Listening Transcript */}
                        {assistantState === 'listening' && (
                            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-xs text-blue-900 shadow-sm flex items-center gap-2 animate-pulse">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <div className="flex-1">
                                    <span className="font-semibold">{language === 'mr' ? 'ऐकत आहे: ' : 'Listening: '}</span>
                                    <span className="italic">{interimTranscript || (language === 'mr' ? 'कृपया बोला...' : 'Please speak now...')}</span>
                                </div>
                                <button
                                    onClick={stopListening}
                                    className="p-1 hover:bg-blue-200 rounded text-blue-800"
                                    title="Cancel"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        )}

                        {/* Safe Autofill Confirmation Card */}
                        {pendingAutofill && (
                            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 shadow-md text-xs space-y-2 animate-in fade-in">
                                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                                    <CheckCircle size={15} className="text-amber-600" />
                                    <span>{language === 'mr' ? 'नोंदणी अर्जात ही माहिती भरायची आहे का?' : 'Autofill Candidate Registration Form?'}</span>
                                </div>
                                <div className="bg-white p-2 rounded border border-amber-200 text-gray-700 space-y-0.5">
                                    {Object.entries(pendingAutofill).map(([k, v]) => (
                                        <div key={k} className="flex justify-between">
                                            <span className="font-medium text-gray-600">{k}:</span>
                                            <span className="font-semibold text-gray-900">{String(v)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end space-x-2 pt-1">
                                    <button
                                        onClick={() => {
                                            setPendingAutofill(null);
                                            setRegFlow({ active: false, step: 'idle', data: {} });
                                        }}
                                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 rounded font-medium transition-colors"
                                    >
                                        {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                                    </button>
                                    <button
                                        onClick={() => handleConfirmAutofill(pendingAutofill)}
                                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold shadow-sm transition-colors flex items-center gap-1"
                                    >
                                        <CheckCircle size={13} />
                                        {language === 'mr' ? 'माहिती भरा' : 'Confirm & Fill'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Controls */}
                    <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                        {/* Microphone Speech Recognition Button */}
                        <button
                            onClick={() => {
                                unlockAudio();
                                if (assistantState === 'listening') {
                                    stopListening();
                                } else {
                                    startListening();
                                }
                            }}
                            disabled={assistantState === 'thinking'}
                            className={`p-2.5 rounded-full transition-all duration-200 focus:outline-none ${assistantState === 'listening'
                                ? 'bg-red-500 text-white shadow-lg animate-pulse ring-4 ring-red-200'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95'
                                }`}
                            title={assistantState === 'listening' ? "Stop Listening" : "Speak your question (मराठी / English)"}
                        >
                            {assistantState === 'listening' ? <MicOff size={19} /> : <Mic size={19} />}
                        </button>

                        {/* Text Input */}
                        <input
                            id="kaushalya-chat-input"
                            data-testid="kaushalya-chat-input"
                            type="text"
                            value={inputMessage}
                            onFocus={() => unlockAudio()}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                                unlockAudio();
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder={language === 'mr' ? "प्रश्न विचारा किंवा बोला..." : "Ask a question or speak..."}
                            disabled={assistantState === 'thinking'}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-gray-50/50"
                        />

                        {/* Send Button */}
                        <button
                            id="kaushalya-chat-send"
                            data-testid="kaushalya-chat-send"
                            onClick={() => {
                                unlockAudio();
                                sendMessage();
                            }}
                            disabled={!inputMessage.trim() || assistantState === 'thinking'}
                            className={`${color} text-white p-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm`}
                            title="Send message"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartVoiceAssistant;
