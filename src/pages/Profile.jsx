import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import { getProfile } from "../services/userService";
import { getProjects } from "../services/projectService";
import { getMyTasks } from "../services/taskService";

// =========================================================
// SEARCHABLE PROJECT SELECT
// Search + scroll in one dropdown, no external package needed
// =========================================================

function SearchableSelect({
    value,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    emptyText = "No projects found.",
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
            }`.toLowerCase();

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
        if (open) {
            requestAnimationFrame(() => {
                searchInputRef.current?.focus();
            });
        }
    }, [open]);

    const handleSelect = (option) => {
        onChange(option.value);
        setOpen(false);
        setSearch("");
    };

    const handleKeyDown = (event) => {
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
            className={`profile-searchable-select ${
                open ? "open" : ""
            }`}
        >
            <button
                type="button"
                className="profile-searchable-trigger"
                onClick={() => {
                    setOpen((prev) => !prev);
                    setSearch("");
                }}
                aria-expanded={open}
            >
                <span
                    className={
                        selectedOption
                            ? "profile-searchable-value"
                            : "profile-searchable-placeholder"
                    }
                >
                    {selectedOption
                        ? selectedOption.label
                        : placeholder}
                </span>

                <span
                    className={`profile-searchable-arrow ${
                        open ? "open" : ""
                    }`}
                >
                    ▾
                </span>
            </button>

            {open && (
                <div className="profile-searchable-dropdown">
                    <div className="profile-searchable-search-wrap">
                        <span className="profile-searchable-search-icon">
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
                            onKeyDown={handleKeyDown}
                            className="profile-searchable-search"
                            placeholder={searchPlaceholder}
                            autoComplete="off"
                        />
                    </div>

                    <div className="profile-searchable-options">
                        {filteredOptions.length === 0 ? (
                            <div className="profile-searchable-empty">
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
                                                option.value === ""
                                                    ? "all-projects"
                                                    : option.value
                                            }
                                            type="button"
                                            className={`profile-searchable-option ${
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
                                            <span className="profile-searchable-option-text">
                                                <span className="profile-searchable-option-label">
                                                    {option.label}
                                                </span>

                                                {option.subtitle && (
                                                    <span className="profile-searchable-option-subtitle">
                                                        {option.subtitle}
                                                    </span>
                                                )}
                                            </span>

                                            {selected && (
                                                <span className="profile-searchable-check">
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

function Profile() {
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [projectCount, setProjectCount] = useState(0);

    // Tasks assigned specifically to the logged-in user.
    const [myTasks, setMyTasks] = useState([]);

    // Empty string = overall statistics across every assigned project.
    const [selectedProject, setSelectedProject] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getAssignedUserId = (task) =>
        task?.assignedTo?._id ||
        task?.assignedTo ||
        "";

    const getTaskProjectId = (task) =>
        task?.project?._id ||
        task?.project ||
        "";

    const calculateTaskStats = (tasks) => {
        const nextStats = {
            total: tasks.length,
            todo: 0,
            inProgress: 0,
            done: 0,
        };

        tasks.forEach((task) => {
            const status = String(
                task?.status || ""
            )
                .trim()
                .toLowerCase();

            if (status === "todo") {
                nextStats.todo += 1;
            } else if (
                status === "in-progress"
            ) {
                nextStats.inProgress += 1;
            } else if (status === "done") {
                nextStats.done += 1;
            }
        });

        return nextStats;
    };

    useEffect(() => {
        let refreshInterval = null;
        let refreshOnFocus = null;
        let cancelled = false;

        const fetchMyTasks = async (
            currentUserId
        ) => {
            try {
                const tasksRes =
                    await getMyTasks();

                const tasks =
                    tasksRes.data.tasks ||
                    tasksRes.data ||
                    [];

                // Keep only tasks assigned to the logged-in user.
                // If the endpoint already returns only "my tasks",
                // this keeps the same result.
                const hasAssignmentInformation =
                    tasks.some(
                        (task) =>
                            task?.assignedTo
                    );

                const assignedTasks =
                    hasAssignmentInformation &&
                    currentUserId
                        ? tasks.filter(
                              (task) =>
                                  String(
                                      getAssignedUserId(
                                          task
                                      )
                                  ) ===
                                  String(
                                      currentUserId
                                  )
                          )
                        : tasks;

                if (!cancelled) {
                    setMyTasks(
                        assignedTasks
                    );
                }
            } catch (err) {
                console.log(
                    "Failed to load assigned tasks:",
                    err.response?.data ||
                        err.message
                );
            }
        };

        const fetchProfileData = async () => {
            try {
                const profileRes =
                    await getProfile();

                const profileUser =
                    profileRes.data.user;

                if (cancelled) {
                    return;
                }

                setUser(profileUser);

                const currentUserId =
                    profileUser?._id ||
                    profileUser?.id ||
                    "";

                try {
                    const projectsRes =
                        await getProjects();

                    const loadedProjects =
                        projectsRes.data.projects ||
                        projectsRes.data ||
                        [];

                    if (!cancelled) {
                        setProjects(
                            loadedProjects
                        );

                        setProjectCount(
                            loadedProjects.length
                        );
                    }
                } catch (err) {
                    console.log(
                        "Failed to load projects:",
                        err.response?.data ||
                            err.message
                    );
                }

                await fetchMyTasks(
                    currentUserId
                );

                // Keep statistics fresh while Profile is open.
                // A new assigned task increases Todo/Total, and a
                // status change automatically moves the count.
                refreshInterval =
                    setInterval(() => {
                        fetchMyTasks(
                            currentUserId
                        );
                    }, 10000);

                refreshOnFocus = () => {
                    fetchMyTasks(
                        currentUserId
                    );
                };

                window.addEventListener(
                    "focus",
                    refreshOnFocus
                );
            } catch (err) {
                console.log(
                    err.response?.data ||
                        err.message
                );

                if (!cancelled) {
                    setError(
                        err.response?.data
                            ?.message ||
                            "Failed to load profile"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchProfileData();

        return () => {
            cancelled = true;

            if (refreshInterval) {
                clearInterval(
                    refreshInterval
                );
            }

            if (refreshOnFocus) {
                window.removeEventListener(
                    "focus",
                    refreshOnFocus
                );
            }
        };
    }, []);

    // =========================================================
    // PROJECT FILTER OPTIONS
    // Only projects containing at least one task assigned to me.
    // =========================================================

    const projectById = new Map();

    projects.forEach((project) => {
        if (project?._id) {
            projectById.set(
                String(project._id),
                project
            );
        }
    });

    // In case getMyTasks() returns a populated project that is
    // not present in getProjects(), keep its name as a fallback.
    myTasks.forEach((task) => {
        const taskProjectId =
            getTaskProjectId(task);

        if (!taskProjectId) {
            return;
        }

        const key = String(
            taskProjectId
        );

        if (!projectById.has(key)) {
            projectById.set(key, {
                _id: taskProjectId,
                name:
                    task?.project?.name ||
                    "Unnamed Project",
                description:
                    task?.project
                        ?.description ||
                    "",
            });
        }
    });

    // Use the same project collection shown by this profile.
    // Each project's statistics still count ONLY tasks assigned to me.
    const assignedProjectOptions =
        [...projectById.values()]
            .map((project) => {
                const projectId =
                    project?._id || "";

                const assignedCount =
                    myTasks.filter(
                        (task) =>
                            String(
                                getTaskProjectId(
                                    task
                                )
                            ) ===
                            String(
                                projectId
                            )
                    ).length;

                return {
                    value: projectId,
                    label:
                        project?.name ||
                        "Unnamed Project",
                    subtitle:
                        `${assignedCount} of my assigned task${
                            assignedCount === 1
                                ? ""
                                : "s"
                        }`,
                    searchText:
                        project?.description ||
                        "",
                };
            })
            .filter(
                (option) =>
                    Boolean(option.value)
            )
            .sort((a, b) =>
                a.label.localeCompare(
                    b.label
                )
            );

    const projectFilterOptions = [
        {
            value: "",
            label: "All Assigned Projects",
            subtitle:
                `${myTasks.length} assigned task${
                    myTasks.length === 1
                        ? ""
                        : "s"
                } overall`,
            searchText: "all overall",
        },
        ...assignedProjectOptions,
    ];

    const visibleTasks = selectedProject
        ? myTasks.filter(
              (task) =>
                  String(
                      getTaskProjectId(
                          task
                      )
                  ) ===
                  String(
                      selectedProject
                  )
          )
        : myTasks;

    const taskStats =
        calculateTaskStats(
            visibleTasks
        );

    const selectedProjectOption =
        projectFilterOptions.find(
            (option) =>
                String(option.value) ===
                String(selectedProject)
        );

    const statisticsContext =
        selectedProjectOption?.label ||
        "All Assigned Projects";

    // =========================================================
    // STYLES
    // =========================================================

    const animationStyles = `
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

        @keyframes popIn {
            from {
                opacity: 0;
                transform: scale(0.88);
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

        /* =====================================================
           PAGE
        ===================================================== */

        .profile-page {
            width: 100%;
            animation:
                fadeSlideIn
                0.35s ease both;
        }

        .profile-content {
            width: 100%;
            max-width: 720px;
        }

        .profile-title {
            margin: 0;

            font-size: 26px;

            font-weight: 700;
        }

        .profile-subtitle {
            margin:
                7px 0 22px;

            font-size: 14px;

            opacity: 0.65;
        }

        /* =====================================================
           MAIN PROFILE CARD
        ===================================================== */

        .profile-main-card {
            width: 100%;

            box-sizing:
                border-box;

            padding:
                24px;

            background:
                var(--card-bg);

            color:
                var(--text-color);

            border:
                1px solid
                var(--border-color);

            border-radius:
                12px;

            box-shadow:
                0 2px 6px
                var(--shadow-color);

            animation:
                fadeSlideIn
                0.4s ease both;

            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;
        }

        .profile-main-card:hover {
            transform:
                translateY(-3px);

            box-shadow:
                0 6px 16px
                var(--shadow-color);
        }

        /* =====================================================
           AVATAR
        ===================================================== */

        .profile-avatar {
            width: 72px;
            height: 72px;

            margin:
                0 auto 13px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 50%;

            background:
                rgba(
                    59,
                    130,
                    246,
                    0.12
                );

            border:
                1px solid
                rgba(
                    59,
                    130,
                    246,
                    0.25
                );

            font-size: 34px;

            animation:
                popIn
                0.35s ease both;

            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;
        }

        .profile-avatar:hover {
            transform:
                translateY(-2px)
                scale(1.03);

            box-shadow:
                0 5px 14px
                var(--shadow-color);
        }

        /* =====================================================
           NAME
        ===================================================== */

        .profile-name {
            margin:
                0 0 20px;

            text-align: center;

            font-size: 20px;

            font-weight: 700;

            animation:
                fadeSlideIn
                0.35s ease both;
        }

        /* =====================================================
           PROFILE INFORMATION
        ===================================================== */

        .profile-info-list {
            border-top:
                1px solid
                var(--border-color);
        }

        .profile-info-row {
            display: grid;

            grid-template-columns:
                100px
                minmax(0, 1fr);

            align-items: center;

            column-gap: 15px;

            min-height: 44px;

            padding:
                4px 2px;

            border-bottom:
                1px solid
                var(--border-color);

            animation:
                fadeSlideIn
                0.35s ease both;
        }

        .profile-info-row:last-child {
            border-bottom: none;
        }

        .profile-info-label {
            color:
                var(--text-color);

            opacity: 0.55;

            font-size: 12px;

            font-weight: 600;

            text-transform:
                uppercase;

            letter-spacing:
                0.04em;
        }

        .profile-info-value {
            display: flex;

            align-items: center;

            gap: 7px;

            min-width: 0;

            color:
                var(--text-color);

            font-size: 13px;

            font-weight: 600;

            word-break:
                break-word;
        }

        /* =====================================================
           ROLE BADGE
        ===================================================== */

        .profile-role-badge {
            display: inline-flex;

            align-items: center;

            gap: 5px;

            padding:
                5px 9px;

            border-radius:
                999px;

            font-size: 12px;

            font-weight: 600;

            white-space: nowrap;
        }

        .profile-role-badge.user {
            background:
                rgba(
                    59,
                    130,
                    246,
                    0.1
                );

            color:
                #3b82f6;

            border:
                1px solid
                rgba(
                    59,
                    130,
                    246,
                    0.25
                );
        }

        .profile-role-badge.admin {
            background:
                rgba(
                    245,
                    158,
                    11,
                    0.1
                );

            color:
                #d97706;

            border:
                1px solid
                rgba(
                    245,
                    158,
                    11,
                    0.3
                );
        }

        /* =====================================================
           ACCOUNT INFORMATION
        ===================================================== */

        .profile-account-section {
            width: 100%;

            margin-top: 24px;

            animation:
                fadeSlideIn
                0.4s ease both;
        }

        .account-section-title {
            margin:
                0 0 12px;

            font-size: 15px;

            font-weight: 600;

            opacity: 0.85;
        }

        /* =====================================================
           MEMBER SINCE
        ===================================================== */

        .member-since-card {
            width: 100%;

            box-sizing:
                border-box;

            display: flex;

            align-items: center;

            gap: 12px;

            padding:
                13px 15px;

            background:
                var(--card-bg);

            color:
                var(--text-color);

            border:
                1px solid
                var(--border-color);

            border-radius:
                10px;

            box-shadow:
                0 2px 6px
                var(--shadow-color);

            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;
        }

        .member-since-card:hover {
            transform:
                translateY(-2px);

            box-shadow:
                0 5px 14px
                var(--shadow-color);
        }

        .member-since-icon {
            width: 34px;
            height: 34px;

            flex-shrink: 0;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 8px;

            background:
                rgba(
                    59,
                    130,
                    246,
                    0.1
                );

            font-size: 16px;
        }

        .member-since-info {
            min-width: 0;
        }

        .member-since-label {
            margin-bottom: 2px;

            font-size: 11.5px;

            font-weight: 600;

            text-transform:
                uppercase;

            letter-spacing:
                0.03em;

            opacity: 0.55;
        }

        .member-since-value {
            font-size: 13px;

            font-weight: 600;
        }

        /* =====================================================
           TASK STATISTICS PROJECT FILTER
        ===================================================== */

        .task-stats-filter-card {
            position: relative;
            z-index: 40;
            width: 100%;
            box-sizing: border-box;
            margin-top: 12px;
            padding: 15px;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            box-shadow:
                0 2px 6px
                var(--shadow-color);
            overflow: visible;
        }

        .task-stats-filter-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 12px;
        }

        .task-stats-filter-title {
            margin: 0 0 3px;
            font-size: 13px;
            font-weight: 700;
        }

        .task-stats-filter-subtitle {
            margin: 0;
            color: var(--text-color);
            font-size: 12px;
            opacity: 0.6;
            line-height: 1.45;
        }

        .task-stats-context {
            display: inline-flex;
            align-items: center;
            min-height: 28px;
            max-width: 100%;
            box-sizing: border-box;
            padding: 5px 9px;
            border-radius: 999px;
            background:
                rgba(
                    59,
                    130,
                    246,
                    0.08
                );
            border:
                1px solid
                rgba(
                    59,
                    130,
                    246,
                    0.2
                );
            color: #3b82f6;
            font-size: 11.5px;
            font-weight: 700;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .profile-searchable-select {
            position: relative;
            width: 100%;
        }

        .profile-searchable-select.open {
            z-index: 200;
        }

        .profile-searchable-trigger {
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
            font: inherit;
            font-size: 13px;
            text-align: left;
            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
        }

        .profile-searchable-trigger:hover {
            border-color:
                rgba(
                    59,
                    130,
                    246,
                    0.65
                );
        }

        .profile-searchable-select.open
        .profile-searchable-trigger {
            border-color: #3b82f6;
            box-shadow:
                0 0 0 3px
                rgba(
                    59,
                    130,
                    246,
                    0.12
                );
        }

        .profile-searchable-value,
        .profile-searchable-placeholder {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .profile-searchable-value {
            font-weight: 600;
        }

        .profile-searchable-placeholder {
            opacity: 0.6;
        }

        .profile-searchable-arrow {
            flex-shrink: 0;
            opacity: 0.65;
            transition:
                transform 0.18s ease;
        }

        .profile-searchable-arrow.open {
            transform: rotate(180deg);
        }

        .profile-searchable-dropdown {
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
                popIn
                0.14s ease both;
        }

        .profile-searchable-search-wrap {
            position: relative;
            margin-bottom: 7px;
        }

        .profile-searchable-search-icon {
            position: absolute;
            left: 11px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            font-size: 12px;
            opacity: 0.55;
        }

        .profile-searchable-search {
            width: 100%;
            height: 40px;
            box-sizing: border-box;
            padding: 8px 10px 8px 32px;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 7px;
            outline: none;
            font: inherit;
            font-size: 13px;
        }

        .profile-searchable-search:focus {
            border-color: #3b82f6;
            box-shadow:
                0 0 0 3px
                rgba(
                    59,
                    130,
                    246,
                    0.1
                );
        }

        .profile-searchable-options {
            max-height: 230px;
            overflow-y: auto;
            overscroll-behavior: contain;
            scrollbar-width: thin;
        }

        .profile-searchable-option {
            width: 100%;
            min-height: 44px;
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
            font: inherit;
            text-align: left;
        }

        .profile-searchable-option:hover {
            background:
                rgba(
                    59,
                    130,
                    246,
                    0.07
                );
        }

        .profile-searchable-option.selected {
            background:
                rgba(
                    59,
                    130,
                    246,
                    0.1
                );
        }

        .profile-searchable-option-text {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .profile-searchable-option-label {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13px;
            font-weight: 600;
        }

        .profile-searchable-option-subtitle {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 11.5px;
            opacity: 0.58;
        }

        .profile-searchable-check {
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

        .profile-searchable-empty {
            padding: 18px 10px;
            text-align: center;
            font-size: 12.5px;
            opacity: 0.62;
        }

        /* =====================================================
           STATISTICS
        ===================================================== */

        .profile-account-grid {
            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(0, 1fr)
                );

            gap: 12px;

            margin-top: 12px;
        }

        .profile-stat-card {
            min-width: 0;

            padding: 15px;

            background:
                var(--card-bg);

            color:
                var(--text-color);

            border:
                1px solid
                var(--border-color);

            border-radius:
                10px;

            box-shadow:
                0 2px 6px
                var(--shadow-color);

            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;

            animation:
                fadeSlideIn
                0.35s ease both;
        }

        .profile-stat-card:hover {
            transform:
                translateY(-3px);

            box-shadow:
                0 6px 16px
                var(--shadow-color);
        }

        .stat-card-top {
            display: flex;

            align-items: center;

            justify-content:
                space-between;

            gap: 10px;

            margin-bottom: 9px;
        }

        .profile-stat-icon {
            width: 32px;
            height: 32px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 8px;

            background:
                rgba(
                    59,
                    130,
                    246,
                    0.1
                );

            font-size: 16px;
        }

        .profile-stat-label {
            margin: 0;

            font-size: 11.5px;

            font-weight: 600;

            text-transform:
                uppercase;

            letter-spacing:
                0.03em;

            opacity: 0.55;
        }

        .profile-stat-value {
            margin: 0;

            font-size: 24px;

            font-weight: 700;
        }

        .profile-stat-value.text {
            font-size: 17px;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .profile-error {
            width: 100%;

            box-sizing:
                border-box;

            padding:
                14px 16px;

            background:
                rgba(
                    220,
                    53,
                    69,
                    0.08
                );

            color:
                #dc3545;

            border:
                1px solid
                rgba(
                    220,
                    53,
                    69,
                    0.25
                );

            border-radius:
                10px;

            font-size: 13px;

            font-weight: 600;

            animation:
                fadeSlideIn
                0.3s ease both;
        }

        /* =====================================================
           SKELETON
        ===================================================== */

        .profile-skeleton {
            width: 100%;

            box-sizing:
                border-box;

            padding: 24px;

            background:
                var(--card-bg);

            border:
                1px solid
                var(--border-color);

            border-radius:
                12px;

            box-shadow:
                0 2px 6px
                var(--shadow-color);

            animation:
                fadeSlideIn
                0.3s ease both;
        }

        .skeleton-avatar {
            width: 72px;
            height: 72px;

            margin:
                0 auto 14px;

            border-radius: 50%;

            background:
                var(--border-color);

            animation:
                skeletonPulse
                1.5s
                ease-in-out
                infinite;
        }

        .skeleton-line {
            height: 13px;

            border-radius: 6px;

            background:
                var(--border-color);

            animation:
                skeletonPulse
                1.5s
                ease-in-out
                infinite;
        }

        .skeleton-line.name {
            width: 170px;

            max-width: 60%;

            height: 20px;

            margin:
                0 auto 20px;
        }

        .skeleton-line.info {
            width: 100%;

            height: 44px;

            margin-bottom: 1px;
        }

        .skeleton-line.account-title {
            width: 150px;

            height: 17px;

            margin:
                25px 0 12px;
        }

        .skeleton-member {
            height: 58px;

            border-radius: 10px;

            background:
                var(--border-color);

            animation:
                skeletonPulse
                1.5s
                ease-in-out
                infinite;
        }

        .skeleton-stat-grid {
            display: grid;

            grid-template-columns:
                repeat(3, 1fr);

            gap: 12px;

            margin-top: 12px;
        }

        .skeleton-stat {
            height: 95px;

            border-radius: 10px;

            background:
                var(--border-color);

            animation:
                skeletonPulse
                1.5s
                ease-in-out
                infinite;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 760px) {
            .profile-content {
                max-width: 100%;
            }
        }

        @media (max-width: 700px) {
            .profile-title {
                font-size: 23px;
            }

            .profile-account-grid,
            .skeleton-stat-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 480px) {
            .profile-title {
                font-size: 21px;
            }

            .profile-main-card,
            .profile-skeleton {
                padding: 18px;
            }

            .profile-avatar {
                width: 64px;
                height: 64px;

                font-size: 30px;
            }

            .profile-info-row {
                grid-template-columns:
                    80px
                    minmax(0, 1fr);

                column-gap: 10px;
            }

            .profile-info-label {
                font-size: 11px;
            }

            .profile-info-value {
                font-size: 12.5px;
            }
        }

        @media (max-width: 360px) {
            .profile-info-row {
                grid-template-columns: 1fr;

                gap: 4px;

                padding:
                    9px 2px;
            }
        }
    `;

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <Layout>
                <style>
                    {animationStyles}
                </style>

                <div className="profile-page">

                    <h1 className="profile-title">
                        👤 My Profile
                    </h1>

                    <p className="profile-subtitle">
                        View your account information
                        and activity.
                    </p>

                    <div className="profile-content">

                        <div className="profile-skeleton">

                            <div className="skeleton-avatar" />

                            <div className="skeleton-line name" />

                            <div className="skeleton-line info" />

                            <div className="skeleton-line info" />

                        </div>

                        <div className="skeleton-line account-title" />

                        <div className="skeleton-member" />

                        <div className="skeleton-stat-grid">

                            <div className="skeleton-stat" />

                            <div className="skeleton-stat" />

                            <div className="skeleton-stat" />

                            <div className="skeleton-stat" />

                            <div className="skeleton-stat" />

                            <div className="skeleton-stat" />

                        </div>

                    </div>

                </div>
            </Layout>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <Layout>
                <style>
                    {animationStyles}
                </style>

                <div className="profile-page">

                    <h1 className="profile-title">
                        👤 My Profile
                    </h1>

                    <p className="profile-subtitle">
                        View your account information
                        and activity.
                    </p>

                    <div className="profile-content">

                        <div className="profile-error">
                            ⚠️ {error}
                        </div>

                    </div>

                </div>
            </Layout>
        );
    }

    // =========================================================
    // PROFILE
    // =========================================================

    return (
        <Layout>
            <style>
                {animationStyles}
            </style>

            <div className="profile-page">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <h1 className="profile-title">
                    👤 My Profile
                </h1>

                <p className="profile-subtitle">
                    View your account information and
                    activity.
                </p>

                <div className="profile-content">

                    {/* =================================================
                        MAIN PROFILE CARD
                    ================================================= */}

                    <div className="profile-main-card">

                        {/* =============================================
                            AVATAR
                        ============================================= */}

                        <div className="profile-avatar">
                            {user?.role === "admin"
                                ? "👑"
                                : "👤"}
                        </div>

                        {/* =============================================
                            NAME
                        ============================================= */}

                        <h2 className="profile-name">
                            {user?.name ||
                                "Unknown User"}
                        </h2>

                        {/* =============================================
                            INFORMATION
                        ============================================= */}

                        <div className="profile-info-list">

                            {/* EMAIL */}

                            <div
                                className="profile-info-row"
                                style={{
                                    animationDelay:
                                        "0.1s",
                                }}
                            >
                                <div className="profile-info-label">
                                    Email
                                </div>

                                <div className="profile-info-value">
                                    📧{" "}
                                    {user?.email ||
                                        "Not available"}
                                </div>
                            </div>

                            {/* ROLE */}

                            <div
                                className="profile-info-row"
                                style={{
                                    animationDelay:
                                        "0.15s",
                                }}
                            >
                                <div className="profile-info-label">
                                    Role
                                </div>

                                <div className="profile-info-value">

                                    <span
                                        className={`profile-role-badge ${
                                            user?.role ===
                                            "admin"
                                                ? "admin"
                                                : "user"
                                        }`}
                                    >
                                        {user?.role ===
                                        "admin"
                                            ? "👑 Admin"
                                            : "👤 User"}
                                    </span>

                                </div>
                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        ACCOUNT INFORMATION
                    ================================================= */}

                    <div className="profile-account-section">

                        <h2 className="account-section-title">
                            📊 Account Information
                        </h2>

                        {/* =============================================
                            MEMBER SINCE
                        ============================================= */}

                        <div className="member-since-card">

                            <div className="member-since-icon">
                                📅
                            </div>

                            <div className="member-since-info">

                                <div className="member-since-label">
                                    Member Since
                                </div>

                                <div className="member-since-value">
                                    {user?.createdAt
                                        ? new Date(
                                              user.createdAt
                                          ).toLocaleDateString(
                                              undefined,
                                              {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                              }
                                          )
                                        : "Not available"}
                                </div>

                            </div>

                        </div>

                        {/* =============================================
                            TASK STATISTICS PROJECT FILTER
                        ============================================= */}

                        <div className="task-stats-filter-card">

                            <div className="task-stats-filter-header">

                                <div>
                                    <h3 className="task-stats-filter-title">
                                        🎯 My Task Statistics
                                    </h3>

                                    <p className="task-stats-filter-subtitle">
                                        Search and choose a project to see only your assigned Todo, In Progress, and Done statistics for that project.
                                    </p>
                                </div>

                                <span className="task-stats-context">
                                    {statisticsContext}
                                </span>

                            </div>

                            <SearchableSelect
                                value={selectedProject}
                                onChange={(projectId) =>
                                    setSelectedProject(
                                        projectId
                                    )
                                }
                                options={projectFilterOptions}
                                placeholder="All Assigned Projects"
                                searchPlaceholder="Search projects..."
                                emptyText="No projects found."
                            />

                        </div>

                        {/* =============================================
                            STATISTICS
                        ============================================= */}

                        <div className="profile-account-grid">

                            {/* PROJECTS */}

                            <div
                                className="profile-stat-card"
                                style={{
                                    animationDelay:
                                        "0.1s",
                                }}
                            >
                                <div className="stat-card-top">

                                    <p className="profile-stat-label">
                                        Projects
                                    </p>

                                    <div className="profile-stat-icon">
                                        📁
                                    </div>

                                </div>

                                <p className="profile-stat-value">
                                    {projectCount}
                                </p>

                            </div>

                            {/* ALL MY ASSIGNED TASKS */}

                            <div
                                className="profile-stat-card"
                                style={{
                                    animationDelay:
                                        "0.15s",
                                }}
                            >
                                <div className="stat-card-top">

                                    <p className="profile-stat-label">
                                        My Tasks
                                    </p>

                                    <div className="profile-stat-icon">
                                        📝
                                    </div>

                                </div>

                                <p className="profile-stat-value">
                                    {taskStats.total}
                                </p>

                            </div>

                            {/* TODO */}

                            <div
                                className="profile-stat-card"
                                style={{
                                    animationDelay:
                                        "0.2s",
                                }}
                            >
                                <div className="stat-card-top">

                                    <p className="profile-stat-label">
                                        Todo
                                    </p>

                                    <div className="profile-stat-icon">
                                        📋
                                    </div>

                                </div>

                                <p className="profile-stat-value">
                                    {taskStats.todo}
                                </p>

                            </div>

                            {/* IN PROGRESS */}

                            <div
                                className="profile-stat-card"
                                style={{
                                    animationDelay:
                                        "0.25s",
                                }}
                            >
                                <div className="stat-card-top">

                                    <p className="profile-stat-label">
                                        In Progress
                                    </p>

                                    <div className="profile-stat-icon">
                                        ⏳
                                    </div>

                                </div>

                                <p className="profile-stat-value">
                                    {taskStats.inProgress}
                                </p>

                            </div>

                            {/* DONE */}

                            <div
                                className="profile-stat-card"
                                style={{
                                    animationDelay:
                                        "0.3s",
                                }}
                            >
                                <div className="stat-card-top">

                                    <p className="profile-stat-label">
                                        Done
                                    </p>

                                    <div className="profile-stat-icon">
                                        ✅
                                    </div>

                                </div>

                                <p className="profile-stat-value">
                                    {taskStats.done}
                                </p>

                            </div>

                            {/* ACCOUNT TYPE */}

                            <div
                                className="profile-stat-card"
                                style={{
                                    animationDelay:
                                        "0.35s",
                                }}
                            >
                                <div className="stat-card-top">

                                    <p className="profile-stat-label">
                                        Account Type
                                    </p>

                                    <div className="profile-stat-icon">
                                        🛡️
                                    </div>

                                </div>

                                <p className="profile-stat-value text">
                                    {user?.role ===
                                    "admin"
                                        ? "Admin"
                                        : "User"}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </Layout>
    );
}

export default Profile;