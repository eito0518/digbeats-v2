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
      const trackId = item.id;
      const artistsName = item.artists.map((artist) => artist.name);
      const artistsId = item.artists.map((artist) => artist.id);

      return `trackName: ${trackName},trackId: ${trackId}, artistsName: ${artistsName}, artistsId: ${artistsId}`;
    });

    return res.status(200).json({ tracksInfo });
  })
);

// レコメンドAPI
app.post(
  "/api/recommendations",
  asyncHandler(async (req, res: any) => {
    // 楽曲情報とアクセストークンを取得
    const seedTrackId = req.body.trackId;
    const seedArtistId = req.body.artistId;
    const accessToken = await getToken();

    // TODO: seedTrackId が tracks テーブルに存在しなければ、挿入する

    // TODO: seedTrackId を favorites テーブルに自動追加する（user_id, track_id）

    // レコメンド一覧を取得
    const artistParam = encodeURIComponent(seedArtistId);
    const trackParam = encodeURIComponent(seedTrackId);
    const url = `${SPOTIFY_API_BASE_URL}/recommendations?seed_tracks=${trackParam}`;
    console.log(`デバッグ用！！！！！！！ url: ${url}`); //デバッグ
    const getRecommendationsResult = await axios.get(url, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    const tracks = getRecommendationsResult.data.tracks;
    if (!tracks || tracks.length === 0) {
      return res
        .status(404)
        .json({ message: "おすすめ楽曲が見つかりませんでした" });
    }

    const tracksInfo = tracks.map((track) => {
      const trackName = track.name;
      const artistsName = track.artists.map((artist) => artist.name);
      return `
      trackName: ${trackName}
      artistsName: ${artistsName}
      `;
    });

    // TODO: tracks テーブルに存在しないものは全て tracks テーブルに保存

    // TODO: recommendations テーブルに記録（user_id, seed_track_id, created_at）

    // レコメンド一覧を返す
    return res.status(200).json({ tracksInfo });
  })
);

// エラー処理（一番最後に行う）
app.use(errorHandler);

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
