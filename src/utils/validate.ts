// src/utils/validate.ts
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export const validateBody = (dtoClass: any) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const output = plainToInstance(dtoClass, req.body);
    const errors = await validate(output);

            console.log("Validation errors:", JSON.stringify(errors, null, 2)); // Debugging line
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
