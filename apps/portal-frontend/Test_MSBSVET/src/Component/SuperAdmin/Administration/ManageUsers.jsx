// import React, { useState, useEffect } from 'react';
// import { Edit, Loader2, Plus, X, Save, RotateCcw } from 'lucide-react';
// import agentPublic from '../../../lib/api/publicAgent';
// import DropdownComponent from "../../formcomponent/DropdownComponent";
// import FormComponent from "../../formcomponent/FormComponent";
// import { GetMasterTableList } from "../../../Endpoints_All/Base/masterData";
// import { GetMasterDistrict } from "../../../Endpoints_All/Base/location"
// import { GetUsersList, SaveUser, ActivateOrDeactivateUser } from "../../../Endpoints_All/Administration/admin"
// const ManageUsers = () => {
//     const [showSelect, setShowSelect] = useState(true);
//     const [showModal, setShowModal] = useState(false);
//     const [editingUser, setEditingUser] = useState(null);
//     const [loading, setLoading] = useState({
//         users: false,
//         userTypes: false,
//         districts: false,
//         saving: false
//     });
//     const [errors, setErrors] = useState({});

//     // State for data
//     const [users, setUsers] = useState([]);
//     const [filteredUsers, setFilteredUsers] = useState([]);
//     const [userTypeOptions, setUserTypeOptions] = useState([]);
//     const [districtOptions, setDistrictOptions] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [entriesPerPage, setEntriesPerPage] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);

//     const [formData, setFormData] = useState({
//         userType: ''
//     });

//     const [userFormData, setUserFormData] = useState({
//         userName: '',
//         mobileNumber: '',
//         email: '',
//         district: '',
//         loginId: '',
//         password: ''
//     });


//     // Safe base64 decode function
//     const safeBase64Decode = (str) => {
//         if (!str) return '';
//         try {
//             return atob(str);
//         } catch (error) {
//             console.warn('Failed to decode base64 string:', str, error);
//             return str; // Return original string if decoding fails
//         }
//     };

//     // Fetch User Types
//     const fetchUserTypes = async () => {
//         try {
//             setLoading(prev => ({ ...prev, userTypes: true }));
//             const response = await agentPublic.get(GetMasterTableList, {
//                 params: {
//                     TableName: 'Master_UserType',
//                     DataValueField: 'UserTypeID',
//                     DataTextField: 'UserType',
//                     HasSelect: true,
//                     orderByText: 'UserTypeID'
//                 }
//             });

//             if (response.data.Status === 'Success') {
//                 const options = response.data.Data.map(item => ({
//                     value: item.Value,
//                     label: item.Text
//                 }));
//                 setUserTypeOptions(options);
//             }
//         } catch (error) {
//             console.error('Error fetching user types:', error);
//         } finally {
//             setLoading(prev => ({ ...prev, userTypes: false }));
//         }
//     };

//     // Fetch Districts
//     const fetchDistricts = async () => {
//         try {
//             setLoading(prev => ({ ...prev, districts: true }));
//             const response = await agentPublic.get(GetMasterDistrict);

//             if (response.data.Status === 'Success') {
//                 const options = response.data.Data.map(item => ({
//                     value: item.Value,
//                     label: item.Text
//                 }));
//                 setDistrictOptions(options);
//             }
//         } catch (error) {
//             console.error('Error fetching districts:', error);
//         } finally {
//             setLoading(prev => ({ ...prev, districts: false }));
//         }
//     };

//     // Fetch Users List
//     const fetchUsers = async (userTypeID) => {
//         if (!userTypeID || userTypeID === '-1') {
//             setUsers([]);
//             setFilteredUsers([]);
//             return;
//         }

//         try {
//             setLoading(prev => ({ ...prev, users: true }));
//             const response = await agentPublic.get(GetUsersList, {
//                 params: {
//                     userTypeID: parseInt(userTypeID)
//                 }
//             });

//             if (Array.isArray(response.data)) {
//                 setUsers(response.data);
//                 setFilteredUsers(response.data);
//             }
//         } catch (error) {
//             console.error('Error fetching users:', error);
//         } finally {
//             setLoading(prev => ({ ...prev, users: false }));
//         }
//     };

//     // Initialize data on component mount
//     useEffect(() => {
//         fetchUserTypes();
//         fetchDistricts();
//     }, []);

//     // Fetch users when user type changes
//     useEffect(() => {
//         if (formData.userType) {
//             fetchUsers(formData.userType);
//         }
//     }, [formData.userType]);

