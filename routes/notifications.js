var express = require("express");
var router = express.Router();
var { prisma } = require("../lib/prisma/prisma");
const admin = require("../lib/firebase/firebase");

// Get All Notification
router.get("/", async (req, res, next) => {
    const fetchAllNotifications = await prisma.notifications.findMany();
    return res.status(200).json({
        message: "All Notifications",
        fetchAllNotifications,
    });
});

// Get all notifications via nis
router.get("/:nis", async (req, res, next) => {
    const { nis } = req.params;
    const fetchNotificationsViaNis = await prisma.notifications.findMany({
        where: { nis: nis },
    });

    return res.status(200).json({
        message: `All Notification for ${nis}`,
        fetchNotificationsViaNis,
    });
});

// Post notifications for multi nis
router.post("/send-notification", async (req, res) => {
    // Body
    const { title, body, data, targetNis } = req.body;

    // Check apakah body targetNis adalah sebuah Array atau kosong?
    if (!Array.isArray(targetNis) || targetNis.length === 0) {
        return res
            .status(400)
            .json({ message: "targetNis must be a non-empty array" });
    }

    try {
        // Ambil token user dari table device_tokens
        const userTokens = await prisma.device_tokens.findMany({
            // ambil nis nya
            where: {
                nis: { in: targetNis },
            },
            // ambil token sama nis nya
            select: {
                token: true,
                nis: true,
            },
        });

        // jika token dengan nis yang dipilih tidak ada
        // return error
        if (!userTokens || userTokens.length === 0) {
            return res.status(404).json({ message: "No device tokens found" });
        }

        const sendResults = await Promise.all(
            userTokens.map(async ({ token, nis }) => {
                // buat token dan nis jadi map untuk format ke API FCM
                const message = {
                    token,
                    notification: { title, body },
                    data: data || {},
                };

                try {
                    // Kirim ke API FCM (Admin SDK)
                    const response = await admin.messaging().send(message);

                    // Store data ke table notification
                    await prisma.notifications.create({
                        data: {
                            // untuk sekarang default biar single atau bebas
                            // kedepannya bisa kita manage untuk typenya
                            type: "single",
                            title, // judul notifikasi
                            body, // isi notifikasi
                            image_url: null, // karena optional, defaultnya biar null
                            data_payload: data || {}, // array
                            target_type: "nis", // untuk sekarang default biar nis
                            target_value: nis, // isi sesuai target_type
                            nis: nis, // untuk indexing
                            status: "sent", // status. e.g "sent", "failed"
                            // response dari post ke API FMC
                            // const response = await admin.messaging().send(message);
                            fmc_message_id: response,
                            error_message: "", // Error message
                        },
                    });

                    return { token, nis, status: "success", response };
                } catch (error) {
                    await prisma.notifications.create({
                        data: {
                            type: "single",
                            title,
                            body,
                            image_url: null,
                            data_payload: data || {},
                            target_type: "nis",
                            target_value: nis,
                            nis: nis,
                            status: "failed",
                            fmc_message_id: "",
                            error_message: error.message,
                        },
                    });

                    return {
                        token,
                        nis,
                        status: "failed",
                        error: error.message,
                    };
                }
            })
        );

        res.json({
            message: "Notification process completed",
            results: sendResults,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
