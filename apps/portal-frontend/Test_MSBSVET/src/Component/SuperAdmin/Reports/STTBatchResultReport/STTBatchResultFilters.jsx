/* =============================================================================
   Module : STT -> Batch Result Report
   File   : src/Component/SuperAdmin/Reports/STTBatchResultReport/STTBatchResultFilters.jsx
   Purpose: Role-aware cascading filter panel (Agency, Status, Region, District,
            Taluka, Institute). Loads filter masters once and cascades
            client-side (the app's address-filter convention). Emits the
            selected filters to the parent via onSearch().

   Role logic (existing-app UserTypeID mapping):
     61 Institute -> hide Agency; Institute auto-selected & locked to own college;
                     Region/District/Taluka hidden.
     10 / 11      -> all filters visible.
     14 District  -> hide Agency; District auto-selected & locked; Region hidden;
                     Taluka + Institute cascade from the fixed District.
     13 Region    -> hide Agency; Region auto-selected & locked; District/Taluka/
                     Institute cascade from the fixed Region.
   ============================================================================= */
import React, { useEffect, useMemo, useState } from "react";
import { Filter, Search, RotateCcw } from "lucide-react";
import DropdownComponent from "../../../formcomponent/DropdownComponent";
import agent from "../../../../lib/api/agent";
import { GetSTTBatchResultFilters } from "../../../../Endpoints_All/STT/sttBatchResultReport";
import { SwalHelper } from "../../../../utils/swalHelper";

const toNum = (v) => (v === "" || v === null || v === undefined ? 0 : Number(v));

