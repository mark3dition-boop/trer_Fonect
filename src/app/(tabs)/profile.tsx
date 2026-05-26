import { useRouter } from "expo-router";
import { Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function Profile() {
    const router = useRouter();
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert(error.message);
            return;
        }

        router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView>
        <Button
            title="Logout"
            onPress={handleLogout}
        />
    </SafeAreaView>

  );
}