import {View, Text, FlatList, Pressable} from "react-native";
import {Searchbar, List, Portal, Dialog, Button} from 'react-native-paper';
import {useCallback, useMemo, useState} from "react";
import {useRouter} from "expo-router";
import {getCountryDataList, getEmojiFlag, TCountryCode} from "countries-list";
import RoamingGuard from "../../modules/roaming-guard/src/RoamingGuardModule";

export default function SearchCountries() {

    const [search, setSearch] = useState("")
    const router = useRouter()
    const [showDialog, setShowDialog] = useState(false)
    const [currentCountry, setCurrentCountry] = useState<{name: string, flag: string, nativeName: string, countryCode: TCountryCode} | null>(null)

    const countrylist = useMemo(() => {
        return getCountryDataList().map((country) => ({
            code: country.iso2,
            name: country.name,
            nativeName: country.native,
            flag: getEmojiFlag(country.iso2)
        }))
    }, [])

    const addCountry = useCallback(async (countryCode: TCountryCode) => {
        await RoamingGuard.addCountry(countryCode)
    }, [])

    const filteredCountries = useMemo(() => {

        const query = search.trim().toLowerCase()
        if (query.length == 0) return

        return (countrylist ?? []).filter((country) => {
            return(
                country.name.toLowerCase().includes(query) ||
                country.nativeName.toLowerCase().includes(query)
            )
        }).slice(0, 5)

    }, [search, countrylist])

    const showCountryChoice = (countryCode: TCountryCode, countryName: string, icon: string, nativeName: string) => {

        setCurrentCountry({name: countryName, nativeName: nativeName, countryCode: countryCode, flag: icon})
        setShowDialog(true)

    }

    const addToAllowedList = () => {
        setShowDialog(false)
        if (currentCountry?.countryCode == null) {
            return
        }
        void addCountry(currentCountry?.countryCode)
        router.push("/(tabs)/rules")

    }

    return (
        <View>
            <View className="p-2">
                <Searchbar value={search} onChangeText={(e) => setSearch(e)} className="" placeholder="Search for a country"/>
                {search.trim().length > 0 && (
                    <View>
                        {(filteredCountries?.length ?? 0 ) > 0 ? (
                            <FlatList data={filteredCountries ?? []} renderItem={({item}) => (
                                <List.Item  onPress={() => showCountryChoice(item.code, item.name, item.flag, item.nativeName)}  title={item.name} left={() => (<Text className="text-2xl">{item.flag}</Text>)}/>
                            )} />

                        ): (
                            <Text>No countries found</Text>
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
                            <Text className="text-5xl">{currentCountry?.flag}</Text>
                            <Text className="text-3xl text-center">{currentCountry?.name}</Text>
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