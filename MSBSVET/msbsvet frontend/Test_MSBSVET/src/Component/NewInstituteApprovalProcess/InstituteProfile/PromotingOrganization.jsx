
// // import { useContext, useState, useCallback, useEffect } from "react";
// // import { ThemeContext } from "../../Context/ThemeContext";
// // import DropdownComponent from "../../formcomponent/DropdownComponent";
// // import FormComponent from "../../formcomponent/FormComponent";
// // import UploadPdf from "../../formcomponent/UploadPdf";
// // import { FaBuilding } from "react-icons/fa";
// // import { useAuth } from "../../../Hooks/AuthContext";
// // import Swal from "sweetalert2";
// // import { useLoading } from "../../../Hooks/useLoading";
// // import { useTranslation } from "react-i18next";
// // import { useNavigate } from "react-router-dom";
// // import {
// //     GetInstituteIDByInstituteCode,
// //     GetPromotingOrganisationIDByInstituteID,
// //     GetPromotingOrganisationDetails
// // } from "../../../Endpoints_All/Base/Institute";
// // import agent from "../../../lib/api/agent";
// // import { useFormMode } from "../../../lib/hooks/useFormMode";
// // import {
// //     useStates,
// //     useDistricts,
// //     useTalukas,
// //     useCities,
// //     usePincodeLookup,
// // } from "../../../lib/hooks/useAddressQueries";
// // import { SwalHelper } from "../../../utils/swalHelper";
// // import { useCascadingAddress } from "../../../lib/hooks/useCascadingAddress";
// // import { formatOptions } from "../../../utils/CommonHelper";
// // import RedirectToOld from "../../formcomponent/RedirectToOld";
// // import Button from "../../base/Button";

// // const initialFormState = {
// //     ProfileID: "",
// //     TypeOfPromotingOrganization: "",
// //     GovernmentPrivateStatus: "",
// //     NameOfPromotingOrganization: "",
// //     DateOfRegistration: "",
// //     RegistrationNumber: "",
// //     RegistrationCertificate: "",
// //     PromotingOrganizationAddress: "",
// //     StateID: "",
// //     DistrictID: "",
// //     TalukaID: "",
// //     CityID: "",
// //     CityName: "",
// //     PinCode: "",
// //     PhoneCountryCode: "+91",
// //     Phone: "",
// //     Email: "",
// //     Website: "",
// //     PAN: "",
// //     PANCard: "",
// //     PromotingOrganisationTypeName: "",
// //     PromoterStatus: ""
// // };

// // const PromotingOrganization = () => {

// //     const { color } = useContext(ThemeContext);
// //     const { t } = useTranslation("promotorOrgRegistration");
// //     const { userInfo } = useAuth();
// //     const { startLoading, stopLoading, isLoading } = useLoading();
// //     const navigate = useNavigate();

// //     const [formData, setFormData] = useState(initialFormState);
// //     const [errors, setErrors] = useState({});
// //     const [editMode, setEditMode] = useState(false);
// //     const [showOtherCity, setShowOtherCity] = useState(false);
// //     const [isAutoFillingAddress, setIsAutoFillingAddress] = useState(false);
// //     const [showVerificationUI, setShowVerificationUI] = useState(false);
// //     const [approvalStatus, setApprovalStatus] = useState('');
// //     const [rejectReason, setRejectReason] = useState('');
// //     const [existingStatus, setExistingStatus] = useState('');
// //     const [existingRemark, setExistingRemark] = useState('');
// //     const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
// //     /*const [fieldsDisabled, setFieldsDisabled] = useState(false);*/
// //     const {
// //         fieldsDisabled,
// //     } = useFormMode(userInfo.UserTypeID);

// //     //if (userInfo.UserTypeID === 64) {
// //     //    return <RedirectToOld targetPath="/Institute/PromotingOrganization.aspx" />;
// //     //}

// //     useCascadingAddress(formData, setFormData, isAutoFillingAddress);
// //     // Dropdown data
// //     const { data: states, loading: stateLoading } = useStates();
// //     const { data: districts, loading: districtsLoading } = useDistricts(formData.StateID);
// //     const { data: talukas, loading: talukaLoading } = useTalukas(formData.DistrictID);
// //     const { data: cities, loading: cityLoading } = useCities(formData.TalukaID);
// //     const { getPincode } = usePincodeLookup();

// //     // File/PDF paths
// //     const [regCertFileData, setRegCertFileData] = useState({});
// //     const [panCardFileData, setPanCardFileData] = useState({});

// //     const handlePincodeChange = useCallback(async (value) => {
// //         const pin = value.replace(/\D/g, "").slice(0, 6);
// //         setFormData(p => ({ ...p, PinCode: pin }));

// //         setErrors(prev => {
// //             const { PinCode, ...rest } = prev;
// //             return rest;
// //         });

// //         if (pin.length < 6) {
// //             setFormData(prev => ({
// //                 ...prev,
// //                 StateID: "",
// //                 DistrictID: "",
// //                 TalukaID: "",
// //                 CityID: ""
// //             }));

// //             setErrors(prev => {
// //                 const { StateID, DistrictID, TalukaID, CityID, ...rest } = prev;
// //                 return rest;
// //             });

// //             return;
// //         }

// //         if (pin.length !== 6) return;

// //         try {
// //             /*const res = await pincodeMutation.mutateAsync(pin);*/
// //             setIsAutoFillingAddress(true);
// //             const res = await getPincode(pin);
// //             if (res.Status !== "Success") return;

// //             const { StateID, DistrictID, TalukaID, CityID } = res.Data;
// //             setFormData(prev => ({
// //                 ...prev,
// //                 PinCode: pin,
// //                 StateID,
// //                 DistrictID,
// //                 TalukaID,
// //                 CityID
// //             }));

// //             setErrors(prev => {
// //                 const { StateID: s, DistrictID: d, TalukaID: t, CityID: c, ...rest } = prev;
// //                 return rest;
// //             });
// //         } catch {
// //             SwalHelper.error("Invalid Pincode");
// //         } finally {
// //             setTimeout(() => setIsAutoFillingAddress(false), 0);
// //         }
// //     }, []);

// //     const handleCityChange = (value) => {
// //         const isOther = value === "9999999";
// //         setShowOtherCity(isOther);
// //         setFormData(p => ({ ...p, CityID: value, CityName: isOther ? "" : p.CityName }));
// //     };

// //     const handleChange = useCallback((value, field) => {
// //         setFormData(prev => ({ ...prev, [field]: value }));
// //     }, []);

// //     useEffect(() => {
// //         fetchPromotingOrganizationData();
// //         // eslint-disable-next-line
// //     }, []);

// //     useEffect(() => {
// //     if (userInfo?.UserTypeID === 81) {
// //         setShowVerificationUI(true);
// //         // Set default reject reason 
// //         setRejectReason("ALREADY VERIFIED");
// //     }
// // }, [userInfo?.UserTypeID]);

// //     const fetchPromotingOrganizationData = async () => {
// //         startLoading();
// //         try {
// //             const resinstitute = await agent.get(
// //                 `${GetInstituteIDByInstituteCode}?InstituteCode=${userInfo?.UserLoginID}`
// //             );
// //             //const InstituteId = resinstitute.data.Data;

// //             const resorganisation = await agent.get(
// //                 `${GetPromotingOrganisationIDByInstituteID}/${resinstitute.data.Data}`
// //             );
// //             const PromotingOrganisationID = resorganisation?.data?.Data;

