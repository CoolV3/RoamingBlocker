import {View} from "react-native";

import {Appbar} from "react-native-paper";
import {useRouter} from "expo-router";
import SearchZones from "@/components/searchZones";

export default function AddByCountrie() {
    const router = useRouter()

    return (
        <View>
            <Appbar.Header>
                <Appbar.Content title="Add countries" />
                <Appbar.BackAction onPress={() => {router.back()}} />
            </Appbar.Header>

            <SearchZones/>
        </View>
    )
}