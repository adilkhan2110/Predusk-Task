import type { NormalizedTask } from '@/features/tasks/types';
import { StatusBadge } from '@/features/tasks/components/StatusBadge';

interface TaskTableProps {
  tasks: NormalizedTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export function TaskTable({ tasks, selectedTaskId, onSelectTask }: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            <th className="px-3 py-2">Task</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Annotations</th>
            <th className="px-3 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className={`cursor-pointer border-t border-slate-800 ${selectedTaskId === task.id ? 'bg-slate-800/70' : 'bg-slate-900/50'}`} onClick={() => onSelectTask(task.id)}>
              <td className="px-3 py-3">
                <div className="font-medium">{task.title}</div>
                <div className="text-xs text-slate-400">{task.id}</div>
              </td>
              <td className="px-3 py-3 uppercase">{task.type}</td>
              <td className="px-3 py-3"><StatusBadge status={task.status} /></td>
              <td className="px-3 py-3">{task.annotationCount}</td>
              <td className="px-3 py-3">{new Date(task.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
