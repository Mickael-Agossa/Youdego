import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const openapi = require('./docs/openapi.json');

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Regrouper toutes les routes sous /api
app.use('/api', routes);

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));

export default app;