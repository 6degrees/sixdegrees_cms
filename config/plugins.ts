import type {Core} from '@strapi/strapi';

const allowedMediaTypes = [
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.*',
    'text/plain',
    'text/csv',
];

const deniedExecutableTypes = [
    'application/vnd.microsoft.portable-executable',
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/x-executable',
    'application/x-dosexec',
    'application/x-sh',
    'text/x-shellscript',
    'application/x-mach-binary',
];

const config = ({env}: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
    'users-permissions': {
        config: {
            jwtManagement: 'refresh',
            sessions: {
                httpOnly: true,
            },
        },
    },
    email: {
        config: {
            provider: '@3xweb/strapi-provider-email-resend',
            providerOptions: {
                apiKey: env('RESEND_API_KEY'),
            },
            settings: {
                defaultFrom: env('SMTP_FROM'),
                defaultReplyTo: env('SMTP_FROM'),
            },
        },
    },
    upload: {
        config: {
            provider: 'aws-s3',
            providerOptions: {
                s3Options: {
                    credentials: {
                        accessKeyId: env('S3_ACCESS_KEY_ID'),
                        secretAccessKey: env('S3_ACCESS_SECRET'),
                    },
                    region: env('S3_REGION'),
                    endpoint: env('S3_ENDPOINT'),
                    forcePathStyle: true,
                    params: {
                        Bucket: env('S3_BUCKET'),
                        ACL: 'public-read',
                    },
                },
            },
            actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
            },
            breakpoints: {
                xlarge: 1920,
                large: 1000,
                medium: 750,
                small: 500,
                xsmall: 64,
            },
            sizeLimit: 500 * 1024 * 1024,
            security: {
                allowedTypes: allowedMediaTypes,
                deniedTypes: deniedExecutableTypes,
            },
        },
    },
});

export default config;