//     // Search functionality
//     useEffect(() => {
//         if (!searchTerm) {
//             setFilteredUsers(users);
//         } else {
//             const filtered = users.filter(user =>
//                 user.UserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 user.UserLoginID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 user.UserMobileNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 user.UserEMailID?.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//             setFilteredUsers(filtered);
//         }
//         setCurrentPage(1);
//     }, [searchTerm, users]);

//     // Pagination
//     const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
//     const startIndex = (currentPage - 1) * entriesPerPage;
//     const endIndex = startIndex + entriesPerPage;
//     const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

//     const handleAddNewUser = () => {
//         setEditingUser(null);
//         setUserFormData({
//             userName: '',
//             mobileNumber: '',
//             email: '',
//             district: '',
//             loginId: '',
//             password: ''
//         });
//         setShowModal(true);
//     };

//     const handleEditUser = (user) => {
//         setEditingUser(user);
//         setUserFormData({
//             userName: user.UserName || '',
//             mobileNumber: user.UserMobileNo || '',
//             email: user.UserEMailID || '',
//             district: '', // You might need to get this from the user data
//             loginId: user.UserLoginID || '',
//             password: safeBase64Decode(user.UserPassword || '') // Use safe decode
//         });
//         setShowModal(true);
//     };

//     const handleCloseModal = () => {
//         setShowModal(false);
//         setEditingUser(null);
//         setErrors({});
//     };

//     const handleChange = (field, value) => {
//         setFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     const handleUserFormChange = (field, value) => {
//         setUserFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//         // Clear error when user starts typing
//         if (errors[field]) {
//             setErrors(prev => ({
//                 ...prev,
//                 [field]: ''
//             }));
//         }
//     };

//     // Validate form
//     const validateForm = () => {
//         const newErrors = {};

//         if (!userFormData.userName.trim()) {
//             newErrors.userName = 'User name is required';
//         }
//         if (!userFormData.mobileNumber.trim()) {
//             newErrors.mobileNumber = 'Mobile number is required';
//         }
//         if (!userFormData.email.trim()) {
//             newErrors.email = 'Email is required';
//         }
//         if (!userFormData.district || userFormData.district === '-1') {
//             newErrors.district = 'District is required';
//         }
//         if (!editingUser && !userFormData.loginId.trim()) {
//             newErrors.loginId = 'Login ID is required';
//         }
//         if (!editingUser && !userFormData.password.trim()) {
//             newErrors.password = 'Password is required';
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = async () => {
//         if (!validateForm()) {
//             return;
//         }

//         try {
//             setLoading(prev => ({ ...prev, saving: true }));

//             const payload = {
//                 UserID: editingUser ? editingUser.UserID : 0,
//                 UserTypeID: parseInt(formData.userType),
//                 UserType: userTypeOptions.find(opt => opt.value === formData.userType)?.label || '',
//                 UserLoginID: userFormData.loginId,
//                 UserPassword: userFormData.password,
//                 UserName: userFormData.userName,
//                 UserMobileNo: userFormData.mobileNumber,
//                 UserEMailID: userFormData.email,
//                 DistrictID: parseInt(userFormData.district),
//                 IsActive: "Y",
//                 ActivOrDeactive: "Activate",
//                 RegionID: 1,
//                 ModifiedBy: "Admin", // You might want to get this from auth context
//                 ModifiedByIPAddress: "127.0.0.1" // You might want to get actual IP
//             };

//             const response = await agentPublic.post(SaveUser, payload);

//             if (response.data.message === 'Y') {
//                 // Refresh the users list
//                 await fetchUsers(formData.userType);
//                 handleCloseModal();
//                 // You might want to show a success message here
//             }
//         } catch (error) {
//             console.error('Error saving user:', error);
//             // Handle error - show error message to user
//         } finally {
//             setLoading(prev => ({ ...prev, saving: false }));
//         }
//     };

//     const handleActivateDeactivate = async (userId) => {
//         try {
//             const payload = {
//                 UserID: userId,
//                 ModifiedBy: "Admin", // You might want to get this from auth context
//                 ModifiedByIPAddress: "127.0.0.1" // You might want to get actual IP
//             };

//             const response = await agentPublic.post(ActivateOrDeactivateUser, payload);

//             if (response.data.message === 'Y') {
//                 // Refresh the users list
//                 await fetchUsers(formData.userType);
//             }
//         } catch (error) {
//             console.error('Error activating/deactivating user:', error);
//         }
//     };

//     const handleSendSMS = async (userId) => {
//         // Implement SMS functionality when API is provided
//         console.log(`Send SMS to user with ID: ${userId}`);
//     };

//     // Export to CSV
//     const handleExportCSV = () => {
//         if (filteredUsers.length === 0) {
//             return;
//         }

//         const headers = ['Login ID', 'Password', 'User Name', 'Mobile No.', 'Email', 'Active Status'];
//         const csvContent = [
//             headers.join(','),
//             ...filteredUsers.map(user => [
//                 user.UserLoginID,
//                 safeBase64Decode(user.UserPassword),
//                 user.UserName,
//                 user.UserMobileNo,
//                 user.UserEMailID,
//                 user.IsActive
//             ].join(','))
//         ].join('\n');

//         const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//         const link = document.createElement('a');
//         const url = URL.createObjectURL(blob);
//         link.setAttribute('href', url);
//         link.setAttribute('download', 'users_data.csv');
//         link.style.visibility = 'hidden';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     return (
//         <div className="mt-6 p-4">
//             {/* Header */}
//             <div className="bg-gray-100 px-4 py-2 rounded-t-md border border-gray-300">
//                 <h2 className="text-lg font-medium text-gray-700">≡ Manage Users</h2>
//             </div>

//             {/* User Type Selection */}
//             {showSelect && (
//                 <div className="bg-white px-4 py-4 border-l border-r border-gray-300">
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//                         <div className="lg:col-start-2">
//                             <DropdownComponent
//                                 label="User Type"
//                                 options={userTypeOptions}
//                                 value={formData.userType}
//                                 onChange={(value) => handleChange("userType", value)}
//                                 error={errors.userType}
//                                 required
//                                 loading={loading.userTypes}
//                                 placeholder="Select User Type"
//                             />
//                         </div>

//                         <div className="flex items-end">
//                             <button
//                                 onClick={handleAddNewUser}
//                                 disabled={!formData.userType || formData.userType === "-1"}
//                                 className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-md transition-colors duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
//                             >
//                                 <Plus className="h-4 w-4" />
//                                 Add New User
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Notice */}
//             <div className="bg-yellow-50 border-l border-r border-gray-300 px-4 py-2">
//                 <p className="text-sm text-red-600">
//                     <strong>Note:</strong> To Send Login ID and Password on Registered Mobile Number, Click On Send SMS Button.
//                 </p>
//             </div>

