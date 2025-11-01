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

  const params = new URLSearchParams();
  appendIfPresent(params, "module", module);
  appendIfPresent(params, "token", localStorage.getItem("token"));

  if (module === "evs") {
    appendIfPresent(params, "evacuationStatus", search.evacuationStatus);
    Object.entries(search).forEach(([key, value]) => {
      appendIfPresent(params, key, value);
    });
    downloadUrl = `${baseUrl}/api/evs/report/export?${params.toString()}`;
  } else {
    Object.entries(search).forEach(([key, value]) => {
      appendIfPresent(params, key, value);
    });
    downloadUrl = `${baseUrl}/api/report/export?${params.toString()}`;
  }

  window.open(downloadUrl, "_blank");
}
