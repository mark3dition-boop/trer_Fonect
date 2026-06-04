import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
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
   
  const handleLogout = async () => {
    Alert.alert("Keluar", "Apakah kamu yakin ingin logout?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
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
        {/* Header */}
        <View style={styles.topBar}>
            <Text style={styles.appTitle}>Fonect</Text>
        </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F6BFF" />
          <Text style={styles.loadingText}>Memuat profil…</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Hero card */}
          <View style={styles.heroCard}>
            <View style={styles.heroBg} />
            <Avatar name={profile?.name ?? ""} />
            <Text style={styles.heroName}>{profile?.name ?? "—"}</Text>
            <View style={styles.nimBadge}>
              <Text style={styles.nimBadgeText}>NIM {profile?.nim ?? "—"}</Text>
            </View>
          </View>

          {/* Info list */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Account Information</Text>
            <InfoRow label="Full Name" value={profile?.name ?? "—"} icon="👤" />
            <View style={styles.divider} />
            <InfoRow label="Student ID" value={profile?.nim ?? "—"} icon="🎓" />
            <View style={styles.divider} />
            <InfoRow label="Email" value={profile?.email ?? "—"} icon="✉️" />
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: SURFACE,
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
});