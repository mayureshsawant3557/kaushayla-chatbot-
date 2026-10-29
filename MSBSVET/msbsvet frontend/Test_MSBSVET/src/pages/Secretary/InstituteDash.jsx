import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import agent from '../../lib/api/agent';
import Swal from 'sweetalert2';
import OTPService from '../../Component/formcomponent/OTPService';
import { useAuth } from '../../Hooks/AuthContext';
import Button from '../../Component/base/Button';
import { ThemeContext } from '../../Component/Context/ThemeContext';
import useLoading from '../../hooks/useLoading';
import Loader from '../../Component/formcomponent/Loader';

String.prototype.getHashCode = function () {
    let hash = 0;
    if (this.length === 0) return hash;
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};
const pageRouteMap = {
    "InstitutePayment.aspx": "/Institute/InstitutePayment",
    "PromotingOrganization.aspx": "/Institute/PromotingOrganization",
    "PromotersDetails.aspx": "/Institute/PromotersDetails",
    "ProposedInstituteDetails.aspx": "/Institute/ProposedInstituteDetails",
    "ProposedCourse.aspx": "/Institute/ProposedCourse",
    "SelfDeclaration.aspx": "/Institute/SelfDeclaration",
    "LOIGeneration.aspx": "/Institute/LOIGeneration"
};
const parseTitle = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const a = doc.querySelector("a");
    if (!a) return null;

    const href = a.getAttribute("href");
    const text = a.textContent.trim();

    const url = new URL(href, window.location.origin);

    const p1 = url.searchParams.get("P1");
    const p2 = url.searchParams.get("P2");

    // Extract file name (important)
    const pathname = url.pathname;
    const pageName = pathname.split("/").pop();

    return { p1, p2, name: text, pageName };
};

