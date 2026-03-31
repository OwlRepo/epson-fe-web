# EVS reports & sync readiness — backend / socket contract

**Audience:** Backend and socket developers. **Goal:** Know exactly what to implement and why, and how the React app will use it so nothing breaks after deploy.

**Frontend references:** `reports.tsx`, `useEvsMode.ts`, `sidebar.tsx`, `EvacuationMonitoringLayout.tsx`, `reportExportAll.ts`.

---

## 1. Reports filters & exports (REST + `evs_reports` / `evs_all`)

### What you implement

| Item | Your job |
|------|------------|
| **Org keys** | Accept **`Division`**, **`Department`**, **`Section`** (PascalCase) on list, export, and socket payloads. Optionally still accept legacy `division` / `department` / `section` during migration. |
| **Unlisted** | Accept optional **`Unlisted`** as boolean (`true` / `false`) on the same channels. |
| **Date range** | Accept **`from_evs_reports_date`** and **`to_evs_reports_date`** as strings in **`YYYY-MM-DDTHH:mm:ss`** form (OpenAPI `date-time` style). |

Same filter set for: **`evs_reports`** (paginated list), **`evs_all`** (export all, no `page`/`limit`), **`GET /api/evs/reports`**, **`GET /api/evs/reports/export`**.

### Why

One naming scheme avoids “filter works on Current tab but not on Completed” or “export ignores Unlisted.” Date-time strings must match so time ranges are not truncated to midnight-only behavior by accident.

### How the frontend uses it

- Puts these keys in the **URL** (bookmarkable) and forwards them unchanged to **socket** or **REST**.
- **Unlisted** drives a dropdown and a **Yes/No** column; export-all repeats the same params the table uses.
- If a key is missing or ignored server-side, the user sees wrong counts or empty exports — so parity matters.

---

## 2. Report row: “Unlisted”

### What you implement

Each row may include **`unlisted`** or **`Unlisted`** (boolean or clear string). Meaning: this person is listed vs unlisted for the report.

### Why

Product needs the column and CSV to match filters and exports.

### How the frontend uses it

- Table: shows **Yes** / **No** / **—** if absent.
- Browser CSV (page/selected): same column.
- No extra API beyond the field on the row object.

---

## 3. Evacuation sync readiness (blocks “Evacuation Complete”)

This is separate from report tables. It answers: **“Is anything still queued from controllers before we allow evacuation complete?”**

### What you implement

**Recommended room name: `evs_readiness`**

| Choice | Rationale |
|--------|-----------|
| **`evs_readiness`** | Short, matches other EVS rooms (`evs_reports`, `evs_mode`), and reads clearly as “readiness for EVS actions.” Use this unless you already have a conflicting room name in production. |

**Flow**

1. Client connects to the same socket server as today, then emits **`join`** with payload **`"evs_readiness"`** (same pattern as other EVS rooms).
2. Server puts the socket in that room and **pushes updates** on one event name.

**Recommended event name: `evs_readiness_status`**

Keeps one event for all readiness payloads; avoids overloading `evs_mode` (which is on/off only).

**Payload — minimum viable**

| Field | Type | Required |
|-------|------|----------|
| `has_pending_data` | `boolean` | **Yes** |

**Payload — recommended for UX**

| Field | Type | Notes |
|-------|------|--------|
| `pending_count` | `number` | How many items still not synced; frontend shows “Pending records: N” in the sidebar. |
| `status_message` | `string` | Optional; reserved for clearer copy later. |
| `updated_at` | `string` (ISO) | Optional. |

Optional **camelCase** mirrors (`hasPendingData`, `pendingCount`, …) are accepted by the client parser.

### Why

Without a single boolean (or equivalent), the UI cannot safely enable **Evacuation Complete**. Guessing from other events risks completing evacuation while data is still in flight.

### How the frontend uses it

| `has_pending_data` | UI |
|--------------------|-----|
| `true` | Sidebar: **“Sync in progress”**; **Evacuation Complete** stays **disabled**; optional `pending_count` shown. |
| `false` | **“Ready for evacuation complete”**; button **enabled**; a **persistent green notice** appears until the user closes it or confirms evacuation. |
| Not received yet / bad payload | **“Waiting for sync status”**; button **disabled** (safe default). |

Reconnects may repeat the same payload — that is OK; the UI only reacts to meaningful state changes for the notice.

---

## Quick checklist (backend / socket)

- [ ] **`Division` / `Department` / `Section`** + **`Unlisted`** + **date-time range** params on reports list + export + `evs_reports` + `evs_all`.
- [ ] Report rows expose **`unlisted`** / **`Unlisted`** where applicable.
- [ ] Room **`evs_readiness`**, event **`evs_readiness_status`**, payload includes **`has_pending_data`** (and ideally **`pending_count`**).

---

## CSV note

**Export page / selected** is generated in the browser from visible rows — no separate backend contract. **Export all** uses your list/export contract above.
