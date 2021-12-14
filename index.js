var ping = require('ping');

var hosts = ['192.168.0.11']//, '192.168.0.234', '192.168.0.123'];

var downTime = 1;//min
var pingInterval = 5;//sec

var counter = calcDownTime();
var togglePing = true;

var interval = setInterval(function(hosts){
  
  hosts.forEach(function(host){
    ping.sys.probe(host, function(isAlive){
      var dt = new Date();
      var date = ("0" + dt.getDate()).slice(-2);
      var month = ("0" + (dt.getMonth() + 1)).slice(-2);

      // current year
      var year = dt.getFullYear();

      // current hours
      var hours = dt.getHours();

      // current minutes
      var minutes = dt.getMinutes();

      // current seconds
      var seconds = dt.getSeconds();

      //var msg = isAlive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';
      
      if (!isAlive) {
        if (togglePing) console.log(getTimeStr("full"), host, 'is DOWN');

        togglePing = false;
        counter--;
      } else {
        if (!togglePing) console.log(getTimeStr("full"), host, 'is UP');

        togglePing = true;
        counter = calcDownTime();
      }
      //console.log(msg);
    });
  });

  console.log(counter)

  if (counter < 1) {
    //do something etc..reboot rig, send message
		clearInterval(interval);
	}

}, pingInterval * 1000, hosts)

function getTimeStr(quality = "full") {
  var dt = new Date();
  var date = ("0" + dt.getDate()).slice(-2);
  var month = ("0" + (dt.getMonth() + 1)).slice(-2);
  // current year
  var year = dt.getFullYear();
  // current hours
  var hours = dt.getHours();
  // current minutes
  var minutes = dt.getMinutes();
  // current seconds
  var seconds = dt.getSeconds();
  switch(quality) {
    case "full":
      return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    break;
    default:
      return '';
    break;
  }
}

function calcDownTime() {
  return (downTime * 60) / pingInterval;
}
