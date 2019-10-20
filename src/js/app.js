new WOW().init();

var classList = null;
var studentsList = new Array();
var userRef;
var selectedStudent = "";
var selectedClass = 0;
var hoveringStudent = "";
var signedIn = false;
var hoveringDescription = false;
var hoveringRemove = false;

// Student boxes
var inputRows = 1;
var inputCols = 5;

// Color choices
var colors = ["red", "blue", "yellow"];
var colorCodes = ["red", "#2196F3", "yellow"];
if(localStorage["color-choice"] != null) {
    var selColor = localStorage["color-choice"];
} else {
    var selColor = "blue";
}

if (localStorage["firstTime"] == null) {
    var firstTime = true;
    localStorage["firstTime"] = true;
} else {
    var firstTime = false;
}
var pullShown = firstTime;

if (firstTime) {
    $("#pull-bar").css("left", "0px");
}

// Set up color selection
var colorHtml = "";
for(let i=0; i<colors.length; i++) {
    colorHtml += `<button id="color-` + colors[i] + `" class="` + colors[i] + `"></button>
    `;
}
$("#color-choices").html(colorHtml);
for(let i=0; i<colors.length; i++) {
    $("." + colors[i]).css("background-color", colorCodes[i]);
}

for(let i=0; i<colors.length; i++) {
    $("#color-" + colors[i]).click(function() {
        for(let j=0; j<colors.length; j++) {
            if(j != i) {
                $("#color-" + colors[j]).css('box-shadow', 'none');
            }
        }
        localStorage["color-choice"] = colors[i];
        $(this).css('box-shadow', '0 0 0 1.7pt black');
        selColor = colors[i];
        $(".moveableheader").css("background-color", colorCodes[i]);
        if(colors[i] == "yellow") {
            $(".moveableheader").css("color", "#000");
        } else {
            $(".moveableheader").css("color", "#fff");
        }
    });
}

var tutorialShown = false;
$("#tutorial-btn").click(function() {
    if(!tutorialShown) {
        $("#tutorial-video").fadeIn();
        $("#settings-window").css("height", "590px");
        $("#settings-background").css("height", "calc(100vh + 300px)");
        $("#down").css("transform", "rotate(225deg)");
        tutorialShown = true;
    } else {
        $("#tutorial-video").fadeOut();
        $("#settings-window").css("height", "300px");
        $("#settings-background").css("height", "100vh");
        $("#down").css("transform", "rotate(45deg)");
        tutorialShown = false;
    }
});

// Set up pull out functions
$("#settings").click(function() {
    $("#settings-background").show();
    animateCSS("#settings-background", "fadeIn");
});

$("#exit").click(function () {
    $("#pull-bar").css("left", "-300px");
    $("#pull").fadeIn();
    pullShown = false;
});

$("#exit-settings").click(function () {
    animateCSS("#settings-background", "fadeOut", function() {
        $("#settings-background").hide();
    })
});

$("#pull").click(function () {
    $("#pull-bar").css("left", "0px");
    animateCSS("#pull", "fadeOut", () => {
        $("#pull").hide();
    });
    pullShown = true;
});

$("#add-btn").click(function () {
    if (signedIn) {
        if ($("#name-input").val() != "") {
            studentsList.push({
                name: $("#name-input").val(),
                rotation: 0,
                pos: { left: 310, top: 30 }
            });
            $("#name-input").val("");
            addStudent(studentsList.length - 1);
            sortStudents();

            console.log(userRef);
            // Set students
            saveStudents();
            displayStudents();

            for(let i=0; i<colors.length; i++) {
                if(colors[i] == selColor) {
                    $(".moveableheader").css("background-color", colorCodes[i]);
                    break;
                }
            }
        } else {
            swal("Name Missing", "The name field is empty. Please try again.", "error");
        }
    }
});

$("#randomize").click(function () {
    var tempPos;
    var tempRot;
    var rand;
    for (let i = 0; i < studentsList.length; i++) {
        tempPos = studentsList[i].pos;
        tempRot = studentsList[i].rotation;
        rand = Math.round(Math.random() * studentsList.length);
        studentsList[i].pos = studentsList[rand].pos;
        studentsList[i].rotation = studentsList[rand].rotation;
        studentsList[rand].pos = tempPos;
        studentsList[rand].rotation = tempRot;
    }
    $("#students-container").html("");
    for (let i = 0; i < studentsList.length; i++) {
        addStudent(i);
    }
    saveStudents();
});

$("#sync").click(function () {
    var currList;
    for (let i = 0; i < 8; i++) {
        if (i != selectedClass) {
            currList = getClass(i);
            for (let j = 0; j < studentsList.length; j++) {
                if (j < currList.length) {
                    currList[j].pos = studentsList[j].pos;
                    currList[j].rotation = studentsList[j].rotation;
                } else {
                    break;
                }
            }
        }
    }
    saveStudents();
});

