import React, { useEffect, useState } from "react";
import FormComponent from "./FormComponent";
import DropdownComponent from "./DropdownComponent";
import agent from "../../lib/api/agent";

import { GetMasterTableList } from "../../Endpoints_All/Base/masterData";
import {
  GetMasterDistrict,
  GetMasterTaluka,
  GetMasterCity,
  GetPincodeData,
} from "../../Endpoints_All/Base/location";

const GET_STATES_API = `${GetMasterTableList}?TableName=Master_State&DataValueField=StateID&DataTextField=State&HasSelect=true`;

const AddressSection = ({
  formData = {},
  errors = {},
  loading = {},
  states,
  districts,
  talukas,
  cities,
  onFieldChange,
  onPincodeChange,
  isFieldEditable = () => true,
  showAllFields = true,
  className = "",
  addressLabel = "Address",
  onStateChange,
  onDistrictChange,
  onTalukaChange,
  onCityChange,
  showOtherCity = false,
  otherCityValue = "",
  onOtherCityChange,
}) => {
  /* ---------------- INTERNAL MASTER STATE ---------------- */

  const [internalStates, setInternalStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [allTalukas, setAllTalukas] = useState([]);
  const [allCities, setAllCities] = useState([]);

  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredTalukas, setFilteredTalukas] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  const [internalLoading, setInternalLoading] = useState({
    states: false,
    districts: false,
    talukas: false,
    cities: false,
    pincodeLookup: false,
  });

  /* ---------------- FETCH MASTER DATA (AUTO) ---------------- */

  useEffect(() => {
    if (!states) fetchStates();
    if (!districts) fetchDistricts();
    if (!talukas) fetchTalukas();
    if (!cities) fetchCities();
  }, []);

  const fetchStates = async () => {
    setInternalLoading((p) => ({ ...p, states: true }));
    try {
      const res = await agent.get(GET_STATES_API);
      if (res.data.Status === "Success") {
        setInternalStates(res.data.Data.filter((x) => x.Value !== "-1"));
      }
    } finally {
      setInternalLoading((p) => ({ ...p, states: false }));
    }
  };

  const fetchDistricts = async () => {
    const res = await agent.get(GetMasterDistrict);
    if (res.data.Status === "Success") {
      setAllDistricts(res.data.Data);
    }
  };

  const fetchTalukas = async () => {
    const res = await agent.get(GetMasterTaluka);
    if (res.data.Status === "Success") {
      setAllTalukas(res.data.Data);
    }
  };

  const fetchCities = async () => {
    const res = await agent.get(GetMasterCity);
    if (res.data.Status === "Success") {
      setAllCities(res.data.Data);
    }
  };

  const formatOption = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      value: item.Value?.toString(),
      label: item.Text,
    }));
  };

  const handleStateChangeInternal = (value) => {
    const filtered = allDistricts.filter((d) => d.Group === value);
    setFilteredDistricts(filtered);
    setFilteredTalukas([]);
    setFilteredCities([]);

    onStateChange?.(value);
    onFieldChange?.("CityID", value ? parseInt(value) : "");
  };

  const handleDistrictChangeInternal = (value) => {
    const filtered = allTalukas.filter((t) => t.Group === value);
    setFilteredTalukas(filtered);
    setFilteredCities([]);

    onDistrictChange?.(value);
    onFieldChange?.("DistrictID", parseInt(value));
  };

  const handleTalukaChangeInternal = (value) => {
    const filtered = allCities.filter((c) => c.Group === value);
    setFilteredCities(filtered);

    onTalukaChange?.(value);
    onFieldChange?.("TalukaID", parseInt(value));
  };

  const handleCityChangeInternal = (value) => {
    onCityChange?.(value);
    onFieldChange?.("CityID", parseInt(value));
  };

  const handlePincodeChangeWrapper = async (field, value) => {
    onFieldChange?.(field, value);

    if (value.length !== 6) return;

    setInternalLoading((p) => ({ ...p, pincodeLookup: true }));

    try {
      const res = await agent.get(`${GetPincodeData}?Pincode=${value}`);
      if (res.data.Status === "Success") {
        const data = res.data.Data;

        handleStateChangeInternal(data.StateID.toString());
        handleDistrictChangeInternal(data.DistrictID.toString());
        handleTalukaChangeInternal(data.TalukaID.toString());

        onFieldChange?.("StateID", data.StateID);
        onFieldChange?.("DistrictID", data.DistrictID);
        onFieldChange?.("TalukaID", data.TalukaID);
        onFieldChange?.("CityID", data.CityID);
      }
    } finally {
      setInternalLoading((p) => ({ ...p, pincodeLookup: false }));
    }

    onPincodeChange?.(field, value);
  };

  const finalStates = states || internalStates;
  const finalDistricts = districts || filteredDistricts;
  const finalTalukas = talukas || filteredTalukas;
  const finalCities = cities || filteredCities;

  const finalLoading = { ...internalLoading, ...loading };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-4">
          <FormComponent
            label={addressLabel}
            name="InstituteAddress"
            value={formData?.InstituteAddress || ""}
            onChange={(v) =>
              onFieldChange?.("InstituteAddress", v?.toUpperCase())
            }
            required
            error={errors?.InstituteAddress}
            disabled={!isFieldEditable("InstituteAddress")}
          />
        </div>

        <div className="md:col-span-1">
          <FormComponent
            label="Pin Code"
            name="PinCode"
            value={formData?.PinCode || ""}
            maxLength={6}
            onlydigits
            required
            onChange={(v) => handlePincodeChangeWrapper("PinCode", v)}
            error={errors?.PinCode}
            disabled={!isFieldEditable("PinCode")}
          />
        </div>
      </div>

      {showAllFields && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DropdownComponent
            label="State"
            options={formatOption(finalStates)}
            value={formData?.StateID?.toString()}
            onChange={handleStateChangeInternal}
            loading={finalLoading.states}
            disabled={!isFieldEditable("StateID")}
            required
          />

          <DropdownComponent
            label="District"
            options={formatOption(finalDistricts)}
            value={formData?.DistrictID?.toString()}
            onChange={handleDistrictChangeInternal}
            disabled={!formData?.StateID}
            required
          />

          <DropdownComponent
            label="Taluka"
            options={formatOption(finalTalukas)}
            value={formData?.TalukaID?.toString()}
            onChange={handleTalukaChangeInternal}
            disabled={!formData?.DistrictID}
            required
          />

          <DropdownComponent
            label="City / Village"
            options={formatOption(finalCities)}
            value={formData?.CityID?.toString()}
            onChange={handleCityChangeInternal}
            disabled={!formData?.TalukaID}
            required
          />
        </div>
      )}

      {(showOtherCity ||
        formData?.CityID === 9999999 ||
        formData?.CityID === "9999999") && (
        <FormComponent
          label="Other City"
          name="OtherCity"
          value={otherCityValue || formData?.OtherCity || ""}
          onChange={(v) =>
            onOtherCityChange
              ? onOtherCityChange(v)
              : onFieldChange?.("OtherCity", v?.toUpperCase())
          }
          disabled={!isFieldEditable("OtherCity")}
        />
      )}
    </div>
  );
};

export default AddressSection;
