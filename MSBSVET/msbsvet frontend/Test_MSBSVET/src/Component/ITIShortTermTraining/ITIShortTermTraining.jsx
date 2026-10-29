import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import SignInPage from "../Home/SignInPage";
import devendrafadnavis from "../../assets/DevendraFadanvis.jpg";
import mangalprabhatlodha from "../../assets/MangalPrabhatLodha.jpg";
import NarendraModi from "../../assets/PM_Modi.jpg";
import Video from "../../Component/Home/Video";
import StatisticsCards from "../../Component/ITIShortTermTraining/DashboardSTTComponent";

const ITIShortTermTraining = ({ isLoggedIn, onLoginStateChange }) => {
  const { t } = useTranslation(); // ✅ Initialize translation
  const navigate = useNavigate();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  // Navigation handlers
  const handleSearchCourse = () => {
    navigate("/Public/coursesSTT");
  };

  const handleSearchInstitute = () => {
    navigate("/Public/institutes");
  };

  const handleUserManual = () => {
    openPopupWithIframe2();
  };

  function openPopupWithIframe2() {
    const popup = window.open(
      "",
      "popupWindow",
      "width=800,height=600,menubar=no,toolbar=no,location=no,status=no",
    );

    if (popup) {
      popup.document.write(`
            <html>
            <head>
                <title>${t("User_Manual_Title")}</title>
                <style>
                    body { margin: 0; overflow: hidden; }
                    iframe { width: 100%; height: 100%; border: none; }
                </style>
            </head>
            <body>
                <iframe src="https://msbsvet.blob.core.windows.net/msbsvet/msbsvetlive/stt/STEP%20Scheme%20User%20Manual%20-%20Version%201,%2002.10.2025.pdf" allowfullscreen></iframe>
            </body>
            </html>
        `);
    } else {
      alert(t("Popup_Blocked_Message"));
    }
  }

  // Quote data with translations
  const quotes = [
    {
      quote: t("Quote_1"),
      author: t("Author_1"),
      position: t("Position_1"),
      image: mangalprabhatlodha,
    },
    {
      quote: t("Quote_2"),
      author: t("Author_2"),
      position: t("Position_2"),
      image: NarendraModi,
    },
    {
      quote: t("Quote_3"),
      author: t("Author_3"),
      position: t("Position_3"),
      image: devendrafadnavis,
    },
  ];

  // Full content sections with translations
  const getFullContent = () => {
    return `
            <p>${t("Short_Content")}</p>

            <h2 style="font-weight: bold; margin-top: 1rem;">${t("Section_1_Title")}</h2>
            <p>${t("Section_1_Content")}</p>

            <h3 style="font-weight: bold; margin-top: 1rem;">${t("Section_2_Title")}</h3>
            <p>${t("Section_2_Content")}</p>

            <h3 style="font-weight: bold; margin-top: 1rem;">${t("Section_3_Title")}</h3>
            <p>${t("Section_3_Content")}</p>

            <h3 style="font-weight: bold; margin-top: 1rem;">${t("Section_4_Title")}</h3>
            <p>${t("Section_4_Content")}</p>

            <h2 style="font-weight: bold; margin-top: 1rem;">${t("Section_5_Title")}</h2>
            <p>${t("Section_5_Content")}</p>

            <ul>
                <li><strong>${t("Benefit_1")}</strong></li>
                <li><strong>${t("Benefit_2")}</strong></li>
                <li><strong>${t("Benefit_3")}</strong></li>
                <li><strong>${t("Benefit_4")}</strong></li>
            </ul>

            <h2 style="font-weight: bold; margin-top: 1rem;">${t("Section_6_Title")}</h2>
            <p>${t("Section_6_Content")}</p>

            <h3 style="font-weight: bold; margin-top: 1rem;">${t("Section_7_Title")}</h3>
            <p>${t("Section_7_Content")}</p>

            <h3 style="font-weight: bold; margin-top: 1rem;">${t("Section_8_Title")}</h3>
            <p>${t("Section_8_Content")}</p>

            <h3 style="font-weight: bold; margin-top: 1rem;">${t("Section_9_Title")}</h3>
            <p>${t("Section_9_Content")}</p>

            <h3 style="font-weight: bold; margin-top: 1rem;">${t("Section_10_Title")}</h3>
            <p>${t("Section_10_Content")}</p>

            <h3 style="font-weight: bold; margin-top: 1rem;">${t("Section_11_Title")}</h3>
            <p>${t("Section_11_Content")}</p>

            <h3 style="font-weight: bold; margin-top: 1rem;">${t("Section_12_Title")}</h3>
            <p>${t("Section_12_Content")}</p>

            <h2 style="font-weight: bold; margin-top: 1rem;">${t("Section_13_Title")}</h2>
            <p>${t("Section_13_Content")}</p>
            <p>${t("Section_14_Content")}</p>
        `;
  };

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  // Scroll to current quote
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.offsetWidth;
      container.scrollTo({
        left: currentQuoteIndex * cardWidth,
        behavior: "smooth",
      });
    }
  }, [currentQuoteIndex]);

  const handleDotClick = (index) => {
    setCurrentQuoteIndex(index);
  };

  const handleReadMore = () => {
    Swal.fire({
      title: `<strong>${t("Popup_Title")}</strong>`,
      html: `
                <div class="overflow-y-auto max-h-[70vh] p-6 text-left leading-relaxed text-gray-700 text-sm" style="white-space: normal;">
                    ${getFullContent()}
                </div>
            `,
      width: "90%",
      maxWidth: "1000px",
      heightAuto: false,
      showCloseButton: true,
      showConfirmButton: false,
      padding: 0,
      customClass: {
        popup: "rounded-lg",
        title:
          "bg-blue-900 text-white p-4 text-2xl font-semibold rounded-t-lg text-left",
        htmlContainer: "p-0",
      },
      didOpen: (popup) => {
        popup.style.padding = "0";
        popup.style.border = "none";
        const titleElement = popup.querySelector(".swal2-title");
        if (titleElement) {
          titleElement.style.margin = "0";
          titleElement.style.padding = "1rem";
          titleElement.style.textAlign = "left";
        }
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Main Row Layout */}
<div className="flex flex-col lg:flex-row w-full items-start gap-4 px-3 sm:px-4 py-4">
        {/* LEFT SIDEBAR */}
       <div className="w-full lg:w-[210px] flex-shrink-0">
          <div className="bg-[#8c93ab] rounded overflow-hidden shadow-sm">
            <button
              onClick={handleSearchCourse}
             className="w-full text-left px-4 py-3 text-white text-[15px] sm:text-[16px] lg:text-[18px] font-medium border-b border-gray-300 hover:bg-[#7b839d]"
            >
              {t("Search_Course")}
            </button>

            <button
              onClick={handleSearchInstitute}
            className="w-full text-left px-4 py-3 text-white text-[15px] sm:text-[16px] lg:text-[18px] font-medium border-b border-gray-300 hover:bg-[#7b839d]"
            >
              {t("Search_Institute")}
            </button>

            <button
              onClick={handleUserManual}
className="w-full text-left px-4 py-3 text-white text-[15px] sm:text-[16px] lg:text-[18px] font-medium border-b border-gray-300 hover:bg-[#7b839d]"
            >
              {t("User_Manual")}
            </button>

            <button
             className="w-full text-left px-4 py-3 text-white text-[15px] sm:text-[16px] lg:text-[18px] font-medium border-b border-gray-300 hover:bg-[#7b839d]">
              Employability Skill
            </button>
          </div>
        </div>

        {/* CENTER CONTENT */}
      <div className="flex-1 min-w-0 w-full">
          <div className="bg-white border border-gray-300 p-3 h-[340px] overflow-hidden">
            {/* Carousel */}
            <div ref={scrollContainerRef} className="overflow-hidden">
              <div className="flex">
                {quotes.map((quote, index) => (
                  <div key={index} className="w-full flex-shrink-0">
               <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-start">
                      <img
                        src={quote.image}
                        alt={quote.author}
                     className="w-[100px] h-[100px] sm:w-[125px] sm:h-[125px] object-cover flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] sm:text-[16px] lg:text-[18px] leading-[24px] text-[#444] font-semibold break-words text-center sm:text-left">
                          "{quote.quote}"
                        </p>

                        <div className="mt-1 text-[13px] sm:text-[14px] text-[#444] leading-[20px] text-center sm:text-left">
                          <span className="font-medium">{quote.author}</span> 

                          <span className="ml-1">{quote.position}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <hr className="my-2 border-gray-300" />

            {/* Content */}
            <h2 className="text-[18px] font-bold text-[#222] mb-1 leading-[20px]">
              {t("Importance_of_Short_Term_Course")}
            </h2>

            <p className="text-[16px] leading-[20px] text-[#333] line-clamp-3">
              {t("Short_Content")}
            </p>

            <div className="flex justify-end mt-1">
              <button
                onClick={handleReadMore}
                className="text-blue-600 text-[16px] font-medium hover:underline"
              >
                {t("Read_More")}
              </button>
            </div>
          </div>
        </div>
        {/* RIGHT SIGN-IN PANEL */}
        {!isLoggedIn && (
       <div className="w-full lg:w-[420px] flex-shrink-0 ml-auto">
            <SignInPage
              onLoginSuccess={() => {
                onLoginStateChange(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div>
        <Video />
        <StatisticsCards />
      </div>
    </div>
  );
};

export default ITIShortTermTraining;

