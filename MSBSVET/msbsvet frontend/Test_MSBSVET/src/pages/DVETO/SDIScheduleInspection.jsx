import React, { useState, useEffect, useContext } from "react";
import { Search, Calendar, RefreshCw, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import agent from "../../lib/api/agent";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";
import { AddressService } from "../../lib/services/addressService";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Institute/institute";
import { SearchSDIInspection } from "../../Endpoints_All/Base/DVETO";

import verified from "../../assets/VerifiedIcon.jpg";
import rejected from "../../assets/NotVerifiedIcon.jpg";
import pending from "../../assets/QuestionMark.png";

import LocationDropdowns from "../../Component/formcomponent/LocationDropdowns";
import { useAuth } from "../../Hooks/AuthContext";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatOption = (arr = []) =>
  arr.map((item) => ({
    value: String(item.Value ?? item.value ?? item.id ?? ""),
    label: item.Text ?? item.label ?? item.name ?? "",
  }));

const STATUS_OPTIONS = [
  { value: "A", label: "All" },
  { value: "S", label: "Inspection Scheduled" },
  { value: "N", label: "Inspection Not-Scheduled" },
];

const ALL_OPTION = { value: "-1", label: "All" };

// ─── Table Columns ─────────────────────────────────────────────────────────────
const inspectionColumns = [
  {
    key: "S.N.",
    header: "S.N.",
    //headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "60px",
  },
  {
    key: "Region",
    header: "Region",
    //headerClassName: "text-left bg-blue-100 font-semibold",
    className: "text-left",
    width: "120px",
  },
  {
    key: "District",
    header: "District",
    //headerClassName: "text-left bg-blue-100 font-semibold",
    className: "text-left",
    width: "120px",
  },
  {
    key: "Profile ID",
    header: "Profile ID",
    //`headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "100px",
  },
  {
    key: "Skill Development Institute",
    header: "Skill Development Institute",
    //headerClassName: "text-left bg-blue-100 font-semibold",
    className: "text-left",
    width: "300px",
  },
  {
    key: "Inspection Request Date",
    header: "Inspection Request Date",
    //headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "150px",
  },
  {
    key: "Inspection Scheduled Date",
    header: "Inspection Scheduled Date",
    //headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "160px",
  },
  {
    key: "Status",
    header: "Status",
    //headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "180px",
  },
  {
    key: "Action",
    header: "Action",
    //headerClassName: "text-center bg-blue-100 font-semibold",
    className: "text-center",
    width: "120px",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
const SDIScheduleInspection = () => {
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
  const [resetKey, setResetKey] = useState(0);

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

  //
  //const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const { userInfo } = useAuth();
  const UserID = userInfo?.UserID;

  const loginID = userInfo?.UserLoginID;

  const [locationData, setLocationData] = useState({
    RegionID: "",
    DistrictID: "",
    TalukaID: "",
  });

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
        AddressService.getDistricts(),
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

  // ─────────────────────────────────────────────────────────────────────────
  // Cascade: Region → Districts
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const regionID = formData.RegionID;
    if (!regionID || regionID === "-1") {
      setFilteredDistricts(allDistricts);
      const validTalukas = allTalukas.filter(
        (a) => Number(a.Group2) > 0 || a.Group === "-1",
      );
      setFilteredTalukas(validTalukas);
      return;
    }

    const inRegion = allDistricts.filter(
      (d) =>
        String(d.Group ?? d.RegionID ?? "") === String(regionID) ||
        d.Group === "-1",
    );
    setFilteredDistricts(inRegion);

    const talukasInRegion = allTalukas.filter(
      (a) => String(a.Group2) === String(regionID) || a.Group === "-1",
    );
    setFilteredTalukas(talukasInRegion);

    setFormData((prev) => ({ ...prev, DistrictID: "-1", TalukaID: "-1" }));
  }, [formData.RegionID, allDistricts, allTalukas]);

  // ─────────────────────────────────────────────────────────────────────────
  // Cascade: District → Talukas
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const districtID = formData.DistrictID;
    const regionID = formData.RegionID;

    if (!districtID || districtID === "-1") {
      if (regionID && regionID !== "-1") {
        const talukasInRegion = allTalukas.filter(
          (a) => String(a.Group2) === String(regionID) || a.Group === "-1",
        );
        setFilteredTalukas(talukasInRegion);
      } else {
        const validTalukas = allTalukas.filter(
          (a) => Number(a.Group2) > 0 || a.Group === "-1",
        );
        setFilteredTalukas(validTalukas);
      }
      return;
    }

    let inDistrict = allTalukas.filter(
      (t) => String(t.Group) === String(districtID) || t.Group === "-1",
    );

    if (regionID && regionID !== "-1") {
      inDistrict = inDistrict.filter(
        (t) => String(t.Group2) === String(regionID) || t.Group === "-1",
      );
    }

    setFilteredTalukas(inDistrict);
    setFormData((prev) => ({ ...prev, TalukaID: "-1" }));
  }, [formData.DistrictID, allTalukas]);

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
        DistrictID: locationData.DistrictID || "-1",
        TalukaID: locationData.TalukaID.trim() || "-1",
        RegionID: locationData.RegionID || "-1",
        FormStatus: formData.FormStatus || "A",
        InstituteID: instID ?? -1,
        userID: UserID ?? -1,
      });

      const response = await agent.get(
        `${SearchSDIInspection}?${params.toString()}`,
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
    setFilteredDistricts(allDistricts);
    setFilteredTalukas(allTalukas);
    setTableData([]);
    setHasSearched(false);
    setResetKey((prev) => prev + 1);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Navigate on Schedule / Reschedule
  // ─────────────────────────────────────────────────────────────────────────
  //const handleAction = (row) => {
  //    const isReschedule =
  //        row["Action"] === "Reschedule" || row.Action === "Reschedule";

  //    //navigate("/DVETO/SDIScheduleInspectionForm", {
  //    //    state: {
  //    //        profileId: row["Profile ID"] || row.ProfileID || row.InstituteApplicationID,
  //    //        instituteId: row.InstituteID || resolvedInstID,
  //    //        instituteName: row["Skill Development Institute"] || row.InstituteName,
  //    //        isReschedule,
  //    //        rowData: row,
  //    //    },
  //    //});

  //    const instituteData = {
  //        profileId: row["Profile ID"] || row.ProfileID || row.InstituteApplicationID,
  //        instituteId: row.InstituteID || resolvedInstID,
  //        instituteName: row["Skill Development Institute"] || row.InstituteName,
  //        isReschedule,
  //        rowData: row,
  //    };

  //    setSelectedInstitute(instituteData);
  //    setShowScheduleForm(true);
  //};

  const handleAction = async (row) => {
    //const isReschedule = row["Action"] === "Reschedule" || row.Action === "Reschedule";

    try {
      const profileId =
        row["Profile ID"] || row.ProfileID || row.InstituteApplicationID;

      if (!profileId) {
        alert("Profile ID not found");
        return;
      }

      let instituteId = null;

      const res = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${profileId}`,
      );

      instituteId = res?.data?.Data;

      if (!instituteId) {
        alert("No InstituteID found");
        return;
      }

      // Example: logged in user id
      //const userLoginId = sessionStorage.getItem("UserLoginID"); // or from auth context

      // ✅ Navigate with query params
      navigate(
        `/DVETO/SDIScheduleInspectionForm?p1=${profileId}&p2=${instituteId}`,
      );
    } catch (error) {}
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
              alert("Error fetching institute ID");
            }
          }}
          className="text-blue-600 underline cursor-pointer font-semibold"
        >
          {profileId}
        </span>
      );
    }
    if (column.key === "Status") {
      const val = (value || "").toString().trim();

      const isVerified = val === "S" || val === "Inspection Scheduled";

      const isRejected = val === "R" || val === "Rejected";

      let icon = pending;
      let altText = "Pending";

      if (isVerified) {
        icon = verified;
        altText = "Verified";
      } else if (isRejected) {
        icon = rejected;
        altText = "Rejected";
      }

      return (
        <span className="inline-flex items-center gap-2">
          <img src={icon} alt={altText} className="w-8 h-8 object-contain" />
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
          {/*{!isNoDate && <Calendar className="w-3 h-3 text-blue-500 flex-shrink-0" />}*/}
          {value || "No Date"}
        </span>
      );
    }

    if (column.key === "Action") {
      const isReschedule = value === "Reschedule";
      return (
        <button
          onClick={() => handleAction(item)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap ${
            isReschedule
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isReschedule ? (
            <RefreshCw className="w-3 h-3 flex-shrink-0" />
          ) : (
            <Calendar className="w-3 h-3 flex-shrink-0" />
          )}
          {value}
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

  const InstituteDetailsPopUp = (instituteId, profileId) => {
    if (!instituteId) return;

    const popupWidth = 1000;
    const popupHeight = 750;

    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const popup = window.open(
      //`${window.location.origin}/React/InstituteDetailsPrint?instituteId=${instituteId}&courseCode=${courseCode}`,
      `${window.location.origin}/React/InspectionApplication?P1=${instituteId}&P2=${profileId}`,

      "InstituteDetailsPrint",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );

    if (!popup) {
      alert("Popup blocked! Please allow popups.");
    }
  };
  return (
    <div className="p-4">
      {/* ── Filter Fieldset ── */}
      <fieldset className="rounded border border-gray-300 p-4 mb-6 bg-white shadow-sm">
        <legend
          className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
        >
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            SDI - Schedule Inspection
          </div>
        </legend>

        {/* Row 1: Left - Status | Profile ID | Right - Region | District | Taluka */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            {/*<div>*/}
            {/*    <DropdownComponent*/}
            {/*        label="Region"*/}
            {/*        name="RegionID"*/}
            {/*        options={regionOptions}*/}
            {/*        value={formData.RegionID?.toString()}*/}
            {/*        onChange={(value) => handleDropdownChange("RegionID", value)}*/}
            {/*        loading={loadingDropdowns.regions}*/}
            {/*        required={false}*/}
            {/*    />*/}
            {/*</div>*/}
            {/*<div>*/}
            {/*    <DropdownComponent*/}
            {/*        label="District"*/}
            {/*        name="DistrictID"*/}
            {/*        options={districtOptions}*/}
            {/*        value={formData.DistrictID?.toString()}*/}
            {/*        onChange={(value) => handleDropdownChange("DistrictID", value)}*/}
            {/*        loading={loadingDropdowns.districts}*/}
            {/*        required={false}*/}
            {/*    />*/}
            {/*</div>*/}
            {/*<div>*/}
            {/*    <DropdownComponent*/}
            {/*        label="Taluka"*/}
            {/*        name="TalukaID"*/}
            {/*        options={talukaOptions}*/}
            {/*        value={formData.TalukaID?.toString()}*/}
            {/*        onChange={(value) => handleDropdownChange("TalukaID", value)}*/}
            {/*        loading={loadingDropdowns.talukas}*/}
            {/*        required={false}*/}
            {/*    />*/}
            {/*</div>*/}

            <LocationDropdowns
              userLoginID={loginID}
              key={resetKey}
              onChange={(data) => {
                setLocationData(data);
              }}
            />
          </div>
          {/* Left Side: Status & Profile ID */}
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

          {/* Right Side: Region | District | Taluka */}
        </div>

        {/* Buttons: Centered Below */}
        <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700`}
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
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white bg-red-500 border-2 border-red-500 hover:bg-red-600 hover:border-red-600 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
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

export default SDIScheduleInspection;
