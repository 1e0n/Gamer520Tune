// ==UserScript==
// @name         Close520Dialog
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  移除gamer520.com网站上的sweetalert2弹窗
// @author       Trae
// @match        *://*.gamer520.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 移除拦截 XMLHttpRequest 和 fetch 的代码
    // 移除 MutationObserver 相关代码
    // 移除处理已存在脚本的代码

    // 等待原始 Swal 对象加载完成
    const waitForSwal = setInterval(() => {
        if (window.Swal) {
            clearInterval(waitForSwal);
            
            // 保存原始的 Swal 对象
            const originalSwal = window.Swal;
            
            // 创建代理对象
            const swalHandler = {
                get: function(target, prop) {
                    if (prop === 'fire' || prop === 'mixin') {
                        return function(...args) {
                            console.log('Swal调用参数:', JSON.stringify(args, null, 2));
                            
                            // 检查是否是需要拦截的弹窗
                            if (args[0] && args[0].html && 
                                args[0].html.includes('全球白嫖网') && 
                                args[0].html.includes('notify-content')) {
                                console.log('已拦截欢迎弹窗');
                                return Promise.resolve();
                            }
                            
                            // 使用原始 Swal 处理其他弹窗
                            return originalSwal[prop].apply(originalSwal, args);
                        };
                    }
                    // 返回原始 Swal 的其他属性
                    return originalSwal[prop];
                }
            };
            
            // 设置新的代理对象
            window.Swal = new Proxy(originalSwal, swalHandler);
            
            // 防止被重写
            Object.defineProperty(window, 'Swal', {
                configurable: false,
                writable: false
            });
        }
    }, 100);

})();