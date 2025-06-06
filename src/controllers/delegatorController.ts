// import { Request, Response } from "express";
// import { exec } from "child_process";
// import { fromBech32 } from "@cosmjs/encoding";
// import dotenv from "dotenv";

// dotenv.config();

// const baseCmd = () =>
//   `--chain-id ${process.env.CHAIN_ID_LOCAL} --gas auto --gas-prices ${process.env.GAS_PRICES} --gas-adjustment 1.2 --keyring-backend ${process.env.KEYRING_BACKEND}`;

// const convertEthmToEthereum = (ethmAddress: string): string => {
//   const decoded = fromBech32(ethmAddress);
//   return "0x" + Buffer.from(decoded.data).toString("hex");
// };

// export const generateDelegatorKeys = async (req: Request, res: Response) => {
//   const { email } = req.body;
//   console.log(email,"LLLLLLL");
  
//   const username = email.split("@")[0];
//   const homeDir = `~/.${username}`;
//   const cmd1 = `ethermintd keys add ${username} --algo eth_secp256k1 --keyring-backend test --home ${homeDir}`;

//   exec(cmd1, (err, stdout, stderr) => {
//     if (err) {
//       return res.status(500).json({ error: stderr });
//     }

//     try {
//       const addressMatch = stdout.match(/address:\s*(.*)/);
//       const nameMatch = stdout.match(/name:\s*(.*)/);

//       const address = addressMatch?.[1]?.trim();
//       const name = nameMatch?.[1]?.trim();

//       const getEthAddress = convertEthmToEthereum(address || "");

//       return res.status(200).json({
//         message: "Delegator key created",
//         data: { name, address, getEthAddress },
//         success: true,
//       });
//     } catch (e) {
//       console.error("Parsing error:", e);
//       return res.status(500).json({
//         message: "Unexpected error while parsing CLI output",
//         success: false,
//       });
//     }
//   });
// };
