import React, { useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

function getPriorityMeta(priority) {
  switch (priority) {
    case "high":
      return { label: "High", color: "error" };
    case "medium":
      return { label: "Medium", color: "warning" };
    case "low":
      return { label: "Low", color: "success" };
    default:
      return { label: "Normal", color: "default" };
  }
}

function getStatusAction(status) {
  switch (status) {
    case "todo":
      return { label: "Start", nextStatus: "in-progress" };
    case "in-progress":
      return { label: "Mark done", nextStatus: "done" };
    case "done":
      return { label: "Move back", nextStatus: "todo" };
    default:
      return null;
  }
}

/**
 * TaskCard
 * - Clean “real app” card UI:
 *   - Title + actions
 *   - Priority chip + status chip
 *   - Due date + overdue state
 * - Click card to edit (and explicit edit icon)
 * - Delete/status actions don't trigger edit (stopPropagation)
 */
function TaskCard({
  task,
  id,
  title,
  priority,
  deadline,
  category,
  status,
  onDelete = () => { },
  onStatusChange = () => { },
  onEdit = () => { },
}) {
  const priorityMeta = getPriorityMeta(priority);
  const statusAction = getStatusAction(status);

  // "YYYY-MM-DD" in local time (avoids UTC issues)
  const todayLocal = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const isOverdue = Boolean(deadline) && deadline < todayLocal && status !== "done";
  const isDueToday = Boolean(deadline) && deadline === todayLocal && status !== "done";

  const statusChip =
    status === "todo"
      ? { label: "To do", variant: "outlined" }
      : status === "in-progress"
        ? { label: "In progress", variant: "outlined" }
        : { label: "Done", variant: "filled" };

  return (
    <Paper
      elevation={0}
      onClick={() => onEdit(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onEdit(task);
      }}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: "pointer",
        border: "1px solid",
        borderColor: isOverdue ? "error.light" : "divider",
        bgcolor: isOverdue ? "rgba(211, 47, 47, 0.06)" : "background.paper",
        transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: 2,
          borderColor: isOverdue ? "error.main" : "text.secondary",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      {/* Top row: title + actions */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            lineHeight: 1.2,
            pr: 1,
            wordBreak: "break-word",
          }}
        >
          {title}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <IconButton
            aria-label="edit task"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            aria-label="delete task"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Chips row */}
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
        <Chip
          size="small"
          label={`Priority: ${priorityMeta.label}`}
          color={priorityMeta.color}
          variant="outlined"
        />

        <Chip size="small" label={statusChip.label} variant={statusChip.variant} />

        {isOverdue ? (
          <Chip size="small" label="Overdue" color="error" variant="filled" />
        ) : isDueToday ? (
          <Chip size="small" label="Due today" color="warning" variant="filled" />
        ) : null}

        {category ? (
          <Chip size="small" label={category} variant="outlined" />
        ) : null}
      </Stack>

      {/* Meta row */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Due: {deadline || "—"}
      </Typography>

      {/* Status action */}
      {statusAction ? (
        <Box sx={{ mt: 1.25 }}>
          <Button
            size="small"
            variant={status === "done" ? "outlined" : "contained"}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(id, statusAction.nextStatus);
            }}
            sx={{ borderRadius: 2 }}
          >
            {statusAction.label}
          </Button>
        </Box>
      ) : null}
    </Paper>
  );
}

export default TaskCard;