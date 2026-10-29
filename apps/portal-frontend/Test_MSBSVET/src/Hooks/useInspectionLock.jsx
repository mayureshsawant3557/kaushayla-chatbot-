import { useEffect, useState } from "react";
import agent from "../lib/api/agent";
import { CheckInspectionEligibility, CheckVerificationEligibility } from "../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import { GetInstituteInspectionDash } from "../Endpoints_All/Base/DVETO";
import { useAuth } from "./AuthContext";


//export const useInspectionLock = (instituteId, loginID, pageCode) => {
//    const [eligibilityData, setEligibilityData] = useState(null);
//    const [isLocked, setIsLocked] = useState(false);
//    const [loading, setLoading] = useState(false);

//    useEffect(() => {
//        const checkEligibility = async () => {
//            if (!instituteId || !loginID) return;

//            try {
//                setLoading(true);

//                const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll")) || {};
//                const userTypeID = Number(userInfoAll.UserTypeID);

//                const response = await agent.get(CheckInspectionEligibility, {
//                    params: {
//                        instituteId,
//                        userLoginId: loginID
//                    }
//                });




//                if (response.data.Status === "Success") {
//                    const data = response.data.Data;
//                    setEligibilityData(data);


//                    if (userTypeID === 14) {
//                        if (data?.InspectionStatus === 'S') {
//                            setIsLocked(true);
//                        } else {
//                            setIsLocked(false);
//                        }
//                       // setIsLocked(false);
//                        return;
//                    }
//                    if (userTypeID === 64) {
//                        if (data?.InspectionStatus === 'I' || data?.InspectionStatus === 'S' || data?.InspectionStatus === 'WD' ) {
//                            setIsLocked(true);
//                        }


//                        else {
//                            setIsLocked(false);
//                        }
//                        // setIsLocked(false);
//                        return;
//                    }
//                    if (userTypeID === 81) {
//                        if (data?.InspectionStatus === 'S') {
//                            setIsLocked(false);
//                        } else {
//                            setIsLocked(true);
//                        }
//                        // setIsLocked(false);
//                        return;
//                    }

//                    //if (data?.InspectionStatus === 'S' || data?.InspectionStatus === 'I' || data?.InspectionStatus === 'WD') {
//                    //    setIsLocked(true);
//                    if (data?.InspectionStatus === 'S' || data?.InspectionStatus === 'I' || data?.InspectionStatus === 'WD') {
//                        setIsLocked(true);
//                    }

//                    //} else {

//                    //    setIsLocked(false);
//                    //}
//                }

//            } catch (error) {
//                console.error("Inspection eligibility error:", error);
//            } finally {
//                setLoading(false);
//            }
//        };



//        checkEligibility();
//    }, [instituteId, loginID]);

//    return { eligibilityData, isLocked, loading };


//};


// export const useInspectionLock = (instituteId, loginID, pageCode) => {
//     const [eligibilityData, setEligibilityData] = useState(null);
//     const [isLocked, setIsLocked] = useState(false);
//     const [loading, setLoading] = useState(false);
//      const {userInfo} = useAuth();


//     useEffect(() => {
//         const checkEligibility = async () => {
//             if (!instituteId || !loginID) return;

//             try {
//                 setLoading(true);

//                 const userTypeID = Number(userInfo?.UserTypeID);

//                 const response = await agent.get(CheckInspectionEligibility, {
//                     params: {
//                         instituteId,
//                         userLoginId: loginID
//                     }
//                 });

//                 if (response.data.Status === "Success") {
//                     const data = response.data.Data;
//                     setEligibilityData(data);

//                     let globalLock = false;

//                     // ✅ EXISTING GLOBAL LOCK LOGIC
//                     if (userTypeID === 14) {
//                         globalLock = data?.InspectionStatus === 'S';




//                     }
//                     else if (userTypeID === 64) {
//                         if (
//                             data?.InspectionStatus === 'I' ||
//                             data?.InspectionStatus === 'S' ||
//                             data?.InspectionStatus === 'WD'
//                         ) {
//                             globalLock = true;
//                         }
//                     }
//                     else if (userTypeID === 81) {
//                         globalLock = data?.InspectionStatus !== 'S';
//                     }
//                     else {
//                         if (
//                             data?.InspectionStatus === 'S' ||
//                             data?.InspectionStatus === 'I' ||
//                             data?.InspectionStatus === 'WD'
//                         ) {
//                             globalLock = true;
//                         }
//                     }

