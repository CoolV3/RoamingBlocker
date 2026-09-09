import {View, Text, ScrollView, Pressable} from "react-native";
import {Trash, Plus} from "lucide-react-native"
import { Button, List } from 'react-native-paper';
import { useRouter } from "expo-router";

export default function RulesPage() {
    const router = useRouter()

    return (
        <View className="items-center justify-start flex-1 flex-col p-2 pt-10">
            <Text className="text-4xl font-bold text-orange-500 pb-10">Rules</Text>
            <View className="flex gap-5">
                <View className="w-full max-h-70 flex-1 justify-start items-center">
                    <Text className="text-lg border-b-2">Allowed countries</Text>
                    <ScrollView className="w-full py-2" contentContainerClassName="gap-2 pb-10" showsVerticalScrollIndicator={false}>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                    </ScrollView>
                    <View className="flex flex-row items-end justify-end w-full">
                        <Button onPress={() => router.push("/selectSelectionMode")}  mode="contained" className="flex flex-row items-center justify-center">Add countries</Button>
                    </View>
                </View>
                <View className="w-full max-h-70 flex-1 justify-start items-center">
                    <Text className="text-lg border-b-2">Blocked countries</Text>
                    <ScrollView className="w-full py-2" contentContainerClassName="gap-2 pb-10" showsVerticalScrollIndicator={false}>
                        <List.Item title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                        <List.Item className="flex flex-row" title={() => (<Text className="text-lg">Germany</Text>)} left={() => (<Text className="text-2xl">🇩🇪</Text>)} right={() => (<Trash size={30}/>)}/>
                    </ScrollView>
                    <View className="flex flex-row items-end justify-end w-full">
                        <Button onPress={() => router.push("/selectSelectionMode")}  mode="contained" className="flex flex-row items-center justify-center">Add countries</Button>
                    </View>
                </View>
            </View>
        </View>
    )
}