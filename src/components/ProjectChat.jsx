import {
    useEffect,
    useRef,
    useState,
} from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import {
    getProjectChatMessages,
    getProjectChatUnreadCount,
    markProjectChatRead,
    sendProjectChatMessage,
    uploadProjectChatFile,
    deleteProjectChatMessage,
    deleteProjectChatAttachment,
} from "../services/chatService";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:5000";

function ProjectChat({
    projectId,
    projectName,
    currentUser,
}) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [firstUnreadId, setFirstUnreadId] = useState(null);
    const [draft, setDraft] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const socketRef = useRef(null);
    const openRef = useRef(false);
    const fileInputRef = useRef(null);
    const firstUnreadRef = useRef(null);
    const bottomRef = useRef(null);

    const currentUserId =
        currentUser?._id ||
        currentUser?.id ||
        "";

    const appendMessage = (incoming) => {
        if (!incoming?._id) {
            return;
        }

        setMessages((prev) => {
            const exists = prev.some(
                (item) =>
                    String(item._id) ===
                    String(incoming._id)
            );

            if (exists) {
                return prev;
            }

            return [...prev, incoming];
        });
    };

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        });
    };

    const loadUnreadCount = async () => {
        if (!projectId) {
            setUnreadCount(0);
            return;
        }

        try {
            const res =
                await getProjectChatUnreadCount(
                    projectId
                );

            setUnreadCount(
                res.data.unreadCount || 0
            );
        } catch (error) {
            console.log(
                "Failed to load chat unread count:",
                error.response?.data ||
                    error.message
            );
        }
    };

    const markRead = async () => {
        if (!projectId) {
            return;
        }

        try {
            await markProjectChatRead(projectId);
            setUnreadCount(0);
        } catch (error) {
            console.log(
                "Failed to mark chat as read:",
                error.response?.data ||
                    error.message
            );
        }
    };

    const loadMessages = async () => {
        if (!projectId) {
            return;
        }

        setLoading(true);

        try {
            const res =
                await getProjectChatMessages(
                    projectId
                );

            setMessages(
                res.data.messages || []
            );

            setFirstUnreadId(
                res.data.firstUnreadMessageId ||
                    null
            );

            setUnreadCount(
                res.data.unreadCount || 0
            );
        } catch (error) {
            console.log(
                error.response?.data ||
                    error.message
            );

            toast.error(
                error.response?.data?.message ||
                    "Failed to load team chat"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        openRef.current = open;
    }, [open]);

    useEffect(() => {
        setOpen(false);
        setMessages([]);
        setUnreadCount(0);
        setFirstUnreadId(null);
        setDraft("");
        setSelectedFile(null);

        if (projectId) {
            loadUnreadCount();
        }
    }, [projectId]);

    useEffect(() => {
        if (!projectId) {
            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {
            return;
        }

        const socket = io(SOCKET_URL, {
            auth: {
                token,
            },
            transports: [
                "websocket",
                "polling",
            ],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit(
                "chat:join-project",
                projectId
            );
        });

        socket.on(
            "chat:new-message",
            async (incoming) => {
                if (
                    String(incoming?.project) !==
                    String(projectId)
                ) {
                    return;
                }

                appendMessage(incoming);

                const senderId =
                    incoming?.sender?._id ||
                    incoming?.sender ||
                    "";

                const isOwnMessage =
                    currentUserId &&
                    String(senderId) ===
                        String(currentUserId);

                if (isOwnMessage) {
                    return;
                }

                if (openRef.current) {
                    await markRead();
                } else {
                    setUnreadCount(
                        (prev) => prev + 1
                    );
                }
            }
        );

        socket.on(
            "chat:message-updated",
            async (updatedMessage) => {
                if (
                    String(updatedMessage?.project) !==
                    String(projectId)
                ) {
                    return;
                }

                setMessages((prev) =>
                    prev.map((item) =>
                        String(item._id) ===
                        String(updatedMessage._id)
                            ? updatedMessage
                            : item
                    )
                );

                await loadUnreadCount();
            }
        );

        socket.on(
            "chat:message-deleted",
            async (payload) => {
                if (
                    String(payload?.projectId) !==
                    String(projectId)
                ) {
                    return;
                }

                setMessages((prev) =>
                    prev.filter(
                        (item) =>
                            String(item._id) !==
                            String(payload.messageId)
                    )
                );

                setFirstUnreadId((prev) =>
                    String(prev || "") ===
                    String(payload.messageId)
                        ? null
                        : prev
                );

                await loadUnreadCount();
            }
        );

        socket.on("chat:error", (payload) => {
            if (payload?.message) {
                toast.error(payload.message);
            }
        });

        socket.on("connect_error", (error) => {
            console.log(
                "Chat socket connection error:",
                error.message
            );
        });

        return () => {
            socket.emit(
                "chat:leave-project",
                projectId
            );
            socket.disconnect();
            socketRef.current = null;
        };
    }, [projectId, currentUserId]);

    useEffect(() => {
        if (!open || loading) {
            return;
        }

        const timer = setTimeout(() => {
            if (
                firstUnreadId &&
                firstUnreadRef.current
            ) {
                firstUnreadRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            } else {
                bottomRef.current?.scrollIntoView({
                    block: "end",
                });
            }

            markRead();
        }, 60);

        return () => clearTimeout(timer);
    }, [open, loading, firstUnreadId]);

    const handleOpen = async () => {
        setOpen(true);
        await loadMessages();
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSend = async () => {
        const text = draft.trim();

        if (!text && !selectedFile) {
            return;
        }

        setSending(true);

        try {
            let res;

            if (selectedFile) {
                res = await uploadProjectChatFile(
                    projectId,
                    selectedFile,
                    text
                );
            } else {
                res = await sendProjectChatMessage(
                    projectId,
                    text
                );
            }

            const sentMessage =
                res.data.chatMessage;

            appendMessage(sentMessage);

            setDraft("");
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await markRead();
            scrollToBottom();
        } catch (error) {
            console.log(
                error.response?.data ||
                    error.message
            );

            toast.error(
                error.response?.data?.message ||
                    "Failed to send message"
            );
        } finally {
            setSending(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        const confirmed = window.confirm(
            "Delete this message? This cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteProjectChatMessage(
                projectId,
                messageId
            );

            setMessages((prev) =>
                prev.filter(
                    (item) =>
                        String(item._id) !==
                        String(messageId)
                )
            );

            setFirstUnreadId((prev) =>
                String(prev || "") ===
                String(messageId)
                    ? null
                    : prev
            );

            await loadUnreadCount();
        } catch (error) {
            console.log(
                error.response?.data ||
                    error.message
            );

            toast.error(
                error.response?.data?.message ||
                    "Failed to delete message"
            );
        }
    };

    const handleDeleteAttachment = async (messageId) => {
        const confirmed = window.confirm(
            "Remove this attachment? This cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            const res =
                await deleteProjectChatAttachment(
                    projectId,
                    messageId
                );

            if (res.data.deletedMessage) {
                setMessages((prev) =>
                    prev.filter(
                        (item) =>
                            String(item._id) !==
                            String(messageId)
                    )
                );
            } else if (res.data.chatMessage) {
                setMessages((prev) =>
                    prev.map((item) =>
                        String(item._id) ===
                        String(messageId)
                            ? res.data.chatMessage
                            : item
                    )
                );
            }

            await loadUnreadCount();
        } catch (error) {
            console.log(
                error.response?.data ||
                    error.message
            );

            toast.error(
                error.response?.data?.message ||
                    "Failed to remove attachment"
            );
        }
    };

    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            handleSend();
        }
    };

    const getSenderId = (message) => {
        return (
            message?.sender?._id ||
            message?.sender ||
            ""
        );
    };

    const formatTime = (value) => {
        if (!value) {
            return "";
        }

        return new Date(value).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const getFileUrl = (attachment) => {
        return `${SOCKET_URL}${
            attachment?.url || ""
        }`;
    };

    const formatFileSize = (size) => {
        if (!size) {
            return "";
        }

        if (size < 1024) {
            return `${size} B`;
        }

        if (size < 1024 * 1024) {
            return `${(
                size / 1024
            ).toFixed(1)} KB`;
        }

        return `${(
            size /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    };

    if (!projectId) {
        return null;
    }

    const styles = `
        .project-chat-launcher {
            position: fixed;
            right: 24px;
            bottom: 24px;
            width: 58px;
            height: 58px;
            border: none;
            border-radius: 50%;
            background: #3b82f6;
            color: #ffffff;
            font-size: 25px;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
            z-index: 1800;
            transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .project-chat-launcher:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
        }

        .project-chat-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            min-width: 22px;
            height: 22px;
            padding: 0 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            border-radius: 999px;
            background: #dc2626;
            color: #ffffff;
            border: 2px solid var(--card-bg);
            font-size: 11px;
            font-weight: 800;
        }

        .project-chat-panel {
            position: fixed;
            right: 24px;
            bottom: 94px;
            width: 390px;
            max-width: calc(100vw - 32px);
            height: 530px;
            max-height: calc(100vh - 130px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
            z-index: 1799;
        }

        .project-chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 15px;
            border-bottom: 1px solid var(--border-color);
            background: var(--card-bg);
        }

        .project-chat-title-wrap {
            min-width: 0;
        }

        .project-chat-title {
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 14px;
            font-weight: 750;
        }

        .project-chat-subtitle {
            margin-top: 3px;
            font-size: 11.5px;
            opacity: 0.6;
        }

        .project-chat-close {
            width: 34px;
            height: 34px;
            flex-shrink: 0;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: var(--text-color);
            cursor: pointer;
            font-size: 18px;
        }

        .project-chat-close:hover {
            background: var(--section-bg, rgba(0,0,0,0.05));
        }

        .project-chat-messages {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            padding: 14px;
            background: var(--section-bg, var(--card-bg));
            scroll-behavior: smooth;
        }

        .project-chat-loading,
        .project-chat-empty {
            min-height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 24px;
            box-sizing: border-box;
            font-size: 13px;
            opacity: 0.65;
        }

        .project-chat-message-row {
            display: flex;
            margin-bottom: 10px;
        }

        .project-chat-message-row.mine {
            justify-content: flex-end;
        }

        .project-chat-message {
            width: fit-content;
            max-width: 82%;
            padding: 9px 11px;
            border-radius: 12px 12px 12px 4px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            box-shadow: 0 1px 2px var(--shadow-color);
            overflow-wrap: anywhere;
        }

        .project-chat-message-row.mine .project-chat-message {
            border-radius: 12px 12px 4px 12px;
            background: rgba(59, 130, 246, 0.11);
            border-color: rgba(59, 130, 246, 0.24);
        }

        .project-chat-sender {
            margin-bottom: 4px;
            font-size: 11px;
            font-weight: 750;
            color: #3b82f6;
        }

        .project-chat-message-row.mine .project-chat-sender {
            text-align: right;
        }

        .project-chat-text {
            margin: 0;
            white-space: pre-wrap;
            font-size: 13px;
            line-height: 1.42;
        }

        .project-chat-time {
            margin-top: 5px;
            text-align: right;
            font-size: 10px;
            opacity: 0.52;
        }

        .project-chat-message-actions {
            display: flex;
            justify-content: flex-end;
            gap: 6px;
            margin-top: 6px;
        }

        .project-chat-message-action {
            padding: 3px 7px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background: transparent;
            color: var(--muted-text);
            cursor: pointer;
            font-size: 10px;
            font-weight: 650;
        }

        .project-chat-message-action:hover {
            color: #dc2626;
            border-color: rgba(220, 38, 38, 0.4);
            background: rgba(220, 38, 38, 0.06);
        }

        .project-chat-file {
            display: block;
            margin-top: 7px;
            padding: 8px 9px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--card-bg);
            color: var(--link-color, #3b82f6);
            text-decoration: none;
            font-size: 12px;
            font-weight: 650;
        }

        .project-chat-file small {
            display: block;
            margin-top: 3px;
            color: var(--muted-text);
            font-weight: 500;
        }

        .project-chat-image {
            display: block;
            width: 100%;
            max-height: 180px;
            object-fit: cover;
            margin-top: 7px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .project-chat-unread-divider {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 8px 0 14px;
            color: #3b82f6;
            font-size: 11px;
            font-weight: 750;
        }

        .project-chat-unread-divider::before,
        .project-chat-unread-divider::after {
            content: "";
            height: 1px;
            flex: 1;
            background: rgba(59, 130, 246, 0.35);
        }

        .project-chat-selected-file {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 8px 12px;
            border-top: 1px solid var(--border-color);
            background: var(--card-bg);
            font-size: 11.5px;
        }

        .project-chat-selected-file-name {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .project-chat-remove-file {
            flex-shrink: 0;
            border: none;
            background: transparent;
            color: #dc2626;
            cursor: pointer;
            font-size: 13px;
            font-weight: 700;
        }

        .project-chat-compose {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            padding: 10px;
            border-top: 1px solid var(--border-color);
            background: var(--card-bg);
        }

        .project-chat-attach,
        .project-chat-send {
            width: 38px;
            height: 38px;
            flex-shrink: 0;
            border: 1px solid var(--border-color);
            border-radius: 9px;
            background: var(--card-bg);
            color: var(--text-color);
            cursor: pointer;
            font-size: 16px;
        }

        .project-chat-send {
            border-color: #3b82f6;
            background: #3b82f6;
            color: #ffffff;
        }

        .project-chat-send:disabled,
        .project-chat-attach:disabled {
            opacity: 0.55;
            cursor: not-allowed;
        }

        .project-chat-input {
            flex: 1;
            min-width: 0;
            max-height: 92px;
            resize: none;
            box-sizing: border-box;
            padding: 9px 11px;
            background: var(--section-bg, var(--card-bg));
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 9px;
            outline: none;
            font-family: inherit;
            font-size: 13px;
            line-height: 1.35;
        }

        .project-chat-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }

        @media (max-width: 600px) {
            .project-chat-launcher {
                right: 14px;
                bottom: 14px;
            }

            .project-chat-panel {
                right: 12px;
                bottom: 84px;
                width: calc(100vw - 24px);
                height: 520px;
                max-height: calc(100vh - 110px);
            }
        }
    `;

    return (
        <>
            <style>{styles}</style>

            {!open && (
                <button
                    type="button"
                    className="project-chat-launcher"
                    onClick={handleOpen}
                    title={`${projectName || "Project"} team chat`}
                    aria-label="Open project team chat"
                >
                    💬

                    {unreadCount > 0 && (
                        <span className="project-chat-badge">
                            {unreadCount > 99
                                ? "99+"
                                : unreadCount}
                        </span>
                    )}
                </button>
            )}

            {open && (
                <div className="project-chat-panel">
                    <div className="project-chat-header">
                        <div className="project-chat-title-wrap">
                            <h3 className="project-chat-title">
                                💬 {projectName || "Project"} Team Chat
                            </h3>

                            <div className="project-chat-subtitle">
                                Project members only
                            </div>
                        </div>

                        <button
                            type="button"
                            className="project-chat-close"
                            onClick={handleClose}
                            aria-label="Close team chat"
                        >
                            ×
                        </button>
                    </div>

                    <div className="project-chat-messages">
                        {loading ? (
                            <div className="project-chat-loading">
                                Loading messages...
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="project-chat-empty">
                                No messages yet. Start the team conversation.
                            </div>
                        ) : (
                            messages.map((message) => {
                                const senderId =
                                    getSenderId(message);

                                const mine =
                                    currentUserId &&
                                    String(senderId) ===
                                        String(currentUserId);

                                const canDelete =
                                    mine ||
                                    currentUser?.role ===
                                        "admin";

                                const isFirstUnread =
                                    firstUnreadId &&
                                    String(message._id) ===
                                        String(firstUnreadId);

                                const isImage =
                                    message.attachment?.mimetype
                                        ?.startsWith("image/");

                                return (
                                    <div key={message._id}>
                                        {isFirstUnread && (
                                            <div
                                                ref={firstUnreadRef}
                                                className="project-chat-unread-divider"
                                            >
                                                Unread messages
                                            </div>
                                        )}

                                        <div
                                            className={`project-chat-message-row ${
                                                mine ? "mine" : ""
                                            }`}
                                        >
                                            <div className="project-chat-message">
                                                <div className="project-chat-sender">
                                                    {mine
                                                        ? "You"
                                                        : message.sender?.name ||
                                                          "Team member"}
                                                </div>

                                                {message.text && (
                                                    <p className="project-chat-text">
                                                        {message.text}
                                                    </p>
                                                )}

                                                {message.attachment && (
                                                    <>
                                                        {isImage && (
                                                            <a
                                                                href={getFileUrl(
                                                                    message.attachment
                                                                )}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <img
                                                                    src={getFileUrl(
                                                                        message.attachment
                                                                    )}
                                                                    alt={
                                                                        message
                                                                            .attachment
                                                                            .originalName ||
                                                                        "Chat attachment"
                                                                    }
                                                                    className="project-chat-image"
                                                                />
                                                            </a>
                                                        )}

                                                        <a
                                                            href={getFileUrl(
                                                                message.attachment
                                                            )}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="project-chat-file"
                                                        >
                                                            📎 {message.attachment.originalName}

                                                            <small>
                                                                {formatFileSize(
                                                                    message
                                                                        .attachment
                                                                        .size
                                                                )}
                                                            </small>
                                                        </a>
                                                    </>
                                                )}

                                                <div className="project-chat-time">
                                                    {formatTime(
                                                        message.createdAt
                                                    )}
                                                </div>

                                                {canDelete && (
                                                    <div className="project-chat-message-actions">
                                                        {message.attachment && (
                                                            <button
                                                                type="button"
                                                                className="project-chat-message-action"
                                                                onClick={() =>
                                                                    handleDeleteAttachment(
                                                                        message._id
                                                                    )
                                                                }
                                                                title="Remove attachment"
                                                            >
                                                                Remove file
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className="project-chat-message-action"
                                                            onClick={() =>
                                                                handleDeleteMessage(
                                                                    message._id
                                                                )
                                                            }
                                                            title="Delete message"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {selectedFile && (
                        <div className="project-chat-selected-file">
                            <span className="project-chat-selected-file-name">
                                📎 {selectedFile.name}
                            </span>

                            <button
                                type="button"
                                className="project-chat-remove-file"
                                onClick={() => {
                                    setSelectedFile(null);

                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                    }
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    <div className="project-chat-compose">
                        <input
                            ref={fileInputRef}
                            type="file"
                            style={{ display: "none" }}
                            onChange={(event) =>
                                setSelectedFile(
                                    event.target.files?.[0] ||
                                        null
                                )
                            }
                            accept="image/jpeg,image/png,image/gif,application/pdf,text/plain,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        />

                        <button
                            type="button"
                            className="project-chat-attach"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            disabled={sending}
                            title="Attach file"
                        >
                            📎
                        </button>

                        <textarea
                            rows="1"
                            className="project-chat-input"
                            placeholder="Type a message..."
                            value={draft}
                            onChange={(event) =>
                                setDraft(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            disabled={sending}
                        />

                        <button
                            type="button"
                            className="project-chat-send"
                            onClick={handleSend}
                            disabled={
                                sending ||
                                (!draft.trim() &&
                                    !selectedFile)
                            }
                            title="Send message"
                        >
                            {sending ? "…" : "➤"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProjectChat;
