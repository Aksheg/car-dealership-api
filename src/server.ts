import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGODB_URI!)
    .then(() => {
      console.log("Connected to MongoDB");
      const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });

      process.on("unhandledRejection", (err: Error) => {
        console.error("Unhandled Rejection:", err.name, err.message);
        server.close(() => {
          mongoose.disconnect();
          process.exit(1);
        });
      });

      process.on("SIGTERM", () => {
        console.log("SIGTERM received");
        server.close(() => {
          mongoose.disconnect();
          process.exit(0);
        });
      });

      process.on("SIGINT", () => {
        console.log("SIGINT received");
        server.close(() => {
          mongoose.disconnect();
          process.exit(0);
        });
      });
    })
    .catch((error) => {
      console.error("Database connection failed:", error);
      process.exit(1);
    });
}

process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err.name, err.message);
  process.exit(1);
});
