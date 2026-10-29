


 // import RedirectToOld from '../../../Component/formcomponent/RedirectToOld';

 // const ProposedCourse = () => {
 //     return <RedirectToOld targetPath="/Dashboard/DashboardTInstitute.aspx" />;
 // };

 // export default ProposedCourse;




import React, { useState, useEffect, useContext } from 'react';
import { DashboardContext } from '../../../contexts/DashboardContext';
import { DashboardProvider } from '../../../contexts/DashboardProvider';
import UserInfoSection from '../../../Component/Dashboard/UserInfoSection';
import StepCardsGrid from '../../../Component/Dashboard/StepCardsGrid';
import Modal from '../../../Component/common/Modal';
import DashBoard from '../../formcomponent/DashboardComponent';
import useNoticePopup from '../../formcomponent/NoticePop';

import agent from '../../../lib/api/agent';
import { GetInstituteInspectionDash } from '../../../Endpoints_All/Base/DVETO';
import { useAuth } from "../../../Hooks/AuthContext";



const DashboardTInstituteContent = () => {
   const { dashboardData, loading, error } = useContext(DashboardContext);
   const [showWelcome, setShowWelcome] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [modalContent, setModalContent] = useState({ title: '', text: '' });


    const { showNoticePopup } = useNoticePopup();
    const { userInfo } = useAuth();


   useEffect(() => {
       const timer = setTimeout(() => setShowWelcome(false), 10000);
       return () => clearTimeout(timer);
   }, []);

    useEffect(() => {
        const loadInspectionRemarks = async () => {
            try {
                const instituteId = Number(userInfo?.UserLoginID?.slice(-6));
                const dashUserType = 81;

                if (!instituteId || !dashUserType) return;

                const dashRes = await agent.get(
                    `${GetInstituteInspectionDash}/${instituteId}/${dashUserType}`
                );

                const list = dashRes.data?.Data || [];

                // Only pages having Remark status
                const rejectedPages = list.filter(
                    (item) => item.PageStatus === "R"
                );

                // If everything verified
                // if (list.length > 0 && rejectedPages.length === 0) {
                //     showNoticePopup({
                //         title: "सूचना",
                //         icon: null,
                //         width: 700,
                //         className: "text-black",
                //         content: [
                //             {
                //                 text: "Inspection application verification has been completed by MSBSVET. For any further changes, please contact the respective District Office.",
                //                 className: "text-green-600 font-bold mb-3",
                //             }
                //         ],
                //         confirmText: "OK",
                //     });

                //     return;
                // }

                // Show pages having remarks
                const formatPageName = (text) =>
                    text
                        ?.replace(/([a-z])([A-Z])/g, "$1 $2") // UnitsForInspection -> Units For Inspection
                        ?.trim();

                if (rejectedPages.length > 0) {
                    showNoticePopup({
                        title: "सूचना",
                        icon: null,
                        width: 900,
                        className: "text-black",
                        content: [
                            {
                                text: "Board has rejected the following details. Please review the remarks below:",
                                className: "text-red-600 font-bold mb-3",
                            },

                            ...rejectedPages.map((item, index) => ({
                                text: `${index + 1}. ${formatPageName(item.PageName || item.pagename)} : ${item.Remark}`,
                                className: "mb-2",
                            })),

                            {
                                text: "For changes, please contact the respective District Office.",
                                className: "font-semibold mt-4",
                            },
                        ],
                        confirmText: "OK",
                    });
                }
            } catch (err) {
                console.error(err);
            }
        };

        loadInspectionRemarks();
    }, [showNoticePopup, userInfo]);

   useEffect(() => {
       if (dashboardData.displayPopup && dashboardData.popupText?.length > 0) {
           setModalContent({
               title: dashboardData.popupHeader || 'Notification',
               text: dashboardData.popupText
           });
           setShowModal(true);
       }
   }, [dashboardData]);

   if (loading) {
       return (
           <div className="flex items-center justify-center min-h-screen">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
           </div>
       );
   }

   if (error) {
       return (
           <div className="flex items-center justify-center min-h-screen">
               <div className="text-red-500">
                   <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
                   <p>{error}</p>
               </div>
           </div>
       );
   }


   const stepGroups = [
       {
           title: 'LoI Stage',
           steps: [
               { key: 'InstitutePayment', label: 'Registration Fee' },
               { key: 'PromotingOrganization', label: 'Promoting Organization' },
               { key: 'PromotersDetails', label: 'Promoters' },
               { key: 'ProposedInstituteDetails', label: 'Institute Profile' },
               { key: 'ProposedCourse', label: 'Proposed Courses' },
               { key: 'SelfDeclaration', label: 'Self-Declaration' },
               { key: 'LOIGeneration', label: 'Application for LoI' },
               { key: 'LOI', label: 'Letter of Intent (LoI)' },
           ]
       },
       {
           title: 'Inspection Stage',
           steps: [
               { key: 'UnitforInspection', label: 'Unit for Inspection' },
               { key: 'BuildingDetails', label: 'Building' },
               { key: 'LandDetails', label: 'Land' },
               { key: 'WorkshopDetails', label: 'Workshop' },
               { key: 'TrainingEquipmentDetails', label: 'Training Equipment' },
               { key: 'CommonFacilityDetails', label: 'Common Facility' },
               { key: 'PowerDetails', label: 'Power' },
               { key: 'InstituteBank', label: 'Bank Account' },
               { key: 'InspectionFee', label: 'Inspection Fees' },
               { key: 'InspectionRequest', label: 'Request for Inspection' },
           ]
       },
   ];

   // LoI issued = 'V' means show Inspection Stage, anything else hide it
   const isLoIIssued = dashboardData.isLoIIssued === 'V';

   return (
       <div className="min-h-screen bg-gray-50 p-4">

           {showWelcome && (
               //<UserInfoSection
               //    userInfo={{
               //        loginId: dashboardData.userLoginID,
               //        ipAddress: dashboardData.ipAddress,
               //        userType: dashboardData.userType,
               //        currentLoginDateTime: dashboardData.currentLoginDateTime,
               //        userName: dashboardData.userName,
               //        lastLoginDateTime: dashboardData.lastLoginDateTime,
               //        welcomeMessage: dashboardData.welcomeMessage
               //    }}
               ///>
               <DashBoard
                   displayData={{
                       UserLoginID: dashboardData.userLoginID,
                       IPAddress: dashboardData.ipAddress,
                       UserType: dashboardData.userType,
                       CurrentLoginDateTime: dashboardData.currentLoginDateTime,
                       UserName: dashboardData.userName,
                       LastLoginDateTime: dashboardData.lastLoginDateTime,
                       welcomeMessage: dashboardData.welcomeMessage
                   }}
               />
                
           )}

           {stepGroups.map((group, index) => {

               // Hide Inspection Stage if LoI not issued
               if (group.title === 'Inspection Stage' && !isLoIIssued) {
                   return null;
               }

               // Build steps array enriched with API data
               const enrichedSteps = group.steps.map((step) => {
                   const pageData = dashboardData[step.key] || {};

                   return {
                       key: step.key,
                       // Display name: prefer API pageName, fallback to hardcoded label
                       label: pageData.pageName || step.label,
                       // Background color from API
                       color: pageData.bgColor ? undefined : 'bg-gray-100',
                       bgColorStyle: pageData.bgColor || undefined,
                       // Navigation URL from API
                       link: pageData.pageURL || '',
                       anchorTarget: pageData.anchorTarget || '_self',
                       // Status
                       percentage: pageData.percentage || 0,
                       verified: pageData.verified || false,
                       verifyStatus: pageData.verifyStatus || 'N',
                       displayType: pageData.displayType || 'Pending',
                       icon: pageData.icon || '',
                   };
               });

               return (
                   <StepCardsGrid
                       key={index}
                       title={group.title}
                       steps={enrichedSteps}
                       percentages={dashboardData}
                   />
               );
           })}

           <Modal
               isOpen={showModal}
               onClose={() => setShowModal(false)}
               title={modalContent.title}
           >
               <div className="text-justify max-h-72 overflow-auto">
                   {modalContent.text}
               </div>
           </Modal>
       </div>
   );
};

const DashboardTInstitute = () => {
   return (
       <DashboardProvider>
           <DashboardTInstituteContent />
       </DashboardProvider>
   );
};

export default DashboardTInstitute;


