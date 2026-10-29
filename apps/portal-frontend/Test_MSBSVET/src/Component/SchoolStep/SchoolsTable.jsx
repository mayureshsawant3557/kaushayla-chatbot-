import { useState, useCallback, useMemo, useEffect } from "react";
import { FiEye, FiEdit, FiPlus } from "react-icons/fi";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import { SwalHelper } from "../../utils/swalHelper";
import verifiedImg from "../../assets/VerifiedIcon.jpg";
import notVerifiedImg from "../../assets/NotVerifiedIcon.jpg";
import questionMarkImg from "../../assets/QuestionMark.png";
import agent from "../../lib/api/agent";
import { GetSchoolsList } from "../../Endpoints_All/SchoolStep/school";
import { useLoading } from "../../Hooks/useLoading";
import { useAuth } from "../../Hooks/AuthContext";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import Loader from "../formcomponent/Loader";
import {
  GetMasterTaluka,
  GetMasterDistrict,
  GetMasterCity,
} from "../../Endpoints_All/Base/location";
import { forwardRef, useImperativeHandle } from "react";

const SchoolsTable = forwardRef(
  (
    {
      instituteId: propInstituteId,
      onEditSchool,
      onDeleteSchool,
      onViewSchool,
      onAddClick,
      fieldsDisabled = false,
    },
    ref,
  ) => {
    const { userInfo } = useAuth();
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [schools, setSchools] = useState([]);
    const [rawSchools, setRawSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [instituteID, setInstituteID] = useState(null);
    const { startLoading, stopLoading } = useLoading();
    const [talukaList, setTalukaList] = useState([]);
    const [districtList, setDistrictList] = useState([]);
    const [cityList, setCityList] = useState([]);

    useEffect(() => {
      const initializeComponent = async () => {
        await fetchUserAndInstituteDetails();
      };
      initializeComponent();
    }, []);

    useEffect(() => {
      fetchMasterTaluka();
      fetchMasterDistrict();
      fetchMasterCity();
    }, []);

    const fetchUserAndInstituteDetails = async () => {
      try {
        startLoading();

        if (propInstituteId) {
          setInstituteID(propInstituteId);
          return;
        }

        
        const loginID = userInfo?.UserLoginID || userInfo?.UserLoginID;

        const instituteResponse = await agent.get(
          `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
        );

        if (
          instituteResponse.data?.Status === "Success" &&
          instituteResponse.data?.Data
        ) {
          setInstituteID(instituteResponse.data.Data);
        } else {
          throw new Error("Failed to fetch institute ID");
        }
      } catch (err) {
        console.error("Error fetching institute ID:", err);
        setError("Failed to fetch institute ID");
        SwalHelper.error("Error", "Failed to fetch institute ID");
      } finally {
        stopLoading();
      }
    };

    const fetchMasterTaluka = async () => {
      try {
        const res = await agent.get(GetMasterTaluka);
        if (res.data.Status === "Success") {
          setTalukaList(res.data.Data || []);
        }
      } catch (err) {
        console.error("Error fetching taluka:", err);
      }
    };

    const fetchMasterDistrict = async () => {
      try {
        const res = await agent.get(GetMasterDistrict);
        if (res.data.Status === "Success") {
          setDistrictList(res.data.Data || []);
        }
      } catch (err) {
        console.error("Error fetching district:", err);
      }
    };
    const fetchMasterCity = async () => {
      try {
        const res = await agent.get(GetMasterCity);
        if (res.data.Status === "Success") {
          setCityList(res.data.Data || []);
        }
      } catch (err) {
        console.error("Error fetching city:", err);
      }
    };

    const talukaMap = useMemo(() => {
      const map = {};
      talukaList.forEach((t) => {
        map[parseInt(t.Value)] = t.Text;
      });
      return map;
    }, [talukaList]);

    const districtMap = useMemo(() => {
      const map = {};
      districtList.forEach((d) => {
        map[parseInt(d.Value)] = d.Text;
      });
      return map;
    }, [districtList]);
    const cityMap = useMemo(() => {
      const map = {};
      cityList.forEach((c) => {
        map[c.Value] = c.Text;
      });
      return map;
    }, [cityList]);

    useEffect(() => {
      if (
        rawSchools.length > 0 &&
        cityList.length > 0 &&
        talukaList.length > 0 &&
        districtList.length > 0
      ) {
        const transformedSchools = rawSchools.map((item, index) => ({
          id: item.SchoolID || `school-${index}`,
          sno: index + 1,
          udiseNo: item.UDISENo || "N/A",
          schoolName: item.SchoolName || "N/A",

          city:
            item.Village && item.Village.trim() !== ""
              ? item.Village
              : cityMap[item.CityID] || "N/A",

          taluka: talukaMap[item.TalukaID] || "N/A",
          district: districtMap[item.DistrictID] || "N/A",

          mouStatus: item.MoUStatus || "Expired",
          dateOfMoU: item.MoUDate || "N/A",
          expiryOfMoU: item.MoUExpiry || "N/A",

          status:
            item.VerificationStatus === "V"
              ? "Verified"
              : item.VerificationStatus === "P"
                ? "Pending"
                : item.VerificationStatus === "R"
                  ? "Rejected"
                  : "Not Verified",

          IsEditAllowed: true,
          IsDeleteAllowed: true,
        }));

        setSchools(transformedSchools);
      }
    }, [rawSchools, cityList, talukaList, districtList]);

    const fetchSchools = useCallback(async () => {
      if (!instituteID) return;

      try {
        setLoading(true);
        setError(null);

        const response = await agent.get(GetSchoolsList, {
          params: { instituteId: instituteID },
        });

        setRawSchools(response.data?.Table || []);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch schools";

        setError(errorMessage);
        SwalHelper.error("Error", errorMessage);
      } finally {
        setLoading(false);
      }
    }, [instituteID]);

    useEffect(() => {
      if (instituteID) {
        fetchSchools();
      }
    }, [instituteID]);

    useImperativeHandle(ref, () => ({
      refreshSchools: fetchSchools,
    }));

    const handleViewSchool = useCallback(
      (school) => {
        setSelectedSchool(school);
        setShowViewModal(true);
        onViewSchool?.(school);
      },
      [onViewSchool],
    );

    const handleEditSchool = useCallback(
      (school) => {
        if (!school.IsEditAllowed) {
          SwalHelper.warning(
            "Cannot Edit",
            "This school record cannot be edited.",
          );
          return;
        }
        onEditSchool?.(school);
      },
      [onEditSchool],
    );

    const handleDeleteSchool = useCallback(
      async (school) => {
        if (!school.IsDeleteAllowed) {
          SwalHelper.warning(
            "Cannot Delete",
            "This school record cannot be deleted.",
          );
          return;
        }

        const confirmed = await SwalHelper.confirm({
          title: "Are you sure?",
          text: `You are about to delete ${school.schoolName}`,
          confirmText: "Yes, delete it!",
        });

        if (confirmed) {
          setSchools((prev) => prev.filter((s) => s.id !== school.id));
          await onDeleteSchool?.(school);
          fetchSchools();
        }
      },
      [onDeleteSchool, fetchSchools],
    );

    const closeModal = useCallback(() => {
      setShowViewModal(false);
      setSelectedSchool(null);
    }, []);

    const columns = useMemo(
      () => [
        {
          key: "actions",
          header: (
            <button
              type="button"
              // onClick={onAddClick}
              onClick={() => {
                onAddClick?.();
              }}
              disabled={fieldsDisabled || loading}
              className="w-7 h-7 flex items-center justify-center mx-auto bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              title="Add New School"
            >
              <FiPlus size={16} />
            </button>
          ),
          headerClassName: "text-center bg-gray-50",
          className: "text-center",
          sortable: false,
          width: "80px",
        },
        {
          key: "sno",
          header: "S.N.",
          width: "50px",
          className: "text-center font-medium",
          sortable: true,
          headerClassName: "text-center bg-gray-50",
        },
        {
          key: "udiseNo",
          header: "UDISE No.",
          width: "110px",
          className: "text-center",
          sortable: true,
          headerClassName: "text-center bg-gray-50",
        },
        {
          key: "schoolName",
          header: "School",
          width: "220px",
          sortable: true,
          headerClassName: "text-center bg-gray-50",
        },
        {
          key: "city",
          header: "City/ Village",
          width: "120px",
          sortable: true,
          headerClassName: "text-center bg-gray-50",
        },
        {
          key: "taluka",
          header: "Taluka",
          width: "100px",
          sortable: true,
          headerClassName: "text-center bg-gray-50",
        },
        {
          key: "district",
          header: "District",
          width: "100px",
          sortable: true,
          headerClassName: "text-center bg-gray-50",
        },
        {
          key: "mouStatus",
          header: "MoU Status",
          width: "100px",
          className: "text-center",
          sortable: true,
          headerClassName: "text-center bg-gray-50",
        },
        {
          key: "status",
          header: "Status",
          width: "100px",
          className: "text-center",
          sortable: true,
          headerClassName: "text-center bg-gray-50",
        },
      ],
      [fieldsDisabled, loading, onAddClick],
    );

    const filterColumns = useMemo(
      () => ["district", "taluka", "schoolName", "mouStatus"],
      [],
    );

    const renderSchoolCell = useCallback(
      (row, column) => {
        if (column.key === "actions") {
          return (
            <div className="flex justify-center items-center gap-1.5">
              <button
                onClick={() => handleViewSchool(row)}
                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 disabled:opacity-50"
                title="View School Details"
                disabled={loading}
              >
                <FiEye size={18} />
              </button>
              <button
                onClick={() => handleEditSchool(row)}
                className={`p-1 rounded ${
                  row.IsEditAllowed && !loading
                    ? "text-green-600 hover:text-green-800 hover:bg-green-50"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                title={
                  row.IsEditAllowed ? "Edit School" : "Editing not allowed"
                }
                disabled={!row.IsEditAllowed || loading}
              >
                <FiEdit size={18} />
              </button>
              {/* <button
                onClick={() => handleDeleteSchool(row)}
                className={`p-1 rounded ${
                  row.IsDeleteAllowed && !loading
                    ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                title={
                  row.IsDeleteAllowed ? "Delete School" : "Deletion not allowed"
                }
                disabled={!row.IsDeleteAllowed || loading}
              >
                <FaTrash size={18} />
              </button> */}
            </div>
          );
        }

        if (column.key === "mouStatus") {
          const statusColors = {
            Active: "bg-green-100 text-green-800 border-green-200",
            Expired: "bg-red-100 text-red-800 border-red-200",
          };
          const defaultColor =
            "bg-yellow-100 text-yellow-800 border-yellow-200";
          const colorClass = statusColors[row.mouStatus] || defaultColor;

          return (
            <div className="flex justify-center">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
              >
                {row.mouStatus}
              </span>
            </div>
          );
        }

        if (column.key === "status") {
          let icon = notVerifiedImg;
          let title = "Not Verified";

          if (row.status === "Verified") {
            icon = verifiedImg;
            title = "Verified";
          } else if (row.status === "Pending") {
            icon = questionMarkImg;
            title = "Pending Verification";
          } else if (row.status === "Rejected") {
            icon = notVerifiedImg;
            title = "Rejected";
          }

          return (
            <div className="flex justify-center">
              <img
                src={icon}
                alt={title}
                className="h-8 w-auto"
                title={title}
              />
            </div>
          );
        }

        return row[column.key] || "";
      },
      [handleViewSchool, handleEditSchool, handleDeleteSchool, loading],
    );

    if (loading || schools.length === 0) {
      return <Loader />;
    }

    return (
      <div className="w-full">
        {instituteID && (
          <div className="mb-2 text-xs text-gray-500">
            Institute ID: {instituteID} | Schools: {schools.length}
          </div>
        )}

        <div className="w-full overflow-hidden">
          <FilteredTableComponent
            data={schools}
            columns={columns}
            filterColumns={filterColumns}
            searchable={true}
            sortable={true}
            exportable={true}
            title=""
            exportFileName="schools_list"
            maxHeight="500px"
            stickyHeader={true}
            emptyStateMessage={error || "No schools found"}
            emptyStateSubMessage={
              error
                ? "Please try again later"
                : "Click on the + button to add a new school"
            }
            showExcel={true}
            showPDF={true}
            tableId="schools-table"
            renderCell={renderSchoolCell}
          />
        </div>

        {showViewModal && selectedSchool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
                <h2 className="text-xl font-semibold">School Details</h2>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium w-1/3">
                        UDISE No.:
                      </td>
                      <td className="py-3 text-gray-900">
                        {selectedSchool.udiseNo}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium">
                        School Name:
                      </td>
                      <td className="py-3 text-gray-900 font-semibold">
                        {selectedSchool.schoolName}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium">
                        City/Village:
                      </td>
                      <td className="py-3 text-gray-900">
                        {selectedSchool.city}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium">
                        Taluka ID:
                      </td>
                      <td className="py-3 text-gray-900">
                        {selectedSchool.taluka}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium">
                        District ID:
                      </td>
                      <td className="py-3 text-gray-900">
                        {selectedSchool.district}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium">
                        Date of MoU:
                      </td>
                      <td className="py-3 text-gray-900">
                        {selectedSchool.dateOfMoU !== "N/A"
                          ? new Date(
                              selectedSchool.dateOfMoU,
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium">
                        Expiry of MoU:
                      </td>
                      <td className="py-3 text-gray-900">
                        {selectedSchool.expiryOfMoU !== "N/A"
                          ? new Date(
                              selectedSchool.expiryOfMoU,
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 font-medium">
                        MoU Status:
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                            selectedSchool.mouStatus === "Active"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          {selectedSchool.mouStatus}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-600 font-medium">
                        Verification Status:
                      </td>
                      <td className="py-3">
                        <img
                          src={
                            selectedSchool.status === "Verified"
                              ? verifiedImg
                              : selectedSchool.status === "Pending"
                                ? questionMarkImg
                                : notVerifiedImg
                          }
                          alt={selectedSchool.status}
                          className="h-8 w-auto"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

SchoolsTable.displayName = "SchoolsTable";

export default SchoolsTable;
