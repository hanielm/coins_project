var dataPoints = JSON.parse(sessionStorage.getItem('dataPoints'));

function onChangeGraphCoins(dataPoints = []) {
    var options1 = {
        animationEnabled: true,
        title: {
            text: "Chart inside a jQuery Resizable Element",
        },
        data: [
            {
                type: "column", //change it to line, area, bar, pie, etc
                legendText: "Try Resizing with the handle to the bottom right",
                showInLegend: true,
                dataPoints: dataPoints
            },
        ],
    };
    $("#chartContainer1").CanvasJSChart(options1);
}

onChangeGraphCoins(dataPoints);


function getDataPoints() {
    var favoritesCoins = JSON.parse(sessionStorage.getItem('favoritesCoins'));
    $.get(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${favoritesCoins.join()}&tsyms=USD`,
        function (response) {
            var result = [];
            for (const key in response) {
                if (response.hasOwnProperty(key)) {
                    result.push({ label: key, y: response[key].USD })
                }
            }
            dataPoints = result;
            onChangeGraphCoins(dataPoints);
        }
    );
}

var gCancel = setInterval(getDataPoints, 10000);

window.onbeforeunload = function () {
    clearInterval(gCancel)
};