//import React, { useContext, useState, useEffect } from "react";
//import { ThemeContext } from "../Context/ThemeContext";
//import FilteredTableComponent from '../formcomponent/FilteredTableComponent';
//import agent from '../../../lib/api/agent';
//import { GetUserName } from '../../Endpoints_All/ITISpecification/itiSpecification';
//import Swal from 'sweetalert2';
//import { baseURL } from '../../Endpoints_All/Config/baseConfig';
//import { useLoading } from "../../Hooks/useLoading";

//const PPPFunds = () => {
//    const { color } = useContext(ThemeContext);
//    const { startLoading, stopLoading } = useLoading();
//    const [modalOpen, setModalOpen] = useState(false);
//    const [modalType, setModalType] = useState("");
//    const [error, setError] = useState(null);
//    const [mainTableData, setMainTableData] = useState([]);
//    const [latestAllocationYear, setLatestAllocationYear] = useState("");

//    const fund = {
//        name: "PPP Fund ",
//        logo: "https://cdn-icons-png.flaticon.com/512/3135/3135673.png",
//    };

//    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
//    const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll"));
//    const userType = userInfo.userType;
//    const userLoginID = userInfo.profileId;
//    const instituteID = userInfoAll.UserID;
//    const [instituteName, setInstituteName] = useState("");

//    const API_BASE_URL = `${baseURL}/api/ITISpecification`;

//    const fetchInstituteName = async (userLoginID) => {
//        try {
//            const response = await agent.get(`${GetUserName}/${userLoginID}`, {
//                headers: { 'accept': '*/*' }
//            });
//            return response.data?.UserName || "Unknown Institute";
//        } catch (error) {
//            console.error("Error fetching institute name:", error.message);
//            return "Error fetching name";
//        }
//    };

//    useEffect(() => {
//        const loadInitialData = async () => {
//            if (userType !== "institute" || !instituteID) {
//                setError("Access restricted to institute users only.");
//                return;
//            }

//            startLoading();
//            const name = await fetchInstituteName(userLoginID);
//            setInstituteName(name);

//            await Promise.all([
//                fetchPPPFundStatus(),
//                fetchLatestAllocationYear()
//            ]);

//            stopLoading();
//        };

//        loadInitialData();
//    }, []);

//    const fetchLatestAllocationYear = async () => {
//        try {
//            const response = await agent.get(`${API_BASE_URL}/GetFundByInstitute?InstituteID=${instituteID}`);

//            if (response.data.Status === "Success" && response.data.Data && response.data.Data.length > 0) {
//                const latestYear = response.data.Data
//                    .map(x => x.FinancialYear)
//                    .sort()
//                    .at(-1);

//                setLatestAllocationYear(latestYear || "");
//            } else {
//                setLatestAllocationYear("");
//            }
//        } catch (err) {
//            console.error("Error fetching allocation year:", err);
//            setLatestAllocationYear("");
//        }
//    };

//    const fetchPPPFundStatus = async () => {
//        try {
//            const response = await agent.get(
//                `${API_BASE_URL}/GetPPPFundStatusByInstitute?InstituteID=${instituteID}`
//            );

//            if (response.data.Status === "Success" && response.data.Data && response.data.Data.length > 0) {
//                const formattedData = response.data.Data.map((item) => ({
//                    sn: item["S.N."],
//                    fy: item.FinancialYear,
//                    asOnDate: new Date(item.AsOnDate).toLocaleDateString('en-GB'),
//                    funds: item.FundsTillDate,
//                    interest: item.InterestTillDate,
//                    revenue: item.RevenueTillDate,
//                    expenditure: item.ExpenditureTillDate,
//                    repayment: item.RepaymentTillDate,
//                    balance: item.Balance
//                }));
//                setMainTableData(formattedData);
//                setError(null);
//            } else {
//                setError("No PPP Fund data found for this institute.");
//                setMainTableData([]);
//            }
//        } catch (err) {
//            console.error("Error fetching PPP Fund Status:", err);
//            setError("Failed to load PPP Fund Status. Please try again later.");
//            setMainTableData([]);
//        }
//    };

//    const refreshMainData = async () => {
//        startLoading();
//        await fetchPPPFundStatus();
//        stopLoading();
//    };

//    const openModal = (type) => {
//        setModalType(type);
//        setModalOpen(true);
//    };

//    const closeModal = async (needsRefresh = false) => {
//        setModalOpen(false);
//        setModalType("");

//        if (needsRefresh) {
//            await refreshMainData();
//        }
//    };

//    const mainTableColumns = [
//        { key: 'sn', header: 'S.N.', className: 'text-center' },
//        { key: 'fy', header: 'Financial Year', headerClassName: 'text-center', className: 'text-center', width: '100px' },
//        { key: 'asOnDate', header: 'As on Date', sortable: true, searchable: true, className: 'text-center' },
//        { key: 'funds', header: 'Funds', sortable: true, searchable: false },
//        { key: 'interest', header: 'Interest', sortable: true, searchable: false },
//        { key: 'revenue', header: 'Revenue', sortable: true, searchable: false },
//        { key: 'expenditure', header: 'Expenditure', sortable: true, searchable: false },
//        { key: 'repayment', header: 'Repayment', sortable: true, searchable: false },
//        { key: 'balance', header: 'Balance', sortable: true, searchable: false, className: 'text-center' },
//    ];

//    const renderMainTableCell = (row, column) => {
//        const value = row[column.key];
//        if (['funds', 'interest', 'revenue', 'expenditure', 'repayment'].includes(column.key)) {
//            return (
//                <button
//                    onClick={() => openModal(column.key)}
//                    className="text-blue-600 hover:text-blue-800 underline font-medium w-full text-center"
//                >
//                    {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
//                </button>
//            );
//        }
//        if (column.key === 'balance' && typeof value === 'number') {
//            return value.toLocaleString('en-IN');
//        }
//        return value;
//    };

//    if (userType !== "institute") {
//        return (
//            <div className="max-w-full mx-auto p-6 bg-white rounded shadow">
//                <div className="bg-red-50 border border-red-300 rounded-md px-6 py-4 text-center">
//                    <h3 className="text-xl font-semibold text-red-700">Access Denied</h3>
//                    <p className="text-red-600 mt-2">This page is only accessible to institute users.</p>
//                </div>
//            </div>
//        );
//    }

