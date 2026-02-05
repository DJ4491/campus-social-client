import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { COLORS } from "./src/styles/theme";

export default function App() {
  const theme = {
    colors: {
      primary: COLORS.primary,
      accent: COLORS.accent,
      background: COLORS.background,
      surface: COLORS.card,
      text: COLORS.text,
    },
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
