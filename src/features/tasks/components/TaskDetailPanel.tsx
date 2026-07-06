import type { NormalizedTask } from '@/features/tasks/types';

interface TaskDetailPanelProps {
  task: NormalizedTask | null;
  liveEventCount: number;
}

export function TaskDetailPanel({ task, liveEventCount }: TaskDetailPanelProps) {
  if (!task) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-400">
        Select a task to inspect details.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Details</h3>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{liveEventCount} live events</span>
      </div>
      <dl className="mt-3 space-y-2 text-sm text-slate-300">
        <div><dt className="text-slate-400">Title</dt><dd>{task.title}</dd></div>
        <div><dt className="text-slate-400">ID</dt><dd>{task.id}</dd></div>
        <div><dt className="text-slate-400">Assignee</dt><dd>{task.assignee?.name ?? 'Unassigned'}</dd></div>
        <div><dt className="text-slate-400">Raw type</dt><dd>{task.rawType ?? 'n/a'}</dd></div>
        <div><dt className="text-slate-400">Raw status</dt><dd>{task.rawStatus ?? 'n/a'}</dd></div>
        <div><dt className="text-slate-400">Meta</dt><dd>{JSON.stringify(task.meta)}</dd></div>
      </dl>
    </div>
  );
}
