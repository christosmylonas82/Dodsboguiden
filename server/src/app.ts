import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/projects.routes.js';
import invitationRoutes from './routes/invitations.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import contactRoutes from './routes/contact.routes.js';
import reportRoutes from './routes/report.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getAllowedOrigins } from './lib/clientOrigin.js';

export const app = express();

// A boolean here would tell Express to trust the *entire* X-Forwarded-For
// chain and blindly use its leftmost entry as req.ip. Since that header is
// client-supplied, a request like `X-Forwarded-For: 1.2.3.4, <real-proxy-ip>`
// would let any client spoof req.ip and walk straight past the per-IP rate
// limiter in middleware/rateLimit.ts. Railway's edge sits exactly one hop in
// front of this app, so we trust exactly one hop — Express then takes the
// rightmost (proxy-appended) entry and ignores anything a client prepends.
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? (process.env.TRUST_PROXY === 'true' ? 1 : 0));
app.set('trust proxy', trustProxyHops);

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
app.use('/api/contact', contactRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/quiz', quizRoutes);

app.use(errorHandler);
