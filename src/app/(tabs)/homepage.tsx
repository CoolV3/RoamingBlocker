import {View} from "react-native";
import BlockRoamingButton from "@/components/blockRoamingButton";
import {impactHaptic} from "@/lib/useHaptics"
import {useTheme, Text} from "react-native-paper";


export default function Homepage() {
    const theme = useTheme()
    return (
        <View className="relative items-center justify-center flex flex-col p-2 pt-10 h-full">
            <Text className="absolute top-10 text-4xl font-bold text-orange-500 pb-10" style={{color: theme.colors.primary, fontWeight: "bold"}}>RoamingGuard</Text>
            <View>
                <BlockRoamingButton title="Activate Roaming Guard" onPress={() => impactHaptic()}/>
            </View>
        </View>
    )
}