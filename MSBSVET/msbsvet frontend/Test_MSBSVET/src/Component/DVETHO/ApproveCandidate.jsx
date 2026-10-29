import React, { useState, useContext, useEffect } from "react";
import { FileText } from "lucide-react";
import { ThemeContext } from "../Context/ThemeContext";
import DropdownComponent from "../formcomponent/DropdownComponent";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import Swal from "sweetalert2";
import agent from "../../lib/api/agent";
import { GetAdmissionYear } from "../../Endpoints_All/Institute/institute";
import { GetCourseByCollogeID } from "../../Endpoints_All/Base/masterData";
import { useNavigate } from "react-router-dom";
import Loader from "../formcomponent/Loader";
import { getDeviceIP } from "../../utils/CommonHelper";
import { useAuth } from "../../Hooks/AuthContext";
import Button from "../base/Button";

const ApproveCandidate = () => {
    const { color } = useContext(ThemeContext);
    const navigate = useNavigate();

    const [showResults, setShowResults] = useState(false);
    // const { state } = useLocation();
    const [institutes, setInstitutes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [admissionYears, setAdmissionYears] = useState([]);
    const [candidateData, setCandidateData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [masterLoading, setMasterLoading] = useState(true);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");

    const [selectedInstitute, setSelectedInstitute] = useState("1");
    const [selectedCourse, setSelectedCourse] = useState("1");
    const [selectedAdmissionYear, setSelectedAdmissionYear] = useState("0");
    const [rejectReasons, setRejectReasons] = useState({});

    const { userInfo } = useAuth();
    const user = userInfo;

    const tableColumns = [
        {
            key: "serialNumber",
            header: "Sr. No.",
            width: "80px",
        },
        {
            key: "ApplicationIDDisplay",
            header: "Application No.",
        },
        {
            key: "CandidateName",
            header: "Candidate Name",
        },
        {
            key: "CourseName",
            header: "Course Name",
        },
        {
            key: "YearDisplayName",
            header: "Admission Year",
        },
        {
            key: "ViewSlip",
            header: "View Slip",
        },
        {
            key: "RejectReason",
            header: "Reason",
        },
        {
            key: "Approve",
            header: "Approve",
        },
        {
            key: "Reject",
            header: "Reject",
        }
    ];

    useEffect(() => {
        fetchIP();
    })


    useEffect(() => {
        if (!user) return;

        loadMasters();
    }, [user]);


    useEffect(() => {

        if (
            !selectedInstitute ||
            selectedInstitute === "1"
        ) {
            setCourses([
                {
                    value: "1",
                    label: "ALL"
                }
            ]);
            return;
        }

        loadCourses();

    }, [selectedInstitute]);

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
    };

    const renderCell = (item, column) => {

        if (column.key === "ViewSlip") {
            return (
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded whitespace-nowrap min-w-[160px]"
                    onClick={() =>
                        navigate("/Admission/confirm-admission-details", {
                            state: {
                                P1: item.ApplicationID,
                                C1: item.CourseID,
                                C2: item.CollegeID,
                                R1: item.RoundID
                            }
                        })
                    }
                >
                    View and Approve
                </button>
            );
        }

        if (column.key === "RejectReason") {
            return (
                <textarea
                    rows={2}
                    className="border rounded p-1 w-full"
                    value={
                        rejectReasons[item.ApplicationID] || ""
                    }
                    onChange={(e) =>
                        setRejectReasons(prev => ({
                            ...prev,
                            [item.ApplicationID]: e.target.value
                        }))
                    }
                />
            );
        }

        if (column.key === "Approve") {
            return (
                <button
                    className="px-4 py-1 bg-green-600 text-white rounded"
                    onClick={() => handleApprove(item)}
                >
                    Approve
                </button>
            );
        }

        if (column.key === "Reject") {
            return (
                <button
                    className="px-4 py-1 bg-red-600 text-white rounded"
                    onClick={() => handleReject(item)}
                >
                    Reject
                </button>
            );
        }

        return item[column.key];
    };

    const handleApprove = async (item) => {
        const result = await Swal.fire({
            title: "Confirm Approval",
            text: "Are you sure you want to approve this candidate?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Approve",
            cancelButtonText: "No"
        });

        if (!result.isConfirmed) {
            return;
        }
        try {

            const reason =
                rejectReasons[item.ApplicationID] || "";

            let xmlDoc = `
        <SelectedCandidates>
            <Candidate>
                <ApplicationID>${item.ApplicationID}</ApplicationID>
                <CourseID>${item.CourseID}</CourseID>
                <CollegeID>${item.CollegeID}</CollegeID>
                <RejectReason>${reason}</RejectReason>
                <ARFlag>A</ARFlag>
            </Candidate>
        </SelectedCandidates>`;

            const response = await agent.post(
                "/api/Admission/save-candidate-devto-approval",
                {
                    UserLoginID: user.UserLoginID,
                    IPAddress: ipAddress,
                    XmlDoc: xmlDoc
                }
            );

            if (response.data?.message === "Y") {

                Swal.fire(
                    "Success",
                    "Candidate Approved Successfully",
                    "success"
                );

                handleSearch();
            }
            else {
                Swal.fire(
                    "Error",
                    response.data?.message || "Approval Failed",
                    "error"
                );
            }

        } catch (error) {

            Swal.fire(
                "Error",
                "Approval Failed",
                "error"
            );
        }
    };
    const handleReject = async (item) => {

        const reason = rejectReasons[item.ApplicationID];

        if (!reason) {
            Swal.fire(
                "Warning",
                "Enter rejection reason",
                "warning"
            );
            return;
        }

        const result = await Swal.fire({
            title: "Confirm Rejection",
            text: "Are you sure you want to reject this candidate?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Reject",
            cancelButtonText: "No"
        });

        if (!result.isConfirmed) {
            return;
        }

        try {

            let xmlDoc = `
        <SelectedCandidates>
            <Candidate>
                <ApplicationID>${item.ApplicationID}</ApplicationID>
                <CourseID>${item.CourseID}</CourseID>
                <CollegeID>${item.CollegeID}</CollegeID>
                <RejectReason>${reason}</RejectReason>
                <ARFlag>R</ARFlag>
            </Candidate>
        </SelectedCandidates>`;

            const response = await agent.post(
                "/api/Admission/save-candidate-devto-approval",
                {
                    UserLoginID: user.UserLoginID,
                    IPAddress: ipAddress,
                    XmlDoc: xmlDoc
                }
            );

            if (response.data?.message === "Y") {

                Swal.fire(
                    "Success",
                    "Candidate Rejected Successfully",
                    "success"
                );

                handleSearch();
            }
            else {
                Swal.fire(
                    "Error",
                    response.data?.message || "Rejection Failed",
                    "error"
                );
            }

        } catch (error) {

            Swal.fire(
                "Error",
                "Rejection Failed",
                "error"
            );
        }
    };
    const handleBulkApprove = async () => {

        if (selectedRows.length === 0) {
            Swal.fire(
                "Warning",
                "Please select at least one candidate",
                "warning"
            );
            return;
        }

        const result = await Swal.fire({
            title: "Confirm Approval",
            text: `Are you sure you want to approve ${selectedRows.length} selected candidate?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Approve",
            cancelButtonText: "No"
        });

        if (!result.isConfirmed) return;

        try {

            let xmlDoc = "<SelectedCandidates>";

            selectedRows.forEach(item => {

                const reason =
                    rejectReasons[item.ApplicationID] || "";

                xmlDoc += `
                <Candidate>
                    <ApplicationID>${item.ApplicationID}</ApplicationID>
                    <CourseID>${item.CourseID}</CourseID>
                    <CollegeID>${item.CollegeID}</CollegeID>
                    <RejectReason>${reason}</RejectReason>
                    <ARFlag>A</ARFlag>
                </Candidate>`;
            });

            xmlDoc += "</SelectedCandidates>";

            const response = await agent.post(
                "/api/Admission/save-candidate-devto-approval",
                {
                    UserLoginID: user.UserLoginID,
                    IPAddress: ipAddress,
                    XmlDoc: xmlDoc
                }
            );

            if (response.data?.message === "Y") {

                Swal.fire(
                    "Success",
                    "Selected Candidate Approved Successfully",
                    "success"
                );

                handleSearch();
            }
            else {
                Swal.fire(
                    "Error",
                    response.data?.message || "Approval Failed",
                    "error"
                );
            }

        } catch (error) {

            Swal.fire(
                "Error",
                "Approval Failed",
                "error"
            );
        }
    };
    const handleBulkReject = async () => {

        if (selectedRows.length === 0) {
            Swal.fire(
                "Warning",
                "Please select at least one candidate",
                "warning"
            );
            return;
        }

        for (const item of selectedRows) {

            const reason =
                rejectReasons[item.ApplicationID];

            if (!reason || reason.trim() === "") {

                Swal.fire(
                    "Warning",
                    `Please enter rejection reason for Application No. ${item.ApplicationIDDisplay}`,
                    "warning"
                );

                return;
            }
        }

        const result = await Swal.fire({
            title: "Confirm Rejection",
            text: `Are you sure you want to reject ${selectedRows.length} selected candidate?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Reject",
            cancelButtonText: "No"
        });

        if (!result.isConfirmed) return;

        try {

            let xmlDoc = "<SelectedCandidates>";

            selectedRows.forEach(item => {

                xmlDoc += `
                <Candidate>
                    <ApplicationID>${item.ApplicationID}</ApplicationID>
                    <CourseID>${item.CourseID}</CourseID>
                    <CollegeID>${item.CollegeID}</CollegeID>
                    <RejectReason>${rejectReasons[item.ApplicationID]}</RejectReason>
                    <ARFlag>R</ARFlag>
                </Candidate>`;
            });

            xmlDoc += "</SelectedCandidates>";

            const response = await agent.post(
                "/api/Admission/save-candidate-devto-approval",
                {
                    UserLoginID: user.UserLoginID,
                    IPAddress: ipAddress,
                    XmlDoc: xmlDoc
                }
            );

            if (response.data?.message === "Y") {

                Swal.fire(
                    "Success",
                    "Selected Candidate Rejected Successfully",
                    "success"
                );

                handleSearch();
            }
            else {
                Swal.fire(
                    "Error",
                    response.data?.message || "Rejection Failed",
                    "error"
                );
            }

        } catch (error) {

            Swal.fire(
                "Error",
                "Rejection Failed",
                "error"
            );
        }
    };


    const loadCourses = async () => {
        try {

            setMasterLoading(true);
            const response = await agent.get(
                "/Base/GetCourseByCollogeID",
                {
                    params: {
                        CollegeID: selectedInstitute
                    }
                }
            );

            const courseData =
                response.data?.Data || [];

            if (courseData.length === 0) {
                setCourses([
                    {
                        value: "1",
                        label: "ALL"
                    }
                ]);
                return;
            }

            setCourses([
                {
                    value: "1",
                    label: "ALL"
                },
                ...courseData.map(item => ({
                    value: item.CourseID.toString(),
                    label: item.CourseName
                }))
            ]);
        }
        catch (error) {
        } finally {
            setMasterLoading(false);
        }
    };
    const loadMasters = async () => {
        try {


            // Admission Session
            const yearResponse = await agent.get(
                GetAdmissionYear
            );

            const years =
                yearResponse.data?.Data ||
                yearResponse.data ||
                [];

            setAdmissionYears([
                {
                    value: "0",
                    label: "ALL"
                },
                ...years.map(item => ({
                    value: item.YearId.toString(),
                    label: item.YearDisplayName
                }))
            ]);

            // Institute
            let instituteData = [];

            if (user.UserTypeID === 13) {
                // Region User

                // const instituteResponse = await agent.get(
                //     "/Base/GetRegionInstitute",
                //     {
                //         params: {
                //             RegionID: user.RegionID
                //         }
                //     }
                // );

                instituteData =
                    instituteResponse.data?.Data ||
                    instituteResponse.data ||
                    [];
            }
            else if (user.UserTypeID === 14) {
                // District User

                const districtResponse = await agent.get(
                    "/Base/GetDistrictIDByDistrictUser",
                    {
                        params: {
                            UserLoginID: user.UserLoginID
                        }
                    }
                );


                const districtId =
                    districtResponse.data?.Data;

                const masterInstituteResponse =
                    await agent.get(
                        "/Base/GetMasterInstitute"
                    );

                const masterInstituteData =
                    masterInstituteResponse.data?.Data ||
                    masterInstituteResponse.data ||
                    [];

                instituteData =
                    masterInstituteData.filter(
                        item =>
                            item.Group?.toString() ===
                            districtId?.toString()
                    );
            }

            setInstitutes([
                {
                    value: "1",
                    label: "ALL"
                },
                ...instituteData.map(item => ({
                    value: (
                        item.CollegeID ||
                        item.Value
                    ).toString(),
                    label:
                        item.CollegeName ||
                        item.Text
                }))
            ]);

        } catch (error) {


            Swal.fire(
                "Error",
                "Failed to load dropdown data",
                "error"
            );
        } finally {
            setMasterLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedInstitute("1");
        setSelectedCourse("1");
        setSelectedAdmissionYear("0");
        setCandidateData([]);
        setSelectedRows([]);
        setRejectReasons({});
        setShowResults(false);
    };
    const handleSearch = async () => {
        try {

            let regionId = 0;

            if (user.UserTypeID === 14) {

                const districtResponse = await agent.get(
                    "/Base/GetDistrictIDByDistrictUser",
                    {
                        params: {
                            UserLoginID: user.UserLoginID
                        }
                    }
                );

                regionId = districtResponse.data?.Data;
            }

            const response = await agent.get(
                "/api/Admission/pending-candidates-devto-approval",
                {
                    params: {
                        courseID: Number(selectedCourse),
                        collegeID: Number(selectedInstitute),
                        admissionYearID: Number(selectedAdmissionYear),
                        regionID: Number(regionId),
                        userTypeID: Number(user.UserTypeID)
                    }
                }
            );


            const data =
                response.data?.Data ||
                response.data ||
                [];

            const transformedData = data.map((item, index) => ({
                ...item,
                serialNumber: index + 1
            }));

            setCandidateData(transformedData);

            if (transformedData.length > 0) {
                setShowResults(true);
            } else {
                setShowResults(false);

                Swal.fire({
                    icon: "info",
                    title: "No Data Found",
                    text: "No candidate found for selected criteria."
                });
            }

        } catch (error) {


            Swal.fire(
                "Error",
                "Failed to fetch candidate list",
                "error"
            );
        }
    };

    return (
      <>
        {masterLoading && <Loader />}
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                {/* Search Section */}
                <fieldset className="rounded-md border border-gray-300 p-4 bg-white mb-6">
                  <legend
                    className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color}`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    DVETO Approval Status
                  </legend>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DropdownComponent
                      label="Institute Name"
                      value={selectedInstitute}
                      onChange={(value) => setSelectedInstitute(value)}
                      options={institutes}
                    />

                    <DropdownComponent
                      label="Course Name"
                      value={selectedCourse}
                      onChange={(value) => setSelectedCourse(value)}
                      options={courses}
                    />

                    <DropdownComponent
                      label="Admission Session"
                      value={selectedAdmissionYear}
                      onChange={(value) => setSelectedAdmissionYear(value)}
                      options={admissionYears}
                    />
                  </div>

                  <div className="flex justify-center gap-4 mt-6">
                    <Button variant="primary" onClick={handleSearch}>
                      Search
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={handleReset}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Reset
                    </Button>
                  </div>
                </fieldset>

                {!showResults && (
                  <div className="text-center py-12 border rounded-lg bg-white">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">
                      Click Search to view candidates pending for approval
                    </p>
                  </div>
                )}

                {showResults && (
                  <>
                    <fieldset className="rounded-md border border-gray-300 p-4 bg-white">
                      <legend
                        className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color}`}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Candidate List Pending For DVETO Approval
                      </legend>

                      <FilteredTableComponent
                        data={candidateData}
                        columns={tableColumns}
                        renderCell={renderCell}
                        showCheckbox={true}
                        onSelectionChange={(rows) => setSelectedRows(rows)}
                        searchable={true}
                        sortable={true}
                        exportable={true}
                        showExcel={true}
                        showPDF={false}
                        maxHeight="600px"
                      />
                    </fieldset>

                    <div className="text-center mt-6 space-x-4">
                      <button
                        onClick={handleBulkApprove}
                        className="px-6 py-2 bg-green-600 text-white rounded-md"
                      >
                        Approve Selected
                      </button>

                      <button
                        onClick={handleBulkReject}
                        className="px-6 py-2 bg-red-600 text-white rounded-md"
                      >
                        Reject Selected
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
};

export default ApproveCandidate;




