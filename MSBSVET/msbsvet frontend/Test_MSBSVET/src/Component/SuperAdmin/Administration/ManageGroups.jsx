import React, { useState, useEffect, useCallback, useMemo } from "react";
import { X, Loader2, Edit, Plus, RotateCcw, Save } from "lucide-react";
import Swal from "sweetalert2";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FormComponent from "../../formcomponent/FormComponent";
import { GetMasterTableList } from "../../../Endpoints_All/Base/masterData";
import { SaveMenuDetails, GetMenusList, GetGroupsList, SaveMenusActiveStatus } from "../../../Endpoints_All/Menu/menu";
import publicAgent from "../../../lib/api/publicAgent";
import agent from "../../../lib/api/agent";
import { getDeviceIP } from "../../../utils/CommonHelper";
import { useAuth } from "../../../Hooks/AuthContext";

const INITIAL_FORM_DATA = {
    userType: "",
};

const INITIAL_GROUP_FORM_DATA = {
    linkId: "",
    displayStartDateTime: "",
    displayEndDateTime: "",
    openInNewWindow: "No",
    displayNewImage: "No",
    isActive: "Yes",
    cssClass: "",
    groupName: "",
    seqNo: "",
};

const VALIDATION_RULES = {
    linkId: { required: true, message: "Link is required" },
    displayStartDateTime: { required: true, message: "Start date is required" },
    displayEndDateTime: { required: true, message: "End date is required" },
    groupName: { required: true, message: "Group name is required" }
};

