import Router from 'koa-router';
import diagnoseRouter from './diagnose';

const router = new Router();

router.use('/api', diagnoseRouter.routes(), diagnoseRouter.allowedMethods());

export default router;
