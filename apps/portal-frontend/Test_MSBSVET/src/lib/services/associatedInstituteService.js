import {
  GetAssociatedInstituteByPromotingOrganisationID,
  DeleteAssociatedInstituteMappingDetails,
  SaveInstituteAssociatedInstituteMappingDetails,
} from "../../Endpoints_All/Base/Institute";
import { Update_AssociatedInstituteMappingDetails } from "../../Endpoints_All/Secretary/PromotingOrganisation";
import { promoterRegistrationService } from "./promoterRegistrationservice";
import agent from "../api/agent";

export const getInstituteIdFromUserLoginIdOrQueryString = (
  user,
  queryString,
) => {
  if (user?.UserTypeID === 66) {
    return promoterRegistrationService.getInstituteIDByInstituteCode(
      user.UserLoginID,
    );
  } else if (queryString?.P1 && queryString?.P2) {
    const p1 = queryString.P1;
    const p2 = queryString.P2;
    if (p1.GetHashCode?.()?.toString() === p2) {
      return parseInt(p1);
    }
  }
  return 0;
};

//export const getInstituteIDByInstituteCode = async (instituteCode) => {
//    if (!instituteCode) throw new Error("instituteCode is required");

//    const res = await agent.get(
//        `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`
//    );
//    return res.data;
//};

export const getAssociatedInstituteByPromotingOrganisationID = async (
  payload,
) => {
  if (!payload.InstituteId) throw new Error("instituteId is required");

  const res = await agent.post(
    GetAssociatedInstituteByPromotingOrganisationID,
    payload,
  );
  return res.data?.Data || [];
};

export const deleteAssociatedInstituteMapping = async ({
  associatedInstituteId,
  userLoginID,
  ipAddress,
}) => {
  if (!associatedInstituteId || !userLoginID) {
    throw new Error("associatedInstituteId and userLoginID are required");
  }

  const res = await agent.post(DeleteAssociatedInstituteMappingDetails, {
    data: {
      AssociatedInstituteID: associatedInstituteId,
      UserLoginID: userLoginID,
      IPAddress: ipAddress,
    },
  });

  return res.data;
};

export const saveInstituteAssociatedInstituteMapping = async (payload) => {
  //if (
  //  !payload.InstituteID ||
  //  !payload.PromoterTypeID ||
  //  !payload.StaffProfileId
  //) {
  //  throw new Error(
  //    "instituteID, promoterTypeID, and staffProfileId are required",
  //  );
  //}

  const res = await agent.post(
    SaveInstituteAssociatedInstituteMappingDetails,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};

export const updateAssociatedInstituteMapping = async (payload) => {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("Payload must be a non-empty array");
  }
  const res = await agent.post(
    Update_AssociatedInstituteMappingDetails,
    payload,
  );

  return res.data;
};
