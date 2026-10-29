// import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
// import { RefreshCw, AlertCircle, CheckCircle, ShieldPlus, X, Volume2 } from 'lucide-react';

// const Captcha = forwardRef(({
//     label = 'Captcha Verification',
//     name = 'captcha',
//     type = 'alphanumeric', // 'alphanumeric', 'math', or 'both' (random)
//     length = 6, // For alphanumeric captcha
//     difficulty = 'medium', // 'easy', 'medium', 'hard' (for math)
//     onChange,
//     onValidationChange,
//     validators = [],
//     required = false,
//     className = '',
//     helperText = '',
//     forceShowError = false,
//     disabled = false,
//     caseSensitive = false, // For alphanumeric captcha
//     clearable = false, // Show clear button
//     enableVoice = true, // Enable voice button
//     voiceLanguage = 'en-US', // Voice language
//     voiceRate = 0.8, // Speech rate (0.1 to 10)
//     voicePitch = 1, // Voice pitch (0 to 2)
// }, ref) => {
//     const [captchaValue, setCaptchaValue] = useState('');
//     const [captchaAnswer, setCaptchaAnswer] = useState('');
//     const [userInput, setUserInput] = useState('');
//     const [error, setError] = useState(null);
//     const [touched, setTouched] = useState(false);
//     const [isValidating, setIsValidating] = useState(false);
//     const [currentType, setCurrentType] = useState(type);
//     const [isSpeaking, setIsSpeaking] = useState(false);
//     const canvasRef = useRef(null);

//     // Generate random alphanumeric string
//     const generateAlphanumeric = () => {
//         const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
//         let result = '';
//         for (let i = 0; i < length; i++) {
//             result += chars.charAt(Math.floor(Math.random() * chars.length));
//         }
//         return result;
//     };

//     // Generate math equation
//     const generateMathEquation = () => {
//         let num1, num2, operator, answer, equation;

//         switch (difficulty) {
//             case 'easy':
//                 num1 = Math.floor(Math.random() * 10) + 1;
//                 num2 = Math.floor(Math.random() * 10) + 1;
//                 operator = Math.random() > 0.5 ? '+' : '-';
//                 if (operator === '-' && num1 < num2) {
//                     [num1, num2] = [num2, num1]; // Ensure positive result
//                 }
//                 answer = operator === '+' ? num1 + num2 : num1 - num2;
//                 equation = `${num1} ${operator} ${num2}`;
//                 break;

//             case 'medium':
//                 num1 = Math.floor(Math.random() * 20) + 1;
//                 num2 = Math.floor(Math.random() * 10) + 1;
//                 const ops = ['+', '-', '×'];
//                 operator = ops[Math.floor(Math.random() * ops.length)];
//                 if (operator === '-' && num1 < num2) {
//                     [num1, num2] = [num2, num1];
//                 }
//                 answer = operator === '+' ? num1 + num2 : operator === '-' ? num1 - num2 : num1 * num2;
//                 equation = `${num1} ${operator} ${num2}`;
//                 break;

//             case 'hard':
//                 num1 = Math.floor(Math.random() * 50) + 10;
//                 num2 = Math.floor(Math.random() * 12) + 1;
//                 const hardOps = ['+', '-', '×', '÷'];
//                 operator = hardOps[Math.floor(Math.random() * hardOps.length)];
//                 if (operator === '÷') {
//                     // Ensure division results in whole number
//                     num1 = num2 * (Math.floor(Math.random() * 10) + 1);
//                     answer = num1 / num2;
//                 } else if (operator === '-' && num1 < num2) {
//                     [num1, num2] = [num2, num1];
//                 } else {
//                     answer = operator === '+' ? num1 + num2 : operator === '×' ? num1 * num2 : num1 - num2;
//                 }
//                 equation = `${num1} ${operator} ${num2}`;
//                 break;

//             default:
//                 num1 = Math.floor(Math.random() * 10) + 1;
//                 num2 = Math.floor(Math.random() * 10) + 1;
//                 answer = num1 + num2;
//                 equation = `${num1} + ${num2}`;
//         }

