import {View, Text, FlatList, Pressable} from "react-native";
import {Searchbar, List, Portal, Dialog, Button} from 'react-native-paper';
import {useCallback, useMemo, useState} from "react";
import {useRouter} from "expo-router";
import {RadioTower} from "lucide-react-native";

import {getCountryDataList, getEmojiFlag, TCountryCode} from "countries-list";

import RoamingGuard from "../../modules/roaming-guard/src/RoamingGuardModule";
import { type RoamingZone } from "../../modules/roaming-guard/src/RoamingGuardModule";


export default function SearchZones() {

    const router = useRouter()

    const [search, setSearch] = useState("")
    const [showDialog, setShowDialog] = useState(false)
    const [currentZone, setCurrentZone] = useState<RoamingZone | null>(null)
    const zoneList = useMemo<RoamingZone[]>(() => {
        return RoamingGuard.getAvailableZones();
    }, []);


    const filteredZones = useMemo(() => {

        const query = search.trim().toLowerCase()

        if (!query) {
            return zoneList.slice(0, 5)
        }

        return (zoneList).filter((zone) => {
            return(
                zone.name.toLowerCase().includes(query) ||
                zone.id.toLowerCase().includes(query)
            )
        }).slice(0, 5)

    }, [search, zoneList])


    const addToAllowedList = useCallback(async () => {
        if (currentZone == null) {
            return
        }
        await RoamingGuard.addZone(currentZone.id);

        setShowDialog(false);
        setCurrentZone(null);
        router.replace("/(tabs)/rules");
    }, [currentZone, router]);


    const showZoneChoice = useCallback((zone: RoamingZone) => {
        setCurrentZone(zone);
        setShowDialog(true);
    }, []);

    return (
        <View>
            <View className="p-2">
                <Searchbar value={search} onChangeText={(e) => setSearch(e)} className="" placeholder="Search for a zone"/>
                {search.trim().length > 0 && (
                    <View>
                        {(filteredZones?.length ?? 0 ) > 0 ? (
                            <FlatList data={filteredZones ?? []} renderItem={({item}) => (
                                <List.Item description={`${item.countries.length} countries`} onPress={() => showZoneChoice(item)}  title={item.name} left={() => (<RadioTower size={30}/>)}/>
                            )} />

                        ): (
                            <Text className="p-3">No Zones found</Text>
                        )}
                    </View>
                )}
            </View>

            <Portal>
                <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
                    <Dialog.Title>Alert</Dialog.Title>
                    <Dialog.Content className="flex items-center gap-2">
                        <Text className="text-lg">Would you like to add</Text>
                        <View className="flex items-center border-2 p-4 rounded-2xl">
                            <Text className="text-5xl"><RadioTower size={30}/></Text>
                            <Text className="text-3xl text-center">{currentZone?.name}</Text>
                        </View>
                        <Text className="text-lg">to allowed list?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={addToAllowedList}>Add</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
}