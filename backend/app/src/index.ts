import express from "express";

const app = express();
const PORT: number = Number(process.env.PORT) || 5090;

app.listen(PORT, () => {
    console.log(`listing on port: ${PORT}`);
});

app.get("/api/test", (_, responce) => {
    responce.send("hello world");
});
