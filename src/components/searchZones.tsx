import {View, FlatList, Pressable, ScrollView} from "react-native";
import {Searchbar, List, Portal, Dialog, Button, Text, useTheme} from 'react-native-paper';
import {useCallback, useMemo, useState} from "react";
import {useRouter} from "expo-router";
import {RadioTower} from "lucide-react-native";

import {getCountryData, getCountryDataList, getEmojiFlag, TCountryCode} from "countries-list";

import RoamingGuard from "../../modules/roaming-guard/src/RoamingGuardModule";
import { type RoamingZone } from "../../modules/roaming-guard/src/RoamingGuardModule";


export default function SearchZones(onboarding: {onboarding: boolean}) {

    const theme = useTheme();

    const router = useRouter()

    const [search, setSearch] = useState("")
    const [showDialog, setShowDialog] = useState(false)
    const [currentZone, setCurrentZone] = useState<RoamingZone | null>(null)
    const [expanded, setExpanded] = useState(false)
    const zoneList = useMemo<RoamingZone[]>(() => {
        return RoamingGuard.getAvailableZones();
    }, []);


    const filteredZones = useMemo(() => {

        const query = search.trim().toLowerCase()

        if (!query) {
            return zoneList
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
        if (onboarding.onboarding) {
            router.push("/onboarding/step1AddCountries?added=true")
            return
        }
        router.replace("/(tabs)/rules");
    }, [currentZone, router]);


    const showZoneChoice = useCallback((zone: RoamingZone) => {
        setCurrentZone(zone);
        setShowDialog(true);
    }, []);

    return (
        <View>
            <View className="p-2 flex gap-4">
                <Searchbar value={search} onChangeText={(e) => setSearch(e)} className="" placeholder="Search for a zone"/>
                    <View>
                        {(filteredZones?.length ?? 0 ) > 0 ? (
                            <FlatList data={filteredZones ?? []} renderItem={({item}) => (
                                <List.Item description={`${item.countries.length} countries`} onPress={() => showZoneChoice(item)}  title={item.name} left={() => (<RadioTower color={theme.colors.onSurface} size={30}/>)}/>
                            )} />

                        ): (
                            <Text className="p-3">No Zones found</Text>
                        )}
                    </View>

            </View>

            <Portal>
                <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
                    <Dialog.Title>Alert</Dialog.Title>
                    <Dialog.Content className="flex items-center gap-2">
                        <Text className="text-lg">Would you like to add</Text>
                        <View className="flex items-center border-2 p-4 rounded-2xl" style={{ borderColor: theme.colors.primary }}>
                            <Text className="text-5xl"><RadioTower size={30}/></Text>
                            <Text style={{ textAlign: "center" }} className="text-3xl text-center">{currentZone?.name}</Text>
                        </View>
                        <Text className="text-lg">to allowed list?</Text>
                        <Button onPress={() => setExpanded(!expanded)}>{expanded ? "Show less" : "Show countries"}</Button>
                        <ScrollView className="w-full max-h-50" contentContainerClassName="gap-2 " showsVerticalScrollIndicator={false}>
                            {expanded && (
                                <View>
                                    {currentZone?.countries.map((code) => {
                                        const countryCode = code.toUpperCase() as TCountryCode
                                        const countryData = getCountryData(countryCode)
                                        const emoji = getEmojiFlag(countryCode)

                                        return (
                                            <List.Item key={code} className="flex flex-row" title={() => (<Text className="text-lg">{countryData.name}</Text>)} left={() => (<Text className="text-2xl">{emoji}</Text>)}/>
                                        )
                                    })}
                                </View>
                            )}
                        </ScrollView>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={addToAllowedList}>Add</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
}