//    return (
//        <div className="max-w-full mx-auto p-6 bg-white rounded shadow">
//            <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-1">
//                <legend className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}>
//                    <img src={fund.logo} alt="Fund Logo" className="w-7 h-7 mr-2 rounded-full bg-blue-50 border border-blue-200 shadow-sm" />
//                    {fund.name}
//                </legend>

//                <div className="flex flex-wrap items-center justify-between gap-6 bg-blue-50 border border-blue-200 rounded-md px-4 py-3 mt-4 shadow-sm">
//                    <div>
//                        <h3 className="text-lg font-semibold text-blue-700 underline">PPP Fund Status</h3>
//                        <div className="flex items-center gap-2 text-gray-800 font-medium">
//                            <span>Institute Name:</span>
//                            <span className="px-3 py-1 rounded">{instituteName || "—"}</span>
//                        </div>
//                        <div className="flex items-center gap-2 text-gray-800 font-medium">
//                            <span>Allocation Year:</span>
//                            <span className=" px-3 py-1 rounded">
//                                {latestAllocationYear || "—"}
//                            </span>
//                        </div>
//                    </div>
//                </div>

//                {error && (
//                    <div className="bg-yellow-50 border border-yellow-300 rounded-md px-6 py-4 text-center my-4">
//                        <p className="text-yellow-700">{error}</p>
//                    </div>
//                )}

//                {!error && mainTableData.length === 0 && (
//                    <div className="bg-blue-50 border border-blue-300 rounded-md px-6 py-4 text-center my-4">
//                        <p className="text-blue-700">No data available for this institute.</p>
//                    </div>
//                )}

//                {mainTableData.length > 0 && (
//                    <>
//                        <div className="flex justify-end mb-2">
//                            <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 mt-3 rounded border border-gray-300">
//                                Amounts in Rs.
//                            </span>
//                        </div>
//                        <FilteredTableComponent
//                            data={mainTableData}
//                            columns={mainTableColumns}
//                            filterColumns={['fy', 'asOnDate']}
//                            onRowChange={null}
//                            customButtons={[]}
//                            title=""
//                            exportFileName="PPP_Fund_Status"
//                            tableId="ppp-fund-status-table"
//                            searchable={true}
//                            sortable={true}
//                            showExcelTemplate={false}
//                            exportable={true}
//                            showSearch={true}
//                            showExport={true}
//                            className="mt-4"
//                            renderCell={renderMainTableCell}
//                            maxHeight="500px"
//                            stickyHeader={true}
//                            readOnly={true}
//                        />
//                    </>
//                )}
//            </fieldset>

//            {modalOpen && (
//                <Modal
//                    modalType={modalType}
//                    closeModal={closeModal}
//                    instituteID={instituteID}
//                    userLoginID={userLoginID}
//                    API_BASE_URL={API_BASE_URL}
//                />
//            )}
//        </div>
//    );
//};

//const Modal = ({ modalType, closeModal, instituteID, userLoginID, API_BASE_URL }) => {
//    const renderModalContent = () => {
//        switch (modalType) {
//            case "funds":
//                return <FundsModal instituteID={instituteID} API_BASE_URL={API_BASE_URL} closeModal={closeModal} />;
//            case "interest":
//                return <InterestModal instituteID={instituteID} userLoginID={userLoginID} API_BASE_URL={API_BASE_URL} closeModal={closeModal} />;
//            case "revenue":
//                return <RevenueModal instituteID={instituteID} userLoginID={userLoginID} API_BASE_URL={API_BASE_URL} closeModal={closeModal} />;
//            case "expenditure":
//                return <ExpenditureModal instituteID={instituteID} userLoginID={userLoginID} API_BASE_URL={API_BASE_URL} closeModal={closeModal} />;
//            case "repayment":
//                return <RepaymentModal instituteID={instituteID} userLoginID={userLoginID} API_BASE_URL={API_BASE_URL} closeModal={closeModal} />;
//            default:
//                return null;
//        }
//    };

//    const getModalTitle = () => {
//        const titles = {
//            funds: "Funds Details",
//            interest: "Interest Details",
//            revenue: "Revenue Details",
//            expenditure: "Expenditure Details",
//            repayment: "Repayment Details"
//        };
//        return titles[modalType] || "";
//    };

//    return (
//        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//            <div className="bg-white rounded-lg shadow-xl max-w-8xl w-full max-h-[90vh] overflow-hidden">
//                <div className="text-white px-6 py-4 flex justify-between items-center" style={{ backgroundColor: "#002060" }}>
//                    <h2 className="text-2xl font-bold">{getModalTitle()}</h2>
//                    <button onClick={() => closeModal(false)} className="text-white hover:text-gray-200 text-3xl font-bold">&times;</button>
//                </div>
//                <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
//                    {renderModalContent()}
//                </div>
//            </div>
//        </div>
//    );
//};

//const FundsModal = ({ instituteID, API_BASE_URL, closeModal }) => {
//    const { startLoading, stopLoading } = useLoading();
//    const [fundsData, setFundsData] = useState([]);
//    const [error, setError] = useState(null);

//    useEffect(() => {
//        fetchFundData();
//    }, []);

//    const fetchFundData = async () => {
//        try {
//            startLoading();
//            setError(null);
//            const response = await agent.get(`${API_BASE_URL}/GetFundByInstitute?InstituteID=${instituteID}`);
//            if (response.data.Status === "Success" && response.data.Data && response.data.Data.length > 0) {
//                setFundsData(response.data.Data);
//            } else {
//                setError("No fund data available for this institute.");
//            }
//            stopLoading();
//        } catch (err) {
//            console.error("Error fetching Fund data:", err);
//            setError("Failed to load fund data.");
//            stopLoading();
//        }
//    };

//    const fundsColumns = [
//        { key: 'FinancialYear', header: 'Allocation Year', sortable: true, headerClassName: 'text-center', className: 'text-center', width: '60px' },
//        { key: 'AllocatedFunds', header: 'Allocated Funds', sortable: false, headerClassName: 'text-center', className: 'text-center', width: '60px' },
//    ];

//    const renderFundsCell = (row, column) => {
//        const value = row[column.key];
//        if (column.key === 'AllocatedFunds') {
//            return typeof value === 'number' ? value.toLocaleString('en-IN') : value;
//        }
//        return value;
//    };

