// import React, { useContext, useState } from 'react';
// import { FaArrowUp, FaPrint } from 'react-icons/fa'; // Importing both the arrow and print icons
// import { ThemeContext } from "../Context/ThemeContext"; // Importing ThemeContext

// const GoverningCouncil = () => {
//     const { color } = useContext(ThemeContext); // Access the color from the ThemeContext
//     const [scrollTop, setScrollTop] = useState(false);

//     // Function to handle the scroll to top button visibility
//     const handleScroll = () => {
//         if (window.scrollY > 200) {
//             setScrollTop(true);
//         } else {
//             setScrollTop(false);
//         }
//     };

//     // Scroll to the top of the page
//     const scrollToTop = () => {
//         window.scrollTo({
//             top: 0,
//             behavior: 'smooth',
//         });
//     };

//     // Function to trigger the print dialog
//     const handlePrint = () => {
//         const printButton = document.getElementById("printButton");
//         printButton.style.display = "none"; // Hide the print button before printing
//         window.print(); // Trigger the print dialog
//         printButton.style.display = "block"; // Show the print button again after printing
//     };

//     // Listen for scroll events to show or hide the button
//     React.useEffect(() => {
//         window.addEventListener('scroll', handleScroll);
//         return () => {
//             window.removeEventListener('scroll', handleScroll);
//         };
//     }, []);

//     return (
//         <div className="w-full p-6 relative">
//             {/* Governing Council Table */}
//             <fieldset className="bg-white p-4 rounded-lg shadow-lg border border-gray-300 mb-6">
//                 <legend className={`${color} flex items-center text-lg font-semibold text-white  border-2 border-gray-300 p-2 rounded-md`}>
//                     <FaArrowUp className="mr-2 text-white" /> {/* Icon for Governing Council */}
//                     Governing Council
//                 </legend>

//                 <div className="overflow-x-auto">
//                     <table className="min-w-full table-auto border-collapse">
//                         <thead>
//                             <tr className="bg-gray-100 border-b">
//                                 <th className="px-4 py-2 text-left border-r">Sr. No.</th>
//                                 <th className="px-4 py-2 text-left border-r">Designation</th>
//                                 <th className="px-4 py-2 text-left">Members</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">01</td>
//                                 <td className="px-4 py-2">Hon Minister for Skill, Employment, Entrepreneurship and Innovation, Government of Maharashtra</td>
//                                 <td className="px-4 py-2">01 - President</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">02</td>
//                                 <td className="px-4 py-2">Hon  Minister of State for Skill, Employment, Entrepreneurship and Innovation, Government of Maharashtra</td>
//                                 <td className="px-4 py-2">01 - Vice-President</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">03</td>
//                                 <td className="px-4 py-2">Secretary, Skill, Employment, Entrepreneurship and Innovation Department</td>
//                                 <td className="px-4 py-2">01 - Member</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">04</td>
//                                 <td className="px-4 py-2">Secretary, Finance Department, Maharashtra or his nominee</td>
//                                 <td className="px-4 py-2">01 - Member</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">05</td>
//                                 <td className="px-4 py-2">Secretary, Industry Department, Maharashtra or his nominee</td>
//                                 <td className="px-4 py-2">01 - Member</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">06</td>
//                                 <td className="px-4 py-2">Secretary, Labour Department, Maharashtra or his nominee</td>
//                                 <td className="px-4 py-2">01 - Member</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">07</td>
//                                 <td className="px-4 py-2">Secretary, Higher and Technical Education Department, Maharashtra or his nominee</td>
//                                 <td className="px-4 py-2">01 - Member</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">08</td>
//                                 <td className="px-4 py-2">Secretary, School Education and Sports Department, Maharashtra or his nominee</td>
//                                 <td className="px-4 py-2">01 - Member</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">09</td>
//                                 <td className="px-4 py-2">Commissioner, Skill Development, Employment and Entrepreneurship, Maharashtra State</td>
//                                 <td className="px-4 py-2">01 - Member</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">10</td>
//                                 <td className="px-4 py-2">Director, Directorate of Vocational Education and Training, Maharashtra State</td>
//                                 <td className="px-4 py-2">01 - Member</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">11</td>
//                                 <td className="px-4 py-2">Members nominated by the Government from the Industries</td>
//                                 <td className="px-4 py-2">03 - Member</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">12</td>
//                                 <td className="px-4 py-2">Director, Maharashtra State Board of Skill, Vocational Education and Training</td>
//                                 <td className="px-4 py-2">01 - Member Secretary</td>
//                             </tr>
//                             <tr className="border-b">
//                                 <td className="px-4 py-2">Total Members</td>
//                                 <td className="px-4 py-2" colSpan="2">14</td> {/* Display total sum here */}
//                             </tr>
//                         </tbody>
//                     </table>
//                 </div>
//             </fieldset>

