import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { getLayout as getBaseLayout } from "components/common/BaseLayout/getLayout";
import { MemberProfileView } from "components/zao/MemberProfileView";
import { useZidProfile } from "charmClient/hooks/zao";
import { useUser } from "hooks/useUser";

export default function MemberIndexPage() {
  const { user } = useUser();
  const connectedAddress = user?.wallets?.[0]?.address || null;

  // Fallback to Zaal ZID-000 if no wallet is connected
  const targetIdentifier = connectedAddress || "0x7234c36a71ec237c2ae7698e8916e0735001e9af";
  const { data: profile, isLoading, error } = useZidProfile(targetIdentifier);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", px: 2, py: 6 }}>
        <Alert severity="warning">
          Could not load member profile. Please verify your connection or search for a valid ZID.
        </Alert>
      </Box>
    );
  }

  return <MemberProfileView profile={profile} />;
}

MemberIndexPage.getLayout = getBaseLayout;
