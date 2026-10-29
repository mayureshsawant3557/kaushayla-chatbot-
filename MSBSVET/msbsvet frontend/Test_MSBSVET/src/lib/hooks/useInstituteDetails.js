import { useQuery } from '@tanstack/react-query';
import { getInstituteDetails } from '../services/instituteService';
import { promoterRegistrationService } from '../services/promoterRegistrationservice';
export const useInstituteDetails = (instituteCode) => {
    //const isValidInstituteCode = !!instituteCode && instituteCode.trim().length > 0;

    // First query: Get InstituteID from InstituteCode
    console.log("useInstituteDetails called with instituteCode:", instituteCode);
    const instituteIDQuery = useQuery({
        queryKey: ['instituteID', instituteCode],
        queryFn: () => promoterRegistrationService.getInstituteIDByInstituteCode(instituteCode),
        //enabled: isValidInstituteCode,
        enabled: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
        onError: (error) => {
            console.error("❌ useInstituteDetails.instituteIDQuery:", error);
        },
    });
    const instituteID = instituteIDQuery.data?.InstituteID || instituteIDQuery.data;
  
    // Second query: Get Institute Details using the InstituteID
    const instituteDetailsQuery = useQuery({
        queryKey: ['institute', instituteID],
        queryFn: async () => {
            const result = await getInstituteDetails(instituteID);
            console.log("✅ Institute details result:", result);
            return result;
        },
        //enabled: !!instituteID && instituteIDQuery.isSuccess,
        enabled: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
        onError: (error) => {
            console.error("❌ useInstituteDetails.instituteDetailsQuery:", error);
        },
    });

    //const refetch = async () => {
    //    try {
    //        // Step 1: Get fresh InstituteID
    //        //const idResult = await instituteIDQuery.refetch();
    //        //const instituteID = idResult.data?.InstituteID || idResult.data;
    //        //console.log("🎯 Refetched InstituteID:", instituteID);
    //        //if (instituteID) {
    //        //    await instituteDetailsQuery.refetch();
    //        //}
    //        const idResult = await instituteIDQuery.refetch();
    //        const freshID = idResult.data?.InstituteID || idResult.data;
    //        console.log("🎯 Refetched InstituteID:", freshID);
    //        if (freshID) {
    //            // 2. Manually fetch details with FRESH ID (bypass queryKey issue)
    //            const detailsResult = await getInstituteDetails(freshID);
    //            console.log("🎯 Refetched Institute Details:", detailsResult);
    //            // 3. Update cache directly
    //            const transformedData = detailsResult.Data?.[0] ||
    //                (Array.isArray(detailsResult.data) ? detailsResult.data[0] : null);
    //            console.log("🎯 Transformed Details Data:", transformedData);
    //            instituteDetailsQuery.setData(transformedData);
    //        }
    //        //const idResult = await instituteIDQuery.refetch();
    //        //const freshID = idResult.data?.InstituteID || idResult.data;
    //        //console.log("🎯 Refetched InstituteID:", freshID);
    //        //if (freshID) {
    //        //    // Step 2: Create NEW details query with FRESH ID
    //        //    const detailsResult = await getInstituteDetails(freshID);
    //        //    console.log("🎯 Refetched Institute Details:", detailsResult);
    //        //    instituteDetailsQuery.setData(detailsResult);
    //        //}
    //    } catch (error) {
    //        console.error('Institute refetch failed:', error);
    //        throw error;
    //    }
    //};
    const instituteDetails = instituteDetailsQuery.data?.Data?.[0]
        || (Array.isArray(instituteDetailsQuery.data) ? instituteDetailsQuery.data[0] : null);

    const isLoading = instituteIDQuery.isLoading ||
        (instituteIDQuery.isSuccess && instituteDetailsQuery.isLoading);
    const isFetching = instituteIDQuery.isFetching || instituteDetailsQuery.isFetching;
    //const isFetched = instituteDetailsQuery.isSuccess && !!instituteDetails;
    const isFetched = instituteDetailsQuery.data || instituteIDQuery.isSuccess; // ✅ Fixed
    //const isSuccess = instituteDetailsQuery.data || instituteIDQuery.isSuccess;
    const isSuccess = !!instituteDetails;
    const isError = instituteIDQuery.isError || instituteDetailsQuery.isError;
    const error = instituteIDQuery.error || instituteDetailsQuery.error;

    const returnValue = {
        instituteDetails,
        instituteID,
        isLoading,
        //isFetching: instituteIDQuery.isFetching || instituteDetailsQuery.isFetching,
        isFetched,
        //isSuccess: isFetched,
        //isError: instituteIDQuery.isError || instituteDetailsQuery.isError,
        //error,
        isFetching,
        isSuccess,
        isError,
        error,
        
        refetch: () => Promise.all([
            instituteIDQuery.refetch(),
            instituteDetailsQuery.refetch()
        ]),
        refetchDetails: instituteDetailsQuery.refetch,

        instituteIDQuery: {
            isLoading: instituteIDQuery.isLoading,
            isSuccess: instituteIDQuery.isSuccess,
            isError: instituteIDQuery.isError,
            error: instituteIDQuery.error,
            data: instituteIDQuery.data,
        },
        instituteDetailsQuery: {
            isLoading: instituteDetailsQuery.isLoading,
            isSuccess: instituteDetailsQuery.isSuccess,
            isError: instituteDetailsQuery.isError,
            error: instituteDetailsQuery.error,
            data: instituteDetailsQuery.data,
        },
    };

    console.log("🎯 [Return Value]:", returnValue);

    return returnValue;
};