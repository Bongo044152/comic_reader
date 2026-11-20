import path from 'node:path';
import swaggerAutogen from 'swagger-autogen';

// docs: https://swagger-autogen.github.io/docs/
const outputFile = path.resolve('src/swagger.json');
// 只掃對外的 route；管理用的 userRoute 在 4096，不能出現在公開文件
const endpointsFiles = [path.resolve('src/routes/authRoute.ts')];
const doc = {
    info: {
        title: 'Comic Reader API',
        description: 'Comic Reader backend API',
        version: '1.0.0',
    },
    servers: [{ url: '/' }],
    components: { // 共用元件
        securitySchemes: {
            cookieAuth: { type: 'apiKey', in: 'cookie', name: 'sid' },
        }
    },
};

await swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
