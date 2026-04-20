# EVS Reports: Division / Department / Section filters

**Purpose:** One place for frontend and backend to agree on dropdown data and how org filters are sent with reports.

**Related code:** `src/hooks/query/useGetDepartmentList.ts`, `useGetDivisionList.ts`, `useGetSectionList.ts`, `src/routes/_authenticated/evacuation-monitoring/reports.tsx`

**Note:** Org filter **keys** sent in socket/REST payloads are now **`Division`**, **`Department`**, **`Section`** (PascalCase). The client may still read legacy lowercase from old URLs. Full contract (Unlisted, date-time range, readiness): [`evs-reports-unlisted-datetime-sync-spec.md`](./evs-reports-unlisted-datetime-sync-spec.md).

**Related (VMS):** Visitor Management uses the same “list endpoint + `useGet*List` hook” pattern for filter dropdowns (Name, Company, Host Person, Visitor Type) — see [`vms-filter-options-api-spec.md`](./vms-filter-options-api-spec.md).

---

## At a glance

| Topic | Owner | Notes |
|--------|--------|--------|
| Dropdown options (3 lists) | **Backend** | Three GET endpoints return rows the UI can turn into labels (see below). |
| Filter parameter names | **Contract** | **`Division`**, **`Department`**, **`Section`** (PascalCase). Values should match the strings from the list endpoints. Legacy lowercase may still appear in old bookmarks. |
| Current tab (live data) | **Backend** | Socket events `evs_reports` and `evs_all` must read those keys when the user sets filters. |
| Completed tab + export | **Backend** | REST `GET /api/evs/reports` and `GET /api/evs/reports/export` must accept the same query parameters. |

---

## What the backend must provide (checklist)

Use this list to know when API work is done.

### List endpoints (for dropdowns)

- [ ] **`GET …/getDivisionList`** — powers the Division dropdown.
- [ ] **`GET …/getDepartmentList`** — already used; same rules as below.
- [ ] **`GET …/getSectionList`** — powers the Section dropdown.

**What EVS list responses should look like**

The hooks expect a JSON body like this (EVS mode):

```json
{
  "data": [
    { "Name": "CMD" },
    { "Name": "…" }
  ]
}
```

- Every row needs a string field **`Name`**. The UI uses it for both the label and the value sent when filtering.
- If your API uses other field names, either rename to `Name` on the server or change the mapping in the hooks in the same PR as the API change.

**Which URL the app calls**

The app picks the path prefix from the build: EVS uses `evs`, non-EVS uses `employees`. Same pattern as `useGetDepartmentList`.

| Hook | Method | EVS path | Non-EVS path |
|------|--------|----------|----------------|
| `useGetDivisionList` | GET | `api/evs/getDivisionList` | `api/employees/getDivisionList` |
| `useGetSectionList` | GET | `api/evs/getSectionList` | `api/employees/getSectionList` |
| `useGetDepartmentList` | GET | `api/evs/getDepartmentList` | `api/employees/getDepartmentList` |

**How the frontend maps responses**

- **EVS:** Read `response.data.data` as an array. Each item `{ Name }` becomes `{ label: Name, value: Name }`.
- **Non-EVS (`employees`):** Read `response.data` as an array when it is an array. Division uses `DivisionName`, then `Name`. Section uses `SectionName`, then `Name`. Department uses `DepartmentName` (see `useGetDepartmentList.ts`).

**If division/section routes are missing**

`useGetDivisionList` and `useGetSectionList` catch errors (including 404) and return an empty list. The reports page still loads; the dropdowns are simply empty until the backend exists. Queries use `retry: 0` so the client does not hammer missing routes.

---

### Filtering (reports must honor these)

When the user picks org filters, the client sends three **PascalCase** keys (legacy lowercase still read from old URLs):

| Key | Role | Example value |
|-----|------|----------------|
| `Division` | Division filter | Same text as `Name` from `getDivisionList` |
| `Department` | Department filter | Same text as department list `Name` (EVS) |
| `Section` | Section filter | Same text as `Name` from `getSectionList` |

**Backend checklist**

- [ ] Support **`Division`**, **`Department`**, and **`Section`** (and optionally legacy `division`, `department`, `section`) on:
  - Socket payloads for **`evs_reports`** and **`evs_all`** (export-all).
  - **`GET /api/evs/reports?…`**
  - **`GET /api/evs/reports/export?…`** (export reuses the same search/query params, including these three).

- [ ] Combine org filters with the other filters in a way you document (the product expectation is usually **AND** between filters).

- [ ] Optionally ignore unknown query keys so future clients do not break old servers.

---

## Payload reference (frontend behavior)

### 1) Router / URL search

Active filters appear in the URL search object together with fields such as `Type`, `Status`, `DeviceName`, `page`, `limit`, `search`, `EvacuationStatus`, and date fields. Org filters use the keys **`Division`**, **`Department`**, **`Section`** (or legacy lowercase).

---

### 2) Current tab — socket `evs_reports` (`normalizeParams`)

The client always sends something like: `EvacuationStatus`, `page`, `limit`, `search`.

It adds optional keys only when the user set them, including:

- `Type`, `Status`, `DeviceName`
- **`Division`**, **`Department`**, **`Section`**
- `from_evs_reports_date`, `to_evs_reports_date`

**Example**

```json
{
  "EvacuationStatus": "current",
  "page": 1,
  "limit": 10,
  "search": "",
  "Division": "CMD",
  "Department": "GAD",
  "Section": "GAS"
}
```

---

### 3) Current tab — Export all — socket `evs_all` (`buildExportPayload`)

Export-all does not send `page` / `limit`. It sends `search`, org filters, Type/Status/DeviceName, and the date range when those are set.

**Example**

```json
{
  "search": "",
  "Division": "CMD",
  "Department": "GAD",
  "Section": "GAS",
  "Type": "Employee",
  "Status": "Safe",
  "DeviceName": "",
  "from_evs_reports_date": "2026-03-01T00:00:00",
  "to_evs_reports_date": "2026-03-31T23:59:59"
}
```

---

### 4) Completed tab — REST list

- **Request:** `GET /api/evs/reports?<querystring>`
- The query string includes every non-empty search field from the UI, including **`Division`**, **`Department`**, **`Section`**.

---

### 5) Completed tab — Export all

- **Request:** `GET <REST_BASE>/api/evs/reports/export?module=evs&token=…&<search params>`
- Uses the same search keys as the completed list, including org filters.

---

## CSV exports (client-generated)

**Export Page** and **Export Selected** build the CSV in the browser from the rows on screen. They do not add a separate backend contract beyond what the table already shows.

**Export All** goes through the server (see sections 3 and 5 above).