// //             if (userInfo.UserTypeID !== 61 && (!resorganisation?.data?.Data || resorganisation.data.Data === 0)) {
// //                 const result = await Swal.fire({
// //                     icon: "info",
// //                     title: "Not Mapped",
// //                     html: `
// //                         <div class="text-left">
// //                             <p class="mb-2">Promoting Organization for this Skill Development Institute is not mapped. To map the Promoting Organization, follow below mentioned process:</p>
// //                             <ol class="mt-2 ml-4 list-decimal text-left space-y-0">
// //                                 <li>Register Promoting Organization. Refer User Manual for Promoting Organization for detailed process</li>
// //                                 <li>Update "Affiliated Institutes" on "Associated Institute/s" page in Promoting Organization account.</li>
// //                                 <li>The Promoting Organization details shall be displayed on this page once "Affiliated Institutes" are updated.</li>
// //                             </ol>
// //                         </div>
// //                     `,
// //                     confirmButtonText: "OK",
// //                     customClass: {
// //                         confirmButton: "bg-[#00c3f9] hover:bg-[#00a8d6] text-white rounded px-6 py-2"
// //                     },
// //                     buttonsStyling: false,
// //                     allowOutsideClick: false,
// //                     allowEscapeKey: false
// //                 });

// //                 if (result.isConfirmed) {
// //                     window.history.back();
// //                 }
// //                 return;
// //             }

// //             const payload = {
// //                 ItemId: 0,
// //                 InstituteId: PromotingOrganisationID, //InstituteId,
// //                 UserLoginID: userInfo?.UserLoginID,
// //                 PageCode: "ExistingInstitute",
// //                 IPAddress: ""
// //             };

// //             const response = await agent.post(`${GetPromotingOrganisationDetails}`, payload);
// //             const data = response?.data;

// //             if (data && data.Status === "Success" && data.Data) {
// //                 setEditMode(true);
// //                 /* setFieldsDisabled(true);*/

// //                 const orgData = data.Data;

// //                 setFormData({
// //                     ProfileID: orgData.ApplicationID || "",
// //                     TypeOfPromotingOrganization: orgData.PromotingOrganisationTypeName || "",
// //                     GovernmentPrivateStatus: orgData.PromoterStatus || "",
// //                     NameOfPromotingOrganization: orgData.NameOfPromotingOrganization || "",
// //                     DateOfRegistration: orgData.PromotingOrganizationRegistrationDate,
// //                     RegistrationNumber: orgData.OrganizatioRegistrationNumber || "",
// //                     RegistrationCertificate: orgData.RegistrationCertificatePath || "",
// //                     PromotingOrganizationAddress: orgData.PromotingOrganizationAddress || "",
// //                     StateID: orgData.PromotingOrganizationStateID,
// //                     DistrictID: orgData.PromotingOrganizationDistrictID,
// //                     TalukaID: orgData.PromotingOrganizationTalukaID,
// //                     CityID: orgData.PromotingOrganizationCityID,
// //                     PinCode: orgData.PromotingOrganizationPincode,
// //                     PhoneCountryCode: "+91",
// //                     Phone: orgData.AuthorizedRepresentativeMobileNo,
// //                     Email: orgData.AuthorizedRepresentativeEMailID,
// //                     Website: orgData.Website || "",
// //                     PAN: orgData.PAN,
// //                     PANCard: orgData.PANPath,
// //                     PromotingOrganisationTypeName: orgData.PromotingOrganisationTypeName || "",
// //                     PromoterStatus: orgData.PromoterStatus || ""
// //                 });

// //                 setRegCertFileData({
// //                     fileName: orgData.RegistrationCertificateFileName,
// //                     uniqueFileName: orgData.RegistrationCertificatePath
// //                 });

// //                 setPanCardFileData({
// //                     fileName: orgData.PANCardFileName,
// //                     uniqueFileName: orgData.PANPath
// //                 });
// //             }
// //         } catch (error) {
// //             console.error("Fetch error:", error);
// //             Swal.fire("Error", "Failed to fetch organization info", "error");
// //         } finally {
// //             stopLoading();
// //         }
// //     };

// //     const formatDate = (dateString) => {
// //         if (!dateString) return "";
// //         const date = new Date(dateString);
// //         const mm = String(date.getMonth() + 1).padStart(2, "0");
// //         const dd = String(date.getDate()).padStart(2, "0");
// //         const yyyy = date.getFullYear();
// //         return `${mm}/${dd}/${yyyy}`;
// //     };

// //     const handleNext = () => {
// //         navigate("/institute/Promoters");
// //     };

// //     const handleInputChange = (name, value) => {
// //         setFormData(p => ({ ...p, [name]: value }));
// //         setErrors(p => ({ ...p, [name]: "" }));
// //     };

// //     const handlePhoneChange = (e) => {
// //         const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
// //         setFormData((prev) => ({ ...prev, Phone: onlyDigits }));
// //         setErrors((prev) => ({ ...prev, Phone: "" }));
// //     };

// //     const handleDropdownChange = async (name, value) => {
// //         setFormData((prev) => ({ ...prev, [name]: value }));
// //         setErrors((prev) => ({ ...prev, [name]: "" }));
// //     };

// //     const handleRegCertFile = (fileData) => {
// //         setRegCertFileData(fileData);
// //         setFormData((prev) => ({
// //             ...prev,
// //             RegistrationCertificate: fileData?.uniqueFileName || ""
// //         }));
// //         setErrors((prev) => ({ ...prev, RegistrationCertificate: "" }));
// //     };

// //     const handlePanCardFile = (fileData) => {
// //         setPanCardFileData(fileData);
// //         setFormData((prev) => ({
// //             ...prev,
// //             PANCard: fileData?.uniqueFileName || ""
// //         }));
// //         setErrors((prev) => ({ ...prev, PANCard: "" }));
// //     };

// //     const validate = () => {
// //         const newErrors = {};

// //         if (!formData.TypeOfPromotingOrganization)
// //             newErrors.TypeOfPromotingOrganization = "Type is required";
// //         if (!formData.GovernmentPrivateStatus)
// //             newErrors.GovernmentPrivateStatus = "Status required";
// //         if (!formData.NameOfPromotingOrganization)
// //             newErrors.NameOfPromotingOrganization = "Name required";
// //         if (!formData.DateOfRegistration)
// //             newErrors.DateOfRegistration = "Date required";
// //         if (!formData.RegistrationNumber)
// //             newErrors.RegistrationNumber = "Registration No. required";
// //         if (!formData.RegistrationCertificate)
// //             newErrors.RegistrationCertificate = "Upload certificate";
// //         if (!formData.PromotingOrganizationAddress)
// //             newErrors.PromotingOrganizationAddress = "Address required";
// //         if (!formData.StateID)
// //             newErrors.StateID = "State required";
// //         if (!formData.DistrictID)
// //             newErrors.DistrictID = "District required";
// //         if (!formData.TalukaID)
// //             newErrors.TalukaID = "Taluka required";
// //         if (!formData.CityID)
// //             newErrors.CityID = "City/Village required";
// //         if (!formData.PinCode)
// //             newErrors.PinCode = "Pin code required";
// //         else if (!/^[0-9]{6}$/.test(formData.PinCode))
// //             newErrors.PinCode = "Enter valid 6-digit pin";
// //         if (!formData.Phone)
// //             newErrors.Phone = "Phone required";
// //         else if (!/^[1-9][0-9]{9}$/.test(formData.Phone))
// //             newErrors.Phone = "Enter 10-digit phone";
// //         if (!formData.Email)
// //             newErrors.Email = "E-mail required";
// //         else if (!/^([a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,6})$/i.test(formData.Email))
// //             newErrors.Email = "Enter valid e-mail";
// //         if (!formData.PAN)
// //             newErrors.PAN = "PAN required";
// //         else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.PAN))
// //             newErrors.PAN = "Enter valid PAN (AAAAA9999A)";
// //         if (!formData.PANCard)
// //             newErrors.PANCard = "Upload PAN card";

// //         setErrors(newErrors);
// //         return Object.keys(newErrors).length === 0;
// //     };

// //     const handleSave = async () => {
// //         if (!validate()) return;

// //         startLoading();
// //         try {
// //             const response = await agent.post(
// //                 "/api/PromotionalOrganisation/SavePromotionalOrganisationDetails",
// //                 {
// //                     ...formData,
// //                     InstituteID: userInfo?.InstituteID,
// //                     UserLoginID: userInfo?.UserLoginID
// //                 }
// //             );
// //             if (response?.data?.success) {
// //                 Swal.fire("Success", "Saved successfully!", "success");
// //                 //setFieldsDisabled(true);
// //                 setEditMode(true);
// //             } else {
// //                 Swal.fire("Error", response?.data?.message || "Failed to save", "error");
// //             }
// //         } catch (err) {
// //             Swal.fire("Error", err?.message || "Failed to save", "error");
// //         } finally {
// //             stopLoading();
// //         }
// //     };

