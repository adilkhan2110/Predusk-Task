interface ConnectionBadgeProps {
  status: 'connecting' | 'open' | 'closed' | 'error' | 'reconnecting';
}

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const classes = {
    connecting: 'border-amber-700 bg-amber-950 text-amber-200',
    open: 'border-emerald-700 bg-emerald-950 text-emerald-200',
    closed: 'border-slate-700 bg-slate-950 text-slate-300',
    error: 'border-rose-700 bg-rose-950 text-rose-200',
    reconnecting: 'border-sky-700 bg-sky-950 text-sky-200',
  }[status];

  return <span className={`rounded-full border px-3 py-1 text-sm font-medium ${classes}`}>{status}</span>;
}
