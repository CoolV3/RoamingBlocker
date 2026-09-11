import AsyncStorage from "@react-native-async-storage/async-storage";


const AllowedCountriesKey = "roamingBlocker:selectedCountries"


async function addNewCountryToAllowedList(countryCodes: string[]) {
    const storedCountries = AsyncStorage.getItem


    await AsyncStorage.setItem(AllowedCountriesKey, JSON.stringify())


}