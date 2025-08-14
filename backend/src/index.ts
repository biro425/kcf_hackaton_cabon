import express = require('express');
import type { Request, Response } from 'express';
import jwt = require('jsonwebtoken');
import * as bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'i_love_you_ryan'; 

app.use(express.json());
app.use(cors({ origin: true }));   

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!');
});
app.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) return res.status(400).json({ error: 'MISSING_FIELDS', message: 'name, email, password가 필요합니다.' });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: 'EMAIL_EXISTS', message: '이미 가입된 이메일입니다.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: Role.USER,
        savedCarbon: 0,
      },
    });
    const token = jwt.sign(
      { sub: created.id, email: created.email, role: created.role },
      JWT_SECRET,
      { expiresIn: '365d' }
    );
    await prisma.user.update({ where: { id: created.id }, data: { token } });
    return res.status(201).json({
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      carbon: created.savedCarbon || 0,
      token,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: err?.message || 'Server error' });
  }
});
app.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'email, password가 필요합니다.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    await prisma.user.update({ where: { id: user.id }, data: { token } });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      carbon: user.savedCarbon || 0,
      token,
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
    const userId = typeof decoded.sub === 'string' ? Number(decoded.sub) : decoded.sub as number | undefined;
    if (!userId) return res.status(401).json({ error: 'INVALID_TOKEN' });

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || user.token !== token) return res.status(401).json({ error: 'TOKEN_REVOKED' });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
});
import type { NextFunction } from 'express';
function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const userId = typeof decoded.sub === 'string' ? Number(decoded.sub) : (decoded.sub as number | undefined);
    if (!userId) return res.status(401).json({ error: 'INVALID_TOKEN' });

    // 토큰 철회 여부 확인
    prisma.user.findUnique({ where: { id: userId } })
      .then(user => {
        if (!user || user.token !== token) return res.status(401).json({ error: 'TOKEN_REVOKED' });
        // 필요하면 req에 심기
        (req as any).userId = userId;
        next();
      })
      .catch(() => res.status(500).json({ error: 'INTERNAL_ERROR' }));
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}
app.get('/products', requireAuth, async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.market.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, price: true, ci2savedkg: true, image: true },
    });

    const items = rows.map(r => ({
      id: r.id,
      title: r.name,               // name -> title
      price: r.price,
      condition: 'Good' as const,
      co2SavedKg: r.ci2savedkg,
      image: r.image || undefined,
    }));

    return res.json(items); 
  } catch (e: any) {
    console.error('GET /products error:', e);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: e?.message || 'Server error' });
  }
});
app.post('/productcr', requireAuth, async (req: Request, res: Response) => {
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
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'INVALID_IMAGE', message: 'valid image url is required' });
    }

    const created = await prisma.market.create({
      data: { name: name.trim(), price: p, ci2savedkg: c, image: image.trim() },
      select: { id: true, name: true, price: true, ci2savedkg: true, image: true },
    });

    return res.status(201).json({
      id: created.id,
      title: created.name,
      price: created.price,
      condition: 'Good',
      co2SavedKg: created.ci2savedkg ?? 0,
      image: created.image,
    });
  } catch (e: any) {
    console.error('POST /products error:', e);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: e?.message || 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});