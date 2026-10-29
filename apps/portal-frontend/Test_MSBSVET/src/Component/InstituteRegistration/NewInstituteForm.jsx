import ReservedWordPopUp from "./ReservedWordPopUp";
import { useEffect } from "react";
export default function NewInstituteForm({
  newInstitute,
  setNewInstitute,
  show,
  setShow,
  resetSignal,
  setInstituteEntity,
  reservedKeywords = [],
}) {
  const handleInputChange = (e) => {
    let value = e.target.value;

    const lowerValue = value.toLowerCase();

    const matchedWord = reservedKeywords.find((word) =>
      lowerValue.includes(word.toLowerCase()),
    );

    if (matchedWord) {
      const regex = new RegExp(matchedWord, "gi");
      value = value.replace(regex, "").trim();

      setNewInstitute((prev) => ({
        ...prev,
        proposedName: value,
      }));

      setInstituteEntity((prev) => ({
        ...prev,
        InstituteName: value,
      }));

      if (!show) setShow(true);

      return;
    }

    setNewInstitute((prev) => ({
      ...prev,
      proposedName: value,
    }));

    setInstituteEntity((prev) => ({
      ...prev,
      InstituteName: value,
    }));
  };

  useEffect(() => {
    setNewInstitute({ proposedName: "" });
    setShow(false);
  }, [resetSignal]);

  return (
    <div className="mt-5 flex flex-col gap-2 mb-5 px-4">
      <label>
        Proposed Institute Name <span className="text-[#DC3545]">*</span>
      </label>

      <div className="flex flex-row items-center gap-2">
        <input
          type="text"
          value={newInstitute.proposedName}
          onChange={handleInputChange}
          className="w-2/3 border rounded px-4 py-2 border-gray-300"
        />
        <span className="text-sm font-medium">SKILL DEVELOPMENT INSTITUTE</span>
      </div>

      <span className="text-sm">
        <a
          className="text-blue-600 mr-0.5 cursor-pointer"
          onClick={() => setShow(true)}
        >
          Click here
        </a>
        {show && <ReservedWordPopUp close={() => setShow(false)} />} for list of
        reserved words
      </span>
    </div>
  );
}
