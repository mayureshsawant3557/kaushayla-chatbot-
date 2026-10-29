import { useEffect } from "react";
import agent from "../../../lib/api/agent";
import { AcademisthanCertificate_GetForPrinting, BulkCertificatePdf, MarkCertificateAsPrinted } from "../../../Endpoints_All/CMS/academisthan";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";
import { useState } from "react";
import Button from "../../../Component/base/Button";

const AcademisthanResultStatus = () => {
  const column = [
    {
      key: 'CertificateId',
      header: 'Certificate ID',
      width: '50px',
      className: 'text-center'
    },
    { key: 'ApplicationIDDisplay', header: 'Application ID', width: '50px', className: 'text-center', },
    {
      key: 'StudentName',
      header: 'Student Name',
      width: '200px',
      className: 'text-center'
    },
    {
      key: 'CourseName',
      header: 'Course',
      width: '200px',
      className: 'text-center'
    },
    {
      key: 'InstituteName',
      header: 'Institute',
      width: '240px',
      className: 'text-center'
    },
    {
      key: 'IssueDate',
      header: 'Issue Date',
      width: '140px',
      className: 'text-center'
    },
    {
      key: 'CreatedDate',
      header: 'Created Date',
      width: '140px',
      className: 'text-center'
    },
    { key: 'Actions', header: 'Actions', width: '120px' }
  ]

  // Prepare data with srNo and add id for keying
  // const tableData = batches.map((batch, index) => ({
  //   ...batch,
  //   id: batch.BatchID || index,
  //   srNo: index + 1
  // }))




  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([])
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const response = await agent.get(`${AcademisthanCertificate_GetForPrinting}`);
      setCandidates(response?.data?.Data ?? []);

    } catch (error) {
      setCandidates([]);
    }
  }
  const tableData = candidates.map((candidate, index) => ({
    ...candidate,
    id: candidate.CertificateId || index,
    IssueDate: candidate.IssueDate
      ? new Date(candidate.IssueDate)
        .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        .replace(/ /g, "-")
      : "N/A",

    CreatedDate: candidate.CreatedDate
      ? new Date(candidate.CreatedDate)
        .toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(",", "")
        .replace(/ /g, "-")
        .replace(/-(\d{2}:\d{2})$/, " $1")
      : "N/A",
  }));

  // const markAsPrinted = (CertificateId) => {
  //   if(!CertificateId) return;
  //   //const response = agent.post(`${MarkCertificateAsPrinted}?CertificateId=${CertificateId}`);
  //   console.log('Certificate Mark As printed__>>-->>', CertificateId);

  // }
  const markAsPrinted = async (item) => {
    if (!item?.CertificateId) return;

    try {
      const res = await agent.put(
        `${MarkCertificateAsPrinted}?id=${item.CertificateId}&candidate=${item.CandidateId}&applicationId=${item.ApplicationIDDisplay}`
      );

      fetchData();

    } catch (err) {
    }
  };

  const downloadCertificate = async (certificateId) => {
    if (!certificateId) return;
    try {
      const response = await agent.get(
        `${BulkCertificatePdf}?certificateId=${certificateId}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", `Certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();

    } catch (error) {
    }
  };

  const printSelectedCertificates = async (selectedCandidates) => {
    if (selectedCandidates.length === 0) {
      alert("Please select at least one certificate");
      return;
    }

    for (let item of selectedCandidates) {
      await downloadCertificate(item.CertificateId);

      await markAsPrinted(item);
    }
  };

  const printAllCertificates = async () => {
    for (let item of candidates) {
      await downloadCertificate(item.CertificateId);
      await markAsPrinted(item);
    }
  };
  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
      <fieldset className="mb-4 rounded-md border p-4">
        <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
          <span className='text-base'>☰</span>
          <span>Acadmisthan Result Status</span>
        </legend>
        <FilteredTableComponent
          className='pl-6 pr-6'
          data={tableData ?? []}
          columns={column}
          searchable={true}
          showExport={false}
          showExcelTemplate={false}
          showPDF={false}
          sortable={true}
          showCheckbox={true}
          isRowSelectable={item =>
            (item.ApplicationIDDisplay || item.ApplicationIDDisplay > 0) && !item.Isprinted && item.CertificateId > 0
          }
          onSelectionChange={selected => setSelectedCandidates(selected)}
          renderCell={(item, column) => {
            if (column.key === 'Actions') {
              return (
                <div className="flex gap-2">
                  {/* <span
                    className="text-white font-bold cursor-pointer bg-blue-600 hover:bg-blue-800 m-1 p-1 rounded"
                    onClick={() => downloadCertificate(item.CertificateId)}
                  >
                    🖨️
                  </span> */}

                  <span
                    className="text-white font-bold cursor-pointer bg-green-600 hover:bg-green-800 p-2 rounded"
                    onClick={() => markAsPrinted(item)}
                  >
                    Mark Printed
                  </span>
                </div>
              );
            }
          }}
        />
        <div className="flex justify-start gap-2 mt-4">
          <Button
            variant='success'
            onClick={() => printSelectedCertificates(selectedCandidates)}
          >
            Print Selected ({selectedCandidates?.length})
          </Button>

          <Button
            variant='info'
            onClick={printAllCertificates}
          >
            Print All
          </Button>
        </div>
      </fieldset>
    </div>
  )
};

export default AcademisthanResultStatus;