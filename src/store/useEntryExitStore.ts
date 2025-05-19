import { create } from "zustand";

interface EntryExitStore {
    currentSelectedDeviceType: string | null;
    setCurrentSelectedDeviceType: (deviceType: string | null) => void;
}

const useEntryExitStore = create<EntryExitStore>((set) => ({
    currentSelectedDeviceType: null,
    setCurrentSelectedDeviceType: (currentSelectedDeviceType) => set({ currentSelectedDeviceType }),
}));

export default useEntryExitStore;
