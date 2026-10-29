import React, {
    useState,
    forwardRef,
    useImperativeHandle
} from 'react';
import Swal from 'sweetalert2';
import { FaTrash, FaUpload, FaPlus, FaEye } from 'react-icons/fa';

const UploadDocument = forwardRef(({ allowedTypes, maxSize }, ref) => {
    const [documents, setDocuments] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    if (ref) {
        useImperativeHandle(ref, () => ({
            getDocuments: () => documents
        }));
    }

    const addDocument = () => {

        // If already rows exist
        if (documents.length > 0) {

            const lastDocument =
                documents[documents.length - 1];

            // Validate previous row
            if (
                !lastDocument.name?.trim() ||
                !lastDocument.file
            ) {

                Swal.fire({
                    icon: 'warning',
                    title: 'Incomplete Document',
                    text: 'Please enter document name and upload file before adding next document.'
                });

                return;
            }
        }

        setDocuments([
            ...documents,
            {
                name: '',
                file: null
            }
        ]);
    };

    const handleInputChange = (e, index) => {
        const updatedDocuments = [...documents];
        updatedDocuments[index].name = e.target.value;
        setDocuments(updatedDocuments);
    };

    const handleFileUpload = (index) => {
        Swal.fire({
            title: '<strong>Upload Document</strong>',
            html: ` 
            <div style="padding: 15px; border-radius: 10px; border: 1px solid #ddd; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1); background: #fff; text-align: center;">
                <div style="margin-bottom: 10px; text-align: left;">
                    <p><span style="font-size: 18px;">📁</span> <strong>Allowed File Types:</strong> ${allowedTypes.join(', ')}</p>
                    <p><span style="font-size: 18px;">📝</span> <strong>Max File Size:</strong> ${(maxSize / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <label for="fileInput" style="font-weight: bold; display: block; margin-bottom: 8px;">
                    📤 Select File to Upload <span style="color: red;">*</span>
                </label>
                <div style="display: flex; justify-content: center;">
                    <input type="file" id="fileInput" class="swal2-input" accept="${allowedTypes.join(',')}" 
                        style="display: block; width: 80%; padding: 8px; border: 1px solid #ccc; border-radius: 5px; margin-bottom: 10px;"/>
                </div>
                <p id="fileError" style="color: red; font-size: 14px; margin-top: 5px;"></p>
            </div>
        `,
            showCancelButton: true,
            confirmButtonText: 'Upload',
            allowOutsideClick: false,
            preConfirm: () => {
                const fileInput = document.getElementById('fileInput');
                const file = fileInput.files[0];
                const errorMessage = document.getElementById('fileError');

                if (!file) {
                    errorMessage.textContent = '⚠️ Please select a file!';
                    return false;
                }
                if (!allowedTypes.includes(file.type)) {
                    errorMessage.textContent = `⚠️ Invalid file type! Allowed: ${allowedTypes.join(', ')}`;
                    return false;
                }
                if (file.size > maxSize) {
                    errorMessage.textContent = `⚠️ File too large! Max: ${(maxSize / (1024 * 1024)).toFixed(2)} MB`;
                    return false;
                }

                // Update document state
                const updatedDocuments = [...documents];
                updatedDocuments[index].file = file;
                setDocuments(updatedDocuments);

                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'File Uploaded!',
                    text: `Your file "${file.name}" has been uploaded successfully.`,
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    const previewFile = (file) => {
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setPreviewType(file.type);
        }
    };

    const closePreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPreviewType(null);
    };

    const removeDocument = (index) => {
        const updatedDocuments = documents.filter((_, i) => i !== index);
        setDocuments(updatedDocuments);
    };

    return (
        <div className="mt-6">
            <h4 className="mb-2 text-lg font-semibold">4. List of documents enclosed:</h4>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border">
                    <thead>
                        <tr className="bg-white">
                            <th className="w-20 border p-3 text-center">
                                <button
                                    className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={addDocument}
                                >
                                    <FaPlus />
                                </button>
                            </th>
                            <th className="border p-3 text-center font-bold">S.N.</th>
                            <th className="border p-3 text-left font-bold">Document Name</th>
                            <th className="border p-3 text-center font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc, index) => (
                            <tr key={index}>
                                <td className="border p-3 text-center">
                                    <button
                                        className="text-blue-600 hover:text-red-600"
                                        onClick={() => removeDocument(index)}
                                    >
                                        <FaTrash size={20} />
                                    </button>
                                </td>
                                <td className="border p-3 text-center font-semibold">{index + 1}.</td>
                                <td className="border p-3">
                                    <input
                                        type="text"
                                        placeholder="Enter document name"
                                        value={doc.name}
                                        onChange={(e) => handleInputChange(e, index)}
                                        className="w-full rounded border p-2"
                                    />
                                </td>
                                <td className="m-3 flex justify-center gap-3 rounded border p-3 text-center">
                                    <button
                                        className="text-blue-600 hover:text-green-600"
                                        onClick={() => handleFileUpload(index)}
                                    >
                                        <FaUpload size={20} />
                                    </button>
                                    {doc.file && (
                                        <button
                                            className="text-blue-600 hover:text-purple-600"
                                            onClick={() => previewFile(doc.file)}
                                        >
                                            <FaEye size={20} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {previewUrl && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative h-[80vh] w-full max-w-4xl rounded-lg bg-white shadow-lg">
                        <button
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-800"
                            onClick={closePreview}
                        >
                            &times;
                        </button>
                        {previewType === 'application/pdf' ? (
                            <iframe
                                src={previewUrl}
                                title="PDF Preview"
                                className="h-full w-full rounded-b-lg"
                                allowFullScreen
                            />
                        ) : (
                            <img src={previewUrl} alt="Preview" className="max-h-full max-w-full rounded-b-lg" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});


export default UploadDocument;
