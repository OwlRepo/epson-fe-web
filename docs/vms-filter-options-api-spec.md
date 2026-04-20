# VMS: Filter option lists — per-filter REST APIs

**Purpose:** Backend and frontend contract for **dropdown option data** for Visitor Management filters (**Name**, **Company**, **Host Person**, **Visitor Type**). Same intent as EVS list endpoints (e.g. `getDivisionList` / `useGetSectionList`): options come from dedicated `GET` APIs so users see **all** valid values, not only values on the current table page or live buffer.

**Related:** Report and live URL keys remain in [`vms-live-reports-columns-filters-spec.md`](./vms-live-reports-columns-filters-spec.md).

**Frontend:** [`src/hooks/query/useGetVmsVisitorNameList.ts`](../src/hooks/query/useGetVmsVisitorNameList.ts), [`useGetVmsCompanyList.ts`](../src/hooks/query/useGetVmsCompanyList.ts), [`useGetVmsHostPersonList.ts`](../src/hooks/query/useGetVmsHostPersonList.ts), [`useGetVmsVisitorTypeList.ts`](../src/hooks/query/useGetVmsVisitorTypeList.ts) (shared implementation: [`useVmsFilterOptionLists.ts`](../src/hooks/query/useVmsFilterOptionLists.ts)), [`src/utils/vmsFilterOptions.ts`](../src/utils/vmsFilterOptions.ts).

**EVS cross-reference:** Same “list endpoint + `useGet*List` hook” pattern as [`evs-reports-org-filters-spec.md`](./evs-reports-org-filters-spec.md).

---

## Contract rules (all four endpoints)

- **Method:** `GET`
- **Content type:** `application/json`
- **Canonical success shape:** `{ "data": [{ "Name": "<string>" }, …] }`
- **Optional per row:** `ID` (`string | number`) — FE uses **`Name`** as the filter value in URLs (not `ID`).
- **Empty result:** `200` with `{ "data": [] }` (not `null`).
- **Unknown query keys:** ignore safely (do not fail the request).
- **Backward compatibility:** FE tolerates a bare JSON **array** during migration; canonical `{ data: [...] }` is preferred.

**Parity:** Each `Name` must match what **`GET /api/vms/reports`** and **`GET /api/vms/reports/export`** accept for the corresponding filter query key.

---

## Shared optional query parameters

| Param | Notes |
|-------|--------|
| `scope` | `live` \| `reports` \| `all` (default `all`). FE sends `live` on dashboard, `reports` on reports page. |
| `search` | Optional text narrowing; FE may pass table `search` when set. |
| `from_vms_live_date_time` / `to_vms_live_date_time` | Live datetime range (scoping hint). |
| `from_vms_reports_date_time` / `to_vms_reports_date_time` | Reports datetime range (scoping hint). |

---

## Endpoints and FE filter keys

| Endpoint | FE filter key (reports URL) | FE filter key (live URL) |
|----------|----------------------------|---------------------------|
| `GET /api/vms/getVisitorNameList` | `Name` | `filter_Name` |
| `GET /api/vms/getCompanyList` | `Company` | `filter_Company` |
| `GET /api/vms/getHostPersonList` | `HostPerson` | `filter_HostPerson` |
| `GET /api/vms/getVisitorTypeList` | `VisitorType` | `filter_VisitorType` |

### Example requests

- `/api/vms/getVisitorNameList?scope=reports&search=jo&from_vms_reports_date_time=2026-04-01T00:00:00&to_vms_reports_date_time=2026-04-30T23:59:59`
- `/api/vms/getCompanyList?scope=all&from_vms_live_date_time=2026-04-01T08:00:00&to_vms_live_date_time=2026-04-20T17:30:00`
- `/api/vms/getHostPersonList?scope=reports&search=maria`
- `/api/vms/getVisitorTypeList?scope=all`

### Example responses

**Canonical**

```json
{
  "data": [
    { "Name": "John Doe" },
    { "Name": "Acme Corp" }
  ]
}
```

**With optional IDs**

```json
{
  "data": [
    { "ID": "V000123", "Name": "John Doe" },
    { "ID": 1, "Name": "Visitor" }
  ]
}
```

---

## Frontend behavior

- Hooks use **`retry: 0`**; network/404 errors resolve to **empty** options for that filter (no crash).
- **API-first, then rows:** If the API returns no usable options, FE builds options from **current report rows** or **live socket buffer** as before.
- **Reports — Visitor Type:** Order is **`getVisitorTypeList`** → **`/api/vms/guestTypeList`** (`useGetGuestTypeList`) → **row uniques**.

---

## Backend error behavior (FE fallback)

- **`404` / error:** That filter falls back to row-derived options only.
- **Malformed body:** Same fallback for that filter.
- **Per-filter:** Other filters can still use API options if their calls succeed.

---

## Backend checklist (filter-option endpoints)

- [ ] Implement all four endpoints as `GET` with `{ data: [{ Name }] }`.
- [ ] Align `Name` values with report/export filter query params.
- [ ] Dedupe, trim whitespace; sort for stable UX.
- [ ] Do not hard-fail on unknown optional query params.

---

## Copy-paste OpenAPI-style YAML snippet

