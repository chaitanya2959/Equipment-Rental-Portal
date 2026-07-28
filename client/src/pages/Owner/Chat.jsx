import { useEffect, useMemo, useState } from "react";
import { FaCircle, FaCommentDots, FaMagnifyingGlass, FaPaperPlane } from "react-icons/fa6";
import BackButton from "../../components/Common/BackButton";
import { useAuth } from "../../context/AuthContext";
import { appendMessage, getThreads, markThreadRead, subscribeToChatChanges } from "../../services/chatService";

const formatTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CT";

function Chat() {
  const { user } = useAuth();
  const ownerId = user?._id || user?.id || "";
  const [allThreads, setAllThreads] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const syncThreads = () => {
      setAllThreads(getThreads());
    };

    syncThreads();

    const unsubscribe = subscribeToChatChanges(syncThreads);
    return () => unsubscribe();
  }, []);

  const ownerThreads = useMemo(() => {
    const owned = ownerId ? allThreads.filter((thread) => thread.owner?.id === ownerId) : allThreads;
    const query = search.trim().toLowerCase();

    const filtered = owned.filter((thread) => {
      if (!query) return true;

      const haystack = [
        thread.customer?.name,
        thread.equipmentName,
        thread.messages?.map((message) => message.text).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });

    return [...filtered].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [allThreads, ownerId, search]);

  useEffect(() => {
    if (ownerThreads.length === 0) {
      if (activeId) setActiveId("");
      return;
    }

    if (!activeId || !ownerThreads.some((thread) => thread.id === activeId)) {
      setActiveId(ownerThreads[0].id);
    }
  }, [activeId, ownerThreads]);

  const activeThread = useMemo(
    () => ownerThreads.find((thread) => thread.id === activeId) || null,
    [activeId, ownerThreads],
  );

  useEffect(() => {
    if (!activeThread) return;

    const updated = markThreadRead(activeThread.id, "owner");
    if (!updated) return;

    setAllThreads((current) => current.map((thread) => (thread.id === updated.id ? updated : thread)));
  }, [activeThread?.id]);

  const unreadCount = useMemo(
    () => ownerThreads.reduce((sum, thread) => sum + Number(thread.unreadByOwner || 0), 0),
    [ownerThreads],
  );

  const handleSelect = (thread) => {
    setActiveId(thread.id);
    const updated = markThreadRead(thread.id, "owner");
    if (updated) {
      setAllThreads((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    }
  };

  const handleSend = (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || !activeThread) return;

    const updated = appendMessage({
      equipment: {
        _id: activeThread.equipmentId,
        name: activeThread.equipmentName,
        images: activeThread.equipmentImage ? [activeThread.equipmentImage] : [],
      },
      customer: activeThread.customer,
      owner: activeThread.owner,
      sender: "owner",
      text: message,
    });

    if (updated) {
      setAllThreads((current) => current.map((thread) => (thread.id === updated.id ? updated : thread)));
      setActiveId(updated.id);
    }

    setDraft("");
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton label="Back" />
          <div>
            <p className="text-uppercase small fw-semibold text-primary mb-2 mb-lg-1">Owner chat</p>
            <h2 className="fw-bold mb-0">Conversations</h2>
          </div>
        </div>
        <span className="badge bg-primary-subtle text-primary px-3 py-2">{unreadCount} unread</span>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="row g-0">
          <div className="col-12 col-lg-4 border-end">
            <div className="p-3 border-bottom">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaMagnifyingGlass />
                </span>
                <input
                  className="form-control border-start-0"
                  placeholder="Search conversations"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="chat-thread-list">
              {ownerThreads.length > 0 ? (
                ownerThreads.map((thread) => (
                  <button
                    className={`chat-thread-item ${thread.id === activeThread?.id ? "active" : ""}`}
                    key={thread.id}
                    type="button"
                    onClick={() => handleSelect(thread)}
                  >
                    <div className="chat-thread-avatar">{getInitials(thread.customer?.name)}</div>
                    <div className="flex-grow-1 min-w-0 text-start">
                      <div className="d-flex justify-content-between gap-2">
                        <strong className="text-truncate">{thread.customer?.name || "Customer"}</strong>
                        {thread.unreadByOwner > 0 ? <span className="badge bg-danger">{thread.unreadByOwner}</span> : null}
                      </div>
                      <div className="text-muted small text-truncate">{thread.equipmentName || "Equipment"}</div>
                      <div className="text-muted small">{formatTime(thread.updatedAt)}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="chat-empty-state m-3">
                  <FaCommentDots className="chat-empty-icon" />
                  <h4 className="fw-bold mb-2">No conversations yet</h4>
                  <p className="text-muted mb-0">
                    Customer messages will appear here after they contact you from an equipment details page.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-8">
            {activeThread ? (
              <div className="chat-pane">
                <div className="chat-pane-header">
                  <div className="d-flex align-items-center gap-3">
                    <div className="chat-thread-avatar">{getInitials(activeThread.customer?.name)}</div>
                    <div>
                      <h5 className="mb-1 fw-bold">{activeThread.customer?.name || "Customer"}</h5>
                      <div className="text-muted small">{activeThread.equipmentName || "Equipment"}</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <FaCircle className="text-success" />
                    Active
                  </div>
                </div>

                <div className="chat-message-list">
                  {activeThread.messages.map((message) => (
                    <div className={`chat-message-row ${message.sender === "owner" ? "is-owned" : ""}`} key={message.id}>
                      <div className="chat-message-bubble">
                        <div>{message.text}</div>
                        <div className="chat-message-time">{formatTime(message.time)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <form className="chat-compose" onSubmit={handleSend}>
                  <textarea
                    className="form-control chat-compose-input"
                    placeholder="Type a reply..."
                    rows="2"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                  />
                  <button className="btn btn-primary rounded-pill px-4" type="submit" disabled={!draft.trim()}>
                    <FaPaperPlane className="me-2" />
                    Send
                  </button>
                </form>
              </div>
            ) : (
              <div className="chat-empty-state">
                <FaCommentDots className="chat-empty-icon" />
                <h4 className="fw-bold mb-2">Select a conversation</h4>
                <p className="text-muted mb-0">Choose a customer thread to view and reply to messages.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
