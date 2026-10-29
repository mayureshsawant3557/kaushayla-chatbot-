import React, { useEffect, useState } from "react";
import agent from "../../../lib/api/agent";
import { GetMasterDistrict } from "../../../Endpoints_All/Base/location";
import { GetMasterInstitute } from "../../../Endpoints_All/Base/Institute";
import DropdownComponent from "../../formcomponent/DropdownComponent"; 
import { ThemeContext } from "../../Context/ThemeContext";
const ResultCertificateSearch = () => {

  const [districtList, setDistrictList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
const { color } = useContext(ThemeContext);

  const [allInstitute, setAllInstitute] = useState([]);
  const [filteredInstitute, setFilteredInstitute] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState("");

  const [examType, setExamType] = useState("");
  const [exam, setExam] = useState("");
  const [showModal, setShowModal] = useState(false);


  const [districtLoading, setDistrictLoading]   = useState(false);
  const [instituteLoading, setInstituteLoading] = useState(false);

 
  const examTypeOptions = [
    { value: "Theory",    label: "Theory"    },
    { value: "Practical", label: "Practical" },
  ];

  const examOptions = [
    { value: "Summer", label: "Summer" },
    { value: "Winter", label: "Winter" },
  ];

  const districtOptions      = districtList.map((d) => ({ value: String(d.Value), label: d.Text }));
  const filteredInstOptions  = filteredInstitute.map((i) => ({ value: String(i.Value), label: i.Text }));

  useEffect(() => {
    loadDistrict();
    loadInstitute();
  }, []);

  const loadDistrict = async () => {
    try {
      setDistrictLoading(true);
      const res = await agent.get(GetMasterDistrict);
      if (res.data.Status === "Success") {
        setDistrictList(res.data.Data);
      }
    } catch (err) {
       //console.log("District API Error", err);
    } finally {
      setDistrictLoading(false);
    }
  };

  const loadInstitute = async () => {
    try {
      setInstituteLoading(true);
      const res = await agent.get(GetMasterInstitute);
      if (res.data.Status === "Success") {
        setAllInstitute(res.data.Data);
      }
       //console.log("Institute API Response", res.data.Data);
    } catch (err) {
       //console.log("Institute API Error", err);
    } finally {
      setInstituteLoading(false);
    }
  };


  useEffect(() => {
     //console.log("Selected District =", selectedDistrict);
     //console.log("Total Institute =", allInstitute.length);

    if (selectedDistrict && allInstitute.length > 0) {
      const filtered = allInstitute.filter((item) => {
        if (item.Value === "-1") return false;
        return String(item.Group).trim() === String(selectedDistrict).trim();
      });
       //console.log("Filtered Institute =", filtered.length);
      setFilteredInstitute(filtered);
    } else {
      setFilteredInstitute([]);
    }
  }, [selectedDistrict, allInstitute]);

  
  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setSelectedInstitute(""); 
  };

  const handleSearch = () => {
    if (!examType || !exam) {
      setShowModal(true);
      return;
    }

     //console.log("Search Filters →", {
      examType,
      exam,
      selectedDistrict,
      selectedInstitute,
    });

   
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5">

      <div className="bg-slate-500 text-white px-5 py-2 inline-block rounded-md font-semibold mb-4">
        ☰ Result and Certificate
      </div>

      <div className="bg-white p-6 rounded-lg shadow">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">

          <DropdownComponent
            label="Exam Type"
            required
            options={examTypeOptions}
            value={examType}
            onChange={(value) => setExamType(value)}
          />

          <DropdownComponent
            label="Examination"
            required
            options={examOptions}
            value={exam}
            onChange={(value) => setExam(value)}
          />

        </div>

        <hr className="my-4" />

       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          <DropdownComponent
            label="District"
            options={districtOptions}
            value={selectedDistrict}
            onChange={handleDistrictChange}
            loading={districtLoading}
          />

          <DropdownComponent
            label="Institute"
            options={filteredInstOptions}
            value={selectedInstitute}
            onChange={(value) => setSelectedInstitute(value)}
            loading={instituteLoading}
          />

        </div>

        <div className="text-center">
          <button
            onClick={handleSearch}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Search
          </button>
        </div>

      </div>


      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-[500px] rounded shadow">

            <div className="bg-blue-900 text-white p-3 text-lg font-semibold">
              ⚠ Errors
            </div>

            <div className="p-5 space-y-2">
              {!examType && (
                <div className="text-red-600">• Please Select Exam Type.</div>
              )}
              {!exam && (
                <div className="text-red-600">• Please Select Examination.</div>
              )}
            </div>

            <div className="border-t p-3 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-500 text-white px-5 py-2 rounded"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ResultCertificateSearch;