import { Router } from 'express';
import { login, logout, createUser, deleteUser } from '../controllers/authController.js';

const router = Router();

router.post('/login',
    /* #swagger.tags = ['Auth']
        #swagger.summary = '登入'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["username", "password"],
                        properties: {
                            username: { type: "string", example: "alice" },
                            password: { type: "string", format: "password", example: "secret" }
                        }
                    }
                }
            }
    } */
    login
);

router.post('/createUser',
    /* #swagger.tags = ['Auth']
        #swagger.summary = '創建'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["username", "password"],
                        properties: {
                            username: { type: "string", example: "alice" },
                            password: { type: "string", format: "password", example: "secret" }
                        }
                    }
                }
            }
        }
    */
    createUser
);

router.post('/logout',
    /*
        #swagger.tags = ['Auth']
        #swagger.summary = '登出'
    */
    logout
);

router.post('/deleteUser',
    /* #swagger.tags = ['Auth']
        #swagger.summary = '刪除'
        #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["username"],
                    properties: {
                        username: { type: "string", example: "alice" }
                    }
                }
            }
        }
    } */
    deleteUser
);

export default router;
