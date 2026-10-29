import React from "react";
import FormComponent from "../formcomponent/FormComponent";

function InstituteDetails({ data }) {
  return (
    <div>
      <div className="bg-[#f9d6da] px-5 py-3 rounded mb-6 border-red-300">
        <p className="text-red-800">
          Note: To edit below populated information, log in to Training
          Institute account and edit profile.
        </p>
      </div>

      {/* Institute Name */}
      <div className="mb-5 w-[85%]">
        <FormComponent
          label="Name of Training Institute"
          value={data?.InstituteName || ""}
          disabled
        />
      </div>

      {/* Address + Pincode */}
      <div className="flex gap-10 mb-5">
        <div className="w-2/3">
          <FormComponent
            label="Address"
            value={data?.CollegeAddress || ""}
            disabled
          />
        </div>

        <div className="w-1/3">
          <FormComponent
            label="PinCode"
            value={data?.CollegePincode || ""}
            disabled
          />
        </div>
      </div>

      {/* Location */}
      <div className="flex gap-6 mb-5">
        <div className="w-1/3">
          <FormComponent label="State" value={data?.State || ""} disabled />
        </div>

        <div className="w-1/3">
          <FormComponent
            label="District"
            value={data?.District || ""}
            disabled
          />
        </div>

        <div className="w-1/3">
          <FormComponent
            label="Taluka"
            value={data?.InstituteTaluka || ""}
            disabled
          />
        </div>

        <div className="w-1/3">
          <FormComponent
            label="City / Village"
            value={data?.InstituteCity || ""}
            disabled
          />
        </div>
      </div>
    </div>
  );
}

export default InstituteDetails;