//    if (error) return <div className="bg-yellow-50 border border-yellow-300 rounded-md px-4 py-3 text-center"><p className="text-yellow-700">{error}</p></div>;

//    return (
//        <div>
//            <div className="flex justify-end mb-2">
//                <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded border border-gray-300">Amounts in Rs.</span>
//            </div>
//            <FilteredTableComponent
//                data={fundsData}
//                columns={fundsColumns}
//                filterColumns={['FinancialYear']}
//                onRowChange={null}
//                customButtons={[]}
//                title=""
//                exportFileName="PPP_Funds_Details"
//                tableId="ppp-funds-details-table"
//                searchable={true}
//                sortable={true}
//                showExcelTemplate={false}
//                exportable={true}
//                showSearch={true}
//                showExport={true}
//                className=""
//                renderCell={renderFundsCell}
//                maxHeight="400px"
//                stickyHeader={false}
//                readOnly={true}
//            />
//            <div className="bg-gray-100 px-6 py-4 flex justify-end mt-4">
//                <button onClick={() => closeModal(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium">Close</button>
//            </div>
//        </div>
//    );
//};

//const InterestModal = ({ instituteID, userLoginID, API_BASE_URL, closeModal }) => {
//    const { startLoading, stopLoading } = useLoading();
//    const [interestData, setInterestData] = useState([]);
//    const [saving, setSaving] = useState(false);
//    const [error, setError] = useState(null);
//    const [hasActiveRow, setHasActiveRow] = useState(false);

//    useEffect(() => {
//        fetchInterestData();
//    }, []);

//    const fetchInterestData = async () => {
//        try {
//            startLoading();
//            setError(null);
//            const response = await agent.get(`${API_BASE_URL}/GetInterestByInstitute?InstituteID=${instituteID}`);

//            if (response.data.Status === "Success" && response.data.Data && response.data.Data.length > 0) {
//                const formattedData = response.data.Data.map((item, index) => ({
//                    interestID: item.InterestID,
//                    financialPeriodID: item.FinancialPeriodID,
//                    sn: index + 1,
//                    financialYear: item.FinancialYear,
//                    asOnDate: new Date(item.AsOnDate).toLocaleDateString('en-GB'),
//                    asOnDateRaw: item.AsOnDate,
//                    interest: item.Interest || 0,
//                    interestEarnedTillDate: item.InterestEarnedTillDate,
//                    fieldStatus: item.FieldStatus,
//                    isActive: item.FieldStatus === "Active",
//                    hasData: item.Interest > 0
//                }));
//                setInterestData(formattedData);
//                setHasActiveRow(formattedData.some(row => row.isActive && !row.hasData));
//            } else {
//                setError("No interest data available.");
//            }
//            stopLoading();
//        } catch (err) {
//            console.error("Error fetching Interest data:", err);
//            setError("Failed to load interest data.");
//            stopLoading();
//        }
//    };

//    const handleInputChange = (rowIndex, value) => {
//        if (value < 0) return;
//        const newData = [...interestData];
//        newData[rowIndex].interest = value;
//        setInterestData(newData);
//    };

//    const handleSave = async () => {
//        try {
//            setSaving(true);
//            const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll"));
//            const userId = userInfoAll.UserID;
//            const activeRow = interestData.find(row => row.isActive && !row.hasData);

//            if (!activeRow) {
//                Swal.fire({
//                    icon: 'warning',
//                    title: 'No Active Row',
//                    text: 'No active row found to save.',
//                    confirmButtonColor: '#3085d6'
//                });
//                setSaving(false);
//                return;
//            }

//            if (!activeRow.interest || parseFloat(activeRow.interest) <= 0) {
//                Swal.fire({
//                    icon: 'warning',
//                    title: 'Validation Error',
//                    text: 'Please enter a valid interest amount.',
//                    confirmButtonColor: '#3085d6'
//                });
//                setSaving(false);
//                return;
//            }

//            const payload = {
//                interestID: activeRow.interestID,
//                instituteID: instituteID,
//                financialPeriodID: activeRow.financialPeriodID,
//                financialYear: activeRow.financialYear,
//                asOnDate: activeRow.asOnDateRaw,
//                interest: parseFloat(activeRow.interest),
//                interestEarnedTillDate: parseFloat(activeRow.interestEarnedTillDate) || 0,
//                fieldStatus: activeRow.fieldStatus,
//                isActive: true,
//                createdDateTime: new Date().toISOString(),
//                createdBy: "Admin",
//                modifiedDateTime: new Date().toISOString(),
//                modifiedBy: "Admin",
//                userLoginID: userId,
//                ipAddress: ""
//            };

//            const response = await agent.post(`${API_BASE_URL}/SaveInterest`, payload, {
//                headers: { 'Content-Type': 'application/json', 'accept': '*/*' }
//            });

//            if (response.data.Status === "Success") {
//                await Swal.fire({
//                    icon: 'success',
//                    title: 'Success!',
//                    text: 'Interest saved successfully!',
//                    confirmButtonColor: '#3085d6',
//                    timer: 2000,
//                    showConfirmButton: false
//                });
//                closeModal(true); // Refresh main data
//            } else {
//                Swal.fire({
//                    icon: 'error',
//                    title: 'Failed',
//                    text: 'Failed to save interest. Please try again.',
//                    confirmButtonColor: '#d33'
//                });
//            }
//            setSaving(false);
//        } catch (err) {
//            console.error("Error saving Interest:", err);
//            Swal.fire({
//                icon: 'error',
//                title: 'Error',
//                text: 'Failed to save interest. Please try again.',
//                confirmButtonColor: '#d33'
//            });
//            setSaving(false);
//        }
//    };

//    const interestColumns = [
//        { key: 'sn', header: 'S.N.', sortable: true, className: 'text-center' },
//        { key: 'financialYear', header: 'Financial Year', sortable: true, className: 'text-center' },
//        { key: 'asOnDate', header: 'As on Date', sortable: true, className: 'text-center' },
//        { key: 'interest', header: 'Interest', sortable: true, className: 'text-center' },
//        { key: 'interestEarnedTillDate', header: 'Interest Earned Till Date', sortable: true, className: 'text-center' }
//    ];

