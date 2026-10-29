import React, { useState, useEffect, useContext, useMemo } from "react";
import Swal from "sweetalert2";
import { ThemeContext } from "../../Context/ThemeContext";
import { useLoading } from "../../../Hooks/useLoading";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { GetInspectionFeeDetails } from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sha256 } from "js-sha256";
import agent from "../../../lib/api/agent";
import { CheckFeePaid } from "../../../Endpoints_All/Fee/feeManagement";
import { use } from "react";
import DocumentLink from "../../formcomponent/OpenDocumentComponent";
import { usePayment } from "../../Context/PaymentContext";
import { useAuth } from "../../../Hooks/AuthContext";
import { useNoticePopup } from "../../../Component/formcomponent/NoticePop";

const InspectionFeePage = () => {
  const { color } = useContext(ThemeContext);
  const { userInfo } = useAuth();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const navigate = useNavigate();
  //paid amomt
  const { fetchAndCalculateInspectionTotal } = usePayment();
  const [searchParams] = useSearchParams();
  const p1 = searchParams.get("P1");
  const p2 = searchParams.get("P2");
  const [inspectionFeeData, setInspectionFeeData] = useState([]);
  const [userLoginID, setUserLoginID] = useState("");
  const [userTypeID, setUserTypeID] = useState("");
  const [instituteID, setInstituteID] = useState(null);
  const [ipAddress, setIpAddress] = useState("");
  const [feeStaus, setFeeStatus] = useState();
  const { showNoticePopup } = useNoticePopup();

  // Fetch User and Institute Details
  const fetchUserAndInstituteDetails = async () => {
    try {
      const loginID = userInfo?.UserLoginID;
      const typeID = userInfo?.UserTypeID;

      if (!loginID) {
        throw new Error("User login information not found");
      }
      if (!typeID) {
        throw new Error("User type id not found");
      }

      setUserLoginID(loginID);
      setUserTypeID(typeID);

        if (typeID === 14 || (typeID === 81 && p1) || (typeID === 501 && p1)) {
        setInstituteID(p1);
        return { loginID, instituteID: p1 };
      }

      const resInstitute = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
      );
      const instID = resInstitute.data?.Data;

      if (!instID) {
        throw new Error("Institute not found");
      }

      setInstituteID(instID);
      return { loginID, instituteID: instID };
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  };
  useEffect(() => {
    showNoticePopup({
      title: "सूचना",
      icon: null,
      width: 1200,
      className: "text-black",
      content: [
        {
          text: "१. 	निरिक्षण युनिट्स (Inspection Units) म्हणजे संस्थेने प्रत्यक्ष निरिक्षणासाठी प्रस्तावित केलेली युनिट्स आहेत, ज्यामध्ये मंजूर युनिट्स (Approved Units) + इरादापत्र/ प्रस्तावित युनिट्स (LoI Units) यांचा समावेश होतो.",
        },
        {
          text: "२.	सर्व प्रशिक्षण पायाभूत सुविधांची गणना निरिक्षण युनिट्सच्या आधारे केली जाईल.",
        },
        {
          text: "३.	निरिक्षण युनिट्स हे एकूण युनिट्सपेक्षा (Total Units) जास्त आणि यापूर्वी मंजूर झालेल्या युनिट्सपेक्षा (Approved Units) कमी असू शकत नाहीत.",
        },
        {
          //heading: "४. निरीक्षण शुल्क गणना:",
          text: "४.	निरिक्षण शुल्काची (Inspection Fee) गणना केवळ नव्याने प्रस्तावित युनिट्सच्या आधारे केली जाईल, म्हणजेच = (निरिक्षण युनिट्स – एकूण युनिट्स).",
        },
        {
          text: "५.	सदर वेब पेजवरील तक्त्यात दर्शविलेले निरिक्षण शुल्क व सुरक्षा अनामत रक्कम (Security Deposit) केवळ नव्याने प्रस्तावित युनिट्सच्या (newly Proposed Units) आधारे गणना केलेली आहे.",
        },
        {
          text: "६.	निरिक्षण शुल्क भरल्यानंतर निरिक्षण युनिट्स गोठविली जातील (Freeze), म्हणजेच वापरकर्त्याला निरिक्षण युनिट्समध्ये बदल करता येणार नाही.",
        },
        {
          text: "७.	वापरकर्त्यांना सूचित करण्यात येते की, मागील पृष्ठांवरील सर्व माहिती पूर्ण भरल्यानंतरच निरिक्षण शुल्क भरावे.",
        },
        {
          text: "८. निरिक्षण समिती उपलब्ध प्रशिक्षण पायाभूत सुविधांनुसार युनिट्सची शिफारस करेल:",
        },
        {
          text: "a. 	जर अतिरिक्त प्रशिक्षण पायाभूत सुविधा उपलब्ध असतील, तर शिफारस केलेली युनिट्स (Recommended Units) निरिक्षण युनिट्सपेक्षा (Inspection Units) जास्त असू शकतात (संस्थेच्या संमतीने). अशा परिस्थितीत, संस्थेला संलग्नता (Affiliation) प्रक्रियेदरम्यान तपासणी शुल्काची उर्वरित रक्कम भरावी लागेल.",
          className: "ml-3",
        },
        {
          text: " b.	जर उपलब्ध प्रशिक्षण पायाभूत सुविधा यापूर्वी मंजूर झालेल्या युनिट्ससाठी (Approved Units) आवश्यक असलेल्या सुविधांपेक्षा कमी असतील, तर तपासणी समिती यापूर्वी मंजूर झालेल्या युनिट्सपेक्षा कमी युनिट्सची शिफारस करू शकते. अशा परिस्थितीत, जास्तीच्या मंजूर युनिट्सची (Approved Units) मान्यता रद्द केली जाईल.",
          className: "ml-3",
        },
        // {
        //   heading:
        //     "८. निरिक्षण समिती उपलब्ध प्रशिक्षण पायाभूत सुविधांनुसार युनिट्सची शिफारस करेल:",
        //   text: `a. जर अतिरिक्त प्रशिक्षण पायाभूत सुविधा उपलब्ध असतील, तर संस्थेच्या संमतीने शिफारस केलेली युनिट्स (Recommended Units) निरीक्षण युनिट्सपेक्षा (Inspection Units) जास्त असू शकतात. अशा परिस्थितीत, संस्थेला संलग्नता (Affiliation) प्रक्रियेदरम्यान उर्वरित निरीक्षण शुल्क भरावे लागेल.

        //           b. जर उपलब्ध प्रशिक्षण पायाभूत सुविधा मंजूर युनिट्स (Approved Units) साठी आवश्यक असलेल्या सुविधांपेक्षा कमी असतील, तर निरीक्षण समिती मंजूर युनिट्सपेक्षा कमी युनिट्सची शिफारस करू शकते. अशा परिस्थितीत, अतिरिक्त मंजूर युनिट्सची मान्यता रद्द करण्यात येईल.`,
        // },
      ],
      confirmText: "OK",
    });
  }, [showNoticePopup]);
  const fetchIsFeePaid = async (instituteID) => {
    try {
      const feeStatus = await agent.get(`${CheckFeePaid}/${instituteID}/7`);
      const response = feeStatus;

      setFeeStatus(response.data?.Data);
    } catch (error) {
      console.error("Error fetching fee details:", error);
      throw error;
    }
  };

  // Fetch IP Address
  const fetchIP = async () => {
    try {
      const response = await agent.get(getIp, { headers: { accept: "*/*" } });
      const ip = response.data?.ip || "0.0.0.0";
      setIpAddress(ip);
      return ip;
    } catch (error) {
      console.error("IP fetch error:", error);
      setIpAddress("0.0.0.0");
      return "0.0.0.0";
    }
  };

  // Fetch Inspection Fee Details
  const fetchInspectionFeeDetails = async (instituteID, loginID, ip) => {
    try {
      const response = await agent.post(GetInspectionFeeDetails, {
        instituteId: instituteID,
        exitInstituteID: 0,
        userLoginID: loginID,
        pageCode: "INSPECTION_FEE",
        itemId: 0,
        ipAddress: ip,
      });
      if (
        response.data?.Status === "Success" &&
        response.data?.Data?.length > 0
      ) {
        setInspectionFeeData(response.data.Data);
        return response.data.Data;
      }

      throw new Error("No inspection fee data found");
    } catch (error) {
      console.error("Error fetching inspection fee details:", error);
      throw error;
    }
  };

  // Load All Data
  const loadData = async () => {
    try {
      startLoading();

      const { loginID, instituteID } = await fetchUserAndInstituteDetails();
      const ip = await fetchIP();
      const fee = await fetchIsFeePaid(instituteID);
      await fetchInspectionFeeDetails(instituteID, loginID, ip, fee);
    } catch (error) {
      console.error("Error loading data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch data",
      });
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  useEffect(() => {
    loadData();
  }, []);

  // Calculate Totals
  const totals = useMemo(() => {
    if (!inspectionFeeData.length) return null;

    return inspectionFeeData.reduce(
      (acc, item) => ({
        approvedUnits: acc.approvedUnits + (item.ApprovedUnits || 0),
        proposedUnits: acc.proposedUnits + (item.LOIProposedUnits || 0),
        totalUnits: acc.totalUnits + (item.LOITotalUnits || 0),
        inspectionUnits: acc.inspectionUnits + (item.InspectionUnits || 0),
        inspectionFee: acc.inspectionFee + (item.InspectionFee || 0),
        securityDeposit: acc.securityDeposit + (item.SecurityDeposit || 0),
      }),
      {
        approvedUnits: 0,
        proposedUnits: 0,
        totalUnits: 0,
        inspectionUnits: 0,
        inspectionFee: 0,
        securityDeposit: 0,
      },
    );
  }, [inspectionFeeData]);

  // Table Columns Configuration
  const columns = useMemo(
    () => [
      {
        key: "sn",
        header: "S.N.",
        
        className: "text-center",
        width: "20px",
        sortable: false,
      },
      {
        key: "Course",
        header: "Course",
        
        className: "text-left pl-4",
        width: "400px",
        sortable: false,
      },
      {
        key: "ApprovedUnits",
        header: "Approved Units (A)",
        
        className: "text-center",
        width: "100px",
        sortable: false,
      },
      {
        key: "LOIProposedUnits",
        header: "LoI Units (B)",
       
        className: "text-center",
        width: "100px",
        sortable: false,
      },
      {
        key: "LOITotalUnits",
        header: "Total Units (C = A + B)",
        
        className: "text-center",
        width: "90px",
        sortable: false,
      },
      {
        key: "InspectionUnits",
        header: "Inspection Units",
       
        className: "text-center",
        width: "100px",
        sortable: false,
      },
      {
        key: "InspectionFee",
        header: "Inspection Fee",
        
        className: "text-center",
        width: "140px",
        sortable: false,
      },
      {
        key: "SecurityDeposit",
        header: "Security Deposit",
        
        className: "text-center",
        width: "150px",
        sortable: false,
      },
    ],
    [],
  );

  // Render Cell Content
  const renderCell = (item, column, rowIndex) => {
    if (column.key === "sn") {
      return rowIndex + 1;
    }
    if (column.key === "Course") {
      return item.ModelCurriculum ? (
        <DocumentLink
          documentUrl={item.ModelCurriculum}
          itemName={item.Course || "Course"}
          label={item.Course || ""}
        />
      ) : (
        item.Course || ""
      );
    }

    if (column.key === "InspectionFee") {
      return `${(item.InspectionFee || 0).toLocaleString("en-IN")}`;
    }

    if (column.key === "SecurityDeposit") {
      return `${(item.SecurityDeposit || 0).toLocaleString("en-IN")}`;
    }

    return item[column.key] || 0;
  };

  // Custom Footer for Totals Row
  const renderCustomFooter = () => {
    if (!totals) return null;

    return (
      <>
        <tr className="bg-gray-100 font-bold">
          <td
            colSpan={2}
            className="border border-gray-300 px-4 py-2 text-right font-bold"
          >
            Total
          </td>

          <td className="border border-gray-300 px-2 py-2 text-center font-bold">
            {totals.approvedUnits}
          </td>

          <td className="border border-gray-300 px-2 py-2 text-center font-bold">
            {totals.proposedUnits}
          </td>

          <td className="border border-gray-300 px-2 py-2 text-center font-bold">
            {totals.totalUnits}
          </td>

          <td className="border border-gray-300 px-2 py-2 text-center font-bold">
            {totals.inspectionUnits}
          </td>

          <td className="border border-gray-300 px-2 py-2 text-right pr-4 font-bold">
            {totals.inspectionFee.toLocaleString("en-IN")}
          </td>

          <td className="border border-gray-300 px-2 py-2 text-right pr-4 font-bold">
            {totals.securityDeposit.toLocaleString("en-IN")}
          </td>
        </tr>
      </>
    );
  };

  // Navigate to FeeInfo page for inspection fee (PhaseId = 4)
  const navigateToFeeInfo = async (alreadyPaid = 0) => {
    try {
      // Ensure totals exist and non-zero inspection fee
      if (!totals || (totals.inspectionFee || 0) === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Fees",
          text: "There is no inspection fee to pay.",
        });
        return;
      }

      // Ensure we have instituteID; if not, attempt to fetch using userLoginID
      let instId = instituteID;
      if (!instId) {
        const login = userLoginID || userInfo?.UserLoginID;

        if (!login) {
          throw new Error("User login not available to fetch Institute ID");
        }
        const res = await agent.get(
          `${GetInstituteIDByInstituteCode}?InstituteCode=${encodeURIComponent(login)}`,
        );
        instId = res.data?.Data;
        if (!instId) throw new Error("Institute ID not found");
        setInstituteID(instId);
      }

      const A1 = instId;
      const A2 = sha256(String(A1));
      const PhaseId = 7;

      //const alreadyPaid = Number(await calculateInspectionTotal() || 0);

      const remainingAmount =
        Number(totals?.inspectionFee || 0) - Number(alreadyPaid || 0);
      //console.log("Remaining Amount:", calculateInspectionTotal);
      //Swal.fire({
      //    title: 'Proceed to Payment',
      //    html: `
      //        <div class="text-left">
      //            <p class="mb-2"><strong>Institute ID:</strong> ${userLoginID}</p>
      //            <p class="mb-2"><strong>Inspection Fee:</strong> ₹${totals.inspectionFee.toLocaleString('en-IN')}</p>

      //            <p class="text-sm text-gray-600 mt-2">You will be redirected to the payment page to complete the transaction.</p>
      //        </div>
      //    `,
      //    icon: 'info',
      //    showCancelButton: true,
      //    confirmButtonText: 'Continue to Pay',
      //    cancelButtonText: 'Cancel',
      //    width: '520px'
      //})
      Swal.fire({
        title: "Proceed to Payment",
        html: `
        <div class="text-left">
            <p class="mb-2"><strong>Institute ID:</strong> ${userLoginID}</p>

            <p class="mb-2">
                <strong>Total Inspection Fee:</strong> 
                ₹${Number(totals?.inspectionFee || 0).toLocaleString("en-IN")}
            </p>

            <p class="mb-2">
                <strong>Already Paid:</strong> 
                ₹${Number(alreadyPaid || 0).toLocaleString("en-IN")}
            </p>

            <p class="mb-2 text-red-600">
                <strong>Remaining Amount:</strong> 
                ₹${remainingAmount.toLocaleString("en-IN")}
            </p>

            <p class="text-sm text-gray-600 mt-2">
                You will be redirected to the payment page to complete the transaction.
            </p>
        </div>
    `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Continue to Pay",
        cancelButtonText: "Cancel",
        width: "520px",
      }).then((res) => {
        if (res.isConfirmed) {
          navigate(`/Institute/FeeInfo?PhaseId=${PhaseId}&A1=${A1}&A2=${A2}`, {
            state: {
              instituteId: A1,
              from: "inspection-fee",
              inspectionFeeAmount: totals.inspectionFee,
              securityDepositAmount: totals.securityDeposit,
            },
          });
        }
      });
    } catch (error) {
      console.error("Error navigating to FeeInfo:", error);
      Swal.fire({
        icon: "error",
        title: "Navigation Error",
        text: error.message || "Failed to navigate to payment page",
      });
    }
  };

  // Handle Payment (keeps confirmation dialog then navigates)
  const handlePayment = async () => {
    const alreadyPaid = await fetchAndCalculateInspectionTotal(
      instituteID,
      userTypeID,
    );

    navigateToFeeInfo(alreadyPaid);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-4">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
        >
          Inspection Fee Details
        </legend>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg text-gray-600">
              Loading inspection fee details...
            </span>
          </div>
        ) : !inspectionFeeData.length ? (
          <div className="flex flex-col justify-center items-center py-20">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="text-lg text-gray-500 font-medium">
              No inspection fee data available
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Please complete previous steps to view fee details
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <FilteredTableComponent
                data={inspectionFeeData}
                columns={columns}
                filterColumns={[]}
                customButtons={[]}
                title=""
                exportFileName="Inspection_Fee_Details"
                tableId="inspection-fee-table"
                searchable={false}
                sortable={false}
                showExcelTemplate={false}
                exportable={true}
                showSearch={false}
                showExcel={false}
                showPDF={false}
                showExport={false}
                maxHeight="500px"
                stickyHeader={true}
                readOnly={true}
                renderCell={renderCell}
                customFooter={renderCustomFooter()}
                emptyMessage="No inspection fee data available"
              />
            </div>

            {/* Notes Section */}
            <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Note:</span>
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1.5 text-sm text-blue-700">
                <li>
                  Inspection Units are Units actually proposed for Inspection by
                  Institute which includes Approved Units + LoI/ Proposed Units
                </li>
                <li>
                  All training infrastructure shall be calculated based on the
                  Inspection Units.
                </li>
                <li>
                  Inspection units cannot be more than Total Units and cannot be
                  less than already Approved Units.
                </li>
                <li>
                  Inspection Fee shall be calculated based on newly Proposed
                  Units only i.e. = (Inspection Units – Total Units).
                </li>
                <li>
                  Inspection Fees and Security Deposit displayed in the above
                  table is calculated based on newly Proposed Units only.
                </li>
                <li>
                  After payment of Inspection Fee, Inspection Units shall freeze
                  i.e. User cannot change Inspection Units.
                </li>
                <li>
                  Users are advised to Pay Inspection Fee after completing all
                  information on previous pages.
                </li>
                <li>
                  Inspection Committee shall Recommend Units as per available
                  training infrastructure.
                  <ol className="list-[lower-alpha] list-inside ml-4 mt-1 space-y-1">
                    <li>
                      If excess training infrastructure is available then
                      Recommended Units can be more than Inspection Units (on
                      consent of Institute), then Institute shall require to pay
                      the balance amount of Inspection Fees during Affiliation
                      Process.
                    </li>
                    <li>
                      If available training infrastructure is less than that
                      required for already Approved Units, then Inspection
                      Committee can recommend units less than already Approved
                      Units. In such case the approval for excess Approved units
                      shall be cancelled.
                    </li>
                  </ol>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-8 mt-8 pt-12 border-t-2 border-gray-300">
              {/* BACK */}
              <button
                type="button"
                onClick={() => {
                  if (userTypeID === 14 || userTypeID === 81 || userTypeID === 501) {
                    let url = "/Institute/InstituteBank";
                    if (p1) {
                      url += `?P1=${p1}`;
                      if (p2) url += `&P2=${p2}`;
                    }
                    navigate(url);
                  } else {
                    navigate("/Institute/InstituteBank");
                  }
                }}
                className="px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg text-sm hover:bg-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Back
              </button>

              {/* MIDDLE BUTTON */}
              {userTypeID === 14 || userTypeID === 81 || userTypeID === 501 ? (
                <button
                  type="button"
                  onClick={() => {
                    let url = "/Institute/InspectionRequest";
                    if (p1) {
                      url += `?P1=${p1}`;
                      if (p2) url += `&P2=${p2}`;
                    }
                    navigate(url);
                  }}
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                >
                  Save and Next
                </button>
              ) : feeStaus === false ? (
                // 👤 NORMAL USER → PAYMENT FLOW
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={!totals || totals.inspectionFee === 0}
                  className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl ${
                    !totals || totals.inspectionFee === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  }`}
                >
                  Pay Inspection Fee
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/Institute/InspectionRequest")}
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                >
                  Next
                </button>
              )}

              {/* CLOSE */}
             <button
              type="button"
              onClick={() => {
                if(userTypeID==14){
                           navigate(`/DVETO/InspectionReport?p1=${p2}&p2=${p1}`);
                        } else {
                             navigate(`/DVETO/InspectionReport?p1=${p2}&p2=${p1}`);
                        }
                    }}
              className="px-6 py-3 bg-gray-600 text-white rounded text-sm"
            >
              Close
            </button>
            </div>
          </>
        )}
      </fieldset>
    </div>
  );
};

export default InspectionFeePage;
