import React, { useContext, useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { useLoading } from "../../../Hooks/useLoading";
import agent from "../../../lib/api/agent";
import { ApprovedPendingCandidateList, GetInstituteCourseBatches } from "../../../Endpoints_All/Administration/admin";
import { GetInstituteIDByInstituteCode, GetAdmissionYear } from "../../../Endpoints_All/Institute/institute";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { ThemeContext } from "../../Context/ThemeContext";
import Button from "../../Base/Button";
import Loader from "../../formcomponent/Loader";
import { useAuth } from "../../../Hooks/AuthContext";

const AdmissionReportSearchFilter = ({
  noDataMessage,
  hasSearched,
  children,
  customSearchHandler,
  showSummary = true,
  showSearchButton = true,
  title = "Approval Pending Candidate List",
  titleIcon,
  reportType,
  showSummary: propShowSummary,
  onReset
}) => {
  const { startLoading, stopLoading } = useLoading();


  const [courseOptions, setCourseOptions] = useState([]);
  const [admissionYearOptions, setAdmissionYearOptions] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [batchTypeOptions, setBatchTypeOptions] = useState([]);
  const [batchIdOptions, setBatchIdOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [admissionYearError, setAdmissionYearError] = useState("");


  const [selectedBatchType, setSelectedBatchType] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [allBatchData, setAllBatchData] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [selectedAdmissionYearId, setSelectedAdmissionYearId] = useState("");
  const [summary, setSummary] = useState({ intake: 0, admitted: 0, vacant: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const [instituteNumericId, setInstituteNumericId] = useState(0);

  const [districtId, setDistrictId] = useState(0);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [instituteOptions, setInstituteOptions] = useState([]);
  const [selectedInstituteId, setSelectedInstituteId] = useState("");
  const [hasBatchData, setHasBatchData] = useState(true);


  const [userTypeId, setUserTypeId] = useState(0);
  const { color } = useContext(ThemeContext);
  const [pageLoading, setPageLoading] = useState(true);
  const { userInfo } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      try {
        setPageLoading(true);

        const typeId = Number(userInfo?.UserTypeID);
        setUserTypeId(typeId);

        await fetchAdmissionYearOptions();

        if (typeId === 14) {
          await fetchDistricts();
        }
        if (typeId === 61) {
          await fetchInstituteForInstituteUser();
        }

        if (typeId === 14) {
          const districtResponse = await agent.get(
            "/Base/GetDistrictIDByDistrictUser",
            {
              params: {
                UserLoginID: userInfo?.UserLoginID
              }
            }
          );

          const districtId = districtResponse.data?.Data;

          setDistrictId(districtId);
          setSelectedDistrictId(String(districtId));
        }
      } finally {
        setPageLoading(false);
      }
    };

    initialize();


  }, []);

  const fetchInstituteForInstituteUser = async () => {
    try {
      const instituteIdResponse = await agent.get(
        GetInstituteIDByInstituteCode,
        {
          params: {
            InstituteCode: userInfo?.UserLoginID,
          },
        }
      );

      const instituteId = instituteIdResponse.data?.Data;

      setInstituteNumericId(instituteId);

      const response = await agent.get(
        "/Base/GetMasterInstituteFilter",
        {
          params: {
            RegionID: -1,
            DistrictID: -1,
            TalukaID: -1,
          },
        }
      );

      const institutes =
        response.data?.Data ||
        response.data?.Table ||
        response.data ||
        [];

      const loggedInInstitute = institutes.find(
        item => String(item.Value) === String(instituteId)
      );

      if (loggedInInstitute) {

        setInstituteOptions([
          {
            value: loggedInInstitute.Value,
            label: loggedInInstitute.Text,
          },
        ]);

        setSelectedInstituteId(String(loggedInInstitute.Value));

      }

    } catch (err) {
      console.error(err);
    }
  };

  const getInstituteCodeFromSession = () => {
    try {
      return userInfo?.UserLoginID || "";
    } catch {
      return "";
    }
  };



  const fetchDistricts = async () => {
    try {
      // District dropdown
      const districtResponse = await agent.get("/Base/GetMasterRegionDistrict");

      const districts =
        districtResponse.data?.Data ||
        districtResponse.data?.Table ||
        districtResponse.data ||
        [];



      setDistrictOptions(
        districts
          .filter(
            x =>
              x.Value !== "-1" &&
              x.Text?.trim().toUpperCase() !== "NA"
          )
          .map(x => ({
            value: x.Value,
            label: x.Text
          }))
      );

    } catch (err) {
      console.error(err);
    }
  };

  const fetchInstitutes = async (
    admissionYearId,
    districtIdParam = selectedDistrictId
  ) => {
    try {
      let districtId = districtIdParam;
      if (Number(userInfo?.UserTypeID) === 14) {
        districtId = selectedDistrictId;
      }

      const response = await agent.get(
        "/Base/GetMasterInstituteFilter",
        {
          params: {
            RegionID: -1,
            DistrictID: districtId,
            TalukaID: -1
          }
        }
      );

      const institutes =
        response.data?.Data ||
        response.data?.Table ||
        response.data ||
        [];


      setInstituteOptions(
        institutes
          .filter(item => item.Value !== "-1")
          .map(item => ({
            value: item.Value,
            label: item.Text
          }))
      );

    } catch (err) {
      console.error(err);
      setInstituteOptions([]);
    }
  };

  const handleAdmissionYearChange = async (yearId) => {
    setSelectedAdmissionYearId(yearId);

    // Reset all dependent dropdowns
    setSelectedDistrictId(userTypeId === 10 ? "" : selectedDistrictId);
    setSelectedInstituteId("");
    setSelectedCourseId("");
    setSelectedBatchType("");
    setSelectedBatchId("");
    if (userTypeId !== 61) {
      setInstituteOptions([]);
    }
    setCourseOptions([]);
    setBatchTypeOptions([]);
    setBatchIdOptions([]);
    setAllBatchData([]);

    if (!yearId) return;
    if (userTypeId === 10) {
      await fetchDistricts();
      return;
    }

    // Institute User
    if (userTypeId === 61) {
      await handleInstituteChange(
        selectedInstituteId,
        yearId
      );
      return;
    }

    if (
      userTypeId === 13 ||
      userTypeId === 14
    ) {
      await fetchInstitutes(yearId, selectedDistrictId);
    }
  };

  const handleInstituteChange = async (
    instituteId,
    admissionYearId = selectedAdmissionYearId
  ) => {
    if (!selectedAdmissionYearId && !admissionYearId) {
      setErrorMessage("Please select Admission Session first.");
      return;
    }
    if (!instituteId || !admissionYearId) {
      setCourseOptions([]);
      return;
    }
    setSelectedInstituteId(instituteId);

    try {
      setIsLoadingCourses(true);

      if (!admissionYearId) {
        setCourseOptions([]);
        return;
      }

      const response = await agent.get(
        `/api/Admission/courses-by-college/${instituteId}/${admissionYearId}`,
        {
          params: {
            flag: reportType === "pending-for-approval" ? "P" : "A"
          }
        }
      );



      let courses = [];

      const responseData = response.data;

      if (Array.isArray(responseData))
        courses = responseData;
      else if (Array.isArray(responseData?.Data))
        courses = responseData.Data;
      else if (Array.isArray(responseData?.Data?.Table))
        courses = responseData.Data.Table;
      else if (Array.isArray(responseData?.Table))
        courses = responseData.Table;


      setCourseOptions(
        courses.map(course => ({
          value: course.CourseID,
          label: `${course.CourseName} (${course.CourseCode})`
        }))
      );
    } finally {
      setIsLoadingCourses(false);
    }
  };
  const fetchAvailableCourses = async (admissionYearId) => {
    if (!admissionYearId) {
      setCourseOptions([]);
      return;
    }
    try {
      setIsLoadingCourses(true);



      if (!userInfo) {
        setErrorMessage("User information not found");
        return;
      }

      const userTypeId = Number(userInfo?.UserTypeID);

      // Institute User (61)
      if (userTypeId === 61) {
        const instituteIdResponse = await agent.get(
          GetInstituteIDByInstituteCode,
          {
            params: {
              InstituteCode: userInfo?.UserLoginID,
            },
          }
        );

        const instituteId = instituteIdResponse.data?.Data;

        if (!instituteId) {
          setErrorMessage("Could not retrieve institute information");
          return;
        }

        setInstituteNumericId(instituteId);

        const coursesResponse = await agent.get(
          `/api/Admission/courses-by-college/${instituteId}/${admissionYearId}`
        );



        let rawCoursesData = [];

        const responseData = coursesResponse.data;

        if (Array.isArray(responseData))
          rawCoursesData = responseData;
        else if (Array.isArray(responseData?.Data))
          rawCoursesData = responseData.Data;
        else if (Array.isArray(responseData?.Data?.Table))
          rawCoursesData = responseData.Data.Table;
        else if (Array.isArray(responseData?.Table))
          rawCoursesData = responseData.Table;

        const formattedCourses = rawCoursesData.map((course) => ({
          value: course.CourseID,
          label: `${course.CourseName} (${course.CourseCode})`
        }));

        setCourseOptions(formattedCourses);
      }

      else if (userTypeId === 13 || userTypeId === 14) {

        const instituteIdResponse = await agent.get(
          GetInstituteIDByInstituteCode,
          {
            params: {
              InstituteCode: userInfo?.UserLoginID,
            },
          }
        );

        const instituteId = instituteIdResponse.data?.Data;

        setInstituteNumericId(instituteId);

        const coursesResponse = await agent.get(
          `/api/Admission/courses-by-college/${instituteId}/${admissionYearId}`
        );

        let rawCoursesData = [];
        const responseData = coursesResponse.data;

        if (Array.isArray(responseData))
          rawCoursesData = responseData;
        else if (Array.isArray(responseData?.Data))
          rawCoursesData = responseData.Data;
        else if (Array.isArray(responseData?.Data?.Table))
          rawCoursesData = responseData.Data.Table;
        else if (Array.isArray(responseData?.Table))
          rawCoursesData = responseData.Table;

        const formattedCourses = rawCoursesData.map(course => ({
          value: course.CourseID,
          label: course.CourseName
        }));

        setCourseOptions(formattedCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setErrorMessage("Failed to load course options");
    } finally {
      setIsLoadingCourses(false);
    }
  };



  const fetchBatchesFromCandidateData = async (courseId) => {
    if (!courseId || !selectedAdmissionYearId) {
      setBatchTypeOptions([]);
      setBatchIdOptions([]);
      setAllBatchData([]);
      setSelectedBatchId("");
      return;
    }

    try {
      setIsLoadingBatches(true);

      const collegeId =
        selectedInstituteId || instituteNumericId;

      const batchResponse = await agent.get(GetInstituteCourseBatches, {
        params: {
          CourseID: Number(courseId),
          instituteID: Number(collegeId),
          AdmissionYearID: Number(selectedAdmissionYearId)

        }


      });

      const masterBatches =
        Array.isArray(batchResponse.data)
          ? batchResponse.data
          : batchResponse.data?.Data ||
          batchResponse.data?.Table ||
          [];
      const batchLookup = new Map(
        masterBatches
          .filter(batch => batch.Value !== "-1")
          .map(batch => [
            String(batch.Value),
            batch.Text
          ])
      );

      const response = await agent.get(ApprovedPendingCandidateList, {
        params: {
          CourseID: Number(courseId),
          CollegeID: Number(collegeId),
          AdmissionYearID: Number(selectedAdmissionYearId),
          BatchID: 0,
          Flag:
            reportType === "cancelled-candidates"
              ? "C"
              : reportType === "admission-rejected-candidates"
                ? "R"
                : reportType === "approval-rejected-candidates"
                  ? "AR"
                  : reportType === "approval-pending-candidates"
                    ? "AP"
                    : reportType === "approved-candidates"
                      ? "AA"
                      : "A",

        }
      });

      const candidates =
        response.data?.Data?.Table ||
        response.data?.Table ||
        [];

      setSelectedBatchType("");
      setSelectedBatchId("");

      setBatchTypeOptions([]);
      setBatchIdOptions([]);
      setAllBatchData([]);

      // if (!Array.isArray(candidates) || candidates.length === 0) {
      //   return;
      // }

      const uniqueBatches = masterBatches
        .filter(batch => batch.Value !== "-1")
        .map(batch => {
          const batchId = String(batch.Value);

          return {
            value: batchId,
            label: batchId, // Batch ID dropdown

            batchType: batch.Text
              .replace(batchId, "")
              .replace(/\(\)/g, "")
              .trim()
          };
        });



      setAllBatchData(uniqueBatches);
      const uniqueBatchTypes = [
        ...new Map(
          uniqueBatches.map(item => [
            item.batchType,
            {
              value: item.batchType,
              label: item.batchType
            }
          ])
        ).values()
      ];

      setBatchTypeOptions(uniqueBatchTypes);
      setBatchIdOptions([]);

      setSelectedBatchType("");
      setSelectedBatchId("");


    } catch (err) {
      console.error(err);
      setBatchTypeOptions([]);
      setBatchIdOptions([]);
      setAllBatchData([]);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const handleBatchTypeChange = (value) => {
    setSelectedBatchType(value);
    setSelectedBatchId("");

    if (!value) {
      setBatchIdOptions([]);
      return;
    }

    const filteredBatchIds = allBatchData
      .filter(batch => batch.batchType === value)
      .map(batch => ({
        value: batch.value,
        label: batch.label,
      }));

    setBatchIdOptions(filteredBatchIds);
  };

  const fetchAdmissionYearOptions = async () => {
    try {
      setIsLoadingYears(true);
      const response = await agent.get(GetAdmissionYear);
      const responseData = response.data;



      let rawYearsData = [];

      if (Array.isArray(responseData)) rawYearsData = responseData;
      else if (Array.isArray(responseData?.Data)) rawYearsData = responseData.Data;
      else if (Array.isArray(responseData?.Table)) rawYearsData = responseData.Table;
      else if (responseData && typeof responseData === "object") {
        const arrayValues = Object.values(responseData).filter(Array.isArray);
        if (arrayValues.length > 0) rawYearsData = arrayValues[0];
      }

      const normalizedYears = rawYearsData.map((year, index) => ({
        id: year.YearId || year.Id || year.AdmissionYearID || year.Value || index + 1,
        displayName: year.YearDisplayName || year.DisplayName ||
          year.Name || year.Text || year.AdmissionYear ||
          `Academic Year ${index + 1}`,
      }));

      const formattedYears = normalizedYears.map(year => ({
        value: year.id,
        label: year.displayName
      }));

      setAdmissionYearOptions(formattedYears);
    } catch (error) {
      console.error("Error fetching admission years:", error);
      setAdmissionYearOptions([]);
    } finally {
      setIsLoadingYears(false);
    }
  };

  const handleReset = () => {


    if (userTypeId !== 14) {
      setSelectedDistrictId("");
      setDistrictId(0);
    }
    // setRegionId(0);
    setSelectedAdmissionYearId("");
    setSelectedCourseId("");
    if (userTypeId !== 61) {
      setSelectedInstituteId("");
    }

    setSelectedBatchType("");
    setSelectedBatchId("");

    setBatchTypeOptions([]);
    setBatchIdOptions([]);
    setAllBatchData([]);

    setCourseOptions([]);

    setAdmissionYearOptions(admissionYearOptions); // optional
    setCourseOptions([]);
    setBatchTypeOptions([]);
    setBatchIdOptions([]);
    setAllBatchData([]);

    setSummary({
      intake: 0,
      admitted: 0,
      vacant: 0
    });

    setErrorMessage("");

    if (onReset) {
      onReset();
    }
  };


  const handleSearch = async () => {
    setAdmissionYearError("");

    if (!selectedAdmissionYearId) {
      setAdmissionYearError("Select Admission Year");
      return;
    }

    setErrorMessage("");

    // Institute information is required only for Institute User (61)
    if (userTypeId === 61 && !instituteNumericId) {
      setErrorMessage("Institute information not available");
      return;
    }

    const selectedCourse = courseOptions.find(
      course => Number(course.value) === Number(selectedCourseId)
    );

    const selectedAdmissionYear = admissionYearOptions.find(
      year => String(year.value) === String(selectedAdmissionYearId)
    );
    const selectedDistrict = districtOptions.find(
      district => String(district.value) === String(selectedDistrictId)
    );
    if (customSearchHandler && typeof customSearchHandler === "function") {
      startLoading();
      setErrorMessage("");

      try {
        await customSearchHandler({
          // Optional filters
          courseId: selectedCourseId || 0,
          courseName: selectedCourse?.label || "",

          admissionYearId: selectedAdmissionYearId,
          admissionSessionName: selectedAdmissionYear?.label || "",

          instituteId: selectedInstituteId || instituteNumericId || 0,

          batchId:
            reportType === "admission-rejected-candidates"
              ? 0
              : selectedBatchId || 0,

          batchType:
            reportType === "admission-rejected-candidates"
              ? ""
              : selectedBatchType || "",
          districtId: selectedDistrictId || 0,
          districtName: selectedDistrict?.label || "",

          instituteNumericId: instituteNumericId || 0,

          setSummary,
          setErrorMessage
        });
      } catch (error) {
        console.error("Custom search handler error:", error);
        setErrorMessage("Failed to search candidates");
      } finally {
        stopLoading();
      }

      return;
    }

    startLoading();
    setErrorMessage("");

    try {
      const searchParameters = {
        // 0 means no filter selected
        CourseID: Number(selectedCourseId) || 0,

        CollegeID:
          Number(selectedInstituteId || instituteNumericId) || 0,

        AdmissionYearID: Number(selectedAdmissionYearId),

        BatchID: Number(selectedBatchId) || 0,

        Flag:
          reportType === "pending-for-approval"
            ? "P"
            : "A",

        RegionID: Number(districtId) || 0
      };


      const response = await agent.get(ApprovedPendingCandidateList, {
        params: searchParameters
      });

      const responseData = response.data?.Data || response.data;

      if (!responseData) {
        setErrorMessage("No data received from server");
        return;
      }

      if (
        responseData.Table1 &&
        Array.isArray(responseData.Table1) &&
        responseData.Table1.length > 0
      ) {
        const statistics = responseData.Table1[0];

        setSummary({
          intake: parseInt(statistics.Intake) || 0,
          admitted: parseInt(statistics.Admitted) || 0,
          vacant: parseInt(statistics.Vacant) || 0
        });
      } else {
        setSummary({
          intake: 0,
          admitted: 0,
          vacant: 0
        });
      }

    } catch (error) {
      console.error("Search error:", error);

      setErrorMessage(
        error.response?.data?.title ||
        "Failed to retrieve candidate information"
      );

      setSummary({
        intake: 0,
        admitted: 0,
        vacant: 0
      });

    } finally {
      stopLoading();
    }
  };
  if (pageLoading) {
    return <Loader />;
  }

  const showResetButton =
    selectedAdmissionYearId ||
    selectedCourseId ||
    (reportType !== "pending-for-approval" && selectedBatchType) ||
    (reportType !== "pending-for-approval" && selectedBatchId);
  return (

    <div className="bg-white rounded-xl shadow-md px-10 py-8">
      <fieldset className='mb-4 rounded-md border border-gray-300 p-4 bg-white'>
        <legend className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color}`}>
          {titleIcon || <FileText size={25} className="w-4 h-4 mr-2" />}
          {title}
        </legend>
        {noDataMessage && (
          <div className="mt-4 mb-5 w-full rounded-md border border-red-100 bg-red-50 px-4 py-2">
            <p className="text-sm text-red-700">
              {noDataMessage}
            </p>
          </div>
        )}


        {errorMessage && (
          <div className="mb-6 bg-red-100 text-red-700 px-4 py-2 rounded text-md">
            {errorMessage}
          </div>
        )}

        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >


          {/* Admission Session */}
          <div className="flex flex-col">
            <div className="flex items-center mb-1 min-w-0">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Admission Session
                <span className="text-red-500 ml-1">*</span>
              </label>

              {admissionYearError && (
                <span className="text-red-500 text-sm ml-2 whitespace-nowrap min-w-[200px]">
                  {admissionYearError}
                </span>
              )}
            </div>

            <DropdownComponent
              label=""
              options={admissionYearOptions}
              value={selectedAdmissionYearId}
              onChange={(value) => {
                setAdmissionYearError("");
                handleAdmissionYearChange(value);
              }}
              disabled={isLoadingYears}
              loading={isLoadingYears}
              required={false}
            />
          </div>
          {(userTypeId === 10 || userTypeId === 14 || userTypeId == 13) && (
            <div>
              <DropdownComponent
                label="District"
                options={districtOptions}
                value={selectedDistrictId}
                onChange={async (value) => {
                  setSelectedDistrictId(value);

                  setSelectedInstituteId("");
                  setSelectedCourseId("");
                  setSelectedBatchType("");
                  setSelectedBatchId("");

                  setInstituteOptions([]);
                  setCourseOptions([]);
                  setBatchTypeOptions([]);
                  setBatchIdOptions([]);
                  setAllBatchData([]);

                  if (
                    selectedAdmissionYearId &&
                    (userTypeId === 10 || userTypeId === 13 || userTypeId === 14)
                  ) {
                    await fetchInstitutes(selectedAdmissionYearId, value);
                  }
                }}
                required={false}
                disabled={userTypeId === 14}
              />
            </div>
          )}
          {/* Institute Dropdown */}
          {(userTypeId === 13 || userTypeId === 14 || userTypeId === 10 || userTypeId === 61) && (
            <div>
              <DropdownComponent
                label="Institute Name"
                options={instituteOptions}
                value={selectedInstituteId}
                onChange={(value) =>
                  handleInstituteChange(value, selectedAdmissionYearId)
                }
                required={false}
                disabled={userTypeId === 61}
              />
            </div>
          )}

          {/* Course Name */}
          <div>
            <DropdownComponent
              // disabled={!selectedAdmissionYearId}
              label="Course Name"
              options={courseOptions}
              value={selectedCourseId}
              onChange={(value) => {
                setSelectedCourseId(value);

                if (
                  value &&
                  reportType !== "pending-for-approval" &&
                  reportType !== "admission-rejected-candidates"
                ) {
                  setSelectedBatchType("");
                  setSelectedBatchId("");

                  fetchBatchesFromCandidateData(value);
                }
              }}
              required={false}
              loading={isLoadingCourses}
            />
          </div>


          {reportType !== "pending-for-approval" &&
            reportType !== "admission-rejected-candidates" && (
              <>
                {/* Batch Type */}
                <div>
                  <DropdownComponent
                    // disabled={!selectedAdmissionYearId}
                    label="Session"
                    options={batchTypeOptions}
                    value={selectedBatchType}
                    onChange={handleBatchTypeChange}
                    required={false}
                    loading={isLoadingBatches}
                  />
                </div>

                {/* Batch ID */}
                <div>
                  <DropdownComponent
                    // disabled={!selectedAdmissionYearId}
                    label="Batch ID"
                    options={batchIdOptions}
                    value={selectedBatchId}
                    onChange={setSelectedBatchId}
                    loading={isLoadingBatches}
                  />
                </div>
              </>
            )}
        </div>


        {showSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* <div className="flex items-center gap-3">
              <span className="text-base">Total Intake :</span>
              <input
                readOnly
                value={summary.intake}
                className="border rounded w-[56px] h-[40px] text-center text-base"
              />
            </div> */}
            {/* <div className="flex items-center gap-3">
              <span className="text-base">Total Admitted :</span>
              <input
                readOnly
                value={summary.admitted}
                className="border rounded w-[56px] h-[40px] text-center text-base"
              />
            </div> */}
            {/* <div className="flex items-center gap-3">
              <span className="text-base">Total Vacant :</span>
              <input
                readOnly
                value={summary.vacant}
                className="border rounded w-[56px] h-[40px] text-center text-base"
              />
            </div> */}
          </div>
        )}

        {showSearchButton && (
          <div className="mt-8 flex justify-center gap-3">
            <Button
              variant="success"
              onClick={handleSearch}

            >
              Search
            </Button>

            {showResetButton && (
              <Button
                variant="danger"
                onClick={handleReset}
              >
                Reset
              </Button>
            )}
          </div>
        )}
      </fieldset>

      {children}
    </div>

  );
};

export default AdmissionReportSearchFilter;