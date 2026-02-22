import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
import { auth } from "../FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { COLORS, SPACING } from "../src/styles/theme";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "");

export default function Login({ navigation = null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSignInButtonPress() {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      if (userCredential?.user) {
        // AuthProvider will detect the Firebase auth state change automatically
        // No need to manually update session - Firebase auth persistence handles it
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Sign in failed. Please try again.";
      
      if (error?.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error?.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error?.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (error?.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Sign in failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function goToSignUp() {
    navigation?.navigate?.("SignUp") || navigation?.replace?.("SignUp");
  }

  function goToForgotPassword() {
    navigation?.navigate?.("ForgotPassword");
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
          {/* Branding */}
          <View style={styles.brandWrap}>
            <View style={styles.logoCircle}>
              <Ionicons name="business" size={44} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>Campus Social</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                placeholder="Password"
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

            <TouchableOpacity onPress={goToForgotPassword} style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={onSignInButtonPress}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signUpRow}>
              <Text style={styles.signUpPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={goToSignUp}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social login */}
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
              <Ionicons name="logo-google" size={22} color="#5F6368" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
              <Ionicons name="logo-apple" size={24} color="#1d1d1d" />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
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
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: SPACING.l,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: SPACING.xl,
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8ECF0",
  },
  dividerText: {
    marginHorizontal: SPACING.m,
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: "600",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E8ECF0",
    minHeight: 52,
    marginBottom: SPACING.m,
    paddingHorizontal: SPACING.m,
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
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: SPACING.s,
  },
});
