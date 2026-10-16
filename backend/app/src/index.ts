import express from "express";
import logger from "../utils/logger.js"

const app = express();
const PORT: number = Number(process.env.PORT) || 5090;

app.use(logger);

app.listen(PORT, () => {
    logger.logger.info(`listening on port: ${PORT}`);
});

app.get("/api/test", (request, response) => {
    request.log.info("log test ...");
    response.send("hello world");
});
