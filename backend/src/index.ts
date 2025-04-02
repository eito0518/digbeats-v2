import express from "express";
import morgan from "morgan";

const PORT = 3000;

// エラー処理関数を定義
function errorHandler(
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

const app = express();

// ミドルウェア
app.use(morgan("dev"));

// 処理
app.get("/", async (req, res) => {
  res.send("Hello TypeScript & Express");
});

// エラー処理（一番最後に行う）
app.use(errorHandler);

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
