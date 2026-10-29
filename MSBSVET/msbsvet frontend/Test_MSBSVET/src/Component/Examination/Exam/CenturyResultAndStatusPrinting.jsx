import React, { useEffect, useState, useContext, useRef } from "react";
import agent from "../../../lib/api/agent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { ThemeContext } from "../../Context/ThemeContext";
import { FaFileAlt } from "react-icons/fa";
import { SwalHelper } from "../../../utils/swalHelper";

import {
  ResultInstituteWiseAPI,
  InstitudePrintResultCertificateAPI,
  InstituteBulkPrintResultAPI,
  PrintResultCertificateBulkAPI,
  instituteresultpdfzip,
  institutecertificatepdfzip,
  institutepreresultpdf,
  instituteprecertificatepdf
} from "../../../Endpoints_All/Examination/Exam";
 import { useAuth } from "../../../Hooks/AuthContext";

const ResultAndCertificate = () => {
  
  const { userInfo } = useAuth();
  const loggedInUserID = userInfo?.UserID || 0;
  const typeId = userInfo?.UserTypeID || 0;
  
  

  const { color } = useContext(ThemeContext);
  const allExamRef = useRef([]);

  const [examTypeList, setExamTypeList] = useState([]);
  const [examList, setExamList] = useState([]);
  const [sessionList, setSessionList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [allInstitute, setAllInstitute] = useState([]);
  const [instituteList, setInstituteList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [tableKey, setTableKey] = useState(0);

  const [formData, setFormData] = useState({
    examTypeId: "",
    session: "",
    examination: "",
    examinationYearId: "",
    district: "",
    institute: "",
  });

  
  const examTypeOptions = examTypeList.map(x => ({ value: String(x.ExamTypeID), label: x.ExamType }));
  const sessionOptions = sessionList.map(x => ({ value: String(x.YearId), label: x.YearDisplayName }));
  const examOptions = examList.map(x => ({ value: String(x.ID), label: x.ExaminationName }));
  const districtOptions = districtList.map(d => ({ value: String(d.Value), label: d.Text }));
  const instituteOptions = instituteList.map(d => ({ value: String(d.Value), label: d.Text }));


  useEffect(() => {
    debugger;
    loadExamType();
    loadSession();
    loadDistrict();
    loadInstitute();
    loadAllExaminations();
  }, []);

  const loadExamType = async () => {
    const res = await agent.get("/Base/GetExamType");
    setExamTypeList(res?.data?.Data || []);
  };

  const loadSession = async () => {
    const res = await agent.get("/Base/GetAdmissionYear");
    setSessionList(res?.data?.Data || []);
  };

  const loadDistrict = async () => {
    const res = await agent.get("/Base/GetMasterRegionDistrict");
    setDistrictList(res?.data?.Data || []);
  };

  const loadInstitute = async () => {
    const res = await agent.get("/Base/GetMasterInstitute");
    setAllInstitute(res?.data?.Data || []);
    setInstituteList(res?.data?.Data || []);
  };
  const loadAllExaminations = async () => {
    const res = await agent.get("/Base/GetExamination");
    allExamRef.current = res?.data?.Data || [];
  };

  const filterExamsByYear = (yearId) => {
    if (!yearId) return setExamList([]);
    const filtered = allExamRef.current.filter(
      x => String(x.ExaminatioYearID) === String(yearId)
    );
    setExamList(filtered);
  };

  
  const handleExamTypeChange = (value) => {
    setFormData(p => ({ ...p, examTypeId: value }));
    filterExamsByYear(formData.session);
  };

  const handleSessionChange = (value) => {
    setFormData(p => ({ ...p, session: value }));
    filterExamsByYear(value);
  };

  const handleExaminationChange = (value) => {
    const selected = examList.find(x => String(x.ID) === value);
    setFormData(p => ({
      ...p,
      examination: value,
      examinationYearId: selected?.ExaminatioYearID || "",
    }));
  };

  const handleDistrictChange = (value) => {
    if (!value) setInstituteList(allInstitute);
    else setInstituteList(allInstitute.filter(x => String(x.Group) === value));

    setFormData(p => ({ ...p, district: value, institute: "" }));
  };

  const handleInstituteChange = (value) => {
    setFormData(p => ({ ...p, institute: value }));
  };

  const handleSearch = async () => {

    if (!formData.examTypeId || !formData.session || !formData.examination) {
      SwalHelper.error("Validation Error", "Please fill required fields");
      return;
    }

    setLoading(true);

    const res = await agent.get(ResultInstituteWiseAPI, {
      params: {
        examinationId: formData.examination,
        examTypeId: formData.examTypeId,
        examinationYearId: formData.examinationYearId || null,
        instituteId: formData.institute || null,
        districtId: formData.district || null,
        userTypeId: typeId,
        userLoginId: loggedInUserID,
        isResultFresh: false,
      },
    });

    setTableData(res?.data?.Data || []);
    setHasSearched(true);
    setTableKey(k => k + 1);
    setLoading(false);
  };


  const triggerZipDownload = (blobData, filename) => {
    const blob = new Blob([blobData], { type: "application/zip" });
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async (item, type) => {

    if (type === "System") {
      try {
        SwalHelper.loading("Downloading...", "Please wait...");
        const response = await agent.get(instituteresultpdfzip, {
          params: {
            examinationId: item.ExaminationID,
            instituteId:   item.InstituteID,
            isResultFresh : 'F'
          },
          responseType: "blob",
        });
        SwalHelper.close();
        triggerZipDownload(response.data, `Result_${item.InstituteID}.zip`);
      } catch (error) {
        SwalHelper.close();
        SwalHelper.error("Download Error", "Failed to download");
      }
    }
    if (type === "Certificate") {
      try {
        SwalHelper.loading("Downloading...", "Please wait...");
        const response = await agent.get(institutecertificatepdfzip, {
          params: {
            examinationId: item.ExaminationID,
            instituteId:   item.InstituteID,
            isResultFresh : 'F'
          },
          responseType: "blob",
        });
        SwalHelper.close();
        triggerZipDownload(response.data, `Result_${item.InstituteID}.zip`);
      } catch (error) {
        SwalHelper.close();
        SwalHelper.error("Download Error", "Failed to download");
      }
    }

    else if (type === "PreResult") {
      try {
        SwalHelper.loading("Downloading...", "Please wait...");
        const response = await agent.get( institutepreresultpdf, {
          params: {
            examinationId:     item.ExaminationID,
            instituteId:       item.InstituteID,
            examTypeId:        formData.examTypeId,
            examinationYearId: formData.examinationYearId || null,
          },
          responseType: "blob",
        });
        SwalHelper.close();
        triggerZipDownload(response.data, `PrePrintedResult_${item.InstituteID}.pdf`);
      } catch (error) {
        SwalHelper.close();
        SwalHelper.error("Download Error", "Failed to download");
      }
    }

    else if (type === "PreCertificate") {
      try {
        SwalHelper.loading("Downloading...", "Please wait...");
        const response = await agent.get(instituteprecertificatepdf, {
          params: {
            examinationId:     item.ExaminationID,
            instituteId:       item.InstituteID,
            examTypeId:        formData.examTypeId,
            examinationYearId: formData.examinationYearId || null,
          },
          responseType: "blob",
        });
        SwalHelper.close();
        triggerZipDownload(response.data, `PrePrintedCertificate_${item.InstituteID}.pdf`);
      } catch (error) {
        SwalHelper.close();
        SwalHelper.error("Download Error", "Failed to download");
      }
    }
  };

  const renderCell = (item, column) => {

    const btn = (label, onClick) => (
      <button
        className="bg-[#28a745] text-white px-3 py-1 rounded text-xs"
        onClick={onClick}
      >
        {label}
      </button>
    );

    switch (column.key) {

      case "SystemResult":
        return btn("Download", () => handleDownload(item, "System"));

      case "SystemCertificate":
        return btn("Download", () => handleDownload(item, "Certificate"));

      case "PrePrintedResult":
        return btn("Download", () => handleDownload(item, "PreResult"));        

      case "PrePrintedCertificate":
        return btn("Download", () => handleDownload(item, "PreCertificate"));   

      default:
        return item[column.key];
    }
  };

  const tableColumns = [
    { key: "Institute", header: "Institute" },
    { key: "Examinee1", header: "Examinee" },
    { key: "Pass", header: "Passed" },
    { key: "Fail", header: "Failed" },
    { key: "SystemResult", header: "System Result" },
    { key: "SystemCertificate", header: "System Certificate" },
    { key: "PrePrintedResult", header: "Pre Printed Result" },
    { key: "PrePrintedCertificate", header: "Pre Printed Certificate" },
  ];

  return (
    <div className="w-full p-4">

      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">

        <legend className={`flex ${color} items-center text-white px-3 py-1.5 rounded-md ml-4`}>
          <FaFileAlt className="mr-2" />
          Result and Certificate
        </legend>

        <div className="px-4 pb-4 pt-3">

         
          <div className="grid md:grid-cols-3 gap-4 mb-4">

            <DropdownComponent
              label="Exam Type"
              required
              options={examTypeOptions}
              value={formData.examTypeId}
              onChange={handleExamTypeChange}
            />

            <DropdownComponent
              label="Admission Session"
              required
              options={sessionOptions}
              value={formData.session}
              onChange={handleSessionChange}
            />

            <DropdownComponent
              label="Examination"
              required
              options={examOptions}
              value={formData.examination}
              onChange={handleExaminationChange}
            />

          </div>

        
          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <DropdownComponent
              label="District"
              options={districtOptions}
              value={formData.district}
              onChange={handleDistrictChange}
            />

            <DropdownComponent
              label="Institute"
              options={instituteOptions}
              value={formData.institute}
              onChange={handleInstituteChange}
            />

          </div>

         
          <div className="flex justify-center mb-4">
            <button
              onClick={handleSearch}
              className="bg-[#28a745] text-white px-8 py-2 rounded"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

       
          {hasSearched && (
            <FilteredTableComponent
              key={tableKey}
              data={tableData}
              columns={tableColumns}
              renderCell={renderCell}
            />
          )}

        </div>
      </fieldset>
    </div>
  );
};

export default ResultAndCertificate;