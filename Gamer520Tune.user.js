// ==UserScript==
// @name         Gamer520Tune
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  移除gamer520.com网站上的sweetalert2弹窗
// @author       Trae
// @match        *://*.gamer520.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    console.log('脚本开始执行');

    // 定义一个函数来处理 Swal 对象
    function setupSwalProxy() {
        const originalSwal = window.Swal;
        const swalHandler = {
            get: function(target, prop) {
                if (prop === 'fire' || prop === 'mixin') {
                    return function(...args) {
                        console.log('Swal调用参数:', JSON.stringify(args, null, 2));
                        
                        if (args[0] && args[0].html && 
                            args[0].html.includes('全球白嫖网') && 
                            args[0].html.includes('notify-content')) {
                            console.log('已拦截欢迎弹窗');
                            return Promise.resolve();
                        }
                        
                        return originalSwal[prop].apply(originalSwal, args);
                    };
                }
                return originalSwal[prop];
            }
        };
        
        // 设置代理并防止被重写
        Object.defineProperty(window, 'Swal', {
            value: new Proxy(originalSwal, swalHandler),
            configurable: false,
            writable: false
        });
    }

    // 使用 Object.defineProperty 来监听 Swal 对象的创建
    let swalValue = window.Swal;
    Object.defineProperty(window, 'Swal', {
        configurable: true,
        get: function() {
            return swalValue;
        },
        set: function(newValue) {
            console.log('检测到 Swal 对象被设置');
            swalValue = newValue;
            setupSwalProxy();
        }
    });

    // 如果 Swal 已经存在，直接设置代理
    if (window.Swal) {
        console.log('Swal 对象已存在，直接设置代理');
        setupSwalProxy();
    }

    // 保留原有的密码处理功能
    window.addEventListener('load', handlePasswordPage);
})();


function handlePasswordPage() {
    const passwordForm = document.querySelector('form[action*="wp-login.php"]');
    if (passwordForm) {
        const passwordInput = passwordForm.querySelector('input[type="password"]');
        const submitButton = passwordForm.querySelector('input[type="submit"]');
        const pageContent = document.body.textContent;
        const passwordMatch = pageContent.match(/密码保护：(\d+|[A-Z]\d+)/);
        
        if (passwordMatch && passwordMatch[1]) {
            passwordInput.value = passwordMatch[1];
            submitButton.click();
        }
    }
}