const InstituteDash = () => {
    const { userInfo } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isLoading, startLoading, stopLoading } = useLoading();


    const P1 = searchParams.get('P1');
    const P2 = searchParams.get('P2');

    // State variables
    const [instituteNameCode, setInstituteNameCode] = useState('');
    const [applicationIntentDate, setApplicationIntentDate] = useState('');
    const [loiIssueDate, setLoiIssueDate] = useState('');
    const [loiExpiryDate, setLoiExpiryDate] = useState('');
    const [showLOIGenerated, setShowLOIGenerated] = useState(false);
    const [showLOIIssueButton, setShowLOIIssueButton] = useState(false);
    const [instituteStatusList, setInstituteStatusList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mobileNo, setMobileNo] = useState("");
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [ipAddress, setIpAddress] = useState("");
    const { color } = useContext(ThemeContext);

    useEffect(() => {

        if (!P1) {
            Swal.fire("Error", "Invalid access - Missing institute ID", "error");
            navigate(-1);
            return;
        }

        const calculatedHash = P1.toString().getHashCode().toString();

        if (calculatedHash === P2) {
            loadInstituteDash();
        } else {
            Swal.fire("Error", "Your URL has been modified or is invalid", "error");
            navigate(-1);
        }
    }, [P1, P2]);

    const otpService = OTPService({
        mobileNo: mobileNo,
        purpose: 'VerifyMobileNo',
        isVerifyRequired: true,
        messege: "OTP verification required",

        onSuccess: async () => {
            setIsOtpVerified(true);
            await issueLOIAfterOTP();
        },

        onError: (error) => {
            Swal.fire("Error", error.message || "OTP failed", "error");
        }
    });
    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
    };

    const loadInstituteDash = async () => {
        //setLoading(true);
        startLoading();
        try {
            const instituteID = parseInt(P1);

            const response = await agent.get(
                "/api/InstituteBase/GetInstituteDashboard",
                {
                    params: {
                        InstituteID: instituteID,
                        InstituteCode: ""
                    }
                }
            );


            const tables = response.data?.Data || [];


            if (tables[0] && tables[0].length > 0) {
                const institute = tables[0][0];
                setInstituteNameCode(institute.InstituteNameCode || institute.InstituteName || 'N/A');
            } else {
                setInstituteNameCode("Institute not found");
            }


            if (tables[1] && tables[1].length > 0) {
                setInstituteStatusList(tables[1]);
            } else {
                setInstituteStatusList([]);
            }


            if (tables[2] && tables[2].length > 0) {
                const summary = tables[2][0];

                setApplicationIntentDate(summary.LetterOfIntentGenerationDate || '');
                setLoiIssueDate(summary.LetterOfIntentIssueDate || '');
                setLoiExpiryDate(summary.LetterOfIntentExpiryDate || '');

                const showIssue = summary.DisplayIssueLetterOFindent === 'Y';
                const showPrint = summary.DisplayPrintLetterOFindent === 'Y';

                setShowLOIIssueButton(showIssue);
                setShowLOIGenerated(showPrint);

            }

        } catch (error) {
            Swal.fire("Error", "Failed to load dashboard data", "error");
        } finally {
            //setLoading(false);
            stopLoading();
        }
    };



    const getUserMobile = async () => {
        try {
            const userID = userInfo?.UserID;

            if (!userID) return null;

            const res = await agent.get(`/api/UserManagement/GetUserDetails/${userID}`);

            const userData = res?.data;

            return userData?.UserMobileNo;

        } catch (err) {
            return null;
        }
    };



    const handleIssueLOI = async () => {
        // try {
        //     const instituteId = new URLSearchParams(window.location.search).get("P1");

        //     const response = await agent.post("/api/PromotionalOrganisation/GetPromoterDetailsByInstituteID", {
        //         instituteId: parseInt(instituteId),
        //         userLoginID: userInfo?.UserLoginID,
        //         pageCode: "LetterOfIntentIssued",
        //         ipAddress: ipAddress
        //     });

        //     let mobile = "";

        //     if (response.data?.Status === "Success" && response.data?.Data?.length > 0) {
        //         mobile = response.data.Data[0].MobileNo;
        //     }

        //     if (!mobile) {
        //         Swal.fire("Error", "Mobile number not found", "error");
        //         return;
        //     }

        //     setMobileNo(String(mobile));

        //     await otpService.startVerification(String(mobile));

        // } catch (err) {
        //     Swal.fire("Error", "Failed to start OTP", "error");
            // }

            try {
                const mobile = await getUserMobile();

                if (!mobile) {
                    Swal.fire("Error", "Mobile number not found", "error");
                    return;
                }

                setMobileNo(String(mobile));

                await otpService.startVerification(String(mobile));

            } catch (err) {
                Swal.fire("Error", "Failed to start OTP", "error");
            }
    };

    const issueLOIAfterOTP = async () => {
        try {
            const instituteId = new URLSearchParams(window.location.search).get("P1");

            const payload = {
                instituteID: parseInt(instituteId),
                remark: "",
                status: "V",
                pageCode: "LetterOfIntentIssued",
                createdBy: userInfo?.UserLoginID,
                ipAddress: ipAddress
            };


            const response = await agent.post(
                "/api/InstituteBase/update-verification-status",
                payload
            );

            if (response.data?.success) {
                Swal.fire("Success", "LOI Issued Successfully", "success");
                loadInstituteDash(); // refresh
            } else {
                throw new Error(response.data?.message);
            }

        } catch (err) {
            Swal.fire("Error", err.message || "Failed to issue LOI", "error");
        }
    };
    const handleClose = () => {
        navigate('/SDILOI/SkillDevelopmentSearch');
    };



    const handlePrintLOI = () => {
        const hash = P1.toString().getHashCode().toString();

        window.open(
            `${window.location.origin}/React/PrintLOI?P1=${P1}&P2=${hash}`,
            '_blank',
            'width=1000,height=600,resizable=yes,scrollbars=yes'
        );
    };

    const handlePrintApplication = () => {
        const hash = P1.toString().getHashCode().toString();

        window.open(
            `${window.location.origin}/React/LOIApplicationPrintForm?P1=${P1}&P2=${hash}`,
            '_blank',
            'width=1000,height=600,resizable=yes,scrollbars=yes'
        );
    };

    const getStatusIcon = (status) => {
        if (status === 'V') {
            return <img src="https://msbsvet.edu.in/Images/RightSign.png" alt="Verified" style={{ width: '30px' }} />;
        } else if (status === 'R') {
            return <img src="https://msbsvet.edu.in/Images/QuestionMark.png" alt="Rejected" style={{ width: '30px' }} />;
        } else {
            return <img src="https://msbsvet.edu.in/Images/QuestionMark.png" alt="Pending" style={{ width: '30px' }} />;
        }
    };

    if (isLoading) {
        return (
            // <div className="p-4 text-center">
            //     <div className="spinner-border text-primary" role="status">
            //         <span className="sr-only">Loading...</span>
            //     </div>
            //     <p>Loading dashboard data...</p>
            // </div>
            <Loader />
        );
    }

    return (
        <div className="p-4">
            <style>{`
               .loi-status-card {
    display: grid;
    grid-template-columns: 350px auto;  
    justify-content: center;           
    row-gap: 8px;
    text-align: left;
}
                
                .info-row {
                    display: flex;
                    margin-bottom: 0.5rem;
                }
                
              .info-label {
    text-align: right;  
    padding-right: 10px;
    font-weight: 400;
}
                
               .info-value {
    text-align: left;
}
                
                .status-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                }
                
                .status-table th,
                .status-table td {
                    border: 1px solid #c5c5c5; 
                    padding: 10px;
                    text-align: left;
                }
                
                .status-table th {
                
                    font-weight: 600;
                }
                
                .status-table td.text-center {
                    text-align: center;
                }
                
                .download-section {
                    margin: 1rem 0;
                }
                
                .download-title {
                    font-weight: bold;
                    font-size: 1rem;
                    margin-bottom: 0.5rem;
                }
                
                .download-buttons {
                    display: flex;
                    flex-direction: column;
                   align-items: flex-start;
                   gap: 12px;
                }
                
                .btn {
                    border: none;
                    cursor: pointer;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-size: 14px;
                    width: auto;
display: inline-block;
                    transition: background-color 0.3s;
                }
                
                .btn-info {
                    background-color: #17a2b8;
                    color: white;
                }
                
                .btn-info:hover {
                    background-color: #138496;
                }
                
                .btn-success {
                    background-color: #28a745;
                    color: white;
                }
                
                .btn-success:hover {
                    background-color: #218838;
                }
                
                .btn-warning {
                    background-color: #ffc107;
                    color: #212529;
                }
                
                .btn-warning:hover {
                    background-color: #e0a800;
                }
                
                .btn-secondary {
                    background-color: #6c757d;
                    color: white;
                }
                
                .btn-secondary:hover {
                    background-color: #5a6268;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                    justify-content: center;
                }
                    .loi-info-box {
    background: #f8f9fa;
    border: 1px solid #dcdcdc;
    border-radius: 6px;
    padding: 15px;
    margin: 10px 0;

    text-align: left;   
}

.info-line {
    margin: 4px 0;
    font-size: 15px;
}

.label {
    font-weight: 500;
    margin-right: 5px;
}

.value {
    font-weight: 400;
}
            `}</style>

            <fieldset className="rounded border border-gray-300 p-4 mb-6 bg-white shadow-sm">
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                    LoI Status
                </legend>

                {/* 🔹 INFO BOX */}
                <div className="loi-info-box">
                    <div className="info-line">
                        <span className="label">Applicant :</span>
                        <span className="value">{instituteNameCode || '—'}</span>
                    </div>

                    <div className="info-line">
                        <span className="label">Date of Application for Letter of Intent :</span>
                        <span className="value">{applicationIntentDate || '—'}</span>
                    </div>

                    {showLOIGenerated && (
                        <>
                            <div className="info-line">
                                <span className="label">LoI Issuance Date :</span>
                                <span className="value">{loiIssueDate || '—'}</span>
                            </div>

                            <div className="info-line">
                                <span className="label">Expiry of LoI :</span>
                                <span className="value">{loiExpiryDate || '—'}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* 🔹 TABLE (MOVE THIS INSIDE FIELDSET) */}
                <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                    <table className="status-table ">
                        <thead >
                            <tr>
                                <th className={`${color} text-white`} style={{ width: '5%', textAlign: 'center' }}>S.N.</th>
                                <th className={`${color} text-white`} style={{ width: '35%', textAlign: 'center' }}>Section</th>
                                <th className={`${color} text-white`} style={{ width: '15%', textAlign: 'center' }}>Verification Status</th>
                                <th className={`${color} text-white`} style={{ width: '50%', textAlign: 'center' }}>Reason of Rejection/ Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instituteStatusList.length > 0 ? (
                                instituteStatusList.map((item, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{index + 1}</td>
                                        <td>
                                            <span
                                                style={{
                                                    color: "#3399ff",
                                                    cursor: "pointer",
                                                    textDecoration: "underline"
                                                }}
                                                onClick={() => {
                                                    const data = parseTitle(item.Title);
                                                    if (!data) return;

                                                    const route = pageRouteMap[data.pageName];
                                                    if (!route) {
                                                        return;
                                                    }

                                                    // Use the current page's P1 and P2 if parsed ones are missing
                                                    const finalP1 = data.p1 || P1;
                                                    const finalP2 = data.p2 || P2;


                                                    if (finalP1 && finalP2) {
                                                        navigate(`${route}?P1=${finalP1}&P2=${finalP2}`);
                                                    } else if (finalP1) {
                                                        const hash = finalP1.toString().getHashCode().toString();
                                                        navigate(`${route}?P1=${finalP1}&P2=${hash}`);
                                                    } else {
                                                        navigate(route);
                                                    }
                                                }}
                                            >
                                                {parseTitle(item.Title)?.name || `Section ${index + 1}`}
                                            </span>
                                        </td>
                                        <td><span className='flex justify-center'>{getStatusIcon(item.PageStatus)}</span></td>
                                        <td className="text-center">{item.Remark || '—'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>No data found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 🔹 DOWNLOAD */}
                <div className="download-section">
                    <div className="download-title">Download</div>
                    <div className="download-buttons">
                        <Button variant="info" onClick={handlePrintApplication}>
                            LoI Application
                        </Button>

                        {showLOIGenerated && (
                            <Button variant="success" onClick={handlePrintLOI}>
                                Letter of Intent
                            </Button>
                        )}
                    </div>
                </div>

                {/* 🔹 CLOSE BUTTON */}
                <div className="flex justify-center items-center gap-4 mt-4">
                    {showLOIIssueButton && (
                        <Button variant='success'

                            onClick={handleIssueLOI}
                        >
                            Issue Letter of Intent
                        </Button>
                    )}
                    {/* <button
                        className="bg-gray-500 text-white px-3 py-1 rounded w-auto"
                        onClick={handleClose}
                    >
                        Close
                    </button> */}
                    <Button variant='secondary'

                        onClick={handleClose}
                    >
                        Close
                    </Button>
                </div>
            </fieldset>
        </div>
    );
};

export default InstituteDash;