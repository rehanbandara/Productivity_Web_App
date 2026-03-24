import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import Dashboard from "./pages/planner-rehan/Dashboard";

/**
 * IMPORTANT:
 * Do NOT wrap <Routes> with <BrowserRouter> here if your app already
 * wraps <App /> with <BrowserRouter> in src/index.js.
 * Otherwise you'll get: "You cannot render a <Router> inside another <Router>"
 */

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#003366" },
    background: { default: "#f6f7fb", paper: "#ffffff" },
    divider: "rgba(0,0,0,0.10)",
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial'].join(
      ","
    ),
    h5: { fontWeight: 900 },
    h6: { fontWeight: 900 },
    subtitle1: { fontWeight: 800 },
    button: { textTransform: "none", fontWeight: 800 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/planner" replace />} />
        <Route path="/planner" element={<Dashboard />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/planner" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;