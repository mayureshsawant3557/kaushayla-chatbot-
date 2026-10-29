import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import Loader from "../../Component/formcomponent/Loader";
import FormComponent from "../../Component/formcomponent/FormComponent";
import { MdOutlineLocationOn } from "react-icons/md";
import agent from "../../lib/api/agent";
import { useLoading } from "../../Hooks/useLoading";
import { SwalHelper } from "../../utils/swalHelper";
import { FiEdit } from "react-icons/fi";
import {
  getEvaluationCenterExamination,
  getEvaluationCenterMapping,
  getEvaluationCenterMappingByCollege,
  getMasterInstituteForExamCenter,
  saveEvaluationCenters,
  getInstituteInfo,
} from "../../Endpoints_All/Examination/Exam";
import { useAuth } from "../../Hooks/AuthContext";
// ── Table columns ─────────────────────────────────────────────────────────────

const columns = [
  {
    key: "InstituteCode",
    header: "Institute Code",
    width: "110px",
    className: "text-left",
  },
  {
    key: "InstituteName",
    header: "Institute Name",
    width: "200px",
    className: "text-left",
  },
  {
    key: "InstituteCity",
    header: "Institute City",
    width: "110px",
    className: "text-center",
  },
  {
    key: "InstituteTaluka",
    header: "Institute Taluka",
    width: "110px",
    className: "text-center",
  },
  { key: "Exam", header: "Exam", width: "80px", className: "text-center" },
  {
    key: "CenterCode",
    header: "Center Code",
    width: "100px",
    className: "text-center",
  },
  {
    key: "CenterName",
    header: "Center Name",
    width: "180px",
    className: "text-center",
  },
  {
    key: "action",
    header: "Action",
    width: "80px",
    className: "text-center",
    sortable: false,
    excludeFromExport: true,
  },
];

// ── Center info panel (Formative / Practical / Theory) ────────────────────────

