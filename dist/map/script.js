//adapted from https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple
function initMap() {

  //DUC works for all tasks, yay
  var myLocation = {lat: 38.648057, lng: -90.310565}; //DUC
  var initialZoom = 16.5;

  let hoursOfOperationHTML = "<span style='text-decoration:underline;'>Hours of Operation</span> <br>"

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: initialZoom,
    center: myLocation,
    styles: [{
      "featureType": "poi.business",
      "stylers": [{"visibility": "off"}]
    },
      {
        "featureType": "transit",
        "elementType": "labels.icon",
        "stylers": [{"visibility": "off"}]
      }],
    mapTypeControlOptions: {
      mapTypeIds: [
        google.maps.MapTypeId.ROADMAP,
        google.maps.MapTypeId.SATELLITE
      ]
    }
  });

  const openNow = document.createElement("span");
  openNow.style.color = "green";
  openNow.innerText = "OPEN NOW";
  const closed = document.createElement("span");
  closed.style.color = "red";
  closed.innerText = "CLOSED NOW";

  //list of locations with coords and info
  let locations = {
    duc: {
      pointLocation: {
        lat: 38.647563,
        lng: -90.310455
      },
      title: "DUC",
      open: false, // TODO determine if open
      hours: hoursOfOperationHTML + "M-F: 11a-3p <br> Sa, Su: Closed",
      link: "DUC"
    },
    bd: {
      pointLocation: {
        lat: 38.644949,
        lng: -90.313163
      },
      title: "Bear’s Den",
      open: true,
      hours: hoursOfOperationHTML
          + "M-Th: 7:30am-2am <br> Fri: 7:30am-3am<br>Sat: 8:30am - 3am<br> Sun: 8:30am - 1am",
      link: "Bear’s%20Den"
    },
    hillman: {
      pointLocation: {
        lat: 38.646899,
        lng: -90.304714
      },
      title: "Grounds for Change",
      open: false, // TODO determine if open
      hours: hoursOfOperationHTML + "<br>M-F: 8a-2p<br>",
      link: "Grounds%20for%20Change"
    },
    lopata: {
      pointLocation: {
        lat: 38.649407,
        lng: -90.306066
      },
      title: "Stanley's",
      open: false, // TODO determine if open
      hours: hoursOfOperationHTML + "M-F: 9:30a-3p<br> Sa-Su: Closed",
      link: "Stanley’s"
    },
    village: {
      pointLocation: {
        lat: 38.650643,
        lng: -90.314071
      },
      title: "The Village",
      open: true,
      hours: hoursOfOperationHTML
          + "M-Th: 8a-12a<br> Fr: 8a-2a<br> Sa: 9a-2a<br> Su: 9a-12a",
      link: "The%20Village"
    },
    holmes: {
      pointLocation: {
        lat: 38.648355,
        lng: -90.306184
      },
      title: "Holmes Lounge",
      open: false, // TODO determine if open
      hours: hoursOfOperationHTML + "M-F: 7:30a-3p<br> Sa-Su: Closed",
      link: "Holmes%20Lounge"
    },
    ettas: {
      pointLocation: {
        lat: 38.646830,
        lng: -90.302662
      },
      title: "Etta's",
      open: false, // TODO determine if open
      hours: hoursOfOperationHTML
          + "M-Th: 7:45a-6p<br> Fr: 7:45a-3p<br> Sa-Su: Closed",
      link: "Etta’s"
    },
    whispers: {
      pointLocation: {
        lat: 38.648288,
        lng: -90.307456
      },
      title: "Whispers Café",
      open: false, // TODO determine if open
      hours: hoursOfOperationHTML
          + "M-Th, 7:30am-12am<br> F: 7:30am-3pm<br> Sat: 9am-1pm<br> Sun: 9am-12am",
      link: "Whispers%20Café"
    },
    bergson: {
      pointLocation: {
        lat: 38.647758,
        lng: -90.310705
      },
      title: "Café Bergson",
      open: false, // TODO determine if open
      hours: hoursOfOperationHTML
          + "M-F: 7:30a - 5p<br> Sa: 9a-3p<br> Su: 9a-7p ",
      link: "DUC&station=Café%20Bergson"
    },
    lawCafe: {
      pointLocation: {
        lat: 38.649708,
        lng: -90.312092
      },
      title: "Law Café",
      open: false, // TODO determine if open
      hours: hoursOfOperationHTML + "M-Th: 8a-3p<br>Fr: 8a-2p<br>Sa-Su: Closed",
      link: "Law%20Café"
    }
  };

  const infoWindow = new google.maps.InfoWindow({
    content: ""
  });

  for (const location of Object.values(locations)) {
    const content = document.createElement("div");
    const h1 = document.createElement("h1");
    h1.innerText = location.title;
    content.appendChild(h1);
    const bodyContent = document.createElement("div");
    const openText = location.open ? openNow : closed;
    bodyContent.appendChild(openText.cloneNode(true));
    const p = document.createElement("p");
    p.innerHTML = location.hours;
    bodyContent.appendChild(p);
    const a = document.createElement("a");
    a.classList.add("btn", "btn-light");
    a.href = "/menu/?location=" + location.link;
    a.role = "button";
    a.innerText = "Menu";
    bodyContent.appendChild(a);
    content.appendChild(bodyContent);

    const markerData = {
      position: location.pointLocation,
      map: map,
      title: location.title,
      label: {
        text: location.title,
        fontSize: "12px",
        fontWeight: "bold"
      }
    };
    if (!location.open) {
      markerData.icon = "graymarkersmall.png";
    }
    const marker = new google.maps.Marker(markerData);

    google.maps.event.addListener(marker, "click", () => {
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
    });

  }
  document.getElementById("recenter-button").addEventListener("click",
      function () {
        map.setCenter(myLocation);
        map.setZoom(initialZoom);
      }
  );
}
