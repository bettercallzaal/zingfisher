import NavigateNextIcon from "@mui/icons-material/ArrowRightAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { zaoPrimary } from "@packages/config/colors";
import { zaoMission, zidConfig } from "@packages/config/zao";
import type { ZidProfile } from "@packages/lib/zao/zid";
import { validateDeclaredGoals, validateHandle } from "@packages/lib/zao/zid";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { registerZidProfile, useZidProfile } from "charmClient/hooks/zao";
import { getLayout as getBaseLayout } from "components/common/BaseLayout/getLayout";
import { Button } from "components/common/Button";
import { useCharmRouter } from "hooks/useCharmRouter";
import { useUser } from "hooks/useUser";

function Container({ children }: { children: ReactNode }) {
  return <Box sx={{ width: 760, maxWidth: "100%", mx: "auto", px: 2, py: 5 }}>{children}</Box>;
}

/**
 * ZAO Onboarding & Universal Join Flow (Phase 1).
 *
 * Protocol requirements decided 2026-09-22:
 * - Creator economy mission (Item 23).
 * - Instant ZID assignment upon onboarding (Item 12, 31; Decision 2026-09-01: 501+).
 * - Knowable community: pseudonyms allowed with peer voucher (Item 29).
 * - Mandatory declared creative goals and vision statement (Item 30).
 * - Zero-Respect members granted read and comment capabilities (Item 14).
 */
export default function JoinPage() {
  const { router } = useCharmRouter();
  const { user } = useUser();

  const connectedWallet = user?.wallets?.[0]?.address || "";

  const [address, setAddress] = useState(connectedWallet);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [goalsAndVision, setGoalsAndVision] = useState("");
  const [farcasterHandle, setFarcasterHandle] = useState("");
  const [voucherName, setVoucherName] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<ZidProfile | null>(null);

  // Sync connected wallet from user hook if available
  useEffect(() => {
    if (connectedWallet && !address) {
      setAddress(connectedWallet);
    }
  }, [connectedWallet]);

  // Check if current address already has a registered ZID
  const { data: existingProfile } = useZidProfile(address && /^0x[a-fA-F0-9]{40}$/.test(address) ? address : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setErrorMsg("Please enter a valid 0x Ethereum wallet address");
      return;
    }

    const handleCheck = validateHandle(handle);
    if (!handleCheck.valid) {
      setErrorMsg(handleCheck.reason || "Invalid handle");
      return;
    }

    const goalsCheck = validateDeclaredGoals(goalsAndVision);
    if (!goalsCheck.valid) {
      setErrorMsg(goalsCheck.reason || "Declared creative goals and vision required");
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await registerZidProfile({
        address: address.trim(),
        displayName: displayName.trim() || handle.trim(),
        handle: handle.trim(),
        goalsAndVision: goalsAndVision.trim(),
        farcasterHandle: farcasterHandle.trim(),
        voucherName: voucherName.trim() || undefined
      });
      setCreatedProfile(profile);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdProfile) {
    return (
      <Container>
        <Card variant="outlined" sx={{ p: 4, textAlign: "center", borderColor: zaoPrimary }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: zaoPrimary, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: zaoPrimary, mb: 1 }}>
            Welcome to The ZAO
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Your permanent ZID is claimed: <strong>{createdProfile.formattedZid}</strong>
          </Typography>

          <Box sx={{ p: 2.5, bgcolor: "background.paper", borderRadius: 1, mb: 4, textAlign: "left" }}>
            <Typography variant="subtitle2" color="text.secondary">Member Identity</Typography>
            <Typography variant="body1"><strong>Display Name:</strong> {createdProfile.displayName}</Typography>
            <Typography variant="body1"><strong>Handle:</strong> @{createdProfile.handle}</Typography>
            <Typography variant="body1"><strong>Wallet:</strong> {createdProfile.address}</Typography>
            <Typography variant="body1"><strong>Voucher Standing:</strong> {createdProfile.voucher.status}</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" color="text.secondary">Declared Goals & Vision (Protocol Item 30)</Typography>
            <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }}>
              "{createdProfile.goalsAndVision}"
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => router.push(`/member/${createdProfile.zid}`)}
              endIcon={<NavigateNextIcon />}
            >
              View Member Profile
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => router.push("/learn")}
            >
              Explore Learning Center
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      {/* Hero Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: zaoPrimary, mb: 1.5 }}>
          Join The ZAO
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "text.primary", maxWidth: 620, mx: "auto", mb: 1 }}>
          {zaoMission.statement}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Constitutional Mission Statement: {zaoMission.quoteBy}
        </Typography>
      </Box>

      {/* Existing Member Alert */}
      {existingProfile && existingProfile.zid >= 0 && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<VerifiedUserIcon />}>
          Wallet <strong>{existingProfile.address}</strong> is already registered as <strong>{existingProfile.formattedZid}</strong> ({existingProfile.displayName}).
          {" "}
          <Button
            size="small"
            variant="text"
            onClick={() => router.push(`/member/${existingProfile.zid}`)}
          >
            View Profile
          </Button>
        </Alert>
      )}

      {/* Protocol Requirements Info Card */}
      <Card variant="outlined" sx={{ p: 3, mb: 4, bgcolor: "background.paper" }}>
        <Typography variant="h6" sx={{ color: zaoPrimary, mb: 1, fontWeight: 600 }}>
          The ZID Onboarding Protocol
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          The ZAO is a knowable community of artists, builders, and listeners. When you join:
        </Typography>
        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Chip size="small" label="Item 31" color="primary" variant="outlined" />
            <Typography variant="body2">
              <strong>Instant Permanent ZID:</strong> Claim your unique identifier starting at ZID-{zidConfig.newMemberStart}+ (allocations 0-500 reserved for founding and early members).
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Chip size="small" label="Item 30" color="primary" variant="outlined" />
            <Typography variant="body2">
              <strong>Stated Goals & Vision:</strong> Declare what you are building and where you want to go so peers can align with your creative work.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Chip size="small" label="Item 29" color="primary" variant="outlined" />
            <Typography variant="body2">
              <strong>Knowable Community:</strong> Pseudonyms and handles are welcomed, anchored by peer vouchers or consensus fractals.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Chip size="small" label="Item 14" color="primary" variant="outlined" />
            <Typography variant="body2">
              <strong>Zero-Respect Access:</strong> New members immediately receive full read and comment capabilities across all community spaces.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Join Form */}
      <Card variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Claim Your ZID
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMsg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <TextField
              label="Wallet Address (0x...)"
              required
              fullWidth
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              helperText="Your Optimism/Base address where Respect awards and credentials will settle"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Display Name"
                  required
                  fullWidth
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maya Lin or WavyProducer"
                  helperText="Your public name or pseudonym"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Handle"
                  required
                  fullWidth
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. wavybeats"
                  helperText="Alphanumeric identifier (2-32 chars)"
                />
              </Grid>
            </Grid>

            <TextField
              label="Stated Creative Goals & Vision (Protocol Item 30)"
              required
              fullWidth
              multiline
              rows={4}
              value={goalsAndVision}
              onChange={(e) => setGoalsAndVision(e.target.value)}
              placeholder="Describe what you create, your creative vision, and what you aim to build or contribute to The ZAO movement..."
              helperText="Mandatory per constitutional protocol item 30 so peers can understand and collaborate"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Farcaster Handle (Optional)"
                  fullWidth
                  value={farcasterHandle}
                  onChange={(e) => setFarcasterHandle(e.target.value)}
                  placeholder="e.g. zaal"
                  helperText="ZAO is Farcaster-native (/zao channel)"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Peer Voucher / Invited By (Optional)"
                  fullWidth
                  value={voucherName}
                  onChange={(e) => setVoucherName(e.target.value)}
                  placeholder="e.g. Zaal or member ZID"
                  helperText="Peer who invited or vouches for you (Item 29)"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ py: 1.5, fontSize: "1rem", fontWeight: 700 }}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? "Allocating Permanent ZID..." : "Submit & Claim Permanent ZID"}
            </Button>
          </Stack>
        </Box>
      </Card>
    </Container>
  );
}

JoinPage.getLayout = getBaseLayout;