const ManageGroups = () => {
    // State management
    const [showSelect, setShowSelect] = useState(true);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [groupFormData, setGroupFormData] = useState(INITIAL_GROUP_FORM_DATA);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [ipAddress, setIpAddress] = useState("");
     const {userInfo} = useAuth();

    // Data states
    const [userTypes, setUserTypes] = useState([]);
    const [availableLinks, setAvailableLinks] = useState([]);
    const [groups, setGroups] = useState([]);

    // Loading states
    const [loading, setLoading] = useState({
        userTypes: false,
        links: false,
        groups: false,
        saving: false
    });

     const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };

    // Memoized options for dropdowns
    const userTypeOptions = useMemo(() =>
        userTypes.map(userType => ({
            label: userType.Text,
            value: userType.Value
        })).filter(option => option.value !== "-1"), // Remove "Select" option
        [userTypes]
    );

    const linkOptions = useMemo(() =>
        availableLinks.map(link => ({
            label: link.LinkName,
            value: link.LinkID
        })),
        [availableLinks]
    );

    const yesNoOptions = useMemo(() => [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" }
    ], []);

    // API Functions
    const fetchUserTypes = useCallback(async () => {
        setLoading(prev => ({ ...prev, userTypes: true }));
        try {
            const response = await publicAgent.get(GetMasterTableList, {
                params: {
                    TableName: "Master_UserType",
                    DataValueField: "UserTypeID",
                    DataTextField: "UserType",
                    HasSelect: true,
                    orderByText: "UserTypeID"
                },
                timeout: 10000
            });

            if (response.data.Status === "Success") {
                setUserTypes(response.data.Data || []);
            } else {
                throw new Error(response.data.Message || "Failed to fetch user types");
            }
        } catch (error) {
            console.error("Error fetching user types:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load user types. Please try again.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(prev => ({ ...prev, userTypes: false }));
        }
    }, []);

    const fetchAvailableLinks = useCallback(async (userTypeId) => {
        if (!userTypeId || userTypeId === "-1") return;

        setLoading(prev => ({ ...prev, links: true }));
        try {
            const response = await agent.get(GetMenusList, {
                params: {
                    RegionID: 1,
                    UserTypeID: userTypeId,
                    ParentMenuID: 0
                },
                timeout: 10000
            });

            if (response.data.Status === "Success") {
                setAvailableLinks(response.data.Data || []);
            } else {
                throw new Error(response.data.Message || "Failed to fetch links");
            }
        } catch (error) {
            console.error("Error fetching available links:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load available links. Please try again.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(prev => ({ ...prev, links: false }));
        }
    }, []);

    const fetchGroups = useCallback(async (userTypeId) => {
        if (!userTypeId || userTypeId === "-1") return;

        setLoading(prev => ({ ...prev, groups: true }));
        try {
            const response = await agent.get(GetGroupsList, {
                params: {
                    RegionID: 1,
                    UserTypeID: userTypeId
                },
                timeout: 10000
            });

            if (response.data.Status === "Success") {
                setGroups(response.data.Data || []);
            } else {
                throw new Error(response.data.Message || "Failed to fetch groups");
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load groups. Please try again.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(prev => ({ ...prev, groups: false }));
        }
    }, []);

    // Effects
    useEffect(() => {
        fetchUserTypes();
        fetchIP();
    }, [fetchUserTypes]);

    useEffect(() => {
        if (showModal && formData.userType) {
            fetchAvailableLinks(formData.userType);
        }
    }, [showModal, formData.userType, fetchAvailableLinks]);

    // Validation
    const validateForm = useCallback(() => {
        const validationErrors = {};

        Object.entries(VALIDATION_RULES).forEach(([field, rule]) => {
            if (rule.required && !groupFormData[field]?.toString().trim()) {
                validationErrors[field] = rule.message;
            }
        });

        // Date validation
        if (groupFormData.displayStartDateTime && groupFormData.displayEndDateTime) {
            const startDate = new Date(groupFormData.displayStartDateTime);
            const endDate = new Date(groupFormData.displayEndDateTime);

            if (endDate <= startDate) {
                validationErrors.displayEndDateTime = "End date must be after start date";
            }
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }, [groupFormData]);

    // Event Handlers
    const handleChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'userType') {
            setGroups([]);
            if (value && value !== "-1") {
                fetchGroups(value);
            }
        }
    }, [fetchGroups]);

    const handleGroupFormChange = useCallback((name, value) => {
        setGroupFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for the field being edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }

        // Real-time validation if submit was attempted
        if (submitAttempted && VALIDATION_RULES[name]?.required) {
            setErrors(prev => ({
                ...prev,
                [name]: value?.toString().trim() ? undefined : VALIDATION_RULES[name].message
            }));
        }
    }, [errors, submitAttempted]);

    const handleGroupUpdate = useCallback((groupId, field, value) => {
        setGroups(prev =>
            prev.map(group => {
                if (group.MenuID === groupId) {
                    if (field === "SeqNo") {
                        const seqValue = value && value.toString().trim() !== "" ? parseInt(value) : 0;
                        return { ...group, [field]: seqValue };
                    }
                    return { ...group, [field]: value };
                }
                return group;
            })
        );
    }, []);

    const handleAddNewGroup = useCallback(() => {
        if (!formData.userType || formData.userType === "-1") {
            setErrors(prev => ({ ...prev, userType: "Please select a user type" }));
            return;
        }
        setEditingGroup(null);
        setGroupFormData(INITIAL_GROUP_FORM_DATA);
        setErrors({});
        setSubmitAttempted(false);
        setShowModal(true);
    }, [formData.userType]);

    const handleEditGroup = useCallback((group) => {
        setEditingGroup(group);
        const startDate = new Date(group.DisplayStartDateTime);
        const endDate = new Date(group.DisplayEndDateTime);

        setGroupFormData({
            linkId: group.LinkID?.toString() || "",
            displayStartDateTime: startDate.toISOString().slice(0, 16),
            displayEndDateTime: endDate.toISOString().slice(0, 16),
            openInNewWindow: group.Target === "_blank" ? "Yes" : "No",
            displayNewImage: group.IsNew ? "Yes" : "No",
            isActive: group.IsActive ? "Yes" : "No",
            cssClass: group.CSSClass || "",
            groupName: group.GroupName || "",
            seqNo: group.SeqNo?.toString() || "",
        });
        setErrors({});
        setSubmitAttempted(false);
        setShowModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setGroupFormData(INITIAL_GROUP_FORM_DATA);
        setErrors({});
        setSubmitAttempted(false);
    }, []);

    const saveGroup = useCallback(async (payload) => {
        try {
            const response = await agent.post(
                SaveMenuDetails,
                payload,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000
                }
            );

            if (response.data?.Status === "Success") {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.data.Message || 'Group details saved successfully.',
                    confirmButtonColor: '#10b981'
                });
                return true;
            } else {
                throw new Error(response.data?.Message || "Failed to save group details");
            }
        } catch (error) {
            console.error("API Error:", error);

            let errorMessage = "Something went wrong while saving the group.";

            if (error.code === 'ECONNABORTED') {
                errorMessage = "Request timeout. Please try again.";
            } else if (error.response?.status === 404) {
                errorMessage = "API endpoint not found.";
            } else if (error.response?.status >= 500) {
                errorMessage = "Server error. Please try again later.";
            } else if (error.message) {
                errorMessage = error.message;
            }

            await Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });

            return false;
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        setSubmitAttempted(true);

        if (!validateForm()) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please fill in all required fields correctly.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        setLoading(prev => ({ ...prev, saving: true }));

        try {
            const payload = {
                MenuID: editingGroup ? editingGroup.MenuID : 0,
                UserTypeID: parseInt(formData.userType),
                ParentMenuID: 0, // Groups have ParentMenuID = 0
                LinkID: parseInt(groupFormData.linkId),
                DisplayStartDateTime: groupFormData.displayStartDateTime,
                DisplayEndDateTime: groupFormData.displayEndDateTime,
                CSSClass: groupFormData.cssClass || "",
                GroupName: groupFormData.groupName || "",
                Target: groupFormData.openInNewWindow === "Yes" ? "_blank" : "",
                SeqNo: parseInt(groupFormData.seqNo) || 0,
                IsNew: groupFormData.displayNewImage === "Yes" ? 1 : 0,
                IsActive: groupFormData.isActive === "Yes" ? 1 : 0,
                RegionID: 1,
                UserLoginID: userLoginID, // Replace with actual user ID
                IPAddress: ipAddress// Get actual IP if needed
            };

            const success = await saveGroup(payload);

            if (success) {
                handleCloseModal();
                // Refresh groups list
                await fetchGroups(formData.userType);
            }
        } finally {
            setLoading(prev => ({ ...prev, saving: false }));
        }
    }, [groupFormData, formData, editingGroup, validateForm, saveGroup, handleCloseModal, fetchGroups]);

    const handleSaveGroups = useCallback(async () => {
        if (groups.length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'No Groups',
                text: 'No groups available to save.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Save Group Changes',
            text: 'Are you sure you want to save all group changes?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Save Changes',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        setLoading(prev => ({ ...prev, saving: true }));

        try {
            const groupEntities = groups.map(group => ({
                MenuID: group.MenuID,
                UserTypeID: parseInt(formData.userType),
                ParentMenuID: 0,
                LinkID: group.LinkID || 0,
                DisplayStartDateTime: group.DisplayStartDateTime,
                DisplayEndDateTime: group.DisplayEndDateTime,
                CSSClass: group.CSSClass || "",
                GroupName: group.GroupName || "",
                Target: group.Target || "",
                SeqNo: parseInt(group.SeqNo) || 0,
                IsNew: group.IsNew ? 1 : 0,
                IsActive: group.IsActive ? 1 : 0,
                RegionID: 1,
                UserLoginID: userLoginID,
                IPAddress: ipAddress
            }));

            const response = await agent.post(
                SaveMenusActiveStatus,
                groupEntities,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000
                }
            );

            if (response.data?.Status === "Success" && response.data?.Data === "Y") {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.data.Message || 'Groups active status updated successfully.',
                    confirmButtonColor: '#10b981',
                    timer: 2000,
                    timerProgressBar: true
                });

                await fetchGroups(formData.userType);
            } else {
                throw new Error(response.data?.Message || "Failed to save groups active status");
            }
        } catch (error) {
            console.error("Error saving groups:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Save Failed!',
                text: error.message || 'Something went wrong while saving group changes.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(prev => ({ ...prev, saving: false }));
        }
    }, [groups, formData.userType, fetchGroups]);

    const handleResetGroups = useCallback(() => {
        setGroups([]);
        setFormData(INITIAL_FORM_DATA);
    }, []);

    const formatDateTime = useCallback((dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }, []);

    return (
        <div className="mt-6 p-4">
            {/* User Type Selection */}
            {showSelect && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-9">
                    <DropdownComponent
                        label="User Type"
                        options={userTypeOptions}
                        value={formData.userType}
                        onChange={(value) => handleChange("userType", value)}
                        error={errors.userType}
                        required
                        loading={loading.userTypes}
                        placeholder="Select User Type"
                    />

                    <div className="lg:col-span-2 flex items-end">
                        <button
                            onClick={handleAddNewGroup}
                            disabled={!formData.userType || formData.userType === "-1"}
                            className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-md transition-colors duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-4 w-4" />
                            Add New Group
                        </button>
                    </div>
                </div>
            )}

            {/* Loading indicator */}
            {loading.groups && (
                <div className="text-center py-8">
                    <Loader2 className="inline-block animate-spin h-6 w-6 text-blue-600" />
                    <span className="ml-2">Loading groups...</span>
                </div>
            )}

            {/* Groups Table */}
            {groups.length > 0 && (
                <div className="overflow-x-auto bg-white rounded-lg shadow mb-6">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Action
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Group Name
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Display Start Date Time
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Display End Date Time
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                                    Is Active
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                                    Seq No
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map((group) => (
                                <tr
                                    key={group.MenuID}
                                    className={group.IsActive ? "bg-green-50" : "bg-white hover:bg-gray-50"}
                                >
                                    <td className="border border-gray-300 px-4 py-3">
                                        <button
                                            onClick={() => handleEditGroup(group)}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                            title="Edit group"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                        {group.LinkName}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                        {formatDateTime(group.DisplayStartDateTime)}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                        {formatDateTime(group.DisplayEndDateTime)}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={group.IsActive}
                                            onChange={(e) =>
                                                handleGroupUpdate(group.MenuID, "IsActive", e.target.checked)
                                            }
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="999"
                                            value={group.SeqNo || ""}
                                            onChange={(e) => handleGroupUpdate(group.MenuID, "SeqNo", e.target.value)}
                                            className="w-20 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Add/Edit Group */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {editingGroup ? "Edit Group" : "Add New Group"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                disabled={loading.saving}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Link Selection */}
                            <DropdownComponent
                                label="Link"
                                options={linkOptions}
                                value={groupFormData.linkId}
                                onChange={(value) => handleGroupFormChange("linkId", value)}
                                error={errors.linkId}
                                required
                                loading={loading.links}
                                placeholder="Select a link"
                            />

                            {/* Group Name */}
                            <FormComponent
                                label="Group Name"
                                value={groupFormData.groupName}
                                onChange={(value) => handleGroupFormChange("groupName", value)}
                                error={errors.groupName}
                                required
                                placeholder="Enter group name"
                            />

                            {/* Date Fields */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <FormComponent
                                    label="Start Date"
                                    type="datetime-local"
                                    value={groupFormData.displayStartDateTime}
                                    onChange={(value) => handleGroupFormChange("displayStartDateTime", value)}
                                    error={errors.displayStartDateTime}
                                    required
                                />
                                <FormComponent
                                    label="End Date"
                                    type="datetime-local"
                                    value={groupFormData.displayEndDateTime}
                                    onChange={(value) => handleGroupFormChange("displayEndDateTime", value)}
                                    error={errors.displayEndDateTime}
                                    required
                                />
                            </div>

                            {/* Additional Fields */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <DropdownComponent
                                    label="Open in New Window"
                                    options={yesNoOptions}
                                    value={groupFormData.openInNewWindow}
                                    onChange={(value) => handleGroupFormChange("openInNewWindow", value)}
                                    required
                                />
                                <DropdownComponent
                                    label="Display New Image"
                                    options={yesNoOptions}
                                    value={groupFormData.displayNewImage}
                                    onChange={(value) => handleGroupFormChange("displayNewImage", value)}
                                    required
                                />
                                <DropdownComponent
                                    label="Is Active"
                                    options={yesNoOptions}
                                    value={groupFormData.isActive}
                                    onChange={(value) => handleGroupFormChange("isActive", value)}
                                    required
                                />
                            </div>

                            {/* Optional Fields */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <FormComponent
                                    label="CSS Class"
                                    value={groupFormData.cssClass}
                                    onChange={(value) => handleGroupFormChange("cssClass", value)}
                                    placeholder="Enter CSS class"
                                />
                                <FormComponent
                                    label="Sequence Number"
                                    type="number"
                                    value={groupFormData.seqNo}
                                    onChange={(value) => handleGroupFormChange("seqNo", value)}
                                    placeholder="Enter sequence number"
                                />
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t bg-gray-50">
                            <button
                                onClick={handleCloseModal}
                                disabled={loading.saving}
                                className="order-2 sm:order-1 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading.saving}
                                className="order-1 sm:order-2 flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading.saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {loading.saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                    onClick={handleResetGroups}
                    className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset Groups
                </button>
                <button
                    onClick={handleSaveGroups}
                    disabled={groups.length === 0 || loading.saving}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                    {loading.saving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving Changes...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Group Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ManageGroups;
