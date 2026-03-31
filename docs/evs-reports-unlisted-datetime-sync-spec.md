# EVS Reports: Unlisted, Date/Time Range, Org Keys & Sync Readiness

**Purpose:** Single contract for frontend and backend/socket teams for EVS reports filters, exports, and evacuation-complete gating. Supersedes org-key naming in [`evs-reports-org-filters-spec.md`](./evs-reports-org-filters-spec.md) for **filter parameter names** (now PascalCase); dropdown/list behavior still follows that org doc.

**Related code**

| Area | Path |
|------|------|
| Reports UI + filters | `src/routes/_authenticated/evacuation-monitoring/reports.tsx` |
| Table filters | `src/components/ui/dynamic-table.tsx` |
| Readiness + EVS mode | `src/hooks/useEvsMode.ts` |
| Sidebar + completion | `src/components/ui/sidebar.tsx`, `src/components/layouts/EvacuationMonitoringLayout.tsx` |
| REST export helper | `src/utils/reportExportAll.ts` |

---

## Why this contract is needed

1. **Stable keys** — Without agreed names for query params, socket payloads, and export URLs, the UI and server drift (filters silently ignored, wrong exports, broken bookmarks).
2. **Safety-critical gating** — `Evacuation Complete` must only run when the server confirms there is **no pending sync**; ambiguous semantics cause incorrect completions or blocked UX.
3. **Rollout** — The client may still send or read legacy keys during migration; the server should accept both for a defined period.

---

## How the frontend uses this contract

| Backend signal | Frontend behavior |
|----------------|-------------------|
| Org filters **`Division`**, **`Department`**, **`Section`** (PascalCase) | Sent on socket `evs_reports` / `evs_all` and REST list/export for completed tab. Legacy `division` / `department` / `section` in URL are still read when hydrating. |
| **`Unlisted`** filter (`true`/`false`) | Optional filter on list + export; table column shows Yes/No/—. |
| **`from_evs_reports_date`**, **`to_evs_reports_date`** as ISO-like date-time strings | Date+time range filter; combined as `YYYY-MM-DDTHH:mm:ss` (no timezone suffix in examples). |
| Readiness room + event (see below) | Drives sidebar status indicator, persistent “ready” notice, and enables/disables **Evacuation Complete**. |

**Readiness → UI mapping**

| `has_pending_data` (or equivalent) | Derived status | Evacuation Complete button | Persistent notice |
|-------------------------------------|----------------|----------------------------|-------------------|
| `true` | `pending` | Disabled | Hidden |
| `false` | `ready` | Enabled | Shown until user dismisses or completes evacuation |
| Missing / invalid (before first payload) | `unknown` | Disabled | Hidden |

---

## At a glance

| Topic | Owner | Notes |
|--------|--------|--------|
| Org filter keys | **Contract** | **`Division`**, **`Department`**, **`Section`** (PascalCase). Legacy lowercase accepted for reads. |
| Unlisted | **Contract** | Boolean `Unlisted` on socket payloads; query string for REST. |
| Date/time range | **Contract** | `from_evs_reports_date`, `to_evs_reports_date` as `date-time` strings. |
| Readiness | **Backend** | Room `evs_readiness`, event `evs_readiness_status` (defaults). |
| CSV (browser) | **Frontend only** | Page/selected export includes columns the table shows; no extra backend contract. |

---

## Socket: reports list and export (`evs_reports`, `evs_all`)

### Payload keys (current tab)

| Key | Type | Why needed | Frontend usage |
|-----|------|------------|----------------|
| `EvacuationStatus` | string | Tab | Always `"current"` for live tab. |
| `page`, `limit` | number | Pagination | Table pagination. |
| `search` | string | Search | Search box. |
| `Type`, `Status`, `DeviceName` | string | Filters | Optional when set. |
| `Division`, `Department`, `Section` | string | Org filters | Optional; values match list `Name`. |
| `Unlisted` | boolean | Filter | Optional; `true`/`false`. |
| `from_evs_reports_date`, `to_evs_reports_date` | string | Date+time range | Optional; ISO-like local format. |

**`evs_all`** — Same filter keys as above (no `page`/`limit`); used for Export All download URL.

### Backward compatibility

- Server **may** still accept lowercase `division`, `department`, `section` for a transition period; the client **prefers** PascalCase when sending.

---

## REST: completed list and export

- **List:** `GET /api/evs/reports?<querystring>` — non-empty search fields from the UI, including `Division`, `Department`, `Section`, `Unlisted`, `from_evs_reports_date`, `to_evs_reports_date`, etc.
- **Export:** `GET /api/evs/reports/export?module=evs&token=…&<same params>` — same query shape as list.

---

## Report rows: `unlisted`

| Field | Type | Why needed | Frontend usage |
|-------|------|------------|----------------|
| `unlisted` or `Unlisted` | boolean (or string) | Row identity | Column “Unlisted” → Yes/No/—. |

---

## Socket: evacuation sync readiness

**Why:** Controllers may still be sending data; the UI must not allow **Evacuation Complete** until the server confirms sync is complete.

### Defaults (frontend)

| Item | Value |
|------|--------|
| Room | Client emits `join` with room name **`evs_readiness`** |
| Event | Server pushes **`evs_readiness_status`** |

### Payload (recommended shape)

| Field | Type | Required | Why needed | Frontend usage |
|-------|------|----------|------------|----------------|
| `has_pending_data` | boolean | **Yes** | Single source of truth for pending work | `pending` vs `ready` |
| `pending_count` | number | Recommended | UX for older users | Shown in sidebar when pending |
| `status_message` | string | Optional | Human-readable detail | Future copy / debugging |
| `updated_at` | string (ISO) | Optional | Audit | Future display |

**CamelCase aliases** (optional; frontend parser accepts): `hasPendingData`, `pendingCount`, `statusMessage`, `updatedAt`.

**Idempotency:** Emitting the same payload multiple times (e.g. reconnect) should not break the UI; the client deduplicates by status transitions for the persistent notice.

---

## Migration checklist

- [ ] REST + socket accept **`Division`**, **`Department`**, **`Section`**.
- [ ] REST + socket accept **`Unlisted`** and **`from_evs_reports_date` / `to_evs_reports_date`** as date-time.
- [ ] Readiness room `evs_readiness` + event `evs_readiness_status` implemented.
- [ ] Report rows include `unlisted` / `Unlisted` where applicable.
- [ ] (Optional) Legacy lowercase org keys still accepted server-side until removed.

---

## CSV exports (client-generated)

**Export Page** / **Export Selected** build CSV in the browser from visible rows; **Unlisted** includes `Unlisted` column when present.

**Export All** uses server/socket as above.
