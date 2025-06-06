import { DataSource } from "typeorm";
import { User } from "./entity/User";  // Entity class ka naam 'User' aur file ka naam User.ts maan rahe hain
// Aapki aur bhi entities yahan import ho sakti hain

export const AppDataSource = new DataSource({
  type: "mongodb",
  url: process.env.MONGODB_URL || "mongodb://localhost:27017", // Aapka MongoDB connection URL
  database: process.env.DB_NAME || "yourdatabase",
  synchronize: true, // Development ke liye true rakh sakte hain, production mein false aur schema management alag se karein
  logging: true, // Development ke liye logging enable kar sakte hain
  entities: [User], // Aapki User entity
  // migrations MongoDB ke saath SQL jaisa istemal nahi hota.
  subscribers: [],
});
