import localforage from 'localforage';
import type { TasksResponse } from '@/features/tasks/types';

const STORAGE_KEY = 'annotation-task-cache';

export interface TaskCachePayload extends TasksResponse {
  cachedAt: number;
  selectedTaskId: string | null;
}

interface StoredCachePayload {
  tasks: TasksResponse['tasks'];
  page: number;
  pageSize: number;
  total: number;
  cachedAt: number;
  selectedTaskId: string | null;
}

export async function setTaskCache(payload: TasksResponse, selectedTaskId: string | null) {
  const cachePayload: StoredCachePayload = {
    tasks: payload.tasks,
    page: payload.page,
    pageSize: payload.pageSize,
    total: payload.total,
    cachedAt: Date.now(),
    selectedTaskId,
  };

  await localforage.setItem(STORAGE_KEY, cachePayload);
}

export async function getTaskCache(): Promise<TaskCachePayload | null> {
  try {
    const data = await localforage.getItem<StoredCachePayload>(STORAGE_KEY);
    if (!data) return null;
    return {
      tasks: data.tasks,
      page: data.page,
      pageSize: data.pageSize,
      total: data.total,
      cachedAt: data.cachedAt,
      selectedTaskId: data.selectedTaskId,
    };
  } catch {
    return null;
  }
}
