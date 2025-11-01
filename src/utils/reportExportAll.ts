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
      Object.keys(search).forEach((key) => {
        appendIfPresent(params, key, search[key]);
      });

      downloadUrl = `${baseUrl}/api/evs/report/export?${params.toString()}`;
      break;
    }
    default: {
      const params = new URLSearchParams();
      appendIfPresent(params, "module", module);
      appendIfPresent(params, "token", localStorage.getItem("token"));
      Object.keys(search).forEach((key) => {
        appendIfPresent(params, key, search[key]);
      });
      downloadUrl = `${baseUrl}/api/report/export?${params.toString()}`;
      break;
    }
  }

  window.open(downloadUrl, "_blank");
}
