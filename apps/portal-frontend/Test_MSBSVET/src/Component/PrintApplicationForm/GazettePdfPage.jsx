import React from 'react';
import BoardLogo from '../../assets/Board Logo - small size.jpg';
import independencedayindia from '../../assets/independencedayindia20.jpg';

export const PAGE_WIDTH_PX = 1123;
export const PAGE_HEIGHT_PX = 794;
const MAX_ROWS_PER_PAGE = 13;

const localStyles = `
  .gzt-page * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }

  .gzt-page table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7pt;
  }
    .gzt-page tr {
  vertical-align: middle !important;
}

  .gzt-page th, .gzt-page td {
    padding: 2px 3px;
    border: 1px solid #000;
    font-size: 7pt;
    vertical-align: middle !important;; 
  }
    .gzt-row-even, .gzt-row-odd {
  vertical-align: middle !important;
}
  .gzt-header-info-table td { border: none !important; padding: 2px 4px; font-size: 8pt; }
  .gzt-header-info-table tr + tr td { padding-top: 2px; }
  .gzt-header-info-table .label { font-weight: bold; width: 15%; text-align: left; }
  .gzt-header-info-table .value { font-weight: normal; text-align: left; }

  .gzt-print-header {
    margin-bottom: 5px;
    padding-bottom: 4px;
    border-bottom: 1px solid #000;
  }

  .gzt-header-info-wrap {
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid #000;
  }

  .gzt-section-block {
    margin-bottom: 6px;
  }
  .gzt-section-block:last-of-type {
    margin-bottom: 0;
  }

  .gzt-stat-box {
    border: 1px solid #000;
    padding: 4px 4px;
    text-align: center;
    background: #ffffff;
  }
  .gzt-stat-number { font-weight: bold; font-size: 11pt; }
  .gzt-stat-label { font-size: 6.5pt; color: #000; margin-top: 1px; }

  .gzt-section-header {
    background-color: #e9ecef;
    border: 1px solid #000;
    font-weight: bold;
    padding: 3px 6px;
    font-size: 8pt;
    margin-bottom: 3px;
  }

  .gzt-table-header th {
    background-color: #e9ecef;
    color: #000;
    font-weight: bold;
    padding: 2px 3px;
    border: 1px solid #000;
    font-size: 6.5pt;
    text-align: center;
    vertical-align: middle; 
  }

  .gzt-row-even { background-color: #f8f9fa; }
  .gzt-row-odd { background-color: #ffffff; }

  .gzt-p-4 { padding: 4px; }
  .gzt-border-b { border-bottom: 1px solid #000; }
  .gzt-mt-2 { margin-top: 3px; }
  .gzt-gap-3 { gap: 5px; }

  .gzt-footer {
    border-top: 1px solid #000;
    padding: 4px 0.2in;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 6pt;
    height: auto;
    min-height: 55px;
    max-height: 75px;
  }
  .gzt-footer .footer-left { text-align: left; flex: 1; }
  .gzt-footer .footer-center {
    text-align: center;
    flex: 1.5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }
  .gzt-footer .footer-center .footer-sanskrit {
    font-size: 10pt;
    font-weight: bold;
    font-family: serif;
    color: #000000;
    margin: 0;
    padding: 0;
    line-height: 1.2;
  }
  .gzt-footer .footer-right {
    text-align: right;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
  }
  .gzt-footer .footer-right .signature-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
  }
  .gzt-footer .footer-right .signature-stack img {
    display: block;
    margin: 0 auto 2px;
    max-height: 40px;
    width: auto;
    min-height: 16px;
  }
  .gzt-footer .footer-right .signature-stack .sign-name {
    font-weight: bold;
    font-size: 6.5pt;
    line-height: 1.2;
  }
`;

