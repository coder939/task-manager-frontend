import { useEffect, useState } from "react";
import { getProjects } from "../services/projectService";
import {
    getDashboardOverview,
    getProjectStats
} from "../services/dashboardService";
import Layout from "../components/Layout";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { getRecentActivities } from "../services/activityService";
import "../styles/Dashboard.css";
import { toast } from "react-toastify";

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [stats, setStats] = useState(null);
    const [overview, setOverview] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
              tasks: overview.lowPriority,
          },
          {
              name: "Medium",
              tasks: overview.mediumPriority,
          },
          {
              name: "High",
              tasks: overview.highPriority,
          },
      ]
    : [];

    // Show error toast if there's an error
    useEffect(() => {
    if (error) {
        toast.error(error);
    }
}, [error]);

    // Load recent activities
    useEffect(() => {
    const fetchActivities = async () => {
        try {
            const res = await getRecentActivities();

            setActivities(
                res.data.activities || []
            );
        } catch (err) {
    console.log(
        err.response?.data ||
        err.message
    );

    toast.error(
        err.response?.data?.message ||
        "Failed to load recent activities"
    );
}
    };

    fetchActivities();
}, []);

    // Load dashboard overview
    useEffect(() => {
    const fetchOverview = async () => {
        try {
            const res = await getDashboardOverview();

            setOverview(res.data);
        } catch (err) {
    console.log(
        err.response?.data || err.message
    );

    setError(
        err.response?.data?.message ||
        "Failed to load dashboard data"
    );
} finally {
            setLoading(false);
        }
    };

    fetchOverview();
}, []);

    // Load projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await getProjects();
                setProjects(res.data.projects || res.data);
            } catch (err) {
                console.log(err.response?.data || err.message);
            }
        };

        fetchProjects();
    }, []);

    // Load stats when project changes
    useEffect(() => {
        if (!selectedProject) {
            setStats(null);
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await getProjectStats(selectedProject);
                setStats(res.data);
            } catch (err) {
                console.log(err.response?.data || err.message);
                toast.error(
                    err.response?.data?.message ||
                    "Failed to load project stats"
                );
                setStats(null);
            }
        };

        fetchStats();
    }, [selectedProject]);

    return (
        <Layout>

    {loading ? (
        <div className="dashboard-page">
            <h1 style={{ marginBottom: "20px" }}>
                📊 Project Dashboard
            </h1>

            <div className="dashboard-overview-grid">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="dashboard-skeleton-card">
                        <div className="skeleton-circle" />
                        <div className="skeleton-line short" />
                        <div className="skeleton-line medium" />
                    </div>
                ))}
            </div>

            <div className="dashboard-charts">
                {[1, 2].map((item) => (
                    <div key={item} className="dashboard-chart-skeleton">
                        <div className="skeleton-line chart-title" />

                        <div className="chart-skeleton-bars">
                            <div className="chart-skeleton-bar" style={{ height: "55%" }} />
                            <div className="chart-skeleton-bar" style={{ height: "80%" }} />
                            <div className="chart-skeleton-bar" style={{ height: "40%" }} />
                            <div className="chart-skeleton-bar" style={{ height: "65%" }} />
                            <div className="chart-skeleton-bar" style={{ height: "30%" }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ) : (
        <div className="dashboard-page">


            <div className="dashboard-page">
            <h1 style={{ marginBottom: "20px" }}>
                📊 Project Dashboard
            </h1>

            {/* Global Dashboard Overview */}
            <div className="dashboard-section">
{overview && (
    <div className="dashboard-overview-grid">
        <div className="dashboard-card" style={{ animationDelay: "0s" }}>
            <div className="dashboard-card-icon">📁</div>
            <h3>Total Projects</h3>
            <p style={{ fontSize: "30px", fontWeight: "bold" }}>
                {overview.totalProjects}
            </p>
        </div>

        <div className="dashboard-card" style={{ animationDelay: "0.05s" }}>
            <div className="dashboard-card-icon">📝</div>
            <h3> Total Tasks</h3>
            <p style={{ fontSize: "30px", fontWeight: "bold" }}>
                {overview.totalTasks}
            </p>
        </div>

        <div className="dashboard-card" style={{ animationDelay: "0.1s" }}>
            <div className="dashboard-card-icon">🟡</div>
            <h3>Todo</h3>
            <p style={{ fontSize: "30px", fontWeight: "bold" }}>
                {overview.todo}
            </p>
        </div>

        <div className="dashboard-card" style={{ animationDelay: "0.15s" }}>
            <div className="dashboard-card-icon">🔵</div>
            <h3>In Progress</h3>
            <p style={{ fontSize: "30px", fontWeight: "bold" }}>
                {overview.inProgress}
            </p>
        </div>

        <div className="dashboard-card" style={{ animationDelay: "0.2s" }}>
            <div className="dashboard-card-icon">🟢</div>
            <h3>Completed</h3>
            <p style={{ fontSize: "30px", fontWeight: "bold" }}>
                {overview.done}
            </p>
        </div>

        <div className="dashboard-card" style={{ animationDelay: "0.25s" }}>
            <div className="dashboard-card-icon">🔥</div>
            <h3>High Priority</h3>
            <p style={{ fontSize: "30px", fontWeight: "bold" }}>
                {overview.highPriority}
            </p>
        </div>
    </div>

)}
</div>

<div className="dashboard-charts">
        {/* Task Status Chart */}
{overview && (
    <div
        className="dashboard-chart-card"
    >
        <h2>📊 Tasks by Status</h2>

        <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={taskStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                        dataKey="tasks"
                        fill="#8884d8"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
)}


{/* Task Priority Chart */}
{overview && (
    <div
        className="dashboard-chart-card"
        style={{ animationDelay: "0.1s" }}
    >
        <h2>🔥 Tasks by Priority</h2>

        <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={taskPriorityData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                        dataKey="tasks"
                        fill="#ff7300"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
)}
</div>

{/* Recent Activity */}
<div className="dashboard-section">
<div className="dashboard-activity">
    <h2>🕒 Recent Activity</h2>

    {activities.length === 0 ? (
    <div className="dashboard-empty-state">
        <div className="dashboard-empty-icon">🕒</div>

        <h3>No Recent Activity</h3>

        <p>
            Your latest project activity will appear here.
        </p>
    </div>
) : (
        <div className="dashboard-activity-list">
    {activities.map((activity, index) => (
        <div
            key={activity._id}
            className="activity-item"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="activity-icon">
                📝
            </div>

            <div className="activity-content">
                <p className="activity-action">
                    <strong>
                        {activity.user?.name ||
                            "Unknown User"}
                    </strong>{" "}
                    {activity.action}
                </p>

                <p className="activity-project">
                    📁{" "}
                    {activity.project?.name ||
                        "Unknown Project"}
                </p>

                <p className="activity-time">
                    {new Date(
                        activity.createdAt
                    ).toLocaleString()}
                </p>
            </div>
        </div>
    ))}
</div>
    )}
</div>
</div>
<br /><br />
            {/* Project Selector */}
            {projects.length === 0 && (
    <p className="dashboard-empty-message">
        No projects found. Create a project to get started.
    </p>
)}
            <select
    className="dashboard-project-select"
    value={selectedProject}
    onChange={(e) => setSelectedProject(e.target.value)}
>
                <option value="">Select Project</option>

                {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                        {project.name}
                    </option>
                ))}
            </select>

            {!selectedProject && (
    <div className="dashboard-empty-state">
        <div className="dashboard-empty-icon">📊</div>

        <h3>Select a Project</h3>

        <p>
            Select a project above to view its detailed
            task statistics.
        </p>
    </div>
)}

            {/* Statistics */}
            {stats && (
                <div
                    className="dashboard-overview-grid"
                >
                    <div className="dashboard-card">
                        <h3>Total Tasks</h3>
                        <p>{stats.stats.totalTasks}</p>
                    </div>

                    <div className="dashboard-card" style={{ animationDelay: "0.05s" }}>
                        <h3>Todo</h3>
                        <p>{stats.stats.todo}</p>
                    </div>

                    <div className="dashboard-card" style={{ animationDelay: "0.1s" }}>
                        <h3>In Progress</h3>
                        <p>{stats.stats.inProgress}</p>
                    </div>

                    <div className="dashboard-card" style={{ animationDelay: "0.15s" }}>
                        <h3>Done</h3>
                        <p>{stats.stats.done}</p>
                    </div>

                    <div className="dashboard-card" style={{ animationDelay: "0.2s" }}>
                        <h3>Completion</h3>
                        <p>{stats.stats.completionRate.toFixed(0)}%</p>
                    </div>
                </div>
            )}
            </div>
              </div>
    )}
        </Layout>
    );
}

export default Dashboard;