$('#class-select').change(function () {
    studentsList = getClass(parseInt($(this).find("option:selected").attr('value')));
    selectedClass = parseInt($(this).find("option:selected").attr('value'));
    displayStudents();
    $("#students-container").html("");
    for (let i = 0; i < studentsList.length; i++) {
        addStudent(i);
    }
});

$('#rows-select').change(function () {
    inputRows = parseInt($(this).find("option:selected").attr('value'));
    renewSpots();
    $("#students-container").html("");
    for (let i = 0; i < studentsList.length; i++) {
        addStudent(i);
    }
    for(let i=0; i<colors.length; i++) {
        if(colors[i] == selColor) {
            $("#color-" + colors[i]).css('box-shadow', '0 0 0 1.7pt black');
            $(".moveableheader").css("background-color", colorCodes[i]);
            console.log($(".moveableheader"));
            break;
        }
    }
});

$('#cols-select').change(function () {
    inputCols = parseInt($(this).find("option:selected").attr('value'));
    renewSpots();
    $("#students-container").html("");
    for (let i = 0; i < studentsList.length; i++) {
        addStudent(i);
    }
    for(let i=0; i<colors.length; i++) {
        if(colors[i] == selColor) {
            $("#color-" + colors[i]).css('box-shadow', '0 0 0 1.7pt black');
            $(".moveableheader").css("background-color", colorCodes[i]);
            console.log($(".moveableheader"));
            break;
        }
    }
});

function renewSpots() { // TODO
    for (let j = 0; j < 8; j++) {
        if (getClass(j).spots != null) {
            var oldSpots = getClass(j).spots;
            var newSpots = new Array();
            for (let i = 0; i < inputRows * inputCols; i++) {
                if (i < oldSpots.length) {
                    newSpots.push(oldSpots[i]);
                } else {
                    newSpots.push(false);
                }
            }
            getClass(j).spots = newSpots;
            saveStudents();
        }
    }
    userRef.ref.set({
        columns: inputCols,
        rows: inputRows
    }, { merge: true }).then(() => {

    console.log("Cols " + userRef.data().columns);
    console.log("Rows " + userRef.data().rows);
    });

}

function getClass(index) {
    console.log(classList);
    if (index == 0) {
        return classList.zero;
    } else if (index == 1) {
        return classList.first;
    } else if (index == 2) {
        return classList.second;
    } else if (index == 3) {
        return classList.third;
    } else if (index == 4) {
        return classList.fourth;
    } else if (index == 5) {
        return classList.fifth;
    } else if (index == 6) {
        return classList.sixth;
    } else if (index == 7) {
        return classList.seventh;
    }
}

function displayStudents() {
    $("#students-display").html("");
    for (let i = 0; i < studentsList.length; i++) {
        var pastHTML = $("#students-display").html();
        var newHTML = pastHTML + '<div class="student-info">' + studentsList[i].name + '<br><br><center><textarea class="description" id="des-' + i + '">';
        if (studentsList[i].description != null) {
            newHTML += studentsList[i].description;
        }
        newHTML += '</textarea><br><button class="delete" id="del-' + i + '">Remove</button></center></div>';
        $("#students-display").html(newHTML);
    }

    $(".student-info").each(function () {
        $(this).data("clicked", "false");
    });

    $(".student-info").click(function () {
        if (!hoveringDescription && !hoveringRemove) {
            if ($(this).data("clicked") == "false") {
                $(this).css("height", "185px");
                $(this).data("clicked", "true");
            } else {
                $(this).css("height", "30px");
                $(this).data("clicked", "false");
            }
        }
    });

    $(".description").hover(function () {
        hoveringDescription = true;
    }, function () {
        hoveringDescription = false;
    })

    $('.description').bind('input propertychange', function () {
        studentsList[parseInt($(this).attr("id").split("-")[1])].description = $(this).val();
        saveStudents();
    });

    $('.delete').click(function () {
        var id = parseInt($(this).attr("id").split("-")[1]);
        swal({
            title: "Are you sure you want to remove " + studentsList[id].name + "?",
            text: "Once deleted, it will not be able to recovered",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    studentsList.splice(id, 1);
                    saveStudents();
                    $("#students-container").html("");
                    for (let i = 0; i < studentsList.length; i++) {
                        addStudent(i);
                    }
                    $("#students-display").html("");
                    displayStudents();
                    hoveringRemove = false;
                    for(let i=0; i<colors.length; i++) {
                        if(colors[i] == selColor) {
                            $(".moveableheader").css("background-color", colorCodes[i]);
                            break;
                        }
                    }
                }
            });
    })

    $(".delete").hover(function () {
        hoveringRemove = true;
    }, function () {
        hoveringRemove = false;
    })
}

