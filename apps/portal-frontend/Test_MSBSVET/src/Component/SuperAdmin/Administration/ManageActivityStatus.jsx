import React, { useState, useEffect } from 'react';
import { Edit, Menu, RefreshCw, Save, X } from 'lucide-react';
import { ActivityStatus } from '../../../Endpoints_All/Administration/admin.jsx';
import { getDeviceIP } from '../../../utils/CommonHelper.jsx';
const ActivityStatusManagement = () => {
    const [activityData, setActivityData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentEditIndex, setCurrentEditIndex] = useState(-1);
    const [formData, setFormData] = useState({
        activityName: '',
        startDateTime: '',
        endDateTime: ''
    });
    const [updating, setUpdating] = useState(false);
    const [ipAddress, setIpAddress] = useState("");

    // Configuration
    const API_BASE_URL = ActivityStatus;
    const REGION_ID = 1;

    // Fetch activity data from API
    const fetchActivityData = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`${API_BASE_URL}/GetActivityStatusList?regionID=${REGION_ID}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setActivityData(data);
        } catch (error) {
            console.error('Error fetching activity data:', error);
            setError('Failed to load activity data. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Update activity status via API
    const updateActivityStatus = async (updatedActivity) => {
        try {
            setUpdating(true);
            const response = await fetch(`${API_BASE_URL}/SaveActivityStatusDetails`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedActivity)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result; // Should return: { message: "Y" }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        } finally {
            setUpdating(false);
        }
    };

    // Format datetime for display
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', '');
    };

    // Format datetime for input field (datetime-local format)
    const formatForInput = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Handle edit button click
    const handleEditClick = (index) => {
        const activity = activityData[index];
        setCurrentEditIndex(index);
        setFormData({
            activityName: activity.ActivityDetails || activity.ActivityName,
            startDateTime: formatForInput(activity.ActivityStartDateTime),
            endDateTime: formatForInput(activity.ActivityEndDateTime)
        });
        setShowEditForm(true);
    };

    // Validate form data
    const validateForm = () => {
        if (!formData.activityName.trim()) {
            alert('Activity name is required');
            return false;
        }
        if (!formData.startDateTime) {
            alert('Start date time is required');
            return false;
        }
        if (!formData.endDateTime) {
            alert('End date time is required');
            return false;
        }
        if (new Date(formData.startDateTime) >= new Date(formData.endDateTime)) {
            alert('End date time must be after start date time');
            return false;
        }
        return true;
    };

    // Handle form submission
    const handleFormSubmit = async () => {
        if (!validateForm()) return;

        if (currentEditIndex >= 0) {
            const updatedActivity = {
                RegionID: REGION_ID,
                ActivityName: activityData[currentEditIndex].ActivityName,
                ActivityStartDateTime: new Date(formData.startDateTime).toISOString(),
                ActivityEndDateTime: new Date(formData.endDateTime).toISOString(),
                ModifiedBy: "AdminUser",
                ModifiedByIPAddress: ipAddress
            };

            try {
                const result = await updateActivityStatus(updatedActivity);

                if (result.message === "Y") {
                    // Update local data
                    const newActivityData = [...activityData];
                    newActivityData[currentEditIndex] = {
                        ...newActivityData[currentEditIndex],
                        ActivityStartDateTime: formData.startDateTime,
                        ActivityEndDateTime: formData.endDateTime,
                        ActivityStartDateTimeF: formatDateTime(formData.startDateTime),
                        ActivityEndDateTimeF: formatDateTime(formData.endDateTime)
                    };

                    setActivityData(newActivityData);
                    setShowEditForm(false);
                    setCurrentEditIndex(-1);
                    setFormData({
                        activityName: '',
                        startDateTime: '',
                        endDateTime: ''
                    });

                    alert('Activity updated successfully!');
                } else {
                    throw new Error('Update failed');
                }
            } catch (error) {
                console.error('Error updating activity:', error);
                alert('Failed to update activity. Please try again.');
            }
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form cancel
    const handleCancel = () => {
        setShowEditForm(false);
        setCurrentEditIndex(-1);
        setFormData({
            activityName: '',
            startDateTime: '',
            endDateTime: ''
        });
    };

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
            debugger;
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchActivityData();
    };

    // Load data on component mount
    useEffect(() => {
        fetchIP();
        fetchActivityData();

    }, []);
    // Load data on component mount
    useEffect(() => {
        fetchIP();

    }, []);

    return (
        <div className="min-h-screen bg-gray-50 mt-5">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-slate-600 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Menu className="h-5 w-5" />
                        <span className="text-lg font-semibold">Manage Activity Status</span>
                    </div>

                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            <p className="font-medium">Error</p>
                            <p className="text-sm">{error}</p>
                            <button
                                onClick={handleRefresh}
                                className="mt-2 text-red-800 hover:text-red-900 underline text-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Edit Form */}
                    {showEditForm && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit Activity Status Details</h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Activity <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="activityName"
                                            value={formData.activityName}
                                            onChange={handleInputChange}
                                            required
                                            disabled={updating}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="Enter activity name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Activity Start Date Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="startDateTime"
                                            value={formData.startDateTime}
                                            onChange={handleInputChange}
                                            required
                                            disabled={updating}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Activity End Date Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="endDateTime"
                                            value={formData.endDateTime}
                                            onChange={handleInputChange}
                                            required
                                            disabled={updating}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleFormSubmit}
                                        disabled={updating}
                                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                                    >
                                        <Save className="h-4 w-4" />
                                        {updating ? 'Updating...' : 'Update'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={updating}
                                        className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table Section */}
                    <div className="bg-white rounded-lg overflow-hidden">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Activity Status List</h3>
                            <p className="text-sm text-gray-600">
                                {activityData.length} {activityData.length === 1 ? 'activity' : 'activities'} found
                            </p>
                        </div>

                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sr. No.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Activity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Activity Start Date Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Activity End Date Time
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex items-center justify-center">
                                                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                                                    Loading activities...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-red-500">
                                                <div className="space-y-2">
                                                    <p className="font-medium">Failed to load activities</p>
                                                    <p className="text-sm">{error}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : activityData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                <div className="space-y-2">
                                                    <p className="font-medium">No activities found</p>
                                                    <p className="text-sm">There are no activities to display for this region.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        activityData.map((activity, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div className="font-medium">
                                                        {activity.ActivityDetails || activity.ActivityName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {activity.ActivityStartDateTimeF || formatDateTime(activity.ActivityStartDateTime)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {activity.ActivityEndDateTimeF || formatDateTime(activity.ActivityEndDateTime)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => handleEditClick(index)}
                                                        disabled={showEditForm || loading}
                                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Edit Activity"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>



            </div>
        </div>
    );
};

export default ActivityStatusManagement;
