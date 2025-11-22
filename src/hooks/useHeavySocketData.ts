/**
 * useHeavySocketData Hook
 * React integration for Advanced Data Manager with 500k record support
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  dataManager,
  Record,
  FilterConfig,
  TierStats,
} from "@/utils/advancedDataManager";
import { useDebounce } from "./useDebounce";

interface UseHeavySocketDataProps {
  room: string;
  autoCleanup?: boolean;
}

interface UseHeavySocketDataReturn {
  data: Record[];
  totalCount: number;
  loadMore: () => Promise<void>;
  isLoadingMore: boolean;
  isInitializing: boolean;
  search: (query: string) => void;
  filter: (filters: FilterConfig) => void;
  searchResults: Record[] | null;
  handleNewRecord: (record: Record) => void;
  stats: TierStats;
  reset: () => Promise<void>;
}

export function useHeavySocketData({
  room,
  autoCleanup = true,
}: UseHeavySocketDataProps): UseHeavySocketDataReturn {
  // State
  const [data, setData] = useState<Record[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterConfig>({});
  const [searchResults, setSearchResults] = useState<Record[] | null>(null);
  const [stats, setStats] = useState<TierStats>({
    hot: 0,
    warm: 0,
    cold: 0,
    total: 0,
  });

  // Refs
  const currentOffset = useRef(0);
  const hasMore = useRef(true);
  const isSearchActive = useRef(false);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  /**
   * Initialize data manager and load initial data
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true);

        // Initialize with lazy loading (fast mount)
        await dataManager.init(true);

        // Load initial hot cache data
        const initialData = await dataManager.loadPage(0, 1000);
        setData(initialData);

        // Update stats
        const initialStats = await dataManager.getStats();
        setStats(initialStats);
        setTotalCount(initialStats.total);

        currentOffset.current = initialData.length;
      } catch (error) {
        console.error("Failed to initialize data manager:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  /**
   * Update stats periodically
   */
  useEffect(() => {
    const updateStats = async () => {
      const newStats = await dataManager.getStats();
      setStats(newStats);
      setTotalCount(newStats.total);
    };

    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  /**
   * Handle search when debounced query changes
   */
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim() && Object.keys(filters).length === 0) {
        // Reset to normal view
        setSearchResults(null);
        isSearchActive.current = false;
        const initialData = await dataManager.loadPage(0, 1000);
        setData(initialData);
        currentOffset.current = initialData.length;
        return;
      }

      try {
        isSearchActive.current = true;

        let results: Record[];
        if (debouncedSearchQuery.trim() && Object.keys(filters).length > 0) {
          // Combined search and filter
          results = await dataManager.searchAndFilter(
            debouncedSearchQuery,
            filters
          );
        } else if (debouncedSearchQuery.trim()) {
          // Search only
          results = await dataManager.search(debouncedSearchQuery, 1000);
        } else {
          // Filter only
          results = await dataManager.filter(filters);
        }

        setSearchResults(results);
        setData(results.slice(0, 1000));
      } catch (error) {
        console.error("Search/filter failed:", error);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, filters]);

  /**
   * Load more records for infinite scroll
   */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore.current || isSearchActive.current) return;

    try {
      setIsLoadingMore(true);

      const newRecords = await dataManager.loadPage(currentOffset.current, 100);

      if (newRecords.length === 0) {
        hasMore.current = false;
      } else {
        setData((prev) => [...prev, ...newRecords]);
        currentOffset.current += newRecords.length;
      }
    } catch (error) {
      console.error("Failed to load more records:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore]);

  /**
   * Handle new record from socket
   */
  const handleNewRecord = useCallback(
    async (record: Record) => {
      try {
        await dataManager.addRecord(record);

        // Update stats
        const newStats = await dataManager.getStats();
        setStats(newStats);
        setTotalCount(newStats.total);

        // If not searching/filtering, update hot cache view
        if (!isSearchActive.current) {
          setData((prev) => [record, ...prev.slice(0, 999)]);
          currentOffset.current++;
        } else {
          // If searching/filtering, check if new record matches
          if (debouncedSearchQuery.trim() || Object.keys(filters).length > 0) {
            // Re-run search/filter
            let results: Record[];
            if (debouncedSearchQuery.trim() && Object.keys(filters).length > 0) {
              results = await dataManager.searchAndFilter(
                debouncedSearchQuery,
                filters
              );
            } else if (debouncedSearchQuery.trim()) {
              results = await dataManager.search(debouncedSearchQuery, 1000);
            } else {
              results = await dataManager.filter(filters);
            }
            setSearchResults(results);
            setData(results.slice(0, 1000));
          }
        }
      } catch (error) {
        console.error("Failed to add new record:", error);
      }
    },
    [debouncedSearchQuery, filters]
  );

  /**
   * Set search query
   */
  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * Set filters
   */
  const filter = useCallback((newFilters: FilterConfig) => {
    setFilters(newFilters);
  }, []);

  /**
   * Reset to initial state
   */
  const reset = useCallback(async () => {
    setSearchQuery("");
    setFilters({});
    setSearchResults(null);
    isSearchActive.current = false;

    const initialData = await dataManager.loadPage(0, 1000);
    setData(initialData);
    currentOffset.current = initialData.length;
    hasMore.current = true;

    const newStats = await dataManager.getStats();
    setStats(newStats);
    setTotalCount(newStats.total);
  }, []);

  return {
    data,
    totalCount,
    loadMore,
    isLoadingMore,
    isInitializing,
    search,
    filter,
    searchResults,
    handleNewRecord,
    stats,
    reset,
  };
}

