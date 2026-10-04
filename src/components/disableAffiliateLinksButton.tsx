import AsyncStorage from "@react-native-async-storage/async-storage";
import {useFocusEffect} from "expo-router";
import {useCallback, useState} from "react";
// import { Switch, List } from 'react-native-paper';
import {Box, Host, ListItem, Switch, Text} from '@expo/ui/jetpack-compose'
import {Info} from "lucide-react-native"
import {clip, fillMaxWidth, Shapes, width} from "@expo/ui/jetpack-compose/modifiers";
import {background} from "@expo/ui/swift-ui/modifiers";
import {View} from "react-native";
import InfoIcon from "@expo/material-symbols/info.xml";

const affiliateStatusKey = "roamingguard.ui.affiliateStatus"

export default function DisableAffiliateLinks() {
    const [currentAffiliateStatus, setCurrentAffiliateStatus] = useState(true)

    const updateAffiliateStatus = async (value: boolean) => {
        await AsyncStorage.setItem(affiliateStatusKey, String(value))
        setCurrentAffiliateStatus(value)
    }

    useFocusEffect(
        useCallback(() => {
            const loadAffiliateStatus = async () => {
                const status = await AsyncStorage.getItem(affiliateStatusKey)
                if (status != null) {
                    setCurrentAffiliateStatus(status == "true")
                }
            }
            void loadAffiliateStatus()
        }, [])
    )

    return (

            <Host matchContents={{ vertical: true }}>
                <ListItem modifiers={[fillMaxWidth(), clip(Shapes.RoundedCorner(20)), background("#2b2116"),]}>
                    <ListItem.HeadlineContent>
                        <Text style={{ typography: 'titleMedium' }}>Disable Affiliate links</Text>
                    </ListItem.HeadlineContent>
                    <ListItem.SupportingContent>
                        <Text style={{ typography: 'bodyMedium' }}>Disable all affiliate links on the buy esim selector</Text>
                    </ListItem.SupportingContent>

                    <ListItem.TrailingContent>
                        <Switch value={currentAffiliateStatus} onCheckedChange={updateAffiliateStatus} colors={{
                            checkedThumbColor: '#bf7209',
                            checkedTrackColor: '#fba32b',
                            uncheckedThumbColor: '#5f4017',
                            uncheckedTrackColor: '#775a32',
                            uncheckedBorderColor: '#D1D5DB',
                        }} />
                    </ListItem.TrailingContent>
                </ListItem>

            </Host>

    )
}