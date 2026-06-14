import { Box, Typography } from '@mui/material';
import { useCurrentSpace } from 'hooks/useCurrentSpace';
import { useIsAdmin } from 'hooks/useIsAdmin';

export function KycStepSettings({ readOnly }: { readOnly?: boolean }) {
 const { space } = useCurrentSpace();
 const isAdmin = useIsAdmin();

 if (!isAdmin || readOnly) {
 return null;
 }

 return (
 <Box>
 <Typography variant='body2' color='text.secondary'>
 KYC verification is not configured.
 </Typography>
 </Box>
 );
}
