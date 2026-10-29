
import React, { useContext, useEffect, useState } from "react";
import { FileText } from "lucide-react";
import agent from "../../../lib/api/agent";
import { ThemeContext } from "../../Context/ThemeContext";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import Button from "../../Base/Button";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import Loader from "../../formcomponent/Loader";


const ITIPrincipalDetailsReport = () => {

    const { color } = useContext(ThemeContext);

    const [selectedRole, setSelectedRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [managementTypes, setManagementTypes] = useState([]);

    const columns = [
        { key: "serialNumber", header: "Sr. No.", width: "60px", className: "text-center" },
        { key: "InstituteCode", header: "Institute Code", width: "90px", className: "text-center" },
        { key: "InstituteName", header: "Institute Name", width: "400px", className: "text-left " },
        { key: "InstituteManagementName", header: "Management", width: "150px", className: "text-center" },
        { key: "ManagementType", header: "Management Type", width: "200px", className: "text-left" },
        { key: "ApplicationID", header: "Application ID", width: "150px", className: "text-center" },
        { key: "FirstName", header: "First Name", width: "150px", className: "text-center" },
        { key: "MiddleName", header: "Middle Name", width: "150px", className: "text-center" },
        { key: "LastName", header: "Last Name", width: "150px", className: "text-center" },
        { key: "GenderCode", header: "Gender", width: "150px", className: "text-center" },
        { key: "MobileNo", header: "Mobile", width: "150px", className: "text-center" },
        { key: "EmailId", header: "Email", width: "70px", className: "text-center" },
    ]; useEffect(() => {
        loadManagementTypes();
    }, []);

    const loadManagementTypes = async () => {
        try {
            const response = await agent.get(
                "/api/ReportByInstitute/management-types"
            );

            const data = response.data?.Data?.Table || [];

            setManagementTypes(data);
        } catch (error) {
            console.error("Failed to load management types", error);
        }
    };

    const search = async () => {

        if (!selectedRole) {
            setError("Please select Role Type.");
            return;
        }

        setHasSearched(true);
        setError("");
        setLoading(true);

        try {

            const response = await agent.get(
                "/api/ReportByInstitute/iti-principal-details",
                {
                    params: {
                        managementType: Number(selectedRole),
                        instType1: "GITI",
                        instType2: "P"
                    }
                }
            );

            const data = response.data?.Data?.Table || [];

            const transformedData = data.map((item, index) => ({
                serialNumber: index + 1,
                ...item
            }));

            setRows(transformedData);

        } catch (error) {

            setRows([]);
            setError("Failed to fetch report.");

        } finally {

            setLoading(false);

        }
    };

    const reset = () => {

        setSelectedRole("");
        setRows([]);
        setError("");
        setHasSearched(false);

    };

    return (
        <>
            {loading && (
                <Loader text="Loading ITI Principal Details..." />
            )}
            <div className=" p-6 bg-gray-50 min-h-screen ">
                <div className="max-w-full bg-white rounded-xl shadow-md p-6">

                    <fieldset className="border rounded-md p-4">
                        <legend
                            className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color || 'bg-green-600'}`}
                        >
                            <FileText className="inline mr-2 h-4 w-4" />
                            ITI Principal Details Report
                        </legend>

                        {error && <div className="text-red-600 mb-3">{error}</div>}

                        <div className="grid md:grid-cols-3 gap-5">

                            <DropdownComponent
                                label="Role Type"
                                options={managementTypes.map(item => ({
                                    value: item.ManagementTypeID,
                                    label: item.ManagementTypeName
                                }))}
                                value={selectedRole}
                                onChange={(value) => setSelectedRole(value)}
                                required
                            />

                        </div>

                        <div className="flex justify-center gap-3 mt-6">
                            <Button variant="success" onClick={search}>Search</Button>
                            <Button variant="danger" onClick={reset}>Reset</Button>
                        </div>

                    </fieldset>

                    {hasSearched && (
                        <div className="mt-6 w-full overflow-x-auto">
                            <FilteredTableComponent
                                data={rows}
                                columns={columns}
                                searchable
                                sortable
                                exportable
                                showExcel
                                showPDF={false}
                                exportFileName="ITI_Principal_Details"
                                minTableWidth="1800px"
                            />
                        </div>
                    )}
                    
                    {/* {!hasSearched && (
                        <div className="mt-8 bg-white border rounded-lg py-12 text-center">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-lg text-gray-500">
                                Select a Role Type and click Search to view.
                            </p>
                        </div>
                    )} */}

                </div>
            </div>
        </>
    );
}

export default ITIPrincipalDetailsReport;

