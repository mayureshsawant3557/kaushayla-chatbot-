import { useState, useEffect } from 'react'
import { FiEdit, FiEye } from 'react-icons/fi'
import { FaTrash, FaPlusSquare } from 'react-icons/fa'
import FilteredTableComponent from '../formcomponent/FilteredTableComponent'
import FormComponent from '../formcomponent/FormComponent'
import { SwalHelper } from '../../utils/swalHelper'
import Swal from 'sweetalert2'
import { LogIn } from 'lucide-react'
import DropdownComponent from '../formcomponent/DropdownComponent'
import Button from '../base/Button'
import agent from '../../lib/api/agent'
import { GetCandidateID } from '../../Endpoints_All/Base/masterData'
import { GetCandidatePrimary } from '../../Endpoints_All/Candidate/primary'
import { GetAppliedMainCourse } from '../../Endpoints_All/Candidate/courseApplication'
import {
  ConfirmSchoolStepAdmission,
  GetCandidateListByBatchID
} from '../../Endpoints_All/SchoolStep/activeBatch'
import { getDeviceIP } from '../../utils/CommonHelper'
import { useAuth } from '../../Hooks/AuthContext'

const AdmittedCandidates = ({ batchId }) => {
  const [profileId, setProfileId] = useState('')
  const [admittedList, setAdmittedList] = useState([])
  const [photo, setPhoto] = useState(null)
  const [showCandidateProfile, setShowCandidateProfile] = useState(false)
  const [applications, setApplications] = useState([])
  const [selectedApplicationId, setSelectedApplicationId] = useState('')
  const [ipAddress, setIPAddress] = useState('')
  const [candidateId, setCandidateId] = useState(null)
  const { userInfo } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dob: '',
    aadhar: '',
    mobile: '',
    altMobile: '',
    email: ''
  })

  useEffect(() => {
    if (!batchId) return
    const loadIP = async () => {
      const ip = await getDeviceIP()
      setIPAddress(ip)
    }

    loadIP()

    const fetchCandidateList = async () => {
      try {
        const response = await agent.get(
          `${GetCandidateListByBatchID}?batchId=${batchId}`
        )

        const apiData = response?.data?.Table

        if (!apiData) {
          setAdmittedList([])
          return
        }

        const formattedData = apiData.map((item, index) => ({
          id: item.CandidateID || index,
          sn: index + 1,
          profileId: item.ProfileID,
          candidate: item.CandidateName,
          applicationNo: item.ApplicationID,
          dob: item.DOB ? item.DOB.split('T')[0] : '',
          gender: item.Gender,
          aadhar: item.AadhaarNo,
          mobile: item.MobileNo,
          altMobile: item.AltMobileNo,
          email: item.EmailID,
          photo: item.PhotoFilePath
        }))

        setAdmittedList(formattedData)
      } catch (error) {
        console.error('Error fetching candidate list:', error)
        setAdmittedList([])
      }
    }

    fetchCandidateList()
  }, [batchId])

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getCandidateDetails = async id => {
    try {
      const getCandidateId = await agent.get(
        `${GetCandidateID}?ApplicationID=${id}`
      )

      if (!getCandidateId?.data?.Data) {
        SwalHelper.error('Not Found', 'Candidate ID not found')
        return false
      }

      const candidateId = getCandidateId.data.Data

      const alreadyAdmitted = admittedList.some(
        c => Number(c.id) === Number(candidateId)
      )
      if (alreadyAdmitted) {
        SwalHelper.warning(
          'Already Admitted',
          'This candidate is already admitted to this batch.'
        )
        return false
      }
      setCandidateId(candidateId)

      const response = await agent.get(
        `${GetCandidatePrimary}?candidateId=${candidateId}`
      )

      if (!response?.data?.Data) {
        SwalHelper.error('Candidate Details Not Found')
        return false
      }

      const data = response.data.Data

      setFormData({
        title:
          data.GenderCode === 'M'
            ? 'Mr.'
            : data.GenderCode === 'F'
            ? 'Ms.'
            : '',
        firstName: data.FirstName || '',
        middleName: data.MiddleName || '',
        lastName: data.LastName || '',
        gender:
          data.GenderCode === 'M'
            ? 'Male'
            : data.GenderCode === 'F'
            ? 'Female'
            : '',
        dob: data.DOB ? data.DOB.split('T')[0] : '',
        aadhar: data.AadhaarNo || '',
        mobile: data.MobileNo || '',
        altMobile: data.AltMobileNo || '',
        email: data.EMailID || ''
      })

      setPhoto(data.PhotoFilePath || '')

      try {
        const getAppliedMainCourses = await agent.get(
          `${GetAppliedMainCourse}?candidateId=${candidateId}`
        )

        if (getAppliedMainCourses?.data?.Data) {
          const formattedApplications = getAppliedMainCourses.data.Data.map(
            (item, index) => ({
              id: item.ApplicationID || index,
              sn: index + 1,
              applicationId: item.ApplicationIDDisplay,
              institute: item.InstituteNameCode,
              course: item.CourseNameCode,
              result: item.Result
            })
          )

          setApplications(formattedApplications)
        } else {
          setApplications([])
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setApplications([])
        } else {
          console.error('Error while fetching courses', error)
        }
      }

      SwalHelper.success('Success', 'Candidate details loaded')
      return true
    } catch (error) {
      console.error(error)
      SwalHelper.error('Error', 'Something went wrong while fetching candidate')
      return false
    }
  }

  const handleAdmit = async () => {
    if (!candidateId) {
      SwalHelper.warning('Warning', 'Load candidate first')
      return
    }

    try {
     
      const instituteCode = userInfo?.UserLoginID || ''

      const response = await agent.post(`${ConfirmSchoolStepAdmission}`, null, {
        params: {
          candidateId: candidateId,
          reportedBy: instituteCode,
          reportedByIPAddress: ipAddress,
          batchId: batchId
        }
      })

      if (response?.status === 200) {
        const refreshed = await agent.get(
          `${GetCandidateListByBatchID}?batchId=${batchId}`
        )

        const apiData = refreshed?.data?.Table

        if (apiData) {
          setAdmittedList(
            apiData.map((item, index) => ({
              id: item.CandidateID || index,
              sn: index + 1,
              profileId: item.ProfileID,
              candidate: item.CandidateName,
              applicationNo: item.ApplicationID,
              dob: item.DOB ? item.DOB.split('T')[0] : '',
              gender: item.Gender,
              aadhar: item.AadhaarNo,
              mobile: item.MobileNo,
              altMobile: item.AltMobileNo,
              email: item.EmailID,
              photo: item.PhotoFilePath
            }))
          )
        }

        SwalHelper.success(
          'Success',
          response.data.Message || 'Admission Confirmed'
        )
        resetForm()
      }
    } catch (error) {
      console.error('Admission Error:', error)
      SwalHelper.error(
        'Error',
        error?.response?.data?.Message || 'Something went wrong'
      )
    }
  }
  const handleDelete = async id => {
    const result = await SwalHelper.confirm({
      title: 'Are you sure?',
      text: 'Candidate will be removed'
    })

    if (!result.isConfirmed) return

    setAdmittedList(admittedList.filter(c => c.id !== id))
    SwalHelper.success('Deleted', 'Candidate removed')
  }

  // const handleEdit = (id) => {

  //   const found = admittedList.find((c) => c.id === id);

  //   if (!found) {
  //     SwalHelper.error("Not Found", "Candidate ID not found");
  //     return;
  //   }

  //   setPhoto(found.photo);
  //   setFormData({
  //     title: found.Title || "",
  //     firstName: found.FirstName || "",
  //     middleName: found.MiddleName || "",
  //     lastName: found.LastName || "",
  //     gender: found.Gender || "",
  //     dob: found.DOB || "",
  //     aadhar: found.AadhaarNo || "",
  //     mobile: found.MobileNo || "",
  //     altMobile: found.AltMobileNo || "",
  //     email: found.EMailID || "",
  //   })
  //   console.log('++++++++++++++++++++++++++++++++', found);
  //   setProfileId(found.profileId || "")

  // }

  const resetForm = () => {
    setProfileId('')
    setPhoto(null)
    setShowCandidateProfile(false)
    setSelectedApplicationId('')
    setApplications([])
    setFormData({
      title: '',
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dob: '',
      aadhar: '',
      mobile: '',
      altMobile: '',
      email: ''
    })
  }

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: 'actions',
      header: (
        <div className='flex items-center justify-center w-full h-full'>
          <FaPlusSquare
            className='cursor-pointer text-blue-700'
            onClick={() => viewCandidateProfile()}
          />
        </div>
      ),
      headerClassName: 'text-center bg-gray-100',
      width: '50px',
      sortable: false
    },
    {
      key: 'sn',
      header: 'S.N.',
      width: '50px',
      headerClassName: 'text-center bg-gray-100'
    },
    {
      key: 'candidate',
      header: 'Candidate',
      width: '200px',
      headerClassName: 'text-center bg-gray-100'
    },
    {
      key: 'applicationNo',
      header: 'Application No.',
      width: '100px',
      headerClassName: 'text-center bg-gray-100'
    },
    {
      key: 'dob',
      header: 'Date of Birth',
      width: '100px',
      headerClassName: 'text-center bg-gray-100'
    },
    {
      key: 'gender',
      header: 'Gender',
      width: '100px',
      headerClassName: 'text-center bg-gray-100'
    },
    {
      key: 'aadhar',
      header: 'Aadhaar ID',
      width: '100px',
      headerClassName: 'text-center bg-gray-100'
    }
  ]

  const renderCell = (row, column) => {
    if (column.key === 'actions') {
      return (
        <div className='flex justify-center gap-3'>
          <FiEye
            className='text-blue-600 cursor-pointer'
            size={18}
            onClick={() => viewDetailsPopUp(row)}
          />
          {/* <FiEdit
            className="text-green-600 cursor-pointer"
            size={18}
            onClick={() => handleEdit(row.id)}
          /> */}
          <FaTrash
            className='text-red-600 cursor-pointer'
            size={18}
            onClick={() => handleDelete(row.id)}
          />
        </div>
      )
    }
    return row[column.key] || ''
  }

  const viewCandidateProfile = () => {
    Swal.fire({
      icon: 'info',
      title: 'Enter Candidate Profile ID',
      input: 'text',
      inputPlaceholder: 'Enter Profile ID',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      inputValidator: value => {
        if (!value || value.trim() === '') {
          return 'Profile ID cannot be empty.'
        }
      }
    }).then(async result => {
      if (result.isConfirmed) {
        const id = result.value
        setProfileId(id)
        const success = await getCandidateDetails(id)
        if (success) {
          setShowCandidateProfile(true)
        }
      }
    })
  }

  const viewDetailsPopUp = data => {
    if (!data) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data Found',
        text: 'Candidate details are not available.'
      })
      return
    }

    Swal.fire({
      title: 'Admitted Candidate',
      html: `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      text-align:center;
      line-height:1.8;
      font-size:15px;
    ">
      <div><strong>Application No:</strong> ${data.applicationNo || '-'}</div>
      <div><strong>Full Name:</strong> 
        ${data.candidate}
      </div>
      <div><strong>Gender:</strong> ${data.gender || '-'}</div>
      <div><strong>Date of Birth:</strong> ${data.dob || '-'}</div>
      <div><strong>Aadhaar No:</strong> ${data.aadhar || '-'}</div>
      <div><strong>Mobile No:</strong> ${data.mobile || '-'}</div>
      ${
        data.altMobile
          ? `
      <div><strong>Alternate Mobile:</strong> ${data?.altMobile || ' '}</div>}`
          : ''
      }
    </div>
  `,
      imageUrl: data.photo,
      imageWidth: 120,
      imageHeight: 150,
      confirmButtonText: 'Ok',
      icon: 'info'
    })
  }

  return (
    <>
      <fieldset className='mb-4 rounded-md border p-4'>
        <legend className='flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white'>
          Admitted Candidates
        </legend>

        <FilteredTableComponent
          data={admittedList}
          columns={columns}
          searchable={false}
          sortable={false}
          showSearch={false}
          showExport={false}
          renderCell={renderCell}
          maxHeight='200px'
        />
      </fieldset>

      {showCandidateProfile && (
        <>
          <div className='grid grid-cols-6 gap-6 mb-6'>
            {/* <div className="col-span-6">
              <label className="font-semibold">Candidate Profile ID *</label>
              <input
                type="text"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="w-full border border-gray-400 rounded p-1 mt-1"
              />

              <button
                onClick={getCandidateDetails}
                className="bg-red-600 text-white border rounded px-4 py-1 mt-2"
              >
                Get Candidate Details
              </button>
            </div> */}

            <div className='flex justify-start items-center pl-4'>
              <div className='border w-[120px] h-[150px] bg-white flex items-center justify-center'>
                {photo ? (
                  <img
                    src={photo}
                    alt='candidate'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span className='text-xs text-gray-400 text-center'>
                    35mm x 45mm <br /> Photo
                  </span>
                )}
              </div>
            </div>
          </div>

          <fieldset className='border border-gray-400 rounded p-4 bg-white'>
            <div className='grid grid-cols-12 gap-6'>
              <div className='col-span-1'>
                {/* <FormComponent
              label="Title"
              value={formData.title}
              onChange={(v) => handleChange("title", v)}
            /> */}
                <DropdownComponent
                  label='Title'
                  value={formData.title}
                  options={[
                    { label: 'Mr.', value: 'Mr.' },
                    { label: 'Ms.', value: 'Ms.' }
                  ]}
                  onChange={v => handleChange('title', v)}
                  disabled
                />
              </div>

              <div className='col-span-4'>
                <FormComponent
                  label='First Name'
                  value={formData.firstName}
                  onChange={v => handleChange('firstName', v)}
                  disabled
                />
              </div>

              <div className='col-span-3'>
                <FormComponent
                  label='Middle / Father / Husband Name'
                  value={formData.middleName}
                  onChange={v => handleChange('middleName', v)}
                  disabled
                />
              </div>

              <div className='col-span-4'>
                <FormComponent
                  label='Last / Surname'
                  value={formData.lastName}
                  onChange={v => handleChange('lastName', v)}
                  disabled
                />
              </div>

              <div className='col-span-4'>
                <DropdownComponent
                  label='Gender'
                  value={formData.gender}
                  options={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' }
                  ]}
                  onChange={v => handleChange('gender', v)}
                  disabled
                />
              </div>

              <div className='col-span-4'>
                <FormComponent
                  label='Date of Birth'
                  type='date'
                  value={formData.dob}
                  onChange={v => handleChange('dob', v)}
                  disabled
                />
              </div>

              <div className='col-span-4'>
                <FormComponent
                  label='Aadhaar No'
                  value={formData.aadhar}
                  onChange={v => handleChange('aadhar', v)}
                  disabled
                />
              </div>

              <div className='col-span-4'>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Primary Mobile Number <span className='text-red-500'>*</span>
                </label>

                <div className='flex'>
                  <div className='w-16'>
                    <FormComponent value='+91' disabled />
                  </div>

                  <div className='flex-1'>
                    <FormComponent
                      value={formData.mobile}
                      onChange={v => handleChange('mobile', v)}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className='col-span-4'>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Alternative Mobile Number
                </label>

                <div className='flex'>
                  <div className='w-16'>
                    <FormComponent value='+91' disabled />
                  </div>

                  <div className='flex-1'>
                    <FormComponent
                      value={formData.altMobile}
                      onChange={v => handleChange('altMobile', v)}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className='col-span-4'>
                <FormComponent
                  label='E-Mail ID'
                  value={formData.email}
                  onChange={v => handleChange('email', v)}
                  disabled
                />
              </div>
            </div>
          </fieldset>

          <fieldset className='border border-gray-400 rounded p-4 mt-6 bg-white'>
            <legend className='font-semibold'>Applications</legend>

            <FilteredTableComponent
              data={applications}
              columns={[
                { key: 'sn', header: 'S.N.' },
                { key: 'applicationId', header: 'Application ID' },
                { key: 'institute', header: 'Institute' },
                { key: 'course', header: 'Course' },
                { key: 'result', header: 'Result' }
              ]}
              searchable={false}
              sortable={false}
              showSearch={false}
              showExport={false}
            />
          </fieldset>

          <div className='flex justify-center gap-5 mt-8'>
            <Button variant='success' size='sm' onClick={handleAdmit}>
              Admit
            </Button>
            <Button variant='warning' size='sm' onClick={resetForm}>
              Close
            </Button>
            <Button variant='danger' size='sm' onClick={resetForm}>
              Reset
            </Button>
          </div>
        </>
      )}
    </>
  )
}

export default AdmittedCandidates
