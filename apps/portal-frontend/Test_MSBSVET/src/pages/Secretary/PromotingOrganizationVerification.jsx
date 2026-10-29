import React, { useState, useEffect, useContext } from "react";

import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import agent from "../../lib/api/agent";

import {
  GetPromotingOrganisationDetails,
  GetMasterPromotingType,
  GetMasterPromoterStatus,
  SavePromotionalOrganisationDetailsVerification,
} from "../../Endpoints_All/Secretary/PromotingOrganisation";
import VerificationComponent from "../../Component/formcomponent/VerificationComponent";
import { useRef } from "react";
import { AddressService } from "../../lib/services/addressService";
import { SwalHelper } from "../../utils/swalHelper";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import FormComponent from "../../Component/formcomponent/FormComponent";
import { DateInput } from "../../Component/formcomponent/DateInputComponent";
import UploadPdf from "../../Component/formcomponent/UploadPdf";
import Loader from "../../Component/formcomponent/Loader";
import { getDeviceIP } from "../../utils/CommonHelper";

const PromotingOrganizationVerification = () => {
  const { color } = useContext(ThemeContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ipAddress, setIpAddress] = useState("");

  const instituteId = searchParams.get("instituteId");
  const profileId = searchParams.get("profileId");

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [verificationData, setVerificationData] = useState({
    status: "",
    remark: "",
  });
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    status: "",
    registrationDate: "",
    rigNumber: "",
    address: "",
    pincode: "",
    stateId: "",
    districtId: "",
    talukaId: "",
    cityId: "",
    pan: "",
    certificate: "",
    panDoc: "",
    mobile: "", // ✅ ADD
    email: "", // ✅ ADD
    otherType: "",
  });
  const inspectionRef = useRef();

  const [inspectionData, setInspectionData] = useState({
    status: "",
    remark: "",
  });

  const [dropdowns, setDropdowns] = useState({
    types: [],
    status: [],
    states: [],
    districts: [],
    talukas: [],
    cities: [],
  });

  useEffect(() => {
    if (!instituteId) return;
    loadInitialData();
    fetchIP();
  }, [instituteId]);

   const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
        };
  

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const [typeRes, statusRes, stateRes] = await Promise.all([
        agent.get(GetMasterPromotingType),
        agent.get(GetMasterPromoterStatus),
        AddressService.getStates(),
      ]);

      const payload = {
        instituteId: instituteId,
        exitInstituteID: 0,
        userLoginID: "Secretary",
        pageCode: "PromotingOrganizationVerification",
        itemId: 0,
        ipAddress: ipAddress,
      };

      const detailsRes = await agent.post(
        GetPromotingOrganisationDetails,
        payload,
      );
      const data = detailsRes.data.Data;
      // 🔥 MAP API → VERIFICATION COMPONENT
      const verification = {
        status: data.IsApprovedPromotingOrganisationStatus || "",
        remark: data.RejectResionPromotingOrganisationStatus || "",
      };

      setVerificationData(verification);

      setDropdowns((prev) => ({
        ...prev,
        types: mapOptions(typeRes),
        status: mapOptions(statusRes),
        states: mapOptions(stateRes),
      }));

      const apiFormData = {
        type: data.PromotingOrganizationType?.toString(),
        name: data.NameOfPromotingOrganization,
        status: data.PromotingOrganizationStatusID?.toString(),
        registrationDate: formatDate(
          data.PromotingOrganizationRegistrationDate,
        ),
        rigNumber: data.OrganizatioRegistrationNumber,
        address: data.PromotingOrganizationAddress,
        pincode: data.PromotingOrganizationPincode,
        stateId: data.PromotingOrganizationStateID?.toString(),
        districtId: data.PromotingOrganizationDistrictID?.toString(),
        talukaId: data.PromotingOrganizationTalukaID?.toString(),
        cityId: data.PromotingOrganizationCityID?.toString(),
        pan: data.PAN,
        certificate: data.RegistrationCertificatePath,
        panDoc: data.PANPath,
        mobile: data.AuthorizedRepresentativeMobileNo,
        email: data.AuthorizedRepresentativeEMailID,
        otherType: data.PromotingOrganizationTypeOther,
      };

      const savedData = localStorage.getItem(`promotingOrg_${instituteId}`);

      if (savedData) {
        const parsed = JSON.parse(savedData);


        setFormData(parsed.formData);
        // setFinalStatus(parsed.finalStatus);
        // setRemark(parsed.remark);
      } else {
        setFormData(apiFormData);
      }

      // cascading
      if (data.PromotingOrganizationStateID) {
        loadDistricts(data.PromotingOrganizationStateID);
      }
      if (data.PromotingOrganizationDistrictID) {
        loadTalukas(data.PromotingOrganizationDistrictID);
      }
      if (data.PromotingOrganizationTalukaID) {
        loadCities(data.PromotingOrganizationTalukaID);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async (stateId) => {
    const res = await AddressService.getDistricts();

    const list = res.Data || res.data?.Data || [];

    const filtered = list.filter((x) => x.Group == stateId);

    setDropdowns((prev) => ({
      ...prev,
      districts: mapOptions({ Data: filtered }),
    }));
  };

  const loadTalukas = async (districtId) => {
    const res = await AddressService.getTalukas();

    const list = res.Data || res.data?.Data || [];

    const filtered = list.filter((x) => x.Group == districtId);

    setDropdowns((prev) => ({
      ...prev,
      talukas: mapOptions({ Data: filtered }),
    }));
  };
  const loadCities = async (talukaId) => {
    const res = await AddressService.getCities();

    const list = res.Data || res.data?.Data || [];

    const filtered = list.filter((x) => x.Group == talukaId);

    setDropdowns((prev) => ({
      ...prev,
      cities: mapOptions({ Data: filtered }),
    }));
  };
  const mapOptions = (res) => {
    let list = [];

    if (Array.isArray(res)) {
      list = res;
    } else if (Array.isArray(res?.Data)) {
      list = res.Data;
    } else if (Array.isArray(res?.data?.Data)) {
      list = res.data.Data;
    }

    return list.map((x) => ({
      value: x.Value,
      label: x.Text,
    }));
  };
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1,
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.type) newErrors.type = "Required";
    if (!formData.status) newErrors.status = "Required";
    if (!formData.mobile) newErrors.mobile = "Required";
    if (!formData.email) newErrors.email = "Required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const isInspectionValid = inspectionRef.current.validate();

    if (!validate() || !isInspectionValid) {
      SwalHelper.warning(
        "Validation Error",
        "Please fill all mandatory fields",
      );
      return;
    }

    try {
      const payload = {
        instituteId: instituteId,

        // 🔥 MAIN FORM DATA
        promotingOrganizationType: formData.type,
        promotingOrganizationTypeOther: formData.otherType,
        promotingOrganizationStatus: formData.status,
        nameOfPromotingOrganization: formData.name,
        registrationDate: formData.registrationDate,
        registrationNumber: formData.rigNumber,

        address: formData.address,
        pincode: formData.pincode,
        stateId: formData.stateId,
        districtId: formData.districtId,
        talukaId: formData.talukaId,
        cityId: formData.cityId,

        pan: formData.pan,
        registrationCertificatePath: formData.certificate,
        panPath: formData.panDoc,

        mobile: formData.mobile,
        email: formData.email,

        // 🔥 VERIFICATION (IMPORTANT)
        isApprovedPromotingOrganisationStatus: inspectionData.status,
        rejectReasonPromotingOrganisationStatus: inspectionData.remark,

        // 🔥 SYSTEM
        pageCode: "PromotingOrganizationVerification",
        ipAddress: ipAddress,
      };


      const res = await agent.post(
        SavePromotionalOrganisationDetailsVerification,
        payload,
      );

      if (res?.data?.StatusCode === 200 || res?.data?.Status === "Success") {
        setIsSaved(true); // 🔥 IMPORTANT
        SwalHelper.success("Success", "Saved Successfully");
      } else {
        SwalHelper.error("Error", res?.data?.Message || "Save Failed");
      }
    } catch (err) {
      SwalHelper.error("Error", "Something went wrong");
    }
  };
  const handleNext = () => {
    if (!isSaved) {
      SwalHelper.warning("Warning", "Please save before proceeding");
      return;
    }

    navigate(`/NextPage?instituteId=${instituteId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="p-4">
      {loading && <Loader />}

      <fieldset className="rounded border p-4 bg-white shadow-sm">
        <legend className={`rounded ${color} px-4 py-1 text-white`}>
          Promoting Organisation Verification
        </legend>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {/* Profile ID */}
          <FormComponent
            label="Profile ID"
            value={profileId || instituteId}
            disabled
          />

          {/* Type */}
          <DropdownComponent
            label="Type of Promoting Organisation"
            options={dropdowns.types}
            value={formData.type}
            onChange={(val) => setFormData({ ...formData, type: val })}
            error={errors.type}
            required
          />

          {formData.type === "11" && (
            <FormComponent
              label="Other Type of Promoting Organisation"
              value={formData.otherType || ""}
              onChange={(val) => setFormData({ ...formData, otherType: val })}
            />
          )}

          {/* Status */}
          <DropdownComponent
            label="Promoting Organisation Status"
            options={dropdowns.status}
            value={formData.status}
            onChange={(val) => setFormData({ ...formData, status: val })}
            error={errors.status}
            required
          />

          {/* Name */}
          <FormComponent
            label="Name of Promoting Organisation"
            value={formData.name}
            onChange={(val) => setFormData({ ...formData, name: val })}
          />

          {/* Registration Date */}
          <DateInput
            label="Registration Date"
            value={formData.registrationDate}
            onChange={(val) =>
              setFormData({ ...formData, registrationDate: val })
            }
          />

          {/* RIG Number */}
          <FormComponent
            label="Registration / Incorporation Number / GR Number"
            value={formData.rigNumber}
            onChange={(val) => setFormData({ ...formData, rigNumber: val })}
          />

          {/* Address */}
          <FormComponent
            label="Address"
            value={formData.address}
            onChange={(val) => setFormData({ ...formData, address: val })}
          />

          {/* Pincode */}
          <FormComponent
            label="Pin Code"
            value={formData.pincode}
            onChange={(val) => setFormData({ ...formData, pincode: val })}
          />

          {/* State */}
          <DropdownComponent
            label="State"
            options={dropdowns.states}
            value={formData.stateId}
            onChange={(val) => {
              setFormData({
                ...formData,
                stateId: val,
                districtId: "",
                talukaId: "",
                cityId: "",
              });
              loadDistricts(val);
            }}
          />

          {/* District */}
          <DropdownComponent
            label="District"
            options={dropdowns.districts}
            value={formData.districtId}
            onChange={(val) => {
              setFormData({
                ...formData,
                districtId: val,
                talukaId: "",
                cityId: "",
              });
              loadTalukas(val);
            }}
          />

          {/* Taluka */}
          <DropdownComponent
            label="Taluka"
            options={dropdowns.talukas}
            value={formData.talukaId}
            onChange={(val) => {
              setFormData({
                ...formData,
                talukaId: val,
                cityId: "",
              });
              loadCities(val);
            }}
          />

          {/* City */}
          <DropdownComponent
            label="City"
            options={dropdowns.cities}
            value={formData.cityId}
            onChange={(val) => setFormData({ ...formData, cityId: val })}
          />

          {/* PAN */}
          <FormComponent
            label="PAN of Promoting Organisation"
            value={formData.pan}
            onChange={(val) => setFormData({ ...formData, pan: val })}
          />

          {/* Mobile */}
          <FormComponent
            label="Mobile Number"
            value={formData.mobile || ""}
            onChange={(val) => setFormData({ ...formData, mobile: val })}
            error={errors.mobile}
            required
          />

          {/* Email */}
          <FormComponent
            label="Email ID"
            value={formData.email || ""}
            onChange={(val) => setFormData({ ...formData, email: val })}
            error={errors.email}
            required
          />
        </div>

        {/* ================= UPLOAD SECTION ================= */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <UploadPdf
            label="Upload Registration Certificate"
            uniquefilepath={formData.certificate}
            onFileChange={(file) =>
              setFormData({
                ...formData,
                certificate: file.filePath,
              })
            }
          />

          <UploadPdf
            label="Upload PAN Card"
            uniquefilepath={formData.panDoc}
            onFileChange={(file) =>
              setFormData({
                ...formData,
                panDoc: file.filePath,
              })
            }
          />
        </div>
        <VerificationComponent
          ref={inspectionRef}
          instituteId={instituteId}
          pageCode="PromotingOrganizationVerification"
          onChange={setInspectionData}
          readOnly={false}
         
          initialData={verificationData}
          loading={loading}
        />

        <div className="flex justify-center gap-8 mt-6 ">
          {/* Back */}
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={handleBack}
          >
            Back
          </button>

          {/* Save */}
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSave}
          >
            Save
          </button>

          {/* Next */}
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </fieldset>
    </div>
  );
};

export default PromotingOrganizationVerification;
