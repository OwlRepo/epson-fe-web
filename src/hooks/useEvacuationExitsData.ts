import { useSocket, type LiveData } from "./useSocket";
export interface EvacuationExitsData {
  room: string;
  dataType: "summary" | "live";
}

export const useEvacuationExitsData = ({
  room,
  dataType,
}: EvacuationExitsData) => {
  return useSocket<LiveData>({
    room: room,
    dataType: dataType,
  });
};
