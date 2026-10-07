import {View} from "react-native";
import {Text, Button, useTheme} from "react-native-paper"
import {ArrowBigDownDash, Sparkles, Radar, ShieldLock, GlobeOff} from "lucide-react-native";
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

                <Text style={{textAlign: "center"}} className="text-2xl font-bold">How it works</Text>

                <View className="flex items-center justify-center pt-10 mb-4 gap-0 p-2 w-full">

                    <View className="flex items-center w-full px-2">
                        <View className="flex flex-row rounded-2xl w-full p-5 items-center gap-2" style={{backgroundColor: theme.colors.primaryContainer}}>
                            <Text className="text-lg flex-1 min-w-0" style={{textAlign: "center", color: theme.colors.primary, flexShrink: 1,}} >
                                RoamingGuard detects a disallowed country
                            </Text>
                            <Radar color={theme.colors.primary} size={40}  />
                        </View>
                        <ArrowBigDownDash color={theme.colors.primary} size={40} className="mt-4"/>
                    </View>

                    <View className="flex items-center px-2 w-full">
                        <View className="flex flex-row rounded-2xl w-full p-5 items-center gap-2" style={{backgroundColor: theme.colors.primaryContainer}}>
                            <Text className="text-lg flex-1 min-w-0" style={{textAlign: "center", color: theme.colors.primary, flexShrink: 1,}} >
                                RoamingGuard immediately blocks your Internet connection via VPN.
                            </Text>
                            <GlobeOff color={theme.colors.primary} size={40}  />
                        </View>
                        <ArrowBigDownDash color={theme.colors.primary} size={40} className="mt-4"/>
                    </View>

                    <View className="flex items-center px-2 w-full">
                        <View className="flex flex-row rounded-2xl w-full p-2 items-center gap-2" style={{backgroundColor: theme.colors.primaryContainer}}>
                            <Text className="text-lg flex-1 min-w-0" style={{textAlign: "center", color: theme.colors.primary, flexShrink: 1,}} >
                                We´ll notify you that your Internet connection has been blocked.
                            </Text>
                            <ShieldLock color={theme.colors.primary} size={40}  />
                        </View>
                        <ArrowBigDownDash color={theme.colors.primary} size={40} className="mt-4"/>
                    </View>
                </View>

            </View>
            <View>
                <Button onPress={() => router.push("/onboarding/step1AddCountries")} mode="contained" contentStyle={{ paddingHorizontal: 6, paddingVertical: 4 }} labelStyle={{ fontSize: 20, lineHeight: 36 }}>Set it up!</Button>
            </View>
        </View>
    )
}