import { Router } from "express";
import Unifi from "node-unifi";

import { SiteModel } from "../models/Site.model.js";
import { APModel } from "../models/AP.model.js";
import { decryptText } from "../utils/crypto/index.js";

const router = Router();

router.post("/connecting", async (req, res) => {
  try {
    console.log("🔍 [DEBUG] Starting /connecting endpoint with body:", req.body);
    
    // Get data
    const { id, ap, idSite, site: siteId } = req.body;
    console.log("🔍 [DEBUG] Extracted data:", { id, ap, idSite, siteId });

    // Site lookup
    let site;
    try {
      site = await SiteModel.findById(idSite);
      console.log("🔍 [DEBUG] Site lookup result:", site ? "Found" : "Not found");
      
      if (!site)
        return res
          .status(404)
          .json({
            error: "Site not found",
            status: 404,
            message: "Site not found",
          });
    } catch (siteError) {
      console.error("❌ [ERROR] Failed to find site:", siteError);
      return res.status(500).json({
        error: "Database error",
        status: 500,
        message: "Failed to find site in database",
        details: siteError.message
      });
    }
    
    // Password decryption
    let passwordEncrypted;
    try {
      passwordEncrypted = decryptText(site.password);
      console.log("🔍 [DEBUG] Password decryption successful");
    } catch (decryptError) {
      console.error("❌ [ERROR] Failed to decrypt password:", decryptError);
      return res.status(500).json({
        error: "Decryption error",
        status: 500,
        message: "Failed to decrypt site password",
        details: decryptError.message
      });
    }

    // Controller setup and login
    let unifi;
    let loginData;
    try {
      unifi = new Unifi.Controller({
        host: site.host,
        port: site.port,
        username: site.username,
        password: passwordEncrypted,
        sslverify: site.sslverify,
        site: siteId,
      });
      console.log("🔍 [DEBUG] Unifi controller initialized with config:", {
        host: site.host,
        port: site.port,
        username: site.username,
        sslverify: site.sslverify,
        site: siteId
      });

      loginData = await unifi.login("iris", passwordEncrypted);
      console.log("🔍 [DEBUG] Login attempt result:", loginData);
      console.log("🔍 [DEBUG] Unifi site after login:", unifi.opts.site);
      
      if (!loginData) {
        console.error("❌ [ERROR] Login failed, but didn't throw an error");
        return res.status(401).json({
          error: "Authentication failed",
          status: 401,
          message: "Failed to authenticate with Unifi controller"
        });
      }
    } catch (loginError) {
      console.error("❌ [ERROR] Failed to initialize or login to Unifi controller:", loginError);
      return res.status(500).json({
        error: "Unifi login error",
        status: 500,
        message: "Failed to connect to Unifi controller",
        details: loginError.message,
        stack: loginError.stack
      });
    }

    // Guest authorization
    try {
      console.log("🔍 [DEBUG] Attempting to authorize guest with params:", {
        id,
        minutes: 60 * 24 * 30,
        ap
      });
      
      const resUnifi = await unifi.authorizeGuest(
        id,
        60 * 24 * 30,
        null,
        null,
        null,
        ap
      );
      
      console.log("🔍 [DEBUG] Authorization successful:", resUnifi);
      return res.status(200).json({ message: "success", status: 200, data: resUnifi });
    } catch (authError) {
      console.error("❌ [ERROR] Failed to authorize guest:", authError);
      console.error("❌ [ERROR] Auth error details:", {
        name: authError.name,
        message: authError.message,
        code: authError.code,
        response: authError.response ? {
          status: authError.response.status,
          statusText: authError.response.statusText,
          data: authError.response.data
        } : 'No response',
        request: authError.request ? 'Request present' : 'No request'
      });
      
      // Check if it's a permission error (403)
      if (authError.response && authError.response.status === 403) {
        return res.status(403).json({
          error: "Permission denied",
          status: 403,
          message: "The user lacks permission to authorize guests",
          details: authError.response.data || authError.message
        });
      }
      
      return res.status(500).json({
        error: "Guest authorization failed",
        status: 500,
        message: "Failed to authorize guest in Unifi controller",
        details: authError.message
      });
    }
  } catch (generalError) {
    console.error("❌ [ERROR] Unexpected error in /connecting endpoint:", generalError);
    return res.status(500).json({
      error: "Server error",
      status: 500,
      message: "An unexpected error occurred",
      details: generalError.message
    });
  }
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
