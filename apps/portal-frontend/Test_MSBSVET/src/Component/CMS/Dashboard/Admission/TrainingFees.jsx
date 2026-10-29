import { useState, useContext } from "react";
import FilteredTableComponent from "../../../formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../../Context/ThemeContext";

const TrainingFees = () => {
  const { color } = useContext(ThemeContext);
  const [form, setForm] = useState({
    trainingFeeId: "",
    withPlacement: "",
    withoutPlacement: "",
  });

  const [data, setData] = useState([
    {
      id: 1,
      fee: "1",
      withP: "40.00",
      withoutP: "32.67",
      date: "17-Apr-2026 05:17 PM",
    },
    { id: 2, fee: "1A", withP: "", withoutP: "", date: "20-Sep-2025 05:27 PM" },
    {
      id: 3,
      fee: "2",
      withP: "42.00",
      withoutP: "28.00",
      date: "20-Sep-2025 05:28 PM",
    },
    {
      id: 4,
      fee: "50",
      withP: "60.00",
      withoutP: "75.00",
      date: "17-Apr-2026 05:18 PM",
    },
  ]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const newRow = {
      id: data.length + 1,
      fee: form.trainingFeeId,
      withP: form.withPlacement,
      withoutP: form.withoutPlacement,
      date: new Date().toLocaleString(),
    };
    setData([...data, newRow]);
    handleReset();
  };

  const handleReset = () => {
    setForm({ trainingFeeId: "", withPlacement: "", withoutPlacement: "" });
  };

  const handleEdit = (row) => {
    setForm({
      trainingFeeId: row.fee,
      withPlacement: row.withP,
      withoutPlacement: row.withoutP,
    });
  };

  // FilteredTableComponent's column shape: { key, header, ...}
  const columns = [
    {
      key: "id",
      header: "ID",
      width: "70px",
      headerClassName: "text-center",
      className: "text-center",
    },
    { key: "fee", header: "Training Fee" },
    {
      key: "withP",
      header: "With Placement",
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "withoutP",
      header: "Without Placement",
      className: "text-center",
      headerClassName: "text-center",
    },
    { key: "date", header: "Last Updated" },
    {
      key: "action",
      header: "Action",
      sortable: false,
      excludeFromExport: true,
      className: "text-center",
      headerClassName: "text-center",
    },
  ];

  // Custom cell renderer — only override the Action column, everything
  // else falls through to FilteredTableComponent's default rendering.
  const renderCell = (item, column) => {
    if (column.key === "action") {
      return (
        <button
          onClick={() => handleEdit(item)}
          className="bg-yellow-400 hover:bg-yellow-500 transition-colors px-3 py-1 rounded text-slate-800 font-medium"
        >
          Edit
        </button>
      );
    }
    return undefined; // undefined = let the component render it normally
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <fieldset className="mb-6 rounded-md border p-4">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-400 ${color} px-4 py-2 text-lg font-semibold text-white`}
        >
          Manage Course Training Fee
        </legend>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 text-gray-700">
                Training Fee ID
              </label>
              <input
                type="text"
                name="trainingFeeId"
                value={form.trainingFeeId}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">With Placement</label>
              <input
                type="text"
                name="withPlacement"
                value={form.withPlacement}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                Without Placement
              </label>
              <input
                type="text"
                name="withoutPlacement"
                value={form.withoutPlacement}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 bg-gray-100"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-5 py-2 rounded-md"
            >
              Save
            </button>
            <button
              onClick={handleReset}
              className="bg-red-600 text-white px-5 py-2 rounded-md"
            >
              Reset
            </button>
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-6 rounded-md border p-4">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-400 ${color} px-4 py-2 text-lg font-semibold text-white`}
        >
          Existing Fees
        </legend>

        <div className="p-4">
          <FilteredTableComponent
            data={data}
            columns={columns}
            filterColumns={["fee"]}
            searchable={true}
            sortable={true}
            exportable={true}
            showExcel={true}
            showPDF={true}
            exportFileName="training_fees"
            renderCell={renderCell}
            paginate={true}
            rowsPerPageOptions={[10, 20, 50, 100]}
            defaultRowsPerPage={10}
            maxHeight="480px"
            emptyStateMessage="No training fees found"
            emptyStateSubMessage="Add a training fee using the form above."
            tableId="training-fees-table"
          />
        </div>
      </fieldset>
    </div>
  );
};

export default TrainingFees;
