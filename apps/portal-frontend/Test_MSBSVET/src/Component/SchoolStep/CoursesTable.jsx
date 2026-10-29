import React, {
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useEffect } from "react";
import agent from "../../lib/api/agent";
import { GetShortTermSchoolStepCourseUnitDetails } from "../../Endpoints_All/SchoolStep/CourseAndRegister";
import { getDeviceIP } from "../../utils/CommonHelper";
import { FiEye, FiPlus } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import { SwalHelper } from "../../utils/swalHelper";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import {
  SendSchoolForVerification,
  WithdrawVerificationRequest,
} from "../../Endpoints_All/SchoolStep/school";
import { useAuth } from "../../Hooks/AuthContext";
const CoursesTable = forwardRef(
  (
    {
      onDeleteCourse,
      onViewCourse,
      onAddClick,
      onStatusChange,
      onClose,
      onSave,
      initialCourses = [],
      fieldsDisabled = false,
      mouStatus = "draft",
      schoolId,
    },
    ref,
  ) => {
    const [showViewModal, setShowViewModal] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(mouStatus);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [instituteID, setInstituteID] = useState(null);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");
    const { userInfo } = useAuth();
    const [courses, setCourses] = useState(
      initialCourses.length > 0
        ? initialCourses
        : [
          {
            id: 1,
            sno: 1,
            sector: "",
            courseType: "",
            course: "",
            duration: "",
            IsDeleteAllowed: true,
          },
        ],
    );

    const [masterCourses, setMasterCourses] = useState([]);

    useEffect(() => {
      setCurrentStatus(mouStatus);
    }, [mouStatus]);
    useEffect(() => {
      const initialize = async () => {
        try {

          const loginID = userInfo?.UserLoginID;
          if (!loginID) return;

          // Step 1: Get Institute ID
          const instituteResponse = await agent.get(
            `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
          );

          if (
            instituteResponse.data?.Status === "Success" &&
            instituteResponse.data?.Data
          ) {
            const instID = instituteResponse.data.Data;
            setInstituteID(instID);

            // Step 2: Fetch Courses immediately
            await fetchMasterCourses(instID);
          }
        } catch (error) {
          console.error("Initialization error:", error);
        }
      };

      initialize();
    }, []);

    useEffect(() => {
      fetchIP();

    }, []);

    const fetchIP = async () => {
      try {
        const ip = await getDeviceIP();
        setIpAddress(ip);
      } catch (err) {
        console.error("Failed to get IP:", err);
      }
    };

    const fetchMasterCourses = async (instID) => {
      try {


        const payload = {
          InstituteId: instID,
          ExitInstituteID: 0,
          UserLoginID: userInfo?.UserLoginID || "0",
          PageCode: "COURSE_LIST",
          ItemId: 0,
          IPAddress: ipAddress || "",
        };

        const response = await agent.post(
          GetShortTermSchoolStepCourseUnitDetails,
          payload,
        );

        const apiData = response?.data?.Data?.Table || [];

        const formattedCourses = apiData.map((item) => ({
          id: item.CourseID,
          name: item.CourseWithCourseCode,
          sector: item.Sector,
          courseType: item.CourseType,
          duration: item.Duration,
        }));

        setMasterCourses(formattedCourses);
      } catch (error) {
        console.error("Error fetching master courses:", error);
      }
    };
    // Expose courses data to parent component
    useImperativeHandle(ref, () => ({
      getCourses: () => courses,
    }));

    const handleViewCourse = useCallback(
      (course) => {
        setSelectedCourse(course);
        setShowViewModal(true);
        if (onViewCourse) onViewCourse(course);
      },
      [onViewCourse],
    );

    const handleDeleteCourse = useCallback(
      async (course) => {
        if (!course.IsDeleteAllowed) {
          SwalHelper.warning(
            "Cannot Delete",
            "This course record cannot be deleted.",
          );
          return;
        }

        if (courses.length === 1) {
          SwalHelper.warning(
            "Cannot Delete",
            "At least one course row is required.",
          );
          return;
        }

        const confirmed = await SwalHelper.confirm({
          title: "Are you sure?",
          text: `You are about to delete Course #${course.sno}. This action cannot be undone!`,
          confirmText: "Yes, delete it!",
        });

        if (!confirmed) return;

        setCourses((prev) => {
          const filtered = prev.filter((c) => c.id !== course.id);
          return filtered.map((c, index) => ({ ...c, sno: index + 1 }));
        });
        if (onDeleteCourse) onDeleteCourse(course);
      },
      [courses.length, onDeleteCourse],
    );

    const handleAddCourseClick = useCallback(() => {
      const newCourseRow = {
        id: Date.now(),
        sno: courses.length + 1,
        course: "",
        sector: "",
        courseType: "",
        duration: "",
        IsDeleteAllowed: true,
      };

      setCourses((prev) => [...prev, newCourseRow]);

      if (onAddClick) onAddClick();
    }, [courses.length, onAddClick]);

    const handleCourseChange = (id, field, value) => {
      if (field === "course") {
        const selectedMasterCourse = masterCourses.find(
          (c) => c.id === parseInt(value),
        );

        if (selectedMasterCourse) {
          setCourses((prev) =>
            prev.map((course) =>
              course.id === id
                ? {
                  ...course,
                  course: selectedMasterCourse.id, // store ID
                  courseName: selectedMasterCourse.name, // optional for display
                  sector: selectedMasterCourse.sector,
                  courseType: selectedMasterCourse.courseType,
                  duration: selectedMasterCourse.duration,
                }
                : course,
            ),
          );
        }
      }
    };

    const handleSendForVerification = async () => {
      if (!instituteID) {
        SwalHelper.error("Error", "Institute ID not loaded yet.");
        return;
      }

      const invalidCourses = courses.filter((c) => !c.course);
      if (invalidCourses.length > 0) {
        SwalHelper.warning(
          "Validation Error",
          "Please select a course for all rows.",
        );
        return;
      }

      const confirmed = await SwalHelper.confirm({
        title: "Send for Verification?",
        confirmText: "Yes",
      });

      if (!confirmed) return;

      try {
        await agent.post(SendSchoolForVerification, null, {
          params: {
            schoolId: schoolId,
            modifiedBy: instituteID,
          },
        });

        setCurrentStatus("pending_verification");

        if (onStatusChange) onStatusChange("pending_verification");

        SwalHelper.success("Success", "School sent for verification.");
      } catch (error) {
        console.error(error);
        SwalHelper.error("Error", "Failed to send for verification");
      }
    };
    const handleWithdrawVerification = async () => {
      const confirmed = await SwalHelper.confirm({
        title: "Withdraw Verification Request?",
        confirmText: "Yes",
      });

      if (!confirmed) return;

      try {
        await agent.post(WithdrawVerificationRequest, null, {
          params: {
            schoolId: schoolId,
            modifiedBy: instituteID,
          },
        });

        // ✅ UPDATE LOCAL STATE
        setCurrentStatus("initiated");
        // ✅ Inform parent
        if (onStatusChange) onStatusChange("draft");

        SwalHelper.success("Success", "Verification request withdrawn.");
      } catch {
        SwalHelper.error("Error", "Failed to withdraw");
      }
    };

    const handleEditInformation = async () => {
      const confirmed = await SwalHelper.confirm({
        title: "Edit Information",
        text: "Are you sure you want to edit information? This will reset verification status.",
        confirmText: "Yes, edit it!",
      });

      if (!confirmed) return;

      // DO NOT CALL WITHDRAW API

      // Just unlock form and change status locally
      setCurrentStatus("draft");

      if (onStatusChange) onStatusChange("draft");

      SwalHelper.success(
        "Edit Mode Enabled",
        "You can now modify school information. Save to reset verification.",
      );
    };

    const handleClose = () => {
      if (onClose) {
        onClose();
      }
    };

    const handleSave = () => {
      const invalidCourses = courses.filter((c) => !c.course);

      if (invalidCourses.length > 0) {
        SwalHelper.warning(
          "Validation Error",
          "Please select a course for all rows before saving.",
        );
        return;
      }

      if (onSave) {
        onSave(courses); // Parent will handle API + success message
      }
    };

    const columns = useMemo(
      () => [
        {
          key: "actions",
          header: (
            <button
              type="button"
              onClick={handleAddCourseClick}
              disabled={fieldsDisabled || currentStatus !== "draft"}
              className={`w-7 h-7 flex items-center justify-center mx-auto
                        ${fieldsDisabled || currentStatus !== "draft"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all"
                }`}
              title="Add New Course"
            >
              <FiPlus size={16} />
            </button>
          ),
          headerClassName: "text-center bg-gray-100",
          className: "text-center",
          sortable: false,
          width: "80px",
        },
        {
          key: "sno",
          header: "S.N.",
          width: "60px",
          className: "text-center font-medium",
          sortable: true,
          headerClassName: "text-center bg-gray-100",
        },
        {
          key: "course",
          header: "Course",
          width: "250px",
          sortable: true,
          headerClassName: "text-center bg-gray-100",
        },
        {
          key: "sector",
          header: "Sector",
          width: "150px",
          className: "text-center",
          sortable: true,
          headerClassName: "text-center bg-gray-100",
        },
        {
          key: "courseType",
          header: "Course Type",
          width: "150px",
          className: "text-center",
          sortable: true,
          headerClassName: "text-center bg-gray-100",
        },
        {
          key: "duration",
          header: "Duration",
          width: "120px",
          className: "text-center",
          sortable: true,
          headerClassName: "text-center bg-gray-100",
        },
      ],
      [fieldsDisabled, currentStatus, handleAddCourseClick],
    );

    const filterColumns = useMemo(() => ["sector", "courseType", "course"], []);

    const renderCourseCell = useCallback(
      (row, column) => {
        if (column.key === "actions") {
          const isDisabled = currentStatus !== "draft";
          return (
            <div className="flex justify-center items-center gap-1.5">
              <button
                onClick={() => handleViewCourse(row)}
                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                title="View Course Details"
              >
                <FiEye size={18} />
              </button>
              <button
                onClick={() => handleDeleteCourse(row)}
                className={`p-1 rounded ${row.IsDeleteAllowed && !isDisabled
                    ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                    : "text-gray-400 cursor-not-allowed"
                  }`}
                title={
                  row.IsDeleteAllowed && !isDisabled
                    ? "Delete Course"
                    : "Deletion not allowed"
                }
                disabled={!row.IsDeleteAllowed || isDisabled}
              >
                <FaTrash size={16} />
              </button>
            </div>
          );
        }

        if (column.key === "course") {
          // Get all selected course IDs
          const selectedCourseIds = courses
            .map((c) => c.course)
            .filter((c) => c);

          return (
            <select
              value={row.course}
              onChange={(e) =>
                handleCourseChange(row.id, "course", e.target.value)
              }
              disabled={currentStatus !== "draft"}
              className={`w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${currentStatus !== "draft"
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
                }`}
            >
              <option value="">Select Course</option>

              {masterCourses.map((courseOption) => {
                const isAlreadySelected =
                  selectedCourseIds.includes(courseOption.id) &&
                  row.course !== courseOption.id;

                return (
                  <option
                    key={courseOption.id}
                    value={courseOption.id}
                    disabled={isAlreadySelected}
                  >
                    {courseOption.name}
                  </option>
                );
              })}
            </select>
          );
        }

        return row[column.key] || "";
      },
      [
        handleViewCourse,
        handleDeleteCourse,
        handleCourseChange,
        currentStatus,
        masterCourses,
        courses,
      ],
    );

    const blueNote = (
      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
        <p className="text-sm">
          <span className="font-semibold">Note:</span> The MoU should mention
          all the courses as mentioned in the above table
        </p>
      </div>
    );

    const renderStatusNote = () => {
      switch (currentStatus) {
        case "draft":
          return (
            <div className="mt-4 border border-blue-300">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-4 bg-blue-50">
                      <p className="font-semibold text-blue-700 mb-2">Note:</p>
                      <ol className="list-decimal pl-5 text-blue-700 space-y-1 text-sm">
                        <li>
                          Click on "Send for Verification" to submit School for
                          Board Verification.
                        </li>
                        <li>
                          Once submitted for verification, the information on
                          this page shall be locked.
                        </li>
                        <li>
                          School information shall be forwarded to Secretary,
                          Maharashtra State Board of Skill, Vocational Education
                          and Training for verification.
                        </li>
                        <li>
                          Institute can withdraw verification request and edit
                          information.
                        </li>
                        <li>
                          Institute cannot withdraw verification request after
                          Board has verified the school information
                        </li>
                        <li>
                          Once verified, Institute shall be able to create
                          batches and start training.
                        </li>
                        <li>
                          Institute may contact Board Helpline for any
                          assistance.
                        </li>
                      </ol>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );

        case "pending_verification":
          return (
            <div className="mt-4 border border-blue-300">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-4 bg-blue-50">
                      <p className="font-semibold text-blue-700 mb-2">Note:</p>
                      <ol className="list-decimal pl-5 text-blue-700 space-y-1 text-sm">
                        <li>Request for Verification is submitted.</li>
                        <li>
                          Request has been forwarded to Secretary, Maharashtra
                          State Board of Skill, Vocational Education and
                          Training for verification.
                        </li>
                        <li>
                          Institute can withdraw verification request and edit
                          information.
                        </li>
                        <li>
                          Institute cannot withdraw verification request after
                          Board has verified the school information.
                        </li>
                        <li>
                          Once verified, Institute shall be able to create
                          batches and start training.
                        </li>
                        <li>
                          Institute may contact Board Helpline for any
                          assistance.
                        </li>
                      </ol>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );

        case "verified":
          return (
            <div className="mt-4 border border-gray-300">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-4 bg-blue-50">
                      <p className="font-semibold text-blue-700 mb-2">Note:</p>
                      <ol className="list-decimal pl-5 text-blue-700 space-y-1 text-sm">
                        <li>Board has verified school information.</li>
                        <li>
                          To update information, click on "Edit Information".
                          The verification by Board shall be reset.
                        </li>
                        <li>
                          After editing information, the Institute is required
                          to resubmit request for verification.
                        </li>
                        <li>
                          Institute may contact Board Helpline for any
                          assistance.
                        </li>
                      </ol>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );

        default:
          return null;
      }
    };

    const renderActionButtons = () => {
      switch (currentStatus) {
        case "draft":
          return (
            <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-8 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors min-w-[120px]"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors min-w-[120px]"
              >
                Save
              </button>
              <button
                onClick={handleSendForVerification}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors min-w-[150px]"
              >
                Send for Verification
              </button>
            </div>
          );

        case "pending_verification":
          return (
            <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-8 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors min-w-[120px]"
              >
                Close
              </button>
              <button
                onClick={handleWithdrawVerification}
                className="px-8 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors min-w-[180px]"
              >
                Withdraw Verification Request
              </button>
            </div>
          );

        case "verified":
          return (
            <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-8 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors min-w-[120px]"
              >
                Close
              </button>
              <button
                onClick={handleEditInformation}
                className="px-8 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors min-w-[150px]"
              >
                Edit Information
              </button>
            </div>
          );

        case "active":
        case "expired":
        default:
          return (
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-8 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors min-w-[120px]"
              >
                Close
              </button>
            </div>
          );
      }
    };

    const closeModal = useCallback(() => {
      setShowViewModal(false);
      setSelectedCourse(null);
    }, []);

    return (
      <>
        <style>{`
                .courses-table-container .filtered-table-component .mb-4.flex {
                    justify-content: flex-end !important;
                }
            `}</style>
        <div className="courses-table-container">
          <FilteredTableComponent
            data={courses}
            columns={columns}
            filterColumns={filterColumns}
            searchable={false}
            sortable={true}
            exportable={false}
            showExcel={false}
            showPDF={false}
            showSearch={false}
            maxHeight="500px"
            stickyHeader={true}
            emptyStateMessage=""
            emptyStateSubMessage=""
            tableId="courses-table"
            renderCell={renderCourseCell}
          />

          {blueNote}
          {renderStatusNote()}
          {renderActionButtons()}
        </div>

        {/* View Course Modal */}
        {showViewModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
                <h2 className="text-xl font-semibold">Course Details</h2>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium w-1/3">
                        S.N.:
                      </td>
                      <td className="py-3 text-gray-900 font-semibold">
                        {selectedCourse.sno}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium">
                        Course:
                      </td>
                      <td className="py-3 text-gray-900">
                        {selectedCourse.course || "Not selected"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium">
                        Sector:
                      </td>
                      <td className="py-3 text-gray-900">
                        {selectedCourse.sector || "N/A"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium">
                        Course Type:
                      </td>
                      <td className="py-3 text-gray-900">
                        {selectedCourse.courseType || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-600 font-medium">
                        Duration:
                      </td>
                      <td className="py-3 text-gray-900">
                        {selectedCourse.duration || "N/A"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  },
);
CoursesTable.displayName = "CoursesTable";

export default CoursesTable;