// //     const handleBack = () => {
// //         window.history.back();
// //     };

// //     const handleClose = () => {
// //         window.close();
// //     };

// //     if (isLoading) {
// //         return (
// //             <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
// //                 <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
// //             </div>
// //         );
// //     }

// //     const toInputDate = (value) => {
// //         if (!value) return "";
// //         return value.split("T")[0];
// //     };

// //     return (
// //         <div className="w-full p-4">
// //             {/* <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
// //                 <legend
// //                     className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
// //                 >
// //                     <FaBuilding className="mr-2 text-white" />
// //                     Promoting Organization
// //                 </legend> */}
// //             <fieldset className='mb-4 rounded-md border p-4'>
// //                 <legend className='flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white'>
// //                     <span>Promoting Organization</span>
// //                 </legend>

// //                 <div className="bg-pink-100 border border-pink-300 text-pink-800 px-3 py-2 rounded text-sm mx-4 mt-3 mb-3">
// //                     <strong>Note:</strong> To edit below populated information, log in to Promoting Organization account and edit profile.
// //                 </div>

// //                 <form className="w-full px-4 pb-3" autoComplete="off">
// //                     {/* Row 1: Profile ID and Name */}
// //                     <div className="grid grid-cols-4 gap-3 mb-3">
// //                         <div className="col-span-1">
// //                             <FormComponent
// //                                 label="Profile ID"
// //                                 name="ProfileID"
// //                                 value={formData.ProfileID}
// //                                 disabled
// //                                 readOnly
// //                             />
// //                         </div>
// //                         <div className="col-span-3">
// //                             <FormComponent
// //                                 label="Name of Promoting Organization"
// //                                 name="NameOfPromotingOrganization"
// //                                 value={formData.NameOfPromotingOrganization}
// //                                 onChange={(e) => handleInputChange("NameOfPromotingOrganization", e)}
// //                                 required
// //                                 error={errors.NameOfPromotingOrganization}
// //                                 disabled={fieldsDisabled}
// //                             />
// //                         </div>
// //                     </div>

// //                     {/* Row 2: Type and Government Status */}
// //                     <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
// //                         <div className="col-span-1">
// //                             <DropdownComponent
// //                                 label="Type of Promoting Organization"
// //                                 name="TypeOfPromotingOrganization"
// //                                 options={[
// //                                     {
// //                                         label: formData.PromotingOrganisationTypeName,
// //                                         value: formData.PromotingOrganisationTypeName || ""
// //                                     }
// //                                 ]}
// //                                 value={formData.PromotingOrganisationTypeName || ""}
// //                                 onChange={() => { }}
// //                                 error={errors.TypeOfPromotingOrganization}
// //                                 required
// //                                 loading={false}
// //                                 disabled
// //                             />
// //                         </div>
// //                         <div className="col-span-1">
// //                             <DropdownComponent
// //                                 label="Government/ Private Status"
// //                                 name="GovernmentPrivateStatus"
// //                                 options={[
// //                                     {
// //                                         label: formData.PromoterStatus,
// //                                         value: formData.PromoterStatus || ""
// //                                     }
// //                                 ]}
// //                                 value={formData.PromoterStatus || ""}
// //                                 onChange={() => { }}
// //                                 error={errors.GovernmentPrivateStatus}
// //                                 required
// //                                 loading={false}
// //                                 disabled
// //                             />
// //                         </div>
// //                     </div>

// //                     {/* Row 3: Date, Registration Number, Upload Certificate */}
// //                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
// //                         <div>
// //                             <FormComponent
// //                                 type="date"
// //                                 label="Registration/ Incorporation Date"
// //                                 name="DateOfRegistration"
// //                                 value={toInputDate(formData.DateOfRegistration)}
// //                                 onChange={(val) => handleInputChange('DateOfRegistration', val)}
// //                                 required
// //                                 error={errors.DateOfRegistration}
// //                                 disabled={fieldsDisabled}
// //                             />
// //                         </div>
// //                         <div>
// //                             <FormComponent
// //                                 label="Registration/ Incorporation/ GR. No."
// //                                 name="RegistrationNumber"
// //                                 value={formData.RegistrationNumber}
// //                                 onChange={(val) => handleInputChange('RegistrationNumber', val)}
// //                                 required
// //                                 error={errors.RegistrationNumber}
// //                                 disabled={fieldsDisabled}
// //                             />
// //                         </div>
// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                 Upload Registration/ Incorporation Certificate <span className="text-red-500">*</span>
// //                             </label>
// //                             <UploadPdf
// //                                 file={regCertFileData.fileName || ""}
// //                                 onFileChange={handleRegCertFile}
// //                                 buttonText="Upload"
// //                                 buttonClassName="bg-[#00c3f9] hover:bg-[#00a8d6]"
// //                                 label=""
// //                                 required={true}
// //                                 showLabel={false}
// //                                 allowedFileTypes="pdf"
// //                                 maxFileSize="5 MB"
// //                                 userTypeId={userInfo?.UserTypeID}
// //                                 userLoginID={userInfo?.UserLoginID}
// //                                 linkName="View "
// //                                 uniquefilepath={regCertFileData.uniqueFileName || ""}
// //                                 id="uploadRegCert"
// //                                 disabled={true}
// //                             />
// //                             {errors.RegistrationCertificate && (
// //                                 <div className="text-xs text-red-500 mt-1">{errors.RegistrationCertificate}</div>
// //                             )}
// //                         </div>
// //                     </div>

// //                     {/* Row 4: Address and Pin Code */}
// //                     <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
// //                         <div className="md:col-span-3">
// //                             <FormComponent
// //                                 label="Address as mentioned during Registration"
// //                                 name="PromotingOrganizationAddress"
// //                                 value={formData.PromotingOrganizationAddress}
// //                                 onChange={(val) => handleInputChange('PromotingOrganizationAddress', val)}
// //                                 required
// //                                 error={errors.PromotingOrganizationAddress}
// //                                 disabled={fieldsDisabled}
// //                                 as="textarea"
// //                                 rows={4}
// //                                 className="resize-none"
// //                             />
// //                         </div>
// //                         <div className="md:col-span-1">
// //                             <FormComponent
// //                                 label="Pin Code"
// //                                 name="PinCode"
// //                                 value={formData.PinCode}
// //                                 onChange={handlePincodeChange}
// //                                 required
// //                                 error={errors.PinCode}
// //                                 disabled={fieldsDisabled}
// //                                 maxLength={6}
// //                             />
// //                         </div>
// //                     </div>

// //                     {/* Row 5: State, District, Taluka, City/Village - WITH CASCADE */}
// //                     <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
// //                         <div>
// //                             <DropdownComponent
// //                                 label="State"
// //                                 name="StateID"
// //                                 options={formatOptions(states)}
// //                                 value={formData.StateID?.toString()}
// //                                 onChange={(value) => handleChange(value, "StateID")}
// //                                 error={errors.StateID}
// //                                 required={true}
// //                                 loading={stateLoading}
// //                                 disabled={fieldsDisabled}
// //                             />
// //                         </div>
// //                         <div>
// //                             <DropdownComponent
// //                                 label="District"
// //                                 name="DistrictID"
// //                                 options={formatOptions(districts)}
// //                                 value={formData.DistrictID?.toString()}
// //                                 onChange={(value) => handleChange(value, "DistrictID")}
// //                                 error={errors.DistrictID}
// //                                 required={true}
// //                                 loading={districtsLoading}
// //                                 disabled={fieldsDisabled || !formData.StateID}
// //                             />
// //                         </div>
// //                         <div>
// //                             <DropdownComponent
// //                                 label="Taluka"
// //                                 name="TalukaID"
// //                                 options={formatOptions(talukas)}
// //                                 value={formData.TalukaID?.toString()}
// //                                 onChange={(value) => handleChange(value, "TalukaID")}
// //                                 error={errors.TalukaID}
// //                                 required={true}
// //                                 loading={talukaLoading}
// //                                 disabled={fieldsDisabled || !formData.DistrictID}
// //                             />
// //                         </div>
// //                         <div>
// //                             <DropdownComponent
// //                                 label="City/ Village"
// //                                 name="CityID"
// //                                 options={formatOptions(cities)}
// //                                 value={formData.CityID?.toString()}
// //                                 onChange={handleCityChange}
// //                                 error={errors.CityID}
// //                                 required={true}
// //                                 loading={cityLoading}
// //                                 disabled={fieldsDisabled || !formData.TalukaID}
// //                             />
// //                             {showOtherCity && (
// //                                 <FormComponent
// //                                     label={t("labels.otherCity")}
// //                                     name="CityName"
// //                                     value={formData.CityName}
// //                                     onChange={(value) => handleInputChange('CityName', value)}
// //                                     error={errors.CityName}
// //                                     required
// //                                     placeholder="Enter city or village name"
// //                                 />
// //                             )}
// //                         </div>
// //                     </div>

