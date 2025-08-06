import { create } from "zustand";

interface LiveDataTableStore {
  flaggedRecords: boolean;
  setFlaggedRecords: (flaggedRecords: boolean) => void;
}

const useLiveDataTableStore = create<LiveDataTableStore>((set) => ({
  flaggedRecords: false,
  setFlaggedRecords: (flaggedRecords) => set({ flaggedRecords }),
}));

export default useLiveDataTableStore;
