import type {
  AskRequest,
  AskResponse,
  HealthResponse,
  ReindexRequest,
  ReindexResponse
} from "../types";
import { request } from "./client";

export const getHealth = async (): Promise<HealthResponse> =>
  request<HealthResponse>("/health", { method: "GET" });

export const askQuestion = async (
  payload: AskRequest
): Promise<AskResponse> =>
  request<AskResponse>("/api/v1/ask", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const reindex = async (
  payload: ReindexRequest,
  adminToken: string
): Promise<ReindexResponse> =>
  request<ReindexResponse>("/admin/reindex", {
    method: "POST",
    headers: {
      "X-Admin-Token": adminToken
    },
    body: JSON.stringify(payload)
  });

