import {View, Text, FlatList, Pressable} from "react-native";
import {Appbar, Searchbar, List} from 'react-native-paper';
import {TextInput} from "react-native-paper"
import {useMemo, useState} from "react";
import {useRouter} from "expo-router";
import {getCountryDataList, getEmojiFlag} from "countries-list";

export default function AddNewCountriesPage() {
    const [search, setSearch] = useState("")
    const router = useRouter()

    const countrylist = useMemo(() => {
        return getCountryDataList().map((country) => ({
            code: country.iso2,
            name: country.name,
            nativeName: country.native,
            flag: getEmojiFlag(country.iso2)
        }))
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


    return(
        <View >
            <Appbar.Header>
                <Appbar.Content title="Add countries" />
                <Appbar.BackAction onPress={() => {router.back()}} />
            </Appbar.Header>

            <View className="p-2">
                <Searchbar value={search} onChangeText={(e) => setSearch(e)} className="" placeholder="Search for a country"/>
                {search.trim().length > 0 && (
                    <View>
                        {(filteredCountries?.length ?? 0 ) > 0 ? (
                            <FlatList data={filteredCountries ?? []} renderItem={({item}) => (
                                <List.Item className="" title={item.name} left={() => (<Text className="text-2xl">{item.flag}</Text>)}/>
                            )} />

                        ): (
                            <Text>No countries found</Text>
                        )}
                    </View>
                )}
            </View>
        </View>
    )
}