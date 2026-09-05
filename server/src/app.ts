import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/projects.routes.js';
import invitationRoutes from './routes/invitations.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getAllowedOrigins } from './lib/clientOrigin.js';

export const app = express();

app.set('trust proxy', process.env.TRUST_PROXY === 'true');

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
// 12mb covers the largest payload this app sends: an 8MB document, which
// grows to ~10.7MB once base64-encoded for the JSON body.
app.use(express.json({ limit: '12mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use(errorHandler);
