import type { NormalizedTask, TaskAssignee, TaskStatus, TaskType } from '@/features/tasks/types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function normalizeStatus(value: unknown): TaskStatus {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'in_progress' || normalized === 'inprogress') return 'in_progress';
    if (normalized === 'qa' || normalized === 'quality_assurance') return 'qa';
    if (normalized === 'done' || normalized === 'complete') return 'done';
    if (normalized === 'todo' || normalized === 'to_do') return 'todo';
    if (normalized === 'blocked' || normalized === 'block') return 'blocked';
    if (normalized === 'unknown') return 'unknown';
  }
  return 'unknown';
}

export function normalizeTaskType(value: unknown): TaskType {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'image') return 'image';
    if (normalized === 'audio') return 'audio';
    if (normalized === 'text') return 'text';
  }
  return 'unknown';
}

export function normalizeAssignee(value: unknown): TaskAssignee | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const name = asString(value.name);
  if (!id || !name) return null;
  return { id, name };
}

export function normalizeUpdatedAt(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
}

function normalizeMeta(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : { rawValue: value };
}

export function normalizeTask(input: unknown): NormalizedTask {
  const record = isRecord(input) ? input : { id: `task-${Date.now()}`, title: 'Untitled task' };
  const id = asString(record.id) ?? `task-${Date.now()}`;
  const title = asString(record.title) ?? 'Untitled task';
  const description = asString(record.description) ?? undefined;
  const rawType = asString(record.type) ?? undefined;
  const type = normalizeTaskType(record.type);
  const rawStatus = asString(record.status) ?? undefined;
  const status = normalizeStatus(record.status);
  const updatedAt = normalizeUpdatedAt(record.updatedAt);
  const annotationCount = asNumber(record.annotationCount) ?? 0;
  const assignee = normalizeAssignee(record.assignee);
  const meta = normalizeMeta(record.meta);

  const base = {
    id,
    title,
    description,
    type,
    status,
    updatedAt,
    annotationCount,
    assignee,
    meta,
    rawType,
    rawStatus,
  };

  switch (type) {
    case 'audio':
      return { ...base, type: 'audio' };
    case 'image':
      return { ...base, type: 'image' };
    case 'text':
      return { ...base, type: 'text' };
    default:
      return { ...base, type: 'unknown' };
  }
}

export function normalizeTasksResponse(input: unknown): { tasks: NormalizedTask[]; page: number; pageSize: number; total: number } {
  const record = isRecord(input) ? input : { tasks: [], page: 1, pageSize: 10, total: 0 };
  const tasks = Array.isArray(record.tasks) ? record.tasks.map((task) => normalizeTask(task)) : [];
  const page = asNumber(record.page) ?? 1;
  const pageSize = asNumber(record.pageSize) ?? 10;
  const total = asNumber(record.total) ?? tasks.length;
  return { tasks, page, pageSize, total };
}
