import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { GetSasToken } from "../../Endpoints_All/Utils/fileUpload";
import IconTooltip from './TooltipComponent'; 
import agent from '../../lib/api/agent';
import axios from 'axios';

const UploadPdf = ({
    file,
    onFileChange,
    buttonClassName = "bg-[#00c3f9]",
    buttonText = "Upload",
    id = "documentUpload",
    allowedFileTypes = "pdf",
    maxFileSize = "6 MB",
    required = false,
    label = "Upload Document",
    showLabel = true,
    userTypeId = 0,
    userLoginID = "",
    linkName = "View Document",
    uniquefilepath = "",
    disabled = false ,
    tooltip = "", 
    tooltipPosition = "right" 
}) => {
    const [fileName, setFileName] = useState(file ? (typeof file === 'string' ? file : file.name) : null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState(uniquefilepath || "");

    // Update fileName when file prop changes
    useEffect(() => {
        if (file) {
            setFileName(typeof file === 'string' ? file : file.name);
        }
    }, [file]);

    // Update uploadedFileUrl when uniquefilepath prop changes
    useEffect(() => {
        setUploadedFileUrl(uniquefilepath || "");
    }, [uniquefilepath]);

    const handleButtonClick = () => {
        // Don't open popup if disabled
        if (disabled) {
            return;
        }

        Swal.fire({
            title: label,
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
                        accept="${allowedFileTypes.split(', ').map(type => type.includes('.') ? type : `.${type}`).join(',')}"
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
                        const allowedTypes = allowedFileTypes.split(', ').map(type =>
                            type.startsWith('.') ? type.substring(1).toLowerCase() : type.toLowerCase()
                        );

                        if (!allowedTypes.includes(fileExtension)) {
                            Swal.showValidationMessage(`Invalid file type. Allowed: ${allowedFileTypes}`);
                            confirmButton.disabled = true;
                            return;
                        }

                        // Check file size (convert maxFileSize string to bytes)
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

                // Create unique filename with timestamp and user info
                const now = Date.now();
                const originalFileName = selectedFile.name;
                const fileExtension = originalFileName.split('.').pop();
                const uniqueFileName = `${now}_${userLoginID}_${id}.${fileExtension}`;

                try {
                    // Upload to Azure
                    const folderpath = userTypeId == "91" ? "candidate" : userTypeId == "95" ? "staff" : "other";
                    
                    const path = folderpath.toLowerCase() + "/" + userLoginID.toLowerCase();
                    const documentUploadedURL = await uploadToAzure(selectedFile, path, uniqueFileName);

                    if (documentUploadedURL === "Error") {
                        throw new Error("Failed to upload file to Azure");
                    }

                    return {
                        file: selectedFile,
                        filePath: documentUploadedURL,
                        fileName: originalFileName,
                        uniqueFileName: uniqueFileName,
                        uploadTimestamp: now,
                        isUploaded: true
                    };
                } catch (error) {
                    Swal.showValidationMessage('Upload failed. Please try again.');
                    return false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const { file, filePath, fileName: originalFileName, uniqueFileName, uploadTimestamp, isUploaded } = result.value;

                // Update local state
                setFileName(originalFileName);
                setUploadedFileUrl(filePath);

                // Call the parent callback with complete file data
                if (onFileChange && typeof onFileChange === 'function') {
                    onFileChange({
                        filePath: filePath,
                        fileName: originalFileName,
                        uniqueFileName: uniqueFileName,
                        file: file,
                        uploadTimestamp: uploadTimestamp,
                        isUploaded: isUploaded,
                        azureUrl: filePath // Explicit Azure URL reference
                    });
                }
            }
        });
    };

    const openNewWindow = () => {
        if (!uploadedFileUrl) {
            Swal.fire({
                icon: 'warning',
                title: 'No File',
                text: 'No file uploaded yet!',
                confirmButtonColor: '#0066ff'
            });
            return;
        }

        const popup = window.open('', 'popupWindow', 'width=800,height=600,menubar=no,toolbar=no,location=no,status=no');

        if (popup) {
            popup.document.write(`
                <html>
                <head>
                    <title>Document Viewer</title>
                    <style>
                        body { margin: 0; overflow: hidden; }
                        iframe { width: 100%; height: 100%; border: none; }
                    </style>
                </head>
                <body>
                    <iframe src="${uploadedFileUrl}" allowfullscreen></iframe>
                </body>
                </html>
            `);
            popup.document.close();
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Popup Blocked',
                text: 'Popup was blocked. Please allow popups for this site.',
                confirmButtonColor: '#0066ff'
            });
        }
    };

    const uploadToAzure = async (file, path, fileNameDisplay) => {
        try {
            // Get SAS token
            const response = await axios.get(
                `${GetSasToken}?fileName=${encodeURIComponent(fileNameDisplay)}&dicContainers=${encodeURIComponent(path)}`
            );
   
            if (response.status !== 200) {
                throw new Error("Error while generating SAS token");
            }
            const parseSasUrl = (data) => {
                if (!data) return null;
                if (typeof data === 'string') return data;
                if (typeof data.sasUrl === 'string') return data.sasUrl;
                if (typeof data.url === 'string') return data.url;
                if (typeof data.data === 'string') return data.data;
                if (typeof data.data?.sasUrl === 'string') return data.data.sasUrl;
                if (typeof data.data?.url === 'string') return data.data.url;
                return null;
            };

            const sasUrl = parseSasUrl(response.data);

            if (!sasUrl) {
                throw new Error('Invalid SAS URL');
            }

            // Upload file to Azure using a plain axios call so the app's request interceptor does not encrypt binary payloads
            await axios.put(sasUrl, file, {
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': file.type,
                },
            });
            const fileUrl = sasUrl.split('?')[0];

            // Verify file upload using the SAS URL (requires the signed query string)
            try {
                await axios.head(fileUrl);
                return fileUrl;
            } catch (error) {
                return "Error";
            }

        } catch (error) {
            return "Error";
        }
    };

    return (
        <div className="upload-pdf-component">
            {/*{showLabel && (*/}
            {/*    <label className="block text-sm font-medium text-gray-700 mb-1">*/}
            {/*        {label} {required && <span className="text-red-500">*</span>}*/}
            {/*    </label>*/}
            {/*)}*/}

            {showLabel && (
                <div className="flex items-center gap-1 mb-1">
                    <label className="text-sm font-medium text-gray-700">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    {tooltip && (
                        <IconTooltip
                            message={tooltip}
                            position={tooltipPosition}
                            width='w-80'
                        />
                    )}
                </div>
            )}

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className={`rounded-md ${buttonClassName} px-4 py-2 text-white text-sm font-semibold transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                        }`}
                    onClick={handleButtonClick}
                    disabled={disabled}
                >
                    {buttonText}
                </button>

                {/* Only show view button if file is uploaded */}
                {uploadedFileUrl && linkName && (
                    <button
                        type="button"
                        onClick={openNewWindow}
                        className="text-blue-600 hover:text-blue-800 hover:underline underline text-sm"
                    >
                        {linkName}
                    </button>
                )}

                {/* Show filename if available */}
                {fileName && !uploadedFileUrl && (
                    <span className="text-sm text-gray-600 italic">
                        {fileName}
                    </span>
                )}
            </div>
        </div>
    );
};

export default UploadPdf;
