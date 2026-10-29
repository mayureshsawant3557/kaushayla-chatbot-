import { useQuery } from "@tanstack/react-query";

export const usePromotingOrganizationSummary = (instituteId) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const statusCountsQuery = useQuery({
    queryKey: ["statusCounts", user?.UserID],
    queryFn: () =>
      promotingOrganizationService.getStatusCounts("Dev", user.UserID, "R"),
    enabled: !!user?.UserID,
  });

  const summaryQuery = useQuery({
    queryKey: ["summary", instituteId, user?.UserLoginID],
    queryFn: async () => {
      if (!instituteId || instituteId === 0) throw new Error("No institute ID");

      const input = {
        InstituteId: instituteId,
        UserLoginID: user.UserLoginID,
        PageCode: "PromotingOrganizationSummary",
        ItemId: "0",
      };

      const [details, promotersRaw, institutesRaw] = await Promise.all([
        promotingOrganizationService.getPromotingDetails(input),
        promotingOrganizationService.getPromoterDetails(input),
        promotingOrganizationService.getAssociatedInstitutes(input),
      ]);

      const statusCounts = statusCountsQuery.data || {};

      const {
        rejectCnt,
        verifyCnt,
        promotingOrgStatus,
        promotersStatus,
        institutesStatus,
      } = calculateStatusCounts(statusCounts);

      const promoters = processPromotersData(promotersRaw);
      const institutes = processInstitutesData(institutesRaw);

      return {
        details,
        promoters,
        institutes,
        statusCounts,
        rejectCnt,
        verifyCnt,
        promotingOrgStatus,
        promotersStatus,
        institutesStatus,
        authorizedMobileNo: promoters.authorizedMobileNo,
        isComplete: promotingOrgStatus > 0 && promotersStatus > 0,
      };
    },
    enabled: instituteId > 0 && !!user,
  });

  const statusQuery = useQuery({
    queryKey: ["orgStatus", instituteId],
    queryFn: () => promotingOrganizationService.getStatus(instituteId),
    enabled: instituteId > 0,
  });

  return {
    summaryQuery,
    statusQuery,
    statusCountsQuery,

    details: summaryQuery.data?.details,
    promoters: summaryQuery.data?.promoters,
    institutes: summaryQuery.data?.institutes,
    rejectCnt: summaryQuery.data?.rejectCnt || 0,
    verifyCnt: summaryQuery.data?.verifyCnt || 0,
    promotingOrgStatus: summaryQuery.data?.promotingOrgStatus || 0,
    promotersStatus: summaryQuery.data?.promotersStatus || 0,
    institutesStatus: summaryQuery.data?.institutesStatus || 0,
    authorizedMobileNo: summaryQuery.data?.authorizedMobileNo || "",
    isComplete: summaryQuery.data?.isComplete || false,
  };
};
