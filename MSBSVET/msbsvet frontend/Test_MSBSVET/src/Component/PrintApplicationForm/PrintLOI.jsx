import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import BoardLogo from '../../assets/Board Logo - small size.jpg'
import independencedayindia20 from '../../assets/independencedayindia20.jpg'
import agent from '../../lib/api/agent'
import { useLoading } from '../../Hooks/useLoading'
import {
  GetPromoterDetailsByInstituteID,
  GetPromotingOrganisationIDByInstituteID,
  PromotingOrgGetProposedInstituteDetails
} from '../../Endpoints_All/Base/Institute'
import { GetInspectionUnitDetails } from '../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess'  // ✅ Use this for courses
import { GetSelfDeclarationPath } from '../../Endpoints_All/Institute/existinginstitute'
import { getDeviceIP } from '../../utils/CommonHelper'
import { useAuth } from '../../Hooks/AuthContext'

const PrintLOI = () => {
  const { startLoading, stopLoading, isLoading } = useLoading()
  const { userInfo } = useAuth();
  const [searchParams] = useSearchParams()

  const p1 = searchParams.get('P1')
  const p2 = searchParams.get('P2')

  const [validatedInstituteId, setValidatedInstituteId] = useState(null)
  const [userLoginID, setUserLoginID] = useState(null)
  const [error, setError] = useState(null)
  const [ipAddress, setIpAddress] = useState("");

  const [instituteProfile, setInstituteProfile] = useState(null)
  const [courseData, setCourseData] = useState([])
  const [inspectionDateRange, setInspectionDateRange] = useState(null)
  const [authorizedPerson, setAuthorizedPerson] = useState(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [loiDates, setLoiDates] = useState({ issueDate: '', expiryDate: '' })

  const dataFetchedRef = useRef(false)

  const strings = {
    WebSiteHeader1: 'Government of Maharashtra',
    WebSiteHeader2: 'Skill, Employment, Entrepreneurship and Innovation Department',
    WebSiteHeader3: 'Maharashtra State Board of Skill, Vocational Education and Training',
    WebSiteHeader4: 'Letter of Intent (LoI)',
    lblRegistratioNoHeading: 'Registration No',
    SrNo: 'S.N.',
    lblCourseHeading: 'Course',
    ApprovedUnits: 'Approved Units',
    TotalUnits: 'Total Units'
  }

  const stripHtmlTags = (html) => {
    if (!html) return ''
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }


   const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };

  const fetchLOIDates = async () => {
    try {
     
      const payload = {
        InstituteId: validatedInstituteId,
        UserLoginID: userInfo?.UserLoginID,
        PageCode: 'LOIGeneration',
        IPAddress: ipAddress
      }

      const response = await agent.post(GetSelfDeclarationPath, payload)
      

      if (response.data?.Status === 'Success' && response.data?.Data) {

        let dataArray = response.data.Data
        if (dataArray.Table && Array.isArray(dataArray.Table)) {
          dataArray = dataArray.Table;
        }

        if (dataArray && dataArray.length > 0) {
          const firstItem = dataArray[0];

          if (firstItem.LetterOfIntentIssueDate && firstItem.LetterOfIntentIssueDate !== '') {
            setLoiDates({
              issueDate: firstItem.LetterOfIntentIssueDate,
              expiryDate: firstItem.LetterOfIntentExpiryDate || ''
            })
          } else {

          }
        }
      } else {
      }
    } catch (error) {
      console.error('Error fetching LOI dates:', error)
      console.error('Error response:', error.response?.data)
    }
  }
  const handleAuthorizedRepClick = () => {
    if (!authorizedPerson?.staffId || !authorizedPerson?.userLoginId) return

    const popupWidth = 1000
    const popupHeight = 750
    const left = (window.screen.width - popupWidth) / 2
    const top = (window.screen.height - popupHeight) / 2

    window.open(
      `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${authorizedPerson.staffId}&userLoginID=${authorizedPerson.userLoginId}`,
      'StaffProfile',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  }

 useEffect(() => {
    if (!userInfo) return;

    if (p1 && p2) {
        const instituteId = parseInt(p1, 10);

        if (!isNaN(instituteId)) {
            setValidatedInstituteId(instituteId);
            setUserLoginID(userInfo.UserLoginID);
            setError(null);
        } else {
            setError('Invalid institute ID.');
        }
    } else {
        if (userInfo.UserLoginID) {
            setUserLoginID(userInfo.UserLoginID);
            fetchInstituteIdFromLogin(userInfo.UserLoginID);
        } else {
            setError('No valid institute ID found.');
        }
    }
}, [p1, p2, userInfo]);

  useEffect(() =>{
    fetchIP();
    
  },[]);

  useEffect(() => {
    
    if (!isLoading && instituteProfile && courseData.length > 0) {
      const timer = setTimeout(() => {
        window.print()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, instituteProfile, courseData])

  // Fetch Institute ID from login
  const fetchInstituteIdFromLogin = async (loginID) => {
    startLoading()
    try {
      const GetInstituteIDByInstituteCode = '/Base/GetInstituteIDByInstituteCode'
      const res = await agent.get(`${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`)

      if (res.data?.Data && res.data.Data > 0) {
        setValidatedInstituteId(res.data.Data)
        setError(null)
      } else {
        setError('Institute not found for this login.')
        stopLoading()
      }
    } catch (err) {
      console.error('Error fetching institute ID:', err)
      setError('Failed to fetch institute details. Please try again.')
      stopLoading()
    }
  }

  useEffect(() => {
    if (validatedInstituteId && userLoginID && !dataFetchedRef.current) {
      dataFetchedRef.current = true
      fetchAllData()
    }
  }, [validatedInstituteId, userLoginID])
  useEffect(() => {
    if (instituteProfile?.InstituteCode && loiDates.issueDate) {
      const formattedDate = formatDate(loiDates.issueDate)
      const qrText = `${instituteProfile.InstituteCode}, LoI Date : ${formattedDate}`
      
      generateQRCode(qrText)
    }
  }, [instituteProfile, loiDates.issueDate])

  const fetchAllData = async () => {
    startLoading()
    try {
      await Promise.all([
        fetchInstituteProfile(),
        fetchCourseData(),
        fetchLOIDates(),
      ])

      if ((!loiDates.issueDate || loiDates.issueDate === '') && inspectionDateRange) {
        setLoiDates({
          issueDate: inspectionDateRange.LoIIssuanceDate || '',
          expiryDate: inspectionDateRange.LoIExpiryDate || ''
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data. Please try again.')
    } finally {
      stopLoading()
    }
  }

  const fetchInstituteProfile = async () => {
    try {
      // 🔹 Step 1: Get profile (no change)
  
      const res = await agent.get(
        `${PromotingOrgGetProposedInstituteDetails}/${validatedInstituteId}/${userLoginID}`
      );
        console.log('fetchInstituteProfile response:mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', validatedInstituteId);
      if (res.data?.Status === 'Success' && res.data?.Data) {
        const d = res.data.Data;
        setInstituteProfile(d);
        let finalInstituteId = validatedInstituteId;

        try {
          const convertRes = await agent.get(
            `/Base/GetPromotingOrganisationIDByTempInstituteID/${validatedInstituteId}`
          );

          if (convertRes.data?.Data) {
            finalInstituteId = convertRes.data.Data;
          }

        } catch (err) {
          console.error("ID conversion failed:", err);
        }

        let payload = {
          instituteId: validatedInstituteId,
          exitInstituteID: 0,
          userLoginID: userLoginID,
          pageCode: 'LOIGeneration',
          itemId: 0,
          ipAddress: ipAddress
        };
        if (parseInt(userInfo?.UserTypeID) === 81) {
          payload = {
              instituteId: validatedInstituteId,   //finalInstituteId
            exitInstituteID: 0,
            userLoginID: userLoginID,
            pageCode: 'LOIGeneration',
            itemId: 0,
            ipAddress: ipAddress
          };
        }
        if (parseInt(userInfo?.UserTypeID) === 64) {
          payload = {
              instituteId: validatedInstituteId,
            exitInstituteID: 0,
            userLoginID: userLoginID,
            pageCode: 'LOIGeneration',
            itemId: 0,
            ipAddress: ipAddress
          };
        }

        const response = await agent.post(GetPromoterDetailsByInstituteID, payload);
        


        if (response.data?.Data?.length > 0) {
          const promoter = response.data.Data.find(
            (p) => p.PromoterType === "Authorized Representative"
          );

          const staffProfileId = promoter?.StaffProfileId || 'N/A';
          const codeMatch = staffProfileId.match(/>([^<]+)</);
          const code = codeMatch ? codeMatch[1] : '';


          if (promoter) {
            setAuthorizedPerson({
              name: `${promoter.Title} ${promoter.FirstName} ${promoter.MiddleName} ${promoter.LastName}`,
              code: code,
              staffId: promoter.StaffId,
              userLoginId: promoter.UserLoginID
            });
          }
        }
      }
    } catch (err) {
      console.error('fetchInstituteProfile error:', err);
      setError('Failed to fetch institute profile.');
    }
  };



  const fetchCourseData = async () => {
    try {
    
      let data = [];


      const payload = {
        instituteId: validatedInstituteId,
        exitInstituteID: 0,
        userLoginID: userInfo?.UserLoginID,
        pageCode: 'LOIGeneration',
        itemId: 0,
        ipAddress: ipAddress
      };

      const res = await agent.post(
        "/api/InstituteBase/GetProposedCourseUnitDetails",
        payload
      );


      if (res.data?.Status === 'Success') {
        data = res?.data?.Data?.Table?.map((item, idx) => ({
          ...item,
          SN: idx + 1
        }));
        // }
      }

      setCourseData(data);

    } catch (err) {
      console.error('fetchCourseData error:', err);
    }
  };

  // const totals = courseData.reduce(
  //   (acc, c) => ({
  //     ApprovedUnits: acc.ApprovedUnits + (c.ApprovedUnits ?? 0),
  //     LOIProposedUnits: acc.LOIProposedUnits + (c.LOIProposedUnits ?? 0),
  //     TotalUnits: acc.TotalUnits + (c.TotalUnits ?? 0),
  //     InspectionFee: acc.InspectionFee + (c.PerUnitInspectionFees ?? 0),
  //     SecurityDeposit: acc.SecurityDeposit + (c.PerUnitSecurityDeposit ?? 0),
  //   }),
  //   { ApprovedUnits: 0, LOIProposedUnits: 0, TotalUnits: 0, InspectionFee: 0, SecurityDeposit: 0 }
  // )
  const totals = courseData.reduce(
    (acc, c) => ({
      ApprovedUnits: acc.ApprovedUnits + (c.ApprovedUnits ?? 0),
      LOIProposedUnits: acc.LOIProposedUnits + (c.LOIProposedUnits ?? 0),
      TotalUnits: acc.TotalUnits + (c.LOITotalUnits ?? 0),

      InspectionFee:
        acc.InspectionFee +
        (c.InspectionFee ?? 0),

      SecurityDeposit:
        acc.SecurityDeposit +
        (c.SecurityDeposit ?? 0),
    }),
    { ApprovedUnits: 0, LOIProposedUnits: 0, TotalUnits: 0, InspectionFee: 0, SecurityDeposit: 0 }
  );

  const generateQRCode = async (text) => {
    try {
      const url = await QRCode.toDataURL(text, {
        width: 150,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'Q'
      })
      
      setQrCodeDataUrl(url)
    } catch (err) {
      console.error('QR generation failed', err)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'



    if (dateString instanceof Date) {
      const day = String(dateString.getDate()).padStart(2, '0')
      const month = String(dateString.getMonth() + 1).padStart(2, '0')
      const year = dateString.getFullYear()
      return `${day}/${month}/${year}`
    }


    if (typeof dateString === 'string') {

      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0]
        const [year, month, day] = datePart.split('-')
        if (year && month && day) {
          return `${day}/${month}/${year}`
        }
      }
      if (dateString.includes('-') && !dateString.includes('/')) {
        const [year, month, day] = dateString.split('-')
        if (year && month && day) {
          return `${day}/${month}/${year}`
        }
      }
      if (dateString.includes('/')) {
        const parts = dateString.split('/')
        if (parts.length === 3) {
          if (parts[0].length <= 2) {
            return dateString
          }
          const [month, day, year] = parts
          return `${day}/${month}/${year}`
        }
      }
    }

    try {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      }
    } catch (e) {
      console.error('Date parsing error:', e)
    }

    return String(dateString)
  }

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='text-red-600 font-semibold mb-2'>{error}</div>
        </div>
      </div>
    )
  }

  if (isLoading || !instituteProfile) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        {/* <div className='text-center'>
          <div className='text-lg font-semibold mb-2'>Loading LOI Data...</div>
        </div> */}
      </div>
    )
  }

  const p = instituteProfile

  return (
    <div className='bg-white p-4 md:p-6 min-h-screen'>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
                .no-print { display: none; }
                body { 
                    background-color: white !important; 
                    margin: 0 !important; 
                    padding: 0 !important;
                }
                .print-container {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                * { 
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact;
                }
            }
            @page {
                size: A4;
                margin: 0.4cm;
            }
            /* Match ASPX styles */
            .application-form {
                width: 100%;
                border-collapse: collapse;
            }
            .border-gray-300 {
                border-color: #c5d3d3;
            }
            .bg-gray-100 {
                background-color: #f0f1f4;
            }
            .bg-gray-50 {
                background-color: #f9fafb;
            }
            .sub-title {
                font-size: 12px;
            }
            .main-title {
                font-size: 14px;
            }
            .main-title1 {
                font-size: 18px;
            }
            .india-logo {
                height: 120px;
                width: auto;
            }
            .logo-image {
                height: 110px;   
                width: auto;     
            }
        `
        }}
      />

      <div className='print-container max-w-full mx-auto'>
        {/* Header Section */}
        <div className='max-w-full mx-auto bg-white border border-gray-300 shadow-sm mb-2'>
          <div className='p-4 border-b border-gray-300'>
            <div className='flex justify-between items-center text-center'>
              <img src={independencedayindia20} alt='Emblem' className='h-20' />
              <div className='flex-1 px-4'>
                <h1 className='text-sm font-semibold whitespace-nowrap'>{strings.WebSiteHeader1}</h1>
                <h2 className='text-sm whitespace-nowrap'>{strings.WebSiteHeader2}</h2>
                <h2 className='text-md font-bold text-blue-900 whitespace-nowrap'>{strings.WebSiteHeader3}</h2>
                <h3 className='text-lg font-bold mt-1 whitespace-nowrap'>{strings.WebSiteHeader4}</h3>
              </div>
              <img src={BoardLogo} alt='Logo' className='h-20' />
            </div>
          </div>
        </div>

        {/* LOI Header */}
        <div className='border border-gray-300 mb-2'>
          <div className='text-center p-2 border-b border-gray-300'>
            <span className='font-normal'>{strings.lblRegistratioNoHeading} : </span>
            <span className='font-bold'>{p?.InstituteCode || 'N/A'}</span>
          </div>

          <div className='text-center p-2'>
            <span className='font-normal'>LoI Issuance Date : </span>
            <span className='font-bold'>{loiDates.issueDate ? formatDate(loiDates.issueDate) : 'N/A'}</span>
          </div>



        </div>
        {/* Content Paragraph */}
        <div className='border border-gray-300 mb-2'>
          <div className='p-4 text-justify text-sm leading-relaxed'>
            <p>
              <span className='font-bold'>{authorizedPerson?.name || 'N/A'}</span>
              {authorizedPerson?.code && (
                <span
                  onClick={handleAuthorizedRepClick}
                  className='font-bold text-blue-600 underline cursor-pointer ml-1'
                >
                  ({authorizedPerson.code})
                </span>
              )}{' '}
              authorized representative for{' '}
              <span className='font-bold'>{p?.InstituteName || 'N/A'} SKILL DEVELOPMENT INSTITUTE</span> has applied online for new courses under
              Maharashtra State Board of Skill, Vocational Education and Training vide application no.{' '}
              <span className='font-bold'>{p?.InstituteCode || 'N/A'}</span> on{' '}
              <span className='font-bold'>{loiDates.issueDate ? formatDate(loiDates.issueDate) : 'N/A'}</span>. Based on the information and self declaration submitted
              by the applicant, this Letter of Intent is issued for following courses:
            </p>
          </div>
        </div>

        {/* Course Grid */}
        <div className='border border-gray-300 mb-2 overflow-x-auto'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border border-gray-300 p-2 text-center w-[5%]'>{strings.SrNo}</th>
                <th className='border border-gray-300 p-2 text-center'>{strings.lblCourseHeading}</th>
                <th className='border border-gray-300 p-2 text-center w-[10%]'>{strings.ApprovedUnits}</th>
                <th className='border border-gray-300 p-2 text-center w-[10%]'>LOI Units</th>
                <th className='border border-gray-300 p-2 text-center w-[10%]'>{strings.TotalUnits}</th>
                <th className='border border-gray-300 p-2 text-center w-[12%]'>Inspection Fees </th>
                <th className='border border-gray-300 p-2 text-center w-[12%]'>Security Deposit </th>
              </tr>
            </thead>
            <tbody>
              {courseData.map((row, idx) => (
                <tr key={idx}>
                  <td className='border border-gray-300 p-2 text-center'>{idx + 1}.</td>
                  <td className='border border-gray-300 p-2 text-center'>{row.CourseWithCourseCode || row.CourseName || 'N/A'}</td>
                  <td className='border border-gray-300 p-2 text-center'>{row.ApprovedUnits?.toLocaleString() || 0}</td>
                  <td className='border border-gray-300 p-2 text-center'>{row.LOIProposedUnits?.toLocaleString() || 0}</td>
                  <td className='border border-gray-300 p-2 text-center'>{row.LOITotalUnits?.toLocaleString() || 0}</td>
                  <td className='border border-gray-300 p-2 text-center pr-4'>{(row.InspectionFee || 0).toLocaleString('en-IN')}</td>
                  <td className='border border-gray-300 p-2 text-center pr-4'>{(row.SecurityDeposit || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {courseData.length > 0 && (
                <tr className='bg-gray-50 font-bold'>
                  <td className='border border-gray-300 p-2 text-center' colSpan={2}>Total</td>
                  <td className='border border-gray-300 p-2 text-center'>{totals.ApprovedUnits.toLocaleString()}</td>
                  <td className='border border-gray-300 p-2 text-center'>{totals.LOIProposedUnits.toLocaleString()}</td>
                  <td className='border border-gray-300 p-2 text-center'>{totals.TotalUnits.toLocaleString()}</td>
                  <td className='border border-gray-300 p-2 text-center pr-4'>{totals.InspectionFee.toLocaleString('en-IN')}</td>
                  <td className='border border-gray-300 p-2 text-center pr-4'>{totals.SecurityDeposit.toLocaleString('en-IN')}</td>
                </tr>
              )}
              {courseData.length === 0 && (
                <tr>
                  <td colSpan={7} className='border border-gray-300 p-4 text-center'>No data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Terms and Conditions */}
        <div className='border border-gray-300 mb-2'>
          <div className='p-4 text-justify text-sm'>
            <ol type='1' className='list-decimal pl-5 space-y-2'>
              <li>This Letter of Intent (LoI) does not mean approval/ affiliation. Institute cannot admit any candidate unless the institute receive Letter of Approval (LoA) and Affiliation Order (AO).</li>
              <li>This Letter of Intent (LoI) is valid for a period of 1 year i.e. <span className='font-bold'>{loiDates.expiryDate ? formatDate(loiDates.expiryDate) : 'N/A'}</span></li>
              <li>Institute has to arrange Training Infrastructure and space as per norms, submit Training Infrastructure details online, pay inspection fees as given in above table and apply for Physical Inspection before the date of expiration of this Letter of Intent.</li>
              <li>Board shall conduct physical inspection and document verification through District Vocational Education and Training Office Committee.</li>
              <li>Based on physical inspection and document verification, Letter of Approval (LoA) shall be issued.</li>
              <li>Institute shall be required to pay Security Deposit, appoint adequate number of staffs, both training and supporting, with requisite qualification and update their information on portal. Board shall subsequently issue Affiliation Order (AO).</li>
              <li>Affiliation Order (AO) shall remain valid for 3 years from the date of issuance. The institution has to apply for renewal of re-affiliation after every 3 years.</li>
              <li>
                Action on Rejected Applications (Letter of Rejection):
                <ol type='i' className='list-disc pl-5 mt-1 space-y-1'>
                  <li>A Letter of Rejection (LoR) shall be issued to the institution which is rejected in documents verification and/or physical inspection. Rejected Institute can raise appeal/ grievance within 30 days.</li>
                  <li>The said institute shall be considered for re-inspection and/ or re-verification for a period of 6 months. For this, the applicant shall be required to submit online Request for Reconsideration (RoR).</li>
                  <li>Applications rejected in re-inspection and/ or re-verification shall not be considered further and institute shall be required to re-submit fresh application.</li>
                </ol>
              </li>
              <li>After Affiliation Order is issued, the affiliated courses shall be run on "Permanently unaided basis" and the management shall provide required funds/ investment in development of land/ building and in providing related infrastructural, instructional and other facilities including qualified staff from time to time and for meeting recurring expenditure as per the norms and standards laid down by the Maharashtra State Board of Skill, Vocational Education and Training.</li>
              <li>Institute is made aware of provisions made in CHAPTER IV- OFFENCES AND PENALTIES of Maharashtra Act No. XX of 2013, 21 August 2013, an act for prohibition of establishment of unauthorized institutions and introduction of unauthorized courses of Studies in Agriculture, Animal and fishery sciences, Health Sciences, Higher, Vocational and Technical education in the State of Maharashtra and for matters connected therewith or incidental thereto.</li>
              <li>Institute is also made aware of provision of Maharashtra Unauthorized Institutions and Unauthorized Courses of Study in Agriculture, Animal and Fishery Sciences, Health Sciences, Higher, Technical and Vocational Education (Complaints, Appeals and Remedial Measures) Rules, 2024.</li>
              <li>The said Letter of Intent (LoI) is not a Letter of Approval (LoA)/ Affiliation Order (AO) for conducting the course but an acknowledgment of the application submitted for intention to establish Skill Development Institute/ Add new courses in Existing Institute. Action shall be taken as per provisions of Maharashtra Act No. XX of 2013 and subsequent rules against Institute that admits any candidate in the proposed courses unless Affiliation Order is issued for the said courses.</li>
            </ol>
          </div>
        </div>
        {/* Footer with QR Code and Signature */}
        <div className='border border-gray-300 mb-2'>
          <div className='flex'>
            <div className='w-1/2 text-center p-4 border-r border-gray-300'>
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt='QR Code' className='h-32 mx-auto' />
              ) : (
                <div className='h-32 w-32 bg-gray-100 mx-auto flex items-center justify-center text-xs'>QR Code</div>
              )}
            </div>
            <div className='w-1/2 text-center p-4'>
              <div className='whitespace-pre-line font-normal text-md mt-14'>
                - Sd -<br />
                (J. M. Lohar)<br />
                Secretary
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className='border border-gray-300'>
          <div className='text-center p-2 bg-gray-50 text-sm'>
            This Letter of Intent is issued through Online System and hence requires no signature.
          </div>
        </div>

        {/* Bottom Text */}
        <div className='border border-gray-300'>
          <div className='text-center p-2 bg-gray-50 text-sm'>
            !! कौशल्यम् बलम् !!
          </div>

        </div>
      </div>
    </div >
  )
}

export default PrintLOI