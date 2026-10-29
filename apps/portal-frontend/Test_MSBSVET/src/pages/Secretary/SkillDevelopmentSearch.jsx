import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import agent from "../../lib/api/agent";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import verified from "../../assets/VerifiedIcon.jpg";
import rejected from "../../assets/NotVerifiedIcon.jpg";
import LOIApplicationPrintForm from "../../Component/PrintApplicationForm/LOIApplicationPrintForm";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import { Search, RefreshCw, XCircle } from "lucide-react";
import { useAuth } from "../../Hooks/AuthContext";


const SkillDevelopmentSearch = () => {
    const navigate = useNavigate();

    const [regionList, setRegionList] = useState([]);
    const [regionDistrictList, setRegionDistrictList] = useState([]);
    const [districtList, setDistrictList] = useState([]);
    const [talukaList, setTalukaList] = useState([]);

    const { userInfo } = useAuth();
    const userLoginID = userInfo?.UserLoginID;
    const userTypeID = userInfo?.UserTypeID;

    const [selectedRegion, setSelectedRegion] = useState("-1");
    const [selectedDistrict, setSelectedDistrict] = useState("-1");
    const [selectedTaluka, setSelectedTaluka] = useState("-1");
    const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("A");

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mastersLoading, setMastersLoading] = useState(true);
    const [selectedInstitute, setSelectedInstitute] = useState("-1");
    const [instituteList, setInstituteList] = useState([]);
    const { color } = useContext(ThemeContext);

    // Convert lists to format required by DropdownComponent
    const regionOptions = regionList.map(item => ({
        value: item.Value,
        label: item.Text
    }));

    const approvalStatusOptionsFormatted = [
        { value: "A", label: " Select " },
        { value: "V", label: " Approved " },
        { value: "S", label: " Unapproved " },
        { value: "R", label: " Rejected " }
    ];

    const districtOptions = districtList.map(item => ({
        value: item.Value,
        label: item.Text
    }));

    const talukaOptions = talukaList.map(item => ({
        value: item.Value,
        label: item.Text
    }));

    const instituteOptions = instituteList.map(item => ({
        value: item.Value,
        label: item.Text
    }));

    useEffect(() => {
        // if (userTypeID !== 81) {
        //     // navigate("/");
        //     return;
        // }
        loadMasters();
    }, []);

    String.prototype.hashCode = function () {
        let hash = 0;
        for (let i = 0; i < this.length; i++) {
            const char = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    };

    const loadMasters = async () => {
        setMastersLoading(true);
        try {
            const [regionRes, regionDistrictRes, districtRes, talukaRes] = await Promise.all([
                agent.get("/Base/GetMasterRegion"),
                agent.get("/Base/GetMasterRegionDistrict"),
                agent.get("/Base/GetMasterDistrict"),
                agent.get("/Base/GetMasterTaluka")
            ]);

            if (regionRes.data?.Status === "Success") {
                const regions = regionRes.data.Data || [];
                const filteredRegions = regions.filter(r => r.Value !== "-1");
                setRegionList([{ Value: "-1", Text: "All" }, ...filteredRegions]);
            }

            if (regionDistrictRes.data?.Status === "Success") {
                const regionDistricts = regionDistrictRes.data.Data || [];
                setRegionDistrictList(regionDistricts.filter(r => r.Value !== "-1"));
            }

            if (districtRes.data?.Status === "Success") {
                const districts = districtRes.data.Data || [];
                setDistrictList([{ Value: "-1", Text: "All" }, ...districts.filter(d => d.Value !== "-1")]);
            }

            if (talukaRes.data?.Status === "Success") {
                let talukas = talukaRes.data.Data || [];
                talukas = talukas.filter(t => parseInt(t.Group2) > 0 && t.Value !== "-1");
                setTalukaList([{ Value: "-1", Text: "All" }, ...talukas]);
            }

            await loadInstitutes();
        } catch (error) {
            Swal.fire("Error", "Failed to load master data", "error");
        } finally {
            setMastersLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await agent.get("/api/InstituteBase/SearchSDILOI", {
                params: {
                    DistrictID: selectedDistrict !== "-1" ? parseInt(selectedDistrict) : -1,
                    TalukaID: selectedTaluka !== "-1" ? parseInt(selectedTaluka) : -1,
                    RegionID: selectedRegion !== "-1" ? parseInt(selectedRegion) : -1,
                    FormStatus: selectedApprovalStatus,
                    InstituteID: selectedInstitute !== "-1" ? parseInt(selectedInstitute) : -1
                }
            });

            if (response.data?.Status === "Success") {
                let results = response.data.Data || [];
                if (results.length === 0) {
                    Swal.fire({
                        icon: "info",
                        title: "No Records Found",
                        text: "No data found for the selected criteria.",
                        confirmButtonText: "OK"
                    });
                    setSearchResults([]);
                } else {
                    results = results.map((item, index) => ({
                        ...item,

                        PrintUrl: item.PrintUrl?.replace(
                            "<#staffid#>",
                            String(item.InstituteID)
                                .split('')
                                .reduce((acc, char) => acc + char.charCodeAt(0), 0)
                                .toString()
                        ),

                        srNo: index + 1,
                        profileId: item.InstituteCode || '',
                        loiStatusText:
                            item.VerifyStatus === "V"
                                ? "Verified"
                                : item.VerifyStatus === "R"
                                    ? "Rejected"
                                    : "Pending",

                        actionText: item.FormStatus?.replace(/<[^>]+>/g, '') || ''
                    }));
                    setSearchResults(results);
                }
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Search Failed",
                text: error.response?.data?.Message || "Failed to search records. Please try again.",
                confirmButtonText: "OK"
            });
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };
    const handleReset = async () => {
        setSelectedRegion("-1");
        setSelectedDistrict("-1");
        setSelectedTaluka("-1");
        setSelectedApprovalStatus("A");
        setSelectedInstitute("-1");

        setSearchResults([]);

        // Reload dropdown data
        await loadMasters();
    };
    const handleRegionChange = async (regionId) => {
        setSelectedRegion(regionId);
        setSelectedDistrict("-1");
        setSelectedTaluka("-1");
        setSelectedInstitute("-1");

        if (regionId !== "-1") {
            const filteredDistricts = regionDistrictList.filter(d => String(d.Group) === String(regionId));
            setDistrictList([{ Value: "-1", Text: "All" }, ...filteredDistricts]);

            const filteredTalukas = talukaList.filter(t => String(t.Group2) === String(regionId) && t.Value !== "-1");
            setTalukaList([{ Value: "-1", Text: "All" }, ...filteredTalukas]);
        } else {
            const allDistricts = districtList.filter(d => d.Value !== "-1");
            setDistrictList([{ Value: "-1", Text: "All" }, ...allDistricts]);

            const allTalukas = talukaList.filter(t => t.Value !== "-1");
            setTalukaList([{ Value: "-1", Text: "All" }, ...allTalukas]);
        }

        setSearchResults([]);
        await loadInstitutes();
    };

    const handleDistrictChange = async (districtId) => {
        setSelectedDistrict(districtId);
        setSelectedTaluka("-1");
        setSelectedInstitute("-1");

        let filteredTalukas = [...talukaList];

        if (districtId !== "-1") {
            filteredTalukas = talukaList.filter(t => String(t.Group) === String(districtId) && t.Value !== "-1");
        }

        if (selectedRegion !== "-1") {
            filteredTalukas = filteredTalukas.filter(t => String(t.Group2) === String(selectedRegion) && t.Value !== "-1");
        }

        setTalukaList([{ Value: "-1", Text: "All" }, ...filteredTalukas]);
        setSearchResults([]);
        await loadInstitutes();
    };

    const handleTalukaChange = async (talukaId) => {
        setSelectedTaluka(talukaId);
        setSelectedInstitute("-1");
        setSearchResults([]);
        await loadInstitutes();
    };

    const handleApprovalStatusChange = async (status) => {
        setSelectedApprovalStatus(status);
        setSelectedInstitute("-1");
        setSearchResults([]);
        await loadInstitutes();
    };

    const openPopup = (instituteCode, instituteId) => {
        const hashid = instituteId.toString().hashCode().toString();
        const popupWidth = 1000;
        const popupHeight = 750;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;
        window.open(
            `${window.location.origin}/React/LOIApplicationPrintForm?P1=${instituteId}&P2=${hashid}`,
            "LOIApplicationPrintForm",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    };

    const loadInstitutes = async () => {
        try {
            const response = await agent.get("/api/InstituteBase/SearchSDILOI", {
                params: {
                    DistrictID: selectedDistrict !== "-1" ? parseInt(selectedDistrict) : -1,
                    TalukaID: selectedTaluka !== "-1" ? parseInt(selectedTaluka) : -1,
                    RegionID: selectedRegion !== "-1" ? parseInt(selectedRegion) : -1,
                    FormStatus: selectedApprovalStatus,
                    InstituteID: -1
                }
            });

            if (response.data?.Status === "Success") {
                let institutes = response.data.Data || [];
                institutes = institutes.map(inst => ({
                    Value: inst.InstituteID,
                    Text: inst.InstituteNameCode || inst.InstituteName
                }));
                setInstituteList([{ Value: "-1", Text: "-- Select -- " }, ...institutes]);
            } else {
                setInstituteList([{ Value: "-1", Text: "-- Select -- " }]);
            }
        } catch (error) {
            setInstituteList([{ Value: "-1", Text: "-- Select -- " }]);
        }
    };

    const getStatusIcon = (verifyStatus) => {
        if (verifyStatus === "V") {
            return <img src={verified} alt="Verified" className="w-8 h-8 mx-auto" />;
        } else if (verifyStatus === "R") {
            return <img src={rejected} alt="Rejected" className="w-8 h-8 mx-auto" />;
        }
        return null;
    };

    const renderCell = (item, column, rowIndex) => {
        if (column.key === 'srNo') {
            return rowIndex + 1;
        }
        if (column.key === 'profileId') {
            return (
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        const instituteId = item.InstituteCode.slice(-6);
                        openPopup(item.InstituteCode, instituteId);
                    }}
                    className="text-blue-600 hover:underline"
                >
                    {item.InstituteCode}
                </a>
            );
        }
        if (column.key === 'loiStatusText') {
            return getStatusIcon(item.VerifyStatus);
        }
        if (column.key === 'actionText') {
            return (
                <span
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={async () => {
                        try {
                            const instituteCode = item.InstituteCode;
                            const res = await agent.get("/Base/GetInstituteIDByInstituteCode", {
                                params: { InstituteCode: instituteCode }
                            });
                            if (res.data?.Status === "Success") {
                                const instituteId = res.data.Data;
                                const hashid = instituteId.toString().hashCode().toString();
                                navigate(`/InstituteDash?P1=${instituteId}&P2=${hashid}`);
                            } else {
                            }
                        } catch (error) {
                        }
                    }}
                >
                    {item.FormStatus.replace(/<[^>]+>/g, '')}
                </span>
            );
        }
        return item[column.key] || "—";
    };

    const columns = [
        { key: 'srNo', header: 'Sr. No.', width: '60px', className: 'text-center', headerClassName: 'text-center', sortable: false },
        { key: 'Region', header: 'Region', width: '120px', className: 'text-center', headerClassName: 'text-center' },
        { key: 'District', header: 'District', width: '150px', className: 'text-center', headerClassName: 'text-center' },
        { key: 'profileId', header: 'Profile ID', width: '120px', className: 'text-center', headerClassName: 'text-center', sortable: false },
        { key: 'PromotingOrganization', header: 'Skill Development Institute', width: '300px', className: 'text-center', headerClassName: 'text-center' },
        { key: 'ApplicationDate', header: 'Application Date', width: '120px', className: 'text-center', headerClassName: 'text-center' },
        { key: 'loiStatusText', header: 'LoI Status', width: '80px', className: 'text-center', headerClassName: 'text-center', sortable: false },
        { key: 'actionText', header: 'Action', width: '100px', className: 'text-center', headerClassName: 'text-center', sortable: false }
    ];

    // if (mastersLoading) {
    //     return (
    //         <div className="flex justify-center items-center h-64">
    //             {/* <div className="text-center">Loading...</div> */}
    //         </div>
    //     );
    // }

    return (
        <div className="p-4">
            <fieldset className="rounded border border-gray-300 p-4 mb-6 bg-white shadow-sm">
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                    <Search className="inline mr-2" />
                    Skill Development Institute – Letter of Intent
                </legend>

                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <DropdownComponent
                                label="Region"
                                options={regionOptions}
                                value={selectedRegion}
                                onChange={handleRegionChange}
                                required={false}
                                disabled={false}
                                loading={mastersLoading}
                            />
                        </div>
                        <div>
                            <DropdownComponent
                                label="Approval Status"
                                options={approvalStatusOptionsFormatted}
                                value={selectedApprovalStatus}
                                onChange={handleApprovalStatusChange}
                                required={false}
                                disabled={false}
                                loading={false}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <DropdownComponent
                                label="District"
                                options={districtOptions}
                                value={selectedDistrict}
                                onChange={handleDistrictChange}
                                required={false}
                                disabled={false}
                                loading={mastersLoading}
                            />
                        </div>
                        <div>
                            <DropdownComponent
                                label="Skill Development Institute – Letter of Intent"
                                options={instituteOptions}
                                value={selectedInstitute}
                                onChange={(value) => {
                                    setSelectedInstitute(value);
                                    setSearchResults([]);
                                }}
                                required={false}
                                disabled={false}
                                loading={false}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <div className="w-1/2">
                            <DropdownComponent
                                label="Taluka"
                                options={talukaOptions}
                                value={selectedTaluka}
                                onChange={handleTalukaChange}
                                required={false}
                                disabled={false}
                                loading={mastersLoading}
                            />
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">

                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${color}`}
                        >
                            {loading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            {loading ? "Searching..." : "Search"}
                        </button>

                        <button
                            onClick={handleReset}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-700 bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <XCircle className="w-4 h-4" />
                            Reset
                        </button>

                    </div>
                </div>

                {searchResults.length > 0 && (
                    <div className="mt-6">
                        <FilteredTableComponent
                            data={searchResults}
                            columns={columns}
                            renderCell={renderCell}
                            loading={loading}
                            sortable={true}
                            searchable={true}
                            exportable={true}
                            showSearch={true}
                            showExport={true}
                            showExcel={true}
                            showPDF={true}
                            exportFileName="SDI_LOI_Report"
                            title="List of Promoting Organization"
                            tableId="sdi-loi-table"
                            maxHeight="500px"
                            stickyHeader={true}
                        />
                    </div>
                )}
            </fieldset>
        </div>
    );
};

export default SkillDevelopmentSearch;