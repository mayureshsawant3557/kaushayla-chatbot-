// hooks/useInstituteMapping.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveInstituteAssociatedInstituteMapping }
    from "../../services/associatedInstituteService";

export const useInstituteMapping = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        retry: false,

        mutationFn: async (payload) => {         

            //if (!payload.promotingOrganisationId || !payload.instituteCode || !payload.promoterTypeID) {
            //    throw new Error("Required fields missing");
            //}

            return saveInstituteAssociatedInstituteMapping(payload);
        },

        //onSuccess: () => {
        //    queryClient.invalidateQueries({ queryKey: ["instituteID"] });
        //    queryClient.invalidateQueries({ queryKey: ["associatedInstitutes"] });
        //}
    });

    return {
        saveInstituteMapping: mutation.mutateAsync, // 👈 async-first
        isSaving: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error
    };
};