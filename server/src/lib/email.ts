// No real email provider is wired up yet (no Resend/SendGrid account configured).
// This stub logs the message server-side; callers that need the admin to actually
// deliver it should surface the link/content in the API response too.
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  console.log(`[email stub] Password reset for ${email}: ${resetLink}`);
  return true;
}
