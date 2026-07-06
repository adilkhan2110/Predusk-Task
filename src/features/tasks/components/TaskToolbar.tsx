import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFilters, setSorting } from '@/features/tasks/tasksSlice';
import { selectAllTasks } from '@/features/tasks/tasksSelectors';
import type { TaskFilters, TaskSorting, TaskStatus, TaskType } from '@/features/tasks/types';

interface TaskToolbarProps {
  filters: TaskFilters;
  sorting: TaskSorting;
  counts: Record<TaskStatus, number>;
}

export function TaskToolbar({ filters, sorting, counts }: TaskToolbarProps) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectAllTasks);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Task queue</h2>
        <div className="text-sm text-slate-400">{tasks.length} loaded</div>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <label className="text-sm text-slate-300">
          <span className="mb-1 block">Type</span>
          <select className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-2" value={filters.type} onChange={(event) => dispatch(setFilters({ type: event.target.value as TaskType | 'all' }))}>
            <option value="all">All</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="text">Text</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-1 block">Status</span>
          <select className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-2" value={filters.status} onChange={(event) => dispatch(setFilters({ status: event.target.value as TaskStatus | 'all' }))}>
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In progress</option>
            <option value="qa">QA</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-1 block">Search</span>
          <input className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-2" value={filters.search} onChange={(event) => dispatch(setFilters({ search: event.target.value }))} placeholder="Title / ID / assignee" />
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-1 block">Sort</span>
          <select className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-2" value={sorting.sortBy} onChange={(event) => dispatch(setSorting({ sortBy: event.target.value === 'annotationCount' ? 'annotationCount' : 'updatedAt', sortDirection: 'desc' }))}>
            <option value="updatedAt">Updated</option>
            <option value="annotationCount">Annotation count</option>
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
        {Object.entries(counts).map(([status, count]) => (
          <span key={status} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1">
            {status}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}
