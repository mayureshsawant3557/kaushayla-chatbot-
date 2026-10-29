import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import agent from '../../lib/api/agent';
import { GetCandidateIDByApplicationID } from '../../Endpoints_All/Base/masterData';
import ReactDOM from 'react-dom/client';
import PrintAdmissionCancellationLetter from '../SuperAdmin/Reports/PrintAdmissionCancellationLetter';
import { admissionApplicationStatus } from '../../Endpoints_All/Admission/admission';
import { getDeviceIP } from '../../utils/CommonHelper';
import {useAuth} from "../../Hooks/AuthContext"

const CancelAdmissionDetails = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const {userInfo} = useAuth();
    const user = userInfo;

    const [data, setData] = useState(null);
    const [courseDetails, setCourseDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Fee details
    const [totalCourseFees, setTotalCourseFees] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [refundFee, setRefundFee] = useState('');
     const [ipAddress, setIpAddress] = useState("0.0.0.0");

    // Cancellation details
    const [cancellationReason, setCancellationReason] = useState('');

    // Document return status
    const [documentReturnStatus, setDocumentReturnStatus] = useState({});

    useEffect(() => {
        fetchAdmissionSummary();
        fetchIP();
    }, []);


 const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
        };
    const fetchAdmissionSummary = async () => {
        try {
            setLoading(true);

            const candidateRes = await agent.get(
                `${GetCandidateIDByApplicationID}?applicationID=${state?.P1}`
            );
            const candidateID = candidateRes.data?.Data;

            const response = await agent.get("/api/Admission/admission-summary", {
                params: {
                    candidateID: candidateID,
                    applicationID: state?.P1,
                    courseID: state?.C1,
                    collegeID: state?.C2,
                    roundID: state?.R1,
                    userLoginID: user?.UserLoginID,
                    reportingStatus: "Y",
                    flag: "CancelAdmission"
                }
            });

            const responseData = response.data?.Data || response.data;

            // Remove duplicate documents
            if (responseData?.ListRequiredDocumentSummary && Array.isArray(responseData.ListRequiredDocumentSummary)) {
                const uniqueDocs = [];
                const seenDocIds = new Set();
                const originalCount = responseData.ListRequiredDocumentSummary.length;

                for (const doc of responseData.ListRequiredDocumentSummary) {
                    if (!seenDocIds.has(doc.DocumentID)) {
                        seenDocIds.add(doc.DocumentID);
                        uniqueDocs.push(doc);
                    }
                }
                responseData.ListRequiredDocumentSummary = uniqueDocs;
            }

            setData(responseData);

            // Set fee values
            if (responseData?.AllotmentSummary) {
                setTotalCourseFees(responseData.AllotmentSummary.CourseFee || '0');
                setAmountPaid(responseData.AllotmentSummary.PaidCourseFee || '0');
                setRefundFee(responseData.AllotmentSummary.PaidCourseFee || '0');
            }

            const courseID = responseData?.AllotmentSummary?.CourseID ?? state?.C1 ?? null;
            if (courseID) {
                await fetchCourseDetails(courseID);
            }

        } catch (error) {
          const statusMessage = await getAdmissionStatusMessage(
    state?.ApplicationIDDisplay || state?.P1
);

setErrorMessage(statusMessage);
        } finally {
            setLoading(false);
        }
    };
    const getApplicationID = async (applicationDisplayID) => {
    try {
        const response = await agent.get(
            getApplicationIDByApplicationIDDisplay,
            {
                params: {
                    ApplicationIDDisplay: applicationDisplayID
                }
            }
        );

        return response.data?.Data || 0;
    } catch (error) {
        return 0;
    }
};

