import { useQuery } from "@tanstack/react-query";
import { authorizedRepresentativeService } from "../services/authorizedRepresentativeService";

export const useAuthorizedRepresentative = (
    open,
    applicationId
) =>
    useQuery({
        queryKey: ["authorizedRepresentative", applicationId],
        queryFn: ({ signal }) =>
            authorizedRepresentativeService.getByApplicationId(
                applicationId,
                signal
            ),
        enabled: open && !!applicationId,
        retry: false
    });