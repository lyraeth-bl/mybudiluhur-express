var express = require("express");
var router = express.Router();
const admin = require("../lib/firebase/firebase");
var { validateToken } = require("../lib/middleware/middleware");

router.get("/", (req, res) => res.send("Notifications"));

// Post notifications for multi nis
router.post("/send-notification", validateToken, async (req, res) => {
    // Body
    const { tokens, title, body, data } = req.body; // Tambahkan data di destructuring

    // Validasi
    if (!Array.isArray(tokens) || tokens.length === 0) {
        return res.status(400).json({
            status: "error",
            message: "tokens must be a non-empty array",
        });
    }

    if (!title || !body) {
        return res.status(400).json({
            status: "error",
            message: "title and body are required",
        });
    }

    try {
        const message = {
            tokens,
            notification: { title, body },
            data: data || {}, // Gunakan data jika ada, default empty object
        };

        // Gunakan sendMulticast untuk multiple devices
        const response = await admin.messaging().sendEachForMulticast(message);

        // Format response
        const result = {
            successCount: response.successCount,
            failureCount: response.failureCount,
            details: response.responses.map((resp, index) => ({
                token: tokens[index],
                status: resp.success ? "success" : "failed",
                messageId: resp.messageId || null,
                error: resp.error ? resp.error.message : null,
            })),
        };

        res.json({
            status: "success",
            fcmResponse: result,
        });
    } catch (error) {
        console.error("FCM Error:", error);
        res.status(500).json({
            status: "error",
            error: error.message || "Failed to send notification",
            stack:
                process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined,
        });
    }
});

module.exports = router;

//     const sendResults = await Promise.all(
//         userTokens.map(async ({ token, nis }) => {
//             // buat token dan nis jadi map untuk format ke API FCM
//             const message = {
//                 token,
//                 notification: { title, body },
//                 data: data || {},
//             };

//             try {
//                 // Kirim ke API FCM (Admin SDK)
//                 const response = await admin.messaging().send(message);

//                 // Store data ke table notification
//                 await prisma.notifications.create({
//                     data: {
//                         // untuk sekarang default biar single atau bebas
//                         // kedepannya bisa kita manage untuk typenya
//                         type: "single",
//                         title, // judul notifikasi
//                         body, // isi notifikasi
//                         image_url: null, // karena optional, defaultnya biar null
//                         data_payload: data || {}, // array
//                         target_type: "nis", // untuk sekarang default biar nis
//                         target_value: nis, // isi sesuai target_type
//                         nis: nis, // untuk indexing
//                         status: "sent", // status. e.g "sent", "failed"
//                         // response dari post ke API FMC
//                         // const response = await admin.messaging().send(message);
//                         fmc_message_id: response,
//                         error_message: "", // Error message
//                     },
//                 });

//                 return { token, nis, status: "success", response };
//             } catch (error) {
//                 await prisma.notifications.create({
//                     data: {
//                         type: "single",
//                         title,
//                         body,
//                         image_url: null,
//                         data_payload: data || {},
//                         target_type: "nis",
//                         target_value: nis,
//                         nis: nis,
//                         status: "failed",
//                         fmc_message_id: "",
//                         error_message: error.message,
//                     },
//                 });

//                 return {
//                     token,
//                     nis,
//                     status: "failed",
//                     error: error.message,
//                 };
//             }
//         })
//     );

//     res.json({
//         message: "Notification process completed",
//         results: sendResults,
//     });
// } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
// }
// });
