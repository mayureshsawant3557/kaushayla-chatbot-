// import React, { useContext, useState, useEffect } from 'react';
// import { FaClipboardList } from 'react-icons/fa';
// import { ThemeContext } from "../Context/ThemeContext";
// import { useTranslation } from 'react-i18next';
// import DropdownComponent from "../formcomponent/DropdownComponent";
// import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
// import { baseURL } from '../../Endpoints_All/Config/baseConfig';
// import agent from '../../lib/api/agent';

// const ExamTimeTable = () => {
//     const { color } = useContext(ThemeContext);
//     const { t } = useTranslation();

//     const [selectedYear, setSelectedYear] = useState("");
//     const [selectedExaminationType, setSelectedExaminationType] = useState("");
//     const [selectedCourseCode, setSelectedCourseCode] = useState("");

//     const [timeTableResults, setTimeTableResults] = useState([]);

//     const [yearList, setYearList] = useState([]);
//     const [examinationTypeList, setExaminationTypeList] = useState([]); 
//     const [courseList, setCourseList] = useState([]);

//     const [loadingYears, setLoadingYears] = useState(false);
//     const [loadingExaminationTypes, setLoadingExaminationTypes] = useState(false); 
//     const [loadingCourses, setLoadingCourses] = useState(false);
//     const [loadingResults, setLoadingResults] = useState(false);

//     const BASE_API_URL = baseURL;

//     useEffect(() => {
//         const fetchCourses = async () => {
//             try {
//                 setLoadingCourses(true);
//                 setSelectedCourseCode(""); 
                
//                 const response = await agent.get(`${BASE_API_URL}/Base/GetExamTimeTableCourses`);
//                 const records = response.data?.Data ?? response.data?.data ?? [];
                
//                 const formattedData = records
//                     .map((course) => {
//                         // 1. Get the frontend user-facing display label
//                         const name = course.CourseName ?? course.courseName ?? "";
                        
//                         // 2. Get the clean identifier string for database search operations
//                         const code = course.CourseCode ?? course.courseCode ?? "";

//                         return {
//                             // Backend tracks 'value' (CourseCode) while the UI shows 'label' (CourseName)
//                             value: code ? String(code) : name, 
//                             label: name || "Unknown Course", 
//                         };
//                     })
//                     .filter(item => item.label !== "Unknown Course" && item.value !== "");

//                 setCourseList(formattedData);
                
//             } catch (error) {
//                 console.error("Error fetching courses:", error);
//                 setCourseList([]);
//             } finally {
//                 setLoadingCourses(false);
//             }
//         };

//         fetchCourses();
//     }, [BASE_API_URL]);

//     // Keys match the exact column output fields from your SQL Stored Procedure
//     const tableColumns = [
//         { key: "Date", header: t('examTimeTable.table.date'), width: "80px", sortable: true,},
//         { key: "Timing", header: t('examTimeTable.table.timing'), width: "80px", sortable: false },
//         { key: "Course Code", header: t('examTimeTable.table.courseCode'), width: "50px", sortable: false },
//         { key: "Course Name", header: t('examTimeTable.table.courseName'), width: "150px", sortable: false },
//         { key: "Subject Code", header: t('examTimeTable.table.subjectCode'), width: "80px", sortable: false },
//         { key: "Subject Type", header: t('examTimeTable.table.subjectType') ?? "Subject Type", width: "80px", sortable: false },
//         { key: "Subject", header: t('examTimeTable.table.subjectName'), width: "150px", sortable: false },
        
        
//     ];
   
//     const handleSearch = async () => {
//         try {
//             setLoadingResults(true);
            
//             // selectedCourseCode contains only the course code value now
//             const response = await agent.get(
//                 `${BASE_API_URL}/Base/GetCourseSearchForExamTimeTable?courseCode=${encodeURIComponent(selectedCourseCode)}`
//             );
            
