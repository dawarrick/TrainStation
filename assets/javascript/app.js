// Steps to complete:

// 1. Initialize Firebase
// 2. Create button for adding new trains - then update the html + update the database
// 3. Create a way to retrieve train schedules from the database.
// 4. Create a way to calculate the next arrival and minutes away based on the first train time, and frequency. 
//    Then use moment.js formatting date stuff.




// 1. Initialize Firebase with Deb's creds.
var config = {
  apiKey: "AIzaSyAMPmTKXbyXXz6YjuQmeWTksvwnIEtjLYM",
  authDomain: "debs-first-project.firebaseapp.com",
  databaseURL: "https://debs-first-project.firebaseio.com"
};

firebase.initializeApp(config);

var database = firebase.database();

function nextTrain(firstTime, frequency, currentTime) {
  // Assumptions
  /*      var tFrequency = 3;
  
        // Time is 3:30 AM
        var firstTime = "03:30";
  */
  // First Time (pushed back 1 year to make sure it comes before current time)

  var returnArr=[];
  var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
  console.log("firsttimeconvereted: " + firstTimeConverted);

  // Difference between the times
  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  console.log("DIFFERENCE IN TIME: " + diffTime);

  // Time apart (remainder)
  var tRemainder = diffTime % frequency;
  console.log(tRemainder);

  // Minute Until Train
 // var tMinutesTillTrain = frequency - tRemainder;
 returnArr[0] = frequency - tRemainder;
 // console.log("MINUTES TILL TRAIN: " + returnVal[0]);

  // Next Train
  //var nextTrain = moment().add(tMinutesTillTrain, "minutes");
  //var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    //console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));

  varArrival =moment().add(returnArr[0], "minutes");
  returnArr[1] = moment(varArrival).format("hh:mm a");
  console.log("ARRIVAL TIME: " + returnArr[1]);
  return returnArr;
}



// 2. Button for adding trains
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

  // Creates local "temporary" object for holding employee data
  var newTrain = {
    name: trainName,
    destination: destination,
    firstTrain: firstTrain,
    frequency: frequency
  };

  console.log("newTrain: " + newTrain);

  // Uploads train data to the database
  database.ref().push(newTrain);

  // Logs everything to console
  console.log("train name: " + newTrain.trainName);
  console.log("destination: " + newTrain.destination);
  console.log("first train: " + newTrain.firstTrain);
  console.log("frequency: " + newTrain.frequency);

  alert("Train successfully added");

  // Clears all of the text-boxes
  $("#trainname-input").val("");
  $("#destination-input").val("");
  $("#firsttrain-input").val("");
  $("#frequency-input").val("");
});

// 3. Create Firebase event for adding train to the database and a row in the html when a user adds an entry
database.ref().on("child_added", function (childSnapshot) {
  console.log(childSnapshot.val());

  // Store everything into a variable.
  var trainName = childSnapshot.val().name;
  var destination = childSnapshot.val().destination;
  var firstTrain = childSnapshot.val().firstTrain;
  var frequency = childSnapshot.val().frequency;

  // Train Info
  console.log("trainName: " + trainName);
  console.log("destination: " + destination);
  console.log("first train: " + firstTrain);
  console.log("frequency: " + frequency);

  // determine the next arrivale time and time between.  Returns an array
  var nextArrival = nextTrain(firstTrain, frequency, moment());
  var nextArrivalTime = nextArrival[1];
  console.log("next arrival: " + nextArrivalTime);
    var minutesAway =  nextArrival[0];
  console.log("minutes away: " + minutesAway);

  // Create the new row
  var newRow = $("<tr>").append(
    $("<td>").text(trainName),
    $("<td>").text(destination),
    $("<td>").text(frequency),
    $("<td>").text(nextArrivalTime),
    $("<td>").text(minutesAway)
  );

  // Append the new row to the table
  $("#train-table > tbody").append(newRow);
});

// Example Time Math
// -----------------------------------------------------------------------------
// Assume Employee start date of January 1, 2015
// Assume current date is March 1, 2016

// We know that this is 15 months.
// Now we will create code in moment.js to confirm that any attempt we use meets this test case
