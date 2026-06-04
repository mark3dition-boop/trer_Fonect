import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from '../../context/authContext';
import { supabase } from '../../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
type SubmitState = 'idle' | 'loading' | 'success';

interface SelectOption {
  label: string;
  value: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS: SelectOption[] = [
  { label: 'Select Color', value: '' },
  { label: 'Black', value: 'black' },
  { label: 'White', value: 'white' },
  { label: 'Silver / Grey', value: 'silver' },
  { label: 'Blue', value: 'blue' },
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Other', value: 'other' },
];

const CATEGORIES: SelectOption[] = [
  { label: 'Select Type', value: '' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Keys', value: 'keys' },
  { label: 'Wallet / Card', value: 'wallet' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Other', value: 'other' },
];

// ─── Mini Select Component ────────────────────────────────────────────────────
interface InlineSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
}

const InlineSelect: React.FC<InlineSelectProps> = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={styles.selectWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setOpen(prev => !prev)}
        activeOpacity={0.8}
      >
        <Text style={[styles.selectText, !value && styles.placeholder]}>
          {selected ? selected.label : options[0].label}
        </Text>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {options.slice(1).map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.dropdownItem, value === opt.value && styles.dropdownItemActive]}
              onPress={() => { onChange(opt.value); setOpen(false); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, value === opt.value && styles.dropdownTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
const ReportFoundItem: React.FC = () => {
  const [itemName, setItemName] = useState('');
  const [color, setColor] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const router = useRouter();

  // Get data user
  const { profile } = useAuth();

  // Form validation state
  const [errors, setErrors] = useState({
        image: false,
        itemName: false,
        color: false,
        category: false,
        location: false,
    });

  const validateForm = () => {
    const newErrors = {
        image: !imageUri,
        itemName: itemName.trim() === '',
        color: color === '',
        category: category === '',
        location: location.trim() === '',
    };

    setErrors(newErrors);

    return !Object.values(newErrors).includes(true);
   };

  // Pick image from gallery
  const handleImagePress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality:1,
    });

    if (!result.canceled) {
        setImageUri(result.assets[0].uri);
    }
    // if (imageUri) return;
    // setImageUri('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800');
  };


  const handleRemoveImage = () => setImageUri(null);


