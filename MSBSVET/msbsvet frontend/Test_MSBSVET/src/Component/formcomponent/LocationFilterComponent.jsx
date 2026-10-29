// LocationFilter.jsx

import React, { useEffect, useState } from "react";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import { AddressService } from "../../lib/services/addressService";
import { useAuth } from "../../Hooks/AuthContext";

const LocationFilter = ({
    value,
    onChange,
    onReady,        // ← fires after initialize() completes with resolved location values
    layoutClass = "grid grid-cols-1 md:grid-cols-3 gap-4"
}) => {
   const {userInfo} = useAuth();
    const userTypeID = Number(userInfo?.UserTypeID || 0); 
    const msbsvetMtId = userInfo?.MsbsvetMtId || 0;

    const [regionOptions, setRegionOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [talukaOptions, setTalukaOptions] = useState([]);

    const [allDistricts, setAllDistricts] = useState([]);
    //const [allTalukas, setAllTalukas] = useState([]);

    const [loadingDropdowns, setLoadingDropdowns] = useState({
        regions: false,
        districts: false,
        talukas: false,
    });

    const [isReadOnly, setIsReadOnly] = useState({
        region: false,
        district: false,
        taluka: false,
    });

    useEffect(() => {
        initialize();
         
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initialize = async () => {

        await fetchRegions();

        //const districts = await fetchAllDistricts();
        //const talukas = await fetchAllTalukas();

        /*
            Regional Login (13)
            Region    → Locked
            District  → Editable
            Taluka    → Editable
        */
        if (userTypeID === 13) {
            const regionID = msbsvetMtId?.toString();

            onChange({
                RegionID: regionID,
                DistrictID: "",
                TalukaID: "",
            });

            setIsReadOnly({
                region: true,
                district: false,
                taluka: false,
            });

            //filterDistricts(regionID, districts);
            await filterDistricts(regionID);

            // ✅ Notify parent with resolved values
            onReady?.({
                RegionID: regionID,
                DistrictID: "",
                TalukaID: "",
            });
        }

        /*
            District Login (14)
            Region    → Locked
            District  → Locked
            Taluka    → Editable
        */
        else if (userTypeID === 14) {
            const districtID = msbsvetMtId?.toString();

            //const districtData = districts.find(
            //    x => x.DistrictID?.toString() === districtID
            //);

            //const regionID = districtData?.RegionID?.toString() || "";

            // Get all districts
            const districtResponse = await AddressService.getRegionDistricts(null);

            // Find logged-in district
            const districtData = districtResponse?.Data?.find(
                item => item.Value?.toString() === districtID
            );

            // RegionID is stored in Group
            const regionID = districtData?.Group?.toString() || "";

            onChange({
                RegionID: regionID,
                DistrictID: districtID,
                TalukaID: "",
            });

            setIsReadOnly({
                region: true,
                district: true,
                taluka: false,
            });

            //filterDistricts(regionID, districts);
            await filterDistricts(regionID);
            //filterTalukas(districtID, talukas);
            await filterTalukas(districtID);

            // ✅ Notify parent with resolved values
            onReady?.({
                RegionID: regionID,
                DistrictID: districtID,
                TalukaID: "",
            });
        }

        /*
            Normal Login
            All Editable — notify parent with empty values
        */
        else {
            onReady?.({
                RegionID: "",
                DistrictID: "",
                TalukaID: "",
            });
        }
    };

    // ─── Regions ─────────────────────────────────────────────────────────────

    const fetchRegions = async () => {
        try {
            setLoadingDropdowns(prev => ({
                ...prev,
                regions: true
            }));

            const response = await AddressService.getRegions();

            const options = response?.Data
                ?.filter(item => item.Value !== "-1")   // Remove Select/NA
                ?.map(item => ({
                    value: item.Value?.toString(),
                    label: item.Text,
                })) || [];

            setRegionOptions(options);

           

        } catch (error) {
            setRegionOptions([]);
        } finally {
            setLoadingDropdowns(prev => ({
                ...prev,
                regions: false
            }));
        }
    };

    // ─── Districts ────────────────────────────────────────────────────────────

    const fetchAllDistricts = async () => {
        try {
            setLoadingDropdowns(prev => ({ ...prev, districts: true }));

            const response = await AddressService.getDistricts();
            const districts = response?.Data || [];

            setAllDistricts(districts);
            return districts; // ✅ return raw data for immediate use in initialize
        } finally {
            setLoadingDropdowns(prev => ({ ...prev, districts: false }));
        }
    };

    /**
     * @param {string} regionID
     * @param {Array}  districts  - pass fresh array from fetch; falls back to allDistricts state
     */
    //const filterDistricts = (regionID, districts = allDistricts) => {
    //    if (!regionID) {
    //        setDistrictOptions([]);
    //        return;
    //    }

    //    const filtered = districts.filter(
    //        x => x.Value === regionID?.toString()
    //    );

    //    const options = filtered.map(item => ({
    //        value: item.DistrictID,
    //        label: item.District,
    //    }));

    //    setDistrictOptions(options);
    //};

    const filterDistricts = async (regionID) => {
        if (!regionID) {
            setDistrictOptions([]);
            return;
        }

        try {
            setLoadingDropdowns(prev => ({
                ...prev,
                districts: true,
            }));

            const response = await AddressService.getRegionDistricts(regionID);

            const options = response?.Data
                ?.filter(item =>
                    item.Group?.toString() === regionID?.toString()
                )
                ?.map(item => ({
                    value: item.Value?.toString(), // DistrictID
                    label: item.Text,              // District Name
                })) || [];

            setDistrictOptions(options);

        } catch (error) {
            setDistrictOptions([]);
        } finally {
            setLoadingDropdowns(prev => ({
                ...prev,
                districts: false,
            }));
        }
    };

    // ─── Talukas ─────────────────────────────────────────────────────────────

    //const fetchAllTalukas = async () => {
    //    try {
    //        setLoadingDropdowns(prev => ({ ...prev, talukas: true }));

    //        const response = await AddressService.getTalukas();
    //        const talukas = response?.Data || [];

    //        setAllTalukas(talukas);
    //        return talukas; // ✅ return raw data for immediate use in initialize
    //    } finally {
    //        setLoadingDropdowns(prev => ({ ...prev, talukas: false }));
    //    }
    //};

    /**
     * @param {string} districtID
     * @param {Array}  talukas  - pass fresh array from fetch; falls back to allTalukas state
     */
    //const filterTalukas = (districtID, talukas = allTalukas) => {
    //    if (!districtID) {
    //        setTalukaOptions([]);
    //        return;
    //    }

    //    const filtered = talukas.filter(
    //        x => x.DistrictID?.toString() === districtID?.toString()
    //    );

    //    const options = filtered.map(item => ({
    //        value: item.TalukaID.toString(),
    //        label: item.Taluka,
    //    }));

    //    setTalukaOptions(options);
    //};

    const filterTalukas = async (districtID) => {
        if (!districtID) {
            setTalukaOptions([]);
            return;
        }

        try {
            setLoadingDropdowns(prev => ({
                ...prev,
                talukas: true,
            }));

            const response = await AddressService.getDistrictTalukas(districtID);

            const options = response?.Data
                ?.filter(item =>
                    item.Group?.toString() === districtID?.toString()
                )
                ?.map(item => ({
                    value: item.Value?.toString(),   // TalukaID
                    label: item.Text,               // Taluka Name
                })) || [];

            setTalukaOptions(options);

        } catch (error) {
            setTalukaOptions([]);
        } finally {
            setLoadingDropdowns(prev => ({
                ...prev,
                talukas: false,
            }));
        }
    };

    // ─── Dropdown Change Handlers ─────────────────────────────────────────────

    const handleDropdownChange = async (field, selectedValue) => {

        if (field === "RegionID") {
            onChange({
                RegionID: selectedValue,
                DistrictID: "",
                TalukaID: "",
            });
            filterDistricts(selectedValue);
            setTalukaOptions([]);
        }

        else if (field === "DistrictID") {
            onChange({
                ...value,
                DistrictID: selectedValue,
                TalukaID: "",
            });
            //filterTalukas(selectedValue);
            await filterTalukas(selectedValue);
        }

        else {
            onChange({
                ...value,
                TalukaID: selectedValue,
            });
        }
    };

    // ─── Re-filter when master data loads (covers value prop set by parent) ───

    //useEffect(() => {
    //    if (value.RegionID && allDistricts.length > 0) {
    //        filterDistricts(value.RegionID);
    //    }
    //    // eslint-disable-next-line react-hooks/exhaustive-deps
    //}, [value.RegionID, allDistricts]);
    useEffect(() => {
        if (value.RegionID) {
            filterDistricts(value.RegionID);
        }
    }, [value.RegionID]);
    //useEffect(() => {
    //    if (value.DistrictID && allTalukas.length > 0) {
    //        filterTalukas(value.DistrictID);
    //    }
    //    // eslint-disable-next-line react-hooks/exhaustive-deps
    //}, [value.DistrictID, allTalukas]);

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className={layoutClass}>


           
            {/*<DropdownComponent*/}
            {/*    label="Region"*/}
            {/*    name="RegionID"*/}
            {/*    options={regionOptions}*/}
            {/*    value={value.RegionID?.toString()}*/}
            {/*    value={*/}
            {/*        regionOptions.find(*/}
            {/*            x => x.value === value.RegionID?.toString()*/}
            {/*        ) || null*/}
            {/*    }*/}
            {/*    onChange={(val) => handleDropdownChange("RegionID", val)}*/}
            {/*    loading={loadingDropdowns.regions}*/}
            {/*    disabled={isReadOnly.region}*/}


            {/*/>*/}

            <DropdownComponent
                label="Region"
                name="RegionID"
                options={regionOptions}
                value={
                    value.RegionID?.toString()
                }
                
                onChange={(val) => handleDropdownChange("RegionID", val)}
                loading={loadingDropdowns.regions}
                disabled={isReadOnly.region}
            />

            <DropdownComponent
                label="District"
                name="DistrictID"
                options={districtOptions}
                value={value.DistrictID?.toString()}
                onChange={(val) => handleDropdownChange("DistrictID", val)}
                loading={loadingDropdowns.districts}
                disabled={isReadOnly.district || !value.RegionID}
            />

            <DropdownComponent
                label="Taluka"
                name="TalukaID"
                options={talukaOptions}
                value={value.TalukaID?.toString()}
                onChange={(val) => handleDropdownChange("TalukaID", val)}
                loading={loadingDropdowns.talukas}
                disabled={isReadOnly.taluka || !value.DistrictID}
            />

        </div>
    );
};

export default LocationFilter;