//         return { equation, answer: answer.toString() };
//     };

//     // Draw captcha on canvas
//     const drawCaptcha = (text, isMath = false) => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         const ctx = canvas.getContext('2d');
//         const width = canvas.width;
//         const height = canvas.height;

//         // Clear canvas
//         ctx.clearRect(0, 0, width, height);

//         // Background with gradient
//         const gradient = ctx.createLinearGradient(0, 0, width, height);
//         gradient.addColorStop(0, '#f0f9ff');
//         gradient.addColorStop(1, '#e0f2fe');
//         ctx.fillStyle = gradient;
//         ctx.fillRect(0, 0, width, height);

//         // Add noise lines
//         for (let i = 0; i < 5; i++) {
//             ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
//             ctx.beginPath();
//             ctx.moveTo(Math.random() * width, Math.random() * height);
//             ctx.lineTo(Math.random() * width, Math.random() * height);
//             ctx.stroke();
//         }

//         // Add noise dots
//         for (let i = 0; i < 50; i++) {
//             ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
//             ctx.beginPath();
//             ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI);
//             ctx.fill();
//         }

//         // Draw text
//         const fontSize = isMath ? 24 : 28;
//         ctx.font = `bold ${fontSize}px Arial`;
//         ctx.textBaseline = 'middle';

//         const textWidth = ctx.measureText(text).width;
//         const startX = (width - textWidth) / 2;

//         // Draw each character with random rotation and color
//         let currentX = startX;
//         for (let i = 0; i < text.length; i++) {
//             ctx.save();

//             // Random rotation
//             const angle = (Math.random() - 0.5) * 0.3;
//             const charWidth = ctx.measureText(text[i]).width;

//             ctx.translate(currentX + charWidth / 2, height / 2);
//             ctx.rotate(angle);

//             // Random color for each character
//             const colors = ['#1e40af', '#7c3aed', '#dc2626', '#059669', '#ea580c'];
//             ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

//             ctx.fillText(text[i], -charWidth / 2, 0);
//             ctx.restore();

//             currentX += charWidth + 2;
//         }

//         // Add border
//         ctx.strokeStyle = '#cbd5e1';
//         ctx.lineWidth = 2;
//         ctx.strokeRect(0, 0, width, height);
//     };

//     // Initialize captcha
//     const refreshCaptcha = () => {
//         let actualType = type;
//         if (type === 'both') {
//             actualType = Math.random() > 0.5 ? 'alphanumeric' : 'math';
//             setCurrentType(actualType);
//         }

//         if (actualType === 'math') {
//             const { equation, answer } = generateMathEquation();
//             setCaptchaValue(equation);
//             setCaptchaAnswer(answer);
//             drawCaptcha(equation, true);
//         } else {
//             const alphanumeric = generateAlphanumeric();
//             setCaptchaValue(alphanumeric);
//             setCaptchaAnswer(alphanumeric);
//             drawCaptcha(alphanumeric, false);
//         }

//         setUserInput('');
//         setError(null);
//         setTouched(false);
//     };

//     // Initialize on mount
//     useEffect(() => {
//         refreshCaptcha();
//     }, []);

//     // Expose refresh method to parent component via ref
//     useImperativeHandle(ref, () => ({
//         refresh: () => {
//             refreshCaptcha();
//         }
//     }));

//     // Redraw when captcha value changes
//     useEffect(() => {
//         if (captchaValue) {
//             drawCaptcha(captchaValue, currentType === 'math');
//         }
//     }, [captchaValue, currentType]);

//     // Run validation
//     const runValidation = async (val) => {
//         if (validators.length === 0) {
//             return null;
//         }

//         setIsValidating(true);

//         for (const validator of validators) {
//             let validationError = null;

//             if (typeof validator === 'function') {
//                 validationError = await validator(val);
//             } else {
//                 validationError = validator;
//             }

//             if (validationError) {
//                 setIsValidating(false);
//                 return validationError;
//             }
//         }

