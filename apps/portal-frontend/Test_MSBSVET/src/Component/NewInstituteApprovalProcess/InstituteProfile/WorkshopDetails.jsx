import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

import agent from "../../../lib/api/agent";
import Swal from "sweetalert2";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Context/ThemeContext";
import { useLoading } from "../../../Hooks/useLoading";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import {
  SaveWorkshopDetails,
  GetWorkshopDetails,
  SaveWorkshopPhotoPath,
  DeleteWorkshopPhotoPath,
} from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import UploadPdf from "../../formcomponent/UploadPdf";
import FormComponent from "../../formcomponent/FormComponent";
import { useInspectionLock } from "../../../Hooks/useInspectionLock";
import DocumentLink from "../../formcomponent/OpenDocumentComponent";
import { UpdateInstituteInspectionVerificationStatus } from "../../../Endpoints_All/Base/DVETO";
import InspectionStatusComponent from "../../formcomponent/InspectionStatusComponent";
import { useAuth } from "../../../Hooks/AuthContext";

import InstituteFlowLayout from "../../../Component/InstituteFlow/InstituteFlowLayout";
import { usePagePermission } from "../../../Hooks/usePagePermission";
import { useInstituteFlow } from "../../../Hooks/useInstituteFlow";

const WorkshopDetails = () => {
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const { userInfo } = useAuth();
  const loginID = userInfo?.UserLoginID;
  const userTypeID = userInfo?.UserTypeID;
  const instituteCode = loginID;

  const [instituteID, setInstituteID] = useState(null);
  const [ipAddress, setIpAddress] = useState("0.0.0.0");
  const [workshopData, setWorkshopData] = useState([]);
  const [modifiedWorkshopIds, setModifiedWorkshopIds] = useState(new Set());
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [inspectionStatus, setInspectionStatus] = useState({
    status: "",
    remark: "",
  });
  const ipFetchedRef = useRef(false);
  const instituteFetchedRef = useRef(false);
  const dataFetchedRef = useRef(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const p1 = searchParams.get("P1");
    const p2 = searchParams.get("P2");

    const { goNext, goBack, handleClose } = useInstituteFlow(
        "WorkshopDetails",
        p1,
        p2
    );

    const {
        // userTypeID,
        isViewer,
        canEdit,
        canSave,
    } = usePagePermission();

  const [totals, setTotals] = useState({
    totalRequiredSpace: 0,
    totalAvailableSpace: 0,
    totalSpaceAvailability: 0,
  });

  const [remarks, setRemarks] = useState({
    spaceRemark: "",
    floorPreferenceRemark: "",
  });

  const { isLocked, eligibilityData } = useInspectionLock(
    instituteID,
    loginID,
    "WorkshopDetails",
  );
  const inspectionref = useRef();

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  // ─── Fetch IP ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (ipFetchedRef.current) return;
    const fetchIP = async () => {
      try {
        ipFetchedRef.current = true;
        const response = await agent.get(getIp, {
          headers: { accept: "*/*" },
          timeout: 5000,
        });
        setIpAddress(response.data?.ip || "0.0.0.0");
      } catch {
        setIpAddress("0.0.0.0");
      }
    };
    fetchIP();
  }, []);

  // ─── Fetch Institute ID ───────────────────────────────────────────────────────
  useEffect(() => {
    // DVETO dashboard case
      if (userTypeID === 14 || (userTypeID === 81 && p1) || (userTypeID === 501 && p1)) {
      setInstituteID(p1);   
      return;
    }
    if (!instituteCode || instituteFetchedRef.current) return;
    const fetchInstituteID = async () => {
      try {
        instituteFetchedRef.current = true;
        startLoading();
        const response = await agent.get(GetInstituteIDByInstituteCode, {
          params: { InstituteCode: instituteCode },
          timeout: 10000,
        });
        if (response.data.Status === "Success") {
          setInstituteID(response.data.Data);
        } else {
          throw new Error(
            response.data.Message || "Failed to fetch Institute ID",
          );
        }
      } catch (error) {
        instituteFetchedRef.current = false;
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.Message ||
            error.message ||
            "Failed to fetch Institute ID",
          confirmButtonText: "Retry",
        }).then((r) => {
          if (r.isConfirmed) window.location.reload();
        });
      } finally {
        stopLoading();
      }
    };
    fetchInstituteID();
  }, [instituteCode, startLoading, stopLoading]);

  // ─── Totals ───────────────────────────────────────────────────────────────────
  const calculateTotals = useCallback((data) => {
    const totalRequiredSpace = data.reduce(
      (sum, item) => sum + (parseFloat(item.RequiredSpace) || 0),
      0,
    );
    const totalAvailableSpace = data.reduce(
      (sum, item) => sum + (parseFloat(item.SpaceAvailable) || 0),
      0,
    );
    const totalSpaceAvailability = totalAvailableSpace - totalRequiredSpace;
    setTotals({
      totalRequiredSpace: totalRequiredSpace.toFixed(2),
      totalAvailableSpace: totalAvailableSpace.toFixed(2),
      totalSpaceAvailability: totalSpaceAvailability.toFixed(2),
    });
  }, []);

  // ─── Remarks ──────────────────────────────────────────────────────────────────
  const recalculateRemarks = useCallback((data) => {
    const hasShortage = data.some(
      (item) => (parseFloat(item.SpaceAvailability) || 0) < 0,
    );
    // For floor remark: use the effective floor variation based on business rules
    const hasNotAcceptable = data.some((item) => {
      const req = parseFloat(item.RequiredSpace) || 0;
      const avail = parseFloat(item.SpaceAvailable) || 0;
      if (req === 0) return false; // Req=0 → always Acceptable
      if (req > 0 && avail === 0) return true; // Req>0, Avail=0 → Not-Acceptable
      return item.FloorPrefVariation === "Not-Acceptable"; // Req>0, Avail>0 → from DB
    });
    setRemarks({
      spaceRemark: hasShortage
        ? "Available Workshop Space is less than Required Norms"
        : "Available Workshop Space is as per Required Norms",
      floorPreferenceRemark: hasNotAcceptable
        ? "Available Floor Preference is not as per Required Norms"
        : "Available Floor Preference is as per Required Norms",
    });
  }, []);

  // ─── Business Rules ───────────────────────────────────────────────────────────
  /**
   * Floor & Photo ACTIVE when:
   * - Req = 0  AND  Avail > 0   → Activate (row 2)
   * - Req > 0  AND  Avail > 0   → Activate (row 4)
   * Deactivate when:
   * - Req = 0  AND  Avail = 0   → Deactivate (row 1)
   * - Req > 0  AND  Avail = 0   → Deactivate (row 3)
   */
  const isFloorAndPhotoActive = useCallback((workshop) => {
    const avail = parseFloat(workshop.SpaceAvailable) || 0;
    return avail > 0; // Simply: active when AvailableSpace > 0 (covers both req=0 and req>0)
  }, []);

  /**
   * Floor Variation display rule:
   * - Req = 0                    → "Acceptable"
   * - Req > 0 AND Avail = 0      → "Not-Acceptable"
   * - Req > 0 AND Avail > 0      → Use DB/SP calculated value
   * - Req = 0 AND Avail > 0      → "Acceptable" (floor doesn't matter)
   */
  const getFloorVariation = useCallback((workshop) => {
    const req = parseFloat(workshop.RequiredSpace) || 0;
    const avail = parseFloat(workshop.SpaceAvailable) || 0;
    if (req === 0) return "Acceptable";
    if (req > 0 && avail === 0) return "Not-Acceptable";
    return workshop.FloorPrefVariation || "Not-Evaluated";
  }, []);

  // ─── Row Complete Check ───────────────────────────────────────────────────────
  /**
   * Row is complete when _spaceEntered=true AND:
   * - If active (avail>0): floor + photo also required
   * - If deactivated (avail=0): space alone = complete (floor+photo not needed)
   */
  const isRowComplete = useCallback((workshop) => {
    if (workshop._spaceEntered !== true) return false;
    if (
      workshop.SpaceAvailable === "" ||
      workshop.SpaceAvailable === null ||
      workshop.SpaceAvailable === undefined
    )
      return false;

    const avail = parseFloat(workshop.SpaceAvailable) || 0;

    // Deactivated — space alone is enough
    if (avail === 0) return true;

    // Active — floor + photo also required
    const hasFloor =
      workshop.AvailableFloorId !== null &&
      workshop.AvailableFloorId !== undefined &&
      workshop.AvailableFloorId !== -1;
    const hasPhoto = !!(
      workshop.WorkshopPhotoPath && workshop.WorkshopPhotoPath.trim() !== ""
    );
    return hasFloor && hasPhoto;
  }, []);

  // ─── Row Partially Filled Check ───────────────────────────────────────────────
  /**
   * Partial = space entered, floor+photo active, but only 1 of floor/photo filled
   */
  //const isRowPartiallyFilled = useCallback((workshop) => {
  //    if (workshop._spaceEntered !== true) return false;
  //    if (workshop.SpaceAvailable === '' || workshop.SpaceAvailable === null || workshop.SpaceAvailable === undefined) return false;

  //    const avail = parseFloat(workshop.SpaceAvailable) || 0;
  //    if (avail === 0) return false; // Deactivated — never partial

  //    const hasFloor = (
  //        workshop.AvailableFloorId !== null &&
  //        workshop.AvailableFloorId !== undefined &&
  //        workshop.AvailableFloorId !== -1
  //    );
  //    const hasPhoto = !!(workshop.WorkshopPhotoPath && workshop.WorkshopPhotoPath.trim() !== '');
  //    const filledCount = [hasFloor, hasPhoto].filter(Boolean).length;
  //    return filledCount > 0 && filledCount < 2;
  //}, []);

  const isRowPartiallyFilled = useCallback((workshop) => {
    if (workshop._spaceEntered !== true) return false;
    if (
      workshop.SpaceAvailable === "" ||
      workshop.SpaceAvailable === null ||
      workshop.SpaceAvailable === undefined
    )
      return false;

    const avail = parseFloat(workshop.SpaceAvailable) || 0;
    if (avail === 0) return false; // Deactivated — never partial

    const hasFloor =
      workshop.AvailableFloorId !== null &&
      workshop.AvailableFloorId !== undefined &&
      workshop.AvailableFloorId !== -1;
    const hasPhoto = !!(
      workshop.WorkshopPhotoPath && workshop.WorkshopPhotoPath.trim() !== ""
    );

    // Partial = avail>0 but floor or photo (or both) missing
    // This covers: only space filled, only floor filled, only photo filled, floor+space but no photo, etc.
    return !hasFloor || !hasPhoto;
  }, []);

  // ─── Fetch Workshop Data ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!instituteID || dataFetchedRef.current) return;
    const fetchWorkshopData = async () => {
      try {
        dataFetchedRef.current = true;
        startLoading();
        const response = await agent.get(GetWorkshopDetails, {
          params: { instituteId: instituteID, userloginid: loginID },
          //timeout: 15000,
        });

        if (
          response.data.Status === "Success" &&
          response.data.Data?.length > 0
        ) {
          //const initializedData = response.data.Data.map(workshop => ({
          //    ...workshop,
          //    SpaceAvailable: workshop.SpaceAvailable ?? 0,
          //    SpaceAvailability: workshop.SpaceAvailability ?? 0,
          //    AvailableFloorId: workshop.AvailableFloorId ?? -1,
          //    AvailableFloorPref: workshop.AvailableFloorPref || '',
          //    FloorPrefVariation: workshop.FloorPrefVariation || 'Not-Evaluated',
          //    WorkshopPhotoPath: workshop.WorkshopPhotoPath || '',

          //    // _spaceEntered: true when API has an actual saved value
          //    _spaceEntered: workshop.SpaceAvailable !== null && workshop.SpaceAvailable !== undefined,

          //    // _db* mirrors: store original DB values for restore when space goes 0→>0
          //    _dbAvailableFloorId: workshop.AvailableFloorId ?? -1,
          //    _dbAvailableFloorPref: workshop.AvailableFloorPref || '',
          //    _dbFloorPrefVariation: workshop.FloorPrefVariation || 'Not-Evaluated',
          //    _dbWorkshopPhotoPath: workshop.WorkshopPhotoPath || '',

          //    // Track if this row had photo/floor data originally from DB
          //    // Used to decide if Delete API call is needed when space→0
          //    _hadPhotoInDb: !!(workshop.WorkshopPhotoPath && workshop.WorkshopPhotoPath.trim() !== ''),
          //}));
          const initializedData = response.data.Data.map((workshop) => {
            const spaceAvail = workshop.SpaceAvailable ?? 0;
            const isActive = parseFloat(spaceAvail) > 0; // floor+photo only valid when space > 0

            // If space = 0, floor should show as "-- Select --" regardless of DB value
            const effectiveFloorId = isActive
              ? (workshop.AvailableFloorId ?? -1)
              : -1;
            const effectiveFloorPref = isActive
              ? workshop.AvailableFloorPref || ""
              : "";
            const effectiveFloorVariation = isActive
              ? workshop.FloorPrefVariation || "Not-Evaluated"
              : parseFloat(workshop.RequiredSpace) > 0
                ? "Not-Acceptable"
                : "Acceptable";
            const effectivePhotoPath = isActive
              ? workshop.WorkshopPhotoPath || ""
              : "";

            return {
              ...workshop,
              SpaceAvailable: spaceAvail,
              SpaceAvailability: workshop.SpaceAvailability ?? 0,
              AvailableFloorId: effectiveFloorId,
              AvailableFloorPref: effectiveFloorPref,
              FloorPrefVariation: effectiveFloorVariation,
              WorkshopPhotoPath: effectivePhotoPath,

              _spaceEntered:
                workshop.SpaceAvailable !== null &&
                workshop.SpaceAvailable !== undefined,

              // _db* mirrors reflect effective values (not raw DB values when deactivated)
              _dbAvailableFloorId: effectiveFloorId,
              _dbAvailableFloorPref: effectiveFloorPref,
              _dbFloorPrefVariation: effectiveFloorVariation,
              _dbWorkshopPhotoPath: effectivePhotoPath,

              _hadPhotoInDb:
                isActive &&
                !!(
                  workshop.WorkshopPhotoPath &&
                  workshop.WorkshopPhotoPath.trim() !== ""
                ),
              _needsDeleteApi: false,
            };
          });
          setWorkshopData(initializedData);
          calculateTotals(initializedData);
          recalculateRemarks(initializedData);
          setModifiedWorkshopIds(new Set());
          setInitialDataLoaded(true);
        } else if (
          response.data.Status === "Success" &&
          response.data.Data?.length === 0
        ) {
          setInitialDataLoaded(true);
          Swal.fire({
            icon: "info",
            title: "No Data",
            text: "No workshop details found for this institute",
            confirmButtonText: "OK",
          });
        } else {
          throw new Error(
            response.data.Message || "Failed to fetch workshop details",
          );
        }
      } catch (error) {
        dataFetchedRef.current = false;
        Swal.fire({
          icon: "error",
          title: "Error Loading Data",
          text:
            error.response?.data?.Message ||
            error.message ||
            "Failed to fetch Workshop Details",
          showCancelButton: true,
          confirmButtonText: "Retry",
          cancelButtonText: "Go Back",
        }).then((r) => {
          if (r.isConfirmed) window.location.reload();
          else if (r.dismiss === Swal.DismissReason.cancel)
            window.history.back();
        });
      } finally {
        stopLoading();
      }
    };
    fetchWorkshopData();
  }, [
    instituteID,
    loginID,
    startLoading,
    stopLoading,
    calculateTotals,
    recalculateRemarks,
  ]);

  // ─── Build base payload (shared fields) ──────────────────────────────────────
  const buildBasePayload = useCallback(
    (workshop, overrides = {}) => {
      const req = parseFloat(workshop.RequiredSpace) || 0;
      const avail = parseFloat(workshop.SpaceAvailable) || 0;
      const active = avail > 0;

      // When deactivated: always send empty/zero for floor+photo
      const effectiveFloorId = active
        ? parseInt(workshop.AvailableFloorId) || 0
        : 0;
      const effectiveFloorPref = active
        ? workshop.AvailableFloorPref || ""
        : "";
      const effectiveFloorVar = active
        ? workshop.FloorPrefVariation || ""
        : req === 0
          ? "Acceptable"
          : "Not-Acceptable";
      const effectivePhotoPath = active ? workshop.WorkshopPhotoPath || "" : "";

      return {
        instituteId: instituteID || 0,
        workshopId: workshop.WorkshopId || 0,
        courseID: workshop.CourseID || 0,
        courseCode: workshop.CourseCode || "",
        course: workshop.Course || "",
        courseCodeName: workshop.CourseCodeName || "",
        inspectionUnits: workshop.InspectionUnits || 0,
        maxTraningSetupRequired: workshop.MaxTraningSetupRequired || 0,
        perSetupNorm: parseFloat(workshop.PerSetupNorm) || 0,
        requiredSpace: req,
        spaceAvailable: avail,
        spaceAvailability: parseFloat(workshop.SpaceAvailability) || 0,
        approvedUnits: workshop.ApprovedUnits || 0,
        proposedUnits: workshop.ProposedUnits || 0,
        totalUnits: workshop.TotalUnits || 0,
        floorId: workshop.FloorId || 0,
        floorPref: workshop.FloorPref || "",
        workSpaceForApprovedUnits:
          parseFloat(workshop.WorkSpaceForApprovedUnits) || 0,
        workSpaceForProposedUnits:
          parseFloat(workshop.WorkSpaceForProposedUnits) || 0,
        workSpaceForTotalUnits:
          parseFloat(workshop.WorkSpaceForTotalUnits) || 0,
        availableWorkshopSpace:
          parseFloat(workshop.AvailableWorkshopSpace) || 0,
        workshopSpaceVariation:
          parseFloat(workshop.WorkshopSpaceVariation) || 0,
        availableFloorId: effectiveFloorId,
        availableFloorPref: effectiveFloorPref,
        floorPrefVariation: effectiveFloorVar,
        workshopPhotoPath: effectivePhotoPath,
        workshopxml: "",
        isEditAllowed: true,
        lastModifiedOn: new Date().toISOString(),
        userLoginID: loginID || "",
        ipAddress: ipAddress || "0.0.0.0",
        pageCode: "WorkshopDetails",
        modelCurriculum: workshop.ModelCurriculum || "",
        ...overrides,
      };
    },
    [instituteID, loginID, ipAddress],
  );

  const createWorkshopDetailsPayload = useCallback(
    (workshop) => {
      const avail = parseFloat(workshop.SpaceAvailable) || 0;
      const singleWorkshopXML = `<DataList><Data><WorkshopId>${workshop.WorkshopId || 0}</WorkshopId><CourseID>${workshop.CourseID || 0}</CourseID><AvailableFloorId>${avail > 0 ? parseInt(workshop.AvailableFloorId) || 0 : 0}</AvailableFloorId><AvailableWorkshopSpace>${avail}</AvailableWorkshopSpace></Data></DataList>`;
      return buildBasePayload(workshop, { workshopxml: singleWorkshopXML });
    },
    [buildBasePayload],
  );

  const createPhotoPayload = useCallback(
    (workshop) => {
      return buildBasePayload(workshop, { workshopxml: "" });
    },
    [buildBasePayload],
  );

  const createDeletePhotoPayload = useCallback(
    (workshop) => {
      return buildBasePayload(workshop, {
        workshopxml: "",
        workshopPhotoPath: "", // explicitly empty for delete
        availableFloorId: 0,
        availableFloorPref: "",
        floorPrefVariation:
          parseFloat(workshop.RequiredSpace) > 0
            ? "Not-Acceptable"
            : "Acceptable",
      });
    },
    [buildBasePayload],
  );

  // ─── Handler: Available Space Change ─────────────────────────────────────────
  const handleAvailableSpaceChange = useCallback(
    (value, rowIndex) => {
      const raw = String(value ?? "").trim();

      // Allow clearing or intermediate decimal
      if (raw === "" || raw === ".") {
        setWorkshopData((prev) => {
          const updated = [...prev];
          const row = { ...updated[rowIndex] };
          const req = parseFloat(row.RequiredSpace) || 0;
          const prevAvail = parseFloat(row.SpaceAvailable) || 0;

          row.SpaceAvailable = "";
          row.SpaceAvailability = parseFloat((0 - req).toFixed(2));
          row._spaceEntered = true;

          // Space cleared → deactivate floor+photo
          // Reset display but preserve _db* for restore
          if (prevAvail > 0) {
            row.AvailableFloorId = -1;
            row.AvailableFloorPref = "";
            row.FloorPrefVariation = req > 0 ? "Not-Acceptable" : "Acceptable";
            row.WorkshopPhotoPath = "";
            row._needsDeleteApi =
              row._hadPhotoInDb || row._dbWorkshopPhotoPath !== ""; // flag for delete API
          }

          updated[rowIndex] = row;
          setModifiedWorkshopIds((prevSet) =>
            new Set(prevSet).add(row.WorkshopId),
          );
          calculateTotals(updated);
          recalculateRemarks(updated);
          return updated;
        });
        return;
      }

      const sanitized = raw.replace(/,/g, "");

      if ((sanitized.match(/\./g) || []).length > 1) {
        Swal.fire({
          icon: "error",
          title: "Invalid Input",
          text: "Please enter a valid number with maximum 2 decimal places",
          confirmButtonText: "OK",
        });
        return;
      }
      if (!/^(\d*\.?\d{0,2})$/.test(sanitized)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Input",
          text: "Please enter a valid number with maximum 2 decimal places",
          confirmButtonText: "OK",
        });
        return;
      }

      // Still typing decimal e.g. "12."
      if (sanitized.endsWith(".")) {
        setWorkshopData((prev) => {
          const updated = [...prev];
          const row = { ...updated[rowIndex] };
          row.SpaceAvailable = sanitized;
          row._spaceEntered = true;
          updated[rowIndex] = row;
          calculateTotals(updated);
          recalculateRemarks(updated);
          return updated;
        });
        return;
      }

      let numericValue = parseFloat(sanitized);
      if (isNaN(numericValue)) numericValue = 0;

      setWorkshopData((prev) => {
        const updated = [...prev];
        const row = { ...updated[rowIndex] };
        const req = parseFloat(row.RequiredSpace) || 0;
        const prevAvail = parseFloat(row.SpaceAvailable) || 0;

        row.SpaceAvailable = numericValue;
        row.SpaceAvailability = parseFloat((numericValue - req).toFixed(2));
        row._spaceEntered = true;

        if (numericValue > 0 && prevAvail === 0) {
          // ── Case: Space changed 0 → >0 ────────────────────────────────
          // RESTORE _db* values so user sees previously saved data
          row.AvailableFloorId = row._dbAvailableFloorId ?? -1;
          row.AvailableFloorPref = row._dbAvailableFloorPref ?? "";
          row.FloorPrefVariation = row._dbFloorPrefVariation ?? "Not-Evaluated";
          row.WorkshopPhotoPath = row._dbWorkshopPhotoPath ?? "";
          row._needsDeleteApi = false; // no longer need delete since restoring
        } else if (numericValue === 0 && prevAvail > 0) {
          // ── Case: Space changed >0 → 0 ────────────────────────────────
          // Deactivate + reset display, preserve _db* for future restore
          row.AvailableFloorId = -1;
          row.AvailableFloorPref = "";
          row.FloorPrefVariation = req > 0 ? "Not-Acceptable" : "Acceptable";
          row.WorkshopPhotoPath = "";
          row._needsDeleteApi =
            row._hadPhotoInDb || row._dbWorkshopPhotoPath !== "";
        }
        // If numericValue > 0 and prevAvail > 0: just editing the number, keep selections

        updated[rowIndex] = row;
        setModifiedWorkshopIds((prevSet) =>
          new Set(prevSet).add(row.WorkshopId),
        );
        calculateTotals(updated);
        recalculateRemarks(updated);
        return updated;
      });
    },
    [calculateTotals, recalculateRemarks],
  );

  // ─── Handler: Floor Change ────────────────────────────────────────────────────
  const handleAvailableFloorChange = useCallback(
    (e, rowIndex) => {
      const floorId = parseInt(e.target.value);
      setWorkshopData((prevData) => {
        const updatedData = [...prevData];
        const row = { ...updatedData[rowIndex] };
        const requiredFloorId = row.FloorId;

        row.AvailableFloorId = floorId;
        row.AvailableFloorPref =
          floorId === 0 ? "Ground Floor" : floorId > 0 ? "Other Floor" : "";

        if (floorId === -1) {
          row.FloorPrefVariation = "Not-Evaluated";
        } else if (requiredFloorId === 0 && floorId === 0) {
          row.FloorPrefVariation = "Acceptable";
        } else if (requiredFloorId === 0 && floorId > 0) {
          row.FloorPrefVariation = "Not-Acceptable";
        } else if (requiredFloorId > 0) {
          row.FloorPrefVariation = "Acceptable";
        } else {
          row.FloorPrefVariation = "Not-Evaluated";
        }

        // Update _db* mirrors so space toggle restores latest selection
        row._dbAvailableFloorId = row.AvailableFloorId;
        row._dbAvailableFloorPref = row.AvailableFloorPref;
        row._dbFloorPrefVariation = row.FloorPrefVariation;

        updatedData[rowIndex] = row;
        setModifiedWorkshopIds((prev) => new Set(prev).add(row.WorkshopId));
        recalculateRemarks(updatedData);
        return updatedData;
      });
    },
    [recalculateRemarks],
  );

  // ─── Handler: Photo Upload ────────────────────────────────────────────────────
  const handleWorkshopPhotoChange = useCallback((fileData, rowIndex) => {
    setWorkshopData((prevData) => {
      const updatedData = [...prevData];
      const row = { ...updatedData[rowIndex] };
      row.WorkshopPhotoPath =
        fileData.filePath || fileData.uniqueFileName || "";
      // Update _db* mirror so space toggle restores latest upload
      row._dbWorkshopPhotoPath = row.WorkshopPhotoPath;
      row._hadPhotoInDb = true;
      updatedData[rowIndex] = row;
      setModifiedWorkshopIds((prev) => new Set(prev).add(row.WorkshopId));
      return updatedData;
    });
  }, []);

  // ─── Handler: Photo Remove (local only — clears field for re-upload) ──────────
  const handlePhotoRemove = useCallback((rowIndex) => {
    setWorkshopData((prevData) => {
      const updatedData = [...prevData];
      const row = { ...updatedData[rowIndex] };
      row.WorkshopPhotoPath = "";
      row._dbWorkshopPhotoPath = "";
      updatedData[rowIndex] = row;
      setModifiedWorkshopIds((prev) => new Set(prev).add(row.WorkshopId));
      return updatedData;
    });
  }, []);

  // ─── Handler: Delete Photo (calls API) ────────────────────────────────────────
  const handleDeletePhoto = useCallback(
    async (rowIndex) => {
      const workshop = workshopData[rowIndex];

      const confirm = await Swal.fire({
        icon: "warning",
        title: "Delete Photo",
        text: `Are you sure you want to delete the workshop photo for "${workshop.CourseCodeName || workshop.Course}"?`,
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
      });
      if (!confirm.isConfirmed) return;

      try {
        startLoading();
        const payload = createDeletePhotoPayload(workshop);
        const response = await agent.post(DeleteWorkshopPhotoPath, payload, {
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        });

        //if (response.data?.Status === "Success") {
        //    setWorkshopData(prevData => {
        //        const updatedData = [...prevData];
        //        const row = { ...updatedData[rowIndex] };
        //        row.WorkshopPhotoPath = '';
        //        row._dbWorkshopPhotoPath = '';
        //        row._hadPhotoInDb = false;
        //        row._needsDeleteApi = false;
        //        updatedData[rowIndex] = row;
        //        return updatedData;
        //    });
        if (response.data?.Status === "Success") {
          setWorkshopData((prevData) => {
            const updatedData = [...prevData];
            const row = { ...updatedData[rowIndex] };
            row.WorkshopPhotoPath = "";
            row._dbWorkshopPhotoPath = "";
            row._hadPhotoInDb = false;
            row._needsDeleteApi = false;
            // Reset floor dropdown to "-- Select --" in UI
            row.AvailableFloorId = -1;
            row.AvailableFloorPref = "";
            row._dbAvailableFloorId = -1;
            row._dbAvailableFloorPref = "";
            updatedData[rowIndex] = row;
            return updatedData;
          });
          setModifiedWorkshopIds((prev) =>
            new Set(prev).add(workshop.WorkshopId),
          );
          await Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Workshop photo deleted successfully.",
            confirmButtonText: "OK",
          });
        } else {
          throw new Error(response.data?.Message || "Failed to delete photo");
        }
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.Message ||
            error.message ||
            "Failed to delete workshop photo.",
          confirmButtonText: "OK",
        });
      } finally {
        stopLoading();
      }
    },
    [workshopData, createDeletePhotoPayload, startLoading, stopLoading],
  );

  // ─── Document Popup ───────────────────────────────────────────────────────────
  const openDocumentPopup = useCallback((documentUrl, itemName) => {
    if (!documentUrl) {
      Swal.fire({
        title: "No Document",
        text: "No document available to view.",
        icon: "info",
      });
      return;
    }
    const popupWidth = 900,
      popupHeight = 700;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;
    const popup = window.open(
      "",
      `${itemName}_PDF_Viewer`,
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`,
    );
    if (popup) {
      popup.document.write(`
                <html><head><title>${itemName} Document Viewer</title>
                <style>body{margin:0;overflow:hidden;}iframe{border:none;width:100vw;height:100vh;}</style>
                </head><body><iframe src="${documentUrl}" frameborder="0"></iframe></body></html>
            `);
      popup.document.close();
      popup.focus();
    } else {
      Swal.fire({
        title: "Popup Blocked",
        text: "Please allow popups for this website to view the document.",
        icon: "error",
      });
    }
  }, []);

  // ─── Table Data ───────────────────────────────────────────────────────────────
  const prepareTableData = useCallback(() => {
    const dataRows = workshopData.map((workshop, index) => {
      const rowComplete = isRowComplete(workshop);
      const isModified = modifiedWorkshopIds.has(workshop.WorkshopId);
      const isPartial = isRowPartiallyFilled(workshop);
      const active = isFloorAndPhotoActive(workshop);
      const floorVariation = getFloorVariation(workshop);

      let rowClassName = "";
      if (isModified) {
        if (rowComplete) rowClassName = "bg-green-50";
        else if (isPartial) rowClassName = "bg-red-50";
        else rowClassName = "bg-yellow-50";
      }

      const hasPhoto =
        workshop.WorkshopPhotoPath && workshop.WorkshopPhotoPath.trim() !== "";

      return {
        sn: index + 1,

        course: workshop.ModelCurriculum ? (
          <DocumentLink
            documentUrl={workshop.ModelCurriculum}
            itemName={workshop.CourseCodeName || "Course"}
            label={workshop.CourseCodeName || ""}
          />
        ) : (
          workshop.CourseCodeName || ""
        ),

        inspectionUnits: workshop.InspectionUnits || 0,
        maxSetups: workshop.MaxTraningSetupRequired || 0,
        perUnitNorm: (workshop.PerSetupNorm || 0).toFixed(2),
        requiredSpace: (workshop.RequiredSpace || 0).toFixed(2),

        // Available Space — always editable, controls activation of other cols
        availableSpace: (
          <div className="w-28 mx-auto">
            <FormComponent
              label=""
              type="text"
              autoUpperCase={false}
              value={
                workshop.SpaceAvailable !== undefined &&
                workshop.SpaceAvailable !== null
                  ? workshop.SpaceAvailable.toString()
                  : ""
              }
              onChange={(v) => handleAvailableSpaceChange(v, index)}
              extraClass="text-right"
              disabled={isLocked}
            />
          </div>
        ),

        spaceAvailability: (workshop.SpaceAvailability || 0).toFixed(2),
        floorPreference: workshop.FloorPref || "",

        // ── Available Floor ───────────────────────────────────────────
        availableFloor: active ? (
          <div className="flex items-center justify-center">
            <select
              name={`availableFloor_${index}`}
              value={workshop.AvailableFloorId?.toString() || "-1"}
              onChange={(e) => handleAvailableFloorChange(e, index)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLocked}
            >
              <option value="-1">-- Select --</option>
              <option value="0">Ground Floor</option>
              <option value="99">Other Floor</option>
            </select>
          </div>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-400 border border-gray-200 select-none">
            Deactivated
          </span>
        ),

        // ── Floor Variation — always display only ─────────────────────
        floorVariation: (
          <span
            className={
              floorVariation === "Acceptable"
                ? "text-green-600 font-semibold"
                : floorVariation === "Not-Acceptable"
                  ? "text-red-600 font-semibold"
                  : "text-gray-500"
            }
          >
            {floorVariation}
          </span>
        ),

        // ── Workshop Photo ────────────────────────────────────────────
        workshopPhoto: active ? (
          <div className="flex items-center justify-center gap-2">
            {hasPhoto ? (
              <>
                {/* Re-upload — clears path so UploadPdf shows again */}
                <button
                  type="button"
                  onClick={() => handlePhotoRemove(index)}
                  className="bg-[#00c3f9] hover:bg-[#00a8d9] text-white px-4 py-1 rounded text-sm font-medium"
                  disabled={isLocked}
                >
                  Upload
                </button>
                {/* View */}
                <button
                  type="button"
                  onClick={() =>
                    openDocumentPopup(
                      workshop.WorkshopPhotoPath,
                      "WorkshopPhoto",
                    )
                  }
                  className="text-blue-600 hover:text-blue-800 underline text-sm font-medium cursor-pointer"
                >
                  View
                </button>
                {/* Delete — calls API */}
              </>
            ) : (
              <UploadPdf
                file={workshop.WorkshopPhotoPath}
                onFileChange={(fileData) =>
                  handleWorkshopPhotoChange(fileData, index)
                }
                buttonClassName="bg-[#00c3f9]"
                buttonText="Upload"
                showLabel={false}
                allowedFileTypes="jpg, jpeg, png, pdf"
                maxFileSize="2 MB"
                required={true}
                userTypeId={userTypeID}
                userLoginID={loginID}
                linkName="View"
                uniquefilepath={workshop.WorkshopPhotoPath}
                id={`workshopPhoto_${index}`}
                disabled={isLocked}
              />
            )}
          </div>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-400 border border-gray-200 select-none">
            Deactivated
          </span>
        ),

        rowClassName,
      };
    });

    // Totals row
    dataRows.push({
      sn: "",
      course: <strong>Total</strong>,
      inspectionUnits: "",
      maxSetups: "",
      perUnitNorm: "",
      requiredSpace: <strong>{totals.totalRequiredSpace}</strong>,
      availableSpace: <strong>{totals.totalAvailableSpace}</strong>,
      spaceAvailability: <strong>{totals.totalSpaceAvailability}</strong>,
      floorPreference: "",
      availableFloor: "",
      floorVariation: "",
      workshopPhoto: "",
      rowClassName: "bg-gray-100 font-bold",
    });

    return dataRows;
  }, [
    workshopData,
    totals,
    isRowComplete,
    isRowPartiallyFilled,
    isFloorAndPhotoActive,
    getFloorVariation,
    modifiedWorkshopIds,
    handleAvailableFloorChange,
    handleWorkshopPhotoChange,
    handlePhotoRemove,
    handleDeletePhoto,
    handleAvailableSpaceChange,
    openDocumentPopup,
    userTypeID,
    loginID,
    isLocked,
  ]);

  const workshopColumns = [
    {
      key: "sn",
      header: "S.N.",
     
      className: "text-center",
      width: "60px",
    },
    {
      key: "course",
      header: "Course",
     
      className: "text-left",
      width: "250px",
    },
    {
      key: "inspectionUnits",
      header: "Inspection Units",
    
      className: "text-center",
      width: "120px",
    },
    {
      key: "maxSetups",
      header: "Max Training Setups required",
      
      className: "text-center",
      width: "150px",
    },
    {
      key: "perUnitNorm",
      header: "Per Setup Norm (Sq.M.)",
      
      className: "text-center",
      width: "150px",
    },
    {
      key: "requiredSpace",
      header: "Required Space",
     
      className: "text-center",
      width: "120px",
    },
    {
      key: "availableSpace",
      header: "Available Space",
     
      className: "text-center",
      width: "150px",
    },
    {
      key: "spaceAvailability",
      header: "Space Availability",
      
      className: "text-center",
      width: "140px",
    },
    {
      key: "floorPreference",
      header: "Floor Preference",
      
      className: "text-center",
      width: "130px",
    },
    {
      key: "availableFloor",
      header: (
        <span>
          Available Floor <span className="text-red-500">*</span>
        </span>
      ),
     
      className: "text-center",
      width: "180px",
    },
    {
      key: "floorVariation",
      header: "Floor Variation",
      
      className: "text-center",
      width: "140px",
    },
    {
      key: "workshopPhoto",
      header: (
        <span>
          Workshop Photo <span className="text-red-500">*</span>
        </span>
      ),
     
      className: "text-center",
      width: "210px",
    },
  ];

  // ─── Save Helpers ─────────────────────────────────────────────────────────────
  const getModifiedCompleteWorkshops = useCallback(() => {
    return workshopData.filter(
      (w) => modifiedWorkshopIds.has(w.WorkshopId) && isRowComplete(w),
    );
  }, [workshopData, modifiedWorkshopIds, isRowComplete]);

  const getModifiedIncompleteWorkshops = useCallback(() => {
    return workshopData.filter(
      (w) => modifiedWorkshopIds.has(w.WorkshopId) && isRowPartiallyFilled(w),
    );
  }, [workshopData, modifiedWorkshopIds, isRowPartiallyFilled]);

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validateData = useCallback(async () => {
    const partiallyFilledRows = getModifiedIncompleteWorkshops();
    if (partiallyFilledRows.length > 0) {
      const incompleteDetails = partiallyFilledRows
        .map((workshop) => {
          const missingFields = [];
          const avail = parseFloat(workshop.SpaceAvailable) || 0;

          if (
            !workshop._spaceEntered ||
            workshop.SpaceAvailable === "" ||
            workshop.SpaceAvailable === null
          )
            missingFields.push("Available Space");

          if (avail > 0) {
            if (
              workshop.AvailableFloorId === null ||
              workshop.AvailableFloorId === undefined ||
              workshop.AvailableFloorId === -1
            )
              missingFields.push("Available Floor");
            if (
              !workshop.WorkshopPhotoPath ||
              workshop.WorkshopPhotoPath.trim() === ""
            )
              missingFields.push("Workshop Photo");
          }

          return `<li><strong>${workshop.CourseCodeName || workshop.Course}</strong>: Missing — ${missingFields.join(", ")}</li>`;
        })
        .join("");

      await Swal.fire({
        icon: "warning",
        title: "Incomplete Rows Detected",
        //html: `<div class="text-left">
        //    <p class="mb-2 text-red-600 font-semibold">Please complete all required fields:</p>
        //    <ul class="list-disc list-inside space-y-1 text-sm">${incompleteDetails}</ul>
        //</div>`,
        confirmButtonText: "OK",
        width: "600px",
      });
      return false;
    }
    return true;
  }, [getModifiedIncompleteWorkshops]);

  // ─── Save ─────────────────────────────────────────────────────────────────────
  const handleSaveNormal = async () => {
    const isValid = await validateData();
    if (!isValid) return;

    if (isLocked) {
      return;
    }

      if (isViewer || !canSave) {
          goNext();
          return;
      }
    const workshopsToSave = getModifiedCompleteWorkshops();

    if (workshopsToSave.length === 0) {
      await //    Swal.fire({
      //    icon: 'info', title: 'Nothing to Save',
      //    text: 'No modified and complete rows found. Please fill all required fields for at least one row.',
      //    confirmButtonText: 'OK'
      //});

      //Swal.fire({
      //    icon: 'warning',
      //    title: 'Incomplete Rows Detected',

      //    confirmButtonText: 'OK',
      //    width: '600px'
      //});

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "workshop detail(s) saved successfully!",
        confirmButtonText: "OK",
      });
        goNext();
        //navigate("/Institute/TrainingEquipmentDetails");
      return;
    }

    try {
      startLoading();

      const savePromises = workshopsToSave.map(async (workshop) => {
        try {
          const avail = parseFloat(workshop.SpaceAvailable) || 0;

          // ── Step 1: Save workshop details (space + floor via XML) ──
          const detailsResponse = await agent.post(
            SaveWorkshopDetails,
            createWorkshopDetailsPayload(workshop),
            { headers: { "Content-Type": "application/json" }, timeout: 15000 },
          );
          if (detailsResponse.data?.Status !== "Success") {
            return {
              success: false,
              workshop,
              error:
                detailsResponse.data?.Message ||
                "Failed to save workshop details",
            };
          }

          // ── Step 2: Handle photo ──────────────────────────────────
          //if (avail === 0 && workshop._needsDeleteApi) {
          //    // Space set to 0 AND had photo in DB → call Delete API to clear photo in DB
          //    const deleteResponse = await agent.post(
          //        DeleteWorkshopPhotoPath,
          //        createDeletePhotoPayload(workshop),
          //        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
          //    );
          //    if (deleteResponse.data?.Status !== "Success") {
          //        return { success: false, workshop, error: 'Details saved but photo delete failed: ' + (deleteResponse.data?.Message || 'Unknown error') };
          //    }
          //} else {
          //    // Normal save photo path
          //    const photoResponse = await agent.post(
          //        SaveWorkshopPhotoPath,
          //        createPhotoPayload(workshop),
          //        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
          //    );
          //    if (photoResponse.data?.Status !== "Success") {
          //        return { success: false, workshop, error: 'Details saved but photo failed: ' + (photoResponse.data?.Message || 'Unknown error') };
          //    }
          //}
          // ── Step 2: Handle photo ──────────────────────────────────
          // ── Step 2: Handle photo based on activation state ────────
          if (avail === 0 && workshop._needsDeleteApi) {
            // Space=0 AND had photo in DB → call Delete to clear photo in DB
            const deleteResponse = await agent.post(
              DeleteWorkshopPhotoPath,
              createDeletePhotoPayload(workshop),
              {
                headers: { "Content-Type": "application/json" },
                timeout: 15000,
              },
            );
            if (deleteResponse.data?.Status !== "Success") {
              return {
                success: false,
                workshop,
                error:
                  "Details saved but photo delete failed: " +
                  (deleteResponse.data?.Message || "Unknown error"),
              };
            }
          } else if (avail === 0 && !workshop._needsDeleteApi) {
            // Space=0 AND photo already cleared previously → skip photo API entirely
            // Nothing to do, details already saved above
          } else {
            // Space > 0 → save photo normally
            const photoResponse = await agent.post(
              SaveWorkshopPhotoPath,
              createPhotoPayload(workshop),
              {
                headers: { "Content-Type": "application/json" },
                timeout: 15000,
              },
            );
            if (photoResponse.data?.Status !== "Success") {
              return {
                success: false,
                workshop,
                error:
                  "Details saved but photo failed: " +
                  (photoResponse.data?.Message || "Unknown error"),
              };
            }
          }

          return { success: true, workshop };
        } catch (error) {
          return {
            success: false,
            workshop,
            error: error.response?.data?.Message || error.message,
          };
        }
      });

      const results = await Promise.all(savePromises);
      const successfulSaves = results.filter((r) => r.success);
      const failedSaves = results.filter((r) => !r.success);

      if (failedSaves.length === 0) {
        // Update _db* mirrors with saved values for correct future restores
        setWorkshopData((prev) =>
          prev.map((w) => {
            const saved = successfulSaves.find(
              (s) => s.workshop.WorkshopId === w.WorkshopId,
            );
            if (!saved) return w;
            return {
              ...w,
              _dbAvailableFloorId: w.AvailableFloorId,
              _dbAvailableFloorPref: w.AvailableFloorPref,
              _dbFloorPrefVariation: w.FloorPrefVariation,
              _dbWorkshopPhotoPath: w.WorkshopPhotoPath,
              _hadPhotoInDb: !!(
                w.WorkshopPhotoPath && w.WorkshopPhotoPath.trim() !== ""
              ),
              _needsDeleteApi: false,
              _spaceEntered: true,
            };
          }),
        );

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: `${successfulSaves.length} workshop detail(s) saved successfully!`,
          confirmButtonText: "OK",
        });
        setModifiedWorkshopIds(new Set());
        navigate("/Institute/TrainingEquipmentDetails");
      } else {
        const failedDetails = failedSaves
          .map(
            ({ workshop, error }) =>
              `<li><strong>${workshop.CourseCodeName || workshop.Course}</strong>: ${error}</li>`,
          )
          .join("");

        await Swal.fire({
          icon: "error",
          title: "Partial Save Failed",
          html: `<div class="text-left">
                        <p class="mb-3"><strong>Successfully saved:</strong> ${successfulSaves.length} row(s)</p>
                        <p class="mb-2 text-red-600 font-semibold"><strong>Failed:</strong> ${failedSaves.length} row(s)</p>
                        <ul class="list-disc list-inside space-y-1 text-sm">${failedDetails}</ul>
                    </div>`,
          confirmButtonText: "OK",
          width: "600px",
        });

        setModifiedWorkshopIds((prev) => {
          const newSet = new Set(prev);
          successfulSaves.forEach(({ workshop }) =>
            newSet.delete(workshop.WorkshopId),
          );
          return newSet;
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      stopLoading();
    }
  };

  const handleSaveAndNext = async () => {
    // 🔐 ADMIN VALIDATION
    if (userTypeID === 14 || userTypeID === 81) {
      const isvalid = inspectionref.current?.validate();

      if (!isvalid) {
        return;
      }
      if (!inspectionStatus.status) {
        Swal.fire("Validation", "Please select status", "warning");
        return;
      }

      if (inspectionStatus.status === "R" && !inspectionStatus.remark) {
        Swal.fire(
          "Validation",
          "Remark is required when status is Rejected",
          "warning",
        );
        return;
      }
    }

    // 🔒 LOCK CHECK
    if (isLocked) {
      // if (userTypeID === 14 || userTypeID === 81) {
      //   navigate(`/Institute/TrainingEquipmentDetails?P1=${p1}&P2=${p2}`);
      // } else {
      //   navigate("/Institute/TrainingEquipmentDetails");
        // }
        goNext();
      return;
      }
      if (isViewer || !canSave) {
          goNext();
          return;
      }

    try {
      // ✅ Save data WITHOUT popup
        await handleSaveNormal(false);

      // 👮 ADMIN API
      if (userTypeID === 14 || userTypeID === 81) {
        const statusPayload = {
          InstituteID: instituteID,
          PageCode: "Workshop",
          Status: inspectionStatus.status,
          Remark: inspectionStatus.remark || "",
          CreatedBy: loginID,
          IpAddress: ipAddress,
          userTypeID: userTypeID,
        };

        const res = await agent.post(
          UpdateInstituteInspectionVerificationStatus,
          statusPayload,
          { headers: { "Content-Type": "application/json" } },
        );

        if (res.data?.Status !== "Success") {
          throw new Error(res.data?.Message || "Status update failed");
        }

        //await Swal.fire({
        //    icon: 'success',
        //    title: 'Success',
        //    text: 'Workshop details saved successfully',
        //    confirmButtonText: 'OK'
        //});
      }

      // 🔄 NAVIGATION
      if (userTypeID === 14 || userTypeID === 81) {
        navigate(`/Institute/TrainingEquipmentDetails?P1=${p1}&P2=${p2}`);
      } else {
        navigate("/Institute/TrainingEquipmentDetails");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.Message || "Something went wrong",
      });
    }
    };

    const handleSave = async () => {
        if (userTypeID === 14 || userTypeID === 81) {
            await handleSaveAndNext();
        } else if (userTypeID === 64) {
            await handleSaveNormal();
        } else {
            goNext();
        }
    };
    

  // ─── Render ───────────────────────────────────────────────────────────────────
    return (

        <InstituteFlowLayout
            currentPageCode="WorkshopDetails"
            p1={p1}
            p2={p2}
            onSave={handleSave}
            isSaveLoading={isLoading}
            isLocked={isLocked}
            title="Workshop Details"
            color={color}
            //showFlowActions={!showEquipmentForm}
        >
   

        <div className="mt-4">
          <FilteredTableComponent
            data={prepareTableData()}
            columns={workshopColumns}
            filterColumns={[]}
            customButtons={[]}
            title=""
            exportFileName="Workshop_Details"
            tableId="workshop-details-table"
            searchable={false}
            sortable={false}
            showExcelTemplate={false}
            exportable={false}
            showSearch={false}
            showExport={false}
            className="mt-3"
            maxHeight="500px"
            stickyHeader={true}
            readOnly={true}
            rowClassName={(row) => row.rowClassName}
          />
        </div>

        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700 font-medium">Note:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
            <li>Negative Space Availability means shortage</li>
            <li>Positive Space Availability means adequate/excess</li>
          </ol>
        </div>

        <div className="mt-4">
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              <span className="font-bold">Remark for Space:</span>
              <span className="ml-2">
                {remarks.spaceRemark || "Loading..."}
              </span>
            </p>
            <p className="text-sm font-medium text-red-700 mt-2">
              <span className="font-bold">Remark for Floor Preference:</span>
              <span className="ml-2">
                {remarks.floorPreferenceRemark || "N/A"}
              </span>
            </p>
          </div>
        </div>

        {/*{userTypeID === 14 && (*/}
        {/*    <InspectionStatusComponent*/}
        {/*        instituteId={instituteID}*/}
        {/*        pageCode="WorkshopDetails"*/}
        {/*        onChange={(data) => setInspectionStatus(data)}*/}
        {/*    />*/}
        {/*)}*/}

            {(userTypeID === 81 || isViewer ) &&
          (["S"].includes(eligibilityData?.InspectionStatus) ||
            ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
            <InspectionStatusComponent
              // ref={inspectionref}
              instituteId={instituteID}
              pageCode="WorkshopDetails"
              // onChange={(data) => setInspectionStatus(data)}
              //readOnly={userTypeID !== 14}
              readOnly={
                eligibilityData?.InspectionStatus === "S" && userTypeID === 81
              }
              TypeID="14"
              // userName="By Dveto"
              mode="view"
            />
          )}

        {(userTypeID === 14 ||
          ((userTypeID == 64 || userTypeID === 81) &&
            ["I", "S", "WD", "W"].includes(
              eligibilityData?.InspectionStatus,
            )) ||
          ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
          <InspectionStatusComponent
            ref={inspectionref}
            instituteId={instituteID}
            pageCode="WorkshopDetails"
            onChange={(data) => setInspectionStatus(data)}
            //readOnly={userTypeID !== 14}
            //readOnly={eligibilityData?.InspectionStatus === 'S' && userTypeID === 14}
            readOnly={
              (userTypeID === 14 &&
                eligibilityData?.InspectionStatus === "S") ||
              (userTypeID === 81 && eligibilityData?.VerificationStatus === "V")
            }
          />
        )}

            {(userTypeID === 14 || isViewer ) &&
          ["S", "WD"].includes(eligibilityData?.InspectionStatus) && (
            <InspectionStatusComponent
              // ref={inspectionref}
              instituteId={instituteID}
              pageCode="WorkshopDetails"
              // onChange={(data) => setInspectionStatus(data)}
              //readOnly={userTypeID !== 14}
              readOnly={
                eligibilityData?.InspectionStatus === "S" && userTypeID === 14
              }
              TypeID="81"
              //userName="By Board"
              mode="view"
            />
          )}
     
        </InstituteFlowLayout >
      
    
  );
};

export default WorkshopDetails;
