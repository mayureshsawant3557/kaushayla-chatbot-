import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Swal from "sweetalert2";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import UploadPdf from "../../formcomponent/UploadPdf";
import FormComponent from "../../formcomponent/FormComponent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { useLoading } from "../../../Hooks/useLoading";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import { ThemeContext } from "../../Context/ThemeContext";
import {
  GetMasterSubFacilityGroup,
  SaveFacilityDetails,
  GetSubFacilityDetails,
  SaveSubFacilityDetail,
  DeleteSubFacilityDetail,
  GetOtherInfraDetails,
  SaveOtherInfraDetails,
  DeleteCommonPhotoPath,
} from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import agent from "../../../lib/api/agent";

import { useInspectionLock } from "../../../Hooks/useInspectionLock";
import { UpdateInstituteInspectionVerificationStatus } from "../../../Endpoints_All/Base/DVETO";
import InspectionStatusComponent from "../../formcomponent/InspectionStatusComponent";
import { useAuth } from "../../../Hooks/AuthContext";


import InstituteFlowLayout from "../../../Component/InstituteFlow/InstituteFlowLayout";
import { usePagePermission } from "../../../Hooks/usePagePermission";
import { useInstituteFlow } from "../../../Hooks/useInstituteFlow";

const CommonFacility = () => {
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const p1 = searchParams.get("P1");
  const p2 = searchParams.get("P2");


    const { goNext, goBack, handleClose } = useInstituteFlow(
        "Power",
        p1,
        p2
    );

  const [inspectionStatus, setInspectionStatus] = useState({
    status: "",
    remark: "",
  });

    const {
        // userTypeID,
        isViewer,
        canEdit,
        canSave,
    } = usePagePermission();

  // User and Institute State
  const [userLoginID, setUserLoginID] = useState("");
  const [userTypeID, setUserTypeID] = useState("");
  const [userID, setUserID] = useState("");
  const [instituteID, setInstituteID] = useState(null);
  const [ipAddress, setIpAddress] = useState("");
  const inspectionref = useRef();
  const { userInfo } = useAuth();

  // Common Facility State
  const [commonFacilityData, setCommonFacilityData] = useState([]);
  const [originalCommonFacilityData, setOriginalCommonFacilityData] = useState(
    [],
  );
  //const [fieldsDisabled, setFieldsDisabled] = useState(isLocked);

  // Class Room State
  const [classRoomData, setClassRoomData] = useState([]);
  const [originalClassRoomData, setOriginalClassRoomData] = useState([]);

  // Drawing Hall State
  const [drawingHallData, setDrawingHallData] = useState([]);
  const [originalDrawingHallData, setOriginalDrawingHallData] = useState([]);

  // Computer Lab State
  const [computerLabData, setComputerLabData] = useState([]);
  const [originalComputerLabData, setOriginalComputerLabData] = useState([]);

  // Other Facility State
  const [otherFacilityData, setOtherFacilityData] = useState({
    isWaterSupply: "",
    sourceofWaterSupplyID: "",
    otherSourceofWaterSupply: "",
    waterSupplyPhoto: "",
    waterSupplyPhotoFileName: "",
    boardPhoto: "",
    boardPhotoFileName: "",
    InternetConnectivity: "", //added
    CctvAvailable: "", //added
  });
  const [originalOtherFacilityData, setOriginalOtherFacilityData] = useState(
    {},
  );

  const [waterSupplyOptions] = useState([
    { value: "1", label: "Yes" },
    { value: "0", label: "No" },
  ]);
  const [InternetConnectivityOptions] = useState([
    { value: "1", label: "Yes" },
    { value: "0", label: "No" },
  ]);
  const [CctvAvailable] = useState([
    { value: "1", label: "Yes" },
    { value: "0", label: "No" },
  ]);

  const [waterSourceOptions] = useState([
    { value: "1", label: "Local Body" },
    { value: "2", label: "Well" },
    { value: "3", label: "Bore Well" },
    { value: "4", label: "Other" },
  ]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  // Fetch User and Institute Details
  useEffect(() => {
    fetchUserAndInstituteDetails();
    fetchIP();
  }, []);

  // Fetch data when instituteID is set
  useEffect(() => {
    if (instituteID) {
      fetchCommonFacilityData();
      fetchSubFacilityData();
      fetchOtherInfraData();
    }
  }, [instituteID]);

  const { isLocked, eligibilityData } = useInspectionLock(
    instituteID,
    userLoginID,
    "CommonFacility",
  );

  const fetchUserAndInstituteDetails = async () => {
    try {
      const loginID = userInfo?.UserLoginID;
      const UserID = userInfo?.UserID;

      const typeID =
        userInfo?.UserTypeID || localStorage.getItem("userTypeID") || "1";
      setUserLoginID(loginID);
      setUserTypeID(typeID);
      setUserID(UserID);

      // DVETO dashboard case
      if (typeID === 14 || (typeID === 81 && p1) || (typeID === 501 && p1)) {
        setInstituteID(p1);
        return;
      }

      const resInstitute = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
      );

      if (resInstitute.data?.Data) {
        const instID = resInstitute.data.Data;
        setInstituteID(instID);
      } else {
        console.warn("Institute not found for UserLoginID:", loginID);
      }
    } catch (error) {
      console.error("Error fetching user and institute details:", error);
    }
  };

  const fetchIP = async () => {
    try {
      const response = await agent.get(getIp, {
        headers: {
          accept: "*/*",
        },
      });

      if (response.data?.ip) {
        setIpAddress(response.data.ip);
      } else {
        console.warn("IP address not found in response");
        setIpAddress("0.0.0.0");
      }
    } catch (error) {
      console.error("Error fetching IP:", error);
      setIpAddress("0.0.0.0");
    }
  };

  // Fetch Common Facility Data (Master)
  const fetchCommonFacilityData = async () => {
    try {
      startLoading();
      const response = await agent.get(
        `${GetMasterSubFacilityGroup}?InstituteID=${instituteID}`,
      );

      if (
        response.data?.Status === "Success" &&
        response.data?.Data?.lstcommonSubFacilityEntities
      ) {
        const facilities = response.data.Data.lstcommonSubFacilityEntities;
        setCommonFacilityData(facilities);
        setOriginalCommonFacilityData(JSON.parse(JSON.stringify(facilities)));

        // const hasDisabledFields = facilities.some(f => !f.IsEditAllowed);
        // setFieldsDisabled(hasDisabledFields);
      }
    } catch (error) {
      console.error("Error fetching common facility data:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch common facility data",
        icon: "error",
      });
    } finally {
      stopLoading();
    }
  };

  // Fetch Sub Facility Data (Class Room, Drawing Hall, Computer Lab)
  const fetchSubFacilityData = async () => {
    try {
      const response = await agent.get(
        `${GetSubFacilityDetails}?instituteId=${instituteID}&userloginid=${userLoginID}`,
      );

      if (response.data?.Status === "Success" && response.data?.Data) {
        const allData = response.data.Data;

        const classRooms = allData.filter(
          (item) => item.SubFacilityGroup === "Common Class Room",
        );
        const drawingHalls = allData.filter(
          (item) => item.SubFacilityGroup === "Common Drawing Hall",
        );
        const computerLabs = allData.filter(
          (item) => item.SubFacilityGroup === "Common Computer Lab",
        );

        setClassRoomData(classRooms);
        setOriginalClassRoomData(JSON.parse(JSON.stringify(classRooms)));

        setDrawingHallData(drawingHalls);
        setOriginalDrawingHallData(JSON.parse(JSON.stringify(drawingHalls)));

        setComputerLabData(computerLabs);
        setOriginalComputerLabData(JSON.parse(JSON.stringify(computerLabs)));
      }
    } catch (error) {
      console.error("Error fetching sub facility data:", error);
    }
  };

  // Fetch Other Infrastructure Data
  const fetchOtherInfraData = async () => {
    try {
      const response = await agent.get(
        `${GetOtherInfraDetails}?InstituteID=${instituteID}`,
      );
      if (response.data?.Status === "Success" && response.data?.Data) {
        const data = response.data.Data;
        const otherData = {
          isWaterSupply: data.IsWaterSupply?.toString() || "",
          sourceofWaterSupplyID: data.SourceofWaterSupplyID?.toString() || "",
          otherSourceofWaterSupply: data.OtherSourceofWaterSupply || "",
          waterSupplyPhoto: data.WaterSupplyPhoto || "",
          waterSupplyPhotoFileName: data.WaterSupplyPhoto
            ? data.WaterSupplyPhoto.split("/").pop()
            : "",
          boardPhoto: data.BoardPhoto || "",
          boardPhotoFileName: data.BoardPhoto
            ? data.BoardPhoto.split("/").pop()
            : "",
          InternetConnectivity: data.InternetConnectivity?.toString() || "",
          CctvAvailable: data.CctvAvailable?.toString() || "",
        };
        setOtherFacilityData(otherData);
        setOriginalOtherFacilityData(JSON.parse(JSON.stringify(otherData)));
      }
    } catch (error) {
      console.error("Error fetching other infra data:", error);
    }
  };

  // Check if data has been modified
  const hasCommonFacilityChanged = (item, originalItem) => {
    if (!originalItem) return true; // New entry
    return (
      item.AvailableSpace !== originalItem.AvailableSpace ||
      item.PhotoPath !== originalItem.PhotoPath
    );
  };

  const hasSubFacilityChanged = (item, originalArray) => {
    if (item.Id === 0) return true; // New entry
    const originalItem = originalArray.find((orig) => orig.Id === item.Id);
    if (!originalItem) return true;
    return (
      item.AvailableSpace !== originalItem.AvailableSpace ||
      item.PhotoPath !== originalItem.PhotoPath
    );
  };

  const hasOtherFacilityChanged = () => {
    return (
      JSON.stringify(otherFacilityData) !==
      JSON.stringify(originalOtherFacilityData)
    );
  };

  // Handle Common Facility Available Space Change
  //const handleCommonFacilitySpaceChange = (index, value) => {
  //    const updatedData = [...commonFacilityData];
  //    updatedData[index].AvailableSpace = parseFloat(value) || 0;
  //    updatedData[index].SpaceVariation = updatedData[index].AvailableSpace - updatedData[index].RequiredFinalSpace;
  //    setCommonFacilityData(updatedData);
  //};
  //const handleCommonFacilitySpaceChange = (index, value) => {
  //    const updatedData = [...commonFacilityData];
  //    const parsed = value === '' ? '' : parseFloat(value);
  //    updatedData[index].AvailableSpace = isNaN(parsed) ? '' : (parsed < 0 ? 0 : parsed);
  //    updatedData[index].SpaceVariation = updatedData[index].AvailableSpace === '' ? '' : updatedData[index].AvailableSpace - updatedData[index].RequiredFinalSpace;
  //    setCommonFacilityData(updatedData);
  //};
  const handleCommonFacilitySpaceChange = async (index, value) => {
    const updatedData = [...commonFacilityData];
    const parsed = value === "" ? "" : parseFloat(value);
    updatedData[index].AvailableSpace = isNaN(parsed)
      ? ""
      : parsed < 0
        ? 0
        : parsed;
    updatedData[index].SpaceVariation =
      updatedData[index].AvailableSpace === ""
        ? ""
        : updatedData[index].AvailableSpace -
          updatedData[index].RequiredFinalSpace;

    // If user enters 0 and photo already exists, call delete API
    if (parsed === 0 && updatedData[index].PhotoPath) {
      try {
        const payload = {
          instituteId: instituteID,
          pageCode: "COMMONFACILITY",
          userLoginID: userLoginID,
          ipAddress: ipAddress,
          // fill other required fields with defaults
          workshopId: 0,
          courseID: 0,
          courseCode: "",
          course: "",
          courseCodeName: "",
          inspectionUnits: 0,
          maxTraningSetupRequired: 0,
          perSetupNorm: 0,
          requiredSpace: 0,
          spaceAvailable: 0,
          spaceAvailability: 0,
          approvedUnits: 0,
          proposedUnits: 0,
          totalUnits: 0,
          floorId: 0,
          floorPref: "",
          workSpaceForApprovedUnits: 0,
          workSpaceForProposedUnits: 0,
          workSpaceForTotalUnits: 0,
          availableWorkshopSpace: 0,
          workshopSpaceVariation: 0,
          availableFloorId: 0,
          availableFloorPref: "",
          floorPrefVariation: "",
          workshopPhotoPath: updatedData[index].PhotoPath,
          workshopxml: "",
          isEditAllowed: true,
          lastModifiedOn: new Date().toISOString(),
          modelCurriculum: "",
        };
        await agent.post(DeleteCommonPhotoPath, payload);
        updatedData[index].PhotoPath = "";
        updatedData[index].PhotoFileName = "";
      } catch (err) {
        console.error("Error deleting common facility photo:", err);
      }
    }

    // If 0, clear photo fields regardless (even if delete fails or no photo)
    if (parsed === 0) {
      updatedData[index].PhotoPath = "";
      updatedData[index].PhotoFileName = "";
    }

    setCommonFacilityData(updatedData);
  };

  // Handle Common Facility Photo Upload
  const handleCommonFacilityPhotoChange = (index, fileData) => {
    const updatedData = [...commonFacilityData];
    updatedData[index].PhotoPath =
      fileData.filePath || fileData.uniqueFileName || "";
    updatedData[index].PhotoFileName = fileData.fileName || "";
    setCommonFacilityData(updatedData);
  };

  // Handle Sub Facility Space Change
  //const handleSubFacilitySpaceChange = (facilityType, index, value) => {
  //    if (facilityType === 'classRoom') {
  //        const updatedData = [...classRoomData];
  //        updatedData[index].AvailableSpace = parseFloat(value) || 0;
  //        setClassRoomData(updatedData);
  //    } else if (facilityType === 'drawingHall') {
  //        const updatedData = [...drawingHallData];
  //        updatedData[index].AvailableSpace = parseFloat(value) || 0;
  //        setDrawingHallData(updatedData);
  //    } else if (facilityType === 'computerLab') {
  //        const updatedData = [...computerLabData];
  //        updatedData[index].AvailableSpace = parseFloat(value) || 0;
  //        setComputerLabData(updatedData);
  //    }
  //};

  //const handleSubFacilitySpaceChange = (facilityType, index, value) => {
  //    const parsed = value === '' ? '' : parseFloat(value);
  //    const sanitized = isNaN(parsed) ? '' : (parsed < 0 ? 0 : parsed);

  //    if (facilityType === 'classRoom') {
  //        const updatedData = [...classRoomData];
  //        updatedData[index].AvailableSpace = sanitized;
  //        setClassRoomData(updatedData);
  //    } else if (facilityType === 'drawingHall') {
  //        const updatedData = [...drawingHallData];
  //        updatedData[index].AvailableSpace = sanitized;
  //        setDrawingHallData(updatedData);
  //    } else if (facilityType === 'computerLab') {
  //        const updatedData = [...computerLabData];
  //        updatedData[index].AvailableSpace = sanitized;
  //        setComputerLabData(updatedData);
  //    }
  //};
  const handleSubFacilitySpaceChange = async (facilityType, index, value) => {
    const parsed = value === "" ? "" : parseFloat(value);
    const sanitized = isNaN(parsed) ? "" : parsed < 0 ? 0 : parsed;

    const getUpdatedData = () => {
      if (facilityType === "classRoom") return [...classRoomData];
      if (facilityType === "drawingHall") return [...drawingHallData];
      return [...computerLabData];
    };

    const setData = (data) => {
      if (facilityType === "classRoom") setClassRoomData(data);
      else if (facilityType === "drawingHall") setDrawingHallData(data);
      else setComputerLabData(data);
    };

    const updatedData = getUpdatedData();
    updatedData[index].AvailableSpace = sanitized;

    // If user enters 0 and row has an existing saved ID with photo, call delete
    if (
      parsed === 0 &&
      updatedData[index].PhotoPath &&
      updatedData[index].Id !== 0
    ) {
      try {
        await agent.post(
          `${DeleteSubFacilityDetail}?id=${updatedData[index].Id}&instituteId=${instituteID}&userloginid=${userLoginID}`,
        );
        updatedData[index].PhotoPath = "";
        updatedData[index].PhotoFileName = "";
        updatedData[index].Id = 0; // reset so it saves fresh
      } catch (err) {
        console.error("Error deleting sub facility on 0 entry:", err);
      }
    }

    // If 0, always clear photo
    if (parsed === 0) {
      updatedData[index].PhotoPath = "";
      updatedData[index].PhotoFileName = "";
    }

    setData(updatedData);
  };

  // Handle Sub Facility Photo Upload
  const handleSubFacilityPhotoChange = (facilityType, index, fileData) => {
    if (facilityType === "classRoom") {
      const updatedData = [...classRoomData];
      updatedData[index].PhotoPath =
        fileData.filePath || fileData.uniqueFileName || "";
      updatedData[index].PhotoFileName = fileData.fileName || "";
      setClassRoomData(updatedData);
    } else if (facilityType === "drawingHall") {
      const updatedData = [...drawingHallData];
      updatedData[index].PhotoPath =
        fileData.filePath || fileData.uniqueFileName || "";
      updatedData[index].PhotoFileName = fileData.fileName || "";
      setDrawingHallData(updatedData);
    } else if (facilityType === "computerLab") {
      const updatedData = [...computerLabData];
      updatedData[index].PhotoPath =
        fileData.filePath || fileData.uniqueFileName || "";
      updatedData[index].PhotoFileName = fileData.fileName || "";
      setComputerLabData(updatedData);
    }
  };

  // Add New Row for Sub Facility with validation
  //const addNewSubFacilityRow = (facilityType) => {
  //    let currentData = [];

  //    if (facilityType === 'classRoom') {
  //        currentData = classRoomData;
  //    } else if (facilityType === 'drawingHall') {
  //        currentData = drawingHallData;
  //    } else if (facilityType === 'computerLab') {
  //        currentData = computerLabData;
  //    }

  //    // Check if there's any unfilled row
  //    const unfilledRow = currentData.find(row =>
  //        !row.AvailableSpace || row.AvailableSpace <= 0
  //    );

  //    if (unfilledRow) {
  //        Swal.fire({
  //            title: "Validation Error",
  //            text: "Please fill the existing row before adding a new one",
  //            icon: "warning"
  //        });
  //        return;
  //    }

  //    const newRow = {
  //        Id: 0,
  //        InstituteId: instituteID,
  //        FacilityGroupId: 4,
  //        SubFacilityGroupId: facilityType === 'classRoom' ? 6 : facilityType === 'drawingHall' ? 7 : 8,
  //        FacilityGroup: "Class Rooms",
  //        SubFacilityGroup: facilityType === 'classRoom' ? "Class Room" : facilityType === 'drawingHall' ? "Drawing Hall" : "Computer Lab",
  //        AvailableSpace: '',
  //        PhotoPath: '',
  //        PhotoFileName: '',
  //        IsActive: true,
  //        isNew: true
  //    };

  //    if (facilityType === 'classRoom') {
  //        setClassRoomData([...classRoomData, newRow]);
  //    } else if (facilityType === 'drawingHall') {
  //        setDrawingHallData([...drawingHallData, newRow]);
  //    } else if (facilityType === 'computerLab') {
  //        setComputerLabData([...computerLabData, newRow]);
  //    }
  //};

  const addNewSubFacilityRow = (facilityType) => {
    let currentData;
    let facilityName;

    if (facilityType === "classRoom") {
      currentData = classRoomData;
      facilityName = "Common Class Room";
    } else if (facilityType === "drawingHall") {
      currentData = drawingHallData;
      facilityName = "Common Drawing Hall";
    } else if (facilityType === "computerLab") {
      currentData = computerLabData;
      facilityName = "Common Computer Lab";
    }

    // Check if there's any row with partial data (only one field filled)
    const partialRow = currentData.find((row) => isRowPartial(row));

    if (partialRow) {
      const rowIndex = currentData.indexOf(partialRow) + 1;
      //const missingField = (partialRow.AvailableSpace && parseFloat(partialRow.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
      const missingField =
        partialRow.AvailableSpace !== "" &&
        partialRow.AvailableSpace !== null &&
        !isNaN(parseFloat(partialRow.AvailableSpace))
          ? "Photo"
          : "Available Space";

      Swal.fire({
        title: "Incomplete Row",
        html: `<div style="text-align: left;">
                <p>Please complete <strong>Row ${rowIndex}</strong> before adding a new row.</p>
                <p style="margin-top: 10px;">Missing: <strong>${missingField}</strong></p>
            </div>`,
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // Check if there's any completely empty row (no data at all)
    //const emptyRow = currentData.find(row => {
    //    const hasNoSpace = !row.AvailableSpace || parseFloat(row.AvailableSpace) === 0;
    //    const hasNoPhoto = !row.PhotoPath || row.PhotoPath.trim() === '';
    //    return hasNoSpace && hasNoPhoto;
    //});
    const emptyRow = currentData.find((row) => {
      const spaceValue = row.AvailableSpace;
      const hasNoSpace =
        spaceValue === "" ||
        spaceValue === null ||
        spaceValue === undefined ||
        isNaN(parseFloat(spaceValue));
      const hasNoPhoto = !row.PhotoPath || row.PhotoPath.trim() === "";
      // Only flag as empty if BOTH are missing AND space isn't explicitly 0
      return hasNoSpace && hasNoPhoto;
    });

    if (emptyRow) {
      const rowIndex = currentData.indexOf(emptyRow) + 1;

      Swal.fire({
        title: "Empty Row Found",
        html: `<div style="text-align: left;">
                <p>Please fill <strong>Row ${rowIndex}</strong> or delete it before adding a new row.</p>
            </div>`,
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // All rows are complete, allow adding new row
    const newRow = {
      Id: 0,
      InstituteId: instituteID,
      FacilityGroupId: 4,
      SubFacilityGroupId:
        facilityType === "classRoom"
          ? 6
          : facilityType === "drawingHall"
            ? 7
            : 8,
      FacilityGroup: "Class Rooms",
      SubFacilityGroup:
        facilityType === "classRoom"
          ? "Common Class Room"
          : facilityType === "drawingHall"
            ? "Common Drawing Hall"
            : "Common Computer Lab",
      AvailableSpace: "",
      PhotoPath: "",
      PhotoFileName: "",
      IsActive: true,
      isNew: true,
    };

    if (facilityType === "classRoom") {
      setClassRoomData([...classRoomData, newRow]);
    } else if (facilityType === "drawingHall") {
      setDrawingHallData([...drawingHallData, newRow]);
    } else if (facilityType === "computerLab") {
      setComputerLabData([...computerLabData, newRow]);
    }

    // Success message (optional)
    //Swal.fire({
    //    title: 'Row Added',
    //    text: `New ${facilityName} row added successfully`,
    //    icon: 'success',
    //    timer: 1500,
    //    showConfirmButton: false
    //});
  };

  // Delete Sub Facility
  const deleteSubFacility = async (id, facilityType, index) => {
    try {
      if (id === 0) {
        // Remove from local state if not saved
        if (facilityType === "classRoom") {
          const updatedData = classRoomData.filter((_, idx) => idx !== index);
          setClassRoomData(updatedData);
        } else if (facilityType === "drawingHall") {
          const updatedData = drawingHallData.filter((_, idx) => idx !== index);
          setDrawingHallData(updatedData);
        } else if (facilityType === "computerLab") {
          const updatedData = computerLabData.filter((_, idx) => idx !== index);
          setComputerLabData(updatedData);
        }
        return;
      }

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You want to delete this facility?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        startLoading();
        const response = await agent.post(
          `${DeleteSubFacilityDetail}?id=${id}&instituteId=${instituteID}&userloginid=${userLoginID}`,
        );

        if (response.data?.Status === "Success") {
          Swal.fire({
            title: "Deleted!",
            text: "Facility has been deleted.",
            icon: "success",
            timer: 2000,
          });
          fetchSubFacilityData();
        }
      }
    } catch (error) {
      console.error("Error deleting facility:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to delete facility",
        icon: "error",
      });
    } finally {
      stopLoading();
    }
  };

  // Handle Other Facility Photo Upload
  const handleWaterSupplyPhotoChange = (fileData) => {
    setOtherFacilityData((prev) => ({
      ...prev,
      waterSupplyPhoto: fileData.filePath || fileData.uniqueFileName || "",
      waterSupplyPhotoFileName: fileData.fileName || "",
    }));
    setErrors((prev) => ({ ...prev, waterSupplyPhoto: "" }));
  };

  const handleBoardPhotoChange = (fileData) => {
    setOtherFacilityData((prev) => ({
      ...prev,
      boardPhoto: fileData.filePath || fileData.uniqueFileName || "",
      boardPhotoFileName: fileData.fileName || "",
    }));
    setErrors((prev) => ({ ...prev, boardPhoto: "" }));
  };

  // Open Document Popup
  const openDocumentPopup = (documentUrl, itemName) => {
    if (!documentUrl) {
      Swal.fire({
        title: "No Document",
        text: "No document available to view.",
        icon: "info",
      });
      return;
    }

    const popupWidth = 900;
    const popupHeight = 700;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const popup = window.open(
      "",
      `${itemName}_PDF_Viewer`,
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`,
    );

    if (popup) {
      popup.document.write(`
                <html>
                    <head>
                        <title>${itemName} Document Viewer</title>
                        <style>
                            body { margin: 0; overflow: hidden; }
                            iframe { border: none; width: 100vw; height: 100vh; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${documentUrl}" frameborder="0"></iframe>
                    </body>
                </html>
            `);
      popup.document.close();
      popup.focus();
    } else {
      Swal.fire({
        title: "Popup Blocked",
        text: "Please allow popups for this website to view the PDF.",
        icon: "error",
      });
    }
  };

  // to check if row is complete
  //  row has complete data
  //const isRowComplete = (item) => {
  //    const hasAvailableSpace = item.AvailableSpace && parseFloat(item.AvailableSpace) > 0;
  //    const hasPhoto = item.PhotoPath && item.PhotoPath.trim() !== '';
  //    return hasAvailableSpace && hasPhoto;
  //};

  // Check if a row has complete data (both fields filled)
  //const isRowComplete = (item) => {
  //    const hasAvailableSpace = item.AvailableSpace && parseFloat(item.AvailableSpace) > 0;
  //    const hasPhoto = item.PhotoPath && item.PhotoPath.trim() !== '';
  //    return hasAvailableSpace && hasPhoto;
  //};
  const isRowComplete = (item) => {
    const spaceValue = item.AvailableSpace;
    const hasAvailableSpace =
      spaceValue !== "" &&
      spaceValue !== null &&
      spaceValue !== undefined &&
      !isNaN(parseFloat(spaceValue));
    const parsedSpace = parseFloat(spaceValue);
    const hasPhoto = item.PhotoPath && item.PhotoPath.trim() !== "";

    // If space is 0, photo is NOT required
    if (hasAvailableSpace && parsedSpace === 0) return true;

    // If space > 0, both space and photo are required
    return hasAvailableSpace && hasPhoto;
  };

  // Check if a row has partial data (only one field filled)
  //const isRowPartial = (item) => {
  //    const hasAvailableSpace = item.AvailableSpace && parseFloat(item.AvailableSpace) > 0;
  //    const hasPhoto = item.PhotoPath && item.PhotoPath.trim() !== '';
  //    return (hasAvailableSpace && !hasPhoto) || (!hasAvailableSpace && hasPhoto);
  //};

  const isRowPartial = (item) => {
    const spaceValue = item.AvailableSpace;
    const hasAvailableSpace =
      spaceValue !== "" &&
      spaceValue !== null &&
      spaceValue !== undefined &&
      !isNaN(parseFloat(spaceValue));
    const parsedSpace = parseFloat(spaceValue);
    const hasPhoto = item.PhotoPath && item.PhotoPath.trim() !== "";

    // If space is 0, never partial (photo not required)
    if (hasAvailableSpace && parsedSpace === 0) return false;

    // If space > 0 but no photo, or no space but has photo → partial
    return (hasAvailableSpace && !hasPhoto) || (!hasAvailableSpace && hasPhoto);
  };

  // Common Facility Columns for FilteredTableComponent

  const saveAllData = async () => {
    if (isLocked) {
      navigate("/Institute/PowerDetails");
      return;
      }
      if (isViewer || !canSave) {
          goNext();
          return;
      }
    try {
      startLoading();
      let hasErrors = false;
      const errors = [];

      const partialCommonFacilities = commonFacilityData.filter((item) =>
        isRowPartial(item),
      );
      if (partialCommonFacilities.length > 0) {
        partialCommonFacilities.forEach((item) => {
          //const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
          const missingField =
            item.AvailableSpace !== "" &&
            item.AvailableSpace !== null &&
            !isNaN(parseFloat(item.AvailableSpace))
              ? "Photo"
              : "Available Space";

          errors.push(
            `${item.SubFacilityGroup}: Please provide ${missingField}`,
          );
        });
        hasErrors = true;
      }

      const modifiedCommonFacilities = commonFacilityData.filter(
        (item, index) => {
          const originalItem = originalCommonFacilityData[index];
          const hasChanged = hasCommonFacilityChanged(item, originalItem);
          const isComplete = isRowComplete(item);

          return hasChanged && isComplete;
        },
      );

      if (modifiedCommonFacilities.length > 0 && !hasErrors) {
        let facilityXmlData = "<DataList>";

        modifiedCommonFacilities.forEach((facilityItem) => {
          facilityXmlData += "<Data>";
          facilityXmlData += `<SubFacilityGroupId>${facilityItem.SubFacilityGroupId || 0}</SubFacilityGroupId>`;
          facilityXmlData += `<AvailableNumber>${facilityItem.AvailableNumber || 0}</AvailableNumber>`;
          facilityXmlData += `<AvailableSpace>${parseFloat(facilityItem.AvailableSpace) || 0}</AvailableSpace>`;
          facilityXmlData += `<PhotoPath><![CDATA[${facilityItem.PhotoPath || ""}]]></PhotoPath>`;
          facilityXmlData += "</Data>";
        });

        facilityXmlData += "</DataList>";

        if (modifiedCommonFacilities.length > 0 && !hasErrors) {
          const commonFacilityPromises = modifiedCommonFacilities.map(
            (facilityItem) => {
              const payload = {
                instituteId: instituteID,
                facilityGroupId: facilityItem.FacilityGroupId || 0,
                facilityGroup: facilityItem.FacilityGroup || "",
                subFacilityGroupId: facilityItem.SubFacilityGroupId || 0,
                subFacilityGroup: facilityItem.SubFacilityGroup || "",
                requiredNumber: facilityItem.RequiredNumber || 0,
                requiredSpace: facilityItem.RequiredSpace || 0,
                availableNumber: facilityItem.AvailableNumber || 0,
                availableSpace: parseFloat(facilityItem.AvailableSpace) || 0,
                numberVariation: facilityItem.NumberVariation || 0,
                spaceVariation: facilityItem.SpaceVariation || 0,
                hasMultiplyFactor: facilityItem.HasMultiplyFactor || false,
                requiredFinalSpace: facilityItem.RequiredFinalSpace || 0,
                isActive: true,
                isEditAllowed: true,
                lastModifiedOn: new Date().toISOString(),
                userLoginID: userLoginID,
                ipAddress: ipAddress,
                photoPath: facilityItem.PhotoPath || "",
                facilityXml: facilityXmlData,
                trainingEquipmentPhoto: "null",
              };

              return agent.post(SaveFacilityDetails, payload);
            },
          );

          try {
            const responses = await Promise.all(commonFacilityPromises);
          } catch (error) {
            console.error("Common Facility save error:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            });
            errors.push(
              `Common Facility save failed: ${error.response?.data?.Message || error.message}`,
            );
            hasErrors = true;
          }
        }
      }

      //const partialClassRooms = classRoomData.filter(item => isRowPartial(item));
      //if (partialClassRooms.length > 0) {
      //    partialClassRooms.forEach((item) => {
      //        const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
      //        errors.push(`Class Room (Row ${classRoomData.indexOf(item) + 1}): Please provide ${missingField}`);
      //    });
      //    hasErrors = true;
      //}
      const partialClassRooms = classRoomData.filter((item) =>
        isRowPartial(item),
      );
      if (partialClassRooms.length > 0) {
        partialClassRooms.forEach((item) => {
          //const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
          const missingField =
            item.AvailableSpace !== "" &&
            item.AvailableSpace !== null &&
            !isNaN(parseFloat(item.AvailableSpace))
              ? "Photo"
              : "Available Space";

          errors.push(
            `Class Room (Row ${classRoomData.indexOf(item) + 1}): Please provide ${missingField}`,
          );
        });
        hasErrors = true;
      }

      // ✅ NEW: Validate AvailableSpace is filled for all IsCourse rows
      const emptyAvailableClassRooms = classRoomData.filter(
        (item) =>
          (item.IsCourse === 1 || item.IsCourse === true) &&
          //(!item.AvailableSpace || parseFloat(item.AvailableSpace) <= 0)
          (item.AvailableSpace === "" ||
            item.AvailableSpace === null ||
            item.AvailableSpace === undefined ||
            isNaN(parseFloat(item.AvailableSpace))),
      );
      if (emptyAvailableClassRooms.length > 0) {
        emptyAvailableClassRooms.forEach((item) => {
          errors.push(
            `Class Room (Row ${classRoomData.indexOf(item) + 1}) [${item.CourseName || item.SubFacilityGroup}]: Available Space is required`,
          );
        });
        hasErrors = true;
      }
      const modifiedClassRooms = classRoomData.filter((item) => {
        const hasChanged = hasSubFacilityChanged(item, originalClassRoomData);
        const isComplete = isRowComplete(item);
        return hasChanged && isComplete;
      });

      if (modifiedClassRooms.length > 0 && !hasErrors) {
        const facilityData = modifiedClassRooms.map((row) => ({
          id: row.Id || 0,
          availableSpace: parseFloat(row.AvailableSpace),
          photoPath: row.PhotoPath || "",
        }));

        const payload = {
          instituteId: instituteID,
          subFacilityGroupId: 6,
          facilityData: facilityData,
          userLoginID: userID,
          userIPAddress: ipAddress,
        };

        try {
          const response = await agent.post(SaveSubFacilityDetail, payload);
        } catch (error) {
          console.error("Class Room save error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          errors.push(
            `Class Room save failed: ${error.response?.data?.Message || error.message}`,
          );
          hasErrors = true;
        }
      }

      //const partialDrawingHalls = drawingHallData.filter(item => isRowPartial(item));
      //if (partialDrawingHalls.length > 0) {
      //    partialDrawingHalls.forEach((item) => {
      //        const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
      //        errors.push(`Drawing Hall (Row ${drawingHallData.indexOf(item) + 1}): Please provide ${missingField}`);
      //    });
      //    hasErrors = true;
      //}
      const partialDrawingHalls = drawingHallData.filter((item) =>
        isRowPartial(item),
      );
      if (partialDrawingHalls.length > 0) {
        partialDrawingHalls.forEach((item) => {
          //const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
          const missingField =
            item.AvailableSpace !== "" &&
            item.AvailableSpace !== null &&
            !isNaN(parseFloat(item.AvailableSpace))
              ? "Photo"
              : "Available Space";

          errors.push(
            `Drawing Hall (Row ${drawingHallData.indexOf(item) + 1}): Please provide ${missingField}`,
          );
        });
        hasErrors = true;
      }

      // ✅ NEW: Validate AvailableSpace is filled for all IsCourse rows
      const emptyAvailableDrawingHalls = drawingHallData.filter(
        (item) =>
          (item.IsCourse === 1 || item.IsCourse === true) &&
          //(!item.AvailableSpace || parseFloat(item.AvailableSpace) <= 0)
          (item.AvailableSpace === "" ||
            item.AvailableSpace === null ||
            item.AvailableSpace === undefined ||
            isNaN(parseFloat(item.AvailableSpace))),
      );
      if (emptyAvailableDrawingHalls.length > 0) {
        emptyAvailableDrawingHalls.forEach((item) => {
          errors.push(
            `Drawing Hall (Row ${drawingHallData.indexOf(item) + 1}) [${item.CourseName || item.SubFacilityGroup}]: Available Space is required`,
          );
        });
        hasErrors = true;
      }

      const modifiedDrawingHalls = drawingHallData.filter((item) => {
        const hasChanged = hasSubFacilityChanged(item, originalDrawingHallData);
        const isComplete = isRowComplete(item);
        return hasChanged && isComplete;
      });

      if (modifiedDrawingHalls.length > 0 && !hasErrors) {
        const facilityData = modifiedDrawingHalls.map((row) => ({
          id: row.Id || 0,
          availableSpace: parseFloat(row.AvailableSpace),
          photoPath: row.PhotoPath || "",
        }));

        const payload = {
          instituteId: instituteID,
          subFacilityGroupId: 7,
          facilityData: facilityData,
          userLoginID: userID,
          userIPAddress: ipAddress,
        };

        try {
          const response = await agent.post(SaveSubFacilityDetail, payload);
        } catch (error) {
          console.error("Drawing Hall save error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          errors.push(
            `Drawing Hall save failed: ${error.response?.data?.Message || error.message}`,
          );
          hasErrors = true;
        }
      }

      //const partialComputerLabs = computerLabData.filter(item => isRowPartial(item));
      //if (partialComputerLabs.length > 0) {
      //    partialComputerLabs.forEach((item) => {
      //        const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
      //        errors.push(`Computer Lab (Row ${computerLabData.indexOf(item) + 1}): Please provide ${missingField}`);
      //    });
      //    hasErrors = true;
      //}
      const partialComputerLabs = computerLabData.filter((item) =>
        isRowPartial(item),
      );
      if (partialComputerLabs.length > 0) {
        partialComputerLabs.forEach((item) => {
          //const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
          const missingField =
            item.AvailableSpace !== "" &&
            item.AvailableSpace !== null &&
            !isNaN(parseFloat(item.AvailableSpace))
              ? "Photo"
              : "Available Space";

          errors.push(
            `Computer Lab (Row ${computerLabData.indexOf(item) + 1}): Please provide ${missingField}`,
          );
        });
        hasErrors = true;
      }

      // ✅ NEW: Validate AvailableSpace is filled for all IsCourse rows
      const emptyAvailableComputerLabs = computerLabData.filter(
        (item) =>
          (item.IsCourse === 1 || item.IsCourse === true) &&
          //(!item.AvailableSpace || parseFloat(item.AvailableSpace) <= 0)
          (item.AvailableSpace === "" ||
            item.AvailableSpace === null ||
            item.AvailableSpace === undefined ||
            isNaN(parseFloat(item.AvailableSpace))),
      );
      if (emptyAvailableComputerLabs.length > 0) {
        emptyAvailableComputerLabs.forEach((item) => {
          errors.push(
            `Computer Lab (Row ${computerLabData.indexOf(item) + 1}) [${item.CourseName || item.SubFacilityGroup}]: Available Space is required`,
          );
        });
        hasErrors = true;
      }
      const modifiedComputerLabs = computerLabData.filter((item) => {
        const hasChanged = hasSubFacilityChanged(item, originalComputerLabData);
        const isComplete = isRowComplete(item);
        return hasChanged && isComplete;
      });

      if (modifiedComputerLabs.length > 0 && !hasErrors) {
        const facilityData = modifiedComputerLabs.map((row) => ({
          id: row.Id || 0,
          availableSpace: parseFloat(row.AvailableSpace),
          photoPath: row.PhotoPath || "",
        }));

        const payload = {
          instituteId: instituteID,
          subFacilityGroupId: 8,
          facilityData: facilityData,
          userLoginID: userID,
          userIPAddress: ipAddress,
        };

        try {
          const response = await agent.post(SaveSubFacilityDetail, payload);
        } catch (error) {
          console.error("Computer Lab save error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          errors.push(
            `Computer Lab save failed: ${error.response?.data?.Message || error.message}`,
          );
          hasErrors = true;
        }
      }

      // if (hasOtherFacilityChanged()) {
      const newErrors = {};

      if (!otherFacilityData.isWaterSupply) {
        newErrors.waterSupply = "Please select water supply availability";
      }
      if (!otherFacilityData.sourceofWaterSupplyID) {
        newErrors.waterSource = "Please select water source";
      }
      if (
        otherFacilityData.sourceofWaterSupplyID === "4" &&
        !otherFacilityData.otherSourceofWaterSupply
      ) {
        newErrors.otherSource = "Please enter other water source";
      }
      if (!otherFacilityData.waterSupplyPhoto) {
        newErrors.waterSupplyPhoto = "Please upload water supply photo";
      }
      if (!otherFacilityData.boardPhoto) {
        newErrors.boardPhoto = "Please upload name board photo";
      }
      if (!otherFacilityData.InternetConnectivity) {
        newErrors.InternetConnectivity = "Please select Internet Connectivity";
      }
      if (!otherFacilityData.CctvAvailable)
        newErrors.CctvAvailable = "Please select CCTV availability";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        errors.push("Other Facility: Please complete all required fields");
        hasErrors = true;
      } else {
        setErrors({});
        if (hasOtherFacilityChanged()) {
          const payload = {
            instituteId: instituteID,
            isWaterSupply: parseInt(otherFacilityData.isWaterSupply) || 0,
            internetConnectivity: parseInt(
              otherFacilityData.InternetConnectivity || 0,
            ),
            cctvAvailable: parseInt(otherFacilityData.CctvAvailable || 0),
            sourceofWaterSupplyID:
              parseInt(otherFacilityData.sourceofWaterSupplyID) || 0,
            sourceofWaterSupply:
              waterSourceOptions.find(
                (opt) => opt.value === otherFacilityData.sourceofWaterSupplyID,
              )?.label || "",
            otherSourceofWaterSupply:
              otherFacilityData.otherSourceofWaterSupply || "",
            waterSupplyPhoto: otherFacilityData.waterSupplyPhoto || "",
            isDisplayBoard: 0,
            isBoardasperNorms: 0,
            boardPhoto: otherFacilityData.boardPhoto || "",
            isEditAllowed: true,
            isPhotoRequired: true,
            lastModifiedOn: new Date().toISOString(),
            userLoginID: userLoginID,
            ipAddress: ipAddress,
            pageCode: "COMMONFACILITY",
          };

          try {
            const response = await agent.post(SaveOtherInfraDetails, payload);
            setErrors({});
          } catch (error) {
            console.error("Other Facility save error:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            });
            errors.push(
              `Other Facility save failed: ${error.response?.data?.Message || error.message}`,
            );
            hasErrors = true;
          }
        }
      }
      //}

      if (hasErrors) {
        Swal.fire({
          title: "Validation Error",
          html: `<div style="text-align: left;">
                    <p><strong>Please complete the following:</strong></p>
                    <ul style="margin-left: 20px;">
                        ${errors.map((err) => `<li>${err}</li>`).join("")}
                    </ul>
                </div>`,
          icon: "warning",
        });
      } else {
        await Swal.fire({
          title: "Success",
          text: "All facility details saved successfully",
          icon: "success",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/Institute/PowerDetails");
          }
        });

        // Refresh all data
        await fetchCommonFacilityData();
        await fetchSubFacilityData();
        await fetchOtherInfraData();

        // Navigate to next page
        // window.location.href = 'next-page';
      }
    } catch (error) {
      console.error("Error saving all data:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to save facility details: ${error.message}`,
        icon: "error",
      });
    } finally {
      stopLoading();
    }
  };

  const handleAdminSubmit = async () => {
    const isvalid = inspectionref.current?.validate();

    if (!isvalid) {
      return;
    }

    if (!inspectionStatus.status) {
      Swal.fire("Validation", "Please select status", "warning");
      return;
    }

    if (inspectionStatus.status === "R" && !inspectionStatus.remark) {
      Swal.fire("Validation", "Remark required when rejected", "warning");
      return;
    }

    if (isLocked) {
      navigate(`/Institute/PowerDetails?P1=${p1}&P2=${p2}`);
      return;
      }
      if (isViewer || !canSave) {
          goNext();
          return;
      }

    try {
      startLoading();

      try {
        // startLoading();
        let hasErrors = false;
        const errors = [];

        const partialCommonFacilities = commonFacilityData.filter((item) =>
          isRowPartial(item),
        );
        if (partialCommonFacilities.length > 0) {
          partialCommonFacilities.forEach((item) => {
            //const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
            const missingField =
              item.AvailableSpace !== "" &&
              item.AvailableSpace !== null &&
              !isNaN(parseFloat(item.AvailableSpace))
                ? "Photo"
                : "Available Space";

            errors.push(
              `${item.SubFacilityGroup}: Please provide ${missingField}`,
            );
          });
          hasErrors = true;
        }

        const modifiedCommonFacilities = commonFacilityData.filter(
          (item, index) => {
            const originalItem = originalCommonFacilityData[index];
            const hasChanged = hasCommonFacilityChanged(item, originalItem);
            const isComplete = isRowComplete(item);

            return hasChanged && isComplete;
          },
        );

        if (modifiedCommonFacilities.length > 0 && !hasErrors) {
          let facilityXmlData = "<DataList>";

          modifiedCommonFacilities.forEach((facilityItem) => {
            facilityXmlData += "<Data>";
            facilityXmlData += `<SubFacilityGroupId>${facilityItem.SubFacilityGroupId || 0}</SubFacilityGroupId>`;
            facilityXmlData += `<AvailableNumber>${facilityItem.AvailableNumber || 0}</AvailableNumber>`;
            facilityXmlData += `<AvailableSpace>${parseFloat(facilityItem.AvailableSpace) || 0}</AvailableSpace>`;
            facilityXmlData += `<PhotoPath><![CDATA[${facilityItem.PhotoPath || ""}]]></PhotoPath>`;
            facilityXmlData += "</Data>";
          });

          facilityXmlData += "</DataList>";

          if (modifiedCommonFacilities.length > 0 && !hasErrors) {
            const commonFacilityPromises = modifiedCommonFacilities.map(
              (facilityItem) => {
                const payload = {
                  instituteId: instituteID,
                  facilityGroupId: facilityItem.FacilityGroupId || 0,
                  facilityGroup: facilityItem.FacilityGroup || "",
                  subFacilityGroupId: facilityItem.SubFacilityGroupId || 0,
                  subFacilityGroup: facilityItem.SubFacilityGroup || "",
                  requiredNumber: facilityItem.RequiredNumber || 0,
                  requiredSpace: facilityItem.RequiredSpace || 0,
                  availableNumber: facilityItem.AvailableNumber || 0,
                  availableSpace: parseFloat(facilityItem.AvailableSpace) || 0,
                  numberVariation: facilityItem.NumberVariation || 0,
                  spaceVariation: facilityItem.SpaceVariation || 0,
                  hasMultiplyFactor: facilityItem.HasMultiplyFactor || false,
                  requiredFinalSpace: facilityItem.RequiredFinalSpace || 0,
                  isActive: true,
                  isEditAllowed: true,
                  lastModifiedOn: new Date().toISOString(),
                  userLoginID: userLoginID,
                  ipAddress: ipAddress,
                  photoPath: facilityItem.PhotoPath || "",
                  facilityXml: facilityXmlData,
                  trainingEquipmentPhoto: "null",
                };

                return agent.post(SaveFacilityDetails, payload);
              },
            );

            try {
              const responses = await Promise.all(commonFacilityPromises);
            } catch (error) {
              console.error("Common Facility save error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
              });
              errors.push(
                `Common Facility save failed: ${error.response?.data?.Message || error.message}`,
              );
              hasErrors = true;
            }
          }
        }

        //const partialClassRooms = classRoomData.filter(item => isRowPartial(item));
        //if (partialClassRooms.length > 0) {
        //    partialClassRooms.forEach((item) => {
        //        const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
        //        errors.push(`Class Room (Row ${classRoomData.indexOf(item) + 1}): Please provide ${missingField}`);
        //    });
        //    hasErrors = true;
        //}
        const partialClassRooms = classRoomData.filter((item) =>
          isRowPartial(item),
        );
        if (partialClassRooms.length > 0) {
          partialClassRooms.forEach((item) => {
            //const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
            const missingField =
              item.AvailableSpace !== "" &&
              item.AvailableSpace !== null &&
              !isNaN(parseFloat(item.AvailableSpace))
                ? "Photo"
                : "Available Space";

            errors.push(
              `Class Room (Row ${classRoomData.indexOf(item) + 1}): Please provide ${missingField}`,
            );
          });
          hasErrors = true;
        }

        // ✅ NEW: Validate AvailableSpace is filled for all IsCourse rows
        const emptyAvailableClassRooms = classRoomData.filter(
          (item) =>
            (item.IsCourse === 1 || item.IsCourse === true) &&
            //(!item.AvailableSpace || parseFloat(item.AvailableSpace) <= 0)
            (item.AvailableSpace === "" ||
              item.AvailableSpace === null ||
              item.AvailableSpace === undefined ||
              isNaN(parseFloat(item.AvailableSpace))),
        );
        if (emptyAvailableClassRooms.length > 0) {
          emptyAvailableClassRooms.forEach((item) => {
            errors.push(
              `Class Room (Row ${classRoomData.indexOf(item) + 1}) [${item.CourseName || item.SubFacilityGroup}]: Available Space is required`,
            );
          });
          hasErrors = true;
        }
        const modifiedClassRooms = classRoomData.filter((item) => {
          const hasChanged = hasSubFacilityChanged(item, originalClassRoomData);
          const isComplete = isRowComplete(item);
          return hasChanged && isComplete;
        });

        if (modifiedClassRooms.length > 0 && !hasErrors) {
          const facilityData = modifiedClassRooms.map((row) => ({
            id: row.Id || 0,
            availableSpace: parseFloat(row.AvailableSpace),
            photoPath: row.PhotoPath || "",
          }));

          const payload = {
            instituteId: instituteID,
            subFacilityGroupId: 6,
            facilityData: facilityData,
            userLoginID: userID,
            userIPAddress: ipAddress,
          };

          try {
            const response = await agent.post(SaveSubFacilityDetail, payload);
          } catch (error) {
            console.error("Class Room save error:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            });
            errors.push(
              `Class Room save failed: ${error.response?.data?.Message || error.message}`,
            );
            hasErrors = true;
          }
        }

        //const partialDrawingHalls = drawingHallData.filter(item => isRowPartial(item));
        //if (partialDrawingHalls.length > 0) {
        //    partialDrawingHalls.forEach((item) => {
        //        const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
        //        errors.push(`Drawing Hall (Row ${drawingHallData.indexOf(item) + 1}): Please provide ${missingField}`);
        //    });
        //    hasErrors = true;
        //}
        const partialDrawingHalls = drawingHallData.filter((item) =>
          isRowPartial(item),
        );
        if (partialDrawingHalls.length > 0) {
          partialDrawingHalls.forEach((item) => {
            //const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
            const missingField =
              item.AvailableSpace !== "" &&
              item.AvailableSpace !== null &&
              !isNaN(parseFloat(item.AvailableSpace))
                ? "Photo"
                : "Available Space";

            errors.push(
              `Drawing Hall (Row ${drawingHallData.indexOf(item) + 1}): Please provide ${missingField}`,
            );
          });
          hasErrors = true;
        }

        // ✅ NEW: Validate AvailableSpace is filled for all IsCourse rows
        const emptyAvailableDrawingHalls = drawingHallData.filter(
          (item) =>
            (item.IsCourse === 1 || item.IsCourse === true) &&
            //(!item.AvailableSpace || parseFloat(item.AvailableSpace) <= 0)
            (item.AvailableSpace === "" ||
              item.AvailableSpace === null ||
              item.AvailableSpace === undefined ||
              isNaN(parseFloat(item.AvailableSpace))),
        );
        if (emptyAvailableDrawingHalls.length > 0) {
          emptyAvailableDrawingHalls.forEach((item) => {
            errors.push(
              `Drawing Hall (Row ${drawingHallData.indexOf(item) + 1}) [${item.CourseName || item.SubFacilityGroup}]: Available Space is required`,
            );
          });
          hasErrors = true;
        }

        const modifiedDrawingHalls = drawingHallData.filter((item) => {
          const hasChanged = hasSubFacilityChanged(
            item,
            originalDrawingHallData,
          );
          const isComplete = isRowComplete(item);
          return hasChanged && isComplete;
        });

        if (modifiedDrawingHalls.length > 0 && !hasErrors) {
          const facilityData = modifiedDrawingHalls.map((row) => ({
            id: row.Id || 0,
            availableSpace: parseFloat(row.AvailableSpace),
            photoPath: row.PhotoPath || "",
          }));

          const payload = {
            instituteId: instituteID,
            subFacilityGroupId: 7,
            facilityData: facilityData,
            userLoginID: userID,
            userIPAddress: ipAddress,
          };

          try {
            const response = await agent.post(SaveSubFacilityDetail, payload);
          } catch (error) {
            console.error("Drawing Hall save error:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            });
            errors.push(
              `Drawing Hall save failed: ${error.response?.data?.Message || error.message}`,
            );
            hasErrors = true;
          }
        }

        //const partialComputerLabs = computerLabData.filter(item => isRowPartial(item));
        //if (partialComputerLabs.length > 0) {
        //    partialComputerLabs.forEach((item) => {
        //        const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
        //        errors.push(`Computer Lab (Row ${computerLabData.indexOf(item) + 1}): Please provide ${missingField}`);
        //    });
        //    hasErrors = true;
        //}
        const partialComputerLabs = computerLabData.filter((item) =>
          isRowPartial(item),
        );
        if (partialComputerLabs.length > 0) {
          partialComputerLabs.forEach((item) => {
            //const missingField = (item.AvailableSpace && parseFloat(item.AvailableSpace) > 0) ? 'Photo' : 'Available Space';
            const missingField =
              item.AvailableSpace !== "" &&
              item.AvailableSpace !== null &&
              !isNaN(parseFloat(item.AvailableSpace))
                ? "Photo"
                : "Available Space";

            errors.push(
              `Computer Lab (Row ${computerLabData.indexOf(item) + 1}): Please provide ${missingField}`,
            );
          });
          hasErrors = true;
        }

        // ✅ NEW: Validate AvailableSpace is filled for all IsCourse rows
        const emptyAvailableComputerLabs = computerLabData.filter(
          (item) =>
            (item.IsCourse === 1 || item.IsCourse === true) &&
            //(!item.AvailableSpace || parseFloat(item.AvailableSpace) <= 0)
            (item.AvailableSpace === "" ||
              item.AvailableSpace === null ||
              item.AvailableSpace === undefined ||
              isNaN(parseFloat(item.AvailableSpace))),
        );
        if (emptyAvailableComputerLabs.length > 0) {
          emptyAvailableComputerLabs.forEach((item) => {
            errors.push(
              `Computer Lab (Row ${computerLabData.indexOf(item) + 1}) [${item.CourseName || item.SubFacilityGroup}]: Available Space is required`,
            );
          });
          hasErrors = true;
        }
        const modifiedComputerLabs = computerLabData.filter((item) => {
          const hasChanged = hasSubFacilityChanged(
            item,
            originalComputerLabData,
          );
          const isComplete = isRowComplete(item);
          return hasChanged && isComplete;
        });

        if (modifiedComputerLabs.length > 0 && !hasErrors) {
          const facilityData = modifiedComputerLabs.map((row) => ({
            id: row.Id || 0,
            availableSpace: parseFloat(row.AvailableSpace),
            photoPath: row.PhotoPath || "",
          }));

          const payload = {
            instituteId: instituteID,
            subFacilityGroupId: 8,
            facilityData: facilityData,
            userLoginID: userID,
            userIPAddress: ipAddress,
          };

          try {
            const response = await agent.post(SaveSubFacilityDetail, payload);
          } catch (error) {
            console.error("Computer Lab save error:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            });
            errors.push(
              `Computer Lab save failed: ${error.response?.data?.Message || error.message}`,
            );
            hasErrors = true;
          }
        }

        // if (hasOtherFacilityChanged()) {
        const newErrors = {};

        if (!otherFacilityData.isWaterSupply) {
          newErrors.waterSupply = "Please select water supply availability";
        }
        if (!otherFacilityData.sourceofWaterSupplyID) {
          newErrors.waterSource = "Please select water source";
        }
        if (
          otherFacilityData.sourceofWaterSupplyID === "4" &&
          !otherFacilityData.otherSourceofWaterSupply
        ) {
          newErrors.otherSource = "Please enter other water source";
        }
        if (!otherFacilityData.waterSupplyPhoto) {
          newErrors.waterSupplyPhoto = "Please upload water supply photo";
        }
        if (!otherFacilityData.boardPhoto) {
          newErrors.boardPhoto = "Please upload name board photo";
        }
        if (!otherFacilityData.InternetConnectivity) {
          newErrors.InternetConnectivity =
            "Please select Internet Connectivity";
        }
        if (!otherFacilityData.CctvAvailable)
          newErrors.CctvAvailable = "Please select CCTV availability";

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          errors.push("Other Facility: Please complete all required fields");
          hasErrors = true;
        } else {
          setErrors({});
          if (hasOtherFacilityChanged()) {
            const payload = {
              instituteId: instituteID,
              isWaterSupply: parseInt(otherFacilityData.isWaterSupply) || 0,
              internetConnectivity: parseInt(
                otherFacilityData.InternetConnectivity || 0,
              ),
              cctvAvailable: parseInt(otherFacilityData.CctvAvailable || 0),
              sourceofWaterSupplyID:
                parseInt(otherFacilityData.sourceofWaterSupplyID) || 0,
              sourceofWaterSupply:
                waterSourceOptions.find(
                  (opt) =>
                    opt.value === otherFacilityData.sourceofWaterSupplyID,
                )?.label || "",
              otherSourceofWaterSupply:
                otherFacilityData.otherSourceofWaterSupply || "",
              waterSupplyPhoto: otherFacilityData.waterSupplyPhoto || "",
              isDisplayBoard: 0,
              isBoardasperNorms: 0,
              boardPhoto: otherFacilityData.boardPhoto || "",
              isEditAllowed: true,
              isPhotoRequired: true,
              lastModifiedOn: new Date().toISOString(),
              userLoginID: userLoginID,
              ipAddress: ipAddress,
              pageCode: "COMMONFACILITY",
            };

            try {
              const response = await agent.post(SaveOtherInfraDetails, payload);
              setErrors({});
            } catch (error) {
              console.error("Other Facility save error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
              });
              errors.push(
                `Other Facility save failed: ${error.response?.data?.Message || error.message}`,
              );
              hasErrors = true;
            }
          }
        }
        //}

        if (hasErrors) {
          Swal.fire({
            title: "Validation Error",
            html: `<div style="text-align: left;">
                    <p><strong>Please complete the following:</strong></p>
                    <ul style="margin-left: 20px;">
                        ${errors.map((err) => `<li>${err}</li>`).join("")}
                    </ul>
                </div>`,
            icon: "warning",
          });
        } else {
          // await Swal.fire({
          //     title: 'Success',
          //     text: 'All facility details saved successfully',
          //     icon: 'success'

          // });
          //});

          // Refresh all data
          await fetchCommonFacilityData();
          await fetchSubFacilityData();
          await fetchOtherInfraData();

          // Navigate to next page
          // window.location.href = 'next-page';
        }
      } catch (error) {
        console.error("Error saving all data:", error);
        Swal.fire({
          title: "Error",
          text: `Failed to save facility details: ${error.message}`,
          icon: "error",
        });
      }

      const payload = {
        InstituteID: instituteID,
        PageCode: "CommonFacility",
        Status: inspectionStatus.status,
        Remark: inspectionStatus.remark || "",
        CreatedBy: userLoginID,
        IpAddress: ipAddress,
        userTypeID: userTypeID,
      };

      const res = await agent.post(
        UpdateInstituteInspectionVerificationStatus,
        payload,
      );

      if (res.data?.Status !== "Success") {
        throw new Error(res.data?.Message || "Status update failed");
      }

      await Swal.fire("Success", "Verified successfully", "success");

      navigate(`/Institute/PowerDetails?P1=${p1}&P2=${p2}`);
    } catch (err) {
      Swal.fire("Error", err.Message || "Something went wrong", "error");
    } finally {
      stopLoading();
    }
  };
  const commonFacilityColumns = [
    {
      key: "SubFacilityGroup",
      header: "Facility",
     
      className: "text-left pl-4",
      width: "300px",
      sortable: false,
    },
    {
      key: "AvailableSpace",
      header: "Available Space (Sq.M.)",
   
      className: "text-center p-2",
      width: "250px",
      sortable: false,
    },
    {
      key: "PhotoPath",
      header: "Upload Photo",
    
      className: "text-center p-2",
      width: "250px",
      sortable: false,
    },
  ];

  // Render Cell for Common Facility
  const renderCommonFacilityCell = (item, column, rowIndex) => {
    if (column.key === "AvailableSpace") {
      return (
        <FormComponent
          //value={item.AvailableSpace || ''}
          value={item.AvailableSpace ?? ""}
          onChange={(value) => handleCommonFacilitySpaceChange(rowIndex, value)}
          type="number"
          disabled={isLocked || !item.IsEditAllowed}
          extraClass="text-center"
          placeholder="Enter upto 2 decimal"
          step="0.01"
          min="0"
        />
      );
    }

    if (column.key === "PhotoPath") {
      const isZero =
        parseFloat(item.AvailableSpace) === 0 && item.AvailableSpace !== "";

      if (isZero) {
        return (
          <div className="flex justify-center items-center">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-400 border border-gray-200 select-none">
              Deactivated
            </span>
          </div>
        );
      }

      return (
        <div className="flex gap-2 justify-center items-center">
          <UploadPdf
            file={item.PhotoFileName || ""}
            onFileChange={(fileData) =>
              handleCommonFacilityPhotoChange(rowIndex, fileData)
            }
            buttonClassName="bg-[#00c3f9] hover:bg-[#00b3e6]"
            buttonText="Upload"
            showLabel={false}
            allowedFileTypes="jpg, jpeg, png"
            maxFileSize="2 MB"
            required={false}
            userTypeId={userTypeID}
            userLoginID={userLoginID}
            linkName="View"
            uniquefilepath={item.PhotoPath || ""}
            id={`common-facility-${rowIndex}`}
            disabled={isLocked || !item.IsEditAllowed}
          />
        </div>
      );
    }

    return item[column.key];
  };
  const renderSubFacilityCell = (item, column, rowIndex, facilityType) => {
    if (column.key === "sn") {
      return rowIndex + 1;
    }

    // ✅ Show Course name if IsCourse=1, else SubFacilityGroup
    if (column.key === "SubFacilityGroup") {
      return item.IsCourse === false
        ? item.SubFacilityGroup
        : item.CourseName ||
            item.Course ||
            item.CourseCodeName ||
            item.SubFacilityGroup;
    }

    // ✅ Show Required Separately only if IsCourse=1
    if (column.key === "RequiredSeprate") {
      return item.IsCourse === true ? item.RequiredSeprate || "" : "";
    }
    if (column.key === "RequiredSeprate") {
      return item.IsCourse === true
        ? item.RequiredSeprate ||
            item.RequiredSeparate ||
            item.IsRequiredSeprate ||
            ""
        : "";
    }

    // ✅ Show Required Space only if IsCourse=1
    if (column.key === "RequiredSpace") {
      return item.IsCourse === true ? item.RequiredSpace || "" : "";
    }

    if (column.key === "AvailableSpace") {
      return (
        <FormComponent
          //value={item.AvailableSpace || ''}
          value={item.AvailableSpace ?? ""}
          onChange={(value) =>
            handleSubFacilitySpaceChange(facilityType, rowIndex, value)
          }
          type="number"
          disabled={isLocked}
          extraClass="text-center"
          placeholder="Enter space"
          step="0.01"
          min="0"
        />
      );
    }

    //if (column.key === 'PhotoPath') {
    //    return (
    //        <div className="flex gap-2 justify-center items-center">
    //            <UploadPdf
    //                file={item.PhotoFileName || ""}
    //                onFileChange={(fileData) => handleSubFacilityPhotoChange(facilityType, rowIndex, fileData)}
    //                buttonClassName="bg-[#00c3f9] hover:bg-[#00b3e6]"
    //                buttonText="Upload"
    //                showLabel={false}
    //                allowedFileTypes="jpg, jpeg, png"
    //                maxFileSize="2 MB"
    //                required={false}
    //                userTypeId={userTypeID}
    //                userLoginID={userLoginID}
    //                linkName="View"
    //                uniquefilepath={item.PhotoPath || ""}
    //                id={`${facilityType}-${rowIndex}`}
    //                disabled={isLocked}
    //            />
    //        </div>
    //    );
    //}
    if (column.key === "PhotoPath") {
      const isZero =
        parseFloat(item.AvailableSpace) === 0 && item.AvailableSpace !== "";

      if (isZero) {
        return (
          <div className="flex justify-center items-center">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-400 border border-gray-200 select-none">
              Deactivated
            </span>
          </div>
        );
      }

      return (
        <div className="flex gap-2 justify-center items-center">
          <UploadPdf
            file={item.PhotoFileName || ""}
            onFileChange={(fileData) =>
              handleSubFacilityPhotoChange(facilityType, rowIndex, fileData)
            }
            buttonClassName="bg-[#00c3f9] hover:bg-[#00b3e6]"
            buttonText="Upload"
            showLabel={false}
            allowedFileTypes="jpg, jpeg, png"
            maxFileSize="2 MB"
            required={false}
            userTypeId={userTypeID}
            userLoginID={userLoginID}
            linkName="View"
            uniquefilepath={item.PhotoPath || ""}
            id={`${facilityType}-${rowIndex}`}
            disabled={isLocked}
          />
        </div>
      );
    }

    // ✅ Status: if IsCourse=1, show based on AvailableSpace filled; else blank
    if (column.key === "Status") {
      if (item.IsCourse === 1 || item.IsCourse === true) {
        //const available = parseFloat(item.AvailableSpace) || 0;
        const available =
          item.AvailableSpace !== "" && item.AvailableSpace !== null
            ? parseFloat(item.AvailableSpace)
            : 0;

        const required = parseFloat(item.RequiredSpace) || 0;
        const isComplete = available >= required;
        return (
          <span
            className={`font-semibold text-xs ${isComplete ? "text-green-600" : "text-red-600"}`}
          >
            {isComplete ? "Complete" : "Incomplete"}
          </span>
        );
      }
      return "";
    }

    // ✅ Show delete only if IsCourse=0
    if (column.key === "actions") {
      if (item.IsCourse === true) return null;
      return (
        <button
          type="button"
          onClick={() => deleteSubFacility(item.Id, facilityType, rowIndex)}
          disabled={isLocked}
          className="px-3 py-1 rounded text-sm font-semibold bg-red-500 hover:bg-red-600 text-white"
        >
          Delete
        </button>
      );
    }

    return item[column.key];
  };
  // Sub Facility Columns for FilteredTableComponent
  const getSubFacilityColumns = (facilityType) => [
    {
      key: "sn",
      header: (
        <button
          type="button"
          onClick={() => addNewSubFacilityRow(facilityType)}
          disabled={isLocked}
          className="w-8 h-8 rounded flex items-center justify-center text-lg font-bold mx-auto  bg-blue-500 hover:bg-blue-600 text-white"
          title={`Add New ${facilityType === "classRoom" ? "Class Room" : facilityType === "drawingHall" ? "Drawing Hall" : "Computer Lab"}`}
        >
          +
        </button>
      ),
     
      className: "text-center",
      width: "80px",
      sortable: false,
    },
    {
      key: "SubFacilityGroup",
      header: "Course/ Common Facility",
      
      className: "text-left pl-4",
      width: "200px",
      sortable: false,
    },
    {
      key: "RequiredSeprate",
      header: "Required Separately",
      
      className: "text-left pl-4",
      width: "200px",
      sortable: false,
    },
    {
      key: "RequiredSpace",
      header: "Required Space (Sq.M.)",
      
      className: "text-left pl-4",
      width: "200px",
      sortable: false,
    },
    {
      key: "AvailableSpace",
      header: "Available Space (Sq.M.)",
      
      className: "text-center p-2",
      width: "250px",
      sortable: false,
    },
    {
      key: "PhotoPath",
      header: "Upload Photo",
    
      className: "text-center p-2",
      width: "250px",
      sortable: false,
    },
    {
      key: "Status",
      header: "Status",
      
      className: "text-left pl-4",
      width: "200px",
      sortable: false,
    },
    {
      key: "actions",
      header: "Action",
    
      className: "text-center p-2",
      sortable: false,
      width: "100px",
    },
  ];

  // Render Cell for Sub Facility
  //const renderSubFacilityCell = (item, column, rowIndex, facilityType) => {
  //    if (column.key === 'sn') {
  //        return rowIndex + 1;
  //    }

  //    if (column.key === 'AvailableSpace') {
  //        return (
  //            <FormComponent
  //                value={item.AvailableSpace || ''}
  //                onChange={(value) => handleSubFacilitySpaceChange(facilityType, rowIndex, value)}
  //                type="number"
  //                disabled={isLocked}
  //                extraClass="text-center"
  //                placeholder="Enter space"
  //                step="0.01"

  //            />
  //        );
  //    }

  //    if (column.key === 'PhotoPath') {
  //        return (
  //            <div className="flex gap-2 justify-center items-center">
  //                <UploadPdf
  //                    file={item.PhotoFileName || ""}
  //                    onFileChange={(fileData) => handleSubFacilityPhotoChange(facilityType, rowIndex, fileData)}
  //                    buttonClassName="bg-[#00c3f9] hover:bg-[#00b3e6]"
  //                    buttonText="Upload"
  //                    showLabel={false}
  //                    allowedFileTypes="jpg, jpeg, png"
  //                    maxFileSize="2 MB"
  //                    required={false}
  //                    userTypeId={userTypeID}
  //                    userLoginID={userLoginID}
  //                    linkName="View"
  //                    uniquefilepath={item.PhotoPath || ""}
  //                    id={`${facilityType}-${rowIndex}`}
  //                    disabled={isLocked}
  //                />

  //            </div>
  //        );
  //    }

  //    if (column.key === 'actions') {
  //        return (
  //            <button
  //                type="button"
  //                onClick={() => deleteSubFacility(item.Id, facilityType, rowIndex)}
  //                disabled={isLocked}
  //                className="px-3 py-1 rounded text-sm font-semibold bg-red-500 hover:bg-red-600 text-white"

  //            >
  //                Delete
  //            </button>
  //        );
  //    }

  //    return item[column.key];
    //};

    const handleSave = async () => {
        if (userTypeID === 14 || userTypeID === 81) {
            await handleAdminSubmit();
        } else if (userTypeID === 64) {
            await saveAllData();
        } else {
            goNext();
        }
    };

    return (

        <InstituteFlowLayout
            currentPageCode="CommonFacility"
            p1={p1}
            p2={p2}
            onSave={handleSave}
            isSaveLoading={isLoading}
            isLocked={isLocked}
            title="Common Facility Details"
            color={color}
        >
    
      {/* Common Facility Table */}
      <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-4">
        

        <FilteredTableComponent
          data={commonFacilityData}
          columns={commonFacilityColumns}
          filterColumns={[]}
          customButtons={[]}
          title=""
          exportFileName="Common_Facility_Details"
          tableId="common-facility-table"
          searchable={false}
          sortable={false}
          showExcelTemplate={false}
          exportable={false}
          showSearch={false}
          showExcel={false}
          showPDF={false}
          showExport={false}
          maxHeight="500px"
          stickyHeader={true}
          renderCell={renderCommonFacilityCell}
        />
      </fieldset>

      {/* Class Room Section */}
      <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-4">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
          // className="text-base font-semibold text-gray-800 px-2"
        >
          Class Room
        </legend>

        <FilteredTableComponent
          data={classRoomData}
          columns={getSubFacilityColumns("classRoom")}
          filterColumns={[]}
          customButtons={[]}
          title=""
          exportFileName="Class_Room_Details"
          tableId="class-room-table"
          searchable={false}
          sortable={false}
          showExcelTemplate={false}
          exportable={false}
          showSearch={false}
          showExcel={false}
          showPDF={false}
          showExport={false}
          maxHeight="400px"
          stickyHeader={true}
          renderCell={(item, column, rowIndex) =>
            renderSubFacilityCell(item, column, rowIndex, "classRoom")
          }
        />

        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Note:</span> Enter all Class Rooms
            separately with their size. Click on "+" to add Class Room
          </p>
        </div>
      </fieldset>

      {/* Drawing Hall Section */}
      <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-4">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
        >
          Drawing Hall
        </legend>

        <FilteredTableComponent
          data={drawingHallData}
          columns={getSubFacilityColumns("drawingHall")}
          filterColumns={[]}
          customButtons={[]}
          title=""
          exportFileName="Drawing_Hall_Details"
          tableId="drawing-hall-table"
          searchable={false}
          sortable={false}
          showExcelTemplate={false}
          exportable={false}
          showSearch={false}
          showExcel={false}
          showPDF={false}
          showExport={false}
          maxHeight="400px"
          stickyHeader={true}
          renderCell={(item, column, rowIndex) =>
            renderSubFacilityCell(item, column, rowIndex, "drawingHall")
          }
        />

        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Note:</span> Enter all Drawing Halls
            separately with their size. Click on "+" to add Drawing Hall
          </p>
        </div>
      </fieldset>

      {/* Computer Lab Section */}
      <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-4">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
        >
          Computer Lab
        </legend>

        <FilteredTableComponent
          data={computerLabData}
          columns={getSubFacilityColumns("computerLab")}
          filterColumns={[]}
          customButtons={[]}
          title=""
          exportFileName="Computer_Lab_Details"
          tableId="computer-lab-table"
          searchable={false}
          sortable={false}
          showExcelTemplate={false}
          exportable={false}
          showSearch={false}
          showExcel={false}
          showPDF={false}
          showExport={false}
          maxHeight="400px"
          stickyHeader={true}
          renderCell={(item, column, rowIndex) =>
            renderSubFacilityCell(item, column, rowIndex, "computerLab")
          }
        />

        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Note:</span> Enter all Computer Labs
            separately with their size. Click on "+" to add Computer Lab
          </p>
        </div>
      </fieldset>

      {/* Other Facility Section */}
      <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-4">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
        >
          Other Facility
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <DropdownComponent
            label="Whether Water Supply is available"
            name="waterSupply"
            options={waterSupplyOptions}
            value={otherFacilityData.isWaterSupply}
            onChange={(value) => {
              setOtherFacilityData({
                ...otherFacilityData,
                isWaterSupply: value,
              });
              setErrors((prev) => ({ ...prev, waterSupply: "" }));
            }}
            error={errors.waterSupply}
            required={true}
            disabled={isLocked}
          />

          <DropdownComponent
            label="Source of Water Supply"
            name="waterSource"
            options={waterSourceOptions}
            value={otherFacilityData.sourceofWaterSupplyID}
            onChange={(value) => {
              setOtherFacilityData({
                ...otherFacilityData,
                sourceofWaterSupplyID: value,
              });
              setErrors((prev) => ({ ...prev, waterSource: "" }));
            }}
            error={errors.waterSource}
            required={true}
            disabled={isLocked}
          />

          {otherFacilityData.sourceofWaterSupplyID === "4" && (
            <FormComponent
              label={<strong>Other Source of Water </strong>}
              value={otherFacilityData.otherSourceofWaterSupply}
              onChange={(value) => {
                setOtherFacilityData({
                  ...otherFacilityData,
                  otherSourceofWaterSupply: value,
                });
                setErrors((prev) => ({ ...prev, otherSource: "" }));
              }}
              error={errors.otherSource}
              required={true}
              extraClass="font-medium"
              type="text"
              disabled={isLocked}
              placeholder="Enter other source"
            />
          )}

          <DropdownComponent
            label="Whether Internet Connectivity is available"
            name="internetConnectivity"
            options={InternetConnectivityOptions}
            value={otherFacilityData.InternetConnectivity}
            onChange={(value) => {
              setOtherFacilityData({
                ...otherFacilityData,
                InternetConnectivity: value,
              });
              setErrors((prev) => ({ ...prev, InternetConnectivity: "" }));
            }}
            error={errors.InternetConnectivity}
            required={true}
            disabled={isLocked}
          />

          <DropdownComponent
            label="Whether CCTV available in all Workshop"
            name="CctvAvailable"
            options={CctvAvailable}
            value={otherFacilityData.CctvAvailable}
            onChange={(value) => {
              setOtherFacilityData({
                ...otherFacilityData,
                CctvAvailable: value,
              });
              setErrors((prev) => ({ ...prev, CctvAvailable: "" }));
            }}
            error={errors.CctvAvailable}
            required={true}
            disabled={isLocked}
          />

          <div>
            <UploadPdf
              file={otherFacilityData.waterSupplyPhotoFileName || ""}
              onFileChange={handleWaterSupplyPhotoChange}
              buttonClassName="bg-[#00c3f9] hover:bg-[#00b3e6]"
              buttonText="Upload"
              label="Upload Drinking Water Facility Photo"
              showLabel={true}
              allowedFileTypes="jpg, jpeg, png"
              maxFileSize="2 MB"
              required={true}
              userTypeId={userTypeID}
              userLoginID={userLoginID}
              linkName="View Water Supply Photo"
              uniquefilepath={otherFacilityData.waterSupplyPhoto || ""}
              id="waterSupplyPhotoUpload"
              disabled={isLocked}
            />
            {errors.waterSupplyPhoto && (
              <p className="text-red-500 text-sm mt-1">
                {errors.waterSupplyPhoto}
              </p>
            )}
          </div>

          <div>
            <UploadPdf
              file={otherFacilityData.boardPhotoFileName || ""}
              onFileChange={handleBoardPhotoChange}
              buttonClassName="bg-[#00c3f9] hover:bg-[#00b3e6]"
              buttonText="Upload"
              label="Upload Name Board Photo"
              showLabel={true}
              allowedFileTypes="jpg, jpeg, png"
              maxFileSize="2 MB"
              required={true}
              userTypeId={userTypeID}
              userLoginID={userLoginID}
              linkName="View Board Photo"
              uniquefilepath={otherFacilityData.boardPhoto || ""}
              id="boardPhotoUpload"
              disabled={isLocked}
              tooltip="Upload Photo of proposed institute name board."
              tooltipPosition="right"
            />
            {errors.boardPhoto && (
              <p className="text-red-500 text-sm mt-1">{errors.boardPhoto}</p>
            )}
          </div>
        </div>

        {/*<div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">*/}
        {/*    <p className="text-sm text-blue-700">*/}
        {/*        <span className="font-medium">(i) Note:</span> Upload Photo of proposed institute name board.*/}
        {/*    </p>*/}
        {/*</div>*/}
      </fieldset>

      {/*{userTypeID === 14 && (*/}
      {/*    <InspectionStatusComponent*/}
      {/*        instituteId={instituteID}*/}
      {/*        pageCode="CommonFacility"*/}
      {/*        onChange={(data) => setInspectionStatus(data)}*/}
      {/*    />*/}
      {/*)}*/}

      {(((userTypeID === 81 || isViewer) &&
        ["S"].includes(eligibilityData?.InspectionStatus)) ||
        ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
        <InspectionStatusComponent
          instituteId={instituteID}
          pageCode="CommonFacility"
          readonly={
            eligibilityData?.InspectionStatus === "S" && userTypeID === 81
          }
          TypeID="14"
          //userName="By Dveto"
          mode="view"
        />
      )}

      {(userTypeID === 14 ||
        ((userTypeID == 64 || userTypeID == 81) &&
          ["I", "S", "WD", "W"].includes(eligibilityData?.InspectionStatus)) ||
        ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
        <InspectionStatusComponent
          ref={inspectionref}
          instituteId={instituteID}
          pageCode="CommonFacility"
          onChange={(data) => setInspectionStatus(data)}
          //readOnly={userTypeID !== 14}
          //readOnly={eligibilityData?.InspectionStatus === 'S' && userTypeID == 14}
          readOnly={
            (userTypeID === 14 && eligibilityData?.InspectionStatus === "S") ||
            (userTypeID === 81 && eligibilityData?.VerificationStatus === "V")
          }
        />
      )}

            {(userTypeID === 14 || isViewer )&&
        ["S", "WD"].includes(eligibilityData?.InspectionStatus) && (
          <InspectionStatusComponent
            //  ref={inspectionref}
            instituteId={instituteID}
            pageCode="CommonFacility"
            //    onChange={(data) => setInspectionStatus(data)}
            //readOnly={userTypeID !== 14}
            readOnly={
              eligibilityData?.InspectionStatus === "S" && userTypeID === 14
            }
            TypeID="81"
            //userName="By Board"
            mode="view"
          />
        )}

        </InstituteFlowLayout>
    
  );
};

export default CommonFacility;
