import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

export const HapticStatusKey = "roamingguard.ui.hapticsEnabled"


const checkHaptics = async () => {
    const storedHaptics = await AsyncStorage.getItem(HapticStatusKey);
    return storedHaptics == "true"
}

export async function selectionHaptic() {
    const enabled = await checkHaptics()
    if (!enabled) return
    await Haptics.selectionAsync()
}

export async function impactHaptic() {
    const enabled = await checkHaptics()
    if (!enabled) return
    await Haptics.impactAsync()
}
