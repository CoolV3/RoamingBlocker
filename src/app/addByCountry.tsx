import {View} from "react-native";
import SearchCountries from "@/components/searchCountries";
import {Appbar} from "react-native-paper";
import {useLocalSearchParams, useRouter} from "expo-router";

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

            <SearchCountries onboarding={isOnboardingActive}/>
        </View>
    )
}