//    const renderInterestCell = (row, column) => {
//        const value = row[column.key];
//        const rowIndex = interestData.findIndex(item => item.sn === row.sn);

//        if (column.key === 'interest') {
//            if (row.isActive && (!row.hasData || value === 0)) {
//                return (
//                    <input
//                        type="number"
//                        value={value}
//                        min="0"
//                        onChange={(e) => handleInputChange(rowIndex, e.target.value)}
//                        className="w-full px-2 py-1 border rounded"
//                        placeholder="Enter"
//                    />
//                );
//            } else if (!row.isActive) {
//                return <span className="text-gray-500">Deactive</span>;
//            } else {
//                return value.toLocaleString('en-IN');
//            }
//        }

//        if (column.key === 'interestEarnedTillDate') {
//            return typeof value === 'number' ? value.toLocaleString('en-IN') : value;
//        }

//        return value;
//    };

//    if (error) return <div className="bg-yellow-50 border border-yellow-300 rounded-md px-4 py-3 text-center"><p className="text-yellow-700">{error}</p></div>;

//    return (
//        <div>
//            <div className="flex justify-end mb-2">
//                <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded border border-gray-300">Amounts in Rs.</span>
//            </div>
//            <FilteredTableComponent
//                data={interestData}
//                columns={interestColumns}
//                filterColumns={['financialYear', 'asOnDate']}
//                onRowChange={null}
//                customButtons={[]}
//                title=""
//                exportFileName="PPP_Interest_Details"
//                tableId="ppp-interest-details-table"
//                searchable={true}
//                sortable={true}
//                showExcelTemplate={false}
//                exportable={true}
//                showSearch={true}
//                showExport={true}
//                className=""
//                renderCell={renderInterestCell}
//                maxHeight="500px"
//                stickyHeader={true}
//                readOnly={false}
//            />
//            <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 mt-4">
//                {hasActiveRow && (
//                    <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:bg-gray-400">
//                        {saving ? 'Saving...' : 'Save'}
//                    </button>
//                )}
//                <button onClick={() => closeModal(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium">Close</button>
//            </div>
//        </div>
//    );
//};

//// Revenue, Expenditure, and Repayment modals follow the same pattern
//// Copy from the file:2 but replace:
//// 1. Add useLoading hook
//// 2. Replace setLoading/loading with startLoading/stopLoading
//// 3. Replace closeModal() with closeModal(true) after successful save

//const RevenueModal = ({ instituteID, userLoginID, API_BASE_URL, closeModal }) => {
//    const { startLoading, stopLoading } = useLoading();
//    const [revenueData, setRevenueData] = useState([]);
//    const [saving, setSaving] = useState(false);
//    const [error, setError] = useState(null);
//    const [hasActiveRow, setHasActiveRow] = useState(false);

//    useEffect(() => {
//        fetchRevenueData();
//    }, []);

//    const fetchRevenueData = async () => {
//        try {
//            startLoading();
//            setError(null);
//            const response = await agent.get(`${API_BASE_URL}/GetRevenueByInstitute?InstituteID=${instituteID}`);

//            if (response.data.Status === "Success" && response.data.Data && response.data.Data.length > 0) {
//                const formattedData = response.data.Data.map((item, index) => ({
//                    revenueID: item.RevenueID,
//                    financialPeriodID: item.FinancialPeriodID,
//                    sn: index + 1,
//                    financialYear: item.FinancialYear,
//                    asOnDate: new Date(item.AsOnDate).toLocaleDateString('en-GB'),
//                    asOnDateRaw: item.AsOnDate,
//                    revenue: item.RevenueAmount || 0,
//                    revenueEarnedTillDate: item.RevenueEarnedTillDate,
//                    fieldStatus: item.FieldStatus,
//                    isActive: item.FieldStatus === "Active",
//                    hasData: item.RevenueAmount > 0
//                }));
//                setRevenueData(formattedData);
//                setHasActiveRow(formattedData.some(row => row.isActive && !row.hasData));
//            } else {
//                setError("No revenue data available.");
//            }
//            stopLoading();
//        } catch (err) {
//            console.error("Error fetching Revenue data:", err);
//            setError("Failed to load revenue data.");
//            stopLoading();
//        }
//    };

//    const handleInputChange = (rowIndex, value) => {
//        if (value < 0) return;
//        const newData = [...revenueData];
//        newData[rowIndex].revenue = value;
//        setRevenueData(newData);
//    };

//    const handleSave = async () => {
//        try {
//            setSaving(true);
//            const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll"));
//            const userId = userInfoAll.UserID;
//            const activeRow = revenueData.find(row => row.isActive && !row.hasData);

//            if (!activeRow) {
//                Swal.fire({
//                    icon: 'warning',
//                    title: 'No Active Row',
//                    text: 'No active row found to save.',
//                    confirmButtonColor: '#3085d6'
//                });
//                setSaving(false);
//                return;
//            }

//            if (!activeRow.revenue || parseFloat(activeRow.revenue) <= 0) {
//                Swal.fire({
//                    icon: 'warning',
//                    title: 'Validation Error',
//                    text: 'Please enter a valid revenue amount.',
//                    confirmButtonColor: '#3085d6'
//                });
//                setSaving(false);
//                return;
//            }

//            const payload = {
//                revenueID: activeRow.revenueID,
//                instituteID: instituteID,
//                financialPeriodID: activeRow.financialPeriodID,
//                financialYear: activeRow.financialYear,
//                asOnDate: activeRow.asOnDateRaw,
//                revenueAmount: parseFloat(activeRow.revenue),
//                revenueEarnedTillDate: parseFloat(activeRow.revenueEarnedTillDate) || 0,
//                revenueSource: "Student Training Fees",
//                revenueType: "Training Fees",
//                remarks: "",
//                fieldStatus: activeRow.fieldStatus,
//                isActive: true,
//                createdDateTime: new Date().toISOString(),
//                createdBy: "Admin",
//                modifiedDateTime: new Date().toISOString(),
//                modifiedBy: "Admin",
//                userLoginID: userId,
//                ipAddress: ""
//            };

//            const response = await agent.post(`${API_BASE_URL}/SaveRevenue`, payload, {
//                headers: { 'Content-Type': 'application/json', 'accept': '*/*' }
//            });

