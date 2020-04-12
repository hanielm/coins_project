var coins = [];
var showMorInfoMapped = {};
var favoritesCoins = [];

$.get("https://api.coingecko.com/api/v3/coins", function (data) {
  coins = data;
  $('.lds-ring').css('display', 'none');
  renderToHTML(coins);
});

function renderToHTML(data) {
  let strHtml = "";
  for (let index = 0; index < data.length; index++) {
    strHtml += `<div class="box" id="id_${index}"> 
      <div class="symbol"> ${data[index].symbol} 
      ${`<div class="divSlider"><label class="switch"><input type="checkbox" 
      onchange="sliderToggle(${index}, event)"><span class="slider round"></span></label></div>`} </div>
       <div class="name"> ${data[index].name} </div>
       <div class="info"> <button type="button" onclick="getInfo(${index})" class="btn btn-primary">More info</button></div>
       <div class="lds-hourglass"></div>
       </div>`;
  }

  $(".coins-box").html(strHtml);
}

//get image and price
function getInfo(index) {
  $(`#id_${index} .lds-hourglass`).css('display', 'block');
  var id = coins[index].id;
  if (showMorInfoMapped[index] && showMorInfoMapped[index].data) {
    $(`#id_${index} .lds-hourglass`).css('display', 'none');
    if (showMorInfoMapped[index].isActive) {
      $(`#id_${index} .moreInfo`).remove();
      showMorInfoMapped[index].isActive = false;
    } else {
      showMorInfoMapped[index].isActive = true;
      $(`#id_${index}`).append(`<div class="moreInfo"> 
    <div><img src="${showMorInfoMapped[index].data.image.small}"></div>
    <div class="div_market">
      <span class="Usd">Usd=  ${showMorInfoMapped[index].data.market_data.current_price.usd}$ </span>
      <span class="Eur">Eur=  ${showMorInfoMapped[index].data.market_data.current_price.eur}€ </span>
      <span class="Ils">Ils=  ${showMorInfoMapped[index].data.market_data.current_price.ils}₪ </span>
    </div>
    </div>`);
    }

  } else {
    $.get(`https://api.coingecko.com/api/v3/coins/${id}`, function (data) {
      $(`#id_${index} .lds-hourglass`).css('display', 'none');
      $(`#id_${index}`).append(`<div class="moreInfo"> 
      <div><img src="${data.image.small}"></div>
      <div class="div_market">
        <span class="Usd">Usd=  ${data.market_data.current_price.usd}$ </span>
        <span class="Eur">Eur=  ${data.market_data.current_price.eur}€ </span>
        <span class="Ils">Ils=  ${data.market_data.current_price.ils}₪ </span>
      </div>
      </div>`);
      showMorInfoMapped[index] = {
        isActive: true,
        data: data
      };
      setTimeout(() => {
        showMorInfoMapped[index].data = null;
      }, 20000); // after Two minutes clear CACHE and AJAX called again.
    });
  }
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


function sliderToggle(index, event) {
  var dataPoints = [];
  var currency = coins[index];
  var isCheked = event.target.checked;
  if (favoritesCoins.length >= 2 && isCheked) {
    event.target.checked = false;
    alert('You have to remove one of the other coins')
    return;
  }

  if (isCheked) {
    favoritesCoins.push(currency.symbol);
    sessionStorage.setItem('favoritesCoins', JSON.stringify(favoritesCoins));
  } else {
    favoritesCoins = favoritesCoins.filter(fCoin => fCoin !== currency.symbol);
    dataPoints = dataPoints.filter(dPoint => dPoint.label !== currency.symbol);
    sessionStorage.setItem('dataPoints', JSON.stringify(dataPoints));
    sessionStorage.setItem('favoritesCoins', JSON.stringify(favoritesCoins));

  }

  if (!favoritesCoins.length) {
    sessionStorage.setItem('dataPoints', JSON.stringify([]));
    return;
  }
  $.get(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${favoritesCoins.join()}&tsyms=USD`,
    function (response) {
      for (const key in response) {
        if (response.hasOwnProperty(key)) {
          dataPoints.push({ label: key, y: response[key].USD });
          sessionStorage.setItem('dataPoints', JSON.stringify(dataPoints));
        }
      }
      onChangeGraphCoins(dataPoints);
    }
  );
}


function onKeyDownHandler(event) {
  if (event.keyCode === 13) { // handle press ENTER in keyboard for search.
    onSearch()
  }
}