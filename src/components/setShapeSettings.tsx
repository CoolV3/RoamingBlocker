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
                }
            }

            loadShape()
        }, [])
    )

    return (
        <Host style={{ height: 100 }}>
            <LazyRow
                horizontalArrangement={{ spacedBy: 20 }}
                verticalAlignment="center">

                <TextButton onClick={() => setShape("polygon6")}>
                    <Box contentAlignment="center">
                        {currentShape == "polygon6" && (<Shape.Polygon
                            color="#c77c16"
                            cornerRounding={0.2}
                            modifiers={[size(82, 82)]}

                        />)}


                        <Shape.Polygon
                            color="#fba32b"
                            cornerRounding={0.2}
                            modifiers={[size(76, 76)]}
                        />
                    </Box>
                </TextButton>

                <TextButton onClick={() => setShape("polygon4")}>
                    <Box contentAlignment="center">
                        {currentShape == "polygon4" && (<Shape.Polygon
                            color="#c77c16"
                            verticesCount={4}
                            cornerRounding={0.2}
                            modifiers={[size(95, 95)]}
                        />)}
                        <Shape.Polygon
                            color="#fba32b"
                            verticesCount={4}
                            cornerRounding={0.2}
                            modifiers={[size(90, 90)]}
                        />
                    </Box>
                </TextButton>

                <TextButton onClick={() => setShape("circle")}>
                    <Box contentAlignment="center">
                        {currentShape == "circle" && (<Shape.Circle
                            radius={1}
                            color="#c77c16"
                            modifiers={[size(85, 85)]}
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
                            modifiers={[size(85, 85)]}
                        />)}
                        <Shape.RoundedCorner
                            cornerRadii={{
                                topStart: 20,
                                topEnd: 40,
                                bottomStart: 40,
                                bottomEnd: 20,
                            }}
                            color="#fba32b"
                            modifiers={[size(80, 80)]}
                        />
                    </Box>
                </TextButton>

                <TextButton onClick={() => setShape("rounded2222")}>
                    <Box contentAlignment="center">
                        {currentShape == "rounded2222" && (<Shape.RoundedCorner
                            cornerRadii={{
                                topStart: 20,
                                topEnd: 20,
                                bottomStart: 20,
                                bottomEnd: 20,
                            }}
                            color="#c77c16"
                            modifiers={[size(85, 85)]}
                        />)}
                        <Shape.RoundedCorner
                            cornerRadii={{
                                topStart: 20,
                                topEnd: 20,
                                bottomStart: 20,
                                bottomEnd: 20,
                            }}
                            color="#fba32b"
                            modifiers={[size(80, 80)]}
                        />
                    </Box>
                </TextButton>

            </LazyRow>
        </Host>
    );
}
