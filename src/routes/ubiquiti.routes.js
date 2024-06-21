import { Router } from "express";
import { SiteModel } from "../models/Site.model.js";
import { APModel } from "../models/AP.model.js";

const router = Router();

router.get("/ap", async (req, res) => {
  const queries = req.query;
  const aps = await APModel.find({ ...queries });
  if (!aps || aps.length === 0) {
    return res.status(404).json({ message: "APs not found", status: 404 });
  }
  const ap = aps[0];
  return res.status(200).json({
    message: "AP found",
    status: 200,
    data: ap,
  });
});

router.get("/site", async (req, res) => {
  const queries = req.query;
  const sites = await SiteModel.find({
    ...queries,
  });

  if (!sites || sites.length === 0) {
    return res.status(404).json({ message: "Sites not found", status: 404 });
  }
  const site = sites[0];

  return res.status(200).json({
    message: "Site found",
    status: 200,
    data: site,
  });
});

export default router;
