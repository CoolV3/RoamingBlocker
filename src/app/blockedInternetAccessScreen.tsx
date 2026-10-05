import {View} from "react-native";
import {useLocalSearchParams} from "expo-router";
import {getCountryData, getCountryDataList, getEmojiFlag, TCountryCode} from "countries-list";
import BuyEsimButton from "@/components/buyEsimButton";
import {Text, useTheme} from "react-native-paper"
import type { ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import {Button} from "react-native-paper";
import {useRef, useState} from "react";
import RoamingGuard from "../../modules/roaming-guard/src/RoamingGuardModule";
import {useRouter} from "expo-router";
import {align} from "@expo/ui/jetpack-compose/modifiers";

export default function InternetBlockedAccessScreen() {
    const router = useRouter()
    const { countryCode } = useLocalSearchParams<{countryCode: TCountryCode}>()
    const theme = useTheme();

    const currentCountryData = getCountryData(countryCode)
    const currentCountryEmoji = getEmojiFlag(countryCode)

    const [visible, setVisible] = useState(false);
    const sheetRef = useRef<ModalBottomSheetRef>(null);

    const hideSheet = async () => {
        await sheetRef.current?.hide();
        setVisible(false);
    };

    const disableProtection = async () => {
        await RoamingGuard.disableCountryWatching()
        router.replace("/")
    }

    const whitelistCurrentCountry = async () => {
        await RoamingGuard.disableCountryWatching()
        await RoamingGuard.addCountry(countryCode)
        await RoamingGuard.enableCountryWatching()
        router.replace("/rules")
    }

    return(
        <View className="items-center justify-between flex-1 flex-col p-2 pt-10">
            <View className="flex items-center text-center">
                <Text className="text-4xl">RoamingGuard</Text>
                <Text className="text-center text-lg" style={{ textAlign: "center" }}>Detected a country change and blocked your network traffic.</Text>

                <View className="p-10">
                    <Text className="text-2xl">Detected country</Text>
                    <View className="flex items-center border-2 p-4 rounded-2xl" style={{ borderColor: theme.colors.primary }}>
                        <Text className="text-5xl">{currentCountryEmoji}</Text>
                        <Text className="text-3xl text-center">{currentCountryData.name}</Text>
                    </View>
                </View>
            </View>
            <View className="flex gap-3 pb-10">
                <BuyEsimButton/>
                <Button mode="outlined" onPress={whitelistCurrentCountry}>Whitelist country</Button>
                <Button mode="outlined" onPress={disableProtection}>Disable Protection</Button>
            </View>


        </View>
    )
}