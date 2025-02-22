import dotenv from "dotenv";
dotenv.config();

import { Sequelize, Options } from "sequelize";
import { UserGenerator } from "./user.js";

const sequelize_options: Options = {
  host: "localhost",
  dialect: "postgres",
  dialectOptions: {
    decimalNumbers: true,
  },
};

const sequelize = process.env.DB_URL
  ? new Sequelize(process.env.DB_URL as string, {
      ...sequelize_options,
      dialectOptions: {
        ...sequelize_options.dialectOptions,
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME || "",
      process.env.LOCAL_DB_USER || "",
      process.env.DB_PASSWORD,
      sequelize_options
    );

const User = UserGenerator(sequelize);

export { sequelize, User };