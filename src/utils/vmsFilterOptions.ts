/**
 * VMS filter option lists: shared types, query building, response normalization,
 * and API-first vs row-derived fallback (see docs/vms-filter-options-api-spec.md).
 */

import api from "@/config/axiosInstance";

export type FilterOption = { label: string; value: string };

export type VmsFilterOptionScope = "live" | "reports" | "all";

export interface VmsFilterOptionQueryInput {
  scope: VmsFilterOptionScope;
  /** Table free-text search (optional narrowing for backend). */
  search?: string;
  fromVmsLiveDateTime?: string;
  toVmsLiveDateTime?: string;
  fromVmsReportsDateTime?: string;
  toVmsReportsDateTime?: string;
}

export type VmsFilterOptionListKey =
  | "getVisitorNameList"
  | "getCompanyList"
  | "getHostPersonList"
  | "getVisitorTypeList";

/**
 * Builds query params for GET /api/vms/get*List endpoints.
 */
export function buildVmsFilterOptionParams(
  input: VmsFilterOptionQueryInput,
): Record<string, string> {
  const p: Record<string, string> = { scope: input.scope };
  if (input.search?.trim()) p.search = input.search.trim();
  if (input.fromVmsLiveDateTime?.trim()) {
    p.from_vms_live_date_time = input.fromVmsLiveDateTime.trim();
  }
  if (input.toVmsLiveDateTime?.trim()) {
    p.to_vms_live_date_time = input.toVmsLiveDateTime.trim();
  }
  if (input.fromVmsReportsDateTime?.trim()) {
    p.from_vms_reports_date_time = input.fromVmsReportsDateTime.trim();
  }
  if (input.toVmsReportsDateTime?.trim()) {
    p.to_vms_reports_date_time = input.toVmsReportsDateTime.trim();
  }
  return p;
}

/**
 * Normalizes canonical `{ data: [{ Name }] }` or a bare array (migration).
 */
export function normalizeVmsFilterOptionResponse(data: unknown): FilterOption[] {
  let rows: unknown[] | undefined;
  if (data && typeof data === "object" && "data" in data) {
    const d = (data as { data?: unknown }).data;
    if (Array.isArray(d)) rows = d;
  } else if (Array.isArray(data)) {
    rows = data;
  }
  if (!rows?.length) return [];

  const out: FilterOption[] = [];
  const seen = new Set<string>();
  for (const item of rows) {
    if (!item || typeof item !== "object") continue;
    const name = (item as { Name?: unknown }).Name;
    if (name == null) continue;
    const v = String(name).trim();
    if (!v) continue;
    const dedupeKey = v.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push({ label: v, value: v });
  }
  out.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  return out;
}

export async function fetchVmsFilterOptionList(
  listKey: VmsFilterOptionListKey,
  params: Record<string, string>,
): Promise<FilterOption[]> {
  try {
    const response = await api.get(`/api/vms/${listKey}`, { params });
    return normalizeVmsFilterOptionResponse(response.data);
  } catch {
    return [];
  }
}

/** Prefer API options when non-empty; otherwise use row-derived fallback. */
export function preferApiOptions(
  apiOptions: FilterOption[] | undefined,
  buildFallback: () => FilterOption[],
): FilterOption[] {
  if (apiOptions && apiOptions.length > 0) return apiOptions;
  return buildFallback();
}

/**
 * Reports Visitor Type: API list → guestTypeList → row uniques.
 */
export function preferVisitorTypeReportOptions(
  apiVisitorTypes: FilterOption[] | undefined,
  guestTypeList: FilterOption[] | undefined,
  buildRowFallback: () => FilterOption[],
): FilterOption[] {
  if (apiVisitorTypes && apiVisitorTypes.length > 0) return apiVisitorTypes;
  if (guestTypeList && guestTypeList.length > 0) return guestTypeList;
  return buildRowFallback();
}
