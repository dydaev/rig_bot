var ping = require('ping');
var snmp = require ("net-snmp");

var hosts = ['192.168.0.249'];//rig host
var snmpHost = '192.168.0.200';//rebooter

var downTime = 0.5;//min
var pingInterval = 5;//sec

var counter = calcDownTime();
var togglePing = true;

var session = snmp.createSession (snmpHost, "your_password");

//snmpInit();

var interval = setInterval(function(hosts){
  
  hosts.forEach(function(host){
    ping.sys.probe(host, function(isAlive){
      
      if (!isAlive) {
        if (togglePing) console.log(getTimeStr("full"), host, 'is DOWN');

        togglePing = false;
        counter--;
      } else {
        if (!togglePing) console.log(getTimeStr("full"), host, 'is UP');

        togglePing = true;
        counter = calcDownTime();
      }
    });
  });

  //console.log(counter)

  if (counter < 1) {
    snmpReboot();
    //do something etc..reboot rig, send message
		//clearInterval(interval);
    counter = calcDownTime();
	}

}, pingInterval * 1000, hosts)

if (interval) {
  console.log(getTimeStr("full"), "started!");
  ping.sys.probe(hosts[0], function(isAlive){
    if (isAlive) {
      console.log('ping to', hosts[0], 'good!')
    }
  });
}

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

function snmpInit() {
  var oids = ["1.3.6.1.4.1.35160.1.7.0"];
  session.get (oids, function (error, varbinds) {
      if (error) {
          console.error (error);
          process.exit(1)
      } else {
          for (var i = 0; i < varbinds.length; i++) {
              if (snmp.isVarbindError (varbinds[i])) {
                  console.error (snmp.varbindError (varbinds[i]));
                  process.exit(1)
              } else {
                var snmpObjName = varbinds[i].value;
                //console.log (varbinds[i].oid + " = " + varbinds[i].value);
                console.log (snmpObjName + ' is initialised');
             }
         }
     }
      session.close ();
  });
}

function setSnmpPowrPort(port, state) {
  var varbinds = [
    {
        oid: "1.3.6.1.4.1.35160.1.11.1.4." + port,
        type: snmp.ObjectType.Integer32,
        value: state
    }
  ];
  session.set (varbinds, function (error, varbinds) {
    if (error) {
        console.error (error.toString ());
    } else {
        for (var i = 0; i < varbinds.length; i++) {
            console.log (getTimeStr("full"), varbinds[i].oid + " <- " + varbinds[i].value);

            if (snmp.isVarbindError (varbinds[i]))
                console.error (snmp.varbindError (varbinds[i]));
            //else
                //console.log (varbinds[i].oid + "|" + varbinds[i].value);
        }
    }
  });

}

function snmpReboot(secTurnHold = 6) {
  var upAfterDownSec = 10;

  setSnmpPowrPort(1, 1);

  setTimeout(function(){
    setSnmpPowrPort(1, 0);
  }, secTurnHold * 1000);

  setTimeout(function(){
    setSnmpPowrPort(1, 1);
 
    setTimeout(function(){
      setSnmpPowrPort(1, 0);
    }, 1000);

  }, (secTurnHold * 1000 + (upAfterDownSec * 1000)))

}
