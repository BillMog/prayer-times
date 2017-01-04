var prayer = {
    prayersWaitingTimesInMinute: [20, 10, 10, 5, 10],
    minimumIchaTime: "19:50",
    joumouaaTime: "12:00",
    prayerTimes: [],
    init: function () {
        this.setTime();
        this.setDate();
        this.loadPrayerTimes();
        this.setPrayerTimes();
        this.setPrayerWaitings();
        this.initAdhanFlash();
        this.initIqamaFlash();
        this.initCronMidNight();
    },
    getCsvFile: function () {
        return dateTime.getCurrentMonth() + ".csv";
    },
    loadPrayerTimes: function () {
        var csvFile = this.getCsvFile();
        var prayerTimes;
        $.ajax({
            url: "data/" + csvFile,
            async: false,
            dataType: "text",
            success: function (data) {
                prayerTimes = data.split("\n");
            }
        });

        this.prayerTimes = prayerTimes;
    },
    getCurrentPrayerTimes: function () {
        var prayerTimes = this.prayerTimes;
        prayerTimes = prayerTimes[dateTime.getCurrentDay()].split(",");
        return [prayerTimes[1], prayerTimes[3], prayerTimes[4], prayerTimes[5], this.getIchaTime()];
    },
    getCurrentDateForPrayerTime: function (prayerTime) {
        var date = new Date();
        prayerTime = prayerTime.split(':');
        date.setHours(prayerTime[0]);
        date.setMinutes(prayerTime[1]);
        date.setSeconds(0);
        return date;
    },
    getIchaTime: function () {
        var prayerTimes = this.prayerTimes[dateTime.getCurrentDay()].split(",");
        var ichaTime = prayerTimes[6];
        if (ichaTime <= this.minimumIchaTime)
        {
            ichaTime = this.minimumIchaTime;
        }
        return ichaTime;
    },
    getChouroukTime: function () {
        var prayerTimes = this.prayerTimes[dateTime.getCurrentDay()].split(",");
        return prayerTimes[2];
    },
    initCronMidNight: function () {
        // toutes les minutes
        setInterval(function () {
            // à minuit on met à jour les prayerTimess
            if (dateTime.getCurrentHour() === "00" && dateTime.getCurrentMinute() === "00") {
                prayer.setDate();
                prayer.setPrayerTimes();
            }
        }, 1000);
    },
    /**
     * on vérifie toutes les min si l'heure du adhan est arrivée, si oui on fait clignoter l'heure
     */
    adhanIsFlashing: false,
    initAdhanFlash: function () {
        if (!prayer.adhanIsFlashing) {
            var currentTime = dateTime.getCurrentTime(false);
            var prayerElm = $(".prayer:contains(" + currentTime + ")");
            if (prayerElm.length) {
                prayer.adhanIsFlashing = true;
                var adhanFlash = setInterval(function () {
                    prayerElm.toggleClass("flash");
                }, 1000);

                setTimeout(function () {
                    clearInterval(adhanFlash);
                    prayer.adhanIsFlashing = false;
                    prayerElm.removeClass("flash");
                }, 60000);
            }
        }

        setInterval(this.initAdhanFlash, 1000);
    },
    /**
     * on vérifie toutes les min si l'heure de iqama est arrivée, si oui on fait clignoter les min de la iqama
     */
    iqamaIsFlashing: false,
    initIqamaFlash: function () {
        if (!prayer.iqamaIsFlashing) {
            console.log(prayer.iqamaIsFlashing);
            $.each(prayer.getCurrentPrayerTimes(), function (i, prayerTime) {
                //si date ou chourouk on continue
                var diffTimeInMiniute = Math.floor((new Date() - prayer.getCurrentDateForPrayerTime(prayerTime)) / 60000);
                if (diffTimeInMiniute === prayer.prayersWaitingTimesInMinute[i]) {
                    prayer.iqamaIsFlashing = true;
                    var phoneFlash = setInterval(function () {
                        prayer.showPhoneForbidden();
                    }, 1000);

                    setTimeout(function () {
                        clearInterval(phoneFlash);
                        $(".main").removeClass("hidden");
                        $(".iqama").addClass("hidden");
                        prayer.iqamaIsFlashing = false;
                    }, 60000);
                }
            });
        }

        setInterval(this.initIqamaFlash, 1000);
    },
    showPhoneForbidden: function () {
        $(".main").toggleClass("hidden");
        $(".iqama").toggleClass("hidden");
    },
    setTime: function () {
        $("#time").text(dateTime.getCurrentTime(true));
        setInterval(this.setTime, 1000);
    },
    setDate: function () {
        $("#date").text(dateTime.getCurrentDate());
    },
    setPrayerTimes: function () {
        $("#joumouaa").text(this.joumouaaTime);
        $("#sobh").text(this.getCurrentPrayerTimes()[0]);
        $("#chourouk").text(this.getChouroukTime());
        $("#dohr").text(this.getCurrentPrayerTimes()[1]);
        $("#asr").text(this.getCurrentPrayerTimes()[2]);
        $("#maghrib").text(this.getCurrentPrayerTimes()[3]);
        $("#ichaa").text(this.getIchaTime());
    },
    setPrayerWaitings: function () {
        $("#sobh-waiting").text(this.prayersWaitingTimesInMinute[0] + " min");
        $("#dohr-waiting").text(this.prayersWaitingTimesInMinute[1] + " min");
        $("#asr-waiting").text(this.prayersWaitingTimesInMinute[2] + " min");
        $("#maghrib-waiting").text(this.prayersWaitingTimesInMinute[3] + " min");
        $("#icha-waiting").text(this.prayersWaitingTimesInMinute[4] + " min");
    }
};

