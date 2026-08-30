import 'dotenv/config';
import { app } from './app.js';
import { sweepExpiredArchivedProjects } from './lib/archiveSweep.js';
import { purgeExpiredAuthEvents } from './lib/authEventPurge.js';
import { checkAndSendDeadlineReminders } from './lib/deadlineReminders.js';

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

sweepExpiredArchivedProjects().catch((err) => console.error('archiveSweep failed', err));
purgeExpiredAuthEvents().catch((err) => console.error('authEventPurge failed', err));
checkAndSendDeadlineReminders().catch((err) => console.error('deadlineReminders failed', err));
setInterval(() => {
  sweepExpiredArchivedProjects().catch((err) => console.error('archiveSweep failed', err));
  purgeExpiredAuthEvents().catch((err) => console.error('authEventPurge failed', err));
  checkAndSendDeadlineReminders().catch((err) => console.error('deadlineReminders failed', err));
}, 60 * 60 * 1000);
