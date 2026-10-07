import {View} from "react-native";
import {Text, useTheme} from "react-native-paper"
import {Copyright} from "lucide-react-native";
import {useRouter} from "expo-router";


export default function SettingsFooter() {
    const theme = useTheme()
    const router = useRouter()



    return (
        <View className="flex flex-row items-center justify-center gap-2">
            <View className="flex flex-row items-center justify-center gap-1">
                <Copyright color={theme.colors.primaryContainer} size={14}/>
                <Text style={{fontSize: 14, color: theme.colors.primaryContainer}}>Constantin Meier</Text>
            </View>
            <Text style={{fontSize: 14, color: theme.colors.primaryContainer}}>--</Text>
            <Text style={{fontSize: 14, color: theme.colors.primaryContainer}} onPress={() => router.push("/onboarding/welcome")}>Retake onboarding</Text>
        </View>
    )
}