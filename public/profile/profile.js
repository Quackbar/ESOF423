var id="";

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        id = user.uid;
    }
    else {
        id=getUrlVars()["id"];
    }
});

function gotofiles() {
    document.location.href = './files.html?id='+getUrlVars()["id"]; 
}

var url = "https://esof-423.firebaseio.com/users/"+getUrlVars()["id"]+"/";
var fname = "username.json";
var lname = "gender.json";
var btype = "profile_type.json";
var email = "email.json";
var userId = "age.json";
var ppic = "profile_picture.json";

//Current user that is logged in
//Change to string for developing
//var currentUser = localStorage.getItem("id");
var currentUser = "8YpNiadkgRROaxCVV2qJIwuJpZB3";
console.log(currentUser);

if(currentUser==getUrlVars()["id"]) {
    //Viewing your Profile
    ppic= updateInfo(url +ppic, "ppic");
    fname= updateInfo(url + fname, "fname");
    lname= updateInfo(url +lname, "lname");
    btype= updateInfo(url +btype, "btype");
    email= updateInfo(url +email, "email");
    userId= updateInfo(url +userId, "userId");

    displayFriends();
    displayRequests();
}
else {
    //Viewing someone elses
    ppic= updateInfo(url +ppic, "ppic");
    fname= updateInfo(url + fname, "fname");

    //Hide Info we don't want people seeing
    document.getElementById("btype").style.display = "none";
    document.getElementById("email").style.display = "none";
    document.getElementById("userId").style.display = "none";
    document.getElementById("lname").style.display = "none";
    document.getElementById("nav").style.display = "none";

    //Add friend button goes here
    document.getElementById("addFriend").innerHTML = "<a href='' onclick='friendRequest()' class='button'>Add Friend</a>";
}

function friendRequest() {
    var friendId = getUrlVars()["id"];
    var currentUser = localStorage.getItem("id");
    
    var userRef = firebase.database().ref().child("users/"+friendId+"/friend_req");
    
    var newReq = userRef.push();
    var reqKey = newReq.key;
    
    newReq.set({
        req: currentUser,
        key: reqKey
    });
    
    alert("Friend Request Sent");
}

function alreadyFriends(reqId) {
    var userId = "8YpNiadkgRROaxCVV2qJIwuJpZB3";
    var flag = false;

    var ref = firebase.database().ref().child('users/'+userId+"/friend_list");

    // Get the most recent request
    ref.on("value", function(data) {
        var requests = data.val();

        ref.orderByChild("friend").on("child_added", function(data) {
            
            if(data.val().friend == reqId) {
                flag = true;
            }
        });
    });
    
    return flag;
}

function addFriend(reqId) {
    var currentUser = getUrlVars()["id"];
    if (!alreadyFriends(reqId)) {
        
        var userRef = firebase.database().ref().child('users/'+currentUser+"/friend_list");
        var friendRef = firebase.database().ref().child('users/'+reqId+"/friend_list");

        var newReq = friendRef.push();
        var reqKey = newReq.key;
        var newReq2 = userRef.push();
        var reqKey2 = newReq2.key;

        newReq.set({
            friend: currentUser,
            key: reqKey
        });

        newReq2.set({
            friend: reqId,
            key: reqKey2
        });

        deleteReq(reqId,currentUser);

        alert("You are now friends");
    }
    else {
        deleteReq(reqId,currentUser)
        
        alert("You are already friends");
    }
}

function deleteReq(reqId,userId) {
    var ref = firebase.database().ref().child('users/'+userId+"/friend_req");

    // Get the most recent request
    ref.on("value", function(data) {
        var requests = data.val();

        ref.orderByChild("req").equalTo(reqId).on("child_added", function(data) {
            ref.child(data.val().key+"/key").remove();
            ref.child(data.val().key+"/req").remove();
        });
    });
    
    //Refresh requests
    location = location;
}

