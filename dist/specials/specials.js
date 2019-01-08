// attach filter action on document ready
$(document).ready(function () {
  $("#sFilter").on("keyup", function () {
    var ftext = $(this).val().toLowerCase();
    refreshFilter(ftext)
  });
});

function refreshFilter(ftext) {
  $("#location-div>div").each((_, stationDiv) => {
    $(stationDiv).children(".card").each((_, card) => {
      // hide card if string not found
      const cardText = $(card).find("h5>a").text().toLowerCase();
      card.hidden = cardText.indexOf(ftext) < 0;
    });
    // hide station div if all children are hidden
    const numVisible = $(stationDiv).children("div.card:not([hidden])").length;
    stationDiv.hidden = numVisible < 1;
  });

  // hide "no results" panel if there's a non-hidden station div
  const numVisible = $("div#location-div>div:not([hidden])").length;
  document.getElementById("noResults").hidden = numVisible >= 1;
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

const jsonData = $.getJSON("//data.danforks.com/specials_data.json");

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
          seenFoods.add(food);
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
    const ftext = $("#sFilter").val().toLowerCase();
    refreshFilter(ftext)
  });

}

function createCard(location, food, foodData) {
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
      icon.src = "/resources/" + label + ".jpg";
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
