import { reroute } from "./reroute";

function urlRoute () {

    reroute();

}

window.addEventListener('hashchange', urlRoute);

window.addEventListener('popstate', urlRoute);


const routerEvents = ['hashchange', 'popstate']
// 子应用 里面也可能会有路由系统 需要先加载父应用的事件，再去调用子应用
// 需要先加载父应用 在加载子应用 父应用调用 =》 子路由

export const capturedEventListeners = { // 父应用加载完子应用后再触发
    hashchange: [],
    popstate: []
}

const originalEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

window.addEventListener = function (eventName, fn) {
    if (routerEvents.includes(eventName) && !capturedEventListeners[eventName].some(i => fn == i)) {
        return capturedEventListeners[eventName].push(fn);
    }

    return originalEventListener.apply(this, fn);
}

window.removeEventListener = function (eventName, fn) {
    if (routerEvents.includes(eventName)) {
        return capturedEventListeners[eventName] = capturedEventListeners[eventName].filter(i => fn !== i);
    }

    return originalRemoveEventListener.apply(this, fn);
}

// 如果是history.pushstate
history.pushState = function () {
    window.dispatchEvent(new PopStateEvent('popstate'));
}

setTimeout(() => {
    console.log(capturedEventListeners);

}, 1000)

