import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import agent from "../../../lib/api/agent";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import { ThemeContext } from "../../Context/ThemeContext";
import { useAuth } from "../../../Hooks/AuthContext";
// import { userDetailsAPI, updateUserProfileAPI } from "../../../Endpoints_All/Account/userManagement";

const EditUserProfile = () => {
    const [formData, setFormData] = useState({
        userName: "",
        userMobileNo: "",
        userEMailID: "",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [ipAddress, setIpAddress] = useState("");
    const { color } = useContext(ThemeContext);
    const [message, setMessage] = useState({
        type: '',
        text: ''
    });
    const { userInfo } = useAuth();


    // Load User Details
    useEffect(() => {
        fetchUserDetails();
        fetchIP();
    }, []);
    const fetchIP = async () => {
        try {
            const response = await agent.get(getIp, {
                headers: {
                    'accept': '*/*'
                }
            });

            if (response.data?.ip) {
                setIpAddress(response.data.ip);
            } else {
                setIpAddress("0.0.0.0");
            }
        } catch (error) {
            console.error('Error fetching IP:', error);
            setIpAddress("0.0.0.0");
        }
    };
    const fetchUserDetails = async () => {
        try {
            const response = await agent.get(
                `/api/UserManagement/GetUserDetails/${userInfo?.UserID}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const user = response.data;

            if (user) {
                setFormData({
                    userName: user.UserName || "",
                    userMobileNo: user.UserMobileNo || "",
                    userEMailID: user.UserEMailID || "",
                });
            }
        } catch (error) {
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load user details",
            });
        }
    };

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;

        // User Name Validation
        if (name === "userName") {
            const regex = /^[A-Za-z\s']*$/;
            if (!regex.test(value)) return;
        }

        // Mobile Validation
        if (name === "userMobileNo") {
            const regex = /^[0-9]*$/;
            if (!regex.test(value) || value.length > 10) return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "userName"
                    ? value.toUpperCase()
                    : name === "userEMailID"
                        ? value.toLowerCase()
                        : value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };



    // Form Validation
    const validateForm = () => {
        let newErrors = {};

        if (!formData.userName.trim()) {
            newErrors.userName = "Please Enter User Name";
        }

        if (!formData.userMobileNo.trim()) {
            newErrors.userMobileNo = "Please Enter Mobile Number";
        } else if (!/^[6-9]\d{9}$/.test(formData.userMobileNo)) {
            newErrors.userMobileNo =
                "Mobile Number should be proper and of 10 digits";
        }

        if (!formData.userEMailID.trim()) {
            newErrors.userEMailID = "Please Enter Email ID";
        } else if (
            !/^\w+([-.+']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(
                formData.userEMailID
            )
        ) {
            newErrors.userEMailID = "Please Enter Valid Email ID";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Save Profile
    const handleSave = async () => {
        if (!validateForm()) return;

        const result = await Swal.fire({
            title: "Update Profile",
            text: "Are you sure you want to update profile?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Update",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);

            const requestBody = {
                UserID: userInfo?.UserID,
                UserTypeID: userInfo?.UserTypeID,

                UserName: formData.userName,
                UserMobileNo: formData.userMobileNo,
                UserEMailID: formData.userEMailID,

                UserLoginID: userInfo?.UserLoginID,
                UserPassword: userInfo?.UserPassword || "",

                UserType: userInfo?.UserType || "",

                IsActive: true,
                ActivOrDeactive: "A",

                ModifiedBy: userInfo?.UserLoginID,
                ModifiedByIPAddress: ipAddress,
            };

            const response = await agent.put(
                `/api/UserManagement/EditUser`,
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setMessage({
                type: 'success',
                text: 'Profile updated successfully!'
            });
        } catch (error) {
            console.error(error);

            setMessage({
                type: 'error',
                text:
                    error.response?.data ||
                    "Failed to update profile"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <fieldset className='mb-4 rounded-md border p-4'>
                    <legend
                        className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-4 py-1.5 rounded-md ml-4`}
                    >
                        <span>Update Profile</span>

                    </legend>

                    {/* Form */}
                    <div className="p-6">
                        {message.text && (
                            <div
                                className={`mb-4 p-4 rounded-md ${message.type === 'success'
                                        ? 'bg-green-50 border border-green-200 text-green-700'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* User Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User Name <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleChange}
                                    maxLength={150}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.userName
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        }`}
                                    placeholder="Enter User Name"
                                />

                                {errors.userName && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.userName}
                                    </p>
                                )}
                            </div>

                            {/* Mobile */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User Mobile Number <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="userMobileNo"
                                    value={formData.userMobileNo}
                                    onChange={handleChange}
                                    maxLength={10}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.userMobileNo
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        }`}
                                    placeholder="Enter Mobile Number"
                                />

                                {errors.userMobileNo && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.userMobileNo}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User E-Mail ID <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="email"
                                    name="userEMailID"
                                    value={formData.userEMailID}
                                    onChange={handleChange}
                                    maxLength={100}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.userEMailID
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        }`}
                                    placeholder="Enter Email ID"
                                />

                                {errors.userEMailID && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.userEMailID}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`px-8 py-2 rounded-md text-white font-medium transition duration-200 ${loading
                                    ? "bg-green-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                                    }`}
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>

                </fieldset>


            </div>
        </div>
    );
};

export default EditUserProfile;