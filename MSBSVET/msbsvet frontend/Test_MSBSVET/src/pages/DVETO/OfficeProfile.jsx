import React, { useContext, useState, useEffect, useCallback } from "react";
import { ThemeContext } from "../../Component/Context/ThemeContext";

import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import FormComponent from "../../Component/formcomponent/FormComponent";


import { FaUniversity } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import { useLoading } from "../../Hooks/useLoading";
import { useCascadingAddress } from "../../lib/hooks/useCascadingAddress";
import Loader from "../../Component/formcomponent/Loader";
import {
  useStates,
  useDistricts,
  useTalukas,
  useCities,
  usePincodeLookup,
} from "../../lib/hooks/useAddressQueries";

import agent from "../../lib/api/agent";

import {
  GetOfficeDetails,
  SaveOfficeDetails,
} from "../../Endpoints_All/Base/DVETO";

import { formatOptions, getDeviceIP } from "../../utils/CommonHelper";
import { SwalHelper } from "../../utils/swalHelper";
import { DateInput } from "../../Component/formcomponent/DateInputComponent";
import { useAuth } from "../../Hooks/AuthContext";

const locationCategoryOptions = [{ id: "1", name: "Urban" }];

const staticOfficeProfile = {
  OfficeID: 12051,
  OfficeCode: "DVETO01",
  OfficeName: "DVETO Training Office",
  OfficeEstablishmentDate: "2015-06-10",
  OfficeAddress: "Mumbai Training Office",
  PinCode: "400001",
  StateID: "27",
  DistrictID: "521",
  TalukaID: "3001",
  CityID: "4001",
  LocationCategory: "1",
  PhoneNo: "9876543210",
  EMailID: "office@test.com",
  Website: "https://dvet.gov.in",
  Latitude: "19.0760",
  Longitude: "72.8777",
};

