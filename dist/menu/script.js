const taskString = new URL(window.location.href).searchParams.get("task");
const taskNumber = taskString ? parseInt(taskString) : 1;
document.getElementById("map-link").href = "../maps/?task=" + taskNumber;
document.getElementById("menus-link").href = "../menus/?task=" + taskNumber;
document.getElementById("specials-link").href = "../specials/?task="
    + taskNumber;

function getDefaultMeal(meals) {
  if (taskNumber === 1) {
    if (meals.includes("DINNER")) {
      return "DINNER";
    }
  } else {
    if (meals.includes("LUNCH")) {
      return "LUNCH";
    }
  }
  return meals[0];
}

function populateWithData(element, mealData, location) {
  const categories = Object.keys(mealData);
  for (const category of categories) {
    const heading = document.createElement("h2");
    heading.classList.add("mt-4");
    heading.innerText = category;
    element.appendChild(heading);
    const foodData = mealData[category];
    const foods = Object.keys(foodData).sort();
    for (const food of foods) {
      const card = document.createElement("div");
      card.classList.add("card", "my-2");
      const body = document.createElement("div");
      body.classList.add("card-body");
      const title = document.createElement("h5");
      title.classList.add("card-title");
      const link = document.createElement("a");
      link.href = "#";
      link.innerText = food;
      const macros = foodData[food];
      link.addEventListener("click", e => {
        e.preventDefault();
        $("#modal-title").text(food);
        $("#modal-location").text(location);
        $("#td-cals").text(macros.calories);
        $("#td-carbs").text(macros.carbs);
        $("#td-fat").text(macros.fat);
        $("#td-protein").text(macros.protein);
        const nutritionUrl = macros.nutrition_url;
        document.getElementById("modal-button").href = nutritionUrl;
        $("#label-title").text(food);
        $("#macro-modal").modal("show");
        return false;
      });
      title.appendChild(link);
      body.appendChild(title);

      const cals = macros.calories;
      const text = document.createElement("p");
      text.classList.add("card-text");
      let shouldShowText = false;
      if (cals && cals !== "0") {
        shouldShowText = true;
        text.innerText = cals + " Cal ";
      }
      const labels = macros.labels;
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
        iconBox.addEventListener("click", e => {
          e.preventDefault();
        });
        text.appendChild(iconBox);
      }
      if (shouldShowText) {
        body.appendChild(text);
      }
      card.appendChild(body);
      element.appendChild(card);
    }
  }
}

function updateDayMeal(dayIndex, meal, divArray) {
  const fixedIndex = 0 <= dayIndex && dayIndex < divArray.length ? dayIndex : 0;
  const mealElement = document.getElementById(getIdForMeal(meal));
  $(mealElement).children(".meal-div").each((_, e) => e.hidden = true);
  divArray[fixedIndex].hidden = false;
}

function getIdForMeal(meal) {
  return meal.toLowerCase().replace(/-*[^a-zA-Z\d-]+-*/g, "-");
}

const dayStrings = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
  "Saturday", "Sunday"];

function dateStringToDay(dateString) {
  const dayString = dateString.match(/[a-zA-Z]+/)[0];
  return dayStrings.indexOf(dayString);
}

