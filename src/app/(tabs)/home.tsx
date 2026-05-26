import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/authContext";

// ─── Color Tokens ────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FonectHome() {
  const { profile } = useAuth();
  const [timeLeft, setTimeLeft] = useState(23 * 3600 + 22 * 60 + 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Top App Bar ── */}
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>Fonect</Text>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome */}
        <View style={styles.section}>
          <Text style={styles.welcomeHeading}>Hello, {profile?.name || "Null"}</Text>
          <Text style={styles.welcomeSubtext}>
            Welcome back to the campus recovery hub.
          </Text>
        </View>

        {/* Urgent Banner */}
        <View style={styles.urgentBanner}>
          {/* Inline warning icon using Unicode */}
          <Text style={styles.urgentIcon}>⚠️</Text>
          <Text style={styles.urgentText}>
            Please return the items to the Campus Lost &amp; Found office within
            1 day.
          </Text>
        </View>

        {/* Report Found Item Card */}
        <View style={styles.reportCard}>
          <View>
            <Text style={styles.reportCardTitle}>Found something?</Text>
            <Text style={styles.reportCardSubtext}>
              Help a fellow student by reporting items found on campus.
            </Text>
          </View>
          <TouchableOpacity style={styles.reportButton} activeOpacity={0.8}>
            <Text style={styles.reportButtonIcon}>＋</Text>
            <Text style={styles.reportButtonText}>Report Found Item</Text>
          </TouchableOpacity>
        </View>

        {/* My Found Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Found Items</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Item Card */}
          <TouchableOpacity
            style={styles.itemCard}
            activeOpacity={0.85}
          >
            {/* Image */}
            <View style={styles.itemImageWrapper}>
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPzENOOaZdGmjRyoxw4O8KuZVbW8JuXIwjb8_zQ48w-RhY3SM24NI-2UrCrF4TanvqEOzWuKyjOqvk2ElQtEmdPamwhwWSPNXMa-A0OWY-OFU_VEqTwIlSSrKw6kNfiAEzZ7r5vsxQz9tjyj56KHQR_8jO_pOu5aWzdvN7VLEoB9U_r7XHYDb3SLxanV6Ab5hdqJvLum3ouLli0MEjEpnwEASyAGCux77sVoj0hxqJHkZ0CViAXDy4DMzEO061-rXiGPmWV7JcRRY",
                }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemBadge}>
                <Text style={styles.itemBadgeText}>Found</Text>
              </View>
            </View>

            {/* Card Content */}
            <View style={styles.itemContent}>
              <Text style={styles.itemName}>Samsung Charger</Text>
              <View style={styles.itemLocationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.itemLocation}>
                  Science Building - Room 302
                </Text>
              </View>

              {/* Countdown */}
              <View style={styles.countdownBox}>
                <View style={styles.countdownLeft}>
                  <Text style={styles.clockIcon}>🕐</Text>
                  <Text style={styles.countdownLabel}>Return within:</Text>
                </View>
                <Text style={styles.countdownTimer}>
                  {formatTime(timeLeft)}
                </Text>
              </View>

              {/* Actions */}
              <TouchableOpacity
                style={styles.returnButton}
                activeOpacity={0.85}
              >
                <Text style={styles.returnButtonText}>Return Item</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Found Items by Others */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Found Item by Others</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.otherItemCard} activeOpacity={0.85}>
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNzgnn-nGuYAjzXxv_hWz1FamjogWiN0Yp6WBZ8J5PRVXQ6T1KKpB-nX0GoEjGJqALQSpN8XO1jlFJ6rbo8EYglZQekz6XrtLZ1ZvJILFgYN07sVElI6Gz9OR2UpHJqrVcTVi81rOkGE--UdWntwLCvoVnt4uv5K5RSpArMQNwMewpbN2IItk3QArcjOlyNoTw0vjYAFir-ow-auA-USAHMcux_hk76GV8OlnXYP7Hg1ZBdvAdYHPHjWf1h1JBaosH5P4CCxCQpFQ",
              }}
              style={styles.otherItemImage}
              resizeMode="cover"
            />
            <View style={styles.otherItemContent}>
              <Text style={styles.otherItemName}>Blue Umbrella</Text>
              <View style={styles.itemLocationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.otherItemLocation}>
                  Library - 2nd Floor
                </Text>
              </View>
              <View style={styles.otherItemFooter}>
                <Text style={styles.postedTime}>Posted 2h ago</Text>
                <TouchableOpacity>
                  <Text style={styles.contactLink}>Contact Finder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Bento Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Items Found</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statNumber}>450</Text>
            <Text style={styles.statLabel}>Community Pts</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Top App Bar
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
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.prm,
    letterSpacing: -0.3,
  },

  // Scroll
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
    gap: 24,
  },

  // Sections
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.onSurface,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
  },

  // Welcome
  welcomeHeading: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 2,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },

  // Urgent Banner
  urgentBanner: {
    backgroundColor: colors.tertiaryFixed,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.tertiaryFixedDim,
  },
  urgentIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  urgentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.onTertiaryContainer,
    lineHeight: 20,
  },

  // Report Card
  reportCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  reportCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  reportCardSubtext: {
    fontSize: 14,
    color: colors.onPrimaryContainer,
  },
  reportButton: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  reportButtonIcon: {
    fontSize: 18,
    color: colors.onSecondaryContainer,
    fontWeight: "700",
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSecondaryContainer,
    letterSpacing: 0.2,
  },

  // Item Card (My Found Items)
  itemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImageWrapper: {
    width: "100%",
    height: 192,
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.tertiaryContainer,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  itemBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onTertiaryContainer,
    letterSpacing: 0.3,
  },
  itemContent: {
    padding: 16,
    gap: 10,
  },
  itemName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: 2,
  },
  itemLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationIcon: {
    fontSize: 14,
  },
  itemLocation: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },

  // Countdown
  countdownBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clockIcon: {
    fontSize: 16,
  },
  countdownLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSurfaceVariant,
  },
  countdownTimer: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.onTertiaryContainer,
    fontVariant: ["tabular-nums"],
  },

  // Return Button
  returnButton: {
    backgroundColor: colors.secondary,
    borderRadius: 9999,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  returnButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.2,
  },

  // Other Item Card
  otherItemCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  otherItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    flexShrink: 0,
  },
  otherItemContent: {
    flex: 1,
    gap: 6,
  },
  otherItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
  },
  otherItemLocation: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  otherItemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  postedTime: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  contactLink: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.secondary,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    gap: 6,
  },
  statIcon: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.onSurface,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSurfaceVariant,
  },
});