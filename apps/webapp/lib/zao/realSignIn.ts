/**
 * Switch for real wallet sign-in. The fork shipped with sign-in stubbed: every visitor got a
 * mock "Local Developer" user. With NEXT_PUBLIC_ZAO_REAL_SIGNIN=true the app uses CharmVerse's
 * own sign-in instead (wallet signature, then /api/session/login or /api/profile), which needs
 * a real database. Off by default, so main keeps today's behaviour until the switch is set.
 *
 * Read once at build time: Next inlines NEXT_PUBLIC_ values, so the choice of hooks below never
 * changes between renders.
 */
export function isZaoRealSignInEnabled(value: string | undefined = process.env.NEXT_PUBLIC_ZAO_REAL_SIGNIN) {
  return value === 'true';
}

export const zaoRealSignInEnabled = isZaoRealSignInEnabled();
