import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import {
  sequelize,
  User,
  Service,
  Order,
  Testimonial,
  ShowcaseItem,
} from "./src/db/database.js";
import {
  hashPassword,
  verifyPassword,
  signToken,
  type JwtPayload,
} from "./src/utils/auth.js";
import {
  requireAdmin,
  requireAuth,
  requireOwnerOrAdmin,
  type AuthedRequest,
} from "./src/middleware/auth.js";
import {
  validate,
  loginRules,
  registerRules,
  orderCreateRules,
  orderUpdateRules,
  serviceRules,
  testimonialRules,
  showcaseRules,
  idParamRule,
  userIdQueryRule,
} from "./src/validators/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "..", "frontend", "public", "uploads");
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /mp4|webm|ogg|jpg|jpeg|png|gif|webp/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else
      cb(
        new Error(
          "Hanya file video (mp4, webm, ogg) dan gambar (jpg, png, gif, webp) yang diizinkan."
        )
      );
  },
});

function userResponse(user: {
  id: number;
  name: string;
  email: string;
  role: string;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function seedDatabase() {
  const serviceCount = await Service.count();
  if (serviceCount === 0) {
    await Service.bulkCreate([
      {
        name: "Fast Cleaning",
        category: "Paket pekat",
        price: 35000,
        description: "Cuci kilat bagian luar",
      },
      {
        name: "Deep Cleaning",
        category: "Paket pekat",
        price: 50000,
        description: "Luar dalam & insole",
      },
      {
        name: "Kids Shoes",
        category: "Ladies care",
        price: 30000,
        description: "Cuci sepatu anak-anak",
      },
      {
        name: "Repaint Sepatu",
        category: "suede care",
        price: 150000,
        description: "Cat ulang sepatu agar seperti baru",
      },
    ]);
  }

  const adminCount = await User.count({ where: { role: "admin" } });
  if (adminCount === 0) {
    const adminPassword =
      process.env.ADMIN_PASSWORD || "ChangeMe123!";
    await User.create({
      name: process.env.ADMIN_NAME || "Admin Ninetynine Shoe",
      email: process.env.ADMIN_EMAIL || "admin@ninetynine.shoe",
      password: await hashPassword(adminPassword),
      role: "admin",
    });
    console.log(
      `Admin dibuat: ${process.env.ADMIN_EMAIL || "admin@ninetynine.shoe"} (gunakan ADMIN_PASSWORD dari .env)`
    );
  }

  const testiCount = await Testimonial.count();
  if (testiCount === 0) {
    await Testimonial.bulkCreate([
      {
        name: "Andi Saputra",
        location: "Pelanggan Purwokerto",
        rating: 5,
        text: '"Gila sih, sepatu putih kesayangan yang udah menguning parah bisa balik putih lagi kayak baru beli. Mantap Ninetynine Shoe!"',
        sort_order: 1,
      },
      {
        name: "Rina Melati",
        location: "Pelanggan Cilacap",
        rating: 5,
        text: '"Layanan pick-up delivery-nya ngebantu banget buat yang sibuk kerja. Tinggal WA, sepatu dijemput, balik-balik udah wangi."',
        sort_order: 2,
      },
      {
        name: "Dimas Anggara",
        location: "Pelanggan Purwokerto",
        rating: 4,
        text: '"Cuci helm dan tas carrier juga oke banget di sini. Harganya masuk akal, kualitasnya premium. Sukses terus!"',
        sort_order: 3,
      },
    ]);
  }

  const showcaseCount = await ShowcaseItem.count();
  if (showcaseCount === 0) {
    await ShowcaseItem.bulkCreate([
      {
        label: "Deep Clean",
        icon: "fa-shoe-prints",
        media_url:
          "https://videos.pexels.com/video-files/3635378/3635378-uhd_2560_1440_25fps.mp4",
        media_type: "video",
        sort_order: 1,
      },
      {
        label: "Steam Uap",
        icon: "fa-spray-can-sparkles",
        media_url:
          "https://videos.pexels.com/video-files/6461561/6461561-uhd_2560_1440_30fps.mp4",
        media_type: "video",
        sort_order: 2,
      },
      {
        label: "Pick Up & Delivery",
        icon: "fa-truck-fast",
        media_url:
          "https://videos.pexels.com/video-files/5384913/5384913-uhd_2560_1440_25fps.mp4",
        media_type: "video",
        sort_order: 3,
      },
    ]);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 5000;

  app.use(cors());
  app.use(express.json());
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "..", "frontend", "public", "uploads"))
  );

  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Database synced successfully via Sequelize.");
    await seedDatabase();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  // --- Auth (public) ---
  app.post("/api/login", loginRules, validate, async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { email: username } });
    if (!user) {
      return res.status(401).json({ error: "Email atau password salah" });
    }
    const u = user.get({ plain: true }) as {
      id: number;
      name: string;
      email: string;
      password: string;
      role: string;
    };
    const { valid, needsRehash } = await verifyPassword(password, u.password);
    if (!valid) {
      return res.status(401).json({ error: "Email atau password salah" });
    }
    if (needsRehash) {
      await user.update({ password: await hashPassword(password) });
    }
    const payload: JwtPayload = {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as "admin" | "customer",
    };
    res.json({ token: signToken(payload), user: userResponse(u) });
  });

  app.post("/api/register", registerRules, validate, async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email sudah digunakan" });
      }
      const user = await User.create({
        name,
        email,
        password: await hashPassword(password),
        role: "customer",
      });
      const u = user.get({ plain: true }) as {
        id: number;
        name: string;
        email: string;
        role: string;
      };
      const payload: JwtPayload = {
        id: u.id,
        email: u.email,
        name: u.name,
        role: "customer",
      };
      res.json({ token: signToken(payload), user: userResponse(u) });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Registrasi gagal";
      res.status(500).json({ error: message });
    }
  });

  // --- Services ---
  app.get("/api/services", async (_req, res) => {
    res.json(await Service.findAll());
  });
  app.post(
    "/api/services",
    requireAdmin,
    serviceRules,
    validate,
    async (req, res) => {
      res.json(await Service.create(req.body));
    }
  );
  app.put(
    "/api/services/:id",
    requireAdmin,
    idParamRule,
    serviceRules,
    validate,
    async (req, res) => {
      await Service.update(req.body, { where: { id: req.params.id } });
      res.json({ success: true });
    }
  );
  app.delete(
    "/api/services/:id",
    requireAdmin,
    idParamRule,
    validate,
    async (req, res) => {
      await Service.destroy({ where: { id: req.params.id } });
      res.json({ success: true });
    }
  );

  // --- Orders ---
  // Admin list harus terpisah dari /api/orders/:id (hindari "all" tertangkap sebagai id)
  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    res.json(await Order.findAll({ order: [["date", "DESC"]] }));
  });
  app.get(
    "/api/orders",
    requireOwnerOrAdmin,
    userIdQueryRule,
    validate,
    async (req, res) => {
      const orders = await Order.findAll({
        where: { user_id: req.query.userId },
        order: [["date", "DESC"]],
      });
      res.json(orders);
    }
  );
  app.get("/api/orders/:id", async (req, res) => {
    const order = await Order.findByPk(req.params.id);
    if (order) res.json(order);
    else res.status(404).json({ error: "Resi tidak ditemukan" });
  });
  app.post(
    "/api/orders",
    requireAuth,
    orderCreateRules,
    validate,
    async (req: AuthedRequest, res) => {
      const body = { ...req.body, user_id: req.auth!.id };
      res.json(await Order.create(body));
    }
  );
  app.put(
    "/api/orders/:id",
    requireAdmin,
    orderUpdateRules,
    validate,
    async (req, res) => {
      await Order.update(req.body, { where: { id: req.params.id } });
      res.json({ success: true });
    }
  );
  app.delete(
    "/api/orders/:id",
    requireAdmin,
    idParamRule,
    validate,
    async (req, res) => {
      await Order.destroy({ where: { id: req.params.id } });
      res.json({ success: true });
    }
  );

  // --- Upload (admin) ---
  app.post(
    "/api/upload",
    requireAdmin,
    upload.single("file"),
    (req: AuthedRequest, res) => {
      if (!req.file) {
        return res.status(400).json({ error: "Tidak ada file yang diunggah." });
      }
      const publicUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      res.json({
        url: publicUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
      });
    }
  );

  // --- CMS ---
  app.get("/api/testimonials", async (_req, res) => {
    res.json(
      await Testimonial.findAll({ order: [["sort_order", "ASC"]] })
    );
  });
  app.post(
    "/api/testimonials",
    requireAdmin,
    testimonialRules,
    validate,
    async (req, res) => {
      res.json(await Testimonial.create(req.body));
    }
  );
  app.put(
    "/api/testimonials/:id",
    requireAdmin,
    testimonialRules,
    validate,
    async (req, res) => {
      await Testimonial.update(req.body, { where: { id: req.params.id } });
      res.json({ success: true });
    }
  );
  app.delete(
    "/api/testimonials/:id",
    requireAdmin,
    idParamRule,
    validate,
    async (req, res) => {
      await Testimonial.destroy({ where: { id: req.params.id } });
      res.json({ success: true });
    }
  );

  app.get("/api/showcase", async (_req, res) => {
    res.json(
      await ShowcaseItem.findAll({ order: [["sort_order", "ASC"]] })
    );
  });
  app.post(
    "/api/showcase",
    requireAdmin,
    showcaseRules,
    validate,
    async (req, res) => {
      res.json(await ShowcaseItem.create(req.body));
    }
  );
  app.put(
    "/api/showcase/:id",
    requireAdmin,
    showcaseRules,
    validate,
    async (req, res) => {
      await ShowcaseItem.update(req.body, { where: { id: req.params.id } });
      res.json({ success: true });
    }
  );
  app.delete(
    "/api/showcase/:id",
    requireAdmin,
    idParamRule,
    validate,
    async (req, res) => {
      await ShowcaseItem.destroy({ where: { id: req.params.id } });
      res.json({ success: true });
    }
  );

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Express Error:", err);
    res.status(500).json({
      error: err.message || "Internal Server Error",
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API Server running on http://localhost:${PORT}`);
  });
}

startServer();
