import React, { useContext, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { ThemeContext } from "../../../Component/Context/ThemeContext.jsx";
import DropdownComponent from "../../../Component/formcomponent/DropdownComponent.jsx";
import FormComponent from "../../../Component/formcomponent/FormComponent.jsx";
import Button from "../../../Component/base/Button.jsx";
import { GetExaminationListAPI, GetExaminationRemainedToPublishResult, PublishExamsResult } from "../../../Endpoints_All/Examination/Exam.jsx";
import agent from "../../../lib/api/agent.jsx";
import { GetExamType } from "../../../Endpoints_All/Administration/admin.jsx";
import { GetAdmissionYear } from "../../../Endpoints_All/Institute/institute.jsx";
import { useAuth } from "../../../Hooks/AuthContext.jsx";
import { getDeviceIP } from "../../../utils/CommonHelper.jsx";
import { DateInput } from "../../../Component/formcomponent/DateInputComponent.jsx";
import Swal from "sweetalert2";


const PublishResult = () => {

    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const allowedTypes = [81]
    const hasAccess = allowedTypes.includes(Number(userInfo?.UserTypeID));

    const [examType, setExamType] = useState("");
    const [admissionYear, setAdmissionYear] = useState("");
    const [examination, setExamination] = useState("");

    const [examTypes, setExamTypes] = useState([]);
    const [admissionYears, setAdmissionYears] = useState([]);
    const [examinations, setExaminations] = useState([]);

    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const [resultDetails, setResultDetails] = useState(null);
    const [resultDate, setResultDate] = useState("");
    const [resultDataNotFound, setResultDataNotFound] = useState(false);
    const [ipAddress, setIpAddress] = useState("");

    const [resultDateError, setResultDateError] = useState("");

    useEffect(() => {
        if (!hasAccess) {
            return;
        }
        getInitialData();
        fetchIP();
    }, [hasAccess]);

    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
    };


    const getInitialData = async () => {

        try {
            setLoading(true);

            const examinationResponse = await agent.get(GetExaminationListAPI);
            const examinationData = examinationResponse?.data?.Data || [];

            const examTypeResponse = await agent.get(GetExamType);
            const examTypeData = examTypeResponse?.data?.Data || [];

            const admissionYearResponse = await agent.get(GetAdmissionYear);
            const admissionYearData = admissionYearResponse?.data?.Data || [];

            setExaminations(examinationData);
            setExamTypes(examTypeData);
            setAdmissionYears(admissionYearData);

        } catch (error) {
            console.error("Error fetching Publish Result data:", error);
            setExaminations([]);
            setExamTypes([]);
            setAdmissionYears([]);

        } finally {
            setLoading(false);
        }

    };

    const examTypeOptions = examTypes
        .filter((item) => item.Isactive)
        .map((item) => ({
            value: String(item.ExamTypeID),
            label: item.ExamType
        }));

    const admissionYearOptions = admissionYears
        .filter((item) => item.isactive)
        .map((item) => ({
            value: String(item.YearId),
            label: item.YearDisplayName
        }));

    const examinationOptions = examinations.filter((item) => {

        const matchesExamType = String(item.ExamTypeID) === String(examType);
        const matchesAdmissionYear = String(item.ExaminatioYearID) === String(admissionYear);
        return matchesExamType && matchesAdmissionYear;

    }).map((item) => ({
        value: String(item.ID),
        label: item.ExaminationName
    }));

    const selectedExam = examinations.find((item) => String(item.ID) === String(examination));

    // const isResultAlreadyPublished = resultDetails && Number(resultDetails.TotalResultCount) > 0 && Number(resultDetails.ResultProcessedCount) === Number(resultDetails.TotalResultCount) &&
    //     Number(resultDetails.ResultUnProcessedCount) === 0;

    const totalCandidates = Number(resultDetails?.TotalResultCount) || 0;
    const processedCandidates = Number(resultDetails?.ResultProcessedCount) || 0;
    const unprocessedCandidates = Number(resultDetails?.ResultUnProcessedCount) || 0;

    const isResultAlreadyPublished =
        totalCandidates > 0 &&
        unprocessedCandidates === 0 &&
        processedCandidates === totalCandidates;

    const hasPartiallyPublishedResults =
        totalCandidates > 0 &&
        processedCandidates > 0 &&
        unprocessedCandidates > 0;

    const hasUnprocessedResults =
        totalCandidates > 0 &&
        unprocessedCandidates > 0;

    const publishButtonText = hasPartiallyPublishedResults
        ? "Publish Remaining Results"
        : "Publish Result";

    const getExamTypeName = (examTypeID) => {
        const examTypeItem = examTypes.find((item) => String(item.ExamTypeID) === String(examTypeID));
        return examTypeItem?.ExamType || "-";
    };

    const getAdmissionYearName = (yearID) => {
        const admissionYearItem = admissionYears.find((item) => String(item.YearId) === String(yearID));
        return admissionYearItem?.YearDisplayName || "-";
    };

    const handleExamTypeChange = (value) => {
        setExamType(value);
        setAdmissionYear("");
        setExamination("");
        setResultDetails(null);
        setResultDate("");
        setResultDateError("");
        setSearched(false);
        setResultDataNotFound(false);
    };

    const handleAdmissionYearChange = (value) => {
        setAdmissionYear(value);
        setExamination("");
        setResultDetails(null);
        setResultDate("");
        setResultDateError("");
        setSearched(false);
        setResultDataNotFound(false);
    };

    const handleExaminationChange = (value) => {
        setExamination(value);
        setResultDetails(null);
        setResultDate("");
        setResultDateError("");
        setSearched(false);
        setResultDataNotFound(false);
    };

    const getResultDateTime = (date) => {
        if (!date) return "";

        const [day, month, year] = date.split("/");
        const now = new Date();

        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    };

    const handleSearch = async () => {
        if (!examType || !admissionYear || !examination) {
            return;
        }

        try {
            setLoading(true);
            setResultDateError("");

            const response = await agent.get(
                GetExaminationRemainedToPublishResult,
                {
                    params: {
                        examTypeID: Number(examType),
                        examYearID: Number(admissionYear),
                        examinationID: Number(examination)
                    }
                }
            );

            if (response?.data?.Status === "Success" && response?.data?.Data?.Table?.length > 0
            ) {
                const resultData = response.data.Data.Table[0];

                setResultDetails(resultData);
                setResultDate(formatApiDate(resultData?.ResultDate));
                setResultDateError("");

                setResultDataNotFound(
                    Number(resultData?.TotalResultCount) === 0
                );

                setSearched(true);
            } else {
                setResultDetails(null);
                setResultDate("");
                setResultDateError("");
                setResultDataNotFound(true);

                // IMPORTANT: must be true so "Result data not found"
                // message can actually render
                setSearched(true);
            }

        } catch (error) {
            console.error(
                "Error fetching examination result details:",
                error
            );

            setResultDetails(null);
            setResultDate("");
            setResultDateError("");
            setResultDataNotFound(false);
            setSearched(false);

            await Swal.fire({
                icon: "error",
                title: "Failed",
                text: error?.response?.data?.Message || "Unable to fetch examination result details.",
                confirmButtonText: "OK"
            });

        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        resetPublishResult();
    };

    const handlePublish = async () => {
        if (!examType || !admissionYear || !examination) {
            return;
        }

        if (!resultDate) {
            setResultDateError("Please select Result Date.");
            return;
        }

        setResultDateError("");

        const alreadyPublished =
            resultDetails &&
            Number(resultDetails.TotalResultCount) > 0 &&
            Number(resultDetails.ResultProcessedCount) ===
            Number(resultDetails.TotalResultCount) &&
            Number(resultDetails.ResultUnProcessedCount) === 0;

        if (alreadyPublished) {
            await Swal.fire({
                icon: "info",
                title: "Already Declared",
                text: "All candidate results have already been published.",
                confirmButtonText: "OK"
            });

            return;
        }

        try {
            setLoading(true);

            const resultDateTime = getResultDateTime(resultDate);

            const response = await agent.post(
                PublishExamsResult,
                null,
                {
                    params: {
                        examTypeID: Number(examType),
                        examYearID: Number(admissionYear),
                        examinationID: Number(examination),
                        resultDate: resultDateTime,
                        userLoginID: userInfo?.UserLoginID || "",
                        ipAddress: ipAddress || ""
                    }
                }
            );

            if (
                response?.data?.Status === "Success" &&
                response?.data?.Data === "Y"
            ) {
                await Swal.fire({
                    icon: "success",
                    title: "Result Published",
                    text: response?.data?.Message || "Result Published successfully.",
                    confirmButtonText: "OK"
                });

                // Refresh result details/counts
                //await handleSearch();
                resetPublishResult();

            } else {
                await Swal.fire({
                    icon: "error",
                    title: "Publication Failed",
                    text: response?.data?.Message || "Failed to publish result.",
                    confirmButtonText: "OK"
                });
            }

        } catch (error) {
            console.error("Error publishing examination result:", error);

            await Swal.fire({
                icon: "error",
                title: "Publication Failed",
                text: error?.response?.data?.Message || "An error occurred while publishing the result.",
                confirmButtonText: "OK"
            });

        } finally {
            setLoading(false);
        }
    };

    const formatApiDate = (date) => {
        if (!date) return "";

        const d = new Date(date);

        if (isNaN(d.getTime())) return "";

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}/${month}/${year}`;
    };
    const resetPublishResult = () => {
        setExamType("");
        setAdmissionYear("");
        setExamination("");
        setResultDetails(null);
        setResultDate("");
        setResultDateError("");
        setSearched(false);
        setResultDataNotFound(false);
    };

    const handleNotPublish = () => {
        resetPublishResult();
    };

    if (!hasAccess) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white border border-red-200 rounded-lg shadow-sm p-6 text-center">
                    <h2 className="text-lg font-semibold text-red-600">
                        Access Denied
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                        You do not have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-full bg-gray-50 min-h-screen">
            <fieldset className="border border-gray-300 rounded-lg mb-6 px-5 pt-3 pb-5 bg-white shadow-sm">
                <legend
                    className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-lg font-bold text-white shadow-md`}
                >
                    <span>Publish Result</span>
                </legend>

                <div className="mt-5 border border-gray-200 rounded-lg bg-gray-50 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <DropdownComponent
                            label="Exam Type"
                            options={examTypeOptions}
                            value={examType}
                            onChange={handleExamTypeChange}
                            required={true}
                            disabled={false}
                            loading={loading}
                            isMulti={false}
                        />

                        <DropdownComponent
                            label="Admission Year"
                            options={admissionYearOptions}
                            value={admissionYear}
                            onChange={handleAdmissionYearChange}
                            required={true}
                            disabled={!examType}
                            loading={loading}
                            isMulti={false}
                        />

                        <DropdownComponent
                            label="Examination"
                            options={examinationOptions}
                            value={examination}
                            onChange={handleExaminationChange}
                            required={true}
                            disabled={
                                !examType ||
                                !admissionYear
                            }
                            loading={loading}
                            isMulti={false}
                        />

                        <div className="flex items-center gap-3 lg:col-span-3 justify-center mt-2">
                            <Button
                                variant="success"
                                onClick={handleSearch}
                                disabled={
                                    !examType ||
                                    !admissionYear ||
                                    !examination
                                }
                            >
                                <Search size={15} />
                                Search
                            </Button>


                            {(examType || admissionYear || examination) && (
                                <Button
                                    variant="danger"
                                    onClick={handleClear}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                {searched && selectedExam && resultDataNotFound ? (
                    <div className="mt-5 border border-red-300 rounded-lg bg-red-50 p-5">
                        <div className="flex flex-col items-center py-4">
                            <p className="text-base font-semibold text-red-700">
                                Result data not found.
                            </p>
                            <p className="text-sm text-red-600 mt-1">
                                No candidate result data is available for the selected examination.
                            </p>
                        </div>
                    </div>
                ) : (searched && selectedExam && (
                    <div className="mt-5">
                        <fieldset className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <legend
                                className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-lg font-bold text-white shadow-md`}
                            >
                                <span>
                                    Examination Details
                                </span>
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                <FormComponent
                                    label="Exam Type"
                                    value={getExamTypeName(
                                        selectedExam.ExamTypeID
                                    )}
                                    disabled={true}
                                />
                                <FormComponent
                                    label="Examination"
                                    value={
                                        selectedExam.ExaminationName ?? ""
                                    }
                                    disabled={true}
                                />

                                <FormComponent
                                    label="Examination Year"
                                    value={getAdmissionYearName(
                                        selectedExam.ExaminatioYearID
                                    )}
                                    disabled={true}
                                />

                                <FormComponent
                                    label="Processed Result Candidates"
                                    value={resultDetails?.ResultProcessedCount ?? 0}
                                    disabled={true}
                                />

                                <FormComponent
                                    label="Unprocessed Result Candidates"
                                    value={resultDetails?.ResultUnProcessedCount ?? 0}
                                    disabled={true}
                                />

                                <FormComponent
                                    label="Total Candidates"
                                    value={resultDetails?.TotalResultCount ?? 0}
                                    disabled={true}
                                />

                                <FormComponent
                                    label="Certificate Marks Name"
                                    value={resultDetails?.CertificateMarksName ?? ""}
                                    disabled={true}
                                />

                                <FormComponent
                                    label="Certificate Marks Designation"
                                    value={resultDetails?.CertificateMarksDesignation ?? ""}
                                    disabled={true}
                                />

                                <FormComponent
                                    label="Statement Marks Name"
                                    value={resultDetails?.StatementMarksName ?? ""}
                                    disabled={true}
                                />

                                <FormComponent
                                    label="Statement Marks Designation"
                                    value={resultDetails?.StatementMarksDesignation ?? ""}
                                    disabled={true}
                                />
                                <div>
                                    {/* {publishStatus === "Please select Result Date." && (
                                        <div className="mb-2 px-3 py-2 rounded-md bg-red-100 text-red-700 border border-red-300 text-sm font-medium">
                                            Result Status: Please select Result Date.
                                        </div>
                                    )} */}

                                    <DateInput
                                        label="Result Date"
                                        value={resultDate}
                                        onChange={(value) => {
                                            setResultDate(value);

                                            if (value) {
                                                setResultDateError("");
                                            }
                                        }}
                                        error={resultDateError}
                                        required={true}
                                        disabled={!!resultDetails?.ResultDate}
                                    />
                                </div>
                                {hasPartiallyPublishedResults && (
                                    <div className="lg:col-span-3 mt-2 border border-yellow-300 rounded-md bg-yellow-50 px-4 py-3">
                                        <p className="text-sm font-medium text-yellow-800">
                                            {processedCandidates} of {totalCandidates} candidate results
                                            have already been published.
                                        </p>

                                        {/* <p className="text-sm text-yellow-700 mt-1">
                                            {unprocessedCandidates} candidate result
                                            {unprocessedCandidates > 1 ? "s" : ""} remaining to be published.
                                        </p> */}
                                    </div>
                                )}

                            </div>

                        </fieldset>

                        {isResultAlreadyPublished ? (
                            <div className="mt-5 border border-green-300 rounded-lg bg-green-50 p-5">
                                <div className="flex flex-col items-center py-4">
                                    <p className="text-base font-semibold text-green-700">
                                        Result already declared.
                                    </p>

                                    <p className="text-sm text-green-600 mt-1">
                                        All candidate results have already been published.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 border border-gray-300 rounded-lg bg-white p-5">
                                <div className="flex flex-col items-center py-4">
                                    <p className="text-base font-medium text-gray-700 mb-4 text-center">
                                        {hasPartiallyPublishedResults
                                            ? `There are ${unprocessedCandidates} candidate results remaining to be published.`
                                            : "Do you want to publish the result for this examination?"}
                                    </p>

                                    <div className="flex justify-center gap-4">
                                        <Button
                                            variant="success"
                                            onClick={handlePublish}
                                            disabled={loading || !hasUnprocessedResults}
                                        >
                                            {publishButtonText}
                                        </Button>

                                        <Button
                                            variant="danger"
                                            onClick={handleNotPublish}
                                            disabled={loading}
                                        >
                                            Do Not Publish
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
                )}
            </fieldset>
        </div>
    );

};

export default PublishResult;