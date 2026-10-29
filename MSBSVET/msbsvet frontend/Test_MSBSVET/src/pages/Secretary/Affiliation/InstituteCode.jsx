import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Search,
  Calendar,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import agent from "../../../lib/api/agent";
import DropdownComponent from "../../../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { useLoading } from "../../../Hooks/useLoading";
import { AddressService } from "../../../lib/services/addressService";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Institute/institute";
import {
  SecretaryInstituteSDIInspection,
  SecretaryInstituteSDIAffiliation,
} from "../../../Endpoints_All/Base/DVETO";
import OTPService from "../../../Component/formcomponent/OTPService";
//import { GetUserDetails } from "../../Endpoints_All/ITISpecification/itiSpecification";
import verified from "../../../assets/VerifiedIcon.jpg";
import rejected from "../../../assets/NotVerifiedIcon.jpg";
import pending from "../../../assets/QuestionMark.png";
import { useAuth } from "../../../Hooks/AuthContext";

//import LocationDropdowns from "../../Component/formcomponent/LocationDropdowns";

//import { DVETOGetDvetoManagementTypeByDvetoID } from "../../Endpoints_All/Base/DVETO";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatOption = (arr = []) =>
  arr.map((item) => ({
    value: String(item.Value ?? item.value ?? item.id ?? ""),
    label: item.Text ?? item.label ?? item.name ?? "",
  }));

const STATUS_OPTIONS = [
  { value: "A", label: "All" },
  { value: "R", label: "Recommended" },
  { value: "N", label: "Not Recommended" },
  { value: "P", label: "Rejected" },
];

const ALL_OPTION = { value: "-1", label: "All" };

