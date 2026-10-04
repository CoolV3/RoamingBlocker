
import { SegmentedButtons } from 'react-native-paper';
import {useCallback, useState} from "react";
import {useFocusEffect} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getThemeMode, setThemeMode, subscribeToTheme, ThemeMode} from "@/lib/themeStore";

const themeKey = "roamingguard.ui.theme"

export default function LightDarkModeToggle() {
    const [value, setValue] = useState<ThemeMode>("system")


    useFocusEffect(
        useCallback(() => {
            const loadTheme = async () => {
                const storedTheme = await getThemeMode()

                if (storedTheme !== null) {
                    setValue(storedTheme)
                }
            }

            void loadTheme()

            const unsubscribe = subscribeToTheme((newTheme) => {
                setValue(newTheme);
            });

            return unsubscribe;
        }, [])
    )

    const updateTheme = async (newTheme: ThemeMode) =>  {
        await setThemeMode(newTheme)
        setValue(newTheme)
    }

    return (
        <SegmentedButtons
            value={value}
            onValueChange={updateTheme}
            buttons={[
                {
                    value: 'light',
                    label: 'Light',
                    icon: "white-balance-sunny",
                },
                {
                    value: 'dark',
                    label: 'Dark',
                    icon: "moon-waning-crescent",
                },
                {
                    value: 'system',
                    label: 'System',
                    icon: "cellphone",
                }
            ]}
        />
    )
}