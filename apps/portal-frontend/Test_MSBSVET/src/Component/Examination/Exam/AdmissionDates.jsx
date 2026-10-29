import React, { useEffect, useState, useContext, useRef } from "react";
import agent from "../../../lib/api/agent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Context/ThemeContext";
import { SwalHelper } from "../../../utils/swalHelper";
import { FaFileAlt } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";

import {
  GetActivityStatusList,
  SaveActivityStatusDetails,
} from "../../../Endpoints_All/Examination/Exam";
import { getDeviceIP } from "../../../utils/CommonHelper";

const AdmissionDates = () => {
  const { color } = useContext(ThemeContext);

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState("");

  const [formData, setFormData] = useState({
    Activity: "",
    ActivityStartDateTime: "",
    ActivityEndDateTime: "",
  });

  const formRef = useRef(null);

  useEffect(() => {
    fetchIP();
    loadList();
  }, []);

  
  const apiToInput = (s) => {
    if (!s) return "";
    if (s.includes("T")) return s.slice(0, 16);

    const [d, t = "00:00"] = s.split(" ");
    const [dd, mm, yyyy] = d.split("-");
    return `${yyyy}-${mm}-${dd}T${t}`;
  };

  
  const loadList = async () => {
    setLoading(true);
    try {
      const res = await agent.get(GetActivityStatusList, {
        params: { regionID: 1 },
      });

      const data = res?.data || [];
      setTableData(Array.isArray(data) ? data : []);
    } catch (err) {
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  
  const handleEdit = (row) => {
    setFormData({
      Activity: row.Activity || row.ActivityName || "",
      ActivityStartDateTime: apiToInput(row.ActivityStartDateTime),
      ActivityEndDateTime: apiToInput(row.ActivityEndDateTime),
    });

    setEditMode(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  
  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      Activity: "",
      ActivityStartDateTime: "",
      ActivityEndDateTime: "",
    });
  };

 const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
        };

  
  const handleUpdate = async () => {
    if (!formData.ActivityStartDateTime || !formData.ActivityEndDateTime) {
      SwalHelper.error("Error", "All fields are required");
      return;
    }

    if (
      new Date(formData.ActivityStartDateTime) >=
      new Date(formData.ActivityEndDateTime)
    ) {
      SwalHelper.error("Error", "Start date must be before End date");
      return;
    }

    setUpdateLoading(true);

    try {
      const payload = {
        regionID: 1,
        activityName: formData.Activity,
        activityStartDateTime: new Date(
          formData.ActivityStartDateTime
        ).toISOString(),
        activityEndDateTime: new Date(
          formData.ActivityEndDateTime
        ).toISOString(),
        modifiedBy: "admin",
        modifiedByIPAddress: ipAddress || "0.0.0.0",
      };

      const res = await agent.post(SaveActivityStatusDetails, payload);

      if (res?.status === 200) {
        SwalHelper.success("Success", "Updated successfully");
        handleCancel();
        loadList();
      } else {
        SwalHelper.error("Error", "Update failed");
      }
    } catch (err) {
      SwalHelper.error("Error", "API Error");
    } finally {
      setUpdateLoading(false);
    }
  };

  
  const enrichedData = tableData.map((row, i) => ({
    ...row,
    SrNo: i + 1,
    Activity: row.Activity || row.ActivityName,
    ActivityStartDateTime: row.ActivityStartDateTimeF,
    ActivityEndDateTime: row.ActivityEndDateTimeF,
  }));


  const columns = [
    { key: "SrNo", header: "Sr. No.", width: "80px" },
    { key: "Activity", header: "Activity" },
    { key: "ActivityStartDateTime", header: "Activity Start Date Time" },
    { key: "ActivityEndDateTime", header: "Activity End Date Time" },
    { key: "Edit", header: "Edit", width: "80px" },
  ];


  const renderCell = (item, column) => {
    if (column.key === "Edit") {
      return (
        <button
          className="text-[#7B6A3E] hover:text-[#5a4d2a]"
          onClick={() => handleEdit(item)}
        >
          <FiEdit size={18} />
        </button>
      );
    }
  };

  return (
    <div className="w-full p-4" ref={formRef}>
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">

        
        <legend className={`flex ${color} items-center text-white px-3 py-1 rounded ml-4`}>
          <FaFileAlt className="mr-2" />
          Manage Activity Status
        </legend>

        <div className="px-4 pt-3 pb-4">

        
          {editMode && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Activity Status Details
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-4">

                <div>
                  <label className="text-sm font-medium">
                    Activity *
                  </label>
                  <input
                    value={formData.Activity}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Activity Start Date Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.ActivityStartDateTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ActivityStartDateTime: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Activity End Date Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.ActivityEndDateTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ActivityEndDateTime: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-3 mb-4">
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 text-white px-6 py-2 rounded"
                >
                  {updateLoading ? "Updating..." : "Update"}
                </button>

                <button
                  onClick={handleCancel}
                  className="bg-red-500 text-white px-6 py-2 rounded"
                >
                  Cancel
                </button>
              </div>

              <hr className="mb-4" />
            </>
          )}

          
          <h2 className="text-xl font-semibold mb-4">
            Activity Status List
          </h2>

          <FilteredTableComponent
            data={enrichedData}
            columns={columns}
            renderCell={renderCell}
            emptyStateMessage={loading ? "Loading..." : "No Data Found"}
          />
        </div>
      </fieldset>
    </div>
  );
};

export default AdmissionDates;