import express = require('express');
import type { Request, Response, NextFunction } from 'express';
import jwt = require('jsonwebtoken');
import * as bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import cors from 'cors';
import multer from 'multer';

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'i_love_you_ryan';

app.use(express.json());
app.use(cors({ origin: true }));
// app.options('*', cors({ origin: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});

function isValidUrl(u: unknown): boolean {
  if (typeof u !== 'string' || !u.trim()) return false;
  try { new URL(u); return true; } catch { return false; }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const userId = typeof decoded.sub === 'string' ? Number(decoded.sub) : (decoded.sub as number | undefined);
    if (!userId) return res.status(401).json({ error: 'INVALID_TOKEN' });

    prisma.user.findUnique({ where: { id: userId } })
      .then(user => {
        if (!user || user.token !== token) return res.status(401).json({ error: 'TOKEN_REVOKED' });
        (req as any).userId = userId;
        next();
      })
      .catch(() => res.status(500).json({ error: 'INTERNAL_ERROR' }));
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!');
});

app.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'name, email, password가 필요합니다.' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'EMAIL_EXISTS', message: '이미 가입된 이메일입니다.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: { name, email, password: passwordHash, role: Role.USER, savedCarbon: 0 },
    });

    const token = jwt.sign({ sub: created.id, email: created.email, role: created.role }, JWT_SECRET, { expiresIn: '365d' });
    await prisma.user.update({ where: { id: created.id }, data: { token } });

    return res.status(201).json({
      id: created.id, name: created.name, email: created.email, role: created.role,
      carbon: created.savedCarbon || 0, token,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: err?.message || 'Server error' });
  }
});

app.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: 'MISSING_FIELDS', message: 'email, password가 필요합니다.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '365d' });
    await prisma.user.update({ where: { id: user.id }, data: { token } });

    return res.json({
      id: user.id, name: user.name, email: user.email, role: user.role,
      carbon: user.savedCarbon || 0, token,
    });
  } catch (err: any) {
    console.error('Signin error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: err?.message || 'Server error' });
  }
});

app.get('/me', async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const userId = typeof decoded.sub === 'string' ? Number(decoded.sub) : (decoded.sub as number | undefined);
    if (!userId) return res.status(401).json({ error: 'INVALID_TOKEN' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || user.token !== token) return res.status(401).json({ error: 'TOKEN_REVOKED' });

    return res.json({
      id: user.id, name: user.name, email: user.email, role: user.role,
      carbon: user.savedCarbon || 0,
    });
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
});

app.get('/products', requireAuth, async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.market.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, price: true, ci2savedkg: true, image: true },
    });

    const items = rows.map(r => ({
      id: r.id, title: r.name, price: r.price, condition: 'Good' as const,
      co2SavedKg: r.ci2savedkg ?? 0, image: r.image || undefined,
    }));
    return res.json(items);
  } catch (e: any) {
    console.error('GET /products error:', e);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: e?.message || 'Server error' });
  }
});

app.post(['/productcr', '/products'], requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, price, ci2savedkg, image } = req.body ?? {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'INVALID_NAME', message: 'name must be at least 2 chars' });
    }
    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) {
      return res.status(400).json({ error: 'INVALID_PRICE', message: 'price must be a positive number' });
    }
    const c = ci2savedkg == null ? 0 : Number(ci2savedkg);
    if (!Number.isFinite(c) || c < 0) {
      return res.status(400).json({ error: 'INVALID_CO2', message: 'ci2savedkg must be >= 0' });
    }
    if (!image || typeof image !== 'string' || !isValidUrl(image)) {
      return res.status(400).json({ error: 'INVALID_IMAGE', message: 'valid image url is required' });
    }

    const created = await prisma.market.create({
      data: { name: name.trim(), price: p, ci2savedkg: c, image: image.trim() },
      select: { id: true, name: true, price: true, ci2savedkg: true, image: true },
    });

    return res.status(201).json({
      id: created.id, title: created.name, price: created.price,
      condition: 'Good', co2SavedKg: created.ci2savedkg ?? 0, image: created.image,
    });
  } catch (e: any) {
    console.error('POST /products error:', e);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: e?.message || 'Server error' });
  }
});


type Material = 'plastic' | 'paper' | 'glass' | 'metal' | 'ewaste' | 'unknown';
interface AnalyzeResult {
  material: Material;
  recyclable: boolean;
  confidence: number; 
  instructions: string[];
  detected?: string[];
}

