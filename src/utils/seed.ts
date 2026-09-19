import bcrypt from 'bcryptjs';

import config from '../config';
import { prisma } from '../lib/prisma';

import httpStatus from 'http-status';
import {
    TechnicianStatus,
    TechnicianType,
    UserRole,
} from '../../generated/prisma/enums';
import AppError from '../errors/AppError';

//create super admin
export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await prisma.user.findFirst({
            where: {
                role: UserRole.SUPER_ADMIN,
            },
        });

        if (isSuperAdminExist) {
            console.log('👑 Super Admin Already Exists!');
            return;
        }

        const name = config.super_admin_name;
        const email = config.super_admin_email;
        const password = config.super_admin_password;

        if (!name || !email || !password) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Super Admin Name , Email, Password Missing In Env File!!!',
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(config.bcrypt_salt_rounds),
        );

        const superAdmin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.SUPER_ADMIN,
                needPasswordChange: false,
                emailVerified: true,
            },
        });

        console.log('👑 Super Admin Created : ', superAdmin);
    } catch (error) {
        console.log('Error Seeding Super Admin : ', error);

        await prisma.user.delete({
            where: {
                email: config.super_admin_email,
            },
        });
    }
};

//create Org Owner
export const seedOrgOwner = async () => {
    try {
        const isOrgOwnerExist = await prisma.user.findUnique({
            where: {
                email: config.org_owner_email,
            },
        });

        if (isOrgOwnerExist) {
            console.log('🏢 Org Owner Already Exists!');
            return;
        }

        const name = config.org_owner_name;
        const email = config.org_owner_email;
        const password = config.org_owner_password;

        if (!name || !email || !password) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Org Owner Name , Email, Password Missing In Env File!!!',
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(config.bcrypt_salt_rounds),
        );

        const orgOwner = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.ORG_OWNER,
                needPasswordChange: false,
                emailVerified: true,
            },
        });

        console.log('🏢 Org Owner Created : ', orgOwner);
    } catch (error) {
        console.log('Error Seeding Org Owner : ', error);

        await prisma.user.delete({
            where: {
                email: config.org_owner_email,
            },
        });
    }
};

//create Factory Manager
export const seedFactoryManager = async () => {
    try {
        const isFactoryManagerExist = await prisma.user.findUnique({
            where: {
                email: config.factory_manager_email,
            },
        });

        if (isFactoryManagerExist) {
            console.log('🏭 Factory Manager Already Exists!');
            return;
        }

        const name = config.factory_manager_name;
        const email = config.factory_manager_email;
        const password = config.factory_manager_password;

        if (!name || !email || !password) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Factory Manager Name , Email, Password Missing In Env File!!!',
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(config.bcrypt_salt_rounds),
        );

        const factoryManager = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.FACTORY_MANAGER,
                needPasswordChange: false,
                emailVerified: true,
            },
        });

        console.log('🏭 Factory Manager Created : ', factoryManager);
    } catch (error) {
        console.log('Error Seeding Factory Manager : ', error);

        await prisma.user.delete({
            where: {
                email: config.factory_manager_email,
            },
        });
    }
};

//create Production Manager
export const seedProductionManager = async () => {
    try {
        const isProductionManagerExist = await prisma.user.findUnique({
            where: {
                email: config.production_manager_email,
            },
        });

        if (isProductionManagerExist) {
            console.log('📊 Production Manager Already Exists!');
            return;
        }

        const name = config.production_manager_name;
        const email = config.production_manager_email;
        const password = config.production_manager_password;

        if (!name || !email || !password) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Production Manager Name , Email, Password Missing In Env File!!!',
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(config.bcrypt_salt_rounds),
        );

        const productionManager = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.PRODUCTION_MANAGER,
                needPasswordChange: false,
                emailVerified: true,
            },
        });

        console.log('📊 Production Manager Created : ', productionManager);
    } catch (error) {
        console.log('Error Seeding Production Manager : ', error);

        await prisma.user.delete({
            where: {
                email: config.production_manager_email,
            },
        });
    }
};

//create Maintenance Engineer
export const seedMaintenanceEngineer = async () => {
    try {
        const isMaintenanceEngineerExist = await prisma.user.findUnique({
            where: {
                email: config.maintenance_engineer_email,
            },
        });

        if (isMaintenanceEngineerExist) {
            console.log('🔧 Maintenance Engineer Already Exists!');
            return;
        }

        const name = config.maintenance_engineer_name;
        const email = config.maintenance_engineer_email;
        const password = config.maintenance_engineer_password;

        if (!name || !email || !password) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Maintenance Engineer Name , Email, Password Missing In Env File!!!',
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(config.bcrypt_salt_rounds),
        );

        const maintenanceEngineer = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.MAINTENANCE_ENGINEER,
                needPasswordChange: false,
                emailVerified: true,
            },
        });

        console.log('🔧 Maintenance Engineer Created : ', maintenanceEngineer);
    } catch (error) {
        console.log('Error Seeding Maintenance Engineer : ', error);

        await prisma.user.delete({
            where: {
                email: config.maintenance_engineer_email,
            },
        });
    }
};

//create Tester Executive
export const seedTesterExecutive = async () => {
    try {
        const isTesterExecutiveExist = await prisma.user.findUnique({
            where: {
                email: config.tester_executive_email,
            },
        });

        if (isTesterExecutiveExist) {
            console.log('🧪 Tester Executive Already Exists!');
            return;
        }

        const name = config.tester_executive_name;
        const email = config.tester_executive_email;
        const password = config.tester_executive_password;

        if (!name || !email || !password) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Tester Executive Name , Email, Password Missing In Env File!!!',
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(config.bcrypt_salt_rounds),
        );

        const testerExecutive = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.EXECUTIVE,
                needPasswordChange: false,
                emailVerified: true,
            },
        });

        console.log('🧪 Tester Executive Created : ', testerExecutive);
    } catch (error) {
        console.log('Error Seeding Tester Executive : ', error);

        await prisma.user.delete({
            where: {
                email: config.tester_executive_email,
            },
        });
    }
};

//create Tester Technician
export const seedTesterTechnician = async () => {
    try {
        const isTechnicianExist = await prisma.user.findUnique({
            where: {
                email: config.tester_technician__email,
            },
        });

        if (isTechnicianExist) {
            console.log('🛠️  Tester Technician Already Exists!');
            return;
        }

        const name = config.tester_technician_name;
        const email = config.tester_technician__email;
        const password = config.tester_technician__password;

        if (!name || !email || !password) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Tester Technician Name, Email, Password Missing In Env File!!!',
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(config.bcrypt_salt_rounds),
        );

        const testerTechnician = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.TECHNICIAN,
                needPasswordChange: false,
                emailVerified: true,

                technician: {
                    create: {
                        employeeCode: 'TECH-TEST-001',
                        specialization: TechnicianType.GENERAL,
                        experience: 5,
                        status: TechnicianStatus.ACTIVE,
                    },
                },
            },

            include: {
                technician: true,
            },
        });

        console.log('🛠️  Tester Technician Created:', testerTechnician);
    } catch (error) {
        console.log('Error Seeding Tester Technician:', error);

        const existingUser = await prisma.user.findUnique({
            where: {
                email: config.tester_technician__email,
            },
        });

        if (existingUser) {
            await prisma.user.delete({
                where: {
                    email: config.tester_technician__email,
                },
            });
        }
    }
};
