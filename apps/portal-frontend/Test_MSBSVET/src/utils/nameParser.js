/**
 * nameParser.js
 * Robust Marathi, Roman Marathi, and English Candidate Name Extractor for MSBSVET.
 * Extracts First, Middle, and Last Name according to registration schema without conversational filler.
 */

// Common conversational filler & system phrases that MUST NEVER be accepted as names
export const FILLER_AND_STOPWORDS = new Set([
    // Marathi copula, confirmations, negatives
    'आहे', 'हे', 'हो', 'होय', 'नाही', 'नको', 'थांब', 'थांबा', 'थांबवा',
    'रद्द', 'करा', 'नोंदणी', 'अर्ज', 'फॉर्म', 'नाव', 'नावं', 'नांव', 'पूर्ण',
    'पहिले', 'प्रथम', 'मधले', 'वडिलांचे', 'पतीचे', 'आडनाव', 'कुलनाव',
    'माझं', 'माझे', 'माझा', 'माझी', 'मी', 'तुम्ही', 'आम्ही', 'आपण', 'मला', 'तुला', 'आम्हाला', 'त्यांना',
    'असं', 'असे', 'का', 'काय', 'कशी', 'कसा', 'कसे',
    // Verbs and actions
    'केला', 'केले', 'केली', 'करतो', 'करते', 'शिकलो', 'शिकली', 'शिकायचा', 'शिकायचे',
    'आलो', 'आली', 'गेलो', 'गेली', 'आहेत', 'आहोत', 'झाला', 'झाली', 'झाले',
    'सांगा', 'सांग', 'दाखवा', 'दाखव', 'हवा', 'हवी', 'पाहिजे',
    'आयटीआय', 'कोर्स', 'कोर्सेस', 'अभ्यासक्रम', 'पास', 'नापास',
    'नवीन', 'नवे', 'नवी', 'navin', 'new', 'करायची', 'करायचा', 'करायचे', 'karaycha', 'karaychi', 'karayche',
    // English & Hinglish
    'pass', 'failed', 'fail', 'yes', 'no', 'skip', 'cancel', 'wait', 'stop', 'ok', 'okay',
    'done', 'next', 'chala', 'aahe', 'ahe', 'hoy', 'nahi', 'nako', 'nav', 'naam',
    'purna', 'first', 'last', 'middle', 'surname', 'name', 'my', 'is', 'am', 'me', 'us', 'the',
    'candidate', 'registration', 'student', 'iti', 'bharo', 'bharun',
    'show', 'list', 'course', 'courses', 'view', 'help', 'details', 'tell', 'give',
    // Hindi
    'है', 'हूँ', 'था', 'थी', 'मेरा', 'मेरी', 'पूरा', 'पहला', 'नाम', 'मुझे', 'दिखाओ', 'बताओ'
]);

