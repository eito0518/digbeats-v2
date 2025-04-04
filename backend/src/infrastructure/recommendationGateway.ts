import { pool } from "../lib/pg";
import { RecommendationRecord } from "./recommendationRecord";

export class RecommendationGataway {
  async insert(userId: number, seedTrackId: string, createdAt: Date) {
    const result = await pool.query(
      "INSERT INTO recommendations (user_id, seed_track_id, created_at) VALUES ($, $, $)",
      [userId, seedTrackId, createdAt]
    );
  }
}
