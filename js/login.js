import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const Api = 'http://192.168.50.94:5010'


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
            const loginApi = `${Api}/redeemdb/car_in_manual/login`;
            axios
            .post(loginApi, {target: this.user})
            .then((response) => {
                if(response.data.returnCode == 0){
                    alert(response.data.message);
                    window.location = 'index.html';
                    sessionStorage.setItem("car_in_manual", response.data.data.token);
                }else if(response.data.returnCode == 400){
                    alert(response.data.message)
                }
            })
        },
        checkLogin() {
            if (sessionStorage.getItem('car_in_manual')) {
                alert("已登入，即將跳轉頁面")
                window.location = 'index.html'
            }
        },
    },
    mounted() {
        this.checkLogin();
     }
}).mount('#app');