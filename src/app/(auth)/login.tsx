import { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Icon components using Unicode/Emoji as placeholder
// In a real app, replace with react-native-vector-icons or similar

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';


export default function login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
    else {
      router.push('/(tabs)/home');
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#EEF2FF" />

      {/* Header */}
      <View style={styles.header}>
       

        <Text style={styles.brandName}>Fonect</Text>
        <Text style={styles.tagline}>
          Temukan barang anda yang hilang{'\n'}dengan mudah dan seru!
        </Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Masuk ke Akun</Text>
        <Text style={styles.cardSubtitle}>Senang melihat Anda kembali.</Text>

        {/* Email Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Alamat Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#B0B8C9" />
            <TextInput
              style={styles.input}
              placeholder="nama@email.com"
              placeholderTextColor="#B0B8C9"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.fieldContainer}>
          <View style={styles.passwordLabelRow}>
            <Text style={styles.label}>Kata Sandi</Text>
            <TouchableOpacity>
              <Text style={styles.forgotLink}>Lupa Sandi?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#B0B8C9" />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#B0B8C9"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIconText}>{showPassword ? <Ionicons name="eye-outline" size={20} color="#B0B8C9" /> : <Ionicons name="eye-off-outline" size={20} color="#B0B8C9" />}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} activeOpacity={0.85} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Masuk Sekarang</Text>
        </TouchableOpacity>


        {/* Sign Up */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signupLink}>Daftar Gratis</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2026 Fonect — Membantu Memulihkan Barang Hilang.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  contentContainer: {
    paddingBottom: 32,
    alignItems: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#1A56E8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A56E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  logoIconText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A56E8',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '92%',
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
  },

  // Fields
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A56E8',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
  },
  inputIconText: {
    fontSize: 16,
    marginRight: 10,
    color: '#94A3B8',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    padding: 0,
    marginLeft: 10,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIconText: {
    fontSize: 16,
    color: '#94A3B8',
  },

  // Login Button
  loginButton: {
    backgroundColor: '#1A56E8',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#1A56E8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 13,
    color: '#94A3B8',
    paddingHorizontal: 12,
  },

  // Google Button
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  googleButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  // Sign Up
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#64748B',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A56E8',
  },

  // Footer
  footer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
});
