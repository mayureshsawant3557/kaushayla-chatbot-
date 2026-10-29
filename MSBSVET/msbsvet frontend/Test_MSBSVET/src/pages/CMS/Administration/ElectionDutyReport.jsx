import { useContext, useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { DateInput } from "../../../Component/formcomponent/DateInputComponent";
import LocationDropdowns from "../../../Component/formcomponent/LocationFilterComponent";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";

import agent from "../../../lib/api/agent";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { GetElectionDutyReport } from "../../../Endpoints_All/CMS/academisthan";
import { useAuth } from "../../../hooks/AuthContext";

const initialFormData = {
  RegionID: "",
  DistrictID: "",
  TalukaID: "",
};

const ElectionDutyReport = () => {
  const { color } = useContext(ThemeContext);

  const [loading, setLoading] = useState(false);
   const {userInfo} = useAuth();

  const [districtOptions, setDistrictOptions] = useState([]);
  const [constituencyOptions, setConstituencyOptions] = useState([]);
  const [locationData, setLocationData] = useState({
    RegionID: "",
    DistrictID: "",
    TalukaID: "",
  });
  const locationReadyRef = useRef(null);
  const [formData, setFormData] = useState(initialFormData);

  const [filters, setFilters] = useState({
    staffID: "",
    nature: "",
    fromDate: "",
    toDate: "",
  });

  const [reportData, setReportData] = useState([]);

  const tableRows = reportData.map((row, index) => ({
    srNo: index + 1,
    profileId: row.ProfileID || "",
    name: row.FullName || "",
    designation: row.Designation || "",
    from: row.DeputationFrom || "",
    to:
      row.DeputationFrom && !row.DeputationTo
        ? "Till Date"
        : row.DeputationTo || "", // ← fix

    district: row.District || "",
    constituency: row.Constituency || "",
    nature: row.NatureOfDeputation || "",
    assignedByAuthority: row.AssigenedByAuthority || "",
  }));

  const groupedHeaders = [
    { title: "", colSpan: 4 },
    { title: "Deputation Period", colSpan: 2 },
    { title: "Constituency", colSpan: 2 },
    { title: "", colSpan: 2 },
  ];

  const columns = [
    { key: "srNo", header: "S.N." },
    { key: "profileId", header: "Profile ID" },
    { key: "name", header: "Name" },
    { key: "designation", header: "Designation" },
    { key: "from", header: "From" },
    { key: "to", header: "To" },
    { key: "district", header: "District" },
    { key: "constituency", header: "Constituency" },
    { key: "nature", header: "Nature" },
    { key: "assignedByAuthority", header: "Assigned by Authority" },
  ];


  const handleSearch = async () => {
    try {
      setLoading(true);

      let finalStaffID = 0;

      if (filters.staffID?.trim()) {
        // Convert Profile/Login Code (202501S510384) to numeric ID (510384)
        const instRes = await agent.get(GetInstituteIDByInstituteCode, {
          params: {
            InstituteCode: filters.staffID.trim(),
          },
        });


        finalStaffID =
          instRes?.data?.Data ??
          instRes?.data?.InstituteID ??
          instRes?.data ??
          0;
      }

      const res = await agent.get(GetElectionDutyReport, {
        params: {
          RegionID: locationData.RegionID || 0,
          DistrictID: locationData.DistrictID || 0,
          TalukaID: locationData.TalukaID || 0,
          StaffID: finalStaffID,
        },
      });

      setReportData(res?.data?.Data || res?.data || []);
    } catch (error) {
      console.error("HTTP Error:", {
        status: error?.response?.status,
        message: error?.message,
      });

      console.error("Response Data:", error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationReady = async ({ RegionID, DistrictID, TalukaID }) => {
    // Store the ready location data in ref
    locationReadyRef.current = { RegionID, DistrictID, TalukaID };

    // Set the location data to populate dropdowns with these values
    setLocationData({
      RegionID: RegionID || "",
      DistrictID: DistrictID || "",
      TalukaID: TalukaID || "",
    });
  };

  const handleReset = () => {
    setFilters({
      staffID: "",
      districtID: "",
      constituencyID: "",
      nature: "",
      fromDate: "",
      toDate: "",
    });

    setFormData({
      RegionID: "",
      DistrictID: "",
      TalukaID: "",
    });

    setLocationData({
      RegionID: "",
      DistrictID: "",
      TalukaID: "",
    });

    setReportData([]);
  };

  return (
    <div className="w-full p-4">
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <legend
          className={`flex ${color} items-center gap-2 text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          Election Duty Report
        </legend>

        <div className="p-4">
          <div className="mb-5">
            <div className="grid grid-cols-4 gap-4 items-end">
              <div className="col-span-3">
                <div className="[&>div]:grid [&>div]:grid-cols-3 [&>div]:gap-4 [&>div]:items-end">
                  <LocationDropdowns
                    userLoginID={userInfo?.UserLoginID}
                    value={{
                      RegionID: formData.RegionID,
                      DistrictID: formData.DistrictID,
                      TalukaID: formData.TalukaID,
                    }}
                    onChange={(data) => {
                      setLocationData(data);
                      // Also update formData when user selects a value
                      setFormData({
                        ...formData,
                        RegionID: data.RegionID,
                        DistrictID: data.DistrictID,
                        TalukaID: data.TalukaID,
                      });
                    }}
                    onReady={handleLocationReady}
                    layoutClass="grid grid-cols-3 gap-4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff ID
                </label>
                <input
                  type="text"
                  value={filters.staffID || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      staffID: e.target.value,
                    })
                  }
                  placeholder="Enter Staff ID"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 mb-5">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Search"}
            </button>

            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors"
            >
              Reset
            </button>
          </div>

          <FilteredTableComponent
            data={tableRows}
            columns={columns}
            groupedHeaders={groupedHeaders}
            searchable={true}
            sortable={true}
            showSearch={true}
            emptyStateMessage="No election duty records found"
          />
        </div>
      </fieldset>
    </div>
  );
};

export default ElectionDutyReport;
