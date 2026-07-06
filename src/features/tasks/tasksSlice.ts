import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { normalizeTasksResponse } from '@/features/tasks/normalize';
import { fetchTasksPage, hydrateTasksFromCache } from '@/features/tasks/tasksThunks';
import type { NormalizedTask, TaskFilters, TaskSorting, TaskStatus } from '@/features/tasks/types';

export interface TasksState {
  ids: string[];
  entities: Record<string, NormalizedTask>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  hydratedFromCache: boolean;
  cacheUpdatedAt: number | null;
  lastFetchedAt: number | null;
  isRevalidating: boolean;
  selectedTaskId: string | null;
  filters: TaskFilters;
  sorting: TaskSorting;
  liveEventCount: number;
  pendingEventRefs: string[];
  connectionStatus: 'connecting' | 'open' | 'closed' | 'error' | 'reconnecting';
}

const tasksAdapter = createEntityAdapter<NormalizedTask>();

const initialState: TasksState = {
  ...tasksAdapter.getInitialState(),
  status: 'idle',
  error: null,
  page: 1,
  pageSize: 10,
  total: 0,
  hydratedFromCache: false,
  cacheUpdatedAt: null,
  lastFetchedAt: null,
  isRevalidating: false,
  selectedTaskId: null,
  filters: {
    type: 'all',
    status: 'all',
    search: '',
  },
  sorting: {
    sortBy: 'updatedAt',
    sortDirection: 'desc',
  },
  liveEventCount: 0,
  pendingEventRefs: [],
  connectionStatus: 'connecting',
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTaskId: (state, action: PayloadAction<string | null>) => {
      state.selectedTaskId = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSorting: (state, action: PayloadAction<Partial<TaskSorting>>) => {
      state.sorting = { ...state.sorting, ...action.payload };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    mergeTaskUpdate: (state, action: PayloadAction<{ id: string; status?: TaskStatus; updatedAt?: number; assignee?: { id: string; name: string } | null }>) => {
      const existing = state.entities[action.payload.id];
      if (!existing) {
        state.pendingEventRefs = Array.from(new Set([...state.pendingEventRefs, action.payload.id]));
        return;
      }
      if (action.payload.status) existing.status = action.payload.status;
      if (action.payload.updatedAt) existing.updatedAt = action.payload.updatedAt;
      if (action.payload.assignee !== undefined) existing.assignee = action.payload.assignee;
      state.liveEventCount += 1;
    },
    incrementAnnotationCount: (state, action: PayloadAction<string>) => {
      const existing = state.entities[action.payload];
      if (!existing) {
        state.pendingEventRefs = Array.from(new Set([...state.pendingEventRefs, action.payload]));
        return;
      }
      existing.annotationCount += 1;
      state.liveEventCount += 1;
    },
    upsertFromEvent: (state, action: PayloadAction<NormalizedTask>) => {
      tasksAdapter.upsertOne(state, action.payload);
      state.pendingEventRefs = state.pendingEventRefs.filter((id) => id !== action.payload.id);
      state.liveEventCount += 1;
    },
    setConnectionStatus: (state, action: PayloadAction<TasksState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
    },
    clearPendingEventRefs: (state) => {
      state.pendingEventRefs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksPage.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.isRevalidating = true;
      })
      .addCase(fetchTasksPage.fulfilled, (state, action) => {
        const normalized = normalizeTasksResponse(action.payload);
        state.status = 'succeeded';
        state.error = null;
        state.page = normalized.page;
        state.pageSize = normalized.pageSize;
        state.total = normalized.total;
        state.lastFetchedAt = Date.now();
        state.isRevalidating = false;
        state.hydratedFromCache = false;
        state.cacheUpdatedAt = null;
        tasksAdapter.setAll(state, normalized.tasks);
      })
      .addCase(fetchTasksPage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = typeof action.payload === 'string' ? action.payload : action.error.message ?? 'Failed to fetch tasks';
        state.isRevalidating = false;
      })
      .addCase(hydrateTasksFromCache.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(hydrateTasksFromCache.fulfilled, (state, action) => {
        if (action.payload) {
          const normalized = normalizeTasksResponse(action.payload);
          state.hydratedFromCache = true;
          state.cacheUpdatedAt = action.payload.cachedAt ?? Date.now();
          state.page = normalized.page;
          state.pageSize = normalized.pageSize;
          state.total = normalized.total;
          tasksAdapter.setAll(state, normalized.tasks);
          state.status = 'succeeded';
        }
      })
      .addCase(hydrateTasksFromCache.rejected, (state) => {
        state.status = 'idle';
      });
  },
});

export const {
  setSelectedTaskId,
  setFilters,
  setSorting,
  setPage,
  setPageSize,
  mergeTaskUpdate,
  incrementAnnotationCount,
  upsertFromEvent,
  setConnectionStatus,
  clearPendingEventRefs,
} = tasksSlice.actions;

export default tasksSlice.reducer;