//            if (response.data.Status === "Success") {
//                await Swal.fire({
//                    icon: 'success',
//                    title: 'Success!',
//                    text: 'Revenue saved successfully!',
//                    confirmButtonColor: '#3085d6',
//                    timer: 2000,
//                    showConfirmButton: false
//                });
//                closeModal(true);
//            } else {
//                Swal.fire({
//                    icon: 'error',
//                    title: 'Failed',
//                    text: 'Failed to save revenue. Please try again.',
//                    confirmButtonColor: '#d33'
//                });
//            }
//            setSaving(false);
//        } catch (err) {
//            console.error("Error saving Revenue:", err);
//            Swal.fire({
//                icon: 'error',
//                title: 'Error',
//                text: 'Failed to save revenue. Please try again.',
//                confirmButtonColor: '#d33'
//            });
//            setSaving(false);
//        }
//    };

//    const revenueColumns = [
//        { key: 'sn', header: 'S.N.', sortable: true, className: 'text-center' },
//        { key: 'financialYear', header: 'Financial Year', sortable: true, className: 'text-center' },
//        { key: 'asOnDate', header: 'As on Date', sortable: true, className: 'text-center' },
//        { key: 'revenue', header: 'Revenue', sortable: true, className: 'text-center' },
//        { key: 'revenueEarnedTillDate', header: 'Revenue Earned Till Date', sortable: true, className: 'text-center' }
//    ];

//    const renderRevenueCell = (row, column) => {
//        const value = row[column.key];
//        const rowIndex = revenueData.findIndex(item => item.sn === row.sn);

//        if (column.key === 'revenue') {
//            if (row.isActive && (!row.hasData || value === 0)) {
//                return (
//                    <input
//                        type="number"
//                        value={value}
//                        min="0"
//                        onChange={(e) => handleInputChange(rowIndex, e.target.value)}
//                        className="w-full px-2 py-1 border rounded"
//                        placeholder="Enter"
//                    />
//                );
//            } else if (!row.isActive) {
//                return <span className="text-gray-500">Deactive</span>;
//            } else {
//                return value.toLocaleString('en-IN');
//            }
//        }

//        if (column.key === 'revenueEarnedTillDate') {
//            return typeof value === 'number' ? value.toLocaleString('en-IN') : value;
//        }

//        return value;
//    };

//    if (error) return <div className="bg-yellow-50 border border-yellow-300 rounded-md px-4 py-3 text-center"><p className="text-yellow-700">{error}</p></div>;

//    return (
//        <div>
//            <div className="flex justify-end mb-2">
//                <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded border border-gray-300">Amounts in Rs.</span>
//            </div>
//            <FilteredTableComponent
//                data={revenueData}
//                columns={revenueColumns}
//                filterColumns={['financialYear', 'asOnDate']}
//                onRowChange={null}
//                customButtons={[]}
//                title=""
//                exportFileName="PPP_Revenue_Details"
//                tableId="ppp-revenue-details-table"
//                searchable={true}
//                sortable={true}
//                showExcelTemplate={false}
//                exportable={true}
//                showSearch={true}
//                showExport={true}
//                className=""
//                renderCell={renderRevenueCell}
//                maxHeight="500px"
//                stickyHeader={true}
//                readOnly={false}
//            />
//            <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 mt-4">
//                {hasActiveRow && (
//                    <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:bg-gray-400">
//                        {saving ? 'Saving...' : 'Save'}
//                    </button>
//                )}
//                <button onClick={() => closeModal(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium">Close</button>
//            </div>
//        </div>
//    );
//};



//const ExpenditureModal = ({ instituteID, userLoginID, API_BASE_URL, closeModal }) => {
//    const { startLoading, stopLoading } = useLoading();
//    const [expenditureData, setExpenditureData] = useState([]);
//    const [saving, setSaving] = useState(false);
//    const [error, setError] = useState(null);
//    const [hasActiveRow, setHasActiveRow] = useState(false);

//    useEffect(() => {
//        fetchExpenditureData();
//    }, []);

//    const fetchExpenditureData = async () => {
//        try {
//            startLoading();
//            setError(null);
//            const response = await agent.get(`${API_BASE_URL}/GetExpenditureByInstitute?InstituteID=${instituteID}`);

//            if (response.data.Status === "Success" && response.data.Data && response.data.Data.length > 0) {
//                const formattedData = response.data.Data.map((item, index) => ({
//                    expenditureID: item.ExpenditureID,
//                    financialPeriodID: item.FinancialPeriodID,
//                    sn: index + 1,
//                    financialYear: item.FinancialYear,
//                    asOnDate: new Date(item.AsOnDate).toLocaleDateString('en-GB'),
//                    asOnDateRaw: item.AsOnDate,
//                    civilWorks: item.CivilWorks || 0,
//                    equipment: item.Equipment || 0,
//                    furniture: item.Furniture || 0,
//                    learningResources: item.LearningResources || 0,
//                    additionalManpower: item.AdditionalManpower || 0,
//                    consumable: item.Consumable || 0,
//                    miscellaneous: item.Miscellaneous || 0,
//                    total: item.Total,
//                    expenditureIncurredTillDate: item.ExpenditureIncurredTillDate,
//                    fieldStatus: item.FieldStatus,
//                    isActive: item.FieldStatus === "Active",
//                    hasData: item.HasData || 0,
//                    originalValues: {
//                        civilWorks: item.CivilWorks || 0,
//                        equipment: item.Equipment || 0,
//                        furniture: item.Furniture || 0,
//                        learningResources: item.LearningResources || 0,
//                        additionalManpower: item.AdditionalManpower || 0,
//                        consumable: item.Consumable || 0,
//                        miscellaneous: item.Miscellaneous || 0
//                    }
//                }));

//                setExpenditureData(formattedData);

//                // Active row is where any editable field is 0 AND row is active
//                setHasActiveRow(
//                    formattedData.some(row => {
//                        if (!row.isActive) return false;
//                        return row.civilWorks === 0 ||
//                            row.equipment === 0 ||
//                            row.furniture === 0 ||
//                            row.learningResources === 0 ||
//                            row.additionalManpower === 0 ||
//                            row.consumable === 0 ||
//                            row.miscellaneous === 0;
//                    })
//                );
//            } else {
//                setError("No expenditure data available.");
//            }
//            stopLoading();
//        } catch (err) {
//            console.error("Error fetching Expenditure data:", err);
//            setError("Failed to load expenditure data.");
//            stopLoading();
//        }
//    };

