// /home/ubuntu/Delegator_Validator_Services/src/entity/User.ts
import { Entity, ObjectIdColumn, Column, ObjectId } from "typeorm";

@Entity("users") // Collection ka naam 'users' rakhna accha practice hai
export class User { // Yahan class ka naam 'User' hai
  @ObjectIdColumn()
  _id!: ObjectId; // MongoDB _id field ka istemal karta hai

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  otp?: string;

  @Column('bigint', { nullable: true }) // Storing timestamp as bigint
  otpExpiry?: number;

  // ...aur bhi columns ho sakte hain
}
