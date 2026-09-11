import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function KanbanTaskCard({ task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: task._id,
        data: {
            task,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="kanban-card"
            style={{
                ...style,
                background: "var(--card-bg)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px",
                boxShadow: "0 2px 6px var(--shadow-color)",
                cursor: isDragging ? "grabbing" : "grab",
            }}
        >
            <h3>{task.title}</h3>

            <p>
                <strong>Project:</strong>{" "}
                {task.project?.name || "Unknown Project"}
            </p>

            <p>
                <strong>Priority:</strong>{" "}
                <span
                    style={{
                        color:
                            task.priority === "high"
                                ? "red"
                                : task.priority === "medium"
                                ? "orange"
                                : "green",
                        fontWeight: "bold",
                    }}
                >
                    {task.priority?.toUpperCase()}
                </span>
            </p>

            <p>
                <strong>Due:</strong>{" "}
                {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No due date"}
            </p>

            <style>
                {`
                    .kanban-card {
                        animation: kanbanCardIn 0.25s ease both;
                        transition:
                            box-shadow 0.15s ease,
                            border-color 0.15s ease,
                            transform 0.15s ease;
                    }

                    .kanban-card:hover {
                        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
                        transform: translateY(-2px);
                    }

                    .kanban-card:active {
                        cursor: grabbing;
                    }

                    @keyframes kanbanCardIn {
                        from {
                            opacity: 0;
                            transform: translateY(8px) scale(0.98);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default KanbanTaskCard;