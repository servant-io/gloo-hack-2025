export const publisherIdByUserId: Record<string, string> = {
  '1': 'e1d05990811c',
  '2': 'dffa5eca5ccc',
  '3': '88c7702ddabb',
};

export function resolvePublisherId(userId: string | null | undefined) {
  if (!userId) return null;
  return publisherIdByUserId[userId] ?? null;
}
