// attach filter action on document ready
$(document).ready(function () {
  $("#sFilter").on("keyup", function () {
    var ftext = $(this).val().toLowerCase();
    refreshFilter(ftext)
  });
});

function toggle(element, display) {
  if (display) {
    element.hidden
  }
}

function refreshFilter(ftext) {
  console.log(ftext)
  $("#location-div>div").each((_, stationDiv) => {
    $(stationDiv).children(".card").each((_, card) => {
      const cardText = $(card).find("h5>a").text().toLowerCase();
      card.hidden = cardText.indexOf(ftext) < 0;
    });
    // Toggle No Results pane depending on whether there are results
    const numVisible = $(stationDiv).children("div.card:not([hidden])").length;
    stationDiv.hidden = numVisible < 1;
  });

  const numVisible = $("div#location-div>div:not([hidden])").length;
  document.getElementById("noResults").hidden = numVisible >= 1;
  // if (numVisible > 0) {
  //   $("#noResults").addClass("d-none");
  // } else {
  //   $("#noResults").removeClass("d-none");
  // }

  // hide categories for which there are no results:

  // first, hide stations:
  // $('[aria-controls^="sta"]').each(function(i){
  //   if( hideCatIfEmpty($(this)) ) {
  //       $(this).parent().addClass("d-none");
  //   }
  //   else {
  //       $(this).parent().removeClass("d-none");
  //   }
  // });
  //
  // // Then the locations:
  // $('[aria-controls^="loc"]').each(function(i){
  //   hideCatIfEmpty($(this));
  // });
}

// hide a category if all card elements "controlled" by it are invisible;
// return true if the category was hidden
function hideCatIfEmpty(elemDiv) {
  const numSubItems = $(elemDiv).children("div.card:visible").length;
  if (numSubItems > 0) {
    elemDiv.removeClass("d-none");
    return false;
  }
  else {
    elemDiv.addClass("d-none");
    return true;
  }
}

// cycles through weekdays based off button click in either direction
function getWeekDays() {

  var d = new Date();
  var weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";

  //Today
  let index = 1;
  var currentDate = weekday[index];
  document.getElementById("today").innerHTML = currentDate;
  displayData(currentDate);

  //Yesterday
  document.getElementById("button1").addEventListener("click", e => {
    e.preventDefault();
    if (index <= 0) {
      index = 7;
    }
    currentDate = weekday[index - 1];
    index = index - 1;
    document.getElementById("today").innerHTML = currentDate;
    document.getElementById("location-div").innerHTML = "";
    displayData(currentDate);
    return false;
  });

  //Tomorrow
  document.getElementById("button2").addEventListener("click", e => {
    e.preventDefault();
    if (index >= 6) {
      index = -1;
    }
    currentDate = weekday[index + 1];
    index = index + 1
    // document.getElementById("today").innerHTML = currentDate;
    $("#today").text(currentDate);
    document.getElementById("location-div").innerHTML = "";
    displayData(currentDate);
    return false;
  });
}

const jsonData = $.getJSON(
    "https://esabherwal.github.io/danforks/menu_scrape/specials_data.json"
);

function displayStationData(weekday, name, data) {
  const menus = data.menus;
  const date = Object.keys(menus).filter(date => date.startsWith(weekday));
  if (!menus[date]) {
    return;
  }

  const locationDiv = document.getElementById("location-div");
  const stationDiv = document.createElement("div");
  const heading = document.createElement("h2");
  heading.classList.add("mt-4");
  heading.innerText = name;
  stationDiv.appendChild(heading);

  const menu = menus[date].menu;
  const seenFoods = new Set();
  for (const mealData of Object.values(menu)) {
    for (const categoryData of Object.values(mealData)) {
      for (const [food, foodData] of Object.entries(categoryData)) {
        if (!seenFoods.has(food)) {
          stationDiv.appendChild(createCard(name, food, foodData))
        }
      }
    }
  }
  locationDiv.appendChild(stationDiv);
}

