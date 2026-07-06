'use client';

import { useEffect } from 'react';
import { TaskConsole } from '@/features/tasks/components/TaskConsole';
import { useAppDispatch } from '@/store/hooks';
import { hydrateTasksFromCache } from '@/features/tasks/tasksThunks';

export default function HomePage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(hydrateTasksFromCache());
  }, [dispatch]);

  return <TaskConsole />;
}
