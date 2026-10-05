import {View} from "react-native";
import {Text, Button, useTheme} from "react-native-paper"
import {Globe2, Earth, Globe} from "lucide-react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
export default function OnboardingWelcomeScreen() {
    const router = useRouter()
    const theme = useTheme()
    const {added} = useLocalSearchParams<{added?: string}>()
    const didFirstStep = added === "true"

    return (
        <View className="flex items-center justify-between pt-20 h-full pb-5 p-2">
            <View>
                <View className="mb-2 items-center justify-center rounded-full p-5 w-20 self-center" style={{backgroundColor: theme.colors.primaryContainer}}>
                    <Globe color={theme.colors.primary} size={40} className="bg-r"/>
                </View>
                {didFirstStep ? (
                    <View className="flex-1 items-center justify-between p-2">
                        <View>
                            <Text style={{textAlign: "center"}} className="text-2xl font-bold">Well done</Text>
                            <Text className="pt-20 text-lg" style={{textAlign: "center"}}>
                                Congrats, you added your first country/zone. You can add as much countries and zones as you like later.
                            </Text>
                        </View>
                        <View>
                            <Button onPress={() => router.push("/selectSelectionMode?onboarding=true")} mode="contained" contentStyle={{ paddingHorizontal: 6, paddingVertical: 4 }} labelStyle={{ fontSize: 20, lineHeight: 36 }} >Next step</Button>
                        </View>
                    </View>
                ): (
                <View className="flex-1 items-center justify-between p-2">
                    <View>
                        <Text style={{textAlign: "center"}} className="text-2xl font-bold">Lets add some countries</Text>

                        <Text className="pt-20 text-lg" style={{textAlign: "center"}}>
                            You can now choose countries or zones, which are collections of countries, that should be allowed by RoamingGuard.They get added to the allowed list. Every other country that is not on the allowed list will be blocked.
                        </Text>
                    </View>
                    <View>
                        <Button onPress={() => router.push("/selectSelectionMode?onboarding=true")} mode="contained" contentStyle={{ paddingHorizontal: 6, paddingVertical: 4 }} labelStyle={{ fontSize: 20, lineHeight: 36 }} >Add countries!</Button>
                    </View>
                </View>
                )}
            </View>
        </View>
    )
}