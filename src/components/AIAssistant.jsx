import {
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useLocation,
} from "react-router-dom";

import {
    AuthContext,
} from "../context/AuthContext";

import {
    sendAIMessage,
} from "../services/aiService";

import {
    createProject,
} from "../services/projectService";

import {
    createTask,
} from "../services/taskService";

import { toast } from "react-toastify";

function AIAssistant() {
    const { user } = useContext(AuthContext);

    const location = useLocation();

    const userId =
        user?._id ||
        user?.id ||
        "anonymous";

    const storageKey =
        `workspace_ai_history_${userId}`;

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [pendingAction, setPendingAction] =
        useState(null);
    const [assistantFlow, setAssistantFlow] =
        useState(null);

    const [suggestions, setSuggestions] =
        useState([
            "How many tasks do I have?",
            "Show my projects",
            "What should I work on first?",
            "Create a task",
        ]);

    const [messages, setMessages] = useState([]);

    const messagesRef = useRef(null);
    const inputRef = useRef(null);
    const loadedUserRef = useRef("");

    useEffect(() => {
        if (!user) {
            return;
        }

        if (
            loadedUserRef.current ===
            String(userId)
        ) {
            return;
        }

        loadedUserRef.current =
            String(userId);

        let nextMessages = null;

        try {
            const stored =
                localStorage.getItem(
                    storageKey
                );

            if (stored) {
                const parsed =
                    JSON.parse(stored);

                if (
                    Array.isArray(parsed) &&
                    parsed.length > 0
                ) {
                    nextMessages =
                        parsed;
                }
            }
        } catch {
            // Ignore invalid local history.
        }

        setMessages(
            nextMessages || [
                {
                    id: "welcome",
                    role: "assistant",
                    content:
                        `Hello${
                            user?.name
                                ? ` ${user.name}`
                                : ""
                        }. I’m your Smart Work Assistant. I can help you review projects, tasks, deadlines, priorities, team members, and prepare new projects or tasks. Choose a suggested question above or type your own request.`,
                },
            ]
        );

        setPendingAction(null);
        setAssistantFlow(null);
    }, [
        user,
        userId,
        storageKey,
    ]);

    useEffect(() => {
        if (
            !user ||
            loadedUserRef.current !==
                String(userId)
        ) {
            return;
        }

        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify(
                    messages.slice(-40)
                )
            );
        } catch {
            // Ignore localStorage failures.
        }
    }, [
        messages,
        storageKey,
        user,
        userId,
    ]);

    useEffect(() => {
        if (!open) {
            return;
        }

        requestAnimationFrame(() => {
            messagesRef.current?.scrollTo({
                top:
                    messagesRef.current
                        .scrollHeight,
                behavior: "smooth",
            });

            inputRef.current?.focus();
        });
    }, [open, messages, pendingAction]);

    const pageLabel = useMemo(() => {
        const map = {
            "/dashboard": "Dashboard",
            "/projects": "Projects",
            "/tasks": "Tasks",
            "/kanban": "Kanban",
            "/profile": "Profile",
            "/users": "User Management",
        };

        return (
            map[location.pathname] ||
            location.pathname
        );
    }, [location.pathname]);

    const appendMessage = (
        role,
        content
    ) => {
        setMessages((prev) => [
            ...prev,
            {
                id:
                    `${Date.now()}-${Math.random()}`,
                role,
                content,
            },
        ]);
    };

    const handleSend = async (
        overrideMessage,
        {
            resetFlow = false,
        } = {}
    ) => {
        const text =
            String(
                overrideMessage ?? input
            ).trim();

        if (!text || loading) {
            return;
        }

        const historyForServer =
            messages
                .filter(
                    (message) =>
                        ["user", "assistant"].includes(
                            message.role
                        )
                )
                .slice(-12)
                .map((message) => ({
                    role: message.role,
                    content:
                        message.content,
                }));

        appendMessage(
            "user",
            text
        );

        setInput("");
        setLoading(true);
        setPendingAction(null);

        try {
            const response =
                await sendAIMessage({
                    message: text,
                    history:
                        historyForServer,
                    pageContext:
                        `${pageLabel} (${location.pathname})`,
                    timezone:
                        Intl.DateTimeFormat()
                            .resolvedOptions()
                            .timeZone,
                    flow:
                        resetFlow
                            ? null
                            : assistantFlow,
                });

            appendMessage(
                "assistant",
                response.data.message
            );

            setPendingAction(
                response.data.action ||
                    null
            );

            setAssistantFlow(
                response.data.flow ||
                    null
            );

            if (
                Array.isArray(
                    response.data
                        .suggestions
                ) &&
                response.data
                    .suggestions
                    .length > 0
            ) {
                setSuggestions(
                    response.data
                        .suggestions
                        .slice(0, 4)
                );
            }
        } catch (error) {
            appendMessage(
                "assistant",
                error.response?.data
                    ?.message ||
                    "I’m temporarily unable to complete that request. Please try again."
            );

            if (
                Array.isArray(
                    error.response?.data
                        ?.suggestions
                )
            ) {
                setSuggestions(
                    error.response.data
                        .suggestions
                        .slice(0, 4)
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const executePendingAction =
        async () => {
            if (
                !pendingAction ||
                loading
            ) {
                return;
            }

            setLoading(true);

            try {
                if (
                    pendingAction.type ===
                    "create_project"
                ) {
                    const response =
                        await createProject(
                            pendingAction.payload
                        );

                    const project =
                        response.data.project;

                    appendMessage(
                        "assistant",
                        `✅ Project "${
                            project?.name ||
                            pendingAction
                                .payload
                                .name
                        }" was created successfully.`
                    );

                    toast.success(
                        "Project created successfully!"
                    );

                    setPendingAction(
                        null
                    );
                    setAssistantFlow(
                        null
                    );

                    setSuggestions([
                        "Show my projects",
                        "How many projects do I have?",
                        "Create a task",
                    ]);

                    return;
                }

                if (
                    pendingAction.type ===
                    "create_task"
                ) {
                    const response =
                        await createTask(
                            pendingAction.payload
                        );

                    const task =
                        response.data.task;

                    appendMessage(
                        "assistant",
                        `✅ Task "${
                            task?.title ||
                            pendingAction
                                .payload
                                .title
                        }" was created successfully.`
                    );

                    toast.success(
                        "Task created successfully!"
                    );

                    setPendingAction(
                        null
                    );
                    setAssistantFlow(
                        null
                    );

                    setSuggestions([
                        "Show my tasks",
                        "What should I work on first?",
                        "Show my overdue tasks",
                    ]);

                    return;
                }

                throw new Error(
                    "Unsupported AI action."
                );
            } catch (error) {
                const message =
                    error.response?.data
                        ?.message ||
                    error.message ||
                    "Action failed.";

                appendMessage(
                    "assistant",
                    `❌ I couldn't complete that action: ${message}`
                );

                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

    const styles = `
        .workspace-ai-root {
            position: fixed;
            left: 22px;
            bottom: 22px;
            z-index: 2500;
            font-family: inherit;
        }

        .workspace-ai-launcher {
            width: 58px;
            height: 58px;
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #3b82f6;
            color: #ffffff;
            cursor: pointer;
            font-size: 25px;
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.24);
            transition:
                transform 0.18s ease,
                box-shadow 0.18s ease;
        }

        .workspace-ai-launcher:hover {
            transform: translateY(-2px) scale(1.03);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
        }

        .workspace-ai-panel {
            width: min(400px, calc(100vw - 28px));
            height: min(610px, calc(100vh - 110px));
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            box-shadow: 0 18px 50px rgba(0, 0, 0, 0.3);
        }

        .workspace-ai-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 15px;
            border-bottom: 1px solid var(--border-color);
            background: var(--card-bg);
        }

        .workspace-ai-header-left {
            min-width: 0;
        }

        .workspace-ai-title {
            margin: 0;
            font-size: 15px;
            font-weight: 800;
        }

        .workspace-ai-page {
            margin-top: 3px;
            font-size: 11.5px;
            color: var(--muted-text);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .workspace-ai-header-actions {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .workspace-ai-icon-button {
            width: 34px;
            height: 34px;
            border: 1px solid var(--border-color);
            border-radius: 9px;
            background: var(--section-bg);
            color: var(--text-color);
            cursor: pointer;
        }

        .workspace-ai-suggestions-wrap {
            border-bottom: 1px solid var(--border-color);
            background: var(--card-bg);
        }

        .workspace-ai-suggestions-label {
            padding: 9px 12px 0;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--muted-text);
        }

        .workspace-ai-quick {
            display: flex;
            gap: 7px;
            padding: 9px 12px;
            overflow-x: auto;
            scrollbar-width: thin;
        }

        .workspace-ai-quick button {
            flex-shrink: 0;
            border: 1px solid var(--border-color);
            border-radius: 999px;
            padding: 7px 10px;
            background: var(--section-bg);
            color: var(--text-color);
            font-size: 11.5px;
            cursor: pointer;
        }

        .workspace-ai-messages {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            padding: 14px;
            background: var(--bg-color);
            scrollbar-width: thin;
        }

        .workspace-ai-message-row {
            display: flex;
            margin-bottom: 11px;
        }

        .workspace-ai-message-row.user {
            justify-content: flex-end;
        }

        .workspace-ai-message {
            max-width: 83%;
            padding: 9px 11px;
            border-radius: 12px;
            font-size: 13px;
            line-height: 1.45;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }

        .workspace-ai-message-row.assistant
        .workspace-ai-message {
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-bottom-left-radius: 4px;
        }

        .workspace-ai-message-row.user
        .workspace-ai-message {
            background: #3b82f6;
            color: white;
            border-bottom-right-radius: 4px;
        }

        .workspace-ai-thinking {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: var(--muted-text);
            font-size: 12px;
            margin-bottom: 12px;
        }

        .workspace-ai-thinking span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
            animation: workspaceAiPulse 1s ease-in-out infinite;
        }

        .workspace-ai-thinking span:nth-child(2) {
            animation-delay: 0.15s;
        }

        .workspace-ai-thinking span:nth-child(3) {
            animation-delay: 0.3s;
        }

        @keyframes workspaceAiPulse {
            0%, 100% {
                opacity: 0.35;
                transform: translateY(0);
            }

            50% {
                opacity: 1;
                transform: translateY(-2px);
            }
        }

        .workspace-ai-action {
            margin: 0 14px 12px;
            padding: 12px;
            border: 1px solid rgba(59, 130, 246, 0.4);
            border-radius: 12px;
            background: rgba(59, 130, 246, 0.08);
        }

        .workspace-ai-action-title {
            font-size: 12.5px;
            font-weight: 800;
            margin-bottom: 4px;
        }

        .workspace-ai-action-summary {
            font-size: 12px;
            color: var(--secondary-text);
            line-height: 1.4;
            overflow-wrap: anywhere;
        }

        .workspace-ai-action-buttons {
            display: flex;
            gap: 8px;
            margin-top: 10px;
        }

        .workspace-ai-action-buttons button {
            flex: 1;
            border-radius: 8px;
            padding: 8px 10px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }

        .workspace-ai-confirm {
            border: none;
            background: #3b82f6;
            color: #ffffff;
        }

        .workspace-ai-cancel {
            border: 1px solid var(--border-color);
            background: var(--card-bg);
            color: var(--text-color);
        }

        .workspace-ai-compose {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            padding: 11px;
            border-top: 1px solid var(--border-color);
            background: var(--card-bg);
        }

        .workspace-ai-compose textarea {
            flex: 1;
            min-width: 0;
            max-height: 100px;
            resize: none;
            box-sizing: border-box;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 10px 11px;
            background: var(--input-bg);
            color: var(--text-color);
            font-family: inherit;
            font-size: 13px;
            outline: none;
        }

        .workspace-ai-compose textarea:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }

        .workspace-ai-send {
            width: 42px;
            height: 42px;
            flex-shrink: 0;
            border: none;
            border-radius: 10px;
            background: #3b82f6;
            color: white;
            cursor: pointer;
            font-size: 17px;
            font-weight: 800;
        }

        .workspace-ai-send:disabled,
        .workspace-ai-action-buttons button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
        }

        @media (max-width: 520px) {
            .workspace-ai-root {
                left: 14px;
                bottom: 14px;
            }

            .workspace-ai-panel {
                width: calc(100vw - 28px);
                height: min(620px, calc(100vh - 90px));
            }
        }
    `;

    if (!user) {
        return null;
    }

    return (
        <>
            <style>{styles}</style>

            <div className="workspace-ai-root">
                {open ? (
                    <div className="workspace-ai-panel">
                        <div className="workspace-ai-header">
                            <div className="workspace-ai-header-left">
                                <h3 className="workspace-ai-title">
                                    ✨ Smart Work Assistant
                                </h3>

                                <div className="workspace-ai-page">
                                    {pageLabel}
                                    {" • "}
                                    {user.name}
                                </div>
                            </div>

                            <div className="workspace-ai-header-actions">
                                <button
                                    type="button"
                                    className="workspace-ai-icon-button"
                                    title="Clear conversation"
                                    onClick={() => {
                                        setMessages([
                                            {
                                                id: `${Date.now()}-welcome`,
                                                role: "assistant",
                                                content:
                                                    `Conversation cleared. How can I help you with your work, ${user.name || "there"}? Choose a suggested question above or type your request.`,
                                            },
                                        ]);

                                        setPendingAction(
                                            null
                                        );
                                        setAssistantFlow(
                                            null
                                        );
                                        setSuggestions([
                                            "How many tasks do I have?",
                                            "Show my projects",
                                            "What should I work on first?",
                                            "Create a task",
                                        ]);
                                    }}
                                >
                                    ↻
                                </button>

                                <button
                                    type="button"
                                    className="workspace-ai-icon-button"
                                    title="Close assistant"
                                    onClick={() =>
                                        setOpen(false)
                                    }
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="workspace-ai-suggestions-wrap">
                            <div className="workspace-ai-suggestions-label">
                                Suggested questions
                            </div>

                            <div className="workspace-ai-quick">
                                {suggestions.map(
                                    (prompt) => (
                                        <button
                                            type="button"
                                            key={prompt}
                                            disabled={
                                                loading
                                            }
                                            onClick={() =>
                                                handleSend(
                                                    prompt,
                                                    {
                                                        resetFlow:
                                                            true,
                                                    }
                                                )
                                            }
                                        >
                                            {prompt}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        <div
                            className="workspace-ai-messages"
                            ref={messagesRef}
                        >
                            {messages.map(
                                (message) => (
                                    <div
                                        key={
                                            message.id
                                        }
                                        className={`workspace-ai-message-row ${message.role}`}
                                    >
                                        <div className="workspace-ai-message">
                                            {
                                                message.content
                                            }
                                        </div>
                                    </div>
                                )
                            )}

                            {loading && (
                                <div className="workspace-ai-thinking">
                                    <span />
                                    <span />
                                    <span />
                                    Assistant is checking
                                </div>
                            )}
                        </div>

                        {pendingAction && (
                            <div className="workspace-ai-action">
                                <div className="workspace-ai-action-title">
                                    {
                                        pendingAction.title
                                    }
                                </div>

                                <div className="workspace-ai-action-summary">
                                    {
                                        pendingAction.summary
                                    }
                                </div>

                                <div className="workspace-ai-action-buttons">
                                    <button
                                        type="button"
                                        className="workspace-ai-cancel"
                                        disabled={
                                            loading
                                        }
                                        onClick={() => {
                                            setPendingAction(
                                                null
                                            );
                                            setAssistantFlow(
                                                null
                                            );

                                            appendMessage(
                                                "assistant",
                                                "Okay — I cancelled that action."
                                            );
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="workspace-ai-confirm"
                                        disabled={
                                            loading
                                        }
                                        onClick={
                                            executePendingAction
                                        }
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}

                        <form
                            className="workspace-ai-compose"
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleSend();
                            }}
                        >
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                placeholder="Ask about your work..."
                                onChange={(event) =>
                                    setInput(
                                        event.target.value
                                    )
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key ===
                                            "Enter" &&
                                        !event.shiftKey
                                    ) {
                                        event.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />

                            <button
                                type="submit"
                                className="workspace-ai-send"
                                disabled={
                                    loading ||
                                    !input.trim()
                                }
                                title="Send"
                            >
                                ➤
                            </button>
                        </form>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="workspace-ai-launcher"
                        onClick={() =>
                            setOpen(true)
                        }
                        title="Open Smart Work Assistant"
                    >
                        ✨
                    </button>
                )}
            </div>
        </>
    );
}

export default AIAssistant;
