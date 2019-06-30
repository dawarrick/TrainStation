// logic.js - used for the train station app

// 1. Initialize Firebase
// 2. Create button for adding new trains - then update the html + update the database
// 3. Create a way to retrieve train schedules from the database.
// 4. Create a way to calculate the next arrival and minutes away based on the first train time, and frequency. 
// 5. Use moment.js for date processing.

// 1. Initialize Firebase with Deb's creds.
var config = {
  apiKey: "AIzaSyAMPmTKXbyXXz6YjuQmeWTksvwnIEtjLYM",
  authDomain: "debs-first-project.firebaseapp.com",
  databaseURL: "https://debs-first-project.firebaseio.com"
};

firebase.initializeApp(config);

var database = firebase.database();
var connectionsRef = database.ref("/trains");


//figure out when the next train is due, and how far away it is
function nextTrain(firstTime, frequency) {

  var returnArr = [];
  var minutesAway = 0;
  var now = moment();
  console.log("now: " + now);
 
//covert the first train to a time format
  var firstTimeConverted = moment(firstTime, "HH:mm");
  console.log("firsttimeconvereted: " + firstTimeConverted);

  var arrivalTime = moment(firstTimeConverted).format("hh:mm a");

  // Difference between the times
  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  console.log("DIFFERENCE IN TIME: " + diffTime);

  //need to calculate differently if first train is in the future
  if (diffTime < 0) {
    minutesAway = diffTime * -1 + 1;
    console.log("First Time: "+minutesAway);
  }
  else {
    // Time apart (remainder)
    var tRemainder = diffTime % frequency;
    console.log("Remainder: "+tRemainder);
    minutesAway = frequency - tRemainder;
    var Arrival = moment().add(minutesAway, "minutes");
    arrivalTime = moment(Arrival).format("hh:mm a");
  }

  returnArr[0] = minutesAway;
  returnArr[1] = arrivalTime;


  console.log("MINUTES away: " + returnArr[0]);

  console.log("ARRIVAL TIME: " + returnArr[1]);
  return returnArr;
}

// 2. Button for adding trains to the database and displaying on screen
$("#add-train-btn").on("click", function (event) {
  event.preventDefault();

  // Grabs user input
  var trainName = $("#trainname-input").val().trim();
  var destination = $("#destination-input").val().trim();
  var firstTrain = $("#firsttrain-input").val().trim();
  var frequency = $("#frequency-input").val().trim();

  console.log("train name: " + trainName);
  console.log("destination: " + destination);
  console.log("first train: " + firstTrain);
  console.log("frequency: " + frequency);

  // Creates local "temporary" object for holding train data
  var newTrain = {
    name: trainName,
    destination: destination,
    firstTrain: firstTrain,
    frequency: frequency
  };
  console.log("newTrain: " + newTrain);
  // Uploads train data to the database
  var newkey = connectionsRef.push(newTrain).key;   //get unique key for future changes
  // database.ref().push(newTrain);
  //var newKey = database.ref().child.push().key();
  //var updates = {};
  //  updates[newKey] = newTrain;

  // Logs everything to console
  console.log("train name: " + newTrain.trainName);
  console.log("destination: " + newTrain.destination);
  console.log("first train: " + newTrain.firstTrain);
  console.log("frequency: " + newTrain.frequency);
  console.log("key: " + newkey);


  //alert("Train successfully added");

  // Clears all of the text-boxes
  $("#trainname-input").val("");
  $("#destination-input").val("");
  $("#firsttrain-input").val("");
  $("#frequency-input").val("");
});

// Retrieve data from the database and display.
//lets order by the train name
connectionsRef.orderByChild('name').on("child_added", function (childSnapshot) {
  console.log(childSnapshot.val());

  // Store everything into a variable.
  var trainName = childSnapshot.val().name;
  var destination = childSnapshot.val().destination;
  var firstTrain = childSnapshot.val().firstTrain;
  var frequency = childSnapshot.val().frequency;
  var tkey = childSnapshot.key;

  // Train Info
  console.log("trainName: " + trainName);
  console.log("destination: " + destination);
  console.log("first train: " + firstTrain);
  console.log("frequency: " + frequency);
  console.log("key: " + tkey);

  // determine the next arrivale time and time between.  Returns an array
  var nextArrival = nextTrain(firstTrain, frequency);
  var nextArrivalTime = nextArrival[1];
  console.log("next arrival: " + nextArrivalTime);
  var minutesAway = nextArrival[0];
  console.log("minutes away: " + minutesAway);

  // Create the new row
  var newRow = $("<tr>").append(
    $("<td>").text(trainName),
    $("<td>").text(destination),
    $("<td class='tabcenter'>").text(frequency),
    $("<td class='tabcenter'>").text(nextArrivalTime),
    $("<td class='tabcenter'>").text(minutesAway)
  );

  // Append the new row to the table
  $("#train-table > tbody").append(newRow);
});
