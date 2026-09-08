import '../global.css'
import { Stack } from "expo-router";
import { MD3LightTheme, PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
      <PaperProvider theme={MD3LightTheme} settings={{icon: (props) => <LucideIcon {...props} />,}}>
          <Stack screenOptions={{ headerShown: false}}>
            <Stack.Screen name="(tabs)"/>
          </Stack>
      </PaperProvider>
  );
}
