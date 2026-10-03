import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/authContext";
import { supabase } from "../../lib/supabase";

// Import colors
const colors = {
  surfaceContainer: "#e5eeff",
  surfaceDim: "#cbdbf5",
  secondaryFixedDim: "#6bd8cb",
  primaryContainer: "#1a365d",
  secondary: "#006a61",
  onSecondaryContainer: "#006f66",
  secondaryContainer: "#86f2e4",
  surfaceBright: "#f8f9ff",
  surfaceContainerHighest: "#d3e4fe",
  primaryFixed: "#d6e3ff",
  inverseSurface: "#213145",
  inversePrimary: "#adc7f7",
  primaryFixedDim: "#adc7f7",
  onError: "#ffffff",
  onSecondary: "#ffffff",
  background: "#f8f9ff",
  onSurface: "#0b1c30",
  onBackground: "#0b1c30",
  outlineVariant: "#c4c6cf",
  onPrimaryContainer: "#86a0cd",
  tertiary: "#361900",
  surfaceTint: "#455f88",
  onTertiaryContainer: "#eb851c",
  surfaceContainerHigh: "#dce9ff",
  error: "#ba1a1a",
  surface: "#f8f9ff",
  tertiaryFixed: "#ffdcc3",
  onPrimaryFixedVariant: "#2d476f",
  outline: "#74777f",
  errorContainer: "#ffdad6",
  onPrimaryFixed: "#001b3c",
  onPrimary: "#ffffff",
  surfaceVariant: "#d3e4fe",
  surfaceContainerLow: "#eff4ff",
  tertiaryContainer: "#552b00",
  onSecondaryFixed: "#00201d",
  onTertiary: "#ffffff",
  onErrorContainer: "#93000a",
  primary: "#002045",
  tertiaryFixedDim: "#ffb77d",
  surfaceContainerLowest: "#ffffff",
  inverseOnSurface: "#eaf1ff",
  secondaryFixed: "#89f5e7",
  onSurfaceVariant: "#43474e",
  prm: "#1A56E8",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  name: string;
  nim: string;
  email: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <View style={styles.avatarWrapper}>
      <View style={styles.avatarRing} />
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarInitials}>{initials || "?"}</Text>
      </View>
    </View>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Text style={styles.infoIcon}>{icon}</Text>
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function Profile() {
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
   
  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert("Error", error.message);
            return;
          }
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    
    <SafeAreaView style={styles.safe}>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F6BFF" />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Hero card */}
          <View style={styles.heroCard}>
            <View style={styles.heroBg} />
            <Avatar name={profile?.name ?? ""} />
            
            {/* Info list */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Account Information</Text>
              <InfoRow label="Full Name" value={profile?.name ?? "—"} icon="👤" />
              <View style={styles.divider} />
              <InfoRow label="Student ID" value={profile?.nim ?? "—"} icon="🎓" />
              <View style={styles.divider} />
              <InfoRow label="Email" value={profile?.email ?? "—"} icon="✉️" />
            </View>

          </View>


          {/* QR Button */}
          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => setShowQR(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.qrButtonIcon}>▣</Text>
            <Text style={styles.qrButtonText}>
              Show QR Code
            </Text>
          </TouchableOpacity>


          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showQR}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQR(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModal}>

            {/* Close button */}
            {/* <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQR(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity> */}

            <Text style={styles.qrTitle}>
              Student Verification
            </Text>

            <Text style={styles.qrSubtitle}>
              Let the finder scan this QR code to verify
              your identity.
            </Text>

            {/* QR */}
            <View style={styles.qrContainer}>
              <QRCode
                value={`${profile?.nim}`}
                size={220}
                backgroundColor="white"
                color="black"
              />
            </View>

            <Text style={styles.qrName}>
              {profile?.name ?? "—"}
            </Text>

            <Text style={styles.qrNim}>
              {profile?.nim ?? "—"}
            </Text>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowQR(false)}
            >
              <Text style={styles.doneButtonText}>
                Done
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>


    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BRAND = "#4F6BFF";
const BRAND_SOFT = "#EEF1FF";
const SURFACE = "#FFFFFF";
const BG = "#F4F6FB";
const TEXT_PRIMARY = "#0D1B4B";
const TEXT_SECONDARY = "#6B7A99";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
    marginTop: 50
  },

  // ── Header
  topBar: {
    height: 56,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 25,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.prm,
    letterSpacing: -0.3,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },

  // ── Loading
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },

  // ── Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
    // backgroundColor: "red"
  },

  // ── Hero card
  heroCard: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 28,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  heroBg: {
    width: "100%",
    height: 80,
    backgroundColor: BRAND,
    marginBottom: -40,
  },
  avatarWrapper: {
    position: "relative",
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarRing: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: SURFACE,
    backgroundColor: "transparent",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  heroName: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  nimBadge: {
    backgroundColor: BRAND_SOFT,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  nimBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND,
    letterSpacing: 0.3,
  },

  // ── Info card
  infoCard: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 4,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BRAND_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F2F8",
    marginVertical: 12,
    marginLeft: 54,
  },

  // ── Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFF1F1",
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#FFD6D6",
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#D93025",
    letterSpacing: 0.2,
  },

  // QR

  qrButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  backgroundColor: BRAND,
  borderRadius: 16,
  paddingVertical: 16,
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 5,
},

qrButtonIcon: {
  fontSize: 20,
  color: "#FFFFFF",
},

qrButtonText: {
  fontSize: 15,
  fontWeight: "700",
  color: "#FFFFFF",
  letterSpacing: 0.2,
},

// ── QR Modal

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.55)",
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 24,
},

qrModal: {
  width: "100%",
  maxWidth: 380,
  backgroundColor: "#FFFFFF",
  borderRadius: 28,
  paddingHorizontal: 24,
  paddingVertical: 28,
  alignItems: "center",
  elevation: 10,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.2,
  shadowRadius: 12,
},

closeButton: {
  position: "absolute",
  right: 16,
  top: 12,
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#F1F3F7",
},

closeButtonText: {
  fontSize: 26,
  lineHeight: 28,
  color: TEXT_SECONDARY,
  fontWeight: "400",
},

qrTitle: {
  fontSize: 22,
  fontWeight: "700",
  color: TEXT_PRIMARY,
  marginBottom: 8,
},

qrSubtitle: {
  fontSize: 13,
  lineHeight: 19,
  color: TEXT_SECONDARY,
  textAlign: "center",
  paddingHorizontal: 20,
  marginBottom: 24,
},

qrContainer: {
  padding: 18,
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "#E8EBF2",
  marginBottom: 18,
},

qrName: {
  fontSize: 17,
  fontWeight: "700",
  color: TEXT_PRIMARY,
  marginBottom: 4,
},

qrNim: {
  fontSize: 14,
  fontWeight: "500",
  color: TEXT_SECONDARY,
  marginBottom: 22,
},

doneButton: {
  width: "100%",
  backgroundColor: BRAND,
  borderRadius: 14,
  paddingVertical: 14,
  alignItems: "center",
},

doneButtonText: {
  fontSize: 15,
  fontWeight: "700",
  color: "#FFFFFF",
},
});