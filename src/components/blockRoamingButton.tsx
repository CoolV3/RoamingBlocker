import {Pressable, View, Animated, Easing, Text} from "react-native";
import Svg, { Path } from "react-native-svg";
import {useEffect, useRef, useState} from "react";
import {Shield, ShieldOff} from "lucide-react-native"

export default function BlockRoamingButton({title, onPress}: {title: string, onPress: () => void}) {
    const [active, setActive] = useState(false)
    const rotationRef = useRef(new Animated.Value(0)).current
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);
    const animationVersion = useRef(0)

    const setActiveAction = () => {
        setActive((current) => (!current))


        onPress()
    }

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

    const rotation = rotationRef.interpolate({inputRange: [0,1], outputRange: ["0deg", "360deg"]})

    return(
        <View>
            <Pressable onPress={setActiveAction} >
                {({pressed }) => (
                    <View className="relative flex items-center justify-center w-60 h-60">
                        <Animated.View className="w-60 h-60 absolute inset-0" style={{
                            transform: [
                                { rotate: rotation },
                                { scale: active ? 1 : 0.90 },
                            ],
                        }}>
                            <Svg viewBox="0 0 250 250" width="100%" height="100%" className="absolute inset-0">
                            <Path
                            d="M151.572 33.2059C192.835 15.2847 234.715 57.165 216.794 98.4282L213.831 105.251C208.36 117.848 208.36 132.152 213.831 144.749L216.794 151.572C234.715 192.835 192.835 234.715 151.572 216.794L144.749 213.831C132.152 208.36 117.848 208.36 105.251 213.831L98.4281 216.794C57.165 234.715 15.2847 192.835 33.2059 151.572L36.169 144.749C41.6404 132.152 41.6404 117.848 36.1689 105.251L33.2059 98.4281C15.2847 57.165 57.165 15.2847 98.4282 33.2059L105.251 36.169C117.848 41.6404 132.152 41.6404 144.749 36.1689L151.572 33.2059Z"
                            fill={active ? "#fba32b" : "#775a32"}
                            />
                            </Svg>
                        </Animated.View>
                        {active ? (
                            <Shield size={50} strokeWidth={2} />
                        ): (
                            <ShieldOff size={40} strokeWidth={1.9} />
                        )}

                    </View>
                )}
            </Pressable>
            <Text className="text-center text-lg">{active ? "Roaming Guard is active." : "Roaming Guard is inactive"}</Text>
        </View>
    )
}