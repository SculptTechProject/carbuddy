import jwt from "jsonwebtoken";

const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "1h";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * Generates a JWT token for the given user ID and returns the token and its expiry date.
 * @param {number} userId - The ID of the user for whom to generate the token.
 * @returns {{ token: string, expiresAt: Date }} - An object containing the generated token and its expiry date.
 */
export const generateToken = (userId: number) => {
  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  } as jwt.SignOptions);
  const decoded = jwt.decode(token) as any;
  const expiresAt = new Date(decoded.exp * 1000);
  return { token, expiresAt };
};
