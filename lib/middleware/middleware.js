const validateToken = (req, res, next) => {
    const clientToken = req.headers["authorization"];
    if (!clientToken) {
        return res.status(401).json({ error: "Not Authenticated" });
    }
    next();
};
module.exports = { validateToken };
