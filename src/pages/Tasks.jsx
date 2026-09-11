import { useContext, useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import ProjectChat from "../components/ProjectChat";

import {
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksv1,
    getTaskAttachments,
    uploadTaskAttachment,
    deleteTaskAttachment,
    getTaskComments,
    createComment,
    deleteComment,
} from "../services/taskService";

import {
    getProjects,
    getProjectMembers,
} from "../services/projectService";

import { toast } from "react-toastify";
import {
    createNotification,
} from "../services/notificationService";

import {
    AuthContext,
} from "../context/AuthContext";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:5000";

// =========================================================
// SEARCHABLE SELECT
// Search + scroll in one dropdown, no external package needed
// =========================================================

function SearchableSelect({
    value,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    disabled = false,
    loading = false,
    emptyText = "No options found.",
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef(null);
    const searchInputRef = useRef(null);

    const selectedOption = options.find(
        (option) =>
            String(option.value) ===
            String(value)
    );

    const normalizedSearch = search
        .trim()
        .toLowerCase();

    const filteredOptions = options.filter(
        (option) => {
            if (!normalizedSearch) {
                return true;
            }

            const searchableText = `${
                option.label || ""
            } ${
                option.subtitle || ""
            } ${
                option.searchText || ""
            }`
                .toLowerCase();

            return searchableText.includes(
                normalizedSearch
            );
        }
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(
                    event.target
                )
            ) {
                setOpen(false);
                setSearch("");
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    useEffect(() => {
        if (disabled) {
            setOpen(false);
            setSearch("");
        }
    }, [disabled]);

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => {
                searchInputRef.current?.focus();
            });
        }
    }, [open]);

    const handleToggle = () => {
        if (disabled) {
            return;
        }

        setOpen((prev) => !prev);
        setSearch("");
    };

    const handleSelect = (option) => {
        onChange(option.value);
        setOpen(false);
        setSearch("");
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();

            if (filteredOptions.length > 0) {
                handleSelect(
                    filteredOptions[0]
                );
            }
        }

        if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
            setSearch("");
        }
    };

    return (
        <div
            ref={wrapperRef}
            className={`searchable-select ${
                open ? "open" : ""
            } ${
                disabled ? "disabled" : ""
            }`}
        >
            <button
                type="button"
                className="searchable-select-trigger"
                onClick={handleToggle}
                disabled={disabled}
                aria-expanded={open}
            >
                <span
                    className={
                        selectedOption
                            ? "searchable-select-value"
                            : "searchable-select-placeholder"
                    }
                >
                    {selectedOption
                        ? selectedOption.label
                        : placeholder}
                </span>

                <span
                    className={`searchable-select-arrow ${
                        open ? "open" : ""
                    }`}
                >
                    ▾
                </span>
            </button>

            {open && (
                <div className="searchable-select-dropdown">
                    <div className="searchable-select-search-wrap">
                        <span className="searchable-select-search-icon">
                            🔍
                        </span>

                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            onKeyDown={
                                handleSearchKeyDown
                            }
                            className="searchable-select-search"
                            placeholder={
                                searchPlaceholder
                            }
                            autoComplete="off"
                        />
                    </div>

                    <div className="searchable-select-options">
                        {loading ? (
                            <div className="searchable-select-empty">
                                Loading...
                            </div>
                        ) : filteredOptions.length ===
                          0 ? (
                            <div className="searchable-select-empty">
                                {emptyText}
                            </div>
                        ) : (
                            filteredOptions.map(
                                (option) => {
                                    const selected =
                                        String(
                                            option.value
                                        ) ===
                                        String(value);

                                    return (
                                        <button
                                            key={
                                                option.value
                                            }
                                            type="button"
                                            className={`searchable-select-option ${
                                                selected
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleSelect(
                                                    option
                                                )
                                            }
                                        >
                                            <span className="searchable-select-option-text">
                                                <span className="searchable-select-option-label">
                                                    {
                                                        option.label
                                                    }
                                                </span>

                                                {option.subtitle && (
                                                    <span className="searchable-select-option-subtitle">
                                                        {
                                                            option.subtitle
                                                        }
                                                    </span>
                                                )}
                                            </span>

                                            {selected && (
                                                <span className="searchable-select-check">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    );
                                }
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function Tasks() {
    const {
    user: currentUser,
} = useContext(AuthContext);
    // =========================================================
    // TASK / PROJECT STATE
    // =========================================================

    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);

    // Task form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [projectId, setProjectId] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("medium");

    // Editing
    const [editingTaskId, setEditingTaskId] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [myTasksOnly, setMyTasksOnly] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Project selected for viewing tasks
    const [selectedProject, setSelectedProject] = useState("");

    // Loading
    const [loading, setLoading] = useState(false);
    const [savingTask, setSavingTask] = useState(false);
    const [priorityLoading, setPriorityLoading] = useState(false);
    const priorityLoadingTimerRef = useRef(null);

    // Project owner for status permissions in the task list
    const [selectedProjectOwnerId, setSelectedProjectOwnerId] = useState("");

    // Project members
    const [projectMembers, setProjectMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    // Attachments
    const [attachments, setAttachments] = useState({});
    const [selectedFiles, setSelectedFiles] = useState({});
    const [fileInputKey, setFileInputKey] = useState({});

    // Comments
    const [comments, setComments] = useState({});
    const [commentText, setCommentText] = useState({});

    // Confirmation dialog (replaces window.confirm)
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    const openConfirm = (title, message, onConfirm) => {
        setConfirmState({ open: true, title, message, onConfirm });
    };

    const closeConfirm = () => {
        setConfirmState({
            open: false,
            title: "",
            message: "",
            onConfirm: null,
        });
    };

    const handleConfirm = async () => {
        if (confirmState.onConfirm) {
            await confirmState.onConfirm();
        }

        closeConfirm();
    };

    // =========================================================
    // FETCH TASKS
    // =========================================================

    const fetchTasks = async () => {
        if (!selectedProject) {
            setTasks([]);
            setTotalPages(1);
            return;
        }

        setLoading(true);

        try {
            // When "My assigned tasks" is enabled, load a larger
            // project result set so the checkbox can filter the whole
            // selected project instead of only the current 10-task page.
            const requestPage = myTasksOnly ? 1 : page;
            const requestLimit = myTasksOnly ? 1000 : 10;

            const res = await getTasksv1(
                selectedProject,
                requestPage,
                requestLimit,
                search,
                statusFilter === "all" ? "" : statusFilter
            );

            setTasks(res.data.tasks || []);
            setTotalPages(
                myTasksOnly
                    ? 1
                    : res.data.totalPages || 1
            );
        } catch (err) {
            console.log(
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Failed to load tasks"
            );

            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH PROJECTS
    // =========================================================

    const fetchProjects = async () => {
        try {
            const res = await getProjects();

            setProjects(
                res.data.projects ||
                res.data ||
                []
            );
        } catch (err) {
            console.log(
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Failed to load projects"
            );
        }
    };

    // =========================================================
    // FETCH PROJECT MEMBERS
    // =========================================================

    const fetchProjectMembers = async (selectedProjectId) => {
        if (!selectedProjectId) {
            setProjectMembers([]);
            setAssignedTo("");
            return;
        }

        setLoadingMembers(true);

        try {
            const res = await getProjectMembers(
                selectedProjectId
            );

            setProjectMembers(
                res.data.members || []
            );
        } catch (err) {
            console.log(
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Failed to load project members"
            );

            setProjectMembers([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    // =========================================================
    // EDIT TASK
    // =========================================================

    const handleEditTask = (task) => {
        setEditingTaskId(task._id);

        setTitle(task.title || "");
        setDescription(task.description || "");

        const selectedProjectId =
            task.project?._id ||
            task.project ||
            "";

        setProjectId(selectedProjectId);

        setAssignedTo(
            task.assignedTo?._id ||
            task.assignedTo ||
            ""
        );

        fetchProjectMembers(selectedProjectId);

        setDueDate(
            task.dueDate
                ? new Date(task.dueDate)
                    .toISOString()
                    .split("T")[0]
                : ""
        );

        setPriority(
            task.priority || "medium"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================================================
    // CANCEL EDIT
    // =========================================================

    const handleCancelEdit = () => {
        setEditingTaskId(null);

        setTitle("");
        setDescription("");
        setProjectId("");
        setAssignedTo("");
        setDueDate("");
        setPriority("medium");

        setProjectMembers([]);
    };


    
// =========================================================
// NOTIFICATION HELPERS
// =========================================================

const getTaskById = (taskId) => {
    return tasks.find(
        (task) =>
            task._id === taskId
    );
};

const getAssignedUserId = (task) => {
    return (
        task?.assignedTo?._id ||
        task?.assignedTo ||
        null
    );
};

const sendUserNotification = async (
    recipientId,
    type,
    message
) => {
    if (!recipientId) {
        return;
    }

    const currentUserId =
        currentUser?._id ||
        currentUser?.id;

    // Don't notify yourself
    if (
        currentUserId &&
        String(currentUserId) ===
            String(recipientId)
    ) {
        return;
    }

    try {
        await createNotification({
            recipientId,
            type,
            message,
        });
    } catch (err) {
        console.log(
            "Notification failed:",
            err.response?.data ||
                err.message
        );
    }
};


    // =========================================================
    // CREATE / UPDATE TASK
    // =========================================================

    const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
        toast.warning(
            "Task title is required."
        );

        return;
    }

    if (!projectId) {
        toast.warning(
            "Please select a project."
        );

        return;
    }

    if (!assignedTo) {
        toast.warning(
            "Please select a user to assign the task."
        );

        return;
    }

    if (!dueDate) {
        toast.warning(
            "Please select a due date."
        );

        return;
    }

    setSavingTask(true);

    try {
        const taskData = {
            title: title.trim(),
            description:
                description.trim(),
            projectId,
            assignedTo,
            dueDate,
            priority,
        };

        if (editingTaskId) {
            const previousTask =
                getTaskById(
                    editingTaskId
                );

            const previousAssignedId =
                getAssignedUserId(
                    previousTask
                );

            await updateTask(
                editingTaskId,
                taskData
            );

            toast.success(
                "Task updated successfully!"
            );

            // Assignment changed
            if (
                String(
                    previousAssignedId
                ) !==
                String(assignedTo)
            ) {
                await sendUserNotification(
                    assignedTo,
                    "task-assigned",
                    `You were assigned to task "${title.trim()}".`
                );
            } else {
                // Same user, task edited
                await sendUserNotification(
                    assignedTo,
                    "task-updated",
                    `Task "${title.trim()}" was updated.`
                );
            }
        } else {
            await createTask(
                taskData
            );

            toast.success(
                "Task created successfully!"
            );

            await sendUserNotification(
                assignedTo,
                "task-assigned",
                `You were assigned to task "${title.trim()}".`
            );
        }

        setTitle("");
        setDescription("");
        setProjectId("");
        setAssignedTo("");
        setProjectMembers([]);
        setDueDate("");
        setPriority("medium");

        setEditingTaskId(
            null
        );

        await fetchTasks();
    } catch (err) {
        console.log(
            err.response?.data ||
                err.message
        );

        toast.error(
            err.response?.data?.message ||
                "Failed to save task"
        );
    } finally {
        setSavingTask(
            false
        );
    }
};

    // =========================================================
    // DELETE TASK
    // =========================================================

    const handleDeleteTask = (taskId) => {
        openConfirm(
            "Delete Task",
            "Are you sure you want to delete this task? This cannot be undone.",
            async () => {
                try {
                    await deleteTask(taskId);

                    toast.success(
                        "Task deleted successfully!"
                    );

                    await fetchTasks();
                } catch (err) {
                    console.log(
                        err.response?.data || err.message
                    );

                    toast.error(
                        err.response?.data?.message ||
                        "Delete failed"
                    );
                }
            }
        );
    };

    // =========================================================
    // CHANGE STATUS
    // =========================================================

  const handleStatusChange = async (
    taskId,
    newStatus
) => {
    try {
        const task =
            getTaskById(taskId);

        await updateTaskStatus(
            taskId,
            newStatus
        );

        toast.success(
            "Task status updated!"
        );

        await sendUserNotification(
            getAssignedUserId(task),

            "task-status-changed",

            `Task "${
                task?.title || "Task"
            }" status was changed to "${newStatus}".`
        );

        await fetchTasks();
    } catch (err) {
        console.log(
            err.response?.data ||
                err.message
        );

        toast.error(
            err.response?.data?.message ||
                "Failed to update status"
        );
    }
};

    // =========================================================
    // GET ATTACHMENTS
    // =========================================================

    const handleGetAttachments = async (taskId) => {
        try {
            const res =
                await getTaskAttachments(taskId);

            setAttachments((prev) => ({
                ...prev,
                [taskId]:
                    res.data.attachments || [],
            }));
        } catch (err) {
            console.log(
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Failed to load attachments"
            );
        }
    };

    // =========================================================
    // UPLOAD ATTACHMENT
    // =========================================================
const handleUploadAttachment = async (
    taskId
) => {
    const file =
        selectedFiles[taskId];

    if (!file) {
        toast.warning(
            "Please select a file first."
        );

        return;
    }

    try {
        const task =
            getTaskById(taskId);

        await uploadTaskAttachment(
            taskId,
            file
        );

        toast.success(
            "Attachment uploaded successfully!"
        );

        await sendUserNotification(
            getAssignedUserId(task),

            "attachment-uploaded",

            `A new attachment "${file.name}" was uploaded to task "${
                task?.title || "Task"
            }".`
        );

        setSelectedFiles(
            (prev) => ({
                ...prev,
                [taskId]: null,
            })
        );

        setFileInputKey(
            (prev) => ({
                ...prev,

                [taskId]:
                    (prev[
                        taskId
                    ] || 0) + 1,
            })
        );

        await handleGetAttachments(
            taskId
        );
    } catch (err) {
        console.log(
            err.response?.data ||
                err.message
        );

        toast.error(
            err.response?.data?.message ||
                "Failed to upload attachment"
        );
    }
};
    // =========================================================
    // DELETE ATTACHMENT
    // =========================================================

    const handleDeleteAttachment = (
        taskId,
        attachmentId
    ) => {
        openConfirm(
            "Delete Attachment",
            "Are you sure you want to delete this attachment?",
            async () => {
                try {
                    await deleteTaskAttachment(
                        taskId,
                        attachmentId
                    );

                    toast.success(
                        "Attachment deleted successfully!"
                    );

                    await handleGetAttachments(taskId);
                } catch (err) {
                    console.log(
                        err.response?.data || err.message
                    );

                    toast.error(
                        err.response?.data?.message ||
                        "Failed to delete attachment"
                    );
                }
            }
        );
    };

    // =========================================================
    // GET COMMENTS
    // =========================================================

    const handleGetComments = async (taskId) => {
        try {
            const res =
                await getTaskComments(taskId);

            setComments((prev) => ({
                ...prev,
                [taskId]:
                    res.data.comments || [],
            }));
        } catch (err) {
            console.log(
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Failed to load comments"
            );
        }
    };

    // =========================================================
    // CREATE COMMENT
    // =========================================================

    const handleCreateComment = async (
    taskId
) => {
    const content =
        commentText[taskId];

    if (!content?.trim()) {
        toast.warning(
            "Please enter a comment."
        );

        return;
    }

    try {
        const task =
            getTaskById(taskId);

        await createComment(
            taskId,
            content.trim()
        );

        toast.success(
            "Comment added successfully!"
        );

        const shortComment =
            content.trim().length > 80
                ? `${content
                      .trim()
                      .slice(
                          0,
                          80
                      )}...`
                : content.trim();

        await sendUserNotification(
            getAssignedUserId(task),

            "comment-added",

            `${
                currentUser?.name ||
                "Someone"
            } commented on "${
                task?.title ||
                "your task"
            }": ${shortComment}`
        );

        setCommentText(
            (prev) => ({
                ...prev,
                [taskId]: "",
            })
        );

        await handleGetComments(
            taskId
        );
    } catch (err) {
        console.log(
            err.response?.data ||
                err.message
        );

        toast.error(
            err.response?.data?.message ||
                "Failed to add comment"
        );
    }
};

    // =========================================================
    // DELETE COMMENT
    // =========================================================

    const handleDeleteComment = (
        commentId,
        taskId
    ) => {
        openConfirm(
            "Delete Comment",
            "Are you sure you want to delete this comment?",
            async () => {
                try {
                    await deleteComment(commentId);

                    toast.success(
                        "Comment deleted successfully!"
                    );

                    await handleGetComments(taskId);
                } catch (err) {
                    console.log(
                        err.response?.data || err.message
                    );

                    toast.error(
                        err.response?.data?.message ||
                        "Failed to delete comment"
                    );
                }
            }
        );
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchProjects();
    }, []);

    // =========================================================
    // LOAD TASKS WHEN FILTERS CHANGE
    // =========================================================

    useEffect(() => {
        fetchTasks();
    }, [
        selectedProject,
        page,
        search,
        statusFilter,
        myTasksOnly,
    ]);

    // =========================================================
    // LOAD SELECTED PROJECT OWNER
    // Used only to control who can change a task status in the UI
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const fetchSelectedProjectOwner = async () => {
            if (!selectedProject) {
                setSelectedProjectOwnerId("");
                return;
            }

            try {
                const res = await getProjectMembers(
                    selectedProject
                );

                if (!cancelled) {
                    setSelectedProjectOwnerId(
                        res.data?.owner?._id ||
                        res.data?.owner ||
                        ""
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setSelectedProjectOwnerId("");
                }

                console.log(
                    err.response?.data ||
                    err.message
                );
            }
        };

        fetchSelectedProjectOwner();

        return () => {
            cancelled = true;
        };
    }, [selectedProject]);

    // =========================================================
    // PRIORITY FILTER SKELETON
    // Priority filtering is local, so show a short skeleton transition
    // instead of making an unnecessary API request.
    // =========================================================

    const handlePriorityFilterChange = (value) => {
        setPriorityFilter(value);
        setPage(1);
        setPriorityLoading(true);

        if (priorityLoadingTimerRef.current) {
            clearTimeout(
                priorityLoadingTimerRef.current
            );
        }

        priorityLoadingTimerRef.current = setTimeout(
            () => {
                setPriorityLoading(false);
            },
            350
        );
    };

    useEffect(() => {
        return () => {
            if (priorityLoadingTimerRef.current) {
                clearTimeout(
                    priorityLoadingTimerRef.current
                );
            }
        };
    }, []);

    // =========================================================
    // FILTER PRIORITY + MY ASSIGNED TASKS LOCALLY
    // =========================================================

    const currentUserId =
        currentUser?._id ||
        currentUser?.id ||
        "";

    const canChangeTaskStatus = (task) => {
        const assignedUserId =
            task?.assignedTo?._id ||
            task?.assignedTo ||
            "";

        const isAdmin =
            currentUser?.role === "admin";

        const isProjectOwner =
            currentUserId &&
            selectedProjectOwnerId &&
            String(currentUserId) ===
                String(selectedProjectOwnerId);

        const isAssignedUser =
            currentUserId &&
            assignedUserId &&
            String(currentUserId) ===
                String(assignedUserId);

        return (
            isAdmin ||
            isProjectOwner ||
            isAssignedUser
        );
    };

    const canUploadTaskAttachment = (task) => {
        const assignedUserId =
            task?.assignedTo?._id ||
            task?.assignedTo ||
            "";

        const isAdmin =
            currentUser?.role === "admin";

        const isProjectOwner =
            currentUserId &&
            selectedProjectOwnerId &&
            String(currentUserId) ===
                String(selectedProjectOwnerId);

        const isAssignedUser =
            currentUserId &&
            assignedUserId &&
            String(currentUserId) ===
                String(assignedUserId);

        return (
            isAdmin ||
            isProjectOwner ||
            isAssignedUser
        );
    };

    const filteredTasks = tasks.filter((task) => {
        const matchesPriority =
            priorityFilter === "all" ||
            task.priority === priorityFilter;

        const assignedUserId =
            task.assignedTo?._id ||
            task.assignedTo ||
            "";

        const matchesAssignedUser =
            !myTasksOnly ||
            (
                currentUserId &&
                String(assignedUserId) ===
                    String(currentUserId)
            );

        return (
            matchesPriority &&
            matchesAssignedUser
        );
    });

    // =========================================================
    // SEARCHABLE FORM OPTIONS
    // =========================================================

    const projectOptions = projects.map(
        (project) => ({
            value: project._id,
            label: project.name,
            searchText:
                project.description || "",
        })
    );

    const assignedUserOptions =
        projectMembers.map((member) => ({
            value: member._id,
            label: member.name,
            subtitle: member.email,
            searchText:
                `${member.name || ""} ${
                    member.email || ""
                }`,
        }));

    // =========================================================
    // STYLES
    // =========================================================

    const styles = `
        @keyframes fadeSlideIn {
            from {
                opacity: 0;
                transform: translateY(14px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes skeletonPulse {
            0% {
                opacity: 1;
            }

            50% {
                opacity: 0.55;
            }

            100% {
                opacity: 1;
            }
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        @keyframes modalFadeIn {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        @keyframes modalPopIn {
            from {
                opacity: 0;
                transform: scale(0.92) translateY(8px);
            }

            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        .tasks-page {
            width: 100%;
            box-sizing: border-box;
        }

        .btn-animated {
            transition:
                transform 0.15s ease,
                box-shadow 0.15s ease,
                opacity 0.15s ease;
        }

        .btn-animated:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 3px 8px var(--shadow-color);
        }

        .btn-animated:active:not(:disabled) {
            transform: translateY(0) scale(0.97);
        }

        .btn-animated:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-primary {
            background: #3b82f6 !important;
            color: #ffffff !important;
            border: none !important;
        }

        .btn-primary:hover:not(:disabled) {
            box-shadow:
                0 4px 12px rgba(59, 130, 246, 0.4)
                !important;
        }

        .btn-secondary {
            background: var(--card-bg) !important;
            color: var(--text-color) !important;
            border: 1px solid var(--border-color) !important;
        }

        .btn-danger {
            background: #dc3545 !important;
            color: #ffffff !important;
            border: none !important;
        }

        .btn-danger:hover:not(:disabled) {
            box-shadow:
                0 4px 12px rgba(220, 53, 69, 0.4)
                !important;
        }

        .btn-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.4);
            border-top-color: white;
            border-radius: 50%;
            display: inline-block;
            animation: spin 0.6s linear infinite;
            vertical-align: middle;
            margin-right: 6px;
        }

        /* ============================
           HEADER
        ============================ */

        .tasks-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 4px;
        }

        .tasks-title {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
        }

        .tasks-count {
            font-size: 13px;
            opacity: 0.6;
            font-weight: 500;
        }

        /* ============================
           FORM
        ============================ */

        .task-form,
        .skeleton-form {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px var(--shadow-color);
            animation: fadeSlideIn 0.35s ease both;
        }

        /* Keep form dropdowns above the filter/search row below */
        .task-form {
            position: relative;
            z-index: 120;
            overflow: visible;
        }

        .task-form h3 {
            margin: 0 0 14px;
            font-size: 15px;
            font-weight: 600;
            opacity: 0.85;
        }

        .task-form input,
        .task-form textarea,
        .task-form select {
            width: 100%;
            box-sizing: border-box;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 14px;
            outline: none;
            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
        }

        .task-form input:focus,
        .task-form textarea:focus,
        .task-form select:focus {
            border-color: #3b82f6;
            box-shadow:
                0 0 0 3px
                rgba(59, 130, 246, 0.15);
        }

        .task-form input::placeholder,
        .task-form textarea::placeholder,
        .task-search::placeholder,
        .comment-input-row input::placeholder {
            color: var(--muted-text);
        }

        /* ============================
           SEARCHABLE SELECT
        ============================ */

        .searchable-select {
            position: relative;
            width: 100%;
        }

        .searchable-select.open {
            z-index: 300;
        }

        .searchable-select.disabled {
            opacity: 0.65;
        }

        .searchable-select-trigger {
            width: 100%;
            min-height: 42px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 10px 12px;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            outline: none;
            cursor: pointer;
            font-family: inherit;
            font-size: 14px;
            text-align: left;
            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease,
                background-color 0.2s ease;
        }

        .searchable-select-trigger:hover:not(:disabled) {
            border-color:
                rgba(59, 130, 246, 0.65);
        }

        .searchable-select.open
        .searchable-select-trigger {
            border-color: #3b82f6;
            box-shadow:
                0 0 0 3px
                rgba(59, 130, 246, 0.15);
        }

        .searchable-select-trigger:disabled {
            cursor: not-allowed;
        }

        .searchable-select-value {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: 500;
        }

        .searchable-select-placeholder {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: var(--muted-text);
        }

        .searchable-select-arrow {
            flex-shrink: 0;
            opacity: 0.65;
            font-size: 13px;
            transition:
                transform 0.18s ease;
        }

        .searchable-select-arrow.open {
            transform: rotate(180deg);
        }

        .searchable-select-dropdown {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            right: 0;
            z-index: 500;
            padding: 8px;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            box-shadow:
                0 12px 32px
                rgba(0, 0, 0, 0.18);
            animation:
                modalPopIn
                0.14s ease both;
        }

        .searchable-select-search-wrap {
            position: relative;
            margin-bottom: 7px;
        }

        .searchable-select-search-icon {
            position: absolute;
            left: 11px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            font-size: 12px;
            opacity: 0.55;
            z-index: 1;
        }

        .searchable-select-search {
            width: 100%;
            height: 38px;
            box-sizing: border-box;
            padding: 8px 10px 8px 32px;
            background:
                var(
                    --section-bg,
                    var(--card-bg)
                );
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 7px;
            outline: none;
            font-family: inherit;
            font-size: 13px;
            box-shadow: none;
        }

        .searchable-select-search:focus {
            border-color: #3b82f6;
            box-shadow:
                0 0 0 3px
                rgba(59, 130, 246, 0.12);
        }

        .searchable-select-options {
            max-height: 220px;
            overflow-y: auto;
            overscroll-behavior: contain;
            scrollbar-width: thin;
        }

        .searchable-select-option {
            width: 100%;
            min-height: 42px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 8px 10px;
            background: transparent;
            color: var(--text-color);
            border: none;
            border-radius: 7px;
            cursor: pointer;
            font-family: inherit;
            text-align: left;
            transition:
                background-color 0.14s ease,
                transform 0.14s ease;
        }

        .searchable-select-option:hover {
            background:
                var(
                    --section-bg,
                    rgba(
                        59,
                        130,
                        246,
                        0.08
                    )
                );
        }

        .searchable-select-option.selected {
            background:
                rgba(
                    59,
                    130,
                    246,
                    0.1
                );
        }

        .searchable-select-option-text {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .searchable-select-option-label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13.5px;
            font-weight: 600;
        }

        .searchable-select-option-subtitle {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 11.5px;
            opacity: 0.62;
        }

        .searchable-select-check {
            flex-shrink: 0;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background:
                rgba(
                    59,
                    130,
                    246,
                    0.14
                );
            color: #3b82f6;
            font-size: 12px;
            font-weight: 800;
        }

        .searchable-select-empty {
            padding: 18px 10px;
            text-align: center;
            font-size: 12.5px;
            opacity: 0.62;
        }

        /* ============================
           FILTERS
        ============================ */

        .task-filter-row {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            margin: 20px 0 8px;
            animation:
                fadeSlideIn 0.3s ease both 0.05s;
        }

        .task-project-select,
        .task-search,
        .task-filter {
            box-sizing: border-box;
            padding: 7px 12px;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 999px;
            font-size: 13px;
            outline: none;
            box-shadow:
                0 1px 4px var(--shadow-color);
            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
        }

        .task-filter-project {
            width: 220px;
            max-width: 220px;
            position: relative;
            z-index: 40;
        }

        .task-filter-project .searchable-select-trigger {
            min-height: 34px;
            padding: 7px 12px;
            border-radius: 999px;
            font-size: 13px;
            box-shadow: 0 1px 4px var(--shadow-color);
        }

        .task-filter-project .searchable-select-dropdown {
            min-width: 280px;
            z-index: 1000;
        }

        .task-project-select {
            max-width: 200px;
        }

        .task-search {
            width: 220px;
            max-width: 220px;
        }

        .task-filter {
            max-width: 150px;
        }

        .my-tasks-filter {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-height: 34px;
            box-sizing: border-box;
            padding: 6px 12px;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 999px;
            box-shadow: 0 1px 4px var(--shadow-color);
            cursor: pointer;
            user-select: none;
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease,
                transform 0.15s ease,
                opacity 0.15s ease;
        }

        .my-tasks-filter:hover:not(.disabled) {
            transform: translateY(-1px);
            border-color: #3b82f6;
            box-shadow:
                0 0 0 3px
                rgba(59, 130, 246, 0.1);
        }

        .my-tasks-filter.active {
            color: #3b82f6;
            border-color: rgba(59, 130, 246, 0.55);
            background: rgba(59, 130, 246, 0.08);
        }

        .my-tasks-filter.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .my-tasks-filter input {
            width: 15px;
            height: 15px;
            margin: 0;
            accent-color: #3b82f6;
            cursor: pointer;
        }

        .my-tasks-filter.disabled input {
            cursor: not-allowed;
        }

        .task-project-select:focus,
        .task-search:focus,
        .task-filter:focus {
            border-color: #3b82f6;
            box-shadow:
                0 0 0 3px
                rgba(59, 130, 246, 0.15);
        }

        /* ============================
           SKELETON
        ============================ */

        .skeleton-block {
            background: var(--border-color);
            border-radius: 6px;
            animation:
                skeletonPulse 1.5s ease-in-out infinite;
        }

        .task-skeleton {
            width: 100%;
            padding: 20px;
            margin-bottom: 15px;
            box-sizing: border-box;
            border-radius: 12px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            box-shadow: 0 2px 6px var(--shadow-color);
            animation:
                fadeSlideIn 0.3s ease both;
        }

        .task-skeleton-actions {
            display: flex;
            gap: 10px;
            margin-top: 18px;
        }

        .task-skeleton-button {
            width: 75px;
            height: 34px;
            border-radius: 8px;
            background: var(--border-color);
            animation:
                skeletonPulse 1.5s ease-in-out infinite;
        }

        .task-skeleton-line {
            height: 14px;
            margin-bottom: 12px;
            border-radius: 6px;
            background: var(--border-color);
            animation:
                skeletonPulse 1.5s ease-in-out infinite;
        }

        .task-skeleton-line.title {
            width: 45%;
            height: 20px;
        }

        .task-skeleton-line.medium {
            width: 70%;
        }

        .task-skeleton-line.short {
            width: 35%;
        }

        /* ============================
           EMPTY STATE
        ============================ */

        .task-empty-state {
            width: 100%;
            padding: 50px 20px;
            margin-top: 20px;
            box-sizing: border-box;
            text-align: center;
            border-radius: 12px;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            animation:
                fadeSlideIn 0.3s ease both;
        }

        .task-empty-icon {
            font-size: 50px;
            margin-bottom: 15px;
        }

        .task-empty-state h3 {
            margin: 0 0 10px;
            font-size: 20px;
        }

        .task-empty-state p {
            margin: 0;
            color: var(--text-color);
            opacity: 0.7;
        }

        /* ============================
           TASK CARD
        ============================ */

        .task-card {
            width: 100%;
            box-sizing: border-box;
            overflow-wrap: break-word;
            color: var(--text-color);
            border-radius: 12px;
            animation:
                fadeSlideIn 0.35s ease both;
            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease,
                background-color 0.2s ease,
                border-color 0.2s ease;
        }

        .task-card:hover {
            transform: translateY(-3px);
            box-shadow:
                0 6px 16px var(--shadow-color);
        }

        .task-card h3 {
            margin: 0 0 6px;
            font-size: 18px;
            font-weight: 700;
        }

        .task-card h4 {
            color: var(--text-color);
            margin: 0 0 12px;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            opacity: 0.65;
        }

        .task-card p {
            color: var(--secondary-text);
            font-size: 14px;
        }

        .task-card strong {
            color: var(--text-color);
        }

        .task-card-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 14px;
        }

        .task-card-actions button {
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
        }

        .task-card select {
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 5px 8px;
            font-size: 13px;
        }

        /* ============================
           SUBSECTIONS
        ============================ */

        .task-subsection {
            margin-top: 15px;
            padding: 16px;
            background:
                var(--section-bg, var(--card-bg));
            border: 1px solid var(--border-color);
            border-radius: 10px;
        }

        .attachment-upload-row {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .attachment-upload-row input {
            max-width: 100%;
            color: var(--text-color);
        }

        .attachment-upload-row button,
        .task-subsection > button {
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }

        .attachment-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            flex-wrap: wrap;
            padding: 10px 12px;
            margin-bottom: 8px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
        }

        .attachment-info {
            min-width: 0;
            overflow-wrap: anywhere;
            color: var(--text-color);
        }

        .attachment-item small {
            color: var(--muted-text);
        }

        .attachment-item a {
            color: var(--link-color, #3b82f6);
            margin-right: 10px;
            text-decoration: none;
            font-weight: 600;
        }

        .attachment-item a:hover {
            text-decoration: underline;
        }

        .attachment-item button {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
        }

        /* ============================
           COMMENTS
        ============================ */

        .comment-input-row {
            display: flex;
            gap: 10px;
            width: 100%;
            margin-bottom: 10px;
        }

        .comment-input-row input {
            min-width: 0;
            flex: 1;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 9px 12px;
            font-size: 13px;
            outline: none;
            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
        }

        .comment-input-row input:focus {
            border-color: #3b82f6;
            box-shadow:
                0 0 0 3px
                rgba(59, 130, 246, 0.15);
        }

        .comment-input-row button {
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }

        .comment-item {
            color: var(--text-color);
            padding: 10px 12px;
            margin-bottom: 8px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
        }

        .comment-item strong {
            color: var(--text-color);
        }

        .comment-item small {
            color: var(--muted-text) !important;
        }

        .comment-item p {
            color: var(--secondary-text);
        }

        .comment-item button {
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
        }

        /* ============================
           PAGINATION
        ============================ */

        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
            margin-top: 24px;
            animation:
                fadeSlideIn 0.3s ease both;
        }

        .pagination span {
            color: var(--text-color);
            font-size: 13px;
            opacity: 0.75;
        }

        .pagination button {
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }

        .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* ============================
           CONFIRM MODAL
        ============================ */

        .confirm-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: modalFadeIn 0.15s ease;
            padding: 20px;
            box-sizing: border-box;
        }

        .confirm-box {
            width: 100%;
            max-width: 380px;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            padding: 24px;
            box-sizing: border-box;
            animation: modalPopIn 0.18s ease;
        }

        .confirm-icon {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(220, 53, 69, 0.12);
            color: #dc3545;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            margin-bottom: 14px;
        }

        .confirm-box h3 {
            margin: 0 0 8px;
            font-size: 17px;
            font-weight: 700;
        }

        .confirm-box p {
            margin: 0 0 20px;
            font-size: 14px;
            color: var(--secondary-text);
            line-height: 1.5;
        }

        .confirm-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        .confirm-actions button {
            padding: 9px 18px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
        }

        /* ============================
           RESPONSIVE
        ============================ */

        @media (max-width: 768px) {
            .task-project-select,
            .task-search,
            .task-filter {
                max-width: 100%;
                width: 100%;
            }

            .task-filter-row {
                flex-direction: column;
                align-items: stretch;
            }

            .task-filter-project {
                width: 100%;
                max-width: 100%;
            }

            .task-filter-project .searchable-select-dropdown {
                min-width: 100%;
            }

            .my-tasks-filter {
                width: 100%;
                justify-content: flex-start;
            }

            .attachment-upload-row {
                flex-direction: column;
                align-items: stretch;
            }

            .attachment-upload-row input,
            .attachment-upload-row button {
                width: 100%;
                box-sizing: border-box;
            }

            .attachment-item {
                flex-direction: column;
                align-items: stretch;
            }

            .attachment-item > div:last-child {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .comment-input-row {
                flex-direction: column;
            }

            .comment-input-row input,
            .comment-input-row button {
                width: 100%;
                box-sizing: border-box;
            }

            .task-card select {
                max-width: 100%;
            }
        }

        @media (max-width: 480px) {
            .tasks-title {
                font-size: 23px;
            }

            .task-card h3 {
                font-size: 17px;
            }

            .task-card p {
                font-size: 13.5px;
            }

            .task-card-actions button {
                flex: 1;
            }

            .pagination button {
                padding: 8px 10px;
            }
        }
    `;

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Layout>
            <style>{styles}</style>

            {/* =================================================
                CONFIRMATION MODAL
            ================================================= */}

            {confirmState.open && (
                <div
                    className="confirm-overlay"
                    onClick={closeConfirm}
                >
                    <div
                        className="confirm-box"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="confirm-icon">
                            🗑
                        </div>

                        <h3>{confirmState.title}</h3>

                        <p>{confirmState.message}</p>

                        <div className="confirm-actions">
                            <button
                                type="button"
                                onClick={closeConfirm}
                                className="btn-animated btn-secondary"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="btn-animated btn-danger"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                className="tasks-page"
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                }}
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="tasks-header">
                    <h1 className="tasks-title">
                        📝 Tasks
                    </h1>

                    <span className="tasks-count">
                        {filteredTasks.length} shown
                    </span>
                </div>

                {/* =================================================
                    CREATE / EDIT FORM
                ================================================= */}

                {savingTask ? (
                    <div
                        className="skeleton-form"
                        style={{
                            margin: "20px 0",
                            maxWidth: "450px",
                        }}
                    >
                        <div
                            className="skeleton-block"
                            style={{
                                width: "40%",
                                height: "16px",
                                marginBottom: "16px",
                            }}
                        />

                        <div
                            className="skeleton-block"
                            style={{
                                width: "100%",
                                height: "38px",
                                marginBottom: "10px",
                            }}
                        />

                        <div
                            className="skeleton-block"
                            style={{
                                width: "100%",
                                height: "70px",
                                marginBottom: "10px",
                            }}
                        />

                        <div
                            className="skeleton-block"
                            style={{
                                width: "100%",
                                height: "38px",
                                marginBottom: "10px",
                            }}
                        />

                        <div
                            className="skeleton-block"
                            style={{
                                width: "100%",
                                height: "38px",
                                marginBottom: "10px",
                            }}
                        />

                        <div
                            className="skeleton-block"
                            style={{
                                width: "100%",
                                height: "38px",
                                marginBottom: "10px",
                            }}
                        />

                        <div
                            className="skeleton-block"
                            style={{
                                width: "100%",
                                height: "40px",
                            }}
                        />
                    </div>
                ) : (
                    <form
                        onSubmit={handleCreateTask}
                        className="task-form"
                        style={{
                            margin: "20px 0",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            maxWidth: "450px",
                        }}
                    >
                        <h3>
                            {editingTaskId
                                ? "Edit Task"
                                : "New Task"}
                        </h3>

                        <input
                            type="text"
                            placeholder="Task Title"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                        />

                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            rows="4"
                        />

                        {/* Project - Search + Scroll */}

                        <SearchableSelect
                            value={projectId}
                            options={projectOptions}
                            placeholder="Select Project"
                            searchPlaceholder="Search projects..."
                            emptyText="No projects found."
                            onChange={(selectedProjectId) => {
                                setProjectId(
                                    selectedProjectId
                                );

                                setAssignedTo("");
                                setProjectMembers([]);

                                if (selectedProjectId) {
                                    fetchProjectMembers(
                                        selectedProjectId
                                    );
                                }
                            }}
                        />

                        {/* Assigned User - Search + Scroll */}

                        <SearchableSelect
                            value={assignedTo}
                            options={assignedUserOptions}
                            disabled={
                                !projectId ||
                                loadingMembers
                            }
                            loading={loadingMembers}
                            placeholder={
                                !projectId
                                    ? "Select Project First"
                                    : loadingMembers
                                        ? "Loading Members..."
                                        : projectMembers.length === 0
                                            ? "No Members Available"
                                            : "Select User to Assign"
                            }
                            searchPlaceholder="Search user by name or email..."
                            emptyText="No matching users found."
                            onChange={(selectedUserId) =>
                                setAssignedTo(
                                    selectedUserId
                                )
                            }
                        />

                        {/* Priority */}

                        <select
                            value={priority}
                            onChange={(e) =>
                                setPriority(
                                    e.target.value
                                )
                            }
                        >
                            <option value="low">
                                🟢 Low
                            </option>

                            <option value="medium">
                                🟡 Medium
                            </option>

                            <option value="high">
                                🔴 High
                            </option>
                        </select>

                        {/* Due Date */}

                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) =>
                                setDueDate(
                                    e.target.value
                                )
                            }
                        />

                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={savingTask}
                            className="btn-animated btn-primary"
                            style={{
                                padding: "10px",
                                borderRadius: "8px",
                                fontWeight: 600,
                            }}
                        >
                            {savingTask && (
                                <span className="btn-spinner" />
                            )}

                            {editingTaskId
                                ? "Update Task"
                                : "Create Task"}
                        </button>

                        {/* Cancel */}

                        {editingTaskId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="btn-animated btn-secondary"
                                style={{
                                    padding: "10px",
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                }}
                            >
                                Cancel Editing
                            </button>
                        )}
                    </form>
                )}

                {/* =================================================
                    TASK FILTERS
                ================================================= */}

                <div className="task-filter-row">
                    {/* Project - search + scroll */}

                    <div className="task-filter-project">
                        <SearchableSelect
                            value={selectedProject}
                            options={projectOptions}
                            placeholder="Select Project"
                            searchPlaceholder="Search projects..."
                            emptyText="No matching projects found."
                            onChange={(nextProject) => {
                                setSelectedProject(
                                    nextProject
                                );

                                if (!nextProject) {
                                    setMyTasksOnly(false);
                                }

                                setPage(1);
                            }}
                        />
                    </div>

                    {/* Search */}

                    <input
                        className="task-search"
                        type="text"
                        placeholder="🔍 Search tasks..."
                        value={search}
                        onChange={(e) => {
                            setSearch(
                                e.target.value
                            );

                            setPage(1);
                        }}
                    />

                    {/* Status */}

                    <select
                        className="task-filter"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(
                                e.target.value
                            );

                            setPage(1);
                        }}
                    >
                        <option value="all">
                            All Tasks
                        </option>

                        <option value="todo">
                            Todo
                        </option>

                        <option value="in-progress">
                            In Progress
                        </option>

                        <option value="done">
                            Done
                        </option>
                    </select>

                    {/* Priority */}

                    <select
                        className="task-filter"
                        value={priorityFilter}
                        onChange={(e) =>
                            handlePriorityFilterChange(
                                e.target.value
                            )
                        }
                    >
                        <option value="all">
                            All Priorities
                        </option>

                        <option value="high">
                            🔴 High
                        </option>

                        <option value="medium">
                            🟡 Medium
                        </option>

                        <option value="low">
                            🟢 Low
                        </option>
                    </select>

                    {/* My Assigned Tasks */}

                    <label
                        className={`my-tasks-filter ${
                            myTasksOnly
                                ? "active"
                                : ""
                        } ${
                            !selectedProject
                                ? "disabled"
                                : ""
                        }`}
                        title={
                            selectedProject
                                ? "Show only tasks assigned to me"
                                : "Select a project first"
                        }
                    >
                        <input
                            type="checkbox"
                            checked={myTasksOnly}
                            disabled={!selectedProject}
                            onChange={(e) => {
                                setMyTasksOnly(
                                    e.target.checked
                                );
                                setPage(1);
                            }}
                        />

                        <span>
                            👤 My assigned tasks
                        </span>
                    </label>
                </div>

                {/* =================================================
                    TASK LIST
                ================================================= */}

                {loading || priorityLoading ? (
                    <div
                        style={{
                            marginTop: "20px",
                        }}
                    >
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="task-skeleton"
                            >
                                <div className="task-skeleton-line title" />

                                <div className="task-skeleton-line medium" />

                                <div className="task-skeleton-line medium" />

                                <div className="task-skeleton-line short" />

                                <div className="task-skeleton-line" />

                                <div className="task-skeleton-actions">
                                    <div className="task-skeleton-button" />
                                    <div className="task-skeleton-button" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="task-empty-state">
                        <div className="task-empty-icon">
                            📋
                        </div>

                        <h3>
                            {!selectedProject
                                ? "Select a Project"
                                : myTasksOnly
                                    ? "No Tasks Assigned to You"
                                    : "No Tasks Found"}
                        </h3>

                        <p>
                            {!selectedProject
                                ? "Select a project above to view its tasks."
                                : myTasksOnly
                                    ? "You do not have any tasks matching the current filters in this project."
                                    : "There are no tasks matching your current filters."}
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            marginTop: "20px",
                        }}
                    >
                        {filteredTasks.map(
                            (task, index) => (
                                <div
                                    key={task._id}
                                    className="task-card"
                                    style={{
                                        padding: "20px",
                                        marginBottom: "15px",
                                        border:
                                            "1px solid var(--border-color)",
                                        background:
                                            "var(--card-bg)",
                                        boxShadow:
                                            "0 2px 6px var(--shadow-color)",
                                        animationDelay:
                                            `${index * 0.05}s`,
                                    }}
                                >
                                    {/* =================================================
                                        BASIC TASK INFORMATION
                                    ================================================= */}

                                    <h3>
                                        {task.title}
                                    </h3>

                                    <p>
                                        <strong>
                                            Project:
                                        </strong>{" "}
                                        {task.project?.name ||
                                            "Unknown Project"}
                                    </p>

                                    <p>
                                        <strong>
                                            Assigned To:
                                        </strong>{" "}
                                        {task.assignedTo?.name ||
                                            "Unassigned"}
                                    </p>

                                    <p>
                                        <strong>
                                            Description:
                                        </strong>{" "}
                                        {task.description ||
                                            "No description"}
                                    </p>

                                    <p>
                                        <strong>
                                            Priority:
                                        </strong>{" "}

                                        <span
                                            style={{
                                                color:
                                                    task.priority === "high"
                                                        ? "#ef4444"
                                                        : task.priority === "medium"
                                                            ? "#f59e0b"
                                                            : "#22c55e",
                                                fontWeight:
                                                    "bold",
                                            }}
                                        >
                                            {task.priority
                                                ?.toUpperCase()}
                                        </span>
                                    </p>

                                    {/* =================================================
                                        STATUS
                                    ================================================= */}

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>

                                        <select
                                            value={
                                                task.status
                                            }
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    task._id,
                                                    e.target.value
                                                )
                                            }
                                            disabled={
                                                !canChangeTaskStatus(
                                                    task
                                                )
                                            }
                                            title={
                                                canChangeTaskStatus(
                                                    task
                                                )
                                                    ? "Change task status"
                                                    : "Only the project owner, admin, or assigned user can change this status"
                                            }
                                            style={{
                                                marginLeft:
                                                    "10px",
                                                cursor:
                                                    canChangeTaskStatus(
                                                        task
                                                    )
                                                        ? "pointer"
                                                        : "not-allowed",
                                                opacity:
                                                    canChangeTaskStatus(
                                                        task
                                                    )
                                                        ? 1
                                                        : 0.65,
                                            }}
                                        >
                                            <option value="todo">
                                                Todo
                                            </option>

                                            <option value="in-progress">
                                                In Progress
                                            </option>

                                            <option value="done">
                                                Done
                                            </option>
                                        </select>
                                    </p>

                                    {/* =================================================
                                        DUE DATE
                                    ================================================= */}

                                    <p>
                                        <strong>
                                            Due Date:
                                        </strong>{" "}
                                        {task.dueDate
                                            ? new Date(
                                                task.dueDate
                                            ).toLocaleDateString()
                                            : "No due date"}
                                    </p>

                                    {/* =================================================
                                        ATTACHMENTS
                                    ================================================= */}

                                    <div className="task-subsection">
                                        <h4>
                                            📎 Attachments
                                        </h4>

                                        <div className="attachment-upload-row">
                                            {canUploadTaskAttachment(task) && (
                                                <>
                                                    <input
                                                        type="file"
                                                        key={
                                                            fileInputKey[task._id] || 0
                                                        }
                                                        onChange={(e) => {
                                                            setSelectedFiles(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [task._id]:
                                                                        e.target
                                                                            .files?.[0] ||
                                                                        null,
                                                                })
                                                            );
                                                        }}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleUploadAttachment(
                                                                task._id
                                                            )
                                                        }
                                                        className="btn-animated btn-primary"
                                                    >
                                                        Upload
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleGetAttachments(
                                                        task._id
                                                    )
                                                }
                                                className="btn-animated btn-secondary"
                                            >
                                                View Attachments
                                            </button>
                                        </div>

                                        {attachments[
                                            task._id
                                        ]?.length > 0 && (
                                                <div
                                                    style={{
                                                        marginTop:
                                                            "15px",
                                                    }}
                                                >
                                                    {attachments[
                                                        task._id
                                                    ].map(
                                                        (
                                                            attachment
                                                        ) => (
                                                            <div
                                                                key={
                                                                    attachment._id
                                                                }
                                                                className="attachment-item"
                                                            >
                                                                <div className="attachment-info">
                                                                    📄{" "}
                                                                    <strong>
                                                                        {
                                                                            attachment.originalName
                                                                        }
                                                                    </strong>

                                                                    <br />

                                                                    <small>
                                                                        {(
                                                                            attachment.size /
                                                                            1024
                                                                        ).toFixed(
                                                                            1
                                                                        )}{" "}
                                                                        KB
                                                                    </small>
                                                                </div>

                                                                <div>
                                                                    <a
                                                                        href={`${BACKEND_URL}/uploads/${attachment.filename}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        Download
                                                                    </a>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeleteAttachment(
                                                                                task._id,
                                                                                attachment._id
                                                                            )
                                                                        }
                                                                        className="btn-animated btn-danger"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                        {attachments[
                                            task._id
                                        ]?.length === 0 && (
                                                <p
                                                    style={{
                                                        marginTop:
                                                            "10px",
                                                        color:
                                                            "var(--muted-text)",
                                                    }}
                                                >
                                                    No attachments.
                                                </p>
                                            )}
                                    </div>

                                    {/* =================================================
                                        COMMENTS
                                    ================================================= */}

                                    <div className="task-subsection">
                                        <h4>
                                            💬 Comments
                                        </h4>

                                        <div className="comment-input-row">
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                value={
                                                    commentText[
                                                        task._id
                                                    ] || ""
                                                }
                                                onChange={(e) =>
                                                    setCommentText(
                                                        (prev) => ({
                                                            ...prev,
                                                            [task._id]:
                                                                e.target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key ===
                                                        "Enter"
                                                    ) {
                                                        e.preventDefault();

                                                        handleCreateComment(
                                                            task._id
                                                        );
                                                    }
                                                }}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCreateComment(
                                                        task._id
                                                    )
                                                }
                                                className="btn-animated btn-primary"
                                            >
                                                Comment
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleGetComments(
                                                    task._id
                                                )
                                            }
                                            className="btn-animated btn-secondary"
                                            style={{
                                                marginBottom:
                                                    "10px",
                                            }}
                                        >
                                            View Comments
                                        </button>

                                        {comments[
                                            task._id
                                        ]?.length > 0 && (
                                                <div>
                                                    {comments[
                                                        task._id
                                                    ].map(
                                                        (
                                                            comment
                                                        ) => (
                                                            <div
                                                                key={
                                                                    comment._id
                                                                }
                                                                className="comment-item"
                                                            >
                                                                <strong>
                                                                    👤{" "}
                                                                    {comment
                                                                        .user
                                                                        ?.name ||
                                                                        "Unknown User"}
                                                                </strong>

                                                                <small
                                                                    style={{
                                                                        marginLeft:
                                                                            "10px",
                                                                    }}
                                                                >
                                                                    {comment.createdAt
                                                                        ? new Date(
                                                                            comment.createdAt
                                                                        ).toLocaleString()
                                                                        : ""}
                                                                </small>

                                                                <p
                                                                    style={{
                                                                        margin:
                                                                            "6px 0",
                                                                    }}
                                                                >
                                                                    {
                                                                        comment.content
                                                                    }
                                                                </p>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteComment(
                                                                            comment._id,
                                                                            task._id
                                                                        )
                                                                    }
                                                                    className="btn-animated btn-danger"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                        {comments[
                                            task._id
                                        ]?.length === 0 && (
                                                <p
                                                    style={{
                                                        color:
                                                            "var(--muted-text)",
                                                    }}
                                                >
                                                    No comments yet.
                                                </p>
                                            )}
                                    </div>

                                    {/* =================================================
                                        TASK ACTIONS
                                    ================================================= */}

                                    <div className="task-card-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEditTask(
                                                    task
                                                )
                                            }
                                            className="btn-animated btn-secondary"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteTask(
                                                    task._id
                                                )
                                            }
                                            className="btn-animated btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* =================================================
                    PAGINATION
                ================================================= */}

                {selectedProject &&
                    !loading &&
                    totalPages > 1 && (
                        <div className="pagination">
                            <button
                                type="button"
                                onClick={() =>
                                    setPage(
                                        (prev) =>
                                            prev - 1
                                    )
                                }
                                disabled={page === 1}
                                className="btn-animated btn-secondary"
                            >
                                ◀ Previous
                            </button>

                            <span>
                                Page {page} of{" "}
                                {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage(
                                        (prev) =>
                                            prev + 1
                                    )
                                }
                                disabled={
                                    page === totalPages
                                }
                                className="btn-animated btn-secondary"
                            >
                                Next ▶
                            </button>
                        </div>
                    )}

                {selectedProject && (
                    <ProjectChat
                        projectId={selectedProject}
                        projectName={
                            projects.find(
                                (project) =>
                                    String(project._id) ===
                                    String(selectedProject)
                            )?.name || "Project"
                        }
                        currentUser={currentUser}
                    />
                )}
            </div>
        </Layout>
    );
}

export default Tasks;