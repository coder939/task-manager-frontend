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
            className="kanban-column"
            style={{
                flex: 1,
                padding: "20px",
                background: isOver ? "#dbeafe" : background,
                borderRadius: "10px",
                minHeight: "500px",
                transition:
                    "background-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease",
                boxShadow: isOver
                    ? "0 0 0 2px #60a5fa inset"
                    : "none",
                transform: isOver ? "scale(1.01)" : "scale(1)",
            }}
        >
            <h2>{title}</h2>

            {tasks.length === 0 ? (
                <p className="kanban-empty">
                    No tasks here yet.
                </p>
            ) : (
                tasks.map((task, index) => (
                    <div
                        key={task._id}
                        style={{
                            animationDelay: `${index * 0.04}s`,
                        }}
                    >
                        <KanbanTaskCard task={task} />
                    </div>
                ))
            )}

            <style>
                {`
                    .kanban-column h2 {
                        margin-top: 0;
                    }

                    .kanban-empty {
                        opacity: 0.6;
                        font-size: 14px;
                        text-align: center;
                        padding: 30px 10px;
                        animation: fadeIn 0.3s ease;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 0.6; }
                    }
                `}
            </style>
        </div>
    );
}

export default KanbanColumn;