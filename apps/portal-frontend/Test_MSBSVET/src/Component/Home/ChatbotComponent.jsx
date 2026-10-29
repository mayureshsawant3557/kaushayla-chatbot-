import { useState, useEffect, useContext } from 'react';
import { Send, X, Bot } from 'lucide-react';
import { ThemeContext } from "../Context/ThemeContext";
//import { rotating_gear2 } from "../../assets/rotating_gear2.gif"

const Chatbot = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAttention, setShowAttention] = useState(false);
    const { color } = useContext(ThemeContext);

    // Show greeting message when chat is opened
    useEffect(() => {
        if (isChatOpen && messages.length === 0) {
            // Add greeting message only if there are no messages yet
            const greetingMessage = {
                id: Date.now(),
                text: "Hello! 👋 Welcome to the MSBSVET assistance portal. How can I help you today?",
                sender: 'bot',
                isFormatted: true
            };
            setMessages([greetingMessage]);
        }
    }, [isChatOpen, messages.length]);

    // Auto-scroll to bottom of messages when new messages arrive
    useEffect(() => {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, [messages]);

    // Attention popup timer
    useEffect(() => {
        // Show attention message every 30 seconds if chat is not open
        const attentionTimer = setInterval(() => {
            if (!isChatOpen) {
                setShowAttention(true);
                // Hide after 2 seconds
                setTimeout(() => {
                    setShowAttention(false);
                }, 2000);
            }
        }, 30000);

        // Initial trigger after page load (wait 5 seconds)
        const initialTimer = setTimeout(() => {
            if (!isChatOpen) {
                setShowAttention(true);
                setTimeout(() => {
                    setShowAttention(false);
                }, 2000);
            }
        }, 5000);

        return () => {
            clearInterval(attentionTimer);
            clearTimeout(initialTimer);
        };
    }, [isChatOpen]);

    // Attention-grabbing animation logic
    const getAnimationClasses = () => {
        if (!isAnimating) return '';
        return 'animate-bounce transform transition-all duration-300 scale-110';
    };

    const fetchBotResponse = async (question) => {
        setIsLoading(true);
        try {
            const response = await fetch('https://msbsvet-chatbot.vercel.app/api/chatbot/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.answer;
        } catch (error) {
            return "Sorry, I'm having trouble connecting right now. Please try again later.";
        } finally {
            setIsLoading(false);
        }
    };

    // Format response text with proper line breaks and styling
    const formatResponseText = (text) => {
        // Split by line breaks and convert to array
        const lines = text.split('\n');

        // Return formatted JSX with proper breaks
        return (
            <div>
                {lines.map((line, index) => (
                    <div key={index}>
                        {line.trim() === '' ? <br /> : line}
                    </div>
                ))}
            </div>
        );
    };

    const handleSendMessage = async () => {
        if (inputMessage.trim()) {
            const userMessage = {
                id: Date.now(),
                text: inputMessage,
                sender: 'user'
            };

            // Add user message to the chat
            setMessages(prevMessages => [...prevMessages, userMessage]);

            // Clear input field immediately for better UX
            const questionText = inputMessage;
            setInputMessage('');

            // Fetch response from API
            const botResponseText = await fetchBotResponse(questionText);

            // Add bot response to the chat
            const botResponse = {
                id: Date.now() + 1,
                text: botResponseText,
                sender: 'bot',
                isFormatted: true // Flag to indicate this message needs formatting
            };

            setMessages(prevMessages => [...prevMessages, botResponse]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Attention grabber popup */}
            {/*{showAttention && (*/}
            {/*    <div className="absolute bottom-16 right-0 bg-white px-3 py-2 rounded-lg shadow-lg animate-bounce">*/}
            {/*        <div className="relative">*/}
            {/*            <div className="absolute -bottom-4 right-6 w-3 h-3 bg-white transform rotate-45"></div>*/}
            {/*            <p className={`text-lg font-large ${color.replace('bg-', 'text-')}`}>Ask me!</p>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}

            {/* Chatbot Icon with rotating gear GIF */}
            <button
                onClick={() => {
                    setIsChatOpen(!isChatOpen);
                    setIsAnimating(false);
                    setShowAttention(false);
                }}
                className={`rounded-full  
                    hover:opacity-90 transition-all 
                    ${getAnimationClasses()} 
                    ${isAnimating ? 'animate-pulse' : ''}`}
                style={{
                    width: '90px',
                    height: '90px',
                    padding: '0',
                    overflow: 'hidden'
                }}
            >
                {/* Using rotating_gear.gif image */}
                <img
                    src="/react/rotating_gear2.gif"  // imported from public folder   
                    alt="Chatbot"
                    className="w-full h-full object-cover"
                />
            </button>

            {/* Chat Popup with Slide-in Animation and Custom Background - Medium size */}
            {isChatOpen && (
                <div className={`
                    absolute bottom-20 right-0 w-96 mt-10
                    bg-white rounded-xl shadow-2xl border
                    transform transition-all duration-300
                    ${isAnimating ? 'animate-slide-in-right' : ''}
                `}>
                    {/* Chat Header without background image */}
                    <div
                        className={`${color} text-white p-3 rounded-t-xl flex justify-between items-center`}
                    >
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold">KAUSHALYA</h3>
                            <Bot size={20} className="text-white opacity-100" />
                        </div>
                        <button
                            onClick={() => {
                                setIsChatOpen(false);
                                setIsAnimating(false);
                            }}
                            className="text-white hover:bg-black hover:bg-opacity-20 rounded-full p-1"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Container with Custom Background - Medium height */}
                    <div
                        className="h-80 overflow-y-auto p-3 space-y-2"
                        id="chat-messages"
                        style={{
                            backgroundImage: ' ',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundAttachment: 'scroll',
                            backgroundBlendMode: 'overlay',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }}
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`p-2 rounded-lg max-w-[80%] ${msg.sender === 'user'
                                        ? 'bg-blue-100 text-blue-800 bg-opacity-90'
                                        : 'bg-white text-gray-800 bg-opacity-90 border border-gray-200'
                                        }`}
                                >
                                    {msg.isFormatted ? formatResponseText(msg.text) : msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white bg-opacity-90 text-gray-800 p-2 rounded-lg border border-gray-200">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Message Input - Medium padding */}
                    <div className="p-3 border-t flex items-center space-x-2 bg-white">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-grow p-2 border rounded"
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            className={`${color} text-white p-2 rounded hover:opacity-90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;