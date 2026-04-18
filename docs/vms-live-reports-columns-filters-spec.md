# VMS: Live dashboard & Reports — columns, filters, backend contract

**Purpose:** Single reference for backend and frontend to agree on **Visitor Management (VMS)** live socket rows, report REST payloads, and **filter query parameters** (including **date + time range**).

**Related frontend:**  
- Live: [`src/routes/_authenticated/visitor-management/dashboard/overview.tsx`](../src/routes/_authenticated/visitor-management/dashboard/overview.tsx), [`src/hooks/useSocket.ts`](../src/hooks/useSocket.ts), [`src/utils/vmsLiveRow.ts`](../src/utils/vmsLiveRow.ts)  
- Reports: [`src/routes/_authenticated/visitor-management/reports.tsx`](../src/routes/_authenticated/visitor-management/reports.tsx), [`src/hooks/query/useGetVisitorReports.ts`](../src/hooks/query/useGetVisitorReports.ts), [`src/utils/reportExportAll.ts`](../src/utils/reportExportAll.ts)  
- URL search validation: [`src/routes/__root.tsx`](../src/routes/__root.tsx) (passes `filter_*`, `from_*`, `to_*`, `search`, `limit`)

**Style note:** Same intent as [`evs-reports-org-filters-spec.md`](./evs-reports-org-filters-spec.md) and [`evs-reports-unlisted-datetime-sync-spec.md`](./evs-reports-unlisted-datetime-sync-spec.md): explicit keys, examples, and checklists.

---

## At a glance

| Area | Transport | Backend responsibility |
|------|-----------|-------------------------|
| Live “Live Data” table | Socket room **`VMS`** (`preload` / `data` / …) | Include **Company**, **HostPerson**, **VisitorType** on each live row when available (see field names below). |
| Live filters | **Client-side** today (URL mirrors selections) | Optional future: filter on server; until then FE filters in memory. |
| Reports table | **`GET /api/vms/reports?…`** | Return columns + honor filter query params. |
| Export all | **`GET /api/vms/reports/export?module=vms&token=…&…`** | Honor **same** query keys as the list endpoint. |

---

## 1) Row fields (live socket + reports)

### Minimum for UI columns

| Column | Suggested field(s) on row | Notes |
|--------|---------------------------|--------|
| Company | `Company` | FE also tolerates `company`, `CompanyName` (see `vmsLiveRow.ts`). |
| Host Person | `HostPerson` | FE also tolerates `host_person`, `Host`, `host`. |
| Visitor Type | `VisitorType` **or** nested `GuestType: { name }` **or** `GuestTypeName` / `user_type` | FE normalizes to one label for display/filter. |

### Reports (`GET /api/vms/reports`)

Each row should include (in addition to existing IDs, name, card, checked in/out):

- `Company` (string, optional)
- `HostPerson` (string, optional)
- `VisitorType` (string, optional) **or** a `GuestType` object compatible with check-in (`{ id, name }`)

If a field is missing, the UI shows `—`.

---

## 2) Filters — URL keys (bookmarkable)

The app stores filters in the **URL search** so refresh/share keeps state.

### 2.1 Global / table search

| Key | Meaning |
|-----|---------|
| `search` | Free-text search (reports table header). |

### 2.2 Discrete filters (multi-select)

Dynamic table stores selected values as **comma-separated** strings:

| Key | Meaning |
|-----|---------|
| `filter_Name` | Live dashboard only — selected visitor names. |
| `filter_Company` | Live — companies. |
| `filter_HostPerson` | Live — host persons. |
| `filter_VisitorType` | Live — visitor types. |

**Reports** use the **same filter keys without `filter_` prefix** (historical behavior in this route):

| Key | Meaning |
|-----|---------|
| `Name` | Selected names (comma-separated if multi). |
| `Company` | Selected companies. |
| `HostPerson` | Selected host persons. |
| `VisitorType` | Selected visitor types. |

