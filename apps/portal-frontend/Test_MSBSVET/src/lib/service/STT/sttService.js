/* =============================================================================
   Module : STT Assessment Marks Entry
   File   : src/lib/service/STT/sttService.js
   Purpose: Thin service layer over the shared axios `agent` client. Each method
            calls one endpoint and unwraps the backend ApiResponse envelope
            ({ success, message, data }). On a failed envelope it throws an Error
            with the server message so callers can surface it via SweetAlert.
   ============================================================================= */
import agent from "../../api/agent";
import {
  GetSTTFilters,
  GetSTTCandidatesByBatch,
  GetSTTAssessmentByBatch,
  SaveSTTDraft,
  SubmitSTTAssessment,
  GetSTTDashboard,
} from "../../../Endpoints_All/STT/sttEndpoints";

/**
 * Unwraps the standard ApiResponse<T> envelope. Tolerates responses that are
 * already the bare payload (in case an endpoint is not wrapped).
 */
const unwrap = (res) => {
  const body = res?.data.Data ?? res?.data ?? res;
  // Tolerant of the shared ApiResponse<T> envelope in either camelCase
  // (success/message/data) or PascalCase (Success/Message/Data).
  if (body && typeof body === "object" && ("success" in body || "Success" in body)) {
    const success = body.success ?? body.Success;
    const message = body.message ?? body.Message;
    const data = body.data ?? body.Data;
    if (!success) {
      throw new Error(message || "Request failed.");
    }
    return data;
  }
  return body;
};

const sttService = {
  /** GET cascading filter source rows for the given user (their mapped batches). */
  async getFilters(userId) {
    const res = await agent.get(GetSTTFilters(userId));
    return unwrap(res) ?? [];
  },

  /** GET candidates for a batch (saved marks overlaid when present). */
  async getCandidates(batchId) {
    const res = await agent.get(GetSTTCandidatesByBatch(batchId));
    return unwrap(res) ?? [];
  },

  /** GET existing saved assessment (header + details) for a batch. */
  async getAssessment(batchId) {
    const res = await agent.get(GetSTTAssessmentByBatch(batchId));
    return unwrap(res) ?? { header: null, details: [] };
  },

  /** POST save as draft. `payload` is the STTSaveRequest shape. */
  async saveDraft(payload) {
    const res = await agent.post(SaveSTTDraft, payload);
    return unwrap(res);
  },

  /** POST save & submit (locks the batch). */
  async submit(payload) {
    const res = await agent.post(SubmitSTTAssessment, payload);
    return unwrap(res);
  },

  /** GET KPI dashboard summary for a batch. */
  async getDashboard(batchId) {
    const res = await agent.get(GetSTTDashboard(batchId));
    return unwrap(res) ?? null;
  },
};

export default sttService;
