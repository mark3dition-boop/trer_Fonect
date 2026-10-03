import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

const BRAND = "#4F6BFF";
const BG = "#F4F6FB";
const TEXT_PRIMARY = "#0D1B4B";
const TEXT_SECONDARY = "#6B7A99";

interface StudentProfile {
  name: string;
  nim: string;
}

export default function ScanQR() {
  const router = useRouter();
const { itemId } = useLocalSearchParams();

  const [permission, requestPermission] = useCameraPermissions();

  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [showResult, setShowResult] = useState(false);

  /*
   * Called when QR code is detected.
   */
  const handleBarcodeScanned = async ({
    data,
  }: {
    data: string;
  }) => {
    if (!scanning || loading) return;

    // Stop scanner temporarily
    setScanning(false);
    setLoading(true);

    try {
      const scannedNim = data.trim();

      // Scanned Data Debugging
      console.log("QR DATA:", JSON.stringify(data));
      console.log("SCANNED NIM:", JSON.stringify(scannedNim));

      if (!scannedNim) {
        throw new Error("Invalid QR code.");
      }

      /*
       * Search student profile using NIM
       */
      const { data: profile, error } = await supabase
        .from("users")
        .select("name, nim")
        .eq("nim", scannedNim)
        .single();

      if (error) {
        Alert.alert(
          "Student Not Found",
          "The QR code does not belong to a registered Fonect student.",
          [
            {
              text: "Scan Again",
              onPress: () => {
                setScanning(true);
              },
            },
          ],
        );

        return;
      }

      /*
       * Student found
       */
      setStudent({
        name: profile.name,
        nim: profile.nim,
      });

      setShowResult(true);
    } catch (error) {
      console.error("QR scan error:", error);

      Alert.alert(
        "Invalid QR Code",
        "This QR code could not be verified.",
        [
          {
            text: "Scan Again",
            onPress: () => {
              setScanning(true);
            },
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * User confirms that the scanned student
   * is the owner of the item.
   *
   * Database handover logic can be added here later.
   */
  const handleConfirm = async () => {
    if (!student) return;

    setShowResult(false);
    setLoading(true);

    try {
      // Insert returned item record
      const { error: dbError } = await supabase
        .from("returned_items")
        .insert({
          item_id: itemId,
          returned_to: "owner",
          receiver_name: student.name.trim(),
          receiver_nim: student.nim.trim(),
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
       
      await new Promise((resolve) => setTimeout(resolve, 800));

      Alert.alert(
        "Verification Complete",
        `${student.name} has been successfully verified.`,
        [
          {
            text: "Done",
            onPress: () => router.dismissTo({
                      pathname: '/item_details',
                      params: { itemId: itemId }
                    }),
          },
        ],
      );
    } catch (error) {
      console.error("Verification error:", error);

      Alert.alert(
        "Verification Failed",
        "Something went wrong while processing the verification.",
        [
          {
            text: "Try Again",
            onPress: () => {
              setScanning(true);
            },
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Camera permission
   */
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Text style={styles.permissionIcon}>📷</Text>

          <Text style={styles.permissionTitle}>
            Camera Permission Required
          </Text>

          <Text style={styles.permissionText}>
            Fonect needs access to your camera to scan the owner's QR code.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Allow Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanning ? handleBarcodeScanned : undefined
        }
      />

      {/* Dark overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              Scan Owner QR
            </Text>

            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>

        {/* Scanner area */}
        <View style={styles.scannerArea}>
          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {loading && (
              <View style={styles.scanningLoader}>
                <ActivityIndicator
                  size="large"
                  color="#FFFFFF"
                />
              </View>
            )}
          </View>

          <Text style={styles.instruction}>
            Position the owner's QR code inside the frame
          </Text>
        </View>

        {/* Bottom info */}
        <View style={styles.bottomPanel}>
          <Text style={styles.bottomTitle}>
            Verify Owner
          </Text>

          <Text style={styles.bottomText}>
            Ask the owner to open their profile and show
            their QR code.
          </Text>
        </View>
      </View>

      {/* Result Modal */}
      <Modal
        visible={showResult}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowResult(false);
          setScanning(true);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultModal}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>
                ✓
              </Text>
            </View>

            <Text style={styles.resultTitle}>
              Student Found
            </Text>

            <Text style={styles.resultSubtitle}>
              Verify that this person is the owner of the item.
            </Text>

            {/* Student information */}
            <View style={styles.studentCard}>
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {student?.name
                    ?.split(" ")
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                </Text>
              </View>

              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                  {student?.name}
                </Text>

                <Text style={styles.studentNim}>
                  {student?.nim}
                </Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Make sure the student's identity matches
                the person receiving the item.
              </Text>
            </View>

            {/* Buttons */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>
                Confirm Verification
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowResult(false);
                setStudent(null);
                setScanning(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelText}>
                Scan Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },

  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },

  // ─────────────────────────────────────
  // Header
  // ─────────────────────────────────────

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "300",
    marginTop: -4,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  headerSpacer: {
    width: 42,
  },

  // ─────────────────────────────────────
  // Scanner
  // ─────────────────────────────────────

  scannerArea: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  scannerFrame: {
    width: 260,
    height: 260,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#FFFFFF",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },

  scanningLoader: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  instruction: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 40,
  },

  // ─────────────────────────────────────
  // Bottom
  // ─────────────────────────────────────

  bottomPanel: {
    backgroundColor: "rgba(0,0,0,0.72)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },

  bottomTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },

  bottomText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    lineHeight: 20,
  },

  // ─────────────────────────────────────
  // Permission
  // ─────────────────────────────────────

  permissionContainer: {
    flex: 1,
    backgroundColor: BG,
  },

  permissionContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  permissionIcon: {
    fontSize: 56,
    marginBottom: 20,
  },

  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 12,
  },

  permissionText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },

  primaryButton: {
    width: "100%",
    backgroundColor: BRAND,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  cancelButton: {
    paddingVertical: 16,
  },

  cancelButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: "600",
  },

  // ─────────────────────────────────────
  // Result Modal
  // ─────────────────────────────────────

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },

  resultModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
    alignItems: "center",
  },

  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E6F7F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  successIconText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#18A879",
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },

  resultSubtitle: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 20,
    marginBottom: 22,
  },

  studentCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FC",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  studentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  studentAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },

  studentNim: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },

  warningBox: {
    width: "100%",
    backgroundColor: "#FFF8E7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },

  warningText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#856404",
    textAlign: "center",
  },

  confirmButton: {
    width: "100%",
    backgroundColor: BRAND,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  modalCancelButton: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
  },

  modalCancelText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: "600",
  },
});
