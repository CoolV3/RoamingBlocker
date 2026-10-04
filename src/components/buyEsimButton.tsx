import {useCallback, useRef, useState} from 'react';
import {
    Host,
    ModalBottomSheet,
    Button,
    Column,
    Text,
    ListItem,
    HorizontalDivider,
    RNHostView,
    Spacer,
    Shape
} from '@expo/ui/jetpack-compose';
import * as Linking from "expo-linking";

import type { ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import {clickable, paddingAll, size, clip, Shapes, fillMaxWidth, height, width} from '@expo/ui/jetpack-compose/modifiers';
import {ArrowUpRight, ArrowRight, CardSim} from "lucide-react-native";
import {useFocusEffect} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type EsimProvider = {
    name: string,
    description: string,
    color: string,
    url: string,
    affiliateUrl: string,
}

const featuredEsimProvider: EsimProvider = {
    name: "Saily",
    description: "Simple plans for international travel",
    color: "#6C5CE7",
    url: "https://saily.com/",
    affiliateUrl: "https://saily.com/",
}

const affiliateStatusKey = "roamingguard.ui.affiliateStatus"

const esimProviders: EsimProvider[] = [
    {
        name: "Airalo",
        description: "Global and regional data plans",
        color: "#E91E63",
        url: "https://www.airalo.com/",
        affiliateUrl: "https://www.airalo.com/",
    },
    {
        name: "Holafly",
        description: "Unlimited-data options for many destinations",
        color: "#00A86B",
        url: "https://esim.holafly.com/",
        affiliateUrl: "https://esim.holafly.com/",
    },
    {
        name: "Nomad",
        description: "Flexible country and regional plans",
        color: "#2D7FF9",
        url: "https://www.getnomad.app/",
        affiliateUrl: "https://www.getnomad.app/",
    },
];

export default function buyEsimButton() {
    const [visible, setVisible] = useState(false);
    const [useAffiliateLinks, setUseAffiliateLinks] = useState(false)
    const sheetRef = useRef<ModalBottomSheetRef>(null);

    const hideSheet = async () => {
        await sheetRef.current?.hide();
        setVisible(false);
    };

    const openUrl = async (url: string) => {
        await Linking.openURL(url)
    }

    useFocusEffect(
        useCallback(() => {
            const loadAffiliateStatus = async () => {
                const status = await AsyncStorage.getItem(affiliateStatusKey)
                if (status != null) {
                    setUseAffiliateLinks(status == "true")
                }
            }
            void loadAffiliateStatus()
        }, [])
    )

    return (
        <Host matchContents>
            <Button
                onClick={() => setVisible(true)}
                colors={{
                    containerColor: "#FF6B00",
                    contentColor: "#FFFFFF",
                }}
                shape={Shape.RoundedCorner({
                    cornerRadii: {
                        topStart: 18,
                        topEnd: 18,
                        bottomStart: 18,
                        bottomEnd: 18,
                    },
                })}
                modifiers={[
                    fillMaxWidth(),
                    height(56),
                ]}
            >
                <RNHostView matchContents>
                    <CardSim
                        size={20}
                        strokeWidth={2.2}
                        color="#FFFFFF"
                    />
                </RNHostView>

                <Spacer modifiers={[width(10)]} />

                <Text>Find an eSIM</Text>

                <Spacer modifiers={[width(10)]} />

                <RNHostView matchContents>
                    <ArrowRight
                        size={20}
                        strokeWidth={2.2}
                        color="#FFFFFF"
                    />
                </RNHostView>
            </Button>
            {visible && (
                <ModalBottomSheet
                    ref={sheetRef}
                    onDismissRequest={() => setVisible(false)}
                >
                    <Column verticalArrangement={{ spacedBy: 8 }} modifiers={[paddingAll(24)]}>
                        <Text style={{fontSize: 24, fontWeight: "bold",}}>Get an eSIM</Text>

                        <Text style={{fontSize: 14}}>
                            Choose a provider and start browsing
                        </Text>

                        <Column verticalArrangement={{ spacedBy: 8 }} >
                            <ListItem modifiers={[fillMaxWidth(), clickable(() => {useAffiliateLinks ? openUrl(featuredEsimProvider.affiliateUrl) : openUrl(featuredEsimProvider.url)}), clip(Shapes.RoundedCorner(20))]} colors={{
                                containerColor: "#FF6B00",
                            }}>
                                <ListItem.HeadlineContent>
                                    <Text>{featuredEsimProvider.name}</Text>
                                </ListItem.HeadlineContent>
                                <ListItem.SupportingContent>
                                    <Text>{featuredEsimProvider.description}</Text>
                                </ListItem.SupportingContent>
                                <ListItem.LeadingContent>
                                    <Text>ICON</Text>
                                </ListItem.LeadingContent>
                                <ListItem.TrailingContent>
                                    <ArrowUpRight color="#ffffff"/>
                                </ListItem.TrailingContent>
                            </ListItem>
                            <HorizontalDivider />
                            {esimProviders.map((provider) => (
                                <ListItem key={provider.name} modifiers={[fillMaxWidth(), clickable(() => {useAffiliateLinks ? openUrl(provider.affiliateUrl) : openUrl(provider.url)}), clip(Shapes.RoundedCorner(20))]} colors={{
                                    containerColor: "#775a32",
                                }}>
                                    <ListItem.HeadlineContent>
                                        <Text>{provider.name}</Text>
                                    </ListItem.HeadlineContent>
                                    <ListItem.SupportingContent>
                                        <Text>{provider.description}</Text>
                                    </ListItem.SupportingContent>
                                    <ListItem.LeadingContent>
                                        <Text>ICON</Text>
                                    </ListItem.LeadingContent>
                                    <ListItem.TrailingContent>
                                        <ArrowUpRight color="#ffffff"/>
                                    </ListItem.TrailingContent>
                                </ListItem>
                            ))}
                        </Column>

                        <Text style={{fontSize: 12,}}>
                            RoamingGuard does not sell eSIMs directly.
                            {useAffiliateLinks ? " The links above are affiliate links. You are supporting the app. The selected provider opens in your browser." : " You disabled affiliate links in settings, so links just open the website from the provider in your browser. "}
                        </Text>

                        <Button onClick={hideSheet} modifiers={[fillMaxWidth(), paddingAll(2)]}>
                            <Text>Close</Text>
                        </Button>
                    </Column>
                </ModalBottomSheet>
            )}
        </Host>
    );
}
