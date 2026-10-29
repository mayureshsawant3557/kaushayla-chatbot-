import { useEffect, useState } from "react";
import PopUp from "./PromotingOrganizationDetailsPopUp";
import { SwalHelper } from "../../utils/swalHelper";
import { getDeviceIP } from "../../utils/CommonHelper";

import {
  GetPromotingOrganisationDetails,
  GetInstituteIdByCode,
  GetStaffSummary,
} from "../../Endpoints_All/Registration/SDIRegistration";
import agent from "../../lib/api/agent";
import FormComponent from "../formcomponent/FormComponent";
import VerifiedIcon from "../../assets/VerifiedIcon.jpg";
import NotVerifiedIcon from "../../assets/NotVerifiedIcon.jpg";
import { IsInstituteEligibleForApplyWithPromotingOgranisation } from "../../Endpoints_All/Registration/registration";
import publicAgent from "../../lib/api/publicAgent";

function PromotingOrganizationDetails({
  InstituteDetails,
  isExisting,
  setInstituteEntity,
  setPromotingRepData,
  isModeSelected,
  setPromotingOrgLocation,
}) {
  const [orgId, setOrgId] = useState("");
  const [organizationDetails, setOrganizationDetails] = useState({});
  const [staffDetails, setStaffDetails] = useState({});
  const [popupData, setPopupData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [deviceIP, setDeviceIP] = useState("");
  const [isOrgVerified, setIsOrgVerified] = useState(false);
  const [isStaffVerified, setIsStaffVerified] = useState(false);

  useEffect(() => {
    if (isExisting !== "existing") return;
    if (!InstituteDetails?.PromotingOrganisationID) return;

    const loadPromotingOrg = async () => {
      try {
        const response = await agent.post(GetPromotingOrganisationDetails, {
          InstituteId: InstituteDetails.PromotingOrganisationID,
          ExitInstituteID: 0,
          UserLoginID: "SYSTEM",
          PageCode: "InstituteRegistration",
          ItemId: 0,
          IPAddress: deviceIP,
        });

        const orgData = response?.data?.Data;

        if (!orgData) return;

        const mappedOrg = {
          id: orgData.ApplicationID,
          numericId: orgData.PromotingOrganisationID,
          name: orgData.NameOfPromotingOrganization || "",
          type: orgData.PromotingType || orgData.PromotingOrgType || "",
          statusID: orgData.PromotingOrganizationStatusID || 0,

          organizationType: orgData.PromoterStatus || "",
          address: orgData.PromotingOrganizationAddress || "",
          pincode: orgData.PromotingOrganizationPincode || "",
          state: orgData.PromotingOrganizationState || "",
          district: orgData.PromotingOrganizationDistrict || "",
          taluka: orgData.PromotingOrganizationTaluka || "",
          cityOrVillage: orgData.PromotingOrganizationCityName || "",

          stateID: orgData.PromotingOrganizationStateID || orgData.StateID || 0,
          districtID: orgData.PromotingOrganizationDistrictID || orgData.DistrictID || 0,
          talukaID: orgData.PromotingOrganizationTalukaID || orgData.TalukaID || 0,
          cityID: orgData.PromotingOrganizationCityID || orgData.CityID || 0,
        };

        setOrganizationDetails(mappedOrg);
        setOrgId(mappedOrg.id);

        const profileId = orgData.ProfileIDforAuthorizedRepresentative;
        if (!profileId) return;

        const staffIdResponse = await agent.get(
          `${GetInstituteIdByCode}?InstituteCode=${profileId}`,
        );

        const staffId = staffIdResponse?.data?.Data;
        if (!staffId) return;

        const staffResponse = await agent.post(GetStaffSummary, {
          staffID: staffId,
          userLoginID: "SYSTEM",
          pageCode: "InstituteRegistration",
          ipAddress: deviceIP,
        });

        const staffPrimary = staffResponse?.data?.Data?.StaffPrimarySummary;
        if (!staffPrimary) return;

        const mappedStaff = {
          id: staffPrimary.ApplicationID || "",
          title:
            staffPrimary.Gender === "Male"
              ? "Mr."
              : staffPrimary.Gender === "Female"
                ? "Ms."
                : "",
          firstName: staffPrimary.FirstName || "",
          middleName: staffPrimary.MiddleName || "",
          lastName: staffPrimary.LastName || "",
          gender: staffPrimary.Gender || "",
          dateOfBirth: staffPrimary.DOB || "",
          aadhaarNumber: staffPrimary.AadhaarNo || "",
          primaryMobileNumber: staffPrimary.MobileNo || "",
          altMobileNumber: staffPrimary.AltMobileNo || "",
          email: staffPrimary.EMailID || "",
        };

        setStaffDetails(mappedStaff);
        setPromotingRepData(mappedStaff);
      } catch (error) {
      }
    };

    loadPromotingOrg();
  }, [isExisting, InstituteDetails, deviceIP]);

  useEffect(() => {
    const loadIP = async () => {
      const ip = await getDeviceIP();
      setDeviceIP(ip);
    };
    loadIP();
  }, []);

const isEligibleForApply = async (promotingId) => {
  if (!promotingId) return false;
  try{
    
  const response = await agent.get(
    `${IsInstituteEligibleForApplyWithPromotingOgranisation}?promotingOgranisationId=${promotingId}`
  );
  
  const data = response?.data?.Data;
  return data === true || data === "True";
  } catch(err){
  }
};

  const getPromotingOrganizationDetails = async () => {
    try {
      if (!orgId.trim()) {
        SwalHelper.warning(
          "Required",
          "Please enter Promoting Organization Profile ID",
        );
        return;
      }

    const promotingId = orgId.slice(-6);

    const isEligible = await isEligibleForApply(promotingId);

    if (isEligible) {
      SwalHelper.info(
        "Required",
        `Promoting Organization has already submitted application for new Skill Development Institute and the application is under process.
Application for new Skill Development Institute shall be accepted once the existing Application is approved.`
      );
      return;
    }
      SwalHelper.loading("Fetching Details...");

      let numericOrgId = orgId;
      if (isNaN(orgId)) {
        const match = orgId.match(/\d+$/);
        numericOrgId = match ? match[0] : orgId;
      }

      const response = await agent.post(GetPromotingOrganisationDetails, {
        instituteId: numericOrgId,
        exitInstituteID: 0,
        userLoginID: "SYSTEM",
        pageCode: "InstituteRegistration",
        itemId: 0,
        ipAddress: deviceIP,
      });

      const orgData = response?.data?.Data;
      

      if (!orgData) {
        SwalHelper.close();
        SwalHelper.error("Not Found", "Promoting Organization not found");

        return;
      }

      // const mappedOrg = {
      //   id: orgData.ApplicationID,
      //   numericId: orgData.PromotingOrganisationID,
      //   name: orgData.NameOfPromotingOrganization || "",
      //   type: orgData.PromotingType || "",
      //   organizationType: orgData.PromoterStatus || "",
      //   address: orgData.PromotingOrganizationAddress || "",
      //   pincode: orgData.PromotingOrganizationPincode || "",
      //   state: orgData.PromotingOrganizationState || "",
      //   district: orgData.PromotingOrganizationDistrict || "",
      //   taluka: orgData.PromotingOrganizationTaluka || "",
      //   cityOrVillage: orgData.PromotingOrganizationCityName || "",
      // };
      const mappedOrg = {
        id: orgData.ApplicationID,
        numericId: orgData.PromotingOrganisationID,
        name: orgData.NameOfPromotingOrganization || "",
        type: orgData.PromotingOrganizationTypeName || orgData.PromotingType || "",
        organizationType: orgData.PromoterStatus || "",
        address: orgData.PromotingOrganizationAddress || "",
        pincode: orgData.PromotingOrganizationPincode || "",
        state: orgData.PromotingOrganizationState || "",
        district: orgData.PromotingOrganizationDistrict || "",
        taluka: orgData.PromotingOrganizationTaluka || "",
        cityOrVillage: orgData.PromotingOrganizationCityName || "",
        statusID: orgData.PromotingOrganizationStatusID || 0,

        // ✅ ADD THESE — confirmed field names from your API response
        stateID: orgData.PromotingOrganizationStateID || 0,
        districtID: orgData.PromotingOrganizationDistrictID || 0,
        talukaID: orgData.PromotingOrganizationTalukaID || 0,
        cityID: orgData.PromotingOrganizationCityID || 0,
      };

      const staffIdResponse = await agent.get(
        `${GetInstituteIdByCode}?InstituteCode=${orgData.ProfileIDforAuthorizedRepresentative}`,
      );

      const staffId = staffIdResponse?.data?.Data;
      if (!staffId) {
        SwalHelper.close();
        SwalHelper.error("Not Found", "Authorized Representative not found");

        return;
      }

      const staffResponse = await agent.post(GetStaffSummary, {
        staffID: staffId,
        userLoginID: "",
        pageCode: "InstituteRegistration",
        ipAddress: deviceIP,
      });

      const staffPrimary = staffResponse?.data?.Data?.StaffPrimarySummary;

      if (!staffPrimary) {
        SwalHelper.close();

        SwalHelper.error("Not Found", "Staff details not found");

        return;
      }

      const mappedStaff = {
        id: staffPrimary.ApplicationID || "",
        title:
          staffPrimary.Gender === "Male"
            ? "Mr."
            : staffPrimary.Gender === "Female"
              ? "Ms."
              : "",
        firstName: staffPrimary.FirstName || "",
        middleName: staffPrimary.MiddleName || "",
        lastName: staffPrimary.LastName || "",
        gender: staffPrimary.Gender || "",
        dateOfBirth: staffPrimary.DOB || "",
        aadhaarNumber: staffPrimary.AadhaarNo || "",
        primaryMobileNumber: staffPrimary.MobileNo || "",
        altMobileNumber: staffPrimary.AltMobileNo || "",
        email: staffPrimary.EMailID || "",
      };

      //const orgVerified = Number(orgData?.IsApprovedOrganizatioRegistrationNumber) === "N";
      const orgVerified = orgData?.IsApprovedPromotingOrganisationStatus ==="V";
      
      

      const staffVerified =
        staffResponse?.data?.Data?.StaffApplicationStatusSummary?.FormStatus ===
        "V";

      setIsOrgVerified(orgVerified);
      setIsStaffVerified(staffVerified);

      setPopupData({
        trainingInstitute:
          isExisting === "existing"
            ? InstituteDetails?.InstituteNameCode || "NA"
            : "New Training Institute",

        promotingOrganization: mappedOrg.name + " (" + mappedOrg.id + ")",

        authorizedRepresentative:
          mappedStaff.firstName +
          " " +
          mappedStaff.middleName +
          " " +
          mappedStaff.lastName +
          " (" +
          mappedStaff.id +
          ")",

        primaryMobileNumber: mappedStaff.primaryMobileNumber,

        mappedOrg,
        mappedStaff,

        isOrgVerified: orgVerified,
        isStaffVerified: staffVerified,
      });

      SwalHelper.close();
      setShowPopup(true);
    } catch (error) {
      SwalHelper.close();
      SwalHelper.error(
        "Error",
        "Failed to load Promoting Organization details.",
      );
    }
  };
  const getInputValue = () => orgId || "";
  const isInputDisabled =
    isExisting === "existing" || !isModeSelected;

  return (
    <>

      {showPopup && (
        <PopUp
          data={popupData}
          onClose={() => setShowPopup(false)}
          onConfirm={() => {
            setOrganizationDetails(popupData.mappedOrg);
            setStaffDetails(popupData.mappedStaff);
            setPromotingRepData(popupData.mappedStaff);
            setPromotingOrgLocation?.({
              stateID: popupData.mappedOrg.stateID,
              districtID: popupData.mappedOrg.districtID,
              talukaID: popupData.mappedOrg.talukaID,
              cityID: popupData.mappedOrg.cityID,
              pincode: popupData.mappedOrg.pincode,
            });

            setInstituteEntity((prev) => ({
              ...prev,
              PromotingOrganisationID: popupData.mappedOrg.numericId,
              PromotingOrgType: popupData.mappedOrg.type,
              PromotingOrganisationStatus: popupData.mappedOrg.statusID,
              AuthorizedPersonForPromotingOrganisationTitle:
                popupData.mappedStaff.title,
              AuthorizedPersonForPromotingOrganisationFirstName:
                popupData.mappedStaff.firstName,
              AuthorizedPersonForPromotingOrganisationMiddleName:
                popupData.mappedStaff.middleName,
              AuthorizedPersonForPromotingOrganisationLastName:
                popupData.mappedStaff.lastName,
              AuthorizedPersonForPromotingOrganisationGender:
                popupData.mappedStaff.gender,
              AuthorizedPersonForPromotingOrganisationDOB:
                popupData.mappedStaff.dateOfBirth,
              AuthorizedPersonForPromotingOrganisationAadharNo:
                popupData.mappedStaff.aadhaarNumber,
              AuthorizedPersonForPromotingOrganisationMobileNo1:
                popupData.mappedStaff.primaryMobileNumber,
              AuthorizedPersonForPromotingOrganisationMobileNo2:
                popupData.mappedStaff.altMobileNumber,
              AuthorizedPersonForPromotingOrganisationEMailID:
                popupData.mappedStaff.email,
            }));

            setShowPopup(false);
          }}
          isTrainingInstituteNew={true}
          isTrainingInstituteVerified={true}
          isPromotingOrganizationVerified={popupData.isOrgVerified}
          isAuthorizedRepresentativeVerified={popupData.isStaffVerified}
        />
      )}

      <div className="promoting-organization-details bg-white">
        <div className="pt-4 pb-6">
          <div className="border-b border-gray-300 px-2">
            <h2 className="text-lg font-medium ml-3.5">
              Promoting Organization Details
            </h2>
          </div>

          <div className="px-2">
            {/* PROFILE ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 m-5">
              <div className="lg:col-span-5">
                <label className="block font-semibold mb-1">
                  Promoting Organization Profile ID
                  <span className="text-red-500"> *</span>
                </label>
                <span className="text-sm font-normal">
                  (If not registered, then{" "}
                  <a
                    href="https://msbsvet.edu.in/Registration/PromotingOrganizationRegistration"
                    className="underline text-blue-600 font-semibold"
                  >
                    click here
                  </a>{" "}
                  to register and complete profile)
                </span>
                <br></br>

                <input
                  type="text"
                  value={getInputValue()}
                  disabled={isInputDisabled}
                  onChange={(e) => setOrgId(e.target.value)}
                  className={
                    isInputDisabled
                      ? "w-full border bg-gray-200 cursor-not-allowed rounded-md p-1.5"
                      : "w-full border rounded-md p-1.5"
                  }
                />

                <button
                  onClick={getPromotingOrganizationDetails}
                  disabled={isInputDisabled}
                  className={
                    isInputDisabled
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed rounded-sm mt-2 px-3 py-1"
                      : "bg-[#dc3545] hover:bg-red-700 text-white rounded-sm mt-2 px-3 py-1"
                  }
                >
                  Get Details
                </button>
              </div>
            </div>

            {/* ORGANIZATION DETAILS */}
            <div className="flex items-center gap-2 ml-5">
              <div className="w-1/2">
                <FormComponent
                  label="Name of Promoting Organization"
                  value={organizationDetails?.name || ""}
                  required
                  disabled
                />
              </div>

              {isOrgVerified && (
                <img
                  src={VerifiedIcon}
                  alt="verified"
                  className="w-6 h-6 mt-6"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-5">
              <FormComponent
                label="Type of Promoting Organization"
                value={organizationDetails?.type || ""}
                required
                disabled
              />

              <FormComponent
                label="Government / Private Status"
                value={organizationDetails?.organizationType || ""}
                required
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 m-5">
              <FormComponent
                label="Address"
                value={organizationDetails?.address || ""}
                required
                disabled
              />

              <FormComponent
                label="PinCode"
                value={organizationDetails?.pincode || ""}
                required
                disabled
              />

              <FormComponent
                label="State"
                value={organizationDetails?.state || ""}
                required
                disabled
              />

              <FormComponent
                label="District"
                value={organizationDetails?.district || ""}
                required
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-5">
              <FormComponent
                label="Taluka"
                value={organizationDetails?.taluka || ""}
                required
                disabled
              />

              <FormComponent
                label="City / Village"
                value={organizationDetails?.cityOrVillage || ""}
                required
                disabled
              />
            </div>

            {/* STAFF BASIC */}
            <div className="pl-4 pr-4">
              <h2 className="text-lg font-medium border-b pb-1">
                Authorized Representative of Promoting Organization
              </h2>

              <div className="flex items-center gap-2">
                <div className="w-1/2">
                  <FormComponent
                    label="Staff/ Management Profile ID"
                    value={staffDetails?.id || ""}
                    disabled
                  />
                </div>

                {staffDetails?.id && (
                  <img
                    src={VerifiedIcon}
                    alt="verified"
                    className="w-6 h-6 mt-6"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
                <FormComponent
                  label="Title"
                  value={staffDetails?.title || ""}
                  required
                  disabled
                />

                <FormComponent
                  label="First Name"
                  value={staffDetails?.firstName || ""}
                  required
                  disabled
                />

                <FormComponent
                  label="Middle Name"
                  value={staffDetails?.middleName || ""}
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
                <FormComponent
                  label="Last Name"
                  value={staffDetails?.lastName || ""}
                  required
                  disabled
                />

                <FormComponent
                  label="Gender"
                  value={staffDetails?.gender || ""}
                  required
                  disabled
                />

                <FormComponent
                  label="Date of Birth"
                  value={staffDetails?.dateOfBirth || ""}
                  required
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
                <FormComponent
                  label="Aadhar Number"
                  value={staffDetails?.aadhaarNumber || ""}
                  required
                  disabled
                />

                <FormComponent
                  label="Primary Mobile Number"
                  value={staffDetails?.primaryMobileNumber || ""}
                  required
                  disabled
                />

                <FormComponent
                  label="Alt Mobile Number"
                  value={staffDetails?.altMobileNumber || ""}
                  disabled
                />
              </div>

              <div className="mt-3">
                <FormComponent
                  label="E-mail ID"
                  value={staffDetails?.email || ""}
                  required
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PromotingOrganizationDetails;
