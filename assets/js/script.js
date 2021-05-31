const searchBtn = $(".searchBtn");
const searchInput = $("#city");

// Left column locations
const cityNameEl = $(".cityName");
const currentDateEl = $(".currentDate");
const weatherIconEl = $(".weatherIcon");
const searchHistoryEl = $("#historyItems");

// Right column locations
const tempEl = $(".temp");
const humidityEl = $(".humidity");
const windSpeedEl = $(".windSpeed");
const uvIndexEl = $(".uvIndex");
const cardRow = $(".card-row");

let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

const apiKey = "536ae704e8408df81b5c26d27f087f6d";

searchBtn.on("click", function(e) {
    e.preventDefault();
    if (searchInput.val() === "") {
        alert("You must enter a city");
        return;
    }
    console.log("clicked button")
    searchHistory.push(searchInput.val());
    localStorage.setItem("search",JSON.stringify(searchHistory));
    getWeather(searchInput.val());
});

function k2F(k){
    return Math.floor((k - 273.15)*1.8 +32);
}

function getDate(date){
    let currentDate = new Date(date*1000);
    console.log(currentDate);
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    return month + "/" + day + "/" + year;

}

function getWeather(cityName){
    let queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;

    fetch(queryUrl)
      .then(function(response) {
          //lets parse our response so we can interpret
        return response.json();
      })
      .then(function(response){
          //console.log(response.dt);
          //Here we get the date from our data
          cityNameEl.text(response.name + " (" + getDate(response.dt) + ") ");
          let weatherIcon = response.weather[0].icon;
          //gets icon image from api request
          weatherIconEl.attr("src", "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png");
          weatherIconEl.attr("alt",response.weather[0].description);
          //convert temp from deg K to deg F
          tempEl.text("Temperature: " + k2F(response.main.temp) + " °F");
          humidityEl.text("Humidity: " + response.main.humidity + "%");
          windSpeedEl.text("Wind Speed: " + response.wind.speed + " MPH");
          //next will calculate the uv index so we must get lat and lon data from api
           let lat = response.coord.lat;
           let lon = response.coord.lon;
           //gonna fetch uvIndex from api endpoint
           let uvIndexQueryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly" + "&appid=" + apiKey;
           console.log(uvIndexQueryUrl);
           fetch(uvIndexQueryUrl)
             .then(function(uvResponse) {
                 //lets parse our response so we can interpret
                 return uvResponse.json();
             })
             .then(function(uvResponse){
                $('.badge').remove();
                let uvIndex = $('<span>');
                uvIndex.addClass('badge red')
                uvIndex.text(uvResponse.current.uvi);
                uvIndexEl.append(uvIndex);

                //remove forecast then render it
                let prevCardEl = document.querySelectorAll("card-panel")

                //now lets get the 5 day forecast
                 console.log(uvResponse.daily);
                 let dataArry = uvResponse.daily;
                 for(let i = 0; i < 5; i++){
                     console.log(dataArry[i])
                     let dataIcon = "https://openweathermap.org/img/wn/" + dataArry[i].weather[0].icon + "@2x.png";
                     createForecast(getDate(dataArry[i].dt), dataIcon, k2F(dataArry[i].temp.day), dataArry[i].humidity, dataArry[i].wind_speed);
                 }
             });
      });
}


function createForecast(date, icon, temp, humidity, windSpeed) {
    // HTML elements we will create to later
    let fiveDayCardEl = $("<div>").addClass("card-panel teal");
    let cardDate = $("<h3>").addClass("card-title");
    let cardIcon = $("<img>").addClass("weatherIcon");
    let cardTemp = $("<p>").addClass("card-action");
    let cardHumidity = $("<p>").addClass("card-text");
    let cardSpeed = $("<p>").addClass("card-text");

    cardRow.append(fiveDayCardEl);
    cardDate.text(date);
    cardIcon.attr("src", icon);
    cardTemp.text(`Temp: ${temp} °F`);
    cardHumidity.text(`Humidity: ${humidity}%`);
    cardSpeed.text(`Humidity: ${windSpeed} MPH`);
    fiveDayCardEl.append(cardDate, cardIcon, cardTemp, cardHumidity, cardSpeed);
}

function renderSearchHistory() {
    searchHistoryEl.innerHTML = "";
    console.log(searchHistory);
    if(searchHistory.length != 0){
        for (let i=0; i<searchHistory.length; i++) {
            const historyItem = $("<li>");
            historyItem.append("<a href='#' class='collection-item center'>"+searchHistory[i]);
            historyItem.append("<input type='hidden' id='storedData'></a>");
            let storedData = $('#storedData');
            historyItem.on("click",function() {
                storedData.val(searchHistory[i]);
                console.log(storedData.val());
                getWeather(searchHistory[i]);
            })
            searchHistoryEl.append(historyItem);
        }
    }
}

$(document).ready(function(){
    //on page load we load last searched city as placeholder
    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
});