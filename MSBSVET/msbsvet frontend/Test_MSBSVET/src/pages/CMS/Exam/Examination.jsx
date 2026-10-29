import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { useTranslation } from 'react-i18next';
import DropdownComponent from "../../../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";
import UploadExcelComponent from "../../../Component/formcomponent/UploadExcelComponent";
import { useSearchParams } from 'react-router-dom';
import { FaClipboardList } from 'react-icons/fa';
import { baseURL } from "../../../Endpoints_All/config/baseConfig";
import agent from '../../../lib/api/agent';
import Swal from 'sweetalert2';
import { getDeviceIP } from '../../../utils/CommonHelper';

const ExaminationSearch = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { color } = useContext(ThemeContext);
    const BASE_API_URL = baseURL;

    // Exam Type API driven
    const [examTypeList, setExamTypeList] = useState([]);
    const [loadingExamTypes, setLoadingExamTypes] = useState(false);
    const [selectedExamType, setSelectedExamType] = useState("");

    // Exam Year API driven
    const [yearList, setYearList] = useState([]);
    const [loadingYears, setLoadingYears] = useState(false);
    const [selectedYear, setSelectedYear] = useState("");

    // Examination API driven
    const [examinationList, setExaminationList] = useState([]);
    const [loadingExaminations, setLoadingExaminations] = useState(false);
    const [selectedExamination, setSelectedExamination] = useState("");

    const [durationList, setDurationList] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState("");
    const [loadingDurations, setLoadingDurations] = useState(false);

    const [subjectTypeList, setSubjectTypeList] = useState([]);
    const [loadingSubjectTypes, setLoadingSubjectTypes] = useState(false);

    const [courseList, setCourseList] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);

    const [allCourseSubjects, setAllCourseSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    const fetchedCoursesRef = useRef(new Map());

    const [subjectDateTimeMap, setSubjectDateTimeMap] = useState({});
    const [timeTableResults, setTimeTableResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    // ✅ CHANGED: Save/update feedback is now shown as a SweetAlert2 popup
    // (matching the style used elsewhere in the app, e.g. "User Activated
    // Successfully") instead of an inline banner. showErrorAlert is used
    // for a single, specific error message at a time.
    const showSuccessAlert = (message) => {
        Swal.fire({
            icon: 'success',
            title: message,
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'OK',
        });
    };

    const showErrorAlert = (message) => {
        Swal.fire({
            icon: 'error',
            title: message,
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'OK',
        });
    };

    const [saveAttempted, setSaveAttempted] = useState(false);

    const [clientIP, setClientIP] = useState("");
    const [userLoginID, setUserLoginID] = useState("");
    const [hasExistingData, setHasExistingData] = useState(false);
    const [editingRows, setEditingRows] = useState({});

    // Now: true once the user has clicked Search for the current
    // Examination + Course selection. Nothing is auto-fetched anymore just
    // from picking Courses in the dropdown - everything below waits for
    // an explicit Search click.
    const [hasCheckedExisting, setHasCheckedExisting] = useState(false);

    const [rowSaveAttempted, setRowSaveAttempted] = useState({});

    const [formResetKey, setFormResetKey] = useState(0);

    // ✅ NEW: "Apply to all" convenience fields for the builder table
    // (current year only). Lets the person set one Date/Start Time/End
    // Time and stamp it onto every subject row at once instead of filling
    // each row individually.
    const [bulkDate, setBulkDate] = useState("");
    const [bulkStartTime, setBulkStartTime] = useState("");
    const [bulkEndTime, setBulkEndTime] = useState("");

    const currentYear = new Date().getFullYear();
    const isCurrentYear = useMemo(() => {
        if (!selectedYear) return false;
        const yearNum = parseInt(String(selectedYear).split('-')[0], 10);
        return yearNum === currentYear;
    }, [selectedYear, currentYear]);

    // ✅ NEW: Whether a given results-table row can be edited. When the Exam
    // Year filter is selected (the normal Search flow) this just mirrors
    // isCurrentYear. 
    const isRowEditable = (row) => {
        if (selectedYear) return isCurrentYear;
        const rowYearSource = row?.ExamYear ?? row?.Date;
        if (!rowYearSource) return true;
        const yearNum = parseInt(String(rowYearSource).split('-')[0], 10);
        if (Number.isNaN(yearNum)) return true;
        return yearNum === currentYear;
    };

    const toArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        return [val];
    };

    // ✅ NEW: Runs an async function over `items` in fixed-size batches
    // instead of firing every request in parallel at once. Large Excel
    // uploads (100+ rows) can span many distinct course codes/IDs, and
    // firing that many requests simultaneously (or building one giant
    // comma-separated query string) is what was causing the post-upload
    // refresh to silently fail for big uploads while small ones worked
    // fine. Used by both the marks-merge step and the post-upload refresh.
    const fetchInBatches = async (items, batchSize, fn) => {
        const results = [];
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(fn));
            results.push(...batchResults);
        }
        return results;
    };

    const forceZeroMinutes = (val) => {
        if (!val) return val;
        const [hh] = val.split(':');
        return `${hh}:00`;
    };

    // ✅ NEW: Converts a 24hr "HH:00" value into a 12hr display label with
    // AM/PM, e.g. "14:00" -> "02:00 PM".
    const formatHourLabel = (h) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        return `${String(hour12).padStart(2, '0')}:00 ${period}`;
    };

    const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => ({
        value: `${String(h).padStart(2, '0')}:00`,
        label: formatHourLabel(h)
    }));

    const isTimeAfter = (endTime, startTime) => {
        if (!startTime || !endTime) return true;
        return endTime > startTime;
    };

    const getTimeValidationError = (startTime, endTime) => {
        if (!startTime || !endTime) return null;
        if (!isTimeAfter(endTime, startTime)) {
            return "End Time must be later than Start Time.";
        }
        return null;
    };

    const getTodayDateString = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const isDateInPast = (dateStr) => {
        if (!dateStr) return false;
        return dateStr < getTodayDateString();
    };

    const getDateError = (dt) => {
        if (!dt?.date) return "Date is required.";
        if (isDateInPast(dt.date)) return "Date cannot be in the past.";
        return null;
    };

    const getStartTimeError = (dt) => (!dt?.startTime ? "Start Time is required." : null);

    const getEndTimeError = (dt) => {
        if (!dt?.endTime) return "End Time is required.";
        return getTimeValidationError(dt?.startTime, dt?.endTime);
    };

    const getRowDateError = (row) => {
        if (!row?.["Date"]) return "Date is required.";
        if (isDateInPast(row["Date"])) return "Date cannot be in the past.";
        return null;
    };

    const getRowStartTimeError = (row) => (!forceZeroMinutes(row?.["StartTiming"]) ? "Start Time is required." : null);

    const getRowEndTimeError = (row) => {
        const end = forceZeroMinutes(row?.["EndTiming"]);
        if (!end) return "End Time is required.";
        return getTimeValidationError(forceZeroMinutes(row?.["StartTiming"]), end);
    };

    const selectedCoursesString = toArray(selectedCourses).join(',');

    const getSubjectTypeIdByLabel = (label) =>
        subjectTypeList.find(s => s.label === label)?.value ?? null;

    const getCourseLabel = (code) =>
        courseList.find(c => c.value === code)?.label ?? code;

    const getCourseNameOnly = (code) => {
        const label = getCourseLabel(code);
        return label.replace(/\s*\([^)]*\)\s*$/, '').trim();
    };

    const getCourseId = (code) =>
        courseList.find(c => c.value === code)?.courseId ?? null;

    const getYearId = (yearValue) =>
        yearList.find(y => y.value === yearValue)?.yearId ?? null;

    const getExaminationYearId = (examValue) =>
        examinationList.find(e => e.value === examValue)?.examinationYearId ?? null;

    const resolveRowSubjectTypeId = (row) => {
        const directId =
            row?.SubjectTypeID ??
            row?.SubjectTypeId ??
            row?.['Subject Type Id'] ??
            row?.['SubjectTypeID'] ??
            null;

        if (directId !== null && directId !== undefined && directId !== "") {
            return directId;
        }

        return getSubjectTypeIdByLabel(row?.['Subject Type']);
    };

    const fetchSubjectsForCourse = (courseCode) =>
        agent.get(`${BASE_API_URL}/api/CMSExam/GetExaminationSubjectsName`, {
            params: { courseCode }
        }).then(response => {
            const records = response.data?.Data ?? response.data?.data ?? [];
            return records.map(item => ({
                courseCode,
                subjectCode: item['Subject Code'],
                subjectLabel: item['SUBJECT NAME'],
                subjectTypeId: item.SubjectTypeID ?? item.SubjectTypeId ?? item['Subject Type Id'] ?? null,
                subjectTypeLabel: item.SubjectTypeName ?? item['Subject Type'] ?? item['SUBJECT TYPE'] ?? "",
                subjectId: item.SubjectId ?? item.SubjectID ?? null,
            }));
        });

    // CHANGED: was an automatic useEffect keyed off selectedCoursesString,
    // so picking/unpicking a course hit the API immediately. Now it's a
    // plain async function only invoked from handleSearch (Search button).
    const syncSubjectsForCourses = async () => {
        const courses = toArray(selectedCourses);
        const fetchedMap = fetchedCoursesRef.current;

        Array.from(fetchedMap.keys()).forEach(courseCode => {
            if (!courses.includes(courseCode)) {
                fetchedMap.delete(courseCode);
            }
        });

        const coursesToFetch = courses.filter(courseCode => !fetchedMap.has(courseCode));

        if (coursesToFetch.length > 0) {
            setLoadingSubjects(true);
            try {
                const results = await Promise.all(
                    coursesToFetch.map(courseCode =>
                        fetchSubjectsForCourse(courseCode).catch(err => {
                            console.error(`Error fetching subjects for course ${courseCode}:`, err);
                            return [];
                        })
                    )
                );
                coursesToFetch.forEach((courseCode, idx) => {
                    fetchedMap.set(courseCode, results[idx]);
                });
            } finally {
                setLoadingSubjects(false);
            }
        }

        const seen = new Set();
        const combined = [];
        courses.forEach(courseCode => {
            (fetchedMap.get(courseCode) || []).forEach(item => {
                const dedupeKey = `${item.courseCode}__${item.subjectCode}__${item.subjectTypeId}`;
                if (seen.has(dedupeKey)) return;
                seen.add(dedupeKey);
                combined.push(item);
            });
        });
        setAllCourseSubjects(combined);
    };

    useEffect(() => {
        const names = allCourseSubjects.map(({ courseCode, subjectCode, subjectTypeId }) => `${courseCode}__${subjectCode}__${subjectTypeId}`);
        setSubjectDateTimeMap(prev => {
            const updated = {};
            names.forEach(key => {
                updated[key] = prev[key] ?? { date: "", startTime: "", endTime: "" };
            });
            return updated;
        });
    }, [allCourseSubjects]);

    const handleSubjectDateTimeChange = (key, field, value) => {
        setSubjectDateTimeMap(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    // ✅ NEW: Stamps the bulk Date/Start Time/End Time fields onto every row
    // currently in the builder table, in one click. Only meaningful for the
    // current year, since that's the only time the builder table renders.
    const handleApplyBulkDateTime = () => {
        setSubjectDateTimeMap(prev => {
            const updated = { ...prev };
            subjectTableRows.forEach(({ key }) => {
                updated[key] = {
                    date: bulkDate,
                    startTime: bulkStartTime,
                    endTime: bulkEndTime,
                };
            });
            return updated;
        });
    };

    const clearCoursesAndBelow = () => {
        setCourseList([]);
        setSelectedCourses([]);
        fetchedCoursesRef.current.clear();
        setAllCourseSubjects([]);
        setSubjectDateTimeMap({});
        setTimeTableResults([]);
        setHasExistingData(false);
        setHasCheckedExisting(false);
        setEditingRows({});
        setSaveAttempted(false);
        setFormResetKey(prev => prev + 1);
        setBulkDate("");
        setBulkStartTime("");
        setBulkEndTime("");
    };

    const clearDownstreamFromDuration = () => {
        setSelectedDuration("");
        clearCoursesAndBelow();
    };

    const clearDownstreamFromExamination = () => {
        setSelectedExamination("");
        setExaminationList([]);
        clearDownstreamFromDuration();
    };

    useEffect(() => {
        const fetchExamTypes = async () => {
            setLoadingExamTypes(true);
            try {
                const response = await agent.get(`${BASE_API_URL}/Base/GetExamType`);
                const records = response.data?.Data ?? response.data?.data ?? [];
                const mapped = records.map(item => ({
                    value: item.ExamTypeID,
                    label: item.ExamType
                }));
                setExamTypeList(mapped);
            } catch (error) {
                console.error("Error fetching exam types:", error);
                setExamTypeList([]);
            } finally {
                setLoadingExamTypes(false);
            }
        };
        fetchExamTypes();
    }, [BASE_API_URL]);

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
                setYearList([]);
            } finally {
                setLoadingYears(false);
            }
        };
        fetchYears();
    }, [BASE_API_URL]);

   useEffect(() => {
        const fetchExaminations = async () => {
            if (!selectedExamType || !selectedYear) {
                setExaminationList([]);
                setSelectedExamination("");
                return;
            }
            setLoadingExaminations(true);
            try {
                const response = await agent.get(`${BASE_API_URL}/api/CMSExam/GetExaminationsByYear`, {
                    params: {
                        yearId: getYearId(selectedYear),
                        examTypeId: selectedExamType
                    }
                });
                const records = response.data?.Data ?? response.data?.data ?? [];
                setExaminationList(
                    records.map(item => ({
                        value: item.ExaminationID ?? item.ExamID ?? item.ID ?? item.Id,
                        label: item.ExaminationName ?? item.ExamName ?? item.Name,
                        examinationYearId: item.ExaminationYearID ?? item.ExaminatioYearID ?? null
                    }))
                );
            } catch (error) {
                setExaminationList([]);
            } finally {
                setLoadingExaminations(false);
            }
        };
        fetchExaminations();
    }, [selectedExamType, selectedYear, BASE_API_URL]);

    useEffect(() => {
        const fetchDurations = async () => {
            setLoadingDurations(true);
            try {
                const response = await agent.get(`${BASE_API_URL}/api/CMSExam/GetExaminationDuration`);
                const records = response.data?.Data ?? response.data?.data ?? [];
                setDurationList(records.map(item => {
                    const parts = item.Duration.split(' ');
                    return {
                        value: item.Duration,
                        label: item.Duration,
                        durationValue: parts[0],
                        durationUnit: parts[1] || ""
                    };
                }));
            } catch (error) {
                // silent
            } finally {
                setLoadingDurations(false);
            }
        };
        fetchDurations();
    }, [BASE_API_URL]);

    useEffect(() => {
        const fetchCoursesByDuration = async () => {
            if (!selectedDuration) {
                setCourseList([]);
                setSelectedCourses([]);
                return;
            }
            setLoadingCourses(true);
            try {
                const response = await agent.get(`${BASE_API_URL}/api/CMSExam/GetExaminationCoursesByDuration?fullDuration=${encodeURIComponent(selectedDuration)}`);
                const records = response.data?.Data ?? response.data?.data ?? [];
                setCourseList(records.map(item => ({ value: item.CourseCode, label: item.CourseNameDisplay, courseId: item.CourseID })));
            } catch (error) {
                setCourseList([]);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCoursesByDuration();
    }, [selectedDuration, BASE_API_URL]);

    useEffect(() => {
        const fetchSubjectTypes = async () => {
            setLoadingSubjectTypes(true);
            try {
                const response = await agent.get(`${BASE_API_URL}/api/CMSExam/GetExaminationSubjectTypes`);
                const records = response.data?.Data ?? response.data?.data ?? [];
                setSubjectTypeList(records.map(item => ({ value: item.SubjectTypeID, label: item.SubjectTypeName })));
            } catch (error) {
                setSubjectTypeList([]);
            } finally {
                setLoadingSubjectTypes(false);
            }
        };
        fetchSubjectTypes();
    }, [BASE_API_URL]);

    useEffect(() => {
        const initData = async () => {
            const ip = await getDeviceIP();
            setClientIP(ip);
            try {
                const storedUserInfoAll = sessionStorage.getItem("userInfoAll");
                if (storedUserInfoAll) {
                    const parsedUserInfoAll = JSON.parse(storedUserInfoAll);
                    const loginId = parsedUserInfoAll?.UserLoginID ?? "";
                    setUserLoginID(loginId);
                } else {
                    setUserLoginID("");
                }
            } catch (err) {
                setUserLoginID("");
            }
        };
        initData();
    }, []);

    const filterableColumns = ["Course Name", "SUBJECT NAME"];

    const coursesArray = toArray(selectedCourses);

    const subjectTableRows = useMemo(() => {
        return allCourseSubjects.map(item => ({
            ...item,
            key: `${item.courseCode}__${item.subjectCode}__${item.subjectTypeId}`,
        }));
    }, [allCourseSubjects]);

    const hasTimeValidationErrors = useMemo(() => {
        return subjectTableRows.some(({ key }) => {
            const dt = subjectDateTimeMap[key];
            return !!getDateError(dt) || !!getStartTimeError(dt) || !!getEndTimeError(dt);
        });
    }, [subjectTableRows, subjectDateTimeMap]);

    // ✅ CHANGED: Now fetches marks in batches of 10 concurrent requests
    // instead of firing one request per distinct course ID all at once.
    // With small uploads this made no visible difference, but a 150-row
    // upload can easily span 30-50+ distinct courses, and firing that many
    // requests in parallel was contributing to the refresh silently
    // failing (or coming back incomplete) for large uploads. Any single
    // course's marks failing to load is still non-fatal - it's caught per
    // request below and just leaves that course's marks blank.
    const fetchAndMergeSubjectMarks = async (rows) => {
        if (!rows?.length || !isCurrentYear) return rows;

        const courseIds = [...new Set(
            rows
                .map(row => row['CourseId'] ?? row['CourseID'] ?? getCourseId(row['Course Code']))
                .filter(id => id !== null && id !== undefined && id !== "")
        )];
        if (!courseIds.length) return rows;

        try {
            const responses = await fetchInBatches(courseIds, 10, (courseId) =>
                agent.get(`${BASE_API_URL}/api/CMSExam/GetSubjectMarksByCourseId`, {
                    params: { courseId }
                })
                    .then(res => res.data?.Data ?? res.data?.data ?? [])
                    .catch(err => {
                        console.error(`Error fetching marks for course ${courseId}:`, err);
                        return [];
                    })
            );

            const marksMap = {};
            responses.flat().forEach(m => {
                const cId = m.CourseId ?? m.CourseID;
                const sId = m.SubjectId ?? m.SubjectID;
                const key = `${cId}__${sId}`;
                marksMap[key] = {
                    passingMarks: m['Passing Marks'] ?? m.PassingMarks ?? null,
                    outOfMarks: m['OutOf Marks'] ?? m.OutOfMarks ?? null,
                };
            });

            return rows.map(row => {
                const courseId = row['CourseId'] ?? row['CourseID'] ?? getCourseId(row['Course Code']);
                const subjectId = row['SubjectId'] ?? row['SubjectID'];
                const match = marksMap[`${courseId}__${subjectId}`];
                if (!match) return row;
                return {
                    ...row,
                    "Passing Marks": row["Passing Marks"] ?? match.passingMarks,
                    "OutOf Marks": row["OutOf Marks"] ?? match.outOfMarks,
                };
            });
        } catch (error) {
            console.error("Error merging subject marks:", error);
            return rows;
        }
    };

    const toggleRowEdit = (rowIndex) => {
        const row = timeTableResults[rowIndex];
        if (!isRowEditable(row)) return;
        setEditingRows(prev => ({
            ...prev,
            [rowIndex]: !prev[rowIndex]
        }));
        setRowSaveAttempted(prev => ({ ...prev, [rowIndex]: false }));
    };

    const handleTableRowChange = (rowIdOrIndex, columnKey, newValue) => {
        setTimeTableResults(prev =>
            prev.map((row, idx) =>
                idx === rowIdOrIndex
                    ? { ...row, [columnKey]: newValue }
                    : row
            )
        );
    };

    const renderEditableCell = (item, column, rowIndex) => {
        const isEditing = !!editingRows[rowIndex];

        if (column.key === "Date") {
            const dateError = getRowDateError(item);
            return isEditing ? (
                <div>
                    <input
                        type="date"
                        min={getTodayDateString()}
                        className={`w-full px-2 py-1 border rounded text-center focus:outline-none focus:ring-1 ${
                            rowSaveAttempted[rowIndex] && dateError
                                ? "border-red-400 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-500"
                        }`}
                        value={item["Date"] || ""}
                        onChange={(e) => handleTableRowChange(rowIndex, "Date", e.target.value)}
                    />
                </div>
            ) : (
                <span>{item["Date"]}</span>
            );
        }

        if (column.key === "StartTiming") {
            const startError = getRowStartTimeError(item);
            return isEditing ? (
                <div>
                    <select
                        className={`w-full px-2 py-1 border rounded text-center focus:outline-none focus:ring-1 ${
                            rowSaveAttempted[rowIndex] && startError
                                ? "border-red-400 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-500"
                        }`}
                        value={forceZeroMinutes(item["StartTiming"]) || ""}
                        onChange={(e) => handleTableRowChange(rowIndex, "StartTiming", e.target.value)}
                    >
                        <option value="">--:--</option>
                        {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                    </select>
                </div>
            ) : (
                <span>{forceZeroMinutes(item["StartTiming"])}</span>
            );
        }

        if (column.key === "EndTiming") {
            const endError = getRowEndTimeError(item);
            return isEditing ? (
                <div>
                    <select
                        className={`w-full px-2 py-1 border rounded text-center focus:outline-none focus:ring-1 ${
                            rowSaveAttempted[rowIndex] && endError ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"
                        }`}
                        value={forceZeroMinutes(item["EndTiming"]) || ""}
                        onChange={(e) => handleTableRowChange(rowIndex, "EndTiming", e.target.value)}
                    >
                        <option value="">--:--</option>
                        {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                    </select>
                </div>
            ) : (
                <span>{forceZeroMinutes(item["EndTiming"])}</span>
            );
        }

        // ✅ CHANGED: Re-enabled - editable again when the row is in edit
        // mode, same as Date/Start Time/End Time.
        if (column.key === "Passing Marks") {
            return isEditing ? (
                <input
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={item["Passing Marks"] ?? ""}
                    onChange={(e) => handleTableRowChange(rowIndex, "Passing Marks", e.target.value)}
                />
            ) : (
                <span>{item["Passing Marks"]}</span>
            );
        }

        if (column.key === "OutOf Marks") {
            return isEditing ? (
                <input
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={item["OutOf Marks"] ?? ""}
                    onChange={(e) => handleTableRowChange(rowIndex, "OutOf Marks", e.target.value)}
                />
            ) : (
                <span>{item["OutOf Marks"]}</span>
            );
        }

        if (column.key === "Actions") {
            const rowEditable = isRowEditable(item);
            return (
                <div className="flex items-center justify-center gap-2">
                    {!isEditing ? (
                        <button
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all text-white
                                ${rowEditable
                                    ? "bg-amber-500 hover:bg-amber-600 cursor-pointer"
                                    : "bg-gray-300 cursor-not-allowed opacity-50"
                                }`}
                            onClick={() => rowEditable && toggleRowEdit(rowIndex)}
                            disabled={!rowEditable}
                            title={
                                !rowEditable
                                    ? "Editing is only allowed for the current year"
                                    : "Edit this row"
                            }
                        >
                            Edit
                        </button>
                    ) : (
                        <>
                            <button
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleUpdateSingleRow(rowIndex)}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                                className="bg-gray-400 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-gray-500 transition-all"
                                onClick={() => toggleRowEdit(rowIndex)}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            );
        }

        return item[column.key];
    };

    const tableColumns = useMemo(() => {
        const baseColumns = [
            { key: "Date", header: t('examTimeTable.table.date') ?? "Date", width: "120px" },
            { key: "StartTiming", header: t('examTimeTable.table.startTiming') ?? "Start Time", width: "100px" },
            { key: "EndTiming", header: t('examTimeTable.table.endTiming') ?? "End Time", width: "100px" },
            { key: "Course Code", header: t('examTimeTable.table.courseCode') ?? "Course Code", width: "80px" },
            { key: "Course Name", header: t('examTimeTable.table.courseName') ?? "Course Name", width: "150px" },
            { key: "Subject Code", header: t('examTimeTable.table.subjectCode') ?? "Subject Code", width: "80px" },
            { key: "Subject Type", header: t('examTimeTable.table.subjectType') ?? "Subject Type", width: "80px" },
            { key: "SUBJECT NAME", header: t('examTimeTable.table.subjectName') ?? "Subject Name", width: "150px" },
        ];

        if (isCurrentYear) {
            baseColumns.push(
                { key: "Passing Marks", header: t('examTimeTable.table.passingMarks') ?? "Passing Marks", width: "150px" },
                { key: "OutOf Marks", header: t('examTimeTable.table.outOfMarks') ?? "Out of Marks", width: "150px" }
            );
        }

        baseColumns.push(
            { key: "Actions", header: "Actions", width: "150px", sortable: false, excludeFromExport: true }
        );

        return baseColumns;
    }, [isCurrentYear, t]);

    const checkExistingTimetable = async () => {
        if (!selectedExamination || !coursesArray.length) {
            setHasExistingData(false);
            setTimeTableResults([]);
            setHasCheckedExisting(true);
            return false;
        }

        setLoadingResults(true);
        try {
            const courseCodesString = coursesArray.join(',');

            const requestParams = {
                examinationId: selectedExamination,
                examinationYearId: getExaminationYearId(selectedExamination),
                courseCodes: courseCodesString,
            };

            const response = await agent.get(`${BASE_API_URL}/api/Exam/GetSavedExaminationTimeTable`, {
                params: requestParams
            });

            const apiResults = response.data?.Data?.Rows ?? response.data?.Data ?? response.data?.data ?? [];

            if (apiResults.length > 0) {
                const mergedResults = await fetchAndMergeSubjectMarks(apiResults);
                setTimeTableResults(mergedResults);
                setHasExistingData(true);
                setEditingRows({});

                setSubjectDateTimeMap(prev => {
                    const updated = { ...prev };
                    apiResults.forEach(row => {
                        const key = `${row['Course Code']}__${row['Subject Code']}__${resolveRowSubjectTypeId(row)}`;
                        updated[key] = {
                            date: row['Date'] || "",
                            startTime: forceZeroMinutes(row['StartTiming']) || "",
                            endTime: forceZeroMinutes(row['EndTiming']) || ""
                        };
                    });
                    return updated;
                });
                return true;
            } else {
                setTimeTableResults([]);
                setHasExistingData(false);
                return false;
            }
        } catch (error) {
            console.error("Error checking existing records:", error);
            setTimeTableResults([]);
            setHasExistingData(false);
            return false;
        } finally {
            setLoadingResults(false);
            setHasCheckedExisting(true);
        }
    };
    // ✅ NEW: Past years are read-only - there's no builder table to create
    // a new timetable for them. So if a past year search comes back with no
    // saved timetable at all, show a "Timetable Not Found" popup instead of
    // silently showing nothing (or the builder table, which used to appear
    // regardless of year).
    const handleSearch = async () => {
        setHasCheckedExisting(false);
        await syncSubjectsForCourses();
        const found = await checkExistingTimetable();
        if (!found && !isCurrentYear) {
            Swal.fire({
                icon: 'info',
                title: 'Timetable Not Found',
                confirmButtonColor: '#4f46e5',
                confirmButtonText: 'OK',
            });
        }
    };

    // ✅ CHANGED: All the "read the file / validate the extension / parse
    // the workbook" plumbing lives inside the reusable
    // <UploadExcelComponent /> (see below in the JSX). This function only
    // receives the already-parsed rows and owns the business logic:
    // mapping fields, validating required fields, saving via the API, and
    // refreshing the results table.
    //
    // ✅ FIX: Once the save call itself has succeeded, everything after
    // that (refetching the saved rows + merging marks) is best-effort. For
    // small uploads (5-6 rows -> usually 1-2 course codes) that refresh was
    // fine, but larger uploads (150+ rows -> often 30-50+ distinct course
    // codes) could fail to refresh - either the courseCodes query string
    // got too large, or too many marks requests fired in parallel. That
    // failure was being thrown out of this function, which
    // <UploadExcelComponent /> then caught and showed as an error popup -
    // even though the data had already been saved successfully. Now:
    //   1) The refresh step is batched (see fetchInBatches) instead of
    //      sending one huge query / firing every request at once, so it
    //      succeeds far more often even for very large uploads.
    //   2) Even if the refresh still fails for some reason, that failure is
    //      caught locally and only logged - it can never turn into an error
    //      popup for an upload that actually saved. The success message
    //      always shows once the save itself has succeeded.
    const handleTimetableUpload = async (rawRows) => {
        const entities = rawRows.map((row, idx) => ({
            RowNumber: idx + 1,
            ExamYear: row.ExamYear ?? "",
            ExaminationID: row.ExaminationID ? Number(row.ExaminationID) : null,
            ExaminationName: row.ExaminationName ?? "",
            CourseCode: row.CourseCode ?? "",
            CourseName: row.CourseName ?? "",
            SubjectName: row.SubjectName ?? "",
            SubjectCode: row.SubjectCode ?? "",
            SubjectType: row.SubjectType ?? "",
            SubjectTypeID: row.SubjectTypeID ? Number(row.SubjectTypeID) : null,
            ExaminationDate: row.ExaminationDate ?? "",
            StartTime: row.StartTime ?? "",
            EndTime: row.EndTime ?? "",
            UserLoginID: userLoginID || "",   // ✅ satisfies validation; controller still resolves the real value itself
            IPAddress: clientIP || "",
        }));

        // Basic required-field validation before it ever reaches the API -
        // surface the first specific problem found rather than letting the
        // save fail generically. This still throws normally, since nothing
        // has been saved yet at this point.
        const rowNumberOffset = 2; // header is row 1, data starts at row 2
        const invalidIndex = entities.findIndex(en =>
            !en.CourseCode || !en.SubjectCode || !en.ExaminationDate || !en.StartTime || !en.EndTime
        );
        if (invalidIndex !== -1) {
            throw new Error(`Row ${invalidIndex + rowNumberOffset}: Course Code, Subject Code, Examination Date, Start Time and End Time are all required.`);
        }

        // Save via the exact same JSON endpoint the manual builder table
        // already uses. This is the actual save - if this fails, it's a
        // real error and should surface as one.
        const saveResponse = await agent.post(
            `${BASE_API_URL}/api/CMSExam/upload-examination-timetable`,
            entities   // ✅ raw array
        );

        const saveResultText = saveResponse.data?.Data ?? saveResponse.data?.data ?? "";
        const isSuccess = !saveResultText || saveResultText.toString().toUpperCase() !== "N";

        if (!isSuccess) {
            throw new Error(saveResultText || "Upload failed. Please try again.");
        }

        // ✅ From here on the save has already succeeded. Refreshing the
        // results table is best-effort - any failure here is only logged,
        // never thrown, so it can't turn into an error popup for an upload
        // that actually worked.
        try {
            const examinationIdFromFile = entities[0]?.ExaminationID;
            const examinationYearIdFromFile = entities[0]?.ExaminationYearID;
            const uniqueCourseCodes = [...new Set(entities.map(en => en.CourseCode))];

            // Batch course codes into smaller groups so the query string
            // can't grow unbounded with large uploads.
            const COURSE_CODE_CHUNK_SIZE = 25;
            const courseCodeChunks = [];
            for (let i = 0; i < uniqueCourseCodes.length; i += COURSE_CODE_CHUNK_SIZE) {
                courseCodeChunks.push(uniqueCourseCodes.slice(i, i + COURSE_CODE_CHUNK_SIZE));
            }

            const chunkResults = await fetchInBatches(courseCodeChunks, 5, (chunk) =>
                agent.get(`${BASE_API_URL}/api/Exam/GetSavedExaminationTimeTable`, {
                    params: {
                        examinationId: examinationIdFromFile,
                        examinationYearId: examinationYearIdFromFile,
                        courseCodes: chunk.join(','),
                    }
                })
                    .then(res => res.data?.Data?.Rows ?? res.data?.Data ?? res.data?.data ?? [])
                    .catch(err => {
                        console.error("Error refreshing a chunk of the uploaded timetable:", err);
                        return [];
                    })
            );

            const savedRows = chunkResults.flat();
            const mergedResults = await fetchAndMergeSubjectMarks(savedRows);

            setTimeTableResults(mergedResults);
            setHasExistingData(true);
            setAllCourseSubjects([]);
            setEditingRows({});
        } catch (refreshError) {
            // The upload itself already succeeded - only the post-save
            // refresh failed. Log it for diagnostics, but don't let it
            // block the success message below.
            console.error("Timetable uploaded successfully, but refreshing the results table failed:", refreshError);
        } finally {
            setHasCheckedExisting(true);
        }

        showSuccessAlert("Timetable uploaded successfully!");
    };

    const handleSaveTimetable = async () => {
        if (subjectTableRows.length === 0) {
            console.warn("No subjects selected to save.");
            return;
        }

        setSaveAttempted(true);
        const invalidRow = subjectTableRows.find(({ key }) => {
            const dt = subjectDateTimeMap[key];
            return !!getDateError(dt) || !!getStartTimeError(dt) || !!getEndTimeError(dt);
        });
        if (invalidRow) {
            const invalidDt = subjectDateTimeMap[invalidRow.key];
            const specificError = getDateError(invalidDt) || getStartTimeError(invalidDt) || getEndTimeError(invalidDt);
            showErrorAlert(`${invalidRow.subjectLabel}: ${specificError}`);
            return;
        }

        const selectedDurationObj = durationList.find(d => d.value === selectedDuration);
        setIsSaving(true);
        setLoadingResults(true);

        try {
            const payload = subjectTableRows.map(({ courseCode, subjectCode, subjectLabel, subjectTypeId, subjectTypeLabel, subjectId, key }) => {
                const dt = subjectDateTimeMap[key];
                return {
                    YearId: getYearId(selectedYear),
                    ExamYear: selectedYear,
                    ExaminationID: selectedExamination,
                    ExaminationYearID: getExaminationYearId(selectedExamination),
                    ExaminationName: examinationList.find(e => e.value === selectedExamination)?.label ?? "",
                    Duration: selectedDurationObj?.durationValue ?? "",
                    DurationUnit: selectedDurationObj?.durationUnit ?? "",
                    CourseID: getCourseId(courseCode),
                    CourseCode: courseCode,
                    CourseName: getCourseNameOnly(courseCode),
                    SubjectId: subjectId ?? null,
                    SubjectCode: subjectCode,
                    SubjectName: subjectLabel,
                    SubjectType: subjectTypeLabel,
                    SubjectTypeID: subjectTypeId,
                    ExaminationDate: dt?.date || null,
                    StartTime: dt?.startTime || null,
                    EndTime: dt?.endTime || null,
                    UserLoginID: userLoginID,
                    IPAddress: clientIP,
                };
            });

            const saveResponse = await agent.post(
                `${BASE_API_URL}/api/Exam/save-examination-timetable`,
                payload
            );

            const saveResultText = saveResponse.data?.Data ?? saveResponse.data?.data ?? "";
            const isSuccess = !saveResultText || saveResultText.toString().toUpperCase() !== "N";

            if (!isSuccess) {
                console.error("Save failed:", saveResultText);
                showErrorAlert(saveResultText || "Save failed. Please try again.");
                return;
            }

            const courseCodesString = selectedCourses.join(',');

            const response = await agent.get(`${BASE_API_URL}/api/Exam/GetSavedExaminationTimeTable`, {
                params: {
                    examinationId: selectedExamination,
                    examinationYearId: getExaminationYearId(selectedExamination),
                    courseCodes: courseCodesString,
                }
            });

            const apiResults = response.data?.Data?.Rows ?? response.data?.Data ?? response.data?.data ?? [];

            const mergedResults = await fetchAndMergeSubjectMarks(apiResults);
            setTimeTableResults(mergedResults);
            setHasExistingData(true);
            setEditingRows({});
            showSuccessAlert("Timetable saved and refreshed successfully!");

        } catch (error) {
            console.error("Save/Search failed:", error);
            showErrorAlert("An error occurred while saving. Please try again.");
        } finally {
            setIsSaving(false);
            setLoadingResults(false);
        }
    };

    const handleUpdateSingleRow = async (rowIndex) => {
        const row = timeTableResults[rowIndex];
        if (!row || !isRowEditable(row)) return;

        setRowSaveAttempted(prev => ({ ...prev, [rowIndex]: true }));
        const rowDateError = getRowDateError(row);
        const rowStartError = getRowStartTimeError(row);
        const rowEndError = getRowEndTimeError(row);
        if (rowDateError || rowStartError || rowEndError) {
            showErrorAlert(rowDateError || rowStartError || rowEndError);
            return;
        }

        setIsSaving(true);
        try {
            const selectedDurationObj = durationList.find(d => d.value === selectedDuration);
            const resolvedSubjectTypeId = resolveRowSubjectTypeId(row);

            const timetablePayload = [{
                
                YearId: row['YearId'] ?? getYearId(selectedYear),
                ExamYear: row['ExamYear'] ?? selectedYear,
                ExaminationID: row['ExaminationID'] ?? row['ExamID'] ?? selectedExamination,
                ExaminationYearID: row['ExaminationYearID'] ?? getExaminationYearId(selectedExamination),
                ExaminationName: row['ExaminationName'] ?? examinationList.find(e => e.value === selectedExamination)?.label ?? "",
                Duration: row['Duration'] ?? selectedDurationObj?.durationValue ?? "",
                DurationUnit: row['DurationUnit'] ?? selectedDurationObj?.durationUnit ?? "",
                CourseID: row['CourseId'] ?? row['CourseID'] ?? getCourseId(row['Course Code']),
                CourseCode: row['Course Code'],
                CourseName: row['Course Name'],
                SubjectId: row['SubjectId'] ?? null,
                SubjectCode: row['Subject Code'],
                SubjectName: row['SUBJECT NAME'],
                SubjectType: row['Subject Type'],
                SubjectTypeID: resolvedSubjectTypeId,
                // ✅ Editable fields: Date, Start Time, End Time, and (again)
                // Passing Marks / OutOf Marks.
                ExaminationDate: row['Date'] || null,
                StartTime: row['StartTiming'] || null,
                EndTime: row['EndTiming'] || null,
                PassingMarks: row['Passing Marks'] ?? null,
                OutOfMarks: row['OutOf Marks'] ?? null,
                UserLoginID: userLoginID,
                IPAddress: clientIP,
            }];

            // ✅ Marks live in a separate table/SP from the timetable itself,
            // so saving an edited row fires both calls together.
            const marksPayload = [{
                SubjectId: row['SubjectId'] ?? null,
                CourseId: row['CourseId'] ?? row['CourseID'] ?? getCourseId(row['Course Code']),
                SubjectTypeId: resolvedSubjectTypeId,
                PassingMarks: row['Passing Marks'] ?? null,
                OutOfMarks: row['OutOf Marks'] ?? null,
                UserLoginID: userLoginID,
                IPAddress: clientIP,
            }];

            const [saveTimetableResponse, saveMarksResponse] = await Promise.all([
                agent.post(`${BASE_API_URL}/api/Exam/save-examination-timetable`, timetablePayload),
                agent.post(`${BASE_API_URL}/api/CMSExam/save-subject-course-marks`, marksPayload),
            ]);

            const timetableResultText = saveTimetableResponse.data?.Data ?? saveTimetableResponse.data?.data ?? "";
            const marksResultText = saveMarksResponse.data?.Data ?? saveMarksResponse.data?.data ?? "";

            const isTimetableSuccess = !timetableResultText || timetableResultText.toString().toUpperCase() !== "N";
            // ✅ Marks SP returns "Updated" on success, descriptive text otherwise - not a Y/N flag.
            const isMarksSuccess = marksResultText?.toString().toLowerCase() === "updated";

            if (isTimetableSuccess && isMarksSuccess) {
                showSuccessAlert("Timetable updated successfully!");
                setEditingRows(prev => ({ ...prev, [rowIndex]: false }));
            } else {
                const errorParts = [];
                if (!isTimetableSuccess) errorParts.push(timetableResultText || "Timetable update failed.");
                if (!isMarksSuccess) errorParts.push(marksResultText || "Marks update failed.");
                showErrorAlert(errorParts.join(" | "));
            }
        } catch (error) {
            console.error("Row update failed:", error);
            showErrorAlert("An error occurred while updating.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setSelectedExamType("");
        setSelectedYear("");
        setSelectedExamination("");
        setExaminationList([]);
        setSelectedDuration("");
        setSelectedCourses([]);
        fetchedCoursesRef.current.clear();
        setAllCourseSubjects([]);
        setTimeTableResults([]);
        setSubjectDateTimeMap({});
        setHasExistingData(false);
        setHasCheckedExisting(false);
        setEditingRows({});
        setSearchParams({});
        setSaveAttempted(false);
        setFormResetKey(prev => prev + 1);
        setBulkDate("");
        setBulkStartTime("");
        setBulkEndTime("");
    };

    return (
        <div className="space-y-6 p-6 sm:p-8">
            <fieldset className="rounded border border-gray-300 p-6 sm:p-8 bg-white shadow-sm">
                <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
                    <div className="flex items-center gap-2">
                        <FaClipboardList className="w-5 h-5" />
                        {t('examSearch.title', 'Examination Search')}
                    </div>
                </legend>

                {/* ✅ CHANGED: Upload Timetable now uses the reusable
                    <UploadExcelComponent />. A "View Sample" button sits
                    next to it - it just downloads a small .xlsx with the
                    expected header row and one filled-in example row, so
                    the person can see the exact column names/format
                    before uploading. It's purely informational and never
                    goes through handleTimetableUpload. */}
                <div className="flex justify-end mb-4">
                    <UploadExcelComponent
                        buttonLabel={t("examSearch.uploadTimetable")}
                        uploadingLabel={t("examSearch.uploading")}
                        onUpload={handleTimetableUpload}
                        onError={showErrorAlert}
                        sampleButtonLabel={t("examSearch.viewSample", "View Sample")}
                        sampleFileName="examination_timetable_sample.xlsx"
                        sampleColumns={[
                            "ExamYear",
                            "ExaminationID",
                            "ExaminationName",
                            "CourseCode",
                            "CourseName",
                            "SubjectName",
                            "SubjectCode",
                            "SubjectType",
                            "SubjectTypeID",
                            "ExaminationDate",
                            "StartTime",
                            "EndTime",
                        ]}
                        sampleRows={[{
                            ExamYear: "2026",
                            ExaminationID: 101,
                            ExaminationName: "Summer Examination 2026",
                            CourseCode: "BCA101",
                            CourseName: "Bachelor of Computer Applications",
                            SubjectName: "Data Structures",
                            SubjectCode: "DS101",
                            SubjectType: "Theory",
                            SubjectTypeID: 1,
                            ExaminationDate: "2026-09-15",
                            StartTime: "10:00",
                            EndTime: "13:00",
                        }]}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 items-end">

                    <DropdownComponent
                        label={t('examSearch.filters.examType', 'Exam Type')}
                        options={examTypeList}
                        value={selectedExamType}
                        loading={loadingExamTypes}
                        onChange={(val) => {
                            setSelectedExamType(val);
                            setSelectedYear("");
                            clearDownstreamFromExamination();
                        }}
                    />

                    <DropdownComponent
                        label={t('examSearch.filters.examYear', 'Exam Year')}
                        options={yearList}
                        value={selectedYear}
                        loading={loadingYears}
                        onChange={(val) => {
                            setSelectedYear(val);
                            clearDownstreamFromExamination();
                        }}
                    />

                    <DropdownComponent
                        label={t('examSearch.filters.examination', 'Examination')}
                        options={examinationList}
                        value={selectedExamination}
                        onChange={(val) => {
                            setSelectedExamination(val);
                            clearDownstreamFromDuration();
                        }}
                        disabled={!selectedYear}
                        loading={loadingExaminations}
                    />

                    <DropdownComponent
                        label={t('examSearch.filters.duration', 'Duration')}
                        options={durationList}
                        value={selectedDuration}
                        onChange={(val) => {
                            setSelectedDuration(val);
                            clearCoursesAndBelow();
                        }}
                        loading={loadingDurations}
                    />

                    {/* Courses: selecting/deselecting only updates the
                        selection now - it no longer auto-fetches subjects
                        or auto-checks for an existing timetable. Click
                        Search below to run both. */}
                    <DropdownComponent
                        key={`courses-${formResetKey}`}
                        label={t('examSearch.filters.courses', 'Courses')}
                        options={courseList}
                        value={selectedCourses}
                        onChange={(val) => {
                            setSelectedCourses(toArray(val));
                            setAllCourseSubjects([]);
                            setTimeTableResults([]);
                            setHasExistingData(false);
                            setHasCheckedExisting(false);
                            setEditingRows({});
                            setSaveAttempted(false);
                            setBulkDate("");
                            setBulkStartTime("");
                            setBulkEndTime("");
                        }}
                        isMulti={true}
                        loading={loadingCourses}
                        disabled={!selectedDuration}
                    />
                </div>

                {selectedYear && !isCurrentYear && (
                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-800 text-sm font-medium">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        You are viewing a past year ({selectedYear}). Records are read-only and cannot be edited.
                    </div>
                )}

                {/* Before a search has been run for the current
                    Examination + Course selection, show neither table -
                    click Search to fetch subjects and check for an
                    existing saved timetable. */}
                {(loadingResults || loadingSubjects) && !hasCheckedExisting && (
                    <div className="mt-4 text-sm text-gray-500">Searching…</div>
                )}

                {hasCheckedExisting && subjectTableRows.length > 0 && !hasExistingData && isCurrentYear && (
                    <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
                        <div className={`${color} px-6 py-3 text-white text-sm font-bold flex items-center justify-between`}>
                            <span>{t("examSearch.setDateTimePerSubject")}</span>
                            <span className="text-xs font-normal opacity-80">
                                {coursesArray.length} {t("examSearch.courseCount")} ·{" "}
                                {subjectTableRows.length} {t("examSearch.subjectRowCount")}{" "}
                                {t("examSearch.allSubjectTypes")}
                            </span>
                        </div>

                        {/* ✅ NEW: Apply the same Date/Start Time/End Time to
                            every subject row in one click, instead of filling
                            each row individually. Only shown for the current
                            year, since that's the only time this builder
                            table renders. */}
                        <div className="px-4 sm:px-6 pt-4 pb-2 bg-gray-50 border-b border-gray-200">
                            <div className="flex flex-wrap items-end gap-3">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mr-1">
                                    {t("examSearch.applyToAllRows")}
                                </span>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 mb-1">{t("examSearch.date")}</label>
                                    <input
                                        type="date"
                                        min={getTodayDateString()}
                                        className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={bulkDate}
                                        onChange={(e) => setBulkDate(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 mb-1">{t("examSearch.startTime")}</label>
                                    <select
                                        className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={bulkStartTime}
                                        onChange={(e) => setBulkStartTime(e.target.value)}
                                    >
                                        <option value="">{t("examSearch.selectTime")}</option>
                                        {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 mb-1">{t("examSearch.endTime")}</label>
                                    <select
                                        className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={bulkEndTime}
                                        onChange={(e) => setBulkEndTime(e.target.value)}
                                    >
                                        <option value="">{t("examSearch.selectTime")}</option>
                                        {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleApplyBulkDateTime}
                                    disabled={!bulkDate && !bulkStartTime && !bulkEndTime}
                                >
                                    {t("examSearch.applyToAll")}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto p-4 sm:p-6">
                            <table className="w-full text-sm border-separate border-spacing-0 table-fixed">
                                <colgroup>
                                    <col className="w-[9%]" />
                                    <col className="w-[19%]" />
                                    <col className="w-[9%]" />
                                    <col className="w-[19%]" />
                                    <col className="w-[9%]" />
                                    <col className="w-[13%]" />
                                    <col className="w-[11%]" />
                                    <col className="w-[11%]" />
                                </colgroup>
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">{t("examSearch.courseCode")}</th>
                                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">{t("examSearch.courseName")}</th>
                                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">{t("examSearch.subjectCode")}</th>
                                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">{t("examSearch.subjectName")}</th>
                                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">{t("examSearch.subjectType")}</th>
                                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">
                                            {t("examSearch.date")} <span className="text-red-500">*</span>
                                        </th>
                                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">
                                            {t("examSearch.startTime")} <span className="text-red-600">*</span>
                                        </th>
                                        <th className="text-left px-3 py-2.5 font-semibold text-gray-600">
                                            {t("examSearch.endTime")} <span className="text-red-600">*</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjectTableRows.map(({ courseCode, subjectCode, subjectLabel, subjectTypeLabel, key }, index) => (
                                        <tr key={key} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                            <td className="px-3 py-2.5 text-gray-600">{courseCode}</td>
                                            <td className="px-3 py-2.5 font-medium text-gray-700">
                                                {getCourseLabel(courseCode)}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600">{subjectCode}</td>
                                            <td className="px-3 py-2.5 font-medium text-gray-700">
                                                {subjectLabel}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 font-medium">
                                                {subjectTypeLabel || "—"}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                {isCurrentYear ? (
                                                    <>
                                                        <input
                                                            type="date"
                                                            min={getTodayDateString()}
                                                            className={`border rounded p-2 text-sm focus:ring-2 outline-none w-full ${
                                                                saveAttempted && getDateError(subjectDateTimeMap[key])
                                                                    ? "border-red-400 focus:ring-red-400"
                                                                    : "border-gray-300 focus:ring-blue-500"
                                                            }`}
                                                            value={subjectDateTimeMap[key]?.date || ""}
                                                            onChange={(e) => handleSubjectDateTimeChange(key, 'date', e.target.value)}
                                                        />
                                                    </>
                                                ) : (
                                                    <span className="text-gray-500">{subjectDateTimeMap[key]?.date || "—"}</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                {isCurrentYear ? (
                                                    <>
                                                        <select
                                                            className={`border rounded p-2 text-sm focus:ring-2 outline-none w-full ${
                                                                saveAttempted && getStartTimeError(subjectDateTimeMap[key])
                                                                    ? "border-red-400 focus:ring-red-400"
                                                                    : "border-gray-300 focus:ring-blue-500"
                                                            }`}
                                                            value={forceZeroMinutes(subjectDateTimeMap[key]?.startTime) || ""}
                                                            onChange={(e) => handleSubjectDateTimeChange(key, 'startTime', e.target.value)}
                                                        >
                                                            <option value="">{t("examSearch.selectTime")}</option>
                                                            {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                                                        </select>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-500">{forceZeroMinutes(subjectDateTimeMap[key]?.startTime) || "—"}</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                {isCurrentYear ? (
                                                    <>
                                                        <select
                                                            className={`border rounded p-2 text-sm focus:ring-2 outline-none w-full ${
                                                                saveAttempted && getEndTimeError(subjectDateTimeMap[key])
                                                                    ? "border-red-400 focus:ring-red-400"
                                                                    : "border-gray-300 focus:ring-blue-500"
                                                            }`}
                                                            value={forceZeroMinutes(subjectDateTimeMap[key]?.endTime) || ""}
                                                            onChange={(e) => handleSubjectDateTimeChange(key, 'endTime', e.target.value)}
                                                        >
                                                            <option value="">{t("examSearch.selectTime")}</option>
                                                            {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                                                        </select>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-500">{forceZeroMinutes(subjectDateTimeMap[key]?.endTime) || "—"}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex items-center gap-4 border-t pt-6">
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSearch}
                        disabled={
                            loadingResults ||
                            loadingSubjects ||
                            !selectedExamination ||
                            !coursesArray.length
                        }
                    >
                        {loadingResults || loadingSubjects
                            ? t("examSearch.searching")
                            : t("examSearch.search")}
                    </button>

                    {hasCheckedExisting && !hasExistingData && isCurrentYear && (
                        <button
                            className="bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSaveTimetable}
                            disabled={isSaving || subjectTableRows.length === 0}
                        >
                            {isSaving
                                ? t("examSearch.saving")
                                : t("examSearch.save")}
                        </button>
                    )}

                    <button
                        className="bg-red-600 text-white px-6 py-2 rounded-md font-bold hover:bg-red-700 transition-all"
                        onClick={handleReset}
                    >
                        {t("examSearch.reset")}
                    </button>
                </div>
            </fieldset>

            <fieldset className="rounded border border-gray-300 p-6 sm:p-8 bg-white">
                <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
                    {t("examSearch.examinationTimetable")}
                    {timeTableResults.length > 0 && ` (${timeTableResults.length})`}
                </legend>
                <FilteredTableComponent
                    data={timeTableResults}
                    columns={tableColumns}
                    loading={loadingResults}
                    filterColumns={filterableColumns}
                    searchable={true}
                    sortable={true}
                    exportable={true}
                    showExport={true}
                    showExcel={true}
                    showPDF={true}
                    exportFileName="examination_schedule_results"
                    title={t('examSearch.listTitle', 'Examination Timetable')}
                    maxHeight="500px"
                    stickyHeader={true}
                    emptyStateMessage={t('examSearch.noExamsFound', 'No examination schedules found')}
                    emptyStateSubMessage={t('examSearch.adjustCriteria', 'Please check alternatives or modify selection fields.')}
                    renderCell={renderEditableCell}
                />
            </fieldset>
        </div>
    );
};

export default ExaminationSearch;