import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const Api = 'https://545a-122-116-23-30.ngrok-free.app'


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
            const loginApi = `${Api}/redeemdb/main/login`;
            axios
            .post(loginApi, {target: this.user})
            .then((response) => {
                if(response.data.returnCode == 0){
                    const account = btoa(escape(response.data.data.account))
                    alert(response.data.message);
                    window.location = 'index.html';
                    sessionStorage.setItem("car_in_manual", response.data.data.token);
                    // sessionStorage.setItem("account", response.data.data.account);
                    sessionStorage.setItem("account", account);
                    sessionStorage.setItem("id", response.data.data.id);
                    sessionStorage.setItem("c", response.data.data.companyId);
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