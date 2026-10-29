// ManageLinks.js
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import agent from '../../../lib/api/agent';
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FormComponent from "../../formcomponent/FormComponent";
import { SaveLinkDetails } from "../../../Endpoints_All/Menu/menu";
import { getDeviceIP } from "../../../utils/CommonHelper";
const ManageLinks = () => {
    const [showSelect, setShowSelect] = useState(true);
    const [selectedModule, setSelectedModule] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        linkNameEn: "",
        linkDescEn: "",
        linkNameMr: "",
        linkDescMr: "",
        internalLink: "",
        queryString: "",
        isActive: "Yes",
    });
    const [ipAddress, setIpAddress] = useState("");

    const modules = [
        { id: 1, name: "Internal Links(React)" },
        { id: 2, name: "External Links" },
    ];


    useEffect (() =>{
        fetchIP();
    })

     const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };
    // Format modules for dropdown component
    const formatModuleOptions = (modules) => {
        return modules.map(module => ({
            value: module.id,
            label: module.name
        }));
    };

    // Format isActive options for dropdown
    const isActiveOptions = [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" }
    ];

    const handleAddNewLink = () => {
        if (selectedModule) {
            setShowModal(true);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const validate = () => {
        const validationErrors = {};

        if (!formData.linkNameEn)
            validationErrors.linkNameEn = "Link name in English is required";
        if (!formData.linkDescEn)
            validationErrors.linkDescEn = "Link description in English is required";
        if (!formData.linkNameMr)
            validationErrors.linkNameMr = "Link name in Marathi is required";
        if (!formData.linkDescMr)
            validationErrors.linkDescMr = "Link description in Marathi is required";
        if (!formData.internalLink)
            validationErrors.internalLink = "Internal link is required";

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const saveLinkDetails = async (linkData) => {
        try {
            const response = await agent.post(SaveLinkDetails, linkData, {
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                }
            });
            return response.data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (validate()) {
            setLoading(true);
            try {
                const selectedModuleObj = modules.find(
                    (module) => module.id.toString() === selectedModule.toString()
                );

                const apiData = {
                    LinkID: 0,
                    LinkName: formData.linkNameEn,
                    LinkNameMarathi: formData.linkNameMr,
                    LinkDescription: formData.linkDescEn,
                    LinkDescriptionMarathi: formData.linkDescMr,
                    LinkURL: formData.internalLink,
                    LinkType: selectedModuleObj?.name === "Internal Links(React)" ? "Internal" : "External",
                    Directory: "", // You may need to set this based on your requirements
                    PageName: formData.linkNameEn, // Using link name as page name
                    QueryString: formData.queryString || "",
                    IsActive: formData.isActive === "Yes" ? 1 : 0,
                    UserLoginID: "11", // You may need to get this from user session/context
                    IPAddress: ipAddress // You may need to get this from the client or server
                };

                const result = await saveLinkDetails(apiData);

                if (result.Status === "Success") {
                    await Swal.fire({
                        title: 'Success!',
                        text: result.Message || 'Link details saved successfully.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#10B981'
                    });

                    // Reset form and close modal
                    setFormData({
                        linkNameEn: "",
                        linkDescEn: "",
                        linkNameMr: "",
                        linkDescMr: "",
                        internalLink: "",
                        queryString: "",
                        isActive: "Yes",
                    });
                    setShowModal(false);
                    setErrors({});
                } else {
                    await Swal.fire({
                        title: 'Error!',
                        text: result.Message || 'Failed to save link details.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#EF4444'
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                await Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while saving. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#EF4444'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const selectedModuleName =
        modules.find((module) => module.id.toString() === selectedModule.toString())
            ?.name || "";

    return (
        <>
            {showSelect && (
                <div className="mt-6 flex items-center justify-center gap-4">
                    <div className="min-w-[300px]">
                        <DropdownComponent
                            label="Module"
                            options={formatModuleOptions(modules)}
                            value={selectedModule}
                            onChange={(value) => setSelectedModule(value)}
                            error=""
                            required
                            loading={false}
                        />
                    </div>
                    <button
                        onClick={handleAddNewLink}
                        disabled={!selectedModule}
                        className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-green-700 disabled:bg-green-400 mt-6"
                    >
                        Add New Link
                    </button>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Add New Link</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                                disabled={loading}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Link Details in English */}
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <FormComponent
                                        label="Link Name (English)"
                                        value={formData.linkNameEn}
                                        onChange={(value) => handleChange("linkNameEn", value)}
                                        error={errors.linkNameEn}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex-1">
                                    <FormComponent
                                        label="Link Description (English)"
                                        value={formData.linkDescEn}
                                        onChange={(value) => handleChange("linkDescEn", value)}
                                        error={errors.linkDescEn}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Link Details in Marathi */}
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <FormComponent
                                        label="Link Name (Marathi)"
                                        value={formData.linkNameMr}
                                        onChange={(value) => handleChange("linkNameMr", value)}
                                        error={errors.linkNameMr}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex-1">
                                    <FormComponent
                                        label="Link Description (Marathi)"
                                        value={formData.linkDescMr}
                                        onChange={(value) => handleChange("linkDescMr", value)}
                                        error={errors.linkDescMr}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Link Type, Internal Link */}
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <FormComponent
                                        label="Link Type"
                                        value={selectedModuleName}
                                        onChange={() => { }} // Read-only
                                        error=""
                                        required
                                        disabled={true}
                                    />
                                </div>
                                <div className="flex-1">
                                    <FormComponent
                                        label="Internal Link"
                                        value={formData.internalLink}
                                        onChange={(value) => handleChange("internalLink", value)}
                                        error={errors.internalLink}
                                        required
                                        disabled={loading}
                                        placeholder="Enter internal link URL"
                                    />
                                </div>
                            </div>

                            {/* Query String and Is Active */}
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <FormComponent
                                        label="Query String"
                                        value={formData.queryString}
                                        onChange={(value) => handleChange("queryString", value)}
                                        error=""
                                        disabled={loading}
                                        placeholder="Enter query string (optional)"
                                    />
                                </div>
                                <div className="flex-1">
                                    <DropdownComponent
                                        label="Is Active"
                                        options={isActiveOptions}
                                        value={formData.isActive}
                                        onChange={(value) => handleChange("isActive", value)}
                                        error=""
                                        required
                                        loading={false}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    disabled={loading}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageLinks;