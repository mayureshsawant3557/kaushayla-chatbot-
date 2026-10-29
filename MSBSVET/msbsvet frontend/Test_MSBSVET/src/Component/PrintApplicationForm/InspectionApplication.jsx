import React, { useState, useEffect, useRef } from 'react'
import agent from '../../lib/api/agent' // adjust path as needed
import verified from '../../assets/VerifiedIcon.jpg'
import rejected from '../../assets/NotVerifiedIcon.jpg'
import BoardLogo from '../../assets/Board Logo - small size.jpg'
import independencedayindia from '../../assets/independencedayindia20.jpg'
import { useLoading } from '../../Hooks/useLoading'

// ─── Endpoint Imports ───────────────────────────────────────────────────────
import {
  GetInstituteIDByInstituteCode,
  PromotingOrgGetProposedInstituteDetails,
  GetAssociatedInstituteByPromotingOrganisationID,
  GetPromotingOrganisationIDByInstituteID,
  GetPromoterDetailsByInstituteID,
  GetPromotingOrganisationDetails
} from '../../Endpoints_All/Base/Institute'

import {
  GetInspectionUnitDetails,
  GetBuildingDetails,
  GetBuildingSpaceasperNormsAnalysis,
  GetLandDetails,
  GetWorkshopDetails,
  GetTrainingEquipmentDetails,
  GetMasterSubFacilityGroup,
  GetSubFacilityDetails,
  GetOtherInfraDetails,
  GetInstitutePowerDetails,
  GetInstituteInspectionDateRange,
  GetInstituteBankDetails,
  GetInstituteInspectionAgencyList
} from '../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess'

import Staff_PrintApplicationForm from '../PrintApplicationForm/Staff_PrintApplicationForm'

import { TransactionHistory } from '../../Endpoints_All/Fee/feeManagement'
import InstituteDetailsPrint from './InstituteDtails'
import { getDeviceIP } from '../../utils/CommonHelper'
import { useAuth } from '../../Hooks/AuthContext'
//import {InstituteDetailsPrint} from './InstituteDtails'

// ─── Sub-components ──────────────────────────────────────────────────────────
const Table = ({ title, children, className = '' }) => (
  <table
    className={`w-full border-collapse border border-black text-sm ${className}`}
  >
    {title && (
      <tbody>
        <tr className='bg-gray-50'>
          <th
            colSpan={4}
            className='text-left p-2 border border-black font-bold'
          >
            {title}
          </th>
        </tr>
      </tbody>
    )}
    {children}
  </table>
)

const Row = ({ label, value, colSpan = 1, bold = false }) => (
  <tr>
    <td className='p-2 border border-black font-semibold bg-gray-50 w-1/4'>
      {label}
    </td>
    <td
      colSpan={colSpan}
      className={`p-2 border border-black ${bold ? 'font-semibold' : ''}`}
    >
      {value ?? '—'}
    </td>
  </tr>
)

const DataTable = ({ headers, rows }) => (
  <table className='w-full border-collapse border border-black text-xs text-center'>
    <thead>
      <tr className='bg-gray-100'>
        {headers.map((h, i) => (
          <th key={i} className='border border-black p-2 font-semibold'>
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.length === 0 ? (
        <tr>
          <td
            colSpan={headers.length}
            className='border border-black p-2 text-gray-400 italic'
          >
            No data
          </td>
        </tr>
      ) : (
        rows.map((r, i) => (
          <tr key={i} className={r.__rowClassName || ''}>
            {r.__cells
              ? r.__cells.map((c, j) => (
                <td key={j} className='border border-black p-2'>
                  {c ?? '—'}
                </td>
              ))
              : r.map((c, j) => (
                <td key={j} className='border border-black p-2'>
                  {c ?? '—'}
                </td>
              ))}
          </tr>
        ))
      )}
    </tbody>
  </table>
)

const SectionHeader = ({ title }) => (
  <div className='bg-gray-100 p-2 border border-black font-bold text-sm mt-2 mb-0'>
    {title}
  </div>
)

const LoadingSpinner = () => (
  <div className='flex items-center justify-center p-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
    <span className='ml-2 text-gray-600'>Loading...</span>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InspectionApplicationForm() {
  // loader
  const { startLoading, stopLoading, isLoading } = useLoading()

  // ── Core IDs
  const [instituteID, setInstituteID] = useState(null)
  const [userLoginID, setUserLoginID] = useState('')
  const [userTypeID, setUserTypeID] = useState('')
  const [promotingOrgId, setPromotingOrgId] = useState(null)


  // ── Loading / Error
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Section Data States
  const [instituteProfile, setInstituteProfile] = useState(null)
  const [promotingOrg, setPromotingOrg] = useState(null)
  const [authorizedRep, setAuthorizedRep] = useState(null)
  const [principalPromoter, setPrincipalPromoter] = useState(null)
  const [members, setMembers] = useState([])
  const [affiliatedInstitutes, setAffiliatedInstitutes] = useState([])
const [ipAddress, setIpAddress] = useState("");
  const [courseData, setCourseData] = useState([])
  const [buildings, setBuildings] = useState([])
  const [spaceNorms, setSpaceNorms] = useState([])
  const [buildingRemark, setBuildingRemark] = useState('')
  const [landDetails, setLandDetails] = useState([])
  const [workshopDetails, setWorkshopDetails] = useState([])

  const [trainingEquipment, setTrainingEquipment] = useState([])
  const [trainingEquipmentRemark, setTrainingEquipmentRemark] = useState('')
  const [commonFacilities, setCommonFacilities] = useState([])
  const [otherInfra, setOtherInfra] = useState(null)
  const [powerDetails, setPowerDetails] = useState(null)
  const [powerTableData, setPowerTableData] = useState([])
    const [transactionData, setTransactionData] = useState([])
  const [bankData, setBankData] = useState([])
   const {userInfo} = useAuth();
  // const [bankData, setBankData] = useState(null)

  const [inspectionDateRange, setInspectionDateRange] = useState(null)
  const [inspectionAgency, setInspectionAgency] = useState(null)

  const [printData, setPrintData] = useState(null)

  const dataFetchedRef = useRef(false)

  // ── Step 1: Get user info & institute ID from session
  useEffect(() => {
    const init = async () => {
      try {


        const params = new URLSearchParams(window.location.search);
        const p1 = params.get("P1"); // instituteID
        const p2 = params.get("P2"); // userLoginID

        if (p1 && p2) {
          setInstituteID(Number(p1));
          setUserLoginID(p2);
          setUserTypeID(localStorage.getItem("userTypeID") || "1");
          return;
        }

       
        const loginID = userInfo?.UserLoginID || ''
        const typeID =
          userInfo?.UserTypeID || localStorage.getItem('userTypeID') || '1'
        setUserLoginID(loginID)
        setUserTypeID(typeID)

        if (!loginID) {
          setError('User not logged in. Please login again.')
          stopLoading()
          return
        }

        // Fetch InstituteID by InstituteCode (loginID acts as institute code)
        const res = await agent.get(
          `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`
        )
        if (res.data?.Data) {
          setInstituteID(res.data.Data)
        } else {
          setError('Institute not found for this login.')
          stopLoading()
        }
      } catch (err) {
        console.error('Init error:', err)
        setError('Failed to initialize. Please refresh.')
        stopLoading()
      }
    }
    init()
  }, [])

  // ── Step 2: Fetch all sections once instituteID is known
  useEffect(() => {
    if (!instituteID || dataFetchedRef.current) return
    dataFetchedRef.current = true
    fetchAllData()
  }, [instituteID])

  //to print
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        window.print()
      }, 3000) // give DOM time to remove loader
      return () => clearTimeout(timer)
    }
  }, [isLoading])


  useEffect (() =>{
    fetchIP();
  },[]);

  const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };

  const fetchAllData = async () => {
    startLoading()
    try {
      await Promise.allSettled([
        fetchInstituteProfile(),
        fetchCourseData(),
        fetchBuildingDetails(),
        fetchSpaceNorms(),
        fetchLandDetails(),
        fetchWorkshopDetails(),
        fetchTrainingEquipment(),
        fetchCommonFacilities(),
        fetchOtherInfra(),
        fetchPowerDetails(),
        fetchTransactionHistory(),
        fetchInspectionDateRange(),
        fetchInspectionAgency(),
        fetchBankDetails()
      ])
    } finally {
      stopLoading()
    }
  }

  // ── Section Fetchers ───────────────────────────────────────────────────────

  const fetchInstituteProfile = async () => {
    try {
      const res = await agent.get(
        `${PromotingOrgGetProposedInstituteDetails}/${instituteID}/${userLoginID}`
      )
      if (res.data?.Status === 'Success' && res.data?.Data) {
        const d = res.data.Data
        setInstituteProfile(d)

        // Fetch promoting org details next
        const orgRes = await agent.get(
          `${GetPromotingOrganisationIDByInstituteID}/${instituteID}`
        )
        const orgId = orgRes.data?.Data

        if (orgId) {
          setPromotingOrgId(orgId)
          const promotingOrganization = await agent.post(
            `${GetPromotingOrganisationDetails}`,
            {
              instituteId: orgId,
              exitInstituteID: 0,
              userLoginID: userLoginID,
              pageCode: 'ExistingInstitute',
              itemId: 0,
              ipAddress: ipAddress
            }
          )

          if (
            promotingOrganization.data?.Status === 'Success' &&
            promotingOrganization.data?.Data
          ) {
            
            setPromotingOrg(promotingOrganization.data.Data)
          }
          await fetchPromoterDetails(orgId)
          await fetchAffiliatedInstitutes(orgId)
        }
      }
    } catch (err) {
      console.error('fetchInstituteProfile error:', err)
    }
  }

  const fetchPromoterDetails = async orgId => {
    try {
      const payload = {
        instituteId: orgId,
        userLoginID: userLoginID,
        pageCode: 'ExistingInstitute',
        itemId: '0',
        ipAddress: ipAddress
      }
      const res = await agent.post(GetPromoterDetailsByInstituteID, payload)
      if (res.data?.Status === 'Success' && res.data?.Data?.length > 0) {
        const list = res.data.Data;
        setAuthorizedRep(
          list.find(
            p =>
              p.PromoterTypeID === 5 ||
              p.PromoterType === 'Authorized Representative'
          ) || null
        )
        setPrincipalPromoter(
          list.find(
            p =>
              p.PromoterTypeID === 8 || p.PromoterType === 'Principal Promoter'
          ) || null
        )
        setMembers(
          list.filter(
            p =>
              [1, 2, 3, 4].includes(p.PromoterTypeID) ||
              ['Trustee', 'Member', 'Director', 'Partner'].includes(
                p.PromoterType
              )
          )
        )
        //setPromotingOrg(list[0]); // Use first record for org name if needed
      }
    } catch (err) {
      console.error('fetchPromoterDetails error:', err)
    }
  }
  const extractStaffId = htmlString => {
    if (!htmlString) return ''
    const match = htmlString.match(/>([^<]+)</)
    return match ? match[1] : ''
  }

  const getFullName = person => {
    return [
      person?.Title,
      person?.FirstName,
      person?.MiddleName,
      person?.LastName
    ]
      .filter(Boolean)
      .join(' ')
  }

  const fetchAffiliatedInstitutes = async orgId => {
    try {
      const payload = {
        InstituteId: orgId,
        userLoginID: userLoginID,
        pageCode: 'AssociatedInstitutes',
        itemId: '0',
        ipAddress: ipAddress
      }
      const res = await agent.post(
        GetAssociatedInstituteByPromotingOrganisationID,
        payload
      )
      if (res.data?.Status === 'Success' && res.data?.Data) {
        setAffiliatedInstitutes(res.data.Data)
      }
    } catch (err) {
      console.error('fetchAffiliatedInstitutes error:', err)
    }
  }

  const affiliated = affiliatedInstitutes.filter(x => x.PromoterTypeID === 1)
  const applied = affiliatedInstitutes.filter(x => x.PromoterTypeID === 2)

  const extractCode = htmlString => {
    if (!htmlString) return ''

    const match = htmlString.match(/>([^<]+)</)
    return match ? match[1] : ''
  }

  const parseCode = fullCode => {
    if (!fullCode) return { code: '', isVerified: false }

    const isVerified = fullCode.includes('V')

    const digitMatch = fullCode.match(/(\d{6})$/)
    const code = digitMatch ? digitMatch[1] : ''

    return { code, isVerified }
  }

  const openInstitutePopup = id => {
    const popupWidth = 1000
    const popupHeight = 750
    const left = (window.screen.width - popupWidth) / 2
    const top = (window.screen.height - popupHeight) / 2

    window.open(
      `../Public/InstituteDtails.aspx?P1=${id}`,
      'InstituteDetails',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  }
  const getVerificationStatus = code => {
    if (!code) return rejected
    return code.includes('V') ? verified : rejected
  }

  const fetchCourseData = async () => {
    try {
      const res = await agent.get(GetInspectionUnitDetails, {
        params: { instituteId: instituteID }
      })
      if (res.data?.Status === 'Success') {
        const data = res.data.Data.map((item, idx) => ({
          ...item,
          SN: idx + 1,
          MaxTraningSetupRequired: Math.ceil(
            (item.InspectionUnits || item.TotalUnits || 0) /
            (item.MaxBatchesPerDay || 1)
          )
        }))
        setCourseData(data)
      }
    } catch (err) {
      console.error('fetchCourseData error:', err)
    }
  }
  // for total row in course data table
  const totals = courseData.reduce(
    (acc, c) => {
      acc.ApprovedUnits += c.ApprovedUnits ?? 0
      acc.LOIProposedUnits += c.LOIProposedUnits ?? 0
      acc.TotalUnits += c.LOITotalUnits ?? 0
      acc.InspectionUnits += c.InspectionUnits ?? 0
      acc.InspectionFee += c.InspectionFee ?? 0
      acc.SecurityDeposit += c.SecurityDeposit ?? 0
      return acc
    },
    {
      ApprovedUnits: 0,
      LOIProposedUnits: 0,
      TotalUnits: 0,
      InspectionUnits: 0,
      InspectionFee: 0,
      SecurityDeposit: 0
    }
  )

  const fetchBuildingDetails = async () => {
    try {
      const res = await agent.get(
        `${GetBuildingDetails}?InstituteID=${instituteID}&BuildingId=0`
      )
      if (res.data?.Data) setBuildings(res.data.Data)
    } catch (err) {
      console.error('fetchBuildingDetails error:', err)
    }
  }

  const fetchSpaceNorms = async () => {
    try {
      const res = await agent.get(
        `${GetBuildingSpaceasperNormsAnalysis}?InstituteID=${instituteID}`
      )
      if (res.data?.Status === 'Success' && res.data?.Data) {
        setSpaceNorms(
          res.data.Data.map((item, idx) => ({
            id: idx + 1,
            label: item.Title,
            groundFloor: item.GroundFloorArea?.toFixed(2) || '0.00',
            anyFloor: item.OtherFloorArea?.toFixed(2) || '0.00',
            total: item.TotalFloorArea?.toFixed(2) || '0.00'
            // Remark: item.Remark || '-'
          }))
        )

        const availabilityRow = res.data.Data.find(
          x => x.Title === 'Space Availability'
        )

        setBuildingRemark(availabilityRow?.Remark || '')
      }
    } catch (err) {
      console.error('fetchSpaceNorms error:', err)
    }
  }

  const fetchLandDetails = async () => {
    try {
      const res = await agent.get(GetLandDetails, {
        params: { InstituteID: instituteID }
      })
      if (res.data?.Status === 'Success') setLandDetails(res.data.Data || [])
    } catch (err) {
      console.error('fetchLandDetails error:', err)
    }
  }

  const generateLandRemark = () => {
    if (!landDetails || landDetails.length === 0) return ''

    const agri = landDetails.find(l => l.LandTypeCode === 'A')
    const open = landDetails.find(l => l.LandTypeCode === 'O')

    const agriNegative = agri && Number(agri.Variation) < 0
    const openNegative = open && Number(open.Variation) < 0

    const agriPositive = agri && Number(agri.Variation) >= 0
    const openPositive = open && Number(open.Variation) >= 0

    let remarks = []

    if (agriNegative) {
      remarks.push(
        'Available Agriculture Land is less than required Agriculture Land'
      )
    }

    if (openNegative) {
      remarks.push('Available Open Ground is less than required Open Ground')
    }

    if (agriPositive && openPositive) {
      remarks.push(
        'Available Agriculture Land and Open Ground are as per Required Norms'
      )
    }

    return remarks.join('. ')
  }

  const landRemark = generateLandRemark()

  const fetchWorkshopDetails = async () => {
    try {
      const res = await agent.get(GetWorkshopDetails, {
        params: { instituteId: instituteID, userloginid: userLoginID },
        timeout: 15000
      })
      if (res.data?.Status === 'Success' && res.data?.Data?.length > 0) {
        setWorkshopDetails(
          res.data.Data.map(w => ({
            ...w,
            SpaceAvailable: w.SpaceAvailable ?? 0,
            FloorPrefVariation: w.FloorPrefVariation || 'Not-Evaluated'
          }))
        )
        //            setSpaceRemark(res.data.Data.SpaceRemark || '');
        //setFloorRemark(res.data.Data.FloorRemark || '');
      }
    } catch (err) {
      console.error('fetchWorkshopDetails error:', err)
    }
  }

  const isSpaceValid = workshopDetails.every(
    w => (w.SpaceAvailable ?? 0) - (w.RequiredSpace ?? 0) >= 0
  )

  const spaceRemark = isSpaceValid
    ? 'Available Workshop space is as per Required Norms'
    : 'Available Workshop space is less than Required Norms'

  const isFloorValid = workshopDetails.every(
    w => w.FloorPrefVariation === 'Acceptable'
  )

  const floorRemark = isFloorValid
    ? 'Available Floor Preference is as per Required Norms'
    : 'Available Floor Preference is not as per Required Norms'

  const fetchTrainingEquipment = async () => {
    try {
      const res = await agent.post(GetTrainingEquipmentDetails, {
        instituteId: instituteID,
        exitInstituteID: 0,
        userLoginID: userLoginID,
        pageCode: 'TRAINING_EQUIPMENT',
        itemId: 0,
        ipAddress
      })
      if (res.data?.Status === 'Success' && res.data?.Data) {
        const items = Array.isArray(res.data.Data.Items)
          ? res.data.Data.Items
          : []
        setTrainingEquipment(
          items.map(it => ({
            CourseCodeName: it.CourseCodeName || '',
            PercentageAvailability: it.PercentageAvailability ?? 0
          }))
        )
        setTrainingEquipmentRemark(res.data.Data.TrainingEquipmentRemark || '')
      }
    } catch (err) {
      console.error('fetchTrainingEquipment error:', err)
    }
  }

  const fetchCommonFacilities = async () => {
    try {
      const res = await agent.get(
        `${GetMasterSubFacilityGroup}?InstituteID=${instituteID}`
      )
      if (
        res.data?.Status === 'Success' &&
        res.data?.Data?.lstcommonSubFacilityEntities
      ) {
        setCommonFacilities(res.data.Data.lstcommonSubFacilityEntities)
      }
    } catch (err) {
      console.error('fetchCommonFacilities error:', err)
    }
  }

  const fetchOtherInfra = async () => {
    try {
      const res = await agent.get(
        `${GetOtherInfraDetails}?InstituteID=${instituteID}`
      )
      if (res.data?.Status === 'Success' && res.data?.Data) {
        setOtherInfra(res.data.Data)
      }
    } catch (err) {
      console.error('fetchOtherInfra error:', err)
    }
  }

  const fetchPowerDetails = async () => {
    try {
      const res = await agent.post(
        GetInstitutePowerDetails,
        {
          instituteID: instituteID,
          exitInstituteID: 0,
          userLoginID: userLoginID,
          pageCode: 'POWER_DETAILS',
          itemId: 0,
          ipAddress
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      if (res.data?.Status === 'Success' && res.data?.Data) {
        const pd = res.data.Data
        setPowerDetails(pd)
        if (pd.LstRequiredPowerDetails?.length > 0) {
          setPowerTableData(
            pd.LstRequiredPowerDetails.map((item, idx) => ({
              sn: idx + 1,
              course: item.CourseCodeName || '',
              inspectionUnits: item.InspectionUnits || 0,
              maxTrainingSetups: item.MaxTraningSetupRequired || 0,
              perSetupPowerNorm: item.PerSetupPowerNorm || 0,
              supplyType: item.PhaseType || '',
              requiredPower: item.RequiredPower || 0,
              PowerAvailability: item.PowerAvailability || 0
            }))
          )
        }
      }
    } catch (err) {
      console.error('fetchPowerDetails error:', err)
    }
  }

  const fetchTransactionHistory = async () => {
    try {
      const res = await agent.get(`${TransactionHistory}/${instituteID}`, {
        params: { userTypeId: userTypeID },
        timeout: 15000
      })
      if (res.data?.Status === 'Success')
        setTransactionData(res.data.Data || [])
    } catch (err) {
      console.error('fetchTransactionHistory error:', err)
    }
  }

  const fetchBankDetails = async () => {
    try {
      const res = await agent.get(
        `${GetInstituteBankDetails}?InstituteID=${instituteID}`
      )
      if (res.data?.Status === 'Success') setBankData(res.data.Data || [])
    } catch (err) {
      console.error('fetchTransactionHistory error:', err)
    }
  }

  const fetchInspectionDateRange = async () => {
    try {
      const res = await agent.post(GetInstituteInspectionDateRange, {
        instituteId: instituteID,
        exitInstituteID: 0,
        userLoginID: userLoginID,
        pageCode: 'InspectionRequest',
        itemId: 0,
        ipAddress
      })
      if (res.data?.Status === 'Success' && res.data?.Data?.Table?.length > 0) {
        setInspectionDateRange(res.data.Data.Table[0])
      }
    } catch (err) {
      console.error('fetchInspectionDateRange error:', err)
    }
  }
  const fetchInspectionAgency = async () => {
    try {
      const res = await agent.post(GetInstituteInspectionAgencyList, {
        instituteId: instituteID,
        exitInstituteID: 0,
        userLoginID: userLoginID,
        pageCode: 'InspectionRequest',
        itemId: 0,
        ipAddress
      })
      if (res.data?.Status === 'Success' && res.data?.Data?.Table?.length > 0) {
        setInspectionAgency(res.data.Data.Table[0])
      }
    } catch (err) {
      console.error('fetchInspectionAgency error:', err)
    }
  }
  const extractValue = (label, text) => {
    const regex = new RegExp(`${label}:\\s*([^,<]+)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : '—'
  }

  const agencyAddress = inspectionAgency?.AgencyAddress || ''

  const lines = agencyAddress.split('<br>').map(l => l.trim())

  const office = lines[0] || '—'

  const address =
    lines
      .slice(1)
      .filter(
        line =>
          !/Pin Code:/i.test(line) &&
          !/Taluka:/i.test(line) &&
          !/District:/i.test(line)
      )
      .join(', ') || '—'

  const pinCode = extractValue('Pin Code', agencyAddress)
  const taluka = extractValue('Taluka', agencyAddress)
  const district = extractValue('District', agencyAddress)

  // ── Helpers
  const fmt = (val, fallback = 'NA') => val || fallback
  const fmtDate = d => {
    if (!d || d.startsWith('0001')) return '—'
    
    return d.substring(0, 11)
  }

const dateFormat = (d) => {
  if (!d || d.startsWith("0001")) return "—";

 const [month, day, year] = d.trim().split(/\s+/);

  return `${parseInt(day, 10)} ${month} ${year}`;
};

  // ── Render
  // if (isLoading)
  //   return (
  //     <div className='bg-gray-100 min-h-screen flex items-center justify-center'>
  //       {/* <LoadingSpinner /> */}
  //       {startLoading()}
  //     </div>
  //   )
  if (error)
    return (
      <div className='bg-gray-100 min-h-screen flex items-center justify-center'>
        <div className='bg-red-50 border border-red-300 text-red-700 p-6 rounded'>
          {error}
        </div>
      </div>
    )

  const p = instituteProfile

  const rawValue = p?.AuthorizedPersonFirstName || ''

  // Extract Name (text before <a>)
  const nameMatch = rawValue ? rawValue.match(/^[^<]+/) : null
  const name = nameMatch ? nameMatch[0].trim() : ''

  const p1Match = rawValue.match(/P1=(\d+)/)
  const p2Match = rawValue.match(/P2=(\d+)/)
  const instAuthStaffID = p1Match ? p1Match[1] : ''
  const instAuthUserLoginID = p2Match ? p2Match[1] : ''

  // Extract Code
  const codeMatch = rawValue ? rawValue.match(/\(([^)]+)\)/) : null
  const code = codeMatch ? codeMatch[1] : ''
  const staffid = code ? code.slice(-6) : ''

  // Extract Image src
  const imgMatch = rawValue ? rawValue.match(/src="([^"]+)"/) : null
  const logoUrl = imgMatch ? imgMatch[1] : null

  const handleCodeClick = () => {
    setPrintData({
      staffID: staffid,
      userLoginID: code
    })
  }

  const handleReadyToPrint = printWindow => {
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 300)
  }

  const handleClosePopup = () => {
    setPrintData(null)
  }

  const InstituteDetailsPopUp = (instituteId, courseCode) => {
    if (!instituteId) {
      return
    }
    const popupWidth = 1000
    const popupHeight = 750

    const left = (window.screen.width - popupWidth) / 2
    const top = (window.screen.height - popupHeight) / 2

    const popup = window.open(
      `${window.location.origin}/React/InstituteDetailsPrint?instituteId=${instituteId}&courseCode=${courseCode}`,
      'InstituteDetailsPrint',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )

    if (!popup) {
      Swal.fire({
        title: 'Popup Blocked',
        text: 'Please allow popups for this website.',
        icon: 'error'
      })
    }
  }
  const handleAuthorizedRepClick = () => {
    if (!authorizedRep) return

    const staffId = extractStaffId(authorizedRep.StaffProfileId)

    const popupWidth = 1000
    const popupHeight = 750
    const left = (window.screen.width - popupWidth) / 2
    const top = (window.screen.height - popupHeight) / 2

    window.open(
      `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${staffid}&userLoginID=${staffId}`,
      'StaffProfile',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  }
  // const handleMembersClick = (id) => {
  //   if (!members) return

  //   const staffId = extractStaffId(id)

  //   const popupWidth = 1000
  //   const popupHeight = 750
  //   const left = (window.screen.width - popupWidth) / 2
  //   const top = (window.screen.height - popupHeight) / 2

  //   window.open(
  //     `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${staffId}&userLoginID=${staffId}`,
  //     'StaffProfile',
  //     `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
  //   )
  // }

  const handleMembersClick = (id) => {
    if (!id) return

    const staffId = extractStaffId(id) // e.g. "123456" — the login ID

    // Extract the numeric staff ID from the HTML string (same way you do for instAuthStaffID)
    const p1Match = id.match(/P1=(\d+)/)
    const memberStaffID = p1Match ? p1Match[1] : staffId // fallback to staffId if no P1

    const popupWidth = 1000
    const popupHeight = 750
    const left = (window.screen.width - popupWidth) / 2
    const top = (window.screen.height - popupHeight) / 2

    window.open(
      `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${memberStaffID}&userLoginID=${staffId}`,
      'StaffProfile',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  }

  const handleInstituteAuthorizedRepClick = () => {
    if (!instAuthStaffID || !instAuthUserLoginID) return

    const popupWidth = 1000
    const popupHeight = 750
    const left = (window.screen.width - popupWidth) / 2
    const top = (window.screen.height - popupHeight) / 2

    window.open(
      `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${instAuthStaffID}&userLoginID=${instAuthUserLoginID}`,
      'StaffProfile',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  }

  const handlePrincipalPromotorClick = () => {
    if (!principalPromoter) {
      return
    }
    const staffId = extractStaffId(principalPromoter.StaffProfileId)

    const popupWidth = 1000
    const popupHeight = 750
    const left = (window.screen.width - popupWidth) / 2
    const top = (window.screen.height - popupHeight) / 2

    window.open(
      `${window.location.origin}/React/StaffPrintApplicationForm?staffID=${staffId}&userLoginID=${staffId}`,
      'StaffProfile',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  }

  const handlePromotingOrganizationClick = () => {
    if (!promotingOrg?.ApplicationID) return

    const popupWidth = 1000
    const popupHeight = 750
    const left = (window.screen.width - popupWidth) / 2
    const top = (window.screen.height - popupHeight) / 2

    window.open(
      `${window.location.origin}/React/PromotingOrganizationPrint?instituteId=${instituteID}&promotingOrgId=${promotingOrg.ApplicationID}&userLoginID=${userLoginID}`,
      'PromotingOrganization',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  }

  return (
    <div className='bg-white p-4 md:p-10 min-h-screen'>
      <style
        dangerouslySetInnerHTML={{
          __html: `
                @media print {
                    .no-print { display: none; }
                    body { background-color: white !important; }
                    * { -webkit-print-color-adjust: exact; }
                }
            `
        }}
      />

      {/* ── SECTION 1: Header + Institute Profile ── */}
      <div className='max-w-full mx-auto bg-white border border-black shadow-sm'>
        <div className='p-4 border-b border-black'>
          <div className='flex justify-between items-center text-center'>
            <img src={independencedayindia} alt='Emblem' className='h-20' />
            <div className='flex-1 px-4'>
              <h1 className='text-sm font-semibold'>
                Government of Maharashtra
              </h1>
              <h2 className='text-sm'>
                Skill, Employment, Entrepreneurship and Innovation Department
              </h2>
              <h2 className='text-sm font-bold text-blue-900 whitespace-nowrap'>
                Maharashtra State Board of Skill, Vocational Education and
                Training
              </h2>
              <h3 className='text-lg font-bold mt-1'>
                Application for Inspection
              </h3>
            </div>
            <img src={BoardLogo} alt='Logo' className='h-20' />
          </div>
          <div className='mt-4 border-t border-black pt-2 text-center text-sm font-semibold'>
            <p>Registration No.: {fmt(p?.InstituteCode)}</p>
            <p>
              Application Date:{' '}
              {fmtDate(inspectionDateRange?.InspectionRequestSubmissionDate)}
            </p>
          </div>
        </div>

        <div className='overflow-x-auto p-4'>
          <Table title='Institute Profile'>
            <tbody>
              <Row
                label='Institute Type'
                value={
                  //instituteProfile?.IsNewInst == 1 
                  instituteProfile?.IsNewInst == 1 
                        ? 'Existing Institute'
                    : 'New Institute'   
                }
                colSpan={3}
              />

              {/* <Row
                label='Institute Name'
                value={`${fmt(p?.InstituteName)} SKILL DEVELOPMENT INSTITUTE (${p?.InstituteCode})`}
                colSpan={3}
                bold
              /> */}
              <Row
                label='Institute Name'
                value={
                  <>
                    {fmt(p?.InstituteName)} SKILL DEVELOPMENT INSTITUTE (
                    <span
                      style={{
                        color: '#1D4ED8',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => InstituteDetailsPopUp(instituteID, 0)}
                    >
                      {p?.InstituteCode}
                    </span>
                    )
                  </>
                }
                colSpan={3}
                bold
              />

              <tr className='bg-gray-50'>
                <th
                  colSpan={4}
                  className='text-left p-2 border border-black font-bold'
                >
                  Institute Details
                </th>
              </tr>
              <Row
                label='Address'
                value={fmt(p?.InstituteAddress)}
                colSpan={3}
              />
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Pin Code
                </td>
                <td className='p-2 border border-black'>{fmt(p?.PinCode)}</td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  City/Village
                </td>
                <td className='p-2 border border-black'>{fmt(p?.City)}</td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Taluka
                </td>
                <td className='p-2 border border-black'>{fmt(p?.Taluka)}</td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  District
                </td>
                <td className='p-2 border border-black'>{fmt(p?.District)}</td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  State
                </td>
                <td className='p-2 border border-black'>{fmt(p?.State)}</td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Location Category
                </td>
                <td className='p-2 border border-black'>
                  {fmt(p?.LocationCategory)}
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Phone No.
                </td>
                <td className='p-2 border border-black'>{fmt(p?.PhoneNo)}</td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  E-Mail ID
                </td>
                <td className='p-2 border border-black'>{fmt(p?.EMailID)}</td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Website
                </td>
                <td className='p-2 border border-black'>{fmt(p?.WebSite)}</td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Latitude, Longitude
                </td>
                <td className='p-2 border border-black'>
                  {p?.Latitude && p?.Longitude
                    ? `${p.Latitude}, ${p.Longitude}`
                    : '—'}
                </td>
              </tr>
              {/*value={authorizedRep ? `${authorizedRep.PromoterName} (${authorizedRep.PromoterLoginID || ''})` : '—'}*/}

              <tr>
                <td
                  colSpan={4}
                  className='p-2 border border-black font-semibold bg-gray-50'
                >
                  Authorized Representative of Institute
                </td>
              </tr>

              <tr>
                <td colSpan={4} className='p-2 border border-black'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-gray-800'>{name}</span>

                    <span
                      onClick={handleInstituteAuthorizedRepClick}
                      className='text-blue-700 underline cursor-pointer'
                    >
                      ({code})
                    </span>

                    <img
                      src={authorizedRep?.IsapprovedPromoter === 'V' ? logoUrl : rejected}
                      alt='status'
                      width='16'
                    />
                  </div>
                </td>
              </tr>

              {printData && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                  <div className='bg-white w-[90%] h-[90%] rounded-lg shadow-lg relative overflow-hidden'>
                    {/* Close Button */}
                    <button
                      onClick={handleClosePopup}
                      className='absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded'
                    >
                      X
                    </button>

                    {/* Your Component Inside Popup */}
                    <div className='h-full overflow-auto p-4'>
                      <Staff_PrintApplicationForm
                        staffID={printData.staffID}
                        userLoginID={printData.userLoginID}
                        pageCode='STAFF_PRINT'
                        onReadyToPrint={handleReadyToPrint}
                      />
                    </div>
                  </div>
                </div>
              )}
            </tbody>
          </Table>

          {/* Registration Numbers Table */}
          <div className='mt-2'>
            <div className='bg-gray-50 p-2 border border-black font-bold text-sm mb-0'>
              Other Registration Details
            </div>

            <table className='w-full border border-black border-collapse text-sm'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border border-black p-2'>Sr. No.</th>
                  <th className='border border-black p-2'>Particular</th>
                  <th className='border border-black p-2'>Institute Code</th>
                  <th className='border border-black p-2'>Registered Name</th>
                  <th className='border border-black p-2'>Approval Date</th>
                  <th className='border border-black p-2'>Approval Order</th>
                </tr>
              </thead>

              <tbody>
                {p?.MSBSVETRegistrationNumber || p?.VTPRegistrationNumber ? (
                  <>
                    {p?.MSBSVETRegistrationNumber && (
                      <tr>
                        <td className='border border-black p-2 text-center'>
                          1
                        </td>
                        <td className='border border-black p-2'>MSBSVET</td>
                        <td className='border border-black p-2'>
                          {p.MSBSVETRegistrationNumber}
                        </td>
                        <td className='border border-black p-2'>
                          {p.InstituteName}
                        </td>
                        <td className='border border-black p-2'>
                          {fmtDate(p.MSBSVETApprovalDate)}
                        </td>
                        <td className='border border-black p-2 text-center'>
                          {p.MSBSVETApprovalLetterPath ? 'Uploaded' : '—'}
                        </td>
                      </tr>
                    )}

                    {p?.VTPRegistrationNumber && (
                      <tr>
                        <td className='border border-black p-2 text-center'>
                          2
                        </td>
                        <td className='border border-black p-2'>VTP</td>
                        <td className='border border-black p-2'>
                          {p.VTPRegistrationNumber}
                        </td>
                        <td className='border border-black p-2'>
                          {p.InstituteName}
                        </td>
                        <td className='border border-black p-2'>
                          {fmtDate(p.VTPApprovalDate)}
                        </td>
                        <td className='border border-black p-2 text-center'>
                          {p.VTPApprovalLetterPath ? 'Uploaded' : '—'}
                        </td>
                      </tr>
                    )}
                  </>
                ) : (
                  <tr>
                    <td
                      colSpan='6'
                      className='border border-black p-3 text-center text-gray-600'
                    >
                      No Other Registration Details Added
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Promoting Org + Courses ── */}
      <div className='max-w-full mx-auto bg-white border-x border-b border-black shadow-sm mt-0 p-4'>
        <Table>
          <tbody>
            {/* 🔹 Promoting Organization */}
            <tr>
              <td
                colSpan={4}
                className='bg-gray-100 p-2 border border-black text-sm'
              >
                Promoting Organization
              </td>
            </tr>
            {/* <tr>
              <td colSpan={4} className='p-2 border border-black text-sm'>
                {promotingOrg
                  ? `${promotingOrg.NameOfPromotingOrganization} (${promotingOrg.ApplicationID})`
                  : '—'}
              </td>
            </tr> */}
            <tr>
              <td colSpan={4} className='p-2 border border-black'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-gray-800'>
                    {promotingOrg
                      ? `${promotingOrg.NameOfPromotingOrganization}`
                      : '-'}
                  </span>

                  <span
                    onClick={handlePromotingOrganizationClick}
                    className='text-blue-700 underline cursor-pointer'
                  >
                    ({promotingOrg ? `${promotingOrg.ApplicationID}` : '—'})
                  </span>

                  <img
                    src={promotingOrg?.IsApprovedPromotingOrganisationStatus === 'V' ? logoUrl : rejected}
                    alt='status'
                    width='16'
                  />
                </div>
              </td>
            </tr>

            {/* 🔹 Authorized Representative */}
            <tr>
              <td
                colSpan={4}
                className='bg-gray-100 p-2 border border-black text-sm'
              >
                Authorized Representative of Promoting Organization
              </td>
            </tr>
            <tr>
              <td colSpan={4} className='p-2 border border-black text-sm'>
                {authorizedRep ? (
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-gray-800'>
                      {getFullName(authorizedRep)}
                    </span>
                    <span
                      onClick={handleAuthorizedRepClick}
                      className='text-blue-700 underline cursor-pointer'
                    >
                      ({extractStaffId(authorizedRep.StaffProfileId)})
                    </span>
                    <img
                      src={authorizedRep.IsapprovedPromoter === 'V' ? logoUrl : rejected}
                      alt='status'
                      width='16'
                    />
                  </div>
                ) : (
                  '—'
                )}
              </td>
            </tr>

            {/* 🔹 Principal Promoter */}
            <tr>
              <td
                colSpan={4}
                className='bg-gray-100 p-2 border border-black text-sm'
              >
                Principal Promoter
              </td>
            </tr>
            <tr>
              <td colSpan={4} className='p-2 border border-black text-sm'>
                {principalPromoter ? (
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-gray-800'>
                      {getFullName(principalPromoter)}{' '}
                    </span>
                    <span
                      onClick={handlePrincipalPromotorClick}
                      className='text-blue-700 underline cursor-pointer'
                    >
                      ({extractStaffId(principalPromoter.StaffProfileId)})
                    </span>
                    <img
                      src={principalPromoter.IsapprovedPromoter === 'V' ? logoUrl : rejected}
                      alt='status'
                      width='16'
                    />
                  </div>
                ) : (
                  '—'
                )}
              </td>
            </tr>

            {/* 🔹 Members */}
            {members.length > 0 && (
              <>
                <tr>
                  <td
                    colSpan={4}
                    className='bg-gray-100 p-2 border border-black text-sm'
                  >
                    Members
                  </td>
                </tr>

                {members.map((m, index) => (
                  <tr key={index}>
                    <td colSpan={4} className='p-2 border border-black text-sm'>
                      <div className='flex items-center gap-2'>
                        <span>{getFullName(m)}</span>
                        <span className='text-blue-700 underline cursor-pointer'
                          onClick={() =>
                            handleMembersClick(m.StaffProfileId)
                          }>
                          ({extractStaffId(m.StaffProfileId)})
                        </span>
                        <img
                          src={m.IsapprovedPromoter === 'V' ? logoUrl : rejected}
                          alt='status'
                          width='16'
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* 🔹 Affiliated Institutes */}
            {affiliated.length > 0 && (
              <>
                <tr>
                  <td
                    colSpan={4}
                    className='bg-gray-100 p-2 border border-black text-sm'
                  >
                    Affiliated Institutes
                  </td>
                </tr>

                {affiliated.map(item => {
                  const code = extractCode(item.InstituteCode)
                  const isVerified = item.IsVerified === 'V'

                  return (
                    <tr key={item.AssociatedInstituteID}>
                      <td
                        colSpan={4}
                        className='p-2 border border-black text-sm'
                      >
                        <div className='flex items-center gap-2'>
                          {item.NameofInstitute}
                          <span
                            className='text-blue-700 underline cursor-pointer'
                            onClick={() =>
                              InstituteDetailsPopUp(item.InstituteID, 0)
                            }
                          >
                            ({code})
                          </span>
                          <img
                            src={isVerified ? logoUrl : rejected}
                            alt='status'
                            width='16'
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </>
            )}

            {/* 🔹 Applied Institutes */}
            {applied.length > 0 && (
              <>
                <tr>
                  <td
                    colSpan={4}
                    className='bg-gray-100 p-2 border border-black text-sm'
                  >
                    Applied Institute
                  </td>
                </tr>

                {applied.map(item => {
                  const code = extractCode(item.InstituteCode)
                  const isVerified = item.IsVerified === 'V'

                  return (
                    <tr key={item.AssociatedInstituteID}>
                      <td
                        colSpan={4}
                        className='p-2 border border-black text-sm'
                      >
                        <div className='flex items-center gap-2'>
                          {item.NameofInstitute}
                          <span
                            className='text-blue-700 underline cursor-pointer'
                            onClick={() =>
                              InstituteDetailsPopUp(
                                item.AssociatedInstituteID,
                                0
                              )
                            }
                          >
                            ({code})
                          </span>
                          <img
                            src={isVerified ? logoUrl : rejected}
                            alt='status'
                            width='16'
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </>
            )}
          </tbody>
        </Table>

        {inspectionDateRange && (
          <div className='flex border-x border-b border-black text-sm'>
            <div className='w-1/4 p-2 border-r border-black font-bold bg-gray-50'>
              LoI Issuance Date
            </div>
            <div className='w-3/4 p-2'>
              {fmtDate(inspectionDateRange.LoIIssuanceDate) || '—'}
            </div>
          </div>
        )}

        <div className='border-black'>
          {/* <div className='bg-gray-100 p-2 font-bold text-sm'>
            Proposed Course
          </div> */}
          <SectionHeader title='Proposed Course' />
          <DataTable
            headers={[
              'S.N.',
              'Course',
              'Approved Units',
              'LoI Units',
              'Total',
              'Inspection Units',
              'Fee',
              'Deposit'
            ]}
            rows={[
              ...courseData.map((c, index) => ({
                __cells: [
                  index + 1,
                  c.CourseWithCourseCode || c.CourseName || '—',
                  c.ApprovedUnits ?? 0,
                  c.LOIProposedUnits ?? 0,
                  c.LOITotalUnits ?? 0,
                  c.InspectionUnits ?? 0,
                  c.InspectionFee ?? 0,
                  c.SecurityDeposit ?? 0
                ]
              })),

              {
                __cells: [
                  '',
                  'Total',
                  totals.ApprovedUnits,
                  totals.LOIProposedUnits,
                  totals.TotalUnits,
                  totals.InspectionUnits,
                  totals.InspectionFee,
                  totals.SecurityDeposit
                ]
              }
            ]}
          />
        </div>
      </div>

      {/* ── SECTION 3: Building + Land + Workshop ── */}
      <div className='max-w-full mx-auto bg-white border-x border-b border-black shadow-sm mt-0 p-4'>
        <SectionHeader title='Building Details: Available Space' />
        <DataTable
          headers={[
            'S.N.',
            'Building Name',
            'Ownership',
            'Floors',
            'Ground Floor (sq.m)',
            'Other Floor (sq.m)',
            'Total (sq.m)'
          ]}
          rows={buildings.map((b, i) => ({
            __cells: [
              i + 1,
              b.BuildingNameType || '—',
              b.OwnerShipType || '—',
              b.FloorName || '—',
              b.GroundFloorArea?.toFixed(2) || '—',
              b.OtherFloorArea?.toFixed(2) || '—',
              b.TotalFloorArea?.toFixed(2) || '—'
            ]
          }))}
        />

        <SectionHeader title='Building Details: Space Norms' />
        <DataTable
          headers={[
            'S.N.',
            'Particular',
            'Ground Floor (sq.m)',
            'Any Floor (sq.m)',
            'Total (sq.m)'
          ]}
          rows={spaceNorms.map(s => ({
            //__rowClassName: s.rowClassName,
            __cells: [s.id, s.label, s.groundFloor, s.anyFloor, s.total]
          }))}
        />
        <div className='border border-black mt-2'>
          <div className='p-1 px-2 font-bold text-sm border-b border-black'>
            Building Details: Remark
          </div>
          <div className='p-2 text-blue-900 font-bold text-sm min-h-[30px]'>
            {buildingRemark}
          </div>
        </div>

        <SectionHeader title='Land Details' />
        <DataTable
          headers={[
            'S.N.',
            'Land Type',
            'Available (sq.m)',
            'Required (sq.m)',
            'Variation',
            'Ownership'
          ]}
          rows={landDetails.map((l, i) => ({
            __cells: [
              i + 1,
              l.LandType || '—',
              l.AvailableLandArea?.toFixed(2) || '—',
              l.RequiredLandArea?.toFixed(2) || '—',
              l.Variation || '—',
              l.OwnerShipType || '—'
            ]
          }))}
        />
        <div className='border border-black mt-2'>
          <div className='p-1 px-2 font-bold text-sm border-b border-black'>
            Land Details: Remark
          </div>
          <div className='p-2 text-blue-900 font-bold text-sm min-h-[30px]'>
            {landRemark}
          </div>
        </div>

        <SectionHeader title='Workshop Details' />
        <DataTable
          headers={[
            'S.N.',
            'Course',
            'Required (sq.m)',
            'Available (sq.m)',
            'Space Avail.',
            'Floor Pref.',
            'Available Floor',
            'Variation'
          ]}
          rows={workshopDetails.map((w, i) => ({
            __cells: [
              i + 1,
              w.CourseCodeName || w.CourseName || '—',
              w.RequiredSpace?.toFixed(2) || '—',
              w.SpaceAvailable?.toFixed(2) || '—',
              w.SpaceAvailability || '—',
              w.FloorPref || '—',
              w.AvailableFloorPref || '—',

              w.FloorPrefVariation || '—'
            ]
          }))}
        />
        <div className='border border-black mt-2'>
          <div className='p-1 px-2 font-bold text-sm border-b border-black'>
            Workshop Details: Remark
          </div>

          <div className='p-2 text-blue-900 font-bold text-sm space-y-1'>
            <div>Remark for Space: {spaceRemark}</div>

            <div>Remark for Floor Preference: {floorRemark}</div>
          </div>
        </div>

        {/* ── SECTION 4: Equipment + Facilities + Power + Bank + Inspection ── */}
        <div className='max-w-full mx-auto bg-white shadow-sm mt-4 print-container'>
          <SectionHeader title='Training Equipment Details' />
          <DataTable
            headers={['S.N.', 'Course', 'Percentage Availability (%)']}
            rows={trainingEquipment.map((t, i) => ({
              __cells: [i + 1, t.CourseCodeName, `${t.PercentageAvailability}%`]
            }))}
          />
          <div className='border border-black mt-2'>
            <div className='p-1 px-2 font-bold text-sm border-b border-black'>
              Training Equipment Details: Remark
            </div>

            <div className='p-2 text-blue-900 font-bold text-sm min-h-[30px]'>
              {trainingEquipmentRemark}
            </div>
          </div>

          <SectionHeader title='Common Facility' />
          <table className='w-full border-collapse text-xs'>
            <thead>
              <tr className='bg-white text-center'>
                <th className='border border-black p-2 w-12'>S.N.</th>
                <th className='border border-black p-2 text-left'>Facility</th>
                <th className='border border-black p-2 w-48'>
                  Space / Details
                </th>
              </tr>
            </thead>
            <tbody>
              {commonFacilities.length > 0 ? (
                commonFacilities.map((f, i) => (
                  <tr key={i}>
                    <td className='border border-black p-2 text-center'>
                      {i + 1}
                    </td>
                    <td className='border border-black p-2'>
                      {f.SubFacilityGroup || f.SubFacilityGroupName || '—'}
                    </td>
                    <td className='border border-black p-2'>
                      {f.Space || f.AvailableSpace || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className='border border-black p-2 text-center text-gray-400 italic'
                  >
                    No facility data
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Water Supply */}
          <div className='border border-black mt-2 text-xs'>
            {/* Header */}
            <div className='bg-gray-100 p-2 border-b border-black font-bold text-sm'>
              Other Facility
            </div>

            {/* Row 1 */}
            <div className='grid grid-cols-4 border-b border-black'>
              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Whether Water Supply is available
              </div>

              <div className='p-2 border-r border-black'>
                {otherInfra?.IsWaterSupply === 1
                  ? 'Yes'
                  : otherInfra?.IsWaterSupply === 0
                    ? 'No'
                    : '—'}
              </div>

              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Source of Water Supply
              </div>

              <div className='p-2'>
                {fmt(
                  otherInfra?.SourceofWaterSupply ||
                  otherInfra?.SourceofWaterSupplyID
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className='grid grid-cols-4'>
              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Whether CCTV available in all Workshop
              </div>

              <div className='p-2 border-r border-black'>
                {otherInfra?.CctvAvailable === 1
                  ? 'Yes'
                  : otherInfra?.CctvAvailable === 0
                    ? 'No'
                    : '—'}
              </div>

              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Whether Internet Connectivity is available
              </div>

              <div className='p-2'>
                {otherInfra?.InternetConnectivity === 1
                  ? 'Yes'
                  : otherInfra?.InternetConnectivity === 0
                    ? 'No'
                    : '—'}
              </div>
            </div>
          </div>

          {/* Power Details */}
          {/* <SectionHeader title='Power Details' />

        <table className='w-full border-collapse text-xs'>
          <tbody>
            <tr>
              <td className='p-2 border border-black font-semibold bg-gray-50'>
                Available Power (K.W.)
              </td>
              <td className='p-2 border border-black'>
                {fmt(powerDetails?.AvailablePower)}
              </td>

              <td className='p-2 border border-black font-semibold bg-gray-50'>
                Required Power (K.W.)
              </td>
              <td className='p-2 border border-black'>
                {powerTableData?.length
                  ? powerTableData.reduce(
                      (sum, r) => sum + (r.requiredPower || 0),
                      0
                    )
                  : '—'}
              </td>
            </tr>

            <tr>
              <td className='p-2 border border-black font-semibold bg-gray-50'>
                Power Availability
              </td>
              <td className='p-2 border border-black'>
                {fmt(powerDetails?.PowerAvailability)}
              </td>
              <td className='p-2 border border-black' colSpan={2}></td>
            </tr>

            <tr>
              <td className='p-2 border border-black font-semibold bg-gray-50'>
                Available Supply Type
              </td>
              <td className='p-2 border border-black'>
                {fmt(powerDetails?.AvailablePhase)}
              </td>

              <td className='p-2 border border-black font-semibold bg-gray-50'>
                Required Supply Type
              </td>
              <td className='p-2 border border-black'>
                {fmt(powerDetails?.RequiredSupplyType)}
              </td>
            </tr>

            <tr>
              <td className='p-2 border border-black font-semibold bg-gray-50'>
                Supply Type Variation
              </td>
              <td className='p-2 border border-black'>
                {fmt(powerDetails?.RequiredSupplyType)}
              </td>
              <td className='p-2 border border-black' colSpan={2}></td>
            </tr>

            <tr>
              <td className='p-2 border border-black font-semibold bg-gray-50'>
                Is the meter connection in the name of Proposed Institute
              </td>
              <td className='p-2 border border-black'>
                {powerDetails?.IsMeterConnectionProposedInstitute === 1
                  ? 'Yes'
                  : powerDetails?.IsMeterConnectionProposedInstitute === 0
                  ? 'No'
                  : '—'}
              </td>

              <td className='p-2 border border-black font-semibold bg-gray-50'>
                Is the meter connection in the name of Promoting Organization
              </td>
              <td className='p-2 border border-black'>
                {powerDetails?.IsMeterConnectionPromotingOrganization === 1
                  ? 'Yes'
                  : powerDetails?.IsMeterConnectionPromotingOrganization === 0
                  ? 'No'
                  : '—'}
              </td>
            </tr>
          </tbody>
        </table> */}

          {/* Power Details */}
          <div className='border border-black mt-2 text-xs'>
            {/* Header */}
            <div className='bg-gray-100 p-2 border-b border-black font-bold text-sm'>
              Power Details
            </div>

            {/* Row 1 */}
            <div className='grid grid-cols-4 border-b border-black'>
              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Available Power (K.W.)
              </div>

              <div className='p-2 border-r border-black'>
                {fmt(powerDetails?.AvailablePower)}
              </div>

              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Required Power (K.W.)
              </div>

              <div className='p-2'>
                {powerTableData?.length
                  ? powerTableData.reduce(
                    (sum, r) => sum + (r.requiredPower || 0),
                    0
                  )
                  : '—'}
              </div>
            </div>

            {/* Row 2 */}
            <div className='grid grid-cols-4 border-b border-black'>
              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Power Availability
              </div>

              <div className='p-2 border-r border-black'>
                {fmt(powerDetails?.PowerAvailability)}
              </div>

              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Available Supply Type
              </div>

              <div className='p-2'>{fmt(powerDetails?.AvailablePhase)}</div>
            </div>

            {/* Row 3 */}
            <div className='grid grid-cols-4 border-b border-black'>
              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Required Supply Type
              </div>

              <div className='p-2 border-r border-black'>
                {fmt(powerDetails?.RequiredSupplyType)}
              </div>

              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Supply Type Variation
              </div>

              <div className='p-2'>{fmt(powerDetails?.RequiredSupplyType)}</div>
            </div>

            {/* Row 4 */}
            <div className='grid grid-cols-4'>
              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Is the meter connection in the name of Proposed Institute
              </div>

              <div className='p-2 border-r border-black'>
                {powerDetails?.IsMeterConnectionProposedInstitute === 1
                  ? 'Yes'
                  : powerDetails?.IsMeterConnectionProposedInstitute === 0
                    ? 'No'
                    : '—'}
              </div>

              <div className='p-2 border-r border-black font-semibold bg-gray-50'>
                Is the meter connection in the name of Promoting Organization
              </div>

              <div className='p-2'>
                {powerDetails?.IsMeterConnectionPromotingOrganization === 1
                  ? 'Yes'
                  : powerDetails?.IsMeterConnectionPromotingOrganization === 0
                    ? 'No'
                    : '—'}
              </div>
            </div>
          </div>

          {/* ✅ Remark Block */}
          <div className='border border-black mt-2'>
            <div className='bg-gray-100 p-2 border-b border-black font-bold text-sm'>
              Power Details: Remark
            </div>

            <div className='p-2 text-blue-900 font-bold text-sm space-y-2 min-h-[40px]'>
              <div>Remark for Power: {fmt(powerDetails?.PowerRemark)}</div>

              <div>
                Remark for Supply Type: {fmt(powerDetails?.SupplyTypeRemark)}
              </div>
            </div>
          </div>

          {/* Power Course Table */}
          {/*{powerTableData.length > 0 && (*/}
          {/*    <div className="mt-1">*/}
          {/*        <DataTable*/}
          {/*            headers={['S.N.', 'Course', 'Inspection Units', 'Max Training Setups', 'Per Setup Power (KW)', 'Supply Type', 'Required Power (KW)']}*/}
          {/*            rows={powerTableData.map(r => ({*/}
          {/*                __cells: [r.sn, r.course, r.inspectionUnits, r.maxTrainingSetups, r.perSetupPowerNorm, r.supplyType, r.requiredPower]*/}
          {/*            }))}*/}
          {/*        />*/}
          {/*    </div>*/}
          {/*)}*/}

          {/* Bank Account Details */}
          <SectionHeader title='Bank Account Details' />
          {bankData?.length > 0 ? (
            <table className='w-full border-collapse text-xs'>
              <tbody>
                <tr>
                  <td className='p-2 border border-black font-semibold bg-gray-50'>
                    Account Type
                  </td>
                  <td className='p-2 border border-black'>
                    {fmt(bankData[0]?.AccountType)}
                  </td>
                  <td className='p-2 border border-black font-semibold bg-gray-50'>
                    Account Number
                  </td>
                  <td className='p-2 border border-black'>
                    {fmt(bankData[0]?.AccountNo)}
                  </td>
                </tr>
                <tr>
                  <td className='p-2 border border-black font-semibold bg-gray-50'>
                    Account Holder Name
                  </td>
                  <td className='p-2 border border-black'>
                    {fmt(bankData[0]?.AccountHolderName)}
                  </td>
                  <td className='p-2 border border-black font-semibold bg-gray-50'>
                    Bank IFSC Code
                  </td>
                  <td className='p-2 border border-black'>
                    {fmt(bankData[0]?.IFSCCode)}
                  </td>
                </tr>
                <tr>
                  <td className='p-2 border border-black font-semibold bg-gray-50'>
                    Bank Name
                  </td>
                  <td className='p-2 border border-black'>
                    {fmt(bankData[0]?.BankName)}
                  </td>
                  <td className='p-2 border border-black font-semibold bg-gray-50'>
                    Branch Name
                  </td>
                  <td className='p-2 border border-black'>
                    {fmt(bankData[0]?.BranchName)}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className='border border-black p-2 text-xs text-gray-400 italic'>
              No bank details found
            </div>
          )}

          {/* Inspection Fees */}
          <SectionHeader title='Inspection Fees Details' />

                  {transactionData.length > 0 ? (
            <table className='w-full border-collapse text-xs'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='p-2 border border-black'>Sr. No.</th>
                  <th className='p-2 border border-black'>Purpose</th>
                  <th className='p-2 border border-black'>Amount Paid</th>
                  <th className='p-2 border border-black'>Payment Date</th>
                  <th className='p-2 border border-black'>Transaction ID</th>
                  <th className='p-2 border border-black'>Payment ID</th>
                </tr>
              </thead>

              <tbody>
                {transactionData.map((item, index) => (
                  <tr key={index} className='text-center'>
                    <td className='p-2 border border-black'>{index + 1}</td>

                    <td className='p-2 border border-black'>
                      {item?.Purpose || '-'}
                    </td>

                    <td className='p-2 border border-black'>
                      {fmt(item?.TotalAmount)}
                    </td>

                    <td className='p-2 border border-black'>
                      {dateFormat(item?.PaymentDate)}
                    </td>

                    <td className='p-2 border border-black'>
                      {item?.TransactionID || '-'}
                    </td>

                    <td className='p-2 border border-black'>
                      {item?.BankRefereneceNo || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='border border-black p-2 text-xs text-gray-400 italic'>
              No fee payment details found
            </div>
          )}

          {/* Inspection Request Details */}
          <SectionHeader title='Inspection Request Details' />
          <table className='w-full border-collapse text-xs'>
            <tbody>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Inspection Request Submission Date
                </td>
                <td className='p-2 border border-black' colSpan={3}>
                  {fmtDate(
                    inspectionDateRange?.InspectionRequestSubmissionDate
                  )}
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Inspection Request Date Range
                </td>
                <td className='p-2 border border-black' colSpan={3}>
                  {inspectionDateRange
                    ? `${fmtDate(
                      inspectionDateRange.InspectionRequestStartDate
                    )} to ${fmtDate(
                      inspectionDateRange.InspectionRequestEndDate
                    )}`
                    : '—'}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  className='bg-gray-100 p-2 border border-black font-bold text-sm mt-2'
                >
                  Inspecting Agency
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold'>
                  Address
                </td>
                <td colSpan={3} className='p-2 border border-black'>
                  <div>{inspectionAgency?.AgencyAddress}</div>
                  {/*<div>{address}</div>*/}
                </td>
              </tr>

              <tr>
                <td className='p-2 border border-black font-semibold'>
                  Pin Code
                </td>
                <td className='p-2 border border-black'>
                  {inspectionAgency?.AgencyPincode}
                </td>

                <td className='p-2 border border-black font-semibold'>
                  City / Village
                </td>
                <td className='p-2 border border-black'>
                  {inspectionAgency?.AgencyCity}
                </td>
              </tr>

              <tr>
                <td className='p-2 border border-black font-semibold'>
                  Taluka
                </td>
                <td className='p-2 border border-black'>
                  {inspectionAgency?.AgencyTaluka}
                </td>
                {/*<span className="text-gray-800 flex-1">{inspectionAgency.AgencyTaluka}</span>*/}

                <td className='p-2 border border-black font-semibold'>
                  District
                </td>
                <td className='p-2 border border-black'>
                  {inspectionAgency?.AgencyDistrict}
                </td>
              </tr>

              <tr>
                <td className='p-2 border border-black font-semibold'>State</td>
                <td className='p-2 border border-black'>
                  {inspectionAgency?.AgencyState}
                </td>

                <td className='p-2 border border-black font-semibold'>
                  Phone No.
                </td>
                <td className='p-2 border border-black'>
                  {inspectionAgency?.PhoneNo || '—'}
                </td>
              </tr>

              <tr>
                <td className='p-2 border border-black font-semibold'>
                  E-Mail ID
                </td>
                <td colSpan={3} className='p-2 border border-black break-all'>
                  {inspectionAgency?.EmailId1 || '—'}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  className='bg-gray-100 p-2 border border-black font-bold text-sm mt-2'
                >
                  Contact Person
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Contact Name
                </td>
                <td className='p-2 border border-black'>
                  {[
                    inspectionAgency?.Title,
                    inspectionAgency?.FName,
                    inspectionAgency?.MName,
                    inspectionAgency?.LName
                  ]
                    .filter(Boolean)
                    .join(' ') || '—'}
                </td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Designation
                </td>
                <td className='p-2 border border-black'>
                  District Vocational Education and Training Officer
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Primary Mobile
                </td>
                <td className='p-2 border border-black'>
                  {fmt(inspectionAgency?.MobileNo)}
                </td>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Alternate Mobile
                </td>
                <td className='p-2 border border-black'>
                  {fmt(inspectionAgency?.AlternateMobileNo)}
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold bg-gray-50'>
                  Email ID
                </td>
                <td className='p-2 border border-black' colSpan={3}>
                  {fmt(inspectionAgency?.EmailId1)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  className='bg-gray-100 p-2 border border-black font-bold text-sm mt-2'
                >
                  Inspection Details
                </td>
              </tr>
              <tr>
                <td className='p-2 border border-black font-semibold'>
                  Inspection Date Scheduled by DVETO
                </td>

                <td className='p-2 border border-black'>
                  {fmtDate(inspectionDateRange?.InspectionScheduledDateByDVETO)}
                </td>
                <td className='p-2 border border-black'></td>
                <td className='p-2 border border-black'></td>
              </tr>
            </tbody>
          </table>
          <div className='max-w-full mx-auto mt-2 flex flex-col items-center justify-center'>
            <h2
              className='text-lg font-bold text-gray-800 tracking-wide'
              style={{ fontFamily: 'serif' }}
            >
              !! कौशल्यम् बलम् !!
            </h2>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}

      {/*<div className="max-w-5xl mx-auto mt-6 text-right no-print">*/}
      {/*    <button*/}
      {/*        onClick={() => window.print()}*/}
      {/*        className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"*/}
      {/*    >*/}
      {/*        Print / Save as PDF*/}
      {/*    </button>*/}
      {/*</div>*/}
    </div>
  )
}
