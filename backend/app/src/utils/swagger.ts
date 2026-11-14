import path from 'node:path';
import swaggerAutogen from 'swagger-autogen';

// docs: https://swagger-autogen.github.io/docs/
const outputFile = path.resolve('src/swagger.json');
const endpointsFiles = [path.resolve('src/routes/**/*.ts')];
const doc = {
    info: {
        title: 'Comic Reader API',
        description: 'Comic Reader backend API',
        version: '1.0.0',
    },
    servers: [{
        url: 'http://localhost:5090/api/auth',
        description: 'Local server',
    }],
    components: { // 共用元件
        securitySchemes: {
            cookieAuth: { type: 'apiKey', in: 'cookie', name: 'sid' },
        }
    },
};

await swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
