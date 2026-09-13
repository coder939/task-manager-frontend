import {
    useEffect,
    useState,
} from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { toast } from "react-toastify";

import Layout from "../components/Layout";
import {
    getDashboardOverview,
    getProjectStats,
} from "../services/dashboardService";
import { getProjects } from "../services/projectService";
import { getRecentActivities } from "../services/activityService";

import "../styles/Dashboard.css";

const metricCards = (overview) => [
    {
        icon: "📁",
        label: "Total Projects",
        value: overview.totalProjects,
    },
    {
        icon: "📝",
        label: "Total Tasks",
        value: overview.totalTasks,
    },
    {
        icon: "🟡",
        label: "Todo",
        value: overview.todo,
    },
    {
        icon: "🔵",
        label: "In Progress",
        value: overview.inProgress,
    },
    {
        icon: "🟢",
        label: "Completed",
        value: overview.done,
    },
    {
        icon: "🔥",
        label: "High Priority",
        value: overview.highPriority,
    },
];

function Dashboard() {
    const [projects, setProjects] =
        useState([]);

    const [
        selectedProject,
        setSelectedProject,
    ] = useState("");

    const [stats, setStats] =
        useState(null);

    const [overview, setOverview] =
        useState(null);

    const [activities, setActivities] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [
                    overviewResponse,
                    projectsResponse,
                    activitiesResponse,
                ] = await Promise.all([
                    getDashboardOverview(),
                    getProjects(),
                    getRecentActivities(),
                ]);

                setOverview(
                    overviewResponse.data
                );

                setProjects(
                    projectsResponse.data
                        .projects ||
                        projectsResponse.data ||
                        []
                );

                setActivities(
                    activitiesResponse.data
                        .activities || []
                );
            } catch (err) {
                console.log(
                    err.response?.data ||
                        err.message
                );

                toast.error(
                    err.response?.data
                        ?.message ||
                        "Failed to load dashboard data"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    useEffect(() => {
        if (!selectedProject) {
            return;
        }

        const fetchStats = async () => {
            try {
                const response =
                    await getProjectStats(
                        selectedProject
                    );

                setStats(response.data);
            } catch (err) {
                console.log(
                    err.response?.data ||
                        err.message
                );

                toast.error(
                    err.response?.data
                        ?.message ||
                        "Failed to load project stats"
                );

                setStats(null);
            }
        };

        fetchStats();
    }, [selectedProject]);

    const taskStatusData = overview
        ? [
              {
                  name: "Todo",
                  tasks: overview.todo,
              },
              {
                  name: "In Progress",
                  tasks: overview.inProgress,
              },
              {
                  name: "Done",
                  tasks: overview.done,
              },
          ]
        : [];

    const taskPriorityData = overview
        ? [
              {
                  name: "Low",
                  tasks:
                      overview.lowPriority,
              },
              {
                  name: "Medium",
                  tasks:
                      overview.mediumPriority,
              },
              {
                  name: "High",
                  tasks:
                      overview.highPriority,
              },
          ]
        : [];

    const tooltipStyle = {
        backgroundColor:
            "var(--card-bg)",
        border:
            "1px solid var(--border-color)",
        borderRadius: "10px",
        color: "var(--text-color)",
        boxShadow:
            "0 10px 30px var(--shadow-color)",
    };

    return (
        <Layout>
            <div className="dashboard-page">
                <header className="dashboard-header">
                    <div>
                        <h1>
                            📊 Project Dashboard
                        </h1>

                        <p>
                            Track your projects,
                            workload, and recent
                            team activity.
                        </p>
                    </div>
                </header>

                {loading ? (
                    <>
                        <div className="dashboard-overview-grid">
                            {[
                                1, 2, 3, 4, 5, 6,
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="dashboard-skeleton-card"
                                >
                                    <div className="skeleton-circle" />
                                    <div className="skeleton-line short" />
                                    <div className="skeleton-line medium" />
                                </div>
                            ))}
                        </div>

                        <div className="dashboard-charts">
                            {[1, 2].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="dashboard-chart-skeleton"
                                    >
                                        <div className="skeleton-line chart-title" />

                                        <div className="chart-skeleton-bars">
                                            {[
                                                "55%",
                                                "80%",
                                                "40%",
                                                "65%",
                                                "30%",
                                            ].map(
                                                (
                                                    height,
                                                    index
                                                ) => (
                                                    <div
                                                        key={
                                                            index
                                                        }
                                                        className="chart-skeleton-bar"
                                                        style={{
                                                            height,
                                                        }}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {overview && (
                            <section
                                className="dashboard-section"
                                aria-labelledby="overview-heading"
                            >
                                <div className="dashboard-section-heading">
                                    <div>
                                        <h2 id="overview-heading">
                                            Workspace
                                            overview
                                        </h2>

                                        <p>
                                            A quick
                                            snapshot
                                            of your
                                            current
                                            work.
                                        </p>
                                    </div>
                                </div>

                                <div className="dashboard-overview-grid">
                                    {metricCards(
                                        overview
                                    ).map(
                                        (
                                            metric,
                                            index
                                        ) => (
                                            <article
                                                key={
                                                    metric.label
                                                }
                                                className="dashboard-card"
                                                style={{
                                                    animationDelay: `${index * 0.04}s`,
                                                }}
                                            >
                                                <div className="dashboard-card-icon">
                                                    {
                                                        metric.icon
                                                    }
                                                </div>

                                                <div className="dashboard-card-content">
                                                    <h3>
                                                        {
                                                            metric.label
                                                        }
                                                    </h3>

                                                    <p>
                                                        {
                                                            metric.value
                                                        }
                                                    </p>
                                                </div>
                                            </article>
                                        )
                                    )}
                                </div>
                            </section>
                        )}

                        {overview && (
                            <section className="dashboard-section">
                                <div className="dashboard-section-heading">
                                    <div>
                                        <h2>
                                            Task
                                            analytics
                                        </h2>

                                        <p>
                                            Status
                                            and
                                            priority
                                            distribution.
                                        </p>
                                    </div>
                                </div>

                                <div className="dashboard-charts">
                                    <article className="dashboard-chart-card">
                                        <h3>
                                            📊 Tasks
                                            by Status
                                        </h3>

                                        <div className="dashboard-chart">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <BarChart
                                                    data={
                                                        taskStatusData
                                                    }
                                                    margin={{
                                                        top: 10,
                                                        right: 10,
                                                        left: -16,
                                                        bottom: 0,
                                                    }}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        stroke="var(--border-color)"
                                                    />

                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{
                                                            fill: "var(--muted-text)",
                                                            fontSize: 12,
                                                        }}
                                                        axisLine={{
                                                            stroke: "var(--border-color)",
                                                        }}
                                                        tickLine={false}
                                                    />

                                                    <YAxis
                                                        allowDecimals={
                                                            false
                                                        }
                                                        tick={{
                                                            fill: "var(--muted-text)",
                                                            fontSize: 12,
                                                        }}
                                                        axisLine={
                                                            false
                                                        }
                                                        tickLine={
                                                            false
                                                        }
                                                    />

                                                    <Tooltip
                                                        contentStyle={
                                                            tooltipStyle
                                                        }
                                                        cursor={{
                                                            fill: "var(--hover-bg)",
                                                        }}
                                                    />

                                                    <Bar
                                                        dataKey="tasks"
                                                        fill="#6366f1"
                                                        radius={[
                                                            6,
                                                            6,
                                                            0,
                                                            0,
                                                        ]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </article>

                                    <article
                                        className="dashboard-chart-card"
                                        style={{
                                            animationDelay:
                                                "0.06s",
                                        }}
                                    >
                                        <h3>
                                            🔥 Tasks
                                            by Priority
                                        </h3>

                                        <div className="dashboard-chart">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <BarChart
                                                    data={
                                                        taskPriorityData
                                                    }
                                                    margin={{
                                                        top: 10,
                                                        right: 10,
                                                        left: -16,
                                                        bottom: 0,
                                                    }}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        stroke="var(--border-color)"
                                                    />

                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{
                                                            fill: "var(--muted-text)",
                                                            fontSize: 12,
                                                        }}
                                                        axisLine={{
                                                            stroke: "var(--border-color)",
                                                        }}
                                                        tickLine={false}
                                                    />

                                                    <YAxis
                                                        allowDecimals={
                                                            false
                                                        }
                                                        tick={{
                                                            fill: "var(--muted-text)",
                                                            fontSize: 12,
                                                        }}
                                                        axisLine={
                                                            false
                                                        }
                                                        tickLine={
                                                            false
                                                        }
                                                    />

                                                    <Tooltip
                                                        contentStyle={
                                                            tooltipStyle
                                                        }
                                                        cursor={{
                                                            fill: "var(--hover-bg)",
                                                        }}
                                                    />

                                                    <Bar
                                                        dataKey="tasks"
                                                        fill="#f97316"
                                                        radius={[
                                                            6,
                                                            6,
                                                            0,
                                                            0,
                                                        ]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </article>
                                </div>
                            </section>
                        )}

                        <section className="dashboard-section">
                            <div className="dashboard-section-heading">
                                <div>
                                    <h2>
                                        Recent activity
                                    </h2>

                                    <p>
                                        Latest
                                        changes
                                        across
                                        your
                                        projects.
                                    </p>
                                </div>
                            </div>

                            <article className="dashboard-activity">
                                {activities.length ===
                                0 ? (
                                    <div className="dashboard-empty-state compact">
                                        <div className="dashboard-empty-icon">
                                            🕒
                                        </div>

                                        <h3>
                                            No recent
                                            activity
                                        </h3>

                                        <p>
                                            Your
                                            latest
                                            project
                                            activity
                                            will
                                            appear
                                            here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="dashboard-activity-list">
                                        {activities.map(
                                            (
                                                activity,
                                                index
                                            ) => (
                                                <div
                                                    key={
                                                        activity._id
                                                    }
                                                    className="activity-item"
                                                    style={{
                                                        animationDelay: `${index * 0.04}s`,
                                                    }}
                                                >
                                                    <div className="activity-icon">
                                                        📝
                                                    </div>

                                                    <div className="activity-content">
                                                        <p className="activity-action">
                                                            <strong>
                                                                {activity
                                                                    .user
                                                                    ?.name ||
                                                                    "Unknown User"}
                                                            </strong>{" "}
                                                            {
                                                                activity.action
                                                            }
                                                        </p>

                                                        <p className="activity-project">
                                                            📁{" "}
                                                            {activity
                                                                .project
                                                                ?.name ||
                                                                "Unknown Project"}
                                                        </p>

                                                        <p className="activity-time">
                                                            {new Date(
                                                                activity.createdAt
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </article>
                        </section>

                        <section className="dashboard-section dashboard-project-insights">
                            <div className="dashboard-section-heading dashboard-project-heading">
                                <div>
                                    <h2>
                                        Project
                                        insights
                                    </h2>

                                    <p>
                                        Select a
                                        project to
                                        view its
                                        task
                                        progress.
                                    </p>
                                </div>

                                <select
                                    className="dashboard-project-select"
                                    value={
                                        selectedProject
                                    }
                                    onChange={(event) => {
                                        const value =
                                            event.target.value;

                                        setSelectedProject(
                                            value
                                        );

                                        if (!value) {
                                            setStats(
                                                null
                                            );
                                        }
                                    }}
                                    aria-label="Select project"
                                >
                                    <option value="">
                                        Select a
                                        project
                                    </option>

                                    {projects.map(
                                        (
                                            project
                                        ) => (
                                            <option
                                                key={
                                                    project._id
                                                }
                                                value={
                                                    project._id
                                                }
                                            >
                                                {
                                                    project.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {projects.length ===
                                0 && (
                                <div className="dashboard-empty-state">
                                    <div className="dashboard-empty-icon">
                                        📁
                                    </div>

                                    <h3>
                                        No projects
                                        yet
                                    </h3>

                                    <p>
                                        Create a
                                        project to
                                        start
                                        tracking
                                        detailed
                                        statistics.
                                    </p>
                                </div>
                            )}

                            {projects.length > 0 &&
                                !selectedProject && (
                                    <div className="dashboard-empty-state">
                                        <div className="dashboard-empty-icon">
                                            📊
                                        </div>

                                        <h3>
                                            Select a
                                            project
                                        </h3>

                                        <p>
                                            Choose a
                                            project
                                            above to
                                            see its
                                            detailed
                                            task
                                            statistics.
                                        </p>
                                    </div>
                                )}

                            {stats && (
                                <div className="dashboard-overview-grid dashboard-project-stats">
                                    {[
                                        {
                                            label: "Total Tasks",
                                            value: stats
                                                .stats
                                                .totalTasks,
                                        },
                                        {
                                            label: "Todo",
                                            value: stats
                                                .stats
                                                .todo,
                                        },
                                        {
                                            label: "In Progress",
                                            value: stats
                                                .stats
                                                .inProgress,
                                        },
                                        {
                                            label: "Done",
                                            value: stats
                                                .stats
                                                .done,
                                        },
                                        {
                                            label: "Completion",
                                            value: `${stats.stats.completionRate.toFixed(
                                                0
                                            )}%`,
                                        },
                                    ].map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <article
                                                className="dashboard-card dashboard-project-stat-card"
                                                key={
                                                    item.label
                                                }
                                                style={{
                                                    animationDelay: `${index * 0.04}s`,
                                                }}
                                            >
                                                <h3>
                                                    {
                                                        item.label
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        item.value
                                                    }
                                                </p>
                                            </article>
                                        )
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </Layout>
    );
}

export default Dashboard;
