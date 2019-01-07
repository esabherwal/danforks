function populateData(openLocations) {
  $.getJSON("https://esabherwal.github.io/danforks/menu_scrape/menu_data.json",
      {}, data => {
        const locationsDiv = document.getElementById("locations");
        for (const location of Object.keys(data).sort()) {
          const stationNames = Object.keys(data[location]).sort();
          if (stationNames.length >= 2) {
            const div = document.createElement("div");
            div.classList.add("dropdown");
            const button = document.createElement("button");
            button.classList.add("btn", "btn-block", "dropdown-toggle", "my-2");
            button.classList.add("btn-secondary"); // TODO based on open
            button.type = "button";
            button.setAttribute("data-toggle", "dropdown");
            button.innerText = location;
            div.appendChild(button);
            const menu = document.createElement("div");
            menu.classList.add("dropdown-menu");
            const allStations = document.createElement("a");
            allStations.classList.add("dropdown-item");
            allStations.href = "../menu/?location=" + encodeURIComponent(
                location);
            allStations.innerText = "All stations";
            menu.appendChild(allStations);
            const divider = document.createElement("div");
            divider.classList.add("dropdown-divider");
            menu.appendChild(divider);
            for (const station of stationNames) {
              const item = document.createElement("a");
              item.classList.add("dropdown-item");
              item.href = "../menu/?location="
                  + encodeURIComponent(location) + "&station="
                  + encodeURIComponent(station);
              item.innerText = station;
              menu.appendChild(item);
            }
            div.appendChild(menu);
            locationsDiv.appendChild(div);
            $(button).dropdown();
          } else {
            const button = document.createElement("a");
            button.href = "../menu/?location="
                + encodeURIComponent(location);
            button.classList.add("btn", "btn-block", "my-2");
            button.classList.add("btn-secondary"); // TODO based on open
            button.role = "button";
            button.innerText = location;
            locationsDiv.appendChild(button);
          }
        }
        const spacer = document.createElement("div");
        spacer.style.height = "56px";
        locationsDiv.appendChild(spacer);
      });
}

$(() => {
  // if (taskNumber === 1) {
  //   $.getJSON("https://esabherwal.github.io/danforks/menus/open.json", {},
  //       populateData);
  // } else {
  populateData(); // TODO based on open
  // }
});