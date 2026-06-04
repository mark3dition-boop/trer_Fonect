import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const[showPassword, setShowPassword] = useState(false);

  
  const handleRegister = async () => {
    // Validation sederhana
    if (!fullName || !email || !studentId || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Email is not valid");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password minimum 8 characters");
      return;
    }

    const formattedEmail = email.trim().toLowerCase();

    // Register ke Supabase
    const { data, error } = await supabase.auth.signUp({
      email: formattedEmail,
      password,
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    
    // 2. AMBIL USER ID
    const user = data.user!;

    // 3. INSERT KE TABLE USERS
    const { error: dbError } = await supabase
      .from("users")
      .insert({
        name: fullName,
        nim: studentId,
        email: formattedEmail,
        password: password,
      });

    if (dbError) {
      Alert.alert("Error", dbError.message);
      return;
    }

      Alert.alert("Success", "Account created");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Student ID"
        style={styles.input}
        value={studentId}
        onChangeText={setStudentId}
      />
      <View style={styles.inputPwWrapper}>
         <TextInput
            placeholder="Password"
            style={styles.inputPw}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIconText}>{showPassword ? <Ionicons name="eye-outline" size={20} color="#B0B8C9" /> : <Ionicons name="eye-off-outline" size={20} color="#B0B8C9" />}</Text>
          </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={{ marginTop: 16, color: "#0066ff" }}>Already have an account?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#EEF2FF",
    marginTop: -150,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#0066ff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  eyeButton: {
    padding: 4,
    marginRight: 8,
  },

  eyeIconText: {
    fontSize: 16,
    color: '#94A3B8',
  },

  inputPwWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },

  inputPw: {
    padding: 14,
    flex: 1,
  
  },
});