//             const records = response.data?.Data ?? response.data?.data ?? [];
//             setTimeTableResults(records);
//         } catch (error) {
//             console.error("Error searching timetable records:", error);
//             setTimeTableResults([]);
//         } finally {
//             setLoadingResults(false);
//         }
//     };

//     const handleReset = () => {
//         setSelectedYear("");
//         setSelectedExaminationType("");
//         setSelectedCourseCode("");
//         setTimeTableResults([]);
//     };

//     return (
//         <div className="space-y-6 w-full p-4">
            
//             <fieldset className="w-full rounded-lg border border-gray-300 bg-white p-6 shadow-lg">
//                 <legend className={`flex ${color} items-center text-lg font-semibold text-white border-2 border-gray-300 p-2 rounded-md`}>
//                     <FaClipboardList className="mr-2 text-white" />
//                     {t('examTimeTable.title')}
//                 </legend>
                    
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <DropdownComponent 
//                         label={t('Exam Year')}
//                         options={yearList}
//                         value={selectedYear}
//                         onChange={(val) => setSelectedYear(val)}
//                         loading={loadingYears}
//                         placeholder="Select Year"
//                         searchPlaceholder="Search year..."
//                     />
//                     <DropdownComponent 
//                         label={t('Examination')}
//                         options={examinationTypeList}
//                         value={selectedExaminationType}
//                         onChange={(val) => setSelectedExaminationType(val)} 
//                         loading={loadingExaminationTypes}
//                         placeholder="Select Examination"
//                         searchPlaceholder="Search examination..."
//                     />
//                     <DropdownComponent 
//                         label={t('Course')}
//                         options={courseList}
//                         value={selectedCourseCode}
//                         onChange={(val) => setSelectedCourseCode(val)}
//                         loading={loadingCourses}
//                         placeholder="Select Course"
//                         searchPlaceholder="Search sector..."
//                     />
//                 </div>

//                 <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
//                     <button
//                         type="button"
//                         className="bg-green-600 text-white px-6 py-2 font-bold rounded-md hover:bg-green-700 transition-colors"
//                         onClick={handleSearch}
//                     >
//                         {loadingResults ? t('courseSearch.searching') : t('courseSearch.searchCourse')}
//                     </button>
//                     <button
//                         type="button"
//                         className="bg-red-600 text-white px-6 py-2 rounded-md font-bold hover:bg-red-700 transition-colors"
//                         onClick={handleReset}
//                     >
//                         {t('courseSearch.reset')}
//                     </button>
//                 </div>
//             </fieldset>

//             <fieldset className="w-full rounded-lg border border-gray-300 bg-white p-6 shadow-lg">
//                 <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-md font-semibold text-white`}>
//                     {t('examTimeTable.examTimeTableList')} {timeTableResults.length > 0 && `(${timeTableResults.length})`}
//                 </legend>

//                 <FilteredTableComponent
//                     data={timeTableResults}
//                     columns={tableColumns}
//                     loading={loadingResults}
//                     searchable={true}
//                     sortable={true}
//                     exportable={true}
//                     showExport={true}
//                     showExcel={true}
//                     showPDF={true}
//                     exportFileName="exam_timetable_export"
//                     title={t('examTimeTable.title')}
//                     maxHeight="500px"
//                     stickyHeader={true}
//                 />
//             </fieldset>

//         </div>
//     );
// };

// export default ExamTimeTable;

import React, { useContext, useState, useEffect } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { ThemeContext } from "../Context/ThemeContext";
import { useTranslation } from 'react-i18next';
import DropdownComponent from "../formcomponent/DropdownComponent";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import { baseURL } from '../../Endpoints_All/Config/baseConfig';
import agent from '../../lib/api/agent';