const CenterSection = ({ centerInfo }) => {
  if (!centerInfo) return null;
  return (
    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
      <FormComponent
        label="Institute Code"
        value={centerInfo.InstituteCode}
        onChange={() => { }}
        disabled
      />
      <div className="md:col-span-3">
        <FormComponent
          label="Institute Name"
          value={centerInfo.InstituteName}
          onChange={() => { }}
          disabled
        />
      </div>
      <div className="md:col-span-4">
        <FormComponent
          label="Address"
          value={centerInfo.Address}
          onChange={() => { }}
          disabled
        />
      </div>
      <FormComponent
        label="City"
        value={centerInfo.City}
        onChange={() => { }}
        disabled
      />
      <FormComponent
        label="Pin Code"
        value={centerInfo.PinCode}
        onChange={() => { }}
        disabled
      />
      <FormComponent
        label="Taluka"
        value={centerInfo.Taluka}
        onChange={() => { }}
        disabled
      />
      <FormComponent
        label="District"
        value={centerInfo.District}
        onChange={() => { }}
        disabled
      />
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const EvaluationCenterMapping = () => {
  const { color } = useContext(ThemeContext);
  const { isLoading, startLoading, stopLoading } = useLoading();

  const { userInfo } = useAuth();
  const USER_LOGIN_ID = userInfo;

  // ── State ──────────────────────────────────────────────────────────────────

  const [view, setView] = useState("list");

  const [examOptions, setExamOptions] = useState([]);
  const [selectedExam, setSelectedExam] = useState("-1");
  const [examinationLabel, setExaminationLabel] = useState("");
  const [gridData, setGridData] = useState([]);
  const [gridStats, setGridStats] = useState({
    Institute: 0,
    MappedInstitute: 0,
    Per: "0%",
  });
  const [examLoading, setExamLoading] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);
  const [centerOptions, setCenterOptions] = useState([]);
  const [centerLoading, setCenterLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(false);
  const [hdnCollegeID, setHdnCollegeID] = useState("");
  const [hdnFormativeCenterID, setHdnFormativeCenterID] = useState("");

  // Practical is read-only in ASPX, so keeping it commented out — uncomment if needed in future
  // const [hdnPracticalCenterID, setHdnPracticalCenterID] = useState("");
  // const [practicalInfo, setPracticalInfo] = useState(null);
  const [hdnTheoryCenterID, setHdnTheoryCenterID] = useState("");

  const [formativeInfo, setFormativeInfo] = useState(null);

  const [theoryInfo, setTheoryInfo] = useState(null);

  const [errors, setErrors] = useState({});
  const [districtID, setDistrictID] = useState(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const toOptions = (arr) =>
    (arr || []).map((item) => ({
      value: item.Value?.toString() ?? item.value?.toString(),
      label: item.Text ?? item.label,
      ...item,
    }));

  // ── Load District ──────────────────────────────────────────────────────────

  useEffect(() => {
    const loadDistrict = async () => {
      try {
        const res = await agent.get(
          `/Base/GetDistrictIDByDistrictUser?UserLoginID=${USER_LOGIN_ID?.UserLoginID}`,
        );
        const id = res?.data?.Data || res?.data;
        setDistrictID(id);
      } catch (error) {
      }
    };
    loadDistrict();
  }, []);

  // ── Load Exams ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        setExamLoading(true);
        const res = await agent.get(getEvaluationCenterExamination);
        setExamOptions(toOptions(res.data?.Data || []));
      } catch (error) {
        SwalHelper.error("Failed to load examinations");
      } finally {
        setExamLoading(false);
      }
    };
    load();
  }, []);

  // ── Load Grid on exam change ───────────────────────────────────────────────

  useEffect(() => {
    if (!selectedExam || selectedExam === "-1") {
      setGridData([]);
      setGridStats({ Institute: 0, MappedInstitute: 0, Per: "0%" });
      setExaminationLabel("");
      return;
    }

    const loadGrid = async () => {
      try {
        if (!districtID) return;

        setGridLoading(true); // 🔥 START LOADER

        const res = await agent.get(
          `${getEvaluationCenterMapping}?ExaminationID=${selectedExam}&DistrictID=${districtID}`,
        );

        setGridData(res?.data?.Data?.Table || []);
        setGridStats(res?.data?.Data?.Table1?.[0] || {});

        const selectedExamObj = examOptions.find(
          (x) => x.value === selectedExam,
        );
        setExaminationLabel(selectedExamObj?.label || "");
      } catch (error) {
      } finally {
        setGridLoading(false); // 🔥 STOP LOADER
      }
    };

    loadGrid();
  }, [selectedExam, districtID, examOptions]);

  // ── Edit clicked ───────────────────────────────────────────────────────────

  const handleEdit = async (item) => {
    try {
      startLoading();

      // Only Theory has dropdown — filtered by DistrictID same as C# code
      const centerRes = await agent.get(
        `${getMasterInstituteForExamCenter}?UserLoginID=${USER_LOGIN_ID?.UserLoginID}`,
      );
      setCenterOptions(
        toOptions(centerRes?.data?.Data || centerRes?.data || []),
      );

      const res = await agent.get(
        `${getEvaluationCenterMappingByCollege}?instituteId=${item.CollegeID}&examinationId=${selectedExam}`,
      );
      const dr = res?.data?.Data?.[0] || {};

      setHdnCollegeID(item.CollegeID?.toString() || "");
      setHdnFormativeCenterID(dr.Formative_InstituteID?.toString() || "");
      // setHdnPracticalCenterID(dr.Practical_InstituteID?.toString() || "");
      setHdnTheoryCenterID(dr.Theory_InstituteID?.toString() || "");

      // Formative — always read-only
      setFormativeInfo({
        InstituteCode: dr.Formative_InstituteCode || "",
        InstituteName: dr.Formative_InstituteName || "",
        Address: dr.Formative_Address || "",
        City: dr.Formative_City || "",
        PinCode: dr.Formative_InstitutePinCode || "",
        Taluka: dr.Formative_Taluka || "",
        District: dr.Formative_Dstrict || "",
      });

      // Practical — always read-only (dropdown commented out in ASPX)
      // setPracticalInfo({
      //   InstituteCode: dr.Practical_InstituteCode || "",
      //   InstituteName: dr.Practical_InstituteName || "",
      //   Address: dr.Practical_Address || "",
      //   City: dr.Practical_City || "",
      //   PinCode: dr.Practical_PinCode || "",
      //   Taluka: dr.Practical_Taluka || "",
      //   District: dr.Practical_District || "",
      // });

      // Theory — has dropdown
      if (dr.Theory_InstituteID) {
        setTheoryInfo({
          InstituteCode: "",
          InstituteName: dr.Theory_InstituteName || "",
          Address: dr.Theory_InstituteAddress || "",
          City: dr.Theory_City || "",
          PinCode: dr.Theory_PinCode || "",
          Taluka: dr.Theory_Taluka || "",
          District: dr.Theory_District || "",
        });
      } else {
        setTheoryInfo(null);
      }

      setSelectedRow({
        CollegeID: item.CollegeID,
        InstituteCode: dr.InstituteCode || item.InstituteCode || "",
        InstituteName: dr.InstituteName || item.InstituteName || "",
      });

      setErrors({});
      setView("edit");
    } catch (error) {
      SwalHelper.error("Failed to load center details");
    } finally {
      stopLoading();
    }
  };

  // ── Theory dropdown change (only Theory has dropdown in Evaluation) ─────────

  const handleTheoryChange = async (value) => {
    setHdnTheoryCenterID(value || "");
    setErrors((e) => ({ ...e, theory: "" }));

    if (!value || value === "-1") {
      setTheoryInfo(null);
      return;
    }

    try {
      const res = await agent.get(`${getInstituteInfo}?InstituteID=${value}`);
      const dr = res?.data?.Data?.[0];
      if (dr) {
        setHdnTheoryCenterID(dr.CollegeID?.toString() || value);
        setTheoryInfo({
          InstituteCode: dr.InstituteCode || "",
          InstituteName: dr.InstituteName || "",
          Address: dr.CollegeAddress || "",
          City: dr.InstituteCity || "",
          PinCode: dr.CollegePincode || "",
          Taluka: dr.InstituteTaluka || "",
          District: dr.District || "",
        });
      }
    } catch (error) {
      SwalHelper.error("Failed to load theory center info");
    }
  };

  // ── Reset (mirrors btnReset → Clear()) ────────────────────────────────────
  // Only clears Theory — Practical stays read-only, not cleared

  const handleReset = async () => {
    const result = await SwalHelper.confirm({
      title: "Reset Changes?",
      text: "Are you sure you want to reset all entered data?",
      confirmText: "Yes, Reset",
      cancelText: "No",
    });

    if (result.isConfirmed) {
      setHdnTheoryCenterID("");
      setTheoryInfo(null);
      setErrors({});
    }
  };
  const handleBack = async () => {
    const result = await SwalHelper.confirm({
      title: "Leave Page?",
      text: "You have unsaved changes. Do you want to leave?",
      confirmText: "Yes, Leave",
      cancelText: "Stay",
    });

    if (result.isConfirmed) {
      setHdnTheoryCenterID("");
      setTheoryInfo(null);
      setErrors({});
      setView("list");
      setSelectedRow(null);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const buildXML = (centers) => {
    let xml = "<SelectedCenters>";
    centers.forEach((c) => {
      xml += `
    <Center>
      <CollegeID>${c.CollegeID}</CollegeID>
      <CenterCollegeID>${c.CenterCollegeID}</CenterCollegeID>
      <SubjectTypeExamID>${c.SubjectTypeExamID}</SubjectTypeExamID>
      <AdmissionYear>${c.AdmissionYear}</AdmissionYear>
      <IpAddress>${c.IpAddress}</IpAddress>
      <UserLoginID>${c.UserLoginID}</UserLoginID>
      <ExamID>1</ExamID>
      <ExaminationID>${c.ExaminationID}</ExaminationID>
    </Center>`;
    });
    xml += "</SelectedCenters>";
    return xml;
  };
  const handleSave = async () => {
    // Validation
    const newErrors = {};
    if (!hdnTheoryCenterID || hdnTheoryCenterID === "-1")
      newErrors.theory = "Please Select Theory Exam Center.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      SwalHelper.warning(
        "Validation Error",
        "Please select Theory exam center.",
      );
      return;
    }

    // Confirm before save
    const confirmSave = await SwalHelper.confirm({
      title: "Save Changes?",
      text: "Do you want to save the selected center?",
      confirmText: "Yes, Save",
      cancelText: "Cancel",
    });

    if (!confirmSave.isConfirmed) return;

    try {
      startLoading();

      const centers = [];

      if (hdnTheoryCenterID)
        centers.push({
          CollegeID: Number(hdnCollegeID),
          CenterCollegeID: Number(hdnTheoryCenterID),
          SubjectTypeExamID: 3,
          ExaminationID: Number(selectedExam),
          UserLoginID: USER_LOGIN_ID?.UserLoginID,
        });

      if (hdnFormativeCenterID)
        centers.push({
          CollegeID: Number(hdnCollegeID),
          CenterCollegeID: Number(hdnFormativeCenterID),
          SubjectTypeExamID: 1,
          ExaminationID: Number(selectedExam),
          UserLoginID: USER_LOGIN_ID?.UserLoginID,
        });

      const xmlPayload = buildXML(centers);
      

      const res = await agent.post(saveEvaluationCenters, xmlPayload, {
        headers: { "Content-Type": "application/xml" },
      });

      stopLoading();

      const returnValue = res?.data;

      if (returnValue === "Y" || returnValue === true || res?.status === 200) {
        await SwalHelper.success("Saved", "Center Saved!!");
        setView("list");

        const refreshed = await agent.get(
          `${getEvaluationCenterMapping}?ExaminationID=${selectedExam}&DistrictID=${districtID}`,
        );

        setGridData(refreshed?.data?.Data?.Table || []);
        setGridStats(
          refreshed?.data?.Data?.Table1?.[0] || {
            Institute: 0,
            MappedInstitute: 0,
            Per: "0%",
          },
        );
      } else {
        SwalHelper.error(
          typeof returnValue === "string" ? returnValue : "Save failed",
        );
      }
    } catch (error) {
      stopLoading();
      SwalHelper.error("Save failed");
    }
  };

  // ── renderCell ────────────────────────────────────────────────────────────

  const renderCell = (item, col) => {
    if (col.key === "action") {
      return (
        <button
          onClick={() => handleEdit(item)}
          title="Edit"
          className="text-green-600 hover:text-green-800 transition"
        >
          <FiEdit size={20} />
        </button>
      );
    }
    if (col.key === "CenterCode" || col.key === "CenterName")
      return item[col.key] || "—";
    return undefined;
  };

  if (isLoading) return <Loader />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full p-4">
      {/* ════════════════════ LIST VIEW ════════════════════ */}
      {view === "list" && (
        <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
          <legend
            className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
          >
            <MdOutlineLocationOn className="mr-2 text-white text-lg" />
            Evaluation Center Mapping
          </legend>

          <div className="w-full px-4 pb-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
              <DropdownComponent
                label="Examination"
                required
                options={examOptions}
                value={selectedExam}
                onChange={(v) => setSelectedExam(v)}
                loading={examLoading}
                error={!selectedExam}
              />
            </div>

            {selectedExam && selectedExam !== "-1" && (
              <>
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-600 mb-3">
                    Upcoming Exam Session:&nbsp;
                    <span className="font-semibold text-gray-800">
                      {examinationLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Institute
                      </div>
                      <span className="text-yellow-800 text-sm font-semibold">
                        {gridStats.Institute}
                      </span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Mapped Institute
                      </div>
                      <span className="text-blue-800 text-sm font-semibold">
                        {gridStats.MappedInstitute}
                      </span>
                    </div>
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Percentage Complete
                      </div>
                      <span className="text-teal-800 text-sm font-semibold">
                        {gridStats.Per}
                      </span>
                    </div>
                  </div>
                </div>

                {gridLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader />
                  </div>
                ) : (
                  <FilteredTableComponent
                    data={gridData}
                    columns={columns}
                    filterColumns={["InstituteCity", "InstituteTaluka", "Exam"]}
                    exportFileName="EvaluationCenterMapping"
                    title="Evaluation Center Mapping"
                    maxHeight="420px"
                    renderCell={renderCell}
                    emptyStateMessage="No institutes found for selected examination"
                    showExcel={true}
                    showPDF={true}
                  />
                )}
              </>
            )}
          </div>
        </fieldset>
      )}

      {/* ════════════════════ EDIT VIEW ════════════════════ */}
      {view === "edit" && selectedRow && (
        <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
          <legend
            className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
          >
            <MdOutlineLocationOn className="mr-2 text-white text-lg" />
            Edit Evaluation Center
          </legend>

          <div className="w-full px-4 pb-4 pt-4">
            {/* ── Institute Code + Name (read-only) ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
              <FormComponent
                label="Institute Code"
                value={selectedRow.InstituteCode}
                onChange={() => { }}
                disabled
              />
              <div className="md:col-span-3">
                <FormComponent
                  label="Institute Name"
                  value={selectedRow.InstituteName}
                  onChange={() => { }}
                  disabled
                />
              </div>
            </div>

            {/* ── Formative */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2">
                Formative
              </p>
              <CenterSection centerInfo={formativeInfo} />
            </div>

            {/* ── Practical ── */}
            {/* <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2">
                Practical
              </p>
              <CenterSection centerInfo={practicalInfo} />
            </div> */}

            {/* ── Theory*/}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">
                Theory
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <DropdownComponent
                  label="Institute Code"
                  required
                  options={centerOptions}
                  value={hdnTheoryCenterID}
                  onChange={handleTheoryChange}
                  error={!!errors.theory}
                  loading={centerLoading}
                />
              </div>
              {errors.theory && (
                <p className="text-xs text-red-500 mt-1">{errors.theory}</p>
              )}
              <CenterSection centerInfo={theoryInfo} />
            </div>

            {/* ── Action Buttons ── */}
            <div className="mt-6 border-t border-gray-200 pt-4 flex justify-center gap-4">
              <button
                type="button"
                className="bg-[#00c3f9] text-white px-6 py-2 rounded hover:opacity-90"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                onClick={handleReset}
              >
                Reset
              </button>
              <button
                type="button"
                className="bg-[#28a745] text-white px-6 py-2 rounded hover:opacity-90"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </fieldset>
      )}
    </div>
  );
};

export default EvaluationCenterMapping;
