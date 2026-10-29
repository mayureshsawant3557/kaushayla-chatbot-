import React, { useContext, useEffect, useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { ThemeContext } from "../Context/ThemeContext";
import DropdownComponent from "../formcomponent/DropdownComponent";
import Button from "../Base/Button";
import agent from "../../lib/api/agent";
import { useAuth } from "../../Hooks/AuthContext";
import { getDeviceIP, getPreviousYearList } from "../../utils/CommonHelper";
import UploadPdf from "../formcomponent/UploadPdf";
import Loader from "../formcomponent/Loader";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import Swal from "sweetalert2";
import { FiEdit } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import sampleImage from "../../assets/image.png";

const SuccessStories = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const [instituteId, setInstituteId] = useState("");
    const [institutes, setInstitutes] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState("");
    const [hasProfileId, setHasProfileId] = useState("");
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [passingYears, setPassingYears] = useState([]);
    const [selectedPassingYear, setSelectedPassingYear] = useState("");
    const [selectionYears, setSelectionYears] = useState([]);
    const [selectedSelectionYear, setSelectedSelectionYear] = useState("");
    const [documentFile, setDocumentFile] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [profileId, setProfileId] = useState("");
    const [candidateData, setCandidateData] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [candidateMobile, setCandidateMobile] = useState("");
    const [candidatePhoto, setCandidatePhoto] = useState("");
    const [presentDesignation, setPresentDesignation] = useState("");
    const [presentOrganization, setPresentOrganization] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successStoryList, setSuccessStoryList] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(0);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");
    const messageRef = useRef(null);
    const [uploadResetKey, setUploadResetKey] = useState(0);
    const [searchingProfile, setSearchingProfile] = useState(false);
    const [tableLoaded, setTableLoaded] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);

    const profileRef = useRef(null);
    const firstNameRef = useRef(null);
    const courseRef = useRef(null);
    const passingYearRef = useRef(null);
    const designationRef = useRef(null);
    const organizationRef = useRef(null);
    const selectionYearRef = useRef(null);
    const mobileRef = useRef(null);
    const documentRef = useRef(null);
    const photoRef = useRef(null);
    const editSectionRef = useRef(null);

    useEffect(() => {
        if (userInfo?.UserLoginID) {
            loadInstitute();
        }
    }, [userInfo]);

    useEffect(() => {
        setSelectionYears(getPreviousYearList(1970, true));
    }, []);

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
    };
    useEffect(() => {
        if (hasProfileId !== "1") return;

        if (profileId.trim().length < 8) return;

        const timer = setTimeout(() => {
            handleProfileSearch();
        }, 600);

        return () => clearTimeout(timer);
    }, [profileId]);


    const loadInstitute = async () => {
        try {
            const idResponse = await agent.get(
                `/Base/GetInstituteIDByInstituteCode?InstituteCode=${userInfo.UserLoginID}`
            );

            const id = idResponse.data.Data;

            setInstituteId(id);

            const instituteResponse = await agent.get("/Base/GetMasterInstitute");

            const instituteList = instituteResponse.data.Data || [];

            setInstitutes(instituteList);
            setSelectedInstitute(id.toString());

            // Load courses for this institute
            await loadCourses(id);

            await loadPassingYears();

            await loadSuccessStoryList(id);

        } catch (error) {
            console.error(error);
        }
    };
    const loadCourses = async (collegeId) => {
        try {
            const response = await agent.get(
                `/Base/GetCourseByCollogeID?CollegeID=${collegeId}`,
                {
                    params: {
                        IsNewAdmission: 0,
                    },
                }
            );

            const courseList = response.data?.Data || [];



            setCourses(
                courseList.map(item => ({
                    value: item.CourseID.toString(),
                    label: item.CourseName,
                }))
            );

        } catch (error) {
            console.error("Error loading courses:", error);
        }
    };

    const scrollToRef = (ref) => {
        if (ref?.current) {
            ref.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };

    const handleAdd = async () => {
        if (!validateForm()) return;

        const selectedCourseObj = courses.find(
            x => x.value === selectedCourse
        );

        const selectedInstituteObj = institutes.find(
            x => x.Value === selectedInstitute
        );

        const selectedPassingYearObj = passingYears.find(
            x => x.value === selectedPassingYear
        );

        const selectedSelectionYearObj = selectionYears.find(
            x => x.value === selectedSelectionYear
        );

        const payload = {
            id: editId,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,

            candidateFullName: `${firstName} ${middleName} ${lastName}`
                .replace(/\s+/g, " ")
                .trim(),

            candidateProfileID: profileId,
            candidateMobileNo: candidateMobile,

            photoPath:
                photoFile?.FilePath ||
                photoFile?.filePath ||
                candidatePhoto ||
                "",

            documentPath:
                documentFile?.FilePath ||
                documentFile?.filePath ||
                "",

            courseID: Number(selectedCourse),
            courseName: selectedCourseObj?.label || "",
            courseCode: selectedCourseObj?.code || "",
            courseNameCode: selectedCourseObj?.label || "",

            instituteID: Number(selectedInstitute),
            instituteName: selectedInstituteObj?.Text || "",
            instituteCode: selectedInstituteObj?.Value || "",
            instituteNameCode: selectedInstituteObj?.Text || "",

            passingYearID: Number(selectedPassingYear),
            passingYear: selectedPassingYearObj?.label || "",

            selectionYearID: Number(selectedSelectionYear),
            selectionYear: selectedSelectionYearObj?.label || "",

            presentDesignation: presentDesignation,
            presentOrganization: presentOrganization,

            isPublished: false,
            publishedStatus: "N",

            isActive: true,

            isProfile: hasProfileId,
            isProfileId: hasProfileId,

            userLoginID: userInfo?.UserLoginID,
            ipAddress: ipAddress,
        };




        try {
            setLoading(true);

            const response = await agent.post(
                "/api/InstituteBase/SaveSuccessStory",
                payload
            );


            if (response.data.Data === "Y") {

                Swal.fire({
                    icon: "success",
                    title: isEdit ? "Updated!" : "Saved!",
                    text: isEdit
                        ? "Success Story updated successfully."
                        : "Success Story saved successfully.",
                    confirmButtonColor: "#3085d6",
                });

                setMessageType("success");
                setMessage(
                    isEdit
                        ? "Success Story Updated Successfully."
                        : "Success Story Saved Successfully."
                );

                await loadSuccessStoryList(selectedInstitute);

                setIsEdit(false);
                setEditId(0);

                resetForm();
            }
            else if (response.data.Data === "X") {

                setMessageType("error");
                setMessage("Profile ID of Candidate is Already Registered!");
                setTimeout(() => {
                    scrollToRef(messageRef);
                }, 100);

            }
            else {

                setMessageType("error");
                setMessage("Unable to save record.");

            }
        }
        catch (error) {
            console.error(error.response?.data || error);
        }
        finally {
            setLoading(false);
        }
    };

    const loadPassingYears = async () => {
        try {
            const response = await agent.get("/Base/GetAdmissionYear");


            const yearList = response.data?.Data || [];

            setPassingYears(
                yearList.map(item => ({
                    value: item.YearId.toString(),
                    label: item.YearDisplayName,
                }))
            );
        } catch (error) {
            console.error(error);
        }
    };


    useEffect(() => {
        if (!candidateData || passingYears.length === 0) return;

        const year = passingYears.find(
            item =>
                Number(item.value) ===
                Number(candidateData.ExaminatioYearID)
        );

        if (year) {
            setSelectedPassingYear(year.value.toString());
        }
    }, [candidateData, passingYears]);

    const handleDocumentUpload = (fileData) => {
        setDocumentFile(fileData);

        setErrors(prev => ({
            ...prev,
            document: ""
        }));
    };
    const handlePhotoUpload = (fileData) => {
        setPhotoFile(fileData);

        // Show uploaded image immediately in preview
        if (fileData?.file) {
            const preview = URL.createObjectURL(fileData.file);
            setCandidatePhoto(preview);
        } else if (fileData?.filePath) {
            setCandidatePhoto(fileData.filePath);
        }

        setErrors(prev => ({
            ...prev,
            photo: ""
        }));
    };
    const handleProfileSearch = async () => {
        try {
            setLoading(true);
            setSearchingProfile(true);

            // Step 1 : Get Candidate ID
            const candidateRes = await agent.get("/Base/GetCandidateID", {
                params: {
                    ApplicationID: profileId,
                },
            });

            const candidateId = candidateRes.data?.Data;

            if (!candidateId) {
                setLoading(false);
                return;
            }

            // Step 2 : Get Success Story
            const resultRes = await agent.get(
                `/api/InstituteBase/GetSuccessStoryResult/${candidateId}/${instituteId}`
            );

            const data = resultRes.data?.Data;

            if (data && data.length > 0) {
                const row = data[0];

                setCandidateData(row);

                setFirstName(row.FirstName || "");
                setMiddleName(row.MiddleName || "");
                setLastName(row.LastName || "");
                setCandidateMobile(row.MobileNo || "");
                setCandidatePhoto(row.CandidatePhoto || "");
            }
        } catch (error) {
            console.error(error.response?.data || error);
        } finally {
            setLoading(false);
            setSearchingProfile(false);
        }
    };



    useEffect(() => {
        if (!candidateData || courses.length === 0) return;

        const course = courses.find(
            item =>
                Number(item.value) ===
                Number(candidateData.CourseID)
        );

        if (course) {
            setSelectedCourse(course.value.toString());
        }
    }, [candidateData, courses]);

    const loadSuccessStoryList = async (id = instituteId) => {
        try {
            setTableLoading(true);

            const response = await agent.get(
                `/api/InstituteBase/GetSuccessStoryByInstituteID/${id}`
            );

            setSuccessStoryList(response.data.Data || []);
        } catch (error) {
            console.error(error.response?.data || error);
        } finally {
            setTableLoading(false);
            setTableLoaded(true);
        }
    };

    const tableData = successStoryList.map((item, index) => ({
        ...item,
        SrNo: index + 1,
        action: (
            <div className="flex justify-center gap-2">
                <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => handleEdit(item)}
                >
                    Edit
                </button>

                <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                >
                    <FaTrash size={18} />
                </button>
            </div>
        )
    }));

    const columns = [
        {
            key: "SrNo",
            header: "Sr. No.",
            width: "70px",
            className: "text-center",
        },
        {
            key: "PhotoPath",
            header: "Photo",
            width: "120px",
            className: "text-center",
        },
        {
            key: "CandidateFullName",
            header: "Name",
            width: "220px",
            className: "text-center",
        },
        {
            key: "CourseNameCode",
            header: "Course",
            width: "220px",
            className: "text-center",
        },
        {
            key: "InstituteNameCode",
            header: "Institute",
            width: "300px",
            className: "text-center",
        },
        {
            key: "PassingYear",
            header: "Passing Year",
            width: "120px",
            className: "text-center",
        },
        {
            key: "PresentDesignation",
            header: "Present Designation",
            width: "180px",
            className: "text-center",
        },
        {
            key: "SelectionYear",
            header: "Selection Year",
            width: "120px",
            className: "text-center",
        },
        {
            key: "PublishedStatus",
            header: "Status",
            width: "150px",
            className: "text-center",
        },
        {
            key: "action",
            header: "Action",
            width: "100px",
            className: "text-center",
            sortable: false,
        }
    ];

    const renderCell = (item, column) => {

        // Action Column
        if (column.key === "action") {
            return (
                <div className="flex justify-center items-center gap-3">

                    <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                    >
                        <FiEdit size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                    >
                        <FaTrash size={18} />
                    </button>

                </div>
            );
        }

        // Photo Column
        if (column.key === "PhotoPath") {
            return (
                <img
                    src={item.PhotoPath}
                    alt="Candidate"
                    className="w-20 h-24 object-cover border rounded mx-auto"
                    onError={(e) => {
                        e.target.src = "/Images/SamplePhoto.jpg";
                    }}
                />
            );
        }

        return undefined;
    };

    const handleEdit = async (item) => {

        const result = await Swal.fire({
            title: "Edit Record?",
            text: "Are you sure you want to edit this Success Story?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Edit",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {

            setLoading(true);

            const response = await agent.get(
                `/api/InstituteBase/GetSuccessStoryByID/${item.ID}`
            );

            const data = response.data.Data;

            setEditId(data.ID);
            setIsEdit(true);

            setHasProfileId(data.IsProfile || "");

            setProfileId(data.CandidateProfileID || "");

            setFirstName(data.FirstName || "");
            setMiddleName(data.MiddleName || "");
            setLastName(data.LastName || "");

            setSelectedCourse(data.CourseID?.toString() || "");

            setSelectedPassingYear(data.PassingYearID?.toString() || "");

            setSelectedSelectionYear(data.SelectionYearID?.toString() || "");

            setPresentDesignation(data.PresentDesignation || "");

            setPresentOrganization(data.PresentOrganization || "");

            setCandidateMobile(data.CandidateMobileNo || "");

            setCandidatePhoto(data.PhotoPath || "");

            setDocumentFile({
                FilePath: data.DocumentPath
            });

            setTimeout(() => {
                editSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);


        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: "Delete Record?",
            text: "Are you sure you want to delete this Success Story?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);

            const response = await agent.delete(
                `/api/InstituteBase/DeleteSuccessStory/${item.ID}`,
                {
                    params: {
                        userLoginId: userInfo?.UserLoginID,
                        ipAddress: "0.0.0.0",
                    },
                }
            );

            if (response.data.Status === "Success") {
                await loadSuccessStoryList(selectedInstitute);

                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "Success Story deleted successfully.",
                    timer: 1500,
                    showConfirmButton: false,
                });

                // If currently editing the deleted record
                if (editId === item.ID) {
                    handleReset();
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.data.Message || "Unable to delete record.",
                });
            }
        } catch (error) {
            console.error(error.response?.data || error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.Message ||
                    "Something went wrong while deleting.",
            });
        } finally {
            setLoading(false);
        }
    };


    const resetForm = () => {
        setProfileId("");
        setCandidateData(null);

        setFirstName("");
        setMiddleName("");
        setLastName("");

        setSelectedCourse("");
        setSelectedPassingYear("");
        setSelectedSelectionYear("");

        setPresentDesignation("");
        setPresentOrganization("");

        setCandidateMobile("");

        setCandidatePhoto("");
        setDocumentFile(null);
        setPhotoFile(null);

        setErrors({});

        setMessage("");
        setMessageType("");

        setIsEdit(false);
        setEditId(0);

        setSelectedInstitute(instituteId.toString());

        setUploadResetKey(prev => prev + 1);
    };

    const handleReset = () => {
        setHasProfileId("");
        resetForm();
    };
    const handleClose = () => {
        setHasProfileId("");

        resetForm();

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!hasProfileId) {
            newErrors.hasProfileId = "Please select Yes or No.";
        }

        if (hasProfileId === "1" && !profileId.trim()) {
            newErrors.profileId = "Profile ID is required.";
        }

        if (!firstName.trim()) {
            newErrors.firstName = "First Name is required.";
        }

        if (!selectedCourse) {
            newErrors.course = "Course is required.";
        }

        if (!selectedInstitute) {
            newErrors.institute = "Institute is required.";
        }

        if (!selectedPassingYear) {
            newErrors.passingYear = "Passing Year is required.";
        }

        if (!presentDesignation.trim()) {
            newErrors.presentDesignation = "Present Designation is required.";
        }

        if (!presentOrganization.trim()) {
            newErrors.presentOrganization = "Present Organization is required.";
        }

        if (!selectedSelectionYear) {
            newErrors.selectionYear = "Selection Year is required.";
        }

        if (!candidateMobile.trim()) {
            newErrors.mobile = "Candidate Mobile No is required.";
        } else if (!/^\d{10}$/.test(candidateMobile)) {
            newErrors.mobile = "Enter valid 10 digit mobile number.";
        }

        if (!documentFile) {
            newErrors.document = "Document is required.";
        }

        if (!photoFile && !candidatePhoto) {
            newErrors.photo = "Photo is required.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {

            requestAnimationFrame(() => {

                if (newErrors.profileId)
                    profileRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

                else if (newErrors.firstName)
                    firstNameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

                else if (newErrors.course)
                    courseRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

                else if (newErrors.passingYear)
                    passingYearRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

                else if (newErrors.presentDesignation)
                    designationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

                else if (newErrors.presentOrganization)
                    organizationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

                else if (newErrors.selectionYear)
                    selectionYearRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

                else if (newErrors.mobile)
                    mobileRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

                else if (newErrors.document)
                    documentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

                else if (newErrors.photo)
                    photoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

            });

            return false;
        }

        return true;
    }



    return (
        <>
            {loading && <Loader />}
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="bg-white rounded-xl shadow-md p-6">

                    <fieldset className="border rounded-md p-4">
                        {message && (
                            <div
                                ref={messageRef}
                                className={`mb-5 rounded-md px-4 py-3 text-sm font-medium ${messageType === "success"
                                    ? "bg-green-100 text-green-800 border border-green-300"
                                    : "bg-cyan-100 text-cyan-800 border border-cyan-300"
                                    }`}
                            >
                                {message}
                            </div>
                        )}
                        <legend
                            className={`flex items-center text-base font-semibold text-white border px-3 py-2 rounded-md ml-4 ${color}`}
                        >
                            <FileText className="mr-3 h-4 w-4" />
                            Success Stories of Board
                        </legend>

                        {/* Profile Question */}

                        <div className="mb-6">
                            <label className="font-medium">
                                Do you have Profile ID of Candidate ? {" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <div className="flex gap-8 mt-3">

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="1"
                                        checked={hasProfileId === "1"}
                                        onChange={(e) => {
                                            setHasProfileId(e.target.value);
                                            resetForm();
                                        }}
                                    />
                                    Yes
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="0"
                                        checked={hasProfileId === "0"}
                                        onChange={(e) => {
                                            setHasProfileId(e.target.value);
                                            resetForm();
                                        }}
                                    />
                                    No
                                </label>

                            </div>
                        </div>

                        {hasProfileId && (
                            <>
                                {hasProfileId === "1" && (
                                    <div className="grid md:grid-cols-3 gap-5 mb-5">
                                        <div>
                                            <label className="block mb-2">
                                                Profile ID of Candidate
                                                <span className="ml-1 text-red-500">*</span>
                                            </label>

                                            <input
                                                ref={profileRef}
                                                type="text"
                                                value={profileId}
                                                onChange={(e) => setProfileId(e.target.value)}

                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleProfileSearch();
                                                    }
                                                }}
                                                className="w-full border rounded-md px-3 py-2"
                                                placeholder="Enter Profile ID"
                                            />
                                        </div>
                                    </div>
                                )}

                                <hr className="my-5" />
                                <div
                                    ref={editSectionRef}
                                    className="grid md:grid-cols-3 gap-5"
                                >


                                    <div>

                                        <label className="inline mb-2">
                                            First Name

                                            <span className="ml-1 text-red-500">*</span>{" "}
                                            {errors.firstName && (
                                                <p className="inline-block text-red-500 text-sm mt-1">
                                                    {errors.firstName}
                                                </p>
                                            )}
                                        </label>
                                        <input
                                            ref={firstNameRef}
                                            value={firstName}
                                            onChange={(e) => {
                                                setFirstName(e.target.value.toUpperCase());

                                                if (e.target.value.trim()) {
                                                    setErrors(prev => ({
                                                        ...prev,
                                                        firstName: ""
                                                    }));
                                                }
                                            }}
                                            className="w-full border rounded-md px-3 py-2"
                                        />


                                    </div>

                                    <div>
                                        <label className="inline mb-2">
                                            Middle Name
                                        </label>

                                        <input
                                            value={middleName}
                                            onChange={(e) => {
                                                setMiddleName(e.target.value.toUpperCase());

                                                if (e.target.value.trim()) {
                                                    setErrors(prev => ({
                                                        ...prev,
                                                        middleName: ""
                                                    }));
                                                }
                                            }}
                                            className="w-full border rounded-md px-3 py-2"
                                        />


                                    </div>

                                    <div>
                                        <label className="inline mb-2 ">
                                            Last Name
                                        </label>

                                        <input
                                            value={lastName}
                                            onChange={(e) => {
                                                setLastName(e.target.value.toUpperCase());

                                                if (e.target.value.trim()) {
                                                    setErrors(prev => ({
                                                        ...prev,
                                                        lastName: ""
                                                    }));
                                                }
                                            }}
                                            className="w-full border rounded-md px-3 py-2"
                                        />

                                    </div>


                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <label className="text-sm font-medium text-gray-700">
                                                Course
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>

                                            {errors.course && (
                                                <span className="inline-block text-red-500 text-sm ">
                                                    {errors.course}
                                                </span>
                                            )}
                                        </div>
                                        <div ref={courseRef}>
                                            <DropdownComponent
                                                label=""
                                                options={courses}
                                                value={selectedCourse}
                                                onChange={(value) => {
                                                    setSelectedCourse(value);
                                                    setErrors(prev => ({
                                                        ...prev,
                                                        course: ""
                                                    }));
                                                }}
                                                required={false}
                                            />



                                        </div>
                                    </div>



                                    <DropdownComponent
                                        label="Institute"
                                        options={institutes.map(item => ({
                                            value: item.Value,
                                            label: item.Text,
                                        }))}
                                        value={selectedInstitute}
                                        onChange={(value) => {
                                            setSelectedInstitute(value);
                                        }}
                                        disabled={true}
                                        required
                                    />


                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <label className="text-sm font-medium text-gray-700">
                                                Passing Year
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>

                                            {errors.passingYear && (
                                                <span className="inline-block text-red-500 text-sm ml-2">
                                                    {errors.passingYear}
                                                </span>
                                            )}
                                        </div>
                                        <div ref={passingYearRef}>
                                            <DropdownComponent
                                                label=""
                                                options={passingYears}
                                                value={selectedPassingYear}
                                                onChange={(value) => {
                                                    setSelectedPassingYear(value);
                                                    setErrors(prev => ({
                                                        ...prev,
                                                        passingYear: ""
                                                    }));
                                                }}
                                                required={false}
                                            />
                                        </div>
                                    </div>


                                    <div>
                                        <label className="inline mb-2">
                                            Present Designation
                                            <span className="ml-1 text-red-500">*</span>{" "}
                                            {errors.presentDesignation && (
                                                <p className="inline text-red-500 text-sm mt-1">
                                                    {errors.presentDesignation}
                                                </p>
                                            )}

                                        </label>

                                        <input
                                            ref={designationRef}
                                            value={presentDesignation}
                                            onChange={(e) => setPresentDesignation(e.target.value.toUpperCase())}
                                            className="w-full border rounded-md px-3 py-2"
                                        />

                                    </div>

                                    <div>
                                        <label className="inline mb-2 ">
                                            Present Organization
                                            <span className="ml-1 text-red-500">*</span>{" "}
                                            {errors.presentOrganization && (
                                                <p className="inline text-red-500 text-sm mt-1">
                                                    {errors.presentOrganization}
                                                </p>
                                            )}
                                        </label>

                                        <input
                                            ref={organizationRef}
                                            value={presentOrganization}
                                            onChange={(e) => setPresentOrganization(e.target.value.toUpperCase())}
                                            className="w-full border rounded-md px-3 py-2"
                                        />

                                    </div>

                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <label className="text-sm font-medium text-gray-700">
                                                Selection Year
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>

                                            {errors.selectionYear && (
                                                <span className="inline-block text-red-500 text-sm ml-2">
                                                    {errors.selectionYear}
                                                </span>
                                            )}
                                        </div>
                                        <div ref={selectionYearRef}>
                                            <DropdownComponent
                                                label=""
                                                options={selectionYears}
                                                value={selectedSelectionYear}
                                                onChange={(value) => {
                                                    setSelectedSelectionYear(value);
                                                    setErrors(prev => ({
                                                        ...prev,
                                                        selectionYear: ""
                                                    }));
                                                }}
                                                required={false}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="inline mb-2">
                                            Candidate Mobile No
                                            <span className="ml-1 text-red-500">*</span>{" "}
                                            {errors.mobile && (
                                                <p className=" inline text-red-500 text-sm mt-1">
                                                    {errors.mobile}
                                                </p>
                                            )}
                                        </label>

                                        <input
                                            ref={mobileRef}
                                            value={candidateMobile}
                                            onChange={(e) => setCandidateMobile(e.target.value)}
                                            className="w-full border rounded-md px-3 py-2"
                                        />

                                    </div>

                                </div>

                                {/* Upload Document */}

                                <div className="mt-8">

                                    <div className="flex items-center mb-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Upload Document
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>

                                        {errors.document && (
                                            <span className="inline-block text-red-500 text-sm ml-2">
                                                {errors.document}
                                            </span>
                                        )}
                                    </div>
                                    <div ref={documentRef}>
                                        <UploadPdf
                                            key={`document-${uploadResetKey}`}
                                            label=""      // Hide internal label
                                            required={false}
                                            file={documentFile}
                                            onFileChange={handleDocumentUpload}
                                            allowedFileTypes="jpg, jpeg, pdf"
                                            maxFileSize="1 MB"
                                            buttonText="Upload"
                                            userTypeId={userInfo?.UserTypeID}
                                            userLoginID={userInfo?.UserLoginID}
                                            id="SuccessStoryDocument"
                                            linkName="View Document"
                                        />

                                    </div>
                                </div>

                                {/* Instructions + Sample Image */}

                                <div className="mt-5 flex justify-between items-start gap-8">


                                    <div className="mt-5 flex items-start justify-between">

                                        {/* Instructions */}

                                        <div className="w-[70%]">

                                            <ol className="list-decimal pl-5 text-sm text-gray-700 leading-7 space-y-1">

                                                <li>Upload Passport Size, Color and Recent Photo</li>

                                                <li>Photo should be clear and high resolution</li>

                                                <li>Background should be white</li>

                                                <li>Photo should be in formal dress.</li>

                                                <li>Size should be of proportion Height : Width = 4:3</li>

                                                <li className="max-w-[620px]">
                                                    Unclear / Low resolution photo with background except white,
                                                    non-formal dress, proportion other than specified above shall
                                                    not be displayed on Home Page.
                                                </li>

                                            </ol>

                                        </div>

                                        {/* Sample Photo */}

                                        <div className="w-[170px] flex justify-left">

                                            <img
                                                src={sampleImage}
                                                alt="Sample"
                                                className="w-32 h-40 border object-cover"
                                            />

                                        </div>

                                    </div>

                                </div>

                                {/* Uploaded Photo */}

                                <div className="mt-8 flex justify-center">

                                    <div className="w-[70%] flex justify-left">

                                        <div className="flex flex-col items-center">

                                            {/* Photo Preview */}
                                            <div className="w-32 h-40 border border-gray-300 bg-white overflow-hidden">

                                                {candidatePhoto ? (
                                                    <img
                                                        src={candidatePhoto}
                                                        alt="Candidate"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : null}

                                            </div>
                                            {/* Upload Button */}

                                            <div className="flex items-center mb-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Upload Photo
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>

                                                {errors.photo && (
                                                    <span className="inline-block text-red-500 text-sm ml-2">
                                                        {errors.photo}
                                                    </span>
                                                )}
                                            </div>
                                            <div ref={photoRef}>
                                                <UploadPdf
                                                    key={`photo-${uploadResetKey}`}
                                                    label=""
                                                    required={false}
                                                    file={photoFile}
                                                    onFileChange={handlePhotoUpload}
                                                    allowedFileTypes="jpg, jpeg"
                                                    maxFileSize="1 MB"
                                                    buttonText="Upload"
                                                    userTypeId={userInfo?.UserTypeID}
                                                    userLoginID={userInfo?.UserLoginID}
                                                    id="SuccessStoryPhoto"
                                                    linkName=""

                                                />

                                            </div>
                                        </div>

                                    </div>

                                </div>
                                {/* Buttons */}

                                <div className="flex justify-center gap-4 mt-10">

                                    <Button
                                        variant="success"
                                        onClick={handleAdd}
                                    >
                                        {isEdit ? "Update" : "Add"}
                                    </Button>


                                    <Button
                                        variant="danger"
                                        onClick={handleReset}
                                    >
                                        Reset
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        onClick={handleClose}
                                    >
                                        Close
                                    </Button>



                                </div>

                            </>
                        )}

                    </fieldset>
                    <div className="mt-8">
                        {tableLoading ? (
                            <Loader />
                        ) : tableData.length > 0 ? (
                            <FilteredTableComponent
                                title="Success Stories"
                                columns={columns}
                                data={tableData}
                                renderCell={renderCell}
                            />
                        ) : (
                            <div className="bg-white border rounded-lg shadow-sm p-6 text-center">
                                <p className="text-gray-500 text-base font-medium">
                                    No Success Stories Found.
                                </p>
                            </div>
                        )}
                    </div>
                </div>


            </div>
        </>
    );
};

export default SuccessStories;