//         setIsValidating(false);
//         return null;
//     };

//     // Validate captcha answer
//     const validateCaptcha = async (value) => {
//         if (!value || value.trim() === '') {
//             return 'Please Enter Captcha.';
//         }

//         const userAnswer = caseSensitive ? value.trim() : value.trim().toLowerCase();
//         const correctAnswer = caseSensitive ? captchaAnswer : captchaAnswer.toLowerCase();

//         if (userAnswer !== correctAnswer) {
//             return 'Captcha is incorrect. Please try again.';
//         }

//         // Run additional validators
//         const validationError = await runValidation(value);
//         return validationError;
//     };

//     // Handle input change
//     const handleChange = async (e) => {
//         const value = e.target.value;
//         setUserInput(value);

//         if (onChange) {
//             onChange(value);
//         }

//         if (touched) {
//             const validationError = await validateCaptcha(value);
//             setError(validationError);

//             if (onValidationChange) {
//                 onValidationChange(name, validationError, label);
//             }
//         }
//     };

//     // Handle blur
//     const handleBlur = async () => {
//         setTouched(true);

//         const validationError = await validateCaptcha(userInput);
//         setError(validationError);

//         if (onValidationChange) {
//             onValidationChange(name, validationError, label);
//         }
//     };

//     // Handle refresh
//     const handleRefresh = () => {
//         refreshCaptcha();
//         if (onValidationChange) {
//             onValidationChange(name, null, label);
//         }
//     };

//     // Handle clear
//     const handleClear = () => {
//         setUserInput('');
//         setError(null);
//         setTouched(false);

//         if (onChange) {
//             onChange('');
//         }

//         if (onValidationChange) {
//             onValidationChange(name, null, label);
//         }
//     };

//     // Speak captcha text using Web Speech API
//     const speakCaptcha = () => {
//         // Check if speech synthesis is supported
//         if (!('speechSynthesis' in window)) {
//             return;
//         }

//         // Cancel any ongoing speech
//         window.speechSynthesis.cancel();

//         // Prepare text to speak
//         let textToSpeak = '';

//         if (currentType === 'math') {
//             // For math equations, speak naturally
//             textToSpeak = captchaValue
//                 .replace(/×/g, ' times ')
//                 .replace(/÷/g, ' divided by ')
//                 .replace(/\+/g, ' plus ')
//                 .replace(/-/g, ' minus ');
//         } else {
//             // For alphanumeric, spell out each character with pauses
//             textToSpeak = captchaValue.split('').join('. ');
//         }

//         // Create speech utterance
//         const utterance = new SpeechSynthesisUtterance(textToSpeak);
//         utterance.lang = voiceLanguage;
//         utterance.rate = voiceRate;
//         utterance.pitch = voicePitch;

//         // Handle speech events
//         utterance.onstart = () => setIsSpeaking(true);
//         utterance.onend = () => setIsSpeaking(false);
//         utterance.onerror = () => setIsSpeaking(false);

//         // Speak
//         window.speechSynthesis.speak(utterance);
//     };

//     // Mark as touched and run validation when forceShowError becomes true
//     useEffect(() => {
//         if (forceShowError) {
//             setTouched(true);
//             const validate = async () => {
//                 const validationError = await validateCaptcha(userInput);
//                 setError(validationError);

//                 if (onValidationChange) {
//                     onValidationChange(name, validationError, label);
//                 }
//             };
//             validate();
//         }
//     }, [forceShowError]);

//     // Determine border color
//     const getBorderColor = () => {
//         if (disabled) return 'border-gray-300';
//         if (error && (touched || forceShowError)) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
//         if (!error && (touched || forceShowError) && userInput) return 'border-green-500 focus:border-green-500 focus:ring-green-500';
//         return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
//     };

//     const showError = (touched || forceShowError) && error;
//     const showSuccess = (touched || forceShowError) && !error && userInput && !isValidating;

