import { useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { incrementAnnotationCount, mergeTaskUpdate, setConnectionStatus } from '@/features/tasks/tasksSlice';
import { isRecord, normalizeAssignee, normalizeStatus, normalizeUpdatedAt } from '@/features/tasks/normalize';

export function useTaskFeed() {
  const dispatch = useAppDispatch();
  const connectionStatus = useAppSelector((state) => state.tasks.connectionStatus);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const retryRef = useRef(0);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000/ws';
    let shouldReconnect = true;

    const connect = () => {
      if (socketRef.current && socketRef.current.readyState <= WebSocket.OPEN) return;

      const socket = new WebSocket(url);
      socketRef.current = socket;
      dispatch(setConnectionStatus(retryRef.current > 0 ? 'reconnecting' : 'connecting'));

      socket.onopen = () => {
        retryRef.current = 0;
        dispatch(setConnectionStatus('open'));
      };

      socket.onmessage = (event) => {
        try {
          const parsed: unknown = JSON.parse(String(event.data));
          if (!isRecord(parsed) || typeof parsed.type !== 'string' || !isRecord(parsed.payload)) return;
          const eventType = parsed.type;
          const payload = parsed.payload;

          if (eventType === 'task.updated') {
            const id = typeof payload.id === 'string' ? payload.id : null;
            const updatedAt = payload.updatedAt === undefined ? undefined : normalizeUpdatedAt(payload.updatedAt);
            const status = payload.status === undefined ? undefined : normalizeStatus(payload.status);
            if (id) dispatch(mergeTaskUpdate({ id, status, updatedAt }));
          }

          if (eventType === 'task.assigned') {
            const id = typeof payload.id === 'string' ? payload.id : null;
            if (id) dispatch(mergeTaskUpdate({ id, assignee: normalizeAssignee(payload.assignee) }));
          }

          if (eventType === 'annotation.created') {
            const taskId = typeof payload.taskId === 'string' ? payload.taskId : null;
            if (taskId) dispatch(incrementAnnotationCount(taskId));
          }
        } catch {
          dispatch(setConnectionStatus('error'));
        }
      };

      socket.onerror = () => {
        dispatch(setConnectionStatus('error'));
      };

      socket.onclose = () => {
        if (socketRef.current === socket) socketRef.current = null;
        if (!shouldReconnect) {
          dispatch(setConnectionStatus('closed'));
          return;
        }
        dispatch(setConnectionStatus('reconnecting'));
        const timeout = Math.min(1000 * 2 ** retryRef.current, 10000);
        retryRef.current += 1;
        reconnectTimerRef.current = window.setTimeout(connect, timeout);
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      if (reconnectTimerRef.current !== null) window.clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [dispatch]);

  return useMemo(() => ({ connectionStatus }), [connectionStatus]);
}
