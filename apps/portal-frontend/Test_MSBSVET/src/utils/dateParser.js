// dateParser.js - Comprehensive Date Parsing for MSBSVET Candidate Registration
// Supports Marathi (Devanagari & Roman), English, Devanagari numerals, spoken number words, and strict calendar validation.

// 1. Devanagari numerals conversion
export const devanagariToAscii = (text) => {
    if (!text || typeof text !== 'string') return '';
    const devanagariDigits = '०१२३४५६७८९';
    return text.replace(/[०-९]/g, (ch) => devanagariDigits.indexOf(ch).toString());
};

// 2. Marathi & English Spoken Number Words Map for Day & Year Components
const NUMBER_WORDS_MAP = {
    // Single digits & teens (Marathi Roman & Devanagari)
    'ek': 1, 'एक': 1, 'one': 1, '1st': 1, 'first': 1,
    'don': 2, 'दोन': 2, 'two': 2, '2nd': 2, 'second': 2,
    'teen': 3, 'तीन': 3, 'three': 3, '3rd': 3, 'third': 3,
    'char': 4, 'चार': 4, 'four': 4, '4th': 4, 'fourth': 4,
    'paach': 5, 'pach': 5, 'पाच': 5, 'five': 5, '5th': 5, 'fifth': 5,
    'saha': 6, 'सहा': 6, 'six': 6, '6th': 6, 'sixth': 6,
    'saat': 7, 'सात': 7, 'seven': 7, '7th': 7, 'seventh': 7,
    'aath': 8, 'आठ': 8, 'eight': 8, '8th': 8, 'eighth': 8,
    'nau': 9, 'nav': 9, 'नऊ': 9, 'nine': 9, '9th': 9, 'ninth': 9,
    'daha': 10, 'दहा': 10, 'ten': 10, '10th': 10, 'tenth': 10,
    'akra': 11, 'अकरा': 11, 'eleven': 11, '11th': 11, 'eleventh': 11,
    'bara': 12, 'बारा': 12, 'twelve': 12, '12th': 12, 'twelfth': 12,
    'tera': 13, 'तेरा': 13, 'thirteen': 13, '13th': 13, 'thirteenth': 13,
    'chauda': 14, 'चौदा': 14, 'fourteen': 14, '14th': 14, 'fourteenth': 14,
    'pandhra': 15, 'पंधरा': 15, 'fifteen': 15, '15th': 15, 'fifteenth': 15,
    'sola': 16, 'सोळा': 16, 'sixteen': 16, '16th': 16, 'sixteenth': 16,
    'satra': 17, 'सतरा': 17, 'seventeen': 17, '17th': 17, 'seventeenth': 17,
    'athra': 18, 'अठरा': 18, 'eighteen': 18, '18th': 18, 'eighteenth': 18,
    'ekonis': 19, 'एकोणीस': 19, 'nineteen': 19, '19th': 19, 'nineteenth': 19,
    'vees': 20, 'vis': 20, 'वीस': 20, 'twenty': 20, '20th': 20, 'twentieth': 20,
    'ekvees': 21, 'एकवीस': 21, 'twenty-one': 21, 'twenty one': 21, '21st': 21,
    'bavees': 22, 'बावीस': 22, 'twenty-two': 22, 'twenty two': 22, '22nd': 22,
    'tevees': 23, 'तेवीस': 23, 'twenty-three': 23, 'twenty three': 23, '23rd': 23,
    'chovees': 24, 'चोवीस': 24, 'twenty-four': 24, 'twenty four': 24, '24th': 24,
    'pachvees': 25, 'पंचवीस': 25, 'twenty-five': 25, 'twenty five': 25, '25th': 25,
    'savvees': 26, 'छव्वीस': 26, 'twenty-six': 26, 'twenty six': 26, '26th': 26,
    'sattavees': 27, 'सत्तावीस': 27, 'twenty-seven': 27, 'twenty seven': 27, '27th': 27,
    'atthavees': 28, 'अठ्ठावीस': 28, 'twenty-eight': 28, 'twenty eight': 28, '28th': 28,
    'ekontis': 29, 'एकोणतीस': 29, 'twenty-nine': 29, 'twenty nine': 29, '29th': 29,
    'tees': 30, 'तीस': 30, 'thirty': 30, '30th': 30, 'thirtieth': 30,
    'ektis': 31, 'एकतीस': 31, 'एकत्रीस': 31, 'thirty-one': 31, 'thirty one': 31, '31st': 31
};

