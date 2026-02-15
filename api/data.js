import { Router } from "express";
import {
  getUsersRecords,
  getAllData,
  getDataById,
  addData,
  deleteDataById,
  updateData,
} from "../db/mongodb.js";
let router = Router();

router.get("/", async (req, res) => {
  try {
    const data = await getAllData();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/users_records", async (req, res) => {
  try {
    const data = await getUsersRecords();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await getDataById(req.params.id);
    if (!data) {
      return res.status(404).json({ error: "data not found" });
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  let exist = await getDataById(req.params.id);
  if (!exist) {
    return res.status(404).json({ error: "data not found" });
  }
  try {
    const result = await deleteDataById(req.params.id);
    if (result) {
      return res.status(200).json({ deleted_data: exist });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  let exist = await getDataById(req.body.id);
  if (exist) {
    return res.status(409).json({ error: "record already exists" });
  }
  try {
    const result = await addData(req.body);
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await updateData({ id: req.params.id, newData: req.body });
    if (updated) {
      const newData = await getDataById(req.params.id);
      res.json({ newData });
    } else {
      res.status(404).json({ error: "record not found or nothing to update" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
