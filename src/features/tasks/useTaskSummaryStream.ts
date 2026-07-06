import { useEffect, useState } from 'react';
import type { NormalizedTask } from '@/features/tasks/types';

export function useTaskSummaryStream(task: NormalizedTask | null) {
  const [content, setContent] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'streaming' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (!task) {
      setContent('');
      setState('idle');
      return;
    }

    const controller = new AbortController();
    setContent('');
    setState('loading');

    const readStream = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';
        const response = await fetch(`${apiBase}/api/tasks/${task.id}/summary`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to load summary');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No stream available');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        setState('streaming');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';
          for (const part of parts) {
            if (part.startsWith('data:')) {
              setContent((previous) => `${previous}${part.replace('data:', '').trim()} `);
            }
          }
        }

        setState('done');
      } catch {
        setState('error');
      }
    };

    void readStream();

    return () => controller.abort();
  }, [task]);

  return { content, state };
}