// 3. Month Name to Month Number (1-12)
const MONTH_NAMES_MAP = {
    // Month 1
    'जानेवारी': 1, 'janevari': 1, 'janavari': 1, 'january': 1, 'jan': 1,
    // Month 2
    'फेब्रुवारी': 2, 'febhruvari': 2, 'february': 2, 'feb': 2,
    // Month 3
    'मार्च': 3, 'march': 3, 'mar': 3,
    // Month 4
    'एप्रिल': 4, 'epril': 4, 'april': 4, 'apr': 4,
    // Month 5
    'मे': 5, 'may': 5,
    // Month 6
    'जून': 6, 'june': 6, 'jun': 6,
    // Month 7
    'जुलै': 7, 'julai': 7, 'july': 7, 'jul': 7,
    // Month 8
    'ऑगस्ट': 8, 'ऑगष्ट': 8, 'ogast': 8, 'august': 8, 'aug': 8,
    // Month 9
    'सप्टेंबर': 9, 'saptembar': 9, 'september': 9, 'sept': 9, 'sep': 9,
    // Month 10
    'ऑक्टोबर': 10, 'oktobar': 10, 'october': 10, 'oct': 10,
    // Month 11
    'नोव्हेंबर': 11, 'novhembar': 11, 'november': 11, 'nov': 11,
    // Month 12
    'डिसेंबर': 12, 'disembar': 12, 'december': 12, 'dec': 12
};

// 4. Strict Calendar Validation (handles leap years, days in month, and reasonable birth dates)
export const isValidCalendarDate = (day, month, year) => {
    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
        return false;
    }
    if (year < 1920 || year > new Date().getFullYear()) {
        return false;
    }
    if (month < 1 || month > 12) {
        return false;
    }
    // Days in each month (February: leap year check)
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInMonths = [0, 31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (day < 1 || day > daysInMonths[month]) {
        return false;
    }

    // Verify Date object construction matches exact parts
    const d = new Date(year, month - 1, day);
    return (
        d.getFullYear() === year &&
        d.getMonth() === month - 1 &&
        d.getDate() === day
    );
};

// 5. Parse spoken year expression (e.g. "don hajar paach", "two thousand five", "२००५", "2005")
const parseYearExpression = (yearStr) => {
    if (!yearStr) return null;
    const clean = yearStr.toLowerCase().trim();

    // Direct numeric year (1920 - 2026)
    const directMatch = clean.match(/\b(19\d{2}|20\d{2})\b/);
    if (directMatch) {
        return parseInt(directMatch[1], 10);
    }

    // "don hajar [number]" / "दोन हजार [number]"
    if (clean.includes('don hajar') || clean.includes('दोन हजार') || clean.includes('two thousand')) {
        let base = 2000;
        const remainder = clean
            .replace(/don\s*hajar|दोन\s*हजार|two\s*thousand(?:\s*and)?/g, '')
            .trim();

        if (!remainder) return 2000;

        // Check if remainder is a number word
        if (NUMBER_WORDS_MAP[remainder] !== undefined) {
            return base + NUMBER_WORDS_MAP[remainder];
        }

        // Check if remainder is numeric digits
        const remDigits = parseInt(remainder, 10);
        if (!isNaN(remDigits) && remDigits >= 0 && remDigits <= 99) {
            return base + remDigits;
        }
    }

    // "ekonis she [number]" / "एकोणीसशे [number]" / "nineteen [number]"
    if (clean.includes('ekonis she') || clean.includes('एकोणीसशे') || clean.includes('nineteen')) {
        let base = 1900;
        const remainder = clean
            .replace(/ekonis\s*she|एकोणीसशे|nineteen/g, '')
            .trim();

        if (!remainder) return 1900;
        if (NUMBER_WORDS_MAP[remainder] !== undefined) {
            return base + NUMBER_WORDS_MAP[remainder];
        }
        const remDigits = parseInt(remainder, 10);
        if (!isNaN(remDigits) && remDigits >= 0 && remDigits <= 99) {
            return base + remDigits;
        }
    }

    return null;
};

