import {PermissionsAndroid, View, Linking} from "react-native";
import {Button, Dialog, Portal, Text, useTheme} from "react-native-paper"
import {UserKey} from "lucide-react-native";
import {useFocusEffect, useRouter} from "expo-router";
import RoamingGuard from "../../../modules/roaming-guard/src/RoamingGuardModule";
import {useEffect, useState} from "react";

export default function OnboardingWelcomeScreen() {
    const router = useRouter()
    const theme = useTheme()
    const [showVPNDenied, setShowVPNDenied] = useState(false)
    const [showNotiDenied, setShowNotiDenied] = useState(false)
    const [openNotiSettingsPage, setOpenNotiSettingsPage] = useState(false)
    const [step, setStep] = useState(1)
    const [vpnAllowed, setVpnAllowed] = useState(false)

    const getVPNAccess = async () => {

            try {
                await RoamingGuard.enableCountryWatching()
                await RoamingGuard.disableCountryWatching()
                setVpnAllowed(true)
            } catch (e: any) {
                if (e?.code == "ERR_VPN_PERMISSION_DENIED") {
                    setShowVPNDenied(true)
                    return
                }
            }

    }

    const getNotificationsPermission = async () => {
        const didAlreadyAllow = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
        if (didAlreadyAllow) {
            if (vpnAllowed) {
                setStep(2)
            }
            return "alreadygranted"
        }

        return await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
    }

    const getAllPermissions = async () => {
        const notificationResults = await getNotificationsPermission()

        if (notificationResults === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            setOpenNotiSettingsPage(true)
        }

        if (notificationResults == "alreadygranted") {

        } else if (notificationResults === PermissionsAndroid.RESULTS.DENIED || notificationResults === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            setShowNotiDenied(true)
            return
        }

        void getVPNAccess()

        if (vpnAllowed) {
            setStep(2)
        }
    }

    const openSettings = async () => {
        await Linking.sendIntent("android.settings.APP_NOTIFICATION_SETTINGS",
            [
                {
                    key: "android.provider.extra.APP_PACKAGE",
                    value: "com.coolv3.roamingguard",
                },
            ]
        )
    }

    return (
        <View className="flex items-center justify-between pt-20 h-full pb-5 p-2">
            <View>
                <View className="mb-2 items-center justify-center rounded-full p-5 w-20 self-center" style={{backgroundColor: theme.colors.primaryContainer}}>
                    <UserKey color={theme.colors.primary} size={40} className="bg-r"/>
                </View>

                <Text style={{textAlign: "center"}} className="text-lg font-bold">Last step</Text>
                <Text style={{textAlign: "center"}} className="text-2xl font-bold">Set up permissions</Text>


                <Text className="pt-20 text-lg" style={{textAlign: "center"}}>
                    RoamingGuard needs the permissions to send your notifications and block your internet connection. For blocking the internet connection we use a fully local VPN that only activates when we detect a disallowed country. All data stays on your device.
                </Text>

            </View>
            {step == 1 && (
                <View>
                    <Button onPress={getAllPermissions} mode="contained" contentStyle={{ paddingHorizontal: 6, paddingVertical: 4 }} labelStyle={{ fontSize: 20, lineHeight: 36 }} >Grant permissions</Button>
                </View>
            )}
            {step == 2 && (
                <View>
                    <Button onPress={() => router.push("/onboarding/onboardingFinished")} mode="contained" contentStyle={{ paddingHorizontal: 6, paddingVertical: 4 }} labelStyle={{ fontSize: 20, lineHeight: 36 }}>Next step</Button>
                </View>
            )}


            <Portal>
                <Dialog visible={showVPNDenied} onDismiss={() => setShowVPNDenied(false)}>
                    <Dialog.Title>RoamingGuard needs VPN Access</Dialog.Title>
                    <Dialog.Content>
                        <Text>You need to allow RoamingGuard to create a VPN so it can block your network traffic when your phone connects with a country that is not on your allowed list.</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowVPNDenied(false)}>Got it!</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Portal>
                <Dialog visible={showNotiDenied} onDismiss={() => setShowNotiDenied(false)}>
                    <Dialog.Title>RoamingGuard needs Notifications Access</Dialog.Title>
                    <Dialog.Content>
                        <Text>You need to allow RoamingGuard to allow RoamingGuard to send you notifications, otherwise RoamingGuard can`t warn you wenn your internet access is blocked</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        {openNotiSettingsPage ? (
                            <Button onPress={() => {
                                setShowNotiDenied(false)
                                void openSettings()
                            }}>Open Settings</Button>
                        ) : (
                            <Button onPress={() => setShowNotiDenied(false)}>Got it!</Button>
                            )}
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
}