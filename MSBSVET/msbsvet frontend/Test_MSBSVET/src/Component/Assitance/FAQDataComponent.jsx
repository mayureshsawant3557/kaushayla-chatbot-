import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQData = [
    {
        id: 1,
        question: "How to reset my password?",
        answer: "1. Click on the 'Forgot Password' link on the login page.\n2. Enter your registered email or mobile number.\n3. You will receive a password reset link or OTP.\n4. Follow the instructions to create a new password."
    },
    {
        id: 2,
        question: "How do I register on the platform?",
        answer: "1. Go to the registration page.\n2. Enter your name, email, mobile number, and password.\n3. Verify your email/mobile using the OTP sent.\n4. Click on Register to complete the process."
    },
    {
        id: 3,
        question: "How can I file a complaint?",
        answer: "1. Log in to your account.\n2. Navigate to the 'Register Complaint' section.\n3. Fill in the required details (category, description, location, etc.).\n4. Submit the complaint and note down the Complaint ID for tracking."
    }
];

const FAQComponent = () => {
    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (id) => {
        setOpenFAQ(openFAQ === id ? null : id);
    };

    return (
        <div className="max-w-full mx-auto p-6 bg-white-50">
            <h2 className="px-5  text-2xl font-bold text-blue-600 mb-4">Most Frequently Asked Questions (FAQs)</h2>

            <div className="px-5 space-y-4">
                {FAQData.map((faq) => (
                    <div key={faq.id} className="border rounded-lg shadow-sm overflow-hidden">
                        <button
                            className="w-full text-Black text-lg text-left font-semibold p-4 flex justify-between items-center bg-gray-200"
                            onClick={() => toggleFAQ(faq.id)}
                        >
                            {faq.question}
                            {openFAQ === faq.id ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        {openFAQ === faq.id && (
                            <div className="p-4 whitespace-pre-line">{faq.answer}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQComponent;
