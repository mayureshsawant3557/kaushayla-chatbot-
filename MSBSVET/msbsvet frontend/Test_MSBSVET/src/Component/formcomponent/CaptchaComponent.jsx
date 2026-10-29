import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { RefreshCcw } from "lucide-react";

const CaptchaComponent = forwardRef(({ onVerify }, ref) => {
    const [captchaText, setCaptchaText] = useState("");
    const [userInput, setUserInput] = useState("");
    const [isValid, setIsValid] = useState(false);
    const canvasRef = useRef(null);

    // Expose validate method to parent component
    useImperativeHandle(ref, () => ({
        validate: () => {
            const isValid = userInput.toUpperCase() === captchaText;
            setIsValid(isValid);
            if (onVerify) onVerify(isValid);
            return isValid;
        },
        resetCaptcha: () => {
            refreshCaptcha();
        }
    }));

    // Function to generate a random CAPTCHA string
    const generateCaptcha = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    };

    // Function to draw CAPTCHA text on canvas
    const drawCaptcha = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add random lines for distortion
        for (let i = 0; i <70; i++) {
            ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }

        // Draw CAPTCHA text with slight rotation for security
        ctx.font = "normal 30px Arial";
        ctx.fillStyle = "#000";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        const x = canvas.width / 2;
        const y = canvas.height / 2 + 5;
        const angle = (Math.random() - 0.5) * 0.4;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Add character spacing for better readability
        const chars = captchaText.split(' ');
        let xOffset = -15 * (chars.length - 1) / 2;

        chars.forEach(char => {
            ctx.fillText(char, xOffset, 0);
            xOffset += 15;
        });

        ctx.restore();
    };

    // Generate new CAPTCHA on component mount
    useEffect(() => {
        refreshCaptcha();
    }, []);

    // Draw CAPTCHA whenever it updates
    useEffect(() => {
        if (captchaText) {
            drawCaptcha();
        }
    }, [captchaText]);

    const refreshCaptcha = () => {
        const newCaptcha = generateCaptcha();
        setCaptchaText(newCaptcha);
        setUserInput("");
        setIsValid(false);
        if (onVerify) onVerify(false);
    };

    const handleInputChange = (e) => {
        const { value } = e.target;
        const uppercasedValue = value.toUpperCase();
        setUserInput(uppercasedValue);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-3">
                <input
                    type="text"
                    placeholder="TYPE CAPTCHA CODE"
                    value={userInput}
                    onChange={handleInputChange}
                    className={`rounded-md border ${isValid ? 'border-green-500' : 'border-gray-300'} p-2`}
                />
                <canvas ref={canvasRef} width={150} height={50} className="rounded-md border border-gray-300" />
                <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="rounded-md bg-gray-200 p-2 hover:bg-gray-300"
                    aria-label="Refresh CAPTCHA"
                >
                    <RefreshCcw size={20} />
                </button>
            </div>
        </div>
    );
});

export default CaptchaComponent;