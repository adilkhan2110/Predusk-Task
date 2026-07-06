'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTasksPage, hydrateTasksFromCache } from '@/features/tasks/tasksThunks';
import { selectFilteredTasks, selectIsCachedOrStale, selectPagination, selectTaskById, selectTaskFilters, selectTasksPerStatus, selectVisibleTasks } from '@/features/tasks/tasksSelectors';
import { setPage, setPageSize, setSelectedTaskId } from '@/features/tasks/tasksSlice';
import { TaskToolbar } from '@/features/tasks/components/TaskToolbar';
import { TaskTable } from '@/features/tasks/components/TaskTable';
import { TaskDetailPanel } from '@/features/tasks/components/TaskDetailPanel';
import { ConnectionBadge } from '@/features/tasks/components/ConnectionBadge';
import { LoadingState } from '@/features/tasks/components/LoadingState';
import { ErrorState } from '@/features/tasks/components/ErrorState';
import { EmptyState } from '@/features/tasks/components/EmptyState';
import { useTaskFeed } from '@/features/tasks/useTaskFeed';
import { PaginationControls } from '@/features/tasks/components/PaginationControls';
import { SummaryPanel as SummaryPanelComponent } from '@/features/tasks/components/SummaryPanel';

export function TaskConsole() {
  const dispatch = useAppDispatch();
  const { connectionStatus } = useTaskFeed();
  const tasks = useAppSelector(selectVisibleTasks);
  const filteredTasks = useAppSelector(selectFilteredTasks);
  const pagination = useAppSelector(selectPagination);
  const filters = useAppSelector(selectTaskFilters);
  const sorting = useAppSelector((state) => state.tasks.sorting);
  const selectedTask = useAppSelector((state) => selectTaskById(state, state.tasks.selectedTaskId));
  const counts = useAppSelector(selectTasksPerStatus);
  const isStale = useAppSelector(selectIsCachedOrStale);
  const status = useAppSelector((state) => state.tasks.status);
  const error = useAppSelector((state) => state.tasks.error);
  const liveEventCount = useAppSelector((state) => state.tasks.liveEventCount);

  useEffect(() => {
    void dispatch(hydrateTasksFromCache());
    void dispatch(fetchTasksPage({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  const handleSelectTask = (taskId: string) => dispatch(setSelectedTaskId(taskId));
  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
    void dispatch(fetchTasksPage({ page, pageSize: pagination.pageSize }));
  };
  const handlePageSizeChange = (pageSize: number) => {
    dispatch(setPageSize(pageSize));
    dispatch(setPage(1));
    void dispatch(fetchTasksPage({ page: 1, pageSize }));
  };

  const selectedTaskId = selectedTask?.id ?? null;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div>
            <h1 className="text-2xl font-semibold">Annotation Activity Console</h1>
            <p className="text-sm text-slate-400">Monitor, filter, and review task updates in real time.</p>
          </div>
          <ConnectionBadge status={connectionStatus} />
        </div>

        {isStale ? (
          <div className="rounded-lg border border-amber-700 bg-amber-950/70 p-3 text-sm text-amber-100">Showing cached data. Revalidating…</div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <TaskToolbar filters={filters} sorting={sorting} counts={counts} />
            {status === 'loading' && tasks.length === 0 ? <LoadingState /> : null}
            {status === 'failed' && error ? <ErrorState message={error} /> : null}
            {!error && status !== 'loading' && filteredTasks.length === 0 ? <EmptyState /> : null}
            {filteredTasks.length > 0 ? (
              <>
                <TaskTable tasks={tasks} selectedTaskId={selectedTaskId} onSelectTask={handleSelectTask} />
                <PaginationControls pagination={pagination} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
              </>
            ) : null}
          </div>
          <div className="space-y-4">
            <SummaryPanelComponent task={selectedTask} />
            <TaskDetailPanel task={selectedTask} liveEventCount={liveEventCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
