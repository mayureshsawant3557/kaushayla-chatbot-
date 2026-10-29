

import React, { useState, useEffect, useContext } from "react";
import { FaFileAlt } from "react-icons/fa";
import agent from "../../../../lib/api/agent";


import DropdownComponent from "../../../../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../../../../Component/formcomponent/FilteredTableComponent";
import { SwalHelper } from "../../../../utils/swalHelper";
import Loader from "../../../../Component/formcomponent/Loader";
import { ThemeContext } from "../../../Context/ThemeContext";

import {
  GetMasterInstitute,
  GetCourseByCollegeID,
  GetInstituteCourseBatches,
  GetBatchWiseAdmittedCandidate,
  TransferBatch,
} from "../../../../Endpoints_All/Administration/admin";

const BatchTransferNew = () => {
  
  const { color } = useContext(ThemeContext);

 
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [moveToBatches, setMoveToBatches] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(false);

  const [formData, setFormData] = useState({
    instituteName: "",
    courseName: "",
    batch: "",
    moveToBatch: "",
  });

  
  const instituteOptions = institutes.map((i) => ({
    value: String(i.Value),
    label: i.Text,
  }));

  const courseOptions = courses.map((c) => ({
    value: String(c.CourseID ?? c.Value),
    label: c.CourseName ?? c.Text,
  }));

  const batchOptions = batches
    .filter((b) => b.Value !== "-1" && b.Value !== -1)
    .map((b) => ({
      value: String(b.Value),
      label: b.Text,
    }));

  
  const moveToBatchOptions = moveToBatches
    .filter(
      (b) =>
        b.Value !== "-1" &&
        String(b.Value) !== String(formData.batch)
    )
    .map((b) => ({
      value: String(b.Value),
      label: b.Text,
    }));

  
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const res = await agent.get(GetMasterInstitute);
        const data = res?.data?.Data || res?.data || [];
        setInstitutes(data.filter((i) => i.Value !== "-1"));
      } catch (err) {
        SwalHelper.error("Error", "Failed to load institutes.");
      }
    };
    fetchInstitutes();
  }, []);


  useEffect(() => {
    if (!formData.instituteName) {
      setCourses([]);
      return;
    }

    const fetchCourses = async () => {
      setFetchingCourses(true);
      try {
        const res = await agent.get(GetCourseByCollegeID, {
          params: { CollegeID: formData.instituteName },
        });
        const data = res?.data?.Data || res?.data || [];
        setCourses(data);
        // Reset dependent fields
        setBatches([]);
        setMoveToBatches([]);
        setFormData((prev) => ({
          ...prev,
          courseName: "",
          batch: "",
          moveToBatch: "",
        }));
      } catch (err) {
        SwalHelper.error("Error", "Failed to load courses.");
      } finally {
        setFetchingCourses(false);
      }
    };

    fetchCourses();
  }, [formData.instituteName]);

  // 3. Load Batches when Course changes
  useEffect(() => {
    if (!formData.courseName || !formData.instituteName) {
      setBatches([]);
      setMoveToBatches([]);
      return;
    }

    const fetchBatches = async () => {
      setFetchingBatches(true);
      try {
        const res = await agent.get(GetInstituteCourseBatches, {
          params: {
            instituteID: formData.instituteName,
            courseID: formData.courseName,
            admissionYearID: 0,
          },
        });

        let rawData = res?.data?.Data || res?.data || [];
       
        const normalized = rawData.map((b) => ({
          Value: b.Value || b.Id || b.BatchID,
          Text: b.Text || b.Name || b.BatchName,
        }));

        setBatches(normalized);
        setMoveToBatches(normalized);
        setFormData((prev) => ({ ...prev, batch: "", moveToBatch: "" }));
      } catch (err) {
        SwalHelper.error("Error", "Failed to load batches.");
      } finally {
        setFetchingBatches(false);
      }
    };

    fetchBatches();
  }, [formData.courseName, formData.instituteName]);

  
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    const { instituteName, courseName, batch, moveToBatch } = formData;

    if (!instituteName || !courseName || !batch || !moveToBatch) {
      SwalHelper.error("Validation Error", "Please fill all fields.");
      return;
    }

    setLoading(true);
    setSearchDone(false);
    SwalHelper.loading("Searching...", "Fetching candidate list.");

    try {
      const res = await agent.get(
        `${GetBatchWiseAdmittedCandidate}/${instituteName}/${courseName}/${batch}`
      );
      SwalHelper.close();

      const data = res?.data?.Data || res?.data || [];
      setTableData(data);
      setSearchDone(true);

      if (data.length === 0) {
        SwalHelper.info("No Records", "No candidates found for the selected batch.");
      }
    } catch (err) {
      SwalHelper.close();
      SwalHelper.error("Error", "Failed to fetch candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    const { instituteName, courseName, batch, moveToBatch } = formData;

    if (!instituteName || !courseName || !batch || !moveToBatch) {
      SwalHelper.error("Validation Error", "Please fill all fields before transferring.");
      return;
    }

    SwalHelper.loading("Transferring...", "Please wait.");

    try {
      await agent.post(TransferBatch, {
        instituteID: instituteName,
        courseID: courseName,
        fromBatchID: batch,
        toBatchID: moveToBatch,
      });
      SwalHelper.close();
      SwalHelper.success("Success", "Transfer completed successfully.");
      handleClear();
    } catch (err) {
      SwalHelper.close();
      SwalHelper.error("Transfer Failed", "Something went wrong. Please try again.");
    }
  };

  const handleClear = () => {
    setFormData({
      instituteName: "",
      courseName: "",
      batch: "",
      moveToBatch: "",
    });
    setCourses([]);
    setBatches([]);
    setMoveToBatches([]);
    setTableData([]);
    setSearchDone(false);
  };

  
  const tableColumns = tableData.length
    ? Object.keys(tableData[0]).map((key) => ({
        key: key,
        header: key,
        width: "auto",
        headerClassName: "text-left",
      }))
    : [];

  
  const renderCell = (item, column) => {
    return item[column.key] ?? "-";
  };

  
  return (
    <div className="w-full p-4">
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
       
        <legend className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}>
          <FaFileAlt className="mr-2 text-white" />
          Batch Transfer
        </legend>

        <div className="px-4 pb-4 pt-3">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <DropdownComponent
              label="Institute Name"
              required
              options={instituteOptions}
              value={formData.instituteName}
              onChange={(val) => handleChange("instituteName", val)}
              loading={false}
            />
            <DropdownComponent
              label="Course Name"
              required
              options={courseOptions}
              value={formData.courseName}
              onChange={(val) => handleChange("courseName", val)}
              loading={fetchingCourses}
              disabled={!formData.instituteName}
            />
          </div>

        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <DropdownComponent
              label="From Batch"
              required
              options={batchOptions}
              value={formData.batch}
              onChange={(val) => handleChange("batch", val)}
              loading={fetchingBatches}
              disabled={!formData.courseName || batchOptions.length === 0}
            />
            <DropdownComponent
              label="Move To Batch"
              required
              options={moveToBatchOptions}
              value={formData.moveToBatch}
              onChange={(val) => handleChange("moveToBatch", val)}
              loading={fetchingBatches}
              disabled={!formData.batch || moveToBatchOptions.length === 0}
            />
          </div>

          
          <div className="flex justify-center gap-3 mb-6">
            <button
              type="button"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 rounded font-semibold disabled:opacity-70"
              onClick={handleSearch}
              disabled={loading || fetchingBatches}
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded font-semibold"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>

          
          {searchDone && tableData.length > 0 && (
            <div className="flex justify-center mb-4">
              <button
                type="button"
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-2 rounded font-semibold"
                onClick={handleTransfer}
              >
                Transfer
              </button>
            </div>
          )}

          
          {searchDone && (
            <FilteredTableComponent
              key={tableData.length} 
              data={tableData}
              columns={tableColumns}
              renderCell={renderCell}
              title="Batch Candidates"
              exportFileName="BatchCandidates"
              tableId="batch-transfer-table"
              maxHeight="450px"
              emptyStateMessage="No candidates found"
              emptyStateSubMessage="Try a different batch"
              showSearch={true}
              searchPosition="right"
              showExport={true}
              showExcelTemplate={false}
              showPDF={true}
            />
          )}

         
          {loading && <Loader />}
        </div>
      </fieldset>
    </div>
  );
};

export default BatchTransferNew;