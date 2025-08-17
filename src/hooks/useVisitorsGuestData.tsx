import { useSocket, type LiveData } from "./useSocket";
export interface VisitorsGuestDataProps {
  room: string;
  dataType: "summary" | "live";
  statusFilter?: boolean;
}
export const useVisitorsGuestData = (props: VisitorsGuestDataProps) => {
  return useSocket<LiveData>({
    room: props.room,
    dataType: props.dataType,
    statusFilter: props.statusFilter,
  });
};
