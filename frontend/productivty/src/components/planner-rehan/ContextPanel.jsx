import React, { useMemo } from "react";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import dayjs from "dayjs";

// MUI X Date Picker
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

function getGreeting(now = new Date()) {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function ContextPanel({ onOpenModal, selectedDate, setSelectedDate }) {
    const greeting = useMemo(() => getGreeting(new Date()), []);

    const today = dayjs();
    const isTodaySelected = Boolean(selectedDate) && selectedDate.isSame(today, "day");

    const selectedLabel = selectedDate ? selectedDate.format("dddd, MMM D") : "—";
    const todayLabel = today.format("dddd, MMM D");

    return (
        <Stack spacing={2}>
            {/* Section A: Today + selected date */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                    {greeting}
                </Typography>

                <Divider sx={{ mb: 1.5 }} />

                <Stack spacing={0.75}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Today
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {todayLabel}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Selected
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {selectedLabel}
                        </Typography>
                    </Box>

                    <Button
                        variant={isTodaySelected ? "outlined" : "contained"}
                        startIcon={<TodayOutlinedIcon />}
                        onClick={() => setSelectedDate(today)}
                        sx={{ mt: 1, borderRadius: 2 }}
                        fullWidth
                    >
                        Go to today
                    </Button>
                </Stack>
            </Paper>

            {/* Section B: Calendar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CalendarMonthOutlinedIcon fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        Calendar
                    </Typography>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <DatePicker
                            label="Select date"
                            value={selectedDate}
                            onChange={(newValue) => setSelectedDate(newValue)}
                            slotProps={{
                                textField: { fullWidth: true, size: "small" },
                            }}
                        />

                        <Typography variant="caption" color="text.secondary">
                            Tip: tasks are filtered by their deadline date.
                        </Typography>
                    </Box>
                </LocalizationProvider>
            </Paper>

            {/* Section C: Actions */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                    Actions
                </Typography>
                <Divider sx={{ mb: 1.5 }} />

                <Stack spacing={1.25}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={onOpenModal}
                        sx={{ borderRadius: 2 }}
                    >
                        Add Task
                    </Button>

                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => setSelectedDate(null)}
                        sx={{ borderRadius: 2 }}
                    >
                        Clear selected date
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}

export default ContextPanel;