  const uploadImageToSupabase = async () => {
    if (!imageUri) return null;

    try {
        const response = await fetch(imageUri);

        const arrayBuffer = await response.arrayBuffer();

        const fileExt = imageUri.split(".").pop() || "jpg";

        const fileName = `${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
        .from("item_img_bucket")
        .upload(fileName, arrayBuffer, {
            contentType: `image/${fileExt}`,
        });

        if (error) {
            Alert.alert("Error", error.message)
            return null;
        }

        const { data } = supabase.storage
        .from("item_img_bucket")
        .getPublicUrl(fileName);

        return data.publicUrl;

    } catch (err) {
        console.log(err);
        return null;
    }
  };
  

  const handleSubmit = async () => {
    if (submitState !== 'idle') return;

    const isValid = validateForm();

    if (!isValid){
        Alert.alert("Validation Error", "Please fill in all required fields.");
        return;
    }

    try {
        setSubmitState('loading');

        // upload image dulu
        const imageUrl = await uploadImageToSupabase();

        if (!imageUrl) {
            alert("Failed to upload image");
            setSubmitState('idle');
            return;
        }

        // simpan ke table
        const { error } = await supabase
        .from("items")
        .insert({
            item_name: itemName,
            color: color,
            category: category,
            location: location,
            desc: description,
            img_url: imageUrl,
            user_id: profile?.id,
            status: 'found',
        });

        if (error) {
            console.log(error);
            alert("Failed to save item");
            setSubmitState('idle');
            return;
        }

        // animasi success
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.96,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true,
            }),
        ]).start();

        setSubmitState('success');

    } catch (err) {
        console.log(err);
        alert("Something went wrong");
        setSubmitState('idle');
    }
  };

  const resetForm = () => {
    setItemName('');
    setColor('');
    setCategory('');
    setLocation('');
    setDescription('');
    setImageUri(null);
    setSubmitState('idle');
  };

  // Reset form after showing success state for a moment
  useFocusEffect(
    useCallback(() => {
        resetForm();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9ff" />

      {/* ── Top App Bar ───────────────────────────────────────── */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.push('/home')}>
            <Ionicons name="arrow-back-outline" size={20}></Ionicons>
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Report Found Item</Text>
        </View>
      </View>

      {/* ── Scrollable Form ───────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo upload */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Item Photo<Text style={{ color: "red" }}>*</Text></Text>

          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveImage} activeOpacity={0.8}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBox} onPress={handleImagePress} activeOpacity={0.8}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadTitle}>Tap to upload item photo</Text>
              <Text style={styles.uploadSubtitle}>JPEG, PNG up to 10MB</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Item name */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Item Name<Text style={{ color: "red" }}>*</Text></Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Blue HydroFlask"
            placeholderTextColor="#74777f"
            value={itemName}
            onChangeText={setItemName}
            returnKeyType="next"
          />
        </View>

        {/* Color & Category */}
        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={{ marginBottom: -20, fontWeight: 600}}>Primary Color<Text style={{ color: "red" }}>*</Text></Text>
            <InlineSelect label="" options={COLORS} value={color} onChange={setColor} />
          </View>
          <View style={styles.halfCol}>
            <Text style={{ marginBottom: -20, fontWeight: 600 }}>Category<Text style={{ color: "red" }}>*</Text></Text>
            <InlineSelect label="" options={CATEGORIES} value={category} onChange={setCategory} />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Location Found<Text style={{ color: "red" }}>*</Text></Text>
          <View style={styles.inputWithIcon}>
            <Text style={styles.inputIconLeft}>📍</Text>
            <TextInput
              style={styles.textInputIcon}
              placeholder="Campus Library, 2nd Floor"
              placeholderTextColor="#74777f"
              value={location}
              onChangeText={setLocation}
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Detailed Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Mention any unique marks, stickers, or specific details to help identify the owner..."
            placeholderTextColor="#74777f"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Privacy note */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            By posting, you agree to drop this item off at the Campus Security office or hand it over directly to the owner within 24 hours.
          </Text>
        </View>

        {/* Bottom spacer so content isn't hidden behind fixed footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Fixed Footer ──────────────────────────────────────── */}
      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '90%' }}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              submitState === 'success' && styles.submitBtnSuccess,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.9}
            disabled={submitState !== 'idle'}
          >
            {submitState === 'loading' ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : submitState === 'success' ? (
              <Text style={styles.submitBtnText}>✓  Item Reported!</Text>
            ) : (
              <Text style={styles.submitBtnText}>Post Item</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const palette = {
  primary: '#002045',
  secondary: '#006a61',
  onSecondary: '#ffffff',
  background: '#f8f9ff',
  surface: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceVariant: '#d3e4fe',
  outline: '#74777f',
  outlineVariant: '#c4c6cf',
  onSurface: '#0b1c30',
  onSurfaceVariant: '#43474e',
  error: '#ba1a1a',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },

  // ── App Bar
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: palette.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.outlineVariant,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.primary,
    letterSpacing: -0.2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 18,
    color: palette.primary,
    fontWeight: '500',
  },

  // ── Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  // ── Sections
  section: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.onSurfaceVariant,
    letterSpacing: 0.1,
    marginBottom: 8,
  },

  // ── Image Upload
  uploadBox: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadIcon: { fontSize: 32 },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: palette.outline,
    letterSpacing: 0.2,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Text Input
  textInput: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surface,
    fontSize: 16,
    color: palette.onSurface,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surface,
    paddingHorizontal: 12,
    gap: 8,
  },
  inputIconLeft: { fontSize: 18 },
  textInputIcon: {
    flex: 1,
    fontSize: 16,
    color: palette.onSurface,
  },
  textArea: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surface,
    fontSize: 14,
    color: palette.onSurface,
    minHeight: 100,
  },

  // ── Row layout
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    zIndex: 10,
  },
  halfCol: {
    flex: 1,
    padding: 1,
  },

  // ── Inline Select
  selectWrapper: {
    zIndex: 10,
  },
  selectBox: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    backgroundColor: palette.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 14,
    color: palette.onSurface,
    flex: 1,
  },
  placeholder: {
    color: palette.outline,
  },
  chevron: {
    fontSize: 10,
    color: palette.outline,
    marginLeft: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 84,
    left: 0,
    right: 0,
    backgroundColor: palette.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    zIndex: 999,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dropdownItemActive: {
    backgroundColor: palette.surfaceVariant,
  },
  dropdownText: {
    fontSize: 14,
    color: palette.onSurface,
  },
  dropdownTextActive: {
    color: palette.secondary,
    fontWeight: '600',
  },

  // ── Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: palette.surfaceVariant,
    borderRadius: 12,
    padding: 14,
  },
  infoIcon: { fontSize: 14, marginTop: 1 },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: palette.onSurfaceVariant,
    letterSpacing: 0.2,
  },

  // ── Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.surface,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    alignItems: 'center',
    gap: 5,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.outlineVariant,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  submitBtn: {
    width: '100%',
    height: 56,
    backgroundColor: palette.secondary,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnSuccess: {
    backgroundColor: palette.primary,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.onSecondary,
    letterSpacing: 0.2,
  },
  pointsText: {
    fontSize: 12,
    color: palette.outline,
    letterSpacing: 0.2,
  },
  pointsBold: {
    color: palette.secondary,
    fontWeight: '700',
  },
});

export default ReportFoundItem;