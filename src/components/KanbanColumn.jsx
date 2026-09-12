import KanbanTaskCard from "./KanbanTaskCard";
import { useDroppable } from "@dnd-kit/core";

function KanbanColumn({
    id,
    title,
    tasks,
    background,
}) {
    const {
        setNodeRef,
        isOver,
    } = useDroppable({
        id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`kanban-column ${
                isOver
                    ? "kanban-column-over"
                    : ""
            }`}
            style={{
                flex: 1,
                minWidth: 0,
                padding: "20px",
                background:
                    isOver
                        ? "var(--hover-bg)"
                        : background,
                color:
                    "var(--text-color)",
                border:
                    isOver
                        ? "2px solid #60a5fa"
                        : "1px solid var(--border-color)",
                borderRadius: "12px",
                boxShadow:
                    isOver
                        ? "0 0 0 3px rgba(96,165,250,0.12)"
                        : "0 2px 8px var(--shadow-color)",
                transition:
                    "background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
            }}
        >
            <h2>{title}</h2>

            {tasks.length === 0 ? (
                <p className="kanban-empty">
                    Drop a task here.
                </p>
            ) : (
                tasks.map(
                    (task, index) => (
                        <div
                            key={
                                task._id
                            }
                            style={{
                                animationDelay:
                                    `${index * 0.04}s`,
                            }}
                        >
                            <KanbanTaskCard
                                task={
                                    task
                                }
                            />
                        </div>
                    )
                )
            )}

            <style>
                {`
                    .kanban-column {
                        min-height: 500px;
                    }

                    .kanban-column h2 {
                        margin:
                            0 0 16px;

                        font-size: 21px;
                    }

                    .kanban-empty {
                        margin: 0;

                        padding:
                            34px 10px;

                        opacity: 0.65;

                        font-size: 14px;
                        text-align: center;

                        border:
                            1px dashed
                            var(--border-color);

                        border-radius: 8px;

                        animation:
                            fadeIn
                            0.3s
                            ease;
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }

                        to {
                            opacity: 0.65;
                        }
                    }

                    @media (max-width: 768px) {
                        .kanban-column {
                            width: 100%;
                            min-height: 280px;
                            padding: 14px !important;
                        }

                        .kanban-column h2 {
                            font-size: 19px;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default KanbanColumn;
