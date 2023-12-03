import {
  LOADING_SOURCE_CODE,
  MOUNTED,
  NOT_BOOTSTRAPPED,
  NOT_LOADED,
  NOT_MOUNTED,
  UNMOUNTING,
  getAppChanges,
  shouldBeActive,
} from "../applications/app.help";
import { capturedEventListeners } from "./navigation-events"; 
import { started } from "../start";

function flatternFnArray(fns) {
  fns = Array.isArray(fns) ? fns : [fns];
  return function (customProps) {
    // promise 将多个promise组合成一个promise链
    return fns.reduce((resultPromise, fn) => {
      resultPromise.then(() => fn(customProps));
    }, Promise.resolve());
  };
}

function toLoadPromise(app) {
  return Promise.resolve().then(() => {
    // 获取应用的钩子方法和接入协议
    if (app.status !== NOT_LOADED) {
      return app;
    }
    app.status = LOADING_SOURCE_CODE;

    // 传进来的三个函数 bootstrap mount unmount
    app.loadApp().then((val) => {
      const { bootstrap, mount, unmount } = val;
      app.status = NOT_BOOTSTRAPPED;
      app.bootstrap = flatternFnArray(bootstrap);
      app.mount = flatternFnArray(mount);
      app.ummount = flatternFnArray(unmount);
      // bootstrap();
      return app;
    });
  });
}

// 需要预先去加载应用，预先加载

function loadApps(appsToLoad) {
  const loadPromises = appsToLoad.map(toLoadPromise);
  return Promise.all(loadPromises);
}

function toUnmountPromise(app) {
  return Promise.resolve().then(() => {
    // 如果不是挂载状态 直接跳出
    if (app.status !== MOUNTED) {
      return app;
    }

    app.status = UNMOUNTING; // 标记成正在卸载 调用卸载逻辑 标记成未挂载

    return app.unmount(app.customProps).then(() => {
      app.status = NOT_MOUNTED;
      return app;
    });
  });
}

function toBootstrapPromise(app) {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_BOOTSTRAPPED) {
      return app;
    }
    return app.bootstrap(app.customProps).then(() => {
      app.status = NOT_MOUNTED;
      return app;
    });
  });
}

function toMountPromise(app) {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_MOUNTED) {
      return app;
    }
    return app.mount(app.customProps).then(() => {
      app.status = MOUNTED;
      return app;
    });
  });
}

// a -> b b -> a a -> b
function tryBootstrapAndMount(app, unmountPromises) {
  return Promise.resolve().then(() => {
    if (shouldBeActive(app)) {
      return toBootstrapPromise(app).then((app) => {
        /*********************************** */
        // 拿到对象去循环
        console.log('路由切换');
        capturedEventListeners.hashchange.forEach(element => {
            element();
        });
        unmountPromises.then(() => toMountPromise(app));
      });
    }
  });
}

function performAppChanges(appsToUnmount, appsToLoad) {
  // 需要调用bootstrap mount unmount
  // 应用启动了 需要卸载不需要的应用
  // 挂载需要的
  const unmountPromises = Promise.all(appsToUnmount.map(toUnmountPromise));

  // toLoadPrmise(app) 需要拿到加载完成的app继续  .then()
  appsToLoad.map((app) =>
    toLoadPromise(app).then((app) => tryBootstrapAndMount(app, unmountPromises))
  );
   

  // 有可能是start异步加载 此时laodapp已经被调用过了 需要直接挂载就好了
  appsToMount.map(app => tryBootstrapAndMount(app, unmountPromises))
}

export function reroute() {
  // reroute中 我需要知道 我要挂载哪个应用 要卸载哪个应用

  // 根据当所有应用过滤出 不同的应用类型
  const { appsToLoad, appsToMount, appsToUnmount } = getAppChanges(); // 根据应用的状态去加载

  if (started) {
    return performAppChanges(appsToUnmount, appsToLoad);
  }

  return loadApps(appsToLoad); // 应用加载 把钩子函数拿到
}


// registerAPP 注册应用和实现应用的加载
// start 实现应用的启动和加载
