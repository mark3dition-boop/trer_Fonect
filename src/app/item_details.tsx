import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/context/authContext";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../lib/supabase";

// ─── Design Tokens ─────────────────────────────────────────────────────────

const colors = {
  primary: "#002045",
  onPrimary: "#ffffff",
  primaryContainer: "#1a365d",
  onPrimaryContainer: "#86a0cd",

  secondary: "#006a61",
  onSecondary: "#ffffff",
  secondaryContainer: "#86f2e4",
  onSecondaryContainer: "#006f66",

  background: "#f8f9ff",
  surface: "#ffffff",

  onSurface: "#0b1c30",
  onSurfaceVariant: "#43474e",

  surfaceDim: "#cbdbf5",
  surfaceContainerLow: "#eff4ff",
  surfaceContainerHigh: "#dce9ff",
  surfaceContainerLowest: "#ffffff",

  outlineVariant: "#c4c6cf",
};

// ─── Types ─────────────────────────────────────────────────────────────────

type StatusType =
  | "found"
  | "returned"
  | "authority-handled";

// ─── Reusable Components ───────────────────────────────────────────────────
function getTimeAgo(createdAt: string) {
  const now = new Date();
  const createdDate = new Date(createdAt);

  const diffMs = now.getTime() - createdDate.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${diffDays}d ago`;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}


function StatusBadge({
  status,
}: {
  status: StatusType;
}) {
  const config = {
    found: {
      label: "Found",
      color: "#1A56E8",
    },

    returned: {
      label: "Returned",
      color: colors.secondary,
    },

    "authority-handled": {
      label: "Authority-Handled",
      color: colors.onSurfaceVariant,
    },
  };

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: config[status].color,
        },
      ]}
    >
      <Text style={styles.statusBadgeText}>
        {config[status].label}
      </Text>
    </View>
  );
}

function DetailCell({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailCell}>
      <Text style={styles.detailCellIcon}>
        {emoji}
      </Text>

      <Text style={styles.detailCellLabel}>
        {label}
      </Text>

      <Text style={styles.detailCellValue}>
        {value}
      </Text>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function ItemDetailsScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams();
  const { profile }= useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchItem() {
    setLoading(true);

    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        users (
          name,
          email
        ),
        returned_items (*)
      `)
      .eq("id", itemId)
      .single();
      
      if (error) {
        console.log(error);
      } else {
        setItem(data);
      }

      setLoading(false);
  }

  const handleContactFinder = async () => {
      const finderEmail = item?.users?.email;
      
      if (!finderEmail) {
        Alert.alert("Error", "Finder email not available.");
        return;
      }

      const subject = encodeURIComponent(`Mengenai barang temuan: ${item?.item_name}`);
      const body = encodeURIComponent(
        `Halo,\n\nSaya tertarik dengan barang yang kamu temukan (${item?.item_name}).\n\nTerima kasih.`
      );

      const mailtoUrl = `mailto:${finderEmail}?subject=${subject}&body=${body}`;

       try {
        await Linking.openURL(mailtoUrl);
      } catch (error) {
        Alert.alert("Error", "Tidak ada aplikasi email yang terpasang.");
      }
};
  
  // ─── Mock Data ──────────────────────────────────────────────────────────
  // nanti dari database

  const userItem = item?.user_id === profile?.id ? true : false;

  // ─── State ──────────────────────────────────────────────────────────────

  const [status, setStatus] = useState<StatusType>("returned");

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Use effect to calculate time left for found items
  useEffect(() => {
    if (!item?.created_at) return;

    const deadline = new Date(item.created_at).getTime() + 24 * 60 * 60 * 1000;

    const tick = () => {
      setTimeLeft(Math.floor((deadline - Date.now()) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [item?.created_at]);

  // Use effect to fetch item details on mount
  useFocusEffect(
    useCallback(() => {
      fetchItem();
    }, [itemId])
  );

  useEffect(() => {
      setStatus(item?.status || "found");
  }, [item]);
  
  // ─── Actions ────────────────────────────────────────────────────────────

  const handleAuthority = async () => {
    const { error: returnedItemError } = await supabase
            .from("returned_items")
            .insert({
                item_id: item?.id,
                returned_to: "authority",

            });
  

    const { error: updateItemError } = await supabase
        .from("items")
        .update({ status: "authority-handled" })
        .eq("id", item?.id);
    

    if (returnedItemError || updateItemError) {
        console.log(returnedItemError);
        console.log(updateItemError);
        Alert.alert("Failed to update returned item data");
        return;
    }

    Alert.alert("Success", "Item successfully submitted to authority");

    await fetchItem();

  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Loading item...</Text>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.surface}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero Image ───────────────────────────── */}

        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: item?.img_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCB8iAqHGvBI3sAcH98VoNC0AJ6cpgCwpmoxQSWtnEXBcqv2EmRoUKpf1RQqSo252RxJJdvNzPPF073OZHzS0Di9j7AgXioASJeEHXEOEBiZ1QarJ6USyKfhfb8_gTcHpqo_4L5DTotRPuROlxBwLmqhVCaRgs7wOji0_y4bIk16cn8TTNQucSqM-svqR2qFH1Q6b8qZnrp4VwpmVK7JONDgiyKCILBs8ra0Xs5Kx0bNHTzejJnqIqXG-rS1EC4cmJXNyjJowS2HOU",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Status Badge */}

          <View style={styles.heroBadge}>
            <StatusBadge status={status} />
          </View>

          {/* Back Button */}

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back-outline"
              size={20}
              color={colors.onSurface}
            />
          </TouchableOpacity>
        </View>

        {/* ─── Content Card ────────────────────────── */}

        <View style={styles.contentCard}>
          {/* Header */}

          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>
                {item?.item_name || "Null"}
              </Text>

              <Text style={styles.itemSubtitle}>
                {item?.location || "Null"}
              </Text>
            </View>

            <Text style={styles.postedTime}>
              Posted {getTimeAgo(item?.created_at || "null")}
            </Text>
          </View>

          {/* Detail Grid */}

          <View style={styles.bentoGrid}>
            <DetailCell
              emoji="📦"
              label="Category"
              value={item?.category || "Null"}
            />

            <DetailCell
              emoji="🎨"
              label="Color"
              value={item?.color || "Null"}
            />
          </View>

          {/* ─────────────────────────────────────── */}
          {/* CASE 1 */}
          {/* status: found & user_item: true */}
          {/* ─────────────────────────────────────── */}

          {item?.status === "found" && userItem && (
            <View style={styles.finderActions}>
              {/* Countdown Banner */}
              <View style={[
                styles.countdownBanner,
                timeLeft !== null && timeLeft <= 0 && { backgroundColor: "#ffdad6", borderColor: "#ba1a1a" }
              ]}>
                <Text style={styles.countdownBannerIcon}>🕐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.countdownBannerLabel}>Return deadline</Text>
                  {timeLeft === null ? (
                    <Text style={styles.countdownBannerTimer}>--:--:--</Text>
                  ) : timeLeft <= 0 ? (
                    <Text style={[styles.countdownBannerTimer, { color: "#ba1a1a" }]}>
                      Return this item ASAP!
                    </Text>
                  ) : (
                    <Text style={styles.countdownBannerTimer}>{formatTime(timeLeft)}</Text>
                  )}
                </View>
              </View>


              {/* Buttons */}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.btnPrimary,
                    loading &&
                      styles.btnDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={loading}
                  onPress={handleAuthority}
                >
                  <Text
                    style={styles.btnPrimaryText}
                  >
                    {loading
                      ? "⏳ Processing..."
                      : "✅ Submitted to Authority"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.btnSecondary,
                    loading &&
                      styles.btnDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={loading}
                  onPress={() => router.push({
                      pathname: '/returnedToOwner_form',
                      params: { itemId: itemId }
                    })}
                >
                  <Text
                    style={
                      styles.btnSecondaryText
                    }
                  >
                    {loading
                      ? "⏳ Processing..."
                      : "👤 Returned to Owner"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ─────────────────────────────────────── */}
          {/* CASE 2 */}
          {/* status: returned / authority-handled */}
          {/* ─────────────────────────────────────── */}

          {(item?.status === "returned" ||
            item?.status ===
              "authority-handled") && (
            <View style={styles.searcherView}>
              <View
                style={[
                  styles.statusCard,
                  {
                    backgroundColor:
                      colors.secondaryContainer,
                  },
                ]}
              >
                <Text
                  style={
                    styles.statusCardIcon
                  }
                >
                  {item?.status === "returned"
                    ? "🎉"
                    : "✅"}
                </Text>

                <Text
                  style={[
                    styles.statusCardText,
                    {
                      color:
                        colors.onSecondaryContainer,
                    },
                  ]}
                >
                  {item?.status === "returned"
                    ? `Returned to ${item?.returned_items?.receiver_name || "null"}`
                    : "Handed over to authority"}
                </Text>
              </View>
            </View>
          )}

          {/* ─────────────────────────────────────── */}
          {/* CASE 3 */}
          {/* status: found & user_item: false */}
          {/* ─────────────────────────────────────── */}

          {item?.status === "found" &&
            !userItem && (
              <TouchableOpacity
                style={styles.btnPrimary}
                activeOpacity={0.85}
                onPress={handleContactFinder}
              >
                <Text
                  style={styles.btnPrimaryText}
                >
                  📞 Contact Finder
                </Text>
              </TouchableOpacity>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 80,
  },

  // ─── Hero ─────────────────────────────────────

  heroContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceDim,
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroBadge: {
    position: "absolute",
    top: 16,
    right: 16,
  },

  backButton: {
    position: "absolute",
    top: 16,
    left: 16,

    width: 40,
    height: 40,

    borderRadius: 20,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(255,255,255,0.85)",

    elevation: 3,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },

  // ─── Status Badge ────────────────────────────

  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,

    borderRadius: 999,

    elevation: 4,
  },

  statusBadgeText: {
    color: colors.onPrimary,

    fontSize: 13,
    fontWeight: "600",
  },

  // ─── Content Card ────────────────────────────

  contentCard: {
    marginHorizontal: 16,
    marginTop: -32,

    padding: 20,

    borderRadius: 16,

    backgroundColor:
      colors.surfaceContainerLowest,

    borderWidth: 1,
    borderColor:
      "rgba(196,198,207,0.3)",

    elevation: 6,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  // ─── Header ──────────────────────────────────

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginBottom: 16,
  },

  itemTitle: {
    fontSize: 22,
    fontWeight: "700",

    color: colors.primary,

    marginBottom: 4,
  },

  itemSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },

  postedTime: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  // ─── Grid ────────────────────────────────────

  bentoGrid: {
    flexDirection: "row",
    gap: 12,

    marginBottom: 20,
  },

  detailCell: {
    flex: 1,

    padding: 14,

    borderRadius: 12,

    backgroundColor:
      colors.surfaceContainerLow,

    borderWidth: 1,
    borderColor:
      "rgba(196,198,207,0.2)",
  },

  detailCellIcon: {
    fontSize: 16,
    marginBottom: 4,
  },

  detailCellLabel: {
    fontSize: 11,
    fontWeight: "500",

    textTransform: "uppercase",

    color: colors.onSurfaceVariant,
  },

  detailCellValue: {
    fontSize: 14,
    fontWeight: "600",

    color: colors.onSurface,
  },

  // ─── Actions ─────────────────────────────────

  finderActions: {
    gap: 12,
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "center",

    gap: 12,

    padding: 14,

    borderRadius: 12,

    backgroundColor:
      colors.surfaceContainerHigh,
  },

  infoBannerIcon: {
    width: 36,
    height: 36,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      colors.primaryContainer,
  },

  infoBannerText: {
    flex: 1,

    fontSize: 14,
    lineHeight: 20,

    color: colors.onSurface,
  },

  actionButtons: {
    gap: 10,
  },

  btnPrimary: {
    paddingVertical: 16,

    borderRadius: 999,

    alignItems: "center",

    backgroundColor: colors.primary,

    elevation: 4,
  },

  btnPrimaryText: {
    fontSize: 14,
    fontWeight: "600",

    color: colors.onPrimary,
  },

  btnSecondary: {
    paddingVertical: 16,

    borderRadius: 999,

    alignItems: "center",

    backgroundColor: colors.secondary,

    elevation: 4,
  },

  btnSecondaryText: {
    fontSize: 14,
    fontWeight: "600",

    color: colors.onSecondary,
  },

  btnDisabled: {
    opacity: 0.6,
  },

  // ─── Result View ─────────────────────────────

  searcherView: {
    gap: 16,
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",

    gap: 12,

    padding: 14,

    borderRadius: 12,
  },

  statusCardIcon: {
    fontSize: 22,
  },

  statusCardText: {
    flex: 1,

    fontSize: 14,
    fontWeight: "500",

    lineHeight: 20,
  },

  countdownBanner: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  padding: 14,
  borderRadius: 12,
  backgroundColor: colors.surfaceContainerHigh,
  borderWidth: 1,
  borderColor: colors.outlineVariant,
},

countdownBannerIcon: {
  fontSize: 22,
},

countdownBannerLabel: {
  fontSize: 11,
  fontWeight: "500",
  textTransform: "uppercase",
  color: colors.onSurfaceVariant,
  marginBottom: 2,
},

countdownBannerTimer: {
  fontSize: 20,
  fontWeight: "700",
  color: colors.onSurface,
  fontVariant: ["tabular-nums"],
},
});