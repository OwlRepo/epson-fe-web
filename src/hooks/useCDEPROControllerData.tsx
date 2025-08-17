import { useSocket, type LiveData } from "./useSocket";
export interface CDEPROControllerData {
  room: string;
  dataType: "summary" | "live";
}

export const useCDEPROControllerData = ({
  room,
  dataType,
}: CDEPROControllerData) => {
  return useSocket<LiveData>({
    room: room,
    dataType: dataType,
  });
};
