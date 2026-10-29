import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Swal from "sweetalert2";
import { useAuth } from "../../Hooks/AuthContext";
import ReactDOM from "react-dom/client";

import DVETOStaffProfilePopup from "../../Component/formcomponent/DVETOStaffProfilePopup";
import Staff_PrintApplicationForm from "../../Component/PrintApplicationForm/Staff_PrintApplicationForm";
import UploadPdf from "../../Component/formcomponent/UploadPdf";

import rejected from "../../assets/NotVerifiedIcon.jpg";
import pending from "../../assets/QuestionMark.png";
import verified from "../../assets/VerifiedIcon.jpg";
import { FaTrash } from "react-icons/fa";

import InspectionStatusComponent from "../../Component/formcomponent/InspectionStatusComponent";
import { useInspectionLock } from "../../Hooks/useInspectionLock";

import {
  GetDVETOManagementDetails,
  GetPromoterDetailsByInstituteID,
  //SaveInstitute_PromoterStaffMappingDetails,
  GetDVETOInspectionCommitteeDetails,
  DeletePromoterStaffMappingDetails,
  DeleteDVETOInspectionCommittee,
  saveDVETOInspectionCommitteephot,
} from "../../Endpoints_All/Base/DVETO";
import { GetStaffID } from "../../Endpoints_All/Base/masterData";

import agent from "../../lib/api/agent";

import { useSearchParams, useNavigate } from "react-router-dom";
import { getDeviceIP } from "../../utils/CommonHelper";

const EMPTY_ROW = {
  ID: "",
  ProfileID: "",
  Title: "",
  FirstName: "",
  MiddleName: "",
  LastName: "",
  Gender: "",
  DOB: "",
  MobileNo: "",
  EmailID: "",
  Status: "",
};