const GazettePdfPage = ({
    course,
    pageCandidates,
    pageIndex,
    globalPageNumber,
    totalGlobalPages,
    examinationDetails,
    resultDate,
    signature,
}) => {
    const theorySubjects = course.theorySubjects || [];
    const practicalSubjects = course.practicalSubjects || [];

    return (
        <div
            className="gzt-page"
            style={{
                minWidth: PAGE_WIDTH_PX,
                width: 'max-content',
                height: PAGE_HEIGHT_PX,
                background: '#ffffff',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '8pt',
                lineHeight: 1.1,
                boxSizing: 'border-box',
                padding: '0.15in',
                display: 'flex',
                flexDirection: 'column',
                // overflow: 'hidden',  
                color: '#000',
            }}
        >
            <style>{localStyles}</style>

            <div className="gzt-print-header">
                <div className="flex justify-center items-center text-center" style={{ gap: '20px' }}>
                    <img src={independencedayindia} alt="Emblem" className="h-14" style={{ flexShrink: 0 }} />
                    <div style={{ maxWidth: '650px' }}>
                        <h1 className="text-[10px] font-semibold">Government of Maharashtra</h1>
                        <h2 className="text-[12px]">Skill, Employment, Entrepreneurship and Innovation Department</h2>
                        <h2 className="text-[14px] font-bold text-blue-900 whitespace-nowrap">
                            Maharashtra State Board of Skill, Vocational Education and Training
                        </h2>
                        <h3 className="text-sm font-bold mt-1">Result Sheet</h3>
                    </div>
                    <img src={BoardLogo} alt="Logo" className="h-14" style={{ flexShrink: 0 }} />
                </div>

                <div className="gzt-header-info-wrap">
                    <table className="w-full border-collapse gzt-header-info-table">
                        <tbody>
                            <tr>
                                <td className="label font-bold" style={{ width: '15%' }}>Institute :</td>
                                <td className="value" style={{ width: '85%' }}>{course.instituteName}</td>
                            </tr>
                            <tr>
                                <td className="label font-bold">Examination :</td>
                                <td className="value">{examinationDetails?.name} ({examinationDetails?.duration})</td>
                            </tr>
                            <tr>
                                <td className="label font-bold">Course :</td>
                                <td className="value">{course.courseName} {course.courseCode && `(${course.courseCode})`}</td>
                            </tr>
                            <tr>
                                <td className="label font-bold">District :</td>
                                <td className="value">{course.district || ''}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="gzt-p-4 gzt-border-b border-black gzt-section-block">
                <div className="bg-gray-100 px-3 py-1.5 border border-black font-bold text-xs gzt-section-header">
                    Result Statistics
                </div>
                <div className={`grid grid-cols-4 gzt-gap-3 gzt-mt-2`}>
                    <div className="gzt-stat-box border border-black p-2 text-center bg-white">
                        <div className="gzt-stat-number text-lg font-bold">{course.stats.total}</div>
                        <div className="gzt-stat-label text-[10px]">Total Candidates</div>
                    </div>
                    <div className="gzt-stat-box border border-black p-2 text-center bg-white">
                        <div className="gzt-stat-number text-lg font-bold">{course.stats.pass}</div>
                        <div className="gzt-stat-label text-[10px]">Pass</div>
                    </div>
                    <div className="gzt-stat-box border border-black p-2 text-center bg-white">
                        <div className="gzt-stat-number text-lg font-bold">{course.stats.fail}</div>
                        <div className="gzt-stat-label text-[10px]">Fail</div>
                    </div>
                    <div className="gzt-stat-box border border-black p-2 text-center bg-white">
                        <div className="gzt-stat-number text-lg font-bold">{course.stats.hold}</div>
                        <div className="gzt-stat-label text-[10px]">Hold</div>
                    </div>
                </div>
            </div>

            <div className="gzt-p-4 gzt-section-block">
                <div className="bg-gray-100 px-3 py-1.5 border border-black font-bold text-xs gzt-section-header">
                    Result Details ({course.candidates.length} Candidates)
                </div>
                <div className="overflow-x-auto gzt-mt-2">
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead className="gzt-table-header">
                            <tr>
                                <th className="border border-black px-1 py-1 text-center font-bold" style={{ minWidth: '30px' }} rowSpan="2">Sr.</th>
                                <th className="border border-black px-1 py-1 text-center font-bold" style={{ minWidth: '90px' }} rowSpan="2">Application ID</th>
                                <th className="border border-black px-1 py-1 text-center font-bold" style={{ minWidth: '130px' }} rowSpan="2">Candidate Name</th>

                                {theorySubjects.length > 0 && (
                                    <th className="border border-black px-1 py-1 text-center font-bold" style={{ minWidth: `${theorySubjects.length * 45}px` }} colSpan={theorySubjects.length}>
                                        Theory
                                    </th>
                                )}
                                {practicalSubjects.length > 0 && (
                                    <th className="border border-black px-1 py-1 text-center font-bold" style={{ minWidth: `${practicalSubjects.length * 45}px` }} colSpan={practicalSubjects.length}>
                                        Practical
                                    </th>
                                )}

                                <th className="border border-black px-1 py-1 text-center font-bold" style={{ minWidth: '35px' }} rowSpan="2">Total</th>
                                <th className="border border-black px-1 py-1 text-center font-bold" style={{ minWidth: '35px' }} rowSpan="2">Out Of</th>
                                <th className="border border-black px-1 py-1 text-center font-bold" style={{ minWidth: '30px' }} rowSpan="2">Grace</th>
                                <th className="border border-black px-1 py-1 text-center font-bold" style={{ minWidth: '45px' }} rowSpan="2">Grade</th>
                                <th className="border border-black px-1 py-1 text-center font-bold" style={{ minWidth: '35px' }} rowSpan="2">%</th>
                            </tr>
                            <tr>
                                {theorySubjects.map((subject) => (
                                    <th key={`${subject.SubjectCode}_${subject.SubjectType}`} className="border border-black px-0.5 py-1 text-center" style={{ minWidth: '45px' }}>
                                        <div style={{ fontSize: '6pt', fontWeight: 'bold' }}>{subject.SubjectCode}</div>
                                        <div style={{ fontSize: '5.5pt', fontWeight: 'bold' }}>{subject.min} / {subject.max}</div>
                                    </th>
                                ))}
                                {practicalSubjects.map((subject) => (
                                    <th key={`${subject.SubjectCode}_${subject.SubjectType}`} className="border border-black px-0.5 py-1 text-center" style={{ minWidth: '45px' }}>
                                        <div style={{ fontSize: '6pt', fontWeight: 'bold' }}>{subject.SubjectCode}</div>
                                        <div style={{ fontSize: '5.5pt', fontWeight: 'bold' }}>{subject.min} / {subject.max}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pageCandidates.map((candidate, idx) => {
                                const isEven = idx % 2 === 0;
                                const globalSerial = pageIndex * MAX_ROWS_PER_PAGE + idx + 1;
                                return (
                                    <tr key={candidate.ApplicationID} className={isEven ? 'gzt-row-even' : 'gzt-row-odd'}>
                                        <td className="border border-black px-1 py-1 text-center">{globalSerial}</td>
                                        <td className="border border-black px-1 py-1 text-center" style={{ fontSize: '7pt' }}>{candidate.ApplicationIDDisplay}</td>
                                        <td className="border border-black px-1 py-1 text-left" style={{ fontSize: '7pt', fontWeight: '500' }}>{candidate.CandidateName}</td>

                                        {theorySubjects.map((subject) => {
                                            const compositeKey = `${subject.SubjectCode}_${subject.SubjectType}`;
                                            const subjectData = candidate.subjects[compositeKey];
                                            const obt = subjectData ? parseInt(subjectData.obt) : 0;
                                            const min = parseInt(subject.min);
                                            const isPass = obt >= min;
                                            return (
                                                <td key={compositeKey} className="border border-black px-0.5 py-1 text-center" style={{
                                                    fontSize: '7pt', fontWeight: 'bold',
                                                    color: subjectData ? (isPass ? '#2e7d32' : '#c62828') : '#999',
                                                }}>
                                                    {subjectData ? subjectData.obt : '-'}
                                                </td>
                                            );
                                        })}
                                        {practicalSubjects.map((subject) => {
                                            const compositeKey = `${subject.SubjectCode}_${subject.SubjectType}`;
                                            const subjectData = candidate.subjects[compositeKey];
                                            const obt = subjectData ? parseInt(subjectData.obt) : 0;
                                            const min = parseInt(subject.min);
                                            const isPass = obt >= min;
                                            return (
                                                <td key={compositeKey} className="border border-black px-0.5 py-1 text-center" style={{
                                                    fontSize: '7pt', fontWeight: 'bold',
                                                    color: subjectData ? (isPass ? '#2e7d32' : '#c62828') : '#999',
                                                }}>
                                                    {subjectData ? subjectData.obt : '-'}
                                                </td>
                                            );
                                        })}

                                        <td className="border border-black px-1 py-1 text-center font-bold" style={{ fontSize: '7pt' }}>{candidate.TotalMarksObt}</td>
                                        <td className="border border-black px-1 py-1 text-center" style={{ fontSize: '7pt' }}>{candidate.TotalMarksMax}</td>
                                        <td className="border border-black px-1 py-1 text-center" style={{ fontSize: '7pt' }}>{candidate.GraceMarks}</td>
                                        <td className="border border-black px-1 py-1 text-center font-bold" style={{
                                            fontSize: '7pt',
                                            color: candidate.ResultStatus === 'Pass' ? '#2e7d32' : candidate.ResultStatus === 'Fail' ? '#c62828' : '#f57f17',
                                        }}>
                                            {candidate.Grade}
                                        </td>
                                        <td className="border border-black px-1 py-1 text-center" style={{ fontSize: '7pt' }}>{candidate.Percentage}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="gzt-footer" style={{ marginTop: 'auto' }}>
                <div className="footer-left mt-5">
                    <span className="font-bold text-xs">Result Date: {resultDate || '-'}</span>
                    <span style={{ marginLeft: '6px', fontSize: '10pt' }}>|</span>
                    <span className="font-bold text-xs">
                        Printed: {new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                </div>
                <div className="footer-center mt-5">
                    <div className="footer-sanskrit">!! कौशल्यम् बलम् !!</div>
                </div>
                <div className="footer-right">
                    <div className="signature-stack">
                        {signature.signUrl && (
                            <img src={signature.signUrl} crossOrigin="anonymous" width="110" height="30" alt="Signature" />
                        )}
                        <span className="sign-name text-xs">{signature.name || ''}</span>
                        <span className="sign-designation text-xs">{signature.designation || ''}</span>
                    </div>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '0.1in', right: '0.15in', fontSize: '10pt', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {globalPageNumber} / {totalGlobalPages}
            </div>
        </div>
    );
};

export default GazettePdfPage;