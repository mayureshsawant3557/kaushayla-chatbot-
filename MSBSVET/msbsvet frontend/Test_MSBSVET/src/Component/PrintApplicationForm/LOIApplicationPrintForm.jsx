import React, { useState, useEffect, useRef } from 'react'
import agent from '../../lib/api/agent' // adjust path as needed
import verified from '../../assets/VerifiedIcon.jpg'
import rejected from '../../assets/NotVerifiedIcon.jpg'
import BoardLogo from '../../assets/Board Logo - small size.jpg'
import independencedayindia from '../../assets/independencedayindia20.jpg'
import { useLoading } from '../../Hooks/useLoading'
import docIcon from '../../assets/pdf.png'

// ─── Endpoint Imports ───────────────────────────────────────────────────────
import {
    GetInstituteIDByInstituteCode,
    PromotingOrgGetProposedInstituteDetails,
    GetAssociatedInstituteByPromotingOrganisationID,
    GetPromotingOrganisationIDByInstituteID,
    GetPromoterDetailsByInstituteID,
    GetPromotingOrganisationDetails,
    GetProposedCourseUnitDetails
} from '../../Endpoints_All/Base/Institute'

import {
    GetInspectionUnitDetails,
    GetBuildingDetails,
    GetBuildingSpaceasperNormsAnalysis,
    GetLandDetails,
    GetWorkshopDetails,
    GetTrainingEquipmentDetails,
    GetMasterSubFacilityGroup,
    GetSubFacilityDetails,
    GetOtherInfraDetails,
    GetInstitutePowerDetails,
    GetInstituteInspectionDateRange,
    GetInstituteBankDetails,
    GetInstituteInspectionAgencyList
} from '../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess'

import Staff_PrintApplicationForm from '../PrintApplicationForm/Staff_PrintApplicationForm'

import { TransactionHistory } from '../../Endpoints_All/Fee/feeManagement'
import InstituteDetailsPrint from './InstituteDtails'
import { GetProposedInstituteStatus } from '../../Endpoints_All/Institute/institute'
import { getDeviceIP } from '../../utils/CommonHelper'
import { useAuth } from '../../Hooks/AuthContext'
//import {InstituteDetailsPrint} from './InstituteDtails'

// ─── Sub-components ──────────────────────────────────────────────────────────
const Table = ({ title, children, className = '' }) => (
    <table
        className={`w-full border-collapse border border-black text-sm ${className}`}
    >
        {title && (
            <tbody>
                <tr className='bg-gray-50'>
                    <th
                        colSpan={4}
                        className='text-left p-2 border border-black font-bold'
                    >
                        {title}
                    </th>
                </tr>
            </tbody>
        )}
        {children}
    </table>
)

const Row = ({ label, value, colSpan = 1, bold = false }) => (
    <tr>
        <td className='p-2 border border-black font-semibold bg-gray-50 w-1/4'>
            {label}
        </td>
        <td
            colSpan={colSpan}
            className={`p-2 border border-black ${bold ? 'font-semibold' : ''}`}
        >
            {value ?? '—'}
        </td>
    </tr>
)

const DataTable = ({ headers, rows }) => (
    <table className='w-full border-collapse border border-black text-xs text-center'>
        <thead>
            <tr className='bg-gray-100'>
                {headers.map((h, i) => (
                    <th key={i} className='border border-black p-2 font-semibold'>
                        {h}
                    </th>
                ))}
            </tr>
        </thead>
        <tbody>
            {rows.length === 0 ? (
                <tr>
                    <td
                        colSpan={headers.length}
                        className='border border-black p-2 text-gray-400 italic'
                    >
                        No data
                    </td>
                </tr>
            ) : (
                rows.map((r, i) => (
                    <tr key={i} className={r.__rowClassName || ''}>
                        {r.__cells
                            ? r.__cells.map((c, j) => (
                                <td key={j} className='border border-black p-2'>
                                    {c ?? '—'}
                                </td>
                            ))
                            : r.map((c, j) => (
                                <td key={j} className='border border-black p-2'>
                                    {c ?? '—'}
                                </td>
                            ))}
                    </tr>
                ))
            )}
        </tbody>
    </table>
)

const SectionHeader = ({ title }) => (
    <div className='bg-gray-100 p-2 border border-black font-bold text-sm mt-2 mb-0'>
        {title}
    </div>
)

