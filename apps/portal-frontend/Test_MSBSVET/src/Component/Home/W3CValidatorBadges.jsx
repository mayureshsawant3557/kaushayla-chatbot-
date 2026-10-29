import React from "react";

const W3CValidatorBadges = () => {
    const websiteUrl = "https://msbsvet.edu.in/React";

    return (
        <div
            className="flex items-center gap-2 flex-wrap"
           // style={{ background: "#003366", padding: "8px" }}
        >
            {/* WCAG 2.0 AA */}
            <a
                href="https://www.w3.org/WAI/WCAG2AA-Conformance"
                target="_blank"
                rel="noopener noreferrer"
                title="Explanation of WCAG 2.0 Level AA Conformance"
            >
                <img
                    src="https://www.w3.org/WAI/WCAG21/wcag2.1AA-v.svg"
                    alt="WCAG 2.1 AA Conformance"
                    style={{ height: "32px" }}
                />
            </a>

            {/* HTML Validator */}
            <a
                href={`https://validator.w3.org/nu/?showsource=yes&showoutline=yes&showimagereport=yes&level=warning&doc=${encodeURIComponent(
                    websiteUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Validate HTML"
            >
                <img
                    src="https://www.w3.org/Icons/valid-xhtml10"
                    alt="Valid XHTML 1.0"
                    height="32"
                />
            </a>

            {/* CSS Validator */}
            <a
                href={`https://jigsaw.w3.org/css-validator/validator?uri=${encodeURIComponent(
                    websiteUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Validate CSS"
            >
                <img
                    src="https://jigsaw.w3.org/css-validator/images/vcss"
                    alt="Valid CSS"
                    height="32"
                />
            </a>
        </div>
    );
};

export default W3CValidatorBadges;