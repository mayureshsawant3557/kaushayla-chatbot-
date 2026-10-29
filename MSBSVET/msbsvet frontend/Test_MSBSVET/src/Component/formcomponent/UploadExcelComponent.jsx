import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';

/**
 * Generic, reusable "Upload Excel" button.
 *
 * What it owns (so you don't repeat it everywhere):
 *   - opening the native file picker
 *   - validating the file extension
 *   - reading the workbook client-side
 *   - converting the first sheet into an array of plain row objects
 *     (via XLSX.utils.sheet_to_json)
 *   - the loading/disabled state on the button while this happens
 *
 * What it does NOT own (stays with the caller, because it's specific to
 * each screen):
 *   - mapping the raw row objects to whatever shape your API expects
 *   - field-level validation
 *   - calling your save/upload API
 *   - refreshing whatever table/state should reflect the new data
 *   - showing a success message (call your own alert at the end of onUpload)
 *
 * Usage:
 *   <UploadExcelComponent
 *       buttonLabel="Upload Timetable"
 *       onUpload={async (rows, file) => {
 *           // rows = parsed Excel rows as plain objects
 *           // map/validate them, call your API, refresh state...
 *           // throw new Error("some message") to surface it as an error alert
 *           showSuccessAlert("Uploaded successfully!");
 *       }}
 *       onError={showErrorAlert} // optional - reuse your screen's own alert
 *   />
 */
const UploadExcelComponent = ({
    // Required: async (rows, file) => void. Receives the parsed rows.
    // Throw an Error with a message to have it shown via onError.
    onUpload,

    // Button text
    buttonLabel = "Upload Excel",
    uploadingLabel = "Uploading...",

    // Native <input accept> string
    accept = ".xlsx,.xls",
    // Extensions checked client-side before parsing even starts
    allowedExtensions = ['.xlsx', '.xls'],

    disabled = false,
    className = "",
    icon: Icon = FaUpload,

    // Which sheet to read (defaults to the first sheet)
    sheetIndex = 0,
    // Passed straight to XLSX.utils.sheet_to_json
    sheetToJsonOptions = { defval: "", raw: false },

    // Called with (rows, file) after onUpload resolves successfully.
    // Not required - most callers show their own success alert inside
    // onUpload itself, since only the caller knows the right message.
    onSuccess,

    // Called with a string message whenever something goes wrong
    // (bad file type, empty file, onUpload threw, etc). If omitted, a
    // default SweetAlert2 error popup is shown instead.
    onError,
    showDefaultAlerts = true,
}) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const showError = (message) => {
        if (onError) {
            onError(message);
        } else if (showDefaultAlerts) {
            Swal.fire({
                icon: 'error',
                title: message,
                confirmButtonColor: '#4f46e5',
                confirmButtonText: 'OK',
            });
        }
    };

    const handleButtonClick = () => {
        if (disabled || isUploading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        // Reset immediately so selecting the same file again still fires onChange.
        e.target.value = "";
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const isValidType = allowedExtensions.some(ext => fileName.endsWith(ext));
        if (!isValidType) {
            showError(`Please upload a valid Excel file (${allowedExtensions.join(', ')}).`);
            return;
        }

        setIsUploading(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[sheetIndex];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, sheetToJsonOptions);

            if (!rows.length) {
                showError("The uploaded file has no data rows.");
                return;
            }

            if (typeof onUpload === 'function') {
                await onUpload(rows, file);
            }

            if (onSuccess) onSuccess(rows, file);
        } catch (error) {
            console.error("Excel upload failed:", error);
            showError(error?.message || "An error occurred while uploading the file. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                accept={accept}
                className="hidden"
                onChange={handleFileChange}
            />
            <button
                type="button"
                className={
                    className ||
                    "bg-indigo-600 text-white px-5 py-2 rounded-md font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                }
                onClick={handleButtonClick}
                disabled={disabled || isUploading}
            >
                <Icon className="w-4 h-4" />
                {isUploading ? uploadingLabel : buttonLabel}
            </button>
        </>
    );
};

export default UploadExcelComponent;