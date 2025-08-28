import { getUserById } from "./services/supabase.js";

export const authCheck = async (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }

  const user = await getUserById(userId);
  const isAuthenticated = !!user
  if(isAuthenticated) {
    req.user = user; 
    console.log(`User authenticated: ${userId}`);
  }else {
    return res.status(401).json({ error: "Unauthorized: Invalid user ID" });
  }
  next();
}
