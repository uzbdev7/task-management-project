export const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    console.log("roleGuard req.user.role:", req.user?.role);
    console.log("allowedRoles:", allowedRoles);

    if (!userRole) {
      return res.status(401).json({ message: "Foydalanuvchi topilmadi!" });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Bu operatsiyani bajarish uchun sizda ruxsat yo'q. Tez borib ruxsat olib keling." });
    }

    next();
  };
};
