
//Dark mode switch
const darkModeSwitch = document.getElementById("darkModeSwitch");
//Zoom slider
const zoomSlider = document.getElementById("zoomSlider");

var gridCellWidth = 50;

var darkMode = false;

var utilityMode = null; //Used to control what code to execute each frame
var utilityStage = 0; //Used to further control what action to take in the code block

var objectsToRender = [];
var colours = ['#ff0000', '#0000ff', '#ffff00', '#32cd32', '#0000ff', '#800080'];
var colourPointer = 0;

var mouseClickedThisFrame = false;
var relativeMouseX; 
var relativeMouseY;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    console.log(colours[0]);
}



function draw() {
    //Change the coordinate mode to resemble a mathematical set of axes
    applyMatrix(1, 0, 0, -1, width/2, height/2);

    //Calculate the mouse position in the new coordinate system
    relativeMouseX = mouseX - width/2;
    relativeMouseY = -(mouseY - height/2);

    //Change the colour of the background if in dark mode
    if (darkMode) {
        background(0);
    } else {
        background(255);
    }

    //Execute whatever utility mode is currently in action
    if (utilityMode != null) {
        executeUtility();
    }

    //Draw all of the information and objects to the canvas
    drawGrid();

    for (let item of objectsToRender) {
        item.show(); //All objects in the list should have a show function
    }

    //Reset the mouse clicked flag at then end of execution each frame
    mouseClickedThisFrame = false;
}



function drawGrid() {
    var numOfCols = floor(width / gridCellWidth);
    var numOfRows = floor(height / gridCellWidth);

    if (numOfCols % 2 != 0) {
        numOfCols++;
    }

    if (numOfRows % 2 != 0) {
        numOfRows++;
    }

    if (darkMode) {
        stroke(255);
    } else {
        stroke(0);
    }

    var rightEdge = width/2;
    var topEdge = height/2;

    //All small lines
    strokeWeight(0.5);
    for (let i = -numOfCols/2; i <= numOfCols/2; i++) {
        line(i*gridCellWidth, topEdge, i*gridCellWidth, -topEdge);
    }

    for (let j = -numOfRows/2; j <= numOfRows/2; j++) {
        line(-rightEdge, j*gridCellWidth, rightEdge, j*gridCellWidth);
    }

    //Central Axis lines
    strokeWeight(5);
    line(-rightEdge, 0, rightEdge, 0);
    line(0, topEdge, 0, -topEdge);
}

//Set the dark mode flag when the dark mode switch is used
function darkModeToggleCheck() {
    if (darkModeSwitch.checked == true) {
        darkMode = true;
    } else {
        darkMode = false;
    }
}

// function mouseWheel(event) {
//     if (event.delta < 0 && gridCellWidth < 100) {
//         gridCellWidth++;
//     } 

//     if (event.delta > 0 && gridCellWidth > 5) {
//         gridCellWidth--;
//     }
// }

function mousePressed() {
    //Check that the mouse is on the canvas and if so flag that a click is made
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        mouseClickedThisFrame = true;
    }
}

//This function is multi-purpose based on what action the user is trying to execute but it pertains to any object
//the user is trying to place on the canvas (grid)
function executeUtility() {
    switch (utilityMode) {

        case "drawVector":
            //Get the new vector that has been created (one was made when "drawVector" mode was set)
            var item = objectsToRender[objectsToRender.length - 1];

            //Set the head of the vector to the mouse's position
            item.vectorLine.set(relativeMouseX, relativeMouseY);
    
            //If the mouse has been clicked then set the head to the nearest grid point to the mouse
            if (mouseClickedThisFrame) {
                item.vectorLine.set(item.nearestGridX, item.nearestGridY);

                //We are done with the vector so we reset the utility mode
                utilityMode = null;
            }

        case "dotProduct":
            break;
            
    }
}

function undoButton() {
    objectsToRender.pop();
}

function createVectorButton() {
    utilityMode = "drawVector";

    //Add a new vector to the objects that will be rendered
    objectsToRender.push(new VectorArrow(colours[colourPointer]));

    colourPointer = (colourPointer + 1) % colours.length; //Advance the colour pointer to change the colour of the next object
}

function dotProductButton() {
    utilityMode = "dotProduct";
    utiliyStage = 0;
}




class VectorArrow {
    constructor(colour) {
        this.id = 'vector';

        this.basePosition = {x: 0, y: 0};
        
        this.vectorLine = createVector(0, 0); 
        
        this.colour = colour;

        this.nearestGridX; 
        this.nearestGridY; 
    }

    show() {
        //Update the nearest grid point coordinates
        this.nearestGridX = round(this.vectorLine.x / gridCellWidth) * gridCellWidth;
        this.nearestGridY = round(this.vectorLine.y / gridCellWidth) * gridCellWidth;

        push();

        //format the drawing meta
        stroke(this.colour);
        fill(this.colour);
        strokeWeight(5);
        textSize(20);

        //Move origin to the arrow's base
        translate(this.basePosition.x, this.basePosition.y);
        //Draw the "body" of the vector
        line(0, 0, this.vectorLine.x, this.vectorLine.y);

        //Calculate the andgle the vector makes to the translated axis
        var vectorAngle = atan2(this.vectorLine.y, this.vectorLine.x);
        
        //Rotate to align the axis with the vector and move to the end of the vector
        rotate(vectorAngle);
        translate(this.vectorLine.mag(), 0);
        
        //Draw the triangle head
        noStroke();
        triangle(-6, 10, -6, -10, 6, 0);


        //Now write the coordinates of the vector head 
        rotate(-vectorAngle);
        //Need to flip the y-axis again
        applyMatrix(1, 0, 0, -1, 0, 0);

        //Place the text in a visible loaction
        if (this.nearestGridX > 0) {
            translate(10, 10);
            textAlign(LEFT);
        } else {
            translate(-10, 10);
            textAlign(RIGHT);
        }

        //Add an outline to the text for viewability
        strokeWeight(0.5);

        if (darkMode) {
            stroke(255);
        } else {
            stroke(0);
        }

        text('(' + this.nearestGridX/gridCellWidth + ', ' + this.nearestGridY/gridCellWidth + ')', 0, 0);


        pop();
    }
}