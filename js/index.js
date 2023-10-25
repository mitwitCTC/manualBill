import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const Api = 'https://0931-122-116-23-30.ngrok-free.app'

let ticketModal = null;
let deleteTicketModal = null;

createApp({
    data() {
        return {
            isLoading: false,
            tickets: [],
            tempTicket: {},
            isNewTicket: false, // 用來確認新增或編輯場站
            stations: [],
            searchData: {}, // 未繳費列表搜尋
            stationId: '',
            companyId: '',
            userId: '',
            user: '',
            paidSearchData: {}, // 繳費紀錄搜尋區間
            paidTickets: [], // 繳費紀錄列表
        }
    },
    methods: {
        logOut() {
            const logOutApi = `${Api}/redeemdb/main/logOut`
            axios
                .post(logOutApi)
                .then((response => {
                    alert(response.data.message);
                    sessionStorage.removeItem("car_in_manual");
                    sessionStorage.removeItem("account");
                    sessionStorage.removeItem("id");
                    sessionStorage.removeItem("companyId");
                    window.location = `login.html`;
                }));
        },
        checkLogin() {
            if (sessionStorage.getItem('car_in_manual')) {
                this.companyId = sessionStorage.getItem('c');
                // this.user = sessionStorage.getItem('account');
                this.user = unescape(atob(sessionStorage.getItem('account')));
                this.userId = sessionStorage.getItem('id')
                this.getStations()
                // this.getInfos();
            } else {
                alert("請登入");
                window.location = 'login.html'
            }
        },
        // 取場站列表
        getStations() {
            const getStationsApi = `${Api}/redeemdb/main/staionId`;
            axios
                .post(getStationsApi, { target: { companyId: this.companyId } })
                .then((response) => {
                    this.stations = response.data;
                    this.stationId = response.data[0].id // 預設為第一個場站
                    this.paidSearchData.stationId = response.data[0].id // 繳費紀錄頁預設為第一個場站
                    this.getInfos();
                })
        },
        // 取個別未繳費資訊
        getInfos() {
            this.isLoading = true;
            const getInfosApi = `${Api}/redeemdb/main/Info`;
            const cantFindArea = document.querySelector('.cantFind-Area');
            axios
                .post(getInfosApi, { target: { stationId: this.stationId } })
                .then((response) => {
                    this.tickets = response.data;
                    if (this.tickets.length > 0) {
                        this.getOrganizedInfos();
                        cantFindArea.classList.remove('block');
                    } else {
                        cantFindArea.classList.add('block');
                    }
                    this.isLoading = false;
                })
        },
        getOrganizedInfos() {
            // 整合場站名稱至在場資訊列表
            this.stations.forEach(itemA => {
                // 查找所有匹配的項目
                const matchingItemsB = this.tickets.filter(itemB => itemA.id === itemB.stationId);
                // 將每个匹配的項目添加到在場資訊列表中
                matchingItemsB.forEach(matchingItemB => {
                    matchingItemB.name = itemA.name;
                });
            });
        },
        openTicketModal(status, ticket) {
            ticketModal.show();
            if (status === 'create') {
                this.isNewTicket = true;
                this.tempTicket = {};
                if (this.tempTicket.parkingType == "多日車") {
                    this.tempTicket.payAmount = 0;
                }
            } else if (status === 'edit') {
                if (this.tempTicket.arrivalTime != undefined || this.tempTicket.time_limit != undefined) {
                    this.tempTicket.arrivalTime = this.tempTicket.arrivalTime.split('T')[0] + ' ' + this.tempTicket.arrivalTime.split('T')[1];
                    // this.tempTicket.time_limit = this.tempTicket.time_limit.split('T')[0] + ' ' + this.tempTicket.time_limit.split('T')[1];
                }
                this.isNewTicket = false;
                this.tempTicket = Object.assign({}, ticket);
                this.tempTicket.time_limit = this.tempTicket.time_limit.split(' ')[0] + 'T' + this.tempTicket.time_limit.split(' ')[1];
            }
            // 恢复页面滚动位置，保持提交表单前的滚动位置
            const { scrollX, scrollY } = window;
            setTimeout(() => {
                window.scrollTo(scrollX, scrollY);
            }, 0);
        },
        openDeleteTicketModal(ticket) {
            this.tempTicket = Object.assign({}, ticket);
            deleteTicketModal.show();
            // 恢复页面滚动位置，保持提交表单前的滚动位置
            const { scrollX, scrollY } = window;
            setTimeout(() => {
                window.scrollTo(scrollX, scrollY);
            }, 0);
        },
        updateTicket() {
            let updateTicketApi = `${Api}/redeemdb/main/createInfo`
            if (this.isNewTicket) {
                this.tempTicket.arrivalTime = this.tempTicket.arrivalTime.split('T')[0] + ' ' + this.tempTicket.arrivalTime.split('T')[1];
                this.tempTicket.time_limit = moment().add(1, 'days').endOf('day').format("YYYY-MM-DD HH:mm:ss");
                this.tempTicket.createUser = this.user;
                axios
                    .post(updateTicketApi, { target: this.tempTicket })
                    .then((response) => {
                        if (this.tempTicket.parkingType == "多日車") {
                            this.tempTicket.payAmount = 0;
                        }
                        alert(response.data.message);
                        this.getInfos();
                    })
                ticketModal.hide();
            } else {
                updateTicketApi = `${Api}/redeemdb/main/updateInfo/${this.tempTicket.id}`;
                this.tempTicket.time_limit = this.tempTicket.time_limit.split('T')[0] + ' ' + this.tempTicket.time_limit.split('T')[1];
                axios
                    .put(updateTicketApi, { target: this.tempTicket })
                    .then((response) => {
                        alert(response.data.message);
                        this.getInfos();
                    })
                ticketModal.hide();
            }
            // 恢复页面滚动位置，保持提交表单前的滚动位置
            const { scrollX, scrollY } = window;
            setTimeout(() => {
                window.scrollTo(scrollX, scrollY);
            }, 0);
        },
        deleteTicket() {
            const deleteTicketApi = `${Api}/redeemdb/main/deleteInfo/${this.tempTicket.id}`;
            axios
                .patch(deleteTicketApi, { target: { deleteUser: this.user } })
                .then((response) => {
                    alert(response.data.message)
                    // console.log(response.data);
                    this.getInfos();
                })
            deleteTicketModal.hide();
            // 恢复页面滚动位置，保持提交表单前的滚动位置
            const { scrollX, scrollY } = window;
            setTimeout(() => {
                window.scrollTo(scrollX, scrollY);
            }, 0);
        },
        // 搜尋
        search(searchData) {
            this.isLoading = true;
            const searchDataApi = `${Api}/redeemdb/main/searchInfo`;
            const cantFindArea = document.querySelector('.cantFind-Area');
            cantFindArea.classList.remove('block');
            this.searchData.stationId = this.stationId;
            if (this.searchData.plate == '') {
                alert('請輸入車牌號碼搜尋')
            } else {
                axios
                    .post(searchDataApi, { target: this.searchData })
                    .then((response) => {
                        this.tickets = response.data.data;
                        if (response.data.message == '查詢成功') {
                            this.getOrganizedInfos();
                            cantFindArea.classList.remove('block');
                        } else if (response.data.message == '查無車號') {
                            cantFindArea.classList.add('block');
                        }
                        this.isLoading = false;
                    })
            }

        },
        // 清除搜尋
        clearSearch() {
            this.getInfos();
            const cantFindArea = document.querySelector('.cantFind-Area');
            cantFindArea.classList.remove('block');
            document.getElementById('search').value = "";
        },
        // 繳費紀錄搜尋
        paidSearch() {
            this.isLoading = true;
            this.paidSearchData.stationId = this.stationId;
            const paidSearchApi = `${Api}/redeemdb/main/searchTransaction`;
            const cantFindPaidArea = document.querySelector('#cantFind-Area');
            if (this.paidSearchData.startDate == undefined || this.paidSearchData.endDate == undefined) {
                alert('日期不得為空');
                this.isLoading = false;
            } else if (this.paidSearchData.startDate > this.paidSearchData.endDate) {
                alert('選擇區間有誤，請重新選擇');
                this.isLoading = false;
            } else {
                axios
                    .post(paidSearchApi, { target: this.paidSearchData })
                    .then((response) => {
                        this.paidTickets = response.data;
                        if (this.paidTickets.length == 0) {
                            cantFindPaidArea.classList.add('block');
                        } else if (this.paidTickets.length > 0) {
                            cantFindPaidArea.classList.remove('block');
                        }
                        this.isLoading = false;
                    })
            }
        }
    },
    mounted() {
        this.checkLogin();
        // this.getStations();
        // this.getInfos();
        ticketModal = new bootstrap.Modal('#ticketModal');
        deleteTicketModal = new bootstrap.Modal('#deleteTicketModal');
    }
}).mount('#app')