function guessMaterialByName(name: string): { material: Material; detected: string[]; confidence: number } {
  const n = name.toLowerCase();
  const has = (arr: string[]) => arr.some(k => n.includes(k));
  if (has(['pet','bottle','plastic','pe','pp','ps'])) {
    const tags = ['Plastic']; if (n.includes('pet')) tags.push('PET'); if (n.includes('bottle')) tags.push('Bottle');
    return { material: 'plastic', detected: tags, confidence: 0.85 };
  }
  if (has(['can','alum','aluminum','steel','tin'])) return { material: 'metal', detected: ['Metal'], confidence: 0.8 };
  if (has(['glass','jar'])) return { material: 'glass', detected: ['Glass'], confidence: 0.75 };
  if (has(['paper','cardboard','box','kraft','carton'])) {
    const tags = ['Paper']; if (n.includes('cardboard') || n.includes('box')) tags.push('Corrugated');
    return { material: 'paper', detected: tags, confidence: 0.78 };
  }
  if (has(['phone','charger','adapter','battery','mouse','keyboard','laptop','earbud','cable','usb'])) {
    return { material: 'ewaste', detected: ['E-waste'], confidence: 0.82 };
  }
  return { material: 'unknown', detected: [], confidence: 0.45 };
}

function instructionsFor(m: Material, recyclable: boolean): string[] {
  switch (m) {
    case 'plastic': return ['비우고 헹군 뒤 배출', '라벨 제거', '뚜껑은 분리 배출'];
    case 'paper':   return ['테이프/철핀 제거', '오염/코팅 심하면 일반배출', '마른 상태로 배출'];
    case 'glass':   return ['세척 후 배출', '금속 뚜껑 분리', '깨진 유리는 신문지로 감싸 표시'];
    case 'metal':   return ['내용물 비우고 헹군 뒤 배출', '라벨 제거 가능 시 제거'];
    case 'ewaste':  return ['지자체 전자폐기물 수거함 이용', '배터리 분리 후 배출', '대형은 수거예약'];
    default:        return recyclable ? ['일반 분리수거 배출'] : ['일반쓰레기로 배출', '오염 심하면 세척 불가 시 일반배출'];
  }
}

app.post('/recycle/analyze', requireAuth, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const img = req.file;
    if (!img) return res.status(400).json({ error: 'NO_FILE', message: 'Form field "image"가 필요합니다.' });
    if (!img.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'NOT_IMAGE', message: '이미지 파일만 업로드할 수 있습니다.' });
    }

    const baseName = img.originalname || `image.${(img.mimetype.split('/')[1] || 'jpg')}`;
    const { material, detected, confidence } = guessMaterialByName(baseName);
    const recyclable = material !== 'unknown' && material !== 'ewaste';

    const body: AnalyzeResult = {
      material, recyclable, confidence, detected,
      instructions: instructionsFor(material, recyclable),
    };
    return res.json(body);
  } catch (e: any) {
    console.error('POST /recycle/analyze error:', e);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: e?.message || 'Server error' });
  }
});

const MATERIAL_POINTS: Record<Material, number> = {
  plastic: 6, paper: 4, glass: 3, metal: 5, ewaste: 8, unknown: 1,
};

app.post('/recycle/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const { material, recyclable, confidence } = req.body ?? {};
    const m = String(material) as Material;
    if (!['plastic','paper','glass','metal','ewaste','unknown'].includes(m)) {
      return res.status(400).json({ error: 'INVALID_MATERIAL' });
    }
    const cf = Number.isFinite(Number(confidence)) ? Math.max(0, Math.min(1, Number(confidence))) : 0.6;
    const canReward = Boolean(recyclable) || m === 'ewaste' || m === 'unknown';
    let points = 0;
    if (canReward) {
      const base = MATERIAL_POINTS[m] ?? 1;
      points = Math.max(1, Math.round(base * (0.6 + 0.4 * cf)));
    }

    const updated = await prisma.user.update({
      where: { id: (req as any).userId },
      data: { savedCarbon: { increment: points } },
      select: { id: true, name: true, email: true, role: true, savedCarbon: true },
    });

    return res.json({
      ok: true,
      pointsAwarded: points,
      totalPoints: updated.savedCarbon,
      carbon: updated.savedCarbon,
    });
  } catch (e: any) {
    console.error('POST /recycle/complete error:', e);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: e?.message || 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});