// 6. Comprehensive Date Parser
// Returns: { isValid: boolean, formatted: 'YYYY-MM-DD', display: 'DD/MM/YYYY', day, month, year, rawMatch, reason?: string }
export const parseCandidateDateOfBirth = (input) => {
    if (!input || typeof input !== 'string') {
        return { isValid: false, reason: 'Empty input' };
    }

    // Step A: Convert any Devanagari numerals to ASCII digits
    let text = devanagariToAscii(input.trim());

    // Step B: Ignore 10-digit mobile numbers starting with 6-9 so they aren't parsed as dates
    text = text.replace(/\b[6-9]\d{9}\b/g, ' ');

    // Normalize spacing and punctuation
    text = text.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    const lower = text.toLowerCase();

    // Pattern 1: ISO format YYYY-MM-DD or YYYY/MM/DD
    const isoMatch = text.match(/\b(19\d{2}|20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (isoMatch) {
        const y = parseInt(isoMatch[1], 10);
        const m = parseInt(isoMatch[2], 10);
        const d = parseInt(isoMatch[3], 10);
        if (isValidCalendarDate(d, m, y)) {
            const mm = String(m).padStart(2, '0');
            const dd = String(d).padStart(2, '0');
            return {
                isValid: true,
                formatted: `${y}-${mm}-${dd}`,
                display: `${dd}/${mm}/${y}`,
                day: d,
                month: m,
                year: y,
                rawMatch: isoMatch[0]
            };
        } else {
            return { isValid: false, reason: 'Invalid calendar date', rawMatch: isoMatch[0] };
        }
    }

    // Pattern 2: Standard numeric DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, or DD MM YYYY
    const numericMatch = text.match(/\b(\d{1,2})[-/. ](\d{1,2})[-/. ](19\d{2}|20\d{2})\b/);
    if (numericMatch) {
        const d = parseInt(numericMatch[1], 10);
        const m = parseInt(numericMatch[2], 10);
        const y = parseInt(numericMatch[3], 10);
        if (isValidCalendarDate(d, m, y)) {
            const mm = String(m).padStart(2, '0');
            const dd = String(d).padStart(2, '0');
            return {
                isValid: true,
                formatted: `${y}-${mm}-${dd}`,
                display: `${dd}/${mm}/${y}`,
                day: d,
                month: m,
                year: y,
                rawMatch: numericMatch[0]
            };
        } else {
            return { isValid: false, reason: 'Invalid calendar date', rawMatch: numericMatch[0] };
        }
    }

    // Pattern 3: Day + Month Name (Marathi/English) + Year (digits or words)
    // E.g.: "17 ऑगस्ट 2005", "17 August 2005", "17 August two thousand five", "satra August don hajar paach"
    const tokens = lower.split(/\s+/);

    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];

        // Check if tok matches any month name
        if (MONTH_NAMES_MAP[tok] !== undefined) {
            const monthNum = MONTH_NAMES_MAP[tok];

            // Day should be preceding token (or 2 tokens before if e.g. "twenty first")
            let dayNum = null;
            if (i > 0) {
                const prev = tokens[i - 1];
                if (/^\d{1,2}$/.test(prev)) {
                    dayNum = parseInt(prev, 10);
                } else if (NUMBER_WORDS_MAP[prev] !== undefined) {
                    dayNum = NUMBER_WORDS_MAP[prev];
                } else if (i > 1) {
                    const twoPrev = `${tokens[i - 2]} ${prev}`;
                    if (NUMBER_WORDS_MAP[twoPrev] !== undefined) {
                        dayNum = NUMBER_WORDS_MAP[twoPrev];
                    }
                }
            }

            // Year should be succeeding tokens
            let yearNum = null;
            if (i + 1 < tokens.length) {
                const nextTok = tokens[i + 1];
                if (/^(19\d{2}|20\d{2})$/.test(nextTok)) {
                    yearNum = parseInt(nextTok, 10);
                } else {
                    const remainingStr = tokens.slice(i + 1).join(' ');
                    yearNum = parseYearExpression(remainingStr);
                }
            }

            if (dayNum !== null && yearNum !== null) {
                if (isValidCalendarDate(dayNum, monthNum, yearNum)) {
                    const mm = String(monthNum).padStart(2, '0');
                    const dd = String(dayNum).padStart(2, '0');
                    return {
                        isValid: true,
                        formatted: `${yearNum}-${mm}-${dd}`,
                        display: `${dd}/${mm}/${yearNum}`,
                        day: dayNum,
                        month: monthNum,
                        year: yearNum,
                        rawMatch: `${tokens.slice(Math.max(0, i - 1), Math.min(tokens.length, i + 4)).join(' ')}`
                    };
                } else {
                    return {
                        isValid: false,
                        reason: 'Invalid calendar date',
                        day: dayNum,
                        month: monthNum,
                        year: yearNum
                    };
                }
            }
        }
    }

    // Pattern 4: Purely spoken words without month name (e.g. "satra aath don hajar paach")
    if (tokens.length >= 3) {
        const dayVal = /^\d{1,2}$/.test(tokens[0]) ? parseInt(tokens[0], 10) : NUMBER_WORDS_MAP[tokens[0]];
        const monthVal = /^\d{1,2}$/.test(tokens[1]) ? parseInt(tokens[1], 10) : (NUMBER_WORDS_MAP[tokens[1]] || MONTH_NAMES_MAP[tokens[1]]);
        const yearVal = parseYearExpression(tokens.slice(2).join(' '));

        if (dayVal && monthVal && yearVal) {
            if (isValidCalendarDate(dayVal, monthVal, yearVal)) {
                const mm = String(monthVal).padStart(2, '0');
                const dd = String(dayVal).padStart(2, '0');
                return {
                    isValid: true,
                    formatted: `${yearVal}-${mm}-${dd}`,
                    display: `${dd}/${mm}/${yearVal}`,
                    day: dayVal,
                    month: monthVal,
                    year: yearVal
                };
            } else {
                return { isValid: false, reason: 'Invalid calendar date' };
            }
        }
    }

    return { isValid: false, reason: 'No recognizable date found' };
};