const InspectionCommittee = () => {
  const { color } = useContext(ThemeContext);
  const { userInfo } = useAuth();

  const [record, setRecord] = useState({ ...EMPTY_ROW });
  const [popupOpen, setPopupOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupKey, setPopupKey] = useState(0);
  const [members, setMembers] = useState([]);
  //const [promoterTypes, setPromoterTypes] = useState([]);
  //const [selectedPromoterType, setSelectedPromoterType] = useState("");
  const [managementTypeID, setManagementTypeID] = useState(7);
  const [committeePhoto, setCommitteePhoto] = useState(null);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const P1 = searchParams.get("P1");
  const P2 = searchParams.get("P2");

  const { isLocked, eligibilityData } = useInspectionLock(P1, P2);

  const [ip, setIp] = useState("0.0.0.0");
  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const userIP = await getDeviceIP();
        setIp(userIP);
      } catch (err) { }
    };

    fetchIP();
  }, []);

  const handlePopupSaved = () => {
    setPopupOpen(false);
    setRefresh((r) => !r);
    setPopupKey((prev) => prev + 1);
  };

  const handlePopupClose = () => {
    setPopupOpen(false);
    setPopupKey((prev) => prev + 1);
  };

  useEffect(() => {
    fetchInspectionData();
  }, [refresh]);

  const fetchMembers = async () => {
    try {
      const payload = {
        instituteId: userInfo?.UserID,
        exitInstituteID: 0,
        userLoginID: userInfo?.UserLoginID,
        pageCode: "InspectionCommittee",
        itemId: 0,
        ipAddress: ip,
      };

      const res = await agent.post(GetPromoterDetailsByInstituteID, payload);

      if (res.data?.Data) {
        setMembers(res.data.Data);
      }
    } catch (err) { }
  };

  const fetchInspectionData = async () => {
    setLoading(true);

    try {
      if (!P1) {
        return;
      }

      const res = await agent.get(
        `${GetDVETOInspectionCommitteeDetails}?instituteID=${P1}`,
      );

      if (res.data?.Status === "Success") {
        const response = res.data.Data || {};
        const data = response.Members || [];
        const photo = response.Photo || null;

        if (photo?.PhotoPath) {
          setCommitteePhoto({
            filePath: photo.PhotoPath,
          });
        }

        const chairman = data.find((x) => x.ManagementType === 7);

        setRecord({
          ID: chairman?.ID || "",
          ProfileID: chairman?.ProfileID || "",
          Title: chairman?.Title || "",
          FirstName: chairman?.FirstName || "",
          MiddleName: chairman?.MiddleName || "",
          LastName: chairman?.LastName || "",
          Gender: chairman?.GenderCode || chairman?.Gender || "",
          DOB: chairman?.FormatDOB || chairman?.DOB || "",
          MobileNo: chairman?.MobileNo || "",
          Status: chairman?.Status || "",
        });

        const memberList = data
          .filter((x) => x.ManagementType === 8)
          .map((x) => ({
            ID: x.ID || "",
            ProfileID: x.ProfileID || "",
            Title: x.Title || "",
            FirstName: x.FirstName || "",
            MiddleName: x.MiddleName || "",
            LastName: x.LastName || "",
            Gender: x.Gender || x.GenderCode || "",
            DOB: x.DOB || x.FormatDOB || "",
            MobileNo: x.MobileNo || "",
            Status: x.Status || "",
          }));

        setMembers(memberList);
      } else {
      }
    } catch (error) {
      Swal.fire("Error", "Unable to fetch Inspection Committee data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (row) => {
    const confirm = await Swal.fire({
      title: "Delete Member?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await agent.post(
        `${DeleteDVETOInspectionCommittee}?ID=${row.ID}`,
      );

      if (response.data.Status === "Success") {
        setMembers((prev) => prev.filter((item) => item.ID !== row.ID));

        //fetchMembers();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Committee Member deleted  successfully!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.Message || "Failed to delete Committee Member",
        });
      }
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };
  const handleCommitteePhotoUpload = (fileData) => {
    setCommitteePhoto(fileData);
  };

  const handlePrintProfile = async (profileID) => {
    if (!profileID) {
      Swal.fire("Info", "No Profile ID available", "info");
      return;
    }

    try {
      const resstaff = await agent.get(
        `${GetStaffID}?ApplicationID=${profileID.trim()}`,
      );

      const staffID = resstaff.data.Data;

      const printWindow = window.open(
        "",
        "_blank",
        "width=1200,height=800,left=100,top=100",
      );

      const containerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
      <title>Application</title>
      </head>
      <body>
      <div id="root"></div>
      </body>
      </html>
      `;

      printWindow.document.write(containerHTML);
      printWindow.document.close();

      printWindow.onload = () => {
        const root = ReactDOM.createRoot(
          printWindow.document.getElementById("root"),
        );

        root.render(
          <Staff_PrintApplicationForm
            staffID={staffID}
            userLoginID={profileID}
            pageCode="DVETO_STAFF_PRINT"
          />,
        );
      };
    } catch (error) {
      Swal.fire("Error", "Unable to print profile.", "error");
    }
  };

  const getRow = (data) => (
    <tr className="text-sm">
      <td className="p-2 border border-gray-300">
        <a
          href="#"
          className="text-blue-700 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            handlePrintProfile(data.ProfileID);
          }}
        >
          {data.ProfileID}
        </a>
      </td>

      <td className="p-2 border border-gray-300">{data.Title}</td>
      <td className="p-2 border border-gray-300">{data.FirstName}</td>
      <td className="p-2 border border-gray-300">{data.MiddleName}</td>
      <td className="p-2 border border-gray-300">{data.LastName}</td>
      <td className="p-2 border border-gray-300">{data.Gender}</td>
      <td className="p-2 border border-gray-300">{data.DOB}</td>
      <td className="p-2 border border-gray-300">{data.MobileNo}</td>

      {/* <td className="p-2 border border-gray-300 text-center">
        <img
          src={
            data.Status === "Verified"
              ? verified
              : data.Status === ""
                ? pending
                : rejected
          }
          alt="status"
          className="w-6 h-6 mx-auto"
        />
      </td> */}
    </tr>
  );

  const handleSaveAndNext = async () => {
    try {
      if (!committeePhoto || !committeePhoto.filePath) {
        Swal.fire({
          icon: "warning",
          title: "Validation",
          text: "Please upload Inspection Committee Photo before proceeding.",
        });
        return;
      }

      //const userInfoAll =
      //    JSON.parse(sessionStorage.getItem("userInfoAll")) || {};
      //const User = userInfoAll.UserLoginID || user?.UserLoginID;

      //const payload = {
      //    InstituteID: P1,
      //    PhotoPath: committeePhoto.filePath,
      //
      //    IP: ip
      //};

      const res = await agent.post(
        `${saveDVETOInspectionCommitteephot}?InstituteID=${P1}&PhotoPath=${committeePhoto.filePath}&User=${userInfo?.UserLoginID}&IP=${ip}`,
      );

      if (res.data?.Status === "Success") {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Data saved successfully!",
        });

        navigate(`/Institute/UnitsForInspection?P1=${P1}&P2=${P2}`);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data?.Message || "Failed to save photo",
        });
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong while saving photo", "error");
    }
  };

  return (
    <div className="w-full p-4">
      {isLocked && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          Editing is not allowed. Inspection Committee is in progress or
          completed.
        </div>
      )}
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          Inspection Committee
        </legend>

        <div className="p-4 space-y-6">
          {/* Chairman Section */}
          <div className="border border-gray-300 rounded">
            <div className="bg-gray-200 px-3 py-2 font-semibold text-sm">
              Chairman
            </div>

            <table className="w-full border-collapse text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Profile ID</th>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">First Name</th>
                  <th className="p-2 border">Middle/ Father / Husband Name</th>
                  <th className="p-2 border">Last/ Surname</th>
                  <th className="p-2 border">Gender</th>
                  <th className="p-2 border">Date of Birth</th>
                  <th className="p-2 border">Mobile No.</th>
                  {/* <th className="p-2 border">Status</th> */}
                </tr>
              </thead>

              <tbody>
                {record.ProfileID ? (
                  getRow(record)
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-gray-400">
                      No record added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-center p-3">
              <button
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white text-sm"
                onClick={() => {
                  setManagementTypeID(7);
                  setPopupOpen(true);
                  setPopupKey((prev) => prev + 1);
                }}
                disabled={isLocked}
              >
                {record.ProfileID ? "Update Chairman" : "Add Chairman"}
              </button>
            </div>
          </div>

          {/* Committee Member Section */}
          <div className="border border-gray-300 rounded">
            <div className="bg-gray-200 px-3 py-2 font-semibold text-sm">
              Committee Member
            </div>

            <div className="p-4">
              <div className="flex justify-center items-center mb-4">
                <button
                  onClick={() => {
                    setManagementTypeID(8);
                    setPopupOpen(true);
                    setPopupKey((prev) => prev + 1);
                  }}
                  disabled={isLocked}
                  className="bg-[#00c3f9] text-white px-4 py-1 rounded"
                >
                  Add Member
                </button>
              </div>

              <table className="w-full border-collapse text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Sr. No.</th>
                    <th className="p-2 border">Profile ID</th>
                    <th className="p-2 border">Title</th>
                    <th className="p-2 border">First Name</th>
                    <th className="p-2 border">
                      Middle/ Father / Husband Name
                    </th>
                    <th className="p-2 border">Last/ Surname</th>
                    <th className="p-2 border">Gender</th>
                    <th className="p-2 border">Date of Birth</th>
                    <th className="p-2 border">Mobile No.</th>
                    {/* <th className="p-2 border">Status</th> */}
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td
                        colSpan="11"
                        className="text-center py-4 text-gray-400"
                      >
                        No data found
                      </td>
                    </tr>
                  ) : (
                    members.map((row, index) => (
                      <tr key={index} className="text-sm">
                        <td className="p-2 border text-center">{index + 1}</td>

                        <td className="p-2 border text-blue-600">
                          {row.ProfileID}
                        </td>

                        <td className="p-2 border">{row.Title}</td>
                        <td className="p-2 border">{row.FirstName}</td>
                        <td className="p-2 border">{row.MiddleName}</td>
                        <td className="p-2 border">{row.LastName}</td>

                        <td className="p-2 border">
                          {row.Gender === "M"
                            ? "Male"
                            : row.Gender === "F"
                              ? "Female"
                              : row.Gender || "-"}
                        </td>

                        <td className="p-2 border">
                          {row.FormatDOB || row.DOB || "-"}
                        </td>

                        <td className="p-2 border">{row.MobileNo}</td>

                        {/* <td className="p-2 border text-center">
                          <img
                            src={
                              row.Status === "Verified"
                                ? verified
                                : row.Status === ""
                                  ? pending
                                  : rejected
                            }
                            alt="status"
                            className="w-6 h-6 mx-auto"
                          />
                        </td> */}

                        <td className="p-2 border text-center">
                          <button
                            onClick={() => handleDeleteMember(row)}
                            disabled={isLocked}
                            className="text-red-600 hover:text-red-800 flex justify-center w-full"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-700 font-medium">Note:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-700">
              <li>
                Chairman of Inspection Committee should be DVETO himself or
                minimum Group B officer.
              </li>
              <li>Add subject expert as Committee Members.</li>
              <li>Chairman and Members must physically visit the institute.</li>
              <li>
                DVETO shall submit inspection report within 2 working days.
              </li>
            </ol>
          </div>

          {/* Upload */}
          <UploadPdf
            id="inspectionCommitteePhoto"
            label="Upload Inspection Committee Photo"
            required
            allowedFileTypes="jpg, jpeg, png"
            buttonText="Upload"
            userTypeId={userInfo?.UserTypeID}
            userLoginID={userInfo?.UserLoginID}
            uniquefilepath={committeePhoto?.filePath}
            onFileChange={handleCommitteePhotoUpload}
            disabled={isLocked}
          />

          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-700 font-medium">Note:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-700">
              <li>
                Upload Inspection Committee Geo Tag Photo taken at the entrance
                of the Institute. Inspection Committee Chairman, Members,
                Institute Authorized Representative of Institute and Institute
                entrance should be clearly visible in the photo.
              </li>

              <li>
                The photo should have Geo Tag stamping and date and time
                stamping.
              </li>

              <li className="underline cursor-pointer text-blue-800 hover:text-blue-600">
                Click here to know how to take Geo Tag photo.
              </li>
            </ol>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-8 mt-8 pt-12 border-t-2 border-gray-300">
            <button
              onClick={() => {
                let url = `/DVETO/InspectionReport?p1=${P2 || ""}&p2=${P1}`;
                navigate(url);
              }}
              className="px-6 py-3 bg-cyan-500 text-white rounded text-sm"
            >
              Back
            </button>
            {isLocked ? (
              <button
                className="bg-green-600 px-6 py-2 text-white rounded"
                onClick={() =>
                  navigate(`/Institute/UnitsForInspection?P1=${P1}&P2=${P2}`)
                }
              >
                Save and Next
              </button>
            ) : (
              <button
                className="bg-green-600 px-6 py-2 text-white rounded"
                onClick={handleSaveAndNext}
              >
                Save and Next
              </button>
            )}

            <button
              onClick={() => {
                if (userInfo?.UserTypeID == 14) {
                 navigate(`/DVETO/InspectionReport?p1=${P2}&p2=${P1}`);
                } else {
                  navigate(`/DVETO/InspectionReport?p1=${P2}&p2=${P1}`);
                }
                
              }}
              className="bg-gray-500 px-6 py-2 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      </fieldset>

      <DVETOStaffProfilePopup
        key={popupKey}
        open={popupOpen}
        instituteID={P1}
        roleConfig={{
          key: "inspectionCommittee",
          label: "Inspection Committee",
          apiLabel: "InspectionCommittee",
          button: "Add Inspection Committee",
          updateButton: "Update Inspection Committee",
          ManagementTypeID: managementTypeID,
          required: false,
        }}
        onClose={handlePopupClose}
        onSaved={handlePopupSaved}
      />

      {loading && (
        <div className="fixed inset-0 bg-white/60 flex justify-center items-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]"></div>
        </div>
      )}
    </div>
  );
};

export default InspectionCommittee;
