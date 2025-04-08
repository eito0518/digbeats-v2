import express from "express";
import morgan from "morgan";
import { asyncHandler } from "./midlleware/asyncHandler";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PORT = 3000;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
const SPOTIFY_GET_TOKEN_URL = "https://accounts.spotify.com/api/token";

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_SHARED_SECRET = process.env.LASTFM_SHARED_SECRET;
const LASTFM_API_BASE_URL = "http://ws.audioscrobbler.com/2.0";

const KKBOX_CLIENT_ID = process.env.KKBOX_CLIENT_ID;
const KKBOX_CLIENT_SECRET = process.env.KKBOX_CLIENT_SECRET;
const KKBOX_API_BASE_URL = "https://api.kkbox.com/v1.1";
const KKBOX_GET_TOKEN_URL = "https://account.kkbox.com/oauth2/token";

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

// Spotifyアクセストークン取得関数
async function getSpotifyToken() {
  const response = await axios.post(
    SPOTIFY_GET_TOKEN_URL,
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString(
            "base64"
          ),
      },
    }
  );
  return response.data.access_token;
}

// KKBOXアクセストークン取得関数
async function getKkBoxToken() {
  const response = await axios.post(
    KKBOX_GET_TOKEN_URL,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: KKBOX_CLIENT_ID,
      client_secret: KKBOX_CLIENT_SECRET,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
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
// Spotifyキーワード検索API
app.post(
  "/api/search",
  asyncHandler(async (req, res: any) => {
    // キーワードとSpotifyアクセストークンを取得
    const keyword = req.body.keyword;
    const accessToken = await getSpotifyToken();

    // キーワードで検索
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

// LASTFM検索API
app.post(
  "/api/search/lastfm",
  asyncHandler(async (req, res: any) => {
    // 楽曲名とアーティスト名を取得
    const trackName = req.body.trackName;
    const artistName = req.body.artistName;

    // 楽曲名・アーティスト名で検索
    const searchResult = await axios.get(
      `${LASTFM_API_BASE_URL}/?method=track.search&track=${encodeURIComponent(
        trackName
      )}&artist=${encodeURIComponent(artistName)}&api_key=${encodeURIComponent(
        LASTFM_API_KEY
      )}&format=json`
    );

    const trackmatches = searchResult.data.results.trackmatches;
    if (!trackmatches || trackmatches.length === 0) {
      return res.status(404).json({ message: "曲が見つかりませんでした" });
    }

    return res.status(200).json({ trackmatches });
  })
);

// KKBOXキーワード検索API
app.post(
  "/api/search/kkbox",
  asyncHandler(async (req, res: any) => {
    // キーワードとKKBOXアクセストークンを取得
    const keyword = req.body.keyword;
    const accessToken = await getKkBoxToken();

    // キーワードで検索
    const searchResult = await axios.get(
      `${KKBOX_API_BASE_URL}/search?q=${encodeURIComponent(
        keyword
      )}&type=track&territory=JP&limit=5`,
      {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = searchResult.data.tracks.data;
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "曲が見つかりませんでした" });
    }

    const tracksInfo = data.map((data) => {
      const trackName = data.name;
      const trackId = data.id;
      const trackUrl = data.url;

      return `trackName: ${trackName},trackId: ${trackId}, trackUrl: ${trackUrl}`;
    });

    return res.status(200).json({ tracksInfo });
  })
);

// LASTFMレコメンドAPI
app.post(
  "/api/recommendations/lastfm",
  asyncHandler(async (req, res: any) => {
    // 楽曲名・アーティスト名を取得
    const seedTrackName = req.body.trackName;
    const seedArtistName = req.body.artistName;

    // 類似楽曲一覧を取得
    const getSimilarResult = await axios.get(
      `${LASTFM_API_BASE_URL}/?method=track.getsimilar&track=${encodeURIComponent(
        seedTrackName
      )}&artist=${encodeURIComponent(
        seedArtistName
      )}&api_key=${encodeURIComponent(LASTFM_API_KEY)}&format=json`
    );

    const similarTracks = getSimilarResult.data.similartracks.track;
    if (!similarTracks || similarTracks.length === 0) {
      return res
        .status(404)
        .json({ message: "類似楽曲が見つかりませんでした" });
    }

    // レコメンド一覧を返す
    return res.status(200).json({ similarTracks });
  })
);

// KKBOXレコメンドAPI
app.post(
  "/api/recommendations/kkbox",
  asyncHandler(async (req, res: any) => {
    // トラックIdを取得
    const seedTrackId = req.body.trackId;
    // KKBOXアクセストークンを取得
    const accessToken = await getKkBoxToken();

    // レコメンド一覧を取得
    const getRecommendedResult = await axios.get(
      `${KKBOX_API_BASE_URL}/tracks/${seedTrackId}/recommended-tracks?territory=JP&limit=10`,
      {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const recommendedTracks = getRecommendedResult.data.tracks.data;
    if (!recommendedTracks || recommendedTracks.length === 0) {
      return res
        .status(404)
        .json({ message: "類似楽曲が見つかりませんでした" });
    }

    // レコメンド一覧を返す
    return res.status(200).json({ recommendedTracks });
  })
);

// エラー処理（一番最後に行う）
app.use(errorHandler);

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
