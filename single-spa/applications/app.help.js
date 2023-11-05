import { apps } from "./apps";

export const NOT_LOADED = 'NOT_LOADED'; // 应用默认状态是未加载状态
export const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE'; // 正在加载文件资源
export const NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED"; // 没有调用bootstrap
export const BOOTSTRAPPING = "BOOTSTRAPPING"; // 在启动中 bootstrap调用完毕后，需要表示成没有挂载
export const NOT_MOUNTED = "NOT_MOUNTED "; // 
export const MOUNTED = "MOUNTED";
export const UNMOUNTING = "UNMOUNTING";

// 当前应用是否被挂载 状态是不是MOUNTED
export function isActive (app) {
    return app.status === MOUNTED;
}

// 路径匹配到才会加载应用
export function shouldBeActive(app) {
    return app.activeWhen(window.location);
}

// todo
export function getAppChanges() {
    const appsToLoad = [];
    const appsToMount = [];
    const appsToUnmount = [];

    // 状态流转

    apps.forEach(app => {
        const appShouldBeActive = shouldBeActive(app);  // 看一下这个app是否需要加载
        switch (app.status) {
            case NOT_LOADED: 
            case LOADING_SOURCE_CODE:
                if (appShouldBeActive) {
                    appsToLoad(app); // 没有被加载就是要去加载的app
                }
                break;
            case NOT_BOOTSTRAPPED: 

            case NOT_MOUNTED: 
               if (appShouldBeActive) {
                appsToMount.push(app);
               }
               break;
            case MOUNTED: 
                if(!appShouldBeActive) {
                    appsToMount.push(app);
                }
                break;
            default:
                break;
        }

        
    });


    return { appsToLoad, appsToMount, appsToUnmount }

    
}



