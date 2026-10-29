
import React, { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import { FaBook, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSearch } from "react-icons/fa";
import { useAuth } from "../../../Hooks/AuthContext";
import agent from '../../../lib/api/agent';
import Swal from "sweetalert2";
import { useLoading } from "../../../Hooks/useLoading";
import { DeleteProposedCourseUnitDetails, GetCourseDetails, GetInstituteDash, GetInstituteIDByInstituteCode, GetMasterSector, GetProposedCourseofGroupCourseApprovalGroupWise, GetProposedCourseUnitDetails, GetSectorwiseCourseType, IsCourseEligibleForApplication, IsEditingAllowed, SaveProposedCourseUnitDetails } from "../../../Endpoints_All/Base/Institute";
import { useNavigate } from "react-router-dom";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { GetMasterCourse } from "../../../Endpoints_All/Base/Courses";
import Button from "../../base/Button";
import CourseInformationPopup from "../../formcomponent/CourseInformationPopup";
import { getDeviceIP } from "../../../utils/CommonHelper";
import { useMemo } from "react";
import { use } from "react";
import { createPortal } from "react-dom";





const ProposedCourse = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const navigate = useNavigate();
    const [coursesData, setCoursesData] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [courseTypes, setCourseTypes] = useState([]);
    const [courses, setCourses] = useState([]);  // NEW: courses list
    const [editingRowId, setEditingRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [perUnitInspectionFees, setPerUnitInspectionFees] = useState(0);
    const [perUnitSecurityDeposit, setPerUnitSecurityDeposit] = useState(0);
    const [editFormDataMap, setEditFormDataMap] = useState({});
    const [approvalGroupId, setApprovalGroupId] = useState(null);
    const [courseInfo, setCourseInfo] = useState([]);
    const [showCourseInfoPopup, setShowCourseInfoPopup] = useState(false);
    const [selectedCourseName, setSelectedCourseName] = useState("");
    const [selectedCourseCode, setSelectedCourseCode] = useState("");
    const [showVerificationUI, setShowVerificationUI] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ show: false, status: "", remark: "", color: "" });
    const [instituteID, setInstituteID] = useState(null);
    const [ipAddress, setIpAddress] = useState("");
    const [userLoginID, setUserLoginID] = useState("");
    const userType = userInfo?.UserTypeID;
    const isSecretary = userType === 81;
    const [instituteId, setInstituteId] = useState(null);
    const [isEditingAllowed, setIsEditingAllowed] = useState(false);
    const proposedUnitsInputRef = useRef(null);
    const filterButtonRefs = useRef({});
    const [columnFilters, setColumnFilters] = useState({});
    const [openFilterColumn, setOpenFilterColumn] = useState(null);
    const [filterPosition, setFilterPosition] = useState(null);
    const [globalSearch, setGlobalSearch] = useState("");


    useEffect(() => {
        if (!openFilterColumn) return;

        const updateFilterPosition = () => {
            const button = filterButtonRefs.current[openFilterColumn];

            if (!button) return;

            const rect = button.getBoundingClientRect();

            const dropdownWidth = 224;
            const dropdownHeight = 250;
            const gap = 5;

            let left = rect.left - 100;
            let top = rect.bottom + gap;

            if (left < 5) {
                left = 5;
            }

            if (left + dropdownWidth > window.innerWidth - 5) {
                left = window.innerWidth - dropdownWidth - 5;
            }
            if (top + dropdownHeight > window.innerHeight - 5) {
                top = rect.top - dropdownHeight - gap;
            }

            if (top < 5) {
                top = 5;
            }

            setFilterPosition({
                top,
                left,
                width: dropdownWidth
            });
        };

        // Initial position
        updateFilterPosition();


        window.addEventListener("scroll", () => {
            setOpenFilterColumn(null);
            setFilterPosition(null);
        }, true);
        window.addEventListener("resize", updateFilterPosition);

        const handleClickOutside = (e) => {
            if (
                !e.target.closest(".filter-popup") &&
                !e.target.closest(".filter-button")
            ) {
                setOpenFilterColumn(null);
                setFilterPosition(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("scroll", updateFilterPosition, true);
            window.removeEventListener("resize", updateFilterPosition);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openFilterColumn]);

    const getHashCode = (str) => {
        if (!str) return 0;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    };

    const getInstituteIdForSecretary = () => {

        const searchParams = new URLSearchParams(location.search);
        let p1 = searchParams.get('P1');
        let p2 = searchParams.get('P2');

        if (p1 && p2) {
            const calculatedHash = getHashCode(p1).toString();
            if (calculatedHash === p2) {
                return parseInt(p1);
            }
        } else if (p1) {
            return parseInt(p1);
        }

        const instituteIdFromSession = userInfo?.InstituteID;
        if (instituteIdFromSession) {
            return parseInt(instituteIdFromSession);
        }
        if (userInfo?.InstituteID) {
            return parseInt(userInfo.InstituteID);
        }

        return null;
    };




    useEffect(() => {
        // fetchCoursesData();
        // fetchSectors();
        initializeComponent();

    }, []);

    const initializeComponent = async () => {
        await Promise.all([
            fetchCoursesData(),
            fetchSectors(),
            checkEligibilityStatus(),
            fetchIP()
        ]);
    };

    // useEffect(() => {
    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
    };
    //     fetchIP();
    // }, []);
    useEffect(() => {
        const fetchStatus = async () => {
            const userType = userInfo?.UserTypeID || userInfo?.UserTypeID;

            // Only for institute (NOT secretary)
            if (userType !== 81 && instituteID) {
                try {
                    const response = await agent.get(
                        `/api/InstituteBase/GetProposedInstituteStatus/${instituteID}`
                    );


                    const statusData = response.data?.Data;

                    const status = statusData?.IsProposedCourses;
                    const remark = statusData?.ProposedCoursesRemark;

                    if (status === "R") {



                        setStatusMessage({
                            show: true,
                            status: "Rejected",
                            remark: remark?.toUpperCase(),
                            color: "red"
                        });
                    }
                    else if (status === "V") {
                        setStatusMessage({
                            show: true,
                            status: "Verified",
                            remark: remark?.toUpperCase(),
                            color: "green"
                        });
                    }
                    else {
                        setStatusMessage({
                            show: false,
                            status: "",
                            remark: "",
                            color: ""
                        });
                    }

                } catch (error) {
                    console.error("Error fetching status:", error);
                }
            }
        };

        fetchStatus();
    }, [instituteID]);
    useEffect(() => {
        const fetchVerificationStatus = async () => {

            const userType = userInfo?.UserTypeID || userInfo?.UserTypeID;

            if (userType === 81 && instituteID) {
                setShowVerificationUI(true);

                try {
                    const p1 = new URLSearchParams(location.search).get('P1');

                    const response = await agent.get(
                        `${GetInstituteDash}?InstituteCode=${userLoginID}&InstituteID=${p1}`
                    );
                    // const response = await agent.get(
                    //     `/api/InstituteBase/GetInstituteDash?InstituteCode=${userLoginID}&InstituteID=${instituteID}`
                    // );


                    const dataSet = response.data;
                    if (dataSet && dataSet.Table2 && dataSet.Table2.length > 0) {
                        const verificationData = dataSet.Table2[0];

                        let status = verificationData.IsProposedCourses || "";
                        if (status === "N") {
                            status = "";
                        }
                        const remark = verificationData.ProposedCoursesRemark || "";


                        setApprovalStatus(status);
                        setRejectReason(remark);
                        setIsAlreadyVerified(status === "V");
                    } else {
                        setApprovalStatus("");
                        setRejectReason("");
                        setIsAlreadyVerified(false);
                    }
                } catch (error) {
                    console.error("Error fetching verification status:", error);
                    setApprovalStatus("");
                    setRejectReason("");
                    setIsAlreadyVerified(false);
                }
            }
        };

        if (instituteID) {
            fetchVerificationStatus();
        }
    }, [instituteID, userInfo]);
    useEffect(() => {
        impNoticePopup();

    }, []);

    const SimpleSearchDropdown = ({
        options = [],
        value,
        onChange,
        placeholder = "Select",
        disabled = false,
        dropdownWidth = 220
    }) => {
        const [open, setOpen] = useState(false);
        const [search, setSearch] = useState("");
        const [position, setPosition] = useState(null);

        const buttonRef = React.useRef(null);

        const selected = options.find(
            opt => String(opt.value) === String(value)
        );

        const filteredOptions = options.filter(opt =>
            String(opt.label || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        );

        const updatePosition = () => {
            if (!buttonRef.current) return;

            const rect = buttonRef.current.getBoundingClientRect();

            setPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: Math.max(rect.width, dropdownWidth)
            });
        };

        useEffect(() => {
            if (!open) return;

            updatePosition();

            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);

            return () => {
                window.removeEventListener("scroll", updatePosition, true);
                window.removeEventListener("resize", updatePosition);
            };
        }, [open]);

        return (
            <>
                <div className="relative w-full">
                    <button
                        ref={buttonRef}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            if (!disabled) {
                                setOpen(prev => !prev);
                                setSearch("");
                            }
                        }}
                        className={`w-full h-9 px-2 text-left text-xs border border-gray-300 rounded-md bg-white
                    ${disabled
                                ? "bg-gray-100 cursor-not-allowed"
                                : "cursor-pointer"}
                    focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    >
                        <span className="truncate block">
                            {selected?.label || placeholder}
                        </span>
                    </button>
                </div>

                {open &&
                    position &&
                    createPortal(
                        <>
                            {/* Overlay */}
                            <div
                                className="fixed inset-0 z-[40]"
                                onClick={() => setOpen(false)}
                            />

                            {/* Dropdown */}
                            <div
                                className="fixed bg-white border border-gray-300 rounded-md shadow-xl z-[45]"
                                style={{
                                    top: `${position.top}px`,
                                    left: `${position.left}px`,
                                    width: `${position.width}px`,
                                    maxHeight: "350px"
                                }}
                            >
                                <div className="p-2 border-b bg-white">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search..."
                                        autoFocus
                                        className="w-full h-8 px-2 text-xs border border-gray-300 rounded-md
                                    focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                <div
                                    className="overflow-y-auto"
                                    style={{
                                        maxHeight: "280px",
                                        minHeight: "100px"
                                    }}
                                >
                                    {filteredOptions.length > 0 ? (
                                        filteredOptions.map(option => (
                                            <div
                                                key={option.value}
                                                onClick={() => {
                                                    onChange(option.value);
                                                    setOpen(false);
                                                    setSearch("");
                                                }}
                                                className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 whitespace-normal break-words
                                            ${String(option.value) === String(value)
                                                        ? "bg-blue-100 font-medium"
                                                        : ""
                                                    }`}
                                            >
                                                {option.label}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-3 py-3 text-xs text-gray-500">
                                            No options found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>,
                        document.body
                    )}
            </>
        );
    };

    const fetchSectors = async () => {
        try {
            const sectorsRes = await agent.get(`${GetMasterSector}`);
            if (sectorsRes?.data?.Data) {
                setSectors(sectorsRes.data.Data);

            }
        } catch (error) {
            console.error("Error fetching sectors:", error);
        }
    };

    // Step 2: Fetch course types based on selected sectorId
    const fetchCourseTypesBySector = async (sectorId) => {
        if (!sectorId) {
            setCourseTypes([]);
            setCourses([]);
            return;
        }
        try {
            const courseTypesRes = await agent.get(`${GetSectorwiseCourseType}?sectorId=${sectorId}`);
            if (courseTypesRes?.data?.Data) {
                const filteredCourseTypes = courseTypesRes.data.Data.filter(
                    x => x.Value !== "6" && x.Value !== "8"
                );

                setCourseTypes(filteredCourseTypes);
            } else {
                setCourseTypes([]);
            }
            setCourses([]);
        } catch (error) {
            console.error("Error fetching course types:", error);
            setCourseTypes([]);
        }
    };

    // Step 3: Fetch courses based on selected courseTypeId (add your endpoint)
    const fetchCoursesByCourseType = async (courseTypeId, sectorId) => {
        if (!courseTypeId) {
            setCourses([]);
            return;
        }
        try {
            // Replace with your actual courses endpoint
            const coursesRes = await agent.get(`${GetMasterCourse}?SectorID=${sectorId}&CourseTypeID=${courseTypeId}&Flag=NewInstitute`);

            if (coursesRes?.data?.Data) {
                setCourses(coursesRes.data.Data);
            } else {
                setCourses([]);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            setCourses([]);
        }
    };


    const fetchCoursesData = async () => {
        startLoading();
        try {

            const userType = userInfo?.UserTypeID || userInfo?.UserTypeID;
            const instituteCode = userInfo?.UserLoginID || userInfo?.UserLoginID;
            setUserLoginID(instituteCode);

            const resInstitute = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`
            );

            if (!resInstitute.data?.Data) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Institute not found.",
                    confirmButtonColor: "#d33"
                });
                return;
            }


            const instituteId = resInstitute.data.Data;
            setInstituteID(instituteId);

            let payload;

            // SECRETARY FLOW
            if (userType === 81) {

                const p1 = new URLSearchParams(location.search).get('P1');


                const existingRes = await agent.get(
                    `/Base/GetExistingInstituteID/${p1}`
                );


                const existingInstituteId = existingRes?.data?.Data || 0;



                payload = {
                    instituteId: p1,
                    exitInstituteID: existingInstituteId,
                    userLoginID: userInfo?.UserLoginID,
                    pageCode: "ProposedCourse",
                    itemId: 0,
                    ipAddress: ipAddress
                };
            }

            //  INSTITUTE FLOW
            else {
                payload = {
                    instituteId: instituteId,
                    exitInstituteID: 0,
                    userLoginID: userInfo?.UserLoginID || "0",
                    pageCode: "ExistingInstitute",
                    itemId: 0,
                    ipAddress: ipAddress
                };
            }
            const response = await agent.post(
                `${GetProposedCourseUnitDetails}`,
                payload
            );

            let tableData = [];
            let pageStatus = "";
            let remark = "";

            if (response?.data?.Status === "Success") {
                if (response.data.Data?.Table && Array.isArray(response.data.Data.Table)) {
                    tableData = response.data.Data.Table;
                } else if (Array.isArray(response.data.Data)) {
                    tableData = response.data.Data;
                } else if (response.data.Data?.data && Array.isArray(response.data.Data.data)) {
                    tableData = response.data.Data.data;
                }

                if (tableData.length > 0) {
                    pageStatus = tableData[0].PageStatus || "";
                    remark = tableData[0].Remark || "";
                }
            }

            if (tableData.length > 0) {

                if (userType !== 81 && userType !== 64) {
                    if (pageStatus === "R") {



                        setStatusMessage({
                            show: true,
                            status: "Rejected",
                            remark,
                            color: "red"
                        });
                    } else if (pageStatus === "V") {
                        setStatusMessage({ show: true, status: "Verified", remark, color: "green" });
                    }
                }

                const transformedData = tableData.map((course, index) => ({
                    id: course.CourseID || index,
                    serialNo: index + 1,
                    sector: course.Sector || "",
                    sectorId: course.SectorID,
                    courseType: course.CourseType || "",
                    courseTypeId: course.CourseTypeID,
                    course: course.CourseWithCourseCode || `${course.CourseCode} - ${course.Course}`,
                    courseCode: course.CourseCode,
                    courseName: course.Course,
                    courseId: course.CourseID,
                    approvedUnits: parseInt(course.ApprovedUnits) || 0,
                    proposedUnits: course.ProposedUnits || 0,
                    // For Secretary: use LOI values from API, otherwise use regular values
                    loiProposedUnits: course.LOIProposedUnits || 0,

                    loiTotalUnits: course.LOIProposedUnits || 0,
                    totalUnits: (course.ApprovedUnits || 0) + (course.ProposedUnits || 0),
                    inspectionFees: course.InspectionFee || 0,
                    securityDeposit: course.SecurityDeposit || 0,
                    perUnitInspectionFees: course.PerUnitInspectionFees || 0,
                    perUnitSecurityDeposit: course.PerUnitSecurityDeposit || 0,
                    isEditAllowed: course.IsEditAllowed || false,
                    isDeleteAllowed: course.IsDeleteAllowed || false,
                    isExistingCourse: course.IsExistingCourse || 0,
                    isNew: false,
                    _original: course
                }));
                setCoursesData(transformedData);
            } else {
                setCoursesData([]);
            }

        } catch (error) {
            console.error("Error fetching courses data:", error);
            setCoursesData([]);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to fetch courses data.",
                confirmButtonColor: "#d33"
            });
        } finally {
            stopLoading();
        }
    };
    const checkEligibilityStatus = async () => {
        const userLoginID = userInfo?.UserLoginID || '';
        const instituteID = userInfo?.UserID || '';
        if (!instituteID || !userLoginID) {
            console.error("Institute ID or UserLoginID not available");
            return;
        }

        try {
            const isEditAllowed = await agent.post(IsEditingAllowed, {
                instituteId: instituteID,
                exitInstituteID: 0,
                userLoginID: userLoginID,
                pageCode: 'ProposedInstitute',
                itemId: 0,
                ipAddress: ipAddress
            })


            if (isEditAllowed.data && isEditAllowed?.data?.Status === "Success") {
                if (isEditAllowed?.data?.Data?.[0]) {
                    const isAllowed = isEditAllowed?.data?.Data?.[0].IsEditAllowed || false;
                    setIsEditingAllowed(isAllowed);
                }
            }
        } catch (error) {
            console.error("Error checking eligibility status:", error);
            console.warn("Could not determine eligibility status");
        }
    };


    const handleUpdateVerification = async () => {
        if (!approvalStatus) {
            Swal.fire({ icon: "warning", title: "Validation Error", text: "Please select Approved / Reject status" });
            return false;
        }
        if (approvalStatus === "R" && !rejectReason.trim()) {
            Swal.fire({ icon: "warning", title: "Validation Error", text: "Please enter a reason for rejection" });
            return false;
        }

        startLoading();
        try {
            // Prepare the list of courses with LOI units
            const p1 = new URLSearchParams(location.search).get("P1");
            const listProposedCourseUnitDetailsEntity = coursesData
                .filter(row => row.courseId > 0)
                .map(row => ({
                    instituteId: p1,
                    courseId: row.courseId,
                    course: row.courseName || "",
                    courseCode: row.courseCode || "",
                    lastModifiedOn: new Date().toISOString(),
                    requiredItems: "",
                    perUnitNorms: "",
                    requiredForProposedUnits: String(row.proposedUnits || 0),
                    requiredForApprovedUnits: String(row.approvedUnits || 0),
                    requiredForTotalUnits: String(row.totalUnits || 0),
                    // For Secretary: Use LOI values
                    proposedUnits: row.proposedUnits || 0,
                    approvedUnits: row.approvedUnits || 0,
                    totalUnits: (row.approvedUnits || 0) + (row.loiProposedUnits || 0),
                    loiProposedUnits: row.loiProposedUnits || 0,
                    loiTotalUnits: row.loiTotalUnits || 0,
                    securityDeposit: row.securityDeposit || 0,
                    inspectionFee: row.inspectionFees || 0,
                    userLoginID: userInfo?.UserLoginID || "",
                    ipAddress: ipAddress,
                    pageCode: "ProposedCourse"
                }));


            const updateResponse = await agent.post("/api/InstituteBase/UpdateProposedCourseUnitDetails", {
                instituteID: p1,
                proposedCourses: listProposedCourseUnitDetailsEntity,
                createdBy: userInfo?.UserLoginID || "",
                ipAddress: ipAddress
            });

            if (updateResponse.data?.Status !== "Success" && updateResponse.data?.status !== "Success") {
                Swal.fire("Error", "Failed to update LOI units", "error");
                return false;
            }

            // Update verification status
            const payload = {
                instituteID: p1,
                remark: rejectReason?.toUpperCase() || "",
                status: approvalStatus,
                pageCode: "ProposedCourse",
                createdBy: userInfo?.UserLoginID,
                ipAddress: ipAddress
            };
            const response = await agent.post(
                "/api/InstituteBase/update-verification-status",
                payload
            );


            const isSuccess =
                response.data?.Status === "Success" ||
                response.data?.status === "Success" ||
                response.data?.success === true ||
                response.data?.isSuccess === true ||
                response.data === true;

            if (isSuccess) {

                return true;
            }

            Swal.fire("Error", "Failed to update status", "error");
            return false;
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Something went wrong", "error");
            return false;
        } finally {
            stopLoading();
        }
    };

    const handleAddNewRow = () => {

        // Prevent adding another row if previous new row is incomplete
        const incompleteRow = coursesData.find(
            row =>
                row.isNew &&
                (
                    !row.sectorId ||
                    !row.courseTypeId ||
                    !row.courseId
                )
        );

        if (incompleteRow) {
            Swal.fire({
                icon: "warning",
                title: "Complete Previous Row",
                text: "Please fill this row first before adding another row.",
                confirmButtonColor: "#3085d6"
            });
            return;
        }

        const newId = Date.now();

        const newRow = {
            id: newId,
            serialNo: 0,
            sector: "",
            sectorId: "",
            courseType: "",
            courseTypeId: "",
            course: "",
            courseId: "",
            approvedUnits: 0,
            proposedUnits: 0,
            totalUnits: 0,
            inspectionFees: 0,
            securityDeposit: 0,
            perUnitInspectionFees: 0,
            perUnitSecurityDeposit: 0,
            isNew: true
        };

        setCoursesData(prev => {
            const nextSerialNo = prev.length + 1;

            return [
                ...prev,
                {
                    ...newRow,
                    serialNo: nextSerialNo
                }
            ];
        });

        setEditFormDataMap(prev => ({
            ...prev,
            [newId]: {
                sectorId: "",
                courseTypeId: "",
                courseId: "",
                proposedUnits: 0
            }
        }));

        setEditingRowId(newId);
    };
    const tableColumns = useMemo(() => {
        const baseColumns = [];

        // ✅ Only add action column for NON-secretary
        if (userType !== 81) {
            baseColumns.push({
                // key: "action",
                // header: (
                //     <FaPlus
                //         className="bg-blue-600 text-white rounded-sm p-1 h-6 w-6 cursor-pointer hover:bg-blue-700 text-center"
                //         onClick={handleAddNewRow}
                //     />
                // ),
                // sortable: false,
                // width: "80px",
                // headerClassName: "text-center",
                // className: "text-center"
                key: "action",
                header: <FaPlus
                    className={`rounded-sm p-1 h-6 w-6 text-center text-white
                ${isEditingAllowed
                            ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            : "bg-gray-400 cursor-not-allowed opacity-50"
                        }`}
                    onClick={isEditingAllowed ? handleAddNewRow : undefined}
                />,
                sortable: false,
                width: "80px",
                headerClassName: "text-center",
                className: "text-center"
            });
        }

        // ✅ Main columns
        baseColumns.push(
            { key: "serialNo", header: "S.N.", sortable: true, width: "60px", headerClassName: "text-center", className: "text-center" },
            { key: "sector", header: "Sector", sortable: true, width: "200px", headerClassName: "text-center", className: "text-center" },
            { key: "courseType", header: "Course Type", sortable: true, width: "200px", headerClassName: "text-center", className: "text-center" },
            { key: "course", header: "Course", sortable: true, width: "300px", headerClassName: "text-center", className: "text-center" },
            { key: "approvedUnits", header: "Approved Units (A)", sortable: true, width: "100px", headerClassName: "text-center", className: "text-center" },
            { key: "proposedUnits", header: "Proposed Units (B)", sortable: true, width: "100px", headerClassName: "text-center", className: "text-center" }
        );

        // ✅ Only for Secretary
        if (userType === 81) {
            baseColumns.push({
                key: "loiTotalUnits",
                header: "LOI Units ",
                sortable: true,
                width: "120px",
                headerClassName: "text-center",
                className: "text-center"
            });
        }

        // ✅ Common columns
        baseColumns.push(
            { key: "totalUnits", header: "Total Units (C=A+B)", sortable: true, width: "100px", headerClassName: "text-center", className: "text-center" },
            { key: "inspectionFees", header: "Inspection Fees", sortable: true, width: "100px", headerClassName: "text-center", className: "text-center" },
            { key: "securityDeposit", header: "Security Deposit", sortable: true, width: "100px", headerClassName: "text-center", className: "text-center" }
        );

        return baseColumns;
    }, [userType, isEditingAllowed, coursesData]);


    const handleEditRow = async (row) => {
        if (!row.isEditAllowed && !row.isNew) {
            Swal.fire({
                icon: "warning",
                title: "Not Allowed",
                text: "Editing is not allowed for this course.",
                confirmButtonColor: "#3085d6"
            });
            return;
        }

        // First maintain the existing row values
        setEditFormDataMap(prev => ({
            ...prev,
            [row.id]: {
                ...(prev[row.id] || {}),
                sectorId: row.sectorId || "",
                courseTypeId: row.courseTypeId || "",
                courseId: row.courseId || "",
                proposedUnits: row.proposedUnits || 0,
                loiProposedUnits: row.loiProposedUnits || 0,
                perUnitInspectionFees: row.perUnitInspectionFees || 0,
                perUnitSecurityDeposit: row.perUnitSecurityDeposit || 0
            }
        }));

        // Show edit mode immediately
        setEditingRowId(row.id);

        try {
            // IMPORTANT: Load Course Types first
            if (row.sectorId) {
                await fetchCourseTypesBySector(row.sectorId);
            }

            // IMPORTANT: Then load Courses
            if (row.sectorId && row.courseTypeId) {
                await fetchCoursesByCourseType(
                    row.courseTypeId,
                    row.sectorId
                );
            }

            // Finally load course-related details
            if (row.courseId) {
                await handleFetchCourseUnitsData(
                    row.courseId,
                    row.id
                );
            }
        } catch (error) {
            console.error("Error loading edit data:", error);
        }
    };

    const handleDeleteRow = async (row) => {
        if (!row.isDeleteAllowed && !row.isNew) {
            Swal.fire({
                icon: "warning",
                title: "Not Allowed",
                text: "Deletion is not allowed for this course.",
                confirmButtonColor: "#3085d6"
            });
            return;
        }
        // Add this function inside your ProposedCourse component
        const calculateTotals = (data) => {
            let totalApproved = 0;
            let totalProposed = 0;
            let totalUnits = 0;
            let totalInspectionFee = 0;
            let totalSecurityDeposit = 0;
            let totalLOIUnits = 0;

            data.forEach(row => {
                totalApproved += row.approvedUnits || 0;
                totalProposed += row.proposedUnits || 0;
                totalUnits += row.totalUnits || 0;
                totalInspectionFee += row.inspectionFees || 0;
                totalSecurityDeposit += row.securityDeposit || 0;
                totalLOIUnits += row.loiTotalUnits || 0;
            });

            return { totalApproved, totalProposed, totalUnits, totalInspectionFee, totalSecurityDeposit, totalLOIUnits };
        };

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            if (row.isNew) {
                const updatedData = coursesData.filter(item => item.id !== row.id);
                updatedData.forEach((item, index) => { item.serialNo = index + 1; });
                setCoursesData(updatedData);
                Swal.fire("Deleted!", "Row has been deleted.", "success");
            } else {
                startLoading();
                try {

                    const instituteCode = userInfo?.UserLoginID || userInfo?.UserLoginID;

                    const resInstitute = await agent.get(
                        `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`
                    );
                    const instituteId = resInstitute.data?.Data;

                    const payload = {
                        instituteId: instituteId,
                        courseId: row.courseId,
                        proposedUnits: 0,
                        userLoginID: userInfo?.UserLoginID || userInfo?.UserLoginID || "",
                        ipAddress: ipAddress,
                        pageCode: "ProposedCourse"
                    };

                    const response = await agent.delete(`${DeleteProposedCourseUnitDetails}`, {
                        data: {
                            instituteId: instituteId,
                            courseId: row.courseId,
                            courseCode: row.courseCode || "",
                            course: row.courseName || row.course || "",
                            proposedUnits: 0,
                            approvedUnits: row.approvedUnits || 0,
                            totalUnits: row.totalUnits || 0,
                            isEditAllowed: row.isEditAllowed || false,
                            isDeleteAllowed: row.isDeleteAllowed || false,
                            lastModifiedOn: new Date().toISOString(),
                            userLoginID: userInfo?.UserLoginID || "",
                            ipAddress: ipAddress,
                            pageCode: "ProposedCourse",
                            requiredItems: "",
                            perUnitNorms: "",
                            requiredForProposedUnits: String(row.proposedUnits || 0),
                            requiredForApprovedUnits: String(row.approvedUnits || 0),
                            requiredForTotalUnits: String(row.totalUnits || 0),
                        },
                        headers: { "Content-Type": "application/json" }
                    });

                    if (response?.data?.Status === "Success") {
                        const updatedData = coursesData.filter(item => item.id !== row.id);
                        updatedData.forEach((item, index) => { item.serialNo = index + 1; });
                        setCoursesData(updatedData);
                        Swal.fire("Deleted!", "Course has been deleted.", "success");
                    } else {
                        Swal.fire("Error!", response?.data?.Message || "Failed to delete.", "error");
                    }
                } catch (error) {
                    console.error("Delete error:", error);
                    Swal.fire("Error!", "Failed to delete course.", "error");
                } finally {
                    stopLoading();
                }
            }
        }
    };


    const handleFetchCourseUnitsData = async (courseId, rowId) => {
        if (!courseId) return;
        try {
            const courseDetails = await agent.get(`${GetCourseDetails}/${courseId}`);
            const perUnitIF = courseDetails?.data?.Data?.PerUnitInspectionFees || 0;
            const perUnitSD = courseDetails?.data?.Data?.PerUnitSecurityDeposit || 0;

            setPerUnitInspectionFees(perUnitIF);
            setPerUnitSecurityDeposit(perUnitSD);
            setApprovalGroupId(courseDetails?.data?.Data?.ApprovalGroupID || null);


            setEditFormDataMap(prev => ({
                ...prev,
                [rowId]: {
                    ...prev[rowId],
                    perUnitInspectionFees: perUnitIF,
                    perUnitSecurityDeposit: perUnitSD,
                }
            }));
            await handleShowCourseInfo(courseDetails?.data?.Data?.ApprovalGroupID || null);
        } catch (error) {
            console.error("Error fetching course unit data:", error);
        }
    };
    const handleShowCourseInfo = async (approvalGroupId) => {
        if (!approvalGroupId) return;
        try {
            const response = await agent.get(`${GetProposedCourseofGroupCourseApprovalGroupWise}?approvalGroupId=${approvalGroupId}`);
            if (response?.data?.Status === "Success" && response.data?.Data && response.data.Data.length > 0) {
                setCourseInfo(response.data?.Data || []);
                setShowCourseInfoPopup(true);
            }
        } catch (error) {
            console.error("Error fetching course info:", error);
        }
    };
    const handleCancelEdit = (rowId) => {
        const rowToRemove = coursesData.find(item => item.id === rowId);
        if (rowToRemove?.isNew) {
            const updatedData = coursesData.filter(item => item.id !== rowId);
            updatedData.forEach((item, index) => { item.serialNo = index + 1; });
            setCoursesData(updatedData);
        }
        setEditingRowId(null);
        setEditFormData({});
        setCourseTypes([]);
        setCourses([]);
        setPerUnitInspectionFees(0);
        setPerUnitSecurityDeposit(0);
    };

    // const handleFieldChange = async (rowId, field, value) => {
    //     setEditFormDataMap(prev => {
    //         const prevRow = prev[rowId] || {};
    //         const updated = { ...prevRow, [field]: value };

    //         if (field === "sectorId") {
    //             updated.courseTypeId = "";
    //             updated.courseId = "";
    //             fetchCourseTypesBySector(value);
    //         }
    //         if (field === "courseTypeId") {
    //             updated.courseId = "";
    //             fetchCoursesByCourseType(value, prevRow.sectorId);
    //         }
    //         // if (field === "courseId") {
    //         //     const selectedCourse = courses.find(c => String(c.Value) === String(value));
    //         //     updated.courseName = selectedCourse?.Text || "";
    //         //     updated.courseCode = selectedCourse?.Code || "";
    //         //     setSelectedCourseName(selectedCourse?.Text || "");
    //         //     setSelectedCourseCode(selectedCourse?.Code || "");
    //         //     handleFetchCourseUnitsData(value, rowId);
    //         // }
    //         if (field === "courseId") {
    //             const selectedCourse = courses.find(c => String(c.Value) === String(value));
    //             updated.courseName = selectedCourse?.Text || "";
    //             updated.courseCode = selectedCourse?.Code || "";
    //             setSelectedCourseName(selectedCourse?.Text || "");
    //             setSelectedCourseCode(selectedCourse?.Code || "");

    //             const isEligible = await checkIsEligibleForApplication(value);
    //             if (!isEligible) {
    //                 impNoticePopup(); 
    //                 updated.courseId = ""; 
    //                 return { ...prev, [rowId]: updated };
    //             }

    //             handleFetchCourseUnitsData(value, rowId);
    //         }
    //         if (field === "loiProposedUnits") {
    //             updated.loiProposedUnits = value;
    //         }


    //         return { ...prev, [rowId]: updated };
    //     });
    // };

    const handleFieldChange = async (rowId, field, value) => {

        if (field === "courseId") {

            const currentRow = coursesData.find(row => row.id === rowId);

            const duplicateRow = coursesData.find(row =>
                row.id !== rowId &&
                String(row.sectorId) === String(currentRow?.sectorId) &&
                String(row.courseId) === String(value)
            );

            if (duplicateRow) {
                Swal.fire({
                    icon: "warning",
                    title: "Duplicate Course",
                    text: `This course is already added under the same sector in Row ${duplicateRow.serialNo}.`,
                    confirmButtonColor: "#3085d6"
                });
                return;
            }

            const selectedCourse = courses.find(
                c => String(c.Value) === String(value)
            );

            const courseName = selectedCourse?.Text || "";
            const courseCode = selectedCourse?.Code || "";

            setEditFormDataMap(prev => ({
                ...prev,
                [rowId]: {
                    ...prev[rowId],
                    courseId: value,
                    courseName,
                    courseCode
                }
            }));

            setCoursesData(prev =>
                prev.map(row =>
                    row.id === rowId
                        ? {
                            ...row,
                            courseId: value,
                            courseName,
                            courseCode,
                            course: courseName
                        }
                        : row
                )
            );

            setSelectedCourseName(courseName);
            setSelectedCourseCode(courseCode);

            handleFetchCourseUnitsData(value, rowId);

            return;
        }

        setEditFormDataMap(prev => {
            const prevRow = prev[rowId] || {};
            const updated = {
                ...prevRow,
                [field]: value
            };

            if (field === "sectorId") {
                updated.courseTypeId = "";
                updated.courseId = "";

                fetchCourseTypesBySector(value);
            }

            if (field === "courseTypeId") {
                updated.courseId = "";

                fetchCoursesByCourseType(
                    value,
                    prevRow.sectorId
                );
            }

            if (field === "loiProposedUnits") {
                updated.loiProposedUnits = value;
            }

            return {
                ...prev,
                [rowId]: updated
            };
        });

        // IMPORTANT: maintain each row's selected data
        setCoursesData(prev =>
            prev.map(row => {
                if (row.id !== rowId) return row;

                if (field === "sectorId") {
                    const selectedSector = sectors.find(
                        s => String(s.Value) === String(value)
                    );

                    return {
                        ...row,
                        sectorId: value,
                        sector: selectedSector?.Text || "",
                        courseTypeId: "",
                        courseType: "",
                        courseId: "",
                        course: "",
                        courseName: "",
                        courseCode: ""
                    };
                }

                if (field === "courseTypeId") {
                    const selectedType = courseTypes.find(
                        c => String(c.Value) === String(value)
                    );

                    return {
                        ...row,
                        courseTypeId: value,
                        courseType: selectedType?.Text || "",
                        courseId: "",
                        course: "",
                        courseName: "",
                        courseCode: ""
                    };
                }

                return {
                    ...row,
                    [field]: value
                };
            })
        );
    };
    const mapOptions = (options = []) =>
        options
            .filter(opt => opt.Value !== "-1" && opt.Value !== -1)
            .map(opt => ({
                value: String(opt.Value),
                label: opt.Text
            }));


    const totalsRow = {
        id: "totals-row",
        serialNo: "",
        sector: "",
        courseType: "",
        course: "",
        approvedUnits: coursesData.reduce((sum, r) => sum + (r.approvedUnits || 0), 0),
        ...(isSecretary ? {
            // For Secretary: LOI Proposed Units should sum from rows
            loiTotalUnits: coursesData.reduce((sum, r) => sum + (r.loiProposedUnits || 0), 0),
            totalUnits: coursesData.reduce((sum, r) => sum + ((r.approvedUnits || 0) + (r.loiProposedUnits || 0)), 0),
            inspectionFees: coursesData.reduce((sum, r) => sum + (r.inspectionFees || 0), 0),
            securityDeposit: coursesData.reduce((sum, r) => sum + (r.securityDeposit || 0), 0),
            proposedUnits: coursesData.reduce((sum, r) => sum + (r.proposedUnits || 0), 0),
        } : {
            // proposedUnits: coursesData.reduce((sum, r) => sum + (r.proposedUnits || 0), 0),
            // totalUnits: coursesData.reduce((sum, r) => sum + (r.totalUnits || 0), 0),
            // inspectionFees: coursesData.reduce((sum, r) => sum + (r.inspectionFees || 0), 0),
            // securityDeposit: coursesData.reduce((sum, r) => sum + (r.securityDeposit || 0), 0),
            proposedUnits: coursesData.reduce((sum, r) => {
                const fd = editFormDataMap[r.id];
                return sum + (fd ? (fd.proposedUnits || 0) : (r.proposedUnits || 0));
            }, 0),
            totalUnits: coursesData.reduce((sum, r) => {
                const fd = editFormDataMap[r.id];
                const proposed = fd ? (fd.proposedUnits || 0) : (r.proposedUnits || 0);
                return sum + (r.approvedUnits || 0) + proposed;
            }, 0),
            //     inspectionFees: coursesData.reduce(
            //         (sum, r) => sum + Number(r.inspectionFees || 0),
            //         0
            //     ),

            //     securityDeposit: coursesData.reduce(
            //         (sum, r) => sum + Number(r.securityDeposit || 0),
            //         0
            //     ),
            // }),
            inspectionFees: coursesData.reduce((sum, r) => {
                // const fd = editFormDataMap[r.id];
                // const proposed = fd ? (fd.proposedUnits || 0) : (r.proposedUnits || 0);
                // const perUnit = fd?.perUnitInspectionFees ?? (r.perUnitInspectionFees || 0);
                // return sum + (proposed * perUnit);
                if (Number(r.inspectionFees) === 0) {
                    const fd = editFormDataMap[r.id];
                    const proposed = fd ? (fd.proposedUnits || 0) : (r.proposedUnits || 0);
                    const perUnit = fd?.perUnitInspectionFees ?? (r.perUnitInspectionFees || 0);
                    return sum + (proposed * perUnit);
                } else {
                    return sum + Number(r.inspectionFees || 0);
                }
            }, 0),
            securityDeposit: coursesData.reduce((sum, r) => {
                // const fd = editFormDataMap[r.id];
                // const proposed = fd ? (fd.proposedUnits || 0) : (r.proposedUnits || 0);
                // const perUnit = fd?.perUnitSecurityDeposit ?? (r.perUnitSecurityDeposit || 0);
                // return sum + (proposed * perUnit);

                if (Number(r.securityDeposit) === 0) {
                    const fd = editFormDataMap[r.id];
                    const proposed = fd ? (fd.proposedUnits || 0) : (r.proposedUnits || 0);
                    const perUnit = fd?.perUnitSecurityDeposit ?? (r.perUnitSecurityDeposit || 0);
                    return sum + (proposed * perUnit);
                } else {
                    return sum + Number(r.securityDeposit || 0);
                }
            }, 0),
        }),
        isTotalsRow: true,
    };

    const renderCell = (row, column) => {
        const isSecretary = userType === 81;

        if (row.isTotalsRow) {
            if (["action", "serialNo", "sector", "courseType", "course"].includes(column.key)) {
                return <span className="text-xs font-bold text-center block"></span>;
            }
            return <span className="text-xs font-bold text-center block">{row[column.key] ?? 0}</span>;
        }
        const isEditing = editingRowId === row.id;
        const rowFormData = editFormDataMap[row.id] || {};

        if (column.key === "serialNo") {
            return <span className="text-xs font-medium">{row.serialNo}</span>;
        }

        if (column.key === "action") {
            return (
                // <div className="flex justify-center gap-2">
                //     <button onClick={() => handleEditRow(row)} className="bg-blue-500 text-white p-1 rounded">
                //         <FaEdit size={14} />
                //     </button>
                //     <button onClick={() => handleDeleteRow(row)} className="bg-red-500 text-white p-1 rounded">
                //         <FaTrash size={14} />
                //     </button>
                // </div>
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => handleEditRow(row)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded disabled:opacity-50"
                        disabled={!isEditingAllowed}
                        title="Edit"
                    >
                        <FaEdit size={14} />
                    </button>
                    <button
                        onClick={() => handleDeleteRow(row)}
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded disabled:opacity-50"
                        disabled={!isEditingAllowed}
                        title="Delete"
                    >
                        <FaTrash size={14} />
                    </button>
                </div>
            );
        }

        if (column.key === "sector") {
            if (isEditing && !isSecretary) {
                return (
                    <SimpleSearchDropdown
                        options={mapOptions(sectors)}
                        value={String(rowFormData.sectorId || "")}
                        dropdownWidth={320}
                        onChange={(val) =>
                            handleFieldChange(row.id, "sectorId", val)
                        }
                        placeholder="Select Sector"
                    />
                );
            }
            return <span className="text-xs">{row.sector || "-"}</span>;
        }

        if (column.key === "courseType") {
            if (isEditing && !isSecretary) {
                return (
                    <SimpleSearchDropdown
                        options={mapOptions(courseTypes)}
                        value={String(rowFormData.courseTypeId || "")}
                        dropdownWidth={320}
                        onChange={(val) =>
                            handleFieldChange(row.id, "courseTypeId", val)
                        }
                        disabled={!rowFormData.sectorId}
                        placeholder="Select Course Type"
                    />
                );
            }
            return <span className="text-xs">{row.courseType || "-"}</span>;
        }

        if (column.key === "course") {
            if (isEditing && !isSecretary) {
                return (
                    <SimpleSearchDropdown
                        options={mapOptions(courses)}
                        value={String(rowFormData.courseId || "")}
                        dropdownWidth={320}
                        onChange={(val) =>
                            handleFieldChange(row.id, "courseId", val)
                        }
                        disabled={!rowFormData.courseTypeId}
                        placeholder="Select Course"
                    />
                );
            }
            return <span className="text-xs">{row.course || "-"}</span>;
        }

        if (column.key === "loiTotalUnits") {
            if (isSecretary) {
                return (
                    <input
                        type="number"
                        value={row.loiTotalUnits || 0}
                        onChange={(e) => {
                            const loi = parseInt(e.target.value) || 0;
                            const approved = parseInt(row.approvedUnits) || 0;

                            const perUnitIF = parseInt(row.perUnitInspectionFees) || 0;
                            const perUnitSD = parseInt(row.perUnitSecurityDeposit) || 0;
                            const totalUnits = approved + loi;

                            const inspectionFees = loi * perUnitIF;
                            const securityDeposit = loi * perUnitSD;

                            setCoursesData(prev => prev.map(item =>
                                item.id === row.id
                                    ? {
                                        ...item,
                                        loiTotalUnits: loi,
                                        loiProposedUnits: loi,
                                        totalUnits: totalUnits,
                                        inspectionFees: inspectionFees,
                                        securityDeposit: securityDeposit
                                    }
                                    : item
                            ));
                        }}
                        className="w-full p-1 text-xs border rounded text-center"
                        min="0"
                    />
                );
            }
            return null;
        }

        if (column.key === "proposedUnits") {
            if (!isSecretary) {
                if (isEditing) {
                    return (
                        <input
                            ref={(el) => {
                                proposedUnitsInputRef.current = el;
                            }}
                            type="text"
                            value={rowFormData.proposedUnits ?? 0}
                            onChange={(e) => {
                                const newProposed = parseInt(e.target.value, 10) || 0;

                                const approved = parseInt(row.approvedUnits, 10) || 0;
                                const perUnitIF = parseInt(row.perUnitInspectionFees, 10) || 0;
                                const perUnitSD = parseInt(row.perUnitSecurityDeposit, 10) || 0;

                                const newTotal = approved + newProposed;
                                const newInspectionFees = newProposed * perUnitIF;
                                const newSecurityDeposit = newProposed * perUnitSD;

                                // Update form state
                                setEditFormDataMap(prev => ({
                                    ...prev,
                                    [row.id]: {
                                        ...prev[row.id],
                                        proposedUnits: newProposed
                                    }
                                }));

                                // Update calculated row values
                                setCoursesData(prev =>
                                    prev.map(item =>
                                        item.id === row.id
                                            ? {
                                                ...item,
                                                proposedUnits: newProposed,
                                                totalUnits: newTotal,
                                                inspectionFees: newInspectionFees,
                                                securityDeposit: newSecurityDeposit
                                            }
                                            : item
                                    )
                                );

                                // Keep cursor/focus inside the same input
                                requestAnimationFrame(() => {
                                    if (proposedUnitsInputRef.current) {
                                        proposedUnitsInputRef.current.focus();

                                        const length =
                                            proposedUnitsInputRef.current.value.length;

                                        proposedUnitsInputRef.current.setSelectionRange(
                                            length,
                                            length
                                        );
                                    }
                                });
                            }}
                            onFocus={(e) => {
                                // Put cursor at the end when entering the box
                                const length = e.target.value.length;
                                e.target.setSelectionRange(length, length);
                            }}
                            className="w-full p-1 text-xs border rounded text-center"
                            min="0"
                            inputMode="numeric"
                            disabled={!isEditingAllowed}
                        />
                    );
                }
            }

            return (
                <span className="text-xs text-center block">
                    {row.proposedUnits || 0}
                </span>
            );
        }
        if (column.key === "totalUnits") {
            if (isSecretary) {

                const loiUnits = row.loiProposedUnits || row.loiTotalUnits || 0;
                const approvedUnits = row.approvedUnits || 0;
                const totalCalculated = loiUnits + approvedUnits;

                return (

                    <span className="text-xs text-center block font-semibold">
                        {totalCalculated}
                    </span>
                );
            } else {
                if (isEditing) {
                    const total = (row.approvedUnits || 0) + (rowFormData.proposedUnits || 0);
                    return <span className="text-xs text-center block">{total}</span>;
                }
                return <span className="text-xs text-center block">{row.totalUnits || 0}</span>;
            }
        }

        if (column.key === "inspectionFees") {
            if (isSecretary) {
                return <span className="text-xs text-center block">{row.inspectionFees || 0}</span>;
            } else {
                if (isEditing) {
                    const perUnit = rowFormData.perUnitInspectionFees ?? 0;   // ← from rowFormData, not global state
                    const fee = (rowFormData.proposedUnits || 0) * perUnit;
                    return <span className="text-xs text-center block">{fee}</span>;
                }
                return <span className="text-xs text-center block">{row.inspectionFees || 0}</span>;
            }
        }

        if (column.key === "securityDeposit") {
            if (isSecretary) {
                return <span className="text-xs text-center block">{row.securityDeposit || 0}</span>;
            } else {
                if (isEditing) {
                    const perUnit = rowFormData.perUnitSecurityDeposit ?? 0;   // ← from rowFormData, not global state
                    const deposit = (rowFormData.proposedUnits || 0) * perUnit;
                    return <span className="text-xs text-center block">{deposit}</span>;
                }
                return <span className="text-xs text-center block">{row.securityDeposit || 0}</span>;
            }
        }

        if (column.key === "approvedUnits") {
            return <span className="text-xs text-center block">{row.approvedUnits || 0}</span>;
        }

        return <span className="text-xs">{row[column.key] || "-"}</span>;
    };
    const handleBack = () => {
        const id =
            instituteId ||
            getInstituteIdForSecretary?.();

        if (userInfo?.UserTypeID === 81) {

            if (id) {
                navigate(
                    `/Institute/ProposedInstituteDetails?P1=${id}&P2=${String(id).getHashCode()}`
                );
            } else {
                navigate(`/Institute/ProposedInstituteDetails`);
            }
        } else {

            window.history.back();
        }
    };

    const handleClose = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to close this page?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6"
        });

        if (result.isConfirmed) {
            if (userInfo?.UserTypeID == 64) {
                navigate("/tinstitute/dashboard");
                return;
            }
            if (userInfo?.UserTypeID === 81) {
                const instituteId = getInstituteIdForSecretary();
                const hash = getHashCode(String(instituteId));

                navigate(`/InstituteDash?P1=${instituteId}&P2=${hash}`);
            } else {
                window.close();
            }
        }
    };

    const handleSaveNext = async () => {
        const userType = userInfo?.UserTypeID || userInfo?.UserTypeID;

        if (userType === 81) {
            const success = await handleUpdateVerification();
            const p1 = new URLSearchParams(location.search).get("P1");

            if (success) {
                setTimeout(() => {
                    navigate(`/Institute/SelfDeclaration?P1=${p1}`);
                }, 300);
            }

            return;
        }

        let isValid = true;
        let invalidCourses = [];

        coursesData.forEach(row => {
            const fd = editFormDataMap[row.id];
            const totalUnits = (row.approvedUnits || 0) + (fd ? (fd.proposedUnits || 0) : (row.proposedUnits || 0));

            if (totalUnits <= 0 && !row.isNew) {
                isValid = false;
                invalidCourses.push(row.course || `Row ${row.serialNo}`);
            }
        });

        if (!isValid) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                html: `Enter Proposed Unit for:<br/>${invalidCourses.join("<br/>")}`,
                confirmButtonColor: "#3085d6"
            });
            return;
        }

        const editingRows = coursesData.filter(row => editFormDataMap[row.id]);

        if (editingRows.length === 0 && coursesData.length > 0) {
            // If no edits but courses exist, proceed to next page
            navigate("/Institute/SelfDeclaration");
            return;
        }

        if (editingRows.length === 0 && coursesData.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "No Courses",
                text: "Please add at least one course before proceeding.",
                confirmButtonColor: "#3085d6"
            });
            return;
        }

        // Validate all editing rows have required fields
        for (const row of editingRows) {
            const fd = editFormDataMap[row.id];
            if (!fd.sectorId || !fd.courseTypeId || !fd.courseId) {
                Swal.fire({
                    icon: "warning",
                    title: "Incomplete Data",
                    text: `Please complete all dropdown fields for row ${row.serialNo}.`,
                    confirmButtonColor: "#3085d6"
                });
                return;
            }
            if (!fd.proposedUnits || fd.proposedUnits <= 0) {
                Swal.fire({
                    icon: "warning",
                    title: "Invalid Units",
                    text: `Proposed Units cannot be 0 for row ${row.serialNo}. Please enter a valid value.`,
                    confirmButtonColor: "#3085d6"
                });
                return;
            }
        }
        const duplicateCourses = [];
        const courseCombinationMap = new Map();

        for (const row of editingRows) {
            const fd = editFormDataMap[row.id];

            const key = `${fd.sectorId}_${fd.courseId}`;

            if (courseCombinationMap.has(key)) {
                duplicateCourses.push({
                    row: row.serialNo,
                    course: fd.courseName || row.course || "Selected Course"
                });
            } else {
                courseCombinationMap.set(key, row.serialNo);
            }
        }

        if (duplicateCourses.length > 0) {
            Swal.fire({
                icon: "warning",
                title: "Duplicate Course",
                html: `
            Same course cannot be added more than once
            under the same sector.<br/><br/>
            <b>${duplicateCourses.map(x =>
                    `Row ${x.row}: ${x.course}`
                ).join("<br/>")}</b>
        `,
                confirmButtonColor: "#3085d6"
            });

            return;
        }


        startLoading();
        try {
            const instituteCode = userInfo?.UserLoginID || userInfo?.UserLoginID;
            const resInstitute = await agent.get(`${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`);
            const instituteId = resInstitute.data?.Data;

            // First check if editing is allowed
            const checkPayload = {
                instituteId: instituteId,
                userLoginID: userInfo?.UserLoginID || "",
                pageCode: "ProposedCourse"
            };

            const failedRows = [];

            for (const row of editingRows) {
                const fd = editFormDataMap[row.id];
                const totalUnits = (row.approvedUnits || 0) + parseInt(fd.proposedUnits);

                const payload = {
                    instituteId: instituteId,
                    courseId: fd.courseId,
                    courseCode: row.isNew ? (fd.courseCode || "") : (row.courseCode || ""),
                    course: row.isNew ? (fd.courseName || "") : (row.courseName || row.course || ""),
                    proposedUnits: parseInt(fd.proposedUnits),
                    approvedUnits: row.approvedUnits || 0,
                    totalUnits: totalUnits,
                    isEditAllowed: row.isEditAllowed || false,
                    isDeleteAllowed: row.isDeleteAllowed || false,
                    lastModifiedOn: new Date().toISOString(),
                    userLoginID: userInfo?.UserLoginID || "",
                    ipAddress: ipAddress,
                    pageCode: "ProposedCourse",
                    requiredItems: "",
                    perUnitNorms: "",
                    requiredForProposedUnits: String(fd.proposedUnits || 0),
                    requiredForApprovedUnits: String(row.approvedUnits || 0),
                    requiredForTotalUnits: String(totalUnits),
                };

                try {
                    const response = await agent.post(`${SaveProposedCourseUnitDetails}`, payload);
                    if (response?.data?.Status !== "Success") {
                        failedRows.push({ serialNo: row.serialNo, message: response?.data?.Message || "Unknown error" });
                    }
                } catch (rowError) {
                    failedRows.push({ serialNo: row.serialNo, message: rowError?.message || "Request failed" });
                }
            }

            if (failedRows.length > 0) {
                const failedList = failedRows.map(f => `Row ${f.serialNo}: ${f.message}`).join("\n");
                Swal.fire({
                    icon: failedRows.length === editingRows.length ? "error" : "warning",
                    title: failedRows.length === editingRows.length ? "Save Failed" : "Partially Saved",
                    text: failedRows.length === editingRows.length
                        ? `All rows failed to save:\n${failedList}`
                        : `Some rows failed:\n${failedList}`,
                    confirmButtonColor: "#3085d6"
                });
                return;
            }

            Swal.fire("Success!", "All courses saved successfully.", "success");
            setEditFormDataMap({});
            setEditingRowId(null);
            navigate("/Institute/SelfDeclaration");

        } catch (error) {
            console.error("Save error:", error);
            Swal.fire("Error!", "Failed to save courses. Please try again.", "error");
        } finally {
            stopLoading();
        }
    };
    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
            </div>
        );
    }
    const impNoticePopup = () => {
        const noticeHtml =
            "<div style='text-align:left; font-size:14px; line-height:1.6;'>" +
            "<p style='margin-bottom:12px;'><b>1. Full Time Courses:</b><br />" +
            "Last Date for Admission to Full Time Certificate, Diploma and Advance Diploma for August 2026 Session is 31st August, 2026. Hence last date for application for New Full Time Certificate, Diploma and Advance Diploma Course for 2026-27 is 31st May, 2026. No new applications for these types of courses shall be accepted for 2026-27. Application for 2026-27 shall be accepted from 1st September, 2026 onwards</p>" +
            "<p><b>2. Part Term Courses:</b><br />" +
            "Application for Part Time Short Term Courses shall be accepted throughout the year and shall be processed on quarterly basis.</p>" +
            "</div>";

        Swal.fire({
            title: 'Important Notice',
            html: noticeHtml,
            icon: 'info',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
            width: '42rem'
        });
    }

    const checkIsEligibleForApplication = async (selectedCourseId) => {
        if (!selectedCourseId || selectedCourseId < 0) return false;

        try {
            const response = await agent.get(`${IsCourseEligibleForApplication}?courseId=${selectedCourseId}`);

            return response?.data?.Data === true || response?.data?.Data === "true";
        } catch (error) {
            console.error("Error checking course eligibility:", error);
            return false;
        }
    };

    const handleColumnFilter = (columnKey, value) => {
        setColumnFilters(prev => {
            const current = prev[columnKey] || [];

            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];

            return {
                ...prev,
                [columnKey]: updated
            };
        });
    };

    const filteredCoursesData = useMemo(() => {
        return coursesData.filter(row => {

            // Global search
            const searchMatch =
                !globalSearch ||
                Object.values(row).some(value =>
                    String(value ?? "")
                        .toLowerCase()
                        .includes(globalSearch.toLowerCase())
                );

            // Column filters
            const columnMatch = Object.entries(columnFilters).every(
                ([key, selectedValues]) => {
                    if (!selectedValues?.length) return true;

                    const value = String(row[key] ?? "");
                    return selectedValues.includes(value);
                }
            );

            return searchMatch && columnMatch;
        });
    }, [coursesData, columnFilters, globalSearch]);

    const CustomCoursesTable = React.memo(() => {
        return (
            <div style={{ width: "100%" }}>

                {/* Global Search */}
                <div className="flex justify-end items-center mb-4">
                    <div className="relative flex items-center">
                        <FaSearch
                            size={14}
                            className="absolute left-3 text-gray-500"
                        />

                        <input
                            type="text"
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            placeholder="Search..."
                            autoFocus
                            className="w-64 h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <table className="w-full border-collapse border border-gray-200">
                    <thead>
                        <tr
                            className={color}
                            style={{
                                height: "60px"
                            }}
                        >
                            {tableColumns.map((column) => (
                                <th
                                    key={column.key}
                                    style={{
                                        width: column.width,
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 2,
                                        whiteSpace: "normal",
                                        wordBreak: "normal",
                                        overflowWrap: "break-word",
                                        textAlign: "center",
                                        verticalAlign: "right",
                                    }}
                                    className=" px-2 py-2 text-xs font-semibold text-white border-r border-blue-300 text-center"
                                >
                                    <div className="relative flex items-center justify-center w-full">
                                        <span className="text-center">{column.header}</span>

                                        {["sector", "courseType", "course"].includes(column.key) && (
                                            <button
                                                type="button"
                                                ref={(el) => {
                                                    filterButtonRefs.current[column.key] = el;
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.stopPropagation();
                                                    setOpenFilterColumn(column.key);
                                                }}
                                                className="filter-button absolute right-2 text-white hover:text-gray-300 cursor-pointer"
                                            >
                                                <FaSearch size={11} /
                                                >
                                            </button>
                                        )}

                                        {openFilterColumn === column.key &&
                                            filterPosition &&
                                            createPortal(
                                                <div
                                                    className="filter-popup bg-white text-gray-800 border border-gray-300 rounded-md shadow-lg"
                                                    style={{
                                                        position: "fixed",
                                                        top: `${filterPosition.top}px`,
                                                        left: `${filterPosition.left}px`,
                                                        width: `${filterPosition.width}px`,
                                                        maxHeight: "250px",
                                                        zIndex: 99999
                                                    }}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                >
                                                    {/* Search box */}
                                                    <div className="p-2 border-b bg-white">
                                                        <input
                                                            type="text"
                                                            placeholder={`Search ${column.header}...`}
                                                            className="w-full h-8 px-2 text-xs border border-gray-300 rounded"
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                        />
                                                    </div>

                                                    {/* Checkbox list */}
                                                    <div className="max-h-48 overflow-y-auto p-2">
                                                        {[...new Set(
                                                            coursesData.map(row =>
                                                                String(row[column.key] ?? "")
                                                            )
                                                        )]
                                                            .filter(value => value !== "")
                                                            .map(value => (
                                                                <label
                                                                    key={value}
                                                                    className="flex items-center gap-2 py-1 text-xs cursor-pointer"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            columnFilters[column.key]?.includes(value) || false
                                                                        }
                                                                        onChange={() =>
                                                                            handleColumnFilter(
                                                                                column.key,
                                                                                value
                                                                            )
                                                                        }
                                                                    />

                                                                    <span className="whitespace-normal break-words leading-4">
                                                                        {value}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                    </div>
                                                </div>,
                                                document.body
                                            )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredCoursesData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={tableColumns.length}
                                    className="border border-gray-200 text-center text-sm text-gray-500"
                                    style={{
                                        height: "90px",
                                        textAlign: "center",
                                        verticalAlign: "middle"
                                    }}
                                >
                                    No Data Found
                                </td>
                            </tr>
                        ) : (
                            [...filteredCoursesData, totalsRow].map((row, rowIndex) => (
                                <tr
                                    key={row.id}
                                    className={
                                        row.isTotalsRow
                                            ? "bg-[#d9e5f7] font-bold"
                                            : rowIndex % 2 === 0
                                                ? "bg-white"
                                                : "bg-[#eef3fc]"
                                    }
                                >
                                    {tableColumns.map((column) => (
                                        <td
                                            key={column.key}
                                            style={{
                                                width: column.width,
                                                boxSizing: "border-box",
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                                overflowWrap: "break-word"
                                            }}
                                            className="px-2 py-2 text-xs text-center border border-gray-200 align-middle"
                                        >
                                            {renderCell(row, column)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    });

    return (
        <div className="w-full p-4">

            {showCourseInfoPopup && (
                <CourseInformationPopup
                    courseInfo={courseInfo}
                    onClose={() => setShowCourseInfoPopup(false)}
                    selectedCourseName={selectedCourseName}
                    selectedCourseCode={selectedCourseCode}
                />
            )}
            <fieldset className='mb-4 rounded-md border p-4'>
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                    <span>Proposed Courses</span>
                </legend>

                <div className="pb-3 pt-3" style={{ maxWidth: "100%", overflow: "hidden" }}>
                    <div
                        className="pb-3 pt-0"
                        style={{
                            maxWidth: "100%",
                            maxHeight: "500px",
                            overflowY: "auto"
                        }}
                    >
                        <CustomCoursesTable />
                    </div>
                    {/* Secretary Verification Section - Only for UserType 81 */}
                    {showVerificationUI && (userInfo?.UserTypeID === 81 || userInfo?.UserTypeID === 81) && (
                        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                            <h3 className="text-md font-normal mb-3">Select Approved Reject Status <span className="text-red-500">*</span></h3>

                            <div className="flex gap-6 mb-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="V"
                                        checked={approvalStatus === 'V'}
                                        onChange={(e) => setApprovalStatus(e.target.value)}
                                        className="form-radio h-4 w-4 text-green-600"
                                    />
                                    <span className="ml-2 text-sm">Verified</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="R"
                                        checked={approvalStatus === 'R'}
                                        onChange={(e) => setApprovalStatus(e.target.value)}
                                        className="form-radio h-4 w-4 text-red-600"
                                    />
                                    <span className="ml-2 text-sm">Rejected</span>
                                </label>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-normal mb-2">
                                    Reason for Rejection/ Remark <span className="text-red-500">*</span>
                                    {approvalStatus === 'R'}
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm uppercase"
                                    rows="3"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value.toUpperCase())}
                                    placeholder="Enter remark..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Institute User Status Display */}
                    {!showVerificationUI && statusMessage.show && (
                        <div className="mt-4 mb-4 p-3 rounded-md border" style={{

                        }}>
                            <p className="font-normal" style={{ color: statusMessage.color === "red" ? "#dc2626" : "#059669" }}>
                                Verification Status: {statusMessage.status}
                            </p>
                            {statusMessage.remark && (
                                <p className="text-sm mt-1 text-green-700">
                                    Reason for Rejection/ Remark: {statusMessage.remark}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-center items-center gap-4 mt-3">
                        <Button variant='primary' onClick={handleBack}>Back</Button>
                        {!isEditingAllowed && userType !== 81 ? (
                            <Button variant='success' onClick={handleSaveNext}>Next</Button>
                        ) : (
                            <Button variant='success' onClick={handleSaveNext}>Save and Next</Button>
                        )}

                        <Button variant='danger' onClick={handleClose}>Close</Button>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default ProposedCourse;