const ExamTimeTable = () => {
    const { color } = useContext(ThemeContext);
    const { t } = useTranslation();

    const [selectedYear, setSelectedYear] = useState("");
    const [selectedExaminationType, setSelectedExaminationType] = useState("");
    const [selectedCourseCode, setSelectedCourseCode] = useState("");

    const [timeTableResults, setTimeTableResults] = useState([]);

    const [yearList, setYearList] = useState([]);
    const [examinationTypeList, setExaminationTypeList] = useState([]); 
    const [courseList, setCourseList] = useState([]);

    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingExaminationTypes, setLoadingExaminationTypes] = useState(false); 
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingResults, setLoadingResults] = useState(false);

    const BASE_API_URL = baseURL;

    // ✅ Helper to resolve YearId from the selected year value
    const getYearId = (yearValue) =>
        yearList.find(y => y.value === yearValue)?.yearId ?? null;

    // ✅ Exam Year — API driven
    useEffect(() => {
        const fetchYears = async () => {
            setLoadingYears(true);
            try {
                const response = await agent.get(`${BASE_API_URL}/Base/GetAdmissionYear`);
                const records = response.data?.Data ?? response.data?.data ?? [];
                setYearList(
                    records.map(item => ({
                        value: item.YearDisplayName ?? item.Year ?? item.year,
                        label: String(item.YearDisplayName ?? item.Year ?? item.year),
                        yearId: item.YearId ?? item.YearID ?? null
                    }))
                );
            } catch (error) {
                console.error("Error fetching years:", error);
                setYearList([]);
            } finally {
                setLoadingYears(false);
            }
        };
        fetchYears();
    }, [BASE_API_URL]);

    // ✅ Examination — API driven, depends on selected year
    useEffect(() => {
        const fetchExaminations = async () => {
            if (!selectedYear) {
                setExaminationTypeList([]);
                setSelectedExaminationType("");
                return;
            }
            setLoadingExaminationTypes(true);
            try {
                const response = await agent.get(`${BASE_API_URL}/Base/GetExamination`, {
                    params: { yearId: getYearId(selectedYear) }
                });
                const records = response.data?.Data ?? response.data?.data ?? [];
                setExaminationTypeList(
                    records.map(item => ({
                        value: item.ExaminationID ?? item.ExamID ?? item.ID ?? item.Id,
                        label: item.ExaminationName ?? item.ExamName ?? item.Name,
                        examinationYearId: item.ExaminationYearID ?? item.ExaminatioYearID ?? null
                    }))
                );
            } catch (error) {
                console.error("Error fetching examinations:", error);
                setExaminationTypeList([]);
            } finally {
                setLoadingExaminationTypes(false);
            }
        };
        fetchExaminations();
    }, [selectedYear, BASE_API_URL]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoadingCourses(true);
                setSelectedCourseCode(""); 
                
                const response = await agent.get(`${BASE_API_URL}/Base/GetExamTimeTableCourses`);
                const records = response.data?.Data ?? response.data?.data ?? [];
                
                const formattedData = records
                    .map((course) => {
                        // 1. Get the frontend user-facing display label
                        const name = course.CourseName ?? course.courseName ?? "";
                        
                        // 2. Get the clean identifier string for database search operations
                        const code = course.CourseCode ?? course.courseCode ?? "";

                        return {
                            // Backend tracks 'value' (CourseCode) while the UI shows 'label' (CourseName)
                            value: code ? String(code) : name, 
                            label: name || "Unknown Course", 
                        };
                    })
                    .filter(item => item.label !== "Unknown Course" && item.value !== "");

                setCourseList(formattedData);
                
            } catch (error) {
                setCourseList([]);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, [BASE_API_URL]);

    // Keys match the exact column output fields from your SQL Stored Procedure
    const tableColumns = [
        { key: "Date", header: t('examTimeTable.table.date'), width: "80px", sortable: true,},
        { key: "Timing", header: t('examTimeTable.table.timing'), width: "80px", sortable: false },
        { key: "Course Code", header: t('examTimeTable.table.courseCode'), width: "50px", sortable: false },
        { key: "Course Name", header: t('examTimeTable.table.courseName'), width: "150px", sortable: false },
        { key: "Subject Code", header: t('examTimeTable.table.subjectCode'), width: "80px", sortable: false },
        { key: "Subject Type", header: t('examTimeTable.table.subjectType') ?? "Subject Type", width: "80px", sortable: false },
        { key: "Subject", header: t('examTimeTable.table.subjectName'), width: "150px", sortable: false },
        
        
    ];
   
    const handleSearch = async () => {
        try {
            setLoadingResults(true);

            // selectedCourseCode contains only the course code value now
            // selectedExaminationType contains the ExaminationID value
            const response = await agent.get(
                `${BASE_API_URL}/Base/GetCourseSearchForExamTimeTable?courseCode=${encodeURIComponent(selectedCourseCode)}&examinationId=${encodeURIComponent(selectedExaminationType)}`
            );

            const records = response.data?.Data ?? response.data?.data ?? [];
            setTimeTableResults(records);
        } catch (error) {
            setTimeTableResults([]);
        } finally {
            setLoadingResults(false);
        }
    };

    const handleReset = () => {
        setSelectedYear("");
        setSelectedExaminationType("");
        setExaminationTypeList([]);
        setSelectedCourseCode("");
        setTimeTableResults([]);
    };

    return (
        <div className="space-y-6 w-full p-4">
            
            <fieldset className="w-full rounded-lg border border-gray-300 bg-white p-6 shadow-lg">
                <legend className={`flex ${color} items-center text-lg font-semibold text-white border-2 border-gray-300 p-2 rounded-md`}>
                    <FaClipboardList className="mr-2 text-white" />
                    {t('examTimeTable.title')}
                </legend>
                    
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DropdownComponent 
                        label={t('Exam Year')}
                        options={yearList}
                        value={selectedYear}
                        onChange={(val) => {
                            setSelectedYear(val);
                            setSelectedExaminationType("");
                            setExaminationTypeList([]);
                        }}
                        loading={loadingYears}
                        placeholder="Select Year"
                        searchPlaceholder="Search year..."
                    />
                    <DropdownComponent 
                        label={t('Examination')}
                        options={examinationTypeList}
                        value={selectedExaminationType}
                        onChange={(val) => setSelectedExaminationType(val)} 
                        loading={loadingExaminationTypes}
                        disabled={!selectedYear}
                        placeholder="Select Examination"
                        searchPlaceholder="Search examination..."
                    />
                    <DropdownComponent 
                        label={t('Course')}
                        options={courseList}
                        value={selectedCourseCode}
                        onChange={(val) => setSelectedCourseCode(val)}
                        loading={loadingCourses}
                        placeholder="Select Course"
                        searchPlaceholder="Search sector..."
                    />
                </div>

                <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                        type="button"
                        className="bg-green-600 text-white px-6 py-2 font-bold rounded-md hover:bg-green-700 transition-colors"
                        onClick={handleSearch}
                    >
                        {loadingResults ? t('courseSearch.searching') : t('courseSearch.searchCourse')}
                    </button>
                    <button
                        type="button"
                        className="bg-red-600 text-white px-6 py-2 rounded-md font-bold hover:bg-red-700 transition-colors"
                        onClick={handleReset}
                    >
                        {t('courseSearch.reset')}
                    </button>
                </div>
            </fieldset>

            <fieldset className="w-full rounded-lg border border-gray-300 bg-white p-6 shadow-lg">
                <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-md font-semibold text-white`}>
                    {t('examTimeTable.examTimeTableList')} {timeTableResults.length > 0 && `(${timeTableResults.length})`}
                </legend>

                <FilteredTableComponent
                    data={timeTableResults}
                    columns={tableColumns}
                    loading={loadingResults}
                    searchable={true}
                    sortable={true}
                    exportable={true}
                    showExport={true}
                    showExcel={true}
                    showPDF={true}
                    exportFileName="exam_timetable_export"
                    title={t('examTimeTable.title')}
                    maxHeight="500px"
                    stickyHeader={true}
                />
            </fieldset>

        </div>
    );
};

export default ExamTimeTable;