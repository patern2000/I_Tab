import { defineConfig } from '@umijs/max';
import routes from './src/config/router/routes';

export default defineConfig({
    antd: {},
    dva: {},
    routes: routes,
    npmClient: 'yarn',
    favicons: ['/favicon.ico'],
    title: `I_Tab`,
});
