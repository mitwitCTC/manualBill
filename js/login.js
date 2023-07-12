import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';


let loginCheckData = {};

createApp({
    data() {
        return {
            // login
            user: {
                account: '',
                password: '',
            },
        }
    },
    methods: {
        // login
        login() {
            if (this.user.account !== "admin" || this.user.password !== "admin") {
                alert("帳號或密碼錯誤");
            } else {
                alert("登入成功");
                    window.location = 'index.html';
                    sessionStorage.setItem("user", this.user.account);
            };
        },
        checkLogin() {
            if (sessionStorage.getItem('user') == 'admin') {
                window.location = 'index.html'
            }
        },
    },
    mounted() {
        this.checkLogin();
     }
}).mount('#app');