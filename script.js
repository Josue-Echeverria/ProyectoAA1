let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');

inputElement.addEventListener('change', (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
    }, false);
  
imgElement.onload = function() {
    let mat = cv.imread(imgElement);
    console.log(mat.ucharPtr(100,100))//COMO SACAR PUNTOS DE LA IMAGEN 

    let p1 = new cv.Point(0, 0);
    let p2 = new cv.Point(20, 20);
    let p3 = new cv.Point(10, 0);
    let p4 = new cv.Point(65, 65);


    let indiv = new cv.Mat.zeros(255, 255, cv.CV_8U);
    cv.line(indiv, p1, p2, [255, 255, 255, 255], 1)
    cv.line(indiv, p2, p3, [255, 255, 255, 255], 1)
    cv.line(indiv, p3, p4, [255, 0, 0, 255], 2)
    console.log(indiv.ucharPtr(10,10))
    cv.imshow('canvasOutput', indiv);
    mat.delete();
  };
  var Module = {
    // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
    onRuntimeInitialized() {
        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    }
};

