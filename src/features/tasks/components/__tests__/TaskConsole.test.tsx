import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '@/features/tasks/tasksSlice';
import { TaskConsole } from '@/features/tasks/components/TaskConsole';
import { normalizeTask } from '@/features/tasks/normalize';

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

jest.mock('rehype-sanitize', () => ({}));

jest.mock('@/features/tasks/useTaskFeed', () => ({
  useTaskFeed: () => ({ connectionStatus: 'open' }),
}));

jest.mock('@/features/tasks/tasksThunks', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    fetchTasksPage: createAsyncThunk('tasks/fetchTasksPage', async (_args, { getState }) => {
      const state = getState() as { tasks: { entities: Record<string, unknown> } };
      return { tasks: Object.values(state.tasks.entities), page: 1, pageSize: 10, total: Object.keys(state.tasks.entities).length };
    }),
    hydrateTasksFromCache: createAsyncThunk('tasks/hydrateTasksFromCache', async () => null),
  };
});

describe('TaskConsole', () => {
  it('filters visible rows when the user changes filters', async () => {
    const store = configureStore({
      reducer: { tasks: tasksReducer },
      preloadedState: {
        tasks: {
          ids: ['1', '2'],
          entities: {
            '1': normalizeTask({ id: '1', title: 'Alpha review', type: 'image', status: 'in_progress', updatedAt: 1000, annotationCount: 3, assignee: { id: 'u1', name: 'Ava' }, meta: {} }),
            '2': normalizeTask({ id: '2', title: 'Beta summary', type: 'text', status: 'done', updatedAt: 2000, annotationCount: 8, assignee: { id: 'u2', name: 'Ben' }, meta: {} }),
          },
          status: 'succeeded',
          error: null,
          page: 1,
          pageSize: 10,
          total: 2,
          hydratedFromCache: true,
          cacheUpdatedAt: null,
          lastFetchedAt: Date.now(),
          isRevalidating: false,
          selectedTaskId: '1',
          filters: { type: 'all', status: 'all', search: '' },
          sorting: { sortBy: 'updatedAt', sortDirection: 'desc' },
          liveEventCount: 0,
          pendingEventRefs: [],
          connectionStatus: 'open',
        },
      },
    });

    render(
      <Provider store={store}>
        <TaskConsole />
      </Provider>
    );

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText(/title/i);
    await user.type(searchInput, 'beta');

    expect(screen.getByText('Beta summary')).toBeInTheDocument();
  });
});
