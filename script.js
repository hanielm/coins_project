var coins = [];
var showMorInfoMapped = {};
var favoritesCoins = [];
var copyFavoritesCoins = [];

var gCurrentCurrency;
var gCurrentEl;

//  $('.modal').addClass('in').css('display', 'block');


$.get("https://api.coingecko.com/api/v3/coins", function (data) {
  console.log("Coins", { data });
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
      onchange="sliderToggle(this,${index},event)"><span class="slider round"></span></label></div>`} </div>
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


function sliderToggle(el, index, el) {
  var dataPoints = [];
  var currency = coins[index];
  var isCheked = el.target.checked;

  if (favoritesCoins.length >= 1 && isCheked) {
    drawerModalCoins(favoritesCoins);
    gCurrentCurrency = currency;
    gCurrentEl = el;
    return;
  }

  if (isCheked) {
    favoritesCoins.push({ symbol: currency.symbol, isRemoved: false });
  } else {
    favoritesCoins = favoritesCoins.filter(fCoin => fCoin.symbol !== currency.symbol);
  }

  var symbols = favoritesCoins.map(coin => coin.symbol);

  $.get(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols.join()}&tsyms=USD`,
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


function onKeyDownHandler(event) {
  if (event.keyCode === 13) { // handle press ENTER in keyboard for search.
    onSearch()
  }
}

function drawerModalCoins(coins, newCurrency, ev) {
  copyFavoritesCoins.length ? copyFavoritesCoins : copyFavoritesCoins = coins.map(coin => ({ ...coin }));
  var strHtml = '';
  for (let index = 0; index < copyFavoritesCoins.length; index++) {
    var favoriteCoin = copyFavoritesCoins[index];

    strHtml += `<div class="flex space-between">
    <span class=${favoriteCoin.isRemoved ? 'line-throgh' : null}>${favoriteCoin.symbol}</span>
    ${favoriteCoin.isRemoved ? `<button onclick='handleCoinsStatus(${index})'>Back to</button>` : `<button onclick="handleCoinsStatus(${index})">Remove</button>`}
    </div>`
  }

  $('.modal').addClass('in').css('display', 'block');
  console.log(strHtml);

  $('.modal .modal-body').html(strHtml)


}


function handleCoinsStatus(index, ev) {
  var requestedCoin = copyFavoritesCoins[index];
  requestedCoin.isRemoved = !requestedCoin.isRemoved;
  drawerModalCoins(copyFavoritesCoins)

}

function renderBodyModal() {

}

function onSubmit() {
  favoritesCoins = [...copyFavoritesCoins];
  favoritesCoins = favoritesCoins.filter(fCoin => !fCoin.isRemoved);
  copyFavoritesCoins = [];
  if (favoritesCoins.length <= 1) {
    favoritesCoins.push({ symbol: gCurrentCurrency.symbol, isRemoved: false });
    gCurrentEl.target.checked = true;
    var symbols = document.querySelectorAll('.box .symbol');
    symbols.forEach(symbol => {
      var isExsist = favoritesCoins.find(f => f.symbol === symbol.innerText.trim())
      debugger;
      if (isExsist) {
        symbol.querySelector('.switch input').checked  = false;
      }
      debugger;

    })
  } else {
    gCurrentEl.target.checked = false;
  }

  gCurrentEl = null;
  $('.modal').removeClass('in').css('display', 'none');
}

function onCloseModal() {
  gCurrentEl.target.checked = false;
  $('.modal').removeClass('in').css('display', 'none');
}