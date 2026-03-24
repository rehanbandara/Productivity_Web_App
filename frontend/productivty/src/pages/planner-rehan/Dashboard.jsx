import React, { useState } from "react";
import { Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";

import AddTaskModal from "../../components/planner-rehan/AddTaskModal";
import ContextPanel from "../../components/planner-rehan/ContextPanel";
import TaskBoard from "../../components/planner-rehan/TaskBoard";

function Dashboard() {
  // Shared selected date for filtering (Dayjs object)
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Modal open/close state
  const [openModal, setOpenModal] = useState(false);

  // If null => Add Mode. If set => Edit Mode
  const [selectedTask, setSelectedTask] = useState(null);

  const handleOpenAddModal = () => {
    setSelectedTask(null); // ensure Add Mode
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTask(null); // cleanup after closing
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  const selectedDateLabel = selectedDate
    ? selectedDate.format("dddd, MMM D")
    : "No date selected";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      {/* Page container (keeps a real-world max width) */}
      <Box sx={{ maxWidth: 1280, mx: "auto" }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            mb: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h5"
                component="h1"
                sx={{ fontWeight: 800, lineHeight: 1.15 }}
              >
                Planner
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedDateLabel} • Manage tasks by deadline
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              sx={{ borderRadius: 2 }}
            >
              Add Task
            </Button>
          </Stack>
        </Paper>

        {/* Main layout */}
        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} md={8}>
            <TaskBoard onEdit={handleEditTask} selectedDate={selectedDate} />
          </Grid>

          <Grid item xs={12} md={4}>
            <ContextPanel
              onOpenModal={handleOpenAddModal}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </Grid>
        </Grid>

        {/* Add/Edit modal */}
        <AddTaskModal
          open={openModal}
          onClose={handleCloseModal}
          task={selectedTask}
        />
      </Box>
    </Box>
  );
}

export default Dashboard;