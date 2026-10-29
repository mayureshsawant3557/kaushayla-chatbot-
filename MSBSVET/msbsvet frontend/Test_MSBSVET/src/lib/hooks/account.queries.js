import { useQuery } from "@tanstack/react-query";
import { AccountService } from "../services/accountService";

export const useUserDetails = (userTypeId, userLoginId) =>
    useQuery({
        queryKey: ["userDetails", userTypeId, userLoginId],
        queryFn: () =>
            AccountService.getUserDetails(userTypeId, userLoginId),
        enabled: !!userTypeId && !!userLoginId
    });