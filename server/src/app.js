import cors from "cors";
import morgan from "morgan";
import express from "express";
import { config } from "dotenv";
import path from "path";
import router from "./routes/router.js";

config();

const app = express();

/**middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.disable("x-powered-by");

app.use("/api/v1", router);

const __dirname = path.resolve();
const frontendPath = path.join(__dirname, "./frontend/dist");
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;
