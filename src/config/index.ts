import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,

    database_url: process.env.DATABASE_URL,

    backend_url: process.env.BACKEND_URL,
    frontend_url: process.env.FRONTEND_URL,

    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

    jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,

    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,

    google_client_id: process.env.GOOGLE_CLIENT_ID!,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET!,

    super_admin_name: process.env.SUPER_ADMIN_NAME!,
    super_admin_email: process.env.SUPER_ADMIN_EMAIL!,
    super_admin_password: process.env.SUPER_ADMIN_PASSWORD!,

    org_owner_name: process.env.ORG_OWNER_NAME!,
    org_owner_email: process.env.ORG_OWNER_EMAIL!,
    org_owner_password: process.env.ORG_OWNER_PASSWORD!,

    factory_manager_name: process.env.FACTORY_MANAGER_NAME!,
    factory_manager_email: process.env.FACTORY_MANAGER_EMAIL!,
    factory_manager_password: process.env.FACTORY_MANAGER_PASSWORD!,

    production_manager_name: process.env.PRODUCTION_MANAGER_NAME!,
    production_manager_email: process.env.PRODUCTION_MANAGER_EMAIL!,
    production_manager_password: process.env.PRODUCTION_MANAGER_PASSWORD!,

    maintenance_engineer_name: process.env.MAINTENANCE_ENGINEER_NAME!,
    maintenance_engineer_email: process.env.MAINTENANCE_ENGINEER_EMAIL!,
    maintenance_engineer_password: process.env.MAINTENANCE_ENGINEER_PASSWORD!,

    tester_executive_name: process.env.TESTER_EXECUTIVE_NAME!,
    tester_executive_email: process.env.TESTER_EXECUTIVE_EMAIL!,
    tester_executive_password: process.env.TESTER_EXECUTIVE_PASSWORD!,

    tester_technician_name: process.env.TESTER_TECHNICIAN_NAME!,
    tester_technician__email: process.env.TESTER_TECHNICIAN_EMAIL!,
    tester_technician__password: process.env.TESTER_TECHNICIAN_PASSWORD!,

    redis_user: process.env.REDIS_USER!,
    redis_password: process.env.REDIS_PASSWORD!,
    redis_host: process.env.REDIS_HOST!,
    redis_port: process.env.REDIS_PORT!,

    smtp_user: process.env.SMTP_USER!,
    smtp_password: process.env.SMTP_PASSWORD!,
    email_sender: process.env.EMAIL_SENDER!,

    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY!,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET!,

    stripe_product_price_id: process.env.STRIPE_PRODUCT_PRICE_ID!,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
};
