const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const abonelikler = {};

webpush.setVapidDetails(
  "mailto:sen@example.com",
  "BBmkso1ixwQ8On7uqdmz8wNuwHloZMhwoRRWcQKNGvyijIlsbEwZf1-SVl0BqbBvhbRqFUz5_f31eSTHCmAj2ic",
  "L93WoCAlXlFyLVk56LhB1PruElgLlxJ7XJN1EENXhng"
);

app.post("/kayit", (req, res) => {
  const { oda, id, subscription } = req.body;
  const odaKey = `oda_${oda}`;
  abonelikler[odaKey] ||= {};
  abonelikler[odaKey][id] = subscription;
  res.sendStatus(200);
});

app.get("/kullanicilar", (req, res) => {
  const odaKey = `oda_${req.query.oda}`;
  const kullanicilar = Object.keys(abonelikler[odaKey] || {});
  res.json(kullanicilar);
});

app.post("/gonder", async (req, res) => {
  const { oda, hedefID, mesaj } = req.body;
  const odaKey = `oda_${oda}`;
  const sub = abonelikler[odaKey]?.[hedefID];

  if (!sub) {
    console.log("❗ Kullanıcıya ait abonelik bulunamadı:", hedefID);
    return res.sendStatus(404);
  }

  const payload = JSON.stringify({ title: "Yeni Mesaj", body: mesaj });

  try {
    console.log("📤 Push gönderiliyor:", sub.endpoint);
    await webpush.sendNotification(sub, payload);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Push gönderme hatası:", err);
    res.sendStatus(500);
  }
});
app.listen(3000, () => {
  console.log("📡 Push chat server çalışıyor: http://localhost:3000");
});