const STTBatchResultFilters = ({ onSearch, searching }) => {
    // ---- role / scope (read once from session) -----------------------------
    const userInfo = useMemo(() => {
        try {
            return JSON.parse(sessionStorage.getItem("userInfoAll")) || {};
        } catch {
            return {};
        }
    }, []);

    const typeId = toNum(userInfo?.UserTypeID);
    const userRegionId = toNum(userInfo?.MsbsvetMtId);
    const userDistrictId = toNum(userInfo?.MsbsvetMtId);
    const userInstituteId = toNum(userInfo?.MsbsvetMtId );

    const showAgency = typeId === 10 || typeId === 11;
    const showRegion = typeId === 10 || typeId === 11 || typeId === 13;
    const showDistrict = typeId !== 61;
    const showTaluka = typeId !== 61;
    const regionLocked = typeId === 13;
    const districtLocked = typeId === 14;
    const instituteLocked = typeId === 61;

    // ---- filter master data -------------------------------------------------
    const [masters, setMasters] = useState({
        regions: [],
        districts: [],
        talukas: [],
        institutes: [],
        agencies: [],
        statuses: [],
    });
    const [loadingMasters, setLoadingMasters] = useState(false);

    // ---- selected values ----------------------------------------------------
    const [selected, setSelected] = useState({
        agencyId: 0,
        status: "",
        regionId: regionLocked ? userRegionId : 0,
        districtId: districtLocked ? userDistrictId : 0,
        talukaId: 0,
        instituteId: instituteLocked ? userInstituteId : 0,
    });

    useEffect(() => {
        const loadFilters = async () => {
            setLoadingMasters(true);
            try {
                const res = await agent.get(GetSTTBatchResultFilters, {
                    params: {
                        userTypeID: typeId,
                        userLoginID: userInfo?.UserLoginID || "",
                        regionID: regionLocked ? userRegionId : 0,
                        districtID: districtLocked ? userDistrictId : 0,
                    },
                });
                // ApiResponse<DataSet> -> Data = { Table, Table1, ... }
                const data = res.data?.Data ?? res.data ?? {};
                setMasters({
                    regions: data.Table || [],
                    districts: data.Table1 || [],
                    talukas: data.Table2 || [],
                    institutes: data.Table3 || [],
                    agencies: data.Table4 || [],
                    statuses: data.Table5 || [],
                });
            } catch (error) {
                SwalHelper.error(
                    "Failed to load filters",
                    error?.response?.data?.Message || error?.message || "Please try again."
                );
            } finally {
                setLoadingMasters(false);
            }
        };
        loadFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- cascading options (client-side filtered by parent id) --------------
    const regionOptions = useMemo(
        () => [
            { value: 0, label: "All Regions" },
            ...masters.regions.map((r) => ({ value: toNum(r.RegionID), label: r.RegionName })),
        ],
        [masters.regions]
    );

    const districtOptions = useMemo(
        () => [
            { value: 0, label: "All Districts" },
            ...masters.districts
                .filter((d) => !selected.regionId || toNum(d.RegionID) === selected.regionId)
                .map((d) => ({ value: toNum(d.DistrictID), label: d.DistrictName })),
        ],
        [masters.districts, selected.regionId]
    );

    const talukaOptions = useMemo(
        () => [
            { value: 0, label: "All Talukas" },
            ...masters.talukas
                .filter((t) => !selected.districtId || toNum(t.DistrictID) === selected.districtId)
                .map((t) => ({ value: toNum(t.TalukaID), label: t.TalukaName })),
        ],
        [masters.talukas, selected.districtId]
    );

    const instituteOptions = useMemo(
        () => [
            { value: 0, label: "All Institutes" },
            ...masters.institutes
                .filter(
                    (i) =>
                        (!selected.regionId || toNum(i.RegionID) === selected.regionId) &&
                        (!selected.districtId || toNum(i.DistrictID) === selected.districtId) &&
                        (!selected.talukaId || toNum(i.TalukaID) === selected.talukaId)
                )
                .map((i) => ({
                    value: toNum(i.InstituteID),
                    label: `${i.InstituteName}${i.InstituteCode ? ` (${i.InstituteCode})` : ""}`,
                })),
        ],
        [masters.institutes, selected.regionId, selected.districtId, selected.talukaId]
    );

    const agencyOptions = useMemo(
        () => [
            { value: 0, label: "All Agencies" },
            ...masters.agencies.map((a) => ({
                value: toNum(a.AgencyId),
                label: `${a.AgencyName}${a.AgencyCode ? ` (${a.AgencyCode})` : ""}`,
            })),
        ],
        [masters.agencies]
    );

    const statusOptions = useMemo(
        () => [
            { value: "", label: "All Statuses" },
            ...masters.statuses
                .map((s) => (typeof s === "string" ? s : s.Status))
                .filter(Boolean)
                .map((st) => ({ value: st, label: st })),
        ],
        [masters.statuses]
    );

    // ---- cascade resets on parent change -----------------------------------
    const handleRegionChange = (value) =>
        setSelected((p) => ({ ...p, regionId: toNum(value), districtId: 0, talukaId: 0, instituteId: 0 }));
    const handleDistrictChange = (value) =>
        setSelected((p) => ({ ...p, districtId: toNum(value), talukaId: 0, instituteId: 0 }));
    const handleTalukaChange = (value) =>
        setSelected((p) => ({ ...p, talukaId: toNum(value), instituteId: 0 }));
    const handleInstituteChange = (value) => setSelected((p) => ({ ...p, instituteId: toNum(value) }));
    const handleAgencyChange = (value) => setSelected((p) => ({ ...p, agencyId: toNum(value) }));
    const handleStatusChange = (value) => setSelected((p) => ({ ...p, status: value || "" }));

    const handleReset = () =>
        setSelected({
            agencyId: 0,
            status: "",
            regionId: regionLocked ? userRegionId : 0,
            districtId: districtLocked ? userDistrictId : 0,
            talukaId: 0,
            instituteId: instituteLocked ? userInstituteId : 0,
        });

    const handleSearchClick = () => onSearch?.({ ...selected });

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
                <Filter className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold">Report Filters</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {showAgency && (
                    <DropdownComponent
                        label="Agency"
                        options={agencyOptions}
                        value={selected.agencyId}
                        onChange={handleAgencyChange}
                        loading={loadingMasters}
                    />
                )}

                <DropdownComponent
                    label="Status"
                    options={statusOptions}
                    value={selected.status}
                    onChange={handleStatusChange}
                    loading={loadingMasters}
                />

                {showRegion && (
                    <DropdownComponent
                        label="Region"
                        options={regionOptions}
                        value={selected.regionId}
                        onChange={handleRegionChange}
                        loading={loadingMasters}
                        disabled={regionLocked || loadingMasters}
                    />
                )}

                {showDistrict && (
                    <DropdownComponent
                        label="District"
                        options={districtOptions}
                        value={selected.districtId}
                        onChange={handleDistrictChange}
                        loading={loadingMasters}
                        disabled={districtLocked || loadingMasters}
                    />
                )}

                {showTaluka && (
                    <DropdownComponent
                        label="Taluka"
                        options={talukaOptions}
                        value={selected.talukaId}
                        onChange={handleTalukaChange}
                        loading={loadingMasters}
                    />
                )}

                <DropdownComponent
                    label="Institute"
                    options={instituteOptions}
                    value={selected.instituteId}
                    onChange={handleInstituteChange}
                    loading={loadingMasters}
                    disabled={instituteLocked || loadingMasters}
                />
            </div>

            <div className="flex items-center justify-center gap-3 mt-5">
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={searching || loadingMasters}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                </button>
                <button
                    type="button"
                    onClick={handleSearchClick}
                    disabled={searching || loadingMasters}
                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    <Search className="h-4 w-4" />
                    {searching ? "Searching..." : "Search"}
                </button>
            </div>
        </div>
    );
};

export default STTBatchResultFilters;