const getAdmissionStatusMessage = async (applicationDisplayID) => {
    try {
        const applicationID = await getApplicationID(
            applicationDisplayID
        );

        if (!applicationID) return "";

        const response = await agent.get(
            admissionApplicationStatus,
            {
                params: {
                    ApplicationID: applicationID,
                    CollegeID: state?.C2,
                    UserTypeID: userInfo?.UserTypeID
                }
            }
        );


        return response.data || "";
    } catch (error) {
        return "";
    }
};

    const fetchCourseDetails = async (courseId) => {
        try {
            const response = await agent.get(`/api/InstituteBase/GetCourseDetails/${courseId}`);
            const courseData = response.data?.Data || response.data || response;
            setCourseDetails(courseData);
        } catch (error) {
        }
    };

    const handleRefundChange = (value) => {
        const refundAmount = parseFloat(value) || 0;
        const paidAmount = parseFloat(amountPaid) || 0;

        if (refundAmount > paidAmount) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Refund Fee should be less than or equal to Paid Course Fee',
                confirmButtonColor: '#3085d6'
            });
            setRefundFee(paidAmount.toString());
        } else {
            setRefundFee(value);
        }
    };

    const buildDocumentsXML = () => {
        let xmlString = "<DocumentList>";

        const documentsWithUrl = data?.ListRequiredDocumentSummary?.filter(doc => doc.DocumentUrl && doc.DocumentUrl.trim().length > 0) || [];

        documentsWithUrl.forEach((doc) => {
            const documentReturnStatusValue = documentReturnStatus[doc.DocumentID] || "N";

            xmlString += `<Document>
                <DocumentID>${doc.DocumentID}</DocumentID>
                <IsVerifyAtinstitute>${doc.InstituteVerificationStatus || "N"}</IsVerifyAtinstitute>
                <IsSubmittedAtinstitute>${doc.IsOrignalDocumentSubmitted || "N"}</IsSubmittedAtinstitute>
                <IsOrignalSubmittedReturn>${documentReturnStatusValue}</IsOrignalSubmittedReturn>
            </Document>`;
        });

        xmlString += "</DocumentList>";
        return xmlString;
    };

    const validateCancelAdmission = async () => {
        if (!cancellationReason || cancellationReason.trim().length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please enter Reason for Cancellation',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        if (!refundFee || parseFloat(refundFee) < 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please enter Refund Fee',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        const paidAmount = parseFloat(amountPaid) || 0;
        const refundAmount = parseFloat(refundFee) || 0;

        if (refundAmount > paidAmount) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Refund Fee should be less than or equal to Paid Course Fee',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        // Check if all compulsory documents have return status selected
        const compulsoryDocs = data?.ListRequiredDocumentSummary?.filter(
            doc => doc.IsDocumentCompulsory && doc.DocumentUrl && doc.DocumentUrl.trim().length > 0
        ) || [];

        const missingReturnStatus = compulsoryDocs.some(doc => {
            const status = documentReturnStatus[doc.DocumentID];
            return !status || status === '-1';
        });

        if (missingReturnStatus) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please select Original Document Return status for all compulsory documents',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        return true;
    };

    const showPasswordPopup = () => {
        return new Promise((resolve) => {
            Swal.fire({
                title: 'Password Details',
                html: `
                <div style="text-align: left;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: 500; margin-bottom: 5px;">Candidate Login</div>
                        <input type="password" id="cancel-password" placeholder="Password" style="width: 100%; padding: 8px 10px; border: 1px solid #ccc; border-radius: 3px; font-size: 14px;">
                    </div>
                </div>
                `,
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Verify Password',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                preConfirm: async () => {
                    const password = document.getElementById('cancel-password').value;
                    if (!password) {
                        Swal.showValidationMessage('Please enter Password');
                        return false;
                    }

                    Swal.showLoading();
                    const isValid = await validateCandidatePassword(password);

                    if (!isValid) {
                        Swal.showValidationMessage('Invalid Password. Please try again.');
                        return false;
                    }

                    return true;
                },
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then((result) => {
                if (result.isConfirmed) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    };

    const validateCandidatePassword = async (password) => {
        try {
            const profileId = data?.CandidatePrimarySummary?.ProfileID;

            if (!profileId) {
                const candidateRes = await agent.get(
                    `${GetCandidateIDByApplicationID}?applicationID=${state?.P1}`
                );
                const candidateID = candidateRes.data?.Data;
                const profileResponse = await agent.get(`/Base/GetCandidateProfileIDByCandidateId`, {
                    params: { candidateID: candidateID }
                });
                const fallbackProfileId = profileResponse.data?.Data;
                if (!fallbackProfileId) return false;

                const verifyResponse = await agent.get(`/Base/IsPasswordValid`, {
                    params: {
                        UserLoginID: fallbackProfileId,
                        UserPassword: password
                    }
                });

                return verifyResponse.data?.Data === true || verifyResponse.data?.Data === "true" || verifyResponse.data === true;
            }
            const hashedPassword = btoa(password);

            const verifyResponse = await agent.get(`/Base/IsPasswordValid`, {
                params: {
                    UserLoginID: profileId,
                    UserPassword: hashedPassword
                }
            });

            return verifyResponse.data?.Data === true || verifyResponse.data?.Data === "true" || verifyResponse.data === true;
        } catch (error) {
            return false;
        }
    };
    const fetchCourseDetailsForPrint = async (courseId) => {
        if (!courseId) return {};
        try {
            const response = await agent.get(`/api/InstituteBase/GetCourseDetails/${courseId}`);
            return response.data?.Data || {};
        } catch (error) {
            return {};
        }
    };

    const fetchCancellationSummaryForPrint = async () => {
    try {
        const candidateRes = await agent.get(
            `${GetCandidateIDByApplicationID}?applicationID=${state?.P1}`
        );
        const candidateID = candidateRes.data?.Data;

        const response = await agent.get("/api/Admission/admission-summary", {
            params: {
                candidateID,
                applicationID: state?.P1,
                courseID: state?.C1,
                collegeID: state?.C2,
                roundID: state?.R1,
                userLoginID: user?.UserLoginID,
                reportingStatus: "C",
                flag: "CancelAdmission"
            }
        });

        const summaryData = response.data?.Data || response.data;

        if (summaryData) {
            const primaryData = summaryData.CandidatePrimarySummary || {};
            const allotmentData = summaryData.AllotmentSummary || {};
            const courseId = allotmentData.CourseID || state?.C1;
            const courseDetailsData = await fetchCourseDetailsForPrint(courseId);
            const documentsData = summaryData.ListRequiredDocumentSummary || [];

            return {
                // Basic candidate info
                applicationId: primaryData.ApplicationID || "",
                itiRegistrationNo: primaryData.ITIRegistrationNo || "",
                candidateName: [primaryData.FirstName, primaryData.MiddleName, primaryData.LastName].filter(Boolean).join(" "),
                gender: primaryData.Gender || "",
                dob: primaryData.DOB || "",
                aadhaarNo: primaryData.AadhaarNo || "",
                mobileNo: primaryData.MobileNo || "",
                altMobileNo: primaryData.AltMobileNo || "",
                email: primaryData.EMailID || "",
                photoPath: primaryData.PhotoFilePath || "",
                signaturePath: primaryData.SignFilePath || "",

                // Admission Confirmation Date & Time (from ReportedDateTime)
                admissionConfirmationDateTime: allotmentData.ReportedDateTime || "",

                // Institute and Course Details
                instituteCode: allotmentData.AllottedChoiceCode || "",
                instituteName: allotmentData.AllottedCollege || "",
                courseName: courseDetailsData?.Course || "",
                courseCode: courseDetailsData?.CourseCode || "",
                courseApprovedBy: courseDetailsData?.CourseApprover || "",
                sector: courseDetailsData?.Sector || "",
                subSector: courseDetailsData?.SubSector || "",
                courseType: courseDetailsData?.CourseType || "",
                fullTimePartTime: courseDetailsData?.FullTimePartTime || "",
                duration: courseDetailsData?.Duration && courseDetailsData?.DurationUnit
                    ? `${courseDetailsData.Duration} ${courseDetailsData.DurationUnit}` : "",

                // Cancellation Details
                cancellationDateTime: allotmentData.CancelledDateTime || new Date().toLocaleString(),
                cancellationComments: cancellationReason || "", // This is the Remark field

                // Fee details
                courseFee: totalCourseFees,
                paidCourseFee: amountPaid,
                refundAmount: refundFee,

                // Documents with proper status formatting
                documents: documentsData.map(doc => ({
                    documentName: doc.DocumentName,
                    verificationStatus: doc.InstituteVerificationStatus || "N",
                    originalSubmitted: doc.IsOrignalDocumentSubmitted || "N",
                    originalReturned: documentReturnStatus[doc.DocumentID] || "N"
                })),

                // Print metadata
                printedBy: user?.UserName || user?.UserLoginID || "",
                cancelledBy: "Student"
            };
        }

        return null;
    } catch (error) {
        return null;
    }
};

    const getCancellationPrintHTML = async (printData) => {
        // Double-check that printData is not null or empty
        if (!printData) {
            return "<div>Error: No data available for printing</div>";
        }


        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);

        const root = ReactDOM.createRoot(tempDiv);
        root.render(<PrintAdmissionCancellationLetter data={printData} />);

        await new Promise(resolve => setTimeout(resolve, 100));

        const htmlContent = tempDiv.innerHTML;

        root.unmount();
        document.body.removeChild(tempDiv);

        return htmlContent;
    };
    const handlePrintWithWindow = async (printData) => {
        const popupWidth = 1000;
        const popupHeight = 750;

        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const printWindow = window.open(
            "",
            "PrintAdmissionCancellationLetter",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (!printWindow) {
            Swal.fire("Popup Blocked", "Please allow popups for this website.", "warning");
            return false;
        }

        const printContent = await getCancellationPrintHTML(printData);
        const allStyles = getAllStyles();

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Admission Cancellation Letter</title>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    ${allStyles}
                    @media print {
                        body {
                            margin: 0;
                            padding: 20px;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                        button {
                            display: none !important;
                        }
                    }
                    .page-break {
                        page-break-before: always;
                    }
                </style>
            </head>
            <body style="margin: 0; padding: 20px; background: white;">
                <div class="print-container" style="max-width: 1200px; margin: 0 auto;">
                    ${printContent}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                <\/script>
            </body>
        </html>
    `);

        printWindow.document.close();
        return true;
    };

    const getAllStyles = () => {
        let styles = '';
        const styleSheets = document.styleSheets;
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                if (rules) {
                    for (let j = 0; j < rules.length; j++) {
                        styles += rules[j].cssText;
                    }
                }
            } catch (e) {
            }
        }
        return styles;
    };

    const handleCancelAdmission = async () => {
        const isValid = await validateCancelAdmission();
        if (!isValid) return;

        const isPasswordVerified = await showPasswordPopup();
        if (!isPasswordVerified) return;

        const result = await Swal.fire({
            title: 'Cancel Admission',
            text: 'Are you sure you want to cancel this admission? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Cancel Admission',
            cancelButtonText: 'No, Go Back'
        });

        if (!result.isConfirmed) return;

        setCancelling(true);

        try {
            const candidateRes = await agent.get(
                `${GetCandidateIDByApplicationID}?applicationID=${state?.P1}`
            );
            const candidateID = candidateRes.data?.Data;

            const documentsXML = buildDocumentsXML();

            const requestData = {
                CandidateID: candidateID,
                ApplicationID: parseInt(state?.P1),
                CourseID: parseInt(state?.C1),
                CollegeID: parseInt(state?.C2),
                RoundID: parseInt(state?.R1),
                XMLString: documentsXML,
                CancellationComments: cancellationReason,
                RefundFee: parseFloat(refundFee),
                CancelledBy: user?.UserLoginID,
                CancelledByIPAddress: ipAddress
            };


            const response = await agent.post("/api/Admission/cancel-admission", requestData);

            const resultData = response.data;

            // Check if response contains an error message (not "Y")
            if (resultData?.message && resultData.message !== "Y") {
                await Swal.fire({
                    icon: 'error',
                    title: 'Cannot Cancel Admission',
                    text: resultData.message,
                    confirmButtonColor: '#3085d6'
                });
                return;
            }

            // Check for success - response can be "Y", {message: "Y"}, or {IsOk: "Y"}
            if (resultData === "Y" ||
                resultData?.message === "Y" ||
                resultData?.IsOk === "Y" ||
                resultData?.Data === "Y") {

                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Admission cancelled successfully!',
                     timer: 1500,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745',
                    showConfirmButton: true,
                });
                const printData = await fetchCancellationSummaryForPrint();

                if (printData) {
                    // Open print window with cancellation letter
                    const success = await handlePrintWithWindow(printData);
                    if (!success) {
                    }
                } else {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Failed to load cancellation letter data',
                        confirmButtonColor: '#3085d6'
                    });
                }




                setTimeout(() => {
                    navigate('/institute/dashboard');
                }, 2000);
            } else {
                // Show error message from response
                const errorMsg = resultData?.message || resultData?.IsOk || resultData?.Data || "Failed to cancel admission";
                await Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: errorMsg,
                    confirmButtonColor: '#3085d6'
                });
            }
        } catch (error) {

            // Extract error message from validation errors
            let errorMessage = "An error occurred while cancelling admission. Please try again.";

            if (error?.response?.data?.errors) {
                const errors = error.response.data.errors;
                if (errors.XMLString) {
                    errorMessage = errors.XMLString.join(', ');
                } else {
                    errorMessage = Object.values(errors).flat().join(', ');
                }
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            await Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: errorMessage,
                confirmButtonColor: '#3085d6'
            });
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

   if (!data) {
    return (
        <div className="container-fluid px-4 py-3">
         {errorMessage?.trim() && (
        <div
            className="mx-auto mb-4"
            style={{
                maxWidth: "900px",
                backgroundColor: "#fff5f5",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                padding: "12px 16px",
                borderRadius: "8px"
            }}
        >
            {errorMessage}
        </div>
    )}
        </div>
    );
}

    return (
        <div className="container-fluid px-4 py-3">
            <div
                style={{
                    backgroundColor: "#f8f9fa",
                    
                    border: "1px solid #dee2e6",
                    borderRadius: "10px",
                    padding: "25px",
                    paddingTop: "50px",
                    position: "relative",
                    marginBottom: "20px",
                    marginTop: "40px"
                }}

            >

                <div
                    style={{
                        position: "absolute",
                        top: "-11px",
                        left: "20px",
                        backgroundColor: "#6c757d",
                        color: "#fff",
                        padding: "6px 16px",
                        borderRadius: "6px",
                        fontSize: "18px",
                        fontWeight: "500",
                        boxShadow: "0 4px 7px rgba(0,0,0,0.2)"
                    }}
                >
                    Cancel Admission
                </div>

                {/* Profile Strip */}
                <div
                    className="mb-4"
                    style={{
                        backgroundColor: "#e9ecef",
                        padding: "12px",
                        fontWeight: "600",
                        borderRadius: "6px",
                        color: "#333",
                        textAlign: "center",
                        fontSize: "16px",
                        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)"
                    }}
                >
                    Profile ID :{" "}
                    <span style={{ color: "#000", fontWeight: "700" }}>
                        {data?.CandidatePrimarySummary?.ApplicationID || '-'}
                    </span>
                </div>

                {/* PRIMARY DETAILS */}
                <div className="card-body">
                    <div className="grid grid-cols-12 gap-y-4">
                        <div className="col-span-9">
                            {[
                                { label: "ITI Registration No.", value: data?.CandidatePrimarySummary?.ITIRegistrationNo },
                                {
                                    label: "Candidate's Name",
                                    value: [
                                        data?.CandidatePrimarySummary?.FirstName,
                                        data?.CandidatePrimarySummary?.MiddleName,
                                        data?.CandidatePrimarySummary?.LastName
                                    ].filter(Boolean).join(" ")
                                },
                                { label: "Gender", value: data?.CandidatePrimarySummary?.Gender },
                                { label: "Date Of Birth (DD/MM/YYYY)", value: data?.CandidatePrimarySummary?.DOB },
                                { label: "Aadhaar Number", value: data?.CandidatePrimarySummary?.AadhaarNo },
                                { label: "Primary Mobile Number", value: data?.CandidatePrimarySummary?.MobileNo },
                                { label: "Secondary Mobile Number", value: data?.CandidatePrimarySummary?.AltMobileNo },
                                { label: "E-Mail ID", value: data?.CandidatePrimarySummary?.EMailID }
                            ].map((item, index) => (
                                <div key={index} className="grid grid-cols-12 items-center mb-2">
                                    <div className="col-span-4 text-gray-600">{item.label} :</div>
                                    <div className="col-span-8 font-semibold">{item.value || '-'}</div>
                                </div>
                            ))}
                        </div>
                        <div className="col-span-3 flex flex-col items-center">
                            {data?.CandidatePrimarySummary?.PhotoFilePath && (
                                <img src={data.CandidatePrimarySummary.PhotoFilePath} alt="photo" className="border mb-3" style={{ width: "140px", height: "170px", objectFit: "cover" }} />
                            )}
                            {data?.CandidatePrimarySummary?.SignFilePath && (
                                <img src={data.CandidatePrimarySummary.SignFilePath} alt="sign" className="border" style={{ width: "140px", height: "60px", objectFit: "contain" }} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Category Details Section */}
                <div className="card mb-4 shadow-sm">
                    <div
                        className="card-header"
                        style={{
                            backgroundColor: '#e9ecef',
                            padding: '12px 16px',
                            borderBottom: '1px solid #dee2e6'
                        }}
                    >
                        <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>
                            Category Details
                        </h5>
                    </div>

                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table
                                className="table table-bordered mb-0"
                                style={{
                                    fontSize: '15px',
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    tableLayout: 'fixed'
                                }}
                            >
                                <tbody>
                                    {/* Row 1 */}
                                    <tr>
                                        <td style={{ padding: '6px 8px', width: '50%' }}>
                                            <span className="text-muted">Nationality :</span>
                                            <span className="fw-semibold" style={{ marginLeft: '4px' }}>
                                                {data?.CandidateCategorySummary?.Nationality || '-'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '6px 8px', width: '50%' }}>
                                            <span className="text-muted">MH Domiciled :</span>
                                            <span className="fw-semibold" style={{ marginLeft: '4px' }}>
                                                {data?.CandidateCategorySummary?.IsMHDomiciled || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 2 */}
                                    <tr>
                                        <td style={{ padding: '6px 8px' }}>
                                            <span className="text-muted">Religion :</span>
                                            <span className="fw-semibold" style={{ marginLeft: '4px' }}>
                                                {data?.CandidateCategorySummary?.Religion || '-'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '6px 8px' }}>
                                            <span className="text-muted">Caste Category :</span>
                                            <span className="fw-semibold" style={{ marginLeft: '4px' }}>
                                                {data?.CandidateCategorySummary?.Category || '-'}
                                                {data?.CandidateCategorySummary?.Caste &&
                                                    data.CandidateCategorySummary.Caste !== 'NA' &&
                                                    ` (${data.CandidateCategorySummary.Caste})`}
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 3 */}
                                    <tr>
                                        <td style={{ padding: '6px 8px' }}>
                                            <span className="text-muted">Belong to PWD :</span>
                                            <span className="fw-semibold" style={{ marginLeft: '4px' }}>
                                                {data?.CandidateCategorySummary?.IsBelongToPWD || '-'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '6px 8px' }}></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Qualification Section */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-header" style={{ backgroundColor: '#e9ecef', padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                        <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>Qualification Details</h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-bordered mb-0" style={{ fontSize: '14px', width: '100%' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Qualification Type</th>
                                        <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Name of Degree</th>
                                        <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Subject / Branch / Trade</th>
                                        <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Board / University</th>
                                        <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Marks Obtained</th>
                                        <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Maximum Marks</th>
                                        <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Class / Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.CandidateQualificationSummaryList?.length > 0 ? (
                                        data.CandidateQualificationSummaryList.map((q, i) => (
                                            <tr key={i}>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{q.Qualification || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{q.Degree || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{q.Subject || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{q.University || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{q.MarksObtained || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{q.MaximumMarks || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{q.Class || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', border: '1px solid #dee2e6' }}>No qualification data available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Training Section */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-header" style={{ backgroundColor: '#e9ecef', padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                        <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>Training Details</h5>
                    </div>
                    <div className="card-body">
                        {data?.CandidateTrainingSummaryList?.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-bordered mb-0" style={{ fontSize: '14px', width: '100%' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Course Name</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Course Conducted By</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>From Date</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>To Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.CandidateTrainingSummaryList.map((t, i) => (
                                            <tr key={i}>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{t.Course || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{t.CourseConductedby || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{t.FromDate || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{t.ToDate || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>No Training Completed</div>
                        )}
                    </div>
                </div>

                {/* Work Experience Section */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-header" style={{ backgroundColor: '#e9ecef', padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                        <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>Work Experience</h5>
                    </div>
                    <div className="card-body">
                        {data?.CandidateWorkExperienceSummaryList?.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-bordered mb-0" style={{ fontSize: '14px', width: '100%' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '20%' }}>Name of Establishment</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '30%' }}>Address</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '15%' }}>Job Role</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '10%' }}>From Date</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '10%' }}>To Date</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '15%' }}>Stipend/Salary (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.CandidateWorkExperienceSummaryList.map((w, i) => (
                                            <tr key={i}>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{w.EstablishmentName || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{w.Address || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{w.JobRole || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{w.FromDate || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{w.ToDate || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'right' }}>{w.SalaryPerMonth || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>No Work Experience</div>
                        )}
                    </div>
                </div>

                {/* Allotted Institute Section */}
                <div className="card mb-4 shadow-sm">
                    <div
                        className="card-header"
                        style={{
                            backgroundColor: '#e9ecef',
                            padding: '12px 16px',
                            borderBottom: '1px solid #dee2e6'
                        }}
                    >
                        <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>
                            Allotted Institute
                        </h5>
                    </div>
                    <div className="card-body" style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            <span style={{ marginRight: '6px' }}>Institute Name :</span>
                            <span style={{ wordBreak: 'break-word' }}>
                                {data?.AllotmentSummary?.AllottedCollege || '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 🔹 Course Details Section */}
                {courseDetails && (
                    <div className="card mb-4 shadow-sm">
                        <div className="card-header" style={{ backgroundColor: '#e9ecef', padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                            <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>Course Details</h5>
                        </div>
                        <div className="card-body" style={{ padding: '16px 20px' }}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Course Name :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.Course || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Course Code :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.CourseCode || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Course Approved By :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.CourseApprover || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Sector :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.Sector || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Duration :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.Duration || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Minimum Entry Qualification :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.MinimumEntryQualification || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Minimum Age :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.MinimumAge || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            NSQF Level :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.NSQFLevel || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Full Time / Part Time :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.FullTimePartTime || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Mandatory Criteria At Entry Qualification :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.MandatoryCriteriaAtEntryQualification || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Intake Per Unit :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.IntakePerUnit || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Training Fee Category :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.TrainingFeeCategory || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div>
                                        <span style={{ color: "#6c757d", display: "inline-block", minWidth: "150px", fontWeight: "500" }}>
                                            Course Type :
                                        </span>
                                        <span className="fw-semibold ms-2">
                                            {courseDetails?.CourseType || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                </div>

                                <div className="col-md-6 mb-3">
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Required Documents Section */}
                {data?.ListRequiredDocumentSummary?.length > 0 && (
                    <div className="card mb-4 shadow-sm">
                        <div className="card-header" style={{ backgroundColor: '#e9ecef', padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                            <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>
                                Required Documents List
                                <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#6c757d', marginLeft: '8px' }}>
                                    (Documents marked with <span style={{ color: 'red', fontWeight: 'bold' }}>*</span> are compulsory)
                                </span>
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-bordered mb-0" style={{ fontSize: '14px', width: '100%' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '12px 10px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '8%' }}>Sr. No.</th>
                                            <th style={{ padding: '12px 10px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '35%' }}>Document Name</th>
                                            <th style={{ padding: '12px 10px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '10%' }}>View</th>
                                            <th style={{ padding: '12px 10px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '15%' }}>Verified By Institute</th>
                                            <th style={{ padding: '12px 10px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '15%' }}>Original Document Submitted at Institute</th>
                                            <th style={{ padding: '12px 10px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '17%' }}>Original Document Return Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.ListRequiredDocumentSummary.map((doc, index) => (
                                            <tr key={doc.DocumentID || index}>
                                                <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>{index + 1}</td>
                                                <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                                                    {doc.IsDocumentCompulsory && <span style={{ color: '#dc3545', fontWeight: 'bold', marginRight: '6px' }}>*</span>}
                                                    {doc.DocumentName || '-'}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                                                    {doc.DocumentUrl ? (
                                                        <button onClick={() => window.open(doc.DocumentUrl, '_blank')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '28px', padding: '0', lineHeight: '1' }} title="View Document">📄</button>
                                                    ) : (
                                                        <span style={{ color: '#6c757d', fontSize: '12px' }}>No File</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                                                    {doc.DocumentUrl ? (
                                                        doc.InstituteVerificationStatus === 'Y' ? 'Verified' : (doc.InstituteVerificationStatus === 'N' ? 'Not Verified' : '-')
                                                    ) : (
                                                        <span style={{ color: '#6c757d' }}>Not Applicable</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                                                    {doc.DocumentUrl && doc.IsDocumentCompulsory ? (
                                                        doc.IsOrignalDocumentSubmitted === 'Y' ? 'Yes' : (doc.IsOrignalDocumentSubmitted === 'N' ? 'No' : '-')
                                                    ) : (
                                                        <span style={{ color: '#6c757d' }}>Not Applicable</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                                                    {doc.DocumentUrl && doc.IsDocumentCompulsory ? (
                                                        <select
                                                            className="form-select form-select-sm"
                                                            style={{ fontSize: '13px', width: '100%' }}
                                                            value={documentReturnStatus[doc.DocumentID] || '-1'}
                                                            onChange={(e) => {
                                                                setDocumentReturnStatus({
                                                                    ...documentReturnStatus,
                                                                    [doc.DocumentID]: e.target.value
                                                                });
                                                            }}
                                                        >
                                                            <option value="-1">Select</option>
                                                            <option value="Y">Yes</option>
                                                            <option value="N">No</option>
                                                        </select>
                                                    ) : (
                                                        <span style={{ color: '#6c757d' }}>Not Applicable</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {/* Admission Cancellation Section */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-header" style={{ backgroundColor: '#e9ecef', padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                        <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>Admission Cancellation</h5>
                    </div>
                    <div className="card-body" style={{ paddingTop: '20px' }}>

                        {/* Fee Details - 3 columns in a row with same styling as batch dates */}
                        <div className="mb-4" style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: '1' }}>
                                <label className="fw-bold mb-2 d-block">
                                    Total Course Fees: <span style={{ color: "#dc3545" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{
                                        height: '42px',
                                        width: '100%',
                                        border: '1px solid #ced4da',
                                        backgroundColor: '#f8f9fa',
                                        paddingLeft: '12px'
                                    }}
                                    value={totalCourseFees}
                                    readOnly
                                />
                            </div>

                            <div style={{ flex: '1' }}>
                                <label className="fw-bold mb-2 d-block">
                                    Amount paid by Candidate: <span style={{ color: "#dc3545" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{
                                        height: '42px',
                                        width: '100%',
                                        border: '1px solid #ced4da',
                                        backgroundColor: '#f8f9fa',
                                        paddingLeft: '12px'
                                    }}
                                    value={amountPaid}
                                    readOnly
                                />
                            </div>

                            <div style={{ flex: '1' }}>
                                <label className="fw-bold mb-2 d-block">
                                    Amount refunded to Candidates: <span style={{ color: "#dc3545" }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    style={{
                                        height: '42px',
                                        width: '100%',
                                        border: '1px solid #ced4da',
                                        paddingLeft: '12px'
                                    }}
                                    value={refundFee}
                                    onChange={(e) => handleRefundChange(e.target.value)}
                                    placeholder="Enter refund amount"
                                />
                            </div>
                        </div>

                        {/* Reason for Cancellation - Same as Confirm Admission Remark */}
                        <div className="mb-4" style={{ display: 'flex', flexDirection: 'column' }}>
                            <label className="fw-bold mb-2 d-block">
                                Reason for Cancellation: <span style={{ color: "#dc3545" }}>*</span>
                            </label>
                            <textarea
                                className="form-control"
                                rows="5"
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                placeholder="Enter detailed reason for cancellation..."
                                style={{
                                    width: '100%',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    padding: '10px',
                                    backgroundColor: '#f8f9fa',
                                    resize: 'vertical',
                                    minHeight: '120px'
                                }}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="row">
                            <div className="col-md-12 text-center">
                                <button
                                    className="btn px-4 py-2"
                                    style={{
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        backgroundColor: '#dc3545',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px'
                                    }}
                                    onClick={handleCancelAdmission}
                                    disabled={cancelling}
                                >
                                    {cancelling ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        'Cancel Admission'
                                    )}
                                </button>
                                <button
                                    className="btn px-4 py-2 ms-3"
                                    style={{
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        backgroundColor: '#6c757d',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px'
                                    }}
                                    onClick={() => navigate('/institute/dashboard')}
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancelAdmissionDetails;