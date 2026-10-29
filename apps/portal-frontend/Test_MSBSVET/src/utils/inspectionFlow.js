import { INSPECTION_FLOW_PAGES } from "../Component/Config/inspectionFlowConfig";

export const getPageIndex = (pageCode) => {
    return INSPECTION_FLOW_PAGES.findIndex((page) => page.pageCode === pageCode);
};

export const getPageConfig = (pageCode) => {
    return INSPECTION_FLOW_PAGES.find((page) => page.pageCode === pageCode) || null;
};

export const getNextFlowPage = (currentPageCode) => {
    const index = getPageIndex(currentPageCode);
    if (index !== -1 && index < INSPECTION_FLOW_PAGES.length - 1) {
        return INSPECTION_FLOW_PAGES[index + 1];
    }
    return null;
};

export const getPreviousFlowPage = (currentPageCode) => {
    const index = getPageIndex(currentPageCode);
    if (index > 0) {
        return INSPECTION_FLOW_PAGES[index - 1];
    }
    return null;
};

export const buildPageUrl = (pageObj, p1, p2) => {
    if (!pageObj) return "#";
    const params = [];
    if (p1) params.push(`P1=${encodeURIComponent(p1)}`);
    if (p2) params.push(`P2=${encodeURIComponent(p2)}`);
    const queryString = params.length > 0 ? `?${params.join("&")}` : "";
    return `${pageObj.route}${queryString}`;
};
