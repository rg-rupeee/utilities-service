import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import http from 'http';

import logger, { stream } from '@utils/logger';
import Config from '@config/environment';
import { connectDatabases } from './databases';
import errorHandler from '@middlewares/error.middleware';

class App {
  public app: express.Application;
  public port: string | number;
  public server: http.Server;

  constructor() {
    this.app = express();
    this.port = Config.envVars.PORT;

    this.initializeApp();
  }

  public listen() {
    this.server = this.app.listen(this.port, () => {
      logger.info(`server listening on port :: ${this.port}`);
    });
    return this.server;
  }

  public registerProcessEventHandlers() {
    process.on('SIGTERM', () => {
      logger.error('SIGTERM RECEIVED. Shutting down gracefully');
      this.server.close(() => {
        logger.info('Process terminated!');
      });
    });

    process.on('SIGINT', () => {
      logger.error('SIGTERM RECEIVED. Shutting down gracefully');
      this.server.close(() => {
        logger.info('Process terminated!');
      });
    });
  }

  private async initializeApp() {
    await this.validateEnvironmentConfig();
    await this.connectDatabases();
    this.initializeMiddlewares();
    this.registerErrorHandler();
  }

  private async validateEnvironmentConfig() {
    logger.info('validating environment configuration');
    await Config.validate();
  }

  private async connectDatabases() {
    logger.info('connecting to databases ...');
    await connectDatabases();
  }

  private initializeMiddlewares() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(xss());
    this.app.use(mongoSanitize());
    this.app.use(compression());
    this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(morgan('combined', { stream }));
  }

  private registerErrorHandler() {
    this.app.use(errorHandler);
  }
}

export default App;
