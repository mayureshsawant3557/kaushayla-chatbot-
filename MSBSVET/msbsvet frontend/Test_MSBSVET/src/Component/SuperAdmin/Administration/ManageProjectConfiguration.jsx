import React, { useState, useEffect } from 'react';
import { Edit, Menu, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { ProjectConfiguration } from "../../../Endpoints_All/Administration/admin"
import { getDeviceIP } from '../../../utils/CommonHelper';

const ProjectConfigurationManager = () => {
    const [configurations, setConfigurations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editingConfig, setEditingConfig] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [ipAddress, setIpAddress] = useState("");

    // Form state for editing
    const [formData, setFormData] = useState({
        RegionID: 1,
        AppKey: '',
        AppValue: '',
        ModifiedBy: 'Admin',
        ModifiedByIPAddress: ipAddress
    });

    // Base API URL
    const API_BASE_URL = ProjectConfiguration;

    // Auto-clear messages after delay
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

     const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };

    // Fetch project configurations
    const fetchConfigurations = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/GetProjectConfigurationList?regionID=1`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch configurations (${response.status})`);
            }

            const data = await response.json();

            // Ensure data is an array
            if (Array.isArray(data)) {
                setConfigurations(data);
            } else {
                console.warn('API returned non-array data:', data);
                setConfigurations([]);
            }
        } catch (err) {
            setError(`Failed to fetch configurations: ${err.message}`);
            console.error('Error fetching configurations:', err);
            setConfigurations([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit button click
    const handleEdit = (config) => {
        setEditingConfig(config);
        setFormData({
            RegionID: config.RegionID || 1,
            AppKey: config.AppKey || '',
            AppValue: config.AppValue || '',
            ModifiedBy: 'Admin',
            ModifiedByIPAddress: ipAddress
        });
        setIsEditing(true);
        setError(null);
        setSuccess(null);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle update
    const handleUpdate = async () => {
        if (!formData.AppValue?.trim()) {
            setError('Key Value is required');
            return;
        }

        try {
            setIsUpdating(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/SaveProjectConfigurationDetails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Update failed (${response.status}): ${errorData}`);
            }

            setSuccess(`Configuration "${formData.AppKey}" updated successfully!`);

            // Refresh the list
            await fetchConfigurations();

            // Close edit mode
            handleCancel();

        } catch (err) {
            setError(`Failed to update configuration: ${err.message}`);
            console.error('Error updating configuration:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setIsEditing(false);
        setEditingConfig(null);
        setFormData({
            RegionID: 1,
            AppKey: '',
            AppValue: '',
            ModifiedBy: 'Admin',
            ModifiedByIPAddress: ipAddress
        });
        setError(null);
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchConfigurations();
        fetchIP();
    }, []);

    // Loading state

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                        <Menu size={20} />
                        <span>Manage Project Configuration</span>
                    </button>


                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
                        <CheckCircle size={20} className="mr-2 flex-shrink-0" />
                        <span className="flex-grow">{success}</span>
                        <button
                            onClick={() => setSuccess(null)}
                            className="ml-4 text-sm underline hover:no-underline"
                        >
                            �
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
                        <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                        <span className="flex-grow">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-4 text-sm underline hover:no-underline"
                        >
                            �
                        </button>
                    </div>
                )}

                {/* Edit Form */}
                {isEditing && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            Edit Configuration: {editingConfig?.AppKey}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Key Details <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="AppKey"
                                    value={formData.AppKey}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter key details"
                                    readOnly
                                />
                                <p className="mt-1 text-sm text-gray-500">This field is read-only</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Key Value <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="AppValue"
                                    value={formData.AppValue}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isUpdating}
                                >
                                    <option value="">Select a value</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleUpdate}
                                disabled={!formData.AppValue?.trim() || isUpdating}
                                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                                <span>{isUpdating ? 'Updating...' : 'Update'}</span>
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isUpdating}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Configuration List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Project Configuration List
                        </h2>

                    </div>

                    {configurations.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <Menu size={48} className="mx-auto" />
                            </div>
                            <div className="text-lg text-gray-600 mb-2">No configurations found</div>
                            <p className="text-gray-500 mb-4">
                                There are no project configurations available for this region.
                            </p>
                            <button
                                onClick={fetchConfigurations}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                            Sr. No.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Key Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Key Value
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {configurations.map((config, index) => (
                                        <tr key={`${config.AppKey}-${index}`} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="font-medium">
                                                    {config.AppKeyDetails || config.AppKey || 'N/A'}
                                                </div>
                                                {config.AppKeyDetails && config.AppKey && config.AppKeyDetails !== config.AppKey && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Key: {config.AppKey}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs truncate" title={config.AppValue}>
                                                    {config.AppValue || 'No value set'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <button
                                                    onClick={() => handleEdit(config)}
                                                    disabled={isEditing}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={`Edit ${config.AppKey || 'configuration'}`}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectConfigurationManager;
