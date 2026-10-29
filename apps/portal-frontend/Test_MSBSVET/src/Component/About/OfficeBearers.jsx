import React, { useContext, useState, useEffect } from "react";
import { FaUsers, FaArrowUp } from "react-icons/fa";
import { ThemeContext } from "../Context/ThemeContext";
import { useTranslation } from "react-i18next"; //  i18n hook
import MangalPrabhatLodha from "../../assets/MPL_white_bg.png";
import ManishaVerma from "../../assets/Manisha.png";
import YogeshSPatil from "../../assets/YogeshSPatil.jpg";
import JMLoharPhoto from "../../assets/JMLoharPhoto.jpg";
import Mahesh_Jadhav from "../../assets/Mahesh_Jadhav.png";

// Map bearer IDs to their photos
const bearerImages = {
  1: MangalPrabhatLodha,
  2: ManishaVerma,
  3: YogeshSPatil,
  4: Mahesh_Jadhav,
  5: JMLoharPhoto,
};

const OfficeBearers = () => {
  const { color } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Read bearers array from translation file: t('bearers', { returnObjects: true })
  const bearers = t("bearers", { returnObjects: true });

  return (
    <div className="relative w-full p-6" id="printdivcontent">
      <fieldset className="rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
        <legend
          className={`flex ${color} items-center text-lg font-semibold text-white border-2 border-gray-300 p-2 rounded-md`}
        >
          <FaUsers className="mr-2 text-white" />
          {t("Office_Bearers")}
        </legend>

        {/* Office Bearers List */}
        <div className="p-3">
          {Array.isArray(bearers) &&
            bearers.map((bearer, index) => (
              <div key={bearer.id} className="mb-6">
                <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    {/* Photo */}
                    <div className="w-full md:w-1/4 flex justify-center md:justify-start">
                      <img
                        src={bearerImages[bearer.id]}
                        alt={bearer.name}
                        className="w-36 h-34 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    </div>

                    {/* Name & Designation */}
                    <div className="w-full md:w-3/4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {bearer.name}
                      </h3>
                      <div className="text-sm text-gray-700 space-y-1">
                        {Array.isArray(bearer.designation) &&
                          bearer.designation.map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {index < bearers.length - 1 && (
                  <hr className="my-4 border-gray-300" />
                )}
              </div>
            ))}
        </div>
      </fieldset>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors print:hidden z-50"
          aria-label="Back to top"
        >
          <FaArrowUp size={20} />
        </button>
      )}

      <style>{`
                @media print {
                    .print\\:hidden { display: none !important; }
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    @page { margin: 1cm; }
                }
            `}</style>
    </div>
  );
};

export default OfficeBearers;
