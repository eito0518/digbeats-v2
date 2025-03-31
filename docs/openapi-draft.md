# API 設計メモ

## ユースケース

・Spotify でログインする
・楽曲を入力して、レコメンドを取得する
・レコメンド結果画面で、楽曲をお気に入り登録する
・レコメンド履歴を閲覧する
・お気に入り一覧を閲覧する

## ユースケースを操作に分解

### 1. Spotify でログインする

- ユーザーがログインボタンを押すと、Spotify 認証画面に遷移する
- 認証後、Spotify が digbeats にリダイレクトし、code を付与する
- サーバーが code を使って access_token を取得する
- 新規ログインなら users テーブルに登録、既存ならセッションのみ発行
- セッション ID を Cookie に格納して返す

### 2. 楽曲を入力して、レコメンドを取得する

- ユーザーが楽曲名を入力（正確でなくても大丈夫）
- サーバーが Spotify_API_SearchForItem で検索して、seed_track_id を取得
- 該当の曲が tracks テーブルに存在しなければ、挿入する
- seed_track を favorites テーブルに自動追加する（user_id, track_id）
- seed_track_id で Spotify_API_GetRecommendation を叩く
- レコメンド曲一覧を取得し、tracks テーブルに存在しないものは全て tracks テーブルに保存
- recommendations テーブルに記録（user_id, seed_track_id, created_at）
- レスポンスとしてレコメンド曲一覧を返す

### 3. レコメンド結果画面で、楽曲をお気に入り登録する

- ユーザーがレコメンドされた楽曲から選びお気に入りに追加
- サーバーが favorites テーブルに保存

### 4. レコメンド履歴を閲覧する

- ユーザーの recommendations を取得（ユーザー ID で絞る）
- recommendation_tracks を JOIN して、レスポンスとして楽曲の詳細情報を返す
- レコメンド履歴でもお気に入り登録・削除できるようにする

### 5. お気に入り一覧を閲覧する

- ユーザーの favorites を取得（ユーザー ID で絞る）
- tracks を JOIN して、レスポンスとして楽曲の詳細情報（artist_name, preview_url, album_image など）を返す
- お気に入り一覧でもお気に入り登録・削除できるようにする

## API 設計

### 楽曲名でレコメンドを取得する

GET /api/recommendations

リクエストボディ

```json
// 日本語の可能性もあるのでボディに含める
{
  "track_name": "夜に駆ける"
}
```

レスポンスボディ

```json
{
  "seed_track_name": "シード曲の正式な楽曲名",
  "recommendedTracks": [
    {
      "track_name": "楽曲名",
      "artist_name": "アーティスト名",
      "preview_url": "プレビュー音源URL",
      "album_image": "アルバム画像",
      "artist_image": "アーティスト画像"
    }
  ]
}
```

### 楽曲をお気に入りに登録・削除する

POST /api/favorites/{track_id}

DELETE /api/favorites/{track_id}

### レコメンド履歴を取得する

GET /api/recommendations/history

レスポンスボディ

```json
[
  {
    "track_name": "楽曲名",
    "artist_name": "アーティスト名",
    "preview_url": "プレビュー音源URL",
    "album_image": "アルバム画像",
    "artist_image": "アーティスト画像",
    "isLiked": "boolean"
  }
]
```

### お気に入り一覧を取得する

GET /api/favorites

````json
レスポンスボディ

```json
[
  {
    "track_name": "楽曲名",
    "artist_name": "アーティスト名",
    "preview_url": "プレビュー音源URL",
    "album_image": "アルバム画像",
    "artist_image": "アーティスト画像",
    "isLiked": "boolean"
  }
]
````
