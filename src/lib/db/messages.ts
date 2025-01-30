import { getDb } from './core';

export const getMessages = async (matchId: number) => {
  const db = await getDb();
  const result = db.exec(
    `SELECT * FROM messages 
     WHERE match_id = ? 
     ORDER BY timestamp DESC 
     LIMIT 50`,
    [matchId]
  );

  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map((row: any[]) => {
    const message: any = {};
    columns.forEach((col, i) => {
      message[col] = row[i];
    });
    return message;
  });
};

export const sendMessage = async ({
  matchId,
  senderId,
  content
}: {
  matchId: number;
  senderId: number;
  content: string;
}) => {
  const db = await getDb();
  db.run(
    `INSERT INTO messages (match_id, sender_id, content) 
     VALUES (?, ?, ?)`,
    [matchId, senderId, content]
  );

  const result = db.exec(
    "SELECT * FROM messages WHERE match_id = ? ORDER BY id DESC LIMIT 1",
    [matchId]
  );

  if (result.length === 0 || !result[0].values.length) return null;

  const columns = result[0].columns;
  const row = result[0].values[0];
  const message: any = {};
  columns.forEach((col, i) => {
    message[col] = row[i];
  });
  return message;
};