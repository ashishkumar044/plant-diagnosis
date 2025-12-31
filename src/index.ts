import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import router from './routes';

const app = new Koa();
const rootRouter = router;
const port = process.env.PORT || 3000;

app.use(bodyParser());

// Global Error Handler
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err: any) {
        console.error('Server Error:', err);
        ctx.status = err.status || 500;
        ctx.body = {
            error: 'Internal Server Error',
            message: err.message,
        };
    }
});

rootRouter.get('/', (ctx) => {
    ctx.body = { message: 'Plant Diagnosis Backend - MVP' };
});

app.use(rootRouter.routes());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