// //                     {/* Row 6: Phone, Email, Website */}
// //                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 items-start">
// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700 mb-1 h-5">
// //                                 Phone No. <span className="text-red-500">*</span>
// //                             </label>
// //                             <div className="flex">
// //                                 <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
// //                                     +91
// //                                 </span>
// //                                 <input
// //                                     type="text"
// //                                     name="Phone"
// //                                     value={formData.Phone}
// //                                     onChange={handlePhoneChange}
// //                                     maxLength={10}
// //                                     inputMode="numeric"
// //                                     disabled={fieldsDisabled}
// //                                     className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
// //                                 />
// //                             </div>
// //                             {errors.Phone && (
// //                                 <div className="text-xs text-red-500 mt-1">{errors.Phone}</div>
// //                             )}
// //                         </div>
// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700 mb-1 h-5">
// //                                 E-Mail ID <span className="text-red-500">*</span>
// //                             </label>
// //                             <input
// //                                 type="email"
// //                                 name="Email"
// //                                 value={formData.Email}
// //                                 onChange={(value) => handleInputChange("Email", value)}
// //                                 disabled={fieldsDisabled}
// //                                 className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Email ? "border-red-500" : "border-gray-300"} disabled:bg-gray-100`}
// //                                 placeholder="Enter email"
// //                             />
// //                             {errors.Email && (
// //                                 <div className="text-xs text-red-500 mt-1">{errors.Email}</div>
// //                             )}
// //                         </div>
// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700 mb-1 h-5">
// //                                 Website
// //                             </label>
// //                             <input
// //                                 type="url"
// //                                 name="Website"
// //                                 value={formData.Website}
// //                                 onChange={(value) => handleInputChange("Website", value)}
// //                                 disabled={fieldsDisabled}
// //                                 className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Website ? "border-red-500" : "border-gray-300"} disabled:bg-gray-100`}
// //                                 placeholder="https://example.com"
// //                             />
// //                             {errors.Website && (
// //                                 <div className="text-xs text-red-500 mt-1">{errors.Website}</div>
// //                             )}
// //                         </div>
// //                     </div>

// //                     {/* Row 7: PAN and Upload PAN Card */}
// //                     <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
// //                         <div className="md:col-span-1">
// //                             <FormComponent
// //                                 label="Organization PAN No."
// //                                 name="PAN"
// //                                 value={formData.PAN}
// //                                 onChange={(value) => handleInputChange("PAN", value)}
// //                                 required
// //                                 error={errors.PAN}
// //                                 disabled={fieldsDisabled}
// //                                 maxLength={10}
// //                             />
// //                         </div>
// //                         <div className="md:col-span-2">
// //                             <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                 Upload Organization PAN Card <span className="text-red-500">*</span>
// //                             </label>
// //                             <UploadPdf
// //                                 file={panCardFileData.fileName || ""}
// //                                 onFileChange={handlePanCardFile}
// //                                 buttonText="Upload"
// //                                 buttonClassName="bg-[#00c3f9] hover:bg-[#00a8d6]"
// //                                 label=""
// //                                 required={true}
// //                                 showLabel={false}
// //                                 allowedFileTypes="pdf"
// //                                 maxFileSize="5 MB"
// //                                 userTypeId={userInfo?.UserTypeID}
// //                                 userLoginID={userInfo?.UserLoginID}
// //                                 linkName="View PAN Card"
// //                                 uniquefilepath={panCardFileData.uniqueFileName || ""}
// //                                 id="uploadPanCard"
// //                                 disabled={true}
// //                             />
// //                             {errors.PANCard && (
// //                                 <div className="text-xs text-red-500 mt-1">{errors.PANCard}</div>
// //                             )}
// //                         </div>
// //                     </div>

// //                     {/* Buttons */}
// //                     {/* <div className="flex justify-center items-center gap-4 mt-6">
// //                         <button
// //                             type="button"
// //                             className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
// //                             onClick={handleBack}
// //                         >
// //                             Back
// //                         </button>
// //                         {!fieldsDisabled && (
// //                             <button
// //                                 type="button"
// //                                 className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm"
// //                                 onClick={handleSave}
// //                             >
// //                                 Save and Next
// //                             </button>
// //                         )}
// //                         <button
// //                             type="button"
// //                             className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-semibold text-sm"
// //                             onClick={handleNext}
// //                         >
// //                             Next
// //                         </button>
// //                     </div> */}
// //                     <div className='flex justify-center gap-3 mt-6 mb-4'>
// //                         <Button variant='primary' onClick={handleBack}>
// //                             Back
// //                         </Button>
// //                         {!fieldsDisabled ? (
// //                             <Button variant='success' onClick={handleSave}>
// //                                 Save and Next
// //                             </Button>
// //                         ) : (
// //                             <Button variant='success' onClick={handleNext}>
// //                                 Next
// //                             </Button>

// //                         )}
// //                         <Button variant='danger' onClick={handleClose} >
// //                             Close
// //                         </Button>
// //                     </div>
// //                 </form>
// //             </fieldset>
// //         </div>
// //     );
// // };

// // export default PromotingOrganization;


// import { useContext, useState, useCallback, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { ThemeContext } from "../../Context/ThemeContext";
// import DropdownComponent from "../../formcomponent/DropdownComponent";
// import FormComponent from "../../formcomponent/FormComponent";
// import UploadPdf from "../../formcomponent/UploadPdf";
// import { useAuth } from "../../../Hooks/AuthContext";
// import Swal from "sweetalert2";
// import { useLoading } from "../../../Hooks/useLoading";
// import { useTranslation } from "react-i18next";
// import { useNavigate } from "react-router-dom";
// import {
//     GetInstituteIDByInstituteCode,
//     GetPromotingOrganisationIDByInstituteID,
//     GetPromotingOrganisationDetails,
//     GetPromotingOrganisationIDByTempInstituteID
// } from "../../../Endpoints_All/Base/Institute";
// import agent from "../../../lib/api/agent";
// import { useFormMode } from "../../../lib/hooks/useFormMode";
// import {
//     useStates,
//     useDistricts,
//     useTalukas,
//     useCities,
//     usePincodeLookup,
// } from "../../../lib/hooks/useAddressQueries";
// import { SwalHelper } from "../../../utils/swalHelper";
// import { useCascadingAddress } from "../../../lib/hooks/useCascadingAddress";
// import { formatOptions } from "../../../utils/CommonHelper";
// import Button from "../../base/Button";

// const initialFormState = {
//     ProfileID: "",
//     TypeOfPromotingOrganization: "",
//     GovernmentPrivateStatus: "",
//     NameOfPromotingOrganization: "",
//     DateOfRegistration: "",
//     RegistrationNumber: "",
//     RegistrationCertificate: "",
//     PromotingOrganizationAddress: "",
//     StateID: "",
//     DistrictID: "",
//     TalukaID: "",
//     CityID: "",
//     CityName: "",
//     PinCode: "",
//     PhoneCountryCode: "+91",
//     Phone: "",
//     Email: "",
//     Website: "",
//     PAN: "",
//     PANCard: "",
//     PromotingOrganisationTypeName: "",
//     PromoterStatus: ""
// };

