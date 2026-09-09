import {View, Text, FlatList, Pressable} from "react-native";
import {Appbar, Card, Button} from 'react-native-paper';
import {useRouter} from "expo-router";

export default function AddNewCountriesPage() {
    const router = useRouter()

    return(
        <View className="flex-1">
            <Appbar.Header>
                <Appbar.Content title="Add countries" />
                <Appbar.BackAction onPress={() => {router.back()}} />
            </Appbar.Header>


            <View className="p-2 items-center justify-center flex-1 ">
                <Card className="">
                    <Card.Title title={(<Text className="text-2xl">Select your selection mode.</Text>)}/>
                    <Card.Content>
                        <Text>You can either choose to add whole roaming zones like EU Roaming Zone 1 or you add your countries one by one.</Text>
                    </Card.Content>

                    <Card.Actions>
                        <Button onPress={() => router.push("/addByCountry")}>Add countries</Button>
                        <Button>Add zones</Button>
                    </Card.Actions>
                </Card>
            </View>
        </View>
    )
}