const LoadingSpinner = () => (
    <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>Loading...</span>
    </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LOIApplicationPrintForm() {
    // loader
    const { startLoading, stopLoading, isLoading } = useLoading()

    // ── Core IDs
    const [instituteID, setInstituteID] = useState(null)
    const [userLoginID, setUserLoginID] = useState('')
    const [userTypeID, setUserTypeID] = useState('')
    const [promotingOrgId, setPromotingOrgId] = useState(null)
    const [ipAddress, setIpAddress] = useState("");
     const {userInfo} = useAuth();

    // ── Loading / Error
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // ── Section Data States
    const [instituteProfile, setInstituteProfile] = useState(null)
    const [promotingOrg, setPromotingOrg] = useState(null)
    const [authorizedRep, setAuthorizedRep] = useState(null)
    const [principalPromoter, setPrincipalPromoter] = useState(null)
    const [members, setMembers] = useState([])
    const [affiliatedInstitutes, setAffiliatedInstitutes] = useState([])

    const [courseData, setCourseData] = useState([])
    const [buildings, setBuildings] = useState([])
    const [spaceNorms, setSpaceNorms] = useState([])
    const [buildingRemark, setBuildingRemark] = useState('')
    const [landDetails, setLandDetails] = useState([])
    const [workshopDetails, setWorkshopDetails] = useState([])

    const [trainingEquipment, setTrainingEquipment] = useState([])
    const [trainingEquipmentRemark, setTrainingEquipmentRemark] = useState('')
    const [commonFacilities, setCommonFacilities] = useState([])
    const [otherInfra, setOtherInfra] = useState(null)
    const [powerDetails, setPowerDetails] = useState(null)
    const [powerTableData, setPowerTableData] = useState([])
    const [transactionData, setTransactionData] = useState([])
    const [bankData, setBankData] = useState([])
    // const [bankData, setBankData] = useState(null)

    const [inspectionDateRange, setInspectionDateRange] = useState(null)
    const [inspectionAgency, setInspectionAgency] = useState(null)
    const [instituteStatus, setInstituteStatus] = useState(null)
    const [actualInstituteID, setActualInstituteID] = useState(null)

    const [printData, setPrintData] = useState(null)

    const dataFetchedRef = useRef(false)

    const instituteIDFromCode = 0;



    // // ── Step 1: Get user info & institute ID from session
    // useEffect(() => {
    //     const init = async () => {
    //         try {


    //             const params = new URLSearchParams(window.location.search);
    //             const p1 = params.get("P1"); // instituteID
    //             const p2 = params.get("P2"); // userLoginID

    //             if (p1 && p2) {
    //                 setInstituteID(Number(p1));
    //                 setUserLoginID(p2);
    //                 setUserTypeID(localStorage.getItem("userTypeID") || "1");
    //                 return;
    //             }

    //             const userInfoAll =
    //                 JSON.parse(sessionStorage.getItem('userInfoAll')) || {}
    //             const loginID = userInfoAll.UserLoginID || ''
    //             const typeID =
    //                 userInfoAll.UserTypeID || localStorage.getItem('userTypeID') || '1'
    //             setUserLoginID(loginID)
    //             setUserTypeID(typeID)

    //             if (!loginID) {
    //                 setError('User not logged in. Please login again.')
    //                 stopLoading()
    //                 return
    //             }

    //             // Fetch InstituteID by InstituteCode (loginID acts as institute code)
    //             const res = await agent.get(
    //                 `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`
    //                 //`${GetInstituteIDByInstituteCode}?InstituteCode=${p2}`
    //             )
    //             if (res.data?.Data) {
    //                 setInstituteID(res.data.Data)
    //             } else {
    //                 setError('Institute not found for this login.')
    //                 stopLoading()
    //             }
    //         } catch (err) {
    //             console.error('Init error:', err)
    //             setError('Failed to initialize. Please refresh.')
    //             stopLoading()
    //         }
    //     }
    //     init()
    // }, [])

    useEffect(() => {
        const init = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const p1 = params.get("P1"); // TempInstituteID
                const p2 = params.get("P2"); // UserLoginID

        
                const typeID =
                    userInfo?.UserTypeID || localStorage.getItem('userTypeID') || '1'
                setUserTypeID(typeID)


                if (p1 && p2) {

                    if (typeID == "81") {
                        try {
                            const res = await agent.get(
                                `/Base/GetPromotingOrganisationIDByTempInstituteID?InstituteID=${p1}`
                            );


                            if (res.data?.Data) {
                                setPromotingOrgId(res.data.Data);
                                setInstituteID(Number(p1));
                                setActualInstituteID(res.data.Data);
                            } else {
                                setInstituteID(Number(p1));
                            }

                            setUserLoginID(p2);
                            setUserTypeID("81");
                            return;

                        } catch (err) {
                            console.error("Conversion API failed:", err);
                            setInstituteID(Number(p1)); // fallback
                            setUserLoginID(p2);
                            setUserTypeID("81");
                            return;
                        }
                    }

                    // ✅ OTHER USERS
                    setInstituteID(Number(p1));
                    setUserLoginID(p2);
                    setUserTypeID(typeID);
                    return;
                }

                // ✅ CASE 2: Normal login (no P1, P2)
                const loginID = userInfo?.UserLoginID || ''

                setUserLoginID(loginID)
                setUserTypeID(typeID)

                if (!loginID) {
                    setError('User not logged in. Please login again.')
                    stopLoading()
                    return
                }

                // Fetch InstituteID by InstituteCode
                const res = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`
                )




                if (res.data?.Data) {
                    setInstituteID(res.data.Data)

                } else {
                    setError('Institute not found for this login.')
                    stopLoading()
                }

            } catch (err) {
                console.error('Init error:', err)
                setError('Failed to initialize. Please refresh.')
                stopLoading()
            }
        }

        init()
    }, [])


    //     useEffect(() => {
    //     const init = async () => {
    //         try {
    //             const params = new URLSearchParams(window.location.search);
    //             const p1 = params.get("P1"); // TempInstituteID
    //             const p2 = params.get("P2"); // UserLoginID

    //             const userInfoAll = JSON.parse(sessionStorage.getItem('userInfoAll')) || {};
    //             const userType = userInfoAll.UserTypeID ;

    //             // ✅ Secretary logic (UserTypeID = 81)
    //             if (p1 && p2 && userType === "81") {
    //                 try {
    //                     const res = await agent.get(
    //                         `/Base/GetPromotingOrganisationID?InstituteID=${p1}`
    //                     );

    //                     console.log('temp id --> ', res.data);


    //                     if (res.data?.Data) {
    //                         setInstituteID(res.data.Data); // ✅ converted ID
    //                     } else {
    //                         setInstituteID(parseInt(p1)); // fallback
    //                     }

    //                     setUserLoginID(p2);
    //                     setUserTypeID("81");
    //                     return;
    //                 } catch (err) {
    //                     console.error("Conversion failed", err);
    //                     setInstituteID(parseInt(p1));
    //                     setUserLoginID(p2);
    //                     setUserTypeID("81");
    //                     return;
    //                 }
    //             }

    //             // other users (same as your existing logic)
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     };

    //     init();
    // }, []);
    //   // ── Step 1: Get user info & institute ID from session (with full C# logic)
    //     useEffect(() => {
    //         const init = async () => {
    //             startLoading()
    //             try {
    //                 const params = new URLSearchParams(window.location.search);
    //                 const p1 = params.get("P1"); // TempInstituteID (for Secretary)
    //                 const p2 = params.get("P2"); // UserLoginID (for Secretary)

    //                 console.log("URL Params - P1:", p1, "P2:", p2);

    //                 // Case 1: Secretary login (UserTypeID = 81) - from search page click
    //                 if (p1 && p2) {
    //                     try {
    //                         // Convert TempInstituteID to actual InstituteID
    //                         const response = await agent.get(`/Base/GetPromotingOrganisationID/${p1}`);
    //                         console.log("Conversion API Response:", response.data);

    //                         if (response.data?.Status === true && response.data?.Data) {
    //                             const actualInstituteId = response.data.Data;
    //                             setInstituteID(actualInstituteId);
    //                             setUserLoginID(p2);
    //                             setUserTypeID("81");
    //                             console.log("Secretary: Converted TempInstituteID", p1, "to InstituteID:", actualInstituteId);
    //                         } else {
    //                             // Fallback: use P1 as InstituteID
    //                             setInstituteID(parseInt(p1));
    //                             setUserLoginID(p2);
    //                             setUserTypeID("81");
    //                             console.log("Secretary fallback: Using P1 as InstituteID:", p1);
    //                         }
    //                     } catch (error) {
    //                         console.error("Secretary conversion error:", error);
    //                         setInstituteID(parseInt(p1));
    //                         setUserLoginID(p2);
    //                         setUserTypeID("81");
    //                     }
    //                     stopLoading();
    //                     return;
    //                 }

    //                 // Case 2: Normal login (from session)
    //                 const userInfoAll = JSON.parse(sessionStorage.getItem('userInfoAll')) || {};
    //                 const loginID = userInfoAll.UserLoginID || '';
    //                 const typeID = userInfoAll.UserTypeID || localStorage.getItem('userTypeID') || '1';

    //                 setUserLoginID(loginID);
    //                 setUserTypeID(typeID);

    //                 if (!loginID) {
    //                     setError('User not logged in. Please login again.');
    //                     stopLoading();
    //                     return;
    //                 }

    //                 // Case 2a: Institute User (Type 66)
    //                 if (typeID === 66) {
    //                     const res = await agent.get(`${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`);
    //                     if (res.data?.Data) {
    //                         setInstituteID(res.data.Data);
    //                         console.log("Institute User: Got InstituteID:", res.data.Data);
    //                     } else {
    //                         setError('Institute not found for this login.');
    //                         stopLoading();
    //                         return;
    //                     }
    //                 }
    //                 // Case 2b: Promoting Organization User (Type 64)
    //                 else if (typeID === 64) {
    //                     const res = await agent.get(`/Base/GetPromotingOrganisationIDByInstituteCode?InstituteCode=${loginID}`);
    //                     if (res.data?.Data) {
    //                         setInstituteID(res.data.Data);
    //                         console.log("Promoting Org User: Got InstituteID:", res.data.Data);
    //                     } else {
    //                         setError('Promoting Organization not found for this login.');
    //                         stopLoading();
    //                         return;
    //                     }
    //                 }
    //                 // Case 2c: Other users - try to get from P1 if exists
    //                 else if (p1) {
    //                     setInstituteID(parseInt(p1));
    //                     console.log("Other User: Using P1 as InstituteID:", p1);
    //                 }

    //             } catch (err) {
    //                 console.error('Init error:', err);
    //                 setError('Failed to initialize. Please refresh.');
    //                 stopLoading();
    //             }
    //         };
    //         init();
    //     }, []);



    // ── Step 2: Fetch all sections once instituteID is known
    useEffect(() => {
        if (!instituteID || dataFetchedRef.current) return
        dataFetchedRef.current = true
        fetchAllData()
    }, [instituteID])

    //to print
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                window.print()
            }, 3000) // give DOM time to remove loader
            return () => clearTimeout(timer)
        }
    }, [isLoading])

    useEffect(() =>{
        fetchIP();
        
    },[]);

     const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };

    const fetchAllData = async () => {
        startLoading()
        try {
            await Promise.allSettled([
                fetchInstituteProfile(),
                fetchCourseData(),

                fetchInspectionDateRange(),
                fetchInstituteStatus(),

            ])
        } finally {
            stopLoading()
        }
    }



    const fetchInstituteProfile = async () => {
        try {
            const finalInstituteID = actualInstituteID || instituteID;


            const res = await agent.get(
                `${PromotingOrgGetProposedInstituteDetails}/${finalInstituteID}/${userLoginID}`
            )



            if (res.data?.Status === 'Success' && res.data?.Data) {
                const d = res.data.Data

                if (d.lstOtherRegistrationDetailsEntity && Array.isArray(d.lstOtherRegistrationDetailsEntity)) {
                    const particularMap = {
                        1: 'VTP (as on MSSDS/ MSCVT Portal)',
                        2: 'TC ID (as on Skill India Portal)',
                        3: 'TP ID (as on Skill India Portal)'
                    };

                    d.lstOtherRegistrationDetailsEntity = d.lstOtherRegistrationDetailsEntity.map(item => ({
                        ...item,
                        Particular: item.Particular || particularMap[item.ParticularID] || 'NA'
                    }));
                }

                
                setInstituteProfile(d)

                let orgId = promotingOrgId

                if (!orgId) {
                    const orgRes = await agent.get(
                        `${GetPromotingOrganisationIDByInstituteID}/${finalInstituteID}`
                    )

                    orgId = orgRes.data?.Data
                }

                if (orgId) {
                    setPromotingOrgId(orgId)

                    const promotingOrganization = await agent.post(
                        `${GetPromotingOrganisationDetails}`,
                        {
                            instituteId: orgId,
                            exitInstituteID: 0,
                            userLoginID: userLoginID,
                            pageCode: 'PageCode',
                            itemId: 0,
                            ipAddress: ipAddress
                        }
                    )

                    if (
                        promotingOrganization.data?.Status === 'Success' &&
                        promotingOrganization.data?.Data
                    ) {
                        setPromotingOrg(promotingOrganization.data.Data)
                    }

                    await fetchPromoterDetails(orgId)
                    await fetchAffiliatedInstitutes(orgId)
                }
            }
        } catch (err) {
            console.error('fetchInstituteProfile error:', err)
        }
    }


    const fetchPromoterDetails = async orgId => {
        try {
            const payload = {
                instituteId: orgId,
                userLoginID: userLoginID,
                pageCode: 'ExistingInstitute',
                itemId: '0',
                ipAddress: ipAddress
            }
            const res = await agent.post(GetPromoterDetailsByInstituteID, payload)
            if (res.data?.Status === 'Success' && res.data?.Data?.length > 0) {
                const list = res.data.Data
                
                setAuthorizedRep(
                    list.find(
                        p =>
                            p.PromoterTypeID === 5 ||
                            p.PromoterType === 'Authorized Representative'
                    ) || null
                )
                setPrincipalPromoter(
                    list.find(
                        p =>
                            p.PromoterTypeID === 8 || p.PromoterType === 'Principal Promoter'
                    ) || null
                )
                setMembers(
                    list.filter(
                        p =>
                            [1, 2, 3, 4].includes(p.PromoterTypeID) ||
                            ['Trustee', 'Member', 'Director', 'Partner'].includes(
                                p.PromoterType
                            )
                    )
                )
                //setPromotingOrg(list[0]); // Use first record for org name if needed
            }
        } catch (err) {
            console.error('fetchPromoterDetails error:', err)
        }
    }


    const getFullName = person => {
        return [
            person?.Title,
            person?.FirstName,
            person?.MiddleName,
            person?.LastName
        ]
            .filter(Boolean)
            .join(' ')
    }

    const fetchAffiliatedInstitutes = async orgId => {
        try {
            const payload = {
                InstituteId: orgId,
                userLoginID: userLoginID,
                pageCode: 'AssociatedInstitutes',
                itemId: '0',
                ipAddress: ipAddress
            }
            const res = await agent.post(
                GetAssociatedInstituteByPromotingOrganisationID,
                payload
            )
            if (res.data?.Status === 'Success' && res.data?.Data) {
                setAffiliatedInstitutes(res.data.Data)
            }
            

        } catch (err) {
            console.error('fetchAffiliatedInstitutes error:', err)
        }
    }

    const affiliated = affiliatedInstitutes.filter(x => x.PromoterTypeID === 1)
    const applied = affiliatedInstitutes.filter(x => x.PromoterTypeID === 2)

    const extractCode = htmlString => {
        if (!htmlString) return ''

        const match = htmlString.match(/>([^<]+)</)
        return match ? match[1] : ''
    }

    const parseCode = fullCode => {
        if (!fullCode) return { code: '', isVerified: false }

        const isVerified = fullCode.includes('V')

        const digitMatch = fullCode.match(/(\d{6})$/)
        const code = digitMatch ? digitMatch[1] : ''

        return { code, isVerified }
    }

    const openInstitutePopup = id => {
        const popupWidth = 1000
        const popupHeight = 750
        const left = (window.screen.width - popupWidth) / 2
        const top = (window.screen.height - popupHeight) / 2

        window.open(
            `../Public/InstituteDtails.aspx?P1=${id}`,
            'InstituteDetails',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )
    }
    const getVerificationStatus = code => {
        if (!code) return rejected
        return code.includes('V') ? verified : rejected
    }
    // const fetchCourseData = async () => {
    //     try {
    //         console.log("Course API InstituteID:", instituteID);

    //         const payload = {
    //             instituteId: instituteID,
    //             exitInstituteID: 0,
    //             userLoginID: '',
    //             pageCode: 'PageCode',
    //             itemId: 0,
    //             ipAddress: ipAddress || ''
    //         };

    //         console.log('?????????????????????????????????????', payload);


    //         const res = await agent.post(GetProposedCourseUnitDetails, payload);

    //         console.log("FULL API RESPONSE:", res.data);

    //         const tableData = res.data?.Data?.Table;

    //         console.log("Extracted Table Data:", tableData);

    //         if (tableData && tableData.length > 0) {
    //             const data = tableData.map((item, idx) => ({
    //                 ...item,
    //                 SN: idx + 1
    //             }));

    //             setCourseData(data);
    //         } else {
    //             setCourseData([]);
    //         }

    //     } catch (err) {
    //         console.error('fetchCourseData error:', err);
    //     }
    // };
    // for total row in course data table

    const fetchCourseData = async () => {
        try {
            // Use actualInstituteID for secretary login
            const finalInstituteID = actualInstituteID || instituteID;


            const payload = {
                instituteId: finalInstituteID,  // Use the correct ID
                exitInstituteID: 0,
                userLoginID: userLoginID,      // Use actual userLoginID, not empty string
                pageCode: 'PageCode',
                itemId: 0,
                ipAddress: ipAddress || ''
            };


            const res = await agent.post(GetProposedCourseUnitDetails, payload);
            console.log("GGGGGGGGGDDDDDDDDDDDDDDd",res);


            // Extract the table data - handle different possible structures
            let tableData = null;

            if (res.data?.Data?.Table && Array.isArray(res.data.Data.Table)) {
                tableData = res.data.Data.Table;
            } else if (res.data?.Data && Array.isArray(res.data.Data)) {
                tableData = res.data.Data;
            } else if (res.data?.Table && Array.isArray(res.data.Table)) {
                tableData = res.data.Table;
            }

            if (tableData && tableData.length > 0) {
                const data = tableData.map((item, idx) => ({
                    ...item,
                    SN: idx + 1,
                    // Ensure these fields exist for the totals calculation
                    ApprovedUnits: item.ApprovedUnits || 0,
                    LOIProposedUnits: item.LOIProposedUnits || 0,
                    TotalUnits: item.LOITotalUnits || 0,
                    InspectionFee: item.InspectionFee || 0,
                    SecurityDeposit: item.SecurityDeposit || 0
                }));

                setCourseData(data);
            } else {
                console.warn("No course data found in response");
                setCourseData([]);
            }

        } catch (err) {
            console.error('fetchCourseData error:', err);
            setCourseData([]);
        }
    };
    

    const totals = courseData.reduce(
        (acc, c) => {
            acc.ApprovedUnits += c.ApprovedUnits ?? 0
            acc.LOIProposedUnits += c.LOIProposedUnits ?? 0
            acc.TotalUnits += c.LOITotalUnits ?? 0
            acc.InspectionUnits += c.InspectionUnits ?? 0
            acc.InspectionFee += c.InspectionFee ?? 0
            acc.SecurityDeposit += c.SecurityDeposit ?? 0
            return acc
        },
        {
            ApprovedUnits: 0,
            LOIProposedUnits: 0,
            TotalUnits: 0,
            InspectionUnits: 0,
            InspectionFee: 0,
            SecurityDeposit: 0
        }
    )



    const fetchInspectionDateRange = async () => {
        try {
            const res = await agent.post(GetInstituteInspectionDateRange, {
                instituteId: instituteID,
                exitInstituteID: 0,
                userLoginID: userLoginID,
                pageCode: 'InspectionRequest',
                itemId: 0,
                ipAddress
            })
            if (res.data?.Status === 'Success' && res.data?.Data?.Table?.length > 0) {
                setInspectionDateRange(res.data.Data.Table[0])
            }
        } catch (err) {
            console.error('fetchInspectionDateRange error:', err)
        }
    }
    const fetchInstituteStatus = async () => {
        try {
            const response = await agent.get(`${GetProposedInstituteStatus}/${instituteID}`)


            if (response.data?.Status === 'Success' && response.data?.Data) {
                setInstituteStatus(response.data.Data)
            }
        } catch (err) {
            console.error('fetchInstituteStatus error:', err)
        }
    }

    const extractValue = (label, text) => {
        const regex = new RegExp(`${label}:\\s*([^,<]+)`, 'i')
        const match = text.match(regex)
        return match ? match[1].trim() : '—'
    }

    const agencyAddress = inspectionAgency?.AgencyAddress || ''

    const lines = agencyAddress.split('<br>').map(l => l.trim())

    const office = lines[0] || '—'

    const address =
        lines
            .slice(1)
            .filter(
                line =>
                    !/Pin Code:/i.test(line) &&
                    !/Taluka:/i.test(line) &&
                    !/District:/i.test(line)
            )
            .join(', ') || '—'

    const pinCode = extractValue('Pin Code', agencyAddress)
    const taluka = extractValue('Taluka', agencyAddress)
    const district = extractValue('District', agencyAddress)

    // ── Helpers
    const fmt = (val, fallback = 'NA') => val || fallback
    const fmtDate = d => {
        if (!d || d.startsWith('0001')) return '—'

        try {
            const date = new Date(d)
            if (!isNaN(date)) {
                const day = String(date.getDate()).padStart(2, '0')
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const year = date.getFullYear()
                return `${day}/${month}/${year}`
            }
        } catch (e) {
            console.error('Date parsing error:', e)
        }

        return '—'
    }

    // ── Render
    // if (isLoading)
    //   return (
    //     <div className='bg-gray-100 min-h-screen flex items-center justify-center'>
    //       {/* <LoadingSpinner /> */}
    //       {startLoading()}
    //     </div>
    //   )
    if (error)
        return (
            <div className='bg-gray-100 min-h-screen flex items-center justify-center'>
                <div className='bg-red-50 border border-red-300 text-red-700 p-6 rounded'>
                    {error}
                </div>
            </div>
        )

    const p = instituteProfile

    const rawValue = p?.AuthorizedPersonFirstName || ''

    // Extract Name (text before <a>)
    const nameMatch = rawValue ? rawValue.match(/^[^<]+/) : null
    const name = nameMatch ? nameMatch[0].trim() : ''

    const p1Match = rawValue.match(/P1=(\d+)/)
    const p2Match = rawValue.match(/P2=(\d+)/)
    const instAuthStaffID = p1Match ? p1Match[1] : ''
    const instAuthUserLoginID = p2Match ? p2Match[1] : ''

    // Extract Code
    const codeMatch = rawValue ? rawValue.match(/\(([^)]+)\)/) : null
    const code = codeMatch ? codeMatch[1] : ''
    const staffid = code ? code.slice(-6) : ''

    // Extract Image src
    const imgMatch = rawValue ? rawValue.match(/src="([^"]+)"/) : null
    const logoUrl = imgMatch ? imgMatch[1] : null

    const handleCodeClick = () => {
        setPrintData({
            staffID: staffid,
            userLoginID: code
        })
    }

    const handleReadyToPrint = printWindow => {
        setTimeout(() => {
            printWindow.focus()
            printWindow.print()
        }, 300)
    }

    const handleClosePopup = () => {
        setPrintData(null)
    }

   const InstituteDetailsPopUp = async (value, courseCode, isCode = false) => {
    if (!value) return;

    let finalInstituteId = value;

    try {
        if (isCode) {

            const res = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${value}`
            );

            if (!res.data?.Data) {
                Swal.fire({
                    title: 'Error',
                    text: 'Institute not found.',
                    icon: 'error'
                });
                return;
            }

            finalInstituteId = res.data.Data;
        }

        const popupWidth = 1000;
        const popupHeight = 750;

        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const popup = window.open(
            `${window.location.origin}/React/InstituteDetailsPrint?instituteId=${finalInstituteId}&courseCode=${courseCode}`,
            'InstituteDetailsPrint',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (!popup) {
            Swal.fire({
                title: 'Popup Blocked',
                text: 'Please allow popups for this website.',
                icon: 'error'
            });
        }

    } catch (err) {
        console.error("Popup error:", err);
        Swal.fire({
            title: 'Error',
            text: 'Failed to open institute details.',
            icon: 'error'
        });
    }
};

    const handleAuthorizedRepClick = () => {
        if (!authorizedRep) return

        const staffId = extractStaffId(authorizedRep.StaffProfileId)

        const popupWidth = 1000
        const popupHeight = 750
        const left = (window.screen.width - popupWidth) / 2
        const top = (window.screen.height - popupHeight) / 2

        window.open(
            `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${staffid}&userLoginID=${staffId}`,
            'StaffProfile',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )
    }


    const handleMembersClick = (id) => {
        if (!id) return

        const staffId = extractStaffId(id) // e.g. "123456" — the login ID

        // Extract the numeric staff ID from the HTML string (same way you do for instAuthStaffID)
        const p1Match = id.match(/P1=(\d+)/)
        const memberStaffID = p1Match ? p1Match[1] : staffId // fallback to staffId if no P1

        const popupWidth = 1000
        const popupHeight = 750
        const left = (window.screen.width - popupWidth) / 2
        const top = (window.screen.height - popupHeight) / 2

        window.open(
            `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${memberStaffID}&userLoginID=${staffId}`,
            'StaffProfile',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )
    }

    const handleInstituteAuthorizedRepClick = () => {
        if (!instAuthStaffID || !instAuthUserLoginID) return

        const popupWidth = 1000
        const popupHeight = 750
        const left = (window.screen.width - popupWidth) / 2
        const top = (window.screen.height - popupHeight) / 2

        window.open(
            `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${instAuthStaffID}&userLoginID=${instAuthUserLoginID}`,
            'StaffProfile',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )
    }

    const extractStaffId = htmlString => {
        if (!htmlString) return ''
        const match = htmlString.match(/>([^<]+)</)
        return match ? match[1] : ''
    }

    const handlePrincipalPromotorClick = () => {
        if (!principalPromoter) return


        const staffId = extractStaffId(principalPromoter.StaffProfileId)

        // Extract the numeric staff ID from the HTML string (same way you do for instAuthStaffID)
        const p1Match = principalPromoter.StaffProfileId.match(/P1=(\d+)/)
        const memberStaffID = p1Match ? p1Match[1] : staffId


        if (!staffId) {
            console.error("Invalid staffId")
            return
        }

        const popupWidth = 1000
        const popupHeight = 750
        const left = (window.screen.width - popupWidth) / 2
        const top = (window.screen.height - popupHeight) / 2

        window.open(
            `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${memberStaffID}&userLoginID=${staffId}`,
            'StaffProfile',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )
    }

    const handlePromotingOrganizationClick = () => {
        if (!promotingOrg?.ApplicationID) return

        const popupWidth = 1000
        const popupHeight = 750
        const left = (window.screen.width - popupWidth) / 2
        const top = (window.screen.height - popupHeight) / 2

        window.open(
            `${window.location.origin}/React/PromotingOrganizationPrint?instituteId=${instituteID}&promotingOrgId=${promotingOrg.ApplicationID}&userLoginID=${userLoginID}`,
            'PromotingOrganization',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )
    }

    return (
        <div className='bg-white p-4 md:p-10 min-h-screen'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    .no-print { display: none; }
                    body { background-color: white !important; }
                    * { -webkit-print-color-adjust: exact; }
                }
            `
                }}
            />

            {/* ── SECTION 1: Header + Institute Profile ── */}
            <div className='max-w-full mx-auto bg-white border border-black shadow-sm'>
                <div className='p-4 border-b border-black'>
                    <div className='flex justify-between items-center text-center'>
                        <img src={independencedayindia} alt='Emblem' className='h-20' />
                        <div className='flex-1 px-4'>
                            <h1 className='text-sm font-semibold'>
                                Government of Maharashtra
                            </h1>
                            <h2 className='text-sm'>
                                Skill, Employment, Entrepreneurship and Innovation Department
                            </h2>
                            <h2 className='text-sm font-bold text-blue-900 whitespace-nowrap'>
                                Maharashtra State Board of Skill, Vocational Education and
                                Training
                            </h2>
                            <h3 className='text-lg font-bold mt-1'>
                                Application for Letter of Intent (LoI)
                            </h3>
                        </div>
                        <img src={BoardLogo} alt='Logo' className='h-20' />
                    </div>
                    <div className='mt-4 border-t border-black pt-2 text-center text-sm font-semibold'>
                        <p>
                            Registration No.: {fmt(instituteStatus?.InstituteCode || p?.InstituteCode)}
                        </p>

                        <p>
                            Application Date:{' '}
                            {fmtDate(instituteStatus?.LetterOfIntentGenerationDate || inspectionDateRange?.InspectionRequestSubmissionDate)}
                            {/* {fmtDate(instituteStatus?.LetterOfIntentIssueDate || inspectionDateRange?.InspectionRequestSubmissionDate)} */}
                        </p>
                    </div>
                </div>

                <div className='overflow-x-auto p-4'>
                    <Table title='Institute Profile'>
                        <tbody>
                            <Row
                                label='Institute Type'
                                value={
                                    instituteProfile?.IsNewInst == 1 || instituteProfile?.IsNewInst == "1"
                                        ? 'Existing Institute'
                                        : 'New Institute'
                                }
                                colSpan={3}
                            />

                            {/* <Row
                label='Institute Name'
                value={`${fmt(p?.InstituteName)} SKILL DEVELOPMENT INSTITUTE (${p?.InstituteCode})`}
                colSpan={3}
                bold
              /> */}
                            <Row
                                label='Institute Name'
                                value={
                                    (instituteProfile?.IsNewInst == 1 || instituteProfile?.IsNewInst == "1")
                                        ? <>
                                            {fmt(p?.InstituteName)} (
                                            <span
                                                style={{
                                                    color: '#1D4ED8',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline'
                                                }}
                                                onClick={() => {
                                                    // console.log("Passing InstituteIDggggggggggggggggggg:", p?.InstituteID);  // Debug log
                                                    InstituteDetailsPopUp(p?.CollegeID, 0);
                                                }}
                                            >
                                                {p?.CollegeRegistrationNo || p?.InstituteCode}
                                            </span>
                                            )
                                        </>
                                        : <>{fmt(p?.InstituteName)} SKILL DEVELOPMENT INSTITUTE</>
                                }
                                colSpan={3}
                                bold
                            />

                            <tr className='bg-gray-50'>
                                <th
                                    colSpan={4}
                                    className='text-left p-2 border border-black font-bold'
                                >
                                    Institute Details
                                </th>
                            </tr>
                            <Row
                                label='Address'
                                value={fmt(p?.InstituteAddress)}
                                colSpan={3}
                            />
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Pin Code
                                </td>
                                <td className='p-2 border border-black'>{fmt(p?.PinCode)}</td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    City/Village
                                </td>
                                <td className='p-2 border border-black'>{fmt(p?.City)}</td>
                            </tr>
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Taluka
                                </td>
                                <td className='p-2 border border-black'>{fmt(p?.Taluka)}</td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    District
                                </td>
                                <td className='p-2 border border-black'>{fmt(p?.District)}</td>
                            </tr>
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    State
                                </td>
                                <td className='p-2 border border-black'>{fmt(p?.State)}</td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Location Category
                                </td>
                                <td className='p-2 border border-black'>
                                    {fmt(p?.LocationCategory)}
                                </td>
                            </tr>
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Phone No.
                                </td>
                                <td className='p-2 border border-black'>{fmt(p?.PhoneNo)}</td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    E-Mail ID
                                </td>
                                <td className='p-2 border border-black'>{fmt(p?.EMailID)}</td>
                            </tr>
                            <tr>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Website
                                </td>
                                <td className='p-2 border border-black'>{fmt(p?.WebSite)}</td>
                                <td className='p-2 border border-black font-semibold bg-gray-50'>
                                    Latitude, Longitude
                                </td>
                                <td className='p-2 border border-black'>
                                    {p?.Latitude && p?.Longitude
                                        ? `${p.Latitude}, ${p.Longitude}`
                                        : '—'}
                                </td>
                            </tr>
                            {/*value={authorizedRep ? `${authorizedRep.PromoterName} (${authorizedRep.PromoterLoginID || ''})` : '—'}*/}

                            <tr>
                                <td
                                    colSpan={4}
                                    className='p-2 border border-black font-semibold bg-gray-50'
                                >
                                    Authorized Representative of Institute
                                </td>
                            </tr>

                            <tr>
                                <td colSpan={4} className='p-2 border border-black'>
                                    <div className='flex items-center gap-2'>
                                        <span className='font-medium text-gray-800'>{name}</span>

                                        <span
                                            onClick={handleInstituteAuthorizedRepClick}
                                            className='text-blue-700 underline cursor-pointer'
                                        >
                                            ({code})
                                        </span>

                                        <img
                                            src={authorizedRep?.IsapprovedPromoter === 'V' ? logoUrl : rejected}
                                            alt='status'
                                            width='26'
                                        />
                                    </div>
                                </td>
                            </tr>

                            {printData && (
                                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                                    <div className='bg-white w-[90%] h-[90%] rounded-lg shadow-lg relative overflow-hidden'>
                                        {/* Close Button */}
                                        <button
                                            onClick={handleClosePopup}
                                            className='absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded'
                                        >
                                            X
                                        </button>

                                        {/* Your Component Inside Popup */}
                                        <div className='h-full overflow-auto p-4'>
                                            <Staff_PrintApplicationForm
                                                staffID={printData.staffID}
                                                userLoginID={printData.userLoginID}
                                                pageCode='STAFF_PRINT'
                                                onReadyToPrint={handleReadyToPrint}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </tbody>
                    </Table>

                    {/* Registration Numbers Table */}
                    <div className='mt-2'>
                        <div className='bg-gray-50 p-2 border border-black font-bold text-sm mb-0'>
                            Other Registration Details
                        </div>

                        <table className='w-full border border-black border-collapse text-sm'>
                            <thead>
                                <tr className='bg-gray-100'>
                                    <th className='border border-black p-2'>Sr. No.</th>
                                    <th className='border border-black p-2'>Particular</th>
                                    <th className='border border-black p-2'>Institute Code</th>
                                    <th className='border border-black p-2'>Registered Name</th>
                                    <th className='border border-black p-2'>Approval Date</th>
                                    <th className='border border-black p-2'>Approval Order</th>
                                </tr>
                            </thead>

                            <tbody>
                                {p?.lstOtherRegistrationDetailsEntity?.length > 0 ? (
                                    p.lstOtherRegistrationDetailsEntity.map((item, index) => (
                                        <tr key={index}>
                                            <td className='border border-black p-2 text-center'>
                                                {index + 1}
                                            </td>

                                            <td className='border border-black p-2'>
                                                {item.Particular || '—'}
                                            </td>

                                            <td className='border border-black p-2'>
                                                {item.InstituteCode}
                                            </td>

                                            <td className='border border-black p-2'>
                                                {item.RegisteredName}
                                            </td>

                                            <td className='border border-black p-2'>
                                                {fmtDate(item.ApprovalDate)}
                                            </td>

                                            <td className='border border-black p-2 text-center'>
                                                {item.ApprovalOrderPath ? (
                                                    <img
                                                        src={docIcon}
                                                        alt="Document"
                                                        className="w-5 h-5 mx-auto cursor-pointer"
                                                        onClick={() => window.open(item.ApprovalOrderPath, '_blank')}
                                                    />
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan='6'
                                            className='border border-black p-3 text-center text-gray-600'
                                        >
                                            No Other Registration Details Added
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── SECTION 2: Promoting Org + Courses ── */}
            <div className='max-w-full mx-auto bg-white border-x border-b border-black shadow-sm mt-0 p-4'>
                <Table>
                    <tbody>
                        {/* 🔹 Promoting Organization */}
                        <tr>
                            <td
                                colSpan={4}
                                className='bg-gray-100 p-2 border border-black text-sm'
                            >
                                Promoting Organization
                            </td>
                        </tr>
                        {/* <tr>
              <td colSpan={4} className='p-2 border border-black text-sm'>
                {promotingOrg
                  ? `${promotingOrg.NameOfPromotingOrganization} (${promotingOrg.ApplicationID})`
                  : '—'}
              </td>
            </tr> */}
                        <tr>
                            <td colSpan={4} className='p-2 border border-black'>
                                <div className='flex items-center gap-2'>
                                    <span className='font-medium text-gray-800'>
                                        {promotingOrg
                                            ? `${promotingOrg.NameOfPromotingOrganization}`
                                            : '-'}
                                    </span>
                                    {/* {console.log('Promoting Org:--------->>>>>>>>>>', promotingOrg)} */}

                                    <span
                                        onClick={handlePromotingOrganizationClick}
                                        className='text-blue-700 underline cursor-pointer'
                                    >
                                        ({promotingOrg ? `${promotingOrg.ApplicationID}` : '—'})
                                    </span>

                                    <img
                                        src={promotingOrg?.IsApprovedOrganizatioRegistrationNumber === 'V' ? logoUrl : rejected}
                                        alt='status'
                                        width='26'
                                    />
                                </div>
                            </td>
                        </tr>

                        {/* 🔹 Authorized Representative */}
                        <tr>
                            <td
                                colSpan={4}
                                className='bg-gray-100 p-2 border border-black text-sm'
                            >
                                Authorized Representative of Promoting Organization
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={4} className='p-2 border border-black text-sm'>
                                {authorizedRep ? (
                                    <div className='flex items-center gap-2'>
                                        <span className='font-medium text-gray-800'>
                                            {getFullName(authorizedRep)}
                                        </span>
                                        <span
                                            onClick={handleAuthorizedRepClick}
                                            className='text-blue-700 underline cursor-pointer'
                                        >
                                            ({extractStaffId(authorizedRep.StaffProfileId)})
                                        </span>
                                        <img
                                            src={authorizedRep.IsapprovedPromoter === 'V' ? logoUrl : rejected}
                                            alt='status'
                                            width='26'
                                        />
                                    </div>
                                ) : (
                                    '—'
                                )}
                            </td>
                        </tr>

                        {/* 🔹 Principal Promoter */}
                        <tr>
                            <td
                                colSpan={4}
                                className='bg-gray-100 p-2 border border-black text-sm'
                            >
                                Principal Promoter
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={4} className='p-2 border border-black text-sm'>
                                {principalPromoter ? (
                                    <div className='flex items-center gap-2'>
                                        <span className='font-medium text-gray-800'>
                                            {getFullName(principalPromoter)}{' '}
                                        </span>
                                        <span
                                            onClick={handlePrincipalPromotorClick}
                                            className='text-blue-700 underline cursor-pointer'
                                        >
                                            ({extractStaffId(principalPromoter.StaffProfileId)})
                                        </span>
                                        <img
                                            src={principalPromoter.IsapprovedPromoter === 'V' ? logoUrl : rejected}
                                            alt='status'
                                            width='26'
                                        />
                                    </div>
                                ) : (
                                    '—'
                                )}
                            </td>
                        </tr>

                        {/* 🔹 Members */}
                        {members.length > 0 && (
                            <>
                                <tr>
                                    <td
                                        colSpan={4}
                                        className='bg-gray-100 p-2 border border-black text-sm'
                                    >
                                        Members
                                    </td>
                                </tr>

                                {members.map((m, index) => (
                                    <tr key={index}>
                                        <td colSpan={4} className='p-2 border border-black text-sm'>
                                            <div className='flex items-center gap-2'>
                                                <span>{getFullName(m)}</span>
                                                <span className='text-blue-700 underline cursor-pointer'
                                                    onClick={() =>
                                                        handleMembersClick(m.StaffProfileId)
                                                    }>
                                                    ({extractStaffId(m.StaffProfileId)})
                                                </span>
                                                <img
                                                    src={m.IsapprovedPromoter === 'V' ? logoUrl : rejected}
                                                    alt='status'
                                                    width='26'
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}

                        {/* 🔹 Affiliated Institutes */}
                        {affiliated.length > 0 && (
                            <>
                                <tr>
                                    <td
                                        colSpan={4}
                                        className='bg-gray-100 p-2 border border-black text-sm'
                                    >
                                        Affiliated Institutes
                                    </td>
                                </tr>

                                {affiliated.map(item => {
                                    const code = extractCode(item.InstituteCode)
                                    const isVerified = item.IsVerified === 'V'

                                    return (
                                        <tr key={item.AssociatedInstituteID}>
                                            <td
                                                colSpan={4}
                                                className='p-2 border border-black text-sm'
                                            >
                                                <div className='flex items-center gap-2'>
                                                    {item.NameofInstitute}
                                                    <span
                                                        className='text-blue-700 underline cursor-pointer'
                                                        onClick={() =>
                                                            InstituteDetailsPopUp(item.InstituteID, 0)
                                                        }
                                                    >
                                                        ({code})
                                                    </span>
                                                    <img
                                                        src={isVerified ? logoUrl : rejected}
                                                        alt='status'
                                                        width='26'
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </>
                        )}

                        {/* 🔹 Applied Institutes */}
                        {applied.length > 0 && (
                            <>
                                <tr>
                                    <td
                                        colSpan={4}
                                        className='bg-gray-100 p-2 border border-black text-sm'
                                    >
                                        Applied Institute
                                    </td>
                                </tr>

                                {applied.map(item => {
                                    const code = extractCode(item.InstituteCode)
                                    const isVerified = item.IsVerified === 'V'

                                    return (
                                        <tr key={item.AssociatedInstituteID}>
                                            <td
                                                colSpan={4}
                                                className='p-2 border border-black text-sm'
                                            >
                                                <div className='flex items-center gap-2'>
                                                    {item.NameofInstitute}
                                                    <span
                                                        className='text-blue-700 underline cursor-pointer'
                                                        onClick={() =>
                                                            InstituteDetailsPopUp(
                                                                item.AssociatedInstituteID,
                                                                0
                                                            )
                                                        }
                                                    >
                                                        ({code})
                                                    </span>
                                                    <img
                                                        src={isVerified ? logoUrl : rejected}
                                                        alt='status'
                                                        width='26'
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </>
                        )}
                    </tbody>
                </Table>



                <div className='border-black'>
                    {/* <div className='bg-gray-100 p-2 font-bold text-sm'>
            Proposed Course
          </div> */}
                    <SectionHeader title='Proposed Course' />
                    <DataTable
                        headers={[
                            'S.N.',
                            'Sector',
                            'CourseType',
                            'Course',
                            'Approved Units',
                            'LoI Units',
                            'Total',

                            'Inspection Fee',
                            'Security Deposit'
                        ]}
                        rows={[
                            ...courseData.map((c, index) => ({
                                __cells: [
                                    index + 1,
                                    c.Sector,
                                    c.CourseType,
                                    c.CourseWithCourseCode || c.CourseName || '—',
                                    c.ApprovedUnits ?? 0,
                                    c.LOIProposedUnits ?? 0,
                                    c.TotalUnits ?? 0,

                                    c.InspectionFee ?? 0,
                                    c.SecurityDeposit ?? 0
                                ]
                            })),

                            {
                                __cells: [
                                    '',
                                    '',
                                    'Total',
                                    '',
                                    totals.ApprovedUnits,
                                    totals.LOIProposedUnits,
                                    totals.TotalUnits,

                                    totals.InspectionFee,
                                    totals.SecurityDeposit
                                ]
                            }
                        ]}
                    />
                </div>
            </div>




            <div className='max-w-full mx-auto mt-2 flex flex-col items-center justify-center'>
                <h2
                    className='text-lg font-bold text-gray-800 tracking-wide'
                    style={{ fontFamily: 'serif' }}
                >
                    !! कौशल्यम् बलम् !!
                </h2>
            </div>
        </div>
    )
}

