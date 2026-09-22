import { Box, CircularProgress, Typography, Alert, Button } from "@mui/material";
import { getLayout as getBaseLayout } from "components/common/BaseLayout/getLayout";
import { MemberProfileView } from "components/zao/MemberProfileView";
import { useZidProfile } from "charmClient/hooks/zao";
import { useRouter } from "next/router";

export default function MemberProfileDynamicPage() {
  const router = useRouter();
  const zid = router.query.zid as string | undefined;

  const { data: profile, isLoading, error } = useZidProfile(zid);

  if (isLoading || !router.isReady) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", px: 2, py: 8, textAlign: "center" }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Member profile not found for identifier: <strong>{zid}</strong>
        </Alert>
        <Button variant="outlined" onClick={() => router.push("/member")}>
          Return to Member Index
        </Button>
      </Box>
    );
  }

  return <MemberProfileView profile={profile} />;
}

MemberProfileDynamicPage.getLayout = getBaseLayout;
