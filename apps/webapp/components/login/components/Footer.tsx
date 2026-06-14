import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { FaDiscord } from 'react-icons/fa6';

import { useBaseCurrentDomain } from 'hooks/useBaseCurrentDomain';

import { Container } from './LoginLayout';

const Background = styled(Box)`
  background-color: ${({ theme }) => theme.palette.background.light};
`;

const LinkHeader = styled(Typography)`
  color: ${({ theme }) => theme.palette.secondary.dark};
  text-transform: uppercase;
  font-size: 1.3em;
  font-weight: bold;
  margin-bottom: 1em;
  border-top: 3px solid ${({ theme }) => theme.palette.divider};
  padding-top: 0.5em;
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.palette.secondary.main};
  display: block;
  &:hover {
    color: ${({ theme }) => theme.palette.secondary.dark};
  }
`;

const StyledIconButton = styled(IconButton)`
  color: ${({ theme }) => theme.palette.secondary.main};
  margin-right: ${({ theme }) => theme.spacing(1)};
  &:hover {
    color: ${({ theme }) => theme.palette.secondary.dark};
  }
` as typeof IconButton;

export default function Footer() {
  const { customDomain } = useBaseCurrentDomain();

  return (
    <Background mt={6} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
      {customDomain ? (
        <Box px={3} py={3} sx={{ float: 'right' }}>
          Powered by <Link href='https://zaoos.com'> The ZAO</Link>
        </Box>
      ) : customDomain === null ? (
        <Container pt={5} pb={9} px={3}>
          {/* Links mirror zao.config.ts platforms. TODO: confirm ZAO X/Telegram handles with Zaal. */}
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <LinkHeader>Links</LinkHeader>
              <StyledLink href='https://zaoos.com' target='_blank'>
                What is The ZAO?
              </StyledLink>
              <StyledLink href='https://warpcast.com/~/channel/zao' target='_blank'>
                Farcaster
              </StyledLink>
              <StyledLink href='https://luma.com/zao' target='_blank'>
                Events
              </StyledLink>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <LinkHeader>About</LinkHeader>
              <StyledLink href='https://zao.frapps.xyz/' target='_blank'>
                Governance (ORDAO)
              </StyledLink>
              <Typography variant='body2' color='secondary' sx={{ mt: 1 }}>
                <StyledLink href='https://github.com/bettercallzaal/zingfisher' target='_blank'>
                  View Source Code
                </StyledLink>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} alignItems='center'>
              <LinkHeader>Social</LinkHeader>
              <Box display='flex' alignItems='center' sx={{ justifyContent: { xs: 'center', sm: 'left' } }}>
                <StyledIconButton href='https://discord.thezao.com' target='_blank'>
                  <FaDiscord />
                </StyledIconButton>
              </Box>
            </Grid>
          </Grid>
        </Container>
      ) : null}
    </Background>
  );
}
