import {Pressable, View, Animated, Easing} from "react-native";
import Svg, { Path } from "react-native-svg";
import {useCallback, useEffect, useRef, useState} from "react";
import {Shield, ShieldOff} from "lucide-react-native"
import RoamingGuard from "../../modules/roaming-guard/src/RoamingGuardModule";
import { Host, Shape, Row } from '@expo/ui/jetpack-compose';
import {size} from "@expo/ui/jetpack-compose/modifiers";
import { Button, Dialog, Portal, Text} from 'react-native-paper';
import {useFocusEffect} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
const shapeKey = "roamingguard.ui.shape"

export default function BlockRoamingButton({title, onPress}: {title: string, onPress: () => void}) {
    const [active, setActive] = useState(false)
    const [showVPNDenied ,setShowVPNDenied] = useState(false)
    const rotationRef = useRef(new Animated.Value(0)).current
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);
    const animationVersion = useRef(0)
    const [isChanging, setIsChanging] = useState(false);
    const [internetBlocked, setInternetBlocked] = useState(false)
    const [currentShape, setCurrentShape] = useState("")

    const setActiveAction = async () => {
        if (isChanging) return;

        const nextActive = !active;
        setIsChanging(true);

        try {
            if (nextActive) {
                try {
                    await RoamingGuard.enableCountryWatching();
                } catch (e: any) {
                    if (e?.code == "ERR_VPN_PERMISSION_DENIED") {
                        setShowVPNDenied(true)
                        return
                    }
                }

            } else {
                try {
                    await RoamingGuard.disableCountryWatching();
                } catch (e: any) {
                    if (e?.code == "ERR_VPN_PERMISSION_DENIED") {
                        setShowVPNDenied(true)
                        return
                    }
                }
            }

            setActive(nextActive);
            onPress?.();
        } catch (error) {
            console.error("Failed to change RoamingGuard state:", error);
        } finally {
            setIsChanging(false);
        }
    };


    useEffect(() => {
        const loadState = async () => {
            const isWatching = await RoamingGuard.isCountryWatching()
            setActive(isWatching)

            const isInternetBlocked = RoamingGuard.isInternetBlocked()
            setInternetBlocked(isInternetBlocked)
        }
        void loadState()

        const subscription = RoamingGuard.addListener("onBlockingStateChanged", ({isBlocked}) => {setInternetBlocked(isBlocked)})

        return () => {
            subscription.remove()
        }
    }, []);

    useEffect(() => {
        animationVersion.current += 1;
        const currentVersion = animationVersion.current;
        if (!active) {
            animationRef.current?.stop();
            return;
        }
        const startRotation = (currentValue: number) => {
            if (animationVersion.current !== currentVersion) {
                return;
            }
            const normalizedValue = currentValue >= 0.999 ? 0 : currentValue;
            if (normalizedValue === 0) {
                rotationRef.setValue(0);
            }
            const remainingDuration = Math.max((1 - normalizedValue) * 4000, 1)

            const animation = Animated.timing(rotationRef, {
                toValue: 1,
                duration: remainingDuration,
                easing: Easing.linear,
                useNativeDriver: true,
            });
            animationRef.current = animation;
            animation.start(({ finished }) => {
                if (
                    !finished ||
                animationVersion.current !== currentVersion
            ) {
                    return;
                }
                rotationRef.setValue(0);
                startRotation(0);
            });
        };
        rotationRef.stopAnimation((currentValue) => {
            if (animationVersion.current !== currentVersion) {
                return;
            }
            startRotation(currentValue);
        });
        return () => {
            animationRef.current?.stop();
        };
    }, [active, rotationRef]);

    useFocusEffect(
        useCallback(() => {
            const loadShape = async () => {
                const storedShape = await AsyncStorage.getItem(shapeKey)

                if (storedShape !== null) {
                    setCurrentShape(storedShape)
                } else {
                    setCurrentShape("polygon4")
                }
            }

            loadShape()
        }, [])
    )

    const rotation = rotationRef.interpolate({inputRange: [0,1], outputRange: ["0deg", "360deg"]})

    return(
        <View>
            <Pressable onPress={setActiveAction} >
                {({pressed }) => (
                    <View className="relative flex items-center justify-center w-60 h-60">
                        <Animated.View pointerEvents="none" className="w-60 h-60 absolute inset-0" style={{
                            transform: [
                                { rotate: rotation },
                                { scale: active ? 1 : 0.90 },
                            ],
                            width: 180,
                            height: 180,
                            position: "absolute",
                            left: 30,
                            top: 30,
                        }}>
                            <Host matchContents style={{ width: 180, height: 180 }}>
                                {currentShape == "rounded2424" ? (<Shape.RoundedCorner
                                    cornerRadii={{
                                        topStart: 20,
                                        topEnd: 40,
                                        bottomStart: 40,
                                        bottomEnd: 20,
                                    }}
                                    color={internetBlocked ? "#a52c0b" : (active ? "#fba32b" : "#775a32")}
                                    modifiers={[size(180, 180)]}
                                />) : (currentShape == "rounded3113" ? (<Shape.RoundedCorner
                                    cornerRadii={{
                                        topStart: 30,
                                        topEnd: 10,
                                        bottomStart: 10,
                                        bottomEnd: 30
                                    }}
                                    color={internetBlocked ? "#a52c0b" : (active ? "#fba32b" : "#775a32")}
                                    modifiers={[size(180, 180)]}
                                />) : (currentShape == "circle" ? (<Shape.Circle
                                    radius={1}
                                    color={internetBlocked ? "#a52c0b" : (active ? "#fba32b" : "#775a32")}
                                    modifiers={[size(180, 180)]}
                                />) : (currentShape == "polygon4" ? (<Shape.Rectangle
                                    color={internetBlocked ? "#a52c0b" : (active ? "#fba32b" : "#775a32")}
                                    cornerRounding={0.2}
                                    modifiers={[size(180, 180)]}
                                />) : (currentShape == "polygon6" && (<Shape.Polygon
                                    color={internetBlocked ? "#a52c0b" : (active ? "#fba32b" : "#775a32")}
                                    cornerRounding={0.2}
                                    modifiers={[size(180, 180)]}
                                />  )))))}

                            </Host>
                        </Animated.View>
                        {active ? (
                            <Shield size={50} strokeWidth={2} />
                        ): (
                            <ShieldOff size={40} strokeWidth={1.9} />
                        )}

                    </View>
                )}
            </Pressable>
            <Text style={{ textAlign: "center" }} className="text-lg">{active ? "Roaming Guard is active." : "Roaming Guard is inactive"}</Text>

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
        </View>
    )
}