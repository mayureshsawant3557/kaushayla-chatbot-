import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import DropdownComponent from "../formcomponent/DropdownComponent";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import pdflogo from '../../assets/pdf.png';
import { baseURL } from '../../Endpoints_All/Config/baseConfig';
import agent from "../../lib/api/agent";

// Category name to ID mapping
const CATEGORY_NAME_TO_ID_MAP = {
    "NATIONAL TRADE CERTIFICATE": "6",
    "STATE TRADE CERTIFICATE": "8"
};

const CourseSearch = () => {
    // Master data - all courses fetched once
    const [allCourses, setAllCourses] = useState([]);

    // Dropdown options
    const [sectors, setSectors] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);

    // Selected values
    const [selectedSector, setSelectedSector] = useState("-1");
    const [selectedCategory, setSelectedCategory] = useState("-1");
    const [selectedCourse, setSelectedCourse] = useState("-1");

    // Results
    const [courseList, setCourseList] = useState([]);

    // Loading states
    const [loadingSectors, setLoadingSectors] = useState(false);
    const [loadingAllCourses, setLoadingAllCourses] = useState(false);
    const [loadingResults, setLoadingResults] = useState(false);

    const BASE_API_URL = baseURL;

    const extractTextFromHtml = (htmlString) => {
        if (!htmlString) return "";
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlString;
        const text = tempDiv.textContent || tempDiv.innerText || "";
        return text.trim();
    };

    const parseCourseFromHtml = (htmlString) => {
        const courseText = extractTextFromHtml(htmlString);
        const match = courseText.match(/^(.+?)\s*\(([^)]+)\)$/);
        if (match) {
            return { name: match[1].trim(), code: match[2].trim() };
        }
        return { name: courseText, code: "" };
    };

    const handlePdfView = (pdfUrl, itemName) => {
        if (!pdfUrl || pdfUrl.trim() === '') {
            alert('No document available');
            return;
        }

        const popupWidth = 900;
        const popupHeight = 700;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        const popup = window.open(
            '',
            `${itemName}`,
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`
        );

        if (popup) {
            popup.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${itemName}</title>
                    <style>
                        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                        iframe { width: 100%; height: 100%; border: none; }
                    </style>
                </head>
                <body>
                    <iframe src="${pdfUrl}" type="application/pdf"></iframe>
                </body>
                </html>
            `);
            popup.document.close();
            popup.focus();
        } else {
            alert("Please allow pop-ups for this website to view the PDF");
        }
    };

    // Helper function to safely fetch course data
    const safeFetchCourses = async (params) => {
        try {
            const response = await agent.get(`${BASE_API_URL}/Base/GetCourseSearchForAdmission`, { params });
            return response.data?.Data ?? [];
        } catch (error) {
            if (error.response?.status === 404) {
                return [];
            }
            return [];
        }
    };

    // Fetch all courses and sectors on mount
    useEffect(() => {
        fetchSectorsAndCourses();
    }, []);

    const fetchSectorsAndCourses = async () => {
        try {
            setLoadingAllCourses(true);
            setLoadingSectors(true);

            // Fetch all courses from both categories
            const [data6, data8] = await Promise.all([
                safeFetchCourses({ SectorID: -1, CourseCategoryID: 6, CourseType: "-1", EntryQualificationID: -1, CourseID: -1 }),
                safeFetchCourses({ SectorID: -1, CourseCategoryID: 8, CourseType: "-1", EntryQualificationID: -1, CourseID: -1 })
            ]);

            const combinedData = [...data6, ...data8];
            setAllCourses(combinedData);

            // Extract unique sectors with "All" option
            const uniqueSectors = [];
            const sectorMap = new Map();

            combinedData.forEach(course => {
                if (course.Sector && !sectorMap.has(course.Sector)) {
                    sectorMap.set(course.Sector, true);
                    uniqueSectors.push({
                        value: course.Sector,
                        label: course.Sector
                    });
                }
            });

            const sortedSectors = [
                { value: "-1", label: "All" },
                ...uniqueSectors.sort((a, b) => a.label.localeCompare(b.label))
            ];
            setSectors(sortedSectors);

        } catch (error) {
            setAllCourses([]);
            setSectors([{ value: "-1", label: "All" }]);
        } finally {
            setLoadingAllCourses(false);
            setLoadingSectors(false);
        }
    };

    // Cascading logic: Sector changes → Filter Categories and reset Category & Course
    const handleSectorChange = (value) => {
        setSelectedSector(value);
        setSelectedCategory("-1"); // Reset category
        setSelectedCourse("-1"); // Reset course
        setFilteredCourses([]); // Clear courses
        setCourseList([]); // Clear results

        if (value === "-1") {
            // Show all categories when "All" is selected
            const allCategories = [];
            const categoryMap = new Map();

            allCourses.forEach(course => {
                const categoryName = course.CourseCategory;
                const categoryId = CATEGORY_NAME_TO_ID_MAP[categoryName];

                if (categoryName && categoryId && !categoryMap.has(categoryId)) {
                    categoryMap.set(categoryId, true);
                    allCategories.push({
                        value: categoryId,
                        label: categoryName
                    });
                }
            });

            const sortedCategories = [
                { value: "-1", label: "All" },
                ...allCategories.sort((a, b) => a.label.localeCompare(b.label))
            ];
            setFilteredCategories(sortedCategories);
            return;
        }

        // Filter courses by sector
        const coursesInSector = allCourses.filter(
            course => course.Sector === value
        );

        // Extract unique categories from filtered courses
        const uniqueCategories = [];
        const categoryMap = new Map();

        coursesInSector.forEach(course => {
            const categoryName = course.CourseCategory;
            const categoryId = CATEGORY_NAME_TO_ID_MAP[categoryName];

            if (categoryName && categoryId && !categoryMap.has(categoryId)) {
                categoryMap.set(categoryId, true);
                uniqueCategories.push({
                    value: categoryId,
                    label: categoryName
                });
            }
        });

        const sortedCategories = [
            { value: "-1", label: "All" },
            ...uniqueCategories.sort((a, b) => a.label.localeCompare(b.label))
        ];
        setFilteredCategories(sortedCategories);
    };

    // Cascading logic: Category changes → Filter Courses and reset Course
    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        setSelectedCourse("-1"); // Reset course
        setCourseList([]); // Clear results

        if (value === "-1") {
            // Show all courses in selected sector when "All" category is selected
            if (selectedSector === "-1") {
                // If both sector and category are "All", show all courses
                const allCoursesFormatted = allCourses.map((course) => {
                    const parsedCourse = parseCourseFromHtml(course.Course);
                    return {
                        value: course.CourseID?.toString(),
                        label: `${parsedCourse.name} ${parsedCourse.code ? `(${parsedCourse.code})` : ''}`.trim(),
                        name: parsedCourse.name,
                        code: parsedCourse.code,
                    };
                }).sort((a, b) => a.label.localeCompare(b.label));

                setFilteredCourses([
                    { value: "-1", label: "All" },
                    ...allCoursesFormatted
                ]);
            } else {
                // Show all courses in selected sector
                const coursesInSector = allCourses.filter(
                    course => course.Sector === selectedSector
                );

                const formattedCourses = coursesInSector.map((course) => {
                    const parsedCourse = parseCourseFromHtml(course.Course);
                    return {
                        value: course.CourseID?.toString(),
                        label: `${parsedCourse.name} ${parsedCourse.code ? `(${parsedCourse.code})` : ''}`.trim(),
                        name: parsedCourse.name,
                        code: parsedCourse.code,
                    };
                }).sort((a, b) => a.label.localeCompare(b.label));

                setFilteredCourses([
                    { value: "-1", label: "All" },
                    ...formattedCourses
                ]);
            }
            return;
        }

        // Get category name from ID
        const categoryNameFromId = Object.keys(CATEGORY_NAME_TO_ID_MAP).find(
            key => CATEGORY_NAME_TO_ID_MAP[key] === value
        );

        // Filter courses by sector AND category
        let coursesToFilter = allCourses;

        if (selectedSector !== "-1") {
            coursesToFilter = coursesToFilter.filter(course => course.Sector === selectedSector);
        }

        const coursesInSectorAndCategory = coursesToFilter.filter(
            course => course.CourseCategory === categoryNameFromId
        );

        // Extract unique courses
        const uniqueCourses = coursesInSectorAndCategory.map((course) => {
            const parsedCourse = parseCourseFromHtml(course.Course);
            return {
                value: course.CourseID?.toString(),
                label: `${parsedCourse.name} ${parsedCourse.code ? `(${parsedCourse.code})` : ''}`.trim(),
                name: parsedCourse.name,
                code: parsedCourse.code,
            };
        }).sort((a, b) => a.label.localeCompare(b.label));

        setFilteredCourses([
            { value: "-1", label: "All" },
            ...uniqueCourses
        ]);
    };

    // Search functionality - supports "All" selections
    const handleSearch = async () => {
        try {
            setLoadingResults(true);

            let filtered = [...allCourses];

            // Filter by sector if not "All"
            if (selectedSector !== "-1") {
                filtered = filtered.filter(course => course.Sector === selectedSector);
            }

            // Filter by category if not "All"
            if (selectedCategory !== "-1") {
                const categoryNameFromId = Object.keys(CATEGORY_NAME_TO_ID_MAP).find(
                    key => CATEGORY_NAME_TO_ID_MAP[key] === selectedCategory
                );
                filtered = filtered.filter(course => course.CourseCategory === categoryNameFromId);
            }

            // Filter by course if not "All"
            if (selectedCourse !== "-1") {
                filtered = filtered.filter(course => course.CourseID?.toString() === selectedCourse);
            }

            const formattedCourseList = filtered.map((item) => {
                const parsedCourse = parseCourseFromHtml(item.Course);
                return {
                    id: item.CourseID,
                    serialNumber: 0,
                    name: parsedCourse.code ? `${parsedCourse.name} (${parsedCourse.code})` : parsedCourse.name,
                    code: parsedCourse.code,
                    sector: item.Sector || "",
                    category: item.CourseCategory || "",
                    duration: item.Duration || "",
                    modelCurriculum: item.ModelCurriculum || "",
                    qualificationPack: item.QualificationPack || "",
                };
            });

            setCourseList(formattedCourseList);
        } catch (error) {
            setCourseList([]);
        } finally {
            setLoadingResults(false);
        }
    };

    const handleReset = () => {
        setSelectedSector("-1");
        setSelectedCategory("-1");
        setSelectedCourse("-1");
        setFilteredCategories([]);
        setFilteredCourses([]);
        setCourseList([]);
    };

    const sortByCategory = (courseList) => {
        const categoryOrder = {
            "NATIONAL TRADE CERTIFICATE": 1,
            "STATE TRADE CERTIFICATE": 2
        };
        return [...courseList].sort((a, b) => {
            const orderA = categoryOrder[a.category] || 999;
            const orderB = categoryOrder[b.category] || 999;
            return orderA - orderB;
        });
    };

    // Table columns
    const tableColumns = [
        { key: 'serialNumber', header: 'Sr. No.', width: '60px', className: 'text-center', headerClassName: 'text-center', sortable: false },
        { key: 'sector', header: 'Sector', width: '200px', headerClassName: 'text-left' },
        { key: 'category', header: 'Trade Category', headerClassName: 'text-left' },
        { key: 'name', header: 'Trade Name', headerClassName: 'text-left' },
        { key: 'duration', header: 'Duration', width: '100px', className: 'text-center', headerClassName: 'text-center' },
        { key: 'modelCurriculum', header: 'Model Curriculum', width: '130px', className: 'text-center', headerClassName: 'text-center', type: 'custom', excludeFromExport: true },
        { key: 'qualificationPack', header: 'Qualification Pack', width: '130px', className: 'text-center', headerClassName: 'text-center', type: 'custom', excludeFromExport: true }
    ];

    const renderCell = (item, column) => {
        if (column.key === "modelCurriculum" && item.modelCurriculum) {
            return (
                <button
                    onClick={() => handlePdfView(item.modelCurriculum, `${item.name} - Model Curriculum`)}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors w-full flex items-center justify-center gap-1"
                    title="Open Model Curriculum"
                >
                    <img src={pdflogo} alt="PDF" className="w-12 h-8 object-contain" />
                </button>
            );
        }

        if (column.key === "qualificationPack" && item.qualificationPack) {
            return (
                <button
                    onClick={() => handlePdfView(item.qualificationPack, `${item.name} - Qualification Pack`)}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors w-full flex items-center justify-center gap-1"
                    title="Open Qualification Pack"
                >
                    <img src={pdflogo} alt="PDF" className="w-6 h-6 object-contain" />
                </button>
            );
        }

        return undefined;
    };

    const courseListWithIndex = sortByCategory(courseList).map((course, idx) => ({
        ...course,
        serialNumber: idx + 1
    }));

    return (
        <div className="space-y-6 p-4">
            <fieldset className="rounded border border-gray-300 p-4">
                <legend className="rounded border border-gray-300 bg-gray-500 px-4 py-1 text-xl font-bold text-white">
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Search Trade
                    </div>
                </legend>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* 1. Sector Dropdown (Parent) with "All" */}
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

                    {/* 2. Category Dropdown (Child of Sector) with "All" */}
                    <div>
                        <DropdownComponent
                            label="Trade Category"
                            options={filteredCategories}
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            loading={false}
                            disabled={selectedSector === "-1" && filteredCategories.length === 0}
                            required={false}
                        />
                    </div>

                    {/* 3. Course Dropdown (Child of Category) with "All" */}
                    <div>
                        <DropdownComponent
                            label="Trade Name"
                            options={filteredCourses}
                            value={selectedCourse}
                            onChange={setSelectedCourse}
                            loading={false}
                            disabled={filteredCourses.length === 0}
                            required={false}
                        />
                    </div>
                </div>

                <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                        className="bg-green-600 text-white px-6 py-2 font-bold rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSearch}
                        disabled={loadingResults}
                    >
                        {loadingResults ? "Searching..." : "Search Trade"}
                    </button>
                    <button
                        className="bg-red-600 text-white px-6 py-2 rounded-md font-bold hover:bg-red-700 transition-colors"
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                </div>
            </fieldset>

            <fieldset className="rounded border border-gray-300 p-4">
                <legend className="rounded border border-gray-300 bg-gray-500 px-4 py-1 text-xl font-bold text-white">
                    Trade List {courseList.length > 0 && `(${courseList.length} Trade${courseList.length > 1 ? 's' : ''} found)`}
                </legend>
                {courseListWithIndex.length > 0 ? (
                    <FilteredTableComponent
                        data={courseListWithIndex}
                        columns={tableColumns}
                        filterColumns={['sector', 'category', 'name']}
                        renderCell={renderCell}
                        sortable={true}
                        searchable={true}
                        exportable={true}
                        showExcelTemplate={false}
                        exportFileName={`Trade_List_${selectedSector !== "-1" ? selectedSector : "All"}_${selectedCategory !== "-1" ? selectedCategory : "All"}`}
                        title="Trade List"
                        tableId="course-list-table"
                        maxHeight="600px"
                        stickyHeader={true}
                        columnFilterWidth="250px"
                    />
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        {loadingResults ? (
                            <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mr-3"></div>
                                Searching...
                            </div>
                        ) : (
                            "No trades found. Please click Search Trade to view results."
                        )}
                    </div>
                )}
            </fieldset>
        </div>
    );
};

export default CourseSearch;
