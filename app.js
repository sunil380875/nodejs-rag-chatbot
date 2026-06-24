import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
import errorHandler from "./middlewares/errorHandler.js";
dotenv.config()
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get(("/"), (req, res) => {
    res.json({ success: true, message: "Hello From server", data: [] })
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesPath = path.join(__dirname, "router");

const files = fs.readdirSync(routesPath);

for (const file of files) {
    if (file.endsWith(".js")) {
        const route = await import(`./router/${file}`);
        app.use(route.default);
    }
}

app.use(errorHandler);

export default app;