//     return (
//         <div className={`w-full ${className}`}>
//             {/* Label */}
//             {label && (
//                 <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
//                     {label}
//                     {required && <span className="text-red-500 ml-1">*</span>}
//                 </label>
//             )}

//             {/* Captcha Display */}
//             <div className="mb-1">
//                 <div className="flex items-center gap-3">
//                     <canvas
//                         ref={canvasRef}
//                         width={currentType === 'math' ? 200 : 180}
//                         height={40}
//                         className="rounded-sm shadow-sm"
//                     />
//                     {/* Action Buttons */}
//                     <div className="flex gap-2 justify-center items-center">
//                         {/* Voice Button */}
//                         {enableVoice && (
//                             <button
//                                 type="button"
//                                 onClick={speakCaptcha}
//                                 disabled={isSpeaking}
//                                 className={`p-2 rounded-lg transition-colors ${isSpeaking
//                                     ? 'text-green-600 bg-green-50 animate-pulse'
//                                     : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
//                                     }`}
//                                 title="Listen to captcha"
//                             >
//                                 <Volume2 className={`w-7 h-7 ${isSpeaking ? 'animate-pulse' : ''}`} />
//                             </button>
//                         )}
//                         {/* Refresh Button */}
//                         <button
//                             type="button"
//                             onClick={handleRefresh}
//                             className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
//                             title="Refresh captcha"
//                         >
//                             <RefreshCw className="w-6 h-6" />
//                         </button>


//                     </div>
//                 </div>
//                 {label && (
//                     <p className="text-sm font-medium text-gray-700 mt-3">
//                         {currentType === 'math'
//                             ? 'Solve the equation above'
//                             : caseSensitive
//                                 ? 'Enter the text above (case-sensitive)'
//                                 : 'Enter the text above'}
//                     </p>
//                 )}
//             </div>

//             {/* Input Field */}
//             <div className="relative">
//                 {/* Prefix Icon */}
//                 <div className="absolute mt-1.5 left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
//                     <ShieldPlus className="w-5 h-5" />
//                 </div>

//                 <input
//                     id={name}
//                     name={name}
//                     type="text"
//                     value={userInput}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     disabled={disabled}
//                     placeholder={label ?
//                         (currentType === 'math' ? 'Enter Answer' : 'Enter Captcha') :
//                         currentType === 'math'
//                             ? 'Solve the equation above'
//                             : caseSensitive
//                                 ? 'Enter the text above (case-sensitive)'
//                                 : 'Enter the text above'}
//                     className={`w-full px-3 py-2 border rounded-lg pl-10
//                         ${clearable && userInput ? "pr-10" : ""}
//                         ${getBorderColor()}
//                         ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
//                         transition-colors duration-200
//                         focus:outline-none focus:ring-2
//                         ${!label && 'mt-3'}
//                     `}
//                     autoComplete="off"
//                 />

//                 {/* Right Side Icons */}
//                 <div className="absolute mt-1.5 right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
//                     {/* Validation Icons */}
//                     {(touched || forceShowError) && !isValidating && (
//                         <>
//                             {showError && <AlertCircle className="w-5 h-5 text-red-500" />}
//                             {showSuccess && <CheckCircle className="w-5 h-5 text-green-500" />}
//                         </>
//                     )}

//                     {/* Clear Button */}
//                     {clearable && userInput && (
//                         <button
//                             type="button"
//                             onClick={handleClear}
//                             className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
//                             tabIndex={-1}
//                             aria-label="Clear captcha"
//                         >
//                             <X className="w-4 h-4" />
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* Helper Text or Error Message */}
//             {(helperText || showError) && (
//                 <div className="mt-1 text-sm">
//                     {showError ? (
//                         <p className="text-red-600 flex items-center gap-1">
//                             <AlertCircle className="w-4 h-4" />
//                             {error}
//                         </p>
//                     ) : (
//                         helperText && <p className="text-gray-500">{helperText}</p>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// });

// Captcha.displayName = 'Captcha';

// export default Captcha;

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, ShieldPlus, X, Volume2 } from 'lucide-react';

