// components/dashboard/UserInfoSection.jsx
import React from 'react';

const UserInfoRow = ({ headingText, valueText }) => (
    <div className="rounded-lg p-0">
        <span className="inline-block min-w-[30%] bg-blue-100 border border-blue-100 rounded-lg p-2 text-right font-medium text-base">
            {headingText}
        </span>
        <span className="ps-2 text-base font-semibold">
            {valueText}
        </span>
    </div>
);

const UserInfoSection = ({ userInfo }) => {
    return (
        <div className="bg-white rounded-lg shadow mb-6">
            <fieldset className="border border-gray-200 rounded-lg">
                <legend className="text-center px-4 text-xl font-semibold mx-auto">
                    {userInfo.welcomeMessage || 'Welcome'}
                </legend>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <UserInfoRow
                            headingText="User Login ID:"
                            valueText={userInfo.loginId || ''}
                        />
                        <UserInfoRow
                            headingText="IP Address:"
                            valueText={userInfo.IPAddress || ''}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <UserInfoRow
                            headingText="User Type:"
                            valueText={userInfo.userType || ''}
                        />
                        <UserInfoRow
                            headingText="Current Login Date Time:"
                            valueText={userInfo.currentLoginDateTime || ''}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <UserInfoRow
                            headingText="User Name:"
                            valueText={userInfo.userName || ''}
                        />
                        <UserInfoRow
                            headingText="Last Login Date Time:"
                            valueText={userInfo.lastLoginDateTime || ''}
                        />
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default UserInfoSection;