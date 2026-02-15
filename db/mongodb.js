import { MongoClient, ObjectId } from "mongodb";

const logonUsers = new Map();

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

const client = new MongoClient(destConnString);

let db;

async function connectToDB() {
  if (!db) {
    await client.connect();
    db = client.db(dbMongo);
  }
  return db;
}

function idConvert(id) {
  const objId = Number(id).toString(16).padStart(24, "0");
  return new ObjectId(objId);
}

async function getAllData() {
  const db = await connectToDB();
  return db.collection("data").find({}).toArray();
}

async function getDataById(id) {
  const db = await connectToDB();
  return db.collection("data").findOne({ _id: idConvert(id) });
}

async function addData({ id, Firstname, Surname, userid }) {
  const db = await connectToDB();
  const objId = idConvert(id);
  await db.collection("data").insertOne({
    _id: objId,
    Firstname,
    Surname,
    userid,
  });
  return await db.collection("data").findOne({ _id: objId });
}

async function deleteDataById(id) {
  const db = await connectToDB();
  const objId = idConvert(id);
  await db.collection("data").deleteOne({ _id: objId });
  return true;
}

async function updateData({ id, newData }) {
  const db = await connectToDB();
  const objId = idConvert(id);

  const result = await db
    .collection("data")
    .updateOne({ _id: objId }, { $set: newData });
  return result.modifiedCount > 0;
}

//This function was generated with help of AI
async function getUsersRecords() {
  const db = await connectToDB();
  return db
    .collection("users")
    .aggregate([
      {
        $lookup: {
          from: "data",
          localField: "username",
          foreignField: "userid",
          as: "records",
        },
      },
      {
        $project: {
          _id: 0,
          username: 1,
          userRecords: {
            $size: "$records",
          },
        },
      },
      {
        $match: {
          userRecords: {
            $gte: 1,
          },
        },
      },
    ])
    .toArray();
}

async function findUser(username) {
  const db = await connectToDB();
  return db.collection("users").findOne({ username });
}

export {
  getUsersRecords,
  updateData,
  deleteDataById,
  addData,
  findUser,
  getAllData,
  getDataById,
  logonUsers,
};
