// cycles through weekdays based off button click in either direction
function getWeekDays(){

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
    var index = d.getDay();
    var currentDate = weekday[index];
    document.getElementById("today").innerHTML = currentDate;

    //Yesterday
    document.getElementById("button1").onclick = function(){
      if(index <= 0){
        index = 7;
      }
      currentDate = weekday[index-1];
      index = index - 1;
      document.getElementById("today").innerHTML = currentDate;
    };

    //Tomorrow
    document.getElementById("button2").onclick = function(){
      if(index >=6){
        index = -1;
      }
      currentDate = weekday[index+1];
      index = index + 1
      document.getElementById("today").innerHTML = currentDate;
    };
    return currentDate;
}

getWeekDays()
