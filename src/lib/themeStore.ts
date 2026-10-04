
import AsyncStorage from "@react-native-async-storage/async-storage";

export const THEME_KEY = "roamingguard.ui.theme";

export type ThemeMode = "light" | "dark" | "system";

type ThemeListener = (theme: ThemeMode) => void;

const listeners = new Set<ThemeListener>();

export async function getThemeMode(): Promise<ThemeMode> {
    const storedTheme = await AsyncStorage.getItem(THEME_KEY);

    if (
        storedTheme === "light" ||
        storedTheme === "dark" ||
        storedTheme === "system"
    ) {
        return storedTheme;
    }

    return "system";
}

export async function setThemeMode(
    theme: ThemeMode
): Promise<void> {
    await AsyncStorage.setItem(THEME_KEY, theme);

    listeners.forEach((listener) => {
        listener(theme);
    });
}

export function subscribeToTheme(
    listener: ThemeListener
): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}