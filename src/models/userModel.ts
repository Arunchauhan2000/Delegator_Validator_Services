// src/models/userModel.ts

export interface User {
    email: string;
    passwordHash: string;
    otp?: string;
    otpExpiry?: number;
  }
  
  const users: User[] = [];
  
  export const findUserByEmail = (email: string) =>
    users.find((user) => user.email === email);
  
  export const saveUser = (user: User) => {
    users.push(user);
  };
  
  export const updateUser = (email: string, data: Partial<User>) => {
    const user = findUserByEmail(email);
    if (user) {
      Object.assign(user, data);
    }
  };
  