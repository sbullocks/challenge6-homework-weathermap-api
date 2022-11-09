// Stores API key.
var apiKey = "36b3043481e11e1d5d9583640b232872";

// Populates the first city prior to searching as Orlando.
var city = "Orlando";

// Provides the current Date.
var day = moment().format("dddd, MMMM Do YYYY");

//Provides the current Time.
var currentTIme = moment().format("YYYY-MM-DD HH:MM:SS");

var locationSearch = [];
// Saves the text value of the search & saves it to an array in storage.
$(".search").on("click", function (event) {
  event.preventDefault();
  city = $(this).parent(".btnPar").siblings(".textVal").val().trim();
  if (city === "") {
    return;
  }
  locationSearch.push(city);

  localStorage.setItem("city", JSON.stringify(locationSearch));
  weeklyForecastEl.empty();
  pastRecords();
  showCurrentWeather();
});

// Creates the list with buttons of the search history.
var pastRecordsEl = $(".locationSearch");
function pastRecords() {
  pastRecordsEl.empty();

  for (let i = 0; i < locationSearch.length; i++) {
    var rowEl = $("<row>");
    var btnEl = $("<button>").text(`${locationSearch[i]}`);

    rowEl.addClass("row pastRecordsBtnRow");
    btnEl.addClass("btn btn-outline-secondary pastRecordsBtn");
    btnEl.attr("type", "button");

    pastRecordsEl.prepend(rowEl);
    rowEl.append(btnEl);
  }
  if (!city) {
    return;
  }
  // If you click the buttons stored from history, they will search the city again.
  $(".pastRecordsBtn").on("click", function (event) {
    event.preventDefault();
    city = $(this).text();
    weeklyForecastEl.empty();
    showCurrentWeather();
  });
}

// Main body card for city searched.
var currentDayBody = $(".currentDayCard");

// Puts the weather data in the main body card and provides the 5 day forecase cards.
function showCurrentWeather() {
  // var getWeeklyForecast = `https://api.openweathermap.org/data/2.5/weather?lat=${28.5}&lon=${81.3}&appid=${apiKey}`;
	var getWeeklyForecast = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
  //api.openweathermap.org/data/2.5/forecast/daily?lat={178}&lon={163}&cnt={12}&appid={apiKey}
  // api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt={cnt}&appid={apiKey}
//   var getWeeklyForecast = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
 // https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={apiKey};

  $(currentDayBody).empty();

  $.ajax({
    url: getWeeklyForecast,
    method: "GET",
  }).then(function (response) {
    $(".currentDayCity").text(response.name);
    $(".cardCurrentDay").text(day);

    // Displays the weather icons.
    $(".icons").attr(
      "src",
      `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`
    );

    // Displays the Temperature.
    var mainTempEl = $("<p>").text(`Temperature: ${response.main.temp} °F`);
    currentDayBody.append(mainTempEl);

    // Displays the Feels Like tempature.
    var feelsTempEl = $("<p>").text(
      `Feels Like: ${response.main.feels_like} °F`
    );
    currentDayBody.append(feelsTempEl);

    // Displays the Humidity %.
    var humidEl = $("<p>").text(`Humidity: ${response.main.humidity} %`);
    currentDayBody.append(humidEl);

    // Displays the Wind Speed MPH.
    var windEl = $("<p>").text(`Wind Speed: ${response.wind.speed} MPH`);
    currentDayBody.append(windEl);

    // Set the lat and long from the city searched.
    var cityLongitude = response.coord.lon;
    // console.log(cityLongitude);
    var cityLatitude = response.coord.lat;
    // console.log(cityLatitude);

    var getUvi = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    // `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLatitude}&lon=${cityLongitude}&exclude=hourly,daily,minutely&appid=${apiKey}`;
    // console log to see what is returned. should be lat/long.
    // store in varialbe to use in another API call. get lat/long and feed into 5 day forecast.
    // need to get 5 day forecast to display.

    $.ajax({
      url: getUvi,
      method: "GET",
    }).then(function (response) {
      var uviEl = $("<p>").text(`UV Index: `);
      var uviSpan = $("<span>").text(response.current.uvi);
      var uvi = response.current.uvi;
      uviEl.append(uviSpan);
      currentDayBody.append(uviEl);
      // Sets the UV index to match an exposure chart severity based on color ----------------- UV is not displaying in the cards...
      if (uvi >= 0 && uvi <= 2) {
        uviSpan.attr("class", "green");
      } else if (uvi > 2 && uvi <= 5) {
        uviSpan.attr("class", "yellow");
      } else if (uvi > 5 && uvi <= 7) {
        uviSpan.attr("class", "orange");
      } else if (uvi > 7 && uvi <= 10) {
        uviSpan.attr("class", "red");
      } else {
        uviSpan.attr("class", "purple");
      }
    });
  });
  getFiveDayForecast();
}

var weeklyForecastEl = $(".weeklyForecast");

function getFiveDayForecast() {
  var weekForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

  $.ajax({
    url: weekForecast,
    method: "GET",
  }).then(function (response) {
    var dailyLineup = response.list;
    var liveWeather = [];

    // Object that allows for easier data read.
    $.each(dailyLineup, function (index, value) {
      whatchamacallit = {
        day: value.dt_txt.split(" ")[0],
        time: value.dt_txt.split(" ")[1],
        temp: value.main.temp,
        feels_like: value.main.feels_like,
        icon: value.weather[0].icon,
        humidity: value.main.humidity,
      };

      if (value.dt_txt.split(" ")[1] === "12:00:00") {
        liveWeather.push(whatchamacallit);
      }
    });

    // Adds the cards to the screen
    for (let i = 0; i < liveWeather.length; i++) {
      var divElCard = $("<div>");
      divElCard.attr("class", "card text-white bg-primary mb-3 cardOne");
      divElCard.attr("style", "max-width: 200px;");
      weeklyForecastEl.append(divElCard);

      var divElHeader = $("<div>");
      divElHeader.attr("class", "card-header");
      var m = moment(`${liveWeather[i].day}`).format("MM-DD-YYYY");
      divElHeader.text(m);
      divElCard.append(divElHeader);

      var divElBody = $("<div>");
      divElBody.attr("class", "card-body");
      divElCard.append(divElBody);

      var divElicon = $("<img>");
      divElicon.attr("class", "icons");
      divElicon.attr(
        "src",
        `https://openweathermap.org/img/wn/${liveWeather[i].icon}@2x.png`
      );
      divElBody.append(divElicon);

      // Displays the Temperature on 5 day forecast cards.
      var feelsTempEl = $("<p>").text(`Temperature: ${liveWeather[i].temp} °F`);
      divElBody.append(feelsTempEl);
      // Displays the Feels Like on 5 day forecast cards.
      var pElFeel = $("<p>").text(
        `Feels Like: ${liveWeather[i].feels_like} °F`
      );
      divElBody.append(pElFeel);
      // Displays the Humidity on 5 day forecast cards.
      var humidEl = $("<p>").text(`Humidity: ${liveWeather[i].humidity} %`);
      divElBody.append(humidEl);
    }
  });
}

// Loads the starter data for Orlando.
function start() {
  var locationSearchCache = JSON.parse(localStorage.getItem("city"));

  if (locationSearchCache !== null) {
    locationSearch = locationSearchCache;
  }
  pastRecords();
  showCurrentWeather();
}

start();