function displayData(currentDate) {

  jsonData.done(json => {
    for (const location of Object.keys(json).sort()) {
      const locationData = json[location];
      const stations = Object.keys(locationData).sort();
      const numStations = stations.length;
      if (numStations) {
        if (numStations < 2) {
          const station = stations[0];
          const stationData = locationData[station];
          displayStationData(currentDate, location, stationData);
        } else {
          for (const station of stations) {
            const fullStationName = location + " \u00b7 " + station;
            const stationData = locationData[station];
            displayStationData(currentDate, fullStationName, stationData);
          }
        }
      }
    }
  });

  // $.getJSON("https://esabherwal.github.io/danforks/menu_scrape/specials_data.json", function (json) {
  //   var locations = Object.keys(json);
  //   //***********************************************
  //   //Debug: This isn't updating asynchronously
  //   //***********************************************
  //   var d = currentDate;
  //   var dictionary = [];
  //   var dictionary_stations = [];
  //   var location_stations = [];
  //   var food_url_array = [];
  //   var food_url_array_stations = [];
  //   var nutrition = [];
  //   var nutrition_s = [];
  //   for (var i = 0; i < locations.length; i++) {
  //     var x = locations[i];
  //
  //     //checks if the index is referecing the DUC, BD, or the Village
  //     //those 3 have different json structure
  //     if (i != 2 && i != 9 && i != 10) {
  //       var data = json[x][""].menus;
  //       var date = Object.keys(data);
  //       for (var q = 0; q < date.length; q++) {
  //         var split_date = date[q].split(",")[0]; //@ 0 will give the weekDAY
  //         if (d == split_date) {
  //           var day_data = data[date[q]];
  //           var day_data_keys = Object.keys(day_data.menu);
  //           for (var v = 0; v < day_data_keys.length; v++) {
  //             var vv = day_data_keys[v];
  //             var special_types = day_data.menu[vv];
  //             var special_types_keys = Object.keys(special_types);
  //             for (var h = 0; h < special_types_keys.length; h++) {
  //               var hh = special_types_keys[h];
  //               var types_data = special_types[hh];
  //               var types_data_keys = Object.keys(types_data);
  //               for (var f = 0; f < types_data_keys.length; f++) {
  //                 var food_item = types_data_keys[f];
  //                 var food_items = types_data[food_item];
  //                 var cals = food_items.calories;
  //                 var carbs = food_items.carbs;
  //                 var fat = food_items.fat;
  //                 var protein = food_items.protein;
  //                 var url = food_items.nutrition_url;
  //                 const labels = food_items.labels;
  //                 nutrition = {//}.push({
  //                   key: food_item,
  //                   value: [cals, carbs, fat, protein, url, labels]
  //                 }//);
  //                 dictionary.push({
  //                   key: locations[i],
  //                   value: nutrition
  //                 });
  //               }
  //             }
  //           }
  //
  //         }
  //       }
  //     }
  //     else {  //now we are looking @ the DUC, Bear's Den, and the Village
  //       var stations = Object.keys(json[x]);// array of stations
  //       for (var s = 0; s < stations.length; s++) {
  //         var data = json[x][stations[s]].menus;
  //         var date = Object.keys(data);
  //         for (var q = 0; q < date.length; q++) {
  //           var split_date = date[q].split(",")[0]; //@ 0 will give the weekDAY
  //           if (d == split_date) {
  //             var day_data = data[date[q]];
  //             var day_data_keys = Object.keys(day_data.menu);
  //             for (var v = 0; v < day_data_keys.length; v++) {
  //               var vv = day_data_keys[v];
  //               var special_types = day_data.menu[vv];
  //               var special_types_keys = Object.keys(special_types);
  //               for (var h = 0; h < special_types_keys.length; h++) {
  //                 var hh = special_types_keys[h];
  //                 var types_data = special_types[hh];
  //                 var types_data_keys = Object.keys(types_data);
  //                 for (var f = 0; f < types_data_keys.length; f++) {
  //                   var food_item = types_data_keys[f];
  //                   var food_items = types_data[food_item];
  //                   var cals = food_items.calories;
  //                   var carbs = food_items.carbs;
  //                   var fat = food_items.fat;
  //                   var protein = food_items.protein;
  //                   var url = food_items.nutrition_url;
  //                   const labels = food_items.labels;
  //                   //console.log(food_items)
  //                   nutrition_s = {//}.push({
  //                     key: food_item,
  //                     value: [cals, carbs, fat, protein, url, labels]
  //                   }//);
  //                   dictionary_stations = {//}.push({
  //                     key: stations[s],
  //                     value: nutrition_s
  //                   }//);
  //                   location_stations.push({
  //                     key: locations[i],
  //                     value: dictionary_stations
  //                   });
  //
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  //
  //
  //   Array.prototype.contains = function (arr) {
  //     for (i in this) {
  //       if (this[i] == arr) return true;
  //     }
  //     return false;
  //   }
  //
  //   var array = ["empty_string"];
  //   const seenLocations = new Set();
  //   for (const location of Object.values(dictionary)) {
  //     const locationName = location.key;
  //     const locStr = locationName.toLowerCase().replace(
  //         /-*[^a-zA-Z\d-]+-*/g,
  //         "-"
  //     );
  //     if (!seenLocations.has(locationName)) {
  //       const heading = document.createElement("h2");
  //       heading.classList.add("mt-4");
  //       heading.innerText = locationName;
  //       locationdiv.appendChild(heading);
  //       seenLocations.add(locationName);
  //     }
  //     const food = location.value;
  //     locationdiv.appendChild(createCard(locationName, food));
  //   }
  //
  //   // console.log(dictionary);
  //   /////////////////// Locations without stations
  //   for (var aa = 0; aa < (Object.keys(dictionary)).length; aa++) {
  //     var loc = dictionary[aa].key;
  //     var locStr = loc.replace(/\s+/g, '');
  //     locStr = locStr.replace('&', '');
  //     console.log(locStr);
  //     if (!(array.contains(loc))) {
  //       //appends locations
  //       const listItem = document.createElement('h6');
  //       listItem.innerHTML = '<a class="btn btn-primary btn-block text-center" data-toggle="collapse" href="#loc' + locStr + '"role="button" aria-expanded="true" aria-controls="loc' + locStr + '">' + loc + '</a>';
  //       locationdiv.appendChild(listItem);
  //       array.push(loc);
  //     }
  //
  //     const location = dictionary[aa];
  //     const locationName = location.key;
  //     const food = location.value;
  //     locationdiv.appendChild(createCard(locationName, food));
  //
  //   }
  //
  //   //  console.log(location_stations);
  //   /////////////////// Locations with stations
  //   var array_loc = ["empty_string"];
  //   var array_stations = ["empty_string"];
  //   var location_stations_keys = Object.keys(location_stations);
  //
  //   for (var aa = 0; aa < Object.keys(location_stations).length; aa++) {
  //     var loc = location_stations[aa].key;
  //     var locStr = loc.replace(/\s+/g, ''); //console.log(loc);
  //     var sta = location_stations[aa].value.key;// console.log(sta,"-------------------");
  //     var staStr = sta.replace(/\s+/g, '');
  //     if (!(array.contains(loc))) {
  //       //appends locations
  //       var listItem = document.createElement('h6');
  //       listItem.innerHTML = '<a class="btn btn-primary btn-block text-center" data-toggle="collapse" href="#loc' + locStr + '"role="button" aria-expanded="true" aria-controls="loc' + locStr + '">' + loc + '</a>';
  //       locationdiv.appendChild(listItem);
  //       array.push(loc);
  //     }
  //     if (!(array.contains(sta))) {
  //       //appends stations
  //       var listItem = document.createElement('li');
  //       listItem.innerHTML = '<a data-toggle="collapse" href="#sta' + staStr + '"role="button" aria-expanded="true" aria-controls="sta' + staStr + '">' + sta + "</a>";
  //       listItem.className = 'btn btn-light btn-group btn-sm text-center collapse show';
  //       listItem.id = "loc" + locStr;
  //       locationdiv.appendChild(listItem);
  //       array.push(sta);
  //     }
  //
  //     const locationStation = location_stations[aa];
  //     const locationName = locationStation.key;
  //     const station = locationStation.value;
  //     const stationName = station.key;
  //     const food = station.value;
  //     locationdiv.appendChild(createCard(stationName + " \u00b7 " + locationName, food));
  //
  //   }
  //   var br = document.createElement('br');
  //   locationdiv.appendChild(br);
  //
  //   var ftext = $("#sFilter").val().toLowerCase();
  //   refreshFilter(ftext)
  // });
}

