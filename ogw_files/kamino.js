
var viewerL=null, viewerR=null;
var adjustRightCamera = true;
var adjustLeftCamera = true;



function watchCameras() {	
	viewerL.addEventListener('cameraChanged', left2Right);			// adjust right camera
	viewerR.addEventListener('cameraChanged', right2Left);			// adjust left camera
}

function left2Right() {
	if (adjustRightCamera) {				// user is moving left view
	adjustLeftCamera = false;
	
	transferCameras(true);
	console.log("Left Camera Event");
	
	setTimeout(function() { adjustLeftCamera = true; }, 500);
	}
}

function right2Left() {
	if (adjustLeftCamera) {				// user is moving right view
	adjustRightCamera = false;
	
    transferCameras(false);
	console.log("Right Camera Event");
	
	setTimeout(function() { adjustRightCamera = true; }, 500);
	}
}


function transferCameras(leftToRight) {
    // The direction argument dictates the source and target
    var source = leftToRight ? viewerL : viewerR;
    var target = leftToRight ? viewerR : viewerL;
	
    var pos = source.navigation.getPosition();
    var trg = source.navigation.getTarget();

    // Get the new position for the target camera
    var up = source.navigation.getCameraUpVector();

	
    // Get the position of the target camera
    var newPos = offsetCameraPosition(source, pos, trg, leftToRight);
	
	zoom(target, newPos, trg, up);

}

function offsetCameraPosition(source, position, target, leftToRight) {
	var display = position.distanceTo(target) * 0.04;
	
	var clone = source.autocamCamera.clone();
	clone.translateX(leftToRight ? display: -display);
	return clone.position;
}

function zoom(viewer, pos, trg, up) {
    // Make sure our up vector is correct for this model
    viewer.navigation.setView(pos, trg);
    viewer.navigation.setCameraUpVector(up);
}

