import { Schema, model } from "mongoose";

const APSchema = new Schema(
  {
    idSite: {
      type: Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    mac: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const APModel =  model("AP", APSchema);
