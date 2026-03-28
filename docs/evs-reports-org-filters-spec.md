# EVS Reports: Division / Department / Section filters

**Purpose:** Single reference for frontend + backend so list dropdowns and report filtering stay aligned.

**Related code:** `src/hooks/query/useGetDepartmentList.ts`, `useGetDivisionList.ts`, `useGetSectionList.ts`, `src/routes/_authenticated/evacuation-monitoring/reports.tsx`

---

## At a glance

| Topic | Owner | Notes |
|--------|--------|--------|
| Dropdown options (3 lists) | **Backend** | Three GET endpoints return rows with a display `Name` field (see below). |
| Filter query param names | **Contract** | Use **lowercase**: `division`, `department`, `section`. Values must match list `Name` strings. |
| Current tab (live) | **Backend** | Socket `evs_reports` + `evs_all` payloads include those keys when set. |
| Completed tab + export | **Backend** | REST `GET /api/evs/reports` and `GET /api/evs/reports/export` accept the same query params. |

---

## What the backend must provide (checklist)

Use this as a **Definition of Done** for API work.

### List endpoints (for dropdowns)

- [ ] **`GET …/getDivisionList`** — returns divisions for the EVS org filter dropdown.
- [ ] **`GET …/getDepartmentList`** — already used for EVS (same contract as below).
- [ ] **`GET …/getSectionList`** — returns sections for the EVS org filter dropdown.

**Shared response shape (EVS list hooks expect this):**

```json
{
  "data": [
    { "Name": "CMD" },
    { "Name": "…" }
  ]
}
```

- Each row must include **`Name`** (string). The UI maps `Name` → filter option label and value.
- If the real API uses different property names, **either** align the API **or** adjust the frontend mapping in the hooks (coordinate in a PR).

**Frontend paths (axios, relative to API base):**

Same pattern as `useGetDepartmentList`: `api/${evs | employees}/get…List`.

| Hook | HTTP | EVS path | Non-EVS path |
|------|------|----------|--------------|
| `useGetDivisionList` | GET | `api/evs/getDivisionList` | `api/employees/getDivisionList` |
| `useGetSectionList` | GET | `api/evs/getSectionList` | `api/employees/getSectionList` |
| `useGetDepartmentList` | GET | `api/evs/getDepartmentList` | `api/employees/getDepartmentList` |

**Response mapping:**

- **EVS:** nested `response.data.data[]`, each row `{ Name }` → options `{ label, value }` from `Name`.
- **Non-EVS (employees):** `Array.isArray(response.data)` — division uses `DivisionName` (fallback `Name`); section uses `SectionName` (fallback `Name`); department uses `DepartmentName` (see `useGetDepartmentList.ts`).

---

### Filtering (reports must honor these)

When the user selects org filters, the frontend sends **lowercase** query/param keys:

| Key | Meaning | Example value |
|-----|-----------|----------------|
| `division` | Division filter | Same string as a row’s `Name` from getDivisionList |
| `department` | Department filter | Same as getDepartmentList (EVS: `item.Name`) |
| `section` | Section filter | Same as getSectionList |

**Backend must:**

- [ ] Accept **`division`**, **`department`**, **`section`** on:
  - **Socket** payloads for room `evs_reports` and for **`evs_all`** (export-all).
  - **REST** `GET /api/evs/reports?…`
  - **REST** `GET /api/evs/reports/export?…` (export forwards all non-empty search params, including these).

- [ ] Apply filters as **AND** (or document if OR / different behavior).

- [ ] Ignore unknown params safely (optional but recommended for forward compatibility).

---

## Payload reference (frontend behavior)

### 1) Router / URL search

When filters are applied, search may include (among others):

`division`, `department`, `section`, `Type`, `Status`, `DeviceName`, `page`, `limit`, `search`, `EvacuationStatus`, date fields, etc.

---

### 2) Current tab — socket `evs_reports` (`normalizeParams`)

Emitted object always includes roughly:

- `EvacuationStatus`, `page`, `limit`, `search`

Optional, only if present:

- `Type`, `Status`, `DeviceName`
- **`division`**, **`department`**, **`section`**
- `from_evs_reports_date`, `to_evs_reports_date`

**Example:**

```json
{
  "EvacuationStatus": "current",
  "page": 1,
  "limit": 10,
  "search": "",
  "division": "CMD",
  "department": "GAD",
  "section": "GAS"
}
```

---

### 3) Current tab — Export all — socket `evs_all` (`buildExportPayload`)

No pagination keys. Includes `search` and any set filters, including **`division`**, **`department`**, **`section`**, plus Type/Status/DeviceName and date range when applicable.

**Example:**

```json
{
  "search": "",
  "division": "CMD",
  "department": "GAD",
  "section": "GAS",
  "Type": "Employee",
  "Status": "Safe",
  "DeviceName": "",
  "from_evs_reports_date": "2026-03-01",
  "to_evs_reports_date": "2026-03-31"
}
```

---

### 4) Completed tab — REST list

- **Request:** `GET /api/evs/reports?<querystring>`
- Query string is built from **all** non-empty search fields, including `division`, `department`, `section`.

---

### 5) Completed tab — Export all

- **Request:** `GET <REST_BASE>/api/evs/reports/export?module=evs&token=…&<search params>`
- Same search keys as the completed tab (including org filters).

---

## CSV exports (client-generated)

**Export Page** / **Export Selected** build CSV in the browser from current row data; they do not define separate backend contracts. **Export All** uses the server (sections 3 and 5).

---

## Collaboration notes

- **Single source of truth for values:** list `Name` values should match row fields used for filtering (`division` / `department` / `section` on report rows), or document normalization rules.
- **Breaking changes:** renaming query params or response fields requires a coordinated frontend + backend change.
- **Questions for backend (if unclear):** exact socket event payload schema for `evs_all`; whether export uses the same filter semantics as the table query.

---

## Document history

| Date | Change |
|------|--------|
| (add rows as the contract evolves) | |
