// ==UserScript==
// @name         美团配送
// @namespace    http://tampermonkey.net/
// @version      2025-06-21
// @description  try to take over the world!
// @author       兰中祥15399791780
// @match        https://peisong.meituan.com/dispatch/home
// @icon         https://www.google.com/s2/favicons?sz=64&domain=meituan.com
// @downloadURL https://github.com/lanzhongxiang/peisong.meituan/blob/main/MT.user.js
// @updateURL     https://github.com/lanzhongxiang/peisong.meituan/blob/main/MT.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // 重写XMLHttpRequest的open方法
    var _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        this.addEventListener('load', function(data) {
            //console.log('Request URL:', url);
            //console.log('Response Headers:', this.getAllResponseHeaders());
            if(url.indexOf("https://peisong.meituan.com/api/dispatch/partner/waybill/queryOrderDetail?waybillId=")!= -1){
                //console.log("data",data);
                localStorage.setItem("result", data.currentTarget.response);
            }


        });
        _open.call(this, method, url, async, user, password);
    };
    //

    console.log("美团扩展插件");
    var qsid = null;

    //添加绑定事件 鼠标点击骑手名字或周围元素 获取骑手ID 按下Shift键复制到剪切板
    document.addEventListener('keydown', function (event) {
        //console.log('按键被按下', event.key);
        if (event.key == "Shift") {
            if (qsid != null) {
                navigator.clipboard.writeText(qsid);
                //banma.ui.toast.success("骑手ID复制成功：" + qsid);
                banma.ui.toast.success("骑手ID复制成功：" + qsid);
                qsid = null;
            }

        }
        if (event.key == "Control") {
            queryOrder();
        }
    });

    document.getElementById("riderListBody").addEventListener('click', function (event) {
        // event.target 是被点击的元素
        var clickedElement = event.target;
        //console.log(clickedElement); // 输出被点击的元素
        qsid = clickedElement.closest('tr').getAttribute("value");

    });

    //沃尔玛小程序订单去长度
    document.getElementById("waybillStatue").addEventListener('click', function (event) {
        var dz = window.location.href;
        if(dz.indexOf("https://peisong.meituan.com/dispatch/home")!= -1){
            Waybilllist();
        }

    });

    function Waybilllist() {
        var todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        var timestamp = todayStart.getTime()/1000;
        var riderPhone = document.getElementById("getRiderName").value;
        var status = window.location.href;
        status = status.split("#");
        if(status.length = 2){
            status = status[1];
        }else {status = ""}
        const data = new FormData();
        var poiName = document.getElementById("new-busy-name").value;
        var orderId =  document.getElementById("busyMessage").value;
        data.append("fromTime", timestamp);
        data.append("toTime", timestamp + 86400);
        data.append("orgList", "2010073");
        data.append("orgList", "2040829");
        data.append("status", status);
        data.append("page", "1");
        data.append("size", "20");
        data.append("inputOrderField", "utime");
        data.append("inputOrderSeq", "1");
        data.append("areaList", "2007412");
        data.append("poiName", poiName);
        data.append("poiSeq", "");
        data.append("poiId", "");
        data.append("platformId", "");
        data.append("orderId", orderId);
        data.append("riderName", "");
        data.append("riderPhone", riderPhone);

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === this.DONE) {
                //console.log(this.responseText);
            }
            var JsonData =JSON.parse(this.responseText);
            console.log(JsonData);
            for (var i = 0; i < JsonData.data.bmWaybillViewList.length; i++) {
                var element = document.querySelector('tr[value="' + JsonData.data.bmWaybillViewList[i].waybillIdStr + '"]');
                if (element != null) {
                    var recAddrElement = element.querySelectorAll("td")[3].querySelector("div").querySelector("div").getElementsByClassName("td-span-title addr-name")[0];
                    var recAddr = JsonData.data.bmWaybillViewList[i].recAddr;
                    var result = recAddr.indexOf("湖南省长沙市岳麓区湖南省长沙市岳麓区");
                    if (result != -1) {
                        recAddrElement.innerHTML = recAddr.substring(18);

                    }
                }
            }

        });

        xhr.open("POST", "https://peisong.meituan.com/api/dispatchconsole/partner/dispatch/waybilllistByAreaAndSearchParam?setKey=100430100&yodaReady=h5&csecplatform=4&csecversion=3.1.0");
        xhr.send(data);

    }


    //


    //查询送达订单送货地址

    function queryOrder() {
        // 函数体
        var orderDiv = document.getElementById("order-detail-wrap");
        var windowOpen = document.getElementById("order-detail-wrap").getBoundingClientRect();
        //if (windowOpen.bottom == "0") return;
        var waybillId = orderDiv.getAttribute("data-id");
        if(localStorage.getItem('result')!=''){
            var data = JSON.parse(localStorage.getItem('result'));
            if (data.code = "0") {
                document.querySelector("#order-detail-wrap > div > div:nth-child(1) > div.pro-module-bd > div > div.custom-info > p:nth-child(2) > span").textContent = "顾客地址：" + data.data.detail.recipientAddress;
                document.querySelector("#order-detail-wrap > div > div:nth-child(1) > div.pro-module-bd > div > div.custom-info > p:nth-child(4)").textContent = "顾客姓名：" + data.data.detail.recipientName;
                banma.ui.toast.success("查询成功");

                data = null;
                localStorage.setItem("result", '');
            }
        }



    }



    // Your code here...
})();