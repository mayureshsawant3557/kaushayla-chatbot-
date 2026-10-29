import React, { useState, useEffect, useContext } from 'react';
import agent from '../../../lib/api/agent';
import FormComponent from '../../formcomponent/FormComponent';
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from 'sweetalert2';
import ProgressTracker from '../../Login/CandidateAndStaff/ProgressTracker';
import { useLoading } from "../../../Hooks/useLoading"
import {
    GetCandidateTrainingList,
    SaveCandidateTraining,
    DeleteCandidateTraining,
    GetCandidateTraining
} from '../../../Endpoints_All/Candidate/training';

import {
    GetStaffTrainingList,
    SaveStaffTraining,
    DeleteStaffTraining,
    GetStaffTraining
} from '../../../Endpoints_All/Staff/training';

import UploadPdf from '../../formcomponent/UploadPdf';
import pdflogo from '../../../assets/pdf.png';
import axios from 'axios';
import { getDeviceIP } from '../../../utils/CommonHelper';
import { useAuth } from '../../../Hooks/AuthContext';
import { CheckCandidateURL } from '../../../Endpoints_All/Candidate/summary';
import { CheckStaffURL } from '../../../Endpoints_All/Staff/summary';
import { DateInput } from '../../formcomponent/DateInputComponent';
import { ThemeContext } from "../../../Component/Context/ThemeContext";

