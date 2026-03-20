import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import theme from "@/theme/muiTheme";
import { ReactNode } from "react";

export default function ThemeProvider({ children }: { children: ReactNode }) {
    return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}