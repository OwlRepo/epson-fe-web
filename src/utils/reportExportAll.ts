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
  let downloadEndpoint = "";

  if (module === "evs") {
    downloadEndpoint = "/api/evs/reports/export";
  } else if (module === "ams") {
    downloadEndpoint = "/api/employees/reports/export";
  } else if (module === "vms") {
    downloadEndpoint = "/api/vms/reports/export";
  }

  const params = new URLSearchParams();
  appendIfPresent(params, "module", module);
  appendIfPresent(params, "token", localStorage.getItem("token"));

  Object.entries(search).forEach(([key, value]) => {
    appendIfPresent(params, key, value);
  });

  downloadUrl = `${baseUrl}${downloadEndpoint}?${params.toString()}`;

  try {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error(
      "[reportExportAll] Export trigger failed (endpoint may be unavailable)",
      e
    );
  }
}
