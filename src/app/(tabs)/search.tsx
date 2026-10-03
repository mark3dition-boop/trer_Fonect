import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/authContext";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 12) / 2;

type BadgeType = "authority-handled" | "found" | "returned";

const CATEGORIES = ["All", "Electronics", "Wallet", "Keys", "Clothing", "Other"];

function getBadgeStyle(status: BadgeType) {
  const colorMap: Record<BadgeType, string> = {
    found: colors.primary,        // biru
    returned: colors.secondary,   // hijau (#006a61)
    "authority-handled": "#43474e", // abu-abu
  };

  return {
    backgroundColor: colorMap[status] ?? colors.primary,
  };
}

function getBadgeText(status: BadgeType) {
  if (status === "authority-handled") {
    return "Authority-Handled";
  } else if (status === "found") {
    return "Found";
  } else {
    return "Returned";
  }
}

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

interface ResultItem {
  id: string;
  title: string;
  badge: BadgeType;
  locationLabel: string;
  timeAgo: string;
  imageUri: string;
}


const colors = {
  primary: "#1A56E8",
  background: "#F8F9FF",
  white: "#FFFFFF",
  text: "#0B1C30",
  outline: "#D6D6D6",
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
  errorContainer: "#ffdad6",
  onPrimaryFixed: "#001b3c",
  onPrimary: "#ffffff",
  surfaceVariant: "#d3e4fe",
  surfaceContainerLow: "#eff4ff",
  tertiaryContainer: "#552b00",
  onSecondaryFixed: "#00201d",
  onTertiary: "#ffffff",
  onErrorContainer: "#93000a",
  tertiaryFixedDim: "#ffb77d",
  surfaceContainerLowest: "#ffffff",
  inverseOnSurface: "#eaf1ff",
  secondaryFixed: "#89f5e7",
  onSurfaceVariant: "#43474e",
  prm: "#1A56E8",
};

function ResultCard({ item }: { item: any }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => {router.push({
      pathname: "/item_details",
      params: { itemId: item.id },
    })}}>
      <Image
        source={{ uri: item?.img_url || "null"}}
        style={styles.image}
      />

      <View style={[styles.badge, getBadgeStyle(item?.status || "null")]}>
        <Text style={styles.badgeText}>
          {getBadgeText(item?.status || "null")}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>
          {item?.item_name || "null"}
        </Text>

        <Text style={styles.location}>
          📍{item?.location || "null"}
        </Text>

        <Text style={styles.time}>
          {getTimeAgo(item?.created_at) || "null"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  async function fetchItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("items")
      .select("*")
      .neq("user_id", profile?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setItems(data);
    }

    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [profile?.id])
  );



  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item?.item_name
        ?.toLowerCase()
        .includes(query.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        item?.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [query, selectedCategory, items]);

  const displayedItems = filteredItems.slice(
    0,
    visibleCount
  );

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.topBar}>
          <Text style={styles.appTitle}>Items Found by Others</Text>
      </View>

      <FlatList
        data={displayedItems}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        stickyHeaderIndices={[0]}
        renderItem={({ item }) => (
          <ResultCard item={item} />
        )}

        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading items...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items found</Text>
            </View>
          )
        }

        ListHeaderComponent={
          <View style={styles.searchHeader}>
            <View style={styles.searchBar}>
              <TextInput
                placeholder="Search items..."
                placeholderTextColor="#888"
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  setVisibleCount(4);
                }}
                style={styles.input}
              />
            </View>

            {/* Horizontal Filter Category Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipActive,
                    ]}
                    onPress={() => {
                      setSelectedCategory(category);
                      setVisibleCount(4);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && styles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

          </View>
        }
        ListFooterComponent={
          visibleCount < filteredItems.length ? (
            <TouchableOpacity
              style={styles.seeMoreBtn}
              onPress={handleSeeMore}
            >
              <Text style={styles.seeMoreText}>
                See More
              </Text>
            </TouchableOpacity>
          ) : null
        }
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  topBar: {
    height: 56,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    // elevation: 2,
    // marginBottom: -15,
    marginTop: 15,
  },

  appTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.3,
  },

  logo: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
  },

  searchHeader: {
    backgroundColor: colors.background,
    paddingBottom: 12,
  },

  searchBar: {
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.outline,
    marginBottom: 12
  },

  input: {
    fontSize: 16,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.outline,
  },

  image: {
    width: "100%",
    aspectRatio: 1,
  },

  /* Style Tambahan untuk Filter Kategori */
  categoryContainer: {
    paddingVertical: 2,
    gap: 8,
  },

  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outline,
  },

  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  categoryTextActive: {
    color: colors.white,
  },

  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },

  cardContent: {
    padding: 10,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  location: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },

  time: {
    marginTop: 4,
    fontSize: 11,
    color: "#999",
  },

  seeMoreBtn: {
    marginTop: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },

  seeMoreText: {
    color: colors.primary,
    fontWeight: "600",
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
});