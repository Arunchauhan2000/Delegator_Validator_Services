"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForTxConfirmation = waitForTxConfirmation;
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execAsync = util_1.default.promisify(child_process_1.exec);
async function waitForTxConfirmation(txhash, retries = 15, delay = 3000) {
    let attempts = 0;
    while (attempts < retries) {
        try {
            const { stdout, stderr } = await execAsync(`ethermintd query tx ${txhash} --node ${process.env.TCP_URL} -o json`);
            if (stderr.includes("ERROR"))
                throw new Error(stderr);
            const tx = JSON.parse(stdout);
            if (tx.code !== undefined && tx.code !== 0) {
                return tx; // tx failed
            }
            if (tx.txhash) {
                return tx; // success
            }
        }
        catch (err) {
            if (++attempts >= retries) {
                throw new Error("Confirmation timeout or error: " + err.message);
            }
            await new Promise((r) => setTimeout(r, delay));
        }
    }
    throw new Error("Confirmation timeout");
}
