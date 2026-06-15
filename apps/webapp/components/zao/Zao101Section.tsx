import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import { zaoPrimary } from '@packages/config/colors';
import { zao101 } from '@packages/config/zao';

/**
 * ZAO 101 - the open intro track. What The ZAO is, the four pillars, the org
 * model, and how to join. Content from zao-101 (the canonical primer). Ungated.
 */
export function Zao101Section() {
  return (
    <Box>
      <Typography variant='h4' sx={{ color: zaoPrimary, fontWeight: 700 }}>
        ZAO 101
      </Typography>
      <Typography variant='subtitle1' sx={{ mb: 1 }}>
        {zao101.definition}
      </Typography>
      <Typography variant='body2' sx={{ fontStyle: 'italic', mb: 3 }}>
        {zao101.principle}
      </Typography>

      <Typography variant='h6' sx={{ mb: 1 }}>
        The four pillars
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {zao101.pillars.map((p, i) => (
          <Grid key={p.name} size={{ xs: 12, sm: 6 }}>
            <Card variant='outlined' sx={{ p: 2, height: '100%' }}>
              <Typography variant='subtitle1' sx={{ color: zaoPrimary, fontWeight: 600 }}>
                {`0${i + 1} ${p.name}`}
              </Typography>
              <Typography variant='body2'>{p.detail}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant='h6' sx={{ mb: 1 }}>
        How it all fits
      </Typography>
      <Stack spacing={1} sx={{ mb: 4 }}>
        {zao101.orgModel.map((m) => (
          <Box key={m.layer} sx={{ display: 'flex', gap: 1 }}>
            <Typography variant='body2' sx={{ color: zaoPrimary, fontWeight: 600, minWidth: 140 }}>
              {m.layer}
            </Typography>
            <Typography variant='body2'>{m.note}</Typography>
          </Box>
        ))}
      </Stack>

      <Typography variant='h6' sx={{ mb: 1 }}>
        How to join
      </Typography>
      <Stack spacing={1}>
        {zao101.joinSteps.map((s, i) => (
          <Box key={s.step} sx={{ display: 'flex', gap: 1 }}>
            <Typography variant='body2' sx={{ color: zaoPrimary, fontWeight: 600, minWidth: 28 }}>
              {i + 1}.
            </Typography>
            <Typography variant='body2'>
              <strong>{s.step}.</strong> {s.detail}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
