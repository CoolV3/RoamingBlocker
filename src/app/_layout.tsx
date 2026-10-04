import '../global.css'
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { useColorScheme } from "react-native";
import {
    darkPaperTheme,
    lightPaperTheme,
} from "@/lib/appPaperTheme";
import {LucideIcon} from "lucide-react-native"

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const currentTheme = colorScheme === "light" ? lightPaperTheme : darkPaperTheme

  return (
      <PaperProvider theme={currentTheme} >
          <Stack screenOptions={{headerShown: false, contentStyle: {backgroundColor: currentTheme.colors.background,},}}>
            <Stack.Screen name="(tabs)"/>
          </Stack>
      </PaperProvider>
  );
}
