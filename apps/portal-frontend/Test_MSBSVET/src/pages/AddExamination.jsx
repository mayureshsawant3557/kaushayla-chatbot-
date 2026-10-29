import React, { useContext, useEffect, useState } from "react";
import { FileText, Save, RotateCcw, Edit } from "lucide-react";
import { ThemeContext } from "../Component/Context/ThemeContext";
import agent from "../lib/api/agent";
import DropdownComponent from "../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../Component/formcomponent/FilteredTableComponent";
import Swal from "sweetalert2";
import Button from "../Component/base/Button";
import { useAuth } from "../Hooks/AuthContext";
import { getDeviceIP } from "../utils/CommonHelper";

const AddExamination = () => {


    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        ExaminationName: "",
        ExaminatioYearID: "",
        ResultExaminationName: "",
        HallTicketDate: getTodayDate(),
        ExamTypeID: ""
    });

    const { userInfo } = useAuth();
    const allowedUserTypes = [81];
    const userTypeID = Number(userInfo?.UserTypeID);
    const hasAccess = allowedUserTypes.includes(userTypeID);
    const [admissionYears, setAdmissionYears] = useState([]);
    const [examTypes, setExamTypes] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [examinations, setExaminations] = useState([]);
    const [loadingExaminations, setLoadingExaminations] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(0);
    const [isRepeater, setIsRepeater] = useState(false);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");
    const [defaultDetails, setDefaultDetails] = useState({
        StatementMarksName: "",
        StatementMarksDesignation: "",
        StatementMarksSign: "",
        CertificateMarksName: "",
        CertificateMarksDesignation: "",
        CertificateMarksSign: ""
    });
    const [errors, setErrors] = useState({});
    const [loadingSignatureDetails, setLoadingSignatureDetails] = useState(false);
    const { color } = useContext(ThemeContext);

    useEffect(() => {
        if (!hasAccess) {
            return;
        }

        fetchAdmissionYears();
        fetchSignatureAuthorities();
        fetchExamTypes();
        fetchIP();
    }, [hasAccess]);

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();

            setIpAddress(ip);
        } catch (err) {
        }
    };

    useEffect(() => {
        if (admissionYears.length > 0 && examTypes.length > 0) {
            fetchExaminations();
        }
    }, [admissionYears, examTypes]);


    const fetchAdmissionYears = async () => {
        try {
            const response = await agent.get("/Base/GetAdmissionYear");


            const years = response.data?.Data || [];

            const formattedYears = years.map((year) => ({
                value: year.YearId,
                label: year.YearDisplayName
            }));
         setAdmissionYears(formattedYears);

        } catch (error) {
            console.error("Error fetching admission years:", error);
            setAdmissionYears([]);
        }
    };

    const fetchExamTypes = async () => {
        try {
            const response = await agent.get("/Base/GetExamType");
            const examTypeData = response.data?.Data || [];
            const formattedExamTypes = examTypeData.map((item) => ({
                value: item.ExamTypeID,
                label: item.ExamType
            }));
            setExamTypes(formattedExamTypes);

        } catch (error) {
            console.error(
                "Error fetching exam types:",
                error
            );
         setExamTypes([]);
        }
    };

    const fetchSignatureAuthorities = async () => {
        try {

            const response = await agent.get(
                "/api/Master/GetMasterSignatureAuthorities"
            );
             const authorities =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.Data || [];
                const statementAuthority = authorities.find(
                item =>
                    String(item.SignatureType).toUpperCase() === "S" &&
                    Number(item.IsActive) === 1 &&
                    Number(item.IsCurrent) === 1
            );

            const certificateAuthority = authorities.find(
                item =>
                    String(item.SignatureType).toUpperCase() === "C" &&
                    Number(item.IsActive) === 1 &&
                    Number(item.IsCurrent) === 1
            );

            setDefaultDetails({
                StatementMarksName:
                    statementAuthority?.NameOfAuthority || "",

                StatementMarksDesignation:
                    statementAuthority?.Designation || "",

                StatementMarksSign:
                    statementAuthority?.SignaturePath || "",

                CertificateMarksName:
                    certificateAuthority?.NameOfAuthority || "",

                CertificateMarksDesignation:
                    certificateAuthority?.Designation || "",

                CertificateMarksSign:
                    certificateAuthority?.SignaturePath || ""
            });

        } catch (error) {

            console.error(
                "Error fetching signature authorities:",
                error
            );

        }
    };

    const fetchExaminations = async () => {
        try {
            setLoadingExaminations(true);
            const response = await agent.get("/Base/GetExamination");
            const data = Array.isArray(response.data)
                    ? response.data
                    : response.data?.Data || [];

            const formattedData = data.map((item) => {
                const year = admissionYears.find(
                    (y) => Number(y.value) === Number(item.ExaminatioYearID)
                );
            const examType = examTypes.find(
                    (e) => Number(e.value) === Number(item.ExamTypeID)
                );

                return {
                    ...item,

                    ExaminatioYear:
                        year?.label || item.ExaminatioYearID,

                    ExamType:
                        examType?.label || item.ExamTypeID
                };
            });

            // Show ALL examinations in descending order
            const sortedData = formattedData.sort(
                (a, b) => Number(b.ID) - Number(a.ID)
            );

            setExaminations(sortedData);

        } catch (error) {
            console.error("Error fetching examinations:", error);

            setExaminations([]);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Unable to load examinations."
            });

        } finally {
            setLoadingExaminations(false);
        }
    };


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));

    };


    const handleExaminationNameChange = (e) => {
        const value = e.target.value;
        const resultName = value.split("-")[0].trim();

        setFormData((prev) => ({
            ...prev,
            ExaminationName: value,
            ResultExaminationName: resultName
        }));

        setErrors((prev) => ({
            ...prev,
            ExaminationName: "",
            ResultExaminationName: ""
        }));
    };

    const handleReset = () => {
        setFormData({
            ExaminationName: "",
            ExaminatioYearID: "",
            ResultExaminationName: "",
            HallTicketDate: getTodayDate(),
            ExamTypeID: ""
        });
        setIsRepeater(false);
        setErrors({});

        setIsEditing(false);
        setEditId(0);
    };


    const handleEdit = (row) => {

        setFormData({
            ExaminationName: row.ExaminationName ?? "",
            ExaminatioYearID: row.ExaminatioYearID ?? "",
            ResultExaminationName: row.ResultExaminationName ?? "",
            HallTicketDate: row.HallTicketDate
                ? String(row.HallTicketDate).substring(0, 10)
                : "",
            ExamTypeID: row.ExamTypeID ?? ""
        });

        setIsRepeater(
            row.NewBatchID !== null &&
            row.NewBatchID !== undefined &&
            row.NewBatchID !== ""
        );

        setEditId(row.ID);
        setIsEditing(true);
        setErrors({});

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.ExaminationName.trim()) {
        newErrors.ExaminationName = "Examination Name is required."; }
    
        if (!formData.ExaminatioYearID) {
            newErrors.ExaminatioYearID = "Examination Year is required."; }

        if (!formData.ResultExaminationName.trim()) {
             newErrors.ResultExaminationName = "Result Examination Name is required."; }


        if (!formData.HallTicketDate) {
            newErrors.HallTicketDate = "Hall Ticket Date is required."; }


        if (!formData.ExamTypeID) {
            newErrors.ExamTypeID ="Exam Type is required."; }
       
       

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;

    };


    const handleSave = async () => {
        if (!validateForm()) {
            return; }
        try {
            setIsSaving(true);

            const requestData = {
                ExaminationName: formData.ExaminationName.trim(),
                ExaminatioYearID: Number(formData.ExaminatioYearID),
                HallTicketDate: formData.HallTicketDate,
                ResultExaminationName:
                    formData.ResultExaminationName.trim(),
                ExamTypeID: Number(formData.ExamTypeID),
                ID: isEditing ? editId : 0,
                IsUpdate: isEditing,
                IsRepeater: isRepeater,
                ModifiedBy: userInfo?.UserLoginID || 0,
                ModifiedByIPAddress: ipAddress || ""
            };

             const response = isEditing
                ? await agent.post(
                    "/api/Exam/update-master-examination",
                    requestData
                )
                : await agent.post(
                    "/api/Exam/save-master-examination",
                    requestData
                );

            const result = response?.data;
            const data =
                result?.Data ??
                result?.data;

            // Duplicate examination
            if (String(data) === "-1") {
                await Swal.fire({
                    icon: "warning",
                    title: "Already Exists",
                    text: "Examination with the same name, year and exam type already exists.",
                    confirmButtonText: "OK"
                });
            return;
            }

            // Update failed
            if (isEditing && String(data) === "0") {
                await Swal.fire({
                    icon: "error",
                    title: "Update Failed",
                    text: "Examination record was not updated.",
                    confirmButtonText: "OK"
                });

                return;
            }

            const message = isEditing
                ? "Examination updated successfully."
                : "Examination saved successfully.";

            await Swal.fire({
                icon: "success",
                title: isEditing ? "Updated!" : "Saved!",
                text: message,
                confirmButtonText: "OK"
            });

            await fetchExaminations();

            handleReset();

        } catch (error) {
            console.error(
                isEditing
                    ? "Error updating examination:"
                    : "Error saving examination:",
                error
            );

            const errorMessage =
                error?.response?.data?.Message ||
                error?.response?.data?.message ||
                error?.message ||
                (
                    isEditing
                        ? "Something went wrong while updating examination."
                        : "Something went wrong while saving examination."
                );

            await Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage
            });

        } finally {
            setIsSaving(false);
        }
    };

    if (!hasAccess) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white border border-red-200 rounded-lg shadow-sm p-6 text-center">
                    <h2 className="text-lg font-semibold text-red-600">
                        Access Denied
                    </h2>

                    <p className="text-sm text-gray-600 mt-2">
                        You do not have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (

        <div className="container mx-auto p-6 max-w-full bg-gray-50 min-h-screen">

            <fieldset className="border border-gray-300 rounded-lg mb-6 px-5 pt-3 pb-5 bg-white shadow-sm">

                {/* Main Legend */}

                <legend
                    className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color}`}
                >

                    <FileText className="w-4 h-4 mr-2" />

                    Add Examination

                </legend>

                {/* Examination Name + Year + Batch Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-3">

                    {/* Examination Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Examination Name
                            <span className="text-red-500 ml-1">*</span>

                            {errors.ExaminationName && (
                                <span className="text-xs text-red-500 font-normal ml-2">
                                    {errors.ExaminationName}
                                </span>
                            )}
                        </label>

                        <input
                            type="text"
                            name="ExaminationName"
                            value={formData.ExaminationName}
                            onChange={handleExaminationNameChange}
                            placeholder="Enter examination name"
                            className={`w-full px-3 py-2.5 text-sm border rounded-md
                            focus:outline-none focus:ring-2
                            focus:ring-green-100 focus:border-green-500
                             ${errors.ExaminationName
                                    ? "border-red-400"
                                    : "border-gray-300"
                                }`}
                        />

                    </div>

                    {/* Examination Year */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Examination Year
                            <span className="text-red-500 ml-1">*</span>

                            {errors.ExaminatioYearID && (
                                <span className="text-xs text-red-500 font-normal ml-2">
                                    {errors.ExaminatioYearID}
                                </span>
                            )}
                        </label>

                        <DropdownComponent
                            label=""
                            options={admissionYears}
                            value={formData.ExaminatioYearID}
                            onChange={(value) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    ExaminatioYearID: value
                                }));

                                setErrors((prev) => ({
                                    ...prev,
                                    ExaminatioYearID: ""
                                }));
                            }}
                            required={false}
                            loading={false}
                        />
                    </div>

                    {/* Batch Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Batch Type
                            <span className="text-red-500 ml-1">*</span>

                            {errors.BatchType && (
                                <span className="text-xs text-red-500 font-normal ml-2">
                                    {errors.BatchType}
                                </span>
                            )}
                        </label>

                        <div className="flex items-center gap-3 h-[42px]">

                            <button
                                type="button"
                                role="switch"
                                aria-checked={isRepeater === true}
                                onClick={() => {
                                    if (isRepeater === null) {
                                        // First click = Repeater
                                        setIsRepeater(true);
                                    } else {
                                        // Toggle between Regular and Repeater
                                        setIsRepeater(!isRepeater);
                                    }

                                    setErrors((prev) => ({
                                        ...prev,
                                        BatchType: ""
                                    }));
                                }}
                                className={`relative inline-flex h-7 w-[52px] flex-shrink-0
                                cursor-pointer items-center rounded-full
                                transition-colors duration-200
                                focus:outline-none focus:ring-2 focus:ring-green-200
                                ${isRepeater === true
                                        ? "bg-green-600"
                                        : isRepeater === false
                                            ? "bg-gray-400"
                                            : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 rounded-full
                                    bg-white shadow-sm
                                     transition-transform duration-200
                                     ${isRepeater === true
                                            ? "translate-x-7"
                                            : "translate-x-1"
                                        }`}
                                />
                            </button>
                            {/* Batch Type text */}
                            <span
                                className={`text-sm font-medium ${isRepeater === true
                                    ? "text-green-600"
                                    : isRepeater === false
                                        ? "text-gray-700"
                                        : "text-gray-500"
                                    }`}
                            >
                                {isRepeater === true
                                    ? "Repeater"
                                    : "Regular"}
                            </span>
                        </div>
                    </div>
                 </div>


                {/* Statement Marks - 3 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

                    {/* Statement Marks Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Statement Marks Name
                        </label>

                        <input
                            type="text"
                            value={
                                loadingSignatureDetails
                                    ? "Loading..."
                                    : defaultDetails.StatementMarksName
                            }
                            disabled
                            className="w-full px-3 py-2.5 text-sm border border-gray-300
                       rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    {/* Statement Marks Designation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Statement Marks Designation
                        </label>

                        <input
                            type="text"
                            value={
                                loadingSignatureDetails
                                    ? "Loading..."
                                    : defaultDetails.StatementMarksDesignation
                            }
                            disabled
                            className="w-full px-3 py-2.5 text-sm border border-gray-300
                       rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    {/* Statement Marks Sign */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Statement Marks Sign
                        </label>

                        <div className="w-full h-[60px] border border-gray-300 rounded-md
                                 bg-gray-100 flex items-center px-3">
                            {defaultDetails.StatementMarksSign ? (
                                <img
                                    src={defaultDetails.StatementMarksSign}
                                    alt="Statement Marks Signature"
                                    className="max-h-[50px] max-w-full object-contain"
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">
                                    No signature available
                                </span>
                            )}
                        </div>
                    </div>

                </div>


                {/* Certificate Marks - 3 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

                    {/* Certificate Marks Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Certificate Marks Name
                        </label>

                        <input
                            type="text"
                            value={
                                loadingSignatureDetails
                                    ? "Loading..."
                                    : defaultDetails.CertificateMarksName
                            }
                            disabled
                            className="w-full px-3 py-2.5 text-sm border border-gray-300
                       rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    {/* Certificate Marks Designation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Certificate Marks Designation
                        </label>

                        <input
                            type="text"
                            value={
                                loadingSignatureDetails
                                    ? "Loading..."
                                    : defaultDetails.CertificateMarksDesignation
                            }
                            disabled
                            className="w-full px-3 py-2.5 text-sm border border-gray-300
                       rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    {/* Certificate Marks Sign */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Certificate Marks Sign
                        </label>

                        <div className="w-full h-[60px] border border-gray-300 rounded-md
                        bg-gray-100 flex items-center px-3">
                            {defaultDetails.CertificateMarksSign ? (
                                <img
                                    src={defaultDetails.CertificateMarksSign}
                                    alt="Certificate Marks Signature"
                                    className="max-h-[50px] max-w-full object-contain"
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">
                                    No signature available
                                </span>
                            )}
                        </div>
                    </div>

                </div>


                {/* Hall Ticket Date + Exam Type + Result Examination */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

                    {/* HallTicketDate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Hall Ticket Date
                            <span className="text-red-500 ml-1">*</span>

                            {errors.HallTicketDate && (
                                <span className="text-xs text-red-500 font-normal ml-2">
                                    {errors.HallTicketDate}
                                </span>
                            )}
                        </label>

                        <input
                            type="date"
                            name="HallTicketDate"
                            value={formData.HallTicketDate}
                            onChange={handleChange}
                            className={`w-full px-3 py-2.5 text-sm border rounded-md
                             focus:outline-none focus:ring-2
                            focus:ring-green-100 focus:border-green-500
                             ${errors.HallTicketDate
                                    ? "border-red-400"
                                    : "border-gray-300"
                                }`}
                        />
                    </div>

                    {/* ExamTypeID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Exam Type
                            <span className="text-red-500 ml-1">*</span>

                            {errors.ExamTypeID && (
                                <span className="text-xs text-red-500 font-normal ml-2">
                                    {errors.ExamTypeID}
                                </span>
                            )}
                        </label>

                        <DropdownComponent
                            label=""
                            options={examTypes}
                            value={formData.ExamTypeID}
                            onChange={(value) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    ExamTypeID: value
                                }));

                                setErrors((prev) => ({
                                    ...prev,
                                    ExamTypeID: ""
                                }));
                            }}
                            required={false}
                            loading={false}
                        />
                    </div>

                    {/* ResultExaminationName */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Result Examination Name
                            <span className="text-red-500 ml-1">*</span>

                            {errors.ResultExaminationName && (
                                <span className="text-xs text-red-500 font-normal ml-2">
                                    {errors.ResultExaminationName}
                                </span>
                            )}
                        </label>

                        <input
                            type="text"
                            name="ResultExaminationName"
                            value={formData.ResultExaminationName}
                            onChange={handleChange}
                            placeholder="Enter result examination name"
                            className={`w-full px-3 py-2.5 text-sm border rounded-md
                                     focus:outline-none focus:ring-2
                                 focus:ring-green-100 focus:border-green-500
                                     ${errors.ResultExaminationName
                                    ? "border-red-400"
                                    : "border-gray-300"
                                }`}
                        />


                    </div>

                </div>


                <div className="flex justify-center items-center gap-3 mt-8 pt-5 border-t border-gray-200">


                    {/* Reset */}

                    <Button
                        variant="secondary"
                        onClick={handleReset}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </Button>


                    {/* Save */}

                    <Button
                        variant="success"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <Save className="w-4 h-4" />

                        {isSaving
                            ? isEditing
                                ? "Updating..."
                                : "Saving..."
                            : isEditing
                                ? "Update Examination"
                                : "Save Examination"}
                    </Button>

                </div>

            </fieldset >

            <fieldset className="rounded-md border border-gray-300 p-4 lg:p-6 bg-white mt-6">

                <legend
                    className={`flex items-center text-base font-semibold text-white
            border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color}`}
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Examination
                </legend>

                <div className="mt-3">

                    <FilteredTableComponent
                        data={examinations}
                        loading={loadingExaminations}

                        searchable={true}
                        sortable={true}
                        exportable={true}

                        showSearch={true}
                        showExport={true}
                        showExcel={true}
                        showPDF={true}

                        paginate={true}
                        defaultRowsPerPage={10}

                        emptyStateMessage="No Examinations Found"
                        emptyStateSubMessage="No examination records are available."

                        exportFileName="Examination_List"

                        minTableWidth="1400px"
                        maxHeight="400px"

                        filterColumns={[
                            "ExaminationName",
                            "ID",
                            "ExaminatioYear",
                            "ExamType"
                        ]}

                        columns={[
                            {
                                key: "sn",
                                header: "S.N.",
                                width: "80px",
                                sortable: false,
                                className: "text-center"
                            },
                            {
                                key: "ExaminationName",
                                header: "Examination Name",
                                width: "400px",
                                className: "text-center"
                            },
                            {
                                key: "ID",
                                header: "Examination ID",
                                width: "150px",
                                className: "text-center"
                            },
                            {
                                key: "ExaminatioYear",
                                header: "Examination Year",
                                width: "250px",
                                className: "text-center"
                            },
                            {
                                key: "ExamType",
                                header: "Exam Type",
                                width: "220px",
                                className: "text-center"
                            },
                            {
                                key: "Action",
                                header: "Action",
                                width: "150px",
                                sortable: false,
                                excludeFromExport: true,
                                className: "text-center"
                            }
                        ]}

                        renderCell={(row, column) => {

                            if (column.key === "Action") {
                                return (
                                    <div className="flex justify-center">

                                        <button
                                            type="button"
                                            onClick={() => handleEdit(row)}
                                            className=" inline-flex items-center justify-center gap-1.5 px-6 py-1.5 text-xs font-medium text-blue-600 rounded-md shadow-sm transition-colors"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                    </div>
                                );  }

                            return undefined;
                        }}
                    />

                </div>

            </fieldset>

        </div >
 );


};

export default AddExamination;