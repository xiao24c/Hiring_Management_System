export const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  return date.toLocaleDateString();
};

export const formatPhone = (value) => {
  if (!value) return "--";
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return value;
};
