import React, { useContext, useState, useEffect, useMemo } from "react";
import Loader from "../../../Component/formcomponent/Loader";
import { ThemeContext } from "../../Context/ThemeContext";
import { FaUserTie, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../../Hooks/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import agent from "../../../lib/api/agent";
import { useLoading } from "../../../Hooks/useLoading";
import Swal from "sweetalert2";
import ReactDOM from "react-dom/client";
import Staff_PrintApplicationForm from "../../PrintApplicationForm/Staff_PrintApplicationForm";
import {
  GetInstituteIDByInstituteCode,
  GetPromotingOrganisationIDByInstituteID,
  GetPromoterDetailsByInstituteID,
} from "../../../Endpoints_All/Base/Institute";
import StaffProfilePopup from "../../formcomponent/StaffProfilePopup";
import { usePromoterTypes } from "../../../lib/hooks/useMasterQueries";
import DropdownSelectComponent from "../../formcomponent/DropdownSelectComponent";
import { Delete_PromoterStaffMappingDetails } from "../../../Endpoints_All/Secretary/PromotingOrganisation";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import VerifiedIcon from "../../../assets/VerifiedIcon.jpg";
import PendingIcon from "../../../assets/QuestionMark.png";
import RejectedIcon from "../../../assets/NotVerifiedIcon.jpg";
import { getDeviceIP, maskString } from "../../../utils/CommonHelper";

const ROLE_CONFIG = [
  {
    key: "authorizedRep",
    label: "Authorized Representative of Institute",
    apiLabel: "AuthorizedRepresentative",
    button: "Add Authorized Representative",
    updateButton: "Update Authorized Representative",
    ManagementTypeID: 5,
    required: true,
  },
  {
    key: "principal",
    label: "Principal Promoter",
    apiLabel: "Principal",
    button: "Add Chairman",
    updateButton: "Update Chairman",
    ManagementTypeID: 8,
    required: true,
  },
];

// Promoter type ID used by the Principal Promoter / Chairman
const CHAIRMAN_TYPE_ID = 8;

export const formatOptions = (data = []) => {
  if (!Array.isArray(data)) return [];
  return data.map((x) => ({
    label: x.Text,
    value: x.Value,
  }));
};

const Promoters = () => {
  const { color } = useContext(ThemeContext);
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const { startLoading, stopLoading, isLoading } = useLoading();

  const [authorizedRepresentative, setAuthorizedRepresentative] =
    useState(null);
  const [principalPromoter, setPrincipalPromoter] = useState(null);
  const [members, setMembers] = useState([]);
  const [isSamePerson, setIsSamePerson] = useState(false);
  const [selectedPromoterType, setSelectedPromoterType] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [hasPromotingOrg, setHasPromotingOrg] = useState(false);
  const [popupRole, setPopupRole] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [popupKey, setPopupKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [promotingOrgId, setPromotingOrgId] = useState(null);
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [ipAddress, setIpAddress] = useState("0.0.0.0");
  // Separate show/hide state for each table so toggling one eye
  // does not affect the other tables.
  const [showMobile, setShowMobile] = useState({
    authorizedRep: false,
    principal: false,
    members: false,
  });

  const toggleMobile = (tableKey) =>
    setShowMobile((prev) => ({ ...prev, [tableKey]: !prev[tableKey] }));

  // -------------------------------------------------------------------------
  // Table columns. The Mobile No header has an eye icon:
  //   numbers visible -> open eye (FaEye)
  //   numbers hidden  -> crossed eye (FaEyeSlash)
  // -------------------------------------------------------------------------
  const buildColumns = (tableKey, isVisible) => [
    { key: "ProfileID", header: "Profile ID" },
    { key: "FullName", header: "Full Name" },
    { key: "GenderCode", header: "Gender" },
    {
      key: "MobileNo",
      header: (
        <span className="inline-flex items-center justify-center gap-2">
          Mobile No
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // don't trigger column sort
              toggleMobile(tableKey);
            }}
            className="text-white hover:text-gray-300"
            title={isVisible ? "Hide mobile numbers" : "Show mobile numbers"}
            aria-label={
              isVisible ? "Hide mobile numbers" : "Show mobile numbers"
            }
          >
            {isVisible ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
          </button>
        </span>
      ),
    },
    { key: "IsapprovedPromoter", header: "Status" },
    { key: "Action", header: "Action" },
  ];

  const authorizedRepColumns = useMemo(
    () => buildColumns("authorizedRep", showMobile.authorizedRep),
    // eslint-disable-next-line
    [showMobile.authorizedRep],
  );
  const principalColumns = useMemo(
    () => buildColumns("principal", showMobile.principal),
    // eslint-disable-next-line
    [showMobile.principal],
  );
  const membersColumns = useMemo(
    () => buildColumns("members", showMobile.members),
    // eslint-disable-next-line
    [showMobile.members],
  );

  const { data: promoterTypeOptions, loading: loadingPromoterTypes } =
    usePromoterTypes("Organization");

  // Hide "Chairman" (Principal Promoter, TypeID 8) from the Member dropdown
  // once a Principal Promoter has already been added.
  const filteredPromoterTypeOptions = useMemo(() => {
    if (!Array.isArray(promoterTypeOptions)) return [];

    if (!principalPromoter) return promoterTypeOptions;

    return promoterTypeOptions.filter(
      (x) =>
        Number(x.Value) !== CHAIRMAN_TYPE_ID &&
        String(x.Text).trim().toLowerCase() !== "chairman",
    );
  }, [promoterTypeOptions, principalPromoter]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const P1 = params.get("P1"); // Organisation ID

  useEffect(() => {
    checkPromotingOrganisationAndFetchPromoters();
    fetchIP();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (selectedPromoterType && selectedPromoterType !== "-1") {
      const selectedId = Number(selectedPromoterType);

      const filtered = members.filter(
        (m) => Number(m.PromoterTypeID) === selectedId,
      );

      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [selectedPromoterType, members]);

  // If the selected type disappears from the list (e.g. Chairman got hidden
  // after the Principal Promoter was added), clear the selection.
  useEffect(() => {
    if (!selectedPromoterType || selectedPromoterType === "-1") return;
    if (!Array.isArray(promoterTypeOptions) || !promoterTypeOptions.length)
      return;

    const stillAvailable = filteredPromoterTypeOptions.some(
      (x) => String(x.Value) === String(selectedPromoterType),
    );

    if (!stillAvailable) {
      setSelectedPromoterType("");
    }
  }, [filteredPromoterTypeOptions, selectedPromoterType, promoterTypeOptions]);

  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);
    } catch (err) {
      // keep default IP
    }
  };

  // Open print form in new window
  const handlePrintProfile = (profileID, staffId) => {
    if (!profileID && !staffId) {
      Swal.fire("Info", "No Profile ID available", "info");
      return;
    }

    const displayId = profileID || staffId;

    let staffID = 0;
    if (staffId) {
      staffID = parseInt(staffId);
    } else if (profileID) {
      const staffIDMatch = profileID.match(/\d+/g);
      staffID = staffIDMatch
        ? parseInt(staffIDMatch[staffIDMatch.length - 1])
        : 0;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=1200,height=900,left=100,top=50,menubar=yes,toolbar=yes,scrollbars=yes,resizable=yes",
    );

    if (!printWindow) {
      Swal.fire({
        icon: "error",
        title: "Pop-up Blocked",
        text: "Please allow pop-ups for this website to view the print form.",
        confirmButtonText: "OK",
      });
      return;
    }

    printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Staff Application Form - ${displayId}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
                <style>
                    body { 
                        font-family: 'Poppins', sans-serif; 
                        margin: 0; 
                        padding: 10px;
                        line-height: normal;
                    }
                    #root { width: 100%; }
                    
                    @media print {
                        body { margin: 0; padding: 0; }
                        .no-print { display: none !important; }
                    }
                    
                    .loading-spinner {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 400px;
                    }
                    .spinner-border {
                        width: 3rem;
                        height: 3rem;
                    }
                    /* Staff_PrintApplicationForm.css */

body {
    line-height: normal;
}

.staff-print-application-form {
    font-family: 'Poppins', sans-serif;
    padding: 20px;
    background-color: #fff;
}

.application-form {
    width: 100%;
    font-size: 12px;
    border: 1px solid #c5d3d3;
    margin-bottom: 0px;
}

    .application-form th {
        background-color: #f0f1f4;
        border: 1px solid #c5d3d3;
        font-weight: 600;
        color: #000;
        padding: 0.25rem;
    }

    .application-form td {
        border: 1px solid #c5d3d3;
        vertical-align: middle;
        color: #000;
        padding: 0.25rem;
    }

.table {
    margin: 0px;
}

    .table th {
        padding: 0.25rem;
    }

    .table td {
        padding: 0.25rem;
    }

.GridView {
    margin: 0px;
    width: 100%;
}

    .GridView th {
        border: 1px solid #eeeeee;
        padding: 3px;
        font-size: 12px;
        font-weight: 500;
        vertical-align: middle;
        background-color: #f0f1f4;
    }

    .GridView td {
        border: 1px solid #eeeeee;
        padding: 3px;
        font-size: 12px;
    }

.sub-title {
    font-size: 12px;
}

.main-title {
    font-size: 14px;
}

.main-title1 {
    font-size: 18px;
    font-weight: 600;
}

.labelFont {
    font-weight: 600 !important;
}

.text-lg {
    font-size: 16px;
}

.empty-data {
    text-align: center;
    padding: 20px;
    font-size: 14px;
    font-weight: 600;
    color: #666;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

    .action-buttons .btn {
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
    }

        .action-buttons .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

    .action-buttons .btn-secondary {
        background-color: #6c757d;
        border-color: #6c757d;
        color: #fff;
    }

    .action-buttons .btn-primary {
        background-color: #0d6efd;
        border-color: #0d6efd;
        color: #fff;
    }

    .action-buttons .btn-danger {
        background-color: #dc3545;
        border-color: #dc3545;
        color: #fff;
    }

/* Loading and Error States */
.loading-container,
.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 20px;
}

    .error-container .alert {
        max-width: 600px;
        width: 100%;
    }

/* Print Styles */
@media print {
    .no-print {
        display: none !important;
    }

    .staff-print-application-form {
        padding: 0;
    }

    body {
        margin: 0;
        padding: 0;
    }

    .application-form {
        page-break-inside: avoid;
    }

    table {
        page-break-inside: auto;
    }

    tr {
        page-break-inside: avoid;
        page-break-after: auto;
    }
}
.logo-image {
    width: 90px;
}
.india-logo {
    width: 60px;
}
.me-3 {
    margin-right: 1rem !important;
}
/* Responsive adjustments */
@media screen and (max-width: 768px) {
    .application-form {
        font-size: 10px;
    }

    .action-buttons {
        flex-direction: column;
    }

        .action-buttons .btn {
            width: 100%;
            justify-content: center;
        }
}
.sub-title {
    font-size: 12px;
}.main-title {
    font-size: 14px;
}.main-title1 {
    font-size: 18px;
}

                </style>
            </head>
            <body>
                <div id="root">
                    <div class="loading-spinner">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);

    printWindow.document.close();

    printWindow.onload = () => {
      try {
        const container = printWindow.document.getElementById("root");
        const root = ReactDOM.createRoot(container);
        const handleReadyToPrint = () => {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 300);
        };
        root.render(
          <Staff_PrintApplicationForm
            staffID={staffID}
            userLoginID={displayId}
            pageCode="STAFF_PRINT"
            onReadyToPrint={handleReadyToPrint}
          />,
        );
      } catch (error) {
        printWindow.document.body.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <h3 style="color: red;">Error loading print form</h3>
                        <p>${error.message}</p>
                        <button onclick="window.close()" style="padding: 10px 20px; margin-top: 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                    </div>
                `;
      }
    };
  };

  const hasPrincipalPromoter = !!principalPromoter;
  const canEditSamePerson = !hasPrincipalPromoter;

  useEffect(() => {
    if (authorizedRepresentative && principalPromoter) {
      setIsSamePerson(
        authorizedRepresentative.StaffId === principalPromoter.StaffId,
      );
    } else {
      setIsSamePerson(null);
    }
  }, [authorizedRepresentative, principalPromoter]);

  const handlePopupClose = () => {
    setPopupRole(null);
    setPopupKey((prev) => prev + 1);
  };

  const onPopupSaved = async () => {
    handlePopupClose();
    setRefresh((r) => !r);
    if (popupRole) {
      setErrors((prev) => ({ ...prev, [popupRole]: false }));
    }

    if (promotingOrgId) {
      await fetchPromotersData(promotingOrgId);
    }
  };

  const handleDeletePromoter = async (promoter) => {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this promoter?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
      });

      if (!confirm.isConfirmed) return;

      const payload = {
        PromoterID: promoter.PromoterID,
        PromoterTypeID: promoter.PromoterTypeID,
        InstituteID: promotingOrgId,
        UserLoginID: userInfo?.UserLoginID,
        IPAddress: ipAddress,
        PageCode: "PromotersDetailsVerifiation",

        // Required fields (from API validation)
        FirstName: promoter.FirstName || "",
        LastName: promoter.LastName || "",
        MiddleName: promoter.MiddleName || "",
        MobileNo: promoter.MobileNo || "",
        GenderCode: promoter.GenderCode || "",
        FormatDOB: promoter.FormatDOB || "",
        Title: promoter.Title || "",
        EMailID: promoter.EMailID || "",
        PhoneNo: promoter.PhoneNo || "",
        AadhaarNo: promoter.AadhaarNo || "",
        AadhaarPath: promoter.AadhaarPath || "",
        PhotoPath: promoter.PhotoPath || "",
        Designation: promoter.Designation || "",
        StaffProfileId: promoter.StaffProfileId || "",
        PromoterType: promoter.PromoterType || "",
        RejectRemakr: "",

        AltMobileNo: promoter.AltMobileNo || "",
        IsapprovedPromoter: promoter.IsapprovedPromoter || "",
      };

      const response = await agent.delete(Delete_PromoterStaffMappingDetails, {
        data: payload,
      });

      if (response?.data === "Y" || response?.data?.Status === "Success") {
        Swal.fire("Success", "Promoter deleted successfully", "success");
        await fetchPromotersData(promotingOrgId);
      } else {
        Swal.fire("Error", response?.data || "Delete failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const checkPromotingOrganisationAndFetchPromoters = async () => {
    startLoading();
    try {
      const instituteCode = userInfo?.UserLoginID;

      const resInstitute = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`,
      );
      if (!resInstitute.data?.Data) {
        await showInstructionAlert();
        return;
      }

      const instituteId = resInstitute.data.Data;

      let PromotorOrganisationID;

      // STEP 1: URL param
      if (P1) {
        PromotorOrganisationID = Number(P1);
      }
      // STEP 2: Promoter login
      else if (userInfo.UserTypeID === 66) {
        PromotorOrganisationID = instituteId;
      }
      // STEP 3: Fallback API
      else {
        const resorganisation = await agent.get(
          `${GetPromotingOrganisationIDByInstituteID}/${instituteId}`,
        );

        PromotorOrganisationID = resorganisation?.data?.Data;

        if (
          resorganisation.data?.Status !== "Success" ||
          !PromotorOrganisationID ||
          PromotorOrganisationID === 0
        ) {
          setHasPromotingOrg(false);
          await showInstructionAlert();
          return;
        }
      }

      setHasPromotingOrg(true);
      setPromotingOrgId(PromotorOrganisationID);

      await fetchPromotersData(PromotorOrganisationID);
    } catch (error) {
      await showInstructionAlert();
    } finally {
      stopLoading();
    }
  };

  const fetchPromotersData = async (promotingOrgId) => {
    try {
      const payload = {
        instituteId: promotingOrgId,
        userLoginID: userInfo?.UserLoginID || "",
        pageCode: "ExistingInstitute",
        itemId: "0",
        ipAddress: ipAddress,
      };

      const response = await agent.post(
        GetPromoterDetailsByInstituteID,
        payload,
      );

      if (
        response.data?.Status === "Success" &&
        response.data?.Data &&
        response.data.Data.length > 0
      ) {
        const promotersData = response.data.Data;

        const authRep = promotersData.find(
          (p) =>
            p.PromoterType === "Authorized Representative" ||
            p.PromoterTypeID === 5,
        );

        const principal = promotersData.find(
          (p) =>
            p.PromoterType === "Principal Promoter" ||
            p.PromoterTypeID === CHAIRMAN_TYPE_ID,
        );

        const membersList = promotersData.filter(
          (p) =>
            p.PromoterType === "Trustee" ||
            p.PromoterType === "Member" ||
            p.PromoterType === "Director" ||
            p.PromoterType === "Partner" ||
            [1, 2, 3, 4].includes(p.PromoterTypeID),
        );

        setAuthorizedRepresentative(authRep || null);
        setPrincipalPromoter(principal || null);
        setMembers(membersList);

        if (authRep && principal && authRep.StaffId === principal.StaffId) {
          setIsSamePerson(true);
        } else {
          setIsSamePerson(false);
        }
      } else {
        setAuthorizedRepresentative(null);
        setPrincipalPromoter(null);
        setMembers([]);
      }
    } catch (error) {
      setAuthorizedRepresentative(null);
      setPrincipalPromoter(null);
      setMembers([]);
    }
  };

  const showInstructionAlert = async () => {
    const result = await Swal.fire({
      title: "Promoters Not Updated",
      width: "700px",
      html: `
            <div class="text-left w-full">
                <p class="mb-3">Promoters for this Skill Development Institute are not updated. To update Promoters details, follow below mentioned process:</p>
                <ol class="list-decimal ml-5 space-y-2">
                    <li>Register Promoting Organization. Refer User Manual for Promoting Organization for detailed process</li>
                    <li>Update "Promoters" page in Promoting Organization account.</li>
                    <li>The Promoters details shall be displayed on this page once Promoters are updated in Promoting Organization account.</li>
                </ol>
            </div>
        `,
      icon: "info",
      confirmButtonText: "OK",
      customClass: {
        confirmButton:
          "bg-[#00c3f9] hover:bg-[#00a8d6] text-white rounded px-6 py-2",
      },
      buttonsStyling: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    if (result.isConfirmed) {
      window.history.back();
    }
  };

  const extractProfileId = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/<[^>]*>/g, "");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusIcon = (status) => {
    if (status === "V") {
      return (
        <div className="flex justify-center">
          <img src={VerifiedIcon} className="w-6 h-6" alt="Verified" />
        </div>
      );
    }

    if (status === "R") {
      return (
        <div className="flex justify-center">
          <img src={RejectedIcon} className="w-6 h-6" alt="Not Verified" />
        </div>
      );
    }

    // "A" or null -> Pending
    return (
      <div className="flex justify-center">
        <img src={PendingIcon} className="w-6 h-6" alt="Pending" />
      </div>
    );
  };

  const handleBack = () => {
    if (userInfo?.UserTypeID === 66) {
      navigate("/promotingorganization/profile");
    } else {
      navigate(`/promotingorganization/profile?instituteId=${P1}`);
    }
  };

  const handleNext = () => {
    const authStatus = authorizedRepresentative?.IsapprovedPromoter;

    // Secretary only
    if (userInfo?.UserTypeID === 81) {
      // Not verified -> show popup
      if (authStatus !== "V") {
        setShowVerifyPopup(true);
        return;
      }

      // Verified -> allow navigation
      navigate(
        `/PromotingOrganization/AssociatedInstitutes?instituteId=${promotingOrgId}&from=promoters`,
      );
      return;
    }

    // Other users -> no restriction
    if (userInfo?.UserTypeID === 66) {
      navigate("/promotingorganization/AssociatedInstitutes");
    } else {
      navigate(-1);
    }
  };

  const handleSamePersonChange = (value) => {
    if (value === true && authorizedRepresentative) {
      setPrincipalPromoter({ ...authorizedRepresentative });
      setIsSamePerson(true);
    } else {
      setPrincipalPromoter(null);
      setIsSamePerson(false);
    }
  };

  const getRoleConfig = () => {
    // Static roles
    const staticRole = ROLE_CONFIG.find((r) => r.key === popupRole);
    if (staticRole) return staticRole;

    // Dynamic promoter roles (from dropdown)
    if (popupRole && selectedPromoterType) {
      const selectedTypeObj = filteredPromoterTypeOptions.find(
        (x) => String(x.Value) === String(selectedPromoterType),
      );

      return {
        key: popupRole,
        label: popupRole,
        apiLabel: popupRole,
        button: `Add ${popupRole}`,
        updateButton: `Update ${popupRole}`,
        ManagementTypeID: selectedTypeObj?.Value,
        required: false,
        isDynamic: true,
      };
    }

    return null;
  };

  const handleProfileClick = (row) => {
    const applicationId =
      extractProfileId(row.StaffProfileId) || row.ProfileID || "";

    const staffID = applicationId?.slice(-6); // last 6 digits
    const userLoginID = applicationId;

    const url = `/react/StaffPrintApplicationForm?staffID=${staffID}&userLoginID=${userLoginID}`;

    window.open(
      url,
      "PrintWindow",
      "width=900,height=700,top=100,left=200,scrollbars=yes,resizable=yes",
    );
  };

  const handleAddMember = () => {
    if (!selectedPromoterType) {
      Swal.fire("Please select Promoter Type first");
      return;
    }

    setPopupRole(selectedPromoterType);
    setPopupKey((prev) => prev + 1);
  };

  // -------------------------------------------------------------------------
  // Shared cell renderer.
  // Every cell is centered so values line up with the centered table headers.
  // -------------------------------------------------------------------------
  const renderCell = (item, column, tableKey) => {
    const cellClass = "w-full text-center text-sm";

    if (column.key === "ProfileID") {
      return (
        <div className={cellClass}>
          <a
            href="#"
            className="text-blue-600 underline"
            onClick={(e) => {
              e.preventDefault();
              handleProfileClick(item);
            }}
          >
            {item.ProfileID}
          </a>
        </div>
      );
    }

    if (column.key === "MobileNo") {
      return (
        <div className={cellClass}>
          {item.MobileNo
            ? showMobile[tableKey]
              ? item.MobileNo
              : maskString(item.MobileNo)
            : "-"}
        </div>
      );
    }

    if (column.key === "IsapprovedPromoter") {
      return (
        <div className={cellClass}>{getStatusIcon(item.IsapprovedPromoter)}</div>
      );
    }

    if (column.key === "Action") {
      return (
        <div className="flex w-full justify-center items-center">
          <button
            type="button"
            onClick={() => handleDeletePromoter(item)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        </div>
      );
    }

    return <div className={cellClass}>{item[column.key] || "-"}</div>;
  };

  // Adds ProfileID and FullName to a promoter row for the table
  const toTableRow = (promoter) => ({
    ...promoter,
    ProfileID: extractProfileId(promoter.StaffProfileId) || promoter.StaffId,
    FullName: [
      promoter.Title,
      promoter.FirstName,
      promoter.MiddleName,
      promoter.LastName,
    ]
      .filter(Boolean)
      .join(" "),
  });

  return (
    <>
      {isLoading && <Loader />}

      <div className="w-full p-4">
        <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
          <legend
            className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
          >
            <FaUserTie className="mr-2 text-white" />
            Promoters
          </legend>

          <div className="px-4 pb-3 pt-3">
            {/* Pink Note Box */}
            <div className="bg-pink-100 border border-pink-300 text-pink-800 px-3 py-2 rounded text-sm mb-4">
              <strong>Note:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>
                  To edit Authorized Representative/ Principal Promoter/ Promoter
                  profile information, login to respective Staff/ Management
                  account and edit profile.
                </li>
                <li>
                  To change assigned Authorized Representative/ Principal
                  Promoter/ Promoter, login to respective Promoting Organization
                  and edit Promoters.
                </li>
              </ol>
            </div>

            {/* Authorized Representative Section */}
            <div className="mb-4">
              <div className="bg-gray-200 px-3 py-2 mb-2 rounded">
                <h3 className="text-sm font-semibold text-gray-800">
                  Authorized Representative of Promoting Organization*
                </h3>
              </div>
              <div className="flex justify-center">
                <button
                  className={`${errors["authorizedRep"] ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} px-6 py-2 rounded text-white text-sm font-semibold mb-2`}
                  onClick={() => {
                    setPopupRole("authorizedRep");
                    setPopupKey((prev) => prev + 1);
                  }}
                >
                  {authorizedRepresentative
                    ? "Update Authorized Representative"
                    : "Add Authorized Representative"}
                </button>
              </div>
              {authorizedRepresentative ? (
                <div className="w-full overflow-x-auto">
                  <FilteredTableComponent
                    data={[toTableRow(authorizedRepresentative)]}
                    columns={authorizedRepColumns}
                    renderCell={(item, column) =>
                      renderCell(item, column, "authorizedRep")
                    }
                    searchable={false}
                    sortable={true}
                    filterColumns={["FirstName", "LastName", "GenderCode"]}
                    showExport={false}
                    maxHeight="400px"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm py-4 border border-gray-300 rounded">
                  No Authorized Representative found.
                </div>
              )}
            </div>

            {/* Principal Promoter Section */}
            <div className="mb-4">
              <div className="bg-gray-200 px-3 py-2 mb-2 rounded">
                <h3 className="text-sm font-semibold text-gray-800">
                  Principal Promoter*
                </h3>
              </div>

              <div className="mb-3 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Is Authorized Representative and Principal Promoter same ?
                </span>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isSame"
                    value="Yes"
                    checked={isSamePerson === true}
                    disabled={!canEditSamePerson}
                    onChange={() => handleSamePersonChange(true)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isSame"
                    value="No"
                    checked={isSamePerson === false}
                    disabled={!canEditSamePerson}
                    onChange={() => handleSamePersonChange(false)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm">No</span>
                </label>
              </div>
              <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-4 mb-4">
                <button
                  className={`${errors["principal"] ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} px-6 py-2 rounded text-white text-sm font-semibold`}
                  onClick={() => {
                    setPopupRole("principal");
                    setPopupKey((prev) => prev + 1);
                  }}
                >
                  {principalPromoter ? "Update Chairman" : "Add Chairman"}
                </button>
              </div>

              {principalPromoter ? (
                <div className="w-full overflow-x-auto">
                  <FilteredTableComponent
                    data={[toTableRow(principalPromoter)]}
                    columns={principalColumns}
                    renderCell={(item, column) =>
                      renderCell(item, column, "principal")
                    }
                    searchable={false}
                    sortable={true}
                    filterColumns={["FirstName", "LastName", "GenderCode"]}
                    showExport={false}
                    maxHeight="400px"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm py-4 border border-gray-300 rounded">
                  No Principal Promoter found.
                </div>
              )}
            </div>

            {/* Members Section */}
            <div className="mb-4">
              <div className="bg-gray-200 px-3 py-2 mb-2 rounded">
                <h3 className="text-sm font-semibold text-gray-800">Member</h3>
              </div>
              <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-4 mb-4">
                <div className="w-64">
                  <DropdownSelectComponent
                    label="Promoter Type"
                    name="PromoterType"
                    options={formatOptions(filteredPromoterTypeOptions)}
                    value={selectedPromoterType}
                    onChange={(value) => setSelectedPromoterType(value)}
                    required={false}
                    loading={loadingPromoterTypes}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={
                    !selectedPromoterType || selectedPromoterType === "-1"
                  }
                  title={
                    !selectedPromoterType || selectedPromoterType === "-1"
                      ? "Please select Promoter Type"
                      : filteredMembers.length
                        ? "Update existing promoter"
                        : "Add new promoter"
                  }
                  className={`px-6 py-2 h-[42px] rounded text-sm font-semibold transition-all duration-200 ${
                    !selectedPromoterType || selectedPromoterType === "-1"
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : errors[selectedPromoterType]
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {filteredMembers.length ? "Update Promoter" : "Add Promoter"}
                </button>
              </div>

              {filteredMembers.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <FilteredTableComponent
                    data={filteredMembers.map(toTableRow)}
                    columns={membersColumns}
                    renderCell={(item, column) =>
                      renderCell(item, column, "members")
                    }
                    searchable={false}
                    sortable={true}
                    filterColumns={["FirstName", "LastName", "GenderCode"]}
                    showExport={false}
                    maxHeight="400px"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm py-4 border border-gray-300 rounded">
                  {members.length > 0
                    ? "No members found for selected promoter type."
                    : "No members found."}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                type="button"
                className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded font-semibold text-sm"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        </fieldset>

        {showVerifyPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[600px] max-w-[95vw] overflow-hidden">
              {/* Header */}
              <div className="bg-[#1a2a4a] flex items-center justify-between px-4 py-3">
                <span className="text-white font-bold text-base">
                  Alert !!!
                </span>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-0.5 rounded text-sm"
                  onClick={() => setShowVerifyPopup(false)}
                >
                  X
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-red-600 font-semibold text-base mb-5 leading-snug">
                  Authorized Representative for Promoting Organization is not
                  verified. Verify Authorized Representative before Promoting
                  Organization Verification
                </p>

                <div className="flex items-start gap-4">
                  {/* Details */}
                  <div className="flex-1 space-y-2 text-sm text-gray-800">
                    <p>
                      <span className="font-bold">Staff/ Management</span> :{" "}
                      {authorizedRepresentative
                        ? `${authorizedRepresentative.Title || ""} ${authorizedRepresentative.FirstName || ""} ${authorizedRepresentative.MiddleName || ""} ${authorizedRepresentative.LastName || ""}`.trim() +
                          (authorizedRepresentative.StaffProfileId ||
                          authorizedRepresentative.StaffId
                            ? ` (${extractProfileId(authorizedRepresentative.StaffProfileId) || authorizedRepresentative.StaffId})`
                            : "")
                        : "-"}
                    </p>
                    <p>
                      <span className="font-bold">Date of Birth</span> :{" "}
                      {authorizedRepresentative?.FormatDOB ||
                        formatDate(authorizedRepresentative?.DOB) ||
                        "-"}
                    </p>
                    <p>
                      <span className="font-bold">Gender</span> :{" "}
                      {authorizedRepresentative?.GenderCode || "-"}
                    </p>
                    <p>
                      <span className="font-bold">Primary Mobile No</span> :{" "}
                      {authorizedRepresentative?.MobileNo || "-"}
                    </p>
                    <p>
                      <span className="font-bold">E-mail ID</span> :{" "}
                      {authorizedRepresentative?.EMailID || "-"}
                    </p>
                  </div>

                  {/* Photo + Status Icon */}
                  <div className="relative flex-shrink-0 w-[100px] h-[110px]">
                    {authorizedRepresentative?.PhotoPath ? (
                      <img
                        src={authorizedRepresentative.PhotoPath}
                        alt="Staff Photo"
                        className="w-full h-full object-cover rounded border border-gray-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                        No Photo
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1">
                      <img
                        src={RejectedIcon}
                        alt="Not Verified"
                        className="w-8 h-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-3 mt-6">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded text-sm font-semibold"
                    onClick={() => {
                      setShowVerifyPopup(false);
                      const staffID =
                        authorizedRepresentative?.StaffId ||
                        extractProfileId(
                          authorizedRepresentative?.StaffProfileId,
                        ) ||
                        "";
                      navigate(`/Staff/StaffVerification?P1=${staffID}`);
                    }}
                  >
                    Verify Staff/ Management Details
                  </button>
                  <button
                    className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-5 py-2 rounded text-sm font-semibold"
                    onClick={() => setShowVerifyPopup(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <StaffProfilePopup
          key={popupKey}
          open={!!popupRole}
          roleConfig={getRoleConfig()}
          onClose={handlePopupClose}
          onSaved={onPopupSaved}
          IsPromotorForm={true}
          instituteId={promotingOrgId}
          isPromotingOrgId={true}
        />
      </div>
    </>
  );
};

export default Promoters;


// import React, { useContext, useState, useEffect } from "react";
// import Loader from "../../../Component/formcomponent/Loader";
// import { ThemeContext } from "../../Context/ThemeContext";
// //import DropdownComponent from "../../formcomponent/DropdownComponent";
// import { FaUserTie } from "react-icons/fa";
// import { useAuth } from "../../../Hooks/AuthContext";
// import { useNavigate } from "react-router-dom";
// import agent from "../../../lib/api/agent";
// import { useLoading } from "../../../Hooks/useLoading";
// import Swal from "sweetalert2";
// import ReactDOM from "react-dom/client"; // ADD THIS IMPORT
// import Staff_PrintApplicationForm from "../../PrintApplicationForm/Staff_PrintApplicationForm"; // ADD THIS IMPORT
// import {
//   GetInstituteIDByInstituteCode,
//   GetPromotingOrganisationIDByInstituteID,
//   GetPromoterDetailsByInstituteID,
// } from "../../../Endpoints_All/Base/Institute";
// import StaffProfilePopup from "../../formcomponent/StaffProfilePopup";
// import { usePromoterTypes } from "../../../lib/hooks/useMasterQueries";
// import DropdownSelectComponent from "../../formcomponent/DropdownSelectComponent";
// import { useLocation } from "react-router-dom";
// import { Delete_PromoterStaffMappingDetails } from "../../../Endpoints_All/Secretary/PromotingOrganisation";
// import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
// import { FaTrash } from "react-icons/fa";
// import VerifiedIcon from "../../../assets/VerifiedIcon.jpg";
// import PendingIcon from "../../../assets/QuestionMark.png";
// import RejectedIcon from "../../../assets/NotVerifiedIcon.jpg";
// import { getDeviceIP } from "../../../utils/CommonHelper";
// //const promoterTypeOptions = [
// //    { id: "Trustee", name: "Trustee" },
// //    { id: "Director", name: "Director" },
// //    { id: "Partner", name: "Partner" },
// //    { id: "Member", name: "Member" }
// //];
// const ROLE_CONFIG = [
//   {
//     key: "authorizedRep",
//     label: "Authorized Representative of Institute",
//     apiLabel: "AuthorizedRepresentative",
//     button: "Add Authorized Representative",
//     updateButton: "Update Authorized Representative",
//     ManagementTypeID: 5,
//     required: true,
//   },
//   {
//     key: "principal",
//     label: "Principal Promoter",
//     apiLabel: "Principal",
//     button: "Add Chairman",
//     updateButton: "Update Chairman",
//     ManagementTypeID: 8,
//     required: true,
//   },
// ];
// //function formatOptions(options) {
// //    return options.map((opt) =>
// //        typeof opt === "object"
// //            ? { value: opt.id?.toString(), label: opt.name }
// //            : { value: opt, label: opt }
// //    );
// //}
// export const formatOptions = (data = []) => {
//   if (!Array.isArray(data)) return [];
//   return data.map((x) => ({
//     label: x.Text,
//     value: x.Value,
//   }));
// };

// const Promoters = () => {
//   const { color } = useContext(ThemeContext);
//   const { userInfo } = useAuth();
//   const navigate = useNavigate();
//   const { startLoading, stopLoading, isLoading } = useLoading();

//   const [authorizedRepresentative, setAuthorizedRepresentative] =
//     useState(null);
//   const [principalPromoter, setPrincipalPromoter] = useState(null);
//   const [members, setMembers] = useState([]);
//   const [isSamePerson, setIsSamePerson] = useState(false);
//   const [selectedPromoterType, setSelectedPromoterType] = useState("");
//   const [filteredMembers, setFilteredMembers] = useState([]);
//   const [hasPromotingOrg, setHasPromotingOrg] = useState(false);
//   const [popupRole, setPopupRole] = useState(null);
//   const [refresh, setRefresh] = useState(false);
//   const [popupKey, setPopupKey] = useState(0);
//   const [errors, setErrors] = useState({});
//   const [promotingOrgId, setPromotingOrgId] = useState(null);
//   const [showVerifyPopup, setShowVerifyPopup] = useState(false); 
//   const [ipAddress, setIpAddress] = useState("0.0.0.0");

//   // const [isPromoterTypeDisabled, setIsPromoterTypeDisabled] = useState(false);
//   const { data: promoterTypeOptions, loading: loadingPromoterTypes } =
//     usePromoterTypes("Organization");

//   const location = useLocation();
//   const params = new URLSearchParams(location.search);

//   const P1 = params.get("P1"); // Organisation ID
//   //const P2 = params.get("P2"); // Hash

//   useEffect(() => {
//     checkPromotingOrganisationAndFetchPromoters();
//     fetchIP();
//     // eslint-disable-next-line
//   }, []);

//   //useEffect(() => {
//   //    debugger;
//   //    if (selectedPromoterType) {
//   //        const filtered = members.filter(m => m.PromoterTypeID === selectedPromoterType);
//   //        setFilteredMembers(filtered);
//   //    } else {
//   //        setFilteredMembers(members);
//   //    }
//   //}, [selectedPromoterType, members]);
//   useEffect(() => {
//     if (selectedPromoterType && selectedPromoterType !== "-1") {
//       const selectedId = Number(selectedPromoterType);

//       const filtered = members.filter(
//         (m) => Number(m.PromoterTypeID) === selectedId,
//       );

//       setFilteredMembers(filtered);
//     } else {
//       setFilteredMembers(members);
//     }
//   }, [selectedPromoterType, members]);

//    const fetchIP = async () => {
//         try {
//             const ip = await getDeviceIP();
//             setIpAddress(ip);
//         } catch (err) {
//         }
//         };

//   // NEW: Function to open print form in new window
//   const handlePrintProfile = (profileID, staffId) => {
//     if (!profileID && !staffId) {
//       Swal.fire("Info", "No Profile ID available", "info");
//       return;
//     }

//     // Use profileID if available, otherwise use staffId
//     const displayId = profileID || staffId;

//     // Extract StaffID - try multiple methods
//     let staffID = 0;
//     if (staffId) {
//       staffID = parseInt(staffId);
//     } else if (profileID) {
//       const staffIDMatch = profileID.match(/\d+/g);
//       staffID = staffIDMatch
//         ? parseInt(staffIDMatch[staffIDMatch.length - 1])
//         : 0;
//     }

//     // Open new window
//     const printWindow = window.open(
//       "",
//       "_blank",
//       "width=1200,height=900,left=100,top=50,menubar=yes,toolbar=yes,scrollbars=yes,resizable=yes",
//     );

//     if (!printWindow) {
//       Swal.fire({
//         icon: "error",
//         title: "Pop-up Blocked",
//         text: "Please allow pop-ups for this website to view the print form.",
//         confirmButtonText: "OK",
//       });
//       return;
//     }

//     // Write initial HTML structure
//     printWindow.document.write(`
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Staff Application Form - ${displayId}</title>
//                 <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
//                 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
//                 <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
//                 <style>
//                     body { 
//                         font-family: 'Poppins', sans-serif; 
//                         margin: 0; 
//                         padding: 10px;
//                         line-height: normal;
//                     }
//                     #root { width: 100%; }
                    
//                     @media print {
//                         body { margin: 0; padding: 0; }
//                         .no-print { display: none !important; }
//                     }
                    
//                     .loading-spinner {
//                         display: flex;
//                         justify-content: center;
//                         align-items: center;
//                         min-height: 400px;
//                     }
//                     .spinner-border {
//                         width: 3rem;
//                         height: 3rem;
//                     }
//                     /* Staff_PrintApplicationForm.css */

// body {
//     line-height: normal;
// }

// .staff-print-application-form {
//     font-family: 'Poppins', sans-serif;
//     padding: 20px;
//     background-color: #fff;
// }

// .application-form {
//     width: 100%;
//     font-size: 12px;
//     border: 1px solid #c5d3d3;
//     margin-bottom: 0px;
// }

//     .application-form th {
//         background-color: #f0f1f4;
//         border: 1px solid #c5d3d3;
//         font-weight: 600;
//         color: #000;
//         padding: 0.25rem;
//     }

//     .application-form td {
//         border: 1px solid #c5d3d3;
//         vertical-align: middle;
//         color: #000;
//         padding: 0.25rem;
//     }

// .table {
//     margin: 0px;
// }

//     .table th {
//         padding: 0.25rem;
//     }

//     .table td {
//         padding: 0.25rem;
//     }

// .GridView {
//     margin: 0px;
//     width: 100%;
// }

//     .GridView th {
//         border: 1px solid #eeeeee;
//         padding: 3px;
//         font-size: 12px;
//         font-weight: 500;
//         vertical-align: middle;
//         background-color: #f0f1f4;
//     }

//     .GridView td {
//         border: 1px solid #eeeeee;
//         padding: 3px;
//         font-size: 12px;
//     }

// .sub-title {
//     font-size: 12px;
// }

// .main-title {
//     font-size: 14px;
// }

// .main-title1 {
//     font-size: 18px;
//     font-weight: 600;
// }

// .labelFont {
//     font-weight: 600 !important;
// }

// .text-lg {
//     font-size: 16px;
// }

// .empty-data {
//     text-align: center;
//     padding: 20px;
//     font-size: 14px;
//     font-weight: 600;
//     color: #666;
// }

// /* Action Buttons */
// .action-buttons {
//     display: flex;
//     justify-content: center;
//     gap: 15px;
//     margin-bottom: 20px;
//     padding: 15px;
//     background-color: #f8f9fa;
//     border-radius: 8px;
// }

//     .action-buttons .btn {
//         padding: 10px 20px;
//         font-size: 14px;
//         font-weight: 500;
//         border-radius: 6px;
//         display: flex;
//         align-items: center;
//         gap: 8px;
//         transition: all 0.3s ease;
//     }

//         .action-buttons .btn:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
//         }

//     .action-buttons .btn-secondary {
//         background-color: #6c757d;
//         border-color: #6c757d;
//         color: #fff;
//     }

//     .action-buttons .btn-primary {
//         background-color: #0d6efd;
//         border-color: #0d6efd;
//         color: #fff;
//     }

//     .action-buttons .btn-danger {
//         background-color: #dc3545;
//         border-color: #dc3545;
//         color: #fff;
//     }

// /* Loading and Error States */
// .loading-container,
// .error-container {
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     min-height: 400px;
//     padding: 20px;
// }

//     .error-container .alert {
//         max-width: 600px;
//         width: 100%;
//     }

// /* Print Styles */
// @media print {
//     .no-print {
//         display: none !important;
//     }

//     .staff-print-application-form {
//         padding: 0;
//     }

//     body {
//         margin: 0;
//         padding: 0;
//     }

//     .application-form {
//         page-break-inside: avoid;
//     }

//     table {
//         page-break-inside: auto;
//     }

//     tr {
//         page-break-inside: avoid;
//         page-break-after: auto;
//     }
// }
// .logo-image {
//     width: 90px;
// }
// .india-logo {
//     width: 60px;
// }
// .me-3 {
//     margin-right: 1rem !important;
// }
// /* Responsive adjustments */
// @media screen and (max-width: 768px) {
//     .application-form {
//         font-size: 10px;
//     }

//     .action-buttons {
//         flex-direction: column;
//     }

//         .action-buttons .btn {
//             width: 100%;
//             justify-content: center;
//         }
// }
// .sub-title {
//     font-size: 12px;
// }.main-title {
//     font-size: 14px;
// }.main-title1 {
//     font-size: 18px;
// }

//                 </style>
//             </head>
//             <body>
//                 <div id="root">
//                     <div class="loading-spinner">
//                         <div class="spinner-border text-primary" role="status">
//                             <span class="visually-hidden">Loading...</span>
//                         </div>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `);

//     printWindow.document.close();

//     // Wait for window to load, then render React component
//     printWindow.onload = () => {
//       try {
//         const container = printWindow.document.getElementById("root");
//         const root = ReactDOM.createRoot(container);
//         const handleReadyToPrint = () => {
//           setTimeout(() => {
//             printWindow.focus();
//             printWindow.print();
//           }, 300);
//         };
//         root.render(
//           <Staff_PrintApplicationForm
//             staffID={staffID}
//             userLoginID={displayId}
//             pageCode="STAFF_PRINT"
//             onReadyToPrint={handleReadyToPrint}
//           />,
//         );
//       } catch (error) {
//         printWindow.document.body.innerHTML = `
//                     <div style="padding: 20px; text-align: center;">
//                         <h3 style="color: red;">Error loading print form</h3>
//                         <p>${error.message}</p>
//                         <button onclick="window.close()" style="padding: 10px 20px; margin-top: 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
//                     </div>
//                 `;
//       }
//     };
//   };

//   const hasPrincipalPromoter = !!principalPromoter;
//   const canEditSamePerson = !hasPrincipalPromoter;

//   useEffect(() => {
//     if (authorizedRepresentative && principalPromoter) {
//       setIsSamePerson(
//         authorizedRepresentative.StaffId === principalPromoter.StaffId,
//       );
//     } else {
//       setIsSamePerson(null);
//     }
//   }, [authorizedRepresentative, principalPromoter]);

//   const handlePopupClose = () => {
//     setPopupRole(null);
//     setPopupKey((prev) => prev + 1);
//   };

//   const onPopupSaved = async () => {
//     handlePopupClose();
//     setRefresh((r) => !r);
//     if (popupRole) {
//       setErrors((prev) => ({ ...prev, [popupRole]: false }));
//     }

//     if (promotingOrgId) {
//       await fetchPromotersData(promotingOrgId);
//     }
//   };
//   const handleDeletePromoter = async (promoter) => {
//     try {
//       const confirm = await Swal.fire({
//         title: "Are you sure?",
//         text: "Do you want to delete this promoter?",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "Yes, Delete",
//         cancelButtonText: "Cancel",
//       });

//       if (!confirm.isConfirmed) return;

//       const payload = {
//         PromoterID: promoter.PromoterID,
//         PromoterTypeID: promoter.PromoterTypeID,
//         InstituteID: promotingOrgId,
//         UserLoginID: userInfo?.UserLoginID,
//         IPAddress: ipAddress,
//         PageCode: "PromotersDetailsVerifiation",

//         //  REQUIRED FIELDS (from API validation)
//         FirstName: promoter.FirstName || "",
//         LastName: promoter.LastName || "",
//         MiddleName: promoter.MiddleName || "",
//         MobileNo: promoter.MobileNo || "",
//         GenderCode: promoter.GenderCode || "",
//         FormatDOB: promoter.FormatDOB || "",
//         Title: promoter.Title || "",
//         EMailID: promoter.EMailID || "",
//         PhoneNo: promoter.PhoneNo || "",
//         AadhaarNo: promoter.AadhaarNo || "",
//         AadhaarPath: promoter.AadhaarPath || "",
//         PhotoPath: promoter.PhotoPath || "",
//         Designation: promoter.Designation || "",
//         StaffProfileId: promoter.StaffProfileId || "",
//         PromoterType: promoter.PromoterType || "",
//         RejectRemakr: "",

//         AltMobileNo: promoter.AltMobileNo || "",
//         IsapprovedPromoter: promoter.IsapprovedPromoter || "",
//       };


//       const response = await agent.delete(Delete_PromoterStaffMappingDetails, {
//         data: payload,
//       });

//       if (response?.data === "Y" || response?.data?.Status === "Success") {
//         Swal.fire("Success", "Promoter deleted successfully", "success");

//         // 🔥 REFRESH DATA
//         await fetchPromotersData(promotingOrgId);
//       } else {
//         Swal.fire("Error", response?.data || "Delete failed", "error");
//       }
//     } catch (error) {
//       Swal.fire("Error", "Something went wrong", "error");
//     }
//   };

//   const checkPromotingOrganisationAndFetchPromoters = async () => {
//     startLoading();
//     try {
//       const instituteCode = userInfo?.UserLoginID;

//       const resInstitute = await agent.get(
//         `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`,
//       );
//       if (!resInstitute.data?.Data) {
//         await showInstructionAlert();
//         return;
//       }

//       const instituteId = resInstitute.data.Data;

//       let PromotorOrganisationID;

//       //  STEP 1: USE URL PARAM (MOST IMPORTANT)
//       if (P1) {
//         PromotorOrganisationID = Number(P1);
//       }
//       //  STEP 2: PROMOTER LOGIN
//       else if (userInfo.UserTypeID === 66) {
//         PromotorOrganisationID = instituteId;
//       }
//       //  STEP 3: FALLBACK API
//       else {
//         const resorganisation = await agent.get(
//           `${GetPromotingOrganisationIDByInstituteID}/${instituteId}`,
//         );

//         PromotorOrganisationID = resorganisation?.data?.Data;

//         if (
//           resorganisation.data?.Status !== "Success" ||
//           !PromotorOrganisationID ||
//           PromotorOrganisationID === 0
//         ) {
//           setHasPromotingOrg(false);
//           await showInstructionAlert();
//           return;
//         }
//       }

//       //  COMMON FLOW
//       setHasPromotingOrg(true);
//       setPromotingOrgId(PromotorOrganisationID);

//       await fetchPromotersData(PromotorOrganisationID);
//     } catch (error) {
//       await showInstructionAlert();
//     } finally {
//       stopLoading();
//     }
//   };

//   const fetchPromotersData = async (promotingOrgId) => {
//     try {
//       const payload = {
//         instituteId: promotingOrgId,
//         userLoginID: userInfo?.UserLoginID || "",
//         pageCode: "ExistingInstitute",
//         itemId: "0",
//         ipAddress: ipAddress,
//       };

//       const response = await agent.post(
//         GetPromoterDetailsByInstituteID,
//         payload,
//       );

//       if (
//         response.data?.Status === "Success" &&
//         response.data?.Data &&
//         response.data.Data.length > 0
//       ) {
//         const promotersData = response.data.Data;

//         const authRep = promotersData.find(
//           (p) =>
//             p.PromoterType === "Authorized Representative" ||
//             p.PromoterTypeID === 5,
//         );

//         const principal = promotersData.find(
//           (p) =>
//             p.PromoterType === "Principal Promoter" || p.PromoterTypeID === 8,
//         );

//         const membersList = promotersData.filter(
//           (p) =>
//             p.PromoterType === "Trustee" ||
//             p.PromoterType === "Member" ||
//             p.PromoterType === "Director" ||
//             p.PromoterType === "Partner" ||
//             [1, 2, 3, 4].includes(p.PromoterTypeID),
//         );

//         setAuthorizedRepresentative(authRep || null);
//         setPrincipalPromoter(principal || null);
//         setMembers(membersList);

//         if (authRep && principal && authRep.StaffId === principal.StaffId) {
//           setIsSamePerson(true);
//         } else {
//           setIsSamePerson(false);
//         }
//       } else {
//         setAuthorizedRepresentative(null);
//         setPrincipalPromoter(null);
//         setMembers([]);
//       }
//     } catch (error) {
//       setAuthorizedRepresentative(null);
//       setPrincipalPromoter(null);
//       setMembers([]);
//     }
//   };

//   const showInstructionAlert = async () => {
//     const result = await Swal.fire({
//       title: "Promoters Not Updated",
//       width: "700px",
//       html: `
//             <div class="text-left w-full">
//                 <p class="mb-3">Promoters for this Skill Development Institute are not updated. To update Promoters details, follow below mentioned process:</p>
//                 <ol class="list-decimal ml-5 space-y-2">
//                     <li>Register Promoting Organization. Refer User Manual for Promoting Organization for detailed process</li>
//                     <li>Update "Promoters" page in Promoting Organization account.</li>
//                     <li>The Promoters details shall be displayed on this page once Promoters are updated in Promoting Organization account.</li>
//                 </ol>
//             </div>
//         `,
//       icon: "info",
//       confirmButtonText: "OK",
//       customClass: {
//         confirmButton:
//           "bg-[#00c3f9] hover:bg-[#00a8d6] text-white rounded px-6 py-2",
//       },
//       buttonsStyling: false,
//       allowOutsideClick: false, // Prevent closing by clicking outside
//       allowEscapeKey: false, // Prevent closing with Escape key
//     });

//     // Only navigate back if user clicked OK
//     if (result.isConfirmed) {
//       window.history.back();
//     }
//   };

//   const extractProfileId = (htmlString) => {
//     if (!htmlString) return "";
//     const cleanText = htmlString.replace(/<[^>]*>/g, "");
//     return cleanText;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const getStatusIcon = (status) => {
//     if (status === "V") {
//       return (
//         <div className="flex justify-center">
//           <img src={VerifiedIcon} className="w-6 h-6" />
//         </div>
//       );
//     }

//     if (status === "R") {
//       return (
//         <div className="flex justify-center">
//           <img src={RejectedIcon} className="w-6 h-6" />
//         </div>
//       );
//     }

//     // A or null → Pending
//     return (
//       <div className="flex justify-center">
//         <img src={PendingIcon} className="w-6 h-6" />
//       </div>
//     );
//   };

//   // UPDATED: Modified to include print functionality
//   const renderPromoterRow = (promoter) => {
//     if (!promoter) return null;

//     const profileId =
//       extractProfileId(promoter.StaffProfileId) || promoter.StaffId;

//     return (
//       <tr className="bg-white">
//         <td className="border border-gray-300 px-2 py-1">
//           <a
//             href="#"
//             className="text-blue-600 hover:text-blue-800 underline text-xs cursor-pointer"
//             onClick={(e) => {
//               e.preventDefault();
//               handlePrintProfile(profileId, promoter.StaffId);
//             }}
//           >
//             {profileId}
//           </a>
//         </td>
//         <td className="border border-gray-300 px-2 py-1 text-xs">
//           {promoter.Title || "-"}
//         </td>
//         <td className="border border-gray-300 px-2 py-1 text-xs">
//           {promoter.FirstName || "-"}
//         </td>
//         <td className="border border-gray-300 px-2 py-1 text-xs">
//           {promoter.MiddleName || "-"}
//         </td>
//         <td className="border border-gray-300 px-2 py-1 text-xs">
//           {promoter.LastName || "-"}
//         </td>
//         <td className="border border-gray-300 px-2 py-1 text-xs">
//           {promoter.GenderCode || "-"}
//         </td>
//         <td className="border border-gray-300 px-2 py-1 text-xs">
//           {promoter.FormatDOB || formatDate(promoter.DOB) || "-"}
//         </td>
//         <td className="border border-gray-300 px-2 py-1 text-xs">
//           {promoter.MobileNo || "-"}
//         </td>
//         <td className="border border-gray-300 px-2 py-1 text-center align-middle">
//           {getStatusIcon(promoter.IsapprovedPromoter)}
//         </td>
//         <td className="border border-gray-300 px-2 py-1">
//           <div className="flex justify-center items-center">
//             <button
//               onClick={() => handleDeletePromoter(promoter)}
//               className="text-red-600 hover:text-red-800"
//               title="Delete"
//             >
//               <FaTrash size={18} />
//             </button>
//           </div>
//         </td>
//       </tr>
//     );
//   };

//   const handleBack = () => {
//     if (userInfo?.UserTypeID === 66) {
//       navigate("/promotingorganization/profile");
//     } else {
//       navigate(`/promotingorganization/profile?instituteId=${P1}`);
//     }
//   };

//   const handleNext = () => {
//     const authStatus = authorizedRepresentative?.IsapprovedPromoter;

//     // ✅ ONLY for Secretary
//     if (userInfo?.UserTypeID === 81) {

//       // ❌ If NOT verified → show popup
//       if (authStatus !== "V") {
//         setShowVerifyPopup(true);
//         return;
//       }

//       // ✅ Verified → allow navigation
//       navigate(
//         `/PromotingOrganization/AssociatedInstitutes?instituteId=${promotingOrgId}&from=promoters`
//       );
//       return;
//     }

//     // ✅ OTHER USERS → no restriction
//     if (userInfo?.UserTypeID === 66) {
//       navigate("/promotingorganization/AssociatedInstitutes");
//     } else {
//       navigate(-1); // fallback
//     }
//   };
//   const handleSamePersonChange = (value) => {
//     if (value === true && authorizedRepresentative) {
//       setPrincipalPromoter({ ...authorizedRepresentative });
//       setIsSamePerson(true);
//     } else {
//       setPrincipalPromoter(null); // allow separate principal
//       setIsSamePerson(false);
//     }
//   };
//   const getRoleConfig = () => {
//     // 1️ Static roles
//     const staticRole = ROLE_CONFIG.find((r) => r.key === popupRole);
//     if (staticRole) return staticRole;

//     // 2️ Dynamic promoter roles (from dropdown)
//     if (popupRole && selectedPromoterType) {
//       const selectedTypeObj = promoterTypeOptions.find(
//         (x) => x.Value === selectedPromoterType,
//       );

//       return {
//         key: popupRole,
//         label: popupRole,
//         apiLabel: popupRole,
//         button: `Add ${popupRole}`,
//         updateButton: `Update ${popupRole}`,
//         ManagementTypeID: selectedTypeObj?.Value,
//         required: false,
//         isDynamic: true,
//       };
//     }

//     return null;
//   };


//   const handleProfileClick = (row) => {
//     const applicationId =
//       extractProfileId(row.StaffProfileId) || row.ProfileID || "";

//     const staffID = applicationId?.slice(-6); // last 6 digits
//     const userLoginID = applicationId;

//     const url = `/react/StaffPrintApplicationForm?staffID=${staffID}&userLoginID=${userLoginID}`;

//     window.open(
//       url,
//       "PrintWindow",
//       "width=900,height=700,top=100,left=200,scrollbars=yes,resizable=yes"
//     );
//   };









//   const handleAddMember = () => {
//     if (!selectedPromoterType) {
//       Swal.fire("Please select Promoter Type first");
//       return;
//     }

//     setPopupRole(selectedPromoterType);
//     setPopupKey((prev) => prev + 1);
//   };

//   const columns = [
//     {
//       key: "ProfileID",
//       header: "Profile ID",
//     },
//     {
//       key: "Title",
//       header: "Title",
//     },
//     {
//       key: "FirstName",
//       header: "First Name",
//     },
//     {
//       key: "MiddleName",
//       header: "Middle Name",
//     },
//     {
//       key: "LastName",
//       header: "Last Name",
//     },
//     {
//       key: "GenderCode",
//       header: "Gender",
//     },
//     // {
//     //   key: "FormatDOB",
//     //   header: "DOB",
//     // },
//     {
//       key: "MobileNo",
//       header: "Mobile No",
//     },
//     {
//       key: "IsapprovedPromoter",
//       header: "Status",
//     },
//     {
//       key: "Action",
//       header: "Action",
//     },
//   ];
//   //const tableData = (filteredMembers || []).map((promoter) => ({
//   //  ...promoter,
//   //  ProfileID: extractProfileId(promoter.StaffProfileId) || promoter.StaffId,
//   //}));

//   const renderCell = (item, column) => {
//     if (column.key === "ProfileID") {
//       return (
//         <a
//           href="#"
//           className="text-blue-600 underline text-xs"
//           onClick={(e) => {
//             e.preventDefault();
//             handleProfileClick(item);
//           }}
//         >
//           {item.ProfileID}
//         </a>
//       );
//     }

//     if (column.key === "IsapprovedPromoter") {
//       return getStatusIcon(item.IsapprovedPromoter);
//     }

//     if (column.key === "Action") {
//       return (
//         <div className="flex justify-center">
//           <button
//             onClick={() => handleDeletePromoter(item)}
//             className="text-red-600"
//           >
//             <FaTrash size={16} />
//           </button>
//         </div>
//       );
//     }

//     return item[column.key] || "-";
//   };



//   if (!hasPromotingOrg) {
//     return null;
//   }

//   return (
//     <>
//       {isLoading && <Loader />}

//       <div className="w-full p-4">
//         <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
//           <legend
//             className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
//           >
//             <FaUserTie className="mr-2 text-white" />
//             Promoters
//           </legend>

//           <div className="px-4 pb-3 pt-3">
//             {/* Pink Note Box */}
//             <div className="bg-pink-100 border border-pink-300 text-pink-800 px-3 py-2 rounded text-sm mb-4">
//               <strong>Note:</strong>
//               <ol className="list-decimal list-inside mt-1 space-y-1">
//                 <li>
//                   To edit Authorized Representative/ Principal Promoter/ Promoter
//                   profile information, login to respective Staff/ Management
//                   account and edit profile.
//                 </li>
//                 <li>
//                   To change assigned Authorized Representative/ Principal
//                   Promoter/ Promoter, login to respective Promoting Organization
//                   and edit Promoters.
//                 </li>
//               </ol>
//             </div>

//             {/* Authorized Representative Section */}
//             <div className="mb-4">
//               <div className="bg-gray-200 px-3 py-2 mb-2 rounded">
//                 <h3 className="text-sm font-semibold text-gray-800">
//                   Authorized Representative of Promoting Organization*
//                 </h3>
//               </div>
//               <div className="flex justify-center">
//                 <button
//                   className={`${errors["authorizedRep"] ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} px-6 py-2 rounded text-white text-sm font-semibold mb-2`}
//                   onClick={() => {
//                     setPopupRole("authorizedRep");
//                     setPopupKey((prev) => prev + 1);
//                   }}
//                 >
//                   {authorizedRepresentative
//                     ? "Update Authorized Representative"
//                     : "Add Authorized Representative"}
//                 </button>
//               </div>
//               {authorizedRepresentative ? (
//                 <div className="overflow-x-auto">
//                   <FilteredTableComponent
//                     data={authorizedRepresentative ? [{
//                       ...authorizedRepresentative,
//                       ProfileID: extractProfileId(authorizedRepresentative.StaffProfileId) || authorizedRepresentative.StaffId
//                     }] : []}
//                     columns={columns}
//                     renderCell={renderCell}
//                     searchable={false}
//                     sortable={true}
//                     filterColumns={["FirstName", "LastName", "GenderCode"]}
//                     showExport={false}
//                     maxHeight="400px"
//                   />
//                 </div>
//               ) : (
//                 <div className="text-center text-gray-500 text-sm py-4 border border-gray-300 rounded">
//                   No Authorized Representative found.
//                 </div>
//               )}
//             </div>

//             {/* Principal Promoter Section */}
//             <div className="mb-4">
//               <div className="bg-gray-200 px-3 py-2 mb-2 rounded">
//                 <h3 className="text-sm font-semibold text-gray-800">
//                   Principal Promoter*
//                 </h3>
//               </div>

//               <div className="mb-3 flex items-center gap-4">
//                 <span className="text-sm font-medium text-gray-700">
//                   Is Authorized Representative and Principal Promoter same ?
//                 </span>
//                 <label className="inline-flex items-center">
//                   <input
//                     type="radio"
//                     name="isSame"
//                     value="Yes"
//                     checked={isSamePerson === true}
//                     disabled={!canEditSamePerson}
//                     onChange={() => handleSamePersonChange(true)}
//                     className="form-radio h-4 w-4 text-blue-600"
//                   />
//                   <span className="ml-2 text-sm">Yes</span>
//                 </label>
//                 <label className="inline-flex items-center">
//                   <input
//                     type="radio"
//                     name="isSame"
//                     value="No"
//                     checked={isSamePerson === false}
//                     disabled={!canEditSamePerson}
//                     onChange={() => handleSamePersonChange(false)}
//                     className="form-radio h-4 w-4 text-blue-600"
//                   />
//                   <span className="ml-2 text-sm">No</span>
//                 </label>
//               </div>
//               <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-4 mb-4">
//                 <button
//                   className={`${errors["principal"] ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} px-6 py-2 rounded text-white text-sm font-semibold`}
//                   onClick={() => {
//                     setPopupRole("principal");
//                     setPopupKey((prev) => prev + 1);
//                   }}
//                 >
//                   {principalPromoter ? "Update Chairman" : "Add Chairman"}
//                 </button>
//               </div>

//               {principalPromoter ? (
//                 <div className="overflow-x-auto">
//                   <FilteredTableComponent
//                     data={principalPromoter ? [{
//                       ...principalPromoter,
//                       ProfileID: extractProfileId(principalPromoter.StaffProfileId) || principalPromoter.StaffId
//                     }] : []}
//                     columns={columns}
//                     renderCell={renderCell}
//                     searchable={false}
//                     sortable={true}
//                     filterColumns={["FirstName", "LastName", "GenderCode"]}
//                     showExport={false}
//                     maxHeight="400px"
//                   />
//                 </div>
//               ) : (
//                 <div className="text-center text-gray-500 text-sm py-4 border border-gray-300 rounded">
//                   No Principal Promoter found.
//                 </div>
//               )}
//             </div>

//             {/* Members Section */}
//             <div className="mb-4">
//               <div className="bg-gray-200 px-3 py-2 mb-2 rounded">
//                 <h3 className="text-sm font-semibold text-gray-800">Member</h3>
//               </div>
//               <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-4 mb-4">
//                 <div className="w-64">
//                   <DropdownSelectComponent
//                     label="Promoter Type"
//                     name="PromoterType"
//                     options={formatOptions(promoterTypeOptions)}
//                     value={selectedPromoterType}
//                     onChange={(value) => setSelectedPromoterType(value)}
//                     required={false}
//                     loading={loadingPromoterTypes}
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   onClick={handleAddMember}
//                   disabled={
//                     !selectedPromoterType || selectedPromoterType === "-1"
//                   }
//                   title={
//                     !selectedPromoterType || selectedPromoterType === "-1"
//                       ? "Please select Promoter Type"
//                       : filteredMembers.length
//                         ? "Update existing promoter"
//                         : "Add new promoter"
//                   }
//                   className={`px-6 py-2 h-[42px] rounded text-sm font-semibold transition-all duration-200
//                                           ${!selectedPromoterType ||
//                       selectedPromoterType === "-1"
//                       ? "bg-gray-400 cursor-not-allowed text-white"
//                       : errors[selectedPromoterType]
//                         ? "bg-red-600 hover:bg-red-700 text-white"
//                         : "bg-green-600 hover:bg-green-700 text-white"
//                     }
//                                 `}
//                 >
//                   {filteredMembers.length ? "Update Promoter" : "Add Promoter"}
//                 </button>
//               </div>

//               {/*<div className="flex justify-center mb-3">*/}
//               {/*    <div className="w-full md:w-1/3">*/}
//               {/*        <DropdownSelectComponent*/}
//               {/*            label="Promoter Type"*/}
//               {/*            name="PromoterType"*/}
//               {/*            options={formatOptions(promoterTypeOptions)}*/}
//               {/*            value={selectedPromoterType}*/}
//               {/*            onChange={(value) => setSelectedPromoterType(value)}*/}
//               {/*            required={false}*/}
//               {/*            loading={loadingPromoterTypes}                                 */}
//               {/*        />*/}
//               {/*    </div>*/}
//               {/*</div>*/}
//               {/*<div className="flex justify-cente">*/}
//               {/*    <button*/}
//               {/*        className={`${errors[selectedPromoterType] ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} px-6 py-2 rounded text-white text-sm font-semibold`}*/}
//               {/*        onClick={handleAddMember}*/}
//               {/*    >*/}
//               {/*        {filteredMembers.length ? "Update Promoter" : "Add Promoter"}*/}
//               {/*    </button>*/}
//               {/*</div>*/}
//               {filteredMembers.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <FilteredTableComponent
//                     data={(filteredMembers || []).map((promoter) => ({
//                       ...promoter,
//                       ProfileID:
//                         extractProfileId(promoter.StaffProfileId) ||
//                         promoter.StaffId,
//                     }))}
//                     columns={[
//                       { key: "ProfileID", header: "Profile ID" },
//                       { key: "Title", header: "Title" },
//                       { key: "FirstName", header: "First Name" },
//                       { key: "MiddleName", header: "Middle Name" },
//                       { key: "LastName", header: "Last Name" },
//                       { key: "GenderCode", header: "Gender" },
//                       // { key: "FormatDOB", header: "DOB" },
//                       { key: "MobileNo", header: "Mobile No" },
//                       {
//                         key: "IsapprovedPromoter",
//                         header: "Status",
//                       },
//                       { key: "Action", header: "Action" },
//                     ]}
//                     renderCell={(item, column) => {
//                       if (column.key === "ProfileID") {
//                         return (
//                           <a
//                             href="#"
//                             className="text-blue-600 underline text-xs"
//                             onClick={(e) => {
//                               e.preventDefault();
//                               handleProfileClick(item);
//                             }}
//                           >
//                             {item.ProfileID}
//                           </a>
//                         );
//                       }

//                       if (column.key === "IsapprovedPromoter") {
//                         return getStatusIcon(item.IsapprovedPromoter);
//                       }

//                       if (column.key === "Action") {
//                         return (
//                           <div className="flex justify-center">
//                             <button
//                               onClick={() => handleDeletePromoter(item)}
//                               className="text-red-600"
//                             >
//                               <FaTrash size={16} />
//                             </button>
//                           </div>
//                         );
//                       }

//                       return item[column.key] || "-";
//                     }}
//                     searchable={false}
//                     sortable={true}
//                     filterColumns={["FirstName", "LastName", "GenderCode"]}
//                     showExport={false}
//                   />
//                 </div>
//               ) : (
//                 <div className="text-center text-gray-500 text-sm py-4 border border-gray-300 rounded">
//                   {members.length > 0
//                     ? "No members found for selected promoter type."
//                     : "No members found."}
//                 </div>
//               )}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex justify-center items-center gap-4 mt-6">
//               <button
//                 type="button"
//                 className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
//                 onClick={handleBack}
//               >
//                 Back
//               </button>
//               <button
//                 type="button"
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded font-semibold text-sm"
//                 onClick={handleNext}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </fieldset>

//         {showVerifyPopup && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg shadow-xl w-[600px] max-w-[95vw] overflow-hidden">

//               {/* Header */}
//               <div className="bg-[#1a2a4a] flex items-center justify-between px-4 py-3">
//                 <span className="text-white font-bold text-base">Alert !!!</span>
//                 <button
//                   className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-0.5 rounded text-sm"
//                   onClick={() => setShowVerifyPopup(false)}
//                 >
//                   X
//                 </button>
//               </div>

//               {/* Body */}
//               <div className="p-6">
//                 {/* Alert Message */}
//                 <p className="text-red-600 font-semibold text-base mb-5 leading-snug">
//                   Authorized Representative for Promoting Organization is not verified.
//                   Verify Authorized Representative before Promoting Organization Verification
//                 </p>

//                 {/* Staff Details + Photo */}
//                 <div className="flex items-start gap-4">
//                   {/* Details */}
//                   <div className="flex-1 space-y-2 text-sm text-gray-800">
//                     <p>
//                       <span className="font-bold">Staff/ Management</span> :{" "}
//                       {authorizedRepresentative
//                         ? `${authorizedRepresentative.Title || ""} ${authorizedRepresentative.FirstName || ""} ${authorizedRepresentative.MiddleName || ""} ${authorizedRepresentative.LastName || ""}`.trim() +
//                         (authorizedRepresentative.StaffProfileId || authorizedRepresentative.StaffId
//                           ? ` (${extractProfileId(authorizedRepresentative.StaffProfileId) || authorizedRepresentative.StaffId})`
//                           : "")
//                         : "-"}
//                     </p>
//                     <p>
//                       <span className="font-bold">Date of Birth</span> :{" "}
//                       {authorizedRepresentative?.FormatDOB || formatDate(authorizedRepresentative?.DOB) || "-"}
//                     </p>
//                     <p>
//                       <span className="font-bold">Gender</span> :{" "}
//                       {authorizedRepresentative?.GenderCode || "-"}
//                     </p>
//                     <p>
//                       <span className="font-bold">Primary Mobile No</span> :{" "}
//                       {authorizedRepresentative?.MobileNo || "-"}
//                     </p>
//                     <p>
//                       <span className="font-bold">E-mail ID</span> :{" "}
//                       {authorizedRepresentative?.EMailID || "-"}
//                     </p>
//                   </div>

//                   {/* Photo + Status Icon */}
//                   <div className="relative flex-shrink-0 w-[100px] h-[110px]">
//                     {authorizedRepresentative?.PhotoPath ? (
//                       <img
//                         src={authorizedRepresentative.PhotoPath}
//                         alt="Staff Photo"
//                         className="w-full h-full object-cover rounded border border-gray-300"
//                       />
//                     ) : (
//                       <div className="w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-gray-400 text-xs">
//                         No Photo
//                       </div>
//                     )}
//                     {/* Not Verified overlay icon */}
//                     <div className="absolute bottom-1 right-1">
//                       <img src={RejectedIcon} alt="Not Verified" className="w-8 h-8" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex justify-center gap-3 mt-6">
//                   <button
//                     className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded text-sm font-semibold"
//                     onClick={() => {
//                       setShowVerifyPopup(false);
//                       const staffID =
//                         authorizedRepresentative?.StaffId ||
//                         extractProfileId(authorizedRepresentative?.StaffProfileId) ||
//                         "";
//                       navigate(`/Staff/StaffVerification?P1=${staffID}`);
//                     }}
//                   >
//                     Verify Staff/ Management Details
//                   </button>
//                   <button
//                     className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-5 py-2 rounded text-sm font-semibold"
//                     onClick={() => setShowVerifyPopup(false)}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//         <StaffProfilePopup
//           key={popupKey}
//           open={!!popupRole}
//           roleConfig={getRoleConfig()}
//           onClose={handlePopupClose}
//           onSaved={onPopupSaved}
//           IsPromotorForm={true}
//           instituteId={promotingOrgId}
//           isPromotingOrgId={true}
//         />
//       </div>


//     </>
//   );
// };

// export default Promoters;
