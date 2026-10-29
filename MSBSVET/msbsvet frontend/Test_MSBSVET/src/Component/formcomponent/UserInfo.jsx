import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import agent from '../../lib/api/agent';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { useNavigate } from "react-router-dom";
import FormComponent from "./FormComponent"; // Assuming FormComponent is in the same folder
import DropdownComponent from './DropdownComponent';
import { send_otp, verify_otp } from '../../Endpoints_All/OTP/otp';

// to pass option for dropdown component
const stateOptions = [
    { label: "Maharashtra", value: "Maharashtra" },
    { label: "Karnataka", value: "Karnataka" },
    { label: "Gujarat", value: "Gujarat" },
];

const districtOptions = [
    { label: "Pune", value: "Pune" },
    { label: "Mumbai", value: "Mumbai" },
    { label: "Nagpur", value: "Nagpur" },
];

const talukaOptions = [
    { label: "Haveli", value: "Haveli" },
    { label: "Mulshi", value: "Mulshi" },
    { label: "Maval", value: "Maval" },
];

const cityOptions = [
    { label: "Pune City", value: "Pune City" },
    { label: "Lonavala", value: "Lonavala" },
    { label: "Alandi", value: "Alandi" },
];

const UserInfo = forwardRef((props, ref) => {
    const [isValid, setIsValid] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [userData, setUserData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        primaryNumber: '',
        secondaryNumber: '',
        address: '',
        pinCode: '',
        //state: '',
        //district: '',
        //taluka: '',
        //city: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useImperativeHandle(ref, () => ({
        validateUserInfo: () => {
            const isFormValid = validate();
            setIsValid(isFormValid);
            return isFormValid;
        }
    }));

    useEffect(() => {
        navigate("/register-complaint", { state: userData });
    }, [userData, navigate]);

    const handleInputChange = (field, value) => {
        setUserData(prevState => ({ ...prevState, [field]: value }));
    };

    const handleVerifyClick = async () => {
        if (!userData.primaryNumber || userData.primaryNumber.length !== 10) {
            setErrors(prevErrors => ({
                ...prevErrors, // Keep existing errors for other fields
                primaryNumber: "Please enter a valid 10-digit mobile number."
            }));
            return;
        }

        // Remove only the primary number error, keeping others unchanged
        setErrors(prevErrors => {
            const updatedErrors = { ...prevErrors };
            delete updatedErrors.primaryNumber; // Remove error for primary number only
            return updatedErrors;
        });

        try {
            const response = await agent.post(send_otp, {
                mobileNumber: userData.primaryNumber,
            });
            const otp = response.data.otp;

            Swal.fire({
                title: "OTP Sent",
                html: `
                <p>OTP: <strong>${otp}</strong></p>
                <p>OTP has been sent to ******${userData.primaryNumber.slice(-4)}.</p>
                <input type="text" id="otp-input" class="swal2-input" placeholder="Enter OTP" />
            `,
                showCancelButton: true,
                confirmButtonText: "Verify OTP",
                cancelButtonText: "Close",
                showDenyButton: true,
                denyButtonText: "Resend OTP",
                preConfirm: async () => {
                    const enteredOtp = document.getElementById("otp-input").value;
                    if (!enteredOtp) {
                        Swal.showValidationMessage("Please enter the OTP.");
                        return false;
                    }

                    try {
                        const verifyResponse = await agent.post(
                            verify_otp,
                            { mobileNumber: userData.primaryNumber, otp: enteredOtp }
                        );

                        if (verifyResponse.data.success) {
                            setIsVerified(true);
                            Swal.fire({
                                title: "Verified ✅",
                                text: "Your mobile number has been verified successfully!",
                                icon: "success",
                                timer: 2000,
                                showConfirmButton: false,
                            });
                            return true;
                        } else {
                            Swal.showValidationMessage(verifyResponse.data.message);
                            return false;
                        }
                    } catch (error) {
                        Swal.showValidationMessage("Invalid OTP or server error.");
                        return false;
                    }
                },
            }).then((result) => {
                if (result.isDenied) {
                    handleVerifyClick();
                }
            });
        } catch (error) {
            Swal.fire("Error", "Something went wrong, please try again!", "error");
        }
    };



    const validate = () => {
        const newErrors = {};
        ["firstName", "email", "primaryNumber", "address", "pinCode", "state", "district", "taluka", "city"].forEach(field => {
            if (!userData[field]) newErrors[field] = `${field} is required`;
        });

        if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            newErrors.email = 'Invalid email address';
        }
        if (userData.primaryNumber && !/^\d{10}$/.test(userData.primaryNumber)) {
            newErrors.primaryNumber = 'Invalid mobile number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return (
        <div >
            <div className="grid-cols-3 grid gap-4">
                <FormComponent label="First Name" required error={errors.firstName} value={userData.firstName} onChange={(value) => handleInputChange("firstName", value.toUpperCase())} />
                <FormComponent label="Middle Name" value={userData.middleName} onChange={(value) => handleInputChange("middleName", value.toUpperCase())} />
                <FormComponent label="Last Name" value={userData.lastName} onChange={(value) => handleInputChange("lastName", value.toUpperCase())} />
            </div>

            <div className="grid-cols-3 mt-4 grid gap-4">
                {/* ✅ E-Mail ID */}
                <FormComponent
                    label="E-Mail ID"
                    type="email"
                    required
                    error={errors.email}
                    value={userData.email}
                    onChange={(value) => handleInputChange("email", value)}
                />

                {/* ✅ Primary Mobile Number Field with Verify Button */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Primary Mobile Number <span className="text-lg text-red-500">*</span>
                        {errors.primaryNumber && (
                            <span className="ml-2 text-sm text-red-500">{errors.primaryNumber}</span>
                        )}
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="rounded-md border border-gray-300 bg-gray-100 p-2">+91</span>
                        <input
                            type="text"
                            value={userData.primaryNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                handleInputChange("primaryNumber", value);
                            }}
                            className={`w-full rounded-md p-2 border ${errors.primaryNumber ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Enter 10-digit number"
                            maxLength="10"
                            disabled={isVerified}
                        />
                        {isVerified ? (
                            <span className="flex items-center text-green-600">
                                Verified <AiOutlineCheckCircle className="ml-1 text-xl" />
                            </span>
                        ) : (
                            <button
                                className="rounded-md bg-red-500 px-3 py-2 text-white"
                                onClick={handleVerifyClick}
                            >
                                Verify
                            </button>
                        )}
                    </div>
                </div>

                {/* ✅ Secondary Mobile Number (Fixed width & consistency) */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Secondary Mobile Number
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="rounded-md border border-gray-300 bg-gray-100 p-2">+91</span>
                        <input
                            type="text"
                            value={userData.secondaryNumber}
                            onChange={(e) => {
                                const numericValue = e.target.value.replace(/\D/g, ''); // Only allow digits
                                handleInputChange("secondaryNumber", numericValue);
                            }}
                            className={`w-full rounded-md p-2 border ${errors.secondaryNumber ? "border-red-500" : "border-gray-300"}`}
                            placeholder="Enter 10-digit number"
                            maxLength="10"
                        />
                    </div>
                </div>
            </div>



            <div className="grid-cols-4 mt-4 grid gap-4">
                {/* Increase Address field width */}
                <div className="col-span-3">
                    <FormComponent
                        label="Address"
                        required
                        error={errors.address}
                        value={userData.address}
                        onChange={(value) => handleInputChange("address", value)}
                    />
                </div>
                <div className="col-span-1">
                    <FormComponent
                        label="Pin Code"
                        required
                        error={errors.pinCode}
                        value={userData.pinCode}
                        onChange={(value) => handleInputChange("pinCode", value)}
                    />
                </div>
            </div>


            <div className="grid-cols-4 mt-4 grid gap-4">
                <DropdownComponent
                    label="State"
                    options={stateOptions}
                    value={userData.state}
                    onChange={(value) => handleInputChange("state", value)}
                    error={errors.state}
                    required
                />

                <DropdownComponent
                    label="District"
                    options={districtOptions}
                    value={userData.district}
                    onChange={(value) => handleInputChange("district", value)}
                    error={errors.district}
                    required
                />

                <DropdownComponent
                    label="Taluka"
                    options={talukaOptions}
                    value={userData.taluka}
                    onChange={(value) => handleInputChange("taluka", value)}
                    error={errors.taluka}
                    required
                />

                <DropdownComponent
                    label="City / Village"
                    options={cityOptions}
                    value={userData.city}
                    onChange={(value) => handleInputChange("city", value)}
                    error={errors.city}
                    required
                />
            </div>
        </div>
    );
});

export default UserInfo;