// const PromotingOrganization = () => {

//     const { color } = useContext(ThemeContext);
//     const { t } = useTranslation("promotorOrgRegistration");
//     const { userInfo } = useAuth();
//     const { startLoading, stopLoading, isLoading } = useLoading();
//     const navigate = useNavigate();
//     const location = useLocation();

//     const [formData, setFormData] = useState(initialFormState);
//     const [errors, setErrors] = useState({});
//     const [editMode, setEditMode] = useState(false);
//     const [showOtherCity, setShowOtherCity] = useState(false);
//     const [isAutoFillingAddress, setIsAutoFillingAddress] = useState(false);
//     const [showVerificationUI, setShowVerificationUI] = useState(false);
//     const [approvalStatus, setApprovalStatus] = useState('');
//     const [rejectReason, setRejectReason] = useState('');
//     const [existingStatus, setExistingStatus] = useState('');
//     const [existingRemark, setExistingRemark] = useState('');
//     const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
//     const [isVerificationLocked, setIsVerificationLocked] = useState(false);

//     const { fieldsDisabled } = useFormMode(userInfo.UserTypeID);

//     // File/PDF paths
//     const [regCertFileData, setRegCertFileData] = useState({});
//     const [panCardFileData, setPanCardFileData] = useState({});

//     const getHashCode = (str) => {
//         if (!str) return 0;
//         let hash = 0;
//         for (let i = 0; i < str.length; i++) {
//             hash = ((hash << 5) - hash) + str.charCodeAt(i);
//             hash |= 0;
//         }
//         return Math.abs(hash);
//     };

//     const getInstituteIdForSecretary = () => {

//         const searchParams = new URLSearchParams(location.search);
//         let p1 = searchParams.get('P1');
//         let p2 = searchParams.get('P2');

//         if (p1 && p2) {
//             const calculatedHash = getHashCode(p1).toString();
//             if (calculatedHash === p2) {
//                 return parseInt(p1);
//             }
//         } else if (p1) {
//             return parseInt(p1);
//         }

//         // Second, try to get from sessionStorage
//         const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll")) || {};
//         const instituteIdFromSession = userInfoAll?.InstituteID;
//         if (instituteIdFromSession) {
//             console.log('Using InstituteID from sessionStorage:', instituteIdFromSession);
//             return parseInt(instituteIdFromSession);
//         }

//         // Third, try to get from userInfo
//         if (userInfo?.InstituteID) {
//             console.log('Using InstituteID from userInfo:', userInfo.InstituteID);
//             return parseInt(userInfo.InstituteID);
//         }

//         console.log('No institute ID found. URL:', window.location.href);
//         return null;
//     };
//     useCascadingAddress(formData, setFormData, isAutoFillingAddress);

//     // Dropdown data
//     const { data: states, loading: stateLoading } = useStates();
//     const { data: districts, loading: districtsLoading } = useDistricts(formData.StateID);
//     const { data: talukas, loading: talukaLoading } = useTalukas(formData.DistrictID);
//     const { data: cities, loading: cityLoading } = useCities(formData.TalukaID);
//     const { getPincode } = usePincodeLookup();

//     const handlePincodeChange = useCallback(async (value) => {
//         const pin = value.replace(/\D/g, "").slice(0, 6);
//         setFormData(p => ({ ...p, PinCode: pin }));

//         setErrors(prev => {
//             const { PinCode, ...rest } = prev;
//             return rest;
//         });

//         if (pin.length < 6) {
//             setFormData(prev => ({
//                 ...prev,
//                 StateID: "",
//                 DistrictID: "",
//                 TalukaID: "",
//                 CityID: ""
//             }));
//             return;
//         }

//         if (pin.length !== 6) return;

//         try {
//             setIsAutoFillingAddress(true);
//             const res = await getPincode(pin);
//             if (res.Status !== "Success") return;

//             const { StateID, DistrictID, TalukaID, CityID } = res.Data;
//             setFormData(prev => ({
//                 ...prev,
//                 PinCode: pin,
//                 StateID,
//                 DistrictID,
//                 TalukaID,
//                 CityID
//             }));
//         } catch {
//             SwalHelper.error("Invalid Pincode");
//         } finally {
//             setTimeout(() => setIsAutoFillingAddress(false), 0);
//         }
//     }, []);

//     const handleCityChange = (value) => {
//         const isOther = value === "9999999";
//         setShowOtherCity(isOther);
//         setFormData(p => ({ ...p, CityID: value, CityName: isOther ? "" : p.CityName }));
//     };

//     const handleChange = useCallback((value, field) => {
//         setFormData(prev => ({ ...prev, [field]: value }));
//     }, []);



//     const fetchPromotingOrganizationData = async () => {
//         startLoading();
//         try {
//             let promotingOrgId;

//             // Handle Secretary login (User Type 81)
//             if (userInfo?.UserTypeID === 81) {
//                 // Get temp institute ID from URL or session
//                 let tempInstituteId = getInstituteIdForSecretary();
//                 console.log('===== SECRETARY DEBUG =====');
//                 console.log('Temp Institute ID:', tempInstituteId);
//                 console.log('Current URL:', window.location.href);
//                 console.log('Location search:', location.search);

//                 if (!tempInstituteId) {
//                     console.log('No temp institute ID found - showing not mapped alert');
//                     showNotMappedAlert();
//                     return;
//                 }

//                 // Log the API endpoint being called
//                 const convertUrl = `${GetPromotingOrganisationIDByTempInstituteID}/${tempInstituteId}`;
//                 console.log('Calling convert API:', convertUrl);

//                 // Convert temp institute ID to promoting organisation ID
//                 const convertResponse = await agent.get(convertUrl);
//                 console.log('Convert API Full Response:', convertResponse);
//                 console.log('Convert API Response Data:', convertResponse?.data);
//                 console.log('Convert API Response Data.Data:', convertResponse?.data?.Data);

//                 promotingOrgId = convertResponse?.data?.Data;
//                 console.log('Converted Promoting Org ID:', promotingOrgId);

//                 if (!promotingOrgId || promotingOrgId === 0) {
//                     console.log('Converted ID is null or 0 - showing not mapped alert');
//                     showNotMappedAlert();
//                     return;
//                 }
//             } else {
//                 // Handle Institute login
//                 console.log('===== INSTITUTE USER DEBUG =====');
//                 const resinstitute = await agent.get(
//                     `${GetInstituteIDByInstituteCode}?InstituteCode=${userInfo?.UserLoginID}`
//                 );
//                 const instituteId = resinstitute.data.Data;
//                 console.log('Institute ID from code:', instituteId);

//                 const resorganisation = await agent.get(
//                     `${GetPromotingOrganisationIDByInstituteID}/${instituteId}`
//                 );
//                 promotingOrgId = resorganisation?.data?.Data;
//                 console.log('Promoting Org ID from institute:', promotingOrgId);

//                 if (userInfo.UserTypeID !== 61 && (!promotingOrgId || promotingOrgId === 0)) {
//                     showNotMappedAlert();
//                     return;
//                 }
//             }

//             // If we get here, we have a valid promotingOrgId
//             console.log('Final Promoting Org ID to fetch details:', promotingOrgId);

//             const payload = {
//                 ItemId: 0,
//                 InstituteId: promotingOrgId,
//                 UserLoginID: userInfo?.UserLoginID,
//                 PageCode: "ExistingInstitute",
//                 IPAddress: ""
//             };
//             console.log('GetPromotingOrganisationDetails payload:', payload);

//             const response = await agent.post(`${GetPromotingOrganisationDetails}`, payload);
//             console.log('GetPromotingOrganisationDetails Response:', response);
//             const data = response?.data;
//             console.log('Response data:', data);

//             if (data && data.Status === "Success" && data.Data) {
//                 console.log('Organization data found:', data.Data);
//                 setEditMode(true);
//                 const orgData = data.Data;

