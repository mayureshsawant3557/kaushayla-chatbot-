/* =============================================================================
   Module : STT -> Batch Result Report
   File   : src/Endpoints_All/STT/sttBatchResultReport.js
   Purpose: Centralised API endpoint URLs for the STT Batch Result report.
            Mirrors the Endpoints_All convention (const URLs built from baseURL).
            Backend controller: api/STTBatchResultReport (Portal.Server).
   ============================================================================= */
import { baseURL } from "../config/baseConfig";

const STT_REPORT_ROOT = `${baseURL}/api/STTBatchResultReport`;

/* GET  - cascading filter source rows (regions/districts/talukas/institutes/agencies/statuses) */
export const GetSTTBatchResultFilters = `${STT_REPORT_ROOT}/filters`;

/* POST - KPI card values */
export const GetSTTBatchResultSummary = `${STT_REPORT_ROOT}/summary`;

/* POST - paged/sorted/searched batch grid */
export const GetSTTBatchResultList = `${STT_REPORT_ROOT}/batch-list`;

/* GET - drill-down candidates of a batch (lazy loaded on batch click).
   Route param {batchId:long} mirrors the existing STT candidates/{batchId} pattern. */
export const GetSTTBatchResultCandidates = (batchId) =>
    `${STT_REPORT_ROOT}/batch-candidates/${batchId}`;

/* POST - batch-wise system certificate download (zip blob) */
export const GetSTTBatchSystemCertificate =
    `${STT_REPORT_ROOT}/GetBatchWiseSystemCertificate`;

/* POST - batch-wise pre-printed certificate download (zip blob).
   Same request shape as the system certificate ({ batchID }); the server
   renders the PrePrintedCertificateSystem.rdlc template instead. */
export const GetSTTBatchPrePrintedCertificate =
    `${STT_REPORT_ROOT}/GetBatchWisePrePrintedCertificate`;

/* POST - batch-wise result sheet download (blob) */
export const GetSTTBatchResultSheet =
    `${STT_REPORT_ROOT}/GetBatchWiseResultSheet`;

/* POST - dispatch slip print/download (blob) */
export const GetSTTBatchDispatchSlip =
    `${STT_REPORT_ROOT}/GetBatchDispatchSlip`;

/* POST - save the certificate "Printed On" date for a batch */
export const UpdateSTTBatchPrintedDate =
    `${STT_REPORT_ROOT}/UpdateBatchPrintedDate`;

/* POST - save the certificate "Dispatched On" date for a batch */
export const UpdateSTTBatchDispatchDate =
    `${STT_REPORT_ROOT}/UpdateBatchDispatchDate`;
