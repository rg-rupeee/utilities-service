import { NextFunction, Request, Response } from 'express';

import logger from '@/utils/logger';
import { validationPipe } from '@utils/validation';

const validationMiddleware =
  (validationSchema: any, path: 'params' | 'body' | 'query' | 'headers') =>
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await validationPipe(validationSchema, {
      ...req[path],
    });

    if (result !== true) {
      logger.error(result);
      return res.status(400).json({
        success: false,
        validation_path: path,
        errors: [...result],
      });
    }

    next();

    return true;
  };

export default validationMiddleware;
