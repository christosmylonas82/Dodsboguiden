import { TASK_STATUS_LABELS } from './taskStatus';
import type { TaskStatus } from './types';

export function formatActivityAction(action: string): string {
  if (action === 'project_created') return 'skapade dödsboet';
  if (action === 'accepted invite') return 'accepterade inbjudan';
  if (action.startsWith('invited ')) return `bjöd in ${action.slice('invited '.length)}`;
  if (action.startsWith('removed member ')) return `tog bort medlem ${action.slice('removed member '.length)}`;
  if (action.startsWith('renamed the dödsbo to ')) {
    return `bytte namn på dödsboet till ${action.slice('renamed the dödsbo to '.length)}`;
  }
  if (action.startsWith('changed the dödsfallsdatum to ')) {
    return `ändrade dödsdatumet till ${action.slice('changed the dödsfallsdatum to '.length)}`;
  }
  if (action.startsWith('completed task ')) return `avklarade ${action.slice('completed task '.length)}`;
  if (action.startsWith('reopened task ')) return `återöppnade ${action.slice('reopened task '.length)}`;
  if (action.startsWith('added task ')) return `lade till ${action.slice('added task '.length)}`;
  if (action.startsWith('added contact ')) return `lade till kontakten ${action.slice('added contact '.length)}`;

  const statusMatch = action.match(/^changed status of (.+) to (PENDING|IN_PROGRESS|DONE|SKIPPED)$/);
  if (statusMatch) {
    const [, quotedTitle, status] = statusMatch;
    return `ändrade status för ${quotedTitle} till "${TASK_STATUS_LABELS[status as TaskStatus]}"`;
  }

  const assignedMatch = action.match(/^assigned (.+) to (.+)$/);
  if (assignedMatch) {
    const [, quotedTitle, name] = assignedMatch;
    return `tilldelade ${quotedTitle} till ${name}`;
  }

  if (action.startsWith('unassigned ')) {
    return `tog bort tilldelningen för ${action.slice('unassigned '.length)}`;
  }

  return action;
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just nu';
  if (minutes < 60) return `${minutes} min sedan`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} tim sedan`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} dag${days === 1 ? '' : 'ar'} sedan`;
  return formatTimestamp(iso);
}
