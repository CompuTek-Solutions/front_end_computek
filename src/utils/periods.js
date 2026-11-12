export const PERIODS = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: 'month', label: 'Ce mois' },
  { value: 'all', label: 'Tout' },
];

const toIso = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const periodParams = (period) => {
  if (period === 'all') return {};
  const today = new Date();
  const from = new Date(today);
  if (period === '7d') from.setDate(today.getDate() - 6);
  else if (period === '30d') from.setDate(today.getDate() - 29);
  else if (period === 'month') from.setDate(1);
  return { date_from: toIso(from), date_to: toIso(today) };
};
