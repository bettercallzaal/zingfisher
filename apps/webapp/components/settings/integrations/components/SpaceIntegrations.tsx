import type { Space } from '@charmverse/core/prisma-client';
import { Stack, Typography } from '@mui/material';

export function SpaceIntegrations({ space }: { space: Space }) {
 return (
 <Stack gap={2} mt={2}>
 <Typography variant="body2" color="text.secondary">
 No integrations configured.
 </Typography>
 </Stack>
 );
}
