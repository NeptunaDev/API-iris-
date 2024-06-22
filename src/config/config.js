import dotenv from "dotenv";
dotenv.config();

const validateEnv = (name) => {
  try {
    const constant = process.env[name];
    if (!constant) throw new Error(`${name} is not defined in .env file`);
    return constant;
  } catch (error) {
    console.log(error.message);
    return "";
  }
};

export const URI_DB_MONGO = validateEnv("URI_DB_MONGO");
export const PORT = validateEnv("PORT");
export const SECRET_KEY = validateEnv("SECRET_KEY");
export const SECRET_IV = validateEnv("SECRET_IV");