function saveStudents() {
    if (selectedClass == 0) {
        classList.zero = studentsList;
    } else if (selectedClass == 1) {
        classList.first = studentsList;
    } else if (selectedClass == 2) {
        classList.second = studentsList;
    } else if (selectedClass == 3) {
        classList.third = studentsList;
    } else if (selectedClass == 4) {
        classList.fourth = studentsList;
    } else if (selectedClass == 5) {
        classList.fifth = studentsList;
    } else if (selectedClass == 6) {
        classList.sixth = studentsList;
    } else if (selectedClass == 7) {
        classList.seventh = studentsList;
    }
    userRef.ref.set({
        classes: classList
    }, { merge: true });
}

function addStudent(id) {
    var tableContent = "";
    var boxCount = 0;
    for (let i = 0; i < inputRows; i++) {
        tableContent += "<tr id='table-" + id + "-" + i + "'>";
        for (let j = 0; j < inputCols; j++) {
            tableContent += "<th data-spot='" + boxCount + "'></th>";
            boxCount++;
        }
        tableContent += "</tr>";
    }

    var newHtml = $("#students-container").html() + `<div class="moveable" id="moveable-` + id + `">
    <div class="moveableheader" id="moveable-` + id + `header">` + studentsList[id].name + `</div>
    <center>
    <table>` + tableContent + `</table>
    </center>
    </div>`;

    $("#students-container").html(newHtml);

    $(".moveableheader").css("background-color")

    $("#moveable-" + id).draggable();
    setUpListeners();
    if (studentsList[id].pos != null) {
        $("#moveable-" + id).css("top", studentsList[id].pos.top);
        $("#moveable-" + id).css("left", studentsList[id].pos.left);
    }
    if (studentsList[id].rotation != null) {
        $("#moveable-" + id).css('transform', 'rotate(' + studentsList[id].rotation + 'deg)');
    } else {
        studentsList[id].rotation = 0;
    }

    if (studentsList[id].spots != null) {
        for (let i = 0; i < studentsList[id].spots.length; i++) {
            if (studentsList[id].spots[i] == true) {
                var tableId = "#table-" + id + "-" + parseInt(i / inputCols);
                var th = $(tableId + " > th")[i - inputCols * parseInt(i / inputCols)];
                $(tableId).find(th).css("background-color", "rgb(255, 255, 0)");
            }
        }

    }
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}

var thHover = false;

function sortStudents() {
    studentsList.sort((a, b) => (a.name > b.name) ? 1 : (a.name === b.name) ? ((a.rotation > b.rotation) ? 1 : -1) : -1);
}

function setUpListeners() {
    $(".moveable").click(function () {
        if (!thHover) {
            if ($("#slider").css("display") == "none") {
                $("#slider").fadeIn();
                $(this).css('outline', '2px solid yellow');
                selectedStudent = $(this).attr('id');
                $("#slider").slider('value', studentsList[getIdFromStudent(selectedStudent)].rotation);
            } else if (selectedStudent == $(this).attr('id')) {
                $("#slider").fadeOut();
                $(this).css('outline', 'none');
                selectedStudent = "";
            } else {
                for (let i = 0; i < studentsList.length; i++) {
                    $("#moveable-" + i).css("outline", "none");
                }
                $(this).css('outline', '2px solid yellow');
                selectedStudent = $(this).attr('id');
                $("#slider").slider('value', studentsList[getIdFromStudent(selectedStudent)].rotation);
            }
        }
    });

    $(".moveable").hover(function () {
        hoveringStudent = $(this).attr("id");
    }, function () {
        hoveringStudent = "";
    });

    $("th").click(function () {
        if ($(this).css("background-color") != "rgb(255, 255, 0)") {
            $(this).css("background-color", "rgb(255, 255, 0)");
            var id = getIdFromStudent(hoveringStudent);
            if (studentsList[id].spots == null || studentsList[id].spots.length != inputCols * inputRows) {
                studentsList[id].spots = new Array();
                for (let i = 0; i < inputCols * inputRows; i++) {
                    studentsList[id].spots.push(false);
                }
            }
            studentsList[id].spots[$(this).data("spot")] = true;
        } else {
            $(this).css("background-color", "#f1f1f1");
            var id = getIdFromStudent(hoveringStudent);
            if (studentsList[id].spots != null) {
                studentsList[id].spots[$(this).data("spot")] = false;
            }
        }
        console.log(studentsList[id].spots);
        saveStudents();
    });

    $("th").hover(function () {
        thHover = true;
    }, function () {
        thHover = false;
    });

    $(".moveable").draggable({
        stop: function (event, ui) {
            var pos = ui.helper.position(); // just get pos.top and pos.left
            if(pos.top < 0) {
                pos.top = 0;
                $(this).css("top", pos.top);
            }
            if(pos.left < 0) {
                pos.left = 0;
                $(this).css("left", pos.left);
            }
            console.log("Student position: " + $(this).css("top") + " " + $(this).css("left"))
            studentsList[parseInt($(this).attr("id").split("-")[1])].pos = pos;
            saveStudents();
            $(this).draggable();
        }
    });
}

