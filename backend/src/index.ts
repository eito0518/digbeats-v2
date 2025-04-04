import express from "express";
import morgan from "morgan";
import { asyncHandler } from "./midlleware/asyncHandler";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PORT = 3000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

// エラー処理関数を定義
async function errorHandler(
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  console.error("Unexpected error occurred", err);
  res.status(500).send({
    message: "Unexpected error occurred",
  });
}

// アクセストークン取得関数を定義
async function getToken() {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
    }
  );
  return response.data.access_token;
}

const app = express();

// ミドルウェア
app.use(morgan("dev"));
app.use(express.json());

// 処理
// キーワード検索API
app.post(
  "/api/search",
  asyncHandler(async (req, res: any) => {
    // キーワードとアクセストークンを取得
    const keyword = req.body.keyword;
    const accessToken = await getToken();

    // キーワード検索
    const searchResult = await axios.get(
      `${SPOTIFY_API_BASE_URL}/search?q=${encodeURIComponent(
        keyword
      )}&type=track&limit=5`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );

    const items = searchResult.data.tracks.items;
    if (!items || items.length === 0) {
      return res.status(404).json({ message: "曲が見つかりませんでした" });
    }

    const tracksInfo = items.map((item) => {
      const trackName = item.name;

      const artists = item.artists;
      const artistsName = artists.map((artist) => artist.name);

      return `
      trackName: ${trackName}
      artistsName: ${artistsName}
      `;
    });

    return res.status(200).json({ tracksInfo });
  })
);

// レコメンドAPI
app.post(
  "/api/recommendations",
  asyncHandler(async (req, res: any) => {
    // キーワードとアクセストークンを取得
    const keyword = req.body.seed;
    const accessToken = await getToken();

    // シード曲ID を取得
    const getSeedResult = await axios.get(
      `${SPOTIFY_API_BASE_URL}/search?q=${encodeURIComponent(
        keyword
      )}&type=track&limit=1`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    const items = getSeedResult.data.tracks.items;
    if (!items || items.length === 0) {
      return res.status(404).json({ message: "曲が見つかりませんでした" });
    }
    const seedTrackId = items[0].id;
    const seedArtistId = items[0].artists[0].id;
    console.log("🌱 track ID:", seedTrackId);
    console.log("🎤 artist ID:", seedArtistId);
    console.log(
      "📡 URL:",
      `${SPOTIFY_API_BASE_URL}/recommendations?seed_artists=${seedArtistId}&seed_tracks=${seedTrackId}`
    );

    // TODO: 該当の曲が tracks テーブルに存在しなければ、挿入する

    // TODO: seed_track を favorites テーブルに自動追加する（user_id, track_id）

    // レコメンド曲一覧を取得
    const getRecommendationResult = await axios.get(
      `${SPOTIFY_API_BASE_URL}/recommendations?seed_artists=${seedArtistId}&seed_tracks=${seedTrackId}`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    const tracks = getRecommendationResult.data.tracks;

    // TODO: tracks テーブルに存在しないものは全て tracks テーブルに保存

    // TODO: recommendations テーブルに記録（user_id, seed_track_id, created_at）

    // レコメンド曲一覧を返す
    return res.json({
      tracks: tracks.map((track) => track.name),
    });
  })
);

// エラー処理（一番最後に行う）
app.use(errorHandler);

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
