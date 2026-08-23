import express, {
    type Application,
    type Request,
    type Response,
} from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from './config';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { notFound } from './middleware/notFound';
import router from './routes';

// Application App
const app: Application = express();

//Cors
app.use(
    cors({
        origin: config.frontend_url,
        credentials: true,
    }),
);
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Enable URL-encoded form data parsing / parser
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// application routes
app.use('/api/v1', router);

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.send(`
        <div style="
            min-height: 100vh;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            background: #010816;
            color: #ffffff;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
        ">

            <div style="
                width: 90%;
                max-width: 900px;
                text-align: center;
                padding: 50px 30px;
            ">

                <!-- ForgeIQ Logo -->
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 25px;
                ">

                    <svg
                        width="52"
                        height="52"
                        viewBox="0 0 52 52"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <!-- Hexagon -->
                        <path
                            d="M26 3L46 14.5V37.5L26 49L6 37.5V14.5L26 3Z"
                            fill="#3B82F6"
                        />

                        <!-- Inner hexagon -->
                        <path
                            d="M26 13L37 19.3V32.7L26 39L15 32.7V19.3L26 13Z"
                            fill="#010816"
                        />

                        <!-- Center mark -->
                        <circle
                            cx="26"
                            cy="26"
                            r="4"
                            fill="#FFFFFF"
                        />
                    </svg>

                    <div style="
                        font-size: 32px;
                        font-weight: 800;
                        letter-spacing: -1px;
                    ">
                        <span style="color: #ffffff;">Forge</span><span style="color: #3B82F6;">IQ</span>
                    </div>

                </div>

                <!-- Main Heading -->
                <h1 style="
                    margin: 0;
                    font-size: 46px;
                    font-weight: 800;
                    letter-spacing: -1.5px;
                ">
                    Backend Server
                </h1>

                <!-- Description -->
                <p style="
                    max-width: 650px;
                    margin: 20px auto 30px;
                    color: #CBD5E1;
                    font-size: 17px;
                    line-height: 1.7;
                ">
                    Industrial intelligence and predictive maintenance platform
                    designed to predict problems, prevent downtime, and
                    maximize machine performance.
                </p>

                <!-- Server Status -->
                <div style="
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 22px;
                    border: 1px solid rgba(59, 130, 246, 0.35);
                    border-radius: 999px;
                    background: rgba(59, 130, 246, 0.08);
                    color: #3B82F6;
                    font-size: 15px;
                    font-weight: 600;
                ">
                    <span style="
                        width: 9px;
                        height: 9px;
                        background: #22C55E;
                        border-radius: 50%;
                        display: inline-block;
                        box-shadow: 0 0 12px rgba(34, 197, 94, 0.8);
                    "></span>

                    Backend Server is Running
                </div>

                <!-- API Cards -->
                <div style="
                    margin-top: 45px;
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    flex-wrap: wrap;
                ">

                    <div style="
                        padding: 14px 22px;
                        background: #01081D;
                        border: 1px solid #1E293B;
                        border-radius: 10px;
                        color: #94A3B8;
                        font-size: 14px;
                    ">
                        API
                        <strong style="color: #22C55E;">
                            Online
                        </strong>
                    </div>

                    <div style="
                        padding: 14px 22px;
                        background: #01081D;
                        border: 1px solid #1E293B;
                        border-radius: 10px;
                        color: #94A3B8;
                        font-size: 14px;
                    ">
                        Environment
                        <strong style="color: #3B82F6;">
                            Development
                        </strong>
                    </div>

                    <div style="
                        padding: 14px 22px;
                        background: #01081D;
                        border: 1px solid #1E293B;
                        border-radius: 10px;
                        color: #94A3B8;
                        font-size: 14px;
                    ">
                        Status
                        <strong style="color: #22C55E;">
                            Healthy
                        </strong>
                    </div>

                </div>

                <!-- Footer -->
                <p style="
                    margin-top: 60px;
                    color: #475569;
                    font-size: 13px;
                ">
                    © 2026 ForgeIQ · Industrial Intelligence Platform
                </p>

            </div>
        </div>
    `);
});

// Global Error Handler
app.use(globalErrorHandler);

// Not Found
app.use(notFound);

export default app;
