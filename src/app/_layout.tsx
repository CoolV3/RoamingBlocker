import "../global.css";

import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useColorScheme, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";

import {
    darkPaperTheme,
    lightPaperTheme,
} from "@/lib/appPaperTheme";

import {
    getThemeMode,
    subscribeToTheme,
    type ThemeMode,
} from "@/lib/themeStore";

export default function RootLayout() {
    const systemColorScheme = useColorScheme();

    const [themeMode, setThemeMode] =
        useState<ThemeMode>("system");

    const [themeLoaded, setThemeLoaded] =
        useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            const storedTheme = await getThemeMode();

            setThemeMode(storedTheme);
            setThemeLoaded(true);
        };

        void loadTheme();

        const unsubscribe = subscribeToTheme((newTheme) => {
            setThemeMode(newTheme);
        });

        return unsubscribe;
    }, []);

    const isDark =
        themeMode === "system"
            ? systemColorScheme === "dark"
            : themeMode === "dark";

    const currentTheme = isDark
        ? darkPaperTheme
        : lightPaperTheme;

    if (!themeLoaded) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor:
                        systemColorScheme === "dark"
                            ? darkPaperTheme.colors.background
                            : lightPaperTheme.colors.background,
                }}
            />
        );
    }

    return (
        <PaperProvider theme={currentTheme}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack screenOptions={{headerShown: false, contentStyle: {backgroundColor: currentTheme.colors.background,},}}>
                <Stack.Screen name="(tabs)" />
            </Stack>
        </PaperProvider>
    );
}