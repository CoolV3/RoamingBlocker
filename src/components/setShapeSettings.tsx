import {
    Host,
    LazyRow,
    Text,
    useMaterialColors,
    Shape,
    Box,
    Button, TextButton
} from '@expo/ui/jetpack-compose';
import {
    border,
    padding, size,
} from '@expo/ui/jetpack-compose/modifiers';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useFocusEffect} from "expo-router";
import {useCallback, useState} from "react";

const shapeKey = "roamingguard.ui.shape"

export default function SetShapeSettings() {
    const colors = useMaterialColors();
    const [currentShape, setCurrentShape] = useState("")


    const setShape = async (id: string) =>  {
        await AsyncStorage.setItem(shapeKey, String(id))
        setCurrentShape(id)
    }

    useFocusEffect(
        useCallback(() => {
            const loadShape = async () => {
                const storedShape = await AsyncStorage.getItem(
                    shapeKey
                )

                if (storedShape !== null) {
                    setCurrentShape(storedShape)
                } else {
                    setCurrentShape("polygon4")
                    await setShape("polygon4")
                }
            }

            void loadShape()
        }, [setShape])
    )

    return (
        <Host style={{ height: 100 }}>
            <LazyRow
                horizontalArrangement={{ spacedBy: 20 }}
                verticalAlignment="center">

                <TextButton onClick={() => setShape("polygon6")}>
                    <Box contentAlignment="center">
                        {currentShape == "polygon6" && (<Shape.Polygon
                            key="polygon6-border"
                            color="#c77c16"
                            cornerRounding={0.2}
                            verticesCount={6}
                            modifiers={[size(85, 85)]}

                        />)}


                        <Shape.Polygon
                            key="polygon6-main"
                            color="#fba32b"
                            cornerRounding={0.2}
                            verticesCount={6}
                            modifiers={[size(76, 76)]}
                        />
                    </Box>
                </TextButton>

                <TextButton onClick={() => setShape("polygon4")}>
                    <Box
                        contentAlignment="center"
                        modifiers={[size(105, 105)]}
                    >
                        {currentShape === "polygon4" && (
                            <Shape.Rectangle
                                color="#c77c16"
                                cornerRounding={0.2}
                                modifiers={[size(76, 76)]}
                            />
                        )}

                        <Shape.Rectangle
                            color="#fba32b"
                            cornerRounding={0.2}
                            modifiers={[size(70, 70)]}
                        />
                    </Box>
                </TextButton>

                <TextButton onClick={() => setShape("circle")}>
                    <Box contentAlignment="center">
                        {currentShape == "circle" && (<Shape.Circle
                            radius={1.03}
                            color="#c77c16"
                            modifiers={[size(89,89)]}
                        />)}
                        <Shape.Circle
                            radius={1}
                            color="#fba32b"
                            modifiers={[size(80, 80)]}
                        />
                    </Box>
                </TextButton>


                <TextButton onClick={() => setShape("rounded2424")}>
                    <Box contentAlignment="center">
                        {currentShape == "rounded2424" && (<Shape.RoundedCorner
                            cornerRadii={{
                                topStart: 20,
                                topEnd: 40,
                                bottomStart: 40,
                                bottomEnd: 20,
                            }}
                            color="#c77c16"
                            modifiers={[size(82, 82)]}
                        />)}
                        <Shape.RoundedCorner
                            cornerRadii={{
                                topStart: 20,
                                topEnd: 40,
                                bottomStart: 40,
                                bottomEnd: 20,
                            }}
                            color="#fba32b"
                            modifiers={[size(76, 76)]}
                        />
                    </Box>
                </TextButton>

                <TextButton onClick={() => setShape("rounded3113")}>
                    <Box contentAlignment="center">
                        {currentShape == "rounded3113" && (<Shape.RoundedCorner
                            cornerRadii={{
                                topStart: 30,
                                topEnd: 10,
                                bottomStart: 10,
                                bottomEnd: 30,
                            }}
                            color="#c77c16"
                            modifiers={[size(84, 89)]}
                        />)}
                        <Shape.RoundedCorner
                            cornerRadii={{
                                topStart: 30,
                                topEnd: 10,
                                bottomStart: 10,
                                bottomEnd: 30,
                            }}
                            color="#fba32b"
                            modifiers={[size(76, 76)]}
                        />
                    </Box>
                </TextButton>

            </LazyRow>
        </Host>
    );
}
