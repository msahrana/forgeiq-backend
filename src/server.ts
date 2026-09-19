import app from './app';
import config from './config';
import { transporter } from './lib/nodemailer';
import { prisma } from './lib/prisma';
import { redisClient } from './lib/redis';
import {
    seedFactoryManager,
    seedMaintenanceEngineer,
    seedOrgOwner,
    seedProductionManager,
    seedSuperAdmin,
    seedTesterExecutive,
    seedTesterTechnician,
} from './utils/seed';

const PORT = config.port;

const main = async () => {
    try {
        await prisma.$connect();
        console.log('🗃️  Database connected successfully!');

        await redisClient.connect();
        console.log('🔥 Redis Connected Successfully.');

        await transporter.verify();
        console.log('⭐ Nodemailer Connected Successfully.');

        await seedSuperAdmin();
        await seedOrgOwner();
        await seedFactoryManager();
        await seedProductionManager();
        await seedMaintenanceEngineer();
        await seedTesterExecutive();
        await seedTesterTechnician();

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting the server:', error);

        await prisma.$disconnect();
        process.exit(1);
    }
};

main();