//             {/* Print Button */}
//             <div id="printButton" className="fixed bottom-16 right-6">
//                 <button
//                     onClick={handlePrint}
//                     className={`px-6 py-2 ${color} text-white rounded-lg shadow-md hover:bg-blue-600`}
//                 >
//                     <FaPrint className="mr-2" /> Print
//                 </button>
//             </div>

//             {/* Scroll to Top Button */}
//             {scrollTop && (
//                 <div
//                     onClick={scrollToTop}
//                     className={`fixed bottom-6 right-6 ${color} text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-blue-600`}
//                 >
//                     <FaArrowUp />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default GoverningCouncil;
import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowUp, FaPrint } from 'react-icons/fa';
import { ThemeContext } from '../Context/ThemeContext';

const GoverningCouncil = () => {
    const { t } = useTranslation();
    const { color } = useContext(ThemeContext);
    const [scrollTop, setScrollTop] = useState(false);

    const councilMembers = [
        {
            srNo: "01",
            designation: t("Hon Minister for Skill, Employment, Entrepreneurship and Innovation, Government of Maharashtra"),
            members: t("01 - President")
        },
        {
            srNo: "02",
            designation: t("Hon Minister of State for Skill, Employment, Entrepreneurship and Innovation, Government of Maharashtra"),
            members: t("01 - Vice-President")
        },
        {
            srNo: "03",
            designation: t("Secretary, Skill, Employment, Entrepreneurship and Innovation Department"),
            members: t("01 - Member")
        },
        {
            srNo: "04",
            designation: t("Secretary, Finance Department, Maharashtra or his nominee"),
            members: t("01 - Member")
        },
        {
            srNo: "05",
            designation: t("Secretary, Industry Department, Maharashtra or his nominee"),
            members: t("01 - Member")
        },
        {
            srNo: "06",
            designation: t("Secretary, Labour Department, Maharashtra or his nominee"),
            members: t("01 - Member")
        },
        {
            srNo: "07",
            designation: t("Secretary, Higher and Technical Education Department, Maharashtra or his nominee"),
            members: t("01 - Member")
        },
        {
            srNo: "08",
            designation: t("Secretary, School Education and Sports Department, Maharashtra or his nominee"),
            members: t("01 - Member")
        },
        {
            srNo: "09",
            designation: t("Commissioner, Skill Development, Employment and Entrepreneurship, Maharashtra State"),
            members: t("01 - Member")
        },
        {
            srNo: "10",
            designation: t("Director, Directorate of Vocational Education and Training, Maharashtra State"),
            members: t("01 - Member")
        },
        {
            srNo: "11",
            designation: t("Members nominated by the Government from the Industries"),
            members: t("03 - Member")
        },
        {
            srNo: "12",
            designation: t("Director, Maharashtra State Board of Skill, Vocational Education and Training"),
            members: t("01 - Member Secretary")
        }
    ];

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setScrollTop(true);
            } else {
                setScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="w-full p-6 relative print:static" id="print-area">
            <div className="flex justify-end mb-2 print:hidden">
                <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-[#0066a1] hover:bg-[#005586] text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-all tracking-wide shadow-sm"
                >
                    {t("Print")}
                </button>
            </div>
            {/* Governing Council Table */}
            <fieldset className="bg-white p-4 rounded-lg shadow-lg border border-gray-300 mb-6">
                <legend className={`${color || 'bg-slate-500'} flex items-center text-lg font-semibold text-white border-2 border-gray-300 p-2 rounded-md`}>
                    <FaArrowUp className="mr-2 text-white" />
                    {t("Governing Council")}
                </legend>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="px-4 py-2 text-left border-r text-gray-700 font-bold">{t("Sr. No.")}</th>
                                <th className="px-4 py-2 text-left border-r text-gray-700 font-bold">{t("Designation")}</th>
                                <th className="px-4 py-2 text-left text-gray-700 font-bold">{t("Members")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {councilMembers.map((member, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-2 text-gray-600">{member.srNo}</td>
                                    <td className="px-4 py-2 text-gray-800">{member.designation}</td>
                                    <td className="px-4 py-2 text-gray-800">{member.members}</td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50 font-bold border-b">
                                <td className="px-4 py-2 text-gray-800">{t("Total Members")}</td>
                                <td className="px-4 py-2 pr-40 text-gray-800 text-right" colSpan="2">14</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </fieldset>

            {/* Actions Panel */}
            {/* <div className="fixed bottom-6 right-6 flex flex-col gap-3 print:hidden z-50">
                
                {scrollTop && (
                    <button
                        onClick={scrollToTop}
                        className={`flex items-center justify-center ${color || 'bg-slate-500'} text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform`}
                    >
                        <FaArrowUp />
                    </button>
                )}
            </div> */}
        </div>
    );
};

export default GoverningCouncil;