var user_arr = [];
var counter = 0;

getNames();

function getNames(){
    var ref = firebase.database().ref().child('users');
    
    // Loop through to fill arr with names
    ref.orderByChild("username").on("child_added", function(data) {
        if(data.val().username!=""||data.val().username!=undefined) {
            user_arr[counter] = data.val().username;
            console.log(user_arr[counter]);
            counter += 1;
        }
    })
}

function search(){
    var display = document.getElementById("content");
    var ref = firebase.database().ref().child('users');
    
    //Clear content
    display.innerHTML = " ";
    
    var input = document.getElementById("search-input").value;
    
    //Loop through and if the string they inputed matched any user name, display it
    var i;
    for (i = 0; i < user_arr.length; i++) {
        if (user_arr[i].toLowerCase().includes(input.toLowerCase())) {
            ref.orderByChild("username").equalTo(user_arr[i]).on("child_added", function(data) {
                output = "";

                output += "<div class='users'>";
                output += '<a class="user-info" href="profile/profile.html?id=' + data.val().id +'">'+data.val().username+'</a>'
                output += "<p class='user-info'>" + data.val().email + "</p>"
                output += "</div>";

                display.innerHTML = display.innerHTML + output;
            });
        }
    }
}