import axios from "axios";
import { pool } from "../lib/pg";
import { TracksRecord } from "./tracksRecord";
import { RecommendationRecord } from "./recommendationRecord";

export class RecommendationGataway {
  async getSeedIdByKeyword(keyword: string): Promise<TracksRecord> {
    // SpotifyAPIにリクエスト
    const getResult = await axios.get("", {});
    // 型をtracksRecord変換
    return new TracksRecord(
      getResult["track_name"],
      getResult["artist_name"],
      getResult["preview_url"],
      getResult["album_image"],
      getResult["artist_image"], // artistから取得
      getResult["track_id"],
      getResult["created_at"] // Date now
    );
  }
}
