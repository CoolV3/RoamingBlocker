import {View} from "react-native";
import {Text, Button, useTheme} from "react-native-paper"
import {CheckCircle} from "lucide-react-native";
import {useRouter} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const onboardingKey = "roamingguard.ui.onboardingCompleted"



export default function OnboardingWelcomeScreen() {
    const router = useRouter()
    const theme = useTheme()

    const finishOnboarding = async () => {
        await AsyncStorage.setItem(onboardingKey, "true")
        router.replace("/(tabs)/homepage")
    }

    return (
        <View className="flex items-center justify-between pt-20 h-full pb-5 p-2">
            <View>
                <View className="mb-2 items-center justify-center rounded-full p-5 w-20 self-center" style={{backgroundColor: theme.colors.primaryContainer}}>
                    <CheckCircle color={theme.colors.primary} size={40} className="bg-r"/>
                </View>

                <Text style={{textAlign: "center"}} className="text-2xl font-bold">You are all set!</Text>

                <Text className="pt-20 text-lg" style={{textAlign: "center"}}>
                    You completed the onboarding and can now use RoamingGuard.
                </Text>
            </View>
            <View>
                <Button onPress={() => finishOnboarding()} mode="contained" contentStyle={{ paddingHorizontal: 6, paddingVertical: 4 }} labelStyle={{ fontSize: 20, lineHeight: 36 }} >Finish onboarding</Button>
            </View>
        </View>
    )
}