


// import RedirectToOld from "../../../Component/formcomponent/RedirectToOld";
// const Approveorder = () => {
//     return <RedirectToOld targetPath="/ExistingInstitute/ApprovalOrder.aspx" />;
// }

// export default Approveorder;

import React, { useState, useEffect, useContext } from "react";
import agent from "../../../lib/api/agent";
import Swal from "sweetalert2";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";
import UploadPdf from "../../../Component/formcomponent/UploadPdf";
import { DateInput } from "../../../Component/formcomponent/DateInputComponent";
import FormComponent from "../../../Component/formcomponent/FormComponent";
import { useLoading } from "../../../Hooks/useLoading";
import { FiEye, FiEdit, FiX } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import {
    GetApprovalOrder,
    GetApprovalOrderByID,
    SaveApprovalOrder,
    DeleteApprovalOrder,
} from "../../../Endpoints_All/Institute/existinginstitute";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import pdflogo from "../../../assets/pdf.png";
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { useAuth } from "../../../Hooks/AuthContext";

const ApprovalOrder = () => {
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();

    const [userLoginID, setUserLoginID] = useState(null);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");

    const [orders, setOrders] = useState([]);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingOrderId, setEditingOrderId] = useState(null);

    const [formData, setFormData] = useState({
        ID: 0,
        ApprovalOrderDate: "",
        ApprovalOrderNo: "",
        ApprovalOrderRemakr: "",
        ApprovalOrder: "",
        ApprovalOrderFileName: "",
    });

    const [errors, setErrors] = useState({});

    // Fetch logged-in user
    const fetchUserDetails = async () => {
        try {
            const loginID = userInfo?.UserLoginID;
            setUserLoginID(loginID);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    // Fetch IP Address
    const fetchIP = async () => {
        try {
            const response = await agent.get(getIp, {
                headers: { accept: "*/*" },
            });
            setIpAddress(response.data?.ip || "0.0.0.0");
        } catch (error) {
            console.error("Error fetching IP:", error);
            setIpAddress("0.0.0.0");
        }
    };

    // Fetch list of approval orders
    const fetchApprovalOrders = async () => {
        try {
            startLoading();
            const response = await agent.get(GetApprovalOrder);
            if (response.data?.Data) {
                setOrders(response.data.Data);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching approval orders:", error);
            setOrders([]);
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        fetchUserDetails();
        fetchIP();
        fetchApprovalOrders();
    }, []);

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleFileChange = (fileData) => {
        setFormData((prev) => ({
            ...prev,
            ApprovalOrder: fileData.filePath || fileData.uniqueFileName || "",
            ApprovalOrderFileName: fileData.fileName || "",
        }));
        setErrors((prev) => ({ ...prev, ApprovalOrder: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.ApprovalOrderDate)
            newErrors.ApprovalOrderDate = "Approval Order Date is required";
        if (!formData.ApprovalOrderNo?.trim())
            newErrors.ApprovalOrderNo = "Approval Order No is required";
        if (!formData.ApprovalOrder)
            newErrors.ApprovalOrder = "Approval Order document is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            ID: 0,
            ApprovalOrderDate: "",
            ApprovalOrderNo: "",
            ApprovalOrderRemakr: "",
            ApprovalOrder: "",
            ApprovalOrderFileName: "",
        });
        setErrors({});
        setEditingOrderId(null);
    };

    const toISODate = (dateStr) => {
        if (!dateStr) return "";
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr; // already ISO
        const parts = dateStr.split("/"); // dd/mm/yyyy
        if (parts.length === 3) {
            const [dd, mm, yyyy] = parts;
            return `${yyyy}-${mm}-${dd}`;
        }
        return dateStr;
    };

    const handleSaveOrder = async () => {
        if (!validateForm()) {
            Swal.fire({
                icon: "error",
                title: "Validation Error",
                text: "Please fill all required fields correctly",
                confirmButtonColor: "#d33",
            });
            return;
        }

        try {
            startLoading();

            const payload = {
                id: parseInt(formData.ID) || 0,
                approvalOrderNo: formData.ApprovalOrderNo.trim(),
                approvalOrderDate: toISODate(formData.ApprovalOrderDate),
                approvalOrderDateDisplay: formData.ApprovalOrderDate,
                approvalOrder: formData.ApprovalOrder,
                approvalOrderRemakr: (formData.ApprovalOrderRemakr || "").trim(),
                userLoginID: userLoginID || "",
                ipAddress: ipAddress,
            };

            const response = await agent.post(SaveApprovalOrder, payload, {
                headers: {
                    "Content-Type": "application/json-patch+json",
                    accept: "text/plain",
                },
            });

            if (response.data?.Status === "Success") {
                await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: editingOrderId
                        ? "Approval Order updated successfully!"
                        : "Approval Order saved successfully!",
                    confirmButtonColor: "#3085d6",
                });

                resetForm();
                await fetchApprovalOrders();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        "Error saving Approval Order: " +
                        (response.data?.Message || "Unknown error"),
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            const apiMessage =
                error.response?.data?.Message || "Error saving Approval Order.";
            Swal.fire({
                icon: "error",
                title: "Error",
                text: apiMessage,
                confirmButtonColor: "#d33",
            });
        } finally {
            stopLoading();
        }
    };

    //   const handleEditOrder = async (order) => {
    //     try {
    //       startLoading();
    //       const response = await agent.get(
    //         `${GetApprovalOrderByID}?ID=${order.ID}`,
    //       );
    //       const entity = response.data?.Data;
    //       if (entity) {
    //         setFormData({
    //           ID: entity.ID,
    //           ApprovalOrderDate: entity.ApprovalOrderDate,
    //           ApprovalOrderNo: entity.ApprovalOrderNo,
    //           ApprovalOrderRemakr: entity.ApprovalOrderRemakr || "",
    //           ApprovalOrder: entity.ApprovalOrder,
    //           ApprovalOrderFileName: "",
    //         });
    //         setEditingOrderId(entity.ID);
    //         window.scrollTo({ top: 0, behavior: "smooth" });
    //       }
    //     } catch (error) {
    //       console.error("Error fetching approval order:", error);
    //       Swal.fire({
    //         icon: "error",
    //         title: "Error",
    //         text: "Unable to load approval order details.",
    //         confirmButtonColor: "#d33",
    //       });
    //     } finally {
    //       stopLoading();
    //     }
    //   };

    const handleEditOrder = async (order) => {
        try {
            startLoading();
            const response = await agent.get(
                `${GetApprovalOrderByID}?ID=${order.ID}`,
            );
            const entity = response.data?.Data;
            if (entity) {
                setFormData({
                    ID: entity.ID,
                    ApprovalOrderDate: entity.ApprovalOrderDate
                        ? entity.ApprovalOrderDate.split("T")[0] // "2026-07-22"
                        : "",
                    ApprovalOrderNo: entity.ApprovalOrderNo,
                    ApprovalOrderRemakr: entity.ApprovalOrderRemakr || "",
                    ApprovalOrder: entity.ApprovalOrder,
                    ApprovalOrderFileName: "",
                });
                setEditingOrderId(entity.ID);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } catch (error) {
            console.error("Error fetching approval order:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Unable to load approval order details.",
                confirmButtonColor: "#d33",
            });
        } finally {
            stopLoading();
        }
    };
    const handleViewOrder = async (order) => {
        try {
            startLoading();
            const response = await agent.get(
                `${GetApprovalOrderByID}?ID=${order.ID}`,
            );
            const entity = response.data?.Data;
            if (entity) {
                setSelectedOrder(entity);
                setShowViewModal(true);
            }
        } catch (error) {
            console.error("Error fetching approval order:", error);
        } finally {
            stopLoading();
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {
            startLoading();
            const response = await agent.delete(
                `${DeleteApprovalOrder}?ID=${orderId}&UserLoginID=${userLoginID}&IPAddress=${ipAddress}`,
            );

            if (response.data?.Status === "Success") {
                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "Approval Order deleted successfully!",
                    confirmButtonColor: "#3085d6",
                });
                if (editingOrderId === orderId) {
                    resetForm();
                }
                await fetchApprovalOrders();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error deleting Approval Order: " + response.data?.Message,
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            const apiMessage =
                error?.response?.data?.Message ||
                "Error deleting Approval Order. Please try again.";
            Swal.fire({
                icon: "error",
                title: "Error",
                text: apiMessage,
                confirmButtonColor: "#d33",
            });
        } finally {
            stopLoading();
        }
    };

    const openDocumentPopup = (documentUrl, itemName) => {
        if (!documentUrl) {
            Swal.fire({
                title: "No Document",
                text: "No document available to view.",
                icon: "info",
            });
            return;
        }

        const popupWidth = 900;
        const popupHeight = 700;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const popup = window.open(
            "",
            `${itemName}_PDF_Viewer`,
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`,
        );

        if (popup) {
            popup.document.write(`
        <html>
          <head>
            <title>${itemName} Document Viewer</title>
            <style>
              body { margin: 0; overflow: hidden; }
              iframe { border: none; width: 100vw; height: 100vh; }
            </style>
          </head>
          <body>
            <iframe src="${documentUrl}" frameborder="0"></iframe>
          </body>
        </html>
      `);
            popup.document.close();
            popup.focus();
        } else {
            Swal.fire({
                title: "Popup Blocked",
                text: "Please allow popups for this website to view the document.",
                icon: "error",
            });
        }
    };

    const columns = [
        {
            key: "actions",
            header: "Action",
           
            className: "text-center",
            sortable: false,
            width: "120px",
        },
        {
            key: "ApprovalOrderDateDisplay",
            header: "Approval Order Date",
            
            className: "text-center",
            width: "150px",
            sortable: false,
        },
        {
            key: "ApprovalOrderNo",
            header: "Approval Order No",
            
            className: "text-left",
            width: "200px",
            searchable: true,
            sortable: false,
        },
        {
            key: "ApprovalOrderRemakr",
            header: "Approval Approval Order Remark",
           
            className: "text-left",
            width: "220px",
            sortable: false,
        },
        {
            key: "ApprovalOrder",
            header: "Approval Order",
            
            className: "text-center",
            width: "120px",
            sortable: false,
        },
    ];

    const renderCell = (row, column) => {
        if (column.key === "actions") {
            return (
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => handleEditOrder(row)}
                        className="text-amber-600 hover:text-amber-800 transition"
                        title="Edit Approval Order"
                    >
                        <FiEdit size={20} />
                    </button>
                    <button
                        onClick={() => handleDeleteOrder(row.ID)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete Approval Order"
                    >
                        <FaTrash size={20} />
                    </button>
                    <button
                        onClick={() => handleViewOrder(row)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="View Approval Order"
                    >
                        <FiEye size={20} />
                    </button>
                </div>
            );
        }

        if (column.key === "ApprovalOrder" && row.ApprovalOrder) {
            return (
                <button
                    onClick={() => openDocumentPopup(row.ApprovalOrder, "Approval Order")}
                    className="inline-flex items-center"
                    title="View Approval Order"
                >
                    <img
                        src={pdflogo}
                        alt="View PDF"
                        className="w-12 h-8 object-contain cursor-pointer hover:opacity-80"
                    />
                </button>
            );
        }

        return row[column.key] || "";
    };

    const isEditing = !!editingOrderId;

    return (
        <div className="container mx-auto p-6 max-w-full bg-gray-50 min-h-screen">
            <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-1">
                <legend
                    className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
                >
                    Approval Order
                </legend>

                <div className="space-y-6">
                    {/* Add / Update Form - always visible at top */}
                    <fieldset className="border border-gray-300 rounded-lg p-6 bg-white shadow-lg">
                        <legend
                            className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-sm font-bold text-white shadow-md`}
                        >
                            {isEditing ? "Update Approval Order" : "Add Approval Order"}
                        </legend>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Approval Order Date <span className="text-red-500">*</span>
                                </label>
                                <DateInput
                                    value={formData.ApprovalOrderDate}
                                    onChange={(val) => handleChange("ApprovalOrderDate", val)}
                                    minDate={new Date(2000, 0, 1)}
                                    maxDate={new Date()}
                                />
                                {errors.ApprovalOrderDate && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.ApprovalOrderDate}
                                    </p>
                                )}
                            </div>
                            <FormComponent
                                label="Approval Order No"
                                value={formData.ApprovalOrderNo}
                                onChange={(value) => handleChange("ApprovalOrderNo", value)}
                                error={errors.ApprovalOrderNo}
                                required={true}
                                extraClass="font-medium"
                                autoUpperCase={false}
                            />

                            <FormComponent
                                label="Approval Order Remark"
                                value={formData.ApprovalOrderRemakr}
                                onChange={(value) => handleChange("ApprovalOrderRemakr", value)}
                                required={false}
                                extraClass="font-medium"
                                autoUpperCase={false}
                            />

                            <div>
                                <UploadPdf
                                    key={`approvalOrder-${formData.ApprovalOrder || "empty"}-${editingOrderId || "new"}`}
                                    file={formData.ApprovalOrderFileName || ""}
                                    onFileChange={handleFileChange}
                                    buttonClassName="bg-[#00c3f9]"
                                    buttonText="Upload"
                                    label="Approval Order"
                                    showLabel={true}
                                    allowedFileTypes="jpg, jpeg, pdf"
                                    maxFileSize="5 MB"
                                    required={true}
                                    userLoginID={userLoginID}
                                    linkName="View Approval Order"
                                    uniquefilepath={formData.ApprovalOrder || ""}
                                    id="approvalOrderUpload"
                                />
                                {errors.ApprovalOrder && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.ApprovalOrder}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleSaveOrder}
                                className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : isEditing ? "Update" : "Save"}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 bg-red-600 text-white font-semibold rounded text-sm hover:bg-red-700 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </fieldset>

                    {/* List */}
                    <fieldset className="border border-gray-300 rounded p-4 bg-gray-50">
                        <legend className="text-base font-semibold text-gray-800 px-2">
                            List of Approval Order
                        </legend>

                        <div className="mt-3">
                            <FilteredTableComponent
                                data={orders.map((o, index) => ({
                                    ...o,
                                    id: o.ID,
                                    srNo: index + 1,
                                }))}
                                columns={columns}
                                filterColumns={["ApprovalOrderNo"]}
                                customButtons={[]}
                                title=""
                                exportFileName="Approval_Order_List"
                                tableId="approval-order-table"
                                searchable={true}
                                sortable={true}
                                showExcelTemplate={false}
                                exportable={true}
                                showSearch={true}
                                showExcel={true}
                                showPDF={true}
                                showExport={false}
                                maxHeight="500px"
                                stickyHeader={true}
                                readOnly={false}
                                renderCell={renderCell}
                                emptyMessage="No approval orders added yet"
                            />
                        </div>
                    </fieldset>
                </div>
            </fieldset>

            {/* View Modal */}
            {showViewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-blue-900 text-white p-4 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold">View Approval Order</h2>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedOrder(null);
                                }}
                                className="text-white hover:text-red-300 transition bg-red-600 rounded-full p-1"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        Approval Order Date:
                                    </p>
                                    <p className="text-gray-600">
                                        {selectedOrder.ApprovalOrderDateDisplay}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        Approval Order No:
                                    </p>
                                    <p className="text-gray-600">
                                        {selectedOrder.ApprovalOrderNo}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="font-semibold text-gray-800">Remark:</p>
                                <p className="text-gray-600">
                                    {selectedOrder.ApprovalOrderRemakr || "-"}
                                </p>
                            </div>

                            {selectedOrder.ApprovalOrder && (
                                <div>
                                    <button
                                        onClick={() =>
                                            openDocumentPopup(
                                                selectedOrder.ApprovalOrder,
                                                "Approval Order",
                                            )
                                        }
                                        className="text-blue-600 hover:underline cursor-pointer"
                                    >
                                        View Approval Order Document
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovalOrder;
