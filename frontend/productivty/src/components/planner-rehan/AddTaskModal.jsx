import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import dayjs from "dayjs";

import useTaskStore from "../../store/taskStore";
import { getEisenhowerMatrix } from "./utils/priorityUtils";

const EMPTY_FORM = {
  title: "",
  plannedDate: "",
  deadline: "",
  importance: "", // required for matrix calculation
  effort: "", // required for matrix calculation (hours)
  category: "",
  notes: "",
};

function quadrantStyle(quadrant, active) {
  const base = {
    p: 1.5,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    minHeight: 84,
    transition: "all 120ms ease",
  };

  if (!active) return base;

  const map = {
    Q1: { borderColor: "error.main", bgcolor: "rgba(211,47,47,0.06)" },
    Q2: { borderColor: "success.main", bgcolor: "rgba(46,125,50,0.06)" },
    Q3: { borderColor: "warning.main", bgcolor: "rgba(245,124,0,0.07)" },
    Q4: { borderColor: "text.secondary", bgcolor: "rgba(0,0,0,0.04)" },
  };

  return { ...base, ...(map[quadrant] || {}), boxShadow: 1 };
}

function QuadrantCard({ title, subtitle, active, quadrant }) {
  return (
    <Box sx={quadrantStyle(quadrant, active)}>
      <Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
}

function AddTaskModal({ open, onClose, task, selectedDate }) {
  const { addTask, updateTask, tasks } = useTaskStore();
  const isEditMode = Boolean(task);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const todayLocal = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  const selectedPlannedDate = useMemo(() => {
    const d = selectedDate ? dayjs(selectedDate) : dayjs();
    return d.isValid() ? d.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
  }, [selectedDate]);

  // Workload on the planned day (for urgency comparison with other tasks)
  const workloadHours = useMemo(() => {
    const planned = formData.plannedDate || selectedPlannedDate;
    if (!planned) return 0;

    return (tasks || [])
      .filter((t) => t.status !== "done" && t.plannedDate === planned)
      .reduce((sum, t) => sum + (Number(t.effort) || 0), 0);
  }, [tasks, formData.plannedDate, selectedPlannedDate]);

  useEffect(() => {
    if (!open) return;

    if (task) {
      setFormData({
        title: task.title ?? "",
        plannedDate: task.plannedDate ?? selectedPlannedDate,
        deadline: task.deadline ?? "",
        importance: task.importance ?? "",
        effort: task.effort ?? "",
        category: task.category ?? "",
        notes: task.notes ?? "",
      });
      setErrors({});
    } else {
      setFormData({
        ...EMPTY_FORM,
        plannedDate: selectedPlannedDate,
      });
      setErrors({});
    }
  }, [open, task, selectedPlannedDate]);

  // Eisenhower matrix calculation:
  // Only calculated if importance + effort + deadline exist.
  const matrix = useMemo(() => {
    return getEisenhowerMatrix({
      importance: formData.importance,
      effortHours: formData.effort,
      deadline: formData.deadline,
      workloadHours,
      today: todayLocal,
    });
  }, [formData.deadline, formData.effort, formData.importance, workloadHours, todayLocal]);

  const matrixChip = useMemo(() => {
    if (!matrix.isCalculated) {
      return { label: "Not calculated", color: "default", variant: "outlined" };
    }

    // Q1 red, Q2 green, Q3 orange, Q4 neutral
    const map = {
      Q1: { color: "error", variant: "filled" },
      Q2: { color: "success", variant: "filled" },
      Q3: { color: "warning", variant: "filled" },
      Q4: { color: "default", variant: "filled" },
    };

    const meta = map[matrix.quadrant] || { color: "default", variant: "filled" };
    return { label: matrix.label, ...meta };
  }, [matrix]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Task title is required";

    if (!formData.plannedDate) newErrors.plannedDate = "Planned date is required";

    // Deadline OPTIONAL overall, but required if user wants matrix classification
    // (Your requirement: algorithm needs deadline + effort + importance)
    if (formData.deadline) {
      if (formData.deadline < todayLocal) newErrors.deadline = "Deadline cannot be in the past";
    }

    // Importance optional for saving the task, but validate if user entered it
    if (formData.importance !== "" && formData.importance !== null) {
      const n = Number(formData.importance);
      if (!Number.isFinite(n) || n < 1 || n > 10) {
        newErrors.importance = "Importance must be between 1 and 10 (1 = highest)";
      }
    }

    // Effort optional for saving the task, but validate if user entered it
    if (formData.effort !== "" && formData.effort !== null) {
      const n = Number(formData.effort);
      if (!Number.isFinite(n) || n <= 0) {
        newErrors.effort = "Effort must be a positive number (hours)";
      } else if (n > 24) {
        newErrors.effort = "Effort seems too high (max 24 hours)";
      }
    }

    if (formData.category && formData.category.length > 30) {
      newErrors.category = "Category is too long (max 30 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Store matrix results only when calculated.
    const matrixFields = matrix.isCalculated
      ? {
        matrixQuadrant: matrix.quadrant,
        matrixLabel: matrix.label,
        matrixSortRank: matrix.sortRank,
        isImportant: matrix.isImportant,
        isUrgent: matrix.isUrgent,
      }
      : {
        matrixQuadrant: null,
        matrixLabel: "Not calculated",
        matrixSortRank: 999,
        isImportant: null,
        isUrgent: null,
      };

    if (isEditMode) {
      updateTask({
        ...task,
        title: formData.title.trim(),
        plannedDate: formData.plannedDate,
        deadline: formData.deadline || "",
        category: formData.category.trim(),
        notes: formData.notes,
        importance: formData.importance,
        effort: formData.effort,
        ...matrixFields,
      });
    } else {
      addTask({
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title: formData.title.trim(),
        plannedDate: formData.plannedDate,
        deadline: formData.deadline || "",
        category: formData.category.trim(),
        notes: formData.notes,
        importance: formData.importance,
        effort: formData.effort,
        status: "todo",
        ...matrixFields,
      });
    }

    setFormData(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 900 }}>
        {isEditMode ? "Edit task" : "Add task"}
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "background.paper" }}>
        <Stack spacing={2.25}>
          {/* Basics */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
              Basics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Plan the task for a day. Add importance, effort and deadline to calculate the
              Eisenhower quadrant.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Task title"
              fullWidth
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={Boolean(errors.title)}
              helperText={errors.title}
              autoFocus
            />

            <TextField
              label="Category / Tag"
              placeholder="e.g., #Study"
              fullWidth
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={Boolean(errors.category)}
              helperText={errors.category}
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Planned for"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              name="plannedDate"
              value={formData.plannedDate}
              onChange={handleChange}
              error={Boolean(errors.plannedDate)}
              helperText={errors.plannedDate || "Defaults to the date selected in the calendar."}
            />

            <TextField
              label="Deadline (required for matrix)"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              error={Boolean(errors.deadline)}
              helperText={errors.deadline || "Add a deadline to calculate urgency."}
            />
          </Stack>

          <Divider />

          {/* Eisenhower inputs */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
              Eisenhower inputs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Importance uses your scale: <strong>1 = highest</strong>, 10 = lowest.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Importance (1–10)"
              type="number"
              fullWidth
              name="importance"
              value={formData.importance}
              onChange={handleChange}
              error={Boolean(errors.importance)}
              helperText={errors.importance}
              inputProps={{ min: 1, max: 10, step: 1 }}
            />

            <TextField
              label="Effort (hours)"
              type="number"
              fullWidth
              name="effort"
              value={formData.effort}
              onChange={handleChange}
              error={Boolean(errors.effort)}
              helperText={errors.effort}
              inputProps={{ min: 0.25, step: 0.25, max: 24 }}
            />
          </Stack>

          {/* Result summary */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                  Matrix result
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {matrix.reason}
                </Typography>
              </Box>

              <Chip
                label={matrixChip.label}
                color={matrixChip.color}
                variant={matrixChip.variant}
                sx={{ fontWeight: 900 }}
              />
            </Stack>

            {/* Graphical 2x2 matrix */}
            <Box
              sx={{
                mt: 2,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.25,
              }}
            >
              <QuadrantCard
                quadrant="Q1"
                active={matrix.isCalculated && matrix.quadrant === "Q1"}
                title="Do now"
                subtitle="Important + Urgent"
              />
              <QuadrantCard
                quadrant="Q2"
                active={matrix.isCalculated && matrix.quadrant === "Q2"}
                title="Schedule"
                subtitle="Important + Not urgent"
              />
              <QuadrantCard
                quadrant="Q3"
                active={matrix.isCalculated && matrix.quadrant === "Q3"}
                title="Delegate"
                subtitle="Not important + Urgent"
              />
              <QuadrantCard
                quadrant="Q4"
                active={matrix.isCalculated && matrix.quadrant === "Q4"}
                title="Eliminate"
                subtitle="Not important + Not urgent"
              />
            </Box>
          </Paper>

          <Divider />

          {/* Notes */}
          <TextField
            label="Notes"
            placeholder="Optional notes…"
            fullWidth
            multiline
            minRows={3}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={handleClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>

        <Button variant="contained" onClick={handleSubmit} sx={{ borderRadius: 2 }}>
          {isEditMode ? "Save changes" : "Add task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddTaskModal;