import { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import agent from '../../lib/api/agent';
import { ThemeContext } from "../Context/ThemeContext";
import { Search, Check, Download, ArrowLeft } from "lucide-react";
import DropdownComponent from "../formcomponent/DropdownComponent";
import { ITISpecification } from "../../Endpoints_All/ITISpecification/itiSpecification";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent"; // Add this import

const TradeSearch = ({ onBack }) => {
    const [sectors, setSectors] = useState([]);
    const [trades, setTrades] = useState([]);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);

    // Filtered options for cascading dropdowns
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

    const [tradeList, setTradeList] = useState([]);
    const [itemsList, setItemsList] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showItemsTable, setShowItemsTable] = useState(false);
    const [showItemDetailsPage, setShowItemDetailsPage] = useState(false);
    const [selectedTradeName, setSelectedTradeName] = useState("");
    const [selectedTradeSpecDoc, setSelectedTradeSpecDoc] = useState("");
    const { color } = useContext(ThemeContext);

    // Search mode state
    const [searchMode, setSearchMode] = useState("tradewise");

    // Trade wise selected values
    const [selectedTrade, setSelectedTrade] = useState("");

    // Sector wise selected values
    const [selectedSector, setSelectedSector] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedItemName, setSelectedItemName] = useState("");

    // Loading states
    const [loadingTrades, setLoadingTrades] = useState(false);
    const [loadingSectors, setLoadingSectors] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [loadingResults, setLoadingResults] = useState(false);

    // Search states
    const [searchTerm, setSearchTerm] = useState("");

    const API_BASE_URL = ITISpecification;

    // Load master data on component mount
    useEffect(() => {
        loadMasterData();
    }, []);

    const loadMasterData = async () => {
        try {
            const [tradesRes, sectorsRes, categoriesRes, itemsRes] = await Promise.all([
                agent.get(`${API_BASE_URL}/GetMasterTrade`),
                agent.get(`${API_BASE_URL}/GetMasterSector`),
                agent.get(`${API_BASE_URL}/GetMasterCategory`),
                agent.get(`${API_BASE_URL}/GetMasterItem`)
            ]);

            if (tradesRes.data.Status === "Success") {
                const tradeOptions = tradesRes.data.Data
                    .filter(item => item.Value !== "-1")
                    .map(item => ({ value: item.Value, label: item.Text }));
                setTrades(tradeOptions);
            }

            if (sectorsRes.data.Status === "Success") {
                const sectorOptions = sectorsRes.data.Data
                    .filter(item => item.Value !== "-1")
                    .map(item => ({ value: item.Value, label: item.Text }));
                setSectors(sectorOptions);
            }

            if (categoriesRes.data.Status === "Success") {
                const categoryOptions = categoriesRes.data.Data
                    .filter(item => item.Value !== "-1")
                    .map(item => ({ value: item.Value, label: item.Text }));
                setCategories(categoryOptions);
            }

            if (itemsRes.data.Status === "Success") {
                const itemOptions = itemsRes.data.Data
                    .filter(item => item.Value !== "-1")
                    .map(item => ({ value: item.Value, label: item.Text }));
                setItems(itemOptions);
            }
        } catch (error) {
            console.error("Error loading master data:", error);
        }
    };

    // Handle Sector selection change - using NEW GetSectorWiseItems endpoint
    const handleSectorChange = async (sectorId) => {
        setSelectedSector(sectorId);
        setSelectedCategory("");
        setSelectedItemName("");
        setFilteredCategories([]);
        setFilteredItems([]);

        if (!sectorId) {
            return;
        }

        try {
            setLoadingCategories(true);
            const response = await agent.get(
                `${API_BASE_URL}/GetSectorWiseItems?sectorId=${sectorId}&categoryId=-1&itemId=-1`
            );

            if (response.data.Status === "Success" && response.data.Data) {
                const uniqueCategories = response.data.Data.reduce((acc, item) => {
                    if (!acc.find(category => category.value === item.CategoryId.toString())) {
                        acc.push({
                            value: item.CategoryId.toString(),
                            label: item.CategoryName
                        });
                    }
                    return acc;
                }, []);
                setFilteredCategories(uniqueCategories);
            } else {
                setFilteredCategories([]);
            }
        } catch (error) {
            console.error("Error fetching categories for sector:", error);
            setFilteredCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Handle Category selection change - using NEW GetSectorWiseItems endpoint
    const handleCategoryChange = async (categoryId) => {
        setSelectedCategory(categoryId);
        setSelectedItemName("");
        setFilteredItems([]);

        if (!categoryId || !selectedSector) {
            return;
        }

        try {
            setLoadingItems(true);
            const response = await agent.get(
                `${API_BASE_URL}/GetSectorWiseItems?sectorId=${selectedSector}&categoryId=${categoryId}&itemId=-1`
            );

            if (response.data.Status === "Success" && response.data.Data) {
                const uniqueItems = response.data.Data.reduce((acc, item) => {
                    if (!acc.find(itm => itm.value === item.ItemId.toString())) {
                        acc.push({
                            value: item.ItemId.toString(),
                            label: item.NameofITem
                        });
                    }
                    return acc;
                }, []);
                setFilteredItems(uniqueItems);
            } else {
                setFilteredItems([]);
            }
        } catch (error) {
            console.error("Error fetching items for category:", error);
            setFilteredItems([]);
        } finally {
            setLoadingItems(false);
        }
    };

    const handleTradeWiseSearch = async () => {
        if (!selectedTrade) {
            alert("Please select a trade");
            return;
        }

        setLoadingResults(true);
        try {
            const response = await agent.get(`${API_BASE_URL}/GetTradeWiseItems?tradeId=${selectedTrade}`);

            if (response.data.Status === "Success") {
                const data = response.data.Data;
                if (data && data.length > 0) {
                    setItemsList(data);
                    setSelectedTradeName(data[0].TradeName);
                    setSelectedTradeSpecDoc(data[0].SpecificationDocument);
                    setShowItemsTable(true);
                } else {
                    setItemsList([]);
                    alert("No items found for the selected trade");
                }
            } else {
                alert("Error fetching trade items: " + response.data.Message);
            }
        } catch (error) {
            console.error("Error in trade wise search:", error);
            alert("Error fetching trade items");
        } finally {
            setLoadingResults(false);
        }
    };

    const handleSectorWiseSearch = async () => {
        if (!selectedSector) {
            alert("Please select at least a Sector");
            return;
        }

        setLoadingResults(true);

        try {
            const categoryId = selectedCategory || -1;
            const itemId = selectedItemName || -1;

            const response = await agent.get(
                `${API_BASE_URL}/GetSectorWiseItems?sectorId=${selectedSector}&categoryId=${categoryId}&itemId=${itemId}`
            );

            if (response.data.Status === "Success") {
                const data = response.data.Data;
                if (data && data.length > 0) {
                    setTradeList(data);
                    setShowItemsTable(true);
                } else {
                    setTradeList([]);
                    alert("No items found for the selected criteria");
                }
            } else {
                alert("Error fetching sector wise items: " + response.data.Message);
            }
        } catch (error) {
            console.error("Error in sector wise search:", error);
            alert("Error fetching sector wise items");
        } finally {
            setLoadingResults(false);
        }
    };

    const handleReset = () => {
        setSelectedTrade("");
        setSelectedSector("");
        setSelectedCategory("");
        setSelectedItemName("");
        setTradeList([]);
        setItemsList([]);
        setShowItemsTable(false);
        setShowItemDetailsPage(false);
        setSelectedItem(null);
        setSelectedTradeName("");
        setSelectedTradeSpecDoc("");
        setSearchTerm("");
        setFilteredCategories([]);
        setFilteredItems([]);
    };

    // Custom CSV download function for sector-wise data
    const downloadSectorCSV = () => {
        let csvContent = "Item Code,Name of Item,Sector,Category\n";
        const data = tradeList;

        data.forEach(item => {
            csvContent += `"${item.ItemCode || ''}","${item.NameofITem || ''}","${item.SectorName || ''}","${item.CategoryName || ''}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tradeList[0]?.SectorName?.replace(/\s+/g, '_') || 'Sector'}_Items.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Custom PDF download function for sector-wise data
    const downloadSectorPDF = () => {
        const specificationDocument = tradeList[0]?.SpecificationDocument;
        const filename = `${tradeList[0]?.SectorName?.replace(/\s+/g, '_') || 'Sector'}_Specification.pdf`;

        if (specificationDocument) {
            const link = document.createElement("a");
            link.href = specificationDocument;
            link.download = filename;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("Specification document not available");
        }
    };

    const downloadCSV = () => {
        let csvContent = "";
        let filename = "";
        let data = [];

        if (searchMode === "tradewise") {
            data = filterTradeWiseItems(itemsList);
            filename = `${selectedTradeName.replace(/\s+/g, '_')}_Items.csv`;
            csvContent = "Usage,DGT S.N.,DGT Name of Item,DGT Specification,DGT Qty,DVET S.N.,DVET Name of Item,DVET Revised Qty\n";
            data.forEach(item => {
                csvContent += `"${item.Usage || ''}","${item.SNAsperDGT || ''}","${item.ItemAsperDGT || ''}","${item.SpecificationDGT || ''}","${item.QTYAsPerDGT || ''}","${item.SNAsperDVET || ''}","${item.ItemAsperDVET || ''}","${item.RevisedQtyAsperDVET || ''}"\n`;
            });
        } else {
            data = filterSectorWiseItems(tradeList);
            filename = `${tradeList[0]?.SectorName?.replace(/\s+/g, '_') || 'Sector'}_Items.csv`;
            csvContent = "Item Code,Name of Item,Sector,Category\n";
            data.forEach(item => {
                csvContent += `"${item.ItemCode || ''}","${item.NameofITem || ''}","${item.SectorName || ''}","${item.CategoryName || ''}"\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadPDF = () => {
        let specificationDocument = "";
        let title = "";

        if (searchMode === "tradewise") {
            specificationDocument = selectedTradeSpecDoc;
            title = `${selectedTradeName} - Specification`;
        } else {
            specificationDocument = tradeList[0]?.SpecificationDocument;
            title = `${tradeList[0]?.SectorName || 'Sector'} - Specification`;
        }

        if (specificationDocument) {
            // Open PDF in popup window
            const popupWidth = 900;
            const popupHeight = 700;
            const left = (window.screen.width - popupWidth) / 2;
            const top = (window.screen.height - popupHeight) / 2;

            const popup = window.open(
                '',
                'PDF Viewer',
                `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`
            );

            if (popup) {
                popup.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body, html { 
                            margin: 0; 
                            padding: 0; 
                            height: 100%; 
                            overflow: hidden; 
                        }
                        iframe { 
                            width: 100%; 
                            height: 100%; 
                            border: none; 
                        }
                    </style>
                </head>
                <body>
                    <iframe src="${specificationDocument}" type="application/pdf"></iframe>
                </body>
                </html>
            `);
                popup.document.close();
                popup.focus();
            } else {
                alert("Please allow pop-ups for this website to view the PDF");
            }
        } else {
            alert("Specification document not available");
        }
    };

    // Filter functions for search
    const filterTradeWiseItems = (items) => {
        if (!searchTerm) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(item => {
            const usage = item.Usage?.toString()?.toLowerCase() || '';
            const snDgt = item.SNAsperDGT?.toString()?.toLowerCase() || '';
            const itemDgt = item.ItemAsperDGT?.toString()?.toLowerCase() || '';
            const specDgt = item.SpecificationDGT?.toString()?.toLowerCase() || '';
            const qtyDgt = item.QTYAsPerDGT?.toString()?.toLowerCase() || '';
            const snDvet = item.SNAsperDVET?.toString()?.toLowerCase() || '';
            const itemDvet = item.ItemAsperDVET?.toString()?.toLowerCase() || '';
            const qtyDvet = item.RevisedQtyAsperDVET?.toString()?.toLowerCase() || '';

            return usage.includes(term) ||
                snDgt.includes(term) ||
                itemDgt.includes(term) ||
                specDgt.includes(term) ||
                qtyDgt.includes(term) ||
                snDvet.includes(term) ||
                itemDvet.includes(term) ||
                qtyDvet.includes(term);
        });
    };

    const filterSectorWiseItems = (items) => {
        if (!searchTerm) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(item => {
            const itemId = item.ItemCode?.toString()?.toLowerCase() || '';
            const name = item.NameofITem?.toString()?.toLowerCase() || '';
            const sector = item.SectorName?.toString()?.toLowerCase() || '';
            const category = item.CategoryName?.toString()?.toLowerCase() || '';

            return itemId.includes(term) ||
                name.includes(term) ||
                sector.includes(term) ||
                category.includes(term);
        });
    };

    // Define sector-wise table columns
    const sectorColumns = [
        {
            key: 'ItemCode',
            header: 'Item Code',
            width: '80px',
            sortable: true,
            className: 'text-center'
        },
        {
            key: 'NameofITem',
            header: 'Name of Item',
            width: '500px',
            sortable: true
        },
        {
            key: 'IsDocShow',
            header: 'Spec.',
            width: '60px',
            sortable: false,
            className: 'text-center',
            type: 'custom'
        },
        {
            key: 'SectorName',
            header: 'Sector',
            width: '120px',
            sortable: true,
            className: 'text-center'
        },
        {
            key: 'CategoryName',
            header: 'Category',
            width: '80px',
            sortable: true,
            className: 'text-center'
        },

    ];

    // Define which columns should have filters
    const sectorFilterColumns = ['SectorName', 'NameofITem', 'CategoryName'];
    const renderSectorCell = (item, column) => {
        if (column.key === "IsDocShow") {
            return item.IsDocShow === 1 ? (
                <Check className="w-5 h-5 text-green-600 mx-auto" strokeWidth={3} />
            ) : null;
        }
        return undefined;
    };

    const RadioButton = ({ checked, onChange, label }) => (
        <div className="flex items-center gap-2 cursor-pointer" onClick={onChange}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checked ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                {checked && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <span className="text-sm font-medium">{label}</span>
        </div>
    );

    if (showItemDetailsPage && selectedItem) {
        return (
            <ItemDetails
                item={selectedItem}
                tradeName={selectedTradeName}
                onBack={() => setShowItemDetailsPage(false)}
                color={color}
            />
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* Back Button */}
            <div className="mb-4">
                <Button
                    variant="outlined"
                    startIcon={<ArrowLeft />}
                    onClick={onBack}
                    className="mb-4"
                >
                    Back to Main
                </Button>
            </div>

            {/* Specification Section */}
            <fieldset className="rounded border border-gray-300 p-4">
                <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Specification
                    </div>
                </legend>

                {/* Radio Buttons */}
                <div className="flex gap-8 mb-6">
                    <RadioButton
                        checked={searchMode === "tradewise"}
                        onChange={() => setSearchMode("tradewise")}
                        label="Trade Wise"
                    />
                    <RadioButton
                        checked={searchMode === "sectorwise"}
                        onChange={() => setSearchMode("sectorwise")}
                        label="Sector wise"
                    />
                </div>

                {/* Trade Wise Section */}
                {searchMode === "tradewise" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="max-w-md">
                                <DropdownComponent
                                    label="Trade"
                                    options={trades}
                                    value={selectedTrade}
                                    onChange={setSelectedTrade}
                                    loading={loadingTrades}
                                    required={false}
                                />
                            </div>
                            <div className="flex justify-center gap-4">
                                <button
                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                                    onClick={handleTradeWiseSearch}
                                    disabled={loadingResults}
                                >
                                    {loadingResults ? "Searching..." : "Search"}
                                </button>

                                <button
                                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                                    onClick={handleReset}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Trade Results */}
                        {selectedTradeName && showItemsTable && (
                            <div className="bg-gray-50 p-4 rounded border">
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Trade Name:</span>
                                        <span>{selectedTradeName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Trade Specification Document:</span>
                                        <button
                                            onClick={downloadPDF}
                                            className="flex items-center gap-1 text-blue-600 hover:underline"
                                        >
                                            <Download className="w-4 h-4" />
                                            {selectedTradeName.replace(/\s+/g, '_')}_Specification.pdf
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Sector Wise Section */}
                {searchMode === "sectorwise" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <DropdownComponent
                                    label="Sector"
                                    options={sectors}
                                    value={selectedSector}
                                    onChange={handleSectorChange}
                                    loading={loadingSectors}
                                    required={false}
                                />
                            </div>
                            <div>
                                <DropdownComponent
                                    label="Category"
                                    options={filteredCategories}
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    loading={loadingCategories}
                                    required={false}
                                    disabled={!selectedSector}
                                />
                            </div>
                            <div>
                                <DropdownComponent
                                    label="Name of Item"
                                    options={filteredItems}
                                    value={selectedItemName}
                                    onChange={setSelectedItemName}
                                    loading={loadingItems}
                                    required={false}
                                    disabled={!selectedCategory}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                                onClick={handleSectorWiseSearch}
                                disabled={loadingResults}
                            >
                                {loadingResults ? "Searching..." : "Search"}
                            </button>

                            <button
                                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                                onClick={handleReset}
                            >
                                Reset
                            </button>
                        </div>

                        {/* Sector wise document download */}
                        {showItemsTable && searchMode === "sectorwise" && tradeList.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded border">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Sector Specification Document:</span>
                                    <button
                                        onClick={downloadPDF}
                                        className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                    >
                                        <Download className="w-4 h-4" />
                                        {tradeList[0]?.SectorName?.replace(/\s+/g, '_')}_Specification.pdf
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </fieldset>

            {/* Trade Wise Items Table */}
            {showItemsTable && searchMode === "tradewise" && itemsList.length > 0 && (
                <fieldset className="rounded border border-gray-300 p-4">
                    <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
                        Trade Items - {selectedTradeName}
                    </legend>

                    <div className="mb-4 flex gap-2 justify-between items-center">
                        <div className="flex gap-2">
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={downloadCSV}
                            >
                                Download CSV
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search in table..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full border-collapse border border-gray-300 text-sm">
                            <thead className="sticky top-0 bg-white">
                                <tr>
                                    <th rowSpan="2" className="border border-gray-300 px-2 py-2 bg-gray-100">Usage</th>
                                    <th colSpan="4" className="border border-gray-300 px-2 py-2 bg-blue-100 text-center">As per DGT</th>
                                    <th colSpan="3" className="border border-gray-300 px-2 py-2 bg-green-100 text-center">As per DVET</th>
                                </tr>
                                <tr>
                                    <th className="border border-gray-300 px-2 py-2 bg-blue-50">S.N.</th>
                                    <th className="border border-gray-300 px-2 py-2 bg-blue-50">Name of Item</th>
                                    <th className="border border-gray-300 px-2 py-2 bg-blue-50">Specification</th>
                                    <th className="border border-gray-300 px-2 py-2 bg-blue-50">Qty</th>
                                    <th className="border border-gray-300 px-2 py-2 bg-green-50">S.N.</th>
                                    <th className="border border-gray-300 px-2 py-2 bg-green-50">Name of Item</th>
                                    <th className="border border-gray-300 px-2 py-2 bg-green-50">Revised Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterTradeWiseItems(itemsList).map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-2 py-2">{item.Usage}</td>
                                        <td className="border border-gray-300 px-2 py-2">{item.SNAsperDGT}</td>
                                        <td className="border border-gray-300 px-2 py-2">{item.ItemAsperDGT}</td>
                                        <td className="border border-gray-300 px-2 py-2">{item.SpecificationDGT}</td>
                                        <td className="border border-gray-300 px-2 py-2">{item.QTYAsPerDGT}</td>
                                        <td className="border border-gray-300 px-2 py-2">{item.SNAsperDVET}</td>
                                        <td className="border border-gray-300 px-2 py-2">{item.ItemAsperDVET}</td>
                                        <td className="border border-gray-300 px-2 py-2">{item.RevisedQtyAsperDVET}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </fieldset>
            )}

            {/* Sector Wise Items Table - Using FilteredTableComponent */}
            {showItemsTable && searchMode === "sectorwise" && tradeList.length > 0 && (
                <fieldset className="rounded border border-gray-300 p-4">
                    <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
                        Sector Items
                    </legend>

                    <FilteredTableComponent
                        data={tradeList}
                        columns={sectorColumns}
                        filterColumns={sectorFilterColumns}
                        renderCell={renderSectorCell}
                        searchable={true}
                        sortable={true}
                        exportable={true}
                        showSearch={true}
                        showExport={true}
                        showExcelTemplate={false}
                        exportFileName={`${tradeList[0]?.SectorName?.replace(/\s+/g, '_') || 'Sector'}_Items`}
                        title="Sector Wise Items"
                        maxHeight="500px"
                        stickyHeader={true}
                        tableId="sector-items-table"
                        className=""
                        downloadCSV={downloadSectorCSV}
                        downloadPDF={downloadSectorPDF}
                    />
                </fieldset>
            )}
        </div>
    );
};

const ItemDetails = ({ item, tradeName, onBack, color }) => {
    return (
        <div className="space-y-6 p-4">
            <div className="mb-4">
                <Button
                    variant="outlined"
                    startIcon={<ArrowLeft />}
                    onClick={onBack}
                    className="mb-4"
                >
                    Back to List
                </Button>
            </div>

            <fieldset className="rounded border border-gray-300 p-4">
                <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
                    Item Details - {tradeName}
                </legend>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex">
                            <span className="font-semibold w-1/3">Usage:</span>
                            <span>{item.Usage}</span>
                        </div>
                        <div className="flex">
                            <span className="font-semibold w-1/3">DGT S.N.:</span>
                            <span>{item.SNAsperDGT}</span>
                        </div>
                        <div className="flex">
                            <span className="font-semibold w-1/3">DGT Item:</span>
                            <span>{item.ItemAsperDGT}</span>
                        </div>
                        <div className="flex">
                            <span className="font-semibold w-1/3">DGT Spec:</span>
                            <span>{item.SpecificationDGT}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex">
                            <span className="font-semibold w-1/3">DGT Qty:</span>
                            <span>{item.QTYAsPerDGT}</span>
                        </div>
                        <div className="flex">
                            <span className="font-semibold w-1/3">DVET S.N.:</span>
                            <span>{item.SNAsperDVET}</span>
                        </div>
                        <div className="flex">
                            <span className="font-semibold w-1/3">DVET Item:</span>
                            <span>{item.ItemAsperDVET}</span>
                        </div>
                        <div className="flex">
                            <span className="font-semibold w-1/3">DVET Qty:</span>
                            <span>{item.RevisedQtyAsperDVET}</span>
                        </div>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default TradeSearch;
