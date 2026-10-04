
import {
    MD3DarkTheme,
    MD3LightTheme,
    type MD3Theme,
} from "react-native-paper";

export const lightPaperTheme: MD3Theme = {
    ...MD3LightTheme,
    roundness: 4,
    colors: {
        ...MD3LightTheme.colors,

        primary: "#fba32b",
        onPrimary: "#ffffff",

        primaryContainer: "#ffddb0",
        onPrimaryContainer: "#2b1700",

        secondary: "#775a32",
        onSecondary: "#ffffff",

        background: "#f5f5f5",
        onBackground: "#1d1b18",

        surface: "#ffffff",
        onSurface: "#1d1b18",

        surfaceVariant: "#eee1d1",
        onSurfaceVariant: "#4e4539",

        outline: "#807567",
    },
};

export const darkPaperTheme: MD3Theme = {
    ...MD3DarkTheme,
    roundness: 4,
    colors: {
        ...MD3DarkTheme.colors,

        primary: "#fba32b",
        onPrimary: "#442b00",

        primaryContainer: "#775a32",
        onPrimaryContainer: "#ffddb0",

        secondary: "#dfc09b",
        onSecondary: "#3e2d15",

        background: "#15120e",
        onBackground: "#ece1d5",

        surface: "#211c16",
        onSurface: "#ece1d5",

        surfaceVariant: "#4e4539",
        onSurfaceVariant: "#775a32",

        outline: "#9b8f80",
    },
};