//                 setFormData({
//                     ProfileID: orgData.ApplicationID || "",
//                     TypeOfPromotingOrganization: orgData.PromotingOrganisationTypeName || "",
//                     GovernmentPrivateStatus: orgData.PromoterStatus || "",
//                     NameOfPromotingOrganization: orgData.NameOfPromotingOrganization || "",
//                     DateOfRegistration: orgData.PromotingOrganizationRegistrationDate,
//                     RegistrationNumber: orgData.OrganizatioRegistrationNumber || "",
//                     RegistrationCertificate: orgData.RegistrationCertificatePath || "",
//                     PromotingOrganizationAddress: orgData.PromotingOrganizationAddress || "",
//                     StateID: orgData.PromotingOrganizationStateID,
//                     DistrictID: orgData.PromotingOrganizationDistrictID,
//                     TalukaID: orgData.PromotingOrganizationTalukaID,
//                     CityID: orgData.PromotingOrganizationCityID,
//                     PinCode: orgData.PromotingOrganizationPincode,
//                     PhoneCountryCode: "+91",
//                     Phone: orgData.AuthorizedRepresentativeMobileNo,
//                     Email: orgData.AuthorizedRepresentativeEMailID,
//                     Website: orgData.Website || "",
//                     PAN: orgData.PAN,
//                     PANCard: orgData.PANPath,
//                     PromotingOrganisationTypeName: orgData.PromotingOrganisationTypeName || "",
//                     PromoterStatus: orgData.PromoterStatus || ""
//                 });

//                 setRegCertFileData({
//                     fileName: orgData.RegistrationCertificateFileName,
//                     uniqueFileName: orgData.RegistrationCertificatePath
//                 });

//                 setPanCardFileData({
//                     fileName: orgData.PANCardFileName,
//                     uniqueFileName: orgData.PANPath
//                 });

//                 // Fetch verification status for secretary
//               // In the Secretary section where you fetch verification status
// if (userInfo?.UserTypeID === 81 && promotingOrgId) {
//     try {
//         const instituteId = getInstituteIdForSecretary();
//         console.log('Fetching verification status for institute:', instituteId);
//         const statusResponse = await agent.get(`/api/InstituteBase/GetProposedInstituteStatus/${instituteId}`);
//         console.log('Verification status response:', statusResponse.data);

//         if (statusResponse.data?.Data) {
//             const statusData = statusResponse.data.Data;
//             setExistingStatus(statusData.IsPromotingOrganization);
//             setExistingRemark(statusData.PromotingOrganizationRemark);

//             if (statusData.IsPromotingOrganization === "V") {
//                 setApprovalStatus("V");
//                 setRejectReason("ALREADY VERIFIED");
//                 setIsAlreadyVerified(true);
//                 setIsVerificationLocked(true);  
//             } else if (statusData.IsPromotingOrganization === "R") {
//                 setApprovalStatus("R");
//                 setRejectReason(statusData.PromotingOrganizationRemark || "");
//                 setIsVerificationLocked(false); 
//             } else {
//                 setApprovalStatus("");
//                 setIsVerificationLocked(false); 
//             }
//         }
//     } catch (error) {
//         console.error("Error fetching verification status:", error);
//     }
// }
//             } else {
//                 console.log('No data found in response or Status not Success');
//             }
//         } catch (error) {
//             console.error("Fetch error:", error);
//             Swal.fire("Error", "Failed to fetch organization info", "error");
//         } finally {
//             stopLoading();
//         }
//     };
//     useEffect(() => {
//         fetchPromotingOrganizationData();
//     }, []);

//     useEffect(() => {
//         if (userInfo?.UserTypeID === 81) {
//             setShowVerificationUI(true);
//             setIsVerificationLocked(true)
//         }
//     }, [userInfo?.UserTypeID]);

//     const showNotMappedAlert = async () => {
//         const result = await Swal.fire({
//             icon: "info",
//             title: "Not Mapped",
//             html: `
//                 <div class="text-left">
//                     <p class="mb-2">Promoting Organization for this Skill Development Institute is not mapped. To map the Promoting Organization, follow below mentioned process:</p>
//                     <ol class="mt-2 ml-4 list-decimal text-left space-y-0">
//                         <li>Register Promoting Organization. Refer User Manual for Promoting Organization for detailed process</li>
//                         <li>Update "Affiliated Institutes" on "Associated Institute/s" page in Promoting Organization account.</li>
//                         <li>The Promoting Organization details shall be displayed on this page once "Affiliated Institutes" are updated.</li>
//                     </ol>
//                 </div>
//             `,
//             confirmButtonText: "OK",
//             customClass: {
//                 confirmButton: "bg-[#00c3f9] hover:bg-[#00a8d6] text-white rounded px-6 py-2"
//             },
//             buttonsStyling: false,
//             allowOutsideClick: false,
//             allowEscapeKey: false
//         });

//         if (result.isConfirmed) {
//             window.history.back();
//         }
//     };

//     const handleInputChange = (name, value) => {
//         setFormData(p => ({ ...p, [name]: value }));
//         setErrors(p => ({ ...p, [name]: "" }));
//     };

//     const handlePhoneChange = (e) => {
//         const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
//         setFormData((prev) => ({ ...prev, Phone: onlyDigits }));
//         setErrors((prev) => ({ ...prev, Phone: "" }));
//     };

//     const handleRegCertFile = (fileData) => {
//         setRegCertFileData(fileData);
//         setFormData((prev) => ({
//             ...prev,
//             RegistrationCertificate: fileData?.uniqueFileName || ""
//         }));
//         setErrors((prev) => ({ ...prev, RegistrationCertificate: "" }));
//     };

//     const handlePanCardFile = (fileData) => {
//         setPanCardFileData(fileData);
//         setFormData((prev) => ({
//             ...prev,
//             PANCard: fileData?.uniqueFileName || ""
//         }));
//         setErrors((prev) => ({ ...prev, PANCard: "" }));
//     };

//     const handleSave = async () => {
//         if (userInfo?.UserTypeID === 81) {
//             if (!approvalStatus) {
//                 Swal.fire("Error", "Select Approved Reject Status", "error");
//                 return;
//             }
//             if (approvalStatus === "R" && !rejectReason.trim()) {
//                 Swal.fire("Error", "Enter Reason for Rejection", "error");
//                 return;
//             }

//             startLoading();
//             try {
//                 const instituteId = getInstituteIdForSecretary();
//                 const payload = {
//                     instituteID: instituteId,
//                     remark: rejectReason.toUpperCase(),
//                     status: approvalStatus,
//                     pageCode: "PromotingOrganization",
//                     createdBy: userInfo?.UserLoginID,
//                     ipAddress: "127.0.0.1"
//                 };

//                 const response = await agent.post("/api/InstituteBase/update-verification-status", payload);

//                 if (response.data?.success) {
//                     Swal.fire("Success", "Status updated successfully", "success");
//                     navigate(`/Institute/PromotersDetails?P1=${instituteId}`);
//                 } else {
//                     Swal.fire("Error", response.data?.message || "Update failed", "error");
//                 }
//             } catch (error) {
//                 console.error(error);
//                 Swal.fire("Error", "Something went wrong", "error");
//             } finally {
//                 stopLoading();
//             }
//         } else {
//             // Institute user save logic
//             if (!validate()) return;
//             startLoading();
//             try {
//                 const response = await agent.post(
//                     "/api/PromotionalOrganisation/SavePromotionalOrganisationDetails",
//                     {
//                         ...formData,
//                         InstituteID: userInfo?.InstituteID,
//                         UserLoginID: userInfo?.UserLoginID
//                     }
//                 );
//                 if (response?.data?.success) {
//                     Swal.fire("Success", "Saved successfully!", "success");
//                     setEditMode(true);
//                 } else {
//                     Swal.fire("Error", response?.data?.message || "Failed to save", "error");
//                 }
//             } catch (err) {
//                 Swal.fire("Error", err?.message || "Failed to save", "error");
//             } finally {
//                 stopLoading();
//             }
//         }
//     };

