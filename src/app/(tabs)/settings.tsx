import {View} from "react-native";
import SetShapeSettings from "@/components/setShapeSettings";
import DisableAffiliateLinks from "@/components/disableAffiliateLinksButton";
import DisableHapicButton from "@/components/disableHapticsButton";
import {Text, useTheme} from "react-native-paper"
import LightDarkModeToggle from "@/components/LightDarkModetoggle";
import SettingsFooter from "@/components/SettingsFooter";


export default function SettingsPage() {
    const theme = useTheme()

    return (
        <View className="flex justify-between h-full">
            <View className="flex flex-col items-center justify-center gap-4 pt-10 p-2">
                <Text className="text-4xl font-bold text-orange-500 pb-10" style={{color: theme.colors.primary, fontWeight: "bold"}}>Settings</Text>
                <View className="w-full ">
                    <Text className="text-lg">Choose a Shape</Text>
                    <SetShapeSettings/>
                </View>
                <View className="w-full">
                    <DisableAffiliateLinks/>
                </View>
                <View className="w-full">
                    <DisableHapicButton/>
                </View>
                <View className="w-full">
                    <LightDarkModeToggle/>
                </View>
            </View>
            <View className="items-center p-2">
                <SettingsFooter/>
            </View>
        </View>
    )
}