import {View, Text} from "react-native";
import SetShapeSettings from "@/components/setShapeSettings";


export default function SettingsPage() {

    return (
        <View className="flex flex-col items-center justify-center  pt-20 p-2">
            <View className="w-full ">
                <SetShapeSettings/>
            </View>
        </View>
    )
}