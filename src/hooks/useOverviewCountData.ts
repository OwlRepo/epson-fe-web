import { useSocket, type SummaryData } from './useSocket';

export const useOverviewCountData = () => {
    return useSocket<SummaryData>({
        room: 'AMS',
        dataType: 'summary'
    });
};
