import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export async function waitForTxConfirmation(
  txhash: string,
  retries = 15,
  delay = 3000
): Promise<any> {
  let attempts = 0;

  while (attempts < retries) {
    try {
      const { stdout, stderr } = await execAsync(
        `ethermintd query tx ${txhash} --node ${process.env.TCP_URL} -o json`
      );

      if (stderr.includes("ERROR")) throw new Error(stderr);

      const tx = JSON.parse(stdout);

      if (tx.code !== undefined && tx.code !== 0) {
        return tx; // tx failed
      }

      if (tx.txhash) {
        return tx; // success
      }

    } catch (err: any) {
      if (++attempts >= retries) {
        throw new Error("Confirmation timeout or error: " + err.message);
      }
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error("Confirmation timeout");
}
