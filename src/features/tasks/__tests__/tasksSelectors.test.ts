import { selectFilteredTasks, selectSortedFilteredTasks, selectVisibleTasks } from '@/features/tasks/tasksSelectors';
import type { RootState } from '@/store/store';
import { normalizeTask } from '@/features/tasks/normalize';

describe('task selectors', () => {
  const state = {
    tasks: {
      entities: {
        '1': normalizeTask({ id: '1', title: 'Alpha review', type: 'image', status: 'in_progress', updatedAt: 1000, annotationCount: 3, assignee: { id: 'u1', name: 'Ava' }, meta: {} }),
        '2': normalizeTask({ id: '2', title: 'Beta summary', type: 'text', status: 'done', updatedAt: 2000, annotationCount: 8, assignee: { id: 'u2', name: 'Ben' }, meta: {} }),
      },
      filters: { type: 'all', status: 'all', search: '' },
      sorting: { sortBy: 'updatedAt' as const, sortDirection: 'desc' as const },
      page: 1,
      pageSize: 10,
      total: 2,
    },
  } as unknown as RootState;

  it('filters by status type and search', () => {
    const filtered = selectFilteredTasks({
      ...state,
      tasks: { ...state.tasks, filters: { type: 'all', status: 'all', search: 'alpha' } },
    } as RootState);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('sorts by annotation count and updatedAt', () => {
    const sorted = selectSortedFilteredTasks(state);
    expect(sorted[0].id).toBe('2');
  });

  it('paginates visible tasks', () => {
    const visible = selectVisibleTasks(state);
    expect(visible).toHaveLength(2);
  });
});