const formatDateForUI = (dateString) => {
  if (!dateString) return "";

  const d = new Date(dateString);

  if (d.getFullYear() < 1753) {
    return "";
  }

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
};
const OfficeProfile = () => {
  const { color } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const { userInfo } = useAuth();

  const OFFICE_ID = userInfo?.UserID;
  const USER_LOGIN_ID = userInfo?.UserLoginID;

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [latLongInput, setLatLongInput] = useState("");

  const [showOtherCity, setShowOtherCity] = useState(false);
  const [isAutoFillingAddress, setIsAutoFillingAddress] = useState(false);

  useCascadingAddress(formData, setFormData, isAutoFillingAddress);

  const { data: states, loading: stateLoading } = useStates();
  const { data: districts, loading: districtsLoading } = useDistricts(
    formData.StateID,
  );
  const { data: talukas, loading: talukaLoading } = useTalukas(
    formData.DistrictID,
  );
  const { data: cities, loading: cityLoading } = useCities(formData.TalukaID);

  // FORMAT OPTIONS FOR DROPDOWNS
  const stateOptions = formatOptions(states);
  const districtOptions = formatOptions(districts);
  const talukaOptions = formatOptions(talukas);
  const cityOptions = formatOptions(cities);

  const { getPincode } = usePincodeLookup();

  useEffect(() => {
    if (!OFFICE_ID || !USER_LOGIN_ID) {
      return;
    }


    const fetchOfficeDetails = async () => {
      try {
        startLoading();

        //console.log("API URL:", `${GetOfficeDetails}/${OFFICE_ID}/${USER_LOGIN_ID}`,);


        const response = await agent.get(
          `${GetOfficeDetails}/${OFFICE_ID}/${USER_LOGIN_ID}`,
        );

        //console.log("GET OFFICE RESPONSE+++++++++++++++++++++++++++++++++++:", response);
        const data = response?.data;

        if (data) {
          setFormData({
            OfficeID: data.OfficeID || "",
            OfficeCode: data.OfficeCode || "",
              OfficeName: data.OfficeName || "",
            OfficeEstablishmentDate:
              formatDateForUI(data.EstablishmentDate),

            OfficeAddress: data.OfficeAddress || "",
            PinCode: data.PinCode || "",

            StateID: data.StateID ? data.StateID.toString() : "",
            DistrictID: data.DistrictID ? data.DistrictID.toString() : "",
            TalukaID: data.TalukaID ? data.TalukaID.toString() : "",
            CityID:
              data.CityID && data.CityID !== -1 ? data.CityID.toString() : "",

            OtherCity: data.OtherCity || "",

            LocationCategoryID: data.LocationCategoryID || "",

            STD: data.STD || "",
            PhoneNo: data.PhoneNo || "",
            EMailID: data.EMailID || "",
            Website: data.Website || "",

            Latitude: data.Latitude || "",
            Longitude: data.Longitude || "",
          });

          setLatLongInput(`${data.Latitude || ""}, ${data.Longitude || ""}`);

          if (data.CityID === 9999999) {
            setShowOtherCity(true);
          }
        }
      } catch (error) {
        SwalHelper.error("Failed to load office details");
      } finally {
        stopLoading();
      }
    };

    fetchOfficeDetails();
  }, [OFFICE_ID, USER_LOGIN_ID]);

  const convertToApiDate = (dateStr) => {
    if (!dateStr) return null;

    const [dd, mm, yyyy] = dateStr.split("/");

    return `${yyyy}-${mm}-${dd}`;
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleChange = useCallback((value, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ? value.toString() : "",
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }, []);

  const handleCityChange = (value) => {
    const isOther = value === "9999999";
    setShowOtherCity(isOther);

    setFormData((prev) => ({
      ...prev,
      CityID: value ? value.toString() : "",
    }));
  };

  const handlePincodeChange = useCallback(async (value) => {
    const pin = value.replace(/\D/g, "").slice(0, 6);

    setFormData((p) => ({ ...p, PinCode: pin }));

    if (pin.length !== 6) return;

    try {
      setIsAutoFillingAddress(true);

      const res = await getPincode(pin);

      if (res.Status !== "Success") return;

      const { StateID, DistrictID, TalukaID, CityID } = res.Data;

      setFormData((prev) => ({
        ...prev,
        PinCode: pin,
        StateID,
        DistrictID,
        TalukaID,
        CityID,
      }));
    } catch {
      SwalHelper.error("Invalid Pincode");
    } finally {
      setTimeout(() => setIsAutoFillingAddress(false), 0);
    }
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.OfficeEstablishmentDate)
      newErrors.OfficeEstablishmentDate = "Establishment date required";

    if (!formData.OfficeAddress) newErrors.OfficeAddress = "Address required";

    if (!formData.PinCode) newErrors.PinCode = "Pin code required";
    else if (!/^[0-9]{6}$/.test(formData.PinCode))
      newErrors.PinCode = "Enter valid 6-digit pin code";

    if (!formData.StateID || formData.StateID === "-1")
      newErrors.StateID = "State required";

    if (!formData.DistrictID || formData.DistrictID === "-1")
      newErrors.DistrictID = "District required";

    if (!formData.TalukaID || formData.TalukaID === "-1")
      newErrors.TalukaID = "Taluka required";

    if (!formData.CityID || formData.CityID === "-1")
      newErrors.CityID = "City required";

    if (!formData.PhoneNo) newErrors.PhoneNo = "Phone number required";
    else if (!/^[0-9]{10}$/.test(formData.PhoneNo))
      newErrors.PhoneNo = "Enter valid 10-digit phone number";

    if (!formData.EMailID) newErrors.EMailID = "Email required";
    else if (
      !/^([a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,6})$/i.test(formData.EMailID)
    )
      newErrors.EMailID = "Enter valid email address";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleSave = async () => {
    if (!validate()) {
      SwalHelper.warning(
        "Validation Error",
        "Please fill all required fields correctly",
      );
      return;
    }

    try {
      startLoading();

      const deviceIP = await getDeviceIP();

      // FIND SELECTED DROPDOWN VALUES
      const selectedState = stateOptions.find(
        (s) => s.value.toString() === formData.StateID,
      );

      const selectedDistrict = districtOptions.find(
        (d) => d.value.toString() === formData.DistrictID,
      );

      const selectedTaluka = talukaOptions.find(
        (t) => t.value.toString() === formData.TalukaID,
      );

      const selectedCity = cityOptions.find(
        (c) => c.value.toString() === formData.CityID,
      );

      const payload = {
        OfficeID: OFFICE_ID,
        OfficeCode: formData.OfficeCode,

        OfficeName: formData.OfficeName,
        EstablishmentDate: convertToApiDate(
          formData.OfficeEstablishmentDate
        ),
        OfficeAddress: formData.OfficeAddress,
        PinCode: formData.PinCode,

        StateID: Number(formData.StateID),
        State: selectedState?.label || "",

        DistrictID: Number(formData.DistrictID),
        District: selectedDistrict?.label || "",

        TalukaID: Number(formData.TalukaID),
        Taluka: selectedTaluka?.label || "",

        CityID: Number(formData.CityID),
        City: selectedCity?.label || "",

        OtherCity: formData.OtherCity || "",

        LocationCategoryID: 1,
        LocationCategory: "Urban",

        STD: formData.STD || "",
        PhoneNo: formData.PhoneNo,
        EMailID: formData.EMailID,
        Website: formData.Website,

        ResolutionPath: "",

        Latitude: formData.Latitude,
        Longitude: formData.Longitude,

        UserLoginID: USER_LOGIN_ID,
        IPAddress: deviceIP,
      };


      const response = await agent.post(SaveOfficeDetails, payload);


      stopLoading();

      await SwalHelper.success("Saved", "Office Profile saved successfully");
    } catch (error) {
      stopLoading();
      SwalHelper.error("Failed to save Office Profile");
    }
  };
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div className="w-full p-4">
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          <FaUniversity className="mr-2 text-white" />
          Office Profile
        </legend>

        <form className="w-full px-4 pb-3 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <FormComponent
              label="Office Code"
              value={formData.OfficeCode || ""}
              disabled
              readOnly
            />

            <div className="md:col-span-3">
              <FormComponent
                label="Office Name"
                value={formData.OfficeName || ""}
                disabled
                readOnly
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <DateInput
              label="Office Establishment Date"
              required
              value={formData.OfficeEstablishmentDate || ""}
              onChange={(v) => handleInputChange("OfficeEstablishmentDate", v)}
              error={errors.OfficeEstablishmentDate}
              maxDate={new Date()}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div className="md:col-span-3">
              <FormComponent
                label="Address of Office"
                value={formData.OfficeAddress || ""}
                required
                onChange={(v) =>
                  handleInputChange("OfficeAddress", v.toUpperCase())
                }
                error={errors.OfficeAddress}
              />
            </div>

            <FormComponent
              label="Pin Code"
              value={formData.PinCode || ""}
              onChange={handlePincodeChange}
              required
              error={errors.PinCode}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <DropdownComponent
              label="State"
              options={stateOptions}
              value={formData.StateID ? formData.StateID.toString() : ""}
              onChange={(v) => handleChange(v, "StateID")}
              required
              loading={stateLoading}
              error={errors.StateID}
            />

            <DropdownComponent
              label="District"
              options={districtOptions}
              value={formData.DistrictID ? formData.DistrictID.toString() : ""}
              required
              onChange={(v) => handleChange(v, "DistrictID")}
              loading={districtsLoading}
              error={errors.DistrictID}
            />

            <DropdownComponent
              label="Taluka"
              options={talukaOptions}
              required
              value={formData.TalukaID ? formData.TalukaID.toString() : ""}
              onChange={(v) => handleChange(v, "TalukaID")}
              loading={talukaLoading}
              error={errors.TalukaID}
            />

            <DropdownComponent
              label="City / Village"
              options={cityOptions}
              required
              value={
                formData.CityID && formData.CityID !== -1
                  ? formData.CityID.toString()
                  : ""
              }
              onChange={handleCityChange}
              loading={cityLoading}
              error={errors.CityID}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            {showOtherCity && (
              <FormComponent
                label="Other City / Village"
                value={formData.OtherCity || ""}
                required
                onChange={(v) =>
                  handleInputChange("OtherCity", v.toUpperCase())
                }
              />
            )}

            <FormComponent
              required
              label="Location Category"
              value="Urban"
              disabled
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <FormComponent
              label="Phone No."
              value={formData.PhoneNo || ""}
              required
              maxLength={10}
              onChange={(v) => {
                const onlydigits = v.replace(/\D/g, "").slice(0, 10);
                handleInputChange("PhoneNo", onlydigits);
              }}
              error={errors.PhoneNo}
            />

            <FormComponent
              label="E-Mail ID"
              value={formData.EMailID || ""}
              required
              onChange={(v) => handleInputChange("EMailID", v)}
              error={errors.EMailID}
            />

            <FormComponent
              label="Website"
              value={formData.Website || ""}
              onChange={(v) => handleInputChange("Website", v)}
            />
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12 md:col-span-5">
              <div className="h-[360px] flex flex-col gap-3">
                <FormComponent
                  label="Latitude, Longitude"
                  value={latLongInput || ""}
                  required
                  onChange={(v) => {
                    const cleaned = v.replace(/[^0-9.,-]/g, "");
                    setLatLongInput(cleaned);

                    const [lat, lng] = cleaned.split(",");

                    setFormData((p) => ({
                      ...p,
                      Latitude: lat?.trim() || "",
                      Longitude: lng?.trim() || "",
                    }));
                  }}
                />

                <div className="flex-1 bg-gray-50 border border-gray-300 rounded p-3 text-xs overflow-y-auto">
                  <h4 className="font-semibold mb-2 sticky top-0 bg-gray-50">
                    Instructions
                  </h4>

                  <ul className="list-disc ml-5 space-y-2">
                    <li>
                      <a
                        href="https://www.google.com/maps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Click Here
                      </a>{" "}
                      to open Google Maps
                    </li>

                    <li>
                      Click on Google Map to precisely locate your office and
                      then right click
                    </li>

                    <li>Click Latitude, Longitude shown on map</li>

                    <li>Paste the copied value</li>

                    <li>
                      <a href="#" className="text-blue-600 underline">
                        Click Here
                      </a>{" "}
                      to see video
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-7">
              <div className="h-[360px] border border-gray-300 rounded overflow-hidden bg-white">
                {formData.Latitude && formData.Longitude ? (
                  <iframe
                    title="Google Map"
                    className="w-full h-full"
                    frameBorder="0"
                    src={`https://www.google.com/maps?q=${formData.Latitude},${formData.Longitude}&z=15&output=embed`}
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                    Map will appear here after entering Latitude & Longitude
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-4 flex justify-center gap-4">
            <button
              type="button"
              className="bg-[#00c3f9] text-white px-6 py-2 rounded"
              onClick={() => window.history.back()}
            >
              Back
            </button>

            <button
              type="button"
              className="bg-[#28a745] text-white px-6 py-2 rounded"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </form>
      </fieldset>
    </div>
  );
};

export default OfficeProfile;
