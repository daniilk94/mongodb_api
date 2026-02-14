import { Router } from "express";
import {
  getUsersRecords,
  getAllData,
  getDataById,
  addData,
  deleteDataById,
  updateData,
} from "../db/db.js";
let router = Router();

router.get("/", async (req, res) => {
  res.json(await getAllData());
});

router.get("/users_records", async (req, res) => {
  res.json(await getUsersRecords());
});

router.get("/:id", async (req, res) => {
  res.json(await getDataById(req.params.id));
});

router.delete("/:id", async (req, res) => {
  let [exist] = await getDataById(req.params.id);
  if (!exist) {
    return res.status(404).json({ error: "data not found" });
  }
  let result = await deleteDataById(req.params.id);
  if (result) {
    return res.status(204).send();
  } else {
    res.status(500).json({ error: "unknown database error" });
  }
});

router.post("/", async (req, res) => {
  let [exist] = await getDataById(req.body.id);
  if (exist) {
    res.status(409).json({ error: "record already exists" });
  } else {
    let result = await addData(req.body);
    if (result) res.json(req.body);
    else res.status(500).json({ error: "unknown database error" });
  }
});

router.put("/:id", async (req, res) => {
  let [exist] = await getDataById(req.params.id);
  if (!exist) {
    res.status(404).json({ error: "record not found" });
  } else {
    let result = await updateData(req.body);
    if (result) res.json(req.body);
    else res.status(500).json({ error: "unknown database error" });
  }
});

export default router;
