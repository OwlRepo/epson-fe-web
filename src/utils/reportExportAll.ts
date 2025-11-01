import { getApiRESTBaseUrl } from "./env";

export default function reportExportAll(props: {
  search: any;
  module: "evs" | "ams" | "vms";
}) {
  const { search, module } = props;
  const baseUrl = getApiRESTBaseUrl();

  let downloadUrl = "";

  switch (module) {
    case "evs":
      downloadUrl = `${baseUrl}/api/evs/download/report?module=${module}&evacuationStatus=${search.evacuationStatus}&completedEvacuationDate=${search.completedEvacuationDate}&token=${localStorage.getItem("token")}`;
      break;
    case "ams":
      downloadUrl = `${baseUrl}/api/download/report?module=${module}&token=${localStorage.getItem("token")}&fromDate=${search.fromDate}&toDate=${search.toDate}`;
      break;
    case "vms":
      downloadUrl = `${baseUrl}/api/download/report?module=${module}&token=${localStorage.getItem("token")}&fromDate=${search.fromDate}&toDate=${search.toDate}`;
      break;
    default:
      throw new Error("Invalid module");
  }

  window.open(downloadUrl, "_blank");
}
