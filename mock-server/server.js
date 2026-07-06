const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const port = 4000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const tasks = [
  { id: 'task-1', title: 'Review onboarding assets', type: 'image', status: 'InProgress', updatedAt: Date.now() - 1000 * 60 * 5, annotationCount: '4', assignee: { id: 'u1', name: 'Ava' }, meta: { source: 'studio' } },
  { id: 'task-2', title: 'QA transcript cleanup', type: 'audio', status: 'done', updatedAt: '2026-07-06T13:00:00.000Z', annotationCount: 6, assignee: null, meta: { source: 'ops' } },
  { id: 'task-3', title: 'Summarize support notes', type: 'video', status: 'QA', updatedAt: 1720000000000, annotationCount: 2, assignee: { id: 'u2', name: 'Mina' }, meta: { source: 'support' } },
  { id: 'task-4', title: 'Draft knowledge base article', type: 'text', status: 'todo', updatedAt: 1710000000000, annotationCount: 9, assignee: { id: 'u3', name: 'Leo' }, meta: { source: 'content' } },
  { id: 'task-5', title: 'Escalation review', type: 'unknown', status: 'BLOCKED', updatedAt: '2026-07-05T10:15:00.000Z', annotationCount: '1', assignee: null, meta: { source: 'ops', severity: 'high' } },
];

app.get('/api/tasks', (req, res) => {
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  const start = (page - 1) * pageSize;
  const paged = tasks.slice(start, start + pageSize);
  res.json({ tasks: paged, page, pageSize, total: tasks.length });
});

app.get('/api/tasks/:id/summary', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const chunks = [
    'data: # Summary\n\n',
    'data: This task is being reviewed with a live stream.\n',
    'data: - Status is being monitored\n',
    'data: - Recent annotations are visible\n',
    'data: - Unknown values are preserved safely\n',
  ];

  let index = 0;
  const interval = setInterval(() => {
    const chunk = chunks[index];
    if (!chunk) {
      clearInterval(interval);
      res.end();
      return;
    }
    res.write(chunk);
    index += 1;
  }, 150);

  req.on('close', () => clearInterval(interval));
});

const server = app.listen(port, () => {
  console.log(`Mock server listening on http://localhost:${port}`);
});

const wsServer = new WebSocketServer({ server, path: '/ws' });

wsServer.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'task.updated', payload: { id: 'task-1', status: 'done', updatedAt: Date.now() } }));
  setInterval(() => {
    socket.send(JSON.stringify({ type: 'annotation.created', payload: { taskId: 'task-1', by: 'AI', at: Date.now() } }));
  }, 4000);
});