function getIdFromStudent(student) {
    return parseInt(student.split("-")[1]);
}

$(function () {
    $("#slider").slider({
        min: 0,
        max: 360,
        step: 15,
        slide: function (event, ui) {
            // Set the slider's correct value for "value".
            $(this).slider('value', ui.value);
            if (selectedStudent != "") {
                $("#" + selectedStudent).css('transform', 'rotate(' + ui.value + 'deg)')
                studentsList[getIdFromStudent(selectedStudent)].rotation = ui.value;
                saveStudents();
            }
        }
    });
});

function dragElement(elmnt) {

    console.log("Dragging " + elmnt.id);

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        $("#" + elmnt.id).data("top", elmnt.style.top);
        $("#" + elmnt.id).data("left", elmnt.style.left);
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBwWDT9E_6XYpHQ_JChBiuwVJHGhVBB1VY",
    authDomain: "seat-chart-47c86.firebaseapp.com",
    databaseURL: "https://seat-chart-47c86.firebaseio.com",
    projectId: "seat-chart-47c86",
    storageBucket: "seat-chart-47c86.appspot.com",
    messagingSenderId: "331535551228",
    appId: "1:331535551228:web:4c359eef99d0e9f3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
    firebase.auth().signOut().then(function () {
        console.log('User signed out.');
    }).catch(function (error) {
        console.log('User failed to sign out.');
    });
    location.href = "index.html";
    $("#title").fadeIn();
}

var user;

function onSignIn(googleUser) {

    animateCSS("#title", "fadeOut", () => {
        $("#title").hide();
    })

    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId());
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());
    console.log(profile);
    var exists = false;
    user = profile;

    firebase.auth().signInWithEmailAndPassword("tonyisdonealready@gmail.com", "danielsanders").then(() => {
        // Get students

        db.collection("users").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().uId == profile.getId()) {
                    console.log(`${doc.id} => ${doc.data().uId}`);
                    console.log(profile.getId());
                    exists = true;
                }
            });
        }).then(() => {
            if (!exists) {
                var tempClassList = {
                    zero: new Array(),
                    first: new Array(),
                    second: new Array(),
                    third: new Array(),
                    fourth: new Array(),
                    fifth: new Array(),
                    sixth: new Array(),
                    seventh: new Array()
                };
                db.collection("users").add({
                    uId: profile.getId(),
                    name: profile.getName(),
                    classes: tempClassList,
                    columns: 5,
                    rows: 1
                })
                    .then(function (docRef) {
                        console.log("Document written with ID: ", docRef.id);
                    })
                    .catch(function (error) {
                        console.error("Error adding document: ", error);
                    });
            }
        }).then(() => {
            db.collection("users").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    if (doc.data().uId == profile.getId()) {
                        classList = doc.data().classes;
                        if (doc.data().columns == null) {
                            doc.ref.set({
                                columns: inputCols,
                                rows: inputRows
                            }, { merge: true }).then(() => {
                                inputRows = doc.data().rows;
                                inputCols = doc.data().columns;
                            });
                        } else {
                            inputRows = doc.data().rows;
                            inputCols = doc.data().columns;
                        }
                        $("#rows-select").val(inputRows);
                        $("#cols-select").val(inputCols);
                        studentsList = classList.zero;
                        selectedClass = 0;
                        sortStudents();
                        displayStudents();
                        userRef = doc;
                        for (let i = 0; i < studentsList.length; i++) {
                            addStudent(i);
                        }
                        for(let i=0; i<colors.length; i++) {
                            if(colors[i] == selColor) {
                                $("#color-" + colors[i]).css('box-shadow', '0 0 0 1.7pt black');
                                $(".moveableheader").css("background-color", colorCodes[i]);
                                break;
                            }
                        }
                    }
                });
            });
        });

    }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
    });

    $("#avatar").attr("src", profile.getImageUrl());

    animateCSS("#signIn", "fadeOutUp", () => {
        $("#signIn").hide();
    });
    $("#signOut").show();
    animateCSS("#signOut", "fadeInDown");

    signedIn = true;
}

function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}