//                     // ✅ PAGE LEVEL LOCK (ONLY WHEN STATUS = 'W')
//                     let pageLock = false;

//                     // if (['W'].includes(data?.InspectionStatus) && pageCode) {
//                     //     try {
//                     //         const dashRes = await agent.get(
//                     //             `${GetInstituteInspectionDash}/${instituteId}/${userTypeID}`
//                     //         );

//                     //         const list = dashRes.data?.Data || [];

//                     //         const currentPage = list.find(item =>
//                     //             item.PageCode?.includes(pageCode)
//                     //         );

//                     //         if (currentPage) {
//                     //             const statusValue = currentPage.PageStatus;

//                     //             if (statusValue === "V") {
//                     //                 pageLock = true;
//                     //             } else if (statusValue === "R") {
//                     //                 pageLock = false;
//                     //             }
//                     //         }

//                     //     } catch (err) {
//                     //     }
//                     // }

//                     // ✅ FINAL LOCK DECISION
//                     // setIsLocked(globalLock || pageLock);

//                     // if (['W'].includes(data?.InspectionStatus)) {
//                     //     setIsLocked(pageLock);
//                     // } else {
//                     //     setIsLocked(globalLock);
//                     // }

//                     // FOR DVEO LOCK IN CASE OF BOARD Verified Status ='V'

//                     // if (['WD'].includes(data?.InspectionStatus) ) {
//                     //     try {
//                     //         const dashRes = await agent.get(
//                     //             `${GetInstituteInspectionDash}/${instituteId}/${81}`
//                     //         );

//                     //         const list = dashRes.data?.Data || [];

//                     //         const currentPage = list.find(item =>
//                     //             item.PageCode?.includes(pageCode)
//                     //         );

//                     //         if (currentPage) {
//                     //             const statusValue = currentPage.PageStatus;

//                     //             if (statusValue === "V") {
//                     //                 pageLock = true;
//                     //             } else if (statusValue === "R") {
//                     //                 pageLock = false;
//                     //             }
//                     //         }

//                     //     } catch (err) {
//                     //     }
//                     // }
//                     // if (['WD'].includes(data?.InspectionStatus)) {
//                     //     setIsLocked(pageLock);
//                     // } else {
//                     //     setIsLocked(globalLock);
//                     // }



//                     // PAGE LEVEL LOCK FOR W AND WD
//                     if (['W', 'WD','I'].includes(data?.InspectionStatus) || pageCode) {
//                         try {

//                             // For WD use board dashboard (81)
//                             // otherwise current user type
//                             const dashUserType =
//                                 data?.InspectionStatus === 'WD' ? 81 : userTypeID;

//                             const dashRes = await agent.get(
//                                 `${GetInstituteInspectionDash}/${instituteId}/${dashUserType}`
//                             );

//                             const list = dashRes.data?.Data || [];

//                             const currentPage = list.find(item =>
//                                 item.PageCode?.includes(pageCode)
//                             );

//                             if (currentPage) {

//                                 const statusValue = currentPage.PageStatus;

//                                 if (statusValue === "V") {
//                                     pageLock = true;
//                                 }
//                                 else if (statusValue === "R") {
//                                     pageLock = false;
//                                 }
//                             }

//                         } catch (err) {
//                         }
//                     }

//                     // FINAL LOCK DECISION
//                     if (['W', 'WD'].includes(data?.InspectionStatus)) {
//                         setIsLocked(pageLock);
//                     }
//                     else {
//                         setIsLocked(globalLock);
//                     }
//                 }

//             } catch (error) {
//             } finally {
//                 setLoading(false);
//             }
//         };

//         checkEligibility();
//     }, [instituteId, loginID, pageCode]);

//     return { isLocked, eligibilityData, loading };



// };