// ─── Table Columns ─────────────────────────────────────────────────────────────
const inspectionColumns = [
  {
    key: "S.N.",
    header: "S.N.",
    // headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "60px",
  },
  {
    key: "Region",
    header: "Region",
    // headerClassName: "text-left bg-blue-100 font-semibold",
    className: "text-left",
    width: "90px",
  },
  {
    key: "District",
    header: "District",
    // headerClassName: "text-left bg-blue-100 font-semibold",
    className: "text-left",
    width: "90px",
  },
  {
    key: "Profile ID",
    header: "Profile ID",
    // headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "100px",
  },
  {
    key: "Skill Development Institute",
    header: "Skill Development Institute",
    // headerClassName: "text-left bg-blue-100 font-semibold",
    className: "text-left",
    width: "250px",
  },
  // {
  //     key: "Inspection Scheduled Date",
  //     header: "Inspection Scheduled Date",
  //     headerClassName: "text-center bg-blue-100 font-semibold",
  //     className: "text-center",
  //     width: "150px",
  // },
  // {
  //     key: "Actual Inspection Date",
  //     header: "Actual Inspection Date",
  //     headerClassName: "text-center bg-blue-100 font-semibold",
  //     className: "text-center",
  //     width: "160px",
  // },
  {
    key: "Board Verification Date",
    header: "Board Verification Date",
    // headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "150px",
  },
  {
    key: "Existing Institute",
    header: "Existing Institute",
    // headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "120px",
  },
  {
    key: "Institute Code",
    header: "Institute Code",
    // headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "120px",
  },
  {
    key: "Action",
    header: "Action",
    // headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "120px",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
const Inspection = () => {
  const navigate = useNavigate();
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading, isLoading } = useLoading();

  // ── Profile ID resolution state ────────────────────────────────────────────
  const [profileIDError, setProfileIDError] = useState("");
  const [resolvedInstID, setResolvedInstID] = useState(null);

  // ── Master dropdown data ────────────────────────────────────────────────────
  const [allRegions, setAllRegions] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [allTalukas, setAllTalukas] = useState([]);

  // ── Filtered dropdown options ───────────────────────────────────────────────
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredTalukas, setFilteredTalukas] = useState([]);

  const [loadingDropdowns, setLoadingDropdowns] = useState({
    regions: false,
    districts: false,
    talukas: false,
  });
  const { userInfo } = useAuth();
  const UserID = userInfo?.UserID;
  const userloginID = userInfo?.UserLoginID;

  const instituteRef = useRef(null);

  // ── Filter form ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    RegionID: "-1",
    DistrictID: "-1",
    TalukaID: "-1",
    FormStatus: "A",
    ProfileID: "",
  });

  // ── Table state ─────────────────────────────────────────────────────────────
  const [tableData, setTableData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  //const [locationData, setLocationData] = useState({
  //    RegionID: "",
  //    DistrictID: "",
  //    TalukaID: ""
  //});

  ////
  //const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

  const [resetKey, setResetKey] = useState(0);

  // ─────────────────────────────────────────────────────────────────────────
  // On mount: load all master dropdown data
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    setLoadingDropdowns({ regions: true, districts: true, talukas: true });
    try {
      const [regionRes, districtRes, talukaRes] = await Promise.all([
        AddressService.getRegions(),
        AddressService.getRegionDistricts(-1),
        AddressService.getTalukas(),
      ]);

      const extract = (res) => {
        const d = res?.data ?? res;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.Data)) return d.Data;
        return [];
      };

      const regions = extract(regionRes);
      const districts = extract(districtRes);
      const talukas = extract(talukaRes);

      setAllRegions(regions);
      setAllDistricts(districts);
      setAllTalukas(talukas);
      setFilteredDistricts(districts);
      setFilteredTalukas(talukas);
    } catch (err) {
    } finally {
      setLoadingDropdowns({ regions: false, districts: false, talukas: false });
    }
  };

  const getUserMobile = async () => {
    try {
      const userID = userInfo?.UserID;

      if (!userID) return null;

      const res = await agent.get(
        `/api/UserManagement/GetUserDetails/${userID}`,
      );

      const userData = res?.data;

      return userData?.UserMobileNo;
    } catch (err) {
      return null;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Cascade: Region → Districts
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const regionID = formData.RegionID;

    if (regionID === "-1") {
      setFilteredDistricts([]);
      setFilteredTalukas([]);
      return;
    }

    const districtFiltered = allDistricts.filter(
      (d) => String(d.Group) === String(regionID),
    );

    setFilteredDistricts(districtFiltered);
    setFilteredTalukas([]);

    setFormData((prev) => ({
      ...prev,
      DistrictID: "-1",
      TalukaID: "-1",
    }));

    setTableData([]);
  }, [formData.RegionID]);

  // ─────────────────────────────────────────────────────────────────────────
  // Cascade: District → Talukas
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const districtID = formData.DistrictID;

    if (districtID === "-1") {
      setFilteredTalukas([]);
      return;
    }

    const talukaFiltered = allTalukas.filter(
      (t) => String(t.Group) === String(districtID),
    );

    setFilteredTalukas(talukaFiltered);

    setFormData((prev) => ({
      ...prev,
      TalukaID: "-1",
    }));

    setTableData([]);
  }, [formData.DistrictID]);

  // ─────────────────────────────────────────────────────────────────────────
  // Profile ID field change — clear resolved state immediately
  // ─────────────────────────────────────────────────────────────────────────
  const handleProfileIDChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, ProfileID: val }));
    setProfileIDError("");
    setResolvedInstID(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Profile ID blur — resolve institute ID when user leaves the field
  // ─────────────────────────────────────────────────────────────────────────
  const handleProfileIDBlur = async () => {
    const profileID = formData.ProfileID?.trim();

    if (!profileID) {
      setResolvedInstID(-1);
      setProfileIDError("");
      return;
    }

    try {
      const res = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${profileID}`,
      );
      const id = res?.data?.Data;
      if (id) {
        setResolvedInstID(id);
        setProfileIDError("");
      } else {
        setResolvedInstID(false);
        setProfileIDError("No institute found for this Profile ID.");
      }
    } catch (err) {
      setResolvedInstID(false);
      setProfileIDError("Failed to resolve Profile ID.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Generic dropdown handler
  // ─────────────────────────────────────────────────────────────────────────
  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value ?? "-1" }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    try {
      startLoading();
      setHasSearched(true);

      const profileID = formData.ProfileID?.trim();
      let instID = resolvedInstID;

      if (profileID && instID === null) {
        try {
          const res = await agent.get(
            `${GetInstituteIDByInstituteCode}?InstituteCode=${profileID}`,
          );
          const id = res?.data?.Data;
          if (id) {
            setResolvedInstID(id);
            setProfileIDError("");
            setSelectedInstitute(id);
            instID = id;
          } else {
            setResolvedInstID(false);
            setProfileIDError("No institute found for this Profile ID.");
            setTableData([]);
            return;
          }
        } catch {
          setResolvedInstID(false);
          setProfileIDError("Failed to resolve Profile ID.");
          setTableData([]);
          return;
        }
      }

      if (profileID && instID === false) {
        setTableData([]);
        return;
      }

      const params = new URLSearchParams({
        DistrictID: formData.DistrictID,
        TalukaID: formData.TalukaID,
        RegionID: formData.RegionID,
        FormStatus: formData.FormStatus || "A",
        InstituteID: instID ?? -1,
        userID: -1,
        ResultTypeID: 3,
      });

      const response = await agent.get(
        `${SecretaryInstituteSDIAffiliation}?${params.toString()}`,
      );
      const data = response?.data?.Data ?? response?.data ?? [];
      setTableData(Array.isArray(data) ? data : []);
    } catch (error) {
      setTableData([]);
    } finally {
      stopLoading();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Reset
  // ─────────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFormData({
      RegionID: "-1",
      DistrictID: "-1",
      TalukaID: "-1",
      FormStatus: "A",
      ProfileID: "",
    });
    setResolvedInstID(null);
    setProfileIDError("");
    setFilteredDistricts([]);
    setFilteredTalukas([]);
    setTableData([]);
    setHasSearched(false);
    setResetKey((prev) => prev + 1);
  };

  const otpServiceVerification = OTPService({
    purpose: "InspectionVerify",
    isVerifyRequired: true,
    messege: "OTP verification required for inspection verification",

    onSuccess: async () => {
      const data = instituteRef.current;

      if (!data) return;

      navigate(
        `/SDILOI/InstituteCodeGenerate?p1=${data.profileId}&p2=${data.instituteId}`,
      );
    },

    onError: (error) => {},

    onCancel: () => {},
  });

  const handleAction = async (row) => {
    try {
      const profileId = row["Profile ID"];

      const res = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${profileId}`,
      );

      const instituteId = res?.data?.Data;

      instituteRef.current = {
        profileId,
        instituteId,
      };

      const mobile = await getUserMobile();

      if (!mobile) {
        alert("Mobile number not found");
        return;
      }

      otpServiceVerification.sendOTP(mobile);

      otpServiceVerification.onSuccess = () => {
        navigate(
          `/SDILOI/InstituteCodeGenerate?p1=${profileId}&p2=${instituteId}`,
        );
      };
    } catch (error) {}
  };

  const InstituteDetailsPopUp = (instituteId, courseCode) => {
    if (!instituteId) return;

    const popupWidth = 1000;
    const popupHeight = 750;

    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const popup = window.open(
      //`${window.location.origin}/React/InstituteDetailsPrint?instituteId=${instituteId}&courseCode=${courseCode}`,
      `${window.location.origin}/React/InspectionApplication?P1=${instituteId}&P2=${courseCode}`,
      "InstituteDetailsPrint",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );

    if (!popup) {
      alert("Popup blocked! Please allow popups.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Custom cell renderer
  // ─────────────────────────────────────────────────────────────────────────
  const renderCell = (item, column) => {
    const value = item[column.key];

    //if (column.key === "Status") {
    //    const isScheduled = value === "Inspection Scheduled";
    //    return (
    //        <span
    //            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${isScheduled
    //                    ? "bg-green-100 text-green-700 border border-green-300"
    //                    : "bg-yellow-100 text-yellow-700 border border-yellow-300"
    //                }`}
    //        >
    //            {isScheduled ? (
    //                <CheckCircle className="w-3 h-3 flex-shrink-0" />
    //            ) : (
    //                <Clock className="w-3 h-3 flex-shrink-0" />
    //            )}
    //            {value}
    //        </span>
    //    );
    //}

    if (column.key === "Profile ID") {
      const profileId = value;

      return (
        <span
          onClick={async (e) => {
            e.stopPropagation();

            try {
              const res = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${profileId}`,
              );

              const instituteId = res?.data?.Data;

              if (!instituteId) {
                alert("Institute ID not found");
                return;
              }

              InstituteDetailsPopUp(instituteId, profileId);
            } catch (err) {
              alert("Error fetching Institute ID");
            }
          }}
          className="text-blue-600 underline cursor-pointer font-semibold"
        >
          {profileId}
        </span>
      );
    }
    //if (column.key === "Status") {

    //    const status = item["Status"];

    //    const isVerified =
    //        status === "Inspection Scheduled" ||
    //        status === "V";

    //    return (
    //        <span className="flex justify-center">
    //            <img
    //                src={isVerified ? verified : pending}
    //                alt={isVerified ? "Verified" : "pending"}
    //                className="w-8 h-8 object-contain"
    //                title={status}
    //            />
    //        </span>
    //    );
    //}
    if (column.key === "Status") {
      const status = item["Status"];

      let icon = pending;
      let altText = "Pending";

      if (status === "Inspection Scheduled" || status === "V") {
        icon = verified;
        altText = "Verified";
      } else if (status === "Inspection With Rejection") {
        icon = rejected;
        altText = "Rejected";
      }

      return (
        <span className="flex justify-center">
          <img
            src={icon}
            alt={altText}
            className="w-8 h-8 object-contain"
            title={status}
          />
        </span>
      );
    }

    if (column.key === "Inspection Scheduled Date") {
      const isNoDate = !value || value === "No Date" || value === "No date";
      return (
        <span
          className={`inline-flex items-center gap-1 text-sm ${
            isNoDate ? "text-gray-400 italic" : "text-gray-700 font-medium"
          }`}
        >
          {value || "No Date"}
        </span>
      );
    }

    if (column.key === "Action") {
      const action = item["Action"];
      const isVerify = action === "Verify";

      return (
        <button
          onClick={() => handleAction(item)}
          className={`px-3 py-1.5 rounded text-xs font-semibold text-white
            ${isVerify ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-500 hover:bg-orange-600"}`}
        >
         Institute Code
        </button>
      );
    }

    return <span className="text-sm text-gray-700">{value ?? "—"}</span>;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Dropdown option arrays (All prepended)
  // ─────────────────────────────────────────────────────────────────────────

  const removeSelect = (arr) => arr.filter((x) => x.Value !== "-1");
  const regionOptions = [ALL_OPTION, ...formatOption(removeSelect(allRegions))];
  const districtOptions = [
    ALL_OPTION,
    ...formatOption(removeSelect(filteredDistricts)),
  ];
  const talukaOptions = [
    ALL_OPTION,
    ...formatOption(removeSelect(filteredTalukas)),
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4">
      <fieldset className="rounded border border-gray-300 p-4 mb-6 bg-white shadow-sm">
        <legend
          className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
        >
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Institute Code
          </div>
        </legend>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            {/*<div>*/}
            <DropdownComponent
              label="Region"
              name="RegionID"
              options={regionOptions}
              value={formData.RegionID}
              onChange={(value) => handleDropdownChange("RegionID", value)}
            />

            <DropdownComponent
              label="District"
              name="DistrictID"
              options={districtOptions}
              value={formData.DistrictID}
              onChange={(value) => handleDropdownChange("DistrictID", value)}
            />

            <DropdownComponent
              label="Taluka"
              name="TalukaID"
              options={talukaOptions}
              value={formData.TalukaID}
              onChange={(value) => handleDropdownChange("TalukaID", value)}
            />
            {/*</div>*/}

            {/*<LocationDropdowns*/}
            {/*    userLoginID={userloginID}*/}
            {/*    key={resetKey}*/}
            {/*    onChange={(data) => {*/}
            {/*        console.log("Selected:", data);*/}
            {/*        setLocationData(data);*/}
            {/*        // 👉 Use in other API*/}
            {/*        // data.RegionID*/}
            {/*        // data.DistrictID*/}
            {/*        // data.TalukaID*/}
            {/*    }}*/}
            {/*/>*/}
          </div>

          <div className="space-y-4">
            <div>
              <DropdownComponent
                label="Status"
                name="FormStatus"
                options={STATUS_OPTIONS}
                value={formData.FormStatus}
                onChange={(value) => handleDropdownChange("FormStatus", value)}
                required={false}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile ID
              </label>
              <input
                type="text"
                value={formData.ProfileID}
                onChange={handleProfileIDChange}
                onBlur={handleProfileIDBlur}
                placeholder="Enter Profile ID"
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
                  profileIDError
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {profileIDError && (
                <p className="text-xs text-red-500 mt-1">{profileIDError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${color}`}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isLoading ? "Searching..." : "Search"}
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-700 bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          >
            <XCircle className="w-4 h-4" />
            Reset
          </button>
        </div>
      </fieldset>

      {/* ── Results Table ── */}
      {hasSearched && (
        <fieldset className="rounded border border-gray-200 bg-white shadow-sm">
          <legend
            className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white ml-2`}
          >
            List Of Skill Development Institute
          </legend>

          <FilteredTableComponent
            data={tableData}
            columns={inspectionColumns}
            filterColumns={[]}
            customButtons={[]}
            title=""
            exportFileName="SDI_Inspection_List"
            tableId="sdi-inspection-table"
            searchable={true}
            sortable={false}
            showExcelTemplate={false}
            exportable={true}
            showSearch={true}
            showExcel={true}
            showPDF={true}
            showExport={true}
            className="mt-3"
            maxHeight="500px"
            stickyHeader={true}
            emptyMessage="No data available"
            renderCell={renderCell}
          />
        </fieldset>
      )}
    </div>
  );
};

export default Inspection;
