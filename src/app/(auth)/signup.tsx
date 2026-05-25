import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// ─── Design Tokens ──────────────────────────────────────────────────────────
const colors = {
  primary: '#002045',
  primaryContainer: '#1a365d',
  primaryFixed: '#d6e3ff',
  secondary: '#006a61',
  secondaryContainer: '#86f2e4',
  secondaryFixedDim: '#6bd8cb',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onPrimaryContainer: '#86a0cd',
  background: '#f8f9ff',
  surface: '#f8f9ff',
  surfaceBright: '#f8f9ff',
  surfaceContainer: '#e5eeff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainerLowest: '#ffffff',
  onBackground: '#0b1c30',
  onSurface: '#0b1c30',
  onSurfaceVariant: '#43474e',
  outline: '#74777f',
  outlineVariant: '#c4c6cf',
  error: '#ba1a1a',
  white: '#ffffff',
};

// ─── Minimal Icon placeholder ─────────────────────────────────────────────────
const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({
  name,
  size = 22,
  color = colors.onSurfaceVariant,
}) => {
  const iconMap: Record<string, string> = {
    school: '🎓',
    person: '👤',
    mail: '✉️',
    badge: '🪪',
    lock: '🔒',
    verified_user: '✓',
    visibility: '👁',
    visibility_off: '🙈',
    arrow_forward: '→',
    login: '→',
    check_box: '☑',
    check_box_outline_blank: '☐',
  };
  return (
    <Text style={{ fontSize: size * 0.72, color, lineHeight: size }}>
      {iconMap[name] ?? '•'}
    </Text>
  );
};

// ─── InputField Component ─────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  iconName: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  rightAction?: React.ReactNode;
  returnKeyType?: 'next' | 'done' | 'go';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput>;
  maxLength?: number;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  iconName,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  rightAction,
  returnKeyType = 'next',
  onSubmitEditing,
  inputRef,
  maxLength,
  error,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View
        style={[
          fieldStyles.wrapper,
          focused && fieldStyles.wrapperFocused,
          !!error && fieldStyles.wrapperError,
        ]}
      >
        <View style={fieldStyles.icon}>
          <Icon name={iconName} size={22} color={focused ? colors.secondary : colors.onSurfaceVariant} />
        </View>
        <TextInput
          ref={inputRef}
          style={[fieldStyles.input, rightAction ? { paddingRight: 44 } : null]}
          placeholder={placeholder}
          placeholderTextColor={colors.outlineVariant}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
        />
        {rightAction && <View style={fieldStyles.rightAction}>{rightAction}</View>}
      </View>
      {!!error && <Text style={fieldStyles.errorText}>{error}</Text>}
    </View>
  );
};

const fieldStyles = StyleSheet.create({
  group: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginBottom: 6,
    marginLeft: 2,
    letterSpacing: 0.1,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceBright,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 10,
    height: 50,
    overflow: 'hidden',
  },
  wrapperFocused: {
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  wrapperError: {
    borderColor: colors.error,
  },
  icon: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 14,
    color: colors.onSurface,
  },
  rightAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 2,
  },
});

// ─── RegisterScreen ───────────────────────────────────────────────────────────
const RegisterScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for focus chaining
  const emailRef = useRef<TextInput>(null);
  const nimRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.includes('@')) newErrors.email = 'Enter a valid email';
    if (nim.length < 6) newErrors.nim = 'Enter a valid Student ID';
    if (password.length < 8) newErrors.password = 'Minimum 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!termsAccepted) newErrors.terms = 'You must accept the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Atmospheric blobs */}
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobBottomRight]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Card ── */}
        <View style={styles.card}>

          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="school" size={32} color={colors.white} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Fonect campus recovery network</Text>
          </View>

          {/* Form Body */}
          <View style={styles.formBody}>

            {/* Full Name */}
            <TextInput
              placeholder='Full Name'
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Email + NIM side by side (stacked on mobile) */}
            <View style={styles.rowFields}>
              <View style={styles.rowFieldWide}>
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <View style={styles.rowFieldNarrow}>
                <InputField
                  label="Student ID"
                  iconName="badge"
                  placeholder="12345678"
                  value={nim}
                  onChangeText={(t) => setNim(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={12}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  inputRef={nimRef}
                  error={errors.nim}
                />
              </View>
            </View>

            {/* Password */}
            <InputField
              label="Password"
              iconName="lock"
              placeholder="Min. 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              inputRef={passwordRef}
              error={errors.password}
              rightAction={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'visibility_off' : 'visibility'}
                    size={22}
                    color={colors.outline}
                  />
                </TouchableOpacity>
              }
            />

            {/* Confirm Password */}
            <InputField
              label="Confirm Password"
              iconName="verified_user"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              inputRef={confirmRef}
              error={errors.confirmPassword}
            />

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setTermsAccepted(!termsAccepted)}
              activeOpacity={0.75}
            >
              <Icon
                name={termsAccepted ? 'check_box' : 'check_box_outline_blank'}
                size={20}
                color={termsAccepted ? colors.secondary : colors.outline}
              />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>
            {!!errors.terms && (
              <Text style={[fieldStyles.errorText, { marginTop: -8, marginBottom: 8 }]}>
                {errors.terms}
              </Text>
            )}

            {/* Register Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                activeOpacity={0.88}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <View style={styles.registerButtonInner}>
                    <Text style={styles.registerButtonText}>Register</Text>
                    <Icon name="arrow_forward" size={18} color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.footerLink}>
                Login {'→'}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },

  // Blobs
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    zIndex: -1,
    opacity: 0.4,
  },
  blobTopLeft: {
    width: width * 0.6,
    height: width * 0.6,
    top: -width * 0.15,
    left: -width * 0.1,
    backgroundColor: colors.secondaryFixedDim,
    // RN doesn't support CSS blur; use a library like @react-native-community/blur for true effect
  },
  blobBottomRight: {
    width: width * 0.7,
    height: width * 0.7,
    bottom: -width * 0.2,
    right: -width * 0.15,
    backgroundColor: colors.primaryFixed,
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },

  // Card Header
  cardHeader: {
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // Form
  formBody: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },

  // Row layout for Email + NIM
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  rowFieldWide: {
    flex: 3,
  },
  rowFieldNarrow: {
    flex: 2,
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
    marginTop: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
  },
  termsLink: {
    color: colors.secondary,
    fontWeight: '600',
  },

  // Register Button
  registerButton: {
    backgroundColor: colors.secondary,
    borderRadius: 9999,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  registerButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.1,
  },

  // Card Footer
  cardFooter: {
    backgroundColor: colors.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default RegisterScreen;