import dotenv from "dotenv";
dotenv.config(); 

import {
  KMSClient,
  EncryptCommand,
  DecryptCommand,
} from "@aws-sdk/client-kms";

const client = new KMSClient({ region: process.env.AWS_REGION || "ap-south-1" });

const kmsKeyId = process.env.KMS_KEY_ID;

export const encryptMnemonic = async (mnemonic: string): Promise<string> => {

  const command = new EncryptCommand({
    KeyId: kmsKeyId,
    Plaintext: Buffer.from(mnemonic),
  });

  const response = await client.send(command);
  console.log(response,"response");
  

  return Buffer.from(response.CiphertextBlob!).toString("base64");
};

export const decryptMnemonic = async (encrypted: string): Promise<string> => {
  const command = new DecryptCommand({
    CiphertextBlob: Buffer.from(encrypted, "base64"),
  });

  const response = await client.send(command);
  return Buffer.from(response.Plaintext!).toString("utf-8");
};
