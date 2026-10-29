import { useEffect, useState } from "react";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import agent from "../../lib/api/agent";
import { GetShortTermSchoolStepCourseUnitDetails } from "../../Endpoints_All/SchoolStep/CourseAndRegister";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import { getDeviceIP } from "../../utils/CommonHelper";
import { useAuth } from "../../Hooks/AuthContext";

const ApprovedCourseList = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState("0.0.0.0");
  const { userInfo } = useAuth();

  useEffect(() => {
    initializePage();
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

  const initializePage = async () => {
    try {
      setLoading(true);


      const loginID = userInfo?.UserLoginID;
      if (!loginID) return;

      // ✅ Step 1: Get Institute ID from Login Code
      const instituteResponse = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
      );

      if (
        instituteResponse.data?.Status !== "Success" ||
        !instituteResponse.data?.Data
      ) {
        console.error("Failed to fetch Institute ID");
        return;
      }

      const instituteID = instituteResponse.data.Data;

      // ✅ Step 2: Fetch Courses using real InstituteID
      await fetchCourses(instituteID);
    } catch (error) {
      console.error("Initialization Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (instituteID) => {
    try {
      const payload = {
        InstituteId: instituteID, // ✅ Correct InstituteID
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

      const formattedData = apiData.map((item, index) => ({
        srNo: index + 1,
        sector: item.Sector,
        courseType: item.CourseType,
        course: item.CourseWithCourseCode,
        duration: item.Duration,
        approvedUnits: item.ApprovedUnits,
      }));

      setTableData(formattedData);
    } catch (error) {
      console.error("API ERROR:", error);
      setTableData([]);
    }
  };

  const columns = [
    { header: "Sr.No.", key: "srNo", width: "70px", className: "text-center" },
    { header: "Sector", key: "sector" },
    { header: "Course Type", key: "courseType" },
    { header: "Course", key: "course" },
    {
      header: "Duration",
      key: "duration",
      width: "120px",
      className: "text-center",
    },
    {
      header: "Approved Units",
      key: "approvedUnits",
      width: "120px",
      className: "text-center",
    },
  ];

  return (
    <div className="relative w-full p-4 bg-gray-100 min-h-screen">
      <fieldset className="rounded-sm border border-gray-300 bg-white p-6 shadow-lg">
        <legend className="px-4 py-1 bg-slate-500 text-white text-lg font-semibold rounded-md w-auto">
          Courses
        </legend>

        <h2 className="text-xl font-semibold mt-4 mb-4">
          Approved Course List
        </h2>

        {loading ? (
          <div className="text-center py-6 text-lg font-semibold">
            Loading Courses...
          </div>
        ) : (
          <FilteredTableComponent
            data={tableData}
            columns={columns}
            searchable={true}
            sortable={true}
            showExport={true}
            showSearch={true}
            emptyStateMessage="No Courses Found"
            maxHeight="500px"
          />
        )}
      </fieldset>
    </div>
  );
};

export default ApprovedCourseList;
