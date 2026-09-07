import {View, Text} from "react-native";
import BlockRoamingButton from "@/components/blockRoamingButton";
import * as Haptics from "expo-haptics"


export default function Homepage() {

    return (
        <View className="items-center justify-center flex flex-col p-2 pt-10">
            <Text className="text-4xl font-bold text-orange-500">RoamingBlocker</Text>
            <View>
                <BlockRoamingButton title="Activate Roaming Guard" onPress={() => Haptics.impactAsync()}/>
            </View>
        </View>
    )
}