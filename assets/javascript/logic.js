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
var databaseRef = database.ref("/trains");
var initialLoad = true;


//figure out when the next train is due, and how far away it is
function nextTrain(firstTime, frequency) {

  var returnArr = [];
  var minutesAway = 0;
  var now = moment();

  //covert the first train to a time format
  var firstTimeConverted = moment(firstTime, "HH:mm");

  var arrivalTime = moment(firstTimeConverted).format("hh:mm a");

  // Difference between the times
  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

  //need to calculate differently if first train is in the future
  if (diffTime < 0) {
    minutesAway = diffTime * -1 + 1;
  }
  else {
    // Time apart (remainder)
    var tRemainder = diffTime % frequency;
    minutesAway = frequency - tRemainder;
    var Arrival = moment().add(minutesAway, "minutes");
    arrivalTime = moment(Arrival).format("hh:mm a");
  }

  returnArr[0] = minutesAway;
  returnArr[1] = arrivalTime;

  return returnArr;
}

//this is used for an update
function getRecord(recordKey) {
  //get the data from the database
  var ref = firebase.database().ref("trains/" + recordKey);

  ref.once("value")
    .then(function (snapshot) {
      //set the values in the dialog box
      var trainN = snapshot.val().name;
      var firstT = snapshot.val().firstTrain;
      var destination = snapshot.val().destination;
      var frequency = snapshot.val().frequency;
      $("#trainname-input").val(trainN);
      $("#destination-input").val(destination);
      $("#firsttrain-input").val(firstT);
      $("#frequency-input").val(frequency);
    });
}


function clearInput() {
  // Clears all of the text-boxes
  $("#trainname-input").val("");
  $("#destination-input").val("");
  $("#firsttrain-input").val("");
  $("#frequency-input").val("");
}


function addTrain(childSnapshot) {
  // Store everything into a variable.
  var trainName = childSnapshot.val().name;
  var destination = childSnapshot.val().destination;
  var firstTrain = childSnapshot.val().firstTrain;
  var frequency = childSnapshot.val().frequency;
  var tkey = childSnapshot.key;

  // determine the next arrival time and time between.  Returns an array
  var nextArrival = nextTrain(firstTrain, frequency);
  var nextArrivalTime = nextArrival[1];
  var minutesAway = nextArrival[0];


  // Create the new row
  var newRow = $("<tr class='trow'>").append(
    $("<td>").text(trainName),
    $("<td>").text(destination),
    $("<td class='tabcenter'>").text(frequency),
    $("<td class='tabcenter'>").text(nextArrivalTime),
    $("<td class='tabcenter'>").text(minutesAway),
    $("<td class='tabcenter' id=" + tkey + ">")
  );
  // Append the new row to the table
  $("#trainbody").append(newRow);

  //add update and delete buttons
  var optionBtn = $("<button>");
  optionBtn.attr("type", "button");
  optionBtn.addClass("btn btn-success btn-update btn-modify");
  optionBtn.attr("key", tkey);
  optionBtn.text("Update");
  $("#" + tkey).append(optionBtn);

  optionBtn = $("<button>");
  optionBtn.attr("type", "button");
  optionBtn.addClass("btn btn-warning btn-delete btn-modify");
  optionBtn.attr("key", tkey);
  optionBtn.text("Delete");
  $("#" + tkey).append(optionBtn);

}

//initialize the app.  Refreshing trains list every minute
function initializeApp() {
  var trainRefresh = setInterval(loadTrains, 60000, "timer");
}

//this will load the trains the initial time and reload on changes
function loadTrains(snapshot) {
  //clear the trains and reload all of them
  $("tbody").empty();
  //snapshot will be passed in on initial load or change, otherwise refresh by timer and need to reload
  if (snapshot === "timer") {
    databaseRef.orderByChild('name').once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          addTrain(childSnapshot);
        });
      });
  }
  //process the snapshot already retrieved
  else {
    snapshot.forEach(function (childSnapshot) {
       addTrain(childSnapshot);
    });
  }
}


// when submit on modal is clicked.  Could be add or update
$("#submit-train-btn").on("click", function (event) {
  event.preventDefault();
  // Grabs user input
  var trainName = $("#trainname-input").val().trim();
  var destination = $("#destination-input").val().trim();
  var firstTrain = $("#firsttrain-input").val().trim();
  var frequency = $("#frequency-input").val().trim();

  // Creates local "temporary" object for holding train data
  var newTrain = {
    name: trainName,
    destination: destination,
    firstTrain: firstTrain,
    frequency: frequency
  };

  //which action, add or update.
  var userAction = $("#submit-train-btn").attr("action");
// Uploads train data to the database
  if (userAction == "add") {
    var newkey = databaseRef.push(newTrain).key;   //get unique key for future changes
  }
  else {
    //updating the record
    var updates = {};
    updates['/trains/' + userAction] = newTrain;
    var dreturn = database.ref().update(updates);
  }
  clearInput();
});


//if they click the add train button.  Need to set the action of the submit button
$("#add-train-btn").click(function () {
  event.preventDefault();
  //set the action for the submit button to be add
  $("#submit-train-btn").attr("action", "add");
  // Clears all of the text-boxes
  clearInput();

  //open the modal
  $('#myModal').modal('show');
});


//if they click on the update, pull up the modal populated with associated row

$("#train-table").on('click', '.btn-update', function () {
  event.preventDefault();

  //get the database key for the row from the button
  var tkey = $(this).attr("key");

  //get the data from the database and load into form
  getRecord(tkey);

  //set the action of the modal submit button to the key for an update
  $("#submit-train-btn").attr("action", tkey);

  $('#myModal').modal('show');

});

//delete the selected row.
$("#train-table").on('click', '.btn-delete', function () {
  event.preventDefault();

  //get the database key for the row
  var tkey = $(this).attr("key");
  var response = confirm("Are you sure you want to delete this train?");
  if (response === true) {
    var dreturn = databaseRef.child(tkey).remove();
  }
});

// Retrieve data from the database and display.  Going to order by the train name
databaseRef.orderByChild('name').on("value", function (snapshot) {
  //console.log("snapshot JSON: " + JSON.stringify(snapshot));
  loadTrains(snapshot);
});

initializeApp();
