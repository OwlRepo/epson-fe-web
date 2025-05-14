import { useSocket, type LiveData } from './useSocket';
export interface OverviewCountDataProps {
    room: string;
    dataType: 'summary' | 'live';
}
export const useOverviewCountData = (props: OverviewCountDataProps) => {
    return useSocket<LiveData>({
        room: props.room,
        dataType: props.dataType
    });
};
