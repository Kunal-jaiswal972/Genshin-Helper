// import { disconnectFromDatabase, connectToDatabase } from "./db/conn.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(201).json("Hello moto!");
});

// connectToDatabase()
//   .then(() => {
//     app.listen(PORT, () =>
//       console.log(
//         `Server Open On http://localhost:${PORT} & Connected To Database 🤟`
//       )
//     );
//   })
//   .catch((err) => {
//     disconnectFromDatabase();
//     console.log("Cannot Connect To Database", err);
//   });

try {
  app.listen(PORT, () => {
    console.log(`Server connected to http://localhost:${PORT}`);
  });
} catch (error) {
  console.log("Cannot connect to server");
}
