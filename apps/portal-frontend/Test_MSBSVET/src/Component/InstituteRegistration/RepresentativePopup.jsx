import React from "react";
import { useState, useEffect } from "react";
import VerifiedIcon from "../../assets/VerifiedIcon.jpg";
import NotVerifiedIcon from "../../assets/NotVerifiedIcon.jpg";
function RepresentativePopup({ data, onConfirm, onClose }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);
  }, []);
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div
        className={`
          fixed left-1/2 transform -translate-x-1/2
          w-162 rounded-sm shadow-lg bg-white
          transition-all duration-150 ease-out
          ${animate ? "opacity-100 translate-y-10" : "opacity-0 -translate-y-10"}
        `}
        style={{ top: "0px" }}
      >
        <div className="bg-[#032B66] text-white px-5 py-3 flex justify-between items-center rounded-t">
          <h2 className="text-lg font-semibold">
            Verify Staff/ Management Details
          </h2>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
          >
            X
          </button>
        </div>
        <div className="flex flex-col sm:flex-row p-6">
          <div className="sm:col-span-2 space-y-2 text-sm flex flex-col sm:w-[70%] p-4">
            <p>
              <span className="font-semibold">Staff/ Management:</span>{" "}
              {data?.title} {data?.firstName} {data?.middleName}{" "}
              {data?.lastName}{" "}
              <span className="text-gray-600">({data?.id})</span>
            </p>

            <p>
              <span className="font-semibold">Date of Birth:</span> {data?.dob}
            </p>
            <p>
              <span className="font-semibold">Gender:</span> {data?.gender}
            </p>
            <p>
              <span className="font-semibold">Primary Mobile No:</span>{" "}
              {data?.primaryMobileNumber}
            </p>
            <p>
              <span className="font-semibold">E-mail ID:</span> {data?.email}
            </p>
          </div>
          <div className="col-span-1 flex flex-row sm:flex-col items-center mx-auto mt-2">
            <div className="relative">
              {data?.VerifyCnt == "" && (
                <div className="absolute -top-2 -right-2 z-10">
                  <img
                    alt="not-verified"
                    src={NotVerifiedIcon}
                    className="w-12 h-12"
                  />
                </div>
              )}

              {data?.VerifyCnt > 0 && data?.RejectCnt == 0 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <img
                    alt="verified"
                    src={VerifiedIcon}
                    className="w-12 h-12"
                  />
                </div>
              )}

              <img
                src={data?.PhotoFilePath || "/images/default-avatar.jpg"}
                alt="Staff Photo"
                className="w-40 h-48 object-cover border-2 border-gray-300"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center py-3 mb-2">
          <button
            onClick={onConfirm}
            className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded"
          >
            Add Authorized Representative
          </button>
        </div>
      </div>
    </div>
  );
}

export default RepresentativePopup;
