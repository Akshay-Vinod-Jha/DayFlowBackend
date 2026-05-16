const parseDateInput = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

const toIsoDayString = (date) => {
  return new Date(date).toISOString().slice(0, 10);
};

const getMonthBounds = (monthString) => {
  if (!monthString) return null;
  const [year, month] = monthString.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) return null;

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  return { start, end };
};

module.exports = {
  parseDateInput,
  startOfDay,
  endOfDay,
  toIsoDayString,
  getMonthBounds,
};
