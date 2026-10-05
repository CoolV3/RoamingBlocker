import {View} from "react-native";

import {Appbar} from "react-native-paper";
import {useLocalSearchParams, useRouter} from "expo-router";
import SearchZones from "@/components/searchZones";

export default function AddByCountrie() {
    const router = useRouter()
    const {onboarding} = useLocalSearchParams<{onboarding?: string}>()
    const isOnboardingActive = onboarding == "true"

    return (
        <View>
            <Appbar.Header>
                <Appbar.Content title="Add countries" />
                <Appbar.BackAction onPress={() => {router.back()}} />
            </Appbar.Header>

            <SearchZones onboarding={isOnboardingActive}/>
        </View>
    )
}