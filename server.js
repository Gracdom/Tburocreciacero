require("dotenv").config(); // Cargar variables de entorno
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Verificar que las variables de entorno estén definidas
if (!process.env.STRIPE_SECRET_KEY || !process.env.FRONTEND_URL || !process.env.STRIPE_PUBLIC_KEY) {
    console.error("❌ ERROR: Faltan variables de entorno. Verifica tu archivo .env");
    console.error("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "✅" : "❌");
    console.error("STRIPE_PUBLIC_KEY:", process.env.STRIPE_PUBLIC_KEY ? "✅" : "❌");
    console.error("FRONTEND_URL:", process.env.FRONTEND_URL ? "✅" : "❌");
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Usa la clave secreta de Stripe

// Ruta de prueba para verificar que el servidor está corriendo
app.get("/", (req, res) => {
    res.send("🚀 API de pagos funcionando correctamente.");
});

// Ruta para proporcionar la clave pública de Stripe al frontend
app.get("/config-stripe", (req, res) => {
    res.json({ publicKey: process.env.STRIPE_PUBLIC_KEY }); // Envía la clave pública al frontend
});

// Ruta para crear una sesión de pago con validación
app.post("/crear-sesion-pago", async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: "Monto inválido" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: { name: "Pago de trámite" },
                        unit_amount: amount, // Monto en céntimos
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/success`, // URL de éxito
            cancel_url: `${process.env.FRONTEND_URL}/cancel`, // URL de cancelación
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("❌ Error al crear la sesión de pago:", error.message);
        res.status(500).json({
            error: "Error interno del servidor",
            details: error.message, // Enviar detalles del error al frontend
        });
    }
});

// Ruta para procesar el pago con un token de Stripe
app.post("/procesar-pago", async (req, res) => {
    try {
        const { token, amount } = req.body;

        if (!token || !amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: "Datos inválidos" });
        }

        // Crear un cargo usando el token
        const charge = await stripe.charges.create({
            amount: amount, // Monto en céntimos
            currency: "eur",
            source: token, // Token generado en el frontend
            description: "Pago de trámite",
        });

        res.json({ success: true, charge });
    } catch (error) {
        console.error("❌ Error al procesar el pago:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Definir puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("✅ Servidor corriendo en el puerto:", PORT);
    console.log("🔍 STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Cargada" : "No cargada");
    console.log("🔍 STRIPE_PUBLIC_KEY:", process.env.STRIPE_PUBLIC_KEY ? "Cargada" : "No cargada");
    console.log("🔍 FRONTEND_URL:", process.env.FRONTEND_URL);
});