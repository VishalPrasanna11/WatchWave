import { Router } from 'express';
import { createUser, updateUser, getUser } from '../controllers/user.Controller';
import { basicAuth } from '../middlewares/auth'
;

const router = Router();

const timeRequest = (resource: string, method: string, handler: Function) => {
    return async (req: any, res: any) => {
        const startTime = Date.now();
        try {
            await handler(req, res);
        } finally {
        }
    };
};


router.post(
    '/user/',
   
    timeRequest('user', 'create', createUser),
    () => {
       
    }
);


router.head('/user/self', (req, res) => {

    res.status(405).send();
});


router.get(
    '/user/self',
    basicAuth,
    timeRequest('user', 'get', getUser),
    () => {
    }
);


router.put(
    '/user/self',
    basicAuth,
    timeRequest('user', 'update', updateUser),
    () => {
      
    }
);


router.all('/user/self', (req, res) => {
    res.status(405).send();
});

export default router;
