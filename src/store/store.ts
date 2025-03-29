import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface StoreState {
  // Add your store state types here
}

interface StoreActions {
  // Add your store actions types here
}

type Store = StoreState & StoreActions;

export const createStore = <T extends Store>(
  name: string,
  initialState: T,
  options?: {
    persist?: boolean;
    devtools?: boolean;
  }
) => {
  let store = create<T>()((set) => ({
    ...initialState,
  }));

  if (options?.persist) {
    store = create<T>()(
      persist(
        (set) => ({
          ...initialState,
        }),
        {
          name,
        }
      )
    );
  }

  if (options?.devtools) {
    store = create<T>()(
      devtools(
        (set) => ({
          ...initialState,
        }),
        {
          name,
        }
      )
    );
  }

  return store;
};
