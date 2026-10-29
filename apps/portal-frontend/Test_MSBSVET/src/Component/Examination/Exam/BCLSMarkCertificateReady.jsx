import { useEffect } from "react";
import agent from "../../../lib/api/agent";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";
import { useState } from "react";
import Swal from "sweetalert2";
import Button from "../../../Component/base/Button";
import { GetBCLSPendingCandidates, UpdateMultipleCandidatesResultDate, UpdateSingleCandidateResultDate } from "../../../Endpoints_All/Examination/Exam";
import { getDeviceIP } from "../../../utils/CommonHelper";
import { GetInstituteIDByInstituteCode } from '../../../Endpoints_All/Base/Institute';
import { useAuth } from "../../../Hooks/AuthContext";


const BCLSMarkCertificateReady = () => {
    const column = [
        {
            key: 'ApplicationID',
            header: 'ID',
            width: '50px',
            className: 'text-center'
        },
        { key: 'CandidateName', header: 'Name', width: '200px', className: 'text-center', },
        {
            key: 'ApplicationIDDisplay',
            header: 'Application ID',
            width: '100px',
            className: 'text-center'
        },
        {
            key: 'CourseName',
            header: 'Course',
            width: '220px',
            className: 'text-center'
        },
        {
            key: 'ResultDate',
            header: 'Result Date',
            width: '100px',
            className: 'text-center'
        },
        {
            key: 'Status',
            header: 'Status',
            width: '100px',
            className: 'text-center'
        },
        { key: 'Action', header: 'Action', width: '80px', className: 'text-center' }
    ]

    const { userInfo } = useAuth();
    const UserLoginID = userInfo?.UserLoginID;

    const [candidates, setCandidates] = useState([]);
    const [instituteId, setInstituteId] = useState(null);
    const [selectedCandidates, setSelectedCandidates] = useState([])
    const [selectedCourse, setSelectedCourse] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const courseOptions = [...new Set(candidates.map(c => c.CourseName))];
    useEffect(() => {
        //fetchData();
        fetchIP();
        fetchInstituteId();

    }, []);

    useEffect(() => {
        if (instituteId) {
            fetchData();
        }
    }, [instituteId]);
    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
    };
    const fetchInstituteId = async () => {
        try {
            //startLoading();

            const response = await agent.get(GetInstituteIDByInstituteCode, {
                params: { InstituteCode: UserLoginID }
            });

            if (response.data.Status === "Success") {
                setInstituteId(response.data.Data);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch Institute ID'
            });
        } finally {
            //stopLoading();
        }
    };
    const fetchData = async () => {
        try {
            const response = await agent.get(`${GetBCLSPendingCandidates}?InstituteID=${instituteId}`);
            setCandidates(response?.data?.Data ?? []);
        } catch (error) {
            setCandidates([]);
        }
    }
    const filteredCandidates = selectedCourse
        ? candidates.filter(c => c.CourseName === selectedCourse)
        : candidates;

    const tableData = filteredCandidates.map((candidate, index) => ({
        ...candidate,
        id: candidate.ApplicationID || index,
        ResultDate:
            candidate.ResultDate === '' || candidate.ResultDate === null
                ? '-'
                : candidate.ResultDate,
        Status:
            candidate.ResultDate === '' || candidate.ResultDate === null
                ? 'Pending'
                : 'Ready'
    }));

    const pendingCount = filteredCandidates.filter(
        c => !c.ResultDate || c.ResultDate === ''
    ).length;

    const setDate = (ApplicationID, candidates) => {
        if (!ApplicationID) return;

        const candidateName =
            candidates.find(c => c.ApplicationID === ApplicationID)?.CandidateName ||
            'the candidate';

        const candidateId = candidates.find(c => c.ApplicationID === ApplicationID)?.CandidateID || 0;

        Swal.fire({
            title: 'Set Result Date',
            text: `Enter the result date for ${candidateName}`,
            input: 'date',
            showCancelButton: true,
            confirmButtonText: 'Set Date',
            preConfirm: (date) => {
                if (!date) {
                    Swal.showValidationMessage('Please select a date');
                    return;
                }
                return date;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                updateSingleCandidate(ApplicationID, result.value, candidateId); // 🔥 CALL API
            }
        });
    };

    const updateSingleCandidate = async (applicationId, date, candidateId) => {
        try {
            const payload = {
                candidateId: candidateId,
                applicationId: applicationId,
                courseCompletionDate: date,
                createdBy: UserLoginID || "",
                createdIpAddress: ipAddress || ""
            };

            const res = await agent.put(`${UpdateSingleCandidateResultDate}`, payload);


            Swal.fire("Success", res.data.Message, "success");
            fetchData();
            // fetchInstituteId();

        } catch (err) {
            Swal.fire("Error", err.response?.data?.Message || "Failed", "error");
        }
    };
    const updateMultipleCandidates = async (selectedCandidates, date) => {
        try {
            const ids = selectedCandidates.map(x => x.ApplicationID).join(",");

            const payload = {
                candidateIds: ids,
                applicationId: 0,
                courseCompletionDate: date,
                createdBy: UserLoginID || "",
                createdIpAddress: ipAddress || ""
            };

            const res = await agent.put(`${UpdateMultipleCandidatesResultDate}`, payload);

            Swal.fire("Success", res.data.Message, "success");
            fetchData();
            setSelectedCandidates([]);
        } catch (err) {
            Swal.fire("Error", err.response?.data?.Message || "Failed", "error");
        }
    };
    return (
        <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">

            <fieldset className="mb-4 rounded-md border p-4">
                <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
                    <span className='text-base'>☰</span>
                    <span>Mark Candidates Ready for Certificate</span>
                </legend>
                <div className="mb-4 pl-6 pr-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Filter by Course:
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                            >
                                <option value="">All Courses (Pending Only)</option>
                                {courseOptions.map((course, idx) => (
                                    <option key={idx} value={course}>
                                        {course}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Pending Count:
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                                <span className="text-gray-800">
                                    {pendingCount} candidates pending
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
                <FilteredTableComponent
                    className='pl-6 pr-6'
                    data={tableData ?? []}
                    columns={column}
                    searchable={true}
                    showExport={false}
                    showExcelTemplate={false}
                    showPDF={false}
                    sortable={true}
                    showCheckbox={true}
                    isRowSelectable={item =>
                        (item.ApplicationID || item.ApplicationID > 0)
                    }
                    selectedRowsExternal={
                        selectedCandidates.length === 0 ? [] : null
                    }
                    onSelectionChange={selected => setSelectedCandidates(selected)}
                    renderCell={(item, column) => {
                        if (column.key === 'Action') {
                            return (
                                <span
                                    className='text-white font-bold cursor-pointer hover:bg-green-800 bg-green-700 p-2 rounded'
                                    onClick={() => setDate(item.ApplicationID, candidates)}
                                >
                                    Set Date
                                </span>
                            )
                        }
                    }}
                />
                {selectedCandidates && selectedCandidates.length > 0 ? (
                    <div className="flex justify-start gap-2 mt-4">
                        <Button
                            variant='success'
                            onClick={() => {
                                if (selectedCandidates.length === 0) {
                                    Swal.fire("Warning", "Select at least one candidate", "warning");
                                    return;
                                }

                                Swal.fire({
                                    title: 'Set Result Date',
                                    input: 'date',
                                    showCancelButton: true,
                                    confirmButtonText: 'Update All',
                                    preConfirm: (date) => {
                                        if (!date) {
                                            Swal.showValidationMessage('Please select a date');
                                            return;
                                        }
                                        return date;
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        updateMultipleCandidates(selectedCandidates, result.value); // 🔥 CALL API
                                    }
                                });
                            }}
                        >
                            Update Selected ({selectedCandidates.length})
                        </Button>
                        <Button
                            variant='info'
                            onClick={() => setSelectedCandidates([])}
                        >
                            Clear Selection
                        </Button>
                    </div>
                ) : null}
            </fieldset>
        </div>
    )
};

export default BCLSMarkCertificateReady;