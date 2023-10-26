//Variables globales
let NUMLENGHT = null;
let NUMMAX = null;
let TAMPOBLACION = 100;
let GENERACIONES = 3000;

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


class Individuo{
    constructor(cromosoma = null){
        if(cromosoma === null){
            this.cromosoma = cromosomaAleatorio()
        }else{
            this.cromosoma = JSON.parse(JSON.stringify(cromosoma));
        }
        this.fitness = null
    }
    cromosomaAleatorio(){
        var arrayAleatorio = [];
        let longitud = 100; //Esto es temp deberia de ser NUMLENGTH
        for(var i = 0; i < longitud; i++) {
            arrayAleatorio.push(Math.floor(Math.random() * 100));//Numero aleatorio de 0 a 100 tambien es temp
        }                                                        //Deberia de ser hasta NUMLENGTH
        return arrayAleatorio;
    }

    cruzar(alter, cantidadGenes = null) {
        if(cantidadGenes === null){
            cantidadGenes = Math.floor((Math.random() * 100)+1)//Deberia de ser DE 1 hasta NUMLENGTH
        }
        let nuevoIndividuo = new Individuo(this.cromosoma)
        var genes = [];
        for(var i = 0; i < cantidadGenes; i++) {
            arrayAleatorio.push(Math.floor(Math.random()) * 100);//Numero aleatorio de 0 a 100 tambien es temp
        }                                                         //Deberia de ser hasta NUMLENGTH
        for(gen in genes){
            nuevoIndividuo.cromosoma[gen] = alter.cromosoma[gen]// ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA
        } 
        return nuevoIndividuo
    }
    mutar(cantidadGenes = null) {
        if(cantidadGenes === null){ //Cantidad de genes que modificara
            cantidadGenes = Math.floor((Math.random() * 100)+1)//Deberia de ser DE 1 hasta NUMLENGTH // ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA
        }
        let nuevoIndividuo = new Individuo(this.cromosoma)
        
        var genes = [];
        for(var i = 0; i < cantidadGenes; i++) {
            arrayAleatorio.push(Math.floor(Math.random()) * 100);//Numero aleatorio de 0 a 100 tambien es temp
        }                                                         //Deberia de ser hasta NUMLENGTH
        for(gen in genes){
            nuevoIndividuo.cromosoma[gen] += (-1)**(Math.round(Math.random()))// ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA
        } 
        return nuevoIndividuo
    }
    calcularFitness(objetivo){
        //TO DO
    }
}

class Poblacion{
    constructor(poblacion = null){
        if(poblacion === null){
            for(let i = 0; i < TAMPOBLACION;i++){
                this.poblacion.push(new Individuo())
            }
        }else{
            this.poblacion = JSON.parse(JSON.stringify(poblacion));
        }
        this.mejorFitness = 0
    }
    ordenarFitness(objetivo){
        for(individuo in this.poblacion)
            individuo.calcularFitness(objetivo)

        const ordenada = this.poblacion.sort(function (a,b){
                return a.fitness - b.fitness; //Ordena la poblacion por el fitness en orden ascendente
            });
        this.mejorFitness = ordenada[0]
        return ordenada
    }

    nuevaPoblacion(objetivo){
        this.poblacion = this.calcularFitness(objetivo)
        const seleccion = this.poblacion.slice(0,10)// DEBERIA DE SER EL 10% de POBLACIONLENGTH
        let temp = []
        for(let i = 0; i < 3; i++)//deberia de ser el 30% 
            temp = temp.concat(seleccion)

        const mutados = []
        for(let i = 0; i < seleccion.length; i++){//30%
            mutados.push(temp[i].mutar())
        }

        let combinaciones = JSON.parse(JSON.stringify(temp))//30%
        for (let i = combinaciones.length - 1; i > 0; i--) {//Shuffle de individuos
            let j = Math.floor(Math.random() * (i + 1));
            [combinaciones[i], combinaciones[j]] = [combinaciones[j], combinaciones[i]];
        }
        for (let i = 1; i < combinaciones.length - 2; i++){
            combinaciones[i-1] = combinaciones[i].cruzar(combinaciones[i-1])
        }
        
        let combinacionesMutados = []
        for (let i = 0; i < combinaciones.length ; i++){
            combinacionesMutados.push(combinaciones[i].mutar)
        }
        return concat(seleccion,mutados,combinaciones,combinacionesMutados)
    }
}


/**
 *  ESTA PARTE PA ABAJO ES PARA PROBAR
 */

let p = Poblacion()
let goal = null // deberia definirse como el objetivo
for(gen in GENERACIONES){

}