import { Box, Card, Chip, Grid, Link, Stack, Typography } from '@mui/material';
import { zaoPrimary } from '@packages/config/colors';
import { zaoEcosystem } from '@packages/config/zao';

const STATUS_LABEL: Record<string, { label: string; color: 'success' | 'warning' | 'default' }> = {
  live: { label: 'Live', color: 'success' },
  rnd: { label: 'R&D', color: 'warning' },
  paused: { label: 'Paused', color: 'default' }
};

/**
 * The ZAO ecosystem map - products across the estate with live/R&D/paused
 * status. Content from research doc 004. The learning center as the hub.
 */
export function EcosystemSection() {
  return (
    <Box>
      <Typography variant='h4' sx={{ color: zaoPrimary, fontWeight: 700, mb: 2 }}>
        The ecosystem
      </Typography>
      <Grid container spacing={2}>
        {zaoEcosystem.map((p) => {
          const status = STATUS_LABEL[p.status] ?? STATUS_LABEL.rnd;
          return (
            <Grid key={p.name} size={{ xs: 12, sm: 6 }}>
              <Card variant='outlined' sx={{ p: 2, height: '100%' }}>
                <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 0.5 }}>
                  <Typography variant='subtitle1' sx={{ color: zaoPrimary, fontWeight: 600 }}>
                    {p.url ? (
                      <Link href={p.url} target='_blank' rel='noopener' sx={{ color: 'inherit' }}>
                        {p.name}
                      </Link>
                    ) : (
                      p.name
                    )}
                  </Typography>
                  <Chip size='small' variant='outlined' label={status.label} color={status.color} />
                </Stack>
                <Typography variant='body2'>{p.blurb}</Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
