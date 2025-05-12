import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/user.authenticate";

export const getUserData = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
