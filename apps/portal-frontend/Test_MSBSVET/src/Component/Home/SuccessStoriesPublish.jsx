import { useState, useEffect } from "react";
import { Search, Award, Download, FileText, User, Calendar, Building2, Briefcase, ArrowLeft, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import DropdownComponent from "../formcomponent/DropdownComponent";
import { GetMasterTableList } from '../../Endpoints_All/Base/Courses';
import { SearchSuccessStories, SuccessStorie } from "../../Endpoints_All/SuccessStories/SuccessStories";
import { GetMasterInstitute } from "../../Endpoints_All/Base/Institute";
import { GetMasterCourse } from "../../Endpoints_All/Base/Courses";
import agent from "../../lib/api/agent";

const SuccessStoriesPublish = () => {
    const { t } = useTranslation();
    const [successStories, setSuccessStories] = useState([]);
    const [filteredStories, setFilteredStories] = useState([]);

    // Dropdown options
    const [districts, setDistricts] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const [courses, setCourses] = useState([]);

    // Selected filter values
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedSector, setSelectedSector] = useState("");
    const [selectedInstitute, setSelectedInstitute] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");

    // Loading states
    const [loading, setLoading] = useState(true);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingSectors, setLoadingSectors] = useState(false);
    const [loadingInstitutes, setLoadingInstitutes] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);

    // Pagination and display
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch initial data
    useEffect(() => {
        fetchPublishedSuccessStories();
        fetchDropdownOptions();
    }, []);

    // Cascading dropdown effects
    useEffect(() => {
        if (selectedSector) {
            fetchInstitutes();
            fetchCourses();
            setSelectedInstitute("");
            setSelectedCourse("");
        } else {
            setInstitutes([]);
            setCourses([]);
        }
    }, [selectedSector]);

    // Filter stories based on search term
    useEffect(() => {
        let filtered = successStories;

        if (searchTerm) {
            filtered = filtered.filter(story =>
                story.CandidateFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.MiddleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.PresentDesignation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.PresentOrganization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.CourseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.CourseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.InstituteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.InstituteCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.PassingYear?.toString().includes(searchTerm) ||
                story.SelectionYear?.toString().includes(searchTerm) ||
                story.CandidateProfileID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.CandidateMobileNo?.includes(searchTerm)
            );
        }

        setFilteredStories(filtered);
        setCurrentPage(1);
    }, [successStories, searchTerm]);

    // Fetch published success stories
    const fetchPublishedSuccessStories = async () => {
        try {
            setLoading(true);
            const response = await agent.get(SuccessStorie);

            if (response.data.Status === "Success") {
                setSuccessStories(response.data.Data || []);
                setFilteredStories(response.data.Data || []);
            }
        } catch (error) {
            setSuccessStories([]);
            setFilteredStories([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch dropdown options from APIs
    const fetchDropdownOptions = async () => {
        await Promise.all([
            fetchDistricts(),
            fetchSectors()
        ]);
    };

    const fetchDistricts = async () => {
        try {
            setLoadingDistricts(true);
            const response = await agent.get(`${GetMasterTableList}?TableName=Master_District&DataValueField=District&DataTextField=DistrictID&HasSelect=true`);

            if (response.data.Status === "Success") {
                const formattedData = response.data.Data
                    .filter(district => district.Value !== "Select" && district.Text !== "-1")
                    .map(district => ({
                        value: district.Text,
                        label: district.Value
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));

                setDistricts(formattedData);
            }
        } catch (error) {
            setDistricts([]);
        } finally {
            setLoadingDistricts(false);
        }
    };

    const fetchSectors = async () => {
        try {
            setLoadingSectors(true);
            const response = await agent.get(`${GetMasterTableList}?TableName=Master_Sector&DataValueField=Sector&DataTextField=SectorID&HasSelect=true`);

            if (response.data.Status === "Success") {
                const formattedData = response.data.Data
                    .filter(sector => sector.Value !== "Select" && sector.Text !== "-1")
                    .map(sector => ({
                        value: sector.Text,
                        label: sector.Value
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));

                setSectors(formattedData);
            }
        } catch (error) {
            setSectors([]);
        } finally {
            setLoadingSectors(false);
        }
    };

    const fetchInstitutes = async () => {
        try {
            setLoadingInstitutes(true);
            const response = await agent.get(GetMasterInstitute);

            if (response.data.Status === "Success") {
                const formattedData = response.data.Data
                    .filter(institute => institute.Value !== "Select" && institute.Value !== "-1")
                    .map(institute => {
                        const fullText = institute.Text;
                        const nameMatch = fullText.match(/^(.+?)\s+\[.*\]$/);
                        const instituteName = nameMatch ? nameMatch[1].trim() : fullText;
                        return {
                            value: institute.Value,
                            label: instituteName
                        };
                    })
                    .sort((a, b) => a.label.localeCompare(b.label));

                setInstitutes(formattedData);
            }
        } catch (error) {
            setInstitutes([]);
        } finally {
            setLoadingInstitutes(false);
        }
    };

    const fetchCourses = async () => {
        try {
            setLoadingCourses(true);
            const response = await agent.get(GetMasterCourse, {
                params: {
                    SectorID: selectedSector || 0,
                    CourseTypeID: 0
                }
            });

            if (response.data.Status === "Success") {
                const formattedData = response.data.Data
                    .filter(course => course.Value !== "Select" && course.Value !== "-1")
                    .map(course => ({
                        value: course.Value,
                        label: course.Text
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));

                setCourses(formattedData);
            }
        } catch (error) {
            setCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleSearch = async () => {
        try {
            setLoadingSearch(true);

            const params = {
                DistrictID: selectedDistrict || 0,
                SectorID: selectedSector || 0,
                InstituteID: selectedInstitute || 0,
                CoureseID: selectedCourse || 0,
                PublishStatus: 1
            };

            const response = await agent.get(SearchSuccessStories, { params });

            if (response.data.Status === "Success") {
                setSuccessStories(response.data.Data || []);
                setFilteredStories(response.data.Data || []);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: t("Search_Error"),
                text: t("Failed_To_Search"),
                confirmButtonColor: '#3B82F6'
            });
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleReset = () => {
        setSelectedDistrict("");
        setSelectedSector("");
        setSelectedInstitute("");
        setSelectedCourse("");
        setSearchTerm("");
        setInstitutes([]);
        setCourses([]);
        fetchPublishedSuccessStories();
    };

    const handleSectorChange = (value) => {
        setSelectedSector(value);
        setSelectedInstitute("");
        setSelectedCourse("");
        setInstitutes([]);
        setCourses([]);
    };

    const handleInstituteChange = (value) => {
        setSelectedInstitute(value);
        setSelectedCourse("");
    };

    const handleRowClick = (story) => {
        showStoryDetails(story);
    };

   const showStoryDetails = (story) => {
        const modalContent = `
            <div style="text-align: left; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
                <!-- Profile Image -->
                <div style="text-align: center; margin-bottom: 12px;">
                    ${story.PhotoPath ?
                        `<img src="${story.PhotoPath}" alt="${story.CandidateFullName}" 
                             style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; 
                                    border: 3px solid #3B82F6; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15); display: inline-block;">`
                        :
                        `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                   display: flex; align-items: center; justify-content: center; margin: 0 auto; 
                                   border: 3px solid #3B82F6; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);">
                             <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                                 <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5C14.7 5.4 14.4 5.5 14.2 5.7L10.4 9.5C10.1 9.8 10.1 10.3 10.4 10.6L12 12.2V22H14V12L11.6 9.6L14.8 6.4L20.1 7.9C20.6 8 21 8.4 21 9Z"/>
                             </svg>
                         </div>`
                    }
                </div>

                <!-- Candidate Info & Course Box -->
                <div style="background: #F8FAFC; border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; border-left: 4px solid #3B82F6;">
                    <h3 style="color: #1E293B; margin: 0 0 8px 0; text-align: center; font-size: 1.05em; font-weight: 600; line-height: 1.2;">
                        ${story.CandidateFullName || "N/A"}
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                        <div style="background: white; border-radius: 6px; padding: 6px 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                            <div style="color: #64748B; font-size: 0.7em; font-weight: 400; margin-bottom: 2px;">${t("PASSING_YEAR")}</div>
                            <div style="color: #1E293B; font-weight: 500; font-size: 0.82em;">${story.PassingYear || t("N/A")}</div>
                        </div>
                        
                        <div style="background: white; border-radius: 6px; padding: 6px 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                            <div style="color: #64748B; font-size: 0.7em; font-weight: 400; margin-bottom: 2px;">${t("SELECTION_YEAR")}</div>
                            <div style="color: #1E293B; font-weight: 500; font-size: 0.82em;">${story.SelectionYear || t("N/A")}</div>
                        </div>
                    </div>
                    
                    <div style="background: white; border-radius: 6px; padding: 8px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                        <div style="color: #64748B; font-size: 0.7em; font-weight: 400; margin-bottom: 3px;">${t("COURSE")}</div>
                        <div style="color: #1E293B; font-weight: 500; font-size: 0.82em; line-height: 1.3; word-break: break-word;">${story.CourseNameCode || story.CourseName || t("N/A")}</div>
                    </div>
                </div>

                <!-- Institute Box -->
                <div style="background: #F1F5F9; border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; border-left: 4px solid #64748B;">
                    <div style="color: #475569; font-size: 0.7em; font-weight: 500; margin-bottom: 3px;">${t("INSTITUTE")}</div>
                    <div style="color: #1E293B; font-weight: 500; font-size: 0.82em; line-height: 1.35; word-break: break-word;">
                        ${story.InstituteNameCode || story.InstituteName || t("N/A")}
                    </div>
                </div>

                <!-- Career Achievement Green Gradient Box -->
                <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 10px; padding: 12px 14px; color: white;">
                    <h4 style="margin: 0 0 8px 0; font-size: 0.9em; font-weight: 600;">${t("Career_Achievement")}</h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div style="background: rgba(255,255,255,0.15); border-radius: 6px; padding: 8px 10px;">
                            <div style="opacity: 0.9; font-size: 0.7em; font-weight: 400; margin-bottom: 2px;">${t("DESIGNATION")}</div>
                            <div style="font-weight: 500; font-size: 0.82em; line-height: 1.2; word-break: break-word;">${story.PresentDesignation || t("N/A")}</div>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.15); border-radius: 6px; padding: 8px 10px;">
                            <div style="opacity: 0.9; font-size: 0.7em; font-weight: 400; margin-bottom: 2px;">${t("ORGANIZATION")}</div>
                            <div style="font-weight: 500; font-size: 0.82em; line-height: 1.2; word-break: break-word;">${story.PresentOrganization || t("N/A")}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        Swal.fire({
            html: modalContent,
            width: '500px',
            padding: '16px 18px',
            showCloseButton: true,
            showConfirmButton: false,
            background: '#ffffff',
            didOpen: () => {
                const popup = Swal.getPopup();
                const htmlContainer = Swal.getHtmlContainer();
                const closeBtn = Swal.getCloseButton();

                if (popup) {
                    popup.style.padding = "18px 20px 14px 20px";
                }
                if (htmlContainer) {
                    htmlContainer.style.margin = "0";
                    htmlContainer.style.padding = "0";
                    htmlContainer.style.width = "100%";
                }
                if (closeBtn) {
                    closeBtn.style.position = "absolute";
                    closeBtn.style.top = "12px";
                    closeBtn.style.right = "12px";
                    closeBtn.style.border = "none";
                    closeBtn.style.outline = "none";
                    closeBtn.style.boxShadow = "none";
                    closeBtn.style.background = "transparent";
                    closeBtn.style.color = "#9CA3AF";
                    closeBtn.style.fontSize = "22px";
                    closeBtn.style.fontWeight = "400";
                    closeBtn.style.cursor = "pointer";
                }
            }
        });
    };

    // Pagination calculations
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredStories.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredStories.length / entriesPerPage);

    const exportToExcel = () => {
        //console.log(t("Export_To_Excel"));
    };

    const exportToPDF = () => {
        //console.log(t("Export_To_PDF"));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <span className="text-gray-600 font-medium">{t("Loading_Success_Stories")}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* Search Filters */}
            <fieldset className="rounded border border-gray-300 p-4">
                <legend className="rounded border border-gray-300 bg-gray-500 px-4 py-1 text-xl font-bold text-white">
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        {t("Success_Stories_of_Board")}
                    </div>
                </legend>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <DropdownComponent
                            label={t("District")}
                            options={districts}
                            value={selectedDistrict}
                            onChange={setSelectedDistrict}
                            loading={loadingDistricts}
                            required={false}
                        />
                    </div>
                    <div>
                        <DropdownComponent
                            label={t("Sector")}
                            options={sectors}
                            value={selectedSector}
                            onChange={handleSectorChange}
                            loading={loadingSectors}
                            required={false}
                        />
                    </div>
                    <div>
                        <DropdownComponent
                            label={t("Institute")}
                            options={institutes}
                            value={selectedInstitute}
                            onChange={handleInstituteChange}
                            loading={loadingInstitutes}
                            disabled={!selectedSector}
                            required={false}
                        />
                    </div>
                    <div>
                        <DropdownComponent
                            label={t("Course")}
                            options={courses}
                            value={selectedCourse}
                            onChange={setSelectedCourse}
                            loading={loadingCourses}
                            disabled={!selectedSector}
                            required={false}
                        />
                    </div>
                </div>

                <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                        className="bg-green-600 text-white px-6 py-2 font-bold rounded-md hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSearch}
                        disabled={loadingSearch}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        {loadingSearch ? t("Searching") : t("Search")}
                    </button>
                    <button
                        className="bg-red-600 text-white px-6 py-2 rounded-md font-bold hover:bg-red-700 transition-colors"
                        onClick={handleReset}
                    >
                        {t("Reset")}
                    </button>
                </div>
            </fieldset>

            {/* Export and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={exportToExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
                    >
                        <FileText className="w-4 h-4 mr-1" />
                        {t("Excel")}
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <Download className="w-4 h-4 mr-1" />
                        {t("PDF")}
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm">{t("Show")}</label>
                        <select
                            value={entriesPerPage}
                            onChange={(e) => {
                                setEntriesPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <label className="text-sm">{t("Entries")}</label>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm">{t("Search")}:</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
                            placeholder={t("Search_All_Fields")}
                        />
                    </div>
                </div>
            </div>

            {/* Success Stories Table */}
            <fieldset className="rounded border border-gray-300 p-4">
                <legend className="rounded border border-gray-300 bg-gray-500 px-4 py-1 text-xl font-bold text-white">
                    {t("Success_Stories_List")} ({filteredStories.length} {t("Published_Stories")})
                </legend>

                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full border-collapse border border-gray-300 text-sm">
                        <thead className="sticky top-0 bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 px-2 py-2">{t("Sr_No")}</th>
                                <th className="border border-gray-300 px-2 py-2">{t("Photo")}</th>
                                <th className="border border-gray-300 px-2 py-2">{t("Name")}</th>
                                <th className="border border-gray-300 px-2 py-2">{t("Course")}</th>
                                <th className="border border-gray-300 px-2 py-2">{t("Institute")}</th>
                                <th className="border border-gray-300 px-2 py-2">{t("Passing_Year")}</th>
                                <th className="border border-gray-300 px-2 py-2">{t("Present_Designation")}</th>
                                <th className="border border-gray-300 px-2 py-2">{t("Present_Organization")}</th>
                                <th className="border border-gray-300 px-2 py-2">{t("Selection_Year")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEntries.length > 0 ? (
                                currentEntries.map((story, index) => (
                                    <tr
                                        key={story.ID || index}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                        onClick={() => handleRowClick(story)}
                                        title={t("Click_To_View_Details")}
                                    >
                                        <td className="border border-gray-300 px-2 py-2 text-center">
                                            {indexOfFirstEntry + index + 1}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-center">
                                            <div className="flex justify-center">
                                                {story.PhotoPath ? (
                                                    <img
                                                        src={story.PhotoPath}
                                                        alt={story.CandidateFullName}
                                                        className="w-12 h-12 object-cover rounded-full border border-gray-300"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div
                                                    className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300"
                                                    style={{ display: story.PhotoPath ? 'none' : 'flex' }}
                                                >
                                                    <User className="w-6 h-6 text-gray-500" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 font-medium">
                                            {story.CandidateFullName}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2">
                                            {story.CourseName}
                                            {story.CourseCode && (
                                                <div className="text-xs text-gray-500">({story.CourseCode})</div>
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-xs">
                                            {story.InstituteName}
                                            {story.InstituteCode && (
                                                <div className="text-xs text-gray-500">({story.InstituteCode})</div>
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-center">
                                            {story.PassingYear}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 font-medium text-blue-600">
                                            {story.PresentDesignation}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 font-medium">
                                            {story.PresentOrganization}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-center">
                                            {story.SelectionYear}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="border border-gray-300 px-2 py-8 text-center text-gray-500" colSpan={9}>
                                        {loadingSearch ? t("Searching_Success_Stories") : t("No_Success_Stories_Found")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredStories.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-600">
                            {t("Showing_Entries")} {indexOfFirstEntry + 1} {t("To")} {Math.min(indexOfLastEntry, filteredStories.length)} {t("Of")} {filteredStories.length} {t("Entries_Count")}
                        </div>
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t("Previous")}
                            </button>

                            <div className="flex gap-1">
                                {[...Array(totalPages)].slice(
                                    Math.max(0, currentPage - 3),
                                    Math.min(totalPages, currentPage + 2)
                                ).map((_, i) => {
                                    const pageNumber = Math.max(0, currentPage - 3) + i + 1;
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={`px-3 py-1 border border-gray-300 rounded text-sm ${currentPage === pageNumber
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1"
                            >
                                {t("Next")}
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                )}
            </fieldset>
        </div>
    );
};

export default SuccessStoriesPublish;