//    const handleInputChange = (rowIndex, field, value) => {
//        const newData = [...expenditureData];

//        // if empty string, keep empty so user can type
//        newData[rowIndex][field] = value === "" ? "" : Number(value);

//        const row = newData[rowIndex];
//        row.total =
//            (Number(row.civilWorks) || 0) +
//            (Number(row.equipment) || 0) +
//            (Number(row.furniture) || 0) +
//            (Number(row.learningResources) || 0) +
//            (Number(row.additionalManpower) || 0) +
//            (Number(row.consumable) || 0) +
//            (Number(row.miscellaneous) || 0);

//        setExpenditureData(newData);
//    };

//    const handleSave = async () => {
//        try {
//            setSaving(true);
//            const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll"));
//            const userId = userInfoAll.UserID;

//            // Only rows with isActive and hasData == 0 are allowed to save
//            const activeRow = expenditureData.find(row => row.isActive && !row.hasData);

//            if (!activeRow) {
//                Swal.fire({
//                    icon: 'warning',
//                    title: 'No Active Row',
//                    text: 'No active row found to save.',
//                    confirmButtonColor: '#3085d6'
//                });
//                setSaving(false);
//                return;
//            }

//            const editableFields = [
//                'civilWorks',
//                'equipment',
//                'furniture',
//                'learningResources',
//                'additionalManpower',
//                'consumable',
//                'miscellaneous'
//            ];

//            // At least one 0-field must now be > 0
//            const hasNewData = editableFields.some(field => {
//                return activeRow.originalValues[field] === 0 && Number(activeRow[field]) > 0;
//            });

//            if (!hasNewData) {
//                Swal.fire({
//                    icon: 'warning',
//                    title: 'Validation Error',
//                    text: 'Please enter at least one expenditure amount.',
//                    confirmButtonColor: '#3085d6'
//                });
//                setSaving(false);
//                return;
//            }

//            const payload = {
//                expenditureID: activeRow.expenditureID,
//                instituteID: instituteID,
//                financialPeriodID: activeRow.financialPeriodID,
//                financialYear: activeRow.financialYear,
//                asOnDate: activeRow.asOnDateRaw,
//                civilWorks: Number(activeRow.civilWorks) || 0,
//                equipment: Number(activeRow.equipment) || 0,
//                furniture: Number(activeRow.furniture) || 0,
//                learningResources: Number(activeRow.learningResources) || 0,
//                additionalManpower: Number(activeRow.additionalManpower) || 0,
//                consumable: Number(activeRow.consumable) || 0,
//                miscellaneous: Number(activeRow.miscellaneous) || 0,
//                total: parseFloat(activeRow.total) || 0,
//                expenditureIncurredTillDate: parseFloat(activeRow.expenditureIncurredTillDate) || 0,
//                fieldStatus: activeRow.fieldStatus,
//                isActive: true,
//                createdDateTime: new Date().toISOString(),
//                createdBy: "Admin",
//                modifiedDateTime: new Date().toISOString(),
//                modifiedBy: "Admin",
//                userLoginID: userId,
//                ipAddress: ""
//            };

//            const response = await agent.post(`${API_BASE_URL}/SaveExpenditure`, payload, {
//                headers: {
//                    'Content-Type': 'application/json',
//                    'accept': '*/*'
//                }
//            });

//            if (response.data.Status === "Success") {
//                await Swal.fire({
//                    icon: 'success',
//                    title: 'Success!',
//                    text: 'Expenditure saved successfully!',
//                    confirmButtonColor: '#3085d6',
//                    timer: 2000,
//                    showConfirmButton: false
//                });
//                closeModal(true);
//            } else {
//                Swal.fire({
//                    icon: 'error',
//                    title: 'Failed',
//                    text: 'Failed to save expenditure. Please try again.',
//                    confirmButtonColor: '#d33'
//                });
//            }
//            setSaving(false);
//        } catch (err) {
//            console.error("Error saving Expenditure:", err);
//            Swal.fire({
//                icon: 'error',
//                title: 'Error',
//                text: 'Failed to save expenditure. Please try again.',
//                confirmButtonColor: '#d33'
//            });
//            setSaving(false);
//        }
//    };

//    const expenditureColumns = [
//        { key: 'sn', header: 'S.N.', sortable: true, className: 'text-center' },
//        { key: 'financialYear', header: 'Financial Year', sortable: true, className: 'text-center' },
//        { key: 'asOnDate', header: 'As on Date', sortable: true, className: 'text-center' },
//        { key: 'civilWorks', header: 'Civil Works', sortable: true, className: 'text-center' },
//        { key: 'equipment', header: 'Equipment', sortable: true, className: 'text-center' },
//        { key: 'furniture', header: 'Furniture', sortable: true, className: 'text-center' },
//        { key: 'learningResources', header: 'Learning Resources', sortable: true, className: 'text-center' },
//        { key: 'additionalManpower', header: 'Additional Manpower', sortable: true, className: 'text-center' },
//        { key: 'consumable', header: 'Consumable', sortable: true, className: 'text-center' },
//        { key: 'miscellaneous', header: 'Miscellaneous', sortable: true, className: 'text-center' },
//        { key: 'total', header: 'Total', sortable: true, className: 'text-center' },
//        { key: 'expenditureIncurredTillDate', header: 'Expenditure Incurred Till Date', sortable: true, className: 'text-center' }
//    ];

//    const editableFields = [
//        'civilWorks',
//        'equipment',
//        'furniture',
//        'learningResources',
//        'additionalManpower',
//        'consumable',
//        'miscellaneous'
//    ];

//    const renderExpenditureCell = (row, column) => {
//        const value = row[column.key];
//        const rowIndex = expenditureData.findIndex(item => item.sn === row.sn);

//        if (editableFields.includes(column.key)) {
//            // API value > 0: show as plain text (no edit)
//            if (row.originalValues[column.key] > 0) {
//                return (
//                    <span className="text-sm">
//                        {Number(value).toLocaleString('en-IN')}
//                    </span>
//                );
//            }

