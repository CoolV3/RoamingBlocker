import {Tabs} from "expo-router";
import { Home, Funnel, Settings } from "lucide-react-native";
import {Pressable} from "react-native";
import {selectionHaptic} from "@/lib/useHaptics";
import { useTheme } from "react-native-paper";

export default function NavbarLayout() {
    const theme = useTheme();

    return (
        <Tabs initialRouteName="homepage" screenOptions={{headerShown: false,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: "#775a32",
            sceneStyle: {
                backgroundColor: theme.colors.background
            },
            tabBarStyle: {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.outlineVariant,
            },

            tabBarButton: (props) => (
                <Pressable
                    {...props} android_ripple={{ color: "transparent" }}
                />
            )
        }} screenListeners={{
            tabPress: () => {
                void selectionHaptic()
            }
        }}>
            <Tabs.Screen name="homepage" options={{
                title: "Home",
                tabBarIcon: ({color, size}) => (
                    <Home color={color} size={size} className="transition-colors duration-500"/>
                )}}
            />
            <Tabs.Screen name="rules" options={{
            title: "Rules",
            tabBarIcon: ({color, size}) => (
                <Funnel color={color} size={size}/>
            )}}
        />
            <Tabs.Screen name="settings" options={{
                title: "Settings",
                tabBarIcon: ({color, size}) => (
                    <Settings color={color} size={size}/>
                )}}
            />
        </Tabs>
    )
}