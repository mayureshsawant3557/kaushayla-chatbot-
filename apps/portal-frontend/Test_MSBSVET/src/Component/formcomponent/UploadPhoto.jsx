import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import agent from '../../lib/api/agent';
import {
    GetSasToken
} from "../../Endpoints_All/Utils/fileUpload";
import { useAuth } from '../../Hooks/AuthContext';



const UploadPhoto = ({
    photo,
    onPhotoChange,
    containerClassName = "h-40 w-32",
    buttonClassName = "bg-[#00c3f9]",
    buttonText = "Upload Photo",
    id = "photoUpload",
    allowedFileTypes = "jpg, jpeg",
    maxFileSize = "1 MB",
    required = false,
    userTypeId = 0,
    userLoginID = "",
    uniquefilepath = "",
    onUploadComplete = null // New callback for when upload is complete
}) => {
    const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(uniquefilepath || "");
    const [isUploading, setIsUploading] = useState(false);
    const { userInfo } = useAuth();
    const userTypeID = userInfo?.UserTypeID;
    //const userLoginID = userInfo?.UserLoginID;


    const handleButtonClick = () => {
        if (isUploading) {
            Swal.fire({
                title: 'Upload in Progress',
                text: 'Please wait for the current upload to complete.',
                icon: 'info'
            });
            return;
        }

        Swal.fire({
            title: 'Upload Photo',
            html: `
               <div class="text-left mb-4 p-4 bg-gray-100 rounded-md">
                <p class="text-lg font-semibold text-gray-800">File Requirements</p>
                <ul class="list-disc ml-5 text-sm text-gray-600">
                    <li><strong>Allowed Types:</strong> ${allowedFileTypes}</li>
                    <li><strong>Max Size:</strong> ${maxFileSize}</li>
                </ul>
            </div>
            <div class="mt-4">
                <label class="block text-left mb-2 font-medium">
                    Select File to Upload ${required ? '<span class="text-red-500">*</span>' : ''}
                </label>
                <input 
                    id="swal-upload-file" 
                    type="file" 
                    class="block w-full text-sm text-gray-500 border rounded-md p-2 bg-white shadow-sm
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-50 file:text-blue-700
                           hover:file:bg-blue-100"
                    accept="${allowedFileTypes.split(', ').map(type => `.${type}`).join(',')}"
                />
            </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Upload',
            cancelButtonText: 'Close',
            confirmButtonColor: '#0066ff',
            cancelButtonColor: '#6c757d',
            showLoaderOnConfirm: true,
            didOpen: () => {
                const fileInput = Swal.getPopup().querySelector('#swal-upload-file');
                const confirmButton = Swal.getConfirmButton();
                confirmButton.disabled = true;

                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];

                    if (file) {
                        // Check file type
                        const fileExtension = file.name.split('.').pop().toLowerCase();
                        const allowedTypes = allowedFileTypes.split(', ').map(type => type.toLowerCase());

                        if (!allowedTypes.includes(fileExtension)) {
                            Swal.showValidationMessage(`Invalid file type. Allowed: ${allowedFileTypes}`);
                            confirmButton.disabled = true;
                            return;
                        }

                        // Check file size
                        const sizeMatch = maxFileSize.match(/(\d+)\s*(\w+)/);
                        if (sizeMatch) {
                            const size = parseInt(sizeMatch[1]);
                            const unit = sizeMatch[2].toLowerCase();

                            let maxBytes = size;
                            if (unit === 'kb') maxBytes = size * 1024;
                            if (unit === 'mb') maxBytes = size * 1024 * 1024;

                            if (file.size > maxBytes) {
                                Swal.showValidationMessage(`File too large. Maximum size: ${maxFileSize}`);
                                confirmButton.disabled = true;
                                return;
                            }
                        }

                        confirmButton.disabled = false;
                    }
                });
            },
            preConfirm: async () => {
                const fileInput = Swal.getPopup().querySelector('#swal-upload-file');
                const selectedFile = fileInput.files[0];

                if (required && !selectedFile) {
                    Swal.showValidationMessage('Please select a file');
                    return false;
                }

                if (!selectedFile) return null;

                setIsUploading(true);

                // Create unique filename with timestamp and user info
                const now = Date.now();
                const originalFileName = selectedFile.name;
                const fileExtension = originalFileName.split('.').pop();
                const uniqueFileName = `${now}_${userLoginID}_${id}.${fileExtension}`;

                try {
                    // Upload to Azure
                    const folderpath = userTypeId == "91" ? "candidate" : userTypeId == "95" ? "staff" : "other";
                    const path = folderpath.toLowerCase() + "/" + userLoginID.toLowerCase();

                    const photoUploadedURL = await uploadToAzure(selectedFile, path, uniqueFileName);

                    if (photoUploadedURL === "Error") {
                        throw new Error("Failed to upload photo to Azure");
                    }

                    return {
                        file: selectedFile,
                        filePath: photoUploadedURL, // This is the Azure URL for API submission
                        fileName: originalFileName,
                        uniqueFileName: uniqueFileName,
                        uploadSuccess: true
                    };
                } catch (error) {
                    Swal.showValidationMessage('Upload failed. Please try again.');
                    return false;
                } finally {
                    setIsUploading(false);
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value && result.value.uploadSuccess) {
                const { file, filePath, fileName: originalFileName, uniqueFileName } = result.value;

                // Update local state with the Azure URL
                setUploadedPhotoUrl(filePath);

                // Prepare data for parent component
                const uploadData = {
                    filePath: filePath, // Azure URL for API submission
                    fileName: originalFileName,
                    uniqueFileName: uniqueFileName,
                    file: file,
                    photoUrl: filePath, // For display purposes (same as filePath)
                    azureUrl: filePath, // Explicit Azure URL reference
                    isUploaded: true,
                    uploadTimestamp: new Date().toISOString()
                };

                // Call the parent callback with the upload data
                onPhotoChange(uploadData);

                // Optional callback for when upload is complete
                if (onUploadComplete) {
                    onUploadComplete({
                        success: true,
                        url: filePath,
                        fileName: originalFileName,
                        id: id
                    });
                }

                // Success notification
                Swal.fire({
                    title: 'Success!',
                    text: 'Photo uploaded successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            setIsUploading(false);
        }).catch((error) => {
            setIsUploading(false);
            Swal.fire({
                title: 'Error!',
                text: 'An error occurred during upload',
                icon: 'error'
            });
        });
    };

    const uploadToAzure = async (file, path, fileNameDisplay) => {
        try {

            // Get SAS token
            const response = await agent.get(GetSasToken + '?fileName=' + fileNameDisplay + '&dicContainers=' + path);

            if (response.status !== 200) {
                throw new Error("Error while generating SAS token");
            }

            const sasUrl = response.data;

            // Upload file to Azure
            await agent.put(sasUrl, file, {
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': file.type,
                },
            });

            const fileUrl = sasUrl.split('?')[0]; // This is the permanent Azure URL

            // Verify file upload
            try {
                await agent.head(fileUrl);
                return fileUrl; // Return the Azure URL for API submission
            } catch (error) {
                return "Error";
            }

        } catch (error) {
            return "Error";
        }
    };

    // Update uploadedPhotoUrl when uniquefilepath prop changes
    React.useEffect(() => {
        setUploadedPhotoUrl(uniquefilepath || "");
    }, [uniquefilepath]);

    // Determine what photo to display
    const getPhotoSrc = () => {
        if (uploadedPhotoUrl) {
            return uploadedPhotoUrl;
        }
        if (photo) {
            return typeof photo === 'string' ? photo : URL.createObjectURL(photo);
        }
        return null;
    };

    const photoSrc = getPhotoSrc();

    return (
        <div className="flex flex-col items-center">
            <div className={`border p-4 rounded-md flex items-center justify-center mb-2 relative ${containerClassName}`}>
                {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md z-10">
                        <div className="text-white text-sm">Uploading...</div>
                    </div>
                )}
                {photoSrc ? (
                    <img
                        src={photoSrc}
                        alt="Photo"
                        className="max-h-full max-w-full object-contain rounded"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <span className="text-gray-400">No Photo</span>
                )}
            </div>
            <button
                type="button"
                className={`rounded-md ${buttonClassName} px-3 py-1 text-white ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                onClick={handleButtonClick}
                disabled={isUploading}
            >
                {isUploading ? 'Uploading...' : buttonText}
            </button>
        </div>
    );
};

export default UploadPhoto;