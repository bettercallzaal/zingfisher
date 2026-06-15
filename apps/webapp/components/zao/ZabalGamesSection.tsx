import { Box, Grid, Stack, Typography } from '@mui/material';
import { zaoPrimary } from '@packages/config/colors';
import { zabalGames } from '@packages/config/zao';

import { Button } from 'components/common/Button';

/**
 * ZABAL Games section - the open builder program. Renders the three entry
 * tracks, the season arc, and the workshop booking CTA. Pure presentation,
 * driven by @packages/config/zao. Ungated (anyone can join).
 */
export function ZabalGamesSection() {
  return (
    <Box>
      <Typography variant='h4' sx={{ color: zaoPrimary, fontWeight: 700 }}>
        ZABAL Games
      </Typography>
      <Typography variant='subtitle1' sx={{ mb: 3 }}>
        {zabalGames.tagline}
      </Typography>

      <Typography variant='h6' sx={{ mb: 1 }}>
        Pick your track
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {zabalGames.tracks.map((track) => (
          <Grid key={track.id} size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant='subtitle1' sx={{ color: zaoPrimary, fontWeight: 600 }}>
                {track.name}
              </Typography>
              <Typography variant='body2'>{track.description}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Typography variant='h6' sx={{ mb: 1 }}>
        The season
      </Typography>
      <Stack spacing={1} sx={{ mb: 4 }}>
        {zabalGames.season.map((s) => (
          <Box key={s.month} sx={{ display: 'flex', gap: 1 }}>
            <Typography variant='body2' sx={{ color: zaoPrimary, fontWeight: 600, minWidth: 64 }}>
              {s.month}
            </Typography>
            <Typography variant='body2'>
              <strong>{s.phase}.</strong> {s.detail}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button external href={zabalGames.bookingUrl} target='_blank'>
          Book a workshop slot
        </Button>
        <Button external color='secondary' variant='outlined' href={zabalGames.portalUrl} target='_blank'>
          Workshop portal
        </Button>
      </Stack>
    </Box>
  );
}
