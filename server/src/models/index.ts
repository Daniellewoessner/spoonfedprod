import dotenv from "dotenv";
dotenv.config();

import { Sequelize, Options } from "sequelize";
import { UserGenerator } from "./user.js";

const sequelize_options: Options = {
  dialect: "postgres",
  dialectOptions: {
    decimalNumbers: true,
  },
};

const sequelize = process.env.EXTERNALDB
  ? new Sequelize(process.env.EXTERNALDB, {
      dialect: "postgres",
      dialectOptions: {
        decimalNumbers: true,
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
      {
        ...sequelize_options,
        host: "localhost",
      }
    );

const User = UserGenerator(sequelize);

export { sequelize, User };