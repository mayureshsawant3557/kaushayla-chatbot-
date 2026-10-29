import { useEffect } from "react";
import InstituteDetails from "./InstituteDetails.jsx";

export default function ExistingInstituteForm({
  profileId,
  setProfileId,
  getDetails,
  details,
  resetSignal,
  setInstituteEntity,
}) {
  useEffect(() => {
    setProfileId("");
  }, [resetSignal]);

  useEffect(() => {
    if (details?.id) {
      setInstituteEntity((prev) => ({
        ...prev,
        InstituteID: details.id,
      }));
    }
  }, [details]);

  return (
    <div className="mt-5 flex flex-col gap-2 mb-5 px-6">
      <label>
        Institute Profile ID <span className="text-[#DC3545]">*</span>
      </label>

      <input
        type="text"
        className="w-1/6 border rounded px-4 py-2 border-gray-300"
        value={profileId}
        onChange={(e) => setProfileId(e.target.value.trim().toUpperCase())}
      />

      <button
        type="button"
        disabled={!profileId}
        onClick={getDetails}
        className={`w-1/12 px-2 py-1 rounded text-white ${
          profileId ? "bg-[#DC3545]" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Get Details
      </button>

      {details && <InstituteDetails data={details} />}
    </div>
  );
}