const TrainingPage = () => {
    const { userInfo } = useAuth();
    const userTypeID = Number(userInfo?.UserTypeID);
    const userLoginID = userInfo?.UserLoginID;
    const userID = userInfo?.UserID;
    const [ipAddress, setIpAddress] = useState('');
    const [searchParams] = useSearchParams();
    const candidateIdFromUrl = searchParams.get("candidateId");

    const formType =
        userTypeID === 91 || userTypeID === 61
            ? 'Candidate'
            : 'Staff';
    const isInstituteUser = userTypeID === 61;
    const applicationId = useSearchParams("applicationId");
    const effectiveUserId =
        isInstituteUser && candidateIdFromUrl
            ? candidateIdFromUrl
            : userInfo?.UserID;

    const trainingUserId =
        isInstituteUser && candidateIdFromUrl
            ? candidateIdFromUrl
            : userID;
    const effectiveCandidateId =
        userInfo?.UserTypeID === 61
            ? candidateIdFromUrl
            : userInfo?.UserID;


    const { startLoading, stopLoading, isLoading } = useLoading();

    const API_ENDPOINTS = {
        Candidate: {
            get: GetCandidateTrainingList,
            save: SaveCandidateTraining,
            delete: DeleteCandidateTraining,
            getById: GetCandidateTraining,
            userTypeIDName: 'CandidateID'
        },
        Staff: {
            get: GetStaffTrainingList,
            save: SaveStaffTraining,
            getById: GetStaffTraining,
            delete: DeleteStaffTraining,
            userTypeIDName: 'StaffID'
        }
    };

    const currentEndpoints = API_ENDPOINTS[formType];
    const navigate = useNavigate();

    const [courseName, setCourseName] = useState('');
    const [conductedBy, setConductedBy] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [certificate, setCertificate] = useState(null);
    const [certificatePath, setCertificatePath] = useState('');
    const [trainingList, setTrainingList] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);

    const [hasTraining, setHasTraining] = useState(null);
    const [preservedTrainingData, setPreservedTrainingData] = useState([]);
    const { color } = useContext(ThemeContext);

    // Store existing records IDs for deletion
    const [existingRecordsToDelete, setExistingRecordsToDelete] = useState([]);
    const [previousTrainingRowID, setPreviousTrainingRowID] = useState(0);

    const fileInputRef = React.useRef(null);

    useEffect(() => {
        if (effectiveUserId && ipAddress) {
            fetchTrainingData();
        }
    }, [effectiveUserId, ipAddress]);

    useEffect(() => {
        fetchIP();
        checkCandidateStaffURL();

    }, []);


    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
    };
    const checkCandidateStaffURL = async () => {
        if (!userID) {
            return;
        }
        if (isInstituteUser) {
            return;
        }
        let response;
        if (userTypeID == 91) {
            response = await agent.get(`${CheckCandidateURL}?candidateId=${userID}&pageCode=Training&userLoginId=${userLoginID}`);
        } else if (userTypeID == 95) {
            const payLoad = {
                staffID: userID,
                userLoginID: userLoginID,
                pageCode: 'Training',
                ipAddress: ipAddress

            }
            response = await agent.post(CheckStaffURL, payLoad);
        }

        let IsRightURL;
        let RightURL;
        if (response?.data?.Status == 'Success' && response?.data?.Data) {
            IsRightURL = response?.data?.Data?.IsRightURL;
            RightURL = response?.data?.Data?.RightURL;
        }
        if (!IsRightURL) {
            navigate(RightURL);
        }
    }

    const fetchTrainingData = async () => {
        try {
            startLoading();
            const endpoint = `${currentEndpoints.get}?${currentEndpoints.userTypeIDName}=${effectiveUserId}`;

            const response = await agent.get(endpoint);
            // const response = await agent.get(endpoint, {
            //     params: {
            //         UserLoginID: userLoginID,
            //     }
            // });


            if (response.data.Status === "Success" && response.data.Data && response.data.Data.length > 0) {
                const trainings = response.data.Data;

                // const len = trainings.length;
                // const isTrainingAvailable = trainings[len - 1].IsTraningAvailable;

                const latestTraining = [...trainings].sort(
                    (a, b) => Number(b.TrainingRowID || 0) - Number(a.TrainingRowID || 0)
                )[0];

                const isTrainingAvailable = latestTraining?.IsTraningAvailable;

                setPreviousTrainingRowID(
                    Number(latestTraining?.TrainingRowID || 0)
                );

                // Map isTraningAvailable to hasTraining state
                if (isTrainingAvailable == 1 || isTrainingAvailable == "1" || isTrainingAvailable?.trim() == "1") {
                    setHasTraining('Yes');
                } else if (isTrainingAvailable == 0 || isTrainingAvailable == "0" || isTrainingAvailable?.trim() == "0") {
                    setHasTraining('No');
                } else if (isTrainingAvailable == -1 || isTrainingAvailable == "-1" || isTrainingAvailable?.trim() == "-1") {
                    setHasTraining('Skip');
                }

                // Store all existing records for potential deletion
                const allRecordIds = trainings.map(item => ({
                    id: item.TrainingRowID,
                    isTrainingAvailable: item.IsTraningAvailable?.trim()
                }));
                setExistingRecordsToDelete(allRecordIds);

                // Only show records with IsTraningAvailable = 1 in table
                const formattedTrainings = trainings
                    .filter(item => item.IsTraningAvailable?.trim() == "1")
                    .map(item => ({
                        id: item.TrainingRowID,
                        courseName: item.Course,
                        conductedBy: item.CourseConductedBy,
                        fromDate: item.FromDate.split('T')[0],
                        toDate: item.ToDate.split('T')[0],
                        certificate: item.CertificatePath
                    }));
                    

                setTrainingList(formattedTrainings);
                setPreservedTrainingData(formattedTrainings);
            } else {
                setHasTraining(null);
                setTrainingList([]);
                setExistingRecordsToDelete([]);
            }
        } catch (error) {
            setHasTraining(null);
            setTrainingList([]);
            setExistingRecordsToDelete([]);
        } finally {
            stopLoading();
        }
    };

    const handleCertificateChange = (fileData) => {
        setCertificate({
            filePath: fileData.filePath,
            fileName: fileData.fileName,
            uniqueFileName: fileData.uniqueFileName,
            file: fileData.file
        });
        setCertificatePath(fileData.filePath);

        if (errors.certificate) {
            setErrors(prev => ({ ...prev, certificate: null }));
        }
    };

    const RadioButton = ({ name, value, checked, onChange, label }) => {
        return (
            <label className="flex cursor-pointer items-center">
                <div className="relative">
                    <input
                        type="radio"
                        name={name}
                        checked={checked}
                        onChange={onChange}
                        className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded-full ${checked ? 'border-sky-500' : 'border-gray-300'} flex items-center justify-center`}>
                        {checked && <div className="h-3 w-3 rounded-full bg-sky-500"></div>}
                    </div>
                </div>
                <span className="ml-2">{label}</span>
            </label>
        );
    };

    const handleTrainingOptionChange = (value) => {
        if ((value === 'No' || value === 'Skip') && trainingList.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Training Details Exist',
                text: 'Please delete all existing training details before selecting No or Skip.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (value === 'Yes' && preservedTrainingData.length > 0) {
            setTrainingList(preservedTrainingData);
        }

        setHasTraining(value);

        if (value === 'No' || value === 'Skip') {
            resetForm();
        }

        setSuccessMessage('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!courseName.trim()) newErrors.courseName = 'Course name is required';
        if (!conductedBy.trim()) newErrors.conductedBy = 'Course conductor is required';
        if (!fromDate) newErrors.fromDate = 'From date is required';
        if (!toDate) newErrors.toDate = 'To date is required';

        // if (!certificate && !certificatePath) {
        //     newErrors.certificate = 'Certificate is required';
        // }

        // if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        //     let f = new Date(fromDate);
        //     let t = new Date(toDate);
        //     console.log('FROMDATE',fromDate);
        //     console.log('TODATE',toDate);
        //     console.log('fffffffffffff',f);
        //     console.log('ttttttttttt',t);

        //     debugger;
        //     newErrors.toDate = 'To date must be after from date';
        // }
        if (fromDate && toDate) {
            // Check if dates are in DD/MM/YYYY format
            const isDDMMYYYY = (dateStr) => dateStr.includes('/');

            let fromDateObj, toDateObj;

            if (isDDMMYYYY(fromDate)) {
                // Parse DD/MM/YYYY format
                const [day, month, year] = fromDate.split('/');
                fromDateObj = new Date(`${year}-${month}-${day}`);
            } else {
                fromDateObj = new Date(fromDate);
            }

            if (isDDMMYYYY(toDate)) {
                const [day, month, year] = toDate.split('/');
                toDateObj = new Date(`${year}-${month}-${day}`);
            } else {
                toDateObj = new Date(toDate);
            }

            // Check if dates are valid
            if (!isNaN(fromDateObj.getTime()) && !isNaN(toDateObj.getTime())) {
                if (fromDateObj > toDateObj) {
                    newErrors.toDate = 'To date must be after from date';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return "";

        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }

        if (dateString.includes('/')) {
            const [day, month, year] = dateString.split('/');
            return `${year}-${month}-${day}`;
        }

        return dateString;
    };

    const getIsTrainingAvailable = () => {
        if (hasTraining === 'Yes') return "1";
        if (hasTraining === 'No') return "0";
        if (hasTraining === 'Skip') return "-1";
        return "0";
    };

    // Delete existing records by ID
    // const deleteExistingRecord = async (recordId) => {
    //     try {

    //         if (formType === 'Candidate') {
    //             const deletePayload = {
    //                 trainingRowID: recordId,
    //                 CandidateID: userID,
    //                 Course: "string",
    //                 CourseConductedBy: "string",
    //                 FromDate: new Date().toISOString(),
    //                 FromDateStr: "string",
    //                 ToDate: new Date().toISOString(),
    //                 ToDateStr: "string",
    //                 CertificatePath: "string",
    //                 UserLoginID: userLoginID,
    //                 IPAddress: ipAddress,
    //                 PageCode: "Training",
    //                 isTraningAvailable: "0"
    //             };

    //             // await axios({
    //             //     method: 'delete',
    //             //     url: currentEndpoints.delete,
    //             //     data: deletePayload,
    //             //     headers: {
    //             //         'Content-Type': 'application/json'
    //             //     }
    //             // });
    //             await agent.delete(currentEndpoints.delete, deletePayload, {
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 }
    //             });
    //         } else {
    //             // Staff
    //             const deletePayload = {
    //                 trainingRowID: recordId,
    //                 StaffID: userID,
    //                 Course: "string",
    //                 CourseConductedBy: "string",
    //                 FromDate: new Date().toISOString(),
    //                 FromDateStr: "string",
    //                 ToDate: new Date().toISOString(),
    //                 ToDateStr: "string",
    //                 CertificatePath: "string",
    //                 UserLoginID: userLoginID,
    //                 IPAddress: ipAddress,
    //                 PageCode: "Training",
    //                 isTraningAvailable: "0"
    //             };

    //             await agent.post(currentEndpoints.delete, deletePayload, {
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 }
    //             });
    //         }

    //     } catch (error) {
    //         console.error(`Error deleting record ${recordId}:`, error);
    //         throw error;
    //     }
    // };
    // Delete existing records by ID
    const deleteExistingRecord = async (recordId) => {
        debugger;
        try {
            const basePayload = {
                UserLoginID: userLoginID,
                IPAddress: ipAddress,
                PageCode: "Training",
                isTraningAvailable: "0"
            };

            let deletePayload;
            let endpoint;
            let method;

            if (formType === 'Candidate') {
                // For Candidate - using HTTP DELETE with query parameter
                deletePayload = {
                    ...basePayload,
                    trainingRowID: recordId,
                    CandidateID: trainingUserId,
                    Course: "string",
                    CourseConductedBy: "string",
                    FromDate: new Date().toISOString(),
                    FromDateStr: "string",
                    ToDate: new Date().toISOString(),
                    ToDateStr: "string",
                    CertificatePath: "string"
                };

                // Include trainingRowId in query parameter for DELETE
                endpoint = `${currentEndpoints.delete}?trainingRowId=${recordId}`;
                method = 'delete';
            } else {
                // For Staff - using HTTP POST
                deletePayload = {
                    ...basePayload,
                    trainingRowID: recordId,
                    StaffID: trainingUserId,
                    Course: "string",
                    CourseConductedBy: "string",
                    FromDate: new Date().toISOString(),
                    FromDateStr: "string",
                    ToDate: new Date().toISOString(),
                    ToDateStr: "string",
                    CertificatePath: "string"
                };
                endpoint = currentEndpoints.delete;
                method = 'post';
            }

            let response;
            // if (method === 'delete') {
            //     // For DELETE with body
            //     response = await agent.delete(endpoint, deletePayload, {
            //         headers: {
            //             'Content-Type': 'application/json'
            //         }
            //     });
            // } else {
            // For POST
            response = await agent.post(endpoint, deletePayload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // }

            // Check response
            if (response.data.Status !== "Success") {
                throw new Error(response.data.Message || 'Failed to delete record');
            }

            return response;
        } catch (error) {
            console.error(`Error deleting record ${recordId}:`, error);

            // Re-throw with more specific error message
            if (error.response) {
                // Server responded with error
                throw new Error(`Server error: ${error.response.data?.Message || error.response.statusText}`);
            } else if (error.request) {
                // Request made but no response
                throw new Error('Network error - no response from server');
            } else {
                // Something else
                throw error;
            }
        }
    };
    // Add training to table (LOCAL ONLY - NO API CALL)
    const handleAddTraining = () => {
        if (!validateForm()) return;

        const newTraining = {
            id: editingIndex !== null ? trainingList[editingIndex].id : Date.now(),
            courseName: courseName,
            conductedBy: conductedBy,
            fromDate: fromDate,
            toDate: toDate,
            certificate: certificatePath || certificate?.filePath || null,
            certificatePath: certificatePath || certificate?.filePath || null
        };

        if (editingIndex !== null) {
            const updatedList = [...trainingList];
            updatedList[editingIndex] = newTraining;
            setTrainingList(updatedList);
            setPreservedTrainingData(updatedList);
            setSuccessMessage('Training Updated in List.');
        } else {
            const updatedList = [...trainingList, newTraining];
            setTrainingList(updatedList);
            setPreservedTrainingData(updatedList);
            setSuccessMessage('Training Added to List.');
        }

        resetForm();
        setEditingIndex(null);

        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleEditTraining = (index) => {
        const training = trainingList[index];
        setCourseName(training.courseName);
        setConductedBy(training.conductedBy);
        setFromDate(training.fromDate);
        setToDate(training.toDate);
        setCertificatePath(training.certificate);
        setCertificate(training.certificate ? { name: training.certificate.split('/').pop() } : null);
        setEditingIndex(index);

        document.querySelector('.training-details-section')?.scrollIntoView({
            behavior: 'smooth'
        });
    };

    // const handleDeleteTraining = (index) => {
    //     Swal.fire({
    //         title: 'Are you sure?',
    //         text: "You want to remove this training from the list?",
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: '#d33',
    //         cancelButtonColor: '#3085d6',
    //         confirmButtonText: 'Yes, delete it!'
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    //             const updatedList = trainingList.filter((_, i) => i !== index);
    //             setTrainingList(updatedList);
    //             setPreservedTrainingData(updatedList);

    //             if (editingIndex === index) {
    //                 resetForm();
    //                 setEditingIndex(null);
    //             }

    //             Swal.fire(
    //                 'Deleted!',
    //                 'Training has been removed from the list.',
    //                 'success'
    //             );
    //         }
    //     });
    // };
    const handleDeleteTraining = (index) => {
        const trainingToDelete = trainingList[index];

        Swal.fire({
            title: 'Are you sure?',
            text: "You want to remove this training from the list?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    startLoading();

                    // If this is an existing record (has a real ID), delete from database
                    if (trainingToDelete.id && trainingToDelete.id > 0) {
                        await deleteExistingRecord(trainingToDelete.id);
                    }

                    // Remove from local list
                    const updatedList = trainingList.filter((_, i) => i !== index);
                    setTrainingList(updatedList);
                    setPreservedTrainingData(updatedList);

                    if (editingIndex === index) {
                        resetForm();
                        setEditingIndex(null);
                    }

                    Swal.fire(
                        'Deleted!',
                        'Training has been removed from the list.',
                        'success'
                    );
                } catch (error) {
                    console.error("Error deleting training:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `Failed to delete training: ${error.message}`
                    });
                } finally {
                    stopLoading();
                }
            }
        });
    };

    const handleReset = () => {
        resetForm();
        setEditingIndex(null);
    };

    const resetForm = () => {
        setCourseName('');
        setConductedBy('');
        setFromDate('');
        setToDate('');
        setCertificate(null);
        setCertificatePath('');
        setErrors({});

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Save and Next - CALLS API TO SAVE ALL DATA
    const handleSaveAndNext = async () => {
        if (hasTraining === null) {
            setSuccessMessage('Please select whether you have completed any training.');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return;
        }

        try {
            startLoading();

            // If user is now selecting "Yes", delete all No (0) and Skip (-1) records
            if (hasTraining === 'Yes' && existingRecordsToDelete.length > 0) {
                const recordsToDelete = existingRecordsToDelete.filter(
                    record => record.isTrainingAvailable === "0" || record.isTrainingAvailable === "-1"
                );

                if (recordsToDelete.length > 0) {

                    for (const record of recordsToDelete) {
                        try {
                            await deleteExistingRecord(record.id);
                        } catch (error) {
                            console.error(`Failed to delete record ${record.id}:`, error);
                        }
                    }
                }
            }

            // If user is now selecting "No" or "Skip", delete all Yes (1) records
            if ((hasTraining === 'No' || hasTraining === 'Skip') && existingRecordsToDelete.length > 0) {
                const recordsToDelete = existingRecordsToDelete.filter(
                    record => record.isTrainingAvailable === "1"
                );

                if (recordsToDelete.length > 0) {

                    for (const record of recordsToDelete) {
                        try {
                            await deleteExistingRecord(record.id);
                        } catch (error) {
                            console.error(`Failed to delete record ${record.id}:`, error);
                        }
                    }
                }
            }

            // STEP 2: Save new selection

            // If user selected "No" or "Skip", save the selection via API
            if (hasTraining === 'No' || hasTraining === 'Skip') {
                const payload = {
                    // TrainingRowID: 0,
                    TrainingRowID: previousTrainingRowID,
                    [currentEndpoints.userTypeIDName]: trainingUserId,
                    Course: "NA",
                    CourseConductedBy: "NA",
                    FromDate: new Date().toISOString(),
                    FromDateStr: "NA",
                    ToDate: new Date().toISOString(),
                    ToDateStr: "NA",
                    UserLoginID: userLoginID,
                    IPAddress: ipAddress,
                    PageCode: 'Training',
                    CertificatePath: 'NA',
                    isTraningAvailable: getIsTrainingAvailable()
                };

                const response = await agent.post(currentEndpoints.save, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });



                if (response.data.Status === "Success") {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: `Your selection "${hasTraining}" has been saved.`,
                        confirmButtonText: 'Continue'
                    }).then((result) => {
                        if (isInstituteUser) {
                            navigate(
                                `/Candidate/LockApplicationForm?candidateId=${effectiveCandidateId}&applicationId=${applicationId}`
                            );
                        } else {
                            navigate(`/${formType}/Additional`);
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `Failed to save: ${response.data.Message}`
                    });
                }

                stopLoading();
                return;
            }

            // If user selected "Yes" but no records added
            if (hasTraining === 'Yes' && trainingList.length === 0) {
                setSuccessMessage('Please add at least one training record before proceeding.');
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
                stopLoading();
                return;
            }

            // If user selected "Yes" and has training records - SAVE ALL TO API
            if (hasTraining === 'Yes' && trainingList.length > 0) {

                // Save all training records
                const savePromises = trainingList.map(training => {
                    const payload = {
                        TrainingRowID: training.id && training.id < 1000000000000 ? training.id : 0,
                        [currentEndpoints.userTypeIDName]: trainingUserId,
                        Course: training.courseName,
                        CourseConductedBy: training.conductedBy,
                        FromDate: training.fromDate,
                        FromDateStr: formatDateForInput(training.fromDate),
                        ToDate: training.toDate,
                        ToDateStr: formatDateForInput(training.toDate),
                        UserLoginID: userLoginID,
                        IPAddress: ipAddress,
                        PageCode: 'Training',
                        CertificatePath: training.certificate || training.certificatePath || 'NA',
                        isTraningAvailable: "1"
                    };


                    return agent.post(currentEndpoints.save, payload, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                });

                const responses = await Promise.all(savePromises);

                const allSuccess = responses.every(res => res.data.Status === "Success");

                if (allSuccess) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'All training records saved successfully.',
                        confirmButtonText: 'Continue'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            if (isInstituteUser) {
                                navigate(
                                    `/Candidate/LockApplicationForm?candidateId=${effectiveCandidateId}&applicationId=${applicationId}`
                                );
                            } else {
                                navigate(`/${formType}/Additional`);
                            }
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Some training records failed to save. Please try again.'
                    });
                }
            }

        } catch (error) {
            console.error("Error saving training data:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error saving training data: ${error.message}`
            });
        } finally {
            stopLoading();
        }
    };

    const handleViewCertificate = (certificateUrl) => {
        if (certificateUrl) {
            window.open(certificateUrl, '_blank');
        }
    };

    return (
        <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
            <div>
                <ProgressTracker />
            </div>

            {successMessage && (
                <div
                    className={`p-4 ${successMessage.includes("Success") || successMessage.includes("Added") || successMessage.includes("Updated") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} border-l-4 ${successMessage.includes("Success") || successMessage.includes("Added") || successMessage.includes("Updated") ? "border-green-500" : "border-red-500"} mb-4`}
                >
                    {successMessage}
                </div>
            )}

            <fieldset className="mb-4 rounded-md border p-4">
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                    Training Information
                </legend>

                <div className="mt-4">
                    <div className="text-center mb-4">
                        <p className="font-normal mb-3">
                            <strong>Have You Completed Any Training?</strong>{" "}
                            <span className="text-red-500">*</span>
                        </p>
                        <div className="flex justify-center space-x-6">
                            <RadioButton
                                name="hasTraining"
                                value="Yes"
                                checked={hasTraining === "Yes"}
                                onChange={() => handleTrainingOptionChange("Yes")}
                                label="Yes"
                            />
                            <RadioButton
                                name="hasTraining"
                                value="No"
                                checked={hasTraining === "No"}
                                onChange={() => handleTrainingOptionChange("No")}
                                label="No"
                            />
                            <RadioButton
                                name="hasTraining"
                                value="Skip"
                                checked={hasTraining === "Skip"}
                                onChange={() => handleTrainingOptionChange("Skip")}
                                label="Skip"
                            />
                        </div>
                    </div>
                </div>

                {hasTraining === "Yes" && (
                    <div className="mt-4 training-details-section">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormComponent
                                label="Course Name"
                                value={courseName}
                                onChange={(value) => {
                                    setCourseName(value);
                                    if (value.trim()) setErrors({ ...errors, courseName: "" });
                                }}
                                required={true}
                                error={errors.courseName}
                            />

                            <FormComponent
                                label="Course Conducted By"
                                value={conductedBy}
                                onChange={(value) => {
                                    setConductedBy(value);
                                    if (value.trim()) setErrors({ ...errors, conductedBy: "" });
                                }}
                                required={true}
                                error={errors.conductedBy}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {/* <FormComponent
                                label="From Date"
                                type="date"
                                value={fromDate}
                                onChange={(value) => {
                                    setFromDate(value);
                                    if (value) setErrors({ ...errors, fromDate: '' });
                                }}
                                required={true}
                                error={errors.fromDate}
                            />

                            <FormComponent
                                label="To Date"
                                type="date"
                                value={toDate}
                                onChange={(value) => {
                                    setToDate(value);
                                    if (value) setErrors({ ...errors, toDate: '' });
                                }}
                                required={true}
                                error={errors.toDate}
                            /> */}

                            <DateInput
                                label="From Date"
                                value={fromDate}
                                onChange={(value) => {
                                    setFromDate(value);
                                    if (value) setErrors({ ...errors, fromDate: '' });
                                }}
                                required={true}
                                maxDate={new Date()}
                                error={errors.fromDate}
                            />

                            <DateInput
                                label="To Date"
                                value={toDate}
                                onChange={(value) => {
                                    setToDate(value);
                                    if (value) setErrors({ ...errors, toDate: '' });
                                }}
                                required={true}
                                maxDate={new Date()}
                                error={errors.toDate}
                            />

                            <div className="md:col-span-1">
                                <label className="block text-sm font-normal text-gray-700 mb-1">
                                    Certificate 
                                    {/* <span className="text-red-600">*</span> */}
                                    {/* {errors.certificate && (
                                        <span className="text-red-600 ml-2">
                                            {errors.certificate}
                                        </span>
                                    )} */}
                                    {certificatePath && certificatePath !='NA' && (
                                        <span className="text-green-600 ml-2">
                                            (Certificate Uploaded)
                                        </span>
                                    )}
                                </label>

                                <UploadPdf
                                    file={certificate?.fileName || ""}
                                    onFileChange={handleCertificateChange}
                                    buttonClassName="bg-[#00c3f9]"
                                    buttonText="Upload Certificate"
                                    allowedFileTypes="jpg, jpeg, pdf"
                                    maxFileSize="500 KB"
                                    required={false}
                                    label="Upload Certificate"
                                    showLabel={false}
                                    userTypeId={userTypeID}
                                    userLoginID={userLoginID}
                                    linkName="View Certificate"
                                    uniquefilepath={certificatePath && certificatePath!='NA' || ""}
                                    id="certificateUpload"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center space-x-4">
                            <button
                                onClick={handleReset}
                                className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                                disabled={isLoading}
                            >
                                {editingIndex !== null ? "Cancel" : "Reset"}
                            </button>
                            <button
                                onClick={handleAddTraining}
                                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                                disabled={isLoading}
                            >
                                {editingIndex !== null ? "Update" : "Add"}
                            </button>
                        </div>
                    </div>
                )}
            </fieldset>

            {hasTraining === "Yes" && trainingList.length > 0 && (
                <fieldset className="rounded-md border p-4">
                    <legend
                        className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                    >  Training List
                    </legend>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-300">
                                        Action
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-300">
                                        Course Name
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-300">
                                        Course Conducted By
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-300">
                                        From Date
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-300">
                                        To Date
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-300">
                                        Certificate
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainingList.map((training, index) => (
                                    <tr
                                        key={index}
                                        className={`border-t ${editingIndex === index ? "bg-blue-50" : ""}`}
                                    >
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditTraining(index)}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="Edit"
                                                    disabled={isLoading}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteTraining(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                    disabled={isLoading}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>

                                        <td className="p-3 text-sm text-gray-700 text-center">
                                            {training.courseName}
                                        </td>
                                        <td className="p-3 text-sm text-gray-700 text-center">
                                            {training.conductedBy}
                                        </td>
                                        <td className="p-3 text-sm text-gray-700 text-center">
                                            {training.fromDate}
                                        </td>
                                        <td className="p-3 text-sm text-gray-700 text-center">
                                            {training.toDate}
                                        </td>

                                        <td className="p-3 text-center">
                                            {training.certificate && training.certificate!='NA' && (
                                                <button
                                                    className="flex items-center justify-center text-blue-600 hover:text-blue-800 mx-auto"
                                                    title="View Certificate"
                                                    onClick={() =>
                                                        handleViewCertificate(training.certificate)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    <img src={pdflogo} alt="PDF" className="h-5 w-5" />
                                                </button>
                                            )}
                                            {training.certificate && training.certificate=='NA' && (
                                                // <button
                                                //     className="flex items-center justify-center text-blue-600 hover:text-blue-800 mx-auto"
                                                //     title="View Certificate"
                                                //     onClick={() =>
                                                //         handleViewCertificate(training.certificate)
                                                //     }
                                                //     disabled={isLoading}
                                                // >
                                                //     <img src={pdflogo} alt="PDF" className="h-5 w-5" />
                                                // </button>
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </fieldset>
            )}

            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleSaveAndNext}
                    className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : "Save & Next"}
                </button>
            </div>
        </div>
    );
};

export default TrainingPage;
