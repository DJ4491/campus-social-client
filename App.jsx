import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthContext } from "./hooks/use-auth-context";
import AppNavigator from "./navigation/AppNavigator";
import AuthProvider from "./providers/auth-provider";
import Login from "./screens/login";
import Register from "./screens/register";

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      id="AuthStack"
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={Register} />
    </Stack.Navigator>
  );
}

/**
 * Auth flow = Session listener + conditional navigation.
 * Session exists → show Home (tabs). No session → show Login/SignUp stack.
 */
function AuthGate() {
  const { session, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3AADE0" />
      </View>
    );
  }

  if (session) {
    console.log("[AuthGate] session exists, showing AppNavigator");
    return <AppNavigator />;
  }
  console.log("[AuthGate] no session, showing AuthStack (Login/Register)");
  return <AuthStack />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AuthGate />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFCFE",
  },
});
