import {Tabs} from "expo-router";
import { Home, Funnel, Settings } from "lucide-react-native";
import {Pressable} from "react-native";
import * as Haptics from "expo-haptics";

export default function NavbarLayout() {

    return (
        <Tabs initialRouteName="homepage" screenOptions={{headerShown: false,
            tabBarActiveTintColor: "#fba32b",
            tabBarInactiveTintColor: "#775a32",

            tabBarButton: (props) => (
                <Pressable
                    {...props} android_ripple={{ color: "transparent" }}
                />
            )
        }} screenListeners={{
            tabPress: () => {
                void Haptics.selectionAsync()
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