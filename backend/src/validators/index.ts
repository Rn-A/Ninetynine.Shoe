import { body, param, query, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Data tidak valid",
      details: errors.array().map((e) => e.msg),
    });
  }
  next();
}

export const loginRules = [
  body("username").trim().isEmail().withMessage("Email tidak valid"),
  body("password").notEmpty().withMessage("Password wajib diisi"),
];

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Nama wajib diisi"),
  body("email").trim().isEmail().withMessage("Email tidak valid"),
  body("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
];

export const orderCreateRules = [
  body("id").trim().notEmpty().withMessage("Resi wajib diisi"),
  body("customer_name").trim().notEmpty(),
  body("phone").trim().notEmpty(),
  body("address").trim().notEmpty(),
  body("total_price").isInt({ min: 0 }).withMessage("Total harga tidak valid"),
  body("services_used").optional().isString(),
  body("status").optional().isString(),
];

export const orderUpdateRules = [
  param("id").trim().notEmpty(),
  body("status").optional().isString(),
  body("customer_name").optional().isString(),
  body("phone").optional().isString(),
  body("address").optional().isString(),
  body("services_used").optional().isString(),
  body("total_price").optional().isInt({ min: 0 }),
];

export const serviceRules = [
  body("name").trim().notEmpty(),
  body("category").trim().notEmpty(),
  body("price").isInt({ min: 0 }),
  body("description").optional().isString(),
];

export const testimonialRules = [
  body("name").trim().notEmpty(),
  body("location").optional().isString(),
  body("rating").optional().isInt({ min: 1, max: 5 }),
  body("text").trim().notEmpty(),
  body("sort_order").optional().isInt({ min: 0 }),
];

export const showcaseRules = [
  body("label").trim().notEmpty(),
  body("icon").optional().isString(),
  body("media_url").trim().notEmpty(),
  body("media_type").optional().isIn(["video", "image"]),
  body("sort_order").optional().isInt({ min: 0 }),
];

export const idParamRule = [param("id").notEmpty()];

export const userIdQueryRule = [
  query("userId").notEmpty().withMessage("userId wajib"),
];
