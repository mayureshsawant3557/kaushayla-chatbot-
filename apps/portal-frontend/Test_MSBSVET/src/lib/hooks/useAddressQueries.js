import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddressService } from "../services/addressService";

const STALE_TIME = 60 * 60 * 1000;
// STATES
export const useStates = () =>
    useQuery({
        queryKey: ["states"],
        queryFn: AddressService.getStates,
        select: (res) =>
            res?.Status === "Success"
                ? res.Data.filter((x) => x.Value !== "-1")
                : [],
        staleTime: STALE_TIME,
    });

// DISTRICTS
export const useDistricts = (stateId) =>
    useQuery({
        queryKey: ["districts", stateId],
        queryFn: AddressService.getDistricts,
        enabled: !!stateId,
        select: (res) =>
            res?.Status === "Success"
                ? res.Data.filter((x) => x.Group == stateId && x.Value !== "-1")
                : [],
        staleTime: STALE_TIME,
    });

// TALUKAS
export const useTalukas = (districtId) =>
    useQuery({
        queryKey: ["talukas", districtId],
        queryFn: AddressService.getTalukas,
        enabled: !!districtId,
        //select: (res) =>
        //    res?.Status === "Success"
        //        ? res.Data.filter((x) => Number(x.Group) === Number(districtId) && x.Value !== "-1") //res.Data.filter((x) => x.Group == districtId && x.Value !== "-1")
        //        : [],

        select: (res) =>
            res?.Status === "Success"
                ? res.Data.filter((x) => String(x.Group) === String(districtId) && x.Value !== "-1")
                : [],
        staleTime: STALE_TIME,
    });

// CITIES
export const useCities = (talukaId) =>
    useQuery({
        queryKey: ["cities", talukaId],
        queryFn: AddressService.getCities,
        enabled: !!talukaId,
        select: (res) =>
            res?.Status === "Success"
                ? res.Data.filter(
                    (x) => x.Group == talukaId || x.Value === "9999999"
                )
                : [],
        staleTime: STALE_TIME,
    });

//export const usePincodeLookup = () =>
//    useMutation({
//        mutationFn: AddressService.getPincodeDetails,
//    });

export const usePincodeLookup = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: AddressService.getPincodeDetails,

        onSuccess: (data, pin) => {
     
            queryClient.setQueryData(["pincode", pin], {
                data,
                fetchedAt: Date.now(),
            });
        },
    });

    const getPincode = async (pin) => {
        const cached = queryClient.getQueryData(["pincode", pin]);
        
        if (cached && Date.now() - cached.fetchedAt < STALE_TIME) {
            return cached.data; // return cached if still fresh
        }

        // else call API via mutation
        return await mutation.mutateAsync(pin);
    };

    return { ...mutation, getPincode };
};