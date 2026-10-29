import React, { useState, useEffect, useContext } from 'react';
import { GetInstituteIDByInstituteCode, batchesforelectivesubjectassign, candidateforelectivesubjectassign, GetElectiveSubjects, SaveElectiveSubjects } from '../../../Endpoints_All/Examination/Exam';
import agent from '../../../lib/api/agent';
import FilteredTableComponent from '../../formcomponent/FilteredTableComponent';
import { ThemeContext } from "../../Context/ThemeContext";

import { SwalHelper } from "../../../utils/swalHelper";
import { Search } from "lucide-react";
import { useAuth } from '../../../Hooks/AuthContext';
const ElectiveSubjectAssign = () => {
    const { userInfo } = useAuth();
    const user = userInfo;

    const [batches, setBatches] = useState([]);
    const [filteredBatches, setFilteredBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const { color } = useContext(ThemeContext);
    const [popupData, setPopupData] = useState(null);
    const [popupLoading, setPopupLoading] = useState(false);

    const [headerData, setHeaderData] = useState(null);
    const [candidateList, setCandidateList] = useState([]);

    const [elective1Options, setElective1Options] = useState([]);
    const [elective2Options, setElective2Options] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);
    const [searchMap, setSearchMap] = useState({});
    useEffect(() => {
        fetchBatches();
        loadDropdowns();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredBatches(batches);
        } else {
            const filtered = batches.filter(batch =>
                (batch.BatchID || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (batch.CourseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (batch.ExamType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (batch.BatchStatusName || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredBatches(filtered);
        }
    }, [searchTerm, batches]);


    const handleChange = (index, key, value) => {
        const updated = [...candidateList];
        updated[index][key] = value;
        setCandidateList(updated);
    };


    const fetchBatchDetails = async (batchId) => {
        try {
            setPopupLoading(true);

            const response = await agent.get(
                `${candidateforelectivesubjectassign}?batchId=${batchId}`
            );


            const data = response.data;
            if (data.Status === "Success" && data.Data?.Table?.length > 0) {
                setHeaderData(data.Data.Table[0]);

                const candidates = data.Data.Table1.map(c => ({
                    ...c,
                    elective1: String(c.Elective1 || "-1"),
                    elective2: String(c.Elective2 || "-1"),
                    secondYear: String(c.DirectSecondYear || "N")
                }));

                setCandidateList(candidates);
            } else {
                setPopupData(null);
            }

        } catch (err) {
            SwalHelper.error("Error", "Failed to load batch details");
            setPopupData(null);

        } finally {
            setPopupLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            setLoading(true);
            setError(null);
            const userLoginID = user?.UserLoginID;


            if (!userLoginID) {
                throw new Error("User login ID not found");
            }


            const instituteResponse = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${userLoginID}`
            );
            const instituteData = instituteResponse.data;

            if (instituteData.Status !== "Success" || !instituteData.Data) {
                throw new Error(instituteData.Message || "Failed to retrieve Institute ID");
            }

            const instituteId = instituteData.Data;


            const batchesResponse = await agent.get(
                `${batchesforelectivesubjectassign}?instituteId=${instituteId}`
            );

            const batchesData = batchesResponse.data;

            if (batchesData.Status === "Success" && Array.isArray(batchesData.Data)) {
                setBatches(batchesData.Data);
                setFilteredBatches(batchesData.Data);
            } else {
                setBatches([]);
                setFilteredBatches([]);
            }

        } catch (err) {
            setError(err.message);
            setBatches([]);
            setFilteredBatches([]);
        } finally {
            setLoading(false);
        }
    };


    const loadDropdowns = async () => {
        try {
            const res = await agent.get(GetElectiveSubjects);
            const data = res.data.Data;

            const group1 = data
                .filter(x => x.Group === "1")
                .map(x => ({ label: x.Text, value: String(x.Value) }));

            const group2 = data
                .filter(x => x.Group === "2")
                .map(x => ({ label: x.Text, value: String(x.Value) }));

            setElective1Options([{ label: "Please select", value: "-1" }, ...group1]);
            setElective2Options([{ label: "Please select", value: "-1" }, ...group2]);

        } catch (err) {
        }
    };

    const handleSave = async () => {

        let xml = "<ElectiveSubjectList>";

        candidateList.forEach(c => {

            const courseId = c.CourseID;
            const batchId = headerData?.BatchID;
            const dsdYear = c.secondYear || "N";

            if (c.elective1 !== "-1") {
                xml += `
                <ElectiveSubject>
                    <ApplicationID>${c.ApplicationID}</ApplicationID>
                    <CourseID>${courseId}</CourseID>
                    <BatchID>${batchId}</BatchID>
                    <GroupID>1</GroupID>
                    <SubjectType>Practical</SubjectType>
                    <Subject>${c.elective1}</Subject>
                    <DSDYear>${dsdYear}</DSDYear>
                </ElectiveSubject>
                <ElectiveSubject>
                    <ApplicationID>${c.ApplicationID}</ApplicationID>
                    <CourseID>${courseId}</CourseID>
                    <BatchID>${batchId}</BatchID>
                    <GroupID>1</GroupID>
                    <SubjectType>Theory</SubjectType>
                    <Subject>${c.elective1}</Subject>
                    <DSDYear>${dsdYear}</DSDYear>
                </ElectiveSubject>
            `;
            }

            if (c.elective2 !== "-1") {
                xml += `
                <ElectiveSubject>
                    <ApplicationID>${c.ApplicationID}</ApplicationID>
                    <CourseID>${courseId}</CourseID>
                    <BatchID>${batchId}</BatchID>
                    <GroupID>2</GroupID>
                    <SubjectType>Practical</SubjectType>
                    <Subject>${c.elective2}</Subject>
                    <DSDYear>${dsdYear}</DSDYear>
                </ElectiveSubject>
                <ElectiveSubject>
                    <ApplicationID>${c.ApplicationID}</ApplicationID>
                    <CourseID>${courseId}</CourseID>
                    <BatchID>${batchId}</BatchID>
                    <GroupID>2</GroupID>
                    <SubjectType>Theory</SubjectType>
                    <Subject>${c.elective2}</Subject>
                    <DSDYear>${dsdYear}</DSDYear>
                </ElectiveSubject>
            `;
            }

        });

        xml += "</ElectiveSubjectList>";

        if (xml === "<ElectiveSubjectList></ElectiveSubjectList>") {
            SwalHelper.warning("Validation", "Please select at least one subject");
            return;
        }

        const confirm = await SwalHelper.confirm({
            title: "Are you sure?",
            text: "Do you want to save elective subjects?",
            confirmText: "Yes, Save",
            cancelText: "Cancel"
        });

        if (!confirm.isConfirmed) return;

        try {
            SwalHelper.loading("Saving...", "Please wait");

            await agent.post(
                `${SaveElectiveSubjects}?BatchID=${headerData.BatchID}`,
                xml,
                {
                    headers: {
                        "Content-Type": "application/xml"
                    }
                }
            );

            SwalHelper.success(
                "Success",
                `Elective 1 Saved: ${elective1Count}/${totalCandidates}, Elective 2 Saved: ${elective2Count}/${totalCandidates}`
            );

            setShowModal(false);

        } catch (err) {
            SwalHelper.error("Error", err?.response?.data || "Something went wrong");
        }
    };
    const candidateColumns = [
        { key: "srNo", header: "Sr. No." },
        { key: "ApplicationIDDisplay", header: "Application ID" },
        { key: "CandidateName", header: "Candidate Name" },
        { key: "CandidateStatus", header: "Status" },
        { key: "elective1", header: "Elective 1" },
        { key: "elective2", header: "Elective 2" },
        { key: "secondYear", header: "Direct 2nd Year" }
    ];

    const columns = [
        { key: 'srNo', header: 'Sr. No.' },
        { key: 'BatchID', header: 'Batch ID' },
        { key: 'CourseName', header: 'Course Name' },
        { key: 'ExamType', header: 'Exam Type' },
        { key: 'BatchStartDate', header: 'Start Date' },
        { key: 'BatchEndDate', header: 'End Date' },
        { key: 'Admitted', header: 'Admitted' },
        { key: 'Approved', header: 'Approved' },
        { key: 'Examinee', header: 'Examinee' },
        { key: 'BatchStatusName', header: 'Status' }
    ];

    const renderCell = (item, column) => {
        if (column.key === 'BatchID') {
            const raw = item.BatchID || '';

            const idMatch = raw.match(/>(.*?)</);
            const batchId = idMatch ? idMatch[1] : raw;

            return (
                <button
                    onClick={() => {
                        setShowModal(true);
                        fetchBatchDetails(batchId);
                    }}
                    className="bg-cyan-500 text-white px-2 py-1 rounded text-xs"
                >
                    {batchId}
                </button>
            );
        }

        return undefined;
    };




    const renderCandidateCell = (item, column, index) => {

        const handleChange = (key, value) => {
            setCandidateList(prev => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    [key]: value
                };
                return updated;
            });
            setOpenIndex(null);
        };

        const keyId = `${column.key}-${index}`;
        const isOpen = openIndex === keyId;
        const searchTerm = searchMap[keyId] || "";

        const getOptions = () => {
            if (column.key === "elective1") return elective1Options;
            if (column.key === "elective2") return elective2Options;
            if (column.key === "secondYear") {
                return [
                    { label: "Select", value: "-1" },
                    { label: "Yes", value: "Y" },
                    { label: "No", value: "N" }
                ];
            }
            return [];
        };

        const options = getOptions();
        const selected = options.find(o => o.value === item[column.key]);

        const filtered = options.filter(o =>
            o.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (["elective1", "elective2", "secondYear"].includes(column.key)) {
            return (
                <div className="min-w-[180px] max-w-[220px]">


                    <div
                        onClick={() => setOpenIndex(isOpen ? null : keyId)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md bg-white text-sm cursor-pointer"
                    >
                        {selected?.label || "Select"}
                    </div>

                    {isOpen && (
                        <div className="mt-1 border border-gray-300 rounded-md bg-white shadow-sm max-h-48 overflow-y-auto">


                            <div className="p-2 border-b flex items-center">
                                <Search className="h-4 w-4 text-gray-400 mr-2" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchMap(prev => ({
                                            ...prev,
                                            [keyId]: e.target.value
                                        }))
                                    }
                                    className="w-full text-sm outline-none"
                                    placeholder="Search..."
                                />
                            </div>


                            {filtered.map((opt, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleChange(column.key, opt.value)}
                                    className={`p-2 text-sm cursor-pointer hover:bg-gray-100 ${opt.value === item[column.key]
                                        ? "bg-blue-50 text-blue-600"
                                        : ""
                                        }`}
                                >
                                    {opt.label}
                                </div>
                            ))}

                            {filtered.length === 0 && (
                                <div className="p-2 text-center text-gray-500 text-sm">
                                    No results found
                                </div>
                            )}
                        </div>
                    )}

                </div>
            );
        }

        return undefined;
    };
    const tableData = filteredBatches.map((item, index) => ({
        ...item,
        srNo: index + 1
    }));

    const totalCandidates = candidateList.length;

    const elective1Count = candidateList.filter(
        c => c.elective1 && c.elective1 !== "-1"
    ).length;

    const elective2Count = candidateList.filter(
        c => c.elective2 && c.elective2 !== "-1"
    ).length;

    const pendingCount = candidateList.filter(
        c =>
            (!c.elective1 || c.elective1 === "-1") &&
            (!c.elective2 || c.elective2 === "-1")
    ).length;


    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 font-medium">Error: {error}</p>
                    <button
                        onClick={fetchBatches}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-full mx-auto">
                <fieldset className="border-2 border-gray-300 rounded p-4 bg-white shadow-sm">
                    <legend className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}>
                        Assign Elective Subject
                    </legend>

                    <FilteredTableComponent
                        data={tableData}
                        columns={columns}
                        loading={loading}
                        searchable={true}
                        sortable={true}
                        exportable={true}
                        showExcel={true}
                        showPDF={true}
                        exportFileName="elective_subject_assign"
                        title="Elective Subject Assign"
                        emptyStateMessage="No Batches Available"
                        filterColumns={['CourseName', 'ExamType']}
                        renderCell={renderCell}

                    />

                    {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-xl w-[1300px] max-h-[97vh] overflow-auto">


                                <div className={`${color} px-6 py-4 flex items-center justify-between  rounded-t-xl`}>
                                    <h2 className="text-lg font-bold text-white tracking-wide">
                                        Assign Elective Subject
                                    </h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-white text-xl font-bold bg-red-500 w-10 h-10 flex items-center justify-center rounded-full"
                                    >
                                        ✕
                                    </button>
                                </div>


                                <div className="p-6">
                                    {popupLoading ? (
                                        <div className="flex items-center justify-center py-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mr-3"></div>
                                            <p className="text-gray-500 text-sm">Loading...</p>
                                        </div>
                                    ) : headerData ? (
                                        <>

                                            <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm mb-6">
                                                <div>
                                                    <span className="text-gray-500 font-medium">Course Code</span>
                                                    <p className="text-gray-800 font-semibold">{headerData.CourseCode}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-medium">Course Name</span>
                                                    <p className="text-gray-800 font-semibold">{headerData.CourseName}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-medium">Exam Type</span>
                                                    <p className="text-gray-800 font-semibold">{headerData.ExamType}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-medium">Batch ID</span>
                                                    <p>
                                                        <span className="bg-cyan-500 text-white px-2 py-0.5 rounded text-xs">
                                                            {headerData.BatchID}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-medium">Batch Status</span>
                                                    <p className="text-gray-800 font-semibold">{headerData.BatchStatusName}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-medium">Admission Last Date</span>
                                                    <p className="text-gray-800 font-semibold">{headerData.AdmissionLastDate}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-medium">Batch Start Date</span>
                                                    <p className="text-gray-800 font-semibold">{headerData.BatchStartDate}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-medium">Batch End Date</span>
                                                    <p className="text-gray-800 font-semibold">{headerData.BatchEndDate}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-medium">Admitted</span>
                                                    <p className="text-gray-800 font-semibold">{headerData.Admitted}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-medium">Approved</span>
                                                    <p className="text-gray-800 font-semibold">{headerData.Approved}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-medium">Rejected</span>
                                                    <p className="text-gray-800 font-semibold">{headerData.Rejected}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-3 mb-4">

                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex justify-between items-center">
                                                    <span className="text-xs text-gray-600">
                                                        Total Candidates
                                                    </span>
                                                    <span className="text-yellow-800 text-sm font-semibold">
                                                        {totalCandidates}
                                                    </span>
                                                </div>

                                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex justify-between items-center">
                                                    <span className="text-xs text-gray-600">
                                                        Elective Subject 1
                                                    </span>
                                                    <span className="text-blue-800 text-sm font-semibold">
                                                        {elective1Count}
                                                    </span>
                                                </div>

                                                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex justify-between items-center">
                                                    <span className="text-xs text-gray-600">
                                                        Elective Subject 2
                                                    </span>
                                                    <span className="text-green-800 text-sm font-semibold">
                                                        {elective2Count}
                                                    </span>
                                                </div>

                                                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex justify-between items-center">
                                                    <span className="text-xs text-gray-600">
                                                        Pending
                                                    </span>
                                                    <span className="text-red-800 text-sm font-semibold">
                                                        {pendingCount}
                                                    </span>
                                                </div>

                                            </div>


                                            {candidateList.length === 0 && (
                                                <div className="text-center text-red-500 font-medium mb-4">
                                                    No candidates found for this batch.
                                                </div>
                                            )}


                                            {candidateList.length > 0 && (
                                                <FilteredTableComponent
                                                    data={candidateList.map((c, i) => ({
                                                        ...c,
                                                        srNo: i + 1
                                                    }))}
                                                    columns={candidateColumns}
                                                    renderCell={renderCandidateCell}
                                                    searchable={true}
                                                    exportable={true}
                                                    maxHeight={"250px"}
                                                />
                                            )}


                                            <div className="flex justify-center gap-4 mt-6">
                                                <button
                                                    onClick={handleSave}
                                                    className="bg-green-600 text-white px-6 py-2 rounded"
                                                    disabled={candidateList.length === 0}
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    onClick={() => setShowModal(false)}
                                                    className="bg-gray-500 text-white px-6 py-2 rounded"
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-red-500 font-medium">No data found for this batch.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </fieldset>
            </div>
        </div>
    );
};

export default ElectiveSubjectAssign;





//import RedirectToOld from "../../formcomponent/RedirectToOld";
//const ElectiveSubjectAssign = () =>{
//    return <RedirectToOld targetPath="/Reports/CancelledCandidateList.aspx"/>;
//}
//export default ElectiveSubjectAssign;