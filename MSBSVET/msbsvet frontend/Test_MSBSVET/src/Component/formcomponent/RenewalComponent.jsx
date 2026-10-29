
import React, { useEffect, useMemo, useState } from "react";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import agent from "../../lib/api/agent";

import {
    GetInstituteIDByInstituteCode
    
} from "../../Endpoints_All/Base/Institute";
import { baseURL } from "../../Endpoints_All/config/baseConfig";

    
    
 

const RenewalComponent = ({UserLoginID }) => {
    const [instituteId, setInstituteId] = useState(null);
    const [rows, setRows] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState("");

   
    useEffect(() => {
        if (!UserLoginID) {
            setInstituteId(null);
            setRows([]);
            return;
        }

        const getInstitute = async () => {
            try {
                setFetching(true);
                setError("");

                const res = await agent.get(
                    GetInstituteIDByInstituteCode,
                    {
                        params: {
                            InstituteCode: UserLoginID,
                        },
                    }
                );

                const id =
                    res?.data?.Data ??
                    res?.data?.InstituteID ??
                    null;

                setInstituteId(id);
            } catch (e) {
                console.error(
                    "Error getting Institute ID:",
                    e
                );

                setInstituteId(null);
                setRows([]);
                setError(
                    "Unable to get institute details."
                );
            } finally {
                setFetching(false);
            }
        };

        getInstitute();
    }, [UserLoginID]);

    
    useEffect(() => {
        if (!instituteId) {
            return;
        }

        const getRenewalDetails = async () => {
            try {
                setFetching(true);
                setError("");

                const response = await agent.get(
                    `${baseURL}/api/InstituteBase/GetInstituteRenewalDetails`,
                    {
                        params: {
                            CollegeID: instituteId,
                        },
                    }
                );

                const data =
                    response?.data?.Data ??
                    response?.data?.data ??
                    response?.data ??
                    [];

                setRows(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (e) {
                console.error(
                    "Error getting renewal details:",
                    e
                );

                setRows([]);
                setError(
                    "Unable to get renewal details."
                );
            } finally {
                setFetching(false);
            }
        };

        getRenewalDetails();
    }, [instituteId]);

    const tableRows = useMemo(() => {
        return rows.map((item, index) => ({
            ...item,
            serialNumber: index + 1,
        }));
    }, [rows]);

    
    const columns = useMemo(
        () => [
            {
                key: "serialNumber",
                header: "S.N.",
                width: "60px",
                className: "text-center",
                headerClassName: "text-center",
                sortable: false,
            },
            {
                key: "CourseName",
                header: "Course Name",
                width: "280px",
            },
            {
                key: "UnitNo",
                header: "Unit No",
                width: "100px",
                className: "text-center",
                headerClassName: "text-center",
            },
            {
                key: "ShiftID",
                header: "Shift ID",
                width: "100px",
                className: "text-center",
                headerClassName: "text-center",
            },
            {
                key: "UnitID",
                header: "Unit ID",
                width: "100px",
                className: "text-center",
                headerClassName: "text-center",
            },
            {
                key: "Shift",
                header: "Shift",
                width: "120px",
                className: "text-center",
                headerClassName: "text-center",
            },
            {
                key: "Intake",
                header: "Intake",
                width: "100px",
                className: "text-center",
                headerClassName: "text-center",
            },
            {
                key: "Status",
                header: " Course Status",
                width: "120px",
                className: "text-center",
                headerClassName: "text-center",
            },
            {
                key: "RenewalFees",
                header: "Renewal Fees",
                width: "150px",
                className: "text-center",
                headerClassName: "text-center",
            },
            {
                key: "BatchStatus",
                header: "Batch Status",
                width: "150px",
                className: "text-center",
                headerClassName: "text-center",
            },
        ],
        []
    );

    const renderCell = (item, column) => {
        if (column.key === "Status") {
            const value = item?.Status;

            if (!value) {
                return "-";
            }

            return (
                <span
                    className={
                        value == "Active"
                            ? "font-medium text-green-600"
                            : "font-medium text-red-600"
                    }
                >
                    {value}
                </span>
            );
        }

        if (column.key === "RenewalDates") {
            const value = item?.RenewalDates;

            if (!value) {
                return "-";
            }

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return value;
            }

            return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }

        if (column.key === "RenewalFees") {
            const value = item?.RenewalFees;

            if (value === null || value === undefined) {
                return "-";
            }

            return `₹ ${Number(value).toLocaleString("en-IN")}`;
        }
        if (column.key === "BatchStatus") {
            const value = item?.BatchStatus;

            if (!value) {
                return "-";
            }

            return (
                <span
                    className={
                        value === "Created"
                            ? "font-medium text-green-600"
                            : "font-medium text-red-600"
                    }
                >
                    {value}
                </span>
            );
        }

        return item?.[column.key] ?? "-";
    };

   
    return (
        <div className="w-90 p-4">
            {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <FilteredTableComponent
                data={tableRows}
                columns={columns}
                searchable={false}
                showExport={false}
                showExcelTemplate={false}
                showPDF={false}
                sortable={true}
                showCheckbox={false}
                tableId="institute-renewal-details-table"
                maxHeight="500px"
                stickyHeader={true}
                renderCell={renderCell}
                emptyMessage={
                    fetching
                        ? "Loading..."
                        : "No renewal details available"
                }
                tableTitle="Course Renewal Details"
            />
        </div>
    );
};

export default RenewalComponent;
