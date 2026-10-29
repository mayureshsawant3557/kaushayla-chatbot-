import { useEffect, useState, useContext } from "react";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import agent from "../../lib/api/agent";

import { GetShortTermApprovedCourseFees } from "../../Endpoints_All/Institute/shortTermCourse";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import { getDeviceIP } from "../../utils/CommonHelper";
import { ThemeContext } from "../Context/ThemeContext";
import { useAuth } from "../../Hooks/AuthContext";
const DurationandCourseFee = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
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

      await loadCourseFees(instituteID, ip);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadCourseFees = async (instId, ipAddress) => {

    const payload = {
      InstituteId: instId,
      ExitInstituteID: 0,
      UserLoginID: userInfo?.UserLoginID,
      PageCode: "COURSE_LIST",
      ItemId: 0,
      IPAddress: ipAddress,
    };

    const response = await agent.post(GetShortTermApprovedCourseFees, payload);
    const apiData = response?.data?.Data || [];

    const formatted = apiData.map((item, index) => ({
      srNo: index + 1,
      sector: item.Sector,
      category: item.CourseType,
      course: item.CourseWithCourseCode,
      theory: item.TheoryDuration,
      practical: item.PracticalDuration,
      ojtMandatory: item.OJTMandatoryDuration,
      ojtOptional: item.OJTOptionalDuration,
      total: item.Duration,
      feeCategory: item.TrainingFeeCategory,
      courseFee: item.CourseFee,
    }));

    setTableData(formatted);
  };

  const columns = [
    { key: "srNo", header: "Sr. No.", width: "70px", className: "text-center" },
    { key: "sector", header: "Sector" },
    { key: "category", header: "Course Category" },
    { key: "course", header: "Course" },
    { key: "theory", header: "Theory", className: "text-center" },
    { key: "practical", header: "Practical", className: "text-center" },
    { key: "ojtMandatory", header: "OJT Mandatory", className: "text-center" },
    { key: "ojtOptional", header: "OJT Optional", className: "text-center" },
    { key: "total", header: "Total", className: "text-center" },
    {
      key: "feeCategory",
      header: "Training Fee Category",
      className: "text-center",
    },
    { key: "courseFee", header: "Course Fee", className: "text-center" },
  ];

  return (
    <div className="relative w-full p-4 bg-gray-100 min-h-screen">
      <fieldset className="rounded-sm border border-gray-300 bg-white p-6 shadow-lg">
        <legend
          className={`px-4 py-1 ${color} text-white text-lg font-semibold rounded-md w-auto`}
        >
          Duration and Course Fee
        </legend>

        {loading ? (
          <div className="text-center py-6 text-lg font-semibold">
            Loading Course Fees...
          </div>
        ) : (
          <FilteredTableComponent
            data={tableData}
            columns={columns}
            searchable={true}
            sortable={true}
            showExport={true}
            showSearch={true}
            emptyStateMessage="No Data Found"
            maxHeight="500px"
          />
        )}
      </fieldset>
    </div>
  );
};

export default DurationandCourseFee;
