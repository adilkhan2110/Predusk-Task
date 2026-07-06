'use client';

import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import type { NormalizedTask } from '@/features/tasks/types';
import { useTaskSummaryStream } from '@/features/tasks/useTaskSummaryStream';

interface SummaryPanelProps {
  task: NormalizedTask | null;
}

export function SummaryPanel({ task }: SummaryPanelProps) {
  const { content, state } = useTaskSummaryStream(task);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI summary</h3>
        <span className="text-xs uppercase text-slate-400">{state}</span>
      </div>
      <div className="mt-3 rounded border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
        {!task ? (
          <span className="text-slate-500">Select a task to stream its summary.</span>
        ) : state === 'error' ? (
          <span className="text-rose-400">Summary stream failed.</span>
        ) : (
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{content || 'Streaming summary…'}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
