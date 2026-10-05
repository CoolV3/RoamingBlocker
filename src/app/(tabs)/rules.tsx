import {View, ScrollView, Pressable} from "react-native";
import {Trash, RadioTower, ChevronUp, ChevronDown} from "lucide-react-native"
import {Button, Dialog, Divider, List, Portal, Text, useTheme} from 'react-native-paper';
import { useRouter } from "expo-router";

import RoamingGuard, {type RoamingZone} from "../../../modules/roaming-guard/src/RoamingGuardModule";

import {useCallback, useEffect, useState} from "react";
import {getCountryData, getEmojiFlag, TCountryCode} from "countries-list";
import {currencies} from "countries-list/currencies";
import {red500} from "react-native-paper/src/styles/themes/v2/colors";

type CountryCode = {
    name: string,
    flag: string,
    nativeName: string,
    countryCode: TCountryCode
}

export default function RulesPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [allowedCountries, setAllowedCountries] = useState<CountryCode[]>([])
    const [zones, setZones] = useState<RoamingZone[]>([])
    const [expandedZones, setExpandedZones] = useState<Set<string>>(() => new Set())
    const [showDeleteWarning, setShowDeleteWarning] = useState(false)
    const [showDeleteZoneWarning, setShowDeleteZoneWarning] = useState(false)
    const [deleteId, setDeleteId] = useState("")

    const theme = useTheme();

    const toggleZone = (zoneId: string) => {
        setExpandedZones((current) => {
            const updated = new Set(current)
            if (updated.has(zoneId)) {
                updated.delete(zoneId)
            } else {
                    updated.add(zoneId)
                }
            return updated
        })
    }

    const loadAllowedCountries = useCallback(async () => {
        try {
            setLoading(true);

            const [standaloneCountries, selectedZoneIds] = await Promise.all([
                RoamingGuard.getStandaloneCountries(),
                RoamingGuard.getSelectedZoneIds(),
            ]);

            const availableZones = RoamingGuard.getAvailableZones();

            const mappedCountries = standaloneCountries
                .map((code): CountryCode | null => {
                    const countryCode = code.toUpperCase() as TCountryCode;
                    const countryData = getCountryData(countryCode);

                    if (!countryData) {
                        console.warn(`Unknown country code: ${code}`);
                        return null;
                    }

                    return {
                        name: countryData.name,
                        nativeName: countryData.native,
                        flag: getEmojiFlag(countryCode),
                        countryCode,
                    };
                })
                .filter((country): country is CountryCode => country !== null);

            const mappedZones = availableZones.filter((zone) =>
                selectedZoneIds.includes(zone.id)
            );

            setAllowedCountries(mappedCountries);
            setZones(mappedZones);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCountry =  (countryCode: TCountryCode) => {
        setDeleteId(countryCode)
        setShowDeleteWarning(true)
    }
    const deleteZone =  (countryCode: string) => {
        setDeleteId(countryCode)
        setShowDeleteZoneWarning(true)
    }

    const deleteCountryFinally = useCallback(async (countryCode: string) => {
        setShowDeleteWarning(false)
        await RoamingGuard.removeCountry(countryCode)
        await loadAllowedCountries();
    }, [])

    const deleteZoneFinally = useCallback(async (zoneId: string) => {
        setShowDeleteZoneWarning(false)
        await RoamingGuard.removeZone(zoneId)
        await loadAllowedCountries();
    }, [])

    useEffect(() => {
        void loadAllowedCountries()
    }, [loadAllowedCountries])

    return (
        <View className="items-center justify-start flex-1 flex-col p-2 pt-10">
            <Text className="text-4xl font-bold text-orange-500 pb-10">Rules</Text>
            <View className="flex gap-5">
                <View className="w-full flex-1 justify-start items-center">
                    <Text className="text-lg">Allowed countries</Text>
                    <Divider className="w-50" bold={true}/>
                    <ScrollView className="w-full py-2" contentContainerClassName="gap-2 pb-10" showsVerticalScrollIndicator={false}>
                        {zones.map((zone, index) => {
                            const isExpanded = expandedZones.has(zone.id);
                            return (
                            <View key={index}>
                                <List.Item description={`${zone.countries.length} countries`}  className="flex flex-row" title={() => (<Text className="text-lg">{zone.name}</Text>)} left={() => isExpanded ? ( <ChevronUp color={theme.colors.onSurface} size={30} onPress={() => toggleZone(zone.id)}/> ) : (<ChevronDown color={theme.colors.onSurface} size={30} onPress={() => toggleZone(zone.id)}/>)} right={() => (<Trash color={theme.colors.error} size={30} onPress={() => deleteZone(zone.id)}/>)}/>
                                {isExpanded && (
                                    <View>
                                        {zone.countries.map((code) => {
                                            const countryCode = code.toUpperCase() as TCountryCode
                                            const countryData = getCountryData(countryCode)
                                            const emoji = getEmojiFlag(countryCode)

                                            return (
                                                <List.Item key={code} className="flex flex-row pl-10" title={() => (<Text className="text-lg">{countryData.name}</Text>)} left={() => (<Text className="text-2xl">{emoji}</Text>)}/>
                                            )
                                        })}
                                    </View>
                                )}
                            </View>
                        )})}
                        {allowedCountries.length != 0 && (
                            <View>
                                {allowedCountries.map((country, index) => (
                                    <List.Item key={index} className="flex flex-row" title={() => (<Text className="text-lg">{country.name}</Text>)} left={() => (<Text className="text-2xl">{country.flag}</Text>)} right={() => (<Trash color={theme.colors.error} size={30} onPress={() => deleteCountry(country.countryCode)}/>)}/>
                                ))}
                            </View>
                        )}
                        {allowedCountries.length == 0 && zones.length == 0 && (
                            <View className="flex items-center justify-center p-5 gap-3">
                                <Text style={{ textAlign: "center" }} className="text-lg text-center">Nothing here, but you can change that.</Text>
                                <Button onPress={() => router.push("/selectSelectionMode")}  mode="contained" className="flex flex-row items-center justify-center">Add countries</Button>
                            </View>
                        )}
                    </ScrollView>
                    <View className="flex flex-row items-end justify-end w-full pb-20">
                        <Button onPress={() => router.push("/selectSelectionMode")}  mode="contained" className="flex flex-row items-center justify-center">Add countries</Button>
                    </View>
                    {showDeleteWarning && (
                        <View>
                            <Portal>
                                <Dialog visible={showDeleteWarning} onDismiss={() => setShowDeleteWarning(false)}>
                                    <Dialog.Title>Delete Warning</Dialog.Title>
                                    <Dialog.Content>
                                        <Text>Are you sure that you want to delete this Country?</Text>
                                    </Dialog.Content>
                                    <Dialog.Actions>
                                        <Button mode="contained" className="px-2" onPress={() => setShowDeleteWarning(false)}>Back</Button>
                                        <Button onPress={() => deleteCountryFinally(deleteId)} textColor="#f44336" >Delete</Button>
                                    </Dialog.Actions>
                                </Dialog>
                            </Portal>
                        </View>
                    )}
                    {showDeleteZoneWarning && (
                        <View>
                            <Portal>
                                <Dialog visible={showDeleteZoneWarning} onDismiss={() => setShowDeleteZoneWarning(false)}>
                                    <Dialog.Title>Delete Warning</Dialog.Title>
                                    <Dialog.Content>
                                        <Text>Are you sure that you want to delete this Zone?</Text>
                                    </Dialog.Content>
                                    <Dialog.Actions>
                                        <Button mode="contained" className="px-2" onPress={() => setShowDeleteZoneWarning(false)}>Back</Button>
                                        <Button  onPress={() => deleteZoneFinally(deleteId)} textColor="#f44336">Delete</Button>
                                    </Dialog.Actions>
                                </Dialog>
                            </Portal>
                        </View>
                    )}
                </View>
            </View>
        </View>
    )
}