import React from 'react';
import { useLocation } from "react-router-dom";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useTranslation } from "react-i18next";

const PromotingOrganizationRegistrationShowInfo = () => {
    const location = useLocation();
    const profileId = location.state?.profileId;
    const { t } = useTranslation("promotorOrgRegistration");

    return (
        <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
            <fieldset className="mb-4 rounded-md border p-4">
                <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
                    <AiOutlineCheckCircle className="text-xl" /> {t("page.titleShowInfo")}
                </legend>

                <div className="mt-4">
                    <ol className="list-decimal pl-6 space-y-6 text-lg leading-relaxed">
                        <li>
                            {t("notes.note1")}{' '}
                            <span className="text-red-600 font-bold text-xl">
                                {profileId || 'null'}
                            </span>
                            {t("notes.note2")}
                        </li>
                        <li>
                            {t("notes.note3")}
                        </li>
                        <li>
                            {t("notes.note4")}
                        </li>
                    </ol>

                    {/* Login Button */}
                    <div className="flex justify-center mt-8">
                        <a
                            href="/React/Public/Home"
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-md text-lg transition-colors duration-200 shadow-md"
                        >
                            {t("buttons.proceedview")}
                        </a>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default PromotingOrganizationRegistrationShowInfo;