// Framing prefix regexes to strip from user utterances
const FRAMING_PREFIX_PATTERNS = [
    // Explicit Marathi field prefixes
    /^(?:माझं|माझे|माझा|माझी)?\s*(?:आडनाव|कुलनाव)\s*(?:आहे|असे)?\s*[:=,-]?\s*/iu,
    /^(?:माझं|माझे|माझा|माझी)?\s*(?:मधले\s*नाव|वडिलांचे\s*नाव|पतीचे\s*नाव)\s*(?:आहे|असे)?\s*[:=,-]?\s*/iu,
    /^(?:माझं|माझे|माझा|माझी)?\s*(?:पहिले|प्रथम)\s*(?:नाव)\s*(?:आहे|असे)?\s*[:=,-]?\s*/iu,
    // General Marathi Devanagari full name
    /^(?:माझं|माझे|माझा|माझी|आमचे)?\s*(?:पूर्ण|संपूर्ण|ऑफिशियल)?\s*(?:नाव|नावं|नांव)\s*(?:आहे|असे|असून)?\s*[:=,-]?\s*/iu,
    // Explicit English field prefixes
    /^(?:my|the)?\s*(?:last\s*name|surname)\s*(?:is)?\s*[:=,-]?\s*/iu,
    /^(?:my|the)?\s*(?:middle\s*name|father's\s*name|father\s*name)\s*(?:is)?\s*[:=,-]?\s*/iu,
    /^(?:my|the)?\s*(?:first\s*name)\s*(?:is)?\s*[:=,-]?\s*/iu,
    // General English
    /^(?:my|the)?\s*(?:full|official)?\s*(?:name)\s*(?:is)?\s*[:=,-]?\s*/iu,
    /^(?:i\s*am|i'm|this\s*is|call\s*me)\s+/iu,
    // Hindi Devanagari
    /^(?:मेरा|मेरी|हमारा)?\s*(?:पूरा|पहला)?\s*(?:नाम)\s*(?:है)?\s*[:=,-]?\s*/iu,
    // Marathi identity
    /^(?:मी)\s+/iu,
    // Roman Marathi / Hinglish
    /^(?:majha|majhe|maza|maze|mera|meri)?\s*(?:purna|sampurna|first|last|middle)?\s*(?:nav|naav|naam|aadnav|surname)\s*(?:aahe|ahe|hai)?\s*[:=,-]?\s*/iu
];

// Framing suffix regexes to strip from end of user utterances
const FRAMING_SUFFIX_PATTERNS = [
    // Marathi & Hindi copula
    /\s*(?:आहे|हे|असं\s*आहे|असे\s*आहे|होय|ना|है|हूँ|था|थी)\s*$/iu,
    // English
    /\s*(?:is\s*my\s*name|here|please)\s*$/iu,
    // Roman Marathi / Hinglish
    /\s*(?:aahe|ahe|as\s*aahe|asa\s*ahe|hai|hoy)\s*$/iu
];

/**
 * Check if a word or phrase is conversational filler, stopword, or conversational response.
 */
export function isFillerOrStopword(text) {
    if (!text || typeof text !== 'string') return true;
    const clean = text.trim().toLowerCase();
    if (FILLER_AND_STOPWORDS.has(clean)) return true;

    // Check if it's a known conversational command or inquiry phrase
    if (/courses?\s*(दाखव|सांग|आहेत|लिस्ट|सूची|list|show|options)/i.test(clean)) return true;
    if (/मला\s*(?:काही\s*)?courses?\s*(दाखव|सांग|पाहिजे)/i.test(clean)) return true;
    if (/(?:show|list|view)\s+(?:me\s+)?(?:all\s+)?courses?/i.test(clean)) return true;
    if (/(?:उपलब्ध\s*अभ्यासक्रम|कोर्स\s*दाखवा|अभ्यासक्रम\s*दाखवा)/i.test(clean)) return true;
    if (/(?:होय|हो|नाही)\s*(?:मी)?\s*(?:आयटीआय|iti)?\s*(?:केले|केला|शिकलो)?\s*(?:आहे)?/i.test(clean)) return true;

    // Check if all tokens in the phrase are known stopwords
    const tokens = clean.split(/\s+/).filter(Boolean);
    if (tokens.length > 0 && tokens.every(t => FILLER_AND_STOPWORDS.has(t))) {
        return true;
    }

    return false;
}

/**
 * Clean and normalize name token preserving Devanagari Unicode and English casing.
 */
export function normalizeNameToken(token) {
    if (!token) return '';
    const trimmed = token.trim();
    // If Latin alphabetic, apply Title Case
    if (/^[A-Za-z]+$/.test(trimmed)) {
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    }
    // Devanagari or other script: preserve exact Unicode characters
    return trimmed;
}

/**
 * Check if a token is a valid name token (not a number, symbol, or stopword).
 */
export function isValidNameToken(token) {
    if (!token || typeof token !== 'string') return false;
    const clean = token.trim();
    if (clean.length < 2) return false;

    // Disallow numbers and digits
    if (/[\d०-९]/.test(clean)) return false;

    // Disallow email or URL markers
    if (/[@:\/\\_{}[\]+*#~]/.test(clean)) return false;

    // Must be purely letters in Devanagari or Latin script (including Devanagari matras/viramas)
    if (!/^[\u0900-\u097FA-Za-z]+$/.test(clean)) return false;

    // Must not be a known filler or stopword
    if (FILLER_AND_STOPWORDS.has(clean.toLowerCase())) return false;

    return true;
}

/**
 * Parse candidate full name from an utterance into firstName, middleName, and lastName.
 * 
 * @param {string} text - User utterance (e.g. "माझं पूर्ण नाव मयुरेश अभय सावंत आहे")
 * @param {string|null} targetedField - Optional hint ('firstName', 'middleName', 'lastName')
 * @returns {object} Extracted name details or { isValid: false }
 */
export function parseCandidateName(text, targetedField = null) {
    if (!text || typeof text !== 'string') {
        return { isValid: false, reason: 'empty_input' };
    }

    let cleaned = text.trim();

    // Rejection rule: If the utterance is a course inquiry, registration response, ITI status response, or general command, reject as name
    if (
        /(?:courses?|अभ्यासक्रम|कोर्स|कोर्सेस)\s*(दाखव|सांग|आहेत|लिस्ट|सूची|list|show|options)/i.test(cleaned) ||
        /मला\s*(?:काही\s*)?courses?\s*(दाखव|सांग|पाहिजे)/i.test(cleaned) ||
        /(?:show|list|view)\s+(?:me\s+)?(?:all\s+)?courses?/i.test(cleaned) ||
        /(?:उपलब्ध\s*अभ्यासक्रम|कोर्स\s*दाखवा|अभ्यासक्रम\s*दाखवा)/i.test(cleaned) ||
        /(?:मी\s*आयटीआय|iti\s*(?:done|pass|completed)|आयटीआय\s*केले)/i.test(cleaned) ||
        /(?:नोंदणी|रजिस्ट्रेशन|registration|nondani|karaych|करायच|करायची|करायचा|नवीन\s*नोंदणी|navin\s*registration)/i.test(cleaned) ||
        /(?:यापूर्वी|आधी|पूर्वी|admission|dvet|purvi)/i.test(cleaned)
    ) {
        return {
            isValid: false,
            reason: 'command_or_course_inquiry',
            raw: text
        };
    }

    // 1. Detect if the utterance explicitly specifies a field
    const explicitLastName = /(?:last\s*name|surname|आडनाव|aadnav|कुलनाव)/i.test(cleaned);
    const explicitMiddleName = /(?:middle\s*name|मधले\s*नाव|वडिलांचे\s*नाव|madhle\s*nav|पतीचे\s*नाव)/i.test(cleaned);
    const explicitFirstName = /(?:first\s*name|पहिले\s*नाव|प्रथम\s*नाव)/i.test(cleaned);

    // 2. Strip punctuation like quotes, commas, trailing periods
    cleaned = cleaned.replace(/["'.,;:!?]/g, ' ').replace(/\s+/g, ' ').trim();

    // 3. Strip verified framing prefixes (e.g., "माझं पूर्ण नाव", "My name is")
    for (const prefixRegex of FRAMING_PREFIX_PATTERNS) {
        if (prefixRegex.test(cleaned)) {
            cleaned = cleaned.replace(prefixRegex, '').trim();
            break;
        }
    }

    // 4. Strip verified framing suffixes (e.g., "आहे", "aahe")
    for (const suffixRegex of FRAMING_SUFFIX_PATTERNS) {
        if (suffixRegex.test(cleaned)) {
            cleaned = cleaned.replace(suffixRegex, '').trim();
            break;
        }
    }

    // 5. Split into candidate tokens
    const rawTokens = cleaned.split(/\s+/).filter(Boolean);

    // Filter tokens against validity criteria
    const validTokens = rawTokens.filter(isValidNameToken);

    // If no valid tokens remain (e.g., user said only "आहे" or "होय आहे")
    if (validTokens.length === 0) {
        return {
            isValid: false,
            reason: 'no_valid_name_tokens',
            raw: text
        };
    }

    // Check for ambiguity (e.g., user included extraneous words that weren't framing phrases)
    const discardedTokens = rawTokens.filter(t => !isValidNameToken(t));
    const isAmbiguous = discardedTokens.length > 1;

    // Normalize each token
    const normalizedTokens = validTokens.map(normalizeNameToken);

    let firstName = '';
    let middleName = '';
    let lastName = '';

    // If a specific field was explicitly targeted by phrasing or by caller
    if (explicitLastName || targetedField === 'lastName') {
        lastName = normalizedTokens.join(' ');
        return {
            isValid: true,
            raw: text,
            cleanFullName: lastName,
            tokens: normalizedTokens,
            tokenCount: normalizedTokens.length,
            firstName: '',
            middleName: '',
            lastName,
            isAmbiguous: false,
            needsClarification: false,
            clarificationPromptMr: null,
            clarificationPromptEn: null
        };
    }

    if (explicitMiddleName || targetedField === 'middleName') {
        middleName = normalizedTokens.join(' ');
        return {
            isValid: true,
            raw: text,
            cleanFullName: middleName,
            tokens: normalizedTokens,
            tokenCount: normalizedTokens.length,
            firstName: '',
            middleName,
            lastName: '',
            isAmbiguous: false,
            needsClarification: false,
            clarificationPromptMr: null,
            clarificationPromptEn: null
        };
    }

    if (explicitFirstName && normalizedTokens.length === 1) {
        firstName = normalizedTokens[0];
        return {
            isValid: true,
            raw: text,
            cleanFullName: firstName,
            tokens: normalizedTokens,
            tokenCount: 1,
            firstName,
            middleName: '',
            lastName,
            isAmbiguous: false,
            needsClarification: false,
            clarificationPromptMr: null,
            clarificationPromptEn: null
        };
    }

    // General / Full Name token allocation based on token count:
    if (normalizedTokens.length === 1) {
        // Single token name (e.g. "Mayuresh" or "मयुरेश")
        firstName = normalizedTokens[0];
        middleName = '';
        lastName = '';
    } else if (normalizedTokens.length === 2) {
        // Two token name: First + Last (e.g. "Mayuresh Sawant" or "मयुरेश सावंत")
        firstName = normalizedTokens[0];
        middleName = '';
        lastName = normalizedTokens[1];
    } else if (normalizedTokens.length === 3) {
        // Standard Indian three token name: First + Middle + Last (e.g. "Mayuresh Abhay Sawant" or "मयुरेश अभय सावंत")
        firstName = normalizedTokens[0];
        middleName = normalizedTokens[1];
        lastName = normalizedTokens[2];
    } else {
        // Multi-token name (4+ tokens): First + Joined Middle Tokens + Last
        firstName = normalizedTokens[0];
        middleName = normalizedTokens.slice(1, normalizedTokens.length - 1).join(' ');
        lastName = normalizedTokens[normalizedTokens.length - 1];
    }

    const cleanFullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const needsClarification = isAmbiguous || (normalizedTokens.length === 1 && !explicitFirstName);

    return {
        isValid: true,
        raw: text,
        cleanFullName,
        tokens: normalizedTokens,
        tokenCount: normalizedTokens.length,
        firstName,
        middleName,
        lastName,
        isAmbiguous,
        needsClarification,
        clarificationPromptMr: needsClarification
            ? (isAmbiguous
                ? "तुमचे नाव व्यवस्थित समजू शकले नाही. कृपया तुमचे पूर्ण नाव सांगा (उदा. मयुरेश अभय सावंत)."
                : "कृपया तुमचे पूर्ण नाव (पहिले नाव, वडिलांचे नाव आणि आडनाव) सांगा.")
            : null,
        clarificationPromptEn: needsClarification
            ? (isAmbiguous
                ? "I could not cleanly understand your full name. Please provide your First, Middle, and Last name (e.g. Mayuresh Abhay Sawant)."
                : "Please provide your full name (First Name, Father's Name, and Last Name).")
            : null
    };
}
