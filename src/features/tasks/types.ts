export type TaskType = 'image' | 'audio' | 'text' | 'unknown';

export type TaskStatus = 'todo' | 'in_progress' | 'qa' | 'done' | 'blocked' | 'unknown';

export interface TaskAssignee {
  id: string;
  name: string;
}

export interface BaseTask {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  updatedAt: number;
  annotationCount: number;
  assignee: TaskAssignee | null;
  meta: Record<string, unknown>;
  rawType?: string;
  rawStatus?: string;
}

export interface ImageTask extends BaseTask {
  type: 'image';
}

export interface AudioTask extends BaseTask {
  type: 'audio';
}

export interface TextTask extends BaseTask {
  type: 'text';
}

export interface UnknownTask extends BaseTask {
  type: 'unknown';
  rawType?: string;
}

export type NormalizedTask = ImageTask | AudioTask | TextTask | UnknownTask;

export type TaskSortField = 'updatedAt' | 'annotationCount';
export type TaskSortDirection = 'asc' | 'desc';
export type TaskFilterType = TaskType | 'all';
export type TaskFilterStatus = TaskStatus | 'all';

export interface TasksResponse {
  tasks: NormalizedTask[];
  page: number;
  pageSize: number;
  total: number;
}

export interface TaskFilters {
  type: TaskFilterType;
  status: TaskFilterStatus;
  search: string;
}

export interface TaskSorting {
  sortBy: TaskSortField;
  sortDirection: TaskSortDirection;
}

export interface TaskFeedEvent {
  type: 'task.updated' | 'task.assigned' | 'annotation.created';
  payload: Record<string, unknown>;
}