//             {/* Export Button */}
//             <div className="bg-white border-l border-r border-gray-300 px-4 py-2">
//                 <button
//                     onClick={handleExportCSV}
//                     disabled={filteredUsers.length === 0}
//                     className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded disabled:bg-green-400 disabled:cursor-not-allowed"
//                 >
//                     Excel
//                 </button>
//             </div>

//             {/* Show entries and search */}
//             <div className="bg-white border-l border-r border-gray-300 px-4 py-2 flex justify-between items-center">
//                 <div className="flex items-center gap-2">
//                     <span className="text-sm">Show</span>
//                     <select
//                         value={entriesPerPage}
//                         onChange={(e) => {
//                             setEntriesPerPage(parseInt(e.target.value));
//                             setCurrentPage(1);
//                         }}
//                         className="border border-gray-300 rounded px-2 py-1 text-sm"
//                     >
//                         <option value={10}>10</option>
//                         <option value={25}>25</option>
//                         <option value={50}>50</option>
//                     </select>
//                     <span className="text-sm">entries</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <label className="text-sm">Search:</label>
//                     <input
//                         type="text"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
//                         placeholder="Search users..."
//                     />
//                 </div>
//             </div>

//             {/* Loading indicator */}
//             {loading.users && (
//                 <div className="text-center py-8">
//                     <Loader2 className="inline-block animate-spin h-6 w-6 text-blue-600" />
//                     <span className="ml-2">Loading users...</span>
//                 </div>
//             )}