export const useInspectionLock = (instituteId, loginID, pageCode) => {
    const [eligibilityData, setEligibilityData] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const [loading, setLoading] = useState(false);

    const { userInfo } = useAuth();

    useEffect(() => {
        const checkEligibility = async () => {
            if (!instituteId) return;

            try {
                setLoading(true);

                const userTypeID = Number(userInfo?.UserTypeID);

                let response;

                // ==========================================================
                // CHECK ELIGIBILITY
                // ==========================================================
                // if (userTypeID === 81) {
                //     response = await agent.get(CheckVerificationEligibility, {
                //         params: {
                //             instituteId,
                //         },
                //     });
                // } else {
                //     response = await agent.get(CheckInspectionEligibility, {
                //         params: {
                //             instituteId,
                //             userLoginId: loginID,
                //         },
                //     });
                // }
                 response = await agent.get(CheckInspectionEligibility, {
                    params: {
                        instituteId,
                        userLoginId: loginID,
                    },
                });

                if (response.data.Status === "Success") {
                    const data = response.data.Data;


                    if (userTypeID === 81) {

                        const verificationRes = await agent.get(CheckVerificationEligibility, {
                            params: {
                                instituteId,
                            },
                        });
                        if (verificationRes.data.Status === "Success") {

                            // Merge both responses
                            data.VerificationStatus =
                                verificationRes.data.Data?.VerificationStatus;

                            data.VerificationMessage =
                                verificationRes.data.Data?.Message;
                        }
                    }

                    setEligibilityData(data);

                    let globalLock = false;
                    let pageLock = false;

                    
                    // if (userTypeID === 81) {
                    //     globalLock = data?.VerificationStatus === "V";
                    // }
                    if (userTypeID === 81) {
                        switch (data?.VerificationStatus) {
                            case "V":
                                globalLock = true;   // Lock page
                                break;

                            case "W":
                                globalLock = false;  // Unlock page
                                break;

                            default:
                                globalLock = false;  // S, R, NULL etc.
                                break;
                        }

                        setIsLocked(globalLock);
                        return; 
                    }

                    
                    else if (userTypeID === 14) {
                        globalLock = data?.InspectionStatus === "S";
                    }

                    
                    else if (userTypeID === 64) {
                        if (
                            data?.InspectionStatus === "I" ||
                            data?.InspectionStatus === "S" ||
                            data?.InspectionStatus === "WD"
                        ) {
                            globalLock = true;
                        }
                    }

                    
                    else {
                        if (
                            data?.InspectionStatus === "S" ||
                            data?.InspectionStatus === "I" ||
                            data?.InspectionStatus === "WD"
                        ) {
                            globalLock = true;
                        }
                    }

                    
                    if (
                        (userTypeID !== 81 && userTypeID !== 64) &&
                        pageCode &&
                        ["W", "WD", "I"].includes(data?.InspectionStatus)
                    ) {
                        try {
                            const dashUserType =
                                data?.InspectionStatus === "WD"
                                    ? 81
                                    : userTypeID;

                            const dashRes = await agent.get(
                                `${GetInstituteInspectionDash}/${instituteId}/${dashUserType}`
                            );

                            const list = dashRes.data?.Data || [];

                            const currentPage = list.find((item) =>
                                item.PageCode?.includes(pageCode)
                            );

                            if (currentPage) {
                                if (currentPage.PageStatus === "V") {
                                    pageLock = true;
                                } else if (currentPage.PageStatus === "R") {
                                    pageLock = false;
                                }
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }

                    
                    if (userTypeID === 81) {
                        // Board lock based only on VerificationStatus
                        setIsLocked(globalLock);
                    } else if (
                        // ["W", "WD"].includes(data?.InspectionStatus)
                        (userTypeID === 14 && ["W", "WD"].includes(data?.InspectionStatus)) ||
                        (userTypeID === 64 && ["W"].includes(data?.InspectionStatus))
                    ) {
                        setIsLocked(pageLock);
                    } else {
                        setIsLocked(globalLock);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        checkEligibility();
    }, [instituteId, loginID, pageCode, userInfo?.UserTypeID]);

    return {
        isLocked,
        eligibilityData,
        loading,
    };
};