function removeFriend(friendId) {
    var currentUser = getUrlVars()["id"];
    
    var userRef = firebase.database().ref().child('users/'+currentUser+"/friend_list");
    var friendRef = firebase.database().ref().child('users/'+friendId+"/friend_list");
    
    userRef.on("value", function(data) { 
        userRef.orderByChild("friend").on("child_added", function(snapshot) {
            userRef.child(snapshot.val().key+"/friend").remove();
            userRef.child(snapshot.val().key+"/key").remove();
        });
    });
    friendRef.on("value", function(data) {
        friendRef.orderByChild("friend").on("child_added", function(snapshot) {
            friendRef.child(snapshot.val().key+"/friend").remove();
            friendRef.child(snapshot.val().key+"/key").remove();
        });   
    });

    //Refresh requests
    location = location;
}
function displayRequests() {
    var display = document.getElementById("recentReq");

    //var currentUser = firebase.auth().currentUser.uid;
    var userId = "8YpNiadkgRROaxCVV2qJIwuJpZB3";

    var ref = firebase.database().ref().child('users/'+userId+"/friend_req");

    // Get the requests
    ref.on("value", function(data) {
        var requests = data.val();
        
        if(data.val()!=null) {
            display.innerHTML = display.innerHTML + "<h4>Friend Requests</h4>";
            ref.orderByChild("req").on("child_added", function(data) {
                //For each req display a new req div
                var reqRef = firebase.database().ref().child('users/'+data.val().req);

                reqRef.on('value', function(snapshot) {
                    var output = "";
                    var role = "";

                    if(snapshot.val()!=null) {
                        var user_name = snapshot.val().username;
                        var role = snapshot.val().profile_type;
                        var id = snapshot.val().id;

                        output += "<div class='req'>";
                        output += "<p>"+user_name+"</p>";
                        output += "<p>"+role+"</p>";
                        output += '<button type="button" onclick="addFriend(\''+ id + '\')">Accept Friend Request</button>';
                        output += "</div>";
                    }
                    else {
                    }

                    display.innerHTML = display.innerHTML + output;
                });
            });
        }
    });
}

function displayFriends() {
    var display = document.getElementById("friendList");

    //var currentUser = firebase.auth().currentUser.uid;
    var userId = "8YpNiadkgRROaxCVV2qJIwuJpZB3";

    var ref = firebase.database().ref().child('users/'+userId+"/friend_list");

    // Get friends from friend list
    ref.on("value", function(data) {
        var requests = data.val();
        
        if(data.val()!=null) {
            display.innerHTML = display.innerHTML + "<h4>Friend List</h4>";
            ref.orderByChild("friend").on("child_added", function(data) {
                var reqRef = firebase.database().ref().child('users/'+data.val().friend);

                reqRef.on('value', function(snapshot) {
                    var output = "";
                    var role = "";

                    if(snapshot.val()!=null) {
                        var user_name = snapshot.val().username;
                        var role = snapshot.val().profile_type;
                        var id = snapshot.val().id;

                        output += "<div class='friend'>";
                        output += "<p>"+user_name+"</p>";
                        output += "<p>"+role+"</p>";
                        output += '<button type="button" onclick="removeFriend(\''+ id + '\')">Remove Friend</button>';
                        output += "</div>";
                    }
                    else {
                    }
                    display.innerHTML = display.innerHTML + output;
                });
            });
        }
    });
}

function updateInfo(value, id) {
  console.log(value);

  fetch(value)
      .then(response => response.json())
      .then(data => {
          console.log(data);
          if(data == null) {
            document.getElementById(id).innerHTML = "";
          }
          else if(id == "ppic") {
            document.getElementById(id).style = "background-image: url("+data+");";
          }
          else {
            document.getElementById(id).innerHTML = document.getElementById(id).innerHTML + data;
          }

          return data;
      })
  .catch(err => {
    console.error('An error ocurred', err);
  })
}