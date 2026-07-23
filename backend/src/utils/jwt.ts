import jwt from 'jsonwebtoken';

export const generateToken = (payload: object) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'admin_system_secret_key_2024',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'] }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'admin_system_secret_key_2024');
};
