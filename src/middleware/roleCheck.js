const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Доступ запрещен. Требуются права администратора.",
    });
  }
};

const isUser = (req, res, next) => {
  if (req.user && (req.user.role === "user" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Доступ запрещен. Требуется авторизация.",
    });
  }
};

module.exports = { isAdmin, isUser };
