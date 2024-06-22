import { Router } from "express";
import Unifi from "node-unifi";

import { SiteModel } from "../models/Site.model.js";
import { APModel } from "../models/AP.model.js";
import { decryptText } from "../utils/crypto/index.js";

const router = Router();

router.post("/connecting", async (req, res) => {
  // Get data
  const { id, ap, idSite, site: siteId } = req.body;

  // Site
  const site = await SiteModel.findById(idSite);

  if (!site)
    return res
      .status(404)
      .json({
        error: "Site not found",
        status: 404,
        message: "Site not found",
      });
  const passwordEncrypted = decryptText(site.password);
  console.log("🚀 ~ POST ~ site:", site, passwordEncrypted);

  const unifi = new Unifi.Controller({
    host: site.host,
    port: site.port,
    username: site.username,
    password: passwordEncrypted,
    sslverify: site.sslverify,
    site: siteId,
  });

  const loginData = await unifi.login("iris", passwordEncrypted);
  console.log("🚀 ~ router.post ~ unifi.opts.site:", unifi.opts.site)
  console.log("🚀 ~ router.post ~ loginData:", loginData)
  const resUnifi = await unifi.authorizeGuest(
    id,
    60 * 24 * 30,
    null,
    null,
    null,
    ap
  );
  console.log("🚀 ~ POST ~ resUnifi:", resUnifi);
  return res.status(200).json({ message: "success", status: 200 });
});

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