/**
 * dateTime functions
 */
var dateTime = {
    addZero: function (value) {
        if (value < 10) {
            value = '0' + value;
        }
        return value;
    },
    getCurrentMinute: function () {
        var date = new Date();
        return this.addZero(date.getMinutes());
    },
    getCurrentHour: function () {
        var date = new Date();
        return this.addZero(date.getHours());
    },
    getCurrentDay: function () {
        var date = new Date();
        return date.getDate();
    },
    getCurrentMonth: function () {
        var date = new Date();
        var month = date.getMonth() + 1;
        return this.addZero(month);
    },
    getCurrentYear: function () {
        var date = new Date();
        return date.getFullYear();
    },
    getCurrentTime: function (withSeconds) {
        var date = new Date();
        var second = this.addZero(date.getSeconds());

        var time = this.getCurrentHour() + ":" + this.getCurrentMinute();
        if (withSeconds === true) {
            time += ":" + second;
        }
        return  time;
    },
    getCurrentDate: function () {
        var day = this.addZero(this.getCurrentDay());
        var year = this.getCurrentYear();
        var dateText = this.getCurrentDayFrenchText() +
                ' - ' + day + '/' + this.getCurrentMonth() + '/' + year +
                ' - ' + this.getCurrentDayArabicText();
        return dateText;
    },
    getCurrentDayText: function () {
        var date = new Date();
        var day = new Array();
        var dayIndex = date.getDay();
        day[0] = ["Dimanche", "الأحد"];
        day[1] = ["Lundi", "الإثنين"];
        day[2] = ["Mardi", "الثلاثاء"];
        day[3] = ["Mercredi", "الأربعاء"];
        day[4] = ["Jeudi", "الخميس"];
        day[5] = ["Vendredi", "الجمعة"];
        day[6] = ["Samedi", "السبت"];

        return day[dayIndex];
    },
    getCurrentDayArabicText: function () {
        return this.getCurrentDayText()[1];
    },
    getCurrentDayFrenchText: function () {
        return this.getCurrentDayText()[0];
    }
};

$(document).ready(function () {
    prayer.init();
});