//     const handleNext = () => {
//         if (userInfo?.UserTypeID === 81) {
//             const instituteId = getInstituteIdForSecretary();
//             navigate(`/Institute/PromotersDetails?P1=${instituteId}`);
//         } else {
//             navigate("/institute/Promoters");
//         }
//     };

//     const handleBack = () => {
//         if (userInfo?.UserTypeID === 81) {
//             const instituteId = getInstituteIdForSecretary();
//             navigate(`/SDILOI/InstituteDash?P1=${instituteId}`);
//         } else {
//             window.history.back();
//         }
//     };

//     const handleClose = () => {
//         if (userInfo?.UserTypeID === 81) {
//             const instituteId = getInstituteIdForSecretary();
//             navigate(`/InstituteDash?P1=${instituteId}&P2=${String(instituteId).getHashCode()}`);
//         } else {
//             window.close();
//         }
//     };

//     const validate = () => {
//         const newErrors = {};

//         if (!formData.TypeOfPromotingOrganization)
//             newErrors.TypeOfPromotingOrganization = "Type is required";
//         if (!formData.GovernmentPrivateStatus)
//             newErrors.GovernmentPrivateStatus = "Status required";
//         if (!formData.NameOfPromotingOrganization)
//             newErrors.NameOfPromotingOrganization = "Name required";
//         if (!formData.DateOfRegistration)
//             newErrors.DateOfRegistration = "Date required";
//         if (!formData.RegistrationNumber)
//             newErrors.RegistrationNumber = "Registration No. required";
//         if (!formData.RegistrationCertificate)
//             newErrors.RegistrationCertificate = "Upload certificate";
//         if (!formData.PromotingOrganizationAddress)
//             newErrors.PromotingOrganizationAddress = "Address required";
//         if (!formData.StateID)
//             newErrors.StateID = "State required";
//         if (!formData.DistrictID)
//             newErrors.DistrictID = "District required";
//         if (!formData.TalukaID)
//             newErrors.TalukaID = "Taluka required";
//         if (!formData.CityID)
//             newErrors.CityID = "City/Village required";
//         if (!formData.PinCode)
//             newErrors.PinCode = "Pin code required";
//         else if (!/^[0-9]{6}$/.test(formData.PinCode))
//             newErrors.PinCode = "Enter valid 6-digit pin";
//         if (!formData.Phone)
//             newErrors.Phone = "Phone required";
//         else if (!/^[1-9][0-9]{9}$/.test(formData.Phone))
//             newErrors.Phone = "Enter 10-digit phone";
//         if (!formData.Email)
//             newErrors.Email = "E-mail required";
//         else if (!/^([a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,6})$/i.test(formData.Email))
//             newErrors.Email = "Enter valid e-mail";
//         if (!formData.PAN)
//             newErrors.PAN = "PAN required";
//         else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.PAN))
//             newErrors.PAN = "Enter valid PAN (AAAAA9999A)";
//         if (!formData.PANCard)
//             newErrors.PANCard = "Upload PAN card";

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const toInputDate = (value) => {
//         if (!value) return "";
//         return value.split("T")[0];
//     };

//     if (isLoading) {
//         return (
//             <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
//             </div>
//         );
//     }

//     return (
//         <div className="w-full p-4">
//             <fieldset className='mb-4 rounded-md border p-4'>
//                 <legend className='flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white'>
//                     <span>Promoting Organization</span>
//                 </legend>

//                 <div className="bg-pink-100 border border-pink-300 text-pink-800 px-3 py-2 rounded text-sm mx-4 mt-3 mb-3">
//                     <strong>Note:</strong> To edit below populated information, log in to Promoting Organization account and edit profile.
//                 </div>

//                 <form className="w-full px-4 pb-3" autoComplete="off">
//                     {/* Form Fields */}
//                     <div className="grid grid-cols-4 gap-3 mb-3">
//                         <div className="col-span-1">
//                             <FormComponent
//                                 label="Profile ID"
//                                 name="ProfileID"
//                                 value={formData.ProfileID}
//                                 disabled
//                                 readOnly
//                             />
//                         </div>
//                         <div className="col-span-3">
//                             <FormComponent
//                                 label="Name of Promoting Organization"
//                                 name="NameOfPromotingOrganization"
//                                 value={formData.NameOfPromotingOrganization}
//                                 onChange={(e) => handleInputChange("NameOfPromotingOrganization", e)}
//                                 required
//                                 error={errors.NameOfPromotingOrganization}
//                                 disabled={fieldsDisabled}
//                             />
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
//                         <div className="col-span-1">
//                             <DropdownComponent
//                                 label="Type of Promoting Organization"
//                                 name="TypeOfPromotingOrganization"
//                                 options={[
//                                     {
//                                         label: formData.PromotingOrganisationTypeName,
//                                         value: formData.PromotingOrganisationTypeName || ""
//                                     }
//                                 ]}
//                                 value={formData.PromotingOrganisationTypeName || ""}
//                                 onChange={() => { }}
//                                 error={errors.TypeOfPromotingOrganization}
//                                 required
//                                 loading={false}
//                                 disabled
//                             />
//                         </div>
//                         <div className="col-span-1">
//                             <DropdownComponent
//                                 label="Government/ Private Status"
//                                 name="GovernmentPrivateStatus"
//                                 options={[
//                                     {
//                                         label: formData.PromoterStatus,
//                                         value: formData.PromoterStatus || ""
//                                     }
//                                 ]}
//                                 value={formData.PromoterStatus || ""}
//                                 onChange={() => { }}
//                                 error={errors.GovernmentPrivateStatus}
//                                 required
//                                 loading={false}
//                                 disabled
//                             />
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
//                         <div>
//                             <FormComponent
//                                 type="date"
//                                 label="Registration/ Incorporation Date"
//                                 name="DateOfRegistration"
//                                 value={toInputDate(formData.DateOfRegistration)}
//                                 onChange={(val) => handleInputChange('DateOfRegistration', val)}
//                                 required
//                                 error={errors.DateOfRegistration}
//                                 disabled={fieldsDisabled}
//                             />
//                         </div>
//                         <div>
//                             <FormComponent
//                                 label="Registration/ Incorporation/ GR. No."
//                                 name="RegistrationNumber"
//                                 value={formData.RegistrationNumber}
//                                 onChange={(val) => handleInputChange('RegistrationNumber', val)}
//                                 required
//                                 error={errors.RegistrationNumber}
//                                 disabled={fieldsDisabled}
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Upload Registration/ Incorporation Certificate <span className="text-red-500">*</span>
//                             </label>
//                             <UploadPdf
//                                 file={regCertFileData.fileName || ""}
//                                 onFileChange={handleRegCertFile}
//                                 buttonText="Upload"
//                                 buttonClassName="bg-[#00c3f9] hover:bg-[#00a8d6]"
//                                 label=""
//                                 required={true}
//                                 showLabel={false}
//                                 allowedFileTypes="pdf"
//                                 maxFileSize="5 MB"
//                                 userTypeId={userInfo?.UserTypeID}
//                                 userLoginID={userInfo?.UserLoginID}
//                                 linkName="View "
//                                 uniquefilepath={regCertFileData.uniqueFileName || ""}
//                                 id="uploadRegCert"
//                                 disabled={true}
//                             />
//                             {errors.RegistrationCertificate && (
//                                 <div className="text-xs text-red-500 mt-1">{errors.RegistrationCertificate}</div>
//                             )}
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
//                         <div className="md:col-span-3">
//                             <FormComponent
//                                 label="Address as mentioned during Registration"
//                                 name="PromotingOrganizationAddress"
//                                 value={formData.PromotingOrganizationAddress}
//                                 onChange={(val) => handleInputChange('PromotingOrganizationAddress', val)}
//                                 required
//                                 error={errors.PromotingOrganizationAddress}
//                                 disabled={fieldsDisabled}
//                                 as="textarea"
//                                 rows={4}
//                                 className="resize-none"
//                             />
//                         </div>
//                         <div className="md:col-span-1">
//                             <FormComponent
//                                 label="Pin Code"
//                                 name="PinCode"
//                                 value={formData.PinCode}
//                                 onChange={handlePincodeChange}
//                                 required
//                                 error={errors.PinCode}
//                                 disabled={fieldsDisabled}
//                                 maxLength={6}
//                             />
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
//                         <div>
//                             <DropdownComponent
//                                 label="State"
//                                 name="StateID"
//                                 options={formatOptions(states)}
//                                 value={formData.StateID?.toString()}
//                                 onChange={(value) => handleChange(value, "StateID")}
//                                 error={errors.StateID}
//                                 required={true}
//                                 loading={stateLoading}
//                                 disabled={fieldsDisabled}
//                             />
//                         </div>
//                         <div>
//                             <DropdownComponent
//                                 label="District"
//                                 name="DistrictID"
//                                 options={formatOptions(districts)}
//                                 value={formData.DistrictID?.toString()}
//                                 onChange={(value) => handleChange(value, "DistrictID")}
//                                 error={errors.DistrictID}
//                                 required={true}
//                                 loading={districtsLoading}
//                                 disabled={fieldsDisabled || !formData.StateID}
//                             />
//                         </div>
//                         <div>
//                             <DropdownComponent
//                                 label="Taluka"
//                                 name="TalukaID"
//                                 options={formatOptions(talukas)}
//                                 value={formData.TalukaID?.toString()}
//                                 onChange={(value) => handleChange(value, "TalukaID")}
//                                 error={errors.TalukaID}
//                                 required={true}
//                                 loading={talukaLoading}
//                                 disabled={fieldsDisabled || !formData.DistrictID}
//                             />
//                         </div>
//                         <div>
//                             <DropdownComponent
//                                 label="City/ Village"
//                                 name="CityID"
//                                 options={formatOptions(cities)}
//                                 value={formData.CityID?.toString()}
//                                 onChange={handleCityChange}
//                                 error={errors.CityID}
//                                 required={true}
//                                 loading={cityLoading}
//                                 disabled={fieldsDisabled || !formData.TalukaID}
//                             />
//                             {showOtherCity && (
//                                 <FormComponent
//                                     label={t("labels.otherCity")}
//                                     name="CityName"
//                                     value={formData.CityName}
//                                     onChange={(value) => handleInputChange('CityName', value)}
//                                     error={errors.CityName}
//                                     required
//                                     placeholder="Enter city or village name"
//                                 />
//                             )}
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 items-start">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1 h-5">
//                                 Phone No. <span className="text-red-500">*</span>
//                             </label>
//                             <div className="flex">
//                                 <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
//                                     +91
//                                 </span>
//                                 <input
//                                     type="text"
//                                     name="Phone"
//                                     value={formData.Phone}
//                                     onChange={handlePhoneChange}
//                                     maxLength={10}
//                                     inputMode="numeric"
//                                     disabled={fieldsDisabled}
//                                     className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
//                                 />
//                             </div>
//                             {errors.Phone && (
//                                 <div className="text-xs text-red-500 mt-1">{errors.Phone}</div>
//                             )}
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1 h-5">
//                                 E-Mail ID <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="email"
//                                 name="Email"
//                                 value={formData.Email}
//                                 onChange={(value) => handleInputChange("Email", value)}
//                                 disabled={fieldsDisabled}
//                                 className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Email ? "border-red-500" : "border-gray-300"} disabled:bg-gray-100`}
//                                 placeholder="Enter email"
//                             />
//                             {errors.Email && (
//                                 <div className="text-xs text-red-500 mt-1">{errors.Email}</div>
//                             )}
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1 h-5">
//                                 Website
//                             </label>
//                             <input
//                                 type="url"
//                                 name="Website"
//                                 value={formData.Website}
//                                 onChange={(value) => handleInputChange("Website", value)}
//                                 disabled={fieldsDisabled}
//                                 className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.Website ? "border-red-500" : "border-gray-300"} disabled:bg-gray-100`}
//                                 placeholder="https://example.com"
//                             />
//                             {errors.Website && (
//                                 <div className="text-xs text-red-500 mt-1">{errors.Website}</div>
//                             )}
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
//                         <div className="md:col-span-1">
//                             <FormComponent
//                                 label="Organization PAN No."
//                                 name="PAN"
//                                 value={formData.PAN}
//                                 onChange={(value) => handleInputChange("PAN", value)}
//                                 required
//                                 error={errors.PAN}
//                                 disabled={fieldsDisabled}
//                                 maxLength={10}
//                             />
//                         </div>
//                         <div className="md:col-span-2">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Upload Organization PAN Card <span className="text-red-500">*</span>
//                             </label>
//                             <UploadPdf
//                                 file={panCardFileData.fileName || ""}
//                                 onFileChange={handlePanCardFile}
//                                 buttonText="Upload"
//                                 buttonClassName="bg-[#00c3f9] hover:bg-[#00a8d6]"
//                                 label=""
//                                 required={true}
//                                 showLabel={false}
//                                 allowedFileTypes="pdf"
//                                 maxFileSize="5 MB"
//                                 userTypeId={userInfo?.UserTypeID}
//                                 userLoginID={userInfo?.UserLoginID}
//                                 linkName="View PAN Card"
//                                 uniquefilepath={panCardFileData.uniqueFileName || ""}
//                                 id="uploadPanCard"
//                                 disabled={true}
//                             />
//                             {errors.PANCard && (
//                                 <div className="text-xs text-red-500 mt-1">{errors.PANCard}</div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Secretary Verification Section */}
//                     {showVerificationUI && userInfo?.UserTypeID === 81 && (
//                         <div className="mt-6 border rounded-lg p-4 bg-gray-50">
//                             <h3 className="text-md font-normal mb-3">Select Approved Reject Status <span className="text-red-500">*</span></h3>
//                             <div className="flex gap-6 mb-4">
//                                 <label className="inline-flex items-center">
//                                     <input
//                                         type="radio"
//                                         value="V"
//                                         checked={approvalStatus === 'V'}
//                                         disabled={isVerificationLocked}
//                                     />
//                                     <span className="ml-2 text-sm">Verified</span>
//                                 </label>
//                                 <label className="inline-flex items-center">
//                                     <input
//                                         type="radio"
//                                         value="R"
//                                         checked={approvalStatus === 'R'}
//                                         disabled={isVerificationLocked}
//                                     />
//                                     <span className="ml-2 text-sm">Rejected</span>
//                                 </label>
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-normal mb-2">
//                                     Reason for Rejection/ Remark
//                                     {approvalStatus === 'R' && <span className="text-red-500">*</span>}
//                                 </label>
//                                 <textarea
//                                     className="w-full border border-gray-300 rounded-md p-2 text-sm uppercase"
//                                     rows="3"
//                                     value={rejectReason}
//                                     onChange={(e) => setRejectReason(e.target.value.toUpperCase())}
//                                     disabled={isVerificationLocked}
//                                     placeholder="Enter remark..."
//                                 />
//                             </div>
//                             {existingStatus === "V" && (
//                                 <div className="mt-2 text-green-600 text-sm">Previously Verified</div>
//                             )}
//                         </div>
//                     )}

//                     {/* Action Buttons */}
//                     <div className='flex justify-center gap-3 mt-6 mb-4'>
//                         <Button variant='primary' onClick={handleBack}>
//                             Back
//                         </Button>
//                         {userInfo?.UserTypeID === 81 ? (
//                             <Button variant='success' onClick={handleSave}>
//                                 Save & Next
//                             </Button>
//                         ) : (
//                             !fieldsDisabled ? (
//                                 <Button variant='success' onClick={handleSave}>
//                                     Save and Next
//                                 </Button>
//                             ) : (
//                                 <Button variant='success' onClick={handleNext}>
//                                     Next
//                                 </Button>
//                             )
//                         )}
//                         <Button variant='danger' onClick={handleClose}>
//                             Close
//                         </Button>
//                     </div>
//                 </form>
//             </fieldset>
//         </div>
//     );
// };

// export default PromotingOrganization;