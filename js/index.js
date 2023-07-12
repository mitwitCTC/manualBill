import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const Api = 'https://317f-114-36-58-201.ngrok-free.app'

let ticketModal = null;
let deleteTicketModal = null;

createApp({
    data() {
        return {
            tickets: [
                // {
                //     id: 1,
                //     parkNames: "應安總公司",
                //     station:
                //     {
                //         stationName: '測試',
                //         stationId: 1
                //     },
                //     plate: 'AAA-111',
                //     type: '臨停會員',
                //     arrivalTime: '2023-05-05 15:15:15',
                //     fee: 100,
                //     time_limit: '2023-05-05 23:59:59',
                //     notes: '備註111'
                // },
            ],
            tempTicket: {
            },
            isNewTicket: false, // 用來確認新增或編輯場站
            parkNames: ['應安總公司', '助安總公司', '及泰總公司'],
            stations: [],
            searchData: ''
        }
    },
    methods: {
        checkLogin() {
            if (sessionStorage.getItem('user') == 'admin') {
                // const userValue =  sessionStorage.getItem('user');
                this.getStations()
                this.getInfos();
            }else{
                alert("請登入");
                window.location = 'login.html'
            }
        },
        getStations() {
            const getStationsApi = `${Api}/car_in_manual/staionId`;
            axios
                .get(getStationsApi)
                .then((response) => {
                    // console.log(response.data);
                    this.stations = response.data;
                })
        },
        getInfos() {
            const getInfosApi = `${Api}/car_in_manual/Info`;
            axios
                .get(getInfosApi)
                .then((response) => {
                    // console.log(response.data);
                    this.tickets = response.data;
                })
        },
        openTicketModal(status, ticket) {
            ticketModal.show();
            if (status === 'create') {
                this.isNewTicket = true;
                this.tempTicket = {};
                let currentTime = new Date();
                this.tempTicket.time_limit = moment(new Date(currentTime.setMinutes(currentTime.getMinutes() + 30))).format("YYYY-MM-DD HH:mm:ss");
                // console.log('this.tempTicket.time_limit', this.tempTicket.time_limit);
                if (this.tempTicket.parkingType == "多日車") {
                    this.tempTicket.payAmount = 0;
                }
            } else if (status === 'edit') {
                this.isNewTicket = false;
                this.tempTicket = Object.assign({}, ticket);
            }
        },
        openDeleteTicketModal(ticket) {
            this.tempTicket = Object.assign({}, ticket);
            deleteTicketModal.show();
        },
        updateTicket() {
            if (this.tempTicket.arrivalTime != undefined || this.tempTicket.time_limit != undefined) {
                this.tempTicket.arrivalTime = this.tempTicket.arrivalTime.split('T')[0] + ' ' + this.tempTicket.arrivalTime.split('T')[1];
                this.tempTicket.time_limit = this.tempTicket.time_limit.split('T')[0] + ' ' + this.tempTicket.time_limit.split('T')[1];
            }
            let updateTicketApi = `${Api}/car_in_manual/createInfo`
            if (this.isNewTicket) {
                let currentTime = new Date();
                this.tempTicket.time_limit = moment(new Date(currentTime.setMinutes(currentTime.getMinutes() + 30))).format("YYYY-MM-DD HH:mm:ss");
                axios
                    .post(updateTicketApi, { target: this.tempTicket })
                    .then((response) => {
                        if (this.tempTicket.parkingType == "多日車") {
                            this.tempTicket.payAmount = 0;
                        }
                        alert(response.data.message);
                        this.getInfos();
                    })
                // console.log(this.tempTicket);
                ticketModal.hide();
            } else {
                updateTicketApi = `${Api}/car_in_manual/updateInfo/${this.tempTicket.id}`;
                axios
                    .put(updateTicketApi, { target: this.tempTicket })
                    .then((response) => {
                        alert(response.data.message);
                        this.getInfos();
                    })
                ticketModal.hide();
            }
        },
        deleteTicket() {
            const deleteTicketApi = `${Api}/car_in_manual/deleteInfo/${this.tempTicket.id}`;
            axios
                .patch(deleteTicketApi)
                .then((response) => {
                    alert(response.data.message);
                    // console.log(response.data);
                    this.getInfos();
                })
            deleteTicketModal.hide();
        },
        // 搜尋
        search(searchData) {
            const searchDataApi = `${Api}/car_in_manual/searchInfo`;
            const cantFindArea = document.querySelector('.cantFind-Area');
            axios
                .post(searchDataApi, { target: { plate: this.searchData } })
                .then((response) => {
                    // console.log(response.data.data);
                    this.tickets = response.data.data;
                    // console.log("this.tickets", this.tickets);
                    // console.log(this.tickets.length);
                    this.tickets.length > 0
                        ? cantFindArea.classList.remove('block')
                        : cantFindArea.classList.add('block');
                })
        },
        // 清除搜尋
        clearSearch() {
            this.getInfos();
            const cantFindArea = document.querySelector('.cantFind-Area');
            cantFindArea.classList.remove('block');
            document.getElementById('search').value = "";
        },
    },
    mounted() {
        this.checkLogin();
        // this.getStations();
        // this.getInfos();
        ticketModal = new bootstrap.Modal('#ticketModal');
        deleteTicketModal = new bootstrap.Modal('#deleteTicketModal');
    }
}).mount('#app')
