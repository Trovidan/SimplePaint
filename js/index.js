window.onload = function () {

    var canvas = document.getElementById("myCanvas");
    var clearButton = document.getElementById("clear");
    var isActive = false;
    var startCoordinates = null;
    var context = canvas.getContext("2d");
    var dataPool = [];
    var enclosingRect = -1;
    var randomRGB = null;

    //double click listener
    canvas.addEventListener('dblclick', function (e) {
        let pos = getMousePositions(canvas, e);
        enclosingRect = getEnclosingRect(pos);

        if ( enclosingRect !== -1) {
            dataPool.splice(enclosingRect, 1);
            clearCanvas();
            drawAll();
            enclosingRect = -1;
            return true;
        }
        isActive = false;
    });

    //mousedown listener
    canvas.addEventListener('mousedown', function (e) {
        e.preventDefault();
        let mousePos = getMousePositions(canvas, e);
        if(isActive)
            return;
        isActive = true;
        enclosingRect = getEnclosingRect(mousePos);
        startCoordinates = mousePos;
        randomRGB = getRandomColor();
    });

    //movement listener
    canvas.addEventListener('mousemove', function (e) {
        if(!isActive)
            return;

        let mousePos = getMousePositions(canvas, e);
        let [height, width] = calcDimensions(
            startCoordinates.x,
            startCoordinates.y,
            mousePos.x,
            mousePos.y
        );
        if (enclosingRect !== -1) {
            startCoordinates = mousePos;

            //update rectangle position
            dataPool[enclosingRect].start.x += width;
            dataPool[enclosingRect].start.y += height;
            dataPool[enclosingRect].end.x += width;
            dataPool[enclosingRect].end.y += height;

            //print rectangles
            drawAll();
        } else {

            //print rectangles
            drawAll();

            //display the new rectangle that will be added
            drawRectangle(
              startCoordinates.x,
              startCoordinates.y,
              mousePos.x,
              mousePos.y,
              false,
              randomRGB
            );
        }

    }, true);

    //click-release listener
    canvas.addEventListener('mouseup', function (e) {

        var mousePos = getMousePositions(canvas, e);

        var [height, width] = calcDimensions(
            startCoordinates.x,
            startCoordinates.y,
            mousePos.x,
            mousePos.y
        );
        
        if ( enclosingRect === -1 && !height.between(1,-1) && !width.between(1,-1)) {
            drawRectangle(
                startCoordinates.x,
                startCoordinates.y,
                mousePos.x,
                mousePos.y,
                true,
                randomRGB
            );
        }
        isActive = false;
        enclosingRect = -1;
    });

    //adding click listener for the clear button
    clearButton.addEventListener('click', function () {
        dataPool = [];
        clearCanvas();
    });

    //function to get first rectangle mouse is inside of
    function getEnclosingRect(pos) {
        let ans = -1;
        for(let i=dataPool.length-1; i>-1;i--){
            let rect = dataPool[i]
            if( isInsideRect(pos.x, pos.y, rect.start.x, rect.start.y, rect.end.x, rect.end.y ) ){
                ans = i;
                break;
            }
        }
        return ans;
    }

    function isInsideRect(x,y,x1,y1,x2,y2){
        if(!x.between(x1,x2))
            return false
        if(!y.between(y1,y2))
            return false
        return true;
    }

    //function for clearing the canvas 
    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // function to get current mouse position
    function getMousePositions(canvas, event) {

        var bounds = canvas.getBoundingClientRect();
        return {

            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top

        };
    }

    // function for extracting the rectangle dimensions
    function calcDimensions(x1, y1, x2, y2) {
        return [y2-y1, x2-x1];
    }

    // function for drawing the figures
    function drawAll(){
        clearCanvas();
        dataPool.forEach(function (rect) {
          drawRectangle(
            rect.start.x,
            rect.start.y,
            rect.end.x,
            rect.end.y,
            false,
            rect.fillStyle
          );
        });
    }

    // function for drawing rectangle
    function drawRectangle(x1, y1, x2, y2, insert = true, color) {

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y1);
        context.lineTo(x2, y2);
        context.lineTo(x1, y2);
        context.lineTo(x1, y1);
        context.fillStyle = color === undefined? getRandomColor(): color;
        context.fill();
        context.stroke();
        if(insert){
            dataPool.push({
              start: {
                x: x1,
                y: y1,
              },
              end: {
                x: x2,
                y: y2,
              },
              fillStyle: context.fillStyle,
            });
        }
    }

    //function to generate random color
    function getRandomColor() {
        var r = Math.ceil(Math.random() * 256);
        var g = Math.ceil(Math.random() * 256);
        var b = Math.ceil(Math.random() * 256);
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
    //utility functionality
    Number.prototype.between = function(a, b) {
        var mn = Math.min(a, b);
        var mx = Math.max(a, b);
        return this >= mn && this <= mx;
    };
};