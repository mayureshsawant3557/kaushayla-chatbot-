import React, { useState, useEffect } from 'react';
import logonew1 from '../../../assets/logo-new1.jpg';
import logonew2 from '../../../assets/logo-new2.jpg';

const PrintAdmissionRejectionLetter = ({ data }) => {



  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString || '';
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      const formattedDate = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      return `${formattedDate} ${formattedTime}`;
    } catch {
      return dateTimeString || '';
    }
  };

  const maskAadhaar = (aadhaar) => {
    if (!aadhaar || aadhaar === 'N/A' || aadhaar === '') return '';
    if (aadhaar.includes('*')) return aadhaar;
    if (aadhaar.length >= 4) {
      return '*'.repeat(aadhaar.length - 4) + aadhaar.slice(-4);
    }
    return aadhaar;
  };

  // Function to format document verification status
  const formatVerificationStatus = (status) => {
    if (!status) return 'Not Applicable';
    if (status === 'Y') return 'Verified';
    if (status === 'N') return 'Not Verified';
    return status;
  };

  const formatOriginalSubmitted = (status) => {
    if (!status) return 'Not Applicable';
    if (status === 'Y') return 'Yes';
    if (status === 'N') return 'No';
    return status;
  };

  // Deduplicate documents by DocumentName
  const getUniqueDocuments = (documents) => {
    if (!documents || !Array.isArray(documents)) return [];
    const uniqueDocs = [];
    const seenDocNames = new Set();
    for (const doc of documents) {
      if (!seenDocNames.has(doc.documentName)) {
        seenDocNames.add(doc.documentName);
        uniqueDocs.push(doc);
      }
    }
    return uniqueDocs;
  };

  const uniqueDocuments = getUniqueDocuments(data?.documents);

  const HeaderSection = ({ copyType }) => (
    <div className="border border-black p-4 mb-4">
      <div className="flex justify-between items-center text-center">
        <img 
          src={logonew1} 
          alt="Emblem" 
          className="h-20 w-auto object-contain"
        />
        <div className="flex-1 px-4">
          <h1 className="text-sm font-semibold">
            Government of Maharashtra
          </h1>
          <h2 className="text-sm">
            Skill, Employment, Entrepreneurship and Innovation Department
          </h2>
          <h2 className="text-md font-bold text-blue-900">
            Maharashtra State Board of Skill, Vocational Education and Training
          </h2>
          <h3 className="text-lg font-bold mt-1">
            Admission Rejection Slip
          </h3>
        </div>
        <img 
          src={logonew2} 
          alt="Logo" 
          className="h-20 w-auto object-contain"
        />
      </div>
      
      <div className="mt-4 border-t border-black pt-2 text-center text-sm font-semibold">
        <p>{copyType}</p>
        <p>
          Application ID: <span className="font-bold">{data?.applicationId || ''}</span>
        </p>
      </div>
    </div>
  );

  const PrimaryDetailsTable = () => (
    <table className="table application-form">
      <tbody>
        <tr>
          <th colSpan="5">Primary Details</th>
        </tr>
        <tr>
          <td style={{ textAlign: 'right', width: '35%' }}>ITI Registration No.:</td>
          <td style={{ width: '55%' }}><span className="labelFont">{data?.itiRegistrationNo || ''}</span></td>
          <td style={{ textAlign: 'center', width: '10%', verticalAlign: 'top' }} rowSpan="8">
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%'
            }}>
              <div style={{ 
                width: '170px',
                minHeight: '170px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9',
                marginBottom: '10px'
              }}>
                <img
                  src={data?.photoPath || '/Images/photo_not_available_large.png'}
                  alt="Photo"
                  style={{ 
                    width: '100%',
                    height: 'auto',
                    maxHeight: '170px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => { e.target.src = '/Images/photo_not_available_large.png'; }}
                />
              </div>
              
              {data?.signaturePath && (
                <div style={{ 
                  width: '132px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    minHeight: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9f9f9',
                    marginBottom: '5px'
                  }}>
                    <img
                      src={data?.signaturePath}
                      alt="Signature"
                      style={{ 
                        width: '100%',
                        height: 'auto',
                        maxHeight: '50px',
                        objectFit: 'contain'
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    Signature
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Candidate's Name:</td>
          <td><span className="labelFont">{data?.candidateName || ''}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Gender:</td>
          <td><span className="labelFont">{data?.gender || ''}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Date Of Birth (DD/MM/YYYY):</td>
          <td><span className="labelFont">{formatDate(data?.dob)}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Aadhaar Number:</td>
          <td><span className="labelFont">{maskAadhaar(data?.aadhaarNo)}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Primary Mobile Number:</td>
          <td><span className="labelFont">{data?.mobileNo || ''}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Secondary Mobile Number:</td>
          <td><span className="labelFont">{data?.altMobileNo || ''}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>E-Mail ID:</td>
          <td><span className="labelFont">{data?.email || ''}</span></td>
        </tr>
      </tbody>
    </table>
  );

  const InstituteDetailsTable = () => (
    <table className="table application-form">
      <tbody>
        <tr>
          <th colSpan="4">Institute and Course Details</th>
        </tr>
        <tr>
          <td style={{ textAlign: 'right', width: '25%' }}>Institute Code:</td>
          <td colSpan="3"><span className="labelFont">{data?.instituteCode || ''}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Institute Name:</td>
          <td colSpan="3"><span className="labelFont">{data?.instituteName || ''}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Course Code:</td>
          <td colSpan="3"><span className="labelFont">{data?.courseCode || ''}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Course:</td>
          <td colSpan="3"><span className="labelFont">{data?.courseName || ''}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Course Approved by:</td>
          <td colSpan="3"><span className="labelFont">MAHARASHTRA STATE BOARD OF SKILL, VOCATIONAL EDUCATION AND TRAINING (MSBSVET)</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Sector:</td>
          <td><span className="labelFont">{data?.sector || ''}</span></td>
          <td style={{ textAlign: 'right' }}>Sub Sector:</td>
          <td><span className="labelFont">{data?.subSector || ''}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Course Type:</td>
          <td><span className="labelFont">{data?.courseType || ''}</span></td>
          <td style={{ textAlign: 'right' }}>Full Time/ Part Time:</td>
          <td><span className="labelFont">{data?.fullTimePartTime || ''}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Duration:</td>
          <td colSpan="3"><span className="labelFont">{data?.duration || ''}</span></td>
        </tr>
      </tbody>
    </table>
  );

  const RejectionDetailsTable = () => (
    <table className="table application-form">
      <tbody>
        <tr>
          <th colSpan="2">Admission Rejection Details</th>
        </tr>
        <tr>
          <td style={{ textAlign: 'right', width: '30%' }}>Date and Time of Admission Rejection:</td>
          <td><span className="labelFont">{formatDateTime(data?.rejectionDateTime)}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Reason for Rejection:</td>
          <td><span className="labelFont">{data?.rejectionReason || ''}</span></td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>Rejection Comments:</td>
          <td><span className="labelFont">{data?.rejectionComments || ''}</span></td>
        </tr>
      </tbody>
    </table>
  );

  const DocumentsTable = () => (
    <table className="table application-form" style={{ borderTop: "0" }}>
      <tbody>
        <tr>
          <td colSpan="4" style={{ padding: 0 }}>
            <table className="table GridView text-center">
              <thead>
                <tr>
                  <th style={{ width: '7%' }}>Sr. No.</th>
                  <th style={{ width: '63%' }}>List of Document</th>
                  <th style={{ width: '15%' }}>Verified By Institute</th>
                  <th style={{ width: '15%' }}>
                    Original Document Submitted at Institute
                  </th>
                </tr>
              </thead>
              <tbody>
                {uniqueDocuments.length > 0 ? (
                  uniqueDocuments.map((doc, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td style={{ textAlign: "left" }}>{doc.documentName}</td>
                      <td>
                        <span className="labelFont">{formatVerificationStatus(doc.verificationStatus)}</span>
                      </td>
                      <td>
                        <span className="labelFont">{formatOriginalSubmitted(doc.originalSubmitted)}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="empty-data">No documents found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const FeesTable = () => (
    <table className="table application-form">
      <tbody>
        <tr>
          <td style={{ width: '25%' }}>Total Course Fees :</td>
          <td style={{ width: '25%' }}><span className="labelFont">{data?.courseFee || '0'}</span></td>
          <td style={{ width: '25%' }}>Amount paid by Candidate :</td>
          <td style={{ width: '25%' }}><span className="labelFont">{data?.paidCourseFee || '0'}</span></td>
        </tr>
        <tr>
          <td>Refund Amount :</td>
          <td colSpan="3"><span className="labelFont">{data?.refundAmount || '0'}</span></td>
        </tr>
      </tbody>
    </table>
  );

  const DeclarationTable = () => (
    <table className="table application-form">
      <tbody>
        <tr>
          <td>
            <div style={{ textAlign: 'justify', marginBottom: '0px' }}>
              <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                I hereby declare & understand that,
              </p>
              <ol style={{ marginBottom: 0, paddingLeft: '20px' }}>
                <li style={{ textAlign: 'justify' }}>1. I understand that my admission stands rejected due to the reason(s) mentioned above.</li>
                <li style={{ textAlign: 'justify' }}>2. I have been informed about the rejection decision and I accept the same.</li>
                <li style={{ textAlign: 'justify' }}>3. I understand that I will not be eligible for any claims or benefits related to this admission.</li>
                <li style={{ textAlign: 'justify' }}>4. I agree to abide by the rules, regulations, acts, laws, etc. enforced by Government and Institute from time to time.</li>
                <li style={{ textAlign: 'justify' }}>5. The Institute shall have the right to reject admission based on the verification of documents and information provided by me.</li>
              </ol>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const FooterTable = () => (
    <table className="table application-form">
      <tbody>
        <tr>
          <td colSpan="2">
            Printed On : <span className="labelFont">{formatDateTime(new Date())}</span>
          </td>
          <td colSpan="2">
            Printed By : <span className="labelFont">{data?.printedBy || ''}</span>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const SignatureTable = () => (
    <table className="table application-form">
      <tbody>
        <tr>
          <th style={{ width: '20%', textAlign: 'center' }}>&nbsp;</th>
          <th style={{ width: '40%', textAlign: 'center' }}>Admission Authority</th>
          <th style={{ width: '40%', textAlign: 'center' }}>Rejected Candidate</th>
        </tr>
        <tr>
          <td style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold' }}>
            Signature
          </td>
          <td style={{ textAlign: 'center', padding: '8px' }}>
            &nbsp;
          </td>
          <td style={{ textAlign: 'center', padding: '8px' }}>
            &nbsp;
          </td>
        </tr>
        <tr>
          <td style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold' }}>
            Name
          </td>
          <td style={{ textAlign: 'center', padding: '8px' }}>
            &nbsp;
          </td>
          <td style={{ textAlign: 'center', padding: '8px' }}>
            <span className="labelFont" style={{ fontWeight: 'bold' }}>{data?.candidateName || ''}</span>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const MarathiFooter = () => (
    <div className="max-w-full mx-auto mt-1 mb-1 flex flex-col items-center justify-center">
      <h2
        className="text-xl font-bold text-gray-800 tracking-wide"
        style={{ fontFamily: 'serif' }}
      >
        !! कौशल्यम् बलम् !!
      </h2>
    </div>
  );

  return (
    <div>
      <style type="text/css">{`
        body {
            line-height: normal;
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fff;
        }

        .staff-print-application-form {
            font-family: 'Poppins', sans-serif;
            padding: 30px;
            background-color: #fff;
            max-width: 1200px;
            margin: 0 auto;
            min-height: 100vh;
        }

        .application-form {
            width: 100%;
            font-size: 12px;
            border: 1px solid #000;
            margin-bottom: 5px;
            border-collapse: collapse;
        }

        .application-form th {
            background-color: #f0f1f4;
            border: 1px solid #000;
            font-weight: 600;
            color: #000;
            padding: 6px;
            text-align: center;
        }

        .application-form td {
            border: 1px solid #000;
            vertical-align: middle;
            color: #000;
            padding: 6px;
        }

        .table {
            margin: 0px;
            width: 100%;
            border-collapse: collapse;
        }

        .table th {
            padding: 6px;
        }

        .table td {
            padding: 6px;
        }

        .GridView {
            margin: 0px;
            width: 100%;
            border-collapse: collapse;
        }

        .GridView th {
            border: 1px solid #000;
            padding: 6px;
            font-size: 12px;
            font-weight: 500;
            vertical-align: middle;
            background-color: #f0f1f4;
            text-align: center;
        }

        .GridView td {
            border: 1px solid #000;
            padding: 6px;
            font-size: 12px;
            text-align: center;
        }

        .sub-title {
            font-size: 12px;
        }

        .main-title {
            font-size: 16px;
            font-weight: bold;
        }

        .labelFont {
            font-weight: 600 !important;
        }

        .text-lg {
            font-size: 16px;
        }

        .empty-data {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            font-weight: 600;
            color: #666;
        }
        
        .pagebreak {
          break-before: page;
        }

        ol {
            margin-top: 0;
            margin-bottom: 0;
            padding-left: 20px;
        }

        li {
            text-align: justify;
            margin-bottom: 3px;
        }

        @media print {
          body * {
            visibility: hidden;
          }

          .staff-print-application-form,
          .staff-print-application-form * {
            visibility: visible;
          }

          .staff-print-application-form {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }

        .application-form {
            page-break-inside: avoid;
            border: 1px solid #000 !important;
            margin-bottom: 10px;
        }

        .application-form th,
        .application-form td {
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .application-form th {
            background-color: #f0f1f4 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        table {
            page-break-inside: auto;
        }

        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }

        * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
      `}</style>

      <div className="staff-print-application-form">
        {/* CANDIDATE COPY */}
        <HeaderSection copyType="CANDIDATE COPY" />
        <PrimaryDetailsTable />
        <InstituteDetailsTable />
        <RejectionDetailsTable />
        <DocumentsTable />
        <FeesTable />
        <DeclarationTable />
        <FooterTable />
        <SignatureTable />
        <MarathiFooter />

        <div className="pagebreak"></div>

        {/* INSTITUTE COPY */}
        {data?.userTypeId != 91 && (
          <>
        <HeaderSection copyType="INSTITUTE COPY" />
        <PrimaryDetailsTable />
        <InstituteDetailsTable />
        <RejectionDetailsTable />
        <DocumentsTable />
        <FeesTable />
        <DeclarationTable />
        <FooterTable />
        <SignatureTable />
        <MarathiFooter />
        
      </>
        )}
      </div>
    </div>
  );
};

export default PrintAdmissionRejectionLetter;