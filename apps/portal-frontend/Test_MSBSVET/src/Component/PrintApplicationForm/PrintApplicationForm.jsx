import { useState, useEffect } from 'react';
import agent from '../../lib/api/agent';
import '../PrintApplicationForm/PrintApplicationForm.css';
import { GetCandidateSummary } from '../../Endpoints_All/Base/masterData';
import logonew1 from '../../assets/logo-new1.jpg';
import logonew2 from '../../assets/logo-new2.jpg';
import verifiedIcon from '../../assets/VerifiedIcon.jpg';
import questionMark from '../../assets/QuestionMark.png';
import { maskString } from "../../utils/CommonHelper";
import { getApplicationIDByApplicationIDDisplay } from '../../Endpoints_All/Admission/admission';
import { GetAppliedCourseByCandidateIDApplicationId } from '../../Endpoints_All/Candidate/courseApplication';

const PrintApplicationForm = ({
    candidateID,
    pageCode = 'CANDIDATE_PRINT',
    onReadyToPrint,
    applicationIdDisplay
}) => {
    const [candidateData, setCandidateData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applicationId, setApplicationId] = useState(null);
    const [appliedCourseData, setAppliedCourseData] = useState([]);

    useEffect(() => {
        if (candidateID) {
            fetchCandidateSummary();
            fetchApplicationId();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidateID]);

    useEffect(() => {
        if (applicationId && candidateID) {
            fetchCandidateAppliedCourses();
        }
    }, [applicationId, candidateID]);

    const fetchApplicationId = async () => {
        if (!applicationIdDisplay) {
            return;
        }
        const response = await agent.get(`${getApplicationIDByApplicationIDDisplay}?applicationIdDisplay=${applicationIdDisplay}`);
        if (response.data.Status === 'Success' && response.data.Data > 0) {
            setApplicationId(response?.data?.Data);
        }

    }

    const fetchCandidateAppliedCourses = async () => {
        const response = await agent.get(`${GetAppliedCourseByCandidateIDApplicationId}?candidateId=${candidateID}&applicationId=${applicationId}`);
        if (response.data.Status === 'Success' && response.data.Data) {
            setAppliedCourseData(response?.data?.Data);
        }

    }

    const fetchCandidateSummary = async () => {
        try {
            setLoading(true);

            const url = `${GetCandidateSummary}?candidateId=${candidateID}&pageCode=${pageCode}`;
            const response = await agent.get(url);


            if (response.data.Status === 'Success') {

                setCandidateData(response.data.Data);

                if (onReadyToPrint) {
                    onReadyToPrint();
                }
            } else {
                setError(response.data.Message || 'Failed to load candidate summary');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch candidate summary');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    //const handleBack = () => {
    //    window.history.back();
    //};

    //const handleClose = () => {
    //    window.close();
    //};

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error!</h4>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!candidateData) return null;

    // NOTE: Map to Candidate* keys from API
    const {
        CandidatePrimarySummary: primary = {},
        CandidateAddressSummary: address = {},
        CandidateParentSummary: parent = {},
        CandidateCategorySummary: category = {},
        CandidateQualificationSummaryList: qualifications = [],
        CandidateTrainingSummaryList: trainings = [],
        CandidateAdditionalSummary: additional = {},
        CandidateLanguageSummaryList: languages = [],
        CandidateBankSummary: bank = {},
        CandidateWorkExperienceSummaryList: workExp = [],
        CandidateApplicationStatusSummary: appsummary = {}
    } = candidateData;

    const formatExactDate = (inputDate) => {

        if (!inputDate) return '';
        const d = new Date(inputDate);

        if (Number.isNaN(d.getTime())) return '';

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        let hours = d.getHours();
        let minutes = String(d.getMinutes()).padStart(2, "0");
        let seconds = String(d.getSeconds()).padStart(2, "0");

        const ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12 || 12;
        hours = String(hours).padStart(2, "0");

        return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
    };

    return (
        <div className="staff-print-application-form">
            {/* Optional: local action buttons for non-print view */}
            {/*<div className="no-print mb-3 text-end">*/}
            {/*    <button className="btn btn-secondary me-2" onClick={handleBack}>Back</button>*/}
            {/*    <button className="btn btn-primary me-2" onClick={handlePrint}>Print</button>*/}
            {/*    <button className="btn btn-danger" onClick={handleClose}>Close</button>*/}
            {/*</div>*/}

            {/* Header Section */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <td style={{ width: '5%', textAlign: 'center', borderRightWidth: '0px' }}>
                            <img className="india-logo me-3" src={logonew1} alt="Logo 1" />
                        </td>
                        <td
                            style={{
                                width: '90%',
                                textAlign: 'center',
                                verticalAlign: 'middle',
                                borderRightWidth: '0px',
                                borderLeftWidth: '0px'
                            }}
                        >
                            <div className="sub-title">Government of Maharashtra</div>
                            <div className="sub-title">
                                Skill, Employment, Entrepreneurship and Innovation Department
                            </div>
                            <div className="main-title">
                                Maharashtra State Board of Skill, Vocational Education and Training
                            </div>
                            <div className="main-title1">Application Form</div>
                        </td>
                        <td style={{ width: '5%', textAlign: 'center', borderLeftWidth: '0px' }}>
                            <img className="logo-image" src={logonew2} alt="Logo 2" />
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'center' }} colSpan="3">
                            <span className="text-lg">
                                Application ID:{' '}
                                <span className="labelFont">{applicationIdDisplay || 'N/A'}</span>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Primary Details */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <th colSpan="3">
                            <div className="flex items-center gap-2">
                                <span>Primary Details</span>
                                {appsummary.FormStatus === "V" ? (
                                    <img
                                        src={verifiedIcon}
                                        alt="verified"
                                        className="w-3 h-3 inline-block"
                                        style={{ width: "15px", height: "15px" }}
                                    />
                                ) : (
                                    <img
                                        src={questionMark}
                                        alt="pending"
                                        className="w-3 h-3 inline-block"
                                        style={{ width: "15px", height: "15px" }}
                                    />
                                )}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right', width: '35%' }}>Candidate Name</td>
                        <td style={{ width: '55%' }}>
                            <span className="labelFont">
                                {`${primary.FirstName || ''} ${primary.MiddleName || ''} ${primary.LastName || ''}`.trim() || 'N/A'}
                            </span>
                        </td>
                        <td style={{ textAlign: 'center', width: '10%' }} rowSpan="8">
                            <img
                                src={primary.PhotoFilePath || '/images/photo_not_available_large.png'}
                                width="133"
                                height="171"
                                alt="Photograph"
                            />
                        </td>
                    </tr>
                    {/* Job Role is not in candidate API; keep only if you actually have it */}
                    {primary.JobRoles && (
                        <tr>
                            <td style={{ textAlign: 'right' }}>Job Role</td>
                            <td>
                                <span className="labelFont">{primary.JobRoles}</span>
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td style={{ textAlign: 'right' }}>Gender</td>
                        <td>
                            <span className="labelFont">{primary.Gender || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Date Of Birth (DD/MM/YYYY)</td>
                        <td>
                            <span className="labelFont">{primary.DOB || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Aadhaar Number</td>
                        <td>
                            <span className="labelFont">
                                {primary.AadhaarNo ? maskString(primary.AadhaarNo) : 'N/A'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Primary Mobile Number</td>
                        <td>
                            <span className="labelFont">{primary.MobileNo || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Secondary Mobile Number</td>
                        <td>
                            <span className="labelFont">{primary.AltMobileNo || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>E-Mail ID</td>
                        <td>
                            <span className="labelFont">{primary.EMailID || 'N/A'}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Address Details */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <th colSpan="4">Permanent Address</th>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right', width: '25%' }}>Address</td>
                        <td colSpan="3">
                            <span className="labelFont">{address.PAddress || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>State</td>
                        <td style={{ width: '25%' }}>
                            <span className="labelFont">{address.PState || 'N/A'}</span>
                        </td>
                        <td style={{ textAlign: 'right', width: '10%' }}>District</td>
                        <td style={{ width: '25%' }}>
                            <span className="labelFont">{address.PDistrict || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Taluka</td>
                        <td>
                            <span className="labelFont">{address.PTaluka || 'N/A'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>City / Village</td>
                        <td>
                            <span className="labelFont">{address.PCity || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Pin Code</td>
                        <td colSpan="3">
                            <span className="labelFont">{address.PPincode || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <th colSpan="4">Correspondence Address</th>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Address</td>
                        <td colSpan="3">
                            <span className="labelFont">{address.CAddress || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>State</td>
                        <td>
                            <span className="labelFont">{address.CState || 'N/A'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>District</td>
                        <td>
                            <span className="labelFont">{address.CDistrict || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Taluka</td>
                        <td>
                            <span className="labelFont">{address.CTaluka || 'N/A'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>City / Village</td>
                        <td>
                            <span className="labelFont">{address.CCity || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Pin Code</td>
                        <td colSpan="3">
                            <span className="labelFont">{address.CPincode || 'N/A'}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Parent Details */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <th colSpan="4">Parent Details</th>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right', width: '25%' }}>Are you Orphan ?</td>
                        <td colSpan="3">
                            <span className="labelFont">{parent.IsOrphan || 'N/A'}</span>
                        </td>
                    </tr>
                    {parent.IsOrphan !== 'Yes' && (
                        <tr>
                            <td style={{ textAlign: 'right' }}>Father Name</td>
                            <td style={{ width: '25%' }}>
                                <span className="labelFont">
                                    {`${parent.FatherFirstName || ''} ${parent.FatherMiddleName || ''} ${parent.FatherLastName || ''}`.trim() || 'N/A'}
                                </span>
                            </td>
                            <td style={{ textAlign: 'right', width: '12%' }}>Mother Name</td>
                            <td style={{ width: '25%' }}>
                                <span className="labelFont">
                                    {`${parent.MotherFirstName || ''} ${parent.MotherMiddleName || ''} ${parent.MotherLastName || ''}`.trim() || 'N/A'}
                                </span>
                            </td>
                        </tr>
                    )}
                    {/*<tr>*/}
                    {/*    <td style={{ textAlign: 'right' }}>Marital Status</td>*/}
                    {/*    <td>*/}
                    {/*        <span className="labelFont">{parent.MaritalStatus || 'N/A'}</span>*/}
                    {/*    </td>*/}
                    {/*    <td style={{ textAlign: 'right' }}>Spouse Name</td>*/}
                    {/*    <td>*/}
                    {/*        <span className="labelFont">*/}
                    {/*            {`${parent.SpouseTitle || ''} ${parent.SpouseFirstName || ''} ${parent.SpouseMiddleName || ''} ${parent.SpouseLastName || ''}`.trim() || 'N/A'}*/}
                    {/*        </span>*/}
                    {/*    </td>*/}
                    {/*</tr>*/}
                </tbody>
            </table>

            {/* Category Details */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <th colSpan="4">Category Details</th>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right', width: '25%' }}>Nationality</td>
                        <td colSpan="3">
                            <span className="labelFont">{category.Nationality || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }} colSpan="2">
                            Are you Maharashtra Domiciled?
                        </td>
                        <td colSpan="2">
                            <span className="labelFont">{category.IsMHDomiciled || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Religion</td>
                        <td style={{ width: '25%' }}>
                            <span className="labelFont">{category.Religion || 'N/A'}</span>
                        </td>
                        <td style={{ textAlign: 'right', width: '15%' }}>Caste Category</td>
                        <td style={{ width: '35%' }}>
                            <span className="labelFont">
                                {category.Category || 'N/A'}
                                {category.Caste && category.Caste !== "NA"
                                    ? ` (${category.Caste})`
                                    : ""}
                            </span>
                        </td>
                    </tr>

                    {/* NCL: show only for relevant categories (same condition as staff) */}
                    {!(category.CategoryID === 2 || category.CategoryID === 3 || category.CategoryID === 4) && (
                        <tr>
                            <td style={{ textAlign: 'right' }} colSpan="2">
                                Do you belong to Non Creamy Layer?
                            </td>
                            <td colSpan="2">
                                <span className="labelFont">{category.IsBelongToNCL || 'N/A'}</span>
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td style={{ textAlign: 'right' }} colSpan="2">
                            Do you belong to Person with Disability Category?
                        </td>
                        <td colSpan="2">
                            <span className="labelFont">{category.IsBelongToPWD || 'N/A'}</span>
                        </td>
                    </tr>
                    {category.IsBelongToPWD === 'Yes' && (
                        <>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Disability Percentage:</td>
                                <td colSpan="3">
                                    <span className="labelFont">
                                        {category.DisabilityPercentage || 'N/A'}%
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Disability:</td>
                                <td colSpan="3">
                                    <span className="labelFont">{category.Disability || 'N/A'}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Disability Type:</td>
                                <td>
                                    <span className="labelFont">{category.DisabilityType || 'N/A'}</span>
                                </td>
                                <td style={{ textAlign: 'right' }}>Unique Disability ID:</td>
                                <td>
                                    <span className="labelFont">
                                        {category.UniqueDisabilityIDNo || 'N/A'}
                                    </span>
                                </td>
                            </tr>
                        </>
                    )}
                </tbody>
            </table>

            {/* Qualification Details */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <th colSpan="4">Qualification Details</th>
                    </tr>
                    <tr>
                        <td colSpan="4">
                            {qualifications.length > 0 ? (
                                <>
                                    {qualifications.some((q) => q?.QualificationGroup == 'B') ? (
                                <table className="table GridView text-center">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '20%' }}>Highest Standard Attended</th>
                                            <th style={{ width: '20%' }}>Year Of Appearing</th>
                                            <th style={{ width: '5%' }}>Marks Obtained</th>
                                            <th style={{ width: '5%' }}>Maximum Marks</th>
                                            <th style={{ width: '15%' }}>Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {qualifications.map((qual, index) => (
                                            <tr key={index}>
                                                <td>{qual.Qualification || '-'}</td>
                                                <td>{qual.AppearingYear || '-'}</td>
                                                <td>{qual.MarksObtained || '-'}</td>
                                                <td>{qual.MaximumMarks || '-'}</td>
                                                <td>{qual.Class || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="table GridView text-center">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '20%' }}>Qualification Type</th>
                                            <th style={{ width: '20%' }}>Name of Degree</th>
                                            <th style={{ width: '15%' }}>Subject / Branch / Trade</th>
                                            <th style={{ width: '25%' }}>Board / University</th>
                                            <th style={{ width: '5%' }}>Marks Obtained</th>
                                            <th style={{ width: '5%' }}>Maximum Marks</th>
                                            <th style={{ width: '15%' }}>Class / Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {qualifications.map((qual, index) => (
                                            <tr key={index}>
                                                <td>{qual.Qualification || '-'}</td>
                                                <td>{qual.Degree || '-'}</td>
                                                <td>{qual.Subject || '-'}</td>
                                                <td>{qual.University || '-'}</td>
                                                <td>{qual.MarksObtained || '-'}</td>
                                                <td>{qual.MaximumMarks || '-'}</td>
                                                <td>{qual.Class || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                                </>
                                
                            ) : (
                                <div className="empty-data" style={{ padding: 0 }}>N/A</div>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Training Details */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <th colSpan="4">Training Details</th>
                    </tr>
                    <tr>
                        <td colSpan="4">
                            {trainings.length > 0 ? (
                                <table className="table GridView text-center">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '30%' }}>Course Name</th>
                                            <th style={{ width: '50%' }}>Course Conducted By</th>
                                            <th style={{ width: '10%' }}>From Date</th>
                                            <th style={{ width: '10%' }}>To Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trainings.map((training, index) => (
                                            <tr key={index}>
                                                <td>{training.Course || '-'}</td>
                                                <td>{training.CourseConductedby || '-'}</td>
                                                <td>{training.FromDate || '-'}</td>
                                                <td>{training.ToDate || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-data" style={{ padding: 0 }}>N/A</div>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Additional Details */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <th colSpan="4">Additional Details</th>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right', width: '25%' }}>Blood Group</td>
                        <td style={{ width: '25%' }}>
                            <span className="labelFont">{additional.BloodGroup || 'N/A'}</span>
                        </td>
                        <td style={{ textAlign: 'right', width: '15%' }}>Mother Tongue</td>
                        <td style={{ width: '35%' }}>
                            <span className="labelFont">{additional.MotherTongue || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="4">
                            {languages.length > 0 ? (
                                <table className="table GridView text-center">
                                    <thead>
                                        <tr>
                                            <th>Language</th>
                                            <th>Read</th>
                                            <th>Write</th>
                                            <th>Speak</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {languages.map((lang, index) => (
                                            <tr key={index}>
                                                <td>{lang.Language || '-'}</td>
                                                <td>{lang.Read || '-'}</td>
                                                <td>{lang.Write || '-'}</td>
                                                <td>{lang.Speak || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-data" style={{ padding: 0 }}>N/A</div>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Bank Details */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <th colSpan="4">Bank Details</th>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right', width: '25%' }}>Type Of Account</td>
                        <td style={{ width: '25%' }}>
                            <span className="labelFont">{bank.AccountType || 'N/A'}</span>
                        </td>
                        <td style={{ textAlign: 'right', width: '25%' }}>Account Number</td>
                        <td style={{ width: '25%' }}>
                            <span className="labelFont">{bank.AccountNo || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Name Of Account Holder</td>
                        <td>
                            <span className="labelFont">{bank.AccountHolderName || 'N/A'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>Bank IFSC Code</td>
                        <td>
                            <span className="labelFont">{bank.IFSCCode || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>Bank Name</td>
                        <td>
                            <span className="labelFont">{bank.BankName || 'N/A'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>Branch Name</td>
                        <td>
                            <span className="labelFont">{bank.BranchName || 'N/A'}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'right' }}>PAN Number</td>
                        <td colSpan="3">
                            <span className="labelFont">{bank.PANNo || 'N/A'}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Work Experience */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <th colSpan="4">Work Experience Details</th>
                    </tr>
                    <tr>
                        <td colSpan="4">
                            {workExp.length > 0 ? (
                                <table className="table GridView text-center">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '25%' }}>Name of Establishment</th>
                                            <th style={{ width: '25%' }}>Address</th>
                                            <th style={{ width: '20%' }}>Job Role</th>
                                            <th style={{ width: '8%' }}>From Date</th>
                                            <th style={{ width: '8%' }}>To Date</th>
                                            <th style={{ width: '14%' }}>Stipend / Salary Per Month (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workExp.map((exp, index) => (
                                            <tr key={index}>
                                                <td style={{ textAlign: 'left' }}>{exp.EstablishmentName || '-'}</td>
                                                <td style={{ textAlign: 'left' }}>{exp.Address || '-'}</td>
                                                <td>{exp.JobRole || '-'}</td>
                                                <td>{exp.FromDate || '-'}</td>
                                                <td>{exp.ToDate || '-'}</td>
                                                <td>{exp.SalaryPerMonth || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-data" style={{ padding: 0 }}>N/A</div>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
            {/* Applied Institute Details */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <th colSpan="5">Applied Institute Details</th>
                    </tr>
                    <tr>
                        <td colSpan="5">
                            {appliedCourseData.length > 0 ? (
                                <table className="table GridView text-center">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '10%' }}>Institute Code</th>
                                            <th style={{ width: '35%' }}>Institute Name</th>
                                            <th style={{ width: '10%' }}>Course Code</th>
                                            <th style={{ width: '30%' }}>Course</th>
                                            <th style={{ width: '15%' }}>Course Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appliedCourseData.map((course, index) => (
                                            <tr key={index}>
                                                <td>{course.InstituteCode || '-'}</td>
                                                <td style={{ textAlign: 'left' }}>{course.InstituteName || '-'}</td>
                                                <td>{course.CourseCode || '-'}</td>
                                                <td style={{ textAlign: 'left' }}>{course.Course || '-'}</td>
                                                <td>{course.CourseType || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-data" style={{ padding: 0 }}>No Applied Institutes</div>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Declaration and Signature */}
            <table className="table application-form">
                <tbody>
                    <tr>
                        <th colSpan="2" style={{ textAlign: 'center' }}>
                            Declaration
                        </th>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <div style={{ textAlign: 'justify', marginBottom: '0px' }}>
                                I hereby declare & understand that,
                                <ol>
                                    <li>
                                        I have read the course curriculum and I fulfilling the Minimum Entry Qualification, Mandatory Criteria at Entry Qualification, Minimum Age and other relevant Eligibility Criteria for admission.
                                    </li>
                                    <li>
                                        I understand that my admission shall be confirmed after verification of my eligibility for admission, documents verification and payment of training fees to the respective Institute.
                                    </li>
                                    <li>
                                        All the information furnished by me in this online application is true, complete and correct to the best of my knowledge and belief.
                                    </li>
                                    <li>
                                        Entire information furnished by me in this application is final and binding to me.
                                    </li>
                                    <li>
                                        If any information furnished by me is found to be false or incorrect, I shall be liable for appropriate action and my admission shall be cancelled at any stage during course duration.
                                    </li>
                                    <li>
                                        If any information furnished by me is found to be false or incorrect even after my course completion, the Board shall have the authority to cancel/ cease Certificate issued to me.
                                    </li>
                                    <li>
                                        I shall pay the required Admission and Examination fees to Board.
                                    </li>
                                </ol>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ width: '60%' }}>
                            Place: ____________________ &nbsp;&nbsp;&nbsp;&nbsp;
                            Date: {new Date().toLocaleDateString('en-IN')}
                        </td>
                        <td
                            style={{
                                width: '40%',
                                verticalAlign: 'bottom',
                                textAlign: 'center',
                                paddingTop: '0.25rem'
                            }}
                            rowSpan="4"
                        >
                            <img
                                src={primary.SignFilePath || ''}
                                width="133"
                                height="57"
                                alt="Signature"
                            />
                            <br />
                            Candidate Signature
                            <br />
                            (
                            <span className="labelFont">
                                {`${primary.FirstName || ''} ${primary.MiddleName || ''} ${primary.LastName || ''}`.trim()}
                            </span>
                            )
                        </td>
                    </tr>
                    <tr>
                        <td style={{ width: '60%' }}>
                            Printed on :{' '}
                            <span className="labelFont">
                                {new Date().toLocaleString('en-IN')}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ width: '60%' }}>
                            Last modified on :{' '}
                            <span className="labelFont">
                                {formatExactDate(appsummary.LastModifiedOn)}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ width: '60%' }}>
                            Last modified by :{' '}
                            <span className="labelFont">
                                {appsummary.LastModifiedBy},{' '}
                                {appsummary.LastModifiedByIPAddress}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'center' }} colSpan="2">
                            !! कौशल्यम् बलम् !
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default PrintApplicationForm;
