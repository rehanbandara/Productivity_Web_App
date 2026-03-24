import React, { useMemo } from "react";
import { Box, Divider, Grid, Paper, Stack, Typography } from "@mui/material";

import TaskCard from "./TaskCard";
import useTaskStore from "../../store/taskStore";

function KanbanColumn({
    title,
    subtitle,
    tasks,
    emptyTitle,
    emptyHint,
    onDelete,
    onStatusChange,
    onEdit,
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 2,
                minHeight: 560,
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            {/* Column header */}
            <Box sx={{ mb: 1 }}>
                <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        {title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {tasks.length}
                    </Typography>
                </Stack>

                {subtitle ? (
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                ) : null}
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            {/* Column body */}
            <Box sx={{ flexGrow: 1 }}>
                {tasks.length === 0 ? (
                    <Box
                        sx={{
                            mt: 0.5,
                            p: 2,
                            borderRadius: 2,
                            border: "1px dashed",
                            borderColor: "divider",
                            bgcolor: "background.default",
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {emptyTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {emptyHint}
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={1.5}>
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                id={task.id}
                                title={task.title}
                                priority={task.priority}
                                deadline={task.deadline}
                                category={task.category}
                                status={task.status}
                                onDelete={onDelete}
                                onStatusChange={onStatusChange}
                                onEdit={onEdit}
                            />
                        ))}
                    </Stack>
                )}
            </Box>
        </Paper>
    );
}

function TaskBoard({ onEdit, selectedDate }) {
    const { tasks, deleteTask, updateTask } = useTaskStore();

    const formattedDate = selectedDate ? selectedDate.format("YYYY-MM-DD") : "";

    const filteredTasks = useMemo(() => {
        if (!formattedDate) return [];
        return tasks.filter((task) => task.deadline === formattedDate);
    }, [tasks, formattedDate]);

    const handleStatusChange = (id, newStatus) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;
        updateTask({ ...task, status: newStatus });
    };

    // Priority sorting (ToDo only): high -> medium -> low
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    const todoTasks = useMemo(() => {
        const list = filteredTasks.filter((t) => t.status === "todo");
        return [...list].sort(
            (a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        );
    }, [filteredTasks]);

    const inProgressTasks = useMemo(
        () => filteredTasks.filter((t) => t.status === "in-progress"),
        [filteredTasks]
    );

    const doneTasks = useMemo(
        () => filteredTasks.filter((t) => t.status === "done"),
        [filteredTasks]
    );

    const isDayEmpty = filteredTasks.length === 0;

    return (
        <Paper
            elevation={0}
            sx={{
                height: "100%",
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            {/* Header */}
            <Box sx={{ mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Task Board
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    Showing tasks due on <strong>{formattedDate || "—"}</strong>
                </Typography>
            </Box>

            {/* Empty state for the selected date */}
            {isDayEmpty ? (
                <Box
                    sx={{
                        mt: 1,
                        p: { xs: 2.5, md: 3 },
                        borderRadius: 2,
                        border: "1px dashed",
                        borderColor: "divider",
                        bgcolor: "background.default",
                        textAlign: "center",
                    }}
                >
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        No tasks due on this date
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Select another date or add a task using the “Add Task” button.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={2} alignItems="stretch" sx={{ mt: 0.5 }}>
                    <Grid item xs={12} md={4}>
                        <KanbanColumn
                            title="To do"
                            subtitle="Sorted by priority"
                            tasks={todoTasks}
                            emptyTitle="Nothing to start"
                            emptyHint="Add tasks and they will appear here."
                            onDelete={(id) => deleteTask(id)}
                            onStatusChange={handleStatusChange}
                            onEdit={onEdit}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <KanbanColumn
                            title="In progress"
                            subtitle="Currently active"
                            tasks={inProgressTasks}
                            emptyTitle="No active tasks"
                            emptyHint="Start a task to move it into this column."
                            onDelete={(id) => deleteTask(id)}
                            onStatusChange={handleStatusChange}
                            onEdit={onEdit}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <KanbanColumn
                            title="Done"
                            subtitle="Completed"
                            tasks={doneTasks}
                            emptyTitle="No completed tasks"
                            emptyHint="Complete a task to see it here."
                            onDelete={(id) => deleteTask(id)}
                            onStatusChange={handleStatusChange}
                            onEdit={onEdit}
                        />
                    </Grid>
                </Grid>
            )}
        </Paper>
    );
}

export default TaskBoard;