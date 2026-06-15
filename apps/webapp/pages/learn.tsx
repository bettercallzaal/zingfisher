import { Box, Card, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { zaoPrimary } from '@packages/config/colors';
import { learningTracks, zaoPlatforms } from '@packages/config/zao';
import type { ReactNode } from 'react';

import { getLayout as getBaseLayout } from 'components/common/BaseLayout/getLayout';
import { Button } from 'components/common/Button';
import { EcosystemSection } from 'components/zao/EcosystemSection';
import { ZabalGamesSection } from 'components/zao/ZabalGamesSection';
import { Zao101Section } from 'components/zao/Zao101Section';
import { ZaoMemberGate } from 'components/zao/ZaoMemberGate';

function Container({ children }: { children: ReactNode }) {
  return <Box sx={{ width: 900, maxWidth: '100%', mx: 'auto', px: 2, py: 4 }}>{children}</Box>;
}

/**
 * ZAO Learning Center hub. Open tracks (ZABAL Games, ZAO 101) are visible to
 * anyone; member tracks (ZAO OS, Governance) sit behind the Respect/$ZABAL gate.
 */
export default function LearnPage() {
  return (
    <Container>
      <Typography variant='h3' sx={{ fontWeight: 700, color: zaoPrimary }}>
        ZAO Learning Center
      </Typography>
      <Typography variant='subtitle1' sx={{ mb: 4 }}>
        Learn to build, ship, and govern across The ZAO ecosystem.
      </Typography>

      <Typography variant='h5' sx={{ mb: 2 }}>
        Tracks
      </Typography>
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {learningTracks.map((track) => (
          <Grid key={track.id} size={{ xs: 12, sm: 6 }}>
            <Card variant='outlined' sx={{ p: 2, height: '100%' }}>
              <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Typography variant='h6' sx={{ color: zaoPrimary }}>
                  {track.name}
                </Typography>
                <Chip
                  size='small'
                  label={track.gated ? 'Members' : 'Open'}
                  color={track.gated ? 'default' : 'success'}
                  variant='outlined'
                />
              </Stack>
              <Typography variant='body2' sx={{ mt: 0.5 }}>
                {track.description}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 4 }} />
      <Zao101Section />

      <Divider sx={{ my: 4 }} />
      <ZabalGamesSection />

      <Divider sx={{ my: 4 }} />
      <Typography variant='h5' sx={{ mb: 2 }}>
        Members area
      </Typography>
      <ZaoMemberGate>
        <Card variant='outlined' sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ color: zaoPrimary }}>
            Welcome, ZAO member
          </Typography>
          <Typography variant='body2'>
            The ZAO OS and Governance tracks are unlocked. Dive into forking a community OS, the Respect Game, ORDAO,
            Hats, and fractals.
          </Typography>
        </Card>
      </ZaoMemberGate>

      <Divider sx={{ my: 4 }} />
      <EcosystemSection />

      <Divider sx={{ my: 4 }} />
      <Typography variant='h5' sx={{ mb: 2 }}>
        Across The ZAO
      </Typography>
      <Stack direction='row' flexWrap='wrap' gap={1}>
        <Button external variant='outlined' color='secondary' href={zaoPlatforms.zaoos} target='_blank'>
          ZAO OS
        </Button>
        <Button external variant='outlined' color='secondary' href={zaoPlatforms.nexus} target='_blank'>
          NEXUS
        </Button>
        <Button external variant='outlined' color='secondary' href={zaoPlatforms.discord} target='_blank'>
          Discord
        </Button>
        <Button external variant='outlined' color='secondary' href={zaoPlatforms.luma} target='_blank'>
          Events
        </Button>
        <Button external variant='outlined' color='secondary' href={zaoPlatforms.ordao} target='_blank'>
          Governance
        </Button>
        <Button external variant='outlined' color='secondary' href={zaoPlatforms.farcaster} target='_blank'>
          Farcaster
        </Button>
      </Stack>
    </Container>
  );
}

LearnPage.getLayout = getBaseLayout;
