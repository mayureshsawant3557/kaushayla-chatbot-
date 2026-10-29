import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAssociatedInstituteByPromotingOrganisationID,
  deleteAssociatedInstituteMapping,
  saveInstituteAssociatedInstituteMapping,
  updateAssociatedInstituteMapping,
} from "../services/associatedInstituteService";
import { useAuth } from "../../Hooks/AuthContext";
import { useLocation } from "react-router-dom";
import { instituteKeys } from "../keys/queryKeys";
import { promoterRegistrationService } from "../services/promoterRegistrationservice";
import { useEffect } from "react";

export const useAssociatedInstitutes = () => {
  const queryClient = useQueryClient();
  const { loading } = useAuth();
  const location = useLocation();
   const {userInfo} = useAuth();
  const searchParams = Object.fromEntries(new URLSearchParams(location.search));

  const instituteIdFromUrl = searchParams.P1 || searchParams.instituteId;

  const instituteIdQuery = useQuery({
    queryKey: ["instituteId", userInfo?.UserLoginID, instituteIdFromUrl],
    queryFn: async () => {
      if (instituteIdFromUrl) {
        return parseInt(instituteIdFromUrl);
      }

      if (userInfo?.UserTypeID === 66 && userInfo?.UserLoginID) {
        const res =
          await promoterRegistrationService.getInstituteIDByInstituteCode(
            userInfo?.UserLoginID,
          );
        return res;
      }

      return 0;
    },
    enabled: !loading && !!(instituteIdFromUrl || userInfo?.UserLoginID),
  });

  const promotingOrgIdQuery = useQuery({
    queryKey: instituteKeys.promotingOrgId(instituteIdQuery.data),
    queryFn: async () => {
      const instituteId = instituteIdQuery.data;

      if (!instituteId) return null;

      if (instituteIdFromUrl) {
        return instituteId;
      }

      const res =
        await promoterRegistrationService.getOrganisationIdByInstituteId(
          instituteId,
        );

      return res;
    },
    enabled: !!instituteIdQuery.data,
  });

  const associatedInstitutesQuery = useQuery({
    queryKey: instituteKeys.associatedInstitutes(promotingOrgIdQuery.data),
    queryFn: async () => {
      const promotorOrgId = promotingOrgIdQuery.data;

      const payload =
        instituteIdFromUrl || !promotorOrgId
          ? {
              ItemId: 0,
              InstituteId: instituteIdQuery.data,
              UserLoginID: userInfo?.UserLoginID || 0,
              PageCode: "ExistingInstitute",
              IPAddress: "",
            }
          : {
              ItemId: 0,
              PromotingOrganisationId: promotorOrgId,
              UserLoginID: userInfo?.UserLoginID || 0,
              PageCode: "ExistingInstitute",
              IPAddress: "",
            };

      const res =
        await getAssociatedInstituteByPromotingOrganisationID(payload);

      return res || [];
    },
    enabled: !!instituteIdQuery.data,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAssociatedInstituteMapping,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: instituteKeys.associatedInstitutes(),
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: saveInstituteAssociatedInstituteMapping,
  });

  const updateMutation = useMutation({
    mutationFn: updateAssociatedInstituteMapping,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: instituteKeys.associatedInstitutes(),
      });
    },
  });

  const allInstitutes = associatedInstitutesQuery.data || [];

  const affiliatedInstitutes = allInstitutes.filter(
    (x) => String(x.PromoterTypeID) === "1",
  );

  const appliedInstitutes = allInstitutes.filter(
    (x) => String(x.PromoterTypeID) === "2",
  );

  return {
    instituteId: instituteIdQuery.data || 0,
    promotingOrgId: promotingOrgIdQuery.data || 0,
    associatedInstitutes: allInstitutes,
    affiliatedInstitutes,
    appliedInstitutes,
    isLoading:
      loading ||
      instituteIdQuery.isLoading ||
      promotingOrgIdQuery.isLoading ||
      associatedInstitutesQuery.isLoading,
    deleteInstitute: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    saveInstituteMapping: saveMutation.mutate,
    isSaving: saveMutation.isPending,
      updateInstituteMapping: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    refetchInstitutes: associatedInstitutesQuery.refetch,
  };
};