//            // API value <= 0: allow edit ONLY if row is active
//            if (row.isActive) {
//                return (
//                    <input
//                        type="number"
//                        value={value === 0 ? 0 : value}
//                        onChange={(e) => handleInputChange(rowIndex, column.key, e.target.value)}
//                        className="w-20 px-2 py-1 border rounded text-sm"
//                    />
//                );
//            }

//            // Inactive row with 0 value
//            return <span className="text-gray-500 text-sm">Deactive</span>;
//        }

//        if (['total', 'expenditureIncurredTillDate'].includes(column.key)) {
//            return typeof value === 'number' ? value.toLocaleString('en-IN') : value;
//        }

//        return value;
//    };

//    if (error)
//        return (
//            <div className="bg-yellow-50 border border-yellow-300 rounded-md px-4 py-3 text-center">
//                <p className="text-yellow-700">{error}</p>
//            </div>
//        );

//    return (
//        <div>
//            <div className="flex justify-end mb-2">
//                <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded border border-gray-300">
//                    Amounts in Rs.
//                </span>
//            </div>

//            <FilteredTableComponent
//                data={expenditureData}
//                columns={expenditureColumns}
//                filterColumns={['financialYear', 'asOnDate']}
//                onRowChange={null}
//                customButtons={[]}
//                title=""
//                exportFileName="PPP_Expenditure_Details"
//                tableId="ppp-expenditure-details-table"
//                searchable={true}
//                sortable={true}
//                showExcelTemplate={false}
//                exportable={true}
//                showSearch={true}
//                showExport={true}
//                className=""
//                renderCell={renderExpenditureCell}
//                maxHeight="500px"
//                stickyHeader={true}
//                readOnly={false}
//            />

//            <div className="bg-blue-50 border border-blue-300 rounded-md px-4 py-3 mt-4">
//                <h4 className="font-semibold text-blue-800 mb-2">Note:</h4>
//                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
//                    <li><strong>Equipment</strong> includes Machines, Equipment, Tools, etc. procured for Training purpose</li>
//                    <li><strong>Furniture</strong> includes all type of Furniture</li>
//                    <li><strong>Learning Resources</strong> includes Books, Subscriptions, Software, etc.</li>
//                    <li><strong>Additional Manpower</strong> includes both Teaching and Non-Teaching staff paid through PPP funds</li>
//                    <li><strong>Consumable</strong> includes Raw Material, Machine Repair and Maintenance, Electricity, Training Materials, etc.</li>
//                    <li><strong>Miscellaneous</strong> includes expenditure made directly or indirectly related to Training</li>
//                </ul>
//            </div>

//            <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 mt-4">
//                {hasActiveRow && (
//                    <button
//                        onClick={handleSave}
//                        disabled={saving}
//                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:bg-gray-400"
//                    >
//                        {saving ? 'Saving...' : 'Save'}
//                    </button>
//                )}
//                <button
//                    onClick={() => closeModal(false)}
//                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium"
//                >
//                    Close
//                </button>
//            </div>
//        </div>
//    );
//};


//const RepaymentModal = ({ instituteID, userLoginID, API_BASE_URL, closeModal }) => {
//    const { startLoading, stopLoading } = useLoading();
//    const [repaymentData, setRepaymentData] = useState([]);
//    const [saving, setSaving] = useState(false);
//    const [error, setError] = useState(null);
//    const [hasActiveRow, setHasActiveRow] = useState(false);

//    useEffect(() => {
//        fetchRepaymentData();
//    }, []);

//    const fetchRepaymentData = async () => {
//        try {
//            startLoading();
//            setError(null);
//            const response = await agent.get(`${API_BASE_URL}/GetRepaymentByInstitute?InstituteID=${instituteID}`);

//            if (response.data.Status === "Success" && response.data.Data && response.data.Data.length > 0) {
//                const formattedData = response.data.Data.map((item, index) => ({
//                    repaymentID: item.RepaymentID,
//                    financialPeriodID: item.FinancialPeriodID || 0,
//                    sn: index + 1,
//                    FinancialYearDisplay: item.FinancialYearDisplay,
//                    repaymentAmountAsPerSchedule: item.RepaymentAmountAsPerSchedule,
//                    actualRepaymentAmount: item.ActualRepaymentAmount || 0,
//                    dateOfRepayment: item.DateOfRepayment ? new Date(item.DateOfRepayment).toISOString().split('T')[0] : "",
//                    dateDisplay: item.DateOfRepayment ? new Date(item.DateOfRepayment).toLocaleDateString('en-GB') : "",
//                    totalRepaymentDone: item.TotalRepaymentDone,
//                    fieldStatus: item.FieldStatus,
//                    financialYear: item.FinancialYear,
//                    isActive: item.FieldStatus === "Active",
//                    hasData: item.ActualRepaymentAmount > 0
//                }));
//                setRepaymentData(formattedData);
//                setHasActiveRow(formattedData.some(row => row.isActive && !row.hasData));
//            } else {
//                setError("No repayment data available.");
//            }
//            stopLoading();
//        } catch (err) {
//            console.error("Error fetching Repayment data:", err);
//            setError("Failed to load repayment data.");
//            stopLoading();
//        }
//    };

//    const handleInputChange = (rowIndex, field, value) => {
//        if (field === 'actualRepaymentAmount' && value < 0) return;
//        const newData = [...repaymentData];
//        newData[rowIndex][field] = value;
//        setRepaymentData(newData);
//    };

//    const handleSave = async () => {
//        try {
//            setSaving(true);
//            const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll"));
//            const userId = userInfoAll.UserID;
//            const activeRow = repaymentData.find(row => row.isActive && !row.hasData);

//            if (!activeRow) {
//                Swal.fire({
//                    icon: 'warning',
//                    title: 'No Active Row',
//                    text: 'No active row found to save.',
//                    confirmButtonColor: '#3085d6'
//                });
//                setSaving(false);
//                return;
//            }

//            if (!activeRow.actualRepaymentAmount || parseFloat(activeRow.actualRepaymentAmount) <= 0) {
//                Swal.fire({
//                    icon: 'warning',
//                    title: 'Validation Error',
//                    text: 'Please enter a valid repayment amount.',
//                    confirmButtonColor: '#3085d6'
//                });
//                setSaving(false);
//                return;
//            }

