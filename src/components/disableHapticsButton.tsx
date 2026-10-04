import AsyncStorage from "@react-native-async-storage/async-storage";
import {useFocusEffect} from "expo-router";
import {useCallback, useState} from "react";
import {Box, Host, ListItem, Switch, Text} from '@expo/ui/jetpack-compose'
import {clip, fillMaxWidth, Shapes, width} from "@expo/ui/jetpack-compose/modifiers";
import {background} from "@expo/ui/swift-ui/modifiers";
import {HapticStatusKey, selectionHaptic} from "@/lib/useHaptics"

export default function DisableHapicButton() {
    const [useHaptic, setUseHaptic] = useState(true)

    const updateHapticStatus = async (value: boolean) => {
        await AsyncStorage.setItem(HapticStatusKey, String(value))
        await selectionHaptic()
        setUseHaptic(value)
    }

    useFocusEffect(
        useCallback(() => {
            const loadHapticStatus = async () => {
                const status = await AsyncStorage.getItem(HapticStatusKey)
                if (status != null) {
                    setUseHaptic(status == "true")
                }
            }
            void loadHapticStatus()
        }, [])
    )

    return (

            <Host matchContents={{ vertical: true }}>
                <ListItem modifiers={[fillMaxWidth(), clip(Shapes.RoundedCorner(20)), background("#2b2116"),]}>
                    <ListItem.HeadlineContent>
                        <Text style={{ typography: 'titleMedium' }}>Haptic feedback</Text>
                    </ListItem.HeadlineContent>
                    <ListItem.SupportingContent>
                        <Text style={{ typography: 'bodyMedium' }}>Get haptic feedback in the app</Text>
                    </ListItem.SupportingContent>
                    <ListItem.TrailingContent>
                        <Switch value={useHaptic} onCheckedChange={updateHapticStatus} colors={{
                            checkedThumbColor: '#bf7209',
                            checkedTrackColor: '#fba32b',
                            uncheckedThumbColor: '#5f4017',
                            uncheckedTrackColor: '#775a32',
                            uncheckedBorderColor: '#D1D5DB',
                        }} />
                    </ListItem.TrailingContent>
                </ListItem>

            </Host>

    )
}