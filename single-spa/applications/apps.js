/**
 * 
 * @param {*} appName 应用名称
 * @param {*} loadApp bootstrap mount unmount
 * @param {*} activateWhen 
 * @param {*} custom 
 */



import { NOT_LOADED } from "./app.help";
import { reroute } from "../navigation/reroute";
// import { start } from "../single-spa";


export const apps = []; // 这里存放所有的应用

export function registerApplication(appName, loadApp, activateWhen, custom) {
    const registeration = {
        name: appName,
        loadApp,
        activateWhen,
        customProps,
        status: NOT_LOADED
    }

    apps.push(registeration);

    // 需要加载应用，注册完毕后，需要进行加载的应用
    reroute(); // 重写路径，后续切换路由后再次做这些事情

}

// eg.
// registerApplication(
//     'app1',
//     async () => {return app1 },
//     location => location.hash === '#/a', // 路径匹配到后会加载应用
//     customProps
// )

// start();

// window.addEventListener('hashchange', () => {
//     console.log('hashchange');
// })