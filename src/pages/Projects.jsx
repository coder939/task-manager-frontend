import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    getProjectMembers,
    removeMember,
} from "../services/projectService";
import { toast } from "react-toastify";
import { getUsers } from "../services/userService";
import {
    createNotification,
} from "../services/notificationService";

function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function Projects() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [creatingProject, setCreatingProject] = useState(false);

    // Project search
    const [projectSearch, setProjectSearch] = useState("");

    // User search — keyed per project
    const [userSearch, setUserSearch] = useState({});

    // Selected users per project
    const [selectedUsers, setSelectedUsers] = useState({});

    // Track which project is adding members
    const [addingMembersFor, setAddingMembersFor] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [members, setMembers] = useState({});

    // =========================================================
    // CONFIRMATION MODAL
    // =========================================================

    const [confirmState, setConfirmState] = useState({
        open: false,
        title: "",
        message: "",
        confirmText: "Confirm",
        onConfirm: null,
    });

    const openConfirm = (
        title,
        message,
        onConfirm,
        confirmText = "Confirm"
    ) => {
        setConfirmState({
            open: true,
            title,
            message,
            confirmText,
            onConfirm,
        });
    };

    const closeConfirm = () => {
        setConfirmState({
            open: false,
            title: "",
            message: "",
            confirmText: "Confirm",
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
    // LOAD PROJECTS
    // =========================================================

    const fetchProjects = async () => {
        setLoadingProjects(true);

        try {
            const res = await getProjects();

            setProjects(
                res.data.projects ||
                res.data ||
                []
            );
        } catch (err) {
            console.log(
                err.response?.data ||
                err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Failed to load projects"
            );
        } finally {
            setLoadingProjects(false);
        }
    };

    // =========================================================
    // LOAD USERS
    // =========================================================

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await getUsers();

                setUsers(
                    res.data.users ||
                    []
                );
            } catch (err) {
                console.log(
                    err.response?.data ||
                    err.message
                );

                toast.error(
                    err.response?.data?.message ||
                    "Failed to load users"
                );
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        fetchProjects();
    }, []);

    // =========================================================
    // PROJECT SEARCH
    // =========================================================

    const filteredProjects = projects.filter((project) => {
        const search = projectSearch
            .trim()
            .toLowerCase();

        if (!search) {
            return true;
        }

        return (
            project.name
                ?.toLowerCase()
                .includes(search) ||
            project.description
                ?.toLowerCase()
                .includes(search)
        );
    });

    // =========================================================
    // USER SEARCH
    // =========================================================

    const getFilteredUsers = (projectId) => {
        const search = (
            userSearch[projectId] ||
            ""
        )
            .trim()
            .toLowerCase();

        const picked =
            selectedUsers[projectId] ||
            [];

        const pickedIds = picked.map(
            (user) => user._id
        );

        return users.filter((user) => {
            if (
                pickedIds.includes(
                    user._id
                )
            ) {
                return false;
            }

            if (!search) {
                return true;
            }

            return (
                user.name
                    ?.toLowerCase()
                    .includes(search) ||
                user.email
                    ?.toLowerCase()
                    .includes(search)
            );
        });
    };

    // =========================================================
    // PICK USER
    // =========================================================

    const handlePickUser = (
        projectId,
        user
    ) => {
        setSelectedUsers((prev) => {
            const current =
                prev[projectId] ||
                [];

            if (
                current.some(
                    (u) =>
                        u._id ===
                        user._id
                )
            ) {
                return prev;
            }

            return {
                ...prev,
                [projectId]: [
                    ...current,
                    user,
                ],
            };
        });

        setUserSearch((prev) => ({
            ...prev,
            [projectId]: "",
        }));
    };

    // =========================================================
    // UNPICK USER
    // =========================================================

    const handleUnpickUser = (
        projectId,
        userId
    ) => {
        setSelectedUsers((prev) => ({
            ...prev,
            [projectId]: (
                prev[projectId] ||
                []
            ).filter(
                (u) =>
                    u._id !==
                    userId
            ),
        }));
    };

    // =========================================================
    // EDIT PROJECT
    // =========================================================

    const handleEditProject = (
        project
    ) => {
        setEditingProjectId(
            project._id
        );

        setName(project.name);

        setDescription(
            project.description ||
            ""
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================================================
    // ADD MEMBERS
    // =========================================================

    const handleAddMembers = async (
        projectId
    ) => {
        const picked =
            selectedUsers[projectId] ||
            [];

        if (picked.length === 0) {
            toast.warning(
                "Please search for and select at least one user."
            );

            return;
        }

        setAddingMembersFor(
            projectId
        );

        try {
            const membersRes =
                await getProjectMembers(
                    projectId
                );

            const projectMembers =
                membersRes.data
                    ?.members ||
                [];

            const owner =
                membersRes.data?.owner;

            const existingIds =
                new Set([
                    ...projectMembers.map(
                        (member) =>
                            member._id
                    ),
                    ...(owner
                        ? [owner._id]
                        : []),
                ]);

            const toAdd =
                picked.filter(
                    (user) =>
                        !existingIds.has(
                            user._id
                        )
                );

            const skipped =
                picked.filter(
                    (user) =>
                        existingIds.has(
                            user._id
                        )
                );

           const selectedProjectData =
    projects.find(
        (project) =>
            project._id === projectId
    );

for (const user of toAdd) {
    await addMember(
        projectId,
        user._id
    );

    try {
        await createNotification({
            recipientId: user._id,

            type:
                "project-assigned",

            message:
                `You were added to project "${
                    selectedProjectData?.name ||
                    "Project"
                }".`,
        });
    } catch (notificationError) {
        console.log(
            "Notification failed:",
            notificationError.response?.data ||
                notificationError.message
        );
    }
}

            if (toAdd.length > 0) {
                toast.success(
                    toAdd.length === 1
                        ? `${toAdd[0].name} added successfully!`
                        : `${toAdd.length} members added successfully!`
                );
            }

            if (skipped.length > 0) {
                toast.info(
                    `${skipped
                        .map(
                            (user) =>
                                user.name
                        )
                        .join(", ")} ${
                        skipped.length ===
                        1
                            ? "was"
                            : "were"
                    } already a member.`
                );
            }

            setSelectedUsers(
                (prev) => ({
                    ...prev,
                    [projectId]: [],
                })
            );

            setUserSearch(
                (prev) => ({
                    ...prev,
                    [projectId]: "",
                })
            );

            await fetchProjects();

            const refreshedMembers =
                await getProjectMembers(
                    projectId
                );

            setMembers(
                (prev) => ({
                    ...prev,
                    [projectId]:
                        refreshedMembers.data,
                })
            );
        } catch (err) {
            console.log(
                err.response?.data ||
                err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Failed to add members"
            );
        } finally {
            setAddingMembersFor(
                null
            );
        }
    };

    // =========================================================
    // SHOW PROJECT MEMBERS
    // =========================================================

    const handleShowMembers = async (
        projectId
    ) => {
        // Toggle close
        if (members[projectId]) {
            setMembers((prev) => {
                const updated = {
                    ...prev,
                };

                delete updated[
                    projectId
                ];

                return updated;
            });

            return;
        }

        try {
            const res =
                await getProjectMembers(
                    projectId
                );

            setMembers(
                (prev) => ({
                    ...prev,
                    [projectId]:
                        res.data,
                })
            );
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Failed to load project members"
            );
        }
    };

    // =========================================================
    // DELETE PROJECT
    // =========================================================

    const handleDeleteProject = (
        projectId,
        projectName
    ) => {
        openConfirm(
            "Delete Project?",
            `Are you sure you want to delete "${projectName}"? This action cannot be undone.`,
            async () => {
                try {
                    await deleteProject(
                        projectId
                    );

                    toast.success(
                        "Project deleted successfully!"
                    );

                    setMembers(
                        (prev) => {
                            const updated = {
                                ...prev,
                            };

                            delete updated[
                                projectId
                            ];

                            return updated;
                        }
                    );

                    await fetchProjects();
                } catch (err) {
                    console.log(
                        err.response
                            ?.data ||
                        err.message
                    );

                    toast.error(
                        err.response
                            ?.data
                            ?.message ||
                        "Delete failed"
                    );
                }
            },
            "Delete"
        );
    };

    // =========================================================
    // REMOVE MEMBER
    // =========================================================

    const handleRemoveMember = (
        projectId,
        userId,
        userName
    ) => {
        openConfirm(
            "Remove Member?",
            `Are you sure you want to remove ${userName} from this project?`,
            async () => {
                try {
                    await removeMember(
                        projectId,
                        userId
                    );

                    toast.success(
                        "Member removed successfully!"
                    );

                    const res =
                        await getProjectMembers(
                            projectId
                        );

                    setMembers(
                        (prev) => ({
                            ...prev,
                            [projectId]:
                                res.data,
                        })
                    );
                } catch (err) {
                    console.log(
                        err.response
                            ?.data ||
                        err.message
                    );

                    toast.error(
                        err.response
                            ?.data
                            ?.message ||
                        "Failed to remove member"
                    );
                }
            },
            "Remove"
        );
    };

    // =========================================================
    // CREATE / UPDATE PROJECT
    // =========================================================

    const handleCreateProject = async (
        e
    ) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.warning(
                "Project name is required."
            );

            return;
        }

        setCreatingProject(true);

        try {
            if (editingProjectId) {
                await updateProject(
                    editingProjectId,
                    {
                        name,
                        description,
                    }
                );

                toast.success(
                    "Project updated successfully!"
                );
            } else {
                await createProject({
                    name,
                    description,
                });

                toast.success(
                    "Project created successfully!"
                );
            }

            setName("");
            setDescription("");
            setEditingProjectId(null);

            await fetchProjects();
        } catch (err) {
            console.log(
                err.response?.data ||
                err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Operation failed"
            );
        } finally {
            setCreatingProject(false);
        }
    };

    // =========================================================
    // STYLES
    // =========================================================

    const styles = `
        @keyframes fadeSlideIn {
            from {
                opacity: 0;
                transform: translateY(12px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes expandDown {
            from {
                opacity: 0;
                max-height: 0;
                transform: translateY(-6px);
            }

            to {
                opacity: 1;
                max-height: 1000px;
                transform: translateY(0);
            }
        }

        @keyframes popIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }

            to {
                opacity: 1;
                transform: scale(1);
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

        /* =====================================================
           CONFIRMATION MODAL
        ===================================================== */

        .confirm-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 9999;
            animation: fadeSlideIn 0.2s ease both;
        }

        .confirm-box {
            width: 100%;
            max-width: 420px;
            padding: 25px;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            box-shadow: 0 15px 45px rgba(0, 0, 0, 0.25);
            text-align: center;
            animation: popIn 0.25s ease both;
        }

        .confirm-icon {
            width: 55px;
            height: 55px;
            margin: 0 auto 15px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(220, 53, 69, 0.12);
            font-size: 25px;
        }

        .confirm-box h3 {
            margin: 0 0 10px;
            font-size: 20px;
        }

        .confirm-box p {
            margin: 0;
            line-height: 1.5;
            opacity: 0.75;
            font-size: 14px;
        }

        .confirm-actions {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 22px;
        }

        .confirm-actions button {
            min-width: 100px;
            padding: 9px 16px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
        }

        .project-card {
            animation: fadeSlideIn 0.35s ease both;
            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;
            position: relative;
            z-index: 0;
        }

        .project-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 16px var(--shadow-color);
        }

        .project-card:focus-within {
            z-index: 30;
        }

        .project-panel {
            animation: fadeSlideIn 0.3s ease both;
        }

        .members-panel {
            animation: expandDown 0.3s ease both;
            overflow: hidden;
        }

        .member-row {
            animation: fadeSlideIn 0.25s ease both;
            transition: transform 0.15s ease;
        }

        .member-row:hover {
            transform: translateX(3px);
        }

        .btn-animated {
            transition:
                transform 0.15s ease,
                opacity 0.15s ease,
                box-shadow 0.15s ease;
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
                0 4px 12px
                rgba(59, 130, 246, 0.4) !important;
        }

        .btn-secondary {
            background: var(--card-bg) !important;
            color: var(--text-color) !important;
            border:
                1px solid
                var(--border-color) !important;
        }

        .btn-danger {
            background: #dc3545 !important;
            color: #ffffff !important;
            border: none !important;
        }

        .btn-danger:hover:not(:disabled) {
            box-shadow:
                0 4px 12px
                rgba(220, 53, 69, 0.4) !important;
        }

        .empty-state-fade {
            animation: fadeSlideIn 0.3s ease both;
            text-align: center;
            padding: 40px 20px;
            opacity: 0.7;
        }

        .btn-spinner {
            width: 14px;
            height: 14px;
            border:
                2px solid
                rgba(255, 255, 255, 0.4);
            border-top-color: white;
            border-radius: 50%;
            display: inline-block;
            animation: spin 0.6s linear infinite;
            vertical-align: middle;
            margin-right: 6px;
        }

        /* =====================================================
           PAGE HEADER
        ===================================================== */

        .projects-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 4px;
        }

        .projects-title {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
        }

        .projects-count {
            font-size: 13px;
            opacity: 0.6;
            font-weight: 500;
        }

        /* =====================================================
           CREATE PROJECT FORM
        ===================================================== */

        .create-project-form {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            box-shadow:
                0 2px 8px
                var(--shadow-color);
        }

        .create-project-form h3 {
            margin: 0 0 14px;
            font-size: 15px;
            font-weight: 600;
            opacity: 0.85;
        }

        .form-input {
            width: 100%;
            box-sizing: border-box;
            padding: 10px 12px;
            background: var(--card-bg);
            color: var(--text-color);
            border:
                1px solid
                var(--border-color);
            border-radius: 8px;
            outline: none;
            font-size: 14px;
            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
        }

        .form-input:focus {
            border-color: #3b82f6;
            box-shadow:
                0 0 0 3px
                rgba(59, 130, 246, 0.15);
        }

        /* =====================================================
           SKELETONS
        ===================================================== */

        .skeleton-block {
            background: var(--border-color);
            border-radius: 6px;
            animation:
                skeletonPulse
                1.5s
                ease-in-out
                infinite;
        }

        .skeleton-form {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            box-shadow:
                0 2px 8px
                var(--shadow-color);
            max-width: 420px;
            animation: fadeSlideIn 0.3s ease both;
        }

        .skeleton-project-card {
            padding: 20px;
            margin-bottom: 15px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow:
                0 2px 6px
                var(--shadow-color);
            animation: fadeSlideIn 0.3s ease both;
        }

        /* =====================================================
           PROJECT SEARCH
        ===================================================== */

        .project-search-wrapper {
            position: relative;
            width: 100%;
            max-width: 220px;
            margin: 20px 0 8px;
        }

        .project-search-input {
            width: 100%;
            box-sizing: border-box;
            padding: 7px 12px 7px 32px;
            background: var(--card-bg);
            color: var(--text-color);
            border:
                1px solid
                var(--border-color);
            border-radius: 999px;
            outline: none;
            font-size: 13px;
            box-shadow:
                0 1px 4px
                var(--shadow-color);
            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
        }

        .project-search-input:focus {
            border-color: #3b82f6;
            box-shadow:
                0 0 0 3px
                rgba(59, 130, 246, 0.15);
        }

        .project-search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            font-size: 12px;
            opacity: 0.6;
        }

        /* =====================================================
           CARD CONTENT
        ===================================================== */

        .project-name {
            margin: 0 0 6px;
            font-size: 18px;
            font-weight: 700;
        }

        .project-description {
            margin: 0;
            opacity: 0.75;
            font-size: 14px;
            line-height: 1.5;
        }

        /* =====================================================
           ADD MEMBER PANEL
        ===================================================== */

        .add-member-panel {
            margin-top: 16px;
            padding: 16px;
            background:
                var(
                    --section-bg,
                    var(--card-bg)
                );
            border:
                1px solid
                var(--border-color);
            border-radius: 10px;
        }

        .add-member-panel h4 {
            margin: 0 0 12px;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            opacity: 0.65;
        }

        .add-member-row {
            display: flex;
            gap: 10px;
            align-items: flex-start;
            flex-wrap: wrap;
        }

        /* =====================================================
           USER SEARCH
        ===================================================== */

        .user-search-container {
            position: relative;
            flex: 1;
            min-width: 180px;
            max-width: 260px;
        }

        .user-search-input {
            width: 100%;
            box-sizing: border-box;
            padding: 7px 10px 7px 30px;
            background: var(--card-bg);
            color: var(--text-color);
            border:
                1px solid
                var(--border-color);
            border-radius: 8px;
            outline: none;
            font-size: 13px;
            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
        }

        .user-search-input:focus {
            border-color: #3b82f6;
            box-shadow:
                0 0 0 3px
                rgba(59, 130, 246, 0.15);
        }

        .user-search-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            font-size: 12px;
            opacity: 0.6;
        }

        .user-search-results {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            width: 260px;
            max-height: 240px;
            overflow-y: auto;
            background: var(--card-bg);
            color: var(--text-color);
            border:
                1px solid
                var(--border-color);
            border-radius: 10px;
            box-shadow:
                0 10px 30px
                var(--shadow-color);
            z-index: 40;
            animation: fadeSlideIn 0.15s ease both;
        }

        .user-search-result {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            cursor: pointer;
            transition:
                background 0.12s ease;
        }

        .user-search-result:not(:last-child) {
            border-bottom:
                1px solid
                var(--border-color);
        }

        .user-search-result:hover {
            background:
                var(
                    --section-bg,
                    var(--border-color)
                );
        }

        .user-avatar {
            flex-shrink: 0;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #3b82f6;
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .user-avatar.small {
            width: 24px;
            height: 24px;
            font-size: 10px;
        }

        .user-result-text {
            min-width: 0;
        }

        .user-result-name {
            font-weight: 600;
            font-size: 13px;
        }

        .user-result-email {
            font-size: 11.5px;
            opacity: 0.65;
            margin-top: 1px;
        }

        .user-search-empty {
            padding: 12px;
            font-size: 13px;
            opacity: 0.6;
            text-align: center;
        }

        /* =====================================================
           SELECTED USERS
        ===================================================== */

        .selected-users-row {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 10px;
        }

        .selected-user-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 6px 4px 4px;
            background:
                rgba(59, 130, 246, 0.1);
            border:
                1px solid
                rgba(59, 130, 246, 0.35);
            border-radius: 999px;
            animation: popIn 0.15s ease both;
        }

        .selected-user-chip span.name {
            font-size: 12px;
            font-weight: 600;
        }

        .chip-remove {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: none;
            background:
                rgba(59, 130, 246, 0.2);
            color: inherit;
            cursor: pointer;
            font-size: 10px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            transition:
                background 0.15s ease;
        }

        .chip-remove:hover {
            background:
                rgba(220, 53, 69, 0.7);
            color: white;
        }

        /* =====================================================
           ACTION BUTTONS
        ===================================================== */

        .project-actions {
            display: flex;
            gap: 10px;
            margin-top: 14px;
            flex-wrap: wrap;
        }

        .project-actions button {
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
        }

        /* =====================================================
           MEMBERS PANEL
        ===================================================== */

        .members-header {
            margin: 0 0 12px;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            opacity: 0.65;
        }

        .member-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
        }

        .member-card .info {
            flex: 1;
            min-width: 0;
        }

        .member-card .info .name {
            font-weight: 600;
            font-size: 14px;
        }

        .member-card .info .email {
            font-size: 12.5px;
            opacity: 0.7;
            margin-top: 1px;
        }

        .member-card .role-tag {
            font-size: 11px;
            opacity: 0.6;
            margin-top: 2px;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 700px) {
            .projects-title {
                font-size: 23px;
            }

            .project-search-wrapper {
                max-width: 100%;
            }

            .user-search-container {
                max-width: 100%;
                width: 100%;
            }

            .user-search-results {
                width: 100%;
            }

            .add-member-row {
                flex-direction: column;
            }

            .add-member-row button {
                width: 100%;
            }

            .project-actions button {
                flex: 1;
            }

            .member-card {
                align-items: flex-start;
            }

            .member-card button {
                flex-shrink: 0;
            }
        }

        @media (max-width: 480px) {
            .projects-title {
                font-size: 21px;
            }

            .project-card {
                padding: 15px !important;
            }

            .confirm-box {
                padding: 20px;
            }

            .confirm-actions {
                flex-direction: column;
            }

            .confirm-actions button {
                width: 100%;
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
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="confirm-icon">
                            🗑
                        </div>

                        <h3>
                            {confirmState.title}
                        </h3>

                        <p>
                            {confirmState.message}
                        </p>

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
                                {confirmState.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="projects-header">
                <h1 className="projects-title">
                    📁 Projects
                </h1>

                <span className="projects-count">
                    {projects.length} total
                </span>
            </div>

            {/* =================================================
                CREATE PROJECT FORM
            ================================================= */}

            {creatingProject ? (
                <div
                    className="skeleton-form"
                    style={{
                        margin: "20px 0",
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
                            height: "80px",
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
                    onSubmit={handleCreateProject}
                    className="project-panel create-project-form"
                    style={{
                        margin: "20px 0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        maxWidth: "420px",
                    }}
                >
                    <h3>
                        {editingProjectId
                            ? "Edit Project"
                            : "New Project"}
                    </h3>

                    <input
                        type="text"
                        placeholder="Project name"
                        value={name}
                        onChange={(e) =>
                            setName(
                                e.target.value
                            )
                        }
                        className="form-input"
                    />

                    <textarea
                        placeholder="Description is required"
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                        rows="4"
                        className="form-input"
                    />

                    <button
                        type="submit"
                        className="btn-animated btn-primary"
                        style={{
                            padding: "10px",
                            cursor: "pointer",
                            borderRadius: "8px",
                            fontWeight: 600,
                        }}
                    >
                        {editingProjectId
                            ? "Update Project"
                            : "Create Project"}
                    </button>
                </form>
            )}

            {/* =================================================
                PROJECT SEARCH
            ================================================= */}

            <div className="project-search-wrapper">
                <span className="project-search-icon">
                    🔍
                </span>

                <input
                    type="text"
                    className="project-search-input"
                    placeholder="Search..."
                    value={projectSearch}
                    onChange={(e) =>
                        setProjectSearch(
                            e.target.value
                        )
                    }
                />
            </div>

            {/* =================================================
                PROJECT LIST
            ================================================= */}

            {loadingProjects ? (
                <div
                    style={{
                        marginTop: "20px",
                    }}
                >
                    {[1, 2, 3].map(
                        (item) => (
                            <div
                                key={item}
                                className="skeleton-project-card"
                            >
                                <div
                                    className="skeleton-block"
                                    style={{
                                        width: "35%",
                                        height: "20px",
                                        marginBottom:
                                            "10px",
                                    }}
                                />

                                <div
                                    className="skeleton-block"
                                    style={{
                                        width: "70%",
                                        height: "14px",
                                        marginBottom:
                                            "16px",
                                    }}
                                />

                                <div
                                    className="skeleton-block"
                                    style={{
                                        width: "100%",
                                        height: "70px",
                                        marginBottom:
                                            "14px",
                                    }}
                                />

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                    }}
                                >
                                    <div
                                        className="skeleton-block"
                                        style={{
                                            width: "70px",
                                            height: "32px",
                                        }}
                                    />

                                    <div
                                        className="skeleton-block"
                                        style={{
                                            width: "70px",
                                            height: "32px",
                                        }}
                                    />

                                    <div
                                        className="skeleton-block"
                                        style={{
                                            width: "90px",
                                            height: "32px",
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    )}
                </div>
            ) : projects.length === 0 ? (
                <p className="empty-state-fade">
                    No projects found. Create a project to get started.
                </p>
            ) : filteredProjects.length === 0 ? (
                <p className="empty-state-fade">
                    No projects match "{projectSearch}".
                </p>
            ) : (
                <div
                    style={{
                        marginTop: "20px",
                    }}
                >
                    {filteredProjects.map(
                        (
                            project,
                            index
                        ) => {
                            const filteredUsers =
                                getFilteredUsers(
                                    project._id
                                );

                            const search =
                                userSearch[
                                    project._id
                                ] || "";

                            const picked =
                                selectedUsers[
                                    project._id
                                ] || [];

                            const isAdding =
                                addingMembersFor ===
                                project._id;

                            return (
                                <div
                                    key={
                                        project._id
                                    }
                                    className="project-card"
                                    style={{
                                        padding: "20px",
                                        marginBottom: "15px",
                                        border:
                                            "1px solid var(--border-color)",
                                        borderRadius: "12px",
                                        background:
                                            "var(--card-bg)",
                                        boxShadow:
                                            "0 2px 6px var(--shadow-color)",
                                        color:
                                            "var(--text-color)",
                                        animationDelay: `${index * 0.05}s`,
                                    }}
                                >
                                    <h3 className="project-name">
                                        {
                                            project.name
                                        }
                                    </h3>

                                    <p className="project-description">
                                        {project.description ||
                                            "No description"}
                                    </p>

                                    {/* =================================================
                                        ADD MEMBERS
                                    ================================================= */}

                                    <div className="add-member-panel">
                                        <h4>
                                            Add Project Members
                                        </h4>

                                        <div className="add-member-row">
                                            <div className="user-search-container">
                                                <span className="user-search-icon">
                                                    🔍
                                                </span>

                                                <input
                                                    type="text"
                                                    className="user-search-input"
                                                    placeholder="Search name or email..."
                                                    value={
                                                        search
                                                    }
                                                    onChange={(
                                                        e
                                                    ) => {
                                                        setUserSearch(
                                                            (
                                                                prev
                                                            ) => ({
                                                                ...prev,
                                                                [project._id]:
                                                                    e
                                                                        .target
                                                                        .value,
                                                            })
                                                        );
                                                    }}
                                                />

                                                {search.trim() && (
                                                    <div className="user-search-results">
                                                        {filteredUsers.length ===
                                                        0 ? (
                                                            <div className="user-search-empty">
                                                                No users found.
                                                            </div>
                                                        ) : (
                                                            filteredUsers.map(
                                                                (
                                                                    user
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            user._id
                                                                        }
                                                                        className="user-search-result"
                                                                        onClick={() =>
                                                                            handlePickUser(
                                                                                project._id,
                                                                                user
                                                                            )
                                                                        }
                                                                    >
                                                                        <div className="user-avatar small">
                                                                            {getInitials(
                                                                                user.name
                                                                            )}
                                                                        </div>

                                                                        <div className="user-result-text">
                                                                            <div className="user-result-name">
                                                                                {
                                                                                    user.name
                                                                                }
                                                                            </div>

                                                                            <div className="user-result-email">
                                                                                {
                                                                                    user.email
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleAddMembers(
                                                        project._id
                                                    )
                                                }
                                                disabled={
                                                    isAdding ||
                                                    picked.length ===
                                                        0
                                                }
                                                className="btn-animated btn-primary"
                                                style={{
                                                    padding:
                                                        "8px 16px",
                                                    borderRadius:
                                                        "8px",
                                                    fontWeight:
                                                        600,
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {isAdding && (
                                                    <span className="btn-spinner" />
                                                )}

                                                {picked.length >
                                                1
                                                    ? `Add Members (${picked.length})`
                                                    : "Add Member"}
                                            </button>
                                        </div>

                                        {picked.length >
                                            0 && (
                                            <div className="selected-users-row">
                                                {picked.map(
                                                    (
                                                        user
                                                    ) => (
                                                        <div
                                                            key={
                                                                user._id
                                                            }
                                                            className="selected-user-chip"
                                                        >
                                                            <div className="user-avatar small">
                                                                {getInitials(
                                                                    user.name
                                                                )}
                                                            </div>

                                                            <span className="name">
                                                                {
                                                                    user.name
                                                                }
                                                            </span>

                                                            <button
                                                                type="button"
                                                                className="chip-remove"
                                                                title="Remove"
                                                                onClick={() =>
                                                                    handleUnpickUser(
                                                                        project._id,
                                                                        user._id
                                                                    )
                                                                }
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* =================================================
                                        PROJECT BUTTONS
                                    ================================================= */}

                                    <div className="project-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEditProject(
                                                    project
                                                )
                                            }
                                            className="btn-animated btn-secondary"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteProject(
                                                    project._id,
                                                    project.name
                                                )
                                            }
                                            className="btn-animated btn-danger"
                                        >
                                            Delete
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleShowMembers(
                                                    project._id
                                                )
                                            }
                                            className="btn-animated btn-secondary"
                                        >
                                            👥 Members
                                        </button>
                                    </div>

                                    {/* =================================================
                                        MEMBERS PANEL
                                    ================================================= */}

                                    {members[
                                        project._id
                                    ] && (
                                        <div
                                            className="members-panel"
                                            style={{
                                                marginTop:
                                                    "15px",
                                                padding:
                                                    "15px",
                                                background:
                                                    "var(--card-bg)",
                                                color:
                                                    "var(--text-color)",
                                                border:
                                                    "1px solid var(--border-color)",
                                                boxShadow:
                                                    "0 2px 6px var(--shadow-color)",
                                                borderRadius:
                                                    "10px",
                                            }}
                                        >
                                            <h4 className="members-header">
                                                Team Members
                                            </h4>

                                            {/* PROJECT OWNER */}

                                            {members[
                                                project
                                                    ._id
                                            ].owner && (
                                                <div
                                                    className="member-row"
                                                    style={{
                                                        background:
                                                            "var(--section-bg, var(--card-bg))",
                                                        border:
                                                            "1px solid var(--border-color)",
                                                        borderRadius:
                                                            "8px",
                                                        marginBottom:
                                                            "8px",
                                                    }}
                                                >
                                                    <div className="member-card">
                                                        <div className="user-avatar">
                                                            👑
                                                        </div>

                                                        <div className="info">
                                                            <div className="name">
                                                                {
                                                                    members[
                                                                        project
                                                                            ._id
                                                                    ]
                                                                        .owner
                                                                        .name
                                                                }
                                                            </div>

                                                            <div className="email">
                                                                {
                                                                    members[
                                                                        project
                                                                            ._id
                                                                    ]
                                                                        .owner
                                                                        .email
                                                                }
                                                            </div>

                                                            <div className="role-tag">
                                                                Project Owner
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* MEMBERS */}

                                            {members[
                                                project._id
                                            ].members
                                                ?.filter(
                                                    (
                                                        member
                                                    ) =>
                                                        member._id !==
                                                        members[
                                                            project
                                                                ._id
                                                        ]
                                                            .owner
                                                            ?._id
                                                )
                                                .map(
                                                    (
                                                        member,
                                                        memberIndex
                                                    ) => (
                                                        <div
                                                            key={
                                                                member._id
                                                            }
                                                            className="member-row"
                                                            style={{
                                                                background:
                                                                    "var(--card-bg)",
                                                                border:
                                                                    "1px solid var(--border-color)",
                                                                boxShadow:
                                                                    "0 2px 6px var(--shadow-color)",
                                                                borderRadius:
                                                                    "8px",
                                                                marginBottom:
                                                                    "8px",
                                                                animationDelay: `${memberIndex * 0.05}s`,
                                                            }}
                                                        >
                                                            <div className="member-card">
                                                                <div className="user-avatar">
                                                                    {getInitials(
                                                                        member.name
                                                                    )}
                                                                </div>

                                                                <div className="info">
                                                                    <div className="name">
                                                                        {
                                                                            member.name
                                                                        }
                                                                    </div>

                                                                    <div className="email">
                                                                        {
                                                                            member.email
                                                                        }
                                                                    </div>

                                                                    <div className="role-tag">
                                                                        Member
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemoveMember(
                                                                            project._id,
                                                                            member._id,
                                                                            member.name
                                                                        )
                                                                    }
                                                                    className="btn-animated btn-danger"
                                                                    style={{
                                                                        padding:
                                                                            "6px 12px",
                                                                        borderRadius:
                                                                            "6px",
                                                                        fontSize:
                                                                            "12.5px",
                                                                        fontWeight:
                                                                            600,
                                                                    }}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                )}

                                            {/* NO MEMBERS */}

                                            {members[
                                                project
                                                    ._id
                                            ].members
                                                ?.filter(
                                                    (
                                                        member
                                                    ) =>
                                                        member._id !==
                                                        members[
                                                            project
                                                                ._id
                                                        ]
                                                            .owner
                                                            ?._id
                                                )
                                                .length ===
                                                0 && (
                                                <p
                                                    style={{
                                                        opacity:
                                                            0.6,
                                                        fontSize:
                                                            "13px",
                                                    }}
                                                >
                                                    No additional members yet.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>
            )}
        </Layout>
    );
}

export default Projects;