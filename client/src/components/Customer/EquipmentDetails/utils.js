import api from "../../../services/api";

export const apiBaseUrl = (() => {
  const base = api.defaults.baseURL || "http://localhost:5000/api";
  return base.replace(/\/api\/?$/, "");
})();

export const resolveImageUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  return `${apiBaseUrl}/uploads/${value}`;
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(value || 0));

export const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatMemberSince = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const buildEquipmentSpecifications = (equipment) => {
  if (!equipment) return [];

  const rows = [
    { label: "Category", value: equipment.category },
    { label: "Brand", value: equipment.brand },
    { label: "Model number", value: equipment.modelNumber },
    { label: "Condition", value: equipment.condition },
    { label: "Location", value: equipment.location },
    { label: "Quantity", value: equipment.quantity },
    { label: "Availability", value: equipment.status || (equipment.available ? "Available" : "Unavailable") },
    { label: "Price per day", value: equipment.pricePerDay != null ? formatCurrency(equipment.pricePerDay) : "" },
    { label: "Deposit", value: equipment.deposit != null ? formatCurrency(equipment.deposit) : "" },
    { label: "Average rating", value: equipment.averageRating != null ? `${Number(equipment.averageRating).toFixed(1)}/5` : "" },
    { label: "Total reviews", value: equipment.totalReviews != null ? String(equipment.totalReviews) : "" },
  ];

  return rows.filter((row) => row.value !== "" && row.value !== null && row.value !== undefined);
};
