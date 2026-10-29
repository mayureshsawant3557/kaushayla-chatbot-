/* =============================================================================
   Module : STT Assessment Marks Entry
   File   : src/Endpoints_All/STT/sttEndpoints.js
   Purpose: Centralised API endpoint URLs for the STT module.
            Mirrors the existing Endpoints_All convention (exported const URLs
            built from baseURL). Functions are used where the URL has a path
            parameter (e.g. batchId).
   ============================================================================= */
import { baseURL } from "../config/baseConfig";

const STT_ROOT = `${baseURL}/api/stt`;

/* GET - cascading filter source rows (restricted to the user's mapped batches) */
export const GetSTTFilters = (userId) =>
  `${STT_ROOT}/filters?userId=${encodeURIComponent(userId)}`;

/* GET - candidates of a batch (with any saved marks overlaid) */
export const GetSTTCandidatesByBatch = (batchId) =>
  `${STT_ROOT}/candidates/${batchId}`;

/* GET - existing saved assessment (header + details) for a batch */
export const GetSTTAssessmentByBatch = (batchId) =>
  `${STT_ROOT}/assessment/${batchId}`;
export const GetCandidatesByBatchWithFeeStatus =
  "/api/STT/CandidatesByBatchWithFeeStatus";

/* POST - save as draft */
export const SaveSTTDraft = `${STT_ROOT}/save`;

/* POST - save & submit (locks the batch) */
export const SubmitSTTAssessment = `${STT_ROOT}/submit`;

/* GET - KPI dashboard summary for a batch */
export const GetSTTDashboard = (batchId) =>
  `${STT_ROOT}/dashboard/${batchId}`;
