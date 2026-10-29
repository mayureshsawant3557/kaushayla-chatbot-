import React, { useState } from 'react';
import { Calendar, FileText, Search, Download, Edit, Eye, User, BookOpen, CheckCircle, Calendar as CalendarIcon, MapPin, Award, ArrowLeft, ExternalLink, Plus } from 'lucide-react';
import NewVerificationForm from './NewVerificationForm'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import verification1 from '../../../assets/verification2.jpg';
import verification2 from '../../../assets/verification1.jpg';
import { GetMasterTableList, GetCandidateID } from "../../../Endpoints_All/Base/masterData";
import {
    CandidateResultsDetails, CandidateResults, GenerateResult,
    GenerateCertificate, CheckIsPreviouslyVerified, GenerateSignedVerificationCertificate, GetVerificationCertificateRequests
} from "../../../Endpoints_All/Examination/VerificationCertificate";
import { ShieldCheck, Loader } from 'lucide-react';
import agent from '../../../lib/api/agent';
import publicAgent from '../../../lib/api/publicAgent';
import { useLocation } from "react-router-dom";
import LegitDoc from '../../Home/legitdoc';
import LegitDoc22 from '../../Home/LegitDoc22';
import LegitDownload from '../../Home/LegitDownload';
import LegitDownload22 from '../../Home/LegitDownload22';



