import { normalizeStatus, normalizeTask, normalizeTaskType, normalizeTasksResponse } from '@/features/tasks/normalize';

describe('normalizeTask', () => {
  it('normalizes status casing and spelling', () => {
    expect(normalizeStatus('InProgress')).toBe('in_progress');
    expect(normalizeStatus('BLOCKED')).toBe('blocked');
    expect(normalizeStatus('QA')).toBe('qa');
  });

  it('converts unknown types to UnknownTask', () => {
    const task = normalizeTask({ id: '1', title: 'Unexpected', type: 'video' });
    expect(task.type).toBe('unknown');
    expect(task.rawType).toBe('video');
  });

  it('normalizes ISO and epoch timestamps', () => {
    const isoTask = normalizeTask({ id: 'iso', title: 'ISO', updatedAt: '2026-07-06T12:00:00.000Z' });
    const epochTask = normalizeTask({ id: 'epoch', title: 'Epoch', updatedAt: 1710000000000 });
    expect(isoTask.updatedAt).toBeGreaterThan(0);
    expect(epochTask.updatedAt).toBe(1710000000000);
  });

  it('normalizes string annotation counts and ignores bad values safely', () => {
    const task = normalizeTask({ id: '2', title: 'Count', annotationCount: '12' });
    expect(task.annotationCount).toBe(12);
    const fallback = normalizeTask({ id: '3', title: 'Bad', annotationCount: 'not-a-number' });
    expect(fallback.annotationCount).toBe(0);
  });
});

describe('normalizeTasksResponse', () => {
  it('returns a safe response object for malformed input', () => {
    const response = normalizeTasksResponse(undefined);
    expect(response.tasks).toEqual([]);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(10);
    expect(response.total).toBe(0);
  });
});
