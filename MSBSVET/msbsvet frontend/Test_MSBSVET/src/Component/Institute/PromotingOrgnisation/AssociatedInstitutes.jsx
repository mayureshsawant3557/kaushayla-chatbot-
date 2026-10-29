import { useState, useEffect, useContext } from "react";
import { useAuth } from "../../../Hooks/AuthContext";
import { ThemeContext } from "../../Context/ThemeContext";
import Swal from "sweetalert2";
import {
  FaSpinner,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaQuestionCircle,
  FaTimes,
} from "react-icons/fa";
import { useAssociatedInstitutes } from "../../../lib/hooks/useAssociatedInstitutes";
import { useNavigate, useLocation } from "react-router-dom";
import InstituteDetailsPopUp from "../../formcomponent/InstituteDetailsPopUp";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { SwalHelper } from "../../../utils/swalHelper";
import { getDeviceIP } from "../../../utils/CommonHelper";
import VerifiedIcon from "../../../assets/VerifiedIcon.jpg";
import PendingIcon from "../../../assets/QuestionMark.png";
import RejectedIcon from "../../../assets/NotVerifiedIcon.jpg";
import agent from "../../../lib/api/agent";
import Loader from "../../../Component/formcomponent/Loader";
const AssociatedInstitutes = () => {
   const { userInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { color } = useContext(ThemeContext);
  const [verificationData, setVerificationData] = useState({});

  const [showAddModal, setShowAddModal] = useState(false);
  //const [isPromoterOrg, setIsPromoterOrg] = useState(false);
  const params = new URLSearchParams(location.search);
    const instituteIdParams = params.get("instituteId");
    const from = params.get("from");
  const isSecretary =
        userInfo?.UserTypeID === 81 || userInfo?.UserTypeID === 14;
    const promotingOrgId = instituteIdParams || userInfo?.UserID;

    const mode = isSecretary ? "verification" : "view";

  //const isPromoterOrg = userInfoAll?.UserTypeID === 66;
  const {
    instituteId,
    affiliatedInstitutes,
    appliedInstitutes,
    isLoading,
    refetchInstitutes,
    updateInstituteMapping,   
     
  } = useAssociatedInstitutes();

  //const institutes = affiliatedInstitutes ?? [];
  //const hasAffiliatedInstitutes = institutes.length > 0;

  //const aInstitutes = appliedInstitutes ?? [];
  //const hasAppliedInstitutes = aInstitutes.length > 0;
  //useEffect(() => {
  //    setIsPromoterOrg(userInfo.UserTypeID === 66);
  //}, [userInfo.UserTypeID]);
 // 🔥 make sure this import exists

    const handleDelete = async (row) => {
        // ❌ Block normal users if verified
        if (!isSecretary && row?.IsVerified === "V") {
            Swal.fire(
                "Not Allowed",
                "Verified institute cannot be deleted",
                "warning"
            );
            return;
        }

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {

            const ipAddress = await getDeviceIP().catch(() => "127.0.0.1");

            // Controller binds these simple params from the query string,
            // so they must go in the URL (not in the request body).
            const query = new URLSearchParams({
                Id: row?.AssociatedInstituteID,
                UserLoginID: userInfo?.UserLoginID ?? "",
                IPAddress: ipAddress || "127.0.0.1",
            }).toString();

            await agent.post(
                `/api/PromotionalOrganisation/Delete_AssociatedInstituteMappingDetails?${query}`,
                null
            );

            Swal.fire("Deleted!", "Institute deleted successfully.", "success");


            refetchInstitutes();

        } catch (error) {
            const data = error?.response?.data;
            const msg =
                data?.message ||
                (data?.errors && Object.values(data.errors).flat().join("\n")) ||
                data?.title ||
                "Failed to delete institute.";

            Swal.fire("Error!", msg, "error");
        }
    };

    const handleStatusChange = (id, value) => {
        const key = String(id);

        setVerificationData((prev) => ({
            ...prev,
            [key]: {
                status: value,

                // 🔥 RESET remark when NOT rejected
                remark: value === "R"
                    ? prev[key]?.remark || ""   // keep if already reject
                    : "",                      // clear when Verify
            },
        }));
    };
    const handleRemarkChange = (id, value) => {
        const key = String(id); // 🔥 FIX

        setVerificationData((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                remark: value,
            },
        }));
    };
  //const handleProceed = async () => {
  //  if (!instituteId || instituteId === 0) {
  //    Swal.fire("Error", "Invalid institute ID", "error");
  //    return;
  //  }

  //  try {
  //    if (isPromoterOrg) {
  //        navigate("/PromotingOrganization/Summary");
  //    } else {
  //      const instituteIdStr = instituteId.toString();
  //      navigate(
  //        `/PromotingOrganization/Summary?P1=${instituteIdStr}&P2=${instituteIdStr}`,
  //      );
  //    }
  //  } catch (error) {
  //    Swal.fire("Error", "Navigation failed", "error");
  //  }
  //};

  const handleAddInstitute = () => {
    setShowAddModal(true);
  };
  const handleProceedClick = () => {
      navigate("/PromotingOrganization/Summary");
  };

  const renderVerificationStatus = (institute) => {
    const status = institute.IsVerified;

    if (status === "V") {
      return (
        <div className="flex flex-col items-center space-y-1 p-2">
              <img src={VerifiedIcon} className="w-6 h-6" />
        </div>
      );
    } else if (status === "P") {
      return (
        <div className="flex flex-col items-center space-y-1 p-2">
              <img src={PendingIcon} className="w-6 h-6" />
        </div>
      );
    } else if (status === "R") {
      return (
        <div className="flex flex-col items-center space-y-1 p-2">
              <img src={RejectedIcon} className="w-6 h-6" />
          <span className="text-xs font-medium text-red-600">
            {institute.Remark?.toUpperCase() || "Rejected"}
          </span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center space-y-1 p-2">
            <img src={PendingIcon} className="w-6 h-6" />
      </div>
    );
  };



    const handleSaveVerification = async () => {
        try {
            const ipAddress = await getDeviceIP().catch(() => "127.0.0.1");
            const allData = [...affiliatedInstitutes, ...appliedInstitutes];

            // ✅ No data case — show success, THEN navigate after OK is clicked
            if (allData.length === 0) {
                await SwalHelper.success("Success", "No institutes to verify. Proceeding to next step.");
                navigate(
                    `/promotingorganization/summary?instituteId=${instituteIdParams}&from=${from}`
                );
                return;
            }

            // STEP 1: STATUS VALIDATION
            const unselectedRows = allData.filter((item) => {
                const status =
                    verificationData[String(item.AssociatedInstituteID)]?.status ||
                    item.IsVerified ||
                    "P";

                return status === "P";
            });
            if (unselectedRows.length > 0) {
                SwalHelper.error(
                    "Validation Error",
                    `Please select verification status for all institutes.<br/>
Pending count: ${unselectedRows.length}`
                );
                return;
            }

            // ✅ STEP 2: BUILD PAYLOAD (FIXED)
            const payload = allData.map((item) => ({
                AssociatedInstituteID: item.AssociatedInstituteID,
                PromotingOrganisationId:
                    item.PromotingOrganisationId || promotingOrgId,
                InstituteID: item.InstituteID,

                // ✅ Required by SP
                IsVerified:
                    verificationData[String(item.AssociatedInstituteID)]?.status ||
                    item.IsVerified,

                Remark:
                    verificationData[String(item.AssociatedInstituteID)]?.remark ||
                    item.Remark ||
                    "",

                UserLoginID: userInfo?.UserLoginID,
                IPAddress: ipAddress || "127.0.0.1",

               
                CityorVillage: item.CityorVillage || "NA",
                District: item.District || "NA",
                InstituteCode: item.InstituteCode || "NA",
                NameofInstitute: item.NameofInstitute || "NA",
                Taluka: item.Taluka || "NA",
                PromoterType: item.PromoterType || "NA",
                PageCode: "ASSOCIATED_INSTITUTE",

             
                CityorVillageForAppliedInstitutes:
                    item.CityorVillageForAppliedInstitutes || "NA",
                DistrictForAppliedInstitutes:
                    item.DistrictForAppliedInstitutes || "NA",
                InstituteCodeForAppliedInstitutes:
                    item.InstituteCodeForAppliedInstitutes || "NA",
                NameofInstituteForAppliedInstitutes:
                    item.NameofInstituteForAppliedInstitutes || "NA",
                TalukaForAppliedInstitutes:
                    item.TalukaForAppliedInstitutes || "NA",
            }));

       
            const hasInvalid = payload.some(
                (item) => item.IsVerified === "R" && !item.Remark
            );

            if (hasInvalid) {
                SwalHelper.error(
                    "Validation Error",
                    "Remark required for rejected institutes"
                );
                return;
            }


            const response = await updateInstituteMapping(payload);

            await SwalHelper.success("Success", "Verification saved successfully");
            navigate(
                `/promotingorganization/summary?instituteId=${instituteIdParams}&from=${from}`
            );
        } catch (error) {
            console.error("SAVE ERROR:", error);
            SwalHelper.error("Error", "Failed to save verification");
        }
    };



    const extractInstituteData = (htmlString) => {
        if (!htmlString) return { code: "", id: "" };

        const codeMatch = htmlString.match(/>(.*?)</);
        const idMatch = htmlString.match(/P1=(\d+)/);

        return {
            code: codeMatch ? codeMatch[1] : htmlString,
            id: idMatch ? idMatch[1] : "",
        };
    };
    const navigateToPrint = (row) => {
        const html =
            row.InstituteCodeForAppliedInstitutes || row.InstituteCode;

        const { id } = extractInstituteData(html);

        const finalId = id || row.InstituteID; 

        const url = `/react/InstituteDetailsPrint?instituteId=${finalId}&courseCode=0`;

        window.open(
            url,
            "PrintWindow",
            "width=900,height=700,top=100,left=200,scrollbars=yes,resizable=yes"
        );
    };
    


  //const formatInstituteLink = (htmlString) => {
  //  if (!htmlString) return "-";

  //  const matchCode = htmlString.match(/>(.*?)</);
  //  const matchId = htmlString.match(/P1=(\d+)/);

  //  const code = matchCode ? matchCode[1] : htmlString;
  //  const id = matchId ? matchId[1] : "";

  //  return (
  //    <a
  //      href={`../Public/InstituteDtails.aspx?P1=${id}`}
  //      target="_blank"
  //      rel="noopener noreferrer"
  //      className="text-blue-600 hover:underline"
  //    >
  //      {code}
  //    </a>
  //  );
  //};
    const formattedAffiliated = affiliatedInstitutes.map((item, index) => {
        const { code } = extractInstituteData(item.InstituteCode);

        return {
            ...item,
            sr: index + 1,

            InstituteCodeLink: (
                <span
                    onClick={() => navigateToPrint(item)}
                    className="text-blue-600 cursor-pointer hover:underline"
                >
                    {code}
                </span>
            ),

            status: renderVerificationStatus(item),
        };
    });

    const formattedApplied = appliedInstitutes.map((item, index) => {
        const html =
            item.InstituteCodeForAppliedInstitutes || item.InstituteCode;

        const { code } = extractInstituteData(html);

        return {
            ...item,
            sr: index + 1,

            InstituteCodeLink: (
                <span
                    onClick={() => navigateToPrint(item)}
                    className="text-blue-600 cursor-pointer hover:underline"
                >
                    {code}
                </span>
            ),

            Name:
                item.NameofInstituteForAppliedInstitutes ||
                item.NameofInstitute ||
                "-",
        };
    });

    const affiliatedColumns = [
        {
            key: "actions",
            header: (
                <button
                    onClick={handleAddInstitute}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                >
                    +
                </button>
            ),
        },

        { key: "InstituteCodeLink", header: "Institute Code" },
        { key: "NameofInstitute", header: "Name of Institute" },
        { key: "District", header: "District" },
        { key: "Taluka", header: "Taluka" },
        { key: "CityorVillage", header: "City/Village" },

        ...(mode === "view"
            ? [{ key: "status", header: "Verification Status" }]
            : []),

        ...(mode === "verification"
            ? [
                { key: "verification", header: "Verification" },
                { key: "remark", header: "Remark" },
            ]
            : []),
    ];

    const appliedColumns = [
        { key: "sr", header: "Sr. No." },
        { key: "InstituteCodeLink", header: "Institute Code" },
        { key: "Name", header: "Name of Institute" },
        { key: "District", header: "District" },
        { key: "Taluka", header: "Taluka" },
        { key: "City", header: "City/Village" },

       
        ...(mode === "verification"
            ? [
                { key: "verification", header: "Verification" },
                { key: "remark", header: "Remark" },
            ]
            : []),
    ];


    const handleBack = () => {
        if (isSecretary) {
           
            navigate(`/promotingorganization/PromotersDetails?P1=${instituteIdParams}`);
        } else {
            // 🔥 Normal user → fixed page
            navigate("/promotingorganization/PromotersDetails");
        }
    };


  //console.log("affiliatedInstitutes =>", affiliatedInstitutes);
  //console.log("appliedInstitutes =>", appliedInstitutes);

  return (
      <>
          {isLoading && <Loader />} 
      <style>{`
        .form-container { padding-bottom: 10px; padding-left: 0px !important; }
        .swal2-container { z-index: 100003 !important; }
        .GridView { width: 100%; border-collapse: collapse; }
        .GridView th { 
          font-weight: 600; font-size: 14px; 
          padding: 0.3rem 0.5rem; 
          background-color: #cccccc; 
          text-align: center;
        }
        .GridView td { padding: 0.5rem 0.5rem; border: 1px solid #ddd; }
        .GridView tr:hover { background-color: #f5f5f5; }
        fieldset { border: 2px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; }
        legend { font-weight: bold; padding: 0 10px; }
        .table-responsive { overflow-x: auto; }
        .btn-success { 
          background-color: #28a745; 
          border-color: #28a745; 
          color: white; 
          padding: 10px 30px; 
          font-size: 16px; 
          border-radius: 5px; 
          cursor: pointer;
        }
        .btn-success:hover { background-color: #218838; }
        .NotVisible { display: none; }
      `}</style>

      <div className="row form-container">
        <div className="col-md-12 mt-2">
          <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
            <legend
              className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
            >
              Affiliated Institutes
            </legend>
            <div className="col-md-12">
              <div className="table-responsive section">
                <FilteredTableComponent
                  data={formattedAffiliated}
                  columns={affiliatedColumns}
                  loading={isLoading}
                  searchable={true}
                  sortable={true}
                  showExport={true}
                  
                                  renderCell={(row, column) => {
                                      const isVerified = row.IsVerified === "V";

                                      // 🔴 VERIFICATION COLUMN (Dropdown)
                                      if (column.key === "verification") {
                                          return (
                                              <select
                                                  value={
                                                      verificationData[String(row.AssociatedInstituteID)]?.status ||
                                                      row.IsVerified ||
                                                      "P"
                                                  }
                                                  onChange={(e) =>
                                                      handleStatusChange(row.AssociatedInstituteID, e.target.value)
                                                  }
                                                  className="border px-2 py-1"
                                              >
                                                  <option value="P">Select</option>
                                                  <option value="V">Verify</option>
                                                  <option value="R">Reject</option>
                                              </select>
                                          );
                                      }

                                      // 🔴 REMARK COLUMN
                                      if (column.key === "remark") {
                                          return (
                                              <input
                                                  type="text"
                                                  placeholder="Remark"
                                                  className="border px-2 py-1"
                                                  value={
                                                      verificationData[String(row.AssociatedInstituteID)]?.remark
                                                      ?? row.Remark
                                                      ?? ""
                                                  }
                                                  onChange={(e) =>
                                                      handleRemarkChange(row.AssociatedInstituteID, e.target.value)
                                                  }
                                                  disabled={
                                                      (verificationData[String(row.AssociatedInstituteID)]?.status ||
                                                          row.IsVerified) !== "R"
                                                  }
                                              />
                                          );
                                      }

                                      if (column.key === "actions") {
                                          const isDisabled = !isSecretary && row.IsVerified === "V";

                                          return (
                                              <button
                                                  onClick={() => handleDelete(row)}
                                                  disabled={isDisabled}
                                                  className={
                                                      isDisabled
                                                          ? "text-gray-400 cursor-not-allowed"
                                                          : "text-red-600 hover:text-red-800"
                                                  }
                                              >
                                                  <FaTrash />
                                              </button>
                                          );
                                      }

                                      // 🟢 DEFAULT
                                      return row[column.key];
                                  }}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
            <legend
              className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
            >
              Applied Institutes
            </legend>
            <div className="col-md-12">
              <div className="table-responsive section">
                              <FilteredTableComponent
                                  data={formattedApplied}
                                  columns={appliedColumns}
                                  loading={isLoading}
                                  searchable={true}
                                  sortable={true}
                                  showExport={true}

                                  renderCell={(row, column) => {
                                      //const isVerified = row.IsVerified === "V";

                                    
                                      if (column.key === "verification") {
                                          return (
                                              <select
                                                  value={
                                                      verificationData[String(row.AssociatedInstituteID)]?.status ||
                                                      row.IsVerified ||
                                                      "P"
                                                  }
                                                  onChange={(e) =>
                                                      handleStatusChange(row.AssociatedInstituteID, e.target.value)
                                                  }
                                                  className="border px-2 py-1"
                                              >
                                                  <option value="P">Select</option>
                                                  <option value="V">Verify</option>
                                                  <option value="R">Reject</option>
                                              </select>
                                          );
                                      }

                                    
                                      if (column.key === "remark") {
                                          return (
                                              <input
                                                  type="text"
                                                  placeholder="Remark"
                                                  className="border px-2 py-1"
                                                  value={
                                                      verificationData[String(row.AssociatedInstituteID)]?.remark
                                                      ?? row.Remark
                                                      ?? ""
                                                  }
                                                  onChange={(e) =>
                                                      handleRemarkChange(row.AssociatedInstituteID, e.target.value)
                                                  }
                                                  disabled={
                                                      (verificationData[String(row.AssociatedInstituteID)]?.status ||
                                                          row.IsVerified) !== "R"
                                                  }
                                              />
                                          );
                                      }

                                      return row[column.key];
                                  }}
                              />
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      <div className="subheader-title"></div>
      <div className="row p-3">
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
                      id="btnProceed"
                      className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm"
                      onClick={
                          mode === "verification"
                              ? handleSaveVerification
                              : handleProceedClick
                      }
                  >
                      {mode === "verification" ? "Save Verification" : "Save & Next"}
                  </button>

              </div>
      </div>

      <input type="hidden" id="hdnInstituteId" value={instituteId || 0} />
      <InstituteDetailsPopUp
  open={showAddModal}
  onClose={() => setShowAddModal(false)}
  onSaved={() => {
    setShowAddModal(false);
    refetchInstitutes();
  }}

  promotingOrgId={promotingOrgId}
  isSecretary={isSecretary}
/>
    </>
  );
};

export default AssociatedInstitutes;