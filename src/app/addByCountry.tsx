import {View} from "react-native";
import SearchCountries from "@/components/searchCountries";
import {Appbar} from "react-native-paper";
import {useRouter} from "expo-router";

export default function AddByCountrie() {
    const router = useRouter()

    return (
        <View>
            <Appbar.Header>
                <Appbar.Content title="Add countries" />
                <Appbar.BackAction onPress={() => {router.back()}} />
            </Appbar.Header>

            <SearchCountries/>
        </View>
    )
}