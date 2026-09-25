export function importedMessage(count: number) {
  if (count === 0) return "Nada novo por enquanto.";
  if (count === 1) return "1 lançamento novo.";
  return `${count} lançamentos novos.`;
}
