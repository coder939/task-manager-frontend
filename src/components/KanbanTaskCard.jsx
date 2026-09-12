import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function KanbanTaskCard({
    task,
    overlay = false,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: task._id,
        data: {
            task,
        },
        disabled: overlay,
    });

    const transformStyle =
        transform
            ? CSS.Translate.toString(
                  transform
              )
            : undefined;

    return (
        <div
            ref={setNodeRef}
            className={`kanban-card ${
                isDragging
                    ? "is-dragging"
                    : ""
            }`}
            style={{
                transform:
                    transformStyle,
                opacity:
                    isDragging
                        ? 0.35
                        : 1,
                background:
                    "var(--card-bg)",
                color:
                    "var(--text-color)",
                border:
                    "1px solid var(--border-color)",
                padding: "14px",
                marginBottom: "10px",
                borderRadius: "10px",
                boxShadow:
                    "0 2px 6px var(--shadow-color)",
            }}
        >
            <div className="kanban-card-top">
                <h3>
                    {task.title}
                </h3>

                {!overlay && (
                    <button
                        ref={
                            setActivatorNodeRef
                        }
                        type="button"
                        className="kanban-drag-handle"
                        {...listeners}
                        {...attributes}
                        aria-label={`Move ${task.title}`}
                        title="Drag task"
                    >
                        ⠿
                    </button>
                )}
            </div>

            <p>
                <strong>
                    Project:
                </strong>{" "}
                {task.project?.name ||
                    "Unknown Project"}
            </p>

            <p>
                <strong>
                    Priority:
                </strong>{" "}
                <span
                    style={{
                        color:
                            task.priority ===
                            "high"
                                ? "#ef4444"
                                : task.priority ===
                                  "medium"
                                ? "#f59e0b"
                                : "#22c55e",
                        fontWeight:
                            "bold",
                    }}
                >
                    {task.priority?.toUpperCase()}
                </span>
            </p>

            <p>
                <strong>
                    Due:
                </strong>{" "}
                {task.dueDate
                    ? new Date(
                          task.dueDate
                      ).toLocaleDateString()
                    : "No due date"}
            </p>

            <style>
                {`
                    .kanban-card {
                        min-width: 0;

                        animation:
                            kanbanCardIn
                            0.25s
                            ease
                            both;

                        transition:
                            box-shadow 0.15s ease,
                            border-color 0.15s ease,
                            opacity 0.15s ease;
                    }

                    .kanban-card:hover {
                        box-shadow:
                            0 6px 14px
                            var(--shadow-color);
                    }

                    .kanban-card.is-dragging {
                        box-shadow:
                            0 8px 20px
                            rgba(0,0,0,0.22);
                    }

                    .kanban-card-top {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 10px;
                    }

                    .kanban-card h3 {
                        min-width: 0;
                        margin:
                            0 0 12px;

                        font-size: 17px;
                        line-height: 1.3;
                        overflow-wrap: anywhere;
                    }

                    .kanban-card p {
                        margin:
                            8px 0;

                        font-size: 14px;
                        line-height: 1.45;
                        overflow-wrap: anywhere;
                    }

                    .kanban-drag-handle {
                        width: 38px;
                        height: 38px;
                        flex-shrink: 0;

                        display: inline-flex;
                        align-items: center;
                        justify-content: center;

                        border:
                            1px solid
                            var(--border-color);

                        border-radius: 9px;

                        background:
                            var(--section-bg);

                        color:
                            var(--text-color);

                        font-size: 22px;
                        line-height: 1;

                        cursor: grab;

                        user-select: none;
                        -webkit-user-select: none;

                        touch-action: none;
                    }

                    .kanban-drag-handle:active {
                        cursor: grabbing;
                    }

                    @keyframes kanbanCardIn {
                        from {
                            opacity: 0;
                            transform:
                                translateY(8px)
                                scale(0.98);
                        }

                        to {
                            opacity: 1;
                            transform:
                                translateY(0)
                                scale(1);
                        }
                    }

                    @media (max-width: 768px) {
                        .kanban-card {
                            padding: 13px !important;
                        }

                        .kanban-drag-handle {
                            width: 44px;
                            height: 44px;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default KanbanTaskCard;
