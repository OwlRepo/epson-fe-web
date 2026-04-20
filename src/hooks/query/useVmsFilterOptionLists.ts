import {
  buildVmsFilterOptionParams,
  fetchVmsFilterOptionList,
  type VmsFilterOptionListKey,
  type VmsFilterOptionQueryInput,
} from "@/utils/vmsFilterOptions";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

function useVmsFilterOptionListQuery(
  listKey: VmsFilterOptionListKey,
  input: VmsFilterOptionQueryInput,
) {
  const params = useMemo(
    () => buildVmsFilterOptionParams(input),
    [
      input.scope,
      input.search,
      input.fromVmsLiveDateTime,
      input.toVmsLiveDateTime,
      input.fromVmsReportsDateTime,
      input.toVmsReportsDateTime,
    ],
  );

  const queryKey = useMemo(
    () => [
      "vms-filter-options",
      listKey,
      params.scope,
      params.search ?? "",
      params.from_vms_live_date_time ?? "",
      params.to_vms_live_date_time ?? "",
      params.from_vms_reports_date_time ?? "",
      params.to_vms_reports_date_time ?? "",
    ],
    [listKey, params],
  );

  return useQuery({
    queryKey,
    queryFn: () => fetchVmsFilterOptionList(listKey, params),
    retry: 0,
    refetchOnWindowFocus: false,
  });
}

/** GET /api/vms/getVisitorNameList — FE keys: Name / filter_Name */
export function useGetVmsVisitorNameList(input: VmsFilterOptionQueryInput) {
  return useVmsFilterOptionListQuery("getVisitorNameList", input);
}

/** GET /api/vms/getCompanyList — FE keys: Company / filter_Company */
export function useGetVmsCompanyList(input: VmsFilterOptionQueryInput) {
  return useVmsFilterOptionListQuery("getCompanyList", input);
}

/** GET /api/vms/getHostPersonList — FE keys: HostPerson / filter_HostPerson */
export function useGetVmsHostPersonList(input: VmsFilterOptionQueryInput) {
  return useVmsFilterOptionListQuery("getHostPersonList", input);
}

/** GET /api/vms/getVisitorTypeList — FE keys: VisitorType / filter_VisitorType */
export function useGetVmsVisitorTypeList(input: VmsFilterOptionQueryInput) {
  return useVmsFilterOptionListQuery("getVisitorTypeList", input);
}
