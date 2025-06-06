"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptMnemonic = exports.encryptMnemonic = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client_kms_1 = require("@aws-sdk/client-kms");
const client = new client_kms_1.KMSClient({ region: process.env.AWS_REGION || "ap-south-1" });
const kmsKeyId = process.env.KMS_KEY_ID;
const encryptMnemonic = async (mnemonic) => {
    const command = new client_kms_1.EncryptCommand({
        KeyId: kmsKeyId,
        Plaintext: Buffer.from(mnemonic),
    });
    const response = await client.send(command);
    console.log(response, "response");
    return Buffer.from(response.CiphertextBlob).toString("base64");
};
exports.encryptMnemonic = encryptMnemonic;
const decryptMnemonic = async (encrypted) => {
    const command = new client_kms_1.DecryptCommand({
        CiphertextBlob: Buffer.from(encrypted, "base64"),
    });
    const response = await client.send(command);
    return Buffer.from(response.Plaintext).toString("utf-8");
};
exports.decryptMnemonic = decryptMnemonic;
