import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import agent from "../../../lib/api/agent";
import Swal from "sweetalert2";
import FormComponent from "../../formcomponent/FormComponent";
import UploadPdf from "../../formcomponent/UploadPdf";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { useLoading } from "../../../Hooks/useLoading";
import { ThemeContext } from "../../Context/ThemeContext";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import {
  GetInstitutePowerDetails,
  SaveInstitutePowerDetails,
} from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";

import { useInspectionLock } from "../../../Hooks/useInspectionLock";
import DocumentLink from "../../formcomponent/OpenDocumentComponent";
import { UpdateInstituteInspectionVerificationStatus } from "../../../Endpoints_All/Base/DVETO";
import InspectionStatusComponent from "../../formcomponent/InspectionStatusComponent";
import { useAuth } from "../../../Hooks/AuthContext";


import InstituteFlowLayout from "../../../Component/InstituteFlow/InstituteFlowLayout";
import { usePagePermission } from "../../../Hooks/usePagePermission";
import { useInstituteFlow } from "../../../Hooks/useInstituteFlow";

const PowerDetails = () => {
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

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
    const inspectionref = useRef();

    const {
        // userTypeID,
        isViewer,
        canEdit,
        canSave,
    } = usePagePermission();

  // State for user and institute details
  const [userLoginID, setUserLoginID] = useState("");
  const [userTypeID, setUserTypeID] = useState("");
  const [instituteID, setInstituteID] = useState(null);
  const [ipAddress, setIpAddress] = useState("");

  // State for form fields - NOW BOUND FROM API
  const [availablePower, setAvailablePower] = useState("");
  const [availablePhase, setAvailablePhase] = useState("");
  const [electricityBill, setElectricityBill] = useState({
    fileName: "",
    filePath: "",
  });
  const [electricityBillPath, setElectricityBillPath] = useState("");
  const [
    isMeterConnectionProposedInstitute,
    setIsMeterConnectionProposedInstitute,
  ] = useState("");
  const [
    isMeterConnectionPromotingOrganization,
    setIsMeterConnectionPromotingOrganization,
  ] = useState("");
  const [meterNOC, setMeterNOC] = useState({ fileName: "", filePath: "" });
  const [meterNOCPath, setMeterNOCPath] = useState("");

  // State for power details table - FROM API
  const [powerDetailsData, setPowerDetailsData] = useState([]);
  const [totalRequiredPower, setTotalRequiredPower] = useState(0);
  const [totalInspectionUnits, setTotalInspectionUnits] = useState(0);
  const [requiredSupplyType, setRequiredSupplyType] = useState("");
  const [powerAvailability, setPowerAvailability] = useState(0);
  const [supplyTypeVariation, setSupplyTypeVariation] = useState("");
  const [remarkForPower, setRemarkForPower] = useState("");
  const [remarkForSupplyType, setRemarkForSupplyType] = useState("");

  // State for validation
  const [errors, setErrors] = useState({});

  // Dropdown options
  const phaseOptions = [
    { label: "Single Phase", value: "Single Phase" },
    { label: "Three Phase", value: "Three Phase" },
  ];

  const yesNoOptions = [
    { label: "Yes", value: "1" },
    { label: "No", value: "0" },
  ];

  //LOCK
  const { isLocked, eligibilityData } = useInspectionLock(
    instituteID,
    userLoginID,
    "Power",
  );

  // Fetch user and institute details
  const fetchUserAndInstituteDetails = async () => {
    try {
      const loginID = userInfo?.UserLoginID;
      const typeID =
        userInfo?.UserTypeID || localStorage.getItem("userTypeID") || "1";
      setUserLoginID(loginID);
      setUserTypeID(typeID);
      // DVETO dashboard case
        if (typeID === 14 || (typeID === 81 && p1) || (typeID === 501 && p1)) {
        setInstituteID(p1);
        return p1;
      }

      const resInstitute = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
      );

      if (resInstitute.data?.Data) {
        const instID = resInstitute.data.Data;
        setInstituteID(instID);
        return instID;
      } else {
        console.warn("Institute not found for UserLoginID:", loginID);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user and institute details:", error);
      return null;
    }
  };

  // Fetch IP Address
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

  // **MAIN CHANGE: Fetch power details and BIND to form fields**
  const fetchPowerDetails = async (instID) => {
    if (!instID) return;

    try {
      startLoading();
      const payload = {
        instituteID: instID, // Use actual institute ID
        // instituteID: 10002, // Use actual institute ID
        exitInstituteID: 0,
        userLoginID: userLoginID,
        // userLoginID: "MSB010007",
        pageCode: "POWER_DETAILS",
        itemId: 0,
        ipAddress: ipAddress,
      };

      const response = await agent.post(GetInstitutePowerDetails, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data?.Status === "Success" && response.data?.Data) {
        const powerData = response.data.Data;

        if (
          powerData.AvailablePower !== null &&
          powerData.AvailablePower !== undefined
        ) {
          setAvailablePower(powerData.AvailablePower.toString());
        }

        if (powerData.AvailablePhase) {
          setAvailablePhase(powerData.AvailablePhase);
        }

        if (powerData.ElectricityBillPath) {
          const fileName =
            powerData.ElectricityBillPath.split("/").pop() ||
            "Electricity Bill";
          setElectricityBill({
            fileName,
            filePath: powerData.ElectricityBillPath,
          });
          setElectricityBillPath(powerData.ElectricityBillPath);
        }

        if (
          powerData.IsMeterConnectionProposedInstitute !== null &&
          powerData.IsMeterConnectionProposedInstitute !== undefined
        ) {
          setIsMeterConnectionProposedInstitute(
            powerData.IsMeterConnectionProposedInstitute.toString(),
          );
        }

        if (
          powerData.IsMeterConnectionPromotingOrganization !== null &&
          powerData.IsMeterConnectionPromotingOrganization !== undefined
        ) {
          setIsMeterConnectionPromotingOrganization(
            powerData.IsMeterConnectionPromotingOrganization.toString(),
          );
        }

        if (powerData.MeterNOCfromOwner) {
          const fileName =
            powerData.MeterNOCfromOwner.split("/").pop() || "NOC Document";
          setMeterNOC({ fileName, filePath: powerData.MeterNOCfromOwner });
          setMeterNOCPath(powerData.MeterNOCfromOwner);
        }

        // Process table data from API
        if (
          powerData.LstRequiredPowerDetails &&
          powerData.LstRequiredPowerDetails.length > 0
        ) {
          const tableData = powerData.LstRequiredPowerDetails.map(
            (item, index) => ({
              sn: index + 1,

              course: item.ModelCurriculum ? (
                <DocumentLink
                  documentUrl={item.ModelCurriculum}
                  itemName={item.CourseCodeName || "Course"}
                  label={item.CourseCodeName || ""}
                />
              ) : (
                item.CourseCodeName || ""
              ),
              //course: item.CourseCodeName || '',
              inspectionUnits: item.InspectionUnits || 0,
              maxTrainingSetups: item.MaxTraningSetupRequired || 0,
              perSetupPowerNorm: item.PerSetupPowerNorm || 0,
              supplyType: item.PhaseType || "",
              requiredPower: item.RequiredPower || 0,
            }),
          );
          setPowerDetailsData(tableData);

          // Calculate total required power
          const totalPower = tableData.reduce(
            (sum, item) => sum + (item.requiredPower || 0),
            0,
          );
          setTotalRequiredPower(totalPower);

          // Calculate total inspection units
          const totalUnits = tableData.reduce(
            (sum, item) => sum + (item.inspectionUnits || 0),
            0,
          );
          setTotalInspectionUnits(totalUnits);

          // Determine required supply type
          const hasThreePhase = tableData.some(
            (item) => item.supplyType === "Three Phase",
          );
          setRequiredSupplyType(hasThreePhase ? "Three Phase" : "Single Phase");
        }
      } else {
      }
    } catch (error) {
      console.error("Error fetching power details:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load power details",
        icon: "error",
      });
    } finally {
      stopLoading();
    }
  };

  // Calculate displays when dependencies change
  //useEffect(() => {
  //    if (availablePower && totalRequiredPower !== null) {
  //        // Calculate Power Availability
  //        const availability = parseFloat(availablePower) - totalRequiredPower;
  //        setPowerAvailability(availability);

  //        // Remark for Power
  //        if (totalRequiredPower < parseFloat(availablePower)) {

  //            setRemarkForPower('Available power is not as per requirement');
  //        }
  //        } else {
  //        setRemarkForPower('Available power is as per requirement');
  //    }
  //}, [availablePower, totalRequiredPower]);

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  useEffect(() => {
    if (availablePower !== "" && totalRequiredPower !== null) {
      const available = parseFloat(availablePower);

      if (!isNaN(available)) {
        const availability = available - totalRequiredPower;
        setPowerAvailability(availability);

        if (totalRequiredPower < available) {
          setRemarkForPower("Available power is as per requirement");
        } else {
          setRemarkForPower("Available power is not as per requirement");
        }
      }
    } else {
      setRemarkForPower("");
      setPowerAvailability(0);
    }
  }, [availablePower, totalRequiredPower]);

  // Calculate supply type variation when both values are available
  useEffect(() => {
    if (availablePhase && requiredSupplyType) {
      let variation = "";
      let remark = "";

      if (
        requiredSupplyType === "Single Phase" &&
        availablePhase === "Single Phase"
      ) {
        variation = "Acceptable";
        remark = "Available Supply Type is as per requirement";
      } else if (
        requiredSupplyType === "Single Phase" &&
        availablePhase === "Three Phase"
      ) {
        variation = "Acceptable";
        remark = "Available Supply Type is as per requirement";
      } else if (
        requiredSupplyType === "Three Phase" &&
        availablePhase === "Single Phase"
      ) {
        variation = "Not-Acceptable";
        remark = "Available Supply Type is not as per requirement";
      } else if (
        requiredSupplyType === "Three Phase" &&
        availablePhase === "Three Phase"
      ) {
        variation = "Acceptable";
        remark = "Available Supply Type is as per requirement";
      }

      setSupplyTypeVariation(variation);
      setRemarkForSupplyType(remark);
    }
  }, [availablePhase, requiredSupplyType]);

  useEffect(() => {
    const initializeData = async () => {
      await fetchIP();
      const instID = await fetchUserAndInstituteDetails();
      if (instID) {
        await fetchPowerDetails(instID);
      }
    };

    initializeData();
  }, []); // Empty dependency array - run only once on mount

  // Handle file uploads
  const handleElectricityBillChange = (fileData) => {
    if (fileData) {
      const fileName =
        fileData.name || fileData.fileName || "Uploaded Document";
      const filePath = fileData.filePath || fileData.uniqueFileName || "";

      setElectricityBill({ fileName, filePath });
      setElectricityBillPath(filePath);

      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.electricityBill;
        return newErrors;
      });
    }
  };

  const handleMeterNOCChange = (fileData) => {
    if (fileData) {
      const fileName =
        fileData.name || fileData.fileName || "Uploaded Document";
      const filePath = fileData.filePath || fileData.uniqueFileName || "";

      setMeterNOC({ fileName, filePath });
      setMeterNOCPath(filePath);

      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.meterNOC;
        return newErrors;
      });
    }
  };

  // Handle NOC Format Download
  const handleDownloadNOCFormat = () => {
    Swal.fire({
      title: "Info",
      text: "sorry ",
      icon: "info",
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!availablePower) {
      newErrors.availablePower = "Available power is required";
    } else if (isNaN(availablePower) || parseFloat(availablePower) < 0) {
      newErrors.availablePower = "Please enter a valid power value";
    }

    if (!availablePhase) {
      newErrors.availablePhase = "Available supply type is required";
    }

    if (!electricityBillPath && !electricityBill.filePath) {
      newErrors.electricityBill = "Previous month electricity bill is required";
    }

    if (!isMeterConnectionProposedInstitute) {
      newErrors.isMeterConnectionProposedInstitute = "Please select an option";
    }

    if (!isMeterConnectionPromotingOrganization) {
      newErrors.isMeterConnectionPromotingOrganization =
        "Please select an option";
    }

    // Validate meter connection questions
    if (
      isMeterConnectionProposedInstitute === "0" &&
      isMeterConnectionPromotingOrganization === "0"
    ) {
      if (!meterNOCPath && !meterNOC.filePath) {
        newErrors.meterNOC = "NOC from Owner of Meter is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Save and Next
  const handleSaveAndNext = async () => {
    if (isLocked) {
      navigate("/Institute/InstituteBank");
      return;
      }
      if (isViewer || !canSave) {
          goNext();
          return;
      }
    if (!validateForm()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fill all required fields correctly",
        icon: "error",
      });
      return;
    }

    if (!instituteID) {
      Swal.fire({
        title: "Error",
        text: "Institute ID not found",
        icon: "error",
      });
      return;
    }

    const powerDetailsPayload = {
      instituteId: instituteID,
      availablePower: parseFloat(availablePower),
      availablePhase: availablePhase,
      electricityBillPath: electricityBillPath || electricityBill.filePath,
      isMeterConnectionProposedInstitute: parseInt(
        isMeterConnectionProposedInstitute,
      ),
      isMeterConnectionPromotingOrganization: parseInt(
        isMeterConnectionPromotingOrganization,
      ),
      meterNOCfromOwner: meterNOCPath || meterNOC.filePath || "",
      userLoginID: userLoginID,
      ipAddress: ipAddress,
      pageCode: "POWER_DETAILS",
      //ADDED
      requiredPower: totalRequiredPower,
      powerAvailability: powerAvailability,
      requiredSupplyType: requiredSupplyType,
      supplyTypeVariation: supplyTypeVariation,
    };

    try {
      startLoading();
      const response = await agent.post(
        SaveInstitutePowerDetails,
        powerDetailsPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data?.Status === "Success") {
        Swal.fire({
          title: "Success",
          text: response.data.Message || "Power details saved successfully",
          icon: "success",

          showConfirmButton: true,
        }).then((res) => {
          if (res.isConfirmed) {
            navigate("/Institute/InstituteBank");
          }
        });

        // Reload table data after save
        await fetchPowerDetails(instituteID);
      } else {
        Swal.fire({
          title: "Error",
          text: response.data?.Message || "Failed to save power details",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error saving power details:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.Message || "Failed to save power details",
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
      navigate(`/Institute/InstituteBank?P1=${p1}&P2=${p2}`);
      return;
      }
      if (isViewer || !canSave) {
          goNext();
          return;
      }

    try {
      startLoading();

      const payload = {
        InstituteID: instituteID,
        PageCode: "Power",
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

      //TO SAVE CHAGES
      const powerDetailsPayload = {
        instituteId: instituteID,
        availablePower: parseFloat(availablePower),
        availablePhase: availablePhase,
        electricityBillPath: electricityBillPath || electricityBill.filePath,
        isMeterConnectionProposedInstitute: parseInt(
          isMeterConnectionProposedInstitute,
        ),
        isMeterConnectionPromotingOrganization: parseInt(
          isMeterConnectionPromotingOrganization,
        ),
        meterNOCfromOwner: meterNOCPath || meterNOC.filePath || "",
        userLoginID: userLoginID,
        ipAddress: ipAddress,
        pageCode: "POWER_DETAILS",
        //ADDED
        requiredPower: totalRequiredPower,
        powerAvailability: powerAvailability,
        requiredSupplyType: requiredSupplyType,
        supplyTypeVariation: supplyTypeVariation,
      };

      const response = await agent.post(
        SaveInstitutePowerDetails,
        powerDetailsPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (
        res.data?.Status !== "Success" ||
        response.data?.Status !== "Success"
      ) {
        throw new Error(res.data?.Message || "Status update failed");
      }

      await Swal.fire("Success", "Verified successfully", "success");

      navigate(`/Institute/InstituteBank?P1=${p1}&P2=${p2}`);
    } catch (err) {
      Swal.fire("Error", err.Message || "Something went wrong", "error");
    } finally {
      stopLoading();
    }
  };
  // Handle Back

  // Handle Close
  //const handleClose = () => {
  //    Swal.fire({
  //        title: 'Are you sure?',
  //        text: "Do you want to close without saving?",
  //        icon: 'warning',
  //        showCancelButton: true,
  //        confirmButtonColor: '#3085d6',
  //        cancelButtonColor: '#d33',
  //        confirmButtonText: 'Yes, close it!'
  //    }).then((result) => {
  //        if (result.isConfirmed) {
  //            window.location.href = '/';
  //        }
  //    });
  //};

  // Table columns configuration
  const powerDetailsColumns = [
    {
      key: "sn",
      header: "S.N.",
     
      className: "text-center",
      width: "80px",
      sortable: false,
    },
    {
      key: "course",
      header: "Course",
    
      width: "300px",
      searchable: true,
      sortable: false,
    },
    {
      key: "inspectionUnits",
      header: "Inspection Units",
     
      className: "text-center",
      width: "120px",
      sortable: false,
    },
    {
      key: "maxTrainingSetups",
      header: "Max Training Setups required",
     
      className: "text-center",
      width: "150px",
      sortable: false,
    },
    {
      key: "perSetupPowerNorm",
      header: "Per Setup Power Norm (K.W.)",
     
      className: "text-center",
      width: "180px",
      sortable: false,
    },
    {
      key: "supplyType",
      header: "Supply Type",
      
      className: "text-center",
      width: "120px",
      sortable: false,
    },
    {
      key: "requiredPower",
      header: "Required Power (K.W.)",
     
      className: "text-center",
      width: "150px",
      sortable: false,
      render: (value) => (value || 0).toFixed(2),
    },
  ];

  // Render custom footer for power table
  const renderPowerDetailsFooter = () => (
    <tr className="bg-gray-100 font-bold">
      <td className="px-4 py-2 text-right border" colSpan="2">
        Total
      </td>
      <td className="px-4 py-2 text-center border">
        <span className="text-blue-600">{totalInspectionUnits}</span>
      </td>
      <td className="px-4 py-2 text-center border"></td>
      <td className="px-4 py-2 text-center border"></td>
      <td className="px-4 py-2 text-center border">
        <span className="text-yellow-600">{requiredSupplyType}</span>
      </td>
      <td className="px-4 py-2 text-center border">
        <span className="text-yellow-600">{totalRequiredPower.toFixed(2)}</span>
      </td>
    </tr>
  );

  // Check if NOC upload should be active
  const isNOCActive =
    isMeterConnectionProposedInstitute === "0" &&
        isMeterConnectionPromotingOrganization === "0";

    const handleSave = async () => {
        if (userTypeID === 14 || userTypeID === 81) {
            await handleAdminSubmit();
        } else if (userTypeID === 64) {
            await handleSaveAndNext();
        } else {
            goNext();
        }
    };

    return (
        <InstituteFlowLayout
            currentPageCode="Power"
            p1={p1}
            p2={p2}
            onSave={handleSave}
            isSaveLoading={isLoading}
            isLocked={isLocked}
            title="Power Details"
            color={color}
        >
      
      <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-6">
        

        {/* Power Details Table */}
        <div className="mt-6">
          <FilteredTableComponent
            data={powerDetailsData}
            columns={powerDetailsColumns}
            filterColumns={["course"]}
            customButtons={[]}
            title=""
            exportFileName="Power_Details"
            tableId="power-details-table"
            searchable={true}
            sortable={false}
            showExcelTemplate={false}
            exportable={false}
            showSearch={false}
            showExport={false}
            maxHeight="500px"
            stickyHeader={true}
            readOnly={true}
            customFooter={renderPowerDetailsFooter()}
            emptyMessage="No power details available"
          />
        </div>

        {/* Power Summary Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <FormComponent
              label="Available Power (K.W.)"
              type="number"
              value={availablePower}
              onChange={(val) => {
                const regex = /^\d*\.?\d{0,2}$/;
                if (regex.test(val) || val === "") {
                  setAvailablePower(val);
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.availablePower;
                    return newErrors;
                  });
                }
              }}
              error={errors.availablePower}
              required={true}
              placeholder="Enter upto 2 decimal"
              extraClass="font-medium"
              disabled={isLocked}
            />
          </div>

          <div>
            <FormComponent
              label="Required Power (K.W.)"
              type="text"
              value={totalRequiredPower.toFixed(2)}
              onChange={() => {}}
              disabled={true}
            />
          </div>

          <div>
            <FormComponent
              label="Power Discrepancy(K.W.)"
              type="text"
              value={availablePower ? powerAvailability.toFixed(2) : ""}
              onChange={() => {}}
              disabled={true}
            />
          </div>
        </div>

        {/* Supply Type Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <DropdownComponent
              label="Available Supply Type"
              name="availablePhase"
              options={phaseOptions}
              value={availablePhase}
              onChange={(value) => {
                setAvailablePhase(value);
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.availablePhase;
                  return newErrors;
                });
              }}
              error={errors.availablePhase}
              required={true}
              disabled={isLocked}
            />
          </div>

          <div>
            <FormComponent
              label="Required Supply Type"
              type="text"
              value={requiredSupplyType}
              onChange={() => {}}
              disabled={true}
            />
          </div>

          <div>
            <FormComponent
              label="Supply Type Variation"
              type="text"
              value={supplyTypeVariation}
              onChange={() => {}}
              disabled={true}
            />
          </div>
        </div>

        {/* Upload Section */}
        <div className="mt-6 grid grid-cols-1 gap-6">
          <div>
            <UploadPdf
              file={electricityBill?.fileName || ""}
              onFileChange={handleElectricityBillChange}
              buttonClassName="bg-[#00c3f9]"
              buttonText="Upload"
              label="Upload Previous Month Electricity Bill"
              showLabel={true}
              allowedFileTypes="jpg, jpeg, png, pdf"
              maxFileSize="2 MB"
              required={true}
              userTypeId={userTypeID}
              userLoginID={userLoginID}
              linkName="View Electricity Bill"
              uniquefilepath={electricityBillPath || ""}
              id="electricityBillUpload"
              disabled={isLocked}
            />
            {errors.electricityBill && (
              <p className="mt-1 text-sm text-red-600">
                {errors.electricityBill}
              </p>
            )}
          </div>
        </div>

        {/* Meter Connection Questions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormComponent
              label="Is the meter connection in the name of Proposed Institute"
              isSelect={true}
              options={yesNoOptions}
              value={isMeterConnectionProposedInstitute}
              onChange={(value) => {
                setIsMeterConnectionProposedInstitute(value);
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.isMeterConnectionProposedInstitute;
                  return newErrors;
                });
              }}
              error={errors.isMeterConnectionProposedInstitute}
              required={true}
              disabled={isLocked}
            />
          </div>

          <div>
            <FormComponent
              label="Is the meter connection in the name of Promoting Organization"
              isSelect={true}
              options={yesNoOptions}
              value={isMeterConnectionPromotingOrganization}
              onChange={(value) => {
                setIsMeterConnectionPromotingOrganization(value);
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.isMeterConnectionPromotingOrganization;
                  return newErrors;
                });
              }}
              error={errors.isMeterConnectionPromotingOrganization}
              required={true}
              disabled={isLocked}
            />
          </div>
        </div>

        {/* NOC Upload - Conditional */}
        {isNOCActive && (
          <div className="mt-6">
            {/*<div className="flex items-center gap-4 mb-2">*/}
            {/*    <button*/}
            {/*        type="button"*/}
            {/*        onClick={handleDownloadNOCFormat}*/}
            {/*        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold text-sm transition-colors"*/}
            {/*        disabled={isLocked}*/}
            {/*    >*/}
            {/*        Download NOC Format*/}
            {/*    </button>*/}
            {/*</div>*/}
            <UploadPdf
              file={meterNOC?.fileName || ""}
              onFileChange={handleMeterNOCChange}
              buttonClassName="bg-[#00c3f9]"
              buttonText="Upload"
              label="Upload NOC from Owner of Meter"
              showLabel={true}
              allowedFileTypes="jpg, jpeg, png, pdf"
              maxFileSize="2 MB"
              required={true}
              userTypeId={userTypeID}
              userLoginID={userLoginID}
              linkName="View NOC"
              uniquefilepath={meterNOCPath || ""}
              id="meterNOCUpload"
              disabled={isLocked}
            />
            {errors.meterNOC && (
              <p className="mt-1 text-sm text-red-600">{errors.meterNOC}</p>
            )}
          </div>
        )}
      </fieldset>

      {/* Notes Section */}
      <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-bold text-blue-800 mb-2">Note:</p>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Negative Power Availability means shortage</li>
          <li>Positive Power Availability means adequate/ excess</li>
        </ol>
      </div>

      {/* Remarks Section */}
      <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">
          <span className="font-medium">Remark for Power:</span>{" "}
          {remarkForPower}
        </p>
        <p className="text-sm text-red-700 mt-2">
          <span className="font-medium">Remark for Supply Type:</span>{" "}
          {remarkForSupplyType}
        </p>
      </div>

      {/*{userTypeID === 14 && (*/}
      {/*    <InspectionStatusComponent*/}
      {/*        instituteId={instituteID}*/}
      {/*        pageCode="Power"*/}
      {/*        onChange={(data) => setInspectionStatus(data)}*/}
      {/*    />*/}
      {/*)}*/}

                {(userTypeID === 81 || isViewer  )&&
        (["S"].includes(eligibilityData?.InspectionStatus) ||
          ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
          <InspectionStatusComponent
            //ref={inspectionref}
            instituteId={instituteID}
            pageCode="Power"
            // onChange={(data) => setInspectionStatus(data)}
            readOnly={
              eligibilityData?.InspectionStatus === "S" && userTypeID === 81
            }
            TypeID="14"
            //userName="By DVETO"
            mode="view"
          />
        )}

      {(userTypeID === 14 ||
        ((userTypeID == 64 || userTypeID == 81) &&
          (["I", "S", "WD", "W"].includes(eligibilityData?.InspectionStatus) ||
            ["V", "W"].includes(eligibilityData?.VerificationStatus)))) && (
        <InspectionStatusComponent
          ref={inspectionref}
          instituteId={instituteID}
          pageCode="Power"
          onChange={(data) => setInspectionStatus(data)}
          //readOnly={userTypeID !== 14}
          //readOnly={eligibilityData?.InspectionStatus === 'S' && userTypeID == 14}
          readOnly={
            (userTypeID === 14 && eligibilityData?.InspectionStatus === "S") ||
            (userTypeID === 81 && eligibilityData?.VerificationStatus === "V")
          }
          TypeID={userTypeID}
        />
      )}

                {(userTypeID === 14 || isViewer) &&
        ["S", "WD"].includes(eligibilityData?.InspectionStatus) && (
          <InspectionStatusComponent
            //  ref={inspectionref}
            instituteId={instituteID}
            pageCode="Power"
            // onChange={(data) => setInspectionStatus(data)}
            //readOnly={userTypeID !== 14}
            readOnly={
              eligibilityData?.InspectionStatus === "S" && userTypeID === 14
            }
            TypeID={81}
            //userName="By Board"
            mode="view"
          />
        )}

     
            
        </InstituteFlowLayout>
  );
};

export default PowerDetails;


          