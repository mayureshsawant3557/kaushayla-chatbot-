import { useState, useEffect } from "react";
import VerifiedIcon from "../../assets/VerifiedIcon.jpg";
import NotVerifiedIcon from "../../assets/NotVerifiedIcon.jpg";
function PromotingOrganizationDetailsPopUp({
  data,
  onConfirm,
  onClose,
  isTrainingInstituteNew,
  isTrainingInstituteVerified,
  isPromotingOrganizationVerified,
  isAuthorizedRepresentativeVerified,
}) {
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
        {/* Header */}
        <div className="bg-[#032B66] text-white px-5 py-3 flex justify-between items-center rounded-t">
          <h2 className="text-lg font-semibold">
            Verify Promoting Organization Details
          </h2>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded"
          >
            X
          </button>
        </div>

        <div className="p-6 grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2 text-sm">
            <div>
              <h2 className="text-lg font-medium pl-4">Training Institute</h2>
              <hr className=" w-60 border-b border-gray-300" />
              <h3 className="text-base font-medium">
                Training Institute:{" "}
                <span className="font-normal">
                  {data?.trainingInstitute || "NA"}
                </span>
              </h3>
            </div>

            <div>
              <h2 className="text-lg font-medium pl-4">
                Promoting Organization
              </h2>
              <hr className=" w-70 border-b border-gray-300" />
              <h3 className="text-base font-medium">
                Promoting Organization:{" "}
                <span className="font-normal">
                  {data?.promotingOrganization || "NA"}
                </span>
              </h3>
            </div>

            <div>
              <h2 className="text-lg font-medium pl-4">
                Authorized Representative of Promoting Organization
              </h2>
              <hr className=" w-80 border-b border-gray-300" />
              <h3 className="text-base font-medium">
                Authorized Representative:{" "}
                <span className="font-normal">
                  {data?.authorizedRepresentative || "NA"}
                </span>
              </h3>
              <h3 className="text-base font-medium">
                Primary Mobile Number:{" "}
                <span className="font-normal">
                  {data?.primaryMobileNumber || "NA"}
                </span>
              </h3>
            </div>
          </div>

          <div className="col-span-1 flex flex-col place-items-end p-5 space-y-5 ">
            <div className="flex items-center ">
              <span className="h-8 w-8">
                {isTrainingInstituteNew ? (
                  <img src="" alt="" />
                ) : isTrainingInstituteVerified ? (
                  <img src={VerifiedIcon} alt="Verified Institute" />
                ) : (
                  <img src={NotVerifiedIcon} alt="Not Verified Institute" />
                )}
              </span>
            </div>

            <div className="flex items-center ">
              <span className="h-8 w-8">
                {isPromotingOrganizationVerified ? (
                  <img
                    src={VerifiedIcon}
                    alt="Verified Promoting Organization"
                  />
                ) : (
                  <img
                    src={NotVerifiedIcon}
                    alt="Not Verified Promoting Organization"
                  />
                )}
              </span>
            </div>

            <div className="flex items-center">
              <span className="h-8 w-8">
                {isAuthorizedRepresentativeVerified ? (
                  <img
                    src={VerifiedIcon}
                    alt="Verified Authorized Representative"
                  />
                ) : (
                  <img
                    src={NotVerifiedIcon}
                    alt="Not Verified Authorized Representative"
                  />
                )}
              </span>
            </div>
          </div>
          {!isPromotingOrganizationVerified ? (
            <div className="col-span-3 text-red-600 text-lg text-center font-normal">
              <h2>
                Promoting Organization is Not Verified. Complete the Verification Process and then apply. Read Promoting Organization User Manual for more details.
              </h2>
            </div>
          ) : null}
          {!isAuthorizedRepresentativeVerified ? (
            <div className="col-span-3 text-red-600 text-lg text-center font-normal">
              <h2>
                Authorized Representative is Not Verified. Complete the
                Verification Process and then apply. Read Promoting Organization
                User Manual for more details.
              </h2>
            </div>
          ) : null}
        </div>

        <div className="flex justify-center py-3">
          <button
            onClick={
              isPromotingOrganizationVerified &&
                isAuthorizedRepresentativeVerified
                ? onConfirm
                : onClose
            }
            className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded"
          >
            {isPromotingOrganizationVerified &&
              isAuthorizedRepresentativeVerified
              ? "Add Promoting Organization"
              : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromotingOrganizationDetailsPopUp;
