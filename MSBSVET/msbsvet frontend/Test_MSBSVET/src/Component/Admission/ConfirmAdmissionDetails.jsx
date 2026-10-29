import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import agent from '../../lib/api/agent';
import { GetCandidateIDByApplicationID } from '../../Endpoints_All/Base/masterData';
import ReactDOM from 'react-dom/client';
import PrintAdmissionLetter from '../SuperAdmin/Reports/PrintAdmissionLetter';
import PrintAdmissionRejectionLetter from '../SuperAdmin/Reports/PrintAdmissionRejectionLetter';
import { admissionApplicationStatus, IsAdmissionDateOver } from '../../Endpoints_All/Admission/admission';
import { getDeviceIP } from '../../utils/CommonHelper';
import { useAuth } from "../../Hooks/AuthContext"


const ConfirmAdmissionDetails = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const { userInfo } = useAuth();
    const user = userInfo;

    const [data, setData] = useState(null);
    const [courseDetails, setCourseDetails] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [dvetoData, setDvetoData] = useState(null);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");

    // State for Batch
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [batchDetails, setBatchDetails] = useState(null);

    // Fee details
    const [totalCourseFees, setTotalCourseFees] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [balance, setBalance] = useState('0');

    // Rejection details
    const [reasonForRejection, setReasonForRejection] = useState('');
    const [remark, setRemark] = useState('');

    // Store admission summary data for printing
    const [admissionSummaryData, setAdmissionSummaryData] = useState(null);

    const [requiredFieldsError, setRequiredFieldsError] = useState("");
    const [requiredFieldsInvalid, setRequiredFieldsInvalid] = useState(false);


    const isDVETO =
        user?.UserTypeID === 14 ||
        user?.RoleName === "DVETO";

    const isInstitute =
        user?.UserTypeID === 61;

    useEffect(() => {
        fetchAdmissionSummary();
        fetchIP();
    }, []);

    // Fetch batches when data is loaded
    useEffect(() => {

        const courseID = data?.AllotmentSummary?.CourseID || state?.C1;
        const collegeID = data?.AllotmentSummary?.CollegeID || state?.C2;


        if (courseID && collegeID) {
            fetchBatches(courseID, collegeID);
        } else {
        }
    }, [data]);

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
    };

    const getAdmissionStatusMessage = async (
        applicationDisplayID
    ) => {
        try {
            const response = await agent.get(
                admissionApplicationStatus,
                {
                    params: {
                        ApplicationID: applicationDisplayID,
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

    const checkAdmissionDate = async () => {
        try {
            const response = await agent.get(
                "/api/Admission/is-admission-date-over",
                {
                    params: {
                        courseID: state?.C1,
                        collegeID: state?.C2
                    }
                }
            );
            if (
                response.data === true ||
                response.data === 0 ||
                response.data === "0"
            ) {
                setErrorMessage("Last Date of Admission is Over !!");
                setData(null);
                return false;
            }

            return true;

        } catch (error) {
            console.error("Error checking admission date:", error);
            return false;
        }
    };

    const fetchAdmissionSummary = async () => {
        try {
            setLoading(true);

            const isAdmissionDateValid = await checkAdmissionDate();

            if (!isAdmissionDateValid) {
                return;
            }

            const candidateRes = await agent.get(
                `${GetCandidateIDByApplicationID}?applicationID=${state?.P1}`
            );
            const candidateID = candidateRes.data?.Data;

            let response;

            if (isDVETO) {
                response = await agent.get(
                    "/api/Admission/admission-summary",
                    {
                        params: {
                            candidateID,
                            applicationID: state?.P1,
                            courseID: state?.C1,
                            collegeID: state?.C2,
                            roundID: 0,
                            userLoginID: user?.UserLoginID,
                            reportingStatus: "Y",
                            flag: "null"
                        }
                    }
                );
            } else {
                response = await agent.get(
                    "/api/Admission/admission-summary",
                    {
                        params: {
                            candidateID,
                            applicationID: state?.P1,
                            courseID: state?.C1,
                            collegeID: state?.C2,
                            roundID: state?.R1,
                            userLoginID: user?.UserLoginID,
                            reportingStatus: "N",
                            flag: "ConfirmAdmission"
                        }
                    }
                );

            }

            const responseData = response.data?.Data || response.data;

            if (isInstitute) {
                const requiredFields = responseData?.CandidateCheckRequiredFields;

                if (requiredFields) {
                    const isEligible =
                        requiredFields.IsEligible === true ||
                        requiredFields.IsEligible === 1;

                    setRequiredFieldsInvalid(!isEligible);

                    setRequiredFieldsError(
                        isEligible ? "" : (requiredFields.ErrorMsg || "")
                    );
                }
            }

            if (
                !responseData ||
                !responseData.AllotmentSummary ||
                Object.keys(responseData.AllotmentSummary).length === 0
            ) {
                const statusMessage =
                    await getAdmissionStatusMessage(state?.P1);

                setErrorMessage(
                    statusMessage || ""
                );

                setData(null);
                setLoading(false);
                return;
            }
            if (responseData?.ListRequiredDocumentSummary && Array.isArray(responseData.ListRequiredDocumentSummary)) {
                const uniqueDocs = [];
                const seenDocIds = new Set();

                for (const doc of responseData.ListRequiredDocumentSummary) {
                    if (!seenDocIds.has(doc.DocumentID)) {
                        seenDocIds.add(doc.DocumentID);
                        uniqueDocs.push(doc);
                    }
                }
                responseData.ListRequiredDocumentSummary = uniqueDocs;
            }


            setData(responseData);

            const courseID =
                responseData?.AllotmentSummary?.CourseID ??
                state?.C1 ??
                null;
            if (courseID) {
                await fetchCourseDetails(courseID);
            }

        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to fetch admission details. Please try again.',
                confirmButtonColor: '#3085d6'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseDetails = async (courseId) => {
        try {
            const response = await agent.get(`/api/InstituteBase/GetCourseDetails/${courseId}`);
            const courseData =
                response.data?.Data ||
                response.data?.data ||
                response.data;

            setCourseDetails(courseData);
        } catch (error) {
        }
    };

    const fetchBatches = async (courseID, collegeID) => {
        try {

            const response = await agent.get("/api/Admission/batches", {
                params: {
                    courseID: courseID,
                    collegeID: collegeID
                }
            });

            let batchData = response.data?.Data || response.data;

            if (!Array.isArray(batchData)) {
                batchData = [];
            }

            setBatches(batchData);
        } catch (error) {
            await Swal.fire({
                icon: 'warning',
                title: 'Warning!',
                text: 'Failed to fetch batches. Please refresh the page.',
                confirmButtonColor: '#3085d6'
            });
        }
    };

    const handleBatchChange = async (batchId) => {
        setSelectedBatch(batchId);
        if (batchId && batchId !== '-1') {
            try {
                const courseID = data?.AllotmentSummary?.CourseID || state?.C1;
                const collegeID = data?.AllotmentSummary?.CollegeID || state?.C2;

                const response = await agent.get("/api/Admission/batch-details", {
                    params: {
                        courseID: courseID,
                        collegeID: collegeID,
                        batchID: batchId
                    }
                });

                let details = response.data?.Data || response.data;

                if (Array.isArray(details) && details.length > 0) {
                    details = details[0];
                }


                if (!details || (Array.isArray(details) && details.length === 0) || Object.keys(details).length === 0) {
                    // Show popup message that batch details are not available
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Batch Details Not Available',
                        text: 'Batch details not found. Please select another batch.',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    });
                    setBatchDetails(null);
                    return;
                }

                if (!details.BatchStartDate && !details.BatchEndDate && !details.Intake) {
                    await Swal.fire({
                        icon: 'info',
                        title: 'Incomplete Batch Information',
                        text: 'This batch does not have complete details (Start Date, End Date, or Intake may be missing). Please contact administrator or select another batch.',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    });
                    setBatchDetails(null);
                    return;
                }

                setBatchDetails(details);
            } catch (error) {

                await Swal.fire({
                    icon: 'error',
                    title: 'Unable to Load Batch Details',
                    text: 'Failed to fetch batch details. The batch may be expired or not properly configured. Please contact administrator.',
                    confirmButtonColor: '#3085d6'
                });
                setBatchDetails(null);
            }
        } else {
            setBatchDetails(null);
        }
    };

    const calculateBalance = (total, paid) => {
        const totalAmount = parseFloat(total) || 0;
        const paidAmount = parseFloat(paid) || 0;
        const bal = totalAmount - paidAmount;
        setBalance(bal.toString());
    };

    const handleTotalFeesChange = (value) => {
        setTotalCourseFees(value);
        calculateBalance(value, amountPaid);
    };

    const handleAmountPaidChange = (value) => {
        setAmountPaid(value);
        calculateBalance(totalCourseFees, value);
    };

    const formatDateForSQL = (dateString) => {

        if (!dateString) return null;

        if (typeof dateString === 'string' && dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const day = parts[0];
                const month = parts[1];
                const year = parts[2];

                const formattedDate = `${year}-${month}-${day}`;

                const testDate = new Date(formattedDate);
                if (!isNaN(testDate.getTime())) {
                    return formattedDate;
                }
            }
        }

        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }

        return null;
    };

    // Build XML string for documents verification status 
    const buildDocumentsXML = () => {
        let xmlString = "<DocumentList>";

        const documentsWithUrl = data?.ListRequiredDocumentSummary?.filter(doc => doc.DocumentUrl && doc.DocumentUrl.trim().length > 0) || [];

        documentsWithUrl.forEach((doc) => {
            let verificationStatus = doc.InstituteVerificationStatus || "N";
            if (verificationStatus === '-1') verificationStatus = "N";

            let submittedStatus = "N";
            if (doc.IsDocumentCompulsory) {
                let status = doc.IsOrignalDocumentSubmitted || "N";
                if (status === '-1') status = "N";
                submittedStatus = status;
            }

            xmlString += `<Document>
                <DocumentID>${doc.DocumentID}</DocumentID>
                <IsVerifyAtinstitute>${verificationStatus}</IsVerifyAtinstitute>
                <IsSubmittedAtinstitute>${submittedStatus}</IsSubmittedAtinstitute>
            </Document>`;
        });

        xmlString += "</DocumentList>";
        return xmlString;
    };

    const fetchAdmissionSummaryForPrint = async () => {
        try {
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
                    flag: "PrintAdmissionLetter"
                }
            });

            const summaryData = response.data?.Data || response.data;

            if (summaryData) {
                const primaryData = summaryData.CandidatePrimarySummary || {};
                const allotmentData = summaryData.AllotmentSummary || {};
                const documentsData = summaryData.ListRequiredDocumentSummary || [];

                const courseId = allotmentData.CourseID || state?.C1;
                const courseDetailsData = await fetchCourseDetailsForPrint(courseId);

                return {
                    applicationId: primaryData.ApplicationID || "",
                    itiRegistrationNo: primaryData.ITIRegistrationNo || "",
                    candidateName: [primaryData.FirstName, primaryData.MiddleName, primaryData.LastName]
                        .filter(Boolean).join(" ").trim() || "",
                    gender: primaryData.Gender || "",
                    dob: primaryData.DOB || "",
                    aadhaarNo: primaryData.AadhaarNo || "",
                    mobileNo: primaryData.MobileNo || "",
                    altMobileNo: primaryData.AltMobileNo || "",
                    email: primaryData.EMailID || "",
                    photoPath: primaryData.PhotoFilePath || "",
                    signaturePath: primaryData.SignFilePath || "",
                    admissionDateTime: allotmentData.ReportedDateTime || allotmentData.AdmissionDate || "",
                    instituteCode: allotmentData.AllottedChoiceCode || "",
                    instituteName: allotmentData.AllottedCollege || "",
                    courseFee: totalCourseFees || "",
                    paidCourseFee: amountPaid || "",
                    courseStartDate: batchDetails?.BatchStartDate || "",
                    courseCode: courseDetailsData?.CourseCode || "",
                    courseName: courseDetailsData?.Course || "",
                    courseApprovedBy: courseDetailsData?.CourseApprover || "",
                    sector: courseDetailsData?.Sector || "",
                    subSector: courseDetailsData?.SubSector || "",
                    courseType: courseDetailsData?.CourseType || "",
                    fullTimePartTime: courseDetailsData?.FullTimePartTime || "",
                    duration: courseDetailsData?.Duration && courseDetailsData?.DurationUnit
                        ? `${courseDetailsData.Duration} ${courseDetailsData.DurationUnit}` : "",
                    minEntryQualification: courseDetailsData?.MinimumEntryQualification || "",
                    mandatoryCriteria: courseDetailsData?.MandatoryCriteriaAtEntryQualification || "NA",
                    minimumAge: courseDetailsData?.MinimumAge?.toString() || "",
                    intakePerUnit: courseDetailsData?.IntakePerUnit?.toString() || "",
                    nsqfLevel: courseDetailsData?.NSQFLevel || "",
                    trainingFeeCategory: courseDetailsData?.TrainingFeeCategory?.toString() || "",
                    documents: Array.isArray(documentsData) ? documentsData.map((doc) => ({
                        documentName: doc.DocumentName || "",
                        verificationStatus: doc.InstituteVerificationStatusDisplay || doc.InstituteVerificationStatus || "Pending",
                        originalSubmitted: doc.IsOrignalSubmittedDisplay || doc.IsOrignalDocumentSubmitted || "No"
                    })) : [],
                    printedBy: user?.UserName || user?.UserLoginID || "",
                    printedOn: new Date().toLocaleString()
                };
            }
            return null;
        } catch (error) {
            return null;
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

    const getPrintHTML = async (printData) => {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);

        const root = ReactDOM.createRoot(tempDiv);
        root.render(<PrintAdmissionLetter data={printData} />);

        await new Promise(resolve => setTimeout(resolve, 100));

        const htmlContent = tempDiv.innerHTML;
        root.unmount();
        document.body.removeChild(tempDiv);

        return htmlContent;
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
    const fetchRejectionSummaryForPrint = async () => {
        try {
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
                    reportingStatus: "R",
                    flag: "PrintAdmissionLetter"
                }
            });

            const summaryData = response.data?.Data || response.data;

            if (summaryData) {
                const primaryData = summaryData.CandidatePrimarySummary || {};
                const allotmentData = summaryData.AllotmentSummary || {};
                const documentsData = summaryData.ListRequiredDocumentSummary || [];

                const courseId = allotmentData.CourseID || state?.C1;
                const courseDetailsData = await fetchCourseDetailsForPrint(courseId);

                return {
                    applicationId: primaryData.ApplicationID || "",
                    itiRegistrationNo: primaryData.ITIRegistrationNo || "",
                    candidateName: [primaryData.FirstName, primaryData.MiddleName, primaryData.LastName]
                        .filter(Boolean).join(" ").trim() || "",
                    gender: primaryData.Gender || "",
                    dob: primaryData.DOB || "",
                    aadhaarNo: primaryData.AadhaarNo || "",
                    mobileNo: primaryData.MobileNo || "",
                    altMobileNo: primaryData.AltMobileNo || "",
                    email: primaryData.EMailID || "",
                    photoPath: primaryData.PhotoFilePath || "",
                    signaturePath: primaryData.SignFilePath || "",
                    rejectionDateTime: allotmentData.ReportedDateTime || allotmentData.RejectionDate || "",
                    instituteCode: allotmentData.AllottedChoiceCode || "",
                    instituteName: allotmentData.AllottedCollege || "",
                    courseFee: allotmentData.CourseFee || "0",
                    paidCourseFee: allotmentData.PaidCourseFee || "0",
                    refundAmount: allotmentData.RefundFee || "0",
                    courseStartDate: allotmentData.CourseStartDate || "",
                    courseCode: courseDetailsData?.CourseCode || "",
                    courseName: courseDetailsData?.Course || "",
                    courseApprovedBy: courseDetailsData?.CourseApprover || "",
                    sector: courseDetailsData?.Sector || "",
                    subSector: courseDetailsData?.SubSector || "",
                    courseType: courseDetailsData?.CourseType || "",
                    fullTimePartTime: courseDetailsData?.FullTimePartTime || "",
                    duration: courseDetailsData?.Duration && courseDetailsData?.DurationUnit
                        ? `${courseDetailsData.Duration} ${courseDetailsData.DurationUnit}` : "",
                    minEntryQualification: courseDetailsData?.MinimumEntryQualification || "",
                    mandatoryCriteria: courseDetailsData?.MandatoryCriteriaAtEntryQualification || "NA",
                    minimumAge: courseDetailsData?.MinimumAge?.toString() || "",
                    intakePerUnit: courseDetailsData?.IntakePerUnit?.toString() || "",
                    nsqfLevel: courseDetailsData?.NSQFLevel || "",
                    trainingFeeCategory: courseDetailsData?.TrainingFeeCategory?.toString() || "",
                    documents: Array.isArray(documentsData) ? documentsData.map((doc) => ({
                        documentName: doc.DocumentName || "",
                        verificationStatus: doc.InstituteVerificationStatusDisplay || doc.InstituteVerificationStatus || "Pending",
                        originalSubmitted: doc.IsOrignalSubmittedDisplay || doc.IsOrignalDocumentSubmitted || "No"
                    })) : [],
                    printedBy: user?.UserName || user?.UserLoginID || "",
                    printedOn: new Date().toLocaleString(),
                    rejectionReason: allotmentData.ReasonForRejection || reasonForRejection || "",
                    rejectionComments: allotmentData.RejectionComments || remark || ""
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    const getRejectionPrintHTML = async (printData) => {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);

        const ReactDOM = await import('react-dom/client');
        const root = ReactDOM.createRoot(tempDiv);
        root.render(<PrintAdmissionRejectionLetter data={printData} />);

        await new Promise(resolve => setTimeout(resolve, 100));

        const htmlContent = tempDiv.innerHTML;
        root.unmount();
        document.body.removeChild(tempDiv);

        return htmlContent;
    };

    const handleRejectionPrintWithWindow = async (printData) => {
        const popupWidth = 1000;
        const popupHeight = 750;

        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const printWindow = window.open(
            "",
            "PrintAdmissionRejectionLetter",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (!printWindow) {
            Swal.fire("Popup Blocked", "Please allow popups for this website.", "warning");
            return false;
        }

        const printContent = await getRejectionPrintHTML(printData);
        const allStyles = getAllStyles();

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Admission Rejection Letter</title>
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

    const handlePrintWithWindow = async (printData) => {
        const popupWidth = 1000;
        const popupHeight = 750;

        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const printWindow = window.open(
            "",
            "PrintAdmissionLetter",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (!printWindow) {
            Swal.fire("Popup Blocked", "Please allow popups for this website.", "warning");
            return false;
        }

        const printContent = await getPrintHTML(printData);
        const allStyles = getAllStyles();

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Admission Confirmation Slip</title>
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


    // Password validation function
    const validateCandidatePassword = async (password) => {
        try {
            const profileId = data?.CandidatePrimarySummary?.ProfileID;

            if (!profileId) {

                try {
                    const candidateRes = await agent.get(
                        `${GetCandidateIDByApplicationID}?applicationID=${state?.P1}`
                    );
                    const candidateID = candidateRes.data?.Data;
                    const profileResponse = await agent.get(`/Base/GetCandidateProfileIDByCandidateId`, {
                        params: { candidateID: candidateID }
                    });
                    const fallbackProfileId = profileResponse.data?.Data;
                    if (!fallbackProfileId) {
                        return false;
                    }

                    const verifyResponse = await agent.get(`/Base/IsPasswordValid`, {
                        params: {
                            UserLoginID: fallbackProfileId,
                            UserPassword: password
                        }
                    });



                    if (verifyResponse.data?.Data === true || verifyResponse.data?.Data === "true" || verifyResponse.data === true) {
                        return true;
                    }
                    if (verifyResponse.data?.data === true || verifyResponse.data?.data === "true") {
                        return true;
                    }
                    if (verifyResponse.data === "Y" || verifyResponse.data === "y") {
                        return true;
                    }
                    return false;
                } catch (fallbackError) {
                    return false;
                }
            }


            const hashedPassword = btoa(password);

            const verifyResponse = await agent.get(`/Base/IsPasswordValid`, {
                params: {
                    UserLoginID: profileId,
                    UserPassword: hashedPassword
                }
            });


            if (verifyResponse.data?.Data === true || verifyResponse.data?.Data === "true") {
                return true;
            }
            if (verifyResponse.data?.data === true || verifyResponse.data?.data === "true") {
                return true;
            }
            if (verifyResponse.data === true || verifyResponse.data === "true") {
                return true;
            }
            if (verifyResponse.data === "Y" || verifyResponse.data?.Data === "Y") {
                return true;
            }

            return false;

        } catch (error) {
            return false;
        }
    };


    const showPasswordPopup = () => {
        return new Promise((resolve) => {
            Swal.fire({
                title: 'Password Details',
                html: `
                <div style="text-align: left;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: 500; margin-bottom: 5px;">Candidate Login</div>
                        <input type="password" id="candidate-password" placeholder="Password" style="width: 100%; padding: 8px 10px; border: 1px solid #ccc; border-radius: 3px; font-size: 14px;">
                    </div>
                </div>
            `,
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Verify Password',
                cancelButtonText: 'Close',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#dc3545',
                preConfirm: async () => {
                    const password = document.getElementById('candidate-password').value;
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


    const showConfirmationDialog = () => {
        return Swal.fire({
            title: 'Confirm Admission',
            text: 'Are you sure you want to confirm this admission?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Confirm',
            cancelButtonText: 'Cancel'
        });
    };


    const validateConfirmAdmission = async () => {
        if (!selectedBatch || selectedBatch === '-1') {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please select a Batch',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        if (!batchDetails) {
            await Swal.fire({
                icon: 'warning',
                title: 'Batch Details Missing',
                text: 'Batch details are not available for the selected batch. The admission date may have expired. Please contact administrator or select another batch.',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        if (!totalCourseFees || parseFloat(totalCourseFees) <= 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please enter Total Course Fees',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        if (!amountPaid || parseFloat(amountPaid) < 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please enter Amount paid by Candidate',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        const compulsoryDocsWithUrl = data?.ListRequiredDocumentSummary?.filter(
            doc => doc.IsDocumentCompulsory && doc.DocumentUrl && doc.DocumentUrl.trim().length > 0
        ) || [];

        const hasUnverifiedCompulsoryDocs = compulsoryDocsWithUrl.some(doc => {
            const verificationStatus = doc.InstituteVerificationStatus;
            return !verificationStatus || verificationStatus === '-1' || verificationStatus === 'N';
        });

        if (hasUnverifiedCompulsoryDocs) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please mark all compulsory documents as "Verified" before confirming admission',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        const hasUnsubmittedCompulsoryDocs = compulsoryDocsWithUrl.some(doc => {
            const submittedStatus = doc.IsOrignalDocumentSubmitted;
            return !submittedStatus || submittedStatus === '-1';
        });

        if (hasUnsubmittedCompulsoryDocs) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please confirm Original Document Submission status (Yes/No) for all compulsory documents',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        return true;
    };


    const handleConfirmAdmission = async () => {

        if (errorMessage) {
            return;
        }
        const isValid = await validateConfirmAdmission();
        if (!isValid) return;

        const isPasswordVerified = await showPasswordPopup();
        if (!isPasswordVerified) {
            return;
        }

        const confirmationResult = await showConfirmationDialog();
        if (!confirmationResult.isConfirmed) {
            return;
        }

        setConfirming(true);

        try {
            const candidateRes = await agent.get(
                `${GetCandidateIDByApplicationID}?applicationID=${state?.P1}`
            );
            const candidateID = candidateRes.data?.Data;

            const documentsXML = buildDocumentsXML();

            let startCourseDate = null;
            if (batchDetails?.BatchStartDate) {
                const dateParts = batchDetails.BatchStartDate.split('/');
                if (dateParts.length === 3) {
                    const year = dateParts[2];
                    const month = dateParts[1].padStart(2, '0');
                    const day = dateParts[0].padStart(2, '0');
                    startCourseDate = `${year}-${month}-${day}T00:00:00`;
                }
            }

            const requestData = {
                CandidateID: candidateID,
                ApplicationID: parseInt(state?.P1),
                CourseID: parseInt(state?.C1),
                CollegeID: parseInt(state?.C2),
                RoundID: parseInt(state?.R1),
                XmlDoc: documentsXML,
                AdmissionComments: remark || "",
                ReportedBy: user?.UserLoginID,
                ReportedByIPAddress: ipAddress,
                CourseFee: parseFloat(totalCourseFees),
                CourseFeePay: parseFloat(amountPaid),
                StartCourseDate: startCourseDate,
                UnitNo: parseInt(batchDetails?.UnitNo) || 0,
                ShiftID: parseInt(batchDetails?.ShiftID) || 0,
                BatchID: parseInt(selectedBatch)
            };


            const response = await agent.post("/api/Admission/confirm-admission", requestData);


            const resultData = response.data?.Data || response.data;

            if (resultData?.message === "Y" || resultData === "Y") {

                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Admission confirmed successfully!',
                    timer: 1500,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745',
                    showConfirmButton: true,
                });

                const printData = await fetchAdmissionSummaryForPrint();

                if (printData) {
                    const success = await handlePrintWithWindow(printData);
                    if (!success) {
                    }
                } else {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Failed to load admission letter data',
                        confirmButtonColor: '#3085d6'
                    });
                }


                setTimeout(() => {
                    navigate('/institute/dashboard');
                }, 2000);

            } else {
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        resultData?.message ||
                        resultData?.IsOk ||
                        "Failed to confirm admission"
                });
            }

        } catch (error) {
            let errorMessage = "An error occurred while confirming admission. Please try again.";

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.title) {
                    errorMessage = error.response.data.title;
                } else if (error.response.data.errors) {
                    errorMessage = Object.values(error.response.data.errors).flat().join(', ');
                } else {
                    errorMessage = JSON.stringify(error.response.data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            await Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: errorMessage,
                confirmButtonColor: '#3085d6'
            });
        } finally {
            setConfirming(false);
        }
    };


    const validateRejectAdmission = async () => {
        if (!remark || remark.trim().length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please enter Remark for Rejection of Admission',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        if (!reasonForRejection || reasonForRejection === '-1') {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please select Reason for Rejection',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        return true;
    };
    const handleDVETOApprove = async () => {
        const result = await Swal.fire({
            title: "Approve Admission",
            text: "Are you sure you want to approve this admission?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Approve"
        });

        if (!result.isConfirmed) return;

        try {
            const xmlDoc = `
        <SelectedCandidates>
            <Candidate>
                <ApplicationID>${state?.P1}</ApplicationID>
                <CourseID>${state?.C1}</CourseID>
                <CollegeID>${state?.C2}</CollegeID>
                <RejectReason>${remark || ""}</RejectReason>
                <ARFlag>A</ARFlag>
            </Candidate>
        </SelectedCandidates>`;

            const payload = {
                UserLoginID: user?.UserLoginID,
                IPAddress: ipAddress,
                XmlDoc: xmlDoc
            };


            const response = await agent.post(
                "/api/Admission/save-candidate-devto-approval",
                payload
            );
            if (
                response.data === "Y" ||
                response.data?.Data === "Y" ||
                response.data?.message === "Y"
            ) {
                await Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Admission Approved Successfully",
                    confirmButtonColor: "#28a745"
                });

                navigate("/Admission/CandidateListPendingForDvetOApproval"); // or your required page
            }
            else {
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to approve admission"
                });
            }
        } catch (error) {

            Swal.fire(
                "Error",
                error?.response?.data?.title || "Failed to approve admission",
                "error"
            );
        }
    };

    const handleDVETOReject = async () => {
        if (!remark.trim()) {
            Swal.fire(
                "Validation",
                "Please Enter Remark",
                "warning"
            );
            return;
        }

        const result = await Swal.fire({
            title: "Reject Admission",
            text: "Are you sure you want to reject this admission?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Reject"
        });

        if (!result.isConfirmed) return;

        try {
            const xmlDoc = `
        <SelectedCandidates>
            <Candidate>
                <ApplicationID>${state?.P1}</ApplicationID>
                <CourseID>${state?.C1}</CourseID>
                <CollegeID>${state?.C2}</CollegeID>
                <RejectReason>${remark}</RejectReason>
                <ARFlag>R</ARFlag>
            </Candidate>
        </SelectedCandidates>`;

            const payload = {
                UserLoginID: user?.UserLoginID,
                IPAddress: ipAddress,
                XmlDoc: xmlDoc
            };


            const response = await agent.post(
                "/api/Admission/save-candidate-devto-approval",
                payload
            );

            if (
                response.data === "Y" ||
                response.data?.Data === "Y" ||
                response.data?.message === "Y"
            ) {
                await Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Admission Rejected Successfully",
                    confirmButtonColor: "#28a745"
                });

                navigate("/Admission/CandidateListPendingForDvetOApproval"); // optional
            }
            else {
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to reject admission"
                });
            }
        } catch (error) {

            Swal.fire(
                "Error",
                error?.response?.data?.title || "Failed to reject admission",
                "error"
            );
        }
    };


    const handleRejectAdmission = async () => {
        const isValid = await validateRejectAdmission();
        if (!isValid) return;

        const result = await Swal.fire({
            title: 'Reject Admission',
            text: 'Are you sure you want to reject this admission? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Reject',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        setRejecting(true);

        try {
            const candidateRes = await agent.get(
                `${GetCandidateIDByApplicationID}?applicationID=${state?.P1}`
            );
            const candidateID = candidateRes.data?.Data;

            const documentsXML = buildDocumentsXML();

            const requestData = {
                CandidateID: candidateID,
                ApplicationID: Number(state?.P1),
                CourseID: Number(state?.C1),
                CollegeID: Number(state?.C2),
                RoundID: Number(state?.R1),
                XMLString: documentsXML,
                RejectionComments: remark || "Rejected",
                RejectedBy: user?.UserLoginID || "Admin",
                RejectedByIPAddress: ipAddress,
                ReasonForRejection: reasonForRejection || ""
            };


            const response = await agent.post("/api/Admission/reject-admission", requestData);

            const resultData = response.data;

            if (
                resultData === "Y" ||
                resultData?.message === "Y" ||
                resultData?.Data === "Y" ||
                resultData?.IsOk === "Y"
            ) {
                // Show success message
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Admission rejected successfully!',
                    timer: 1500,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745',
                    showConfirmButton: true,
                });

                // Fetch rejection summary for printing
                const printData = await fetchRejectionSummaryForPrint();

                if (printData) {
                    // Open print window with rejection letter
                    const success = await handleRejectionPrintWithWindow(printData);
                    if (!success) {
                    }
                } else {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Failed to load rejection letter data',
                        confirmButtonColor: '#3085d6'
                    });
                }

                setTimeout(() => {
                    navigate('/institute/dashboard');
                }, 2000);

            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: resultData?.message || "Failed to reject admission.",
                    confirmButtonColor: '#3085d6'
                });
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || "An error occurred while rejecting admission. Please try again.",
                confirmButtonColor: '#3085d6'
            });
        } finally {
            setRejecting(false);
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
            <div className="container-fluid px-2 py-3">

                {/*  Red Label */}
                {errorMessage && (
                    <div
                        role="alert"
                        style={{
                            backgroundColor: "#f8d7da",
                            color: "#842029",
                            border: "1px solid #f5c2c7",
                            padding: "12px 10px",
                            marginBottom: "45px",
                            borderRadius: "5px",
                            fontSize: "14px",
                            fontWeight: "500",
                            width: "100%",
                            boxSizing: "border-box"
                        }}
                    >
                        Last Date of Admission is Over !!
                    </div>
                )}

                {/* 🔷 Confirm Admission Title */}
                <div
                    style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                        borderRadius: "10px",
                        height: "58px",
                        position: "relative",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: "-23px",
                            left: "20px",
                            backgroundColor: "#002060",
                            color: "#fff",
                            padding: "6px 16px",
                            borderRadius: "6px",
                            fontSize: "18px",
                            fontWeight: "500",
                            boxShadow: "0 4px 7px rgba(0,0,0,0.2)"
                        }}
                    >
                        ☰ Confirm Admission
                    </div>
                </div>

            </div>
        );
    }

    return (

        <div className="container-fluid px-4 py-3">

            {/* 🔷 MAIN OUTER CONTAINER */}
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
                {/*  Admission Date Over Label */}
                {errorMessage && (
                    <div
                        className="alert alert-danger mb-3"
                        role="alert"
                        style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            padding: "10px 12px"
                        }}
                    >
                        Last Date of Admission is Over !!
                    </div>
                )}

                {/* 🔷 FLOATING HEADER */}
                <div
                    style={{
                        position: "absolute",
                        top: "-11px",
                        left: "20px",
                        backgroundColor: "#002060",
                        color: "#fff",
                        padding: "6px 16px",
                        borderRadius: "6px",
                        fontSize: "18px",
                        fontWeight: "500",
                        boxShadow: "0 4px 7px rgba(0,0,0,0.2)"
                    }}
                >
                    ☰ Confirm Admission
                </div>
                {errorMessage && (
                    <div
                        className="alert alert-warning mb-4"
                        role="alert"
                        style={{
                            fontSize: "15px",
                            fontWeight: "500"
                        }}
                    >
                        {errorMessage}
                    </div>
                )}

                {isInstitute &&
                    requiredFieldsInvalid &&
                    requiredFieldsError && (
                        <div
                            className="alert alert-danger mb-4 text-red-400"
                            role="alert"
                            style={{
                                fontSize: "15px",
                                fontWeight: "500"
                            }}
                        >
                            <strong>Required Details Missing:</strong>

                            <div
                                className="mt-1"
                                dangerouslySetInnerHTML={{
                                    __html: requiredFieldsError
                                }}
                            />
                        </div>
                    )}

                {/* 🔷 Profile Strip */}
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

                {/* 🔹 PRIMARY DETAILS */}
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

                {/* 🔹 Category Details Section */}
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

                                    {/* Row 3 (FIXED) */}
                                    <tr>
                                        <td style={{ padding: '6px 8px' }}>
                                            <span className="text-muted">Belong to PWD :</span>
                                            <span className="fw-semibold" style={{ marginLeft: '4px' }}>
                                                {data?.CandidateCategorySummary?.IsBelongToPWD || '-'}
                                            </span>
                                        </td>

                                        <td></td> {/* ✅ important to maintain structure */}
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 🔹 Qualification Section */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-header" style={{ backgroundColor: '#e9ecef', padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                        <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>Qualification Details</h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-bordered mb-0" style={{ fontSize: '14px', width: '100%' }}>
                                <thead>
                                    {data?.CandidateQualificationSummaryList.some((d) => d?.QualificationGroup == 'B') ? (
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Highest Standard Attended</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Year Of Appearing</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Marks Obtained</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Maximum Marks</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Result</th>
                                        </tr>
                                    ) : (
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Qualification Type</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Name of Degree</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Subject / Branch / Trade</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Board / University</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Marks Obtained</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Maximum Marks</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6' }}>Class / Grade</th>
                                        </tr>

                                    )}
                                </thead>
                                <tbody>
                                    {data?.CandidateQualificationSummaryList?.length > 0 ? (
                                        data.CandidateQualificationSummaryList.some((d) => d?.QualificationGroup === 'B') ? (
                                            // Group B: 5-column rows (matches the 5-column header)
                                            data.CandidateQualificationSummaryList.map((q, i) => (
                                                <tr key={i}>
                                                    <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>{q.Qualification || '-'}</td>
                                                    <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{q.AppearingYear || '-'}</td>
                                                    <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{q.MarksObtained || '-'}</td>
                                                    <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{q.MaximumMarks || '-'}</td>
                                                    <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>{q.Class || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            // Non-Group B: 7-column rows (matches the 7-column header)
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
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={data?.CandidateQualificationSummaryList?.some((d) => d?.QualificationGroup === 'B') ? 5 : 7} style={{ padding: '30px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                                                No qualification data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 🔹 Training Section */}
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

                {/* 🔹 Work Experience Section */}
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

                {/* 🔹 Allotted Institute Section */}
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

                {/* 🔹 Required Documents Section */}
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
                                            <th style={{ padding: '12px 10px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '42%' }}>Document Name</th>
                                            <th style={{ padding: '12px 10px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '10%' }}>View</th>
                                            <th style={{ padding: '12px 10px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '20%' }}>Verified By Institute</th>
                                            <th style={{ padding: '12px 10px', fontWeight: '600', textAlign: 'center', border: '1px solid #dee2e6', width: '20%' }}>Original Document Submitted at Institute</th>
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
                                                        <select className="form-select form-select-sm" style={{ fontSize: '13px', width: '100%' }} value={doc.InstituteVerificationStatus || '-1'} disabled={isDVETO} onChange={(e) => {
                                                            const newStatus = e.target.value;
                                                            const updatedDocs = data.ListRequiredDocumentSummary.map((d, i) => i === index ? { ...d, InstituteVerificationStatus: newStatus } : d);
                                                            setData({ ...data, ListRequiredDocumentSummary: updatedDocs });
                                                        }}>
                                                            <option value="-1">Select</option>
                                                            <option value="Y">Verified</option>
                                                            <option value="N">Not Verified</option>
                                                        </select>
                                                    ) : (<span style={{ color: '#6c757d' }}>-</span>)}
                                                </td>
                                                <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                                                    {doc.DocumentUrl && doc.IsDocumentCompulsory ? (
                                                        <select className="form-select form-select-sm" style={{ fontSize: '13px', width: '100%' }} value={doc.IsOrignalDocumentSubmitted || '-1'} disabled={isDVETO} onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            const updatedDocs = data.ListRequiredDocumentSummary.map((d, i) => i === index ? { ...d, IsOrignalDocumentSubmitted: newValue } : d);
                                                            setData({ ...data, ListRequiredDocumentSummary: updatedDocs });
                                                        }}>
                                                            <option value="-1">Select</option>
                                                            <option value="Y">Yes</option>
                                                            <option value="N">No</option>
                                                        </select>
                                                    ) : (<span style={{ color: '#6c757d' }}>{!doc.DocumentUrl ? '-' : 'Not Applicable'}</span>)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🔹 Admission Confirmation Section */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-header" style={{ backgroundColor: '#e9ecef', padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
                        <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>Admission Confirmation</h5>
                    </div>
                    <div className="card-body" style={{ paddingTop: '20px' }}>

                        {/* Batch, Shift, Unit - Proper Alignment */}
                        {!isDVETO && (
                            <>
                                <div
                                    className="mb-4"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        gap: '15px'
                                    }}
                                >
                                    <div style={{ width: '32%' }}>
                                        <label className="fw-bold mb-2" style={{ display: 'block' }}>
                                            Batch: <span style={{ color: "#dc3545" }}>*</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            style={{
                                                height: '42px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                width: '100%'
                                            }}
                                            value={selectedBatch}
                                            onChange={(e) => handleBatchChange(e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            {batches.map((batch, index) => (
                                                <option key={index} value={batch.BatchID || batch.Value}>
                                                    {batch.ShiftUnit || batch.Text}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ width: '120px' }}>
                                        <label className="fw-bold mb-2" style={{ display: 'block' }}>
                                            Shift:
                                        </label>
                                        <div
                                            style={{
                                                width: '120px',
                                                height: '42px',
                                                backgroundColor: '#e9ecef',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {batchDetails?.ShiftID || '0'}
                                        </div>
                                    </div>

                                    <div style={{ width: '120px' }}>
                                        <label className="fw-bold mb-2" style={{ display: 'block' }}>
                                            Unit:
                                        </label>
                                        <div
                                            style={{
                                                width: '120px',
                                                height: '42px',
                                                backgroundColor: '#e9ecef',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {batchDetails?.UnitNo || '0'}
                                        </div>
                                    </div>
                                </div>

                                {/* Dates Row */}
                                <div
                                    className="mb-4"
                                    style={{
                                        display: 'flex',
                                        gap: '20px'
                                    }}
                                >
                                    <div style={{ flex: '1' }}>
                                        <label className="fw-bold mb-2 d-block">
                                            Batch Start Date: <span style={{ color: "#dc3545" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{
                                                height: '42px',
                                                width: '100%',
                                                border: '1px solid #ced4da',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                            value={batchDetails?.BatchStartDate || ''}
                                            readOnly
                                        />
                                    </div>

                                    <div style={{ flex: '1' }}>
                                        <label className="fw-bold mb-2 d-block">
                                            Batch End Date: <span style={{ color: "#dc3545" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{
                                                height: '42px',
                                                width: '100%',
                                                border: '1px solid #ced4da',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                            value={batchDetails?.BatchEndDate || ''}
                                            readOnly
                                        />
                                    </div>

                                    <div style={{ flex: '1' }}>
                                        <label className="fw-bold mb-2 d-block">
                                            Last Date of Admission: <span style={{ color: "#dc3545" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{
                                                height: '42px',
                                                width: '100%',
                                                border: '1px solid #ced4da',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                            value={batchDetails?.AdmissionEndDate || ''}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Intake, Admitted, Vacancy */}
                                <div
                                    className="mb-4"
                                    style={{
                                        display: 'flex',
                                        gap: '20px'
                                    }}
                                >
                                    <div style={{ flex: '1' }}>
                                        <label className="fw-bold mb-2 d-block">Intake:</label>
                                        <div
                                            style={{
                                                width: '120px',
                                                height: '42px',
                                                backgroundColor: '#e9ecef',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {batchDetails?.Intake || '0'}
                                        </div>
                                    </div>

                                    <div style={{ flex: '1' }}>
                                        <label className="fw-bold mb-2 d-block">Admitted:</label>
                                        <div
                                            style={{
                                                width: '120px',
                                                height: '42px',
                                                backgroundColor: '#e9ecef',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {batchDetails?.Admitted || '0'}
                                        </div>
                                    </div>

                                    <div style={{ flex: '1' }}>
                                        <label className="fw-bold mb-2 d-block">Vacancy:</label>
                                        <div
                                            style={{
                                                width: '120px',
                                                height: '42px',
                                                backgroundColor: '#e9ecef',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {batchDetails?.Vacant || '0'}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {isDVETO && (
                            <div className="mb-4">
                                <table
                                    className="table table-bordered"
                                    style={{
                                        width: "100%",
                                        backgroundColor: "#fff",
                                        marginBottom: "0"
                                    }}
                                >
                                    <tbody>
                                        {/* Row 1 */}
                                        <tr>
                                            <td style={{ width: "25%" }}>
                                                <strong>Unit</strong>
                                                <div>{data?.AllotmentSummary?.UnitNo || "-"}</div>
                                            </td>

                                            <td style={{ width: "25%" }}>
                                                <strong>Shift</strong>
                                                <div>{data?.AllotmentSummary?.ShiftNo || "-"}</div>
                                            </td>

                                            <td style={{ width: "25%" }}></td>
                                            <td style={{ width: "25%" }}></td>
                                        </tr>

                                        {/* Row 2 */}
                                        <tr>
                                            <td>
                                                <strong>Total Course Fees</strong>
                                                <div>
                                                    {data?.AllotmentSummary?.CourseFee || "0.00"}
                                                </div>
                                            </td>

                                            <td>
                                                <strong>Amount paid by Candidate</strong>
                                                <div>
                                                    {data?.AllotmentSummary?.PaidCourseFee || "0.00"}
                                                </div>
                                            </td>

                                            <td>
                                                <strong>Course Start Date</strong>
                                                <div>
                                                    {data?.AllotmentSummary?.CourseStartDate || "-"}
                                                </div>
                                            </td>

                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Fees Row */}
                        {!isDVETO && (
                            <>
                                <div
                                    className="mb-4"
                                    style={{
                                        display: 'flex',
                                        gap: '20px'
                                    }}
                                >
                                    <div style={{ flex: '1' }}>
                                        <label className="fw-bold mb-2 d-block">
                                            Total Course Fees: <span style={{ color: "#dc3545" }}>*</span>
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
                                            value={totalCourseFees}
                                            readOnly={isDVETO}
                                            onChange={(e) => handleTotalFeesChange(e.target.value)}
                                            placeholder="Enter total course fees"
                                        />
                                    </div>

                                    <div style={{ flex: '1' }}>
                                        <label className="fw-bold mb-2 d-block">
                                            Amount paid by Candidate: <span style={{ color: "#dc3545" }}>*</span>
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
                                            value={amountPaid}
                                            readOnly={isDVETO}
                                            onChange={(e) => handleAmountPaidChange(e.target.value)}
                                            placeholder="Enter amount paid"
                                        />
                                    </div>

                                    <div style={{ flex: '1' }}>
                                        <label className="fw-bold mb-2 d-block">
                                            Balance:
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
                                            value={balance}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Reason for Rejection */}
                        {isInstitute && (
                            <div
                                className="mb-4"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <label className="fw-bold mb-2">
                                    Reason for Rejection (If Rejecting Admission)
                                </label>

                                <select
                                    className="form-select"
                                    size="1"
                                    style={{
                                        height: '42px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        width: '60%',
                                        paddingLeft: '10px'
                                    }}
                                    value={reasonForRejection}
                                    onChange={(e) => setReasonForRejection(e.target.value)}
                                >
                                    <option value="-1">Select</option>

                                    <option value="Required Document/s Not Submitted">
                                        Required Document/s Not Submitted
                                    </option>

                                    <option value="Document/s Given are Inappropriate">
                                        Document/s Given are Inappropriate
                                    </option>

                                    <option value="Wrong Information Filled in the Form">
                                        Wrong Information Filled in the Form
                                    </option>

                                    <option value="10th Marks filled are Incorrect">
                                        10th Marks filled are Incorrect
                                    </option>

                                    <option value="Original School LC Not Available">
                                        Original School LC Not Available
                                    </option>

                                    <option value="Student's Request">
                                        Student's Request
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>
                        )}

                        {/* Remark */}
                        <div
                            className="mb-4"
                            style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <label className="fw-bold mb-2">
                                Remark
                            </label>
                            <textarea
                                className="form-control"
                                rows="5"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Enter remarks..."
                                style={{
                                    width: '100%',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    padding: '10px',
                                    backgroundColor: '#f8f9fa',
                                    resize: 'vertical',
                                    minHeight: '120px'
                                }}
                            ></textarea>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-center gap-4 mt-6">
                            {isInstitute && (
                                <>
                                    <button
                                        onClick={handleConfirmAdmission}
                                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Confirm Admission
                                    </button>

                                    <button
                                        onClick={handleRejectAdmission}
                                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Reject Admission
                                    </button>
                                </>
                            )}

                            {isDVETO && (
                                <>
                                    <button
                                        onClick={handleDVETOApprove}
                                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Approve Admission
                                    </button>

                                    <button
                                        onClick={handleDVETOReject}
                                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Reject Admission
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmAdmissionDetails;