$(() => {
  const url = new URL(window.location.href);
  const location = url.searchParams.get("location");
  const station = url.searchParams.get("station");
  if (station) {
    $("#title").text(station);
  } else {
    $("#title").text(location);
  }
  $.getJSON("https://esabherwal.github.io/danforks/menu_scrape/menu_data.json",
      {}, data => {
        const locationData = data[location];
        let stationData = locationData[station || ""];
        if (!stationData) {
          var str = String(locationData["hours"]);
          var locHours = str.replace(/<br\s*[\/]?>/gi, "\n");
          if (locHours != "undefined") {
            $("#hours").text(locHours);
          }
          stationData = {};
          const menus = {};
          const stationNames = Object.keys(locationData).sort();
          for (const stationName of stationNames) {
            const stationMenus = locationData[stationName].menus;
            Object.entries(stationMenus).forEach(([day, stationDayData]) => {
              let dayData;
              if (menus[day]) {
                dayData = menus[day];
              } else {
                dayData = {menu: {}};
                menus[day] = dayData;
              }
              const menu = dayData.menu;
              Object.entries(stationDayData.menu).forEach(
                  ([meal, stationMealData]) => {
                    if (!menu[meal]) {
                      menu[meal] = {};
                    }
                    let mealData = menu[meal];
                    Object.entries(stationMealData).forEach(
                        ([category, categoryData]) => {
                          mealData[stationName + " \u00b7 "
                          + category] = categoryData;
                        });
                  });
            });
          }
          stationData.menus = menus;
        }
        const menus = stationData.menus;
        var str2 = String(stationData["hours"]);
        var staHours = str2.replace(/<br\s*[\/]?>/gi, "\n");
        if (staHours == "undefined") {
          $("#hours").text(staHours);
        }
        const days = Object.keys(menus).filter(
            s => Object.keys(menus[s].menu).length !== 0
        ).sort((a, b) => dateStringToDay(a) - dateStringToDay(b));

        const meals = [];
        for (const day of days) {
          for (const meal of Object.keys(menus[day].menu)) {
            if (!meals.includes(meal)) {
              meals.push(meal);
            }
          }
        }
        const mealsCopy = meals.slice();
        const standardOrder = ["BREAKFAST", "LUNCH", "DINNER"];
        meals.sort((a, b) => {
          if (standardOrder.includes(a) && standardOrder.includes(b)) {
            return standardOrder.indexOf(a) - standardOrder.indexOf(b);
          } else {
            return mealsCopy.indexOf(a) - mealsCopy.indexOf(b);
          }
        });
        const dataDivs = {};
        const contentDivs = {};
        for (const meal of meals) {
          dataDivs[meal] = [];
          const li = document.createElement("li");
          li.classList.add("nav-item");
          const a = document.createElement("a");
          const safeName = getIdForMeal(meal);
          a.id = safeName + "-a";
          a.classList.add("nav-link");
          a.setAttribute("data-toggle", "tab");
          a.href = "#" + safeName;
          a.role = "tab";
          a.innerText = meal;
          li.appendChild(a);
          document.getElementById("time-tabs").appendChild(li);
          const contentDiv = document.createElement("div");
          contentDiv.classList.add("tab-pane", "fade");
          contentDiv.id = safeName;
          contentDiv.role = "tabpanel";
          document.getElementById("tab-content").appendChild(contentDiv);
          contentDivs[meal] = contentDiv;
          $(a).tab();
        }

        const alert = document.createElement("div");
        alert.classList.add("alert", "alert-secondary", "meal-div", "my-2");
        alert.role = "alert";
        alert.innerText = "Closed at this time";
        alert.hidden = true;

        for (const meal of meals) {
          const mealDataDivs = dataDivs[meal];
          const contentDiv = contentDivs[meal];
          for (const day of days) {
            const menu = menus[day].menu;
            const mealData = menu[meal];
            if (mealData) {
              const div = document.createElement("div");
              div.classList.add("meal-div");
              div.hidden = true;
              populateWithData(div, mealData, station || location);
              mealDataDivs.push(div);
              contentDiv.appendChild(div);
            } else {
              const alertClone = alert.cloneNode(true);
              mealDataDivs.push(alertClone);
              contentDiv.appendChild(alertClone);
            }
          }
          const spacer = document.createElement("div");
          spacer.style.height = "56px";
          contentDiv.appendChild(spacer);
        }

        $("#" + getIdForMeal(getDefaultMeal(meals)) + "-a").tab("show");

        days[0] = "Today";
        days[1] = "Tomorrow";
        for (let i = 2; i < days.length; i++) {
          days[i] = days[i].match(/[a-zA-Z]+/)[0];
        }

        updateDay(0);

        function updateDay(newDayIndex) {
          for (const meal of meals) {
            updateDayMeal(newDayIndex, meal, dataDivs[meal]);
          }
          $("#current-link").text(days[newDayIndex]);
        }

        const maxIndex = Math.max(
            ...Object.values(dataDivs).map(value => value.length));

        function disablePagerButtons() {
          if (dayIndex < 1) {
            dayIndex = 0;
            $("#previous").addClass("disabled");
          } else {
            $("#previous").removeClass("disabled");
          }
          if (dayIndex >= maxIndex - 1) {
            dayIndex = maxIndex - 1;
            $("#next").addClass("disabled");
          } else {
            $("#next").removeClass("disabled");
          }
        }

        let dayIndex = 0;
        $("#previous-link").click(() => {
          dayIndex--;
          disablePagerButtons();
          updateDay(dayIndex);
          return false;
        });
        $("#next-link").click(() => {
          dayIndex++;
          disablePagerButtons();
          updateDay(dayIndex);
          return false;
        });
      });
});
