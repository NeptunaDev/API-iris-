import { Schema, model } from "mongoose";

export const SiteSchema = new Schema(
  {
    idOrganization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    type: {
      type: String,
      enum: ["meraki", "ubiquiti"],
      required: true,
    },
    siteId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    port: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    sslverify: {
      type: Boolean,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export const SiteModel = model("Site", SiteSchema);