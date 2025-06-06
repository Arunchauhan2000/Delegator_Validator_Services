"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const delegatorController_1 = require("../controllers/delegatorController");
const validate_1 = require("../utils/validate");
const CreateDelegatorDto_1 = require("../dtos/CreateDelegatorDto");
const SetWithdrawAddressDto_1 = require("../dtos/SetWithdrawAddressDto");
const DelegatorStakingDto_1 = require("../dtos/DelegatorStakingDto");
const router = express_1.default.Router();
router.post("/generateDelegatorKeys", (0, validate_1.validateBody)(CreateDelegatorDto_1.CreateDelegatorDto), delegatorController_1.generateDelegatorKeys);
router.post("/setExternalWithdrawAddress", (0, validate_1.validateBody)(SetWithdrawAddressDto_1.SetWithdrawAddressDto), delegatorController_1.setExternalWithdrawAddress);
router.post("/delegateTokenToValidator", (0, validate_1.validateBody)(DelegatorStakingDto_1.DelegatorStakingDto), delegatorController_1.delegatorStaking);
router.post("/getBalance", delegatorController_1.getBalance);
router.post("/getRewards", delegatorController_1.getRewards);
exports.default = router;
