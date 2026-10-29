import { useState, useEffect } from "react";
import agent from '../../../lib/api/agent';
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FormComponent from "../../formcomponent/FormComponent";
import { Edit, Trash2, X } from "lucide-react";
import Swal from 'sweetalert2';
import { GetTableViewList, GetColumnList, GetReportList, GetReport, SaveReport, DeleteReport } from '../../../Endpoints_All/Administration/admin.jsx';
import { getDeviceIP } from "../../../utils/CommonHelper.jsx";
const ReportsManagement = () => {
    const [formData, setFormData] = useState({
        ReportID: 0,
        ReportName: "",
        ReportQuery: "",
        RegionID: 1,
        UserLoginID: "SUPERADMIN",
        IPAddress: ipAddress
    });

    const [tableViewOptions, setTableViewOptions] = useState([]);
    const [columnsList, setColumnsList] = useState([]);
    const [reportsList, setReportsList] = useState([]);
    const [selectedTableView, setSelectedTableView] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [ipAddress, setIpAddress] = useState("");


    // Fetch table/view list on component mount
    useEffect(() => {
        fetchTableViewList();
        fetchReportsList();
        fetchIP();
    }, []);

    // Fetch columns when table/view is selected
    useEffect(() => {
        if (selectedTableView) {
            fetchColumnsList(selectedTableView);
        }
    }, [selectedTableView]);

    const fetchIP = async () => {
    try {
        const ip = await getDeviceIP();
        setIpAddress(ip);
    } catch (err) {
        console.error("Failed to get IP:", err);
    }
    };

    const fetchTableViewList = async () => {
        try {
            const response = await agent.get(GetTableViewList);
            setTableViewOptions(response.data);
        } catch (error) {
            console.error('Error fetching table/view list:', error);
            Swal.fire('Error', 'Failed to fetch table/view list', 'error');
        }
    };

    const fetchColumnsList = async (tableViewName) => {
        try {
            const response = await agent.get(`${GetColumnList}?tableViewName=${tableViewName}`);
            setColumnsList(response.data);
        } catch (error) {
            console.error('Error fetching columns list:', error);
            Swal.fire('Error', 'Failed to fetch columns list', 'error');
        }
    };

    const fetchReportsList = async () => {
        try {
            const response = await agent.get(`${GetReportList}?regionID=${formData.RegionID}`);
            setReportsList(response.data);
        } catch (error) {
            console.error('Error fetching reports list:', error);
            Swal.fire('Error', 'Failed to fetch reports list', 'error');
        }
    };

    const fetchReportById = async (reportID) => {
        try {
            setIsLoading(true);
            const response = await agent.get(`${GetReport}/${reportID}`);
            if (response.data && response.data.length > 0) {
                const report = response.data[0];
                setFormData({
                    ...formData,
                    ReportID: report.ReportID,
                    ReportName: report.ReportName,
                    ReportQuery: report.ReportQuery
                });
                setIsEditing(true);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            Swal.fire('Error', 'Failed to fetch report details', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const handleTableViewChange = (value) => {
        setSelectedTableView(value);
        setColumnsList([]);
    };

    const handleColumnClick = (columnName) => {
        // Add column name to the current cursor position in the query
        const currentQuery = formData.ReportQuery;
        setFormData(prev => ({
            ...prev,
            ReportQuery: currentQuery + (currentQuery ? ', ' : '') + columnName
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.ReportName?.trim()) {
            newErrors.ReportName = "Report name is required";
        }

        if (!formData.ReportQuery?.trim()) {
            newErrors.ReportQuery = "Report query is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await agent.post(SaveReport, formData);

            if (response.data.message === "Y") {
                Swal.fire('Success', isEditing ? 'Report updated successfully' : 'Report saved successfully', 'success');
                handleReset();
                fetchReportsList();
            } else {
                Swal.fire('Error', 'Failed to save report', 'error');
            }
        } catch (error) {
            console.error('Error saving report:', error);
            Swal.fire('Error', 'Failed to save report', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (reportID) => {
        fetchReportById(reportID);
    };

    const handleDelete = async (reportID) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this report!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setIsLoading(true);
                const deleteData = {
                    ReportID: reportID,
                    UserLoginID: formData.UserLoginID,
                    IPAddress: formData.IPAddress
                };

                const response = await agent.delete(DeleteReport, {
                    data: deleteData
                });

                if (response.data.message === "Y") {
                    Swal.fire('Deleted!', 'Report has been deleted successfully', 'success');
                    fetchReportsList();
                } else {
                    Swal.fire('Error', 'Failed to delete report', 'error');
                }
            } catch (error) {
                console.error('Error deleting report:', error);
                Swal.fire('Error', 'Failed to delete report', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleReset = () => {
        setFormData({
            ReportID: 0,
            ReportName: "",
            ReportQuery: "",
            RegionID: 1,
            UserLoginID: "SUPERADMIN",
            IPAddress: ipAddress
        });
        setSelectedTableView("");
        setColumnsList([]);
        setIsEditing(false);
        setErrors({});
    };

    const formatOptions = (options) => {
        return options?.map(option => ({
            value: option.name,
            label: option.name
        })) || [];
    };

    return (
        <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
            {/* Header */}
            <div className="mb-4">
                <button className="rounded-md bg-gray-500 px-4 py-2 text-white">
                    Manage Reports
                </button>
            </div>

            {/* Add/Edit Report Form */}
            <div className="mb-6 rounded-lg border p-4">
                <h2 className="mb-4 text-lg font-semibold">Add / Edit Report</h2>

                <div className="grid grid-cols-2 gap-4">
                    <FormComponent
                        label="Report Name"
                        value={formData.ReportName}
                        onChange={(value) => handleChange("ReportName", value)}
                        error={errors.ReportName}
                        required
                    />

                    <DropdownComponent
                        label="Select Table / View"
                        options={formatOptions(tableViewOptions)}
                        value={selectedTableView}
                        onChange={handleTableViewChange}
                        placeholder="Select"
                    />
                </div>

                <div className="mt-4 grid grid-cols-12 gap-4">
                    <div className="col-span-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Report Query <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={formData.ReportQuery}
                            onChange={(e) => handleChange("ReportQuery", e.target.value)}
                            placeholder="Enter your SQL query here..."
                        />
                        {errors.ReportQuery && (
                            <p className="mt-1 text-sm text-red-600">{errors.ReportQuery}</p>
                        )}
                    </div>

                    <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available Columns
                        </label>
                        <div className="h-64 overflow-y-auto border border-gray-300 rounded-md p-2">
                            {columnsList.length > 0 ? (
                                columnsList.map((column, index) => (
                                    <div
                                        key={index}
                                        className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                                        onClick={() => handleColumnClick(column.name)}
                                    >
                                        {column.name}
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    {selectedTableView ? 'Loading columns...' : 'Select a table/view to see columns'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-center space-x-4">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>

                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 flex items-center gap-2"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Report List Table */}
            <div className="rounded-lg border p-4">
                <h2 className="mb-4 text-lg font-semibold">Report List</h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">Sr. No.</th>
                                <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">Report Name</th>
                                <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">Excel</th>
                                <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">Edit</th>
                                <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportsList.map((report, index) => (
                                <tr key={report.ReportID} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b text-center text-sm text-gray-700">{index + 1}</td>
                                    <td className="py-2 px-4 border-b text-center text-sm text-gray-700">{report.ReportName}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <button
                                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1 rounded"
                                            title="Export to Excel"
                                        >

                                        </button>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <button
                                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1 rounded"
                                            onClick={() => handleEdit(report.ReportID)}
                                            title="Edit"
                                            disabled={isLoading}
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <button
                                            className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-1 rounded"
                                            onClick={() => handleDelete(report.ReportID)}
                                            title="Delete"
                                            disabled={isLoading}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {reportsList.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-4 text-center text-gray-500">
                                        No reports found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsManagement;
