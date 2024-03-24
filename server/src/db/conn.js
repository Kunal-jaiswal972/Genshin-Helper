import { connect, disconnect } from "mongoose";

async function connectToDatabase() {
  try {
    // mongoose.set("strictQuery", true);
    await connect(process.env.MONGODB_URL);
  } catch (error) {
    console.log(error);
    throw new Error("Could Not Connect To MongoDB");
  }
}

async function disconnectFromDatabase() {
  try {
    await disconnect();
  } catch (error) {
    console.log(error);
    throw new Error("Could Not Disconnect From MongoDB");
  }
}

export { connectToDatabase, disconnectFromDatabase };