const CertificateVerificationSystem = () => {
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState('main');

    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Separate states for each form
    const [newVerificationResults, setNewVerificationResults] = useState([]);
    const [previousVerificationResults, setPreviousVerificationResults] = useState([]);
    const [isIssued, setIsIssued] = useState(false);
    //const [candidateID, setCandidateID] = useState();

    // Separate form data for each form
    const [newFormData, setNewFormData] = useState({
        profileId: '',
        firstName: '',
        candidateName: '',
        dateOfBirth: '',
        gender: '',
    });


    const [previousFormData, setPreviousFormData] = useState({
        profileId: '',
        verificationCertNo: ''
    });

    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloading2, setIsDownloading2] = useState(false);
    const [isDownloadingSignedCert, setIsDownloadingSignedCert] = useState(false);

    // Handle form input changes for new verification
    const handleNewFormInputChange = (field, value) => {
        setNewFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (error) setError('');
    };

    // Handle form input changes for previous verification
    const handlePreviousFormInputChange = (field, value) => {
        setPreviousFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (error) setError('');
    };

    // Handle form reset for new verification
    const handleNewFormReset = () => {
        setNewFormData({
            profileId: '',
            firstName: '',
            candidateName: '',
            dateOfBirth: '',
            gender: '',
        });
        setNewVerificationResults([]);
        setError('');
    };

    // Handle form reset for previous verification
    const handlePreviousFormReset = () => {
        setPreviousFormData({
            profileId: '',
            verificationCertNo: ''
        });
        setPreviousVerificationResults([]);
        setError('');
    };

    // Validate new verification form data
    const validateNewForm = () => {
        if (!newFormData.profileId.trim()) {
            setError('Profile ID is required');
            return false;
        }
        if (!newFormData.firstName.trim()) {
            setError('First Name is required');
            return false;
        }
        if (!newFormData.dateOfBirth) {
            setError('Date of Birth is required');
            return false;
        }
        if (!newFormData.gender) {
            setError('Gender is required');
            return false;
        }
        return true;
    };

    // Validate previous verification form data
    const validatePreviousForm = () => {
        if (!previousFormData.verificationCertNo.trim()) {
            setError('Verification Certificate No is required');
            return false;
        }
        if (!previousFormData.profileId.trim()) {
            setError('Profile ID is required');
            return false;
        }
        return true;
    };

    // Handle search for new verification
    const handleNewVerificationSearch = async () => {
        if (!validateNewForm()) return;
        setIsSubmitting(true);
        setLoading(true);
        setError('');
        setNewVerificationResults([]);

        try {
            const candidateIdResponse = await publicAgent.get(`${GetCandidateID}?ApplicationID=${newFormData.profileId}`);
            const candidateIdData = candidateIdResponse.data;

            if (candidateIdResponse.status !== 200) {
                throw new Error('Please enter correct ProfileID');
            }

            if (candidateIdData.StatusCode !== 200) {
                throw new Error(candidateIdData.message || 'Failed to retrieve candidate ID');
            }

            const candidateId = candidateIdData.Data;

            const resultsResponse = await publicAgent.get(`${CandidateResults}?candidateId=${candidateId}`);
            const resultsData = resultsResponse.data;

            if (resultsResponse.status !== 200) {
                throw new Error('Failed to fetch candidate results');
            }

            if (resultsData.Status === "Success" && resultsData.Data?.length > 0) {
                setNewFormData(prev => ({ ...prev, candidateName: resultsData.Data[0].CandidateName }));
            }

            if (resultsData.StatusCode !== 200) {
                throw new Error(resultsData.message || 'Failed to retrieve candidate results');
            }

            const candidates = resultsData.Data;

            const matchedCandidates = candidates.filter(candidate => {
                const candidateFullName = (candidate.CandidateName || '').toLowerCase().trim();
                const formFirstName = newFormData.firstName.toLowerCase().trim();
                const candidateFirstName = candidateFullName.split(' ')[0];
                const firstNameMatch = candidateFirstName === formFirstName;

                let genderCode = '';
                if (newFormData.gender.toLowerCase() === 'male') genderCode = 'M';
                else if (newFormData.gender.toLowerCase() === 'female') genderCode = 'F';
                else genderCode = 'O';

                const genderMatch = candidate.GenderCode === genderCode;

                const apiDate = new Date(candidate.DateofBirth);
                const formDate = new Date(newFormData.dateOfBirth);
                const dateMatch = apiDate.toDateString() === formDate.toDateString();

                return firstNameMatch && genderMatch && dateMatch;
            });


            if (matchedCandidates.length === 0) {
                showCandidateNotFoundPopup(newFormData);
                return;
            }

            const normalizedCandidates = matchedCandidates.map(candidate => ({
                ...candidate,
                profileNo: candidate.ProfileNo,
                candidateName: candidate.CandidateName,
                dateofBirth: candidate.DateofBirth,
                motherName: candidate.MotherName,
                applicationID: candidate.ApplicationID,
                applicationIDDisplay: candidate.ApplicationIDDisplay,
                examination: candidate.Examination,
                courseNameCode: candidate.CourseNameCode,
                duration: candidate.Duration,
                instituteNameCode: candidate.InstituteNameCode,
                resultStatus: candidate.ResultStatus,
                percentage: candidate.Percentage,
                grade: candidate.Grade,
                courseID: candidate.CourseID,
                examinationID: candidate.ExaminationID,
                CandidateID: candidate.CandidateID,
                showDetails: false,
                detailedData: null
            }));

            setNewVerificationResults(normalizedCandidates);

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred while searching. Please try again.');
           
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    // Handle search for previous verification with initial API check
    const handlePreviousVerificationSearch = async () => {
        if (!validatePreviousForm()) return;
        setIsSubmitting(true);
        setLoading(true);
        setError('');
        setPreviousVerificationResults([]);

        // Reset isIssued at the start
        setIsIssued(false);

        try {
            const verificationResponse = await publicAgent.get(`${CheckIsPreviouslyVerified}?certificateNo=${previousFormData.verificationCertNo}&profileID=${previousFormData.profileId}`);

            if (verificationResponse?.data.Status !== "Success") {
                if (verificationResponse?.data.StatusCode === 404) {
                    throw new Error('Certificate number or Profile ID not found in the system');
                }
                throw new Error(`API Error: ${verificationResponse.status} - Failed to verify certificate`);
            }

            let verificationData = verificationResponse?.data;

            if (verificationData.StatusCode === 200) {
                if (verificationData.Data?.IsVerified) {

                    const certDetails = verificationData.Data.CertificateDetails;

                    // CHECK THE STATUS HERE AND SET isIssued BEFORE SweetAlert
                    const checkIsIssued = verificationData?.Data?.CertificateDetails?.Status === "Issued";
                    setIsIssued(checkIsIssued);

                    const result = await Swal.fire({
                        title: "Verify Certificate Details",
                        html: `
                        <div style="text-align: left; background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 10px 0;">
                            <p><strong>Request No:</strong> ${certDetails.RequestNo}</p>
                            <p><strong>Profile ID:</strong> ${certDetails.ProfileID}</p>
                            <p><strong>Candidate Name:</strong> ${certDetails.Name}</p>
                            <p><strong>Status:</strong> ${certDetails.Status}</p>
                            <p><strong>Printed On:</strong> ${new Date(certDetails.PrintedOn).toLocaleString('en-IN')}</p>
                            <p><strong>Verification Status:</strong> ${verificationData.Data.Message}</p>
                        </div>
                        <p style="margin-top: 20px; font-weight: 500;">Are you sure these certificate details are correct?</p>
                    `,
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Yes, Details are Correct",
                        cancelButtonText: "No, Cancel",
                        width: '500px'
                    });

                    if (result.isConfirmed) {
                        // Get candidate ID using the ProfileID from verification response
                        const candidateIdResponse = await publicAgent.get(`${GetCandidateID}?ApplicationID=${certDetails.ProfileID}`);
                        if (candidateIdResponse.status !== 200) {
                            throw new Error('Please enter correct ProfileID');
                        }
                        const candidateIdData = candidateIdResponse.data;

                        if (candidateIdData.StatusCode !== 200) {
                            throw new Error(candidateIdData.message || 'Failed to retrieve candidate ID');
                        }

                        const candidateId = candidateIdData.Data;

                        // Get candidate results
                        const resultsResponse = await publicAgent.get(`${CandidateResults}?candidateId=${candidateId}`);
                        const resultsData = resultsResponse.data;

                        if (resultsResponse.status !== 200) {
                            throw new Error('Failed to fetch candidate results');
                        }

                        if (resultsData.StatusCode !== 200) {
                            throw new Error(resultsData.message || 'Failed to retrieve candidate results');
                        }

                        const candidates = resultsData.Data;

                        if (candidates && candidates.length > 0) {
                            const normalizedCandidates = candidates.map(candidate => ({
                                ...candidate,
                                profileNo: candidate.ProfileNo,
                                candidateName: candidate.CandidateName,
                                dateofBirth: candidate.DateofBirth,
                                motherName: candidate.MotherName,
                                applicationID: candidate.ApplicationID,
                                applicationIDDisplay: candidate.ApplicationIDDisplay,
                                examination: candidate.Examination,
                                courseNameCode: candidate.CourseNameCode,
                                duration: candidate.Duration,
                                instituteNameCode: candidate.InstituteNameCode,
                                resultStatus: candidate.ResultStatus,
                                percentage: candidate.Percentage,
                                grade: candidate.Grade,
                                courseID: candidate.CourseID,
                                examinationID: candidate.ExaminationID,
                                CandidateID: candidate.CandidateID, // IMPORTANT: Include CandidateID
                                showDetails: false,
                                detailedData: null,
                                isPreviousVerification: true,
                                verificationDetails: certDetails
                            }));

                            setPreviousVerificationResults(normalizedCandidates);

                            // Keep isIssued as true since we already set it
                        } else {
                            throw new Error('No candidate found with the provided Profile ID');
                        }
                    } else {
                        // User cancelled, reset isIssued
                        setIsIssued(false);
                        setLoading(false);
                        setIsSubmitting(false);
                        return;
                    }
                } else {
                    const msg = verificationData.Data?.Message;
                    const isVerified = verificationData.Data?.IsVerified;

                    if (!isVerified) {
                        if (msg?.toLowerCase().includes("pending")) {
                            await Swal.fire({
                                icon: "info",
                                title: "Verification Pending",
                                text: msg || "Your certificate verification is still pending. Please try again later."
                            });
                            return;
                        }
                        throw new Error(msg || "Verification failed");
                    }
                }
            } else {
                throw new Error(verificationData.Message || "API failed");
            }

        } catch (err) {
            // Reset isIssued on error
            setIsIssued(false);

            await Swal.fire({
                title: 'Verification Failed!',
                html: `
                <div style="text-align: center; margin: 20px 0;">
                    <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
                        <h5 style="color: #721c24; margin: 0 0 10px 0;">Certificate Verification Error</h5>
                        <p style="color: #721c24; margin: 0; font-weight: 500;">${err.message}</p>
                    </div>
                </div>
            `,
                icon: 'error',
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#dc3545',
                width: '500px'
            });

            setError(err.message || 'An error occurred while verifying certificate. Please try again.');
           
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };


    // Download Signed Verification Certificate
    const handleDownloadSignedVerificationCertificate = async (candidate) => {
        try {
            setIsDownloadingSignedCert(true);

            // ✅ SHOW LOADER POPUP
            Swal.fire({
                title: 'Downloading...',
                text: 'Please wait while your certificate is being prepared',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const candidateID = candidate?.CandidateID;

            if (!candidateID) {
                throw new Error("Candidate ID not found");
            }

            const response = await publicAgent.post(
                `${GenerateSignedVerificationCertificate}?candidateID=${candidateID}`,
                {},
                { responseType: 'blob' }
            );

            const blob = response.data;

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;

            const now = new Date();
            const dateTimeString = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

            const userLoginID = candidate.profileNo || "User";
            link.download = `${userLoginID}_SignedVerificationCertificate_${dateTimeString}.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            // ✅ CLOSE LOADER FIRST
            Swal.close();

            // ✅ SUCCESS POPUP
            Swal.fire({
                icon: 'success',
                title: 'Download Successful!',
                text: 'Signed Verification Certificate downloaded successfully.',
            });

        } catch (error) {

            // ✅ CLOSE LOADER
            Swal.close();

            Swal.fire({
                icon: 'error',
                title: 'Download Failed!',
                text: error.response?.data?.message || error.message || 'Failed to download certificate',
            });

        } finally {
            setIsDownloadingSignedCert(false);
        }
    };

    // Function to show the "Candidate Not Found" popup
    const showCandidateNotFoundPopup = (formData) => {
        Swal.fire({
            title: 'Candidate Not Found',
            html: `
      <div style="text-align: left; margin: 20px 0;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Profile ID*</label>
            <div style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; background-color: #f8f9fa; color: #333;">
              ${formData.profileId || ''}
            </div>
          </div>
          
          <div>
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">First Name*</label>
            <div style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; background-color: #f8f9fa; color: #333;">
              ${formData.firstName || ''}
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Date of Birth*</label>
            <div style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; background-color: #f8f9fa; color: #333;">
              ${formData.dateOfBirth || ''}
            </div>
          </div>
          
          <div>
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Gender*</label>
            <div style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; background-color: #f8f9fa; color: #333;">
              ${formData.gender || ''}
            </div>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #fff2f2; border: 1px solid #ffcdd2; border-radius: 4px; text-align: center;">
          <p style="margin: 0; color: #d32f2f; font-weight: 500;">
            The candidate with above details not found. Reverify the information as from Result/Certificate and search again
          </p>
        </div>
      </div>
    `,
            icon: 'error',
            confirmButtonText: 'Close',
            confirmButtonColor: '#dc3545',
            width: '700px',
            showCloseButton: true,
            allowOutsideClick: true,
            customClass: {
                popup: 'swal-horizontal-popup'
            }
        });
    };

    const handleDownloadStatementofMarks = async (candidate) => {
        try {
            setIsDownloading(true);
            const candidateID = candidate.CandidateID;
            const apiUrl = `${GenerateResult}?candidateID=${candidateID}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                },
                body: ''
            });

            if (response.ok) {
                // Create blob from response
                const blob = await response.blob();

                // Create download link
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                // Generate filename: UserLoginID_StatementofMarks_ddMMyyyyhhmmss.pdf
                const now = new Date();
                const day = now.getDate().toString().padStart(2, '0');
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const year = now.getFullYear();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');
                const dateTimeString = `${day}${month}${year}${hours}${minutes}${seconds}`;

                const userLoginID = candidate.profileNo;
                const fileName = `${userLoginID}_StatementofMarks_${dateTimeString}.pdf`;
                link.download = fileName;

                // Trigger download
                document.body.appendChild(link);
                link.click();

                // Cleanup
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);

                // Success alert
                Swal.fire({
                    icon: 'success',
                    title: 'Download Successful!',
                    text: 'Statement of Marks has been downloaded successfully.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#10B981',
                    timerProgressBar: true
                });

            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {

            // Error alert
            Swal.fire({
                icon: 'error',
                title: 'Download Failed!',
                text: 'Failed to download Statement of Marks. Please try again.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#EF4444'
            });

        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadCertificate = async (candidate) => {
        try {
            setIsDownloading2(true);
            const candidateID = candidate?.CandidateID;
            const apiUrl = `${GenerateCertificate}?candidateID=${candidateID}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                },
                body: ''
            });

            if (response.ok) {
                // Create blob from response
                const blob = await response.blob();

                // Create download link
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;

                // Generate filename: UserLoginID_Certificate_ddMMyyyyhhmmss.pdf
                const now = new Date();
                const day = now.getDate().toString().padStart(2, '0');
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const year = now.getFullYear();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');
                const dateTimeString = `${day}${month}${year}${hours}${minutes}${seconds}`;

                const userLoginID = candidate.profileNo;
                const fileName = `${userLoginID}_Certificate_${dateTimeString}.pdf`;
                link.download = fileName;

                // Trigger download
                document.body.appendChild(link);
                link.click();

                // Cleanup
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);

                // Success alert
                Swal.fire({
                    icon: 'success',
                    title: 'Download Successful!',
                    text: 'Certificate has been downloaded successfully.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#10B981',
                    timerProgressBar: true
                });

            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {

            // Error alert
            Swal.fire({
                icon: 'error',
                title: 'Download Failed!',
                text: 'Failed to download Certificate. Please try again.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#EF4444'
            });

        } finally {
            setIsDownloading2(false);
        }
    };

    // const handleRequestSignedVerification = async () => {
    //     try {
    //         const response = await publicAgent.get(GetMasterTableList, {
    //             params: {
    //                 TableName: "VerificationCertificateRequests",
    //                 DataValueField: "ProfileID",
    //                 DataTextField: "PaymentStatus",
    //                 HasSelect: false,
    //             },
    //         });

    //         const data = response.data?.Data || [];
    //         console.log("VerificationCertificateRequests Data:", data);

    //         // Find current profileId in response
    //         const record = data.find((item) => item.Value === newFormData.profileId);

    //         console.log("Matching Record:", record);

    //         if (record && record.Text?.toLowerCase() === "completed") {
    //             // Payment already done
    //             await Swal.fire({
    //                 icon: "info",
    //                 title: "Payment Already Done",
    //                 text: "Payment already completed. Download your certificate directly.",
    //                 confirmButtonText: "Download Certificate",
    //                 cancelButtonText: ''
    //             });

    //             // navigate("/Public/CertificateVerification", {
    //             //     state: { profileId: newFormData.profileId },
    //             // });
    //             const candidate = newVerificationResults[0];
    //             await handleDownloadSignedVerificationCertificate(candidate);
    //         } else {
    //             // Not completed → go to verification form
    //             navigate("/verification-certificate", {
    //                 state: { profileId: newFormData.profileId, candidateName: newFormData.candidateName },
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Error fetching categories:", error);

    //         // Handle 404: No data found in table → continue with normal flow
    //         if (error.response && error.response.status === 404) {
    //             console.warn("No records found, continuing to verification form...");
    //             navigate("/verification-certificate", {
    //                 state: { profileId: newFormData.profileId, candidateName: newFormData.candidateName },
    //             });
    //         } else {
    //             // Show alert for other errors
    //             await Swal.fire({
    //                 icon: "error",
    //                 title: "Server Error",
    //                 text: "Something went wrong while fetching data. Please try again later.",
    //             });
    //         }
    //     }
    // };


    const handleRequestSignedVerification = async () => {
        try {
            const candidate = newVerificationResults[0];

            if (!candidate) {
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Candidate information not found. Please search again.",
                });
                return;
            }

            let isPaymentDone = false;
            let isBoardVerified = false;

            try {
                const verificationResponse = await publicAgent.get(`${GetVerificationCertificateRequests}`);

                if (verificationResponse?.data?.Status === 'Success') {
                    const requests = verificationResponse.data.Data?.Table || [];
                    const requestDetails = requests.find(req => req.ProfileID === newFormData.profileId);

                    if (requestDetails) {
                        isBoardVerified = requestDetails.Status === "Issued";
                        isPaymentDone = true;
                    }
                }
            } catch (error) {
            }

            if (!isPaymentDone) {
                try {
                    const paymentResponse = await publicAgent.get(GetMasterTableList, {
                        params: {
                            TableName: "VerificationCertificateRequests",
                            DataValueField: "ProfileID",
                            DataTextField: "PaymentStatus",
                            HasSelect: false,
                        },
                    });

                    const paymentData = paymentResponse.data?.Data || [];
                    const paymentRecord = paymentData.find((item) => item.Value === newFormData.profileId);
                    isPaymentDone = paymentRecord && paymentRecord.Text?.toLowerCase() === "completed";
                } catch (error) {
                }
            }

            if (isPaymentDone && isBoardVerified) {
                await Swal.fire({
                    icon: "success",
                    title: "Certificate Ready",
                    text: "Your signed verification certificate is ready for download.",
                    confirmButtonText: "Download Now",
                    confirmButtonColor: "#10b981",
                });
                await handleDownloadSignedVerificationCertificate(candidate);

            } else if (isPaymentDone && !isBoardVerified) {
                await Swal.fire({
                    icon: "info",
                    title: "Payment Completed",
                    text: "Your payment has been received. Certificate is pending board verification. You will be able to download once verified by the board.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#f59e0b",
                });
                return;
            } else {
                navigate("/verification-certificate", {
                    state: { profileId: newFormData.profileId, candidateName: newFormData.candidateName },
                });
            }

        } catch (error) {
            navigate("/verification-certificate", {
                state: { profileId: newFormData.profileId, candidateName: newFormData.candidateName },
            });
        }
    };
    const handleViewDetails = async (candidate, isFromPreviousVerification = false) => {
        setLoading(true);
        setError('');
        try {
            // If details are already shown, hide them
            if (candidate.showDetails) {
                if (isFromPreviousVerification) {
                    const updatedResults = previousVerificationResults.map(c =>
                        c.applicationID === candidate.applicationID ?
                            { ...c, showDetails: false } :
                            c
                    );
                    setPreviousVerificationResults(updatedResults);
                } else {
                    const updatedResults = newVerificationResults.map(c =>
                        c.applicationID === candidate.applicationID ?
                            { ...c, showDetails: false } :
                            c
                    );
                    setNewVerificationResults(updatedResults);
                }
                return;
            }

            // Check if required fields are available
            if (!candidate.applicationID) {
                throw new Error('Application ID is missing');
            }
            if (!candidate.courseID) {
                throw new Error('Course ID is missing');
            }
            if (!candidate.examinationID) {
                throw new Error('Examination ID is missing');
            }

            // Make API call to get detailed results
            const apiUrl = `${CandidateResultsDetails}?applicationId=${candidate.applicationID}&courseId=${candidate.courseID}&examinationId=${candidate.examinationID}`;

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const detailsData = await response.json();

            if (detailsData.StatusCode === 200 && detailsData.Data) {
                // Update the specific candidate with detailed information
                if (isFromPreviousVerification) {
                    const updatedResults = previousVerificationResults.map(c =>
                        c.applicationID === candidate.applicationID ?
                            {
                                ...c,
                                detailedData: detailsData.Data,
                                showDetails: true
                            } :
                            {
                                ...c,
                                showDetails: false
                            }
                    );
                    setPreviousVerificationResults(updatedResults);
                } else {
                    const updatedResults = newVerificationResults.map(c =>
                        c.applicationID === candidate.applicationID ?
                            {
                                ...c,
                                detailedData: detailsData.Data,
                                showDetails: true
                            } :
                            {
                                ...c,
                                showDetails: false
                            }
                    );
                    setNewVerificationResults(updatedResults);
                }
            } else {
                throw new Error(detailsData.Message || 'Failed to retrieve candidate details');
            }

        } catch (err) {
            setError(`Failed to fetch candidate details: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    // Main selection page
    const MainPage = () => (
        <div className="min-h-screen bg-white px-4 py-10">
            <fieldset className="rounded border border-gray-300 bg-white p-6 shadow-lg">
                <legend className="flex items-center gap-2 rounded border border-gray-300 bg-gray-500 px-6 py-2 text-xl font-bold text-white">
                    <CheckCircle className="h-5 w-5" />
                    Certificate Verification
                </legend>

                {/* Cards Section */}
                <div className="mt-6 flex flex-col items-center justify-center gap-6 md:flex-row">
                    {/* Before Card */}
                    <div
                        className="w-full max-w-sm cursor-pointer overflow-hidden rounded-xl border border-red-300 bg-white shadow-lg transition hover:shadow-xl"
                        onClick={() => setCurrentPage('before')}
                    >
                        {/* Card Header */}
                        <div className="border-b border-red-200 bg-red-600 p-4 text-white">
                            <div className="flex items-center justify-center space-x-2">
                                <Calendar className="h-6 w-6" />
                                <h3 className="text-xl font-semibold">Before</h3>
                            </div>
                            <p className="text-center text-sm text-red-100">Certificates issued before</p>
                        </div>

                        {/* Card Body */}
                        <div className="bg-white p-6 text-center">
                            <div className="text-2xl font-bold text-red-700">31/12/2021</div>
                            <p className="mt-2 font-medium text-red-700">Legacy System</p>
                            <ExternalLink className="mx-auto mt-3 h-5 w-5 text-red-600" />
                        </div>
                    </div>

                    {/* After Card */}
                    <div
                        className="w-full max-w-sm cursor-pointer overflow-hidden rounded-xl border border-blue-300 bg-white shadow-lg transition hover:shadow-xl"
                        onClick={() => setCurrentPage('after')}
                    >
                        {/* Card Header */}
                        <div className="border-b border-blue-200 bg-blue-700 p-4 text-white">
                            <div className="flex items-center justify-center space-x-2">
                                <Calendar className="h-6 w-6" />
                                <h3 className="text-xl font-semibold">After</h3>
                            </div>
                            <p className="text-center text-sm text-blue-100">Certificates issued after</p>
                        </div>

                        {/* Card Body */}
                        <div className="bg-white p-6 text-center">
                            <div className="text-2xl font-bold text-blue-700">01/01/2022</div>
                            <p className="mt-2 font-medium text-blue-700">New System</p>
                            <Search className="mx-auto mt-3 h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Info Note */}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-3 rounded-md border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-800">
                        <FileText className="h-5 w-5" />
                        <p className="text-sm font-medium">
                            Please select the appropriate period based on when your certificate was issued.
                        </p>
                    </div>
                </div>
            </fieldset>
        </div>
    );

    // Before 2022 page - Legacy System Services
    const BeforePage = () => {
        const openExternal = (url) => window.open(url, '_blank', 'noopener,noreferrer');

        return (
            <div className="min-h-screen bg-white px-4 py-10">
                {/* Main Fieldset */}
                <fieldset className="mx-auto max-w-full rounded-lg border border-gray-300 bg-white p-6 shadow">
                    <legend className="flex items-center gap-2 rounded border border-gray-300 bg-gray-500 px-4 py-2 text-base font-bold text-white">
                        Certificate Services (Before 31/12/2021)
                    </legend>

                    {/* Header */}
                    <header className="mb-8">
                        <div className="mx-auto flex max-w-full items-center space-x-4">
                            <button
                                onClick={() => setCurrentPage('main')}
                                className="rounded-md bg-white border border-gray-300 p-2 hover:bg-gray-200"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-700" />
                            </button>
                            <h1 className="text-xl font-semibold text-gray-800">
                                Back to Certificate Selection
                            </h1>
                        </div>
                    </header>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Card 1 */}

                        <div
                            role="link"
                            tabIndex={0}
                            onClick={() => setCurrentPage('legitDoc')}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCurrentPage('legitDoc')}
                            className="cursor-pointer rounded-md border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <Search className="h-5 w-5 text-gray-700" />
                                <h3 className="text-base font-medium text-gray-800">Verify Certificate (2016–2020)</h3>
                            </div>
                            <p className="mb-4 text-sm text-gray-600">
                                For legacy certificates issued between 2016 and 2020.
                            </p>
                            <span className="inline-flex items-center text-sm text-blue-600">
                                <ExternalLink className="mr-1 h-4 w-4" />
                                Go to verification
                            </span>
                        </div>

                        {/* Card 2 - Verify Certificate (2021–2022) */}
                        <div
                            role="link"
                            tabIndex={0}
                            onClick={() => setCurrentPage('legitDoc22')}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCurrentPage('legitDoc22')}
                            className="cursor-pointer rounded-md border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <Search className="h-5 w-5 text-gray-700" />
                                <h3 className="text-base font-medium text-gray-800">Verify Certificate (2021–2022)</h3>
                            </div>
                            <p className="mb-4 text-sm text-gray-600">
                                For certificates issued in the year 2021–2022.
                            </p>
                            <span className="inline-flex items-center text-sm text-blue-600">
                                <ExternalLink className="mr-1 h-4 w-4" />
                                Go to verification
                            </span>
                        </div>
                        {/* Card 3 - Download Certificate (2016–2020) */}
                        <div
                            role="link"
                            tabIndex={0}
                            onClick={() => setCurrentPage('legitDownload')}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCurrentPage('legitDownload')}
                            className="cursor-pointer rounded-md border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <Download className="h-5 w-5 text-gray-700" />
                                <h3 className="text-base font-medium text-gray-800">Download Certificate (2016–2020)</h3>
                            </div>
                            <p className="mb-4 text-sm text-gray-600">
                                Download previously issued certificates from 2016 to 2020.
                            </p>
                            <span className="inline-flex items-center text-sm text-blue-600">
                                <ExternalLink className="mr-1 h-4 w-4" />
                                Download now
                            </span>
                        </div>

                        {/* Card 4 - Download Certificate (2021–2022) */}
                        <div
                            role="link"
                            tabIndex={0}
                            onClick={() => setCurrentPage('legitDownload22')}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCurrentPage('legitDownload22')}
                            className="cursor-pointer rounded-md border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <Download className="h-5 w-5 text-gray-700" />
                                <h3 className="text-base font-medium text-gray-800">Download Certificate (2021–2022)</h3>
                            </div>
                            <p className="mb-4 text-sm text-gray-600">
                                Download certificates for year 2021–2022 issued under legacy system.
                            </p>
                            <span className="inline-flex items-center text-sm text-blue-600">
                                <ExternalLink className="mr-1 h-4 w-4" />
                                Download now
                            </span>
                        </div>
                    </div>
                </fieldset>
            </div>
        );
    };

    // After 2022 options page
    const AfterPage = () => (
        <div className="min-h-screen bg-white px-4 py-10">
            {/* Main Fieldset */}
            <fieldset className="mx-auto max-w-full rounded-lg border border-gray-300 bg-white p-6 shadow">
                <legend className="flex items-center gap-2 rounded border border-gray-300 bg-gray-500 px-4 py-2 text-base font-bold text-white">
                    Certificate Services (After 01/01/2022)
                </legend>

                <header className="mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setCurrentPage('main')}
                            className="rounded-md bg-white border border-gray-300 p-2 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <h1 className="text-lg font-medium text-gray-700">
                            Back to Certificate Selection
                        </h1>
                    </div>
                </header>

                <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Card 1: New Verification */}
                    <div
                        onClick={() => setCurrentPage('newVerification')}
                        className="cursor-pointer rounded-xl border-2 border-blue-200 bg-white p-8 shadow-md transition-all duration-200 hover:shadow-lg hover:border-blue-400 text-center group"
                    >
                        <div className="mb-5 flex justify-center">
                            <div className="p-4 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                <img
                                    src={verification1}
                                    alt="New Verification Icon"
                                    className="h-16 w-16 object-contain"
                                />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            New Verification
                        </h3>
                    </div>

                    {/* Card 2: Previous Signed Verification Certificate */}
                    <div
                        onClick={() => setCurrentPage('previousVerification')}
                        className="cursor-pointer rounded-xl border-2 border-blue-200 bg-white p-8 shadow-md transition-all duration-200 hover:shadow-lg hover:border-blue-400 text-center group"
                    >
                        <div className="mb-5 flex justify-center">
                            <div className="p-4 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                <img
                                    src={verification2}
                                    alt="Previous Verification Icon"
                                    className="h-16 w-16 object-contain"
                                />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Previous Signed
                        </h3>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Verification Certificate
                        </h3>
                    </div>
                </div>
            </fieldset>
        </div>
    );

    // Previous Verification Form
    const PreviousVerificationPage = () => (
        <div className="min-h-screen bg-white px-4 py-10">
            {/* Form Card */}
            <fieldset className="mx-auto max-w-full rounded-lg border border-gray-300 bg-white p-6 shadow">
                <legend className="flex items-center gap-2 rounded border border-gray-300 bg-gray-500 px-4 py-2 text-base font-bold text-white">
                    Previous Verification Certificate
                    
                </legend>
                <header className="mb-8">
                    <div className="mx-auto flex max-w-full items-center space-x-4">
                        <button
                            onClick={() => setCurrentPage('after')}
                            className="rounded-md bg-white border border-gray-300 p-2 hover:bg-gray-200"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800"> Enter Certificate Details</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Download your already issued verification certificate</p>
                        </div>
                    </div>
                </header>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
                        <p className="font-medium text-red-800">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Verification Certificate No */}
                        <div>
                            <label htmlFor="verificationCertNo" className="mb-2 block text-sm font-semibold text-gray-700">
                                Verification Certificate No. *
                            </label>
                            <input
                                id="verificationCertNo"
                                type="text"
                                value={previousFormData.verificationCertNo}
                                onChange={(e) => handlePreviousFormInputChange('verificationCertNo', e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-green-500 focus:outline-none"
                                placeholder="Enter Certificate No."
                                disabled={isSubmitting}
                                autoComplete="off"
                            />
                        </div>

                        {/* Profile ID */}
                        <div>
                            <label htmlFor="prevProfileId" className="mb-2 block text-sm font-semibold text-gray-700">
                                Profile ID *
                            </label>
                            <input
                                id="prevProfileId"
                                type="text"
                                value={previousFormData.profileId}
                                onChange={(e) => handlePreviousFormInputChange('profileId', e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-green-500 focus:outline-none"
                                placeholder="Enter Profile ID"
                                disabled={isSubmitting}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div className="rounded-md border-l-4 border-blue-500 bg-blue-50 p-4">
                        <div className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-blue-800">Important:</span>
                        </div>
                        <p className="mt-1 text-sm text-blue-700">
                            Enter the Verification Certificate Number exactly as mentioned on your already issued certificate.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4 pt-4">
                        <button
                            onClick={handlePreviousVerificationSearch}
                            disabled={isSubmitting}
                            className="flex items-center space-x-2 rounded-md bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
                        >
                            <Search className="h-4 w-4" />
                            <span>{isSubmitting ? 'Searching...' : 'Search & Verify'}</span>
                        </button>
                        <button
                            onClick={handlePreviousFormReset}
                            disabled={isSubmitting}
                            className="rounded-md bg-gray-600 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:bg-gray-400"
                        >
                            Reset Form
                        </button>

                    </div>

                    {/* Results Display for Previous Verification */}
                    {previousVerificationResults.length > 0 && <PreviousVerificationResultsDisplay />}
                </div>
            </fieldset>
        </div>
    );
    // Results display component for New Verification
    const NewVerificationResultsDisplay = () => (
        <div className="mt-8 space-y-4">
            {/* Search Results Title - Legend only takes text width */}
            <fieldset className="border border-gray-300 rounded-lg p-6">
                <legend className="flex items-center gap-2 rounded border border-gray-300 bg-gray-500 px-4 py-2 text-base font-bold text-white">
                    Search Results
                </legend>

                {newVerificationResults.map((candidate, index) => (
                    <div key={index} className="mt-6 first:mt-0">
                        {/* Header Information */}
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-lg bg-blue-50 p-4">
                                <span className="text-sm font-medium text-blue-600">Profile No:</span>
                                <p className="text-lg font-bold text-blue-800">{candidate.profileNo || `${candidate.applicationIDDisplay || candidate.applicationID}`}</p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-4">
                                <span className="text-sm font-medium text-green-600">Candidate Name:</span>
                                <p className="text-lg font-bold text-green-800">{candidate.candidateName}</p>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-lg bg-purple-50 p-4">
                                <span className="text-sm font-medium text-purple-600">Date of Birth:</span>
                                <p className="font-semibold text-purple-800">{formatDate(candidate.dateofBirth)}</p>
                            </div>
                            <div className="rounded-lg bg-orange-50 p-4">
                                <span className="text-sm font-medium text-orange-600">Mother Name:</span>
                                <p className="font-semibold text-orange-800">{candidate.motherName}</p>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="mt-6 overflow-x-auto rounded-lg border-2 border-gray-200">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Action</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Application ID</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Examination</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Course Code</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Duration</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Institute</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleViewDetails(candidate, false)}
                                                disabled={loading}
                                                title={candidate.showDetails ? "Hide Details" : "View Details"}
                                                className="w-15 h-15 flex items-center justify-center mx-auto rounded-full 
               text-blue-600 hover:text-blue-900 hover:bg-gray-100 
               transition-all duration-200"
                                            >
                                                <Eye className="h-10 w-6" />
                                            </button>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3 font-medium">
                                            {candidate.applicationIDDisplay || candidate.applicationID}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3">
                                            {candidate.examination}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3">
                                            {candidate.courseNameCode}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3">
                                            {candidate.duration}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3">
                                            {candidate.instituteNameCode || 'N/A'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Additional Information */}
                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className={`p-4 rounded-lg ${candidate.resultStatus === 'Pass' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                                <span className="text-sm font-medium text-gray-600">Result Status:</span>
                                <p className={`font-bold text-lg ${candidate.resultStatus === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                                    {candidate.resultStatus}
                                </p>
                            </div>
                            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                                <span className="text-sm font-medium text-gray-600">Percentage:</span>
                                <p className="text-lg font-bold text-blue-600">{candidate.percentage}%</p>
                            </div>
                            <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                                <span className="text-sm font-medium text-gray-600">Grade:</span>
                                <p className="text-lg font-bold text-yellow-600">{candidate.grade}</p>
                            </div>
                        </div>

                        {/* DETAILED INFORMATION SECTION - Removed extra border */}
                        <div>
                            {candidate.showDetails && candidate.detailedData && (
                                <div className="mt-8">
                                    {/* Detailed Subject-wise Results Title - Legend only takes text width */}
                                    <fieldset className="border border-gray-300 rounded-lg">
                                        <legend className="flex items-center gap-2 rounded border border-gray-300 bg-gray-500 px-4 py-2 text-base font-bold text-white">
                                            Detailed Subject-wise Results
                                        </legend>
                                        <div className="p-6">
                                            {/* Candidate Information Header */}
                                            {candidate.detailedData.length > 0 && (
                                                <div className="mb-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                                        <div>
                                                            <span className="text-sm font-medium text-blue-600">Course:</span>
                                                            <p className="text-base font-bold text-blue-800">{candidate.detailedData[0].CourseName || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-blue-600">Examination:</span>
                                                            <p className="text-base font-bold text-blue-800">{candidate.detailedData[0].ExaminationName || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-blue-600">Application ID:</span>
                                                            <p className="text-base font-bold text-blue-800">{candidate.detailedData[0].ApplicationIDDisplay || candidate.detailedData[0].ApplicationID || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium text-blue-600">Full Name:</span>
                                                            <p className="text-base font-bold text-blue-800">
                                                                {`${candidate.detailedData[0].FirstName || ''} ${candidate.detailedData[0].MiddleName || ''} ${candidate.detailedData[0].LastName || ''}`.trim() || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Subject-wise Results Table */}
                                            <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
                                                <table className="w-full bg-white">
                                                    <thead>
                                                        <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                                                            <th className="border border-gray-300 px-3 py-3 text-left text-sm font-bold text-gray-700">Subject Code</th>
                                                            <th className="border border-gray-300 px-3 py-3 text-left text-sm font-bold text-gray-700">Subject Name</th>
                                                            <th className="border border-gray-300 px-3 py-3 text-center text-sm font-bold text-gray-700">Type</th>
                                                            <th className="border border-gray-300 px-3 py-3 text-center text-sm font-bold text-gray-700">Max Marks</th>
                                                            <th className="border border-gray-300 px-3 py-3 text-center text-sm font-bold text-gray-700">Min Marks</th>
                                                            <th className="border border-gray-300 px-3 py-3 text-center text-sm font-bold text-gray-700">Obtained</th>
                                                            <th className="border border-gray-300 px-3 py-3 text-center text-sm font-bold text-gray-700">Grace Marks</th>
                                                            <th className="border border-gray-300 px-3 py-3 text-center text-sm font-bold text-gray-700">Result</th>
                                                            <th className="border border-gray-300 px-3 py-3 text-center text-sm font-bold text-gray-700">Attendance</th>
                                                            <th className="border border-gray-300 px-3 py-3 text-center text-sm font-bold text-gray-700">Fresh/Repeat</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {candidate.detailedData.map((subject, subIndex) => (
                                                            <tr key={subIndex} className={`hover:bg-gray-50 ${subIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                                                                <td className="border border-gray-300 px-3 py-3 text-sm font-medium text-gray-800">
                                                                    {subject.SubjectCode || 'N/A'}
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-3 text-sm font-medium text-gray-800">
                                                                    {subject.SubjectName || 'N/A'}
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-3 text-center">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${subject.SubjectTypeCode === 'TH' ? 'bg-blue-100 text-blue-800' :
                                                                        subject.SubjectTypeCode === 'PR' ? 'bg-green-100 text-green-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                        {subject.SubjectTypeCode || 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-3 text-center text-sm font-semibold text-gray-700">
                                                                    {subject.MaxMarks || 0}
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-3 text-center text-sm text-gray-700">
                                                                    {subject.MinMark || 0}
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-3 text-center text-sm font-bold">
                                                                    <span className={`${(subject.ObtMarks || 0) >= (subject.MinMark || 0) ? 'text-green-600' : 'text-red-600'
                                                                        }`}>
                                                                        {subject.ObtMarks || 0}
                                                                    </span>
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-3 text-center text-sm text-gray-700">
                                                                    {subject.GraceMarks || 0}
                                                                    {subject.GraceMarksSymbol && subject.GraceMarksSymbol.trim() && (
                                                                        <span className="ml-1 text-xs text-gray-500">({subject.GraceMarksSymbol})</span>
                                                                    )}
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-3 text-center">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${subject.Result === 'Pass' ? 'bg-green-100 text-green-800' :
                                                                        subject.Result === 'Fail' ? 'bg-red-100 text-red-800' :
                                                                            subject.Result === 'Absent' ? 'bg-yellow-100 text-yellow-800' :
                                                                                'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                        {subject.Result || 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-3 text-center">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${subject.Attendance === 1 ? 'bg-green-100 text-green-800' :
                                                                        subject.Attendance === 0 ? 'bg-red-100 text-red-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                        {subject.Attendance === 1 ? 'Present' : subject.Attendance === 0 ? 'Absent' : 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-3 text-center">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${subject.IsResultFresh === 'F' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-orange-100 text-orange-800'
                                                                        }`}>
                                                                        {subject.IsResultFresh === 'F' ? 'Fresh' : 'Repeat'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Additional Information from API */}
                                            {candidate.detailedData.length > 0 && (
                                                <div className="mt-6 space-y-4">
                                                    {/* Summary Statistics */}
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                                            <span className="text-sm font-medium text-blue-600">Total Subjects:</span>
                                                            <p className="text-2xl font-bold text-blue-800">{candidate.detailedData.length}</p>
                                                        </div>
                                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                            <span className="text-sm font-medium text-green-600">Passed:</span>
                                                            <p className="text-2xl font-bold text-green-800">
                                                                {candidate.detailedData.filter(s => s.Result === 'Pass').length}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                                            <span className="text-sm font-medium text-red-600">Failed:</span>
                                                            <p className="text-2xl font-bold text-red-800">
                                                                {candidate.detailedData.filter(s => s.Result === 'Fail').length}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                                            <span className="text-sm font-medium text-yellow-600">Absent:</span>
                                                            <p className="text-2xl font-bold text-yellow-800">
                                                                {candidate.detailedData.filter(s => s.Result === 'Absent').length}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Additional API Data Display */}
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                            <h5 className="mb-2 font-semibold text-gray-800">Document Information</h5>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="font-medium text-gray-600">Course Code:</span>
                                                                    <span className="ml-2 text-gray-800">{candidate.detailedData[0].CourseCode || 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-600">Examination ID:</span>
                                                                    <span className="ml-2 text-gray-800">{candidate.detailedData[0].ExaminationID || 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-600">Course ID:</span>
                                                                    <span className="ml-2 text-gray-800">{candidate.detailedData[0].CourseID || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                            <h5 className="mb-2 font-semibold text-gray-800">Personal Information</h5>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="font-medium text-gray-600">Date of Birth:</span>
                                                                    <span className="ml-2 text-gray-800">{formatDate ? formatDate(candidate.detailedData[0].DateofBirth) : candidate.detailedData[0].DateofBirth}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-600">Mother Name:</span>
                                                                    <span className="ml-2 text-gray-800">{candidate.detailedData[0].MotherName || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center gap-4 p-6 max-w-6xl mx-auto w-full">
                                                        {/* Download Statement of Marks Button */}
                                                        <button
                                                            onClick={() => handleDownloadStatementofMarks(candidate)}
                                                            disabled={isDownloading}
                                                            className={`flex-1 px-4 py-3 font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 ${isDownloading
                                                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                                : 'bg-blue-800 text-white hover:bg-blue-800 hover:shadow-md'
                                                                }`}
                                                        >
                                                            {isDownloading ? (
                                                                <>
                                                                    <Loader className="animate-spin" size={18} />
                                                                    Downloading...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FileText size={24} />
                                                                    Download Statement of Marks
                                                                </>
                                                            )}
                                                        </button>

                                                        {/* Download Certificate Button */}
                                                        <button
                                                            onClick={() => handleDownloadCertificate(candidate)}
                                                            disabled={isDownloading2}
                                                            className={`flex-1 px-4 py-3 font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 ${isDownloading2
                                                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                                : 'bg-blue-800 text-white hover:bg-blue-800 hover:shadow-md'
                                                                }`}
                                                        >
                                                            {isDownloading2 ? (
                                                                <>
                                                                    <Loader className="animate-spin" size={18} />
                                                                    Downloading...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Award size={24} />
                                                                    Download Certificate
                                                                </>
                                                            )}
                                                        </button>

                                                        {/* Request Signed Verification Certificate Button */}
                                                        <button
                                                            onClick={handleRequestSignedVerification}
                                                            className="flex-1 px-4 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-800 hover:shadow-md transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2"
                                                        >
                                                            <ShieldCheck size={24} />
                                                            Request Signed Verification Certificate
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </fieldset>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </fieldset>
        </div>
    );

    // Results display component for Previous Verification
    const PreviousVerificationResultsDisplay = () => (
        <div className="mt-8 space-y-4">
            <fieldset className="border border-gray-300 rounded-lg p-6">
                <legend className="flex items-center gap-2 rounded border border-gray-300 bg-gray-500 px-4 py-2 text-base font-bold text-white">
                    Verified Certificate Details
                </legend>

                {previousVerificationResults.map((candidate, index) => (
                    <div key={index} className="mt-6 first:mt-0">
                        {/* Header Information */}
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-lg bg-blue-50 p-4">
                                <span className="text-sm font-medium text-blue-600">Profile No:</span>
                                <p className="text-lg font-bold text-blue-800">{candidate.profileNo || `${candidate.applicationIDDisplay || candidate.applicationID}`}</p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-4">
                                <span className="text-sm font-medium text-green-600">Candidate Name:</span>
                                <p className="text-lg font-bold text-green-800">{candidate.candidateName}</p>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-lg bg-purple-50 p-4">
                                <span className="text-sm font-medium text-purple-600">Date of Birth:</span>
                                <p className="font-semibold text-purple-800">{formatDate(candidate.dateofBirth)}</p>
                            </div>
                            <div className="rounded-lg bg-orange-50 p-4">
                                <span className="text-sm font-medium text-orange-600">Mother Name:</span>
                                <p className="font-semibold text-orange-800">{candidate.motherName}</p>
                            </div>
                        </div>

                        {/* Status Information */}
                        {candidate.verificationDetails && (
                            <div className="mb-6 rounded-lg bg-gray-50 p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-700 mb-2">Certificate Status:</h4>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Status:</span>
                                        <p className={`font-bold ${candidate.verificationDetails.Status === 'Issued' ? 'text-green-600' : 'text-orange-600'}`}>
                                            {candidate.verificationDetails.Status}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Printed On:</span>
                                        <p className="font-medium text-gray-800">
                                            {new Date(candidate.verificationDetails.PrintedOn).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Download Button Section - Only show if status is Issued */}
                        {candidate.verificationDetails?.Status === 'Issued' && (
                            <div className="flex justify-center items-center gap-4 p-6 max-w-6xl mx-auto w-full">
                                <button
                                    onClick={() => handleDownloadSignedVerificationCertificate(candidate)}
                                    disabled={isDownloadingSignedCert}
                                    className={`w-70 px-6 py-3 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${isDownloadingSignedCert
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                                        }`}
                                >
                                    {isDownloadingSignedCert ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            <span>Downloading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={25} />
                                            <span>Download Signed Verification Certificate</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </fieldset>
        </div>
    );
    // Render current page
    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'main':
                return <MainPage />;
            case 'before':
                return <BeforePage />;
            case 'after':
                return <AfterPage />;
            case 'legitDoc':
                return <LegitDoc onBack={() => setCurrentPage('before')} />;
            case 'legitDoc22':
                return <LegitDoc22 onBack={() => setCurrentPage('before')} />;
            case 'legitDownload':
                return <LegitDownload onBack={() => setCurrentPage('before')} />;
            case 'legitDownload22':
                return <LegitDownload22 onBack={() => setCurrentPage('before')} />;


            case 'newVerification':
                return (
                    <NewVerificationForm
                        onBack={() => setCurrentPage('after')}
                        onSubmit={() => {
                            handleNewVerificationSearch();
                        }}
                        onReset={() => {
                            handleNewFormReset();
                        }}
                        ResultsComponent={NewVerificationResultsDisplay}
                        isLoading={isSubmitting}
                        error={error}
                        formData={newFormData}
                        onFormDataChange={handleNewFormInputChange}
                        candidateResults={newVerificationResults}
                    />
                );
            case 'previousVerification':
                return <PreviousVerificationPage />;
            default:
                return <MainPage />;
        }
    };

    return renderCurrentPage();
};

export default CertificateVerificationSystem;
