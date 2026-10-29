import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import agent from "../../lib/api/agent";
import Swal from "sweetalert2";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";
import {
  SaveInspectionUnitDetails,
  GetInspectionUnitDetails,
} from "../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import { getIp } from "../../Endpoints_All/Utils/fileUpload";

// import { UpdateInstituteInspectionVerificationStatus } from "../../Endpoints_All/Base/DVETO";
import { useInspectionLock } from "../../Hooks/useInspectionLock";

import DocumentLink from "../../Component/formcomponent/OpenDocumentComponent";
import { useAuth } from "../../Hooks/AuthContext";
import { useNoticePopup } from "../../Component/formcomponent/NoticePop";

const UnitsForInspection = () => {
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const loginID = userInfo?.UserLoginID;
  const userTypeID = userInfo?.UserTypeID;

  const [instituteId, setInstituteId] = useState(null);
  const [courseData, setCourseData] = useState([]);
  const [ipAddress, setIpAddress] = useState("0.0.0.0");

  const params = new URLSearchParams(window.location.search);
  const p1 = params.get("P1");
  const p2 = params.get("P2");

  // for lock page
  const { isLocked } = useInspectionLock(instituteId, loginID);

  const { showNoticePopup } = useNoticePopup();

  // added for validation over inspection staus

  // Fetch IP Address
  const fetchIP = async () => {
    try {
      const response = await agent.get(getIp, {
        headers: { accept: "*/*" },
      });
      if (response.data?.ip) {
        setIpAddress(response.data.ip);
      } else {
        setIpAddress("0.0.0.0");
      }
    } catch (error) {
      setIpAddress("0.0.0.0");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    showNoticePopup({
      title: "सूचना",
      icon: null,
      width: 1200,
      className: "text-black",
      content: [
        {
          text: "१.	निरिक्षण युनिट्स (Inspection Units) म्हणजे संस्थेने प्रत्यक्ष निरिक्षणासाठी प्रस्तावित केलेली युनिट्स आहेत, ज्यामध्ये मंजूर युनिट्स (Approved Units) + इरादापत्र/ प्रस्तावित युनिट्स (LoI Units) यांचा समावेश होतो.",
        },
        {
          text: "२.	सर्व प्रशिक्षण पायाभूत सुविधांची गणना निरिक्षण युनिट्सच्या आधारे केली जाईल.",
        },
        {
          text: "३.	निरिक्षण युनिट्स हे एकूण युनिट्सपेक्षा (Total Units) जास्त आणि यापूर्वी मंजूर झालेल्या युनिट्सपेक्षा (Approved Units) कमी असू शकत नाहीत.",
        },
        {
          text: "४.	निरिक्षण शुल्काची (Inspection Fee) गणना केवळ नव्याने प्रस्तावित युनिट्सच्या आधारे केली जाईल, म्हणजेच = (निरिक्षण युनिट्स – एकूण युनिट्स).",
        },
        {
          text: "५.	निरिक्षण समिती उपलब्ध प्रशिक्षण पायाभूत सुविधांनुसार युनिट्सची शिफारस करेल.",
        },
        {
          text: "a.	जर अतिरिक्त प्रशिक्षण पायाभूत सुविधा उपलब्ध असतील, तर शिफारस केलेली युनिट्स (Recommended Units) निरिक्षण युनिट्सपेक्षा (Inspection Units) जास्त असू शकतात (संस्थेच्या संमतीने). अशा परिस्थितीत, संस्थेला संलग्नता (Affiliation) प्रक्रियेदरम्यान तपासणी शुल्काची उर्वरित रक्कम भरावी लागेल.",
          className: "ml-3",
        },
        {
          text: "b.	जर उपलब्ध प्रशिक्षण पायाभूत सुविधा यापूर्वी मंजूर झालेल्या युनिट्ससाठी (Approved Units) आवश्यक असलेल्या सुविधांपेक्षा कमी असतील, तर तपासणी समिती यापूर्वी मंजूर झालेल्या युनिट्सपेक्षा कमी युनिट्सची शिफारस करू शकते. अशा परिस्थितीत, जास्तीच्या मंजूर युनिट्सची (Approved Units) मान्यता रद्द केली जाईल.",
          className: "ml-3",
        },
      ],
      confirmText: "OK",
    });
  }, [showNoticePopup]);

  // Fetch Institute ID
  useEffect(() => {
    const fetchInstituteId = async () => {
      try {
        startLoading();
        const response = await agent.get(GetInstituteIDByInstituteCode, {
          params: { InstituteCode: loginID },
        });
        if (response.data.Status === "Success") {
          setInstituteId(response.data.Data);
        }
      } catch (error) {
        //Swal.fire({
        //    icon: 'error',
        //    title: 'Error',
        //    text: 'Failed to fetch Institute ID'
        //});
      } finally {
        stopLoading();
      }
    };

    if (userTypeID === 14 || (userTypeID === 81 && p1) || (userTypeID === 501 && p1)) {
      // If URL contains ?P1=id
      setInstituteId(p1);
    } else if (loginID) {
      // Otherwise call API
      fetchInstituteId();
    }

    //if (loginID) {
    //    fetchInstituteId();
    //}
    fetchIP();
  }, [loginID]);

  // Fetch Inspection Unit Details
  useEffect(() => {
    const fetchInspectionUnitDetails = async () => {
      if (!instituteId) return;

      try {
        startLoading();
        const response = await agent.get(GetInspectionUnitDetails, {
          params: { instituteId: instituteId },
        });
          if (response.data.Status === "Success") {

              let data = response.data.Data;

              if (Number(userTypeID) == 501) {
                  data = data.filter(
                      (item) => Number(item.ApprovedCategoryID) == 1
                  );
              }
           data = data.map((item) => ({
            ...item,

            InspectionUnits: item.InspectionUnits ?? item.LOITotalUnits,

            // Board Recommendation
            RecommendedByBoard: item.RecommendedUnitsByBoard ?? 0,

            // Approved Category
            ChannelType: item.ApprovedCategory || "",
            ApprovedCategoryID: item.ApprovedCategoryID || 0,

            MaxTraningSetupRequired: item.MaxTraningSetupRequired,
          }));
          setCourseData(data);
        }
      } catch (error) {
        //Swal.fire({
        //    icon: 'error',
        //    title: 'Error',
        //    text: 'Failed to fetch Inspection Unit Details'
        //});
      } finally {
        stopLoading();
      }
    };

    fetchInspectionUnitDetails();
  }, [instituteId, userTypeID]);

  // Handle Inspection Units Change
  const handleInspectionUnitsChange = (value, rowIndex) => {
    const updatedData = [...courseData];

    // Allow empty string during editing
    if (value === "" || value === null || value === undefined) {
      updatedData[rowIndex].RecommendedUnits = "";
      //updatedData[rowIndex].MaxTraningSetupRequired = 0;
      setCourseData(updatedData);
      return;
    }

    const RecommendedUnits = parseInt(value);
    const LOITotalUnits = updatedData[rowIndex].LOITotalUnits;
    const approvedUnits = updatedData[rowIndex].ApprovedUnits;
      //const inspectionUnits = updatedData[rowIndex].InspectionUnits;

    // Prevent negative values or NaN
    if (isNaN(RecommendedUnits) || RecommendedUnits < 0) {
      return;
    }

    updatedData[rowIndex].RecommendedUnits = RecommendedUnits;
    setCourseData(updatedData);

    if (RecommendedUnits > LOITotalUnits) {
      Swal.fire({
        icon: "warning",
        title: "Alert!",
        text: "Recommended Units are more than Total Units. The Additional Units are recommended only with the consent of Institute.",
        confirmButtonText: "OK",
      }).then(() => {
        const resetData = [...courseData];
        resetData[rowIndex].RecommendedUnits = "";
        setCourseData(resetData);
      });

      return;
      }


    updatedData[rowIndex].RecommendedUnits = RecommendedUnits;
    setCourseData(updatedData);

    //  VALIDATION 2: I < A
    if (RecommendedUnits < approvedUnits) {
      Swal.fire({
        icon: "warning",
        title: "Alert!",
        text: "Recommended Units are less than already Approved Units. Board shall initiate de-affiliation process for these Units.",
        confirmButtonText: "OK",
      });
      }
      
  };

  const handleChannelChange = (value, rowIndex) => {
    const updatedData = [...courseData];

    updatedData[rowIndex].ChannelType = value;
    updatedData[rowIndex].ApprovedCategory = value;

    updatedData[rowIndex].ApprovedCategoryID =
      value === "Government Approval" ? 1 : value === "Board Approval" ? 2 : 0;

    setCourseData(updatedData);
  };

  const handleApprovedUnitsChange = (value, rowIndex) => {
    const updatedData = [...courseData];

    if (value === "" || value === null || value === undefined) {
      updatedData[rowIndex].ApprovedUnits = "";
      setCourseData(updatedData);
      return;
    }

    const approvedUnits = parseInt(value);

    if (isNaN(approvedUnits) || approvedUnits < 0) {
      return;
    }

    updatedData[rowIndex].ApprovedUnits = approvedUnits;
    setCourseData(updatedData);
  };
  const handleRecommendedByBoardChange = (value, rowIndex) => {
    const updatedData = [...courseData];

    if (value === "" || value === null || value === undefined) {
      updatedData[rowIndex].RecommendedByBoard = "";
      setCourseData(updatedData);
      return;
      }

      const RecommendedUnits = parseInt(value);
      
      const inspectionUnits = updatedData[rowIndex].InspectionUnits;
      // VALIDATION 1: Recommended Units cannot be more than Inspection Units
      if (RecommendedUnits > inspectionUnits) {
          Swal.fire({
              icon: "warning",
              title: "Validation Error",
              text: `Recommended Units cannot be more than Inspection Units (${inspectionUnits}).`,
              confirmButtonText: "OK",
          }).then(() => {
              const resetData = [...courseData];
              resetData[rowIndex].RecommendedByBoard = "";
              setCourseData(resetData);
          });

          return;
      }

    const recommendedByBoard = parseInt(value);

    if (isNaN(recommendedByBoard) || recommendedByBoard < 0) {
      return;
    }

    updatedData[rowIndex].RecommendedByBoard = recommendedByBoard;
    setCourseData(updatedData);
  };
  const preventNegativeKeys = (e) => {
    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  // Calculate Totals
  const calculateTotals = () => {
    const totals = {
      ApprovedUnits: 0,
      LOIProposedUnits: 0,
      LOITotalUnits: 0,
      InspectionUnits: 0,
      RecommendedUnits: 0,
      InspectionFee: 0,
      SecurityDeposit: 0,
      RecommendedByBoard: 0,
    };

    courseData.forEach((course) => {
      totals.ApprovedUnits += course.ApprovedUnits || 0;
      totals.LOIProposedUnits += course.LOIProposedUnits || 0;
      totals.LOITotalUnits += course.LOITotalUnits || 0;
      totals.InspectionUnits +=
        (course.InspectionUnits === ""
          ? 0
          : parseInt(course.InspectionUnits)) || 0;
      totals.RecommendedUnits +=
        (course.RecommendedUnits === ""
          ? 0
          : parseInt(course.RecommendedUnits)) || 0;
      totals.InspectionFee +=
        (course.InspectionFee === "" ? 0 : parseInt(course.InspectionFee)) || 0;

      totals.SecurityDeposit += course.SecurityDeposit || 0;
      totals.RecommendedByBoard +=
        (course.RecommendedByBoard === ""
          ? 0
          : parseInt(course.RecommendedByBoard)) || 0;
    });

    return totals;
  };

  // Prepare Table Data
  const prepareTableData = () => {
    const totals = calculateTotals();

    const dataRows = courseData.map((course, index) => ({
      sn: index + 1,
      course: course.ModelCurriculum ? (
        <DocumentLink
          documentUrl={course.ModelCurriculum}
          itemName={course.Course || "Course"}
          label={course.CourseWithCourseCode || course.Course}
        />
      ) : (
        course.CourseWithCourseCode || course.Course
      ),

      // Approved Units — editable for userTypeID 81
      approvedUnits:
        // userTypeID === 81 ? (
        //   <div className="flex items-center justify-center">
        //     <input
        //       type="number"
        //       value={course.ApprovedUnits === "" ? "" : course.ApprovedUnits}
        //       onKeyDown={preventNegativeKeys}
        //       onChange={(e) => handleApprovedUnitsChange(e.target.value, index)}
        //       className="w-24 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        //       min={0}
        //       disabled={isLocked}
        //     />
        //   </div>
        // ) : (
        //   course.ApprovedUnits
        // ),
        course.ApprovedUnits,
      loiUnits: course.LOIProposedUnits,
      totalUnits: course.LOITotalUnits,
      inspectionUnits: course.InspectionUnits,

      recommendedUnits: (
        <div className="flex items-center justify-center">
          <input
            type="number"
            value={
              course.RecommendedUnits === "" ? "" : course.RecommendedUnits
            }
            onChange={(e) => handleInspectionUnitsChange(e.target.value, index)}
            className="w-24 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={course.ApprovedUnits}
            max={course.LOITotalUnits}
            disabled={isLocked || userTypeID === 81}
          />
        </div>
      ),

        ...(userTypeID === 81 || userTypeID == 501
        ? {
            channelType: (
              <div className="flex items-center justify-center">
                <select
                  value={course.ChannelType || ""}
                  onChange={(e) => handleChannelChange(e.target.value, index)}
                  className="w-36 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLocked}
                >
                  <option value=""> Select </option>
                  {Number(course.RecommendedByBoard) > 0 && (
                    <>
                                <option value="Government Approval">Government Approval</option>
                                <option value="Board Approval">Board Approval</option>
                    </>
                  )}
                </select>
              </div>
            ),
            recommendedByBoard: (
              <div className="flex items-center justify-center">
                <input
                  type="number"
                  value={
                    course.RecommendedByBoard === ""
                      ? ""
                      : course.RecommendedByBoard
                  }
                  onChange={(e) =>
                    handleRecommendedByBoardChange(e.target.value, index)
                  }
                  onKeyDown={preventNegativeKeys}
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={course.ApprovedUnits}
                        max={course.InspectionUnits}
                  disabled={isLocked}
                />
              </div>
            ),
          }
        : {
            fee: course.InspectionFee,
            deposit: course.SecurityDeposit,
          }),

      rowClassName: "",
    }));

    // Total Row
    dataRows.push({
      sn: "",
      course: <strong>Total</strong>,
      approvedUnits: <strong>{totals.ApprovedUnits}</strong>,
      loiUnits: <strong>{totals.LOIProposedUnits}</strong>,
      totalUnits: <strong>{totals.LOITotalUnits}</strong>,
      inspectionUnits: <strong>{totals.InspectionUnits}</strong>,
      recommendedUnits: <strong>{totals.RecommendedUnits}</strong>,
      ...(userTypeID === 81
        ? {
            channelType: "",
            recommendedByBoard: <strong>{totals.RecommendedByBoard}</strong>,
          }
        : {
            fee: <strong>{totals.InspectionFee}</strong>,
            deposit: <strong>{totals.SecurityDeposit}</strong>,
          }),
      rowClassName: "bg-gray-100 font-bold",
    });

    return dataRows;
  };

  // Table Columns
  const inspectionColumns = [
    {
      key: "sn",
      header: "S.N.",
     // headerClassName: "text-center bg-blue-100 font-semibold",
      className: "text-center",
      width: "20px",
    },
    {
      key: "course",
      header: "Course",
     // headerClassName: "text-left bg-blue-100 font-semibold",
      className: "text-left",
      width: "600px",
    },
    {
      key: "approvedUnits",
      header: "Approved Units (A)",
     // headerClassName: "text-center bg-blue-100 font-semibold",
      className: "text-center",
      width: "100px",
    },
    {
      key: "loiUnits",
      header: "LoI Units (B)",
     // headerClassName: "text-center bg-blue-100 font-semibold",
      className: "text-center",
      width: "90px",
    },
    {
      key: "totalUnits",
      header: "Total Units (C = A + B)",
     // headerClassName: "text-center bg-blue-100 font-semibold",
      className: "text-center",
      width: "100px",
    },
    {
      key: "inspectionUnits",
      header: "Inspection Units",
     // headerClassName: "text-center bg-blue-100 font-semibold",
      className: "text-center",
      width: "80px",
    },
    {
      key: "recommendedUnits",
      header: (
        <span>
          {userTypeID === 81
            ? "DVETO Recommended Units"
            : "DVETO Recommended Units"}
          <span className="text-red-500">*</span>
        </span>
      ),
      //headerClassName: "text-center bg-blue-100 font-semibold",
      className: "text-center",
      width: "130px",
    },
      ...(userTypeID === 81 || userTypeID == 501
      ? [
          {
            key: "recommendedByBoard",
            header: (
              <span>
                Board Recommended Units <span className="text-red-500">*</span>
              </span>
            ),
            //headerClassName: "text-center bg-blue-100 font-semibold",
            className: "text-center",
            width: "160px",
          },
          {
            key: "channelType",
            header: "Approval Category",
           // headerClassName: "text-center bg-blue-100 font-semibold",
            className: "text-center",
            width: "130px",
          },
        ]
      : []),
      ...(userTypeID !== 81 && userTypeID !== 501
      ? [
          {
            key: "fee",
            header: "Inspection Fee",
          //  headerClassName: "text-center bg-blue-100 font-semibold",
            className: "text-center",
            width: "110px",
          },
          {
            key: "deposit",
            header: "Security Deposit",
           // headerClassName: "text-center bg-blue-100 font-semibold",
            className: "text-center",
            width: "130px",
          },
        ]
      : []),
  ];
  // Validate Before Save
  //const validateData = () => {
  //    for (let i = 0; i < courseData.length; i++) {
  //        const course = courseData[i];

  //        //if (!course.InspectionUnits || course.InspectionUnits === '') {
  //        //    Swal.fire({
  //        //        icon: 'warning',
  //        //        title: 'Validation Error',
  //        //        text: `Please enter Inspection Units for ${course.Course}`,
  //        //        confirmButtonText: 'OK'
  //        //    });
  //        //    return false;
  //        //}

  //        const recommendedUnits = parseInt(course.RecommendedUnits);

  //        if (isNaN(recommendedUnits)) {
  //            Swal.fire({
  //                icon: 'warning',
  //                title: 'Validation Error',
  //                text: `Please enter valid Inspection Units for ${course.Course}`,
  //                confirmButtonText: 'OK'
  //            });
  //            return false;
  //        }

  //        if (recommendedUnits > course.LOITotalUnits) {
  //            Swal.fire({
  //                icon: 'warning',
  //                title: 'Validation Error',
  //                text: `Recommended Units are more than Total Units. The Additional Units are recommended only with the consent of Institute.`,
  //                confirmButtonText: 'OK'
  //            });
  //            return false;
  //        }

  //        if (recommendedUnits < course.ApprovedUnits) {
  //            Swal.fire({
  //                icon: 'warning',
  //                title: 'Validation Error',
  //                text: `Recommended Units are less than already Approved Units. Board shall initiate de-affiliation process for these Units.`,
  //                confirmButtonText: 'OK'
  //            });
  //            return false;
  //        }
  //    }
  //    return true;
  //};

  // Save Data
  const handleSave = async () => {
    //if (isLocked) {

    //    if (userTypeID === 14) {
    //        navigate(`/Institute/BuildingDetails?P1=${p1}&P2=${p2}`);
    //    } else {
    //        navigate("/Institute/BuildingDetails");
    //    }

    //}

    try {
      startLoading();

      const proposedCourses = courseData.map((course) => ({
        instituteId: instituteId,
        courseId: course.CourseID,
        proposedUnits: course.ProposedUnits || 0,
        approvedUnits: course.ApprovedUnits || 0,
        totalUnits: course.TotalUnits || 0,
        loiProposedUnits: course.LOIProposedUnits || 0,
        loiTotalUnits: course.LOITotalUnits || 0,
        securityDeposit: course.SecurityDeposit || 0,
        inspectionFee: course.InspectionFee || 0,
        inspectionUnits: course.InspectionUnits || 0,

        recommendedUnits: parseInt(course.RecommendedUnits) || 0,

        recommendedUnitsByBoard: parseInt(course.RecommendedByBoard) || 0,

        //approvedCategory: course.ChannelType || "",
        approvedCategory:
          parseInt(course.RecommendedByBoard) === 0
            ? "NA"
            : course.ChannelType || "",

        //approvedCategoryID: parseInt(course.ApprovedCategoryID) || 0,
        approvedCategoryID:
          parseInt(course.RecommendedByBoard) === 0
            ? 0
            : parseInt(course.ApprovedCategoryID) || 0,

        maxBatchesPerDay: course.MaxBatchesPerDay || 0,
        maxTraningSetupRequired: course.MaxTraningSetupRequired || 0,
      }));

      const saveRes = await agent.post(SaveInspectionUnitDetails, {
        instituteID: instituteId,
        proposedCourses,
        createdBy: loginID,
        ipAddress: ipAddress,
      });

      if (saveRes.data.Status == "Success") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Data saved successfully",
          confirmButtonText: "OK",
        }).then(() => {
          navigate(`/DVETO/InspectionReport?p1=${p2}&p2=${p1}`);
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.Message || "Something went wrong",
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="p-6">
      {isLocked && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          Editing is not allowed. Inspection is in progress or completed.
        </div>
      )}
      <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-1">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
        >
          Recommended Units
        </legend>

        <div className="mt-4">
          <FilteredTableComponent
            data={prepareTableData()}
            columns={inspectionColumns}
            filterColumns={[]}
            customButtons={[]}
            title=""
            exportFileName="Units_For_Inspection"
            tableId="inspection-units-table"
            searchable={false}
            sortable={false}
            showExcelTemplate={false}
            exportable={false}
            showSearch={false}
            showExport={false}
            className="mt-3"
            maxHeight="500px"
            stickyHeader={true}
            readOnly={isLocked}
            rowClassName={(row) => row.rowClassName}
          />
        </div>

        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-700">Note:</p>

          <ol className="mt-2 list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>
              Inspection Units are Units actually proposed for Inspection by
              Institute which includes Approved Units + LoI/ Proposed Units
            </li>
            <li>
              All training infrastructure shall be calculated based on the
              Inspection Units.
            </li>
            <li>
              Inspection units cannot be more than Total Units and cannot be
              less than already Approved Units.
            </li>
            <li>
              Inspection Fee shall be calculated based on newly Proposed Units
              only i.e. = (Inspection Units – Total Units).
            </li>
            <li>
              Inspection Committee shall Recommend Units as per available
              training infrastructure.
              <ol className="list-[lower-alpha] list-inside ml-4 mt-1 space-y-1">
                <li>
                  If excess training infrastructure is available then
                  Recommended Units can be more than Inspection Units (on
                  consent of Institute), then Institute shall require to pay the
                  balance amount of Inspection Fees during Affiliation Process.
                </li>
                <li>
                  If available training infrastructure is less than that
                  required for already Approved Units, then Inspection Committee
                  can recommend units less than already Approved Units. In such
                  case the approval for excess Approved units shall be
                  cancelled.
                </li>
              </ol>
            </li>
            {/* <li>
              The Inspection Committee may recommend Units more than Total Units
              if sufficient infrastructure is available, with the consent of the
              Institute.
            </li>
            <li>
              The Inspection Committee may recommend fewer Units than already
              approved if infrastructure is insufficient. In such cases, the
              Board may de-affiliate those Units.
            </li>
            <li>
              If Recommended Units exceed Inspection Units, the Institute must
              pay the balance inspection fees during the affiliation process.
            </li> */}
          </ol>
        </div>
      </fieldset>

      {/* Action Buttons */}
      <div className="flex justify-center gap-8 mt-8 pt-12 border-t-2 border-gray-300">
        {/*{userTypeID === 14 || userTypeID === 81 && (*/}
        {/*    <>*/}
        <button
          type="button"
          className="px-4 py-3 bg-cyan-500 text-white font-semibold rounded text-sm hover:bg-cyan-600 transition-colors"
          onClick={() =>
            navigate(`/Institute/InspectionRequest?P1=${p1}&P2=${p2}`)
          }
        >
          Back
        </button>

        {isLocked ? (
          <button
            className="bg-green-600 px-6 py-2 text-white rounded"
            onClick={() =>
              navigate(`/DVETO/InspectionReport?p1=${p2}&p2=${p1}`)
            }
          >
            Save and Next
          </button>
        ) : (
          <button
            type="button"
            className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save and Next"}
          </button>
        )}

        <button
          type="button"
          className="px-4 py-3 bg-gray-600 text-white font-semibold rounded text-sm hover:bg-gray-700 transition-colors"
          onClick={() => {
            if(userTypeID==14){
                              navigate(`/DVETO/InspectionReport?p1=${p2}&p2=${p1}`);
                        } else {
                            navigate(`/DVETO/InspectionReport?p1=${p2}&p2=${p1}`)
                        }
                    }}
        >
          Close
        </button>
        {/*    </>*/}
        {/*)}*/}
      </div>
    </div>
  );
};

export default UnitsForInspection;
