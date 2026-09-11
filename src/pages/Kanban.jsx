import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    getMyTasks,
    updateTaskStatus,
} from "../services/taskService";
import {
    DndContext,
    closestCenter,
    DragOverlay,
} from "@dnd-kit/core";
import KanbanTaskCard from "../components/KanbanTaskCard";
import KanbanColumn from "../components/KanbanColumn";

function Kanban() {
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await getMyTasks();
                setTasks(res.data.tasks || []);
            } catch (err) {
                console.log(err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const handleDragStart = (event) => {
        const task = tasks.find((t) => t._id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        setActiveTask(null);

        if (!over) return;

        const taskId = active.id;
        const newStatus = over.id;

        const task = tasks.find((t) => t._id === taskId);

        if (!task || task.status === newStatus) return;

        const previousTasks = [...tasks];

        setTasks((prev) =>
            prev.map((t) =>
                t._id === taskId ? { ...t, status: newStatus } : t
            )
        );

        try {
            await updateTaskStatus(taskId, newStatus);
        } catch (err) {
            console.log(err.response?.data || err.message);
            setTasks(previousTasks);
            alert("Failed to update task status.");
        }
    };

    return (
        <Layout>
            <style>
                {`
                    @keyframes kanbanPageIn {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .kanban-header {
                        animation: kanbanPageIn 0.3s ease both;
                    }

                    .kanban-columns {
                        animation: kanbanPageIn 0.35s ease both 0.05s;
                    }

                    .kanban-skeleton-card {
                        padding: 15px;
                        margin-bottom: 10px;
                        border-radius: 8px;
                        background: var(--card-bg);
                        border: 1px solid var(--border-color);
                        animation: kanbanSkeletonPulse 1.5s ease-in-out infinite;
                    }

                    .kanban-skeleton-line {
                        height: 12px;
                        border-radius: 6px;
                        background: var(--border-color);
                        margin-bottom: 10px;
                    }

                    .kanban-skeleton-line.title {
                        width: 60%;
                        height: 16px;
                    }

                    .kanban-skeleton-line.short {
                        width: 40%;
                        margin-bottom: 0;
                    }

                    @keyframes kanbanSkeletonPulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.55; }
                        100% { opacity: 1; }
                    }
                `}
            </style>

            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-header">
                    <h1>📋 Kanban Board</h1>

                    <p>Total Tasks: {tasks.length}</p>
                </div>

                <div
                    className="kanban-columns"
                    style={{
                        display: "flex",
                        gap: "20px",
                        marginTop: "30px",
                    }}
                >
                    {loading ? (
                        [1, 2, 3].map((col) => (
                            <div
                                key={col}
                                style={{
                                    flex: 1,
                                    padding: "20px",
                                    background: "var(--card-bg)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "10px",
                                    minHeight: "500px",
                                }}
                            >
                                <div
                                    className="kanban-skeleton-line title"
                                    style={{ width: "50%", height: "20px", marginBottom: "20px" }}
                                />

                                {[1, 2, 3].map((card) => (
                                    <div key={card} className="kanban-skeleton-card">
                                        <div className="kanban-skeleton-line title" />
                                        <div className="kanban-skeleton-line" />
                                        <div className="kanban-skeleton-line short" />
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <>
                            <KanbanColumn
                                id="todo"
                                title="📝 Todo"
                                background="var(--card-bg)"
                                color="var(--text-color)"
                                border="1px solid var(--border-color)"
                                borderRadius="12px"
                                boxShadow="0 2px 8px var(--shadow-color)"
                                tasks={tasks.filter((t) => t.status === "todo")}
                            />

                            <KanbanColumn
                                id="in-progress"
                                title="⚙️ In Progress"
                                background="var(--card-bg)"
                                color="var(--text-color)"
                                border="1px solid var(--border-color)"
                                borderRadius="12px"
                                boxShadow="0 2px 8px var(--shadow-color)"
                                tasks={tasks.filter((t) => t.status === "in-progress")}
                            />

                            <KanbanColumn
                                id="done"
                                title="✅ Done"
                                background="var(--card-bg)"
                                color="var(--text-color)"
                                border="1px solid var(--border-color)"
                                borderRadius="12px"
                                boxShadow="0 2px 8px var(--shadow-color)"
                                tasks={tasks.filter((t) => t.status === "done")}
                            />
                        </>
                    )}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div
                            style={{
                                transform: "rotate(3deg) scale(1.03)",
                                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                            }}
                        >
                            <KanbanTaskCard task={activeTask} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </Layout>
    );
}

export default Kanban;