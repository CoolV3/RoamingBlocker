import {View, Text} from "react-native";
import SetShapeSettings from "@/components/setShapeSettings";
import DisableAffiliateLinks from "@/components/disableAffiliateLinksButton";


export default function SettingsPage() {

    return (
        <View className="flex flex-col items-center justify-center  pt-20 p-2">
            <View className="w-full ">
                <Text className="text-lg">Choose a Shape</Text>
                <SetShapeSettings/>
            </View>
            <View className="w-full">
                <DisableAffiliateLinks/>
            </View>
        </View>
    )
}