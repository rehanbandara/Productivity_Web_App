import dayjs from "dayjs";

/**
 * Eisenhower Matrix utilities (real-world practical)
 * -------------------------------------------------
 * Your rules:
 * - Only calculate when user provides: importance, effortHours, deadline.
 * - Importance scale is reversed:
 *    1 = MOST important, 10 = LEAST important
 *
 * This module returns:
 * - matrix: { isCalculated, isImportant, isUrgent, quadrant, label, sortRank, reason }
 *
 * Notes:
 * - "Urgent" is derived from deadline + effort + current-day workload.
 * - "Compare with other tasks" is supported via `sortRank` and helper sort function.
 */

// Threshold: 1..4 treated as "Important" (common + practical)
const IMPORTANT_MAX = 4;

// Default daily focus capacity used in urgency decision (realistic for students)
const DEFAULT_DAILY_FOCUS_HOURS = 6;

const clampNumber = (value, { min, max } = {}) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
};

const toYmd = (d) => dayjs(d).format("YYYY-MM-DD");

const daysUntil = (deadlineYmd, fromYmd = toYmd(dayjs())) => {
    const from = dayjs(fromYmd).startOf("day");
    const to = dayjs(deadlineYmd).startOf("day");
    if (!to.isValid()) return null;
    return to.diff(from, "day"); // can be negative
};

export const getEisenhowerMatrix = ({
    importance, // 1..10 (1 highest)
    effortHours, // number
    deadline, // "YYYY-MM-DD"
    workloadHours = 0, // sum of efforts for the planned day (other tasks)
    dailyFocusHours = DEFAULT_DAILY_FOCUS_HOURS,
    today = toYmd(dayjs()),
} = {}) => {
    const I = clampNumber(importance, { min: 1, max: 10 });
    const E = clampNumber(effortHours, { min: 0.25, max: 24 });
    const deadlineYmd = deadline ? String(deadline) : "";

    // Only calculate if all required inputs exist
    if (!I || !E || !deadlineYmd) {
        return {
            isCalculated: false,
            isImportant: null,
            isUrgent: null,
            quadrant: null,
            label: "Not calculated",
            sortRank: 999,
            reason: "Enter importance, effort (hours), and a deadline to calculate.",
        };
    }

    const dLeft = daysUntil(deadlineYmd, today);
    if (dLeft == null) {
        return {
            isCalculated: false,
            isImportant: null,
            isUrgent: null,
            quadrant: null,
            label: "Not calculated",
            sortRank: 999,
            reason: "Deadline date is invalid.",
        };
    }

    const isImportant = I <= IMPORTANT_MAX;

    /**
     * Urgency decision (practical)
     * ----------------------------
     * Urgent if:
     * - overdue or due today/tomorrow (dLeft <= 1), OR
     * - tight deadline relative to effort, OR
     * - the day's workload makes it risky to postpone.
     */
    const effectiveDays = Math.max(dLeft, 0); // overdue treated as 0
    const remainingWorkload = clampNumber(workloadHours, { min: 0, max: 200 }) ?? 0;
    const capacity = clampNumber(dailyFocusHours, { min: 1, max: 16 }) ?? DEFAULT_DAILY_FOCUS_HOURS;

    // How "heavy" this day becomes if we include this task
    const projectedLoad = remainingWorkload + E;

    // Deadline pressure rules
    const dueSoon = effectiveDays <= 1;
    const dueThisWeek = effectiveDays <= 3;

    // Effort pressure (bigger tasks become urgent sooner)
    const heavyTask = E >= 4; // 4+ hours is a meaningful chunk
    const hugeTask = E >= 8;

    // Load pressure (if your day is already packed and deadline is close)
    const overloaded = projectedLoad > capacity;

    const isUrgent =
        dLeft <= 0 || // overdue
        dueSoon ||
        (heavyTask && dueThisWeek) ||
        (hugeTask && effectiveDays <= 5) ||
        (overloaded && effectiveDays <= 2);

    let quadrant = "Q4";
    let label = "Eliminate";
    let sortRank = 4;

    if (isImportant && isUrgent) {
        quadrant = "Q1";
        label = "Do now";
        sortRank = 1;
    } else if (isImportant && !isUrgent) {
        quadrant = "Q2";
        label = "Schedule";
        sortRank = 2;
    } else if (!isImportant && isUrgent) {
        quadrant = "Q3";
        label = "Delegate";
        sortRank = 3;
    } else {
        quadrant = "Q4";
        label = "Eliminate";
        sortRank = 4;
    }

    // Human-readable explanation for UI (useful in modal)
    const reasonParts = [];
    reasonParts.push(isImportant ? "Important (1–4)" : "Not important (5–10)");
    if (dLeft < 0) reasonParts.push("Overdue");
    else if (dLeft === 0) reasonParts.push("Due today");
    else reasonParts.push(`Due in ${dLeft} day(s)`);

    if (heavyTask) reasonParts.push(`Effort: ${E}h`);
    if (overloaded) reasonParts.push(`Day load: ${projectedLoad.toFixed(1)}h > ${capacity}h`);

    return {
        isCalculated: true,
        isImportant,
        isUrgent,
        quadrant,
        label,
        sortRank,
        reason: reasonParts.join(" • "),
        meta: {
            importance: I,
            effortHours: E,
            daysLeft: dLeft,
            workloadHours: remainingWorkload,
            dailyFocusHours: capacity,
        },
    };
};

/**
 * Sort helper (compare with other tasks)
 * -------------------------------------
 * Sort by Eisenhower rank, then nearest deadline, then higher effort.
 * Assumes task.deadline is "YYYY-MM-DD" or "".
 */
export const sortTasksByMatrix = (tasks, { today = toYmd(dayjs()) } = {}) => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    return [...safeTasks].sort((a, b) => {
        const ra = Number.isFinite(a?.matrixSortRank) ? a.matrixSortRank : 999;
        const rb = Number.isFinite(b?.matrixSortRank) ? b.matrixSortRank : 999;
        if (ra !== rb) return ra - rb;

        const da = a?.deadline ? daysUntil(a.deadline, today) : 99999;
        const db = b?.deadline ? daysUntil(b.deadline, today) : 99999;
        if (da !== db) return da - db;

        const ea = clampNumber(a?.effort, { min: 0, max: 999 }) ?? 0;
        const eb = clampNumber(b?.effort, { min: 0, max: 999 }) ?? 0;
        return eb - ea;
    });
};