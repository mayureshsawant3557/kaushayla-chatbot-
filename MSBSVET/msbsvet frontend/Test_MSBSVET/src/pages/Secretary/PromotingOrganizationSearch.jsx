import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import agent from "../../lib/api/agent";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";
import { AddressService } from "../../lib/services/addressService";
import { SearchPromotingOrganization } from "../../Endpoints_All/Base/masterData";
import OTPService from "../../Component/formcomponent/OTPService"; 
import verified from "../../assets/VerifiedIcon.jpg";
import rejected from "../../assets/NotVerifiedIcon.jpg";
import Swal from "sweetalert2";
import Loader from "../../Component/formcomponent/Loader";
import { useAuth } from "../../Hooks/AuthContext";
const ALL_OPTION = { value: "-1", label: "All" };

const STATUS_OPTIONS = [
  { value: "A", label: "All" },
  { value: "V", label: "Verified" },
  { value: "S", label: "Not Verified" },
  { value: "R", label: "Rejected" },
];

const formatOption = (arr, labelKey = "Text", valueKey = "Value") =>
  Array.isArray(arr)
    ? arr.map((i) => ({
        value: String(i[valueKey]),
        label: i[labelKey],
      }))
    : [];

const PromotingOrganizationSearch = () => {
  const { color } = useContext(ThemeContext);
    const { startLoading, stopLoading, isLoading } = useLoading();
    const selectedRowRef = useRef(null);

  //  MASTER DATA
  const [regions, setRegions] = useState([]);
  const [regionDistrictMaster, setRegionDistrictMaster] = useState([]);
  const [talukaMaster, setTalukaMaster] = useState([]);

  //  FILTERED DATA
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  const [institutes, setInstitutes] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();
   const { userInfo } = useAuth();
    const userID = userInfo?.UserID;
    //console.log("USER INFO:", userInfo);


  const [formData, setFormData] = useState({
    RegionID: "-1",
    DistrictID: "-1",
    TalukaID: "-1",
    Approvalstatus: "A",
    InstituteID: "-1",
  });

  //  LOAD ALL MASTER DATA
  useEffect(() => {
    loadAll();
    loadInstitutes();
  }, []);

    const otpService = OTPService({
        purpose: "Verification",
        messege: "Enter the OTP sent to your registered mobile number to proceed with verification.",
        onSuccess: () => {
            const row = selectedRowRef.current;

            if (row) {
                navigateToVerification(row);
            }
        },

        onError: () => {
            Swal.fire("Error", "OTP verification failed", "error");
        }
    });

  const get = (res) => res?.data ?? res?.Data ?? res ?? [];

  const loadAll = async () => {
    try {
      const [r, rd, t] = await Promise.all([
        AddressService.getRegions(),
        AddressService.getRegionDistricts(-1), // full data
        AddressService.getTalukas(),
      ]);

      const regionData = get(r).filter((x) => x.Value !== "-1");
      const districtData = get(rd).filter((x) => x.Value !== "-1");
      const talukaData = get(t).filter(
        (x) => x.Value !== "-1" && parseInt(x.Group2) > 0,
      );

      setRegions(regionData);
      setRegionDistrictMaster(districtData);
      setTalukaMaster(talukaData);

      // initial
      setDistricts(districtData);
      setTalukas(talukaData);
    } catch (err) {
    }
  };

  //  LOAD INSTITUTES
  const loadInstitutes = async (data = formData) => {
    try {
      const params = new URLSearchParams({
        DistrictID: data.DistrictID,
        TalukaID: data.TalukaID,
        RegionID: data.RegionID,
        formStatus: data.Approvalstatus,
        InstituteID: "-1",
      });

      const res = await agent.get(`${SearchPromotingOrganization}?${params}`);
      setInstitutes(res?.data?.Data || []);
    } catch (err) {
    }
  };

  //  REGION CHANGE
  const handleRegionChange = (value) => {
    const updated = {
      ...formData,
      RegionID: value,
      DistrictID: "-1",
      TalukaID: "-1",
      InstituteID: "-1",
    };
    setFormData(updated);

    if (value !== "-1") {
      const d = regionDistrictMaster.filter(
        (x) => String(x.Group) === String(value),
      );

      const t = talukaMaster.filter((x) => String(x.Group2) === String(value));

      setDistricts(d);
      setTalukas(t);
    } else {
      setDistricts(regionDistrictMaster);
      setTalukas(talukaMaster);
    }

    loadInstitutes(updated);
    setTableData([]);
  };

  //  DISTRICT CHANGE
  const handleDistrictChange = (value) => {
    const updated = {
      ...formData,
      DistrictID: value,
      TalukaID: "-1",
      InstituteID: "-1",
    };
    setFormData(updated);

    let t = talukaMaster;

    if (value !== "-1") {
      t = t.filter((x) => String(x.Group) === String(value));
    }

    if (formData.RegionID !== "-1") {
      t = t.filter((x) => String(x.Group2) === String(formData.RegionID));
    }

    setTalukas(t);

    loadInstitutes(updated);
    setTableData([]);
  };

  //  TALUKA CHANGE
  const handleTalukaChange = (value) => {
    const updated = {
      ...formData,
      TalukaID: value,
      InstituteID: "-1",
    };
    setFormData(updated);

    loadInstitutes(updated);
    setTableData([]);
  };

  //  STATUS CHANGE
  const handleStatusChange = (value) => {
    const updated = {
      ...formData,
      Approvalstatus: value,
      InstituteID: "-1",
    };
    setFormData(updated);

    loadInstitutes(updated);
    setTableData([]);
  };

  const handleChange = (name, value) => {
    if (name === "RegionID") return handleRegionChange(value);
    if (name === "DistrictID") return handleDistrictChange(value);
    if (name === "TalukaID") return handleTalukaChange(value);
    if (name === "Approvalstatus") return handleStatusChange(value);

    setFormData((p) => ({ ...p, [name]: value }));
  };

  //  SEARCH
  const handleSearch = async () => {
    try {
      startLoading();
      setHasSearched(true);

      const params = new URLSearchParams({
        RegionID: formData.RegionID,
        DistrictID: formData.DistrictID,
        TalukaID: formData.TalukaID,
        formStatus: formData.Approvalstatus,
        InstituteID: formData.InstituteID,
      });

      const res = await agent.get(`${SearchPromotingOrganization}?${params}`);
      //console.log("SEARCH RES:", res);
      const raw = res?.data?.Data || [];

      const cleaned = raw.map((item) => ({
        ...item,
        ProfileID: item.InstituteCode,
        FormStatusText: item.FormStatus?.includes("Verify")
          ? "Verify"
          : item.FormStatus?.includes("Reverify")
            ? "Reverify"
            : "-",
      }));

      setTableData(cleaned);
    } finally {
      stopLoading();
    }
  };

  const handleReset = () => {
    const reset = {
      RegionID: "-1",
      DistrictID: "-1",
      TalukaID: "-1",
      Approvalstatus: "A",
      InstituteID: "-1",
    };

    setFormData(reset);
    setDistricts(regionDistrictMaster);
    setTalukas(talukaMaster);
    setTableData([]);
    setHasSearched(false);

    loadInstitutes(reset);
  };

  // TABLE
  const columns = [
    { key: "Region", header: "Region" },
    { key: "District", header: "District" },
    { key: "ProfileID", header: "Profile ID" },
    { key: "PromotingOrganization", header: "Organization" },
    { key: "VerifyStatus", header: "Status" },
    { key: "FormStatusText", header: "Action" },
  ];


 const navigateToPrint = (row) => {
        const instituteId = row.InstituteID;
        const promotingOrgId = row.ProfileID;
     const url = `/react/PromotingOrganizationPrint?instituteId=${instituteId}&promotingOrgId=${promotingOrgId}&isPromotingId=true`;

        window.open(
            url,
            "PrintWindow",
            "width=900,height=700,top=100,left=200,scrollbars=yes,resizable=yes"
        );
    };



    const getUserMobile = async () => {
        try {
            const res = await agent.get(`/api/UserManagement/GetUserDetails/${userID}`);

            //console.log("User Details Response:", res);

            const userData = res?.data;

            // ✅ FIXED FIELD NAME
            return userData?.UserMobileNo;

        } catch (err) {
            return null;
        }
    };
    const handleVerifyClick = async (row) => {
        selectedRowRef.current = row; 

        const mobile = await getUserMobile();

        if (!mobile) {
            Swal.fire("Error", "Mobile number not found", "error");
            return;
        }

        otpService.startVerification(mobile);
    };




  const navigateToVerification = (row) => {
    const instituteId = row.InstituteID;
    const profileId = row.ProfileID;

    navigate(
      `/promotingorganization/profile?instituteId=${instituteId}&profileId=${profileId}`,
    );
  };

  const renderCell = (row, column) => {
    if (column.key === "ProfileID") {
      return (
          <span className="text-blue-600 underline cursor-pointer" onClick={() => navigateToPrint(row)}>

          {row.ProfileID}
        </span>
      );
    }

    if (column.key === "VerifyStatus") {
      return (
        <img
          src={row.VerifyStatus === "V" ? verified : rejected}
          className="w-6 h-6 mx-auto"
        />
      );
    }

    // ADD THIS BLOCK (MAIN FIX)
    if (column.key === "FormStatusText") {
      const status = row.VerifyStatus;

      let button = null;

        if (status === "V") {
            button = (
                <button
                    className="px-3 py-1 text-xs bg-yellow-500 text-white rounded"
                    onClick={() => handleVerifyClick(row)}
                >
                    Reverify
                </button>
            );
        }

        if (status === "R" || status === "S" || status === "N") {
            button = (
                <button
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded"
                    onClick={() => handleVerifyClick(row)}
                >
                    Verify
                </button>
            );
        }
      return <div className="flex justify-center">{button}</div>;
    }

    return <span>{row[column.key] ?? "-"}</span>;
  };

  const regionOptions = [ALL_OPTION, ...formatOption(regions)];
  const districtOptions = [ALL_OPTION, ...formatOption(districts)];
  const talukaOptions = [ALL_OPTION, ...formatOption(talukas)];
  const instituteOptions = [
    { value: "-1", label: " Select " },
    ...formatOption(institutes, "InstituteNameCode", "InstituteID"),
  ];

    return (

        <>
            {isLoading && <Loader />}
    <div className="p-4">
      <fieldset className="rounded border p-4 bg-white shadow-sm">
        <legend className={`rounded ${color} px-4 py-1 text-white`}>
          <Search className="inline mr-2" />
          Promoting Organization
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
              label="Institute"
              options={instituteOptions}
              value={formData.InstituteID}
              onChange={(v) => handleChange("InstituteID", v)}
            />
            <DropdownComponent
              label="Status"
              options={STATUS_OPTIONS}
              value={formData.Approvalstatus}
              onChange={(v) => handleChange("Approvalstatus", v)}
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
        <FilteredTableComponent
          data={tableData}
          columns={columns}
          renderCell={renderCell}
        />
      )}
            </div>
        </>
  );
};

export default PromotingOrganizationSearch;
