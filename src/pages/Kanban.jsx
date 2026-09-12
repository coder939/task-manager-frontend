import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import {
    getMyTasks,
    updateTaskStatus,
} from "../services/taskService";
import {
    DndContext,
    closestCenter,
    DragOverlay,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import KanbanTaskCard from "../components/KanbanTaskCard";
import KanbanColumn from "../components/KanbanColumn";

function Kanban() {
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [loading, setLoading] = useState(true);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 180,
                tolerance: 10,
            },
        }),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await getMyTasks();
                setTasks(res.data.tasks || []);
            } catch (err) {
                console.log(
                    err.response?.data ||
                    err.message
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const tasksByStatus = useMemo(
        () => ({
            todo: tasks.filter(
                (task) => task.status === "todo"
            ),
            "in-progress": tasks.filter(
                (task) =>
                    task.status === "in-progress"
            ),
            done: tasks.filter(
                (task) => task.status === "done"
            ),
        }),
        [tasks]
    );

    const handleDragStart = (event) => {
        const task = tasks.find(
            (item) =>
                String(item._id) ===
                String(event.active.id)
        );

        setActiveTask(task || null);
    };

    const handleDragCancel = () => {
        setActiveTask(null);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        setActiveTask(null);

        if (!over) {
            return;
        }

        const taskId = String(active.id);
        const newStatus = String(over.id);

        if (
            ![
                "todo",
                "in-progress",
                "done",
            ].includes(newStatus)
        ) {
            return;
        }

        const task = tasks.find(
            (item) =>
                String(item._id) === taskId
        );

        if (
            !task ||
            task.status === newStatus
        ) {
            return;
        }

        const previousTasks = tasks;

        setTasks((prev) =>
            prev.map((item) =>
                String(item._id) === taskId
                    ? {
                          ...item,
                          status: newStatus,
                      }
                    : item
            )
        );

        try {
            await updateTaskStatus(
                taskId,
                newStatus
            );
        } catch (err) {
            console.log(
                err.response?.data ||
                err.message
            );

            setTasks(previousTasks);

            alert(
                "Failed to update task status."
            );
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

                    @keyframes kanbanSkeletonPulse {
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

                    .kanban-page {
                        width: 100%;
                        min-width: 0;
                    }

                    .kanban-header {
                        animation:
                            kanbanPageIn
                            0.3s
                            ease
                            both;
                    }

                    .kanban-header h1 {
                        margin-top: 0;
                        margin-bottom: 8px;
                    }

                    .kanban-header p {
                        margin-top: 0;
                        color: var(--secondary-text);
                    }

                    .kanban-mobile-hint {
                        display: none;
                    }

                    .kanban-columns {
                        display: flex;
                        align-items: stretch;
                        gap: 20px;
                        width: 100%;
                        min-width: 0;
                        margin-top: 30px;

                        animation:
                            kanbanPageIn
                            0.35s
                            ease
                            both
                            0.05s;
                    }

                    .kanban-loading-column {
                        flex: 1;
                        min-width: 0;
                        min-height: 500px;
                        padding: 20px;

                        background:
                            var(--card-bg);

                        border:
                            1px solid
                            var(--border-color);

                        border-radius: 12px;
                    }

                    .kanban-skeleton-card {
                        padding: 15px;
                        margin-bottom: 10px;

                        border-radius: 8px;

                        background:
                            var(--card-bg);

                        border:
                            1px solid
                            var(--border-color);

                        animation:
                            kanbanSkeletonPulse
                            1.5s
                            ease-in-out
                            infinite;
                    }

                    .kanban-skeleton-line {
                        height: 12px;
                        margin-bottom: 10px;

                        border-radius: 6px;

                        background:
                            var(--border-color);
                    }

                    .kanban-skeleton-line.title {
                        width: 60%;
                        height: 16px;
                    }

                    .kanban-skeleton-line.short {
                        width: 40%;
                        margin-bottom: 0;
                    }

                    @media (max-width: 768px) {
                        .kanban-header h1 {
                            font-size: 28px;
                        }

                        .kanban-mobile-hint {
                            display: block;

                            margin:
                                10px 0 0;

                            padding:
                                10px 12px;

                            border:
                                1px solid
                                var(--border-color);

                            border-radius: 10px;

                            background:
                                var(--section-bg);

                            color:
                                var(--secondary-text);

                            font-size: 13px;
                            line-height: 1.45;
                        }

                        .kanban-columns {
                            flex-direction: column;
                            gap: 16px;
                            margin-top: 18px;
                        }

                        .kanban-loading-column {
                            width: 100%;
                            min-height: 260px;
                            padding: 14px;
                        }
                    }
                `}
            </style>

            <div className="kanban-page">
                <DndContext
                    sensors={sensors}
                    collisionDetection={
                        closestCenter
                    }
                    onDragStart={
                        handleDragStart
                    }
                    onDragCancel={
                        handleDragCancel
                    }
                    onDragEnd={
                        handleDragEnd
                    }
                >
                    <div className="kanban-header">
                        <h1>
                            📋 Kanban Board
                        </h1>

                        <p>
                            Total Tasks:{" "}
                            {tasks.length}
                        </p>

                        <p className="kanban-mobile-hint">
                            On mobile, press and
                            hold the ⠿ handle on a
                            task, then drag it into
                            another column.
                        </p>
                    </div>

                    <div className="kanban-columns">
                        {loading ? (
                            [1, 2, 3].map(
                                (col) => (
                                    <div
                                        key={
                                            col
                                        }
                                        className="kanban-loading-column"
                                    >
                                        <div
                                            className="kanban-skeleton-line title"
                                            style={{
                                                width:
                                                    "50%",
                                                height:
                                                    "20px",
                                                marginBottom:
                                                    "20px",
                                            }}
                                        />

                                        {[
                                            1,
                                            2,
                                            3,
                                        ].map(
                                            (
                                                card
                                            ) => (
                                                <div
                                                    key={
                                                        card
                                                    }
                                                    className="kanban-skeleton-card"
                                                >
                                                    <div className="kanban-skeleton-line title" />
                                                    <div className="kanban-skeleton-line" />
                                                    <div className="kanban-skeleton-line short" />
                                                </div>
                                            )
                                        )}
                                    </div>
                                )
                            )
                        ) : (
                            <>
                                <KanbanColumn
                                    id="todo"
                                    title="📝 Todo"
                                    background="var(--card-bg)"
                                    tasks={
                                        tasksByStatus.todo
                                    }
                                />

                                <KanbanColumn
                                    id="in-progress"
                                    title="⚙️ In Progress"
                                    background="var(--card-bg)"
                                    tasks={
                                        tasksByStatus[
                                            "in-progress"
                                        ]
                                    }
                                />

                                <KanbanColumn
                                    id="done"
                                    title="✅ Done"
                                    background="var(--card-bg)"
                                    tasks={
                                        tasksByStatus.done
                                    }
                                />
                            </>
                        )}
                    </div>

                    <DragOverlay
                        dropAnimation={null}
                    >
                        {activeTask ? (
                            <div
                                style={{
                                    width:
                                        "min(360px, calc(100vw - 40px))",
                                    transform:
                                        "rotate(2deg) scale(1.02)",
                                    boxShadow:
                                        "0 12px 28px rgba(0,0,0,0.28)",
                                }}
                            >
                                <KanbanTaskCard
                                    task={
                                        activeTask
                                    }
                                    overlay
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </Layout>
    );
}

export default Kanban;
