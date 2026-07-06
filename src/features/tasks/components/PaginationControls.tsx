interface PaginationControlsProps {
  pagination: { page: number; pageSize: number; total: number };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PaginationControls({ pagination, onPageChange, onPageSizeChange }: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
      <div>Showing page {pagination.page} of {totalPages}</div>
      <div className="flex items-center gap-2">
        <button className="rounded border border-slate-700 px-3 py-1" onClick={() => onPageChange(Math.max(1, pagination.page - 1))}>Prev</button>
        <button className="rounded border border-slate-700 px-3 py-1" onClick={() => onPageChange(Math.min(totalPages, pagination.page + 1))}>Next</button>
        <select className="rounded border border-slate-700 bg-slate-950 px-2 py-1" value={pagination.pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
      </div>
    </div>
  );
}
