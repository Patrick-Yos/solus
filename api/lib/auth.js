import jwt from 'jsonwebtoken';

export const authenticate = (handler) => async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return handler(req, res);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};