import { createAsyncThunk } from '@reduxjs/toolkit';
import { normalizeTasksResponse } from '@/features/tasks/normalize';
import { getTaskCache, setTaskCache } from '@/lib/taskCache';
import type { RootState } from '@/store/store';

export const fetchTasksPage = createAsyncThunk(
  'tasks/fetchTasksPage',
  async ({ page, pageSize }: { page: number; pageSize: number }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';
    const response = await fetch(`${apiBase}/api/tasks?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) {
      return rejectWithValue('Failed to fetch tasks');
    }
    const payload = await response.json();
    const normalized = normalizeTasksResponse({
      ...((typeof payload === 'object' && payload !== null) ? payload : {}),
      page,
      pageSize,
    });
    await setTaskCache(normalized, state.tasks.selectedTaskId);
    return normalized;
  }
);

export const hydrateTasksFromCache = createAsyncThunk('tasks/hydrateTasksFromCache', async () => {
  const cached = await getTaskCache();
  if (!cached) {
    return null;
  }
  return cached;
});
