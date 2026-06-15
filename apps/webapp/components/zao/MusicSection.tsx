import { Box, Stack, Typography } from '@mui/material';
import { zaoPrimary } from '@packages/config/colors';
import { zaoMusic } from '@packages/config/zao';

import { Button } from 'components/common/Button';

/**
 * Music-first section. The ZAO's first principle is "music first" - surface it
 * up top and link out to where the music lives. Driven by @packages/config/zao.
 */
export function MusicSection() {
  return (
    <Box>
      <Typography variant='h4' sx={{ color: zaoPrimary, fontWeight: 700, mb: 1 }}>
        Music first
      </Typography>
      <Typography variant='subtitle1' sx={{ mb: 2 }}>
        {zaoMusic.principle}
      </Typography>
      <Stack direction='row' flexWrap='wrap' gap={1}>
        {zaoMusic.links.map((l) => (
          <Button key={l.name} external href={l.url} target='_blank' variant='outlined' color='secondary'>
            {l.name}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}
