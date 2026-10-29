import React, { useState, useEffect, useContext } from 'react';
import agent from '../../../lib/api/agent';
import {
    getSecurityQuestion,
    loadSecurityQuestion,
    resetSecurityQuestion
} from '../../../Endpoints_All/Account/securityQuestions';
import { useLoading } from "../../../Hooks/useLoading";
import publicAgent from '../../../lib/api/publicAgent';
import { ThemeContext } from '../../Context/ThemeContext';
import { getDeviceIP } from '../../../utils/CommonHelper';
import { useAuth } from '../../../Hooks/AuthContext';

const ChangeSecurityQuestion = () => {
    const [securityQuestionId, setSecurityQuestionId] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [securityQuestions, setSecurityQuestions] = useState([]);
    // const [loading, setLoading] = useState(false);
   const { userInfo } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { color } = useContext(ThemeContext);
    const [ipAddress, setIpAddress] = useState("");


    const { startLoading, stopLoading, isLoading } = useLoading();

    useEffect (() =>{
        fetchIP();
      
    },[]);

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        }; 
    // Get user info from session storage
    useEffect(() => {
         if (!userInfo) {
        setError('User information not found. Please login again.');
        return;
    }

    loadSecurityQuestions().then(() => {
        loadUserSecurityQuestion(userInfo.UserID);
    });
}, []);

    const loadSecurityQuestions = async () => {
        try {
            startLoading();
            const response = await publicAgent.get(getSecurityQuestion, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            

            setSecurityQuestions(response.data);
        } catch (err) {
            setError('Failed to load security questions: ' + err.message);
        } finally {
            // setLoading(false);
            stopLoading();
        }
    };

    const loadUserSecurityQuestion = async (userId) => {
        try {
            const response = await agent.get(`${loadSecurityQuestion}/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // API returns array with SecurityQuestionID and SecurityQuestionAnswer
            if (response.data && response.data.length > 0) {
                const userSecurityQuestionId = response.data[0].SecurityQuestionID;
                const userSecurityAnswer = response.data[0].SecurityQuestionAnswer || '';

                // Set the security question ID and answer
                setSecurityQuestionId(userSecurityQuestionId.toString());
                setSecurityAnswer(userSecurityAnswer);
            }
        } catch (err) {
            // If no security question exists for user, that's okay - they can set one
        }
    };

    const handleSubmit = async () => {

        if (!securityQuestionId || !securityAnswer.trim()) {
            setError('Please select a security question and provide an answer');
            return;
        }

        if (!userInfo) {
            setError('User information not available');
            return;
        }

        try {
            startLoading();
            // setLoading(true);
            setError('');
            setSuccess('');

          
            const requestBody = {
                UserID: userInfo.UserID,
                SecurityQuestionID: parseInt(securityQuestionId),
                SecurityQuestionAnswer: securityAnswer,
                UserLoginID: userInfo.UserLoginID,
                IPAddress: ipAddress
            };

            const response = await agent.post(resetSecurityQuestion, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                }

            }, setSuccess('Security question updated successfully!')
            );


            // Optionally reload the security question to show updated data
            loadUserSecurityQuestion(userInfo.UserID);

        } catch (err) {
            setError('Failed to update security question: ' + err.message);
            stopLoading();
        } finally {
            // setLoading(false);
            stopLoading();
        }
    };

    if (isLoading && securityQuestions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-pulse text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <fieldset className='mb-4 rounded-md border p-4'>
                    <legend
                        className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-5 py-1.5 rounded-md ml-4`}
                    >
                        <span>Change Security Question</span>
                    </legend>
                    {/* Content */}
                    <div className="p-6">


                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-green-700 text-sm">{success}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Security Question Dropdown */}
                            <div>
                                <label
                                    htmlFor="securityQuestion"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Security Question <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="securityQuestion"
                                    value={securityQuestionId}
                                    onChange={(e) => setSecurityQuestionId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a security question</option>
                                    {securityQuestions.map((question) => (
                                        <option key={question.Id} value={question.Id}>
                                            {question.Question || `Question ${question.Id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Security Answer */}
                            <div>
                                <label
                                    htmlFor="securityAnswer"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Security Question's Answer <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="securityAnswer"
                                    value={securityAnswer}
                                    onChange={(e) => setSecurityAnswer(e.target.value.toUpperCase())}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your answer"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-8 rounded-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </span>
                                    ) : (
                                        'Change Security Question'
                                    )}
                                </button>
                            </div>
                        </div>


                    </div>
                </fieldset>



            </div>
        </div>
    );
};

export default ChangeSecurityQuestion;



