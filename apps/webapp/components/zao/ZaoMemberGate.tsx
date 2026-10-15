import { Box, Stack, Typography } from '@mui/material';
import { zaoPlatforms } from '@packages/config/zao';
import type { ReactNode } from 'react';

import { useZaoMembership } from 'charmClient/hooks/zao';
import { Button } from 'components/common/Button';
import LoadingComponent from 'components/common/LoadingComponent';
import { useUser } from 'hooks/useUser';
import { zaoRealSignInEnabled } from 'lib/zao/realSignIn';

/**
 * Gates member-only content behind ZAO membership: CharmVerse's own token gates
 * (Respect OG or ZOR on Optimism, defined in @packages/config/zao) evaluated by
 * /api/zao/membership. Renders children only for members. Non-members and
 * logged-out visitors get a join CTA. $ZABAL confers nothing (grill 2026-09-22
 * morning item 6).
 */
export function ZaoMemberGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { user } = useUser();
  const address = user?.wallets?.[0]?.address ?? null;
  const { data, isLoading } = useZaoMembership(address);

  if (address && isLoading) {
    return <LoadingComponent isLoading label='Checking ZAO membership' />;
  }

  if (data?.member) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  return (
    <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant='h6' sx={{ mb: 1 }}>
        ZAO members only
      </Typography>
      <Typography variant='body2' sx={{ mb: 2 }}>
        {address
          ? 'This track is open to ZAO members. Hold Respect (OG or ZOR, on Optimism) to unlock it.'
          : 'Connect a wallet that holds Respect (OG or ZOR, on Optimism) to unlock this track.'}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent='center'>
        {zaoRealSignInEnabled && !address && (
          <Button href={`/?returnUrl=${encodeURIComponent(currentPath())}`}>Sign in with your wallet</Button>
        )}
        <Button href='/member/join' variant={zaoRealSignInEnabled && !address ? 'outlined' : undefined}>
          Join The ZAO
        </Button>
        <Button external color='secondary' variant='outlined' href={zaoPlatforms.discord} target='_blank'>
          Ask in Discord
        </Button>
      </Stack>
    </Box>
  );
}

function currentPath() {
  return typeof window === 'undefined' ? '/learn' : `${window.location.pathname}${window.location.search}`;
}
