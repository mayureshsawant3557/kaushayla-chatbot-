/**
 * Date Helper Functions for Lokshahi Divas
 * Replicates the C# Helper.cs logic
 */

/**
 * Get current IST (Indian Standard Time) date
 * @returns {Date} Current date in IST
 */
export const getISTDateTime = () => {
    const date = new Date();
    // IST is UTC+5:30
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 5.5));
};

/**
 * Get First Thursday of a given month and year
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (1-12)
 * @returns {Date} First Thursday date
 */
export const getFirstThursday = (year, month) => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Thursday is 4 (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
    const daysToAdd = (4 - dayOfWeek + 7) % 7;
    return new Date(year, month - 1, 1 + daysToAdd);
};

/**
 * Get Second Thursday of a given month and year
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (1-12)
 * @returns {Date} Second Thursday date
 */
export const getSecondThursday = (year, month) => {
    const firstThursday = getFirstThursday(year, month);
    return new Date(firstThursday.getTime() + (7 * 24 * 60 * 60 * 1000));
};

/**
 * Get Third Thursday of a given month and year
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (1-12)
 * @returns {Date} Third Thursday date
 */
export const getThirdThursday = (year, month) => {
    const firstThursday = getFirstThursday(year, month);
    return new Date(firstThursday.getTime() + (14 * 24 * 60 * 60 * 1000));
};

/**
 * Get Fourth Thursday of a given month and year
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (1-12)
 * @returns {Date} Fourth Thursday date
 */
export const getFourthThursday = (year, month) => {
    const firstThursday = getFirstThursday(year, month);
    return new Date(firstThursday.getTime() + (21 * 24 * 60 * 60 * 1000));
};

/**
 * Get First Monday of a given month and year
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (1-12)
 * @returns {Date} First Monday date
 */
export const getFirstMonday = (year, month) => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Monday is 1 (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
    const daysToAdd = (1 - dayOfWeek + 7) % 7;
    return new Date(year, month - 1, 1 + daysToAdd);
};

/**
 * Get Third Monday of a given month and year
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (1-12)
 * @returns {Date} Third Monday date
 */
export const getThirdMonday = (year, month) => {
    const firstMonday = getFirstMonday(year, month);
    return new Date(firstMonday.getTime() + (14 * 24 * 60 * 60 * 1000));
};

/**
 * Format date to DD/MM/YYYY
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Get the next occurrence of a date function if current month's date has passed
 * @param {Function} dateFunction - Function that takes (year, month) and returns Date
 * @returns {Date} Appropriate date (current month if upcoming, else next month)
 */
export const getNextOccurrence = (dateFunction) => {
    const now = getISTDateTime();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    
    // Get date for current month
    const currentMonthDate = dateFunction(currentYear, currentMonth);
    
    // Compare with current date
    if (currentMonthDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
        return currentMonthDate;
    } else {
        // If current month's date has passed, get next month's
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        return dateFunction(nextMonthYear, nextMonth);
    }
};

/**
 * Get all Lokshahi Divas dates
 * @returns {Object} Object containing all formatted dates
 */
export const getLokshahiDivasDates = () => {
    const now = getISTDateTime();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Head Office & Virtual: Fourth Thursday
    const fourthThursday = getNextOccurrence(getFourthThursday);
    
    // Regional Office: Third Thursday
    const thirdThursday = getNextOccurrence(getThirdThursday);
    
    // District Office: Second Thursday
    const secondThursday = getNextOccurrence(getSecondThursday);
    
    // For Virtual Lokshahi Divas (if using Third Monday as per your image)
    const thirdMonday = getNextOccurrence(getThirdMonday);
    
    return {
        headOfficeDate: formatDate(fourthThursday),
        virtualDate: formatDate(fourthThursday), // Same as head office in your code
        regionalOfficeDate: formatDate(thirdThursday),
        districtOfficeDate: formatDate(secondThursday),
        // If you want to use Third Monday for Virtual (as per image)
        virtualMondayDate: formatDate(thirdMonday),
        
        // Raw date objects if needed
        raw: {
            fourthThursday,
            thirdThursday,
            secondThursday,
            thirdMonday
        }
    };
};

/**
 * Replace Arabic numerals with Marathi numerals
 * @param {string} input - String containing numbers
 * @returns {string} String with Marathi numerals
 */
export const replaceWithMarathiNumbers = (input) => {
    if (!input) return input;
    
    const arabicToMarathi = {
        '0': '०',
        '1': '१',
        '2': '२',
        '3': '३',
        '4': '४',
        '5': '५',
        '6': '६',
        '7': '७',
        '8': '८',
        '9': '९'
    };
    
    return input.replace(/[0-9]/g, (match) => arabicToMarathi[match]);
};

/**
 * Check if a date is today or in the future
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today or future
 */
export const isTodayOrFuture = (date) => {
    const now = getISTDateTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return checkDate >= today;
};