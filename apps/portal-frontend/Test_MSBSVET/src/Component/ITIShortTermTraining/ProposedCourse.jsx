import { useEffect, useState, useContext } from "react";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import agent from "../../lib/api/agent";
import { SwalHelper } from "../../utils/swalHelper";
import { ThemeContext } from "../Context/ThemeContext";
import {
  GetShortTermApprovedCourseUnitDetails,
  GetShortTermProposedCourseUnitDetails,
  GetSTTCourseUnitDetailsForApprovalByCoureseID,
  SaveShortTermProposedCourseUnitDetails,
  DeleteShortTermProposedCourseUnitDetails,
  GetMasterSectorByITISTT,
  GetCourseType,
  GetMasterCourseByITISTT,
} from "../../Endpoints_All/Institute/shortTermCourse";

import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import { getDeviceIP } from "../../utils/CommonHelper";
import { FiEye, FiEdit } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

import DropdownComponent from "../formcomponent/DropdownComponent";
import FormComponent from "../formcomponent/FormComponent";
import { useAuth } from "../../Hooks/AuthContext";

const ProposedCourse = () => {
  const [tableData, setTableData] = useState([]);
  const [proposedCourses, setProposedCourses] = useState([]);

  const [sectorOptions, setSectorOptions] = useState([]);
  const [courseTypeOptions, setCourseTypeOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  const [sector, setSector] = useState("");
  const [courseType, setCourseType] = useState("");
  const [course, setCourse] = useState("");
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [approvedUnits, setApprovedUnits] = useState(0);
  const [proposedUnits, setProposedUnits] = useState(0);

  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [instituteID, setInstituteID] = useState(0);
  const { color } = useContext(ThemeContext);
  const [ipAddress, setIpAddress] = useState("");
  const { userInfo } = useAuth();

  useEffect(() => {
    initializePage();
    fetchIP();
  }, []);

  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);
      return ip;
    } catch (err) {
      console.error("Failed to get IP:", err);
      return "";
    }
  };

  const initializePage = async () => {
    try {
      setLoading(true);
      const ip = await fetchIP();
      const loginID = userInfo?.UserLoginID;
      const instituteResponse = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
      );
      const instituteID = instituteResponse.data.Data;
      setInstituteID(instituteID);

      await fetchApprovedCourses(instituteID, ip);
      await loadProposedCourses(instituteID);
      await loadSectors();
      await loadCourseTypes();
    } catch (error) {
      SwalHelper.error("Initialization Failed", error?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedCourses = async (instituteID, ipAddress) => {

    const payload = {
      InstituteId: instituteID,
      ExitInstituteID: 0,
      UserLoginID: userInfo?.UserLoginID,
      PageCode: "COURSE_LIST",
      ItemId: 0,
      IPAddress: ipAddress,
    };

    const response = await agent.post(
      GetShortTermApprovedCourseUnitDetails,
      payload,
    );

    const apiData = response?.data?.Data?.Table || [];

    const formattedData = apiData.map((item, index) => ({
      srNo: index + 1,
      sector: item.Sector,
      courseType: item.CourseType,
      course: item.CourseWithCourseCode,
      duration: item.Duration,
      approvedUnits: item.ApprovedUnits,
    }));

    setTableData(formattedData);
  };

  const loadProposedCourses = async (instId) => {
    const payload = {
      InstituteId: instId,
      ExitInstituteID: 0,
      UserLoginID: userInfo?.UserLoginID,
      PageCode: "COURSE_LIST",
      ItemId: 0,
      IPAddress: ipAddress,
    };

    const response = await agent.post(
      GetShortTermProposedCourseUnitDetails,
      payload,
    );

    const data = response?.data?.Data?.Table || [];
    const formatted = data.map((item, index) => ({
      srNo: index + 1,

      sectorId: item.SectorID,
      sector: item.Sector,

      courseTypeId: item.CourseTypeID,
      courseType: item.CourseType,

      courseId: item.CourseID,

      // FIX HERE
      course: item.CourseWithCourseCode || item.CourseName || item.Course,

      duration: item.Duration,
      approvedUnits: item.ApprovedUnits,
      proposedUnits: item.ProposedUnits,
      totalUnits: item.TotalUnits,
    }));

    setProposedCourses(formatted);
  };

  const handleEditCourse = async (row) => {
    try {
      setShowForm(true);
      setEditingCourseId(row.courseId);

      const sectorObj = sectorOptions.find((s) => s.label === row.sector);
      const courseTypeObj = courseTypeOptions.find(
        (c) => c.label === row.courseType,
      );

      const sectorId = sectorObj?.value;
      const courseTypeId = courseTypeObj?.value;

      setSector(sectorId);
      setCourseType(courseTypeId);

      await loadCourses(sectorId, courseTypeId);

      // setTimeout(() => {
      //   setCourse(row.courseId);
      // }, 200);
      setCourse(Number(row.courseId));
      setApprovedUnits(row.approvedUnits);
      setProposedUnits(row.proposedUnits);

      SwalHelper.toast("info", "Editing course");

    } catch (error) {
    }
  };

  const loadSectors = async () => {
    try {
      const response = await agent.get(`${GetMasterSectorByITISTT}?ITISTT=2`);

      const options = response?.data?.Data?.map((item) => ({
        value: item.Value,
        label: item.Text,
      }));

      setSectorOptions(options); // IMPORTANT
    } catch (error) {
    }
  };

  const loadCourseTypes = async () => {
    try {

      const response = await agent.get(GetCourseType);


      const options = response?.data?.Data?.map((item) => ({
        value: item.CourseTypeID,
        label: item.CourseType,
      }));


      setCourseTypeOptions(options);
    } catch (error) {
    }
  };
  const loadCourses = async (sectorId, courseTypeId) => {
    try {
      if (!sectorId || !courseTypeId) return;

      const response = await agent.get(
        `${GetMasterCourseByITISTT}?SectorID=${sectorId}&CourseTypeID=${courseTypeId}&ITISTT=2`,
      );
      const options = response?.data?.Data?.map((item) => ({
        value: Number(item.Value), // ⭐ FIX
        label: item.Text,
      }));

      setCourseOptions(options); // IMPORTANT
    } catch (error) {
    }
  };

  const loadApprovedUnits = async (courseId) => {
    try {


      const payload = {
        instituteId: instituteID,
        exitInstituteID: 0,
        userLoginID: userInfo?.UserLoginID,
        pageCode: "COURSE_LIST",
        itemId: courseId,
        ipAddress: ipAddress,
      };

      const response = await agent.post(
        GetSTTCourseUnitDetailsForApprovalByCoureseID,
        payload,
      );

      const units = response?.data?.Data?.ApprovedUnits || 0;
      setApprovedUnits(units);
    } catch (error) {
    }
  };

  const totalUnits = Number(approvedUnits) + Number(proposedUnits);

  const handleAddCourse = async () => {
    try {
      if (!sector || !courseType || !course || !proposedUnits) {
        return SwalHelper.warning(
          "Validation",
          "Please fill all required fields",
        );
      }

      SwalHelper.loading("Saving Course...", "Please wait");


      const selectedCourse = courseOptions.find((c) => c.value === course);

      const payload = {
        instituteId: instituteID,
        courseId: course,
        courseCode: selectedCourse?.label || "",
        course: selectedCourse?.label || "",
        proposedUnits: Number(proposedUnits),
        approvedUnits: Number(approvedUnits),
        totalUnits: Number(totalUnits),

        isEditAllowed: true,
        isDeleteAllowed: true,

        lastModifiedOn: new Date().toISOString(),

        userLoginID: userInfo?.UserLoginID,
        ipAddress: ipAddress,
        pageCode: "COURSE_LIST",

        requiredItems: "",
        perUnitNorms: "",
        requiredForProposedUnits: "",
        requiredForApprovedUnits: "",
        requiredForTotalUnits: "",
      };

      await agent.post(SaveShortTermProposedCourseUnitDetails, payload);

      SwalHelper.close();

      await SwalHelper.success("Success", "Course saved successfully");

      await loadProposedCourses(instituteID);

      resetForm();
    } catch (error) {
      SwalHelper.error(
        "Save Failed",
        error?.response?.data?.message || "Error saving course",
      );
    }
  };

  const handleDeleteCourse = async (row) => {
    try {
      const confirm = await SwalHelper.confirm({
        title: "Delete Course?",
        text: "This action cannot be undone",
        confirmText: "Yes, Delete",
        cancelText: "Cancel",
      });

      if (!confirm.isConfirmed) return;

      SwalHelper.loading("Deleting Course...");


      const courseName =
        row.course ||
        proposedCourses.find((c) => c.courseId === row.courseId)?.course ||
        "";

      const payload = {
        instituteId: instituteID,
        courseId: row.courseId,
        courseCode: courseName,
        course: courseName,
        proposedUnits: row.proposedUnits,
        approvedUnits: row.approvedUnits,
        totalUnits: row.totalUnits,
        isEditAllowed: true,
        isDeleteAllowed: true,
        lastModifiedOn: new Date().toISOString(),
        userLoginID: userInfo?.UserLoginID,
        ipAddress: ipAddress,
        pageCode: "COURSE_LIST",
        requiredItems: "",
        perUnitNorms: "",
        requiredForProposedUnits: "",
        requiredForApprovedUnits: "",
        requiredForTotalUnits: "",
      };

      await agent.delete(DeleteShortTermProposedCourseUnitDetails, {
        data: payload,
      });

      SwalHelper.close();

      SwalHelper.success("Deleted", "Course deleted successfully");

      await loadProposedCourses(instituteID);
    } catch (error) {
      SwalHelper.error(
        "Delete Failed",
        error?.response?.data?.message || "Error deleting course",
      );
    }
  };

  const resetForm = () => {
    setSector("");
    setCourseType("");
    setCourse("");
    setApprovedUnits(0);
    setProposedUnits(0);
    setEditingCourseId(null);
  };
  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
  };

  const approvedTotalUnits = tableData.reduce(
    (sum, c) => sum + Number(c.approvedUnits || 0),
    0,
  );

  const columns = [
    { header: "Sr.No.", key: "srNo", className: "text-center" },
    { header: "Sector", key: "sector" },
    { header: "Course Type", key: "courseType" },
    { header: "Course", key: "course" },
    { header: "Duration", key: "duration" },
    { header: "Approved Units", key: "approvedUnits" },
  ];

  const proposedColumns = [
    { header: "Sr.No.", key: "srNo" },
    { header: "Sector", key: "sector" },
    { header: "Course Type", key: "courseType" },
    { header: "Course", key: "course" },
    { header: "Duration", key: "duration" },
    { header: "Approved Units", key: "approvedUnits" },
    { header: "Proposed Units", key: "proposedUnits" },
    { header: "Total Units", key: "totalUnits" },
    { header: "Action", key: "actions" },
  ];

  const renderProposedCell = (row, column) => {
    if (column.key === "actions") {
      return (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleViewCourse(row)}
            className="text-blue-600 hover:text-blue-800 transition"
            title="View Course"
          >
            <FiEye size={20} />
          </button>

          <button
            onClick={() => handleEditCourse(row)}
            className="text-green-600 hover:text-green-800 transition"
            title="Edit Course"
          >
            <FiEdit size={20} />
          </button>

          <button
            onClick={() => handleDeleteCourse(row)}
            className="text-red-600 hover:text-red-800 transition"
            title="Delete Course"
          >
            <FaTrash size={20} />
          </button>
        </div>
      );
    }

    return row[column.key];
  };

  const renderProposedFooter = () => (
    <tr className="bg-green-100 font-bold">
      <td colSpan="5" className="text-right pr-4">
        Total
      </td>
      <td className="text-center">{proposedTotals.approvedUnits}</td>
      <td className="text-center">{proposedTotals.proposedUnits}</td>
      <td className="text-center">{proposedTotals.totalUnits}</td>
      <td></td>
    </tr>
  );

  const proposedTotals = {
    approvedUnits: proposedCourses.reduce(
      (sum, c) => sum + Number(c.approvedUnits || 0),
      0,
    ),
    proposedUnits: proposedCourses.reduce(
      (sum, c) => sum + Number(c.proposedUnits || 0),
      0,
    ),
    totalUnits: proposedCourses.reduce(
      (sum, c) => sum + Number(c.totalUnits || 0),
      0,
    ),
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <fieldset className="border border-gray-300 rounded p-4 bg-gray-50">
        <legend className={`${color} text-white px-4 py-1 rounded`}>
          Approved Course List
        </legend>

        <FilteredTableComponent
          data={tableData}
          columns={columns}
          customFooter={
            <tr className="bg-blue-100 font-bold">
              <td colSpan="5" className="text-right pr-4">
                Total
              </td>
              <td className="text-center text-blue-700">
                {approvedTotalUnits}
              </td>
            </tr>
          }
        />

        <button
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowForm(true)}
        >
          Add New Course
        </button>
      </fieldset>

      {showForm && (
        <fieldset className="bg-white p-6 shadow mt-6">
          <legend className={`${color} text-white px-4 py-1 rounded`}>
            Add Proposed Course
          </legend>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <DropdownComponent
              label="Sector"
              options={sectorOptions}
              value={sector}
              disabled={editingCourseId !== null}
              onChange={(val) => {
                setSector(val);
                loadCourses(val, courseType);
              }}
            />
            <DropdownComponent
              label="Course Type"
              options={courseTypeOptions}
              value={courseType}
              disabled={editingCourseId !== null}
              onChange={(val) => {
                setCourseType(val);
                loadCourses(sector, val);
              }}
            />

            <DropdownComponent
              label="Course"
              options={courseOptions}
              value={course}
              disabled={editingCourseId !== null}
              onChange={(val) => {
                setCourse(val);
                loadApprovedUnits(val);
              }}
            />

            <FormComponent
              label="Approved Units"
              value={approvedUnits}
              disabled
            />

            <FormComponent
              label="Proposed Units"
              value={proposedUnits}
              onChange={setProposedUnits}
            />

            <FormComponent label="Total Units" value={totalUnits} disabled />
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
              onClick={handleAddCourse}
            >
              {editingCourseId ? "Update Units" : "Add Course"}
            </button>

            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded"
              onClick={resetForm}
            >
              Reset
            </button>

            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Close
            </button>
          </div>
        </fieldset>
      )}

      <fieldset className="bg-white p-6 shadow mt-6">
        <legend className={`${color} text-white px-4 py-1 rounded`}>
          Proposed Courses
        </legend>

        <FilteredTableComponent
          data={proposedCourses}
          columns={proposedColumns}
          renderCell={renderProposedCell}
          customFooter={renderProposedFooter()}
        />
      </fieldset>

      {/* View Course Modal */}
      {showViewModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-blue-900 text-white p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">View Course Details</h2>

              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCourse(null);
                }}
                className="text-white hover:text-red-300 transition bg-red-600 rounded-full p-1"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-800">Sector</p>
                  <p className="text-gray-600">{selectedCourse.sector}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800">Course Type</p>
                  <p className="text-gray-600">{selectedCourse.courseType}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800">Course</p>
                  <p className="text-gray-600">{selectedCourse.course}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800">Duration</p>
                  <p className="text-gray-600">{selectedCourse.duration}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800">Approved Units</p>
                  <p className="text-gray-600">
                    {selectedCourse.approvedUnits}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800">Proposed Units</p>
                  <p className="text-gray-600">
                    {selectedCourse.proposedUnits}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800">Total Units</p>
                  <p className="text-gray-600">{selectedCourse.totalUnits}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposedCourse;
