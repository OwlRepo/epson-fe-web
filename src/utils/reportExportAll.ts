import { getApiRESTBaseUrl } from "./env";

function appendIfPresent(params: URLSearchParams, key: string, value: any) {
  if (value !== undefined && value !== null && value !== "") {
    params.append(key, value);
  }
}

export default function reportExportAll(props: {
  search: any;
  module: "evs" | "ams" | "vms";
}) {
  const { search, module } = props;
  const baseUrl = getApiRESTBaseUrl();

  let downloadUrl = "";

  switch (module) {
    case "evs": {
      const params = new URLSearchParams();
      appendIfPresent(params, "module", module);
      appendIfPresent(params, "token", localStorage.getItem("token"));
      appendIfPresent(params, "evacuationStatus", search.evacuationStatus);
      appendIfPresent(
        params,
        "completedEvacuationDate",
        search.completedEvacuationDate
      );

      downloadUrl = `${baseUrl}/api/evs/report/export?${params.toString()}`;
      break;
    }
    case "ams": {
      const params = new URLSearchParams();
      appendIfPresent(params, "module", module);
      appendIfPresent(params, "token", localStorage.getItem("token"));
      appendIfPresent(params, "fromDate", search.fromDate);
      appendIfPresent(params, "toDate", search.toDate);

      downloadUrl = `${baseUrl}/api/report/export?${params.toString()}`;
      break;
    }
    case "vms": {
      const params = new URLSearchParams();
      appendIfPresent(params, "module", module);
      appendIfPresent(params, "token", localStorage.getItem("token"));
      appendIfPresent(params, "fromDate", search.fromDate);
      appendIfPresent(params, "toDate", search.toDate);

      downloadUrl = `${baseUrl}/api/report/export?${params.toString()}`;
      break;
    }
    default:
      throw new Error("Invalid module");
  }

  window.open(downloadUrl, "_blank");
}
