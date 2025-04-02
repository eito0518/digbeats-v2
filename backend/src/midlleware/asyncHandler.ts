import { Request, Response, NextFunction, RequestHandler } from "express";

// エラーハンドリングするためのミドルウェア
// async関数の中でエラー(例外)が発生したら next(err) に自動で渡して、最終的にエラーハンドラーに届ける
export const asyncHandler =
  (controller: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next); // Promise型ではないことも考慮してresolve()
  };
