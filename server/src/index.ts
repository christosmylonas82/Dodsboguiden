import 'dotenv/config';
import { app } from './app.js';
import { sweepExpiredArchivedProjects } from './lib/archiveSweep.js';

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

sweepExpiredArchivedProjects().catch((err) => console.error('archiveSweep failed', err));
setInterval(() => {
  sweepExpiredArchivedProjects().catch((err) => console.error('archiveSweep failed', err));
}, 60 * 60 * 1000);
