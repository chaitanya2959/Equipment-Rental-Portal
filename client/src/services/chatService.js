const STORAGE_KEY = "equipment-rental-chat-threads-v1";
const CHAT_EVENT = "equipment-rental-chat-change";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const emitChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHAT_EVENT));
};

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const readThreads = () => {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : [];
  return Array.isArray(parsed) ? parsed : [];
};

const writeThreads = (threads) => {
  if (!canUseStorage()) return threads;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  emitChange();
  return threads;
};

const createId = (prefix = "chat") => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizePerson = (person = {}) => ({
  id: person.id || person._id || "",
  name: person.name || "Unknown",
  email: person.email || "",
});

const normalizeThread = (thread = {}) => ({
  id: thread.id || thread._id || createId("thread"),
  equipmentId: thread.equipmentId || "",
  equipmentName: thread.equipmentName || "Equipment",
  equipmentImage: thread.equipmentImage || "",
  owner: normalizePerson(thread.owner),
  customer: normalizePerson(thread.customer),
  unreadByOwner: Number(thread.unreadByOwner || 0),
  unreadByCustomer: Number(thread.unreadByCustomer || 0),
  updatedAt: thread.updatedAt || new Date().toISOString(),
  messages: Array.isArray(thread.messages)
    ? thread.messages.map((message) => ({
        id: message.id || createId("message"),
        sender: message.sender === "owner" ? "owner" : "customer",
        text: String(message.text || ""),
        time: message.time || new Date().toISOString(),
      }))
    : [],
});

const sortThreads = (threads) =>
  [...threads].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

const getThreads = () => sortThreads(readThreads().map(normalizeThread));

const saveThreads = (threads) => writeThreads(sortThreads(threads.map(normalizeThread)));

const makeThreadKey = (equipmentId, customerId, ownerId) => [equipmentId, customerId, ownerId].filter(Boolean).join(":");

const getThreadByContext = ({ equipment, customer, owner }) => {
  const equipmentId = equipment?._id || equipment?.id || equipment?.equipmentId || "";
  const customerId = customer?._id || customer?.id || "";
  const ownerId = owner?._id || owner?.id || "";
  const key = makeThreadKey(equipmentId, customerId, ownerId);

  return getThreads().find((thread) => thread.id === key) || null;
};

const getOrCreateThread = ({ equipment, customer, owner }) => {
  const equipmentId = equipment?._id || equipment?.id || equipment?.equipmentId || "";
  const customerId = customer?._id || customer?.id || "";
  const ownerId = owner?._id || owner?.id || "";

  if (!equipmentId || !customerId || !ownerId) {
    return null;
  }

  const existing = getThreadByContext({ equipment, customer, owner });
  if (existing) {
    return existing;
  }

  const thread = normalizeThread({
    id: makeThreadKey(equipmentId, customerId, ownerId),
    equipmentId,
    equipmentName: equipment?.name || "Equipment",
    equipmentImage: equipment?.images?.[0] || "",
    owner: normalizePerson(owner),
    customer: normalizePerson(customer),
    unreadByOwner: 0,
    unreadByCustomer: 0,
    updatedAt: new Date().toISOString(),
    messages: [],
  });

  const threads = getThreads();
  threads.push(thread);
  saveThreads(threads);
  return thread;
};

const appendMessage = ({ equipment, customer, owner, sender, text }) => {
  const thread = getOrCreateThread({ equipment, customer, owner });
  if (!thread) return null;

  const message = {
    id: createId("message"),
    sender: sender === "owner" ? "owner" : "customer",
    text: String(text || "").trim(),
    time: new Date().toISOString(),
  };

  if (!message.text) return thread;

  const nextThread = {
    ...thread,
    updatedAt: message.time,
    unreadByOwner: sender === "customer" ? Number(thread.unreadByOwner || 0) + 1 : 0,
    unreadByCustomer: sender === "owner" ? Number(thread.unreadByCustomer || 0) + 1 : 0,
    messages: [...thread.messages, message],
  };

  const threads = getThreads().map((item) => (item.id === nextThread.id ? nextThread : item));
  const existingIndex = threads.findIndex((item) => item.id === nextThread.id);
  if (existingIndex === -1) {
    threads.push(nextThread);
  }

  saveThreads(threads);
  return nextThread;
};

const markThreadRead = (threadId, role) => {
  if (!threadId) return null;

  const threads = getThreads();
  const nextThreads = threads.map((thread) => {
    if (thread.id !== threadId) return thread;
    return {
      ...thread,
      unreadByOwner: role === "owner" ? 0 : thread.unreadByOwner,
      unreadByCustomer: role === "customer" ? 0 : thread.unreadByCustomer,
    };
  });

  const updated = nextThreads.find((thread) => thread.id === threadId) || null;
  saveThreads(nextThreads);
  return updated;
};

const subscribeToChatChanges = (listener) => {
  if (!canUseStorage() || typeof listener !== "function") return () => undefined;

  const handleStorage = (event) => {
    if (event.type === "storage" || event.type === CHAT_EVENT) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHAT_EVENT, handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHAT_EVENT, handleStorage);
  };
};

const getChatEventName = () => CHAT_EVENT;

export {
  appendMessage,
  getChatEventName,
  getOrCreateThread,
  getThreadByContext,
  getThreads,
  markThreadRead,
  saveThreads,
  subscribeToChatChanges,
};