const Captcha = forwardRef(({
    label = 'Captcha Verification',
    name = 'captcha',
    type = 'alphanumeric', // 'alphanumeric', 'math', or 'both' (random)
    length = 6, // For alphanumeric captcha
    difficulty = 'medium', // 'easy', 'medium', 'hard' (for math)
    onChange,
    onValidationChange,
    validators = [],
    required = false,
    className = '',
    helperText = '',
    forceShowError = false,
    disabled = false,
    caseSensitive = false, // For alphanumeric captcha
    clearable = false, // Show clear button
    enableVoice = true, // Enable voice button
    voiceLanguage = 'en-US', // Voice language
    voiceRate = 0.8, // Speech rate (0.1 to 10)
    voicePitch = 1, // Voice pitch (0 to 2)
}, ref) => {
    const [captchaValue, setCaptchaValue] = useState('');
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [userInput, setUserInput] = useState('');
    const [error, setError] = useState(null);
    const [touched, setTouched] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [currentType, setCurrentType] = useState(type);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const canvasRef = useRef(null);

    // Generate random alphanumeric string
    const generateAlphanumeric = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // Generate math equation
    const generateMathEquation = () => {
        let num1, num2, operator, answer, equation;

        switch (difficulty) {
            case 'easy':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                operator = Math.random() > 0.5 ? '+' : '-';
                if (operator === '-' && num1 < num2) {
                    [num1, num2] = [num2, num1]; // Ensure positive result
                }
                answer = operator === '+' ? num1 + num2 : num1 - num2;
                equation = `${num1} ${operator} ${num2}`;
                break;

            case 'medium':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                const ops = ['+', '-', '×'];
                operator = ops[Math.floor(Math.random() * ops.length)];
                if (operator === '-' && num1 < num2) {
                    [num1, num2] = [num2, num1];
                }
                answer = operator === '+' ? num1 + num2 : operator === '-' ? num1 - num2 : num1 * num2;
                equation = `${num1} ${operator} ${num2}`;
                break;

            case 'hard':
                num1 = Math.floor(Math.random() * 50) + 10;
                num2 = Math.floor(Math.random() * 12) + 1;
                const hardOps = ['+', '-', '×', '÷'];
                operator = hardOps[Math.floor(Math.random() * hardOps.length)];
                if (operator === '÷') {
                    // Ensure division results in whole number
                    num1 = num2 * (Math.floor(Math.random() * 10) + 1);
                    answer = num1 / num2;
                } else if (operator === '-' && num1 < num2) {
                    [num1, num2] = [num2, num1];
                } else {
                    answer = operator === '+' ? num1 + num2 : operator === '×' ? num1 * num2 : num1 - num2;
                }
                equation = `${num1} ${operator} ${num2}`;
                break;

            default:
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = num1 + num2;
                equation = `${num1} + ${num2}`;
        }

        return { equation, answer: answer.toString() };
    };

    // Draw captcha on canvas
    const drawCaptcha = (text, isMath = false) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Background with gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f0f9ff');
        gradient.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add noise lines
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        // Add noise dots
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
            ctx.beginPath();
            ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw text
        const fontSize = isMath ? 24 : 28;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textBaseline = 'middle';

        const textWidth = ctx.measureText(text).width;
        const startX = (width - textWidth) / 2;

        // Draw each character with random rotation and color
        let currentX = startX;
        for (let i = 0; i < text.length; i++) {
            ctx.save();

            // Random rotation
            const angle = (Math.random() - 0.5) * 0.3;
            const charWidth = ctx.measureText(text[i]).width;

            ctx.translate(currentX + charWidth / 2, height / 2);
            ctx.rotate(angle);

            // Random color for each character
            const colors = ['#1e40af', '#7c3aed', '#dc2626', '#059669', '#ea580c'];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

            ctx.fillText(text[i], -charWidth / 2, 0);
            ctx.restore();

            currentX += charWidth + 2;
        }

        // Add border
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);
    };

    // Initialize captcha
    const refreshCaptcha = () => {
        let actualType = type;
        if (type === 'both') {
            actualType = Math.random() > 0.5 ? 'alphanumeric' : 'math';
            setCurrentType(actualType);
        }

        if (actualType === 'math') {
            const { equation, answer } = generateMathEquation();
            setCaptchaValue(equation);
            setCaptchaAnswer(answer);
            drawCaptcha(equation, true);
        } else {
            const alphanumeric = generateAlphanumeric();
            setCaptchaValue(alphanumeric);
            setCaptchaAnswer(alphanumeric);
            drawCaptcha(alphanumeric, false);
        }

        setUserInput('');
        setError(null);
        setTouched(false);
    };

    // Initialize on mount
    useEffect(() => {
        refreshCaptcha();
    }, []);

    // Expose refresh method to parent component via ref
    useImperativeHandle(ref, () => ({
        refresh: () => {
            refreshCaptcha();
        },
    validate: async () => {
        setTouched(true);
        const validationError = await validateCaptcha(userInput);
        setError(validationError);

        if (onValidationChange) {
            onValidationChange(name, validationError, label);
        }

        return !validationError;
    }
    }));

    // Redraw when captcha value changes
    useEffect(() => {
        if (captchaValue) {
            drawCaptcha(captchaValue, currentType === 'math');
        }
    }, [captchaValue, currentType]);

    // Run validation
    const runValidation = async (val) => {
        if (validators.length === 0) {
            return null;
        }

        setIsValidating(true);

        for (const validator of validators) {
            let validationError = null;

            if (typeof validator === 'function') {
                validationError = await validator(val);
            } else {
                validationError = validator;
            }

            if (validationError) {
                setIsValidating(false);
                return validationError;
            }
        }

        setIsValidating(false);
        return null;
    };

    // Validate captcha answer
    const validateCaptcha = async (value) => {
        if (!value || value.trim() === '') {
            return 'Please enter captcha.';
        }

        const userAnswer = caseSensitive ? value.trim() : value.trim().toLowerCase();
        const correctAnswer = caseSensitive ? captchaAnswer : captchaAnswer.toLowerCase();

        if (userAnswer !== correctAnswer) {
            return 'Captcha is incorrect. Please try again.';
        }

        // Run additional validators
        const validationError = await runValidation(value);
        return validationError;
    };

    // Handle input change
    const handleChange = async (e) => {
        const value = e.target.value;
        setUserInput(value);

        if (onChange) {
            onChange(value);
        }

        if (touched) {
            const validationError = await validateCaptcha(value);
            setError(validationError);

            if (onValidationChange) {
                onValidationChange(name, validationError, label);
            }
        }
    };

    // Handle blur
    const handleBlur = async () => {
        setTouched(true);

        const validationError = await validateCaptcha(userInput);
        setError(validationError);

        if (onValidationChange) {
            onValidationChange(name, validationError, label);
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        refreshCaptcha();
        if (onValidationChange) {
            onValidationChange(name, null, label);
        }
    };

    // Handle clear
    const handleClear = () => {
        setUserInput('');
        setError(null);
        setTouched(false);

        if (onChange) {
            onChange('');
        }

        if (onValidationChange) {
            onValidationChange(name, null, label);
        }
    };

    // Speak captcha text using Web Speech API
    const speakCaptcha = () => {
        // Check if speech synthesis is supported
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported in this browser');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Prepare text to speak
        let textToSpeak = '';

        if (currentType === 'math') {
            // For math equations, speak naturally
            textToSpeak = captchaValue
                .replace(/×/g, ' times ')
                .replace(/÷/g, ' divided by ')
                .replace(/\+/g, ' plus ')
                .replace(/-/g, ' minus ');
        } else {
            // For alphanumeric, spell out each character with pauses
            textToSpeak = captchaValue.split('').join('. ');
        }

        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = voiceLanguage;
        utterance.rate = voiceRate;
        utterance.pitch = voicePitch;

        // Handle speech events
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        // Speak
        window.speechSynthesis.speak(utterance);
    };

    // Mark as touched and run validation when forceShowError becomes true
    useEffect(() => {
        if (forceShowError) {
            setTouched(true);
            const validate = async () => {
                const validationError = await validateCaptcha(userInput);
                setError(validationError);

                if (onValidationChange) {
                    onValidationChange(name, validationError, label);
                }
            };
            validate();
        }
    }, [forceShowError]);

    // Determine border color
    const getBorderColor = () => {
        if (disabled) return 'border-gray-300';
        if (error && (touched || forceShowError)) return 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50';
        if (!error && (touched || forceShowError) && userInput) return 'border-green-400 focus:border-green-500 focus:ring-green-500 bg-green-50';
        return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white';
    };

    const showError = (touched || forceShowError) && error;
    const showSuccess = (touched || forceShowError) && !error && userInput && !isValidating;

    return (
        <div className={`w-full ${className}`}>
            {/* Label */}
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Captcha Display */}
            <div className="mb-1">
                <div className="flex items-center gap-3">
                    <canvas
                        ref={canvasRef}
                        width={currentType === 'math' ? 200 : 180}
                        height={40}
                        className="rounded-sm shadow-sm"
                    />
                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-center items-center">
                        {/* Voice Button */}
                        {enableVoice && (
                            <button
                                type="button"
                                onClick={speakCaptcha}
                                disabled={isSpeaking}
                                className={`p-2 rounded-lg transition-colors ${isSpeaking
                                    ? 'text-green-600 bg-green-50 animate-pulse'
                                    : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                                    }`}
                                title="Listen to captcha"
                            >
                                <Volume2 className={`w-7 h-7 ${isSpeaking ? 'animate-pulse' : ''}`} />
                            </button>
                        )}
                        {/* Refresh Button */}
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Refresh captcha"
                        >
                            <RefreshCw className="w-6 h-6" />
                        </button>


                    </div>
                </div>
                {label && (
                    <p className="text-sm font-medium text-gray-700 mt-3">
                        {currentType === 'math'
                            ? 'Solve the equation above'
                            : caseSensitive
                                ? 'Enter the text above (case-sensitive)'
                                : 'Enter the text above'}
                    </p>
                )}
            </div>

            {/* Input Field */}
            <div className="relative">
                {/* Prefix Icon */}
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none
                    ${label ? 'mt-0' : 'mt-1.5'}`}
                >
                    <ShieldPlus className="w-5 h-5" />
                </div>

                <input
                    id={name}
                    name={name}
                    type="text"
                    maxLength="10"
                    value={userInput}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder={label ?
                        (currentType === 'math' ? 'Enter Answer' : 'Enter Captcha') :
                        currentType === 'math'
                            ? 'Solve the equation above'
                            : caseSensitive
                                ? 'Enter the text above (case-sensitive)'
                                : 'Enter the text above'}
                    className={`w-full px-3 py-2 border rounded-lg pl-10
                        ${clearable && userInput ? "pr-10" : ""}
                        ${getBorderColor()}
                        ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
                        transition-colors duration-200
                        focus:outline-none focus:ring-2
                        ${!label && 'mt-3'}
                    `}
                    autoComplete="off"
                />

                {/* Right Side Icons */}
                <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2
                    ${label ? 'mt-0' : 'mt-1.5'}`}
                >
                    {/* Validation Icons */}
                    {(touched || forceShowError) && !isValidating && (
                        <>
                            {showError && <AlertCircle className="w-5 h-5 text-red-500" />}
                            {showSuccess && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </>
                    )}

                    {/* Clear Button */}
                    {clearable && userInput && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            tabIndex={-1}
                            aria-label="Clear captcha"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Helper Text or Error Message */}
            {(helperText || showError) && (
                <div className="mt-1 text-sm">
                    {showError ? (
                        <p className="text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </p>
                    ) : (
                        helperText && <p className="text-gray-500">{helperText}</p>
                    )}
                </div>
            )}
        </div>
    );
});

Captcha.displayName = 'Captcha';

export default Captcha;