> Backend should accept these as optional filters. If you prefer a single naming scheme, accepting **both** `Company` and `filter_Company` during migration is recommended.

### 2.3 Date **and** time range (existing UI component)

The UI uses the shared **date range + time range** control (`isDateTimeRangePicker` → [`DateTimeRangePicker`](../src/components/ui/date-time-range-picker.tsx)).  
Values are stored as **two** query parameters:

| UI filter key | `from` param | `to` param |
|---------------|--------------|------------|
| `vms_live_date_time` | `from_vms_live_date_time` | `to_vms_live_date_time` |
| `vms_reports_date_time` | `from_vms_reports_date_time` | `to_vms_reports_date_time` |

**Format:** `YYYY-MM-DDTHH:mm:ss` (local-style string; no timezone suffix). Example:

```txt
from_vms_reports_date_time=2026-04-01T08:00:00
to_vms_reports_date_time=2026-04-18T17:30:00
```

**Legacy:** Older builds used **date-only** range (`vms_reports_date` → `from_vms_reports_date` / `to_vms_reports_date`). Prefer implementing **`_date_time`** params for new backends; optionally still accept legacy date-only for old bookmarks.

---

## 3) Live dashboard — behavior

- **Columns:** ID, Card No., Name, **Company**, **Host Person**, **Visitor Type**, Purpose, Checked In, Checked Out.
- **Filtering:** Applied **in the browser** on the current socket dataset using URL params above.  
- **Datetime range:** Rows are included if their best-known event time (first available of `clocked_in`, `date_receive`, `date_time`, `log_time`) falls **inclusive** within `[from, to]`. Open-ended ranges (only `from` or only `to`) are allowed.

---

## 4) Reports — REST + export

### List

- **Request:** `GET /api/vms/reports?<querystring>`
- **Typical params:** `page`, `limit`, `search`, `Name`, `Company`, `HostPerson`, `VisitorType`, `from_vms_reports_date_time`, `to_vms_reports_date_time`

### Export all

- **Request:** `GET <REST_BASE>/api/vms/reports/export?module=vms&token=<jwt>&<same search params>`

Export must apply the **same** filters as the list call.

---

## 5) Edge cases & partial deploy

| Scenario | Expected behavior |
|----------|-------------------|
| Socket rows omit new fields | Columns show `—`; filters may have empty option lists until data exists. |
| `/api/vms/reports` errors or returns unexpected shape | UI shows a **non-blocking** message and an empty table (no infinite refetch loops). |
| `/api/vms/guestTypeList` missing | Visitor type filter options fall back to **unique values from the current report rows**. |
| Unknown query keys on old servers | Backend may ignore unknown keys; FE keeps sending stable names for forward compatibility. |

---

## 6) Backend checklist

- [ ] Socket **`VMS`** live rows include **Company**, **HostPerson**, **VisitorType** (or compatible aliases / `GuestType.name`).
- [ ] `GET /api/vms/reports` returns the same columns and supports **Name**, **Company**, **HostPerson**, **VisitorType**, **`from_vms_reports_date_time`**, **`to_vms_reports_date_time`**, `search`, `page`, `limit`.
- [ ] `GET /api/vms/reports/export` accepts the **same** filter params as the list endpoint.
- [ ] (Optional) `GET /api/vms/guestTypeList` returns rows with `ID` + `Name` for richer visitor-type filter labels.

---

## 7) Example query strings

**Reports (list)**

```http
GET /api/vms/reports?page=1&limit=10&search=&Company=Acme&from_vms_reports_date_time=2026-04-01T00:00:00&to_vms_reports_date_time=2026-04-18T23:59:59
```

**Export all (browser)**

```http
GET /api/vms/reports/export?module=vms&token=…&page=1&limit=10&Company=Acme&from_vms_reports_date_time=2026-04-01T00:00:00&to_vms_reports_date_time=2026-04-18T23:59:59
```