//            if (!activeRow.dateOfRepayment) {
//                Swal.fire({
//                    icon: 'warning',
//                    title: 'Validation Error',
//                    text: 'Please select a repayment date.',
//                    confirmButtonColor: '#3085d6'
//                });
//                setSaving(false);
//                return;
//            }

//            const payload = {
//                repaymentID: activeRow.repaymentID || 0,
//                instituteID: instituteID,
//                financialPeriodID: activeRow.financialPeriodID,
//                financialYear: activeRow.financialYear,
//                financialYearDisplay: activeRow.FinancialYearDisplay,
//                repaymentAmountAsPerSchedule: parseFloat(activeRow.repaymentAmountAsPerSchedule) || 0,
//                actualRepaymentAmount: parseFloat(activeRow.actualRepaymentAmount) || 0,
//                dateOfRepayment: activeRow.dateOfRepayment ? new Date(activeRow.dateOfRepayment).toISOString() : new Date().toISOString(),
//                totalRepaymentDone: parseFloat(activeRow.totalRepaymentDone),
//                paymentMode: "Online Transfer",
//                transactionReference: "",
//                remarks: "",
//                fieldStatus: activeRow.fieldStatus,
//                isActive: true,
//                createdDateTime: new Date().toISOString(),
//                createdBy: "Admin",
//                modifiedDateTime: new Date().toISOString(),
//                modifiedBy: "Admin",
//                userLoginID: userId,
//                ipAddress: "127.0.0.1"
//            };

//            const response = await agent.post(`${API_BASE_URL}/SaveRepayment`, payload, {
//                headers: { 'Content-Type': 'application/json', 'accept': '*/*' }
//            });

//            if (response.data.Status === "Success") {
//                await Swal.fire({
//                    icon: 'success',
//                    title: 'Success!',
//                    text: 'Repayment saved successfully!',
//                    confirmButtonColor: '#3085d6',
//                    timer: 2000,
//                    showConfirmButton: false
//                });
//                closeModal(true);
//            } else {
//                Swal.fire({
//                    icon: 'error',
//                    title: 'Failed',
//                    text: 'Failed to save repayment. Please try again.',
//                    confirmButtonColor: '#d33'
//                });
//            }
//            setSaving(false);
//        } catch (err) {
//            console.error("Error saving Repayment:", err);
//            Swal.fire({
//                icon: 'error',
//                title: 'Error',
//                text: 'Failed to save repayment. Please try again.',
//                confirmButtonColor: '#d33'
//            });
//            setSaving(false);
//        }
//    };

//    const repaymentColumns = [
//        { key: 'sn', header: 'S.N.', sortable: true, className: 'text-center' },
//        { key: 'FinancialYearDisplay', header: 'Repayment Schedule', sortable: true, className: 'text-center' },
//        { key: 'repaymentAmountAsPerSchedule', header: 'Amount as per Schedule', sortable: true, className: 'text-center' },
//        { key: 'actualRepaymentAmount', header: 'Actual Repayment Amount', sortable: true, className: 'text-center' },
//        { key: 'dateOfRepayment', header: 'Date of Repayment', sortable: true, className: 'text-center' },
//        { key: 'totalRepaymentDone', header: 'Total Repayment Done', sortable: true, className: 'text-center' }
//    ];

//    const renderRepaymentCell = (row, column) => {
//        const value = row[column.key];
//        const rowIndex = repaymentData.findIndex(item => item.sn === row.sn);

//        const formatNumber = (val) => {
//            return typeof val === 'number' ? val.toLocaleString('en-IN') : val;
//        };

//        if (column.key === 'repaymentAmountAsPerSchedule') {
//            return formatNumber(value);
//        }

//        if (column.key === 'actualRepaymentAmount') {
//            if (!row.isActive) {
//                if (value && value !== 0) {
//                    return formatNumber(value);
//                } else {
//                    return <span className="text-gray-500">Deactive</span>;
//                }
//            }

//            if (!row.hasData || value === 0) {
//                return (
//                    <input
//                        type="number"
//                        value={value}
//                        min="0"
//                        onChange={(e) => handleInputChange(rowIndex, 'actualRepaymentAmount', e.target.value)}
//                        className="w-full px-2 py-1 border rounded"
//                        placeholder="Enter"
//                    />
//                );
//            }

//            return formatNumber(value);
//        }

//        if (column.key === 'dateOfRepayment') {
//            if (!row.isActive) {
//                if (value) {
//                    return value;
//                } else {
//                    return <span className="text-gray-500">Deactive</span>;
//                }
//            }

//            if (!row.hasData || !value) {
//                return (
//                    <input
//                        type="date"
//                        value={value}
//                        onChange={(e) => handleInputChange(rowIndex, 'dateOfRepayment', e.target.value)}
//                        className="w-full px-2 py-1 border rounded"
//                    />
//                );
//            }

//            return value;
//        }

//        if (column.key === 'totalRepaymentDone') {
//            return formatNumber(value);
//        }

//        return value;
//    };

//    if (error) return <div className="bg-yellow-50 border border-yellow-300 rounded-md px-4 py-3 text-center"><p className="text-yellow-700">{error}</p></div>;

//    return (
//        <div>
//            <div className="flex justify-end mb-2">
//                <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded border border-gray-300">Amounts in Rs.</span>
//            </div>
//            <FilteredTableComponent
//                data={repaymentData}
//                columns={repaymentColumns}
//                filterColumns={['FinancialYearDisplay']}
//                onRowChange={null}
//                customButtons={[]}
//                title=""
//                exportFileName="PPP_Repayment_Details"
//                tableId="ppp-repayment-details-table"
//                searchable={true}
//                sortable={true}
//                showExcelTemplate={false}
//                exportable={true}
//                showSearch={true}
//                showExport={true}
//                className=""
//                renderCell={renderRepaymentCell}
//                maxHeight="500px"
//                stickyHeader={true}
//                readOnly={false}
//            />
//            <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 mt-4">
//                {hasActiveRow && (
//                    <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:bg-gray-400">
//                        {saving ? 'Saving...' : 'Save'}
//                    </button>
//                )}
//                <button onClick={() => closeModal(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium">Close</button>
//            </div>
//        </div>
//    );
//};

//export default PPPFunds;
