import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

// ─── Color tokens (consistent with other screens) ───────────────────────────
const BRAND = "#4F6BFF";
const BRAND_SOFT = "#EEF1FF";
const SURFACE = "#FFFFFF";
const BG = "#F4F6FB";
const TEXT_PRIMARY = "#0D1B4B";
const TEXT_SECONDARY = "#6B7A99";
const OUTLINE = "#E8ECF4";

const GOLD = "#F5A623";
const GOLD_SOFT = "#FFF8EC";
const SILVER = "#8E9BAE";
const SILVER_SOFT = "#F2F4F7";
const BRONZE = "#CD7F32";
const BRONZE_SOFT = "#FDF3EA";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  nim: string;
  count: number;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RankAvatar({
  name,
  rank,
}: {
  name: string;
  rank: number;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const bgColor =
    rank === 1 ? GOLD : rank === 2 ? SILVER : rank === 3 ? BRONZE : BRAND;

  return (
    <View style={[styles.avatarCircle, { backgroundColor: bgColor }]}>
      <Text style={styles.avatarInitials}>{initials || "?"}</Text>
    </View>
  );
}

function PodiumCard({
  entry,
  height,
  isFirst,
}: {
  entry: LeaderboardEntry;
  height: number;
  isFirst: boolean;
}) {
  const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉";
  const accentColor =
    entry.rank === 1 ? GOLD : entry.rank === 2 ? SILVER : BRONZE;
  const softColor =
    entry.rank === 1 ? GOLD_SOFT : entry.rank === 2 ? SILVER_SOFT : BRONZE_SOFT;

  return (
    <View style={[styles.podiumCol, isFirst && styles.podiumColFirst]}>
      {/* Avatar + name above the platform */}
      <View style={styles.podiumTop}>
        <View style={[styles.podiumAvatarRing, { borderColor: accentColor }]}>
          <RankAvatar name={entry.name} rank={entry.rank} />
        </View>
        <Text style={styles.podiumName} numberOfLines={1}>
          {entry.name.split(" ")[0]}
        </Text>
        <View style={[styles.podiumBadge, { backgroundColor: softColor }]}>
          <Text style={[styles.podiumBadgeText, { color: accentColor }]}>
            {entry.count} item
          </Text>
        </View>
      </View>

      {/* Platform */}
      <View
        style={[
          styles.podiumPlatform,
          { height, backgroundColor: accentColor },
        ]}
      >
        <Text style={styles.podiumMedal}>{medal}</Text>
        <Text style={styles.podiumRankNum}>#{entry.rank}</Text>
      </View>
    </View>
  );
}

function RankRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <View style={styles.rankRow}>
      <View style={styles.rankNumBox}>
        <Text style={styles.rankNum}>{entry.rank}</Text>
      </View>
      <RankAvatar name={entry.name} rank={entry.rank} />
      <View style={styles.rankInfo}>
        <Text style={styles.rankName} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={styles.rankNim}>NIM {entry.nim}</Text>
      </View>
      <View style={styles.rankCountBox}>
        <Text style={styles.rankCountNum}>{entry.count}</Text>
        <Text style={styles.rankCountLabel}>item</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      
      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select("user_id")
        .in("status", ["returned", "authority-handled"]);

      if (itemsError) throw itemsError;
      if (!items || items.length === 0) {
        setEntries([]);
        return;
      }

      // Step 2: aggregate count per user_id in JS
      const countMap: Record<string, number> = {};
      for (const item of items) {
        if (!item.user_id) continue;
        countMap[item.user_id] = (countMap[item.user_id] ?? 0) + 1;
      }

      // Step 3: sort and take top 10
      const top10 = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      if (top10.length === 0) {
        setEntries([]);
        return;
      }

      // Step 4: fetch user profiles for those user_ids
      const userIds = top10.map(([id]) => id);
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, name, nim")
        .in("id", userIds);

      if (usersError) throw usersError;

      const userMap: Record<string, { name: string; nim: string }> = {};
      for (const u of users ?? []) {
        userMap[u.id] = { name: u.name ?? "Unknown", nim: u.nim ?? "—" };
      }

      // Step 5: build final entries with rank
      const finalEntries: LeaderboardEntry[] = top10.map(([id, count], i) => ({
        rank: i + 1,
        user_id: id,
        name: userMap[id]?.name ?? "Unknown",
        nim: userMap[id]?.nim ?? "—",
        count,
      }));

      setEntries(finalEntries);
    } catch (err: any) {
      setError(err?.message ?? "Gagal memuat leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh every time the tab is focused
  useFocusEffect(
    useCallback(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard])
  );

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>Fonect</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BRAND} />
          <Text style={styles.loadingText}>Memuat leaderboard…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyTitle}>Belum Ada Data</Text>
          <Text style={styles.emptySubtitle}>
            Belum ada item yang berhasil dikembalikan ke pemiliknya.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Section title */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Finders</Text>
                <Text style={styles.sectionSub}>
                  Based on returned & authority-handled items
                </Text>
              </View>

              {/* Podium — order: 2nd | 1st | 3rd */}
              {top3.length >= 1 && (
                <View style={styles.podiumRow}>
                  {top3[1] && (
                    <PodiumCard entry={top3[1]} height={80} isFirst={false} />
                  )}
                  {top3[0] && (
                    <PodiumCard entry={top3[0]} height={110} isFirst />
                  )}
                  {top3[2] && (
                    <PodiumCard entry={top3[2]} height={60} isFirst={false} />
                  )}
                </View>
              )}

              {/* Divider before rank list */}
              {rest.length > 0 && (
                <View style={styles.rankListHeader}>
                  <Text style={styles.rankListTitle}>Ranking Lainnya</Text>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => <RankRow entry={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Header
  topBar: {
    height: 56,
    backgroundColor: SURFACE,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: OUTLINE,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: BRAND,
    letterSpacing: -0.3,
  },

  // ── Loading / Error / Empty
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  errorText: {
    fontSize: 14,
    color: "#D93025",
    textAlign: "center",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── List
  listContent: {
    paddingBottom: 32,
  },

  // ── Section header
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    letterSpacing: -0.4,
  },
  sectionSub: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  // ── Podium
  podiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 6,
  },
  podiumCol: {
    flex: 1,
    alignItems: "center",
  },
  podiumColFirst: {
    // center column (rank 1) gets slight extra flex to stand out
    flex: 1.15,
  },
  podiumTop: {
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  podiumAvatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SURFACE,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    maxWidth: 90,
    textAlign: "center",
  },
  podiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  podiumBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  podiumPlatform: {
    width: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 8,
  },
  podiumMedal: {
    fontSize: 20,
  },
  podiumRankNum: {
    fontSize: 13,
    fontWeight: "800",
    color: SURFACE,
    letterSpacing: 0.3,
  },

  // ── Rank list (4–10)
  rankListHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  rankListTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  separator: {
    height: 8,
  },
  rankNumBox: {
    width: 28,
    alignItems: "center",
  },
  rankNum: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_SECONDARY,
  },
  rankInfo: {
    flex: 1,
    gap: 2,
  },
  rankName: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  rankNim: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  rankCountBox: {
    alignItems: "center",
    backgroundColor: BRAND_SOFT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 52,
  },
  rankCountNum: {
    fontSize: 18,
    fontWeight: "800",
    color: BRAND,
    lineHeight: 22,
  },
  rankCountLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: BRAND,
    letterSpacing: 0.3,
  },

  // ── Avatar (shared)
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});