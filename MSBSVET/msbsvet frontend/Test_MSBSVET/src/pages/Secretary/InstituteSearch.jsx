import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { useLoading } from "../../Hooks/useLoading";
import agent from "../../lib/api/agent";
import { AddressService } from "../../lib/services/addressService";
//import { SearchPromotingOrganization } from "../../Endpoints_All/Base/masterData?
import Loader from "../../Component/formcomponent/Loader";
import { SearchSDILOI, SearchInstitutes } from "../../Endpoints_All/Institute/institute"; 
import verified from "../../assets/VerifiedIcon.jpg";
import rejected from "../../assets/NotVerifiedIcon.jpg";
const ALL_OPTION = { value: "-1", label: "All" };

const STATUS_OPTIONS = [
    { value: "A", label: "All" },
    { value: "V", label: "Approved" },
    { value: "S", label: "Unapproved" }, // ✅ FIX
    { value: "R", label: "Rejected" },
];

const formatOption = (arr, labelKey = "Text", valueKey = "Value") =>
    Array.isArray(arr)
        ? arr.map((i) => ({
            value: String(i[valueKey]),
            label: i[labelKey],
        }))
        : [];

const InstituteSearch = () => {
    const { color } = useContext(ThemeContext);
    const { startLoading, stopLoading, isLoading } = useLoading();

    // MASTER
    const [regions, setRegions] = useState([]);
    const [regionDistrictMaster, setRegionDistrictMaster] = useState([]);
    const [talukaMaster, setTalukaMaster] = useState([]);

    // FILTERED
    const [districts, setDistricts] = useState([]);
    const [talukas, setTalukas] = useState([]);
    const [institutes, setInstitutes] = useState([]);

    const [tableData, setTableData] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        RegionID: "-1",
        DistrictID: "-1",
        TalukaID: "-1",
        Approvalstatus: "A",
        InstituteID: "-1",
    });

    // LOAD MASTER DATA
    useEffect(() => {
        loadAll();
        loadInstitutes(formData, true); 
    }, []);

    const get = (res) => res?.data ?? res?.Data ?? res ?? [];

    const loadAll = async () => {
        try {
            const [r, rd, t] = await Promise.all([
                AddressService.getRegions(),
                AddressService.getRegionDistricts(-1),
                AddressService.getTalukas(),
            ]);

            const regionData = get(r).filter((x) => x.Value !== "-1");
            const districtData = get(rd).filter((x) => x.Value !== "-1");
            const talukaData = get(t).filter(
                (x) => x.Value !== "-1" && parseInt(x.Group2) > 0
            );

            setRegions(regionData);
            setRegionDistrictMaster(districtData);
            setTalukaMaster(talukaData);

            setDistricts(districtData);
            setTalukas(talukaData);
        } catch (err) {
        }
    };

    const loadInstitutes = async (data = formData, isInitial = false) => {
        try {
            const params = {
                DistrictID: Number(data.DistrictID),
                TalukaID: Number(data.TalukaID),
                RegionID: Number(data.RegionID),
                FormStatus: data.Approvalstatus,
                InstituteID: -1,
            };
            // ✅ IMPORTANT LOGIC
            const api = isInitial ? SearchInstitutes : SearchSDILOI;

            const res = await agent.get(api, { params });
            

            setInstitutes(res?.data?.Data || []);
        } catch (err) {
        }
    };

    // REGION CHANGE
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
            setDistricts(
                regionDistrictMaster.filter(
                    (x) => String(x.Group) === String(value)
                )
            );

            setTalukas(
                talukaMaster.filter(
                    (x) => String(x.Group2) === String(value)
                )
            );
        } else {
            setDistricts(regionDistrictMaster);
            setTalukas(talukaMaster);
        }

        loadInstitutes(updated);
      
        setTableData([]);
        setHasSearched(false);
    };

    // DISTRICT CHANGE
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
        setHasSearched(false);
    };

    const handleTalukaChange = (value) => {
        const updated = { ...formData, TalukaID: value, InstituteID: "-1" };
        setFormData(updated);
        loadInstitutes(updated);
        setTableData([]);
        setHasSearched(false);
    };

    const handleStatusChange = (value) => {
        const updated = { ...formData, Approvalstatus: value, InstituteID: "-1" };
        setFormData(updated);
        loadInstitutes(updated);
        setTableData([]);
        setHasSearched(false);
    };

    const handleChange = (name, value) => {
        if (name === "RegionID") return handleRegionChange(value);
        if (name === "DistrictID") return handleDistrictChange(value);
        if (name === "TalukaID") return handleTalukaChange(value);
        if (name === "Approvalstatus") return handleStatusChange(value);

        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleSearch = async () => {

        if (institutes.length === 0) {
            setTableData([]);
            setHasSearched(true);
            return;
        }
        try {
            startLoading();
            setHasSearched(true);

            const params = {
                RegionID: Number(formData.RegionID),
                DistrictID: Number(formData.DistrictID),
                TalukaID: Number(formData.TalukaID),
                FormStatus: formData.Approvalstatus,
                InstituteID: Number(formData.InstituteID),
            };

            const res = await agent.get(SearchInstitutes, { params });

            const raw = res?.data?.Data || [];

            const selectedRegion = regions.find(r => r.Value == formData.RegionID)?.Text;
            const selectedDistrict = districts.find(d => d.Value == formData.DistrictID)?.Text;

            const filtered = raw.filter(item => {
                if (formData.RegionID !== "-1" && item.Region !== selectedRegion) return false;
                if (formData.DistrictID !== "-1" && item.District !== selectedDistrict) return false;
                return true;
            });

            const cleaned = filtered.map((item, index) => ({
                ...item,
                SrNo: index + 1,
                ProfileID: item.InstituteCode,
                PromotingOrganization: item.InstituteName, // ✅ important fix
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

    const columns = [
        { key: "SrNo", header: "Sr. No.", className: "text-center" },
        { key: "Region", header: "Region", className: "text-center" },
        { key: "District", header: "District", className: "text-center" },
        { key: "ProfileID", header: "Institute Code", className: "text-center" },
        { key: "PromotingOrganization", header: "Institute", className: "text-center" },
        { key: "ApplicationDate", header: "Application Date", className: "text-center" },
        { key: "VerifyStatus", header: "Status", className: "text-center" },
        { key: "Action", header: "Action", className: "text-center" },
    ];


    const handleVerifyClick = (row) => {
        navigate(`/Institute/InstituteProfile?P1=${row.InstituteID}`);
    };
    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";

        const d = new Date(dateStr);

        return d.toLocaleString("en-US", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            //hour: "numeric",
            //minute: "2-digit",
            //second: "2-digit",
            //hour12: true,
        });
    };


    const navigateToPrint = (row) => {
        const instituteId = row.InstituteID;

        const url = `/React/InstituteDetailsPrint?instituteId=${instituteId}&courseCode=0`;

        window.open(
            url,
            "PrintWindow",
            "width=900,height=700,top=100,left=200,scrollbars=yes,resizable=yes"
        );
    };



    const renderCell = (row, column) => {

        if (column.key === "SrNo") {
            return <span>{row.SrNo}</span>;
        }

        if (column.key === "ProfileID") {
            return (
                <span
                    className="text-blue-600 underline cursor-pointer font-semibold"
                    onClick={() => navigateToPrint(row)}
                >
                    {row.ProfileID}
                </span>
            );
        }

        if (column.key === "ApplicationDate") {
            return <span>{formatDateTime(row.ApplicationDate)}</span>;
        }

        if (column.key === "VerifyStatus") {
            return (
                <img
                    src={row.VerifyStatus === "V" ? verified : rejected}
                    className="w-6 h-6 mx-auto"
                />
            );
        }

        if (column.key === "Action") {
            const isVerified = row.VerifyStatus === "V";

            return (
                <div className="flex justify-center">
                    <button
                        className={`px-3 py-1 text-xs font-semibold rounded text-white 
                    ${isVerified ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"}
                `}
                        onClick={() => handleVerifyClick(row)}
                    >
                        {isVerified ? "Reverify" : "Verify"}
                    </button>
                </div>
            );
        }

        return <span>{row[column.key] ?? "-"}</span>;
    };
    return (
        <>
            {isLoading && <Loader />}

            <div className="p-4">
                <fieldset className="rounded border p-4 bg-white shadow-sm">
                    <legend className={`rounded ${color} px-4 py-1 text-white`}>
                        <Search className="inline mr-2" />
                        Institute Profile Verification
                    </legend>

                    <div className="grid grid-cols-2 gap-6 mt-6">
                        <div className="space-y-4">
                            <DropdownComponent
                                label="Region"
                                options={[ALL_OPTION, ...formatOption(regions)]}
                                value={formData.RegionID}
                                onChange={(v) => handleChange("RegionID", v)}
                            />

                            <DropdownComponent
                                label="District"
                                options={[ALL_OPTION, ...formatOption(districts)]}
                                value={formData.DistrictID}
                                onChange={(v) => handleChange("DistrictID", v)}
                            />

                            <DropdownComponent
                                label="Taluka"
                                options={[ALL_OPTION, ...formatOption(talukas)]}
                                value={formData.TalukaID}
                                onChange={(v) => handleChange("TalukaID", v)}
                            />
                        </div>

                        <div className="space-y-4">
                            <DropdownComponent
                                label="Institute"
                                options={[
                                    { value: "-1", label: "Select" },
                                    ...formatOption(institutes, "InstituteNameCode", "InstituteID"),
                                ]}
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
                            Search
                        </button>

                        <button
                            onClick={handleReset}
                            className="px-6 py-2 bg-gray-200 rounded"
                        >
                            Reset
                        </button>
                    </div>
                </fieldset>
                <div className="mt-6">
                {hasSearched && (
                    <FilteredTableComponent
                        data={tableData}
                        columns={columns}
                        renderCell={renderCell}
                    />
                    )}
                </div>
            </div>
        </>
    );
};

export default InstituteSearch;