import { prisma } from './prisma.js';
import { daysUntilDeadline, DEADLINE_REMINDER_MILESTONES } from './deadline.js';
import { sendDeadlineReminderEmail } from './email.js';

const MILESTONE_FIELD = {
  90: 'deadlineReminder90SentAt',
  60: 'deadlineReminder60SentAt',
  30: 'deadlineReminder30SentAt',
} as const;

export async function checkAndSendDeadlineReminders(): Promise<void> {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null, deceasedDate: { not: null } },
    include: {
      members: { select: { email: true } },
      invitations: { where: { status: 'PENDING' }, select: { invitedEmail: true } },
    },
  });

  for (const project of projects) {
    if (!project.deceasedDate) continue;
    const days = daysUntilDeadline(project.deceasedDate);
    const milestone = DEADLINE_REMINDER_MILESTONES.find((m) => m === days);
    if (milestone === undefined) continue;

    const field = MILESTONE_FIELD[milestone];
    if (project[field]) continue;

    const recipients = new Set<string>();
    for (const member of project.members) recipients.add(member.email);
    for (const invitation of project.invitations) recipients.add(invitation.invitedEmail);

    for (const email of recipients) {
      await sendDeadlineReminderEmail(email, project.deceasedName, milestone);
    }

    await prisma.project.update({
      where: { id: project.id },
      data: { [field]: new Date() },
    });
  }
}
