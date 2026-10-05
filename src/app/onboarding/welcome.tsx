import {View} from "react-native";
import {Text, Button, useTheme} from "react-native-paper"
import {ArrowRight, Sparkles} from "lucide-react-native";
import {useRouter} from "expo-router";
export default function OnboardingWelcomeScreen() {
    const router = useRouter()
    const theme = useTheme()
    return (
        <View className="flex items-center justify-between pt-20 h-full pb-5 p-2">
            <View>
                <View className="mb-2 items-center justify-center rounded-full p-5 w-20 self-center" style={{backgroundColor: theme.colors.primaryContainer}}>
                    <Sparkles color={theme.colors.primary} size={40} className="bg-r"/>
                </View>

                <Text style={{textAlign: "center"}} className="text-2xl font-bold">Welcome to</Text>
                <Text style={{textAlign: "center"}} className="text-4xl font-bold">RoamingGuard</Text>

                <Text className="pt-20 text-lg" style={{textAlign: "center"}}>
                    In the next steps we`ll set up RoamingGuard for your needs, so that you never receive any unexpected roaming bills again
                </Text>
            </View>
            <View>
                <Button onPress={() => router.push("/onboarding/step1AddCountries")} mode="contained" contentStyle={{ paddingHorizontal: 6, paddingVertical: 4 }} labelStyle={{ fontSize: 20, lineHeight: 36 }} >Get Started</Button>
            </View>
        </View>
    )
}