```yaml
openapi: 3.0.3
info:
  title: VMS Filter Options API
  version: 1.0.0
  description: >
    Endpoints for VMS filter option lists used by frontend filters in
    Visitor Management reports and live dashboard.

paths:
  /api/vms/getVisitorNameList:
    get:
      summary: Get visitor name filter options
      operationId: getVmsVisitorNameList
      tags: [VMS, FilterOptions]
      parameters:
        - $ref: "#/components/parameters/ScopeParam"
        - $ref: "#/components/parameters/SearchParam"
        - $ref: "#/components/parameters/FromVmsLiveDateTimeParam"
        - $ref: "#/components/parameters/ToVmsLiveDateTimeParam"
        - $ref: "#/components/parameters/FromVmsReportsDateTimeParam"
        - $ref: "#/components/parameters/ToVmsReportsDateTimeParam"
      responses:
        "200":
          description: Visitor name options
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OptionListResponse"
              examples:
                success:
                  value:
                    data:
                      - Name: John Doe
                      - Name: Jose Cruz
                      - Name: Joy Anne Reyes
        "500":
          $ref: "#/components/responses/ServerError"

  /api/vms/getCompanyList:
    get:
      summary: Get company filter options
      operationId: getVmsCompanyList
      tags: [VMS, FilterOptions]
      parameters:
        - $ref: "#/components/parameters/ScopeParam"
        - $ref: "#/components/parameters/SearchParam"
        - $ref: "#/components/parameters/FromVmsLiveDateTimeParam"
        - $ref: "#/components/parameters/ToVmsLiveDateTimeParam"
        - $ref: "#/components/parameters/FromVmsReportsDateTimeParam"
        - $ref: "#/components/parameters/ToVmsReportsDateTimeParam"
      responses:
        "200":
          description: Company options
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OptionListResponse"
              examples:
                success:
                  value:
                    data:
                      - Name: Acme Corp
                      - Name: Epson APAC
                      - Name: TechFlow Inc.
        "500":
          $ref: "#/components/responses/ServerError"

  /api/vms/getHostPersonList:
    get:
      summary: Get host person filter options
      operationId: getVmsHostPersonList
      tags: [VMS, FilterOptions]
      parameters:
        - $ref: "#/components/parameters/ScopeParam"
        - $ref: "#/components/parameters/SearchParam"
        - $ref: "#/components/parameters/FromVmsLiveDateTimeParam"
        - $ref: "#/components/parameters/ToVmsLiveDateTimeParam"
        - $ref: "#/components/parameters/FromVmsReportsDateTimeParam"
        - $ref: "#/components/parameters/ToVmsReportsDateTimeParam"
      responses:
        "200":
          description: Host person options
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OptionListResponse"
              examples:
                success:
                  value:
                    data:
                      - Name: Maria Santos
                      - Name: Mark Lim
        "500":
          $ref: "#/components/responses/ServerError"

  /api/vms/getVisitorTypeList:
    get:
      summary: Get visitor type filter options
      operationId: getVmsVisitorTypeList
      tags: [VMS, FilterOptions]
      parameters:
        - $ref: "#/components/parameters/ScopeParam"
        - $ref: "#/components/parameters/SearchParam"
        - $ref: "#/components/parameters/FromVmsLiveDateTimeParam"
        - $ref: "#/components/parameters/ToVmsLiveDateTimeParam"
        - $ref: "#/components/parameters/FromVmsReportsDateTimeParam"
        - $ref: "#/components/parameters/ToVmsReportsDateTimeParam"
      responses:
        "200":
          description: Visitor type options
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OptionListResponse"
              examples:
                success:
                  value:
                    data:
                      - ID: 1
                        Name: Visitor
                      - ID: 2
                        Name: Supplier
                      - ID: 3
                        Name: Contractor
        "500":
          $ref: "#/components/responses/ServerError"

components:
  parameters:
    ScopeParam:
      name: scope
      in: query
      required: false
      description: Scope of option source.
      schema:
        type: string
        enum: [live, reports, all]
        default: all

    SearchParam:
      name: search
      in: query
      required: false
      description: Optional text narrowing for options.
      schema:
        type: string

    FromVmsLiveDateTimeParam:
      name: from_vms_live_date_time
      in: query
      required: false
      description: Lower bound for live datetime scope.
      schema:
        type: string
        pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$'
        example: 2026-04-01T08:00:00

    ToVmsLiveDateTimeParam:
      name: to_vms_live_date_time
      in: query
      required: false
      description: Upper bound for live datetime scope.
      schema:
        type: string
        pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$'
        example: 2026-04-20T17:30:00

    FromVmsReportsDateTimeParam:
      name: from_vms_reports_date_time
      in: query
      required: false
      description: Lower bound for reports datetime scope.
      schema:
        type: string
        pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$'
        example: 2026-04-01T00:00:00

    ToVmsReportsDateTimeParam:
      name: to_vms_reports_date_time
      in: query
      required: false
      description: Upper bound for reports datetime scope.
      schema:
        type: string
        pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$'
        example: 2026-04-30T23:59:59

  schemas:
    OptionItem:
      type: object
      required: [Name]
      properties:
        ID:
          oneOf:
            - type: string
            - type: number
        Name:
          type: string
          minLength: 1
      additionalProperties: true

    OptionListResponse:
      type: object
      required: [data]
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/OptionItem"

    ErrorResponse:
      type: object
      properties:
        message:
          type: string
          example: Internal server error

  responses:
    ServerError:
      description: Unexpected server error
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
```
