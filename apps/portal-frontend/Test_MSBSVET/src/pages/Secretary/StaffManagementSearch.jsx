import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import agent from "../../lib/api/agent";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";
import { AddressService } from "../../lib/services/addressService";
import { SearchStaffManagement } from "../../Endpoints_All/Base/masterData";
import verified from "../../assets/VerifiedIcon.jpg";
import rejected from "../../assets/NotVerifiedIcon.jpg";


const formatOption = (arr) =>
  Array.isArray(arr)
    ? arr.map((i) => ({
        value: String(i.Value),
        label: i.Text,
      }))
    : [];

const ALL_OPTION = { value: "-1", label: "All" };

const STATUS_OPTIONS = [
  { value: "A", label: "All" },
  { value: "V", label: "Verified" },
  { value: "S", label: "Not Verified" },
  { value: "R", label: "Rejected" },
];  

const StaffManagementSearch = () => {
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading, isLoading } = useLoading();

  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredTalukas, setFilteredTalukas] = useState([]);

  const [tableData, setTableData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);



  const [formData, setFormData] = useState({
    RegionID: "-1",
    DistrictID: "-1",
    TalukaID: "-1",
    FormStatus: "A",
    ProfileID: "",
  });

  const navigate = useNavigate();
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [r, rd, t] = await Promise.all([
      AddressService.getRegions(),
      AddressService.getRegionDistricts(-1), // ✅ IMPORTANT CHANGE
      AddressService.getTalukas(),
    ]);
    //console.log(r, rd, t);
    const get = (res) => res?.data ?? res?.Data ?? res ?? [];

    const regionData = get(r);
    const districtData = get(rd); // ✅ changed
    const talukaData = get(t);
    //console.log(regionData, districtData, talukaData);
    setRegions(regionData);
    setDistricts(districtData);
    setTalukas(talukaData);

    setFilteredDistricts(districtData);
    setFilteredTalukas(talukaData);
  };

  useEffect(() => {
    const r = formData.RegionID;

    if (r === "-1") {
      setFilteredDistricts([]);
      setFilteredTalukas([]);
      return;
    }

    // ✅ ONLY District filter
    const d = districts.filter((x) => String(x.Group) === String(r));

    setFilteredDistricts(d);
    setFilteredTalukas([]); // ✅ reset taluka

    setFormData((p) => ({
      ...p,
      DistrictID: "-1",
      TalukaID: "-1",
    }));

    setTableData([]);
  }, [formData.RegionID]);
  useEffect(() => {
    const d = formData.DistrictID;

    if (d === "-1") {
      setFilteredTalukas([]);
      return;
    }

    // ✅ ONLY District → Taluka
    const t = talukas.filter((x) => String(x.Group) === String(d));

    setFilteredTalukas(t);

    setFormData((p) => ({
      ...p,
      TalukaID: "-1",
    }));

    setTableData([]);
  }, [formData.DistrictID]);

  const handleChange = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
    setTableData([]);
  };

  const handleSearch = async () => {
    const profile = formData.ProfileID?.trim().toUpperCase();

    if (profile && profile.length !== 13) {
      alert("Invalid Profile ID !");
      return;
    }

    startLoading();
    setHasSearched(true);

    const params = new URLSearchParams({
      DistrictID: formData.DistrictID,
      TalukaID: formData.TalukaID,
      RegionID: formData.RegionID,
      FormStatus: formData.FormStatus,
      ProfileID: profile,
    });

    const res = await agent.get(`${SearchStaffManagement}?${params}`);
    setTableData(res?.data?.Data || []);
    stopLoading();
  };

  const handleReset = () => {
    setFormData({
      RegionID: "-1",
      DistrictID: "-1",
      TalukaID: "-1",
      FormStatus: "A",
      ProfileID: "",
    });

    setFilteredDistricts(districts);
    setFilteredTalukas(talukas);
    setTableData([]);
    setHasSearched(false);
  };
  const navigateToVerification = (row) => {
    const staffID = row.ApplicationID?.slice(-6);

    navigate(`/Staff/StaffVerification?P1=${staffID}`);
  };

  const handleVerify = (row) => {
    navigateToVerification(row);
  };

  const handleReverify = (row) => {
    navigateToVerification(row);
  };

    const handleProfileClick = (row) => {
        const staffID = row.ApplicationID?.slice(-6);
        const userLoginID = row.ApplicationID;

        const url = `/react/StaffPrintApplicationForm?staffID=${staffID}&userLoginID=${userLoginID}`;

        window.open(
            url,
            "PrintWindow",
            "width=900,height=700,top=100,left=200,scrollbars=yes,resizable=yes"
        );
    };

  //const handleReadyToPrint = (pw) => {
  //  setTimeout(() => {
  //    pw.focus();
  //    pw.print();
  //  }, 300);
  //};

  const renderCell = (row, column) => {
    if (column.key === "ApplicationID") {
      return (
        <span
          className="text-blue-600 underline cursor-pointer"
          onClick={() => handleProfileClick(row)}
        >
          {row.ApplicationID}
        </span>
      );
    }

    if (column.key === "VerifyStatus") {
      return (
        <div className="flex justify-center">
          <img
            src={row.VerifyStatus === "V" ? verified : rejected}
            className="w-6 h-6"
          />
        </div>
      );
    }

    if (column.key === "Action") {
      const status = row.VerifyStatus;

      let button = null;

      if (status === "V") {
        button = (
          <button
            className="px-3 py-1 text-xs bg-yellow-500 text-white rounded"
            onClick={() => handleReverify(row)}
          >
            Reverify
          </button>
        );
      }

      if (status === "R" || status === "S" || status === "N") {
        button = (
          <button
            className="px-3 py-1 text-xs bg-green-600 text-white rounded"
            onClick={() => handleVerify(row)}
          >
            Verify
          </button>
        );
      }

      return <div className="flex justify-center">{button}</div>;
    }

    return <span>{row[column.key] ?? "-"}</span>;
  };

  const columns = [
    { key: "Region", header: "Region" },
    { key: "District", header: "District" },
    { key: "Taluka", header: "Taluka" },
    { key: "ApplicationID", header: "Profile ID" },
    { key: "StaffName", header: "Name" },
    { key: "VerifyStatus", header: "Status" },
    { key: "Action", header: "Action" },
  ];

  const regionOptions = [ALL_OPTION, ...formatOption(regions)];
  const districtOptions = [ALL_OPTION, ...formatOption(filteredDistricts)];
  const talukaOptions = [ALL_OPTION, ...formatOption(filteredTalukas)];

  return (
    <div className="p-4">
      <fieldset className="rounded border p-4 mb-6 bg-white shadow-sm">
        <legend className={`rounded ${color} px-4 py-1 text-xl text-white`}>
          <Search className="inline mr-2" />
          Staff / Management
        </legend>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <DropdownComponent
              label="Region"
              options={regionOptions}
              value={formData.RegionID}
              onChange={(v) => handleChange("RegionID", v)}
            />
            <DropdownComponent
              label="District"
              options={districtOptions}
              value={formData.DistrictID}
              onChange={(v) => handleChange("DistrictID", v)}
            />
            <DropdownComponent
              label="Taluka"
              options={talukaOptions}
              value={formData.TalukaID}
              onChange={(v) => handleChange("TalukaID", v)}
            />
          </div>

          <div className="space-y-4">
            <DropdownComponent
              label="Status"
              options={STATUS_OPTIONS}
              value={formData.FormStatus}
              onChange={(v) => handleChange("FormStatus", v)}
            />
            <input
              type="text"
              placeholder="Profile ID"
              value={formData.ProfileID}
              onChange={(e) => handleChange("ProfileID", e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleSearch}
            className={`px-6 py-2 text-white ${color} rounded`}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 rounded"
          >
            Reset
          </button>
        </div>
      </fieldset>

      {hasSearched && (
        <fieldset className="rounded border p-4 bg-white shadow-sm">
          <legend className={`rounded ${color} px-4 py-1 text-white`}>
            Staff List
          </legend>

          <FilteredTableComponent
            data={tableData}
            columns={columns}
            renderCell={renderCell}
            loading={isLoading}
            searchable
            exportable
          />
        </fieldset>
      )}

     
    </div>
  );
};

export default StaffManagementSearch;
