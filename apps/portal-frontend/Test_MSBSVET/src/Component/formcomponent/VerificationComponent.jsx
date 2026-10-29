import React, {
  useEffect,
  useState,
  useContext,
  forwardRef,
  useImperativeHandle,
} from "react";

import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useAuth } from "../../Hooks/AuthContext";

const VerificationComponent = forwardRef(
  (
    {
      instituteId,
      pageCode,
      onChange,
      readOnly = false,

      // 🔥 FROM PARENT
      initialData = {}, // { status, remark }
      loading = false,

      onSave,
      saveApi,
      buildPayload,
      afterSave,
      extraPayload = {},
      autoSave = false,
    },
    ref,
  ) => {
    const {userInfo} = useAuth();
    const UserTypeID = userInfo?.UserTypeID;

    const [status, setStatus] = useState("");
    const [remark, setRemark] = useState("");
    const [isLocked, setIsLocked] = useState(false);

    const { color } = useContext(ThemeContext);

    const [error, setError] = useState({
      status: false,
      remark: false,
    });

    // 🔥 ADMIN CHECK
    const isAdmin = [14, 81].includes(UserTypeID);

    // ===============================
    // 🔹 LOAD DATA FROM PARENT
    // ===============================
    useEffect(() => {
      const st = initialData?.status || "";
      const rm = initialData?.remark || "";

      setStatus(st);
      setRemark(rm);

      // 🔥 ROLE BASED LOCKING
      if (isAdmin) {
        setIsLocked(false); // ✅ Admin can always edit
      } else {
        if (st === "V" || st === "R") {
          setIsLocked(true); // 🔒 Non-admin locked if saved
        } else {
          setIsLocked(false);
        }
      }

      triggerChange(st, rm);
    }, [initialData]);

   
    // ===============================
    // 🔹 CHANGE HANDLER
    // ===============================
    const triggerChange = (st, rm) => {
      if (onChange) {
        onChange({
          status: st,
          remark: rm,
        });
      }
    };

    // ===============================
    // 🔹 VALIDATION
    // ===============================
    const validate = () => {
      let isValid = true;

      let newErrors = {
        status: false,
        remark: false,
      };

      if (!status) {
        newErrors.status = true;
        isValid = false;
      }

      if (status === "R" && !remark.trim()) {
        newErrors.remark = true;
        isValid = false;
      }

      setError(newErrors);
      return isValid;
    };

    // ===============================
    // 🔹 SAVE (OPTIONAL)
    // ===============================
    const handleSave = async () => {
      if (!validate()) return false;

      try {
        let finalPayload = {
          instituteId,
          pageCode,
          status,
          remark,
          ...extraPayload,
        };

        if (buildPayload) {
          finalPayload = buildPayload({
            instituteId,
            pageCode,
            status,
            remark,
          });
        }

        let response;

        if (onSave) {
          response = await onSave(finalPayload);
        } else if (saveApi) {
          response = await saveApi(finalPayload);
        } else {
          return false;
        }

        if (afterSave) {
          afterSave(response, finalPayload);
        }

        return true;
      } catch (error) {
        return false;
      }
    };

    // ===============================
    // 🔹 AUTO SAVE
    // ===============================
    useEffect(() => {
      if (autoSave && status) {
        handleSave();
      }
    }, [status]);

    // ===============================
    // 🔹 EXPOSE METHODS
    // ===============================
    useImperativeHandle(ref, () => ({
      validate,
      save: handleSave,
      getData: () => ({ status, remark }),
    }));

    // ===============================
    // 🔹 HANDLERS
    // ===============================
    const handleStatusChange = (value) => {
      // 🔥 Admin always allowed, others respect lock
      if (readOnly || (!isAdmin && isLocked)) return;

      setStatus(value);

      if (value === "V") {
        setRemark("");
      }

      setError({
        status: false,
        remark: false,
      });

      triggerChange(value, value === "V" ? "" : remark);
    };

    const handleRemarkChange = (value) => {
      setRemark(value);

      setError((prev) => ({
        ...prev,
        remark: false,
      }));

      triggerChange(status, value);
    };

    // ===============================
    // 🔹 UI
    // ===============================
    return (
      <fieldset className="rounded border border-gray-300 p-4 mt-6 bg-white shadow-sm">
        <legend
          className={`rounded border ${color} px-4 py-1 text-xl font-bold text-white`}
        >
          Inspection Status
        </legend>

        <div className="mt-3">
          {/* NON ADMIN VIEW */}
          {!isAdmin ? (
            <div className="text-base font-semibold">
              {status === "V" && (
                <span className="text-green-600">Verified</span>
              )}
              {status === "R" && <span className="text-red-600">Rejected</span>}
              {!status && <span className="text-gray-500">Pending</span>}
            </div>
          ) : (
            <>
              {!loading && (
                <>
                  {/* RADIO CARDS */}
                  <div className="flex gap-6 mt-2">
                    {/* VERIFY */}
                    <div
                      onClick={() => handleStatusChange("V")}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition
                        ${
                          status === "V"
                            ? "bg-green-100 border-green-500"
                            : "border-gray-300"
                        }
                        ${
                          readOnly || (!isAdmin && isLocked)
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:bg-green-50"
                        }
                      `}
                    >
                      <input type="radio" checked={status === "V"} readOnly />
                      <span className="text-green-700 font-medium">Verify</span>
                    </div>

                    {/* REJECT */}
                    <div
                      onClick={() => handleStatusChange("R")}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition
                        ${
                          status === "R"
                            ? "bg-red-100 border-red-500"
                            : "border-gray-300"
                        }
                        ${
                          readOnly || (!isAdmin && isLocked)
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:bg-red-50"
                        }
                      `}
                    >
                      <input type="radio" checked={status === "R"} readOnly />
                      <span className="text-red-700 font-medium">Reject</span>
                    </div>
                  </div>

                  {error.status && (
                    <p className="text-red-500 text-sm mt-2">
                      Please select status
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {/* REMARK */}
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">
              Remark {status === "R" && "*"}
            </label>

            {!isAdmin ? (
              <div>{remark || "No remark provided"}</div>
            ) : (
              <>
                <textarea
                  value={remark}
                  rows={3}
                  disabled={readOnly || (!isAdmin && isLocked)}
                  onChange={(e) => handleRemarkChange(e.target.value)}
                  placeholder={
                    status === "R"
                      ? "Enter rejection remark (required)"
                      : "Enter remark (optional)"
                  }
                  className={`w-full border rounded-md p-2
                    ${
                      error.remark
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }
                  `}
                />

                {error.remark && (
                  <p className="text-red-500 text-sm mt-1">
                    Remark required when rejected
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </fieldset>
    );
  },
);

export default VerificationComponent;
VerificationComponent.displayName = "VerificationComponent";
