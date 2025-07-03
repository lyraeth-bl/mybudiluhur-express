var express = require("express");
var router = express.Router();
var { prisma } = require("../lib/prisma/prisma");

// Get All Device Tokens
router.get("/", async (req, res, next) => {
    const fetchAllDeviceTokens = await prisma.device_tokens.findMany();
    return res
        .status(200)
        .json({ message: "All Device Tokens", data: fetchAllDeviceTokens });
});

// Get device tokens via users_nis
router.get("/:nis", async (req, res, next) => {
    const { nis } = req.params;
    const fetchDeviceTokensViaNis = await prisma.device_tokens.findMany({
        where: { nis: nis },
    });

    return res.status(200).send({
        message: `Device tokens from nis ${nis}`,
        fetchDeviceTokensViaNis,
    });
});

// Post device tokens
router.post("/", async (req, res) => {
    // * Body
    const { nis, token, platform, app_version } = req.body;

    // * Check apakah nis atau tokennya ada?
    if (!nis || !token) {
        return res.status(400).json({ message: "nis and token are required" });
    }

    try {
        // * Check dulu di DB sudah ada token yang sama atau tidak
        const existingToken = await prisma.device_tokens.findFirst({
            where: { token },
        });

        if (existingToken) {
            // * Jika Token sudah ada, update info
            await prisma.device_tokens.update({
                where: { id: existingToken.id },
                data: {
                    nis,
                    platform,
                    app_version,
                    last_active_at: new Date(), // * update last_active_at ke tanggal / waktu sekarang
                    updated_at: new Date(), // * update updated_at  ke tanggal / waktu sekarang
                },
            });
            // * kasih response token terupdate
            return res.json({ message: "Device token updated" });
        }

        // * Jika token belum ada, insert baru
        await prisma.device_tokens.create({
            data: {
                nis,
                token,
                platform,
                app_version,
                last_active_at: new Date(),
            },
        });

        res.status(201).json({ message: "Device token created" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        const deleted = await prisma.device_tokens.delete({
            where: { id: id },
        });
        return res
            .status(200)
            .json({ message: "Device token deleted", data: deleted });
    } catch (error) {
        return res.status(404).json({ message: "Device token not found" });
    }
});
module.exports = router;