//             {/* Users Table */}
//             {filteredUsers.length > 0 && (
//                 <div className="bg-white border border-gray-300 rounded-b-md">
//                     <table className="w-full border-collapse">
//                         <thead>
//                             <tr className="bg-gray-50">
//                                 <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
//                                     Send SMS
//                                 </th>
//                                 <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
//                                     Edit
//                                 </th>
//                                 <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
//                                     Activate/Deactivate
//                                 </th>
//                                 <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
//                                     Login ID
//                                 </th>
//                                 <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
//                                     Password
//                                 </th>
//                                 <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
//                                     User Name
//                                 </th>
//                                 <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
//                                     Mobile No.
//                                 </th>
//                                 <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
//                                     Active-Status
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {paginatedUsers.map((user) => (
//                                 <tr
//                                     key={user.UserID}
//                                     className={user.IsActive === 'Active' ? "bg-white hover:bg-gray-50" : "bg-red-50 hover:bg-red-100"}
//                                 >
//                                     <td className="border border-gray-300 px-4 py-3">
//                                         <button
//                                             onClick={() => handleSendSMS(user.UserID)}
//                                             disabled={user.IsActive !== 'Active'}
//                                             className={`text-white text-xs px-2 py-1 rounded ${user.IsActive === 'Active'
//                                                 ? 'bg-yellow-500 hover:bg-yellow-600'
//                                                 : 'bg-gray-400 cursor-not-allowed'
//                                                 }`}
//                                         >
//                                             Send SMS
//                                         </button>
//                                     </td>
//                                     <td className="border border-gray-300 px-4 py-3">
//                                         <button
//                                             onClick={() => handleEditUser(user)}
//                                             disabled={user.IsActive !== 'Active'}
//                                             className={`text-white text-xs px-2 py-1 rounded ${user.IsActive === 'Active'
//                                                 ? 'bg-blue-500 hover:bg-blue-600'
//                                                 : 'bg-gray-400 cursor-not-allowed'
//                                                 }`}
//                                         >
//                                             Edit
//                                         </button>
//                                     </td>
//                                     <td className="border border-gray-300 px-4 py-3">
//                                         <button
//                                             onClick={() => handleActivateDeactivate(user.UserID)}
//                                             className={`text-white text-xs px-2 py-1 rounded ${user.IsActive === 'Active'
//                                                 ? 'bg-red-500 hover:bg-red-600'
//                                                 : 'bg-green-500 hover:bg-green-600'
//                                                 }`}
//                                         >
//                                             {user.ActivOrDeactive}
//                                         </button>
//                                     </td>
//                                     <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
//                                         {user.UserLoginID}
//                                     </td>
//                                     <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
//                                         {safeBase64Decode(user.UserPassword)}
//                                     </td>
//                                     <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
//                                         {user.UserName}
//                                     </td>
//                                     <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
//                                         {user.UserMobileNo}
//                                     </td>
//                                     <td className="border border-gray-300 px-4 py-3 text-sm">
//                                         <span className={`px-2 py-1 rounded-full text-xs ${user.IsActive === 'Active'
//                                             ? 'bg-green-100 text-green-800'
//                                             : 'bg-red-100 text-red-800'
//                                             }`}>
//                                             {user.IsActive}
//                                         </span>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}

//             {/* Enhanced Pagination */}
//             {filteredUsers.length > 0 && (
//                 <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
//                     {/* Results info */}
//                     <span className="text-sm text-gray-600">
//                         Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} entries
//                     </span>

//                     {/* Pagination controls */}
//                     <div className="flex items-center gap-1">
//                         {/* Previous button */}
//                         <button
//                             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                             disabled={currentPage === 1}
//                             className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             Previous
//                         </button>

//                         {/* Smart page number buttons */}
//                         {(() => {
//                             const maxVisiblePages = 5;
//                             const pages = [];

//                             if (totalPages <= maxVisiblePages) {
//                                 // Show all pages if total is small
//                                 for (let i = 1; i <= totalPages; i++) {
//                                     pages.push(
//                                         <button
//                                             key={i}
//                                             onClick={() => setCurrentPage(i)}
//                                             className={`px-3 py-1 rounded text-sm min-w-[32px] ${currentPage === i
//                                                 ? 'bg-blue-500 text-white'
//                                                 : 'border border-gray-300 hover:bg-gray-50'
//                                                 }`}
//                                         >
//                                             {i}
//                                         </button>
//                                     );
//                                 }
//                             } else {
//                                 // Show smart pagination with ellipsis
//                                 const showLeftEllipsis = currentPage > 3;
//                                 const showRightEllipsis = currentPage < totalPages - 2;

//                                 // Always show first page
//                                 pages.push(
//                                     <button
//                                         key={1}
//                                         onClick={() => setCurrentPage(1)}
//                                         className={`px-3 py-1 rounded text-sm min-w-[32px] ${currentPage === 1
//                                             ? 'bg-blue-500 text-white'
//                                             : 'border border-gray-300 hover:bg-gray-50'
//                                             }`}
//                                     >
//                                         1
//                                     </button>
//                                 );

//                                 // Left ellipsis
//                                 if (showLeftEllipsis) {
//                                     pages.push(
//                                         <span key="left-ellipsis" className="px-2 py-1 text-gray-500">
//                                             ...
//                                         </span>
//                                     );
//                                 }

//                                 // Pages around current page
//                                 const startPage = Math.max(2, currentPage - 1);
//                                 const endPage = Math.min(totalPages - 1, currentPage + 1);

//                                 for (let i = startPage; i <= endPage; i++) {
//                                     if (i !== 1 && i !== totalPages) {
//                                         pages.push(
//                                             <button
//                                                 key={i}
//                                                 onClick={() => setCurrentPage(i)}
//                                                 className={`px-3 py-1 rounded text-sm min-w-[32px] ${currentPage === i
//                                                     ? 'bg-blue-500 text-white'
//                                                     : 'border border-gray-300 hover:bg-gray-50'
//                                                     }`}
//                                             >
//                                                 {i}
//                                             </button>
//                                         );
//                                     }
//                                 }

//                                 // Right ellipsis
//                                 if (showRightEllipsis) {
//                                     pages.push(
//                                         <span key="right-ellipsis" className="px-2 py-1 text-gray-500">
//                                             ...
//                                         </span>
//                                     );
//                                 }

//                                 // Always show last page (if more than 1 page)
//                                 if (totalPages > 1) {
//                                     pages.push(
//                                         <button
//                                             key={totalPages}
//                                             onClick={() => setCurrentPage(totalPages)}
//                                             className={`px-3 py-1 rounded text-sm min-w-[32px] ${currentPage === totalPages
//                                                 ? 'bg-blue-500 text-white'
//                                                 : 'border border-gray-300 hover:bg-gray-50'
//                                                 }`}
//                                         >
//                                             {totalPages}
//                                         </button>
//                                     );
//                                 }
//                             }

//                             return pages;
//                         })()}

//                         {/* Next button */}
//                         <button
//                             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                             disabled={currentPage === totalPages}
//                             className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Modal for Add/Edit User */}
//             {showModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
//                         <div className="bg-gray-100 px-4 py-3 rounded-t-lg border-b flex justify-between items-center">
//                             <h2 className="text-lg font-medium text-gray-700">
//                                 ≡ {editingUser ? "Edit Users" : "Add / Edit Users"}
//                             </h2>
//                             <button
//                                 onClick={handleCloseModal}
//                                 disabled={loading.saving}
//                                 className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
//                                 aria-label="Close modal"
//                             >
//                                 <X className="w-5 h-5" />
//                             </button>
//                         </div>

//                         <div className="p-6 space-y-6">
//                             {/* User Name */}
//                             <FormComponent
//                                 label="User Name"
//                                 value={userFormData.userName}
//                                 onChange={(value) => handleUserFormChange("userName", value)}
//                                 error={errors.userName}
//                                 required
//                                 placeholder="Enter user name"
//                             />

//                             {/* User Mobile Number */}
//                             <FormComponent
//                                 label="User Mobile Number"
//                                 value={userFormData.mobileNumber}
//                                 onChange={(value) => handleUserFormChange("mobileNumber", value)}
//                                 error={errors.mobileNumber}
//                                 required
//                                 placeholder="Enter mobile number"
//                             />

//                             {/* User E-Mail ID */}
//                             <FormComponent
//                                 label="User E-Mail ID"
//                                 type="email"
//                                 value={userFormData.email}
//                                 onChange={(value) => handleUserFormChange("email", value)}
//                                 error={errors.email}
//                                 required
//                                 placeholder="Enter email address"
//                             />

//                             {/* District */}
//                             <DropdownComponent
//                                 label="District"
//                                 options={districtOptions}
//                                 value={userFormData.district}
//                                 onChange={(value) => handleUserFormChange("district", value)}
//                                 error={errors.district}
//                                 required
//                                 loading={loading.districts}
//                                 placeholder="Select District"
//                             />

//                             {/* Login ID and Password for new users only */}
//                             {!editingUser && (
//                                 <>
//                                     <FormComponent
//                                         label="Login ID"
//                                         value={userFormData.loginId}
//                                         onChange={(value) => handleUserFormChange("loginId", value)}
//                                         error={errors.loginId}
//                                         required
//                                         placeholder="Enter login ID"
//                                     />

//                                     <FormComponent
//                                         label="Password"
//                                         type="password"
//                                         value={userFormData.password}
//                                         onChange={(value) => handleUserFormChange("password", value)}
//                                         error={errors.password}
//                                         required
//                                         placeholder="Enter password"
//                                     />
//                                 </>
//                             )}
//                         </div>

//                         {/* Modal Action Buttons */}
//                         <div className="flex justify-center gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
//                             <button
//                                 onClick={handleCloseModal}
//                                 disabled={loading.saving}
//                                 className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 ← Back
//                             </button>
//                             <button
//                                 onClick={handleSubmit}
//                                 disabled={loading.saving}
//                                 className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 {loading.saving && <Loader2 className="h-4 w-4 animate-spin" />}
//                                 Save
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ManageUsers;
