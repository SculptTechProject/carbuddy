import jwt from "jsonwebtoken";

const DEFAULT_EXPIRY = process.env.TOKEN_EXPIRY || "1h";
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

/**
 * Generates a JWT token for the given user ID and returns the token and its expiry date.
 * @param userId - The ID of the user for whom to generate the token.
 * @param expiresInOverride - Optional override for the token lifetime (e.g. "30d").
 */
export const generateToken = (
  userId: string,
  expiresInOverride?: string
): { token: string; expiresAt: Date } => {
  const expiresIn = expiresInOverride ?? DEFAULT_EXPIRY;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn,
  } as jwt.SignOptions);

  const decoded = jwt.decode(token) as { exp?: number };
  const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : new Date();

  return { token, expiresAt };
};
