import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";

let server: Server | null = null;

export const startTestServer = async (
  port: number = 0
): Promise<{ server: Server; port: number }> => {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close();
    }

    server = app.listen(port, () => {
      const address = server!.address();
      const actualPort =
        typeof address === "object" && address ? address.port : port;
      console.log(`Test server started on port ${actualPort}`);
      resolve({ server: server!, port: actualPort });
    });

    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.log(`Port ${port} in use, trying random port...`);
        server = app.listen(0, () => {
          const address = server!.address();
          const actualPort =
            typeof address === "object" && address ? address.port : 0;
          console.log(`Test server started on port ${actualPort}`);
          resolve({ server: server!, port: actualPort });
        });
      } else {
        reject(error);
      }
    });
  });
};

export const stopTestServer = async (): Promise<void> => {
  // Close HTTP server
  if (server) {
    await new Promise<void>((resolve) => {
      server!.close((err) => {
        if (err) {
          console.error("Error closing server:", err);
        }
        server = null;
        console.log("Test server stopped");
        resolve();
      });
    });
  }

  // Close MongoDB connection
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    }
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
  }
};
