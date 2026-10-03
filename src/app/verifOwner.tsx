import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

export default function RegisterScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams();

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScanQR = () => {
    router.push({
      pathname: "/scanQR",
      params: {
        itemId: itemId,
      },
    });
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !studentId.trim()) {
      Alert.alert(
        "Incomplete Information",
        "Please enter the owner's full name and student ID.",
      );
      return;
    }

    setLoading(true);

    try {
      // Insert returned item record
      const { error: dbError } = await supabase
        .from("returned_items")
        .insert({
          item_id: itemId,
          returned_to: "owner",
          receiver_name: fullName.trim(),
          receiver_nim: studentId.trim(),
        });

      if (dbError) {
        throw dbError;
      }

      // Update item status
      const { error: updateItemError } = await supabase
        .from("items")
        .update({
          status: "returned",
        })
        .eq("id", itemId);

      if (updateItemError) {
        throw updateItemError;
      }

      Alert.alert(
        "Success",
        `The item has been successfully returned to ${fullName.trim()}.`,
        [
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("Return item error:", error);

      Alert.alert(
        "Something Went Wrong",
        "The item could not be marked as returned. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Owner Verification</Text>

        <Text style={styles.subtitle}>
          Verify the identity of the person receiving this item.
        </Text>
      </View>

      {/* Verification Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>👤</Text>
          </View>

          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>
              Owner Information
            </Text>

            <Text style={styles.cardDescription}>
              You can verify the owner using QR code or enter
              their information manually.
            </Text>
          </View>
        </View>

        {/* QR Scanner */}
        <TouchableOpacity
          style={styles.qrButton}
          onPress={handleScanQR}
          activeOpacity={0.8}
          disabled={loading}
        >
          <View style={styles.qrIconContainer}>
            <Text style={styles.qrIcon}>▣</Text>
          </View>

          <View style={styles.qrButtonTextContainer}>
            <Text style={styles.qrButtonTitle}>
              Scan Owner QR
            </Text>

            <Text style={styles.qrButtonSubtitle}>
              Automatically verify student information
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Full Name
          </Text>

          <TextInput
            placeholder="Enter owner's full name"
            placeholderTextColor="#9AA4B5"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            editable={!loading}
          />
        </View>

        {/* Student ID */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Student ID
          </Text>

          <TextInput
            placeholder="Enter owner's student ID"
            placeholderTextColor="#9AA4B5"
            style={styles.input}
            value={studentId}
            onChangeText={setStudentId}
            keyboardType="default"
            editable={!loading}
          />
        </View>
      </View>

      {/* Information */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ⓘ</Text>

        <Text style={styles.infoText}>
          Make sure the information matches the person
          receiving the item before confirming the return.
        </Text>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          loading && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

            <Text style={styles.submitButtonText}>
              Processing...
            </Text>
          </>
        ) : (
          <Text style={styles.submitButtonText}>
            Confirm Return
          </Text>
        )}
      </TouchableOpacity>

      {/* Back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  // ─────────────────────────────────────
  // Header
  // ─────────────────────────────────────

  header: {
    marginBottom: 22,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0D1B4B",
    letterSpacing: -0.5,
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7A99",
  },

  // ─────────────────────────────────────
  // Card
  // ─────────────────────────────────────

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,

    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EEF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  icon: {
    fontSize: 21,
  },

  cardHeaderText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D1B4B",
    marginBottom: 3,
  },

  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: "#6B7A99",
  },

  // ─────────────────────────────────────
  // QR Button
  // ─────────────────────────────────────

  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF1FF",
    borderWidth: 1,
    borderColor: "#DCE2FF",
    borderRadius: 16,
    padding: 14,
  },

  qrIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#4F6BFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  qrIcon: {
    fontSize: 22,
    color: "#FFFFFF",
  },

  qrButtonTextContainer: {
    flex: 1,
  },

  qrButtonTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D1B4B",
    marginBottom: 3,
  },

  qrButtonSubtitle: {
    fontSize: 11,
    color: "#6B7A99",
  },

  arrow: {
    fontSize: 28,
    color: "#4F6BFF",
    fontWeight: "300",
  },

  // ─────────────────────────────────────
  // Divider
  // ─────────────────────────────────────

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E9ECF2",
  },

  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9AA4B5",
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },

  // ─────────────────────────────────────
  // Input
  // ─────────────────────────────────────

  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#46536B",
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDE2EC",
    borderRadius: 13,
    paddingHorizontal: 14,
    backgroundColor: "#FAFBFD",
    fontSize: 14,
    color: "#0D1B4B",
  },

  // ─────────────────────────────────────
  // Info
  // ─────────────────────────────────────

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E7",
    borderRadius: 14,
    padding: 13,
    marginTop: 16,
  },

  infoIcon: {
    fontSize: 18,
    color: "#856404",
    marginRight: 9,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: "#856404",
  },

  // ─────────────────────────────────────
  // Buttons
  // ─────────────────────────────────────

  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,

    backgroundColor: "#4F6BFF",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 18,

    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  backButton: {
    alignItems: "center",
    paddingVertical: 15,
  },

  backButtonText: {
    color: "#6B7A99",
    fontSize: 14,
    fontWeight: "600",
  },
});
