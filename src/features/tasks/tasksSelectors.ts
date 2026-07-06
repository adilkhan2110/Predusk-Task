import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { NormalizedTask, TaskFilterStatus, TaskFilterType, TaskStatus, TaskType } from '@/features/tasks/types';

const selectTasksState = (state: RootState) => state.tasks;

export const selectAllTasks = createSelector([selectTasksState], (state) => Object.values(state.entities));

export const selectTaskById = createSelector(
  [selectTasksState, (_state: RootState, taskId: string | null | undefined) => taskId],
  (state, taskId) => (taskId ? state.entities[taskId] ?? null : null)
);

export const selectTaskFilters = createSelector([selectTasksState], (state) => state.filters);
export const selectPagination = createSelector([selectTasksState], (state) => ({ page: state.page, pageSize: state.pageSize, total: state.total }));

export const selectFilteredTasks = createSelector([selectAllTasks, selectTaskFilters], (tasks, filters) => {
  const search = filters.search.trim().toLowerCase();
  return tasks.filter((task) => {
    const matchesType = filters.type === 'all' || task.type === filters.type;
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const haystack = [task.title, task.id, task.assignee?.name ?? ''].join(' ').toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    return matchesType && matchesStatus && matchesSearch;
  });
});

export const selectSortedFilteredTasks = createSelector([selectFilteredTasks, (state: RootState) => state.tasks.sorting], (tasks, sorting) => {
  const sorted = [...tasks].sort((left, right) => {
    const direction = sorting.sortDirection === 'asc' ? 1 : -1;
    const leftValue = sorting.sortBy === 'annotationCount' ? left.annotationCount : left.updatedAt;
    const rightValue = sorting.sortBy === 'annotationCount' ? right.annotationCount : right.updatedAt;
    return (leftValue - rightValue) * direction;
  });
  return sorted;
});

export const selectVisibleTasks = createSelector([selectSortedFilteredTasks], (tasks) => [...tasks]);

export const selectTasksPerStatus = createSelector([selectAllTasks], (tasks) => {
  const counts: Record<TaskStatus, number> = {
    todo: 0,
    in_progress: 0,
    qa: 0,
    done: 0,
    blocked: 0,
    unknown: 0,
  };

  tasks.forEach((task) => {
    counts[task.status] += 1;
  });

  return counts;
});

export const selectIsCachedOrStale = createSelector([selectTasksState], (state) => state.hydratedFromCache);
