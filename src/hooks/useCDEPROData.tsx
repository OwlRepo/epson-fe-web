import { useSocket, type SummaryData } from "./useSocket";

export const useCDEPROData = () => {
  return useSocket<SummaryData>({
    room: "cdepro",
    dataType: "summary",
  });
};
