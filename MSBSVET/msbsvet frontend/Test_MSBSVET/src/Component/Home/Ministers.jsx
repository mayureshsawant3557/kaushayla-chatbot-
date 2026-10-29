import React from "react";
import devendrafadnavis from "../../assets/DevendraFadanvis.jpg";
import eknathshinde from "../../assets/EknathShinde.jpg";
import ajitpawar from "../../assets/SunetraPawar.jpg";
import { useTranslation } from "react-i18next";
import mangalprabhatlodha from "../../assets/MPL_white_bg.png"; 

function Ministers() {
    const { t } = useTranslation(); // Get translation function

    const ministers = [
        {
            name: t("Shri_Devendra_Fadnavis"),
            title: t("Hon_Chief_Minister"),
            imgSrc: devendrafadnavis,
            imgAlt: t("Image_of_Shri_Devendra_Fadnavis"),
        },
        {
            name: t("Shri_Eknath_Shinde"),
            title: t("Hon_Deputy_Chief_Minister"),
            imgSrc: eknathshinde,
            imgAlt: t("Image_of_Shri_Eknath_Shinde"),
        },
        {
            name: t("Shri_Ajit_Pawar"),
            title: t("Hon_Deputy_Chief_Minister"),
            imgSrc: ajitpawar,
            imgAlt: t("Image_of_Shri_Ajit_Pawar"),
        },
        {
            name: t("Shri_Mangal_Prabhat_Lodha"),
            title: t("Hon_Minister"),
            imgSrc: mangalprabhatlodha,
            imgAlt: t("Image_of_Shri_Mangal_Prabhat_Lodha"),
        },
    ];


    return (
        <div className="w-full max-w-full ml-5 mr-5 mt-2">
            <div className="flex flex-row w-full">
                <div className="flex flex-wrap justify-center items-center bg-white w-full border rounded-lg shadow-lg">
                    {ministers.map((minister, index) => (
                        <div
                            key={index}
                            className="text-center w-full sm:w-1/2 md:w-1/4 p-0"
                        >
                            <img
                                className="w-16 h-18 object-cover mx-auto"
                                src={minister.imgSrc}
                                alt={minister.imgAlt}
                            />
                            <h2 className="text-sm  text-gray-800">
                                {minister.name}
                            </h2>
                            <p className="text-sm text-gray-500">{minister.title}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Ministers;
