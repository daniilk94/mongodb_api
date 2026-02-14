import { createPool } from "mariadb";
const sourceHost = "maria.northeurope.cloudapp.azure.com";
const dbMariaUser = "testi";
const dbMariaPassword = "mariadb1";
const dbMaria = "adbms";

import { MongoClient, ObjectId } from "mongodb";
const destHost = "localhost:27017";
const dbAdmin = "daniil";
const dbAdminPassword = "Uusi2571";
const authDb = "admin";
const destConnString = `mongodb://${dbAdmin}:${dbAdminPassword}@${destHost}?authSource=${authDb}`;

const dbMongo = "testi";
const dbMongoUser = "daniil";
const dbMongoPassword = "Salasana1";
const dataCollection = "data";
const usersCollection = "users";

const copyDataFromMariaToMongo = async () => {
  const pool = createPool({
    host: sourceHost,
    user: dbMariaUser,
    password: dbMariaPassword,
    database: dbMaria,
  });

  let conn;
  try {
    conn = await pool.getConnection();
    const users = await conn.query("SELECT * FROM users");
    const data = await conn.query("SELECT * FROM data");

    createCollections(users, data);
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
};

const createCollections = async (usersData, dataData) => {
  // const dbServer = new MongoClient(destConnString);
  const dbServer = new MongoClient(destConnString);
  try {
    await dbServer.connect();
    const db = dbServer.db(dbMongo);
    const dbs = await db.admin().listDatabases();
    if (dbs.databases.find((database) => database.name === dbMongo)) {
      await db.dropDatabase();
    }

    const users = db.collection(usersCollection, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["username", "password"],
          properties: {
            username: {
              bsonType: "string",
              description: "must be a string and is required",
            },
            password: {
              bsonType: "string",
              description: "must be a string and is required",
            },
          },
        },
      },
    });

    await users.createIndex({ username: 1 }, { unique: true });

    const resultUsers = await users.insertMany(usersData);
    console.log(`${resultUsers.insertedCount} users inserted.`);

    const data = db.collection(dataCollection, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["_id", "Firstname", "Surname", "userid"],
          properties: {
            _id: {
              bsonType: "objectId",
              description: "must be an objectId and is required",
            },
            Firstname: {
              bsonType: "string",
              description: "must be a string and is required",
            },
            Surname: {
              bsonType: "string",
              description: "must be a string and is required",
            },
            userid: {
              bsonType: "string",
              description: "must be a string and is required",
            },
          },
        },
      },
    });

    const processedData = dataData.map((item) => {
      return {
        _id: ObjectId.createFromHexString(
          item.id.toString(16).padStart(24, "0"),
        ),
        Firstname: item.Firstname,
        Surname: item.Surname,
        userid: item.userid,
      };
    });

    console.log(processedData);
    const resultData = await data.insertMany(processedData);
    console.log(`${resultData.insertedCount} data items inserted.`);

    const userExist = await db.command({ usersInfo: dbMongoUser });
    if (!userExist.users[0]) {
      const result = await db.command({
        createUser: dbMongoUser,
        pwd: dbMongoPassword,
        roles: [{ role: "readWrite", db: dbMongo }],
      });
      console.log("User created successfully", result);
    } else
      console.log(
        "User",
        userExist.users[0].user,
        "already exist with roles:",
        userExist.users[0].roles,
      );
  } catch (e) {
    console.log(e);
  } finally {
    await dbServer.close();
  }
};

copyDataFromMariaToMongo();
