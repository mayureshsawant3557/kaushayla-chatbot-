import { useState, useEffect, useContext } from 'react';
import agent from '../../../lib/api/agent';
import Swal from 'sweetalert2';
import {
    userDetailsAPI,
} from '../../../Endpoints_All/Account/userManagement';
import { checkOldPasswordAPI, updatePasswordAPI } from '../../../Endpoints_All/Account/authentication';
import { ThemeContext } from '../../Context/ThemeContext';
import { getDeviceIP } from '../../../utils/CommonHelper';
import { useAuth } from '../../../Hooks/AuthContext';
const ChangePasswordForm = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
   const [userDetails, setUserDetails] = useState({
    profileId: '',
    userName: ''
});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingUserDetails, setLoadingUserDetails] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [ipAddress, setIpAddress] = useState("");
    const { color } = useContext(ThemeContext);
      const {userInfo} = useAuth();
    // const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [oldPasswordValidation, setOldPasswordValidation] = useState({
        isChecking: false,
        isValid: null // null = not checked, true = valid, false = invalid
    });


    useEffect (() => {
        fetchIP();
       
    },[]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setLoadingUserDetails(true);
               
                const userTypeID = userInfo.UserTypeID;
                const userLoginID = userInfo.UserLoginID;
                const userID = userInfo.UserID;

                if (!userTypeID || !userLoginID) {
                    setMessage({ type: 'error', text: 'User session not found. Please login again.' });
                    setLoadingUserDetails(false);
                    return;
                }

                // Fetch user details from API
                const response = await agent.get(`${userDetailsAPI}?userTypeId=${userTypeID}&userLoginId=${userLoginID}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const userDetailsArray = response.data;
                const userDetails = userDetailsArray[0]; // API returns an array, take first item

               if (userDetails) {
    setUserDetails({
        profileId: userDetails.UserLoginID,
        userName: userDetails.UserName
    });
} else {
                    setMessage({ type: 'error', text: 'User details not found.' });
                }

            } catch (error) {
                console.error('Error fetching user details:', error);
                setMessage({ type: 'error', text: 'Failed to load user details. Please try again.' });
            } finally {
                setLoadingUserDetails(false);
            }
        };

        fetchUserDetails();
    }, []);

    const validatePassword = (password) => {
        const minLength = 8;
        const maxLength = 15;
        const hasCapital = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength || password.length > maxLength) {
            return `Password must be between ${minLength} and ${maxLength} characters`;
        }
        if (!hasCapital) {
            return 'Password must contain at least 1 capital letter';
        }
        if (!hasNumber) {
            return 'Password must contain at least 1 number';
        }
        if (!hasSpecial) {
            return 'Password must contain at least 1 special character';
        }
        return '';
    };

    // Function to hash password
    const passwordToHash = (str) => {
        try {
            return btoa(str);
        } catch (error) {
            console.error("Password validation error:", error);
            return btoa(unescape(encodeURIComponent(str)));
        }
    };
    const handleChangePasswordClick = async () => {
        if (!validateForm()) {
            return;
        }

        // Additional check for old password validation status
        if (
            formData.oldPassword.length >= 8 &&
            oldPasswordValidation.isValid !== true
        ) {
            setErrors(prev => ({
                ...prev,
                oldPassword:
                    'Please wait for old password validation or enter correct password'
            }));
            return;
        }

        const result = await Swal.fire({
            title: 'Change Password',
            html: `
            <div style="font-size:16px;">
                <p style="margin-bottom:10px;color:#dc3545;font-weight:600;">
                    After password change, you will be logged out.
                </p>
                <p style="margin-bottom:20px;color:#dc3545;">
                    You have to re-login again.
                </p>
                <p>
                    Are you sure you want to change your password?
                </p>
            </div>
        `,
            icon: 'warning',
            showCancelButton: true,
          confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Change Password',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            focusCancel: true,
            width: '500px'
        });

        if (result.isConfirmed) {
            handleConfirmChange();
        }
    };

    const checkOldPassword = async (userId, oldPassword) => {
        try {
            const response = await agent.get(checkOldPasswordAPI, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const storedPassword = response.data;

            // Handle different response types
            let storedPasswordString = '';
            if (typeof storedPassword === 'string') {
                storedPasswordString = storedPassword.replace(/"/g, '');
            } else if (typeof storedPassword === 'object' && storedPassword !== null) {
                // If it's an object, try to extract the password field
                storedPasswordString = storedPassword.password || storedPassword.Password || JSON.stringify(storedPassword).replace(/"/g, '');
            } else {
                storedPasswordString = String(storedPassword).replace(/"/g, '');
            }

            const hashedOldPassword = passwordToHash(oldPassword);
            return storedPasswordString === hashedOldPassword;
        } catch (error) {
            console.error('Error checking old password:', error);
            throw error;
        }
    };

    // Real-time old password validation
    const validateOldPasswordRealTime = async (password) => {
        // Only validate if password has 8 or more characters
        if (!password || password.length < 8 || !userInfo.UserID) {
            setOldPasswordValidation({ isChecking: false, isValid: null });
            return;
        }

        setOldPasswordValidation({ isChecking: true, isValid: null });

        try {
            const isValid = await checkOldPassword(userInfo.UserID, password);
            setOldPasswordValidation({ isChecking: false, isValid });

            if (!isValid) {
                setErrors(prev => ({
                    ...prev,
                    oldPassword: 'Old password is incorrect'
                }));
            } else {
                // Clear old password error if it was valid
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.oldPassword;
                    return newErrors;
                });
            }
        } catch (error) {
            setOldPasswordValidation({ isChecking: false, isValid: false });
            setErrors(prev => ({
                ...prev,
                oldPassword: 'Error validating password'
            }));
        }
    };

    // Debounce function for old password validation
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Only validate if password has 8 or more characters
            if (formData.oldPassword && formData.oldPassword.length >= 8) {
                validateOldPasswordRealTime(formData.oldPassword);
            }
        }, 1000); // Wait 1 second after user stops typing

        return () => clearTimeout(timeoutId);
    }, [formData.oldPassword, userInfo.UserID]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear specific error when user starts typing (except for old password real-time validation)
        if (errors[name] && name !== 'oldPassword') {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Reset old password validation when user changes old password
        if (name === 'oldPassword') {
            // Reset validation state
            setOldPasswordValidation({ isChecking: false, isValid: null });

            // Clear old password error only if the new value has less than 8 characters
            // This prevents clearing the error when user is still typing a long password
            if (value.length < 8 && errors.oldPassword) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.oldPassword;
                    return newErrors;
                });
            }
        }

        // Clear message when user starts typing
        if (message.text) {
            setMessage({ type: '', text: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.oldPassword) {
            newErrors.oldPassword = 'Old password is required';
        } else if (formData.oldPassword.length < 8) {
            newErrors.oldPassword = 'Please enter at least 8 characters to validate old password';
        } else if (oldPasswordValidation.isValid === false) {
            newErrors.oldPassword = 'Old password is incorrect';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else {
            const passwordError = validatePassword(formData.newPassword);
            if (passwordError) {
                newErrors.newPassword = passwordError;
            }
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (formData.oldPassword === formData.newPassword && formData.oldPassword) {
            newErrors.newPassword = 'New password must be different from old password';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // // Handle the initial "Change Password" button click
    // const handleChangePasswordClick = () => {
    //     if (!validateForm()) {
    //         return;
    //     }

    //     // Additional check for old password validation status
    //     if (formData.oldPassword.length >= 8 && oldPasswordValidation.isValid !== true) {
    //         setErrors(prev => ({
    //             ...prev,
    //             oldPassword: 'Please wait for old password validation or enter correct password'
    //         }));
    //         return;
    //     }

    //     setShowConfirmDialog(true);
    // };

    // Handle cancel in confirmation dialog
    const handleCancelChange = () => {
        // setShowConfirmDialog(false);
    };

    // Handle confirm in confirmation dialog - this actually submits the form
    // Improved updatePassword function with better error handling
    const updatePassword = async (userData) => {
        try {

            const response = await agent.post(updatePasswordAPI, userData, {
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if your API requires it
                    // 'Authorization': `Bearer ${token}`,
                },
                timeout: 10000, // 10 second timeout
            });

            return response.data;
        } catch (error) {
            console.error('Error updating password:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });

            // Re-throw with more specific error information
            if (error.response) {
                // Server responded with error status
                throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                // Request was made but no response received
                throw new Error('Network error: No response from server');
            } else {
                // Something else happened
                throw new Error(`Request error: ${error.message}`);
            }
        }
    };

    // Improved handleConfirmChange function
    const handleConfirmChange = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate required data before making the request
            if (!userInfo?.UserID || !userInfo?.UserLoginID) {
                throw new Error('Missing user information. Please log in again.');
            }

            if (!formData.newPassword) {
                throw new Error('New password is required.');
            }

            // Step 1: Update password (old password already validated)
            const updateData = {
                UserID: userInfo.UserID,
                UserPassword: passwordToHash(formData.newPassword), // Hash the new password before sending
                UserLoginID: userInfo.UserLoginID,
                IPAddress: ipAddress
            };

            // Validate hashed password
            if (!updateData.UserPassword) {
                throw new Error('Password hashing failed.');
            }

            const result = await updatePassword(updateData);

            // Check if the API returned a success indicator
            if (
                result &&
                result.error &&
                !result.error.toLowerCase().includes("success")
            ) {
                throw new Error(result.message || result.error || 'Password update failed');
            }

            setMessage({
                type: 'success',
                text: 'Password changed successfully! You will be logged out shortly.'
            });

            // Clear form data
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setOldPasswordValidation({ isChecking: false, isValid: null });
            // setShowConfirmDialog(false);

            // Auto-logout after 3 seconds
            setTimeout(() => {
                sessionStorage.clear();
                localStorage.clear(); // Also clear localStorage if used
                window.location.href = '/React/Public/Home';
            }, 3000);

        } catch (error) {
            console.error('Password change failed:', error);

            // Provide more specific error messages
            let errorMessage = 'Failed to change password. Please try again.';

            if (error.message.includes('Network error')) {
                errorMessage = 'Network connection failed. Please check your connection and try again.';
            } else if (error.message.includes('Server error: 401')) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (error.message.includes('Server error: 400')) {
                errorMessage = 'Invalid password data. Please check your input.';
            } else if (error.message.includes('Server error: 500')) {
                errorMessage = 'Server error occurred. Please try again later.';
            } else if (error.message.includes('Missing user information')) {
                errorMessage = 'Session expired. Please log in again.';
                // Redirect to login immediately
                setTimeout(() => {
                    sessionStorage.clear();
                    localStorage.clear();
                    window.location.href = '/';
                }, 2000);
            }

            setMessage({ type: 'error', text: errorMessage });
            // setShowConfirmDialog(false);
        } finally {
            setLoading(false);
        }
    };

     const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };



    // Get border color class for old password input
    const getOldPasswordBorderClass = () => {
        if (oldPasswordValidation.isChecking) {
            return 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500';
        }
        if (oldPasswordValidation.isValid === true) {
            return 'border-green-500 focus:ring-green-500 focus:border-green-500';
        }
        if (oldPasswordValidation.isValid === false || errors.oldPassword) {
            return 'border-red-500 focus:ring-red-500 focus:border-red-500';
        }
        return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    };

    // Check if old password should show validation indicators
    const shouldShowValidationIndicator = () => {
        return formData.oldPassword.length >= 8;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                
                      <fieldset className='mb-4 rounded-md border p-4'>
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-5 py-1.5 rounded-md ml-4`}
                >
                    <span>Change Password</span>
                </legend>
                 <div className="p-6">
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                            <p className="text-red-700 text-sm">
                                <strong>Note:</strong> Password should have <strong>minimum 8 characters</strong> and <strong>maximum of 15 characters</strong> with <strong>1 Capital Alphabet</strong>, <strong>1 Number</strong> and <strong>1 Special Character</strong>.
                            </p>
                        </div>

                        {message.text && (
                            <div className={`mb-4 p-4 rounded-md ${message.type === 'success'
                                ? 'bg-green-50 border border-green-200 text-green-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {loadingUserDetails ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="text-gray-600">Loading user details...</div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Profile ID <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={userDetails.profileId}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            User Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={userDetails.userName}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Old Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                name="oldPassword"
                                                value={formData.oldPassword}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getOldPasswordBorderClass()}`}
                                                placeholder="Enter old password"
                                            />
                                            {shouldShowValidationIndicator() && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                    {oldPasswordValidation.isChecking && (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                                                    )}
                                                    {oldPasswordValidation.isValid === true && (
                                                        <div className="text-green-500">✓</div>
                                                    )}
                                                    {oldPasswordValidation.isValid === false && (
                                                        <div className="text-red-500">✗</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {errors.oldPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.oldPassword}</p>
                                        )}
                                        {oldPasswordValidation.isValid === true && !errors.oldPassword && (
                                            <p className="mt-1 text-sm text-green-600">Old password verified ✓</p>
                                        )}
                                        {formData.oldPassword.length > 0 && formData.oldPassword.length < 8 && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                Enter at least 8 characters to validate ({formData.oldPassword.length}/8)
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter new password"
                                        />
                                        {errors.newPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Confirm new password"
                                        />
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={handleChangePasswordClick}
                                        disabled={loading || oldPasswordValidation.isChecking || (formData.oldPassword.length >= 8 && oldPasswordValidation.isValid !== true)}
                                        className={`px-8 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${(loading || oldPasswordValidation.isChecking || (formData.oldPassword.length >= 8 && oldPasswordValidation.isValid !== true)) ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {loading ? 'Changing Password...' : 'Change Password'}
                                    </button>
                                </div>

                                {/* Confirmation Dialog
                                {showConfirmDialog && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
                                            <div className="bg-PINK-800 text-white px-6 py-4 rounded-t-lg">
                                                <h2 className="text-lg font-semibold">Change Password</h2>
                                            </div>

                                            <div className="p-6">
                                                <div className="text-red-600 mb-4">
                                                    <p className="font-medium">After password change, you will be logged out. You have to re-login again.</p>
                                                </div>

                                                <div className="text-red-600 mb-6">
                                                    <p>Are you sure, you want to change your password?</p>
                                                </div>

                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={handleCancelChange}
                                                        disabled={loading}
                                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors flex items-center"
                                                    >
                                                        <span className="mr-1">✕</span>
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleConfirmChange}
                                                        disabled={loading}
                                                        className={`px-4 py-2 bg-blue-200 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                    >
                                                        <span className="mr-1">✓</span>
                                                        {loading ? 'Confirming...' : 'Confirm'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        )}
                    </div>
                </fieldset>


                   
               
            </div>
        </div>
    );
};

export default ChangePasswordForm;


