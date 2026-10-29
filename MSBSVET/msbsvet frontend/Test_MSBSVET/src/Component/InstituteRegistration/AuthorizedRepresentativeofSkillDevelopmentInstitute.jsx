import { useEffect, useState } from "react";
import Condition from "./Condition";
import FormComponent from "../formcomponent/FormComponent";
import RepresentativePopup from "./RepresentativePopUp";
import { SwalHelper } from "../../utils/SwalHelper";
import VerifiedIcon from "../../assets/VerifiedIcon.jpg";
import NotVerifiedIcon from "../../assets/NotVerifiedIcon.jpg";
import {
  GetInstituteIdByCode,
  GetStaffSummary,
} from "../../Endpoints_All/Registration/SDIRegistration";
import { getDeviceIP } from "../../utils/CommonHelper";
import agent from "../../lib/api/agent";

const AuthorizedRepresentativeofSkillDevelopmentInstitute = ({
  InstituteDetails,
  setSdiRep = () => {},
  setInstituteEntity,
  resetSignal,
    promotingRepData,
    isModeSelected,
}) => {
  const [isAuthorized, setIsAuthorized] = useState("");
  const [data, setData] = useState(null);
  const [enteredId, setEnteredId] = useState("");
  const [popupData, setPopupData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isRepVerified, setIsRepVerified] = useState(false);

  const [deviceIP, setDeviceIP] = useState("");

  useEffect(() => {
    setIsAuthorized("");
    setData(null);
    setEnteredId("");
    setPopupData(null);
    setShowPopup(false);

    setSdiRep({ isAuthorized: "", repData: {} });

    //  reset
    setInstituteEntity((prev) => ({
      ...prev,
      AuthorizedPersonTitle: "",
      AuthorizedPersonFirstName: "",
      AuthorizedPersonMiddleName: "",
      AuthorizedPersonLastName: "",
      AuthorizedPersonGender: "",
      AuthorizedPersonDOB: "",
      AuthorizedPersonAadharNo: "",
      AuthorizedPersonMobileNo1: "",
      AuthorizedPersonMobileNo2: "",
      EMailID: "",
    }));
  }, [resetSignal]);

  useEffect(() => {
    const loadIP = async () => {
      const ip = await getDeviceIP();
      setDeviceIP(ip);
    };
    loadIP();
  }, []);

  useEffect(() => {
    if (isAuthorized === "Yes" && promotingRepData) {

      setData(promotingRepData);
      setEnteredId(promotingRepData.id);

      setSdiRep({
        isAuthorized: "Yes",
        repData: promotingRepData,
      });
    }

    if (isAuthorized === "No") {
      setData(null);
      setEnteredId("");
      setSdiRep({ isAuthorized: "No", repData: {} });
    }
  }, [isAuthorized, promotingRepData]);

  useEffect(() => {
    if (data?.id) {
      setInstituteEntity((prev) => ({
        ...prev,
        AuthorizedPersonTitle: data.title || "",
        AuthorizedPersonFirstName: data.firstName || "",
        AuthorizedPersonMiddleName: data.middleName || "",
        AuthorizedPersonLastName: data.lastName || "",
        AuthorizedPersonGender: data.gender || "",
        AuthorizedPersonDOB: data.dob || data.dateOfBirth || "",

        AuthorizedPersonAadharNo: data.aadhaarNumber || "",
        AuthorizedPersonMobileNo1: data.primaryMobileNumber || "",
        AuthorizedPersonMobileNo2: data.altMobileNumber || "",
        EMailID: data.email || "",
      }));
    }
  }, [data]);

  const handelSearchRep = async () => {
    try {
      if (!enteredId.trim()) {
        SwalHelper.warning("Required", "Enter Staff / Management Profile ID !");
        return;
      }

      SwalHelper.loading("Fetching Authorized Representative...");

      const staffIdResponse = await agent.get(
        `${GetInstituteIdByCode}?InstituteCode=${enteredId}`,
      );

      const staffId = staffIdResponse?.data?.Data;

      if (!staffId) {
        SwalHelper.close();
        SwalHelper.error(
          "Invalid ID",
          "Enter Correct Staff / Management Profile ID !",
        );
        return;
      }

      const staffResponse = await agent.post(GetStaffSummary, {
        StaffID: staffId,
        UserLoginID: "SYSTEM",
        PageCode: "InstituteRegistration",
        IPAddress: deviceIP,
      });

      const staffPrimary = staffResponse?.data?.Data?.StaffPrimarySummary;

      if (!staffPrimary) {
        SwalHelper.close();
        SwalHelper.error("Not Found", "Staff details not found !");
        return;
      }

      const mappedStaff = {
        id: staffPrimary.ApplicationID,
        title: staffPrimary.Gender === "Male" ? "Mr." : "Ms.",
        firstName: staffPrimary.FirstName,
        middleName: staffPrimary.MiddleName,
        lastName: staffPrimary.LastName,
        gender: staffPrimary.Gender,
        dob: staffPrimary.DOB,
        aadhaarNumber: staffPrimary.AadhaarNo,
        primaryMobileNumber: staffPrimary.MobileNo,
        altMobileNumber: staffPrimary.AltMobileNo,
        email: staffPrimary.EMailID,
        VerifyCnt: staffPrimary.VerifyCnt,
        RejectCnt: staffPrimary.RejectCnt,
        PhotoFilePath: staffPrimary.PhotoFilePath,
      };

      SwalHelper.close();
      const verified =
        staffResponse?.data?.Data?.StaffApplicationStatusSummary?.FormStatus ===
        "V";

      setIsRepVerified(verified);

      setPopupData(mappedStaff);
      setShowPopup(true);
    } catch (error) {
      SwalHelper.close();
      SwalHelper.error(
        "Error",
        "Something went wrong while fetching staff details",
      );
    }
  };

  function handlePopupConfirm() {
    setData(popupData);
    setSdiRep({
      isAuthorized,
      repData: popupData,
    });
    setShowPopup(false);
  }

  return (
    <div className=" rounded-[5px] m-4 mb-0 shadow-b-xl bg-white">
      {showPopup && (
        <RepresentativePopup
          data={popupData}
          onConfirm={handlePopupConfirm}
          onClose={() => setShowPopup(false)}
        />
      )}

      <div className="pt-2 pb-1 px-5 border-b-2 border-gray-200 ">
        <h1 className="text-xl">
          Authorized Representative of Skill Development Institute
        </h1>
      </div>

      <div className="py-4 px-6">
              <Condition
                  label="Is Authorized Representative of Skill Development Institute same as Promoting Organization (as displayed above)?"
                  value={isAuthorized}
                  onChange={(value) => setIsAuthorized(value)}
                  condition1="Yes"
                  condition2="No"
                  disabled={!isModeSelected}
              />
      </div>

      <div className="px-6 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p>
              Staff/ Management Profile ID for Authorized Representative
              <span className="text-red-500">*</span>
            </p>
            <span className="text-sm font-normal">
              (If not registered, then{" "}
              <a
                href="https://msbsvet.edu.in/Registration/StaffRegistration"
                className="underline text-blue-600 font-semibold"
              >
                click here
              </a>{" "}
              to register and complete profile)
            </span>
            <br></br>
            <div className="flex items-center gap-2">
              <div className="w-full">
                <input
                  type="text"
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-2"
                                  disabled={!isModeSelected || isAuthorized === "Yes"}
                  value={enteredId}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase().slice(0, 13);
                    setEnteredId(value);
                  }}
                />
              </div>
              {data?.id && (
                <img
                  src={VerifiedIcon}
                  alt="verified"
                  className="w-6 h-6 mt-2"
                />
              )}
            </div>

            <button
                          className={`text-white rounded px-2 py-1 my-2 ${!isModeSelected || isAuthorized === "Yes"
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-[#db3545]"
                              }`}
                          disabled={!isModeSelected || isAuthorized === "Yes"}
              onClick={handelSearchRep}
            >
              Get Authorized Representative Details
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-8 mt-5">
          {/* Title + First Name */}
          <div className="flex gap-5">
            <div className="w-20">
              <FormComponent
                label="Title"
                value={data?.title || ""}
                required
                disabled
              />
            </div>

            <div className="w-full">
              <FormComponent
                label="First Name"
                value={data?.firstName || ""}
                required
                disabled
              />
            </div>
          </div>

          {/* Middle Name */}
          <FormComponent
            label="Middle / Father / Husband Name"
            value={data?.middleName || ""}
            disabled
          />

          {/* Last Name */}
          <FormComponent
            label="Last / Surname"
            value={data?.lastName || ""}
            disabled
          />

          {/* Gender */}
          <FormComponent label="Gender" value={data?.gender || ""} disabled />

          {/* DOB */}
          <FormComponent
            label="Date of Birth"
            value={data?.dob || data?.dateOfBirth || ""}
            disabled
          />

          {/* Aadhaar */}
          <FormComponent
            label="Aadhar No"
            value={data?.aadhaarNumber || ""}
            disabled
          />

          {/* Primary Mobile */}
          <FormComponent
            label="Primary Mobile Number"
            value={data?.primaryMobileNumber || ""}
            required
            disabled
          />

          {/* Alternative Mobile */}
          <FormComponent
            label="Alternative Mobile Number"
            value={data?.altMobileNumber || ""}
            disabled
          />

          {/* Email */}
          <FormComponent label="E-Mail ID" value={data?.email || ""} disabled />
        </div>
      </div>
    </div>
  );
};

export default AuthorizedRepresentativeofSkillDevelopmentInstitute;
