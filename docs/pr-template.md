## PR・コミットメッセージ テンプレート（digbeats-v2 共通）

このテンプレートは、digbeats-v2におけるPR作成・レビューのための統一フォーマットです。**OpenAPIに限らず、DDLや実装など他の変更にも使用できます。**

---

## ✅ コミットメッセージ
```
add: ○○○○（ファイル名や目的を簡潔に）
```
**例**:
```
add: OpenAPI仕様書（openapi.yaml）を作成
```

---

## ✅ PRタイトル
```
add: ○○○○を作成
```
**例**:
```
add: OpenAPI仕様書を作成
```

---

## ✅ PR本文（テンプレート）
```
## 概要  
変更の背景や目的、やったことの概要を簡潔に記述します。

## 主な変更  
- 変更対象ファイルや追加された機能をリストで記述
- エンドポイント、スキーマ、UI変更などがあれば具体的に書く

## 補足  
- 技術的な判断理由、制約、今後の展望などがあれば記述
- ChatGPTを使用した場合はその旨を補足的に記載してもOK
```

**例：**
```
## 概要  
digbeats-v2で使用するAPIの仕様書（OpenAPI YAML）を作成しました。  
recommendationsとfavoritesに関する基本的なエンドポイントを中心に、YAML形式で記述しています。

## 主な変更  
- openapi/api.yaml を新規追加（OpenAPI 3.0.3 形式）
- `/api/recommendations`：POSTメソッドでtrack_nameを受け取り、レコメンドを返す
- `/api/recommendations/history`：GETメソッドで履歴一覧を返す
- `/api/favorites`：お気に入り一覧を取得
- `/api/favorites/{track_id}`：お気に入り追加/削除（POST/DELETE）
- 日本語入力や検索文字列に対応するため、recommendationsはGETではなくPOSTに設定

## 補足  
- Swagger EditorおよびVSCodeのSwagger Viewerでプレビュー確認済み
- `openapi: 3.1.0` はプレビュー非対応のため `3.0.3` にダウングレードして対応
```

---

## ✅ マージタイトル
```
add: ○○○○を作成
```
※ PRタイトルと同じ内容でOK

---

## ✅ マージ本文
```
やったことの要約（重要な変更点を1〜2行で）
```
**例**:
```
recommendationsとfavoritesに関するOpenAPI仕様書（openapi.yaml）を作成しました。
```

---

## 📝 備考
- コミットは必要に応じて細分化してもよいが、PR単位ではこのフォーマットで統一する
- 「add」「update」「fix」などのプレフィックスは [conventional commits](https://www.conventionalcommits.org/ja/v1.0.0/) に準拠
- 実装内容が複雑になる場合、補足に設計意図や課題などを記載することでレビューがスムーズになります
