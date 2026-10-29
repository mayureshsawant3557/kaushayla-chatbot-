import React, {useContext}from 'react';
import { useLocation } from "react-router-dom";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { ThemeContext } from './Context/ThemeContext';
const AfterRegister = () => {
    const location = useLocation();
    const profileId = location.state?.profileId;
    const { color } = useContext(ThemeContext);

    return (
        <div className={`mx-auto w-full rounded-lg bg-white p-6  shadow-md`}>
            <fieldset className="mb-4 rounded-md border p-4">
                <legend className={`flex items-center gap-2 rounded-md border border-gray-400 ${color} px-4 py-2 text-lg font-semibold text-white`}>
                    <AiOutlineCheckCircle className="text-xl" /> USER LOGIN DETAILS
                </legend>

                <div className="mt-4">
                    <ol className="list-decimal pl-6 space-y-6 text-lg leading-relaxed">
                        <li>
                            Your Profile ID is{' '}
                            <span className="text-red-600 font-bold text-xl">
                                {profileId || 'null'}
                            </span>
                            . This Profile ID shall be used as User Name to login to your account.
                        </li>
                        <li>
                            Login to your account and complete your profile.
                        </li>
                        <li>
                            All Information and OTP (One Time Password) shall be sent through SMS on Primary Mobile Number hence Primary Mobile Number should be updated.
                        </li>
                    </ol>

                    {/* Login Button */}
                    <div className="flex justify-center mt-8">
                        <a
                            href="/React/Public/Home"
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-md text-lg transition-colors duration-200 shadow-md"
                        >
                            Proceed to Login &gt;&gt;&gt;
                        </a>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default AfterRegister;
