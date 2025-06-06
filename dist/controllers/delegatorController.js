"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delegatorStaking = exports.setExternalWithdrawAddress = exports.getRewards = exports.getBalance = exports.generateDelegatorKeys = exports.getPrivateKeyFromMnemonic = void 0;
const child_process_1 = require("child_process");
const encoding_1 = require("@cosmjs/encoding");
const dotenv_1 = __importDefault(require("dotenv"));
const kmsService_1 = require("../services/kmsService");
const usersModel_1 = __importDefault(require("../models/usersModel"));
const delegatorModel_1 = __importDefault(require("../models/delegatorModel"));
const TransactionModel_1 = __importDefault(require("../models/TransactionModel"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const os_1 = __importDefault(require("os"));
const ethers_1 = require("ethers");
const waitForTxConfirmation_1 = require("../utils/waitForTxConfirmation");
const yaml = require("js-yaml");
const baseCmd = () => `--chain-id ${process.env.CHAIN_ID} --gas auto --gas-prices ${process.env.GAS_PRICES} --gas-adjustment 1.4 --keyring-backend ${process.env.KEYRING_BACKEND}`;
dotenv_1.default.config();
const execPromise = util_1.default.promisify(child_process_1.exec);
const convertEthmToEthereum = (ethmAddress) => {
    const decoded = (0, encoding_1.fromBech32)(ethmAddress);
    return "0x" + Buffer.from(decoded.data).toString("hex");
};
const getPrivateKeyFromMnemonic = (mnemonicStr) => {
    const mnemonic = ethers_1.Mnemonic.fromPhrase(mnemonicStr);
    const wallet = ethers_1.HDNodeWallet.fromMnemonic(mnemonic);
    return wallet.privateKey;
};
exports.getPrivateKeyFromMnemonic = getPrivateKeyFromMnemonic;
const generateDelegatorKeys = async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
        res.status(400).json({ success: false, message: "Invalid email format" });
        return;
    }
    const username = email.split("@")[0];
    const userHomeDir = path_1.default.join(os_1.default.homedir(), `.${username}`);
    const keyringPath = path_1.default.join(os_1.default.homedir(), `.${username}`, "keyring-test");
    const cmd = `ethermintd keys add ${username} --algo eth_secp256k1 --keyring-backend test --home ${userHomeDir} --output json`;
    try {
        const existingUser = await usersModel_1.default.findOne({ email });
        if (existingUser?.walletAddress) {
            res.status(201).json({
                success: false,
                message: "Wallet address already exists for this user",
                data: { email },
            });
            return;
        }
        if (!existingUser) {
            res.status(201).json({
                success: false,
                message: "user not exist",
                data: { email },
            });
            return;
        }
        const { stdout } = await execPromise(cmd);
        const parsed = JSON.parse(stdout);
        const { address, name, mnemonic } = parsed;
        const encryptedMnemonic = await (0, kmsService_1.encryptMnemonic)(mnemonic);
        try {
            const result = await usersModel_1.default.findOneAndUpdate({ email }, {
                $set: {
                    username,
                    walletAddress: address,
                    encryptedMnemonic,
                    isUserActive: true,
                    createdAt: new Date(),
                },
            });
            console.log("Update result:");
        }
        catch (error) {
            console.error("Error during findOneAndUpdate:", error);
        }
        if (fs_1.default.existsSync(keyringPath)) {
            fs_1.default.rmSync(keyringPath, { recursive: true, force: true });
            console.log(`Deleted keyring folder: ${keyringPath}`);
        }
        res.status(200).json({
            success: true,
            message: "Delegator key created",
            data: {
                name,
                address,
                ethAddress: convertEthmToEthereum(address),
            },
        });
    }
    catch (err) {
        console.error("Error during key creation or DB update:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.generateDelegatorKeys = generateDelegatorKeys;
const getBalance = (req, res) => {
    const { ethm1WalletAddress } = req.body;
    console.log(ethm1WalletAddress, typeof (ethm1WalletAddress));
    if (!ethm1WalletAddress || typeof ethm1WalletAddress !== "string") {
        res.status(400).json({ error: "Missing or invalid 'address' in request body." });
        return;
    }
    if (!ethm1WalletAddress.toLowerCase().startsWith("ethm1")) {
        res.status(400).json({ error: "Invalid Address Format. `ethm1...` address required." });
        return;
    }
    const cmd = `ethermintd query bank balances ${ethm1WalletAddress}`;
    console.log(cmd);
    (0, child_process_1.exec)(cmd, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({
                message: stderr || error.message,
                success: false
            });
        }
        try {
            const parsedOutput = yaml.load(stdout);
            console.log(parsedOutput);
            res.status(200).json({
                message: "balance fetched",
                data: parsedOutput,
                success: true
            });
        }
        catch (error) {
            console.error('Error parsing YAML:', error);
            return res.status(500).json({
                message: (error instanceof Error) ? error.message : String(error),
                success: false
            });
        }
    });
};
exports.getBalance = getBalance;
const getRewards = (req, res) => {
    const { ethm1WalletAddress } = req.body;
    const cmd = `ethermintd query distribution rewards ${ethm1WalletAddress}`;
    if (!ethm1WalletAddress || typeof ethm1WalletAddress !== "string") {
        res.status(400).json({ error: "Missing or invalid 'address' in request body." });
        return;
    }
    if (!ethm1WalletAddress.toLowerCase().startsWith("ethm1")) {
        res.status(400).json({ error: "Invalid Address Format. `ethm1...` address required." });
        return;
    }
    (0, child_process_1.exec)(cmd, (error, stdout, stderr) => {
        if (error)
            return res.status(500).json({
                message: stderr,
                success: false
            });
        ;
        try {
            const parsedOutput = yaml.load(stdout);
            console.log(parsedOutput);
            return res.status(200).json({
                message: "Rewards fetched",
                data: parsedOutput,
                success: true
            });
        }
        catch (error) {
            console.error('Error parsing YAML:', error);
            return res.status(500).json({
                message: (error instanceof Error) ? error.message : String(error),
                success: false
            });
        }
    });
};
exports.getRewards = getRewards;
const setExternalWithdrawAddress = async (req, res) => {
    const { withdrawAddress, email } = req.body;
    if (!withdrawAddress || !email) {
        res.status(400).json({ error: "Missing 'withdrawAddress' or 'email'" });
        return;
    }
    if (!withdrawAddress.toLowerCase().startsWith("0x")) {
        res.status(400).json({ error: "Invalid format: must start with 0x" });
        return;
    }
    const username = email.split("@")[0];
    const homeDir = path_1.default.join(os_1.default.homedir(), `.${username}`);
    const keyringBackend = "test";
    const nodeUrl = process.env.TCP_URL;
    try {
        const user = await usersModel_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (!user.encryptedMnemonic || user.encryptedMnemonic.trim() === "") {
            res.status(400).json({ error: "Wallet not generated or encrypted mnemonic missing" });
            return;
        }
        if (user.withdrawWalletAddress && user.isWithdrawAddressSet) {
            res.status(400).json({ error: "Withdraw address already set" });
            return;
        }
        const mnemonic = await (0, kmsService_1.decryptMnemonic)(user.encryptedMnemonic);
        console.log(mnemonic);
        await execPromise(`echo "${mnemonic}" | ethermintd keys add ${username} --recover --home ${homeDir} --keyring-backend ${keyringBackend}`);
        const balanceCmd = `ethermintd query bank balances "$(ethermintd keys show ${username} --home ${homeDir} --keyring-backend ${keyringBackend} -a)" --node ${nodeUrl}`;
        const { stdout: balOut } = await execPromise(balanceCmd);
        const balanceMatch = balOut.match(/amount: "(\d+)"/);
        const balance = balanceMatch ? parseInt(balanceMatch[1], 10) : 0;
        if (balance < 7) {
            await execPromise(`ethermintd keys delete ${username} --home ${homeDir} --keyring-backend ${keyringBackend} -y`);
            throw new Error("Insufficient balance for gas fee");
        }
        const { stdout: bechOut } = await execPromise(`ethermintd debug addr ${withdrawAddress}`);
        const match = bechOut.match(/Bech32 Acc:\s+(\w+)/);
        if (!match)
            throw new Error("Bech32 address not found");
        const bech32Addr = match[1];
        const txCmd = `ethermintd tx distribution set-withdraw-addr ${bech32Addr} --from ${username} --home ${homeDir} ${baseCmd()} --node ${nodeUrl} -y -o json`;
        console.log(txCmd, "txCmd");
        const { stdout: txOut } = await execPromise(txCmd);
        const txResult = JSON.parse(txOut);
        console.log(txResult);
        await execPromise(`ethermintd keys delete ${username} --home ${homeDir} --keyring-backend ${keyringBackend} -y`);
        const txhash = txResult.txhash;
        if (!txhash)
            throw new Error("Transaction hash not returned");
        const confirmed = await (0, waitForTxConfirmation_1.waitForTxConfirmation)(txhash);
        if (confirmed.code !== 0) {
            res.status(500).json({
                error: "Transaction failed after broadcast",
                rawLog: confirmed.raw_log || confirmed.rawLog,
                code: confirmed.code,
                txhash,
            });
            return;
        }
        try {
            const updateResult = await usersModel_1.default.updateOne({ email }, {
                $set: {
                    withdrawWalletAddress: withdrawAddress,
                    isWithdrawAddressSet: true,
                },
            });
            console.log("MongoDB update result:", updateResult);
        }
        catch (updateErr) {
            console.error("MongoDB update error:", updateErr);
            res.status(500).json({ error: "Failed to update withdraw address info in DB" });
            return;
        }
        res.status(200).json({
            message: "Withdraw address set successfully",
            hash: txhash,
            confirmedTx: confirmed,
        });
    }
    catch (err) {
        console.error("Withdraw address error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
};
exports.setExternalWithdrawAddress = setExternalWithdrawAddress;
const delegatorStaking = async (req, res) => {
    const { email, validatorOperatorAddress, amount } = req.body;
    const username = email.split('@')[0];
    const homeDir = path_1.default.join(os_1.default.homedir(), `.${username}`);
    const nodeUrl = process.env.TCP_URL;
    try {
        const user = await usersModel_1.default.findOne({ email });
        const validator = await usersModel_1.default.findOne({ validatorOperatorAddress });
        if (!user) {
            res.status(404).json({ error: 'User not found.' });
            return;
        }
        if (!validator) {
            res.status(404).json({ error: 'Validator not found.' });
            return;
        }
        if (!user.encryptedMnemonic || user.encryptedMnemonic.trim() === '') {
            res.status(400).json({ error: 'Wallet not generated or encrypted mnemonic missing' });
            return;
        }
        if (!user.walletAddress || !user.isWithdrawAddressSet) {
            res.status(400).json({ error: 'Wallet address not set or withdraw address not configured.' });
            return;
        }
        const mnemonic = await (0, kmsService_1.decryptMnemonic)(user.encryptedMnemonic);
        const recoverCmd = `echo "${mnemonic}" | ethermintd keys add ${username} --home ${homeDir} --recover --keyring-backend test`;
        await execPromise(recoverCmd);
        try {
            const getBalanceCmd = `ethermintd query bank balances "$(ethermintd keys show ${username} --home ${homeDir} --keyring-backend test -a)" --node ${nodeUrl}`;
            const { stdout: balanceOut } = await execPromise(getBalanceCmd);
            const balanceMatch = balanceOut.match(/amount: "(\d+)"/);
            const balance = balanceMatch ? parseInt(balanceMatch[1], 10) : 0;
            if (balance < 700000) {
                res.status(400).json({ error: 'Insufficient funds for gas fee', balance });
                return;
            }
            const delegateCmd = `ethermintd tx staking delegate ${validatorOperatorAddress} ${amount}aphoton --home ${homeDir} --from=${username} ${baseCmd()} -y`;
            const { stdout: txOut } = await execPromise(delegateCmd);
            const txHashMatch = txOut.match(/txhash:\s*([A-F0-9]+)/i);
            const txHash = txHashMatch ? txHashMatch[1] : null;
            const codeMatch = txOut.match(/code:\s*0\b/);
            if (!txHash || !codeMatch) {
                res.status(500).json({ error: 'Transaction failed or incomplete', raw: txOut });
                return;
            }
            const confirmed = await (0, waitForTxConfirmation_1.waitForTxConfirmation)(txHash);
            if (!confirmed || confirmed.code !== 0) {
                res.status(500).json({
                    error: 'Transaction failed after broadcast',
                    reason: confirmed.raw_log || 'Unknown error',
                    code: confirmed.code,
                    txHash,
                });
                return;
            }
            const validatorEntry = {
                validatorId: validator._id,
                validatorWalletAddress: validator.walletAddress,
                amount: amount.toString(),
                validatorUsername: validator.username,
                createdAt: new Date(),
            };
            try {
                const delegator = await delegatorModel_1.default.findOne({ userId: user._id });
                if (delegator) {
                    delegator.validators.push(validatorEntry);
                    await delegator.save();
                }
                else {
                    await delegatorModel_1.default.create({
                        userId: user._id,
                        email: user.email,
                        walletAddress: user.walletAddress,
                        validators: [validatorEntry],
                    });
                }
            }
            catch (dbErr) {
                console.error('Failed to update DelegatorModel:', dbErr);
                res.status(500).json({
                    error: 'Delegation confirmed but failed to update delegator record',
                    dbError: dbErr.message,
                });
                return;
            }
            try {
                await TransactionModel_1.default.create({
                    txHash,
                    fromAddress: user.walletAddress,
                    toAddress: validator.walletAddress,
                    amount: amount.toString(),
                    txType: 'stake',
                    txTypeId: 2,
                    delegatorId: user._id,
                    validatorId: validator._id,
                    validatorOperatorAddress: validatorOperatorAddress,
                    timestamp: new Date(),
                });
            }
            catch (txErr) {
                console.error('Failed to save transaction:', txErr);
                res.status(500).json({
                    error: 'Delegation confirmed but failed to log transaction',
                    dbError: txErr.message,
                });
                return;
            }
            res.status(200).json({
                message: 'Token delegated successfully',
                hash: txHash,
                confirmedTx: confirmed.raw,
            });
        }
        finally {
            const deleteCmd = `ethermintd keys delete ${username} --home ${homeDir} --keyring-backend test -y`;
            await execPromise(deleteCmd);
        }
    }
    catch (err) {
        console.error('Delegator staking error:', err);
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
};
exports.delegatorStaking = delegatorStaking;
