import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { auth } from "../FirebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../src/styles/theme";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "");

export default function Register({ navigation = null }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signUpWithEmail() {
    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter your full name.");
      return;
    }
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password too short", "Password must be at least 6 characters.");
      return;
    }
    
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      
      // Update the user's display name
      if (userCredential?.user) {
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
        
        Alert.alert("Success", "Account created successfully!");
        // AuthProvider will detect the Firebase auth state change automatically
      }
    } catch (error) {
      console.error("Sign up error:", error);
      let errorMessage = "Sign up failed. Please try again.";
      
      if (error?.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Try signing in instead.";
      } else if (error?.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error?.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Sign up failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function goToLogin() {
    navigation?.navigate?.("Login") ?? navigation?.replace?.("Login");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandWrap}>
            <View style={styles.logoCircle}>
              <Ionicons name="business" size={44} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>Campus Social</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={COLORS.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 characters)"
                placeholderTextColor={COLORS.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.muted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={signUpWithEmail}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signUpRow}>
              <Text style={styles.signUpPrompt}>Already have an account? </Text>
              <TouchableOpacity onPress={goToLogin}>
                <Text style={styles.signUpLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xl * 1.5,
    paddingBottom: SPACING.xl,
  },
  brandWrap: {
    alignItems: "center",
    marginBottom: SPACING.xl * 2,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${COLORS.primary}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.m,
  },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: SPACING.s,
  },
  form: {
    width: "100%",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E8ECF0",
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.m,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  inputIcon: {
    marginRight: SPACING.s,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: SPACING.s,
  },
  eyeButton: {
    padding: SPACING.s,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.s,
    marginBottom: SPACING.l,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpPrompt: {
    fontSize: 15,
    color: COLORS.muted,
  },
  signUpLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "700",
  },
});
