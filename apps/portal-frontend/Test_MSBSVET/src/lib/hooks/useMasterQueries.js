// src/hooks/useMasterQueries.js
import { useQuery } from "@tanstack/react-query";
import { MasterService } from "../services/masterService";

export const usePromoters = () =>
    useQuery({
        queryKey: ["promoters"],
        queryFn: MasterService.getPromoters,
        select: (res) =>
            res.Status === "Success"
                ? res.Data.filter(x => x.Value !== "-1")
                : [],
        staleTime: Infinity,
    });

export const usePromoterTypes = (group = "") =>
    useQuery({
        queryKey: ["promoterTypes", group],
        queryFn: () => MasterService.getPromoterTypes(group),
        select: (res) =>
            res.Status === "Success"
                ? res.Data.filter(x => x.Value !== "-1")
                : [],
        staleTime: Infinity,
    });

export const usePromotingTypes = () => 
    useQuery({
        queryKey: ["promotingTypes"],
        queryFn: MasterService.getPromotingTypes,
        select: (res) =>
            res.Status === "Success"
        ? res.Data.filter(x=> x.Value !== "-1")
        : [],
        staleTime: Infinity,
    })