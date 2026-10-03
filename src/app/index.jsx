import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/authContext";

export default function Index() {
  const { session, loading } = useAuth();
  const [timeout, setTimeoutState] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutState(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Masih mengecek session
  if (loading && !timeout) {
    return (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        );
  }

  // Kalau sudah punya session, masuk ke home
  if (session) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Tidak punya session
  return <Redirect href="/(auth)/login" />;
}