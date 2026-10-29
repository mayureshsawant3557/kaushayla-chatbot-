import React, { useContext, useState } from "react";
import { ThemeContext } from "../Context/ThemeContext";

const RequiredTemplates = () => {
    const { color } = useContext(ThemeContext);
    const [downloadingIndex, setDownloadingIndex] = useState(null);

    const templates = [
        {
            name: "Lease Agreement Template",
            path: "https://msbsvet.blob.core.windows.net/msbsvet/templates/Lease%20Agreement%20Template.docx",
            fileName: "LeaseAgreementTemplate.docx",
            accent: "#6366f1",
            lightBg: "#eef2ff",
            hoverBg: "#e0e7ff",
        },
        {
            name: "MoU Template",
            path: "https://msbsvet.blob.core.windows.net/msbsvet/templates/MoU%20Template.docx",
            fileName: "MoUTemplate.docx",
            accent: "#10b981",
            lightBg: "#ecfdf5",
            hoverBg: "#d1fae5",
        },
        {
            name: "NOC for Usage of Electricity Template",
            path: "https://msbsvet.blob.core.windows.net/msbsvet/templates/NOC%20for%20usage%20of%20Electricity%20Template.docx",
            fileName: "NOCforusageofElectricityTemplate.docx",
            accent: "#f59e0b",
            lightBg: "#fffbeb",
            hoverBg: "#fef3c7",
        },
    ];

    const handleDownload = (path, fileName, index) => {
        if (downloadingIndex !== null) return;
        setDownloadingIndex(index);

        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = path;
        document.body.appendChild(iframe);

        setTimeout(() => {
            document.body.removeChild(iframe); // ✅ cleanup
            setDownloadingIndex(null);
        }, 3000);
    };



    return (
        <fieldset className="border border-gray-200 rounded-xl mb-6 px-5 pt-4 pb-6 bg-white shadow-sm">
            <legend
                className={`flex items-center gap-2 rounded-lg border border-gray-200 ${color} px-4 py-2 text-base font-semibold text-white shadow-sm`}
            >
                Required Templates
            </legend>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template, index) => {
                    const isDownloading = downloadingIndex === index;
                    const isDisabled = downloadingIndex !== null;

                    return (
                        <div
                            key={index}
                            onClick={() => handleDownload(template.path, template.fileName, index)}                            style={{
                                backgroundColor: template.lightBg,
                                borderColor: template.accent + "40",
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isDisabled && !isDownloading ? 0.5 : 1,
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={e => {
                                if (isDisabled) return;
                                e.currentTarget.style.backgroundColor = template.hoverBg;
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = `0 6px 20px ${template.accent}25`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = template.lightBg;
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                            className="flex items-center gap-3 border rounded-xl px-4 py-3.5 select-none"
                        >
                            <div className="flex-1 min-w-0">
                                <p
                                    style={{ color: "#374151" }}
                                    className="text-sm font-semibold leading-tight truncate"
                                >
                                    {template.name}
                                </p>
                                <p
                                    style={{ color: template.accent }}
                                    className="text-xs font-medium mt-0.5 flex items-center gap-1"
                                >
                                    {isDownloading ? "⏳ Downloading..." : "↓ Download DOCX"}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </fieldset>
    );
};

export default RequiredTemplates;