function createCard(locationName, food, foodData) {
  const card = document.createElement("div");
  card.classList.add("card", "my-2");
  const body = document.createElement("div");
  body.classList.add("card-body");
  const title = document.createElement("h5");
  title.classList.add("card-title");
  const link = document.createElement("a");
  link.href = "#";
  link.innerText = food;
  const cals = foodData.calories;
  link.addEventListener("click", e => {
    e.preventDefault();
    $("#modal-title").text(food);
    $("#modal-location").text(location);
    $("#td-cals").text(cals);
    $("#td-carbs").text(foodData.carbs);
    $("#td-fat").text(foodData.fat);
    $("#td-protein").text(foodData.protein);
    document.getElementById("modal-button").href = foodData.nutrition_url;
    $("#label-title").text(food);
    $("#macro-modal").modal("show");
    return false;
  });
  title.appendChild(link);
  body.appendChild(title);

  const text = document.createElement("p");
  text.classList.add("card-text");
  let shouldShowText = false;
  if (cals && cals !== "0") {
    shouldShowText = true;
    text.innerText = cals + " Cal ";
  }
  const labels = foodData.labels;
  if (labels.length) {
    if (shouldShowText) {
      text.innerText += "\u00b7 ";
    } else {
      shouldShowText = true;
    }
    const iconBox = document.createElement("a");
    iconBox.href = "#";
    iconBox.addEventListener("click", e => {
      e.preventDefault();
      $("#icon-modal").modal("show");
      return false;
    });
    for (const label of labels) {
      const icon = document.createElement("img");
      icon.src = "../menus/" + label + ".jpg";
      iconBox.appendChild(icon);
      iconBox.appendChild(document.createTextNode(" "));
    }
    const helpSpan = document.createElement("span");
    const helpIcon = document.createElement("i");
    helpIcon.classList.add("fas", "fa-question-circle");
    helpSpan.appendChild(helpIcon);
    iconBox.appendChild(helpSpan);
    text.appendChild(iconBox);
  }
  if (shouldShowText) {
    body.appendChild(text);
  }
  card.appendChild(body);
  return card;
}

getWeekDays();
