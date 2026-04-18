/**
 * Normalize Visitor Management live socket rows for display and client-side filtering.
 */

export function getVmsCompany(row: Record<string, unknown>): string {
  const v =
    row.Company ??
    row.company ??
    row.CompanyName ??
    row["Company Name"];
  return v != null && String(v).trim() !== "" ? String(v) : "";
}

export function getVmsHostPerson(row: Record<string, unknown>): string {
  const v = row.HostPerson ?? row.host_person ?? row.Host ?? row.host;
  return v != null && String(v).trim() !== "" ? String(v) : "";
}

export function getVmsVisitorType(row: Record<string, unknown>): string {
  const gt = row.GuestType as Record<string, unknown> | string | undefined;
  if (gt && typeof gt === "object" && "name" in gt && gt.name != null) {
    return String(gt.name);
  }
  const v =
    row.VisitorType ??
    row.visitor_type ??
    row.GuestTypeName ??
    row.user_type ??
    (typeof gt === "string" ? gt : undefined);
  return v != null && String(v).trim() !== "" ? String(v) : "";
}

/** Parse a comparable timestamp (ms) from live row for date/time range filtering. */
export function getVmsLiveEventTimeMs(row: Record<string, unknown>): number | null {
  const candidates = [
    row.clocked_in,
    row.date_receive,
    row.date_time,
    row.log_time,
  ];
  for (const c of candidates) {
    if (c == null || c === "") continue;
    const t = new Date(String(c)).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return null;
}

/** Whether row event time falls within [fromMs, toMs] inclusive (partial open bounds allowed). */
export function isWithinDateTimeRangeMs(
  row: Record<string, unknown>,
  fromMs: number | null,
  toMs: number | null,
): boolean {
  if (fromMs == null && toMs == null) return true;
  const eventMs = getVmsLiveEventTimeMs(row);
  if (eventMs == null) return false;
  if (fromMs != null && eventMs < fromMs) return false;
  if (toMs != null && eventMs > toMs) return false;
  return true;
}

export function parseIsoLocalDateTimeToMs(iso: string | undefined): number | null {
  if (!iso || !iso.trim()) return null;
  const t = new Date(iso.trim()).getTime();
  return Number.isNaN(t) ? null : t;
}

function splitFilterValues(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchesMultiSelect(
  selected: string[],
  actual: string,
): boolean {
  if (selected.length === 0) return true;
  const a = actual.trim().toLowerCase();
  return selected.some((s) => s.toLowerCase() === a);
}

/**
 * Client-side filter for VMS live table (URL: filter_* and from_/to_ for datetime range).
 */
export function applyVmsLiveTableFilters<T extends Record<string, unknown>>(
  rows: T[],
  routeSearch: Record<string, string | undefined>,
): T[] {
  const nameSel = splitFilterValues(routeSearch.filter_Name);
  const companySel = splitFilterValues(routeSearch.filter_Company);
  const hostSel = splitFilterValues(routeSearch.filter_HostPerson);
  const typeSel = splitFilterValues(routeSearch.filter_VisitorType);

  const fromMs = parseIsoLocalDateTimeToMs(
    routeSearch.from_vms_live_date_time,
  );
  const toMs = parseIsoLocalDateTimeToMs(routeSearch.to_vms_live_date_time);

  return rows.filter((row) => {
    if (nameSel.length > 0) {
      const n = String(row.Name ?? "");
      if (!matchesMultiSelect(nameSel, n)) return false;
    }
    if (companySel.length > 0) {
      const c = getVmsCompany(row);
      if (!matchesMultiSelect(companySel, c)) return false;
    }
    if (hostSel.length > 0) {
      const h = getVmsHostPerson(row);
      if (!matchesMultiSelect(hostSel, h)) return false;
    }
    if (typeSel.length > 0) {
      const t = getVmsVisitorType(row);
      if (!matchesMultiSelect(typeSel, t)) return false;
    }
    if (fromMs != null || toMs != null) {
      if (!isWithinDateTimeRangeMs(row, fromMs, toMs)) return false;
    }
    return true;
  });
}
