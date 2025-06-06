"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
// src/utils/validate.ts
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validateBody = (dtoClass) => {
    return async (req, res, next) => {
        const output = (0, class_transformer_1.plainToInstance)(dtoClass, req.body);
        const errors = await (0, class_validator_1.validate)(output);
        if (errors.length > 0) {
            res.status(400).json({
                message: "Validation failed",
                errors: errors.map(err => ({
                    property: err.property,
                    constraints: err.constraints,
                })),
            });
            return;
        }
        req.body = output;
        next();
    };
};
exports.validateBody = validateBody;
