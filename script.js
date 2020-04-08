var coins = [];
var showMorInfoMapped = {};
var favoritesCoins = [];

$.get("https://api.coingecko.com/api/v3/coins", function (data) {
  console.log("Coins", { data });
  coins = data;
  renderToHTML(coins);
});

function renderToHTML(data) {
  let strHtml = "";
  for (let index = 0; index < data.length; index++) {
    strHtml += `<div class="box" id="id_${index}"> 
      <div class="symbol"> ${data[index].symbol} 
      ${`<div class="divSlider"><label class="switch"><input type="checkbox" 
      onchange="sliderToggle(${index},event)"><span class="slider round"></span></label></div>`} </div>
       <div class="name"> ${data[index].name} </div>
       <div class="info"> <button type="button" onclick="getInfo(${index})" class="btn btn-primary">More info</button></div></div>`;
  }

  $(".coins-box").html(strHtml);
}

//get image and price
function getInfo(index) {
  var id = coins[index].id;
  if (showMorInfoMapped[index]) {
    showMorInfoMapped[index] = false;
    $(`#id_${index} .moreInfo`).remove();
  } else {
    $.get(`https://api.coingecko.com/api/v3/coins/${id}`, function (data) {
      console.log({ data });
      $(`#id_${index}`).append(`<div class="moreInfo"> 
      <div><img src="${data.image.small}"></div>
      <div class="div_market">
        <span class="Usd">Usd=  ${data.market_data.current_price.usd}$ </span>
        <span class="Eur">Eur=  ${data.market_data.current_price.eur}€ </span>
        <span class="Ils">Ils=  ${data.market_data.current_price.ils}₪ </span>
      </div>
      </div>`);
      showMorInfoMapped[index] = true;
    });
  }
}

function test() {
  getInfo();
}

function getMoreInfo(id) {
  console.log("get more info", id);
}

function onSearch() {
  var input = document.getElementById("inputext").value;
  var updatedCoins = coins.filter(function (val) {
    return val.name.toLowerCase().includes(input.toLowerCase());
  });
  renderToHTML(updatedCoins);
}

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
//


function sliderToggle(index, ev) {
  var dataPoints = [];
  var currency = coins[index];
  
  if (favoritesCoins.length >= 5) return;
  if (ev.target.checked) {
    favoritesCoins.push(currency.symbol);
  } else {
    favoritesCoins = favoritesCoins.filter(fCoin => fCoin !== currency.symbol);
  }

  $.get(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${favoritesCoins.join()}&tsyms=USD`,
    function (response) {
      for (const key in response) {
        if (response.hasOwnProperty(key)) {
          dataPoints.push({ label: key, y: response[key].USD });
        }
      }

      onChangeGraphCoins(dataPoints);
    }
  );


}
