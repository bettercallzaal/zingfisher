import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from "@mui/icons-material/Event";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedIcon from "@mui/icons-material/Verified";
import {
  Alert,
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { zaoPrimary } from "@packages/config/colors";
import { zaoMission, zaoTenants, zidConfig } from "@packages/config/zao";
import type { ZidProfile } from "@packages/lib/zao/zid";
import { formatZid } from "@packages/lib/zao/zid";
import { useRouter } from "next/router";
import { useState } from "react";

export function MemberProfileView({ profile }: { profile: ZidProfile }) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) return;
    router.push(`/member/${clean}`);
  };

  const getVoucherChip = () => {
    switch (profile.voucher.status) {
      case "verified":
        return (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            label={`Vouched: ${profile.voucher.voucherName || "Consensus Circle"}`}
            color="success"
            variant="outlined"
            size="small"
          />
        );
      case "solo_circle":
        return (
          <Chip
            icon={<HelpOutlineIcon sx={{ fontSize: 16 }} />}
            label="Solo Circle (Question 7 open)"
            color="info"
            variant="outlined"
            size="small"
          />
        );
      case "pre_73_attendance":
        return (
          <Chip
            icon={<HelpOutlineIcon sx={{ fontSize: 16 }} />}
            label="Pre-73 Attendance (Question 6 open)"
            color="secondary"
            variant="outlined"
            size="small"
          />
        );
      case "unrecorded":
        return (
          <Chip
            label="Unrecorded Token Holder"
            color="warning"
            variant="outlined"
            size="small"
          />
        );
      case "pending_vouch":
      default:
        return (
          <Chip
            label="Pending Peer Voucher (Item 29)"
            color="default"
            variant="outlined"
            size="small"
          />
        );
    }
  };

  return (
    <Box sx={{ maxWidth: 1040, mx: "auto", px: 2, py: 4 }}>
      {/* Search Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: zaoPrimary }}>
            ZAO Member Profile
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            The ZID Identity & Governance Layer (Decisions 2026-09-22)
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSearch} sx={{ width: { xs: "100%", sm: 340 } }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search member by ZID or 0x address..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" type="submit">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Box>

      {/* Profile Header Banner */}
      <Card variant="outlined" sx={{ p: 3, mb: 4, bgcolor: "background.paper", borderColor: "divider" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "flex-start", sm: "center" }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: zaoPrimary,
              color: "#0a1628",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800
            }}
          >
            {profile.displayName.slice(0, 2).toUpperCase()}
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {profile.displayName}
              </Typography>
              <Chip
                label={profile.formattedZid}
                sx={{ bgcolor: zaoPrimary, color: "#0a1628", fontWeight: 700 }}
                size="small"
              />
              {getVoucherChip()}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              @{profile.handle} • Joined {new Date(profile.joinedAt).toLocaleDateString()}
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 14 }} />
                {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
                <Link
                  href={`https://optimism.blockscout.com/address/${profile.address}`}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ display: "flex", alignItems: "center", ml: 0.5 }}
                >
                  <OpenInNewIcon sx={{ fontSize: 12 }} />
                </Link>
              </Typography>
              {profile.socials.farcaster && (
                <Typography variant="caption">
                  Farcaster: @{profile.socials.farcaster}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </Card>

      {/* 4-Panel Layout strictly following Section 3 of Spec */}
      <Stack spacing={4}>
        {/* PANEL 1: MULTI-LEDGER RESPECT SEPARATION */}
        <Card variant="outlined" sx={{ p: 3, borderLeft: `5px solid ${zaoPrimary}` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: zaoPrimary, mb: 0.5 }}>
            Panel 1: Multi-Ledger Respect Separation
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2.5 }}>
            Parent ZAO governance weight is earned exclusively through parent ZAO fractals (Item 26). Festival standing is isolated (Item 24).
          </Typography>

          <Grid container spacing={2.5}>
            {/* Parent ZAO Governance Weight */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2.5, bgcolor: "background.default", borderRadius: 1.5, height: "100%", border: "1px solid", borderColor: "divider" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    The ZAO Parent Governance Weight
                  </Typography>
                  <Chip size="small" label="1:1 OG + ZOR" color="primary" variant="outlined" />
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 800, color: zaoPrimary, my: 1 }}>
                  {profile.ledgers.parentZao.governanceWeight}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  OG Respect: <strong>{profile.ledgers.parentZao.ogBalance}</strong> | ZOR Respect: <strong>{profile.ledgers.parentZao.zorBalance}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Drives voting power on CharmVerse proposals and OREC settlement. Equal 1:1 weighting decided 2026-09-22 (Zaal ruling Q1 & Q2).
                </Typography>
              </Box>
            </Grid>

            {/* ZAO Festivals Respect */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2.5, bgcolor: "background.default", borderRadius: 1.5, height: "100%", border: "1px solid", borderColor: "divider" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    ZAO Festivals Respect
                  </Typography>
                  <Chip size="small" label="Isolated Ledger" color="secondary" variant="outlined" />
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 800, color: "#9c27b0", my: 1 }}>
                  {profile.ledgers.zaoFestivals.respectBalance}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Festivals: ZAOstock (Oct 3, 2026), ZAO-CHELLA, ZAO-PALOOZA
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Distinct ledger reflecting festival contributions (Item 24, 28). Completely isolated from parent OREC voting power.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* PANEL 2: MEMBER STANDING & IDENTITY */}
        <Card variant="outlined" sx={{ p: 3, borderLeft: `5px solid #2196f3` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2196f3", mb: 0.5 }}>
            Panel 2: Member Standing & Identity (Protocol Items 29-31)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2.5 }}>
            Knowable community standards, declared creative goals, and verified peer vouchers.
          </Typography>

          <Stack spacing={2.5}>
            {/* Declared Creative Goals & Vision (Protocol Item 30) */}
            <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: zaoPrimary, mb: 0.5 }}>
                Declared Creative Goals & Vision (Item 30)
              </Typography>
              <Typography variant="body1" sx={{ fontStyle: "italic", mb: 1 }}>
                "{profile.goalsAndVision || "No declared goals statement on record."}"
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mandatory protocol requirement per Zaal: "identity your self and your goals and vision so that others can understand and allign with that together".
              </Typography>
            </Box>

            {/* Vouched Identity Standing */}
            <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Vouched Identity Standing (Item 29)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Status:</strong> {profile.voucher.status} • {profile.voucher.note || "Standard peer voucher"}
              </Typography>

              {profile.voucher.status === "solo_circle" && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <strong>Open Question 7:</strong> This member was consensus-ranked in a single-person circle in periods 73-107.
                  Awaiting Zaal ruling on solo circle consensus recognition.
                </Alert>
              )}

              {profile.voucher.status === "pre_73_attendance" && (
                <Alert severity="secondary" sx={{ mt: 1 }}>
                  <strong>Open Question 6:</strong> This member participated in recorded sessions during periods 1-72 (attendance only).
                  Awaiting Zaal ruling on grandfathering versus circle peer reconstruction.
                </Alert>
              )}

              {profile.voucher.status === "pending_vouch" && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <strong>Pending Peer Voucher:</strong> Per item 29, anon/pseudonymous members require a peer voucher or attendance in a weekly fractal circle.
                </Alert>
              )}
            </Box>

            {/* Organizational Hats */}
            <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Organizational Hats (Hats Protocol Tree 226)
              </Typography>
              {profile.hats.length > 0 ? (
                <Stack direction="row" spacing={1}>
                  {profile.hats.map((hatId) => (
                    <Chip key={hatId} label={`Hat #${hatId}`} size="small" color="primary" variant="outlined" />
                  ))}
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No active Tree 226 operational hats assigned.
                </Typography>
              )}
            </Box>
          </Stack>
        </Card>

        {/* PANEL 3: MULTI-FRACTAL CEREMONY HISTORY */}
        <Card variant="outlined" sx={{ p: 3, borderLeft: `5px solid #4caf50` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#4caf50", mb: 0.5 }}>
            Panel 3: Multi-Fractal Ceremony History (Automated Chain Mirror)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            Weekly ceremony attendance, consensus rankings (Rank 1-6), and Fibonacci awards (110, 68, 42, 26, 16, 10).
          </Typography>

          {profile.fractalHistory && profile.fractalHistory.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Rank Achieved</TableCell>
                    <TableCell>Respect Awarded</TableCell>
                    <TableCell>On-Chain Proof</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {profile.fractalHistory.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell>Period {h.period}</TableCell>
                      <TableCell>{h.tenant === "parent" ? "The ZAO" : "ZAO Festivals"}</TableCell>
                      <TableCell>{h.date}</TableCell>
                      <TableCell>Rank {h.rank ?? "Attended"}</TableCell>
                      <TableCell>+{h.respectAwarded} Respect</TableCell>
                      <TableCell>
                        {h.txHash ? (
                          <Link href={`https://optimism.blockscout.com/tx/${h.txHash}`} target="_blank" rel="noreferrer">
                            Blockscout <OpenInNewIcon sx={{ fontSize: 10 }} />
                          </Link>
                        ) : (
                          <Typography variant="caption" color="text.secondary">Settled</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 2, textAlign: "center", bgcolor: "background.default", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                No on-chain ceremony records mirrored for this address yet. Attend Monday fractals (6pm EST) to participate and earn consensus Respect.
              </Typography>
            </Box>
          )}
        </Card>

        {/* PANEL 4: GOVERNANCE & PROPOSALS FOOTPRINT */}
        <Card variant="outlined" sx={{ p: 3, borderLeft: `5px solid #ff9800` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#ff9800", mb: 0.5 }}>
            Panel 4: Governance & Proposals Footprint
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            Proposals authored, drafts endorsed, and ballots cast, partitioned by tenant.
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1, textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: zaoPrimary }}>
                  {profile.governance.authoredCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Proposals Authored (Gate: Any Respect)
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1, textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#2196f3" }}>
                  {profile.governance.endorsedCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Drafts Endorsed (Publish Gate: 1,000)
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1, textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                  {profile.governance.votesCast}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ballots Cast (1:1 OG + ZOR Weight)
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2.5, p: 1.5, bgcolor: "background.default", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Zero-Respect Capabilities (Item 14):</strong> Members with zero Respect can read and comment on all proposals.
              Drafting proposals is unlocked for any member with Respect &gt; 0 (Zaal ruling Q4).
              Publishing a draft to active community vote requires 1,000 peer Respect endorsements (Zaal ruling Q4).
            </Typography>
          </Box>
        </Card>
      </Stack>
    </Box>
  );
}
