import React, { useContext, useEffect, useState } from "react";
import { Menu, Search } from "lucide-react";
import UploadPdf from "../../../Component/formcomponent/UploadPdf.jsx";
import { ThemeContext } from "../../../Component/Context/ThemeContext.jsx";
import FormComponent from "../../../Component/formcomponent/FormComponent.jsx";
import Button from "../../../Component/base/Button.jsx";
import { Cancel } from "@mui/icons-material";
import agent from "../../../lib/api/agent.jsx";
import { GetCandidatePhotoDetails, UpdateFixedOrientationImage } from "../../../Endpoints_All/Administration/admin.jsx";
import Swal from "sweetalert2";
import { useAuth } from "../../../hooks/AuthContext.jsx";
import { getDeviceIP } from "../../../utils/CommonHelper.jsx";

const UpdateFixedOrientationIssueImage = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const [profileNo, setProfileNo] = useState("");
    const [formData, setFormData] = useState({});
    const [searched, setSearched] = useState(false);
    const [ipAddress, setIpAddress] = useState("");

    useEffect(() => {
        const fetchIP = async () => {
            try {
                const ip = await getDeviceIP();
                setIpAddress(ip);
            } catch (err) {
                console.error("Failed to get IP:", err);
                setIpAddress('');
            }
        };
        fetchIP();
    }, []);

    // Search Candidate
    const handleSearch = async () => {
        if (!profileNo.trim()) {
            return;
        }
        try {
            const response = await agent.get(
                `${GetCandidatePhotoDetails}?ProfileId=${profileNo}`
            );
            const data = response?.data?.Data;
            if (!data || data.length === 0) {
                setFormData({});
                setSearched(false);
                return;
            }

            const candidate = data[0];
            setFormData({
                ProfileNo: candidate.ApplicationID || "",
                CandidateID: candidate.CandidateID || "",
                FirstName: candidate.FirstName || "",
                MiddleName: candidate.MiddleName || "",
                LastName: candidate.LastName || "",
                PhotoFilePath: candidate.PhotoFilePath || "",
                SignFilePath: candidate.SignFilePath || "",
                photoFileName: "",
                photoUniqueFileName: "",
                photoUrl: candidate.PhotoFilePath || "",
                photoFile: null,
                signatureFileName: "",
                signatureUniqueFileName: "",
                signatureUrl: candidate.SignFilePath || "",
                signFile: null,
            });

            setSearched(true);

        } catch (error) {
            console.error("Error fetching candidate details:", error);
            setFormData({});
            setSearched(false);
        }
    };

    // Clear
    const handleClear = () => {
        setProfileNo("");
        setSearched(false);
        setFormData({});
    };

    const handleSave = async () => {
        if (!formData.ProfileNo) {
            return;
        }

        try {
            const payload = {
                ProfileId: formData.ProfileNo,
                CandidateId: formData.CandidateID,
                UpdatedProfilePhoto: formData.PhotoFilePath,
                UpdatedSignPhoto: formData.SignFilePath,
                IPAddress: ipAddress || '',
                UserLoginId: userInfo?.UserLoginID || ''
            };

            const response = await agent.post(UpdateFixedOrientationImage, payload);
            const result = response?.data;

            // API success response: Data = "Y"
            if (result?.Data === "Y") {
                await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: result?.Message || "Candidate details saved successfully.",
                    confirmButtonText: "OK",
                });

                handleClear();
                // Keep updated images in UI
                // setFormData((prev) => ({
                //     ...prev,
                //     photoUrl: prev.PhotoFilePath,
                //     signatureUrl: prev.SignFilePath,
                // }));

            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text: result?.Message || "Failed to update Photo and Signature.",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error(
                "Error updating candidate images:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.Message ||
                    error?.response?.data?.message ||
                    "Something went wrong while updating images.",
                confirmButtonText: "OK",
            });
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-full bg-gray-50 min-h-screen">
            <fieldset className="border border-gray-300 rounded-lg mb-6 px-5 pt-3 pb-5 bg-white shadow-sm">
                <legend
                    className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-lg font-bold text-white shadow-md`}
                >
                    {/* <Menu size={21} /> */}
                    <span>Update Candidate Profile/Sign</span>
                </legend>

                <div className="mt-5 border border-gray-200 rounded-lg bg-gray-50 p-5">
                    <div className="flex flex-col md:flex-row items-end justify-center gap-4">
                        {/* Profile No */}
                        <div className="w-full md:w-[350px]">
                            <FormComponent
                                label="Profile No."
                                type="text"
                                value={profileNo}
                                onChange={setProfileNo}
                                placeholder="Enter Profile No."
                                required={true}
                            />
                        </div>
                        {/* Search Button */}
                        <Button
                            variant="success"
                            className="mb-2"
                            onClick={handleSearch}
                        >
                            <Search size={15} />
                            Search
                        </Button>
                        {/* Clear */}
                        {profileNo && (
                            <Button
                                variant="danger"
                                className="mb-2"
                                onClick={handleClear}
                            >
                                {/* <Cancel size={15} /> */}
                                Clear
                            </Button>
                        )}

                    </div>
                </div>

                {searched && (
                    <div className="mt-5">
                        <fieldset className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <legend
                                className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-lg font-bold text-white shadow-md`}
                            >
                                Profile Details
                            </legend>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {/* Profile No */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Profile No.
                                    </label>
                                    <div className="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-800">
                                        {formData.ProfileNo || "-"}
                                    </div>
                                </div>
                                {/* Candidate Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Candidate Name
                                    </label>
                                    <div className="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-800">
                                        {[
                                            formData.FirstName,
                                            formData.MiddleName,
                                            formData.LastName,
                                        ]
                                            .filter(Boolean)
                                            .join(" ") || "-"}
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="border border-gray-300 rounded-lg p-5 mt-5 bg-white">
                            <legend
                                className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-lg font-bold text-white shadow-md`}
                            >
                                Update Images
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
                                <div className="flex flex-col items-center">
                                    <label className="text-sm font-semibold text-gray-700 mb-3">
                                        Photo
                                    </label>
                                    {/* Photo Preview */}
                                    <div
                                        className={`w-40 h-48 rounded-lg overflow-hidden flex items-center justify-center
                                            ${formData.photoUrl ||
                                                formData.PhotoFilePath
                                                ? "border border-gray-300 bg-white shadow-md"
                                                : "border-2 border-dashed border-gray-300 bg-gray-100"
                                            }`}
                                    >
                                        {formData.photoUrl ||
                                            formData.PhotoFilePath ? (
                                            <img
                                                src={
                                                    formData.photoUrl ||
                                                    formData.PhotoFilePath
                                                }
                                                alt="Candidate"
                                                className="w-full h-full object-cover object-center"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                No Photo
                                            </span>
                                        )}
                                    </div>
                                    {/* Upload Button */}
                                    <div className="mt-4">
                                        <UploadPdf
                                            file={formData.photoFileName || ""}
                                            onFileChange={(fileData) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    PhotoFilePath: fileData.filePath,
                                                    photoFileName: fileData.fileName,
                                                    photoUniqueFileName: fileData.uniqueFileName,
                                                    photoUrl: fileData.filePath,
                                                    photoFile: fileData.file,
                                                }));
                                            }}
                                            buttonClassName="bg-[#00c3f9] hover:bg-[#0099cc] transition-colors duration-200 shadow-sm"
                                            buttonText="Update"
                                            allowedFileTypes="jpg, jpeg, png"
                                            maxFileSize="1 MB"
                                            required={false}
                                            label=""
                                            showLabel={false}
                                            linkName=""
                                            uniquefilepath={ formData.PhotoFilePath || "" }
                                            id="photoUpload"
                                        />

                                    </div>

                                </div>

                                <div className="flex flex-col items-center">
                                    <label className="text-sm font-semibold text-gray-700 mb-3">
                                        Signature
                                    </label>
                                    {/* Signature Preview */}
                                    <div
                                        className={`w-56 h-28 rounded-lg overflow-hidden flex items-center justify-center
                                            ${formData.signatureUrl ||
                                                formData.SignFilePath
                                                ? "border border-gray-300 bg-white shadow-md"
                                                : "border-2 border-dashed border-gray-300 bg-gray-100"
                                            }`}
                                    >
                                        {formData.signatureUrl ||
                                            formData.SignFilePath ? (
                                            <img src={formData.signatureUrl || formData.SignFilePath}
                                                alt="Signature"
                                                className="w-full h-full object-contain object-center p-2"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                No Signature
                                            </span>
                                        )}
                                    </div>
                                    {/* Upload Button */}
                                    <div className="mt-4">
                                        <UploadPdf
                                            file={formData.signatureFileName || ""}
                                            onFileChange={(fileData) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    SignFilePath: fileData.filePath,
                                                    signatureFileName: fileData.fileName,
                                                    signatureUniqueFileName: fileData.uniqueFileName,
                                                    signatureUrl: fileData.filePath,
                                                    signFile: fileData.file,
                                                }));
                                            }}
                                            buttonClassName="bg-[#00c3f9] hover:bg-[#0099cc] transition-colors duration-200 shadow-sm"
                                            buttonText="Update"
                                            allowedFileTypes="jpg, jpeg, png"
                                            maxFileSize="500 KB"
                                            required={false}
                                            label=""
                                            showLabel={false}
                                            linkName=""
                                            uniquefilepath={formData.SignFilePath || ""}
                                            id="signatureUpload"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4 mt-8 pt-5 border-t border-gray-200">
                                <Button
                                    variant="success"
                                    className="mb-2"
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    variant="danger"
                                    className="mb-2"
                                    onClick={handleClear}
                                >
                                    {/* <Cancel size={15} /> */}
                                    Cancel
                                </Button>
                            </div>
                        </fieldset>
                    </div>
                )}
            </fieldset>
        </div>
    );
};

export default UpdateFixedOrientationIssueImage;