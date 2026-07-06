import type { TaskStatus } from '@/features/tasks/types';

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const classes: Record<TaskStatus, string> = {
    todo: 'border-slate-600 bg-slate-800 text-slate-200',
    in_progress: 'border-sky-700 bg-sky-950 text-sky-200',
    qa: 'border-amber-700 bg-amber-950 text-amber-200',
    done: 'border-emerald-700 bg-emerald-950 text-emerald-200',
    blocked: 'border-rose-700 bg-rose-950 text-rose-200',
    unknown: 'border-violet-700 bg-violet-950 text-violet-200',
  };

  return <span className={`rounded-full border px-2 py-1 text-xs uppercase ${classes[status]}`}>{status}</span>;
}
