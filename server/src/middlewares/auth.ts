import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';


export const basicAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  console.log(`VBassss`,authHeader);
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.status(401).json({ error: 'Authorization header missing or incorrect' });
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(503).json({ error: 'An unexpected error occurred, please try again later' });
  }
};
