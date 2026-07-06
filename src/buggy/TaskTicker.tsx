import React, { useEffect, useMemo, useState } from 'react';

type Task = { id: string; title: string; updatedAt: number };

export function TaskTicker({ apiBase }: { apiBase: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    const controller = new AbortController();

    fetch(`${apiBase}/api/tasks/${selectedId}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load task ${selectedId}`);
        }
        return response.json() as Promise<Task>;
      })
      .then((task) => {
        setTasks((previous) => {
          const withoutDuplicate = previous.filter((item) => item.id !== task.id);
          return [...withoutDuplicate, task];
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error(error);
      });

    return () => controller.abort();
  }, [apiBase, selectedId]);

  const sorted = useMemo(
    () => [...tasks].sort((a, b) => b.updatedAt - a.updatedAt),
    [tasks, tick]
  );

  return (
    <ul>
      {sorted.map((task) => (
        <li key={task.id} onClick={() => setSelectedId(task.id)}>
          {task.title} (updated {Math.floor((Date.now() - task.updatedAt) / 1000)}s ago)
        </li>
      ))}
    </ul>
  );
}
