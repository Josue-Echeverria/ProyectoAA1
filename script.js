//Variables globales
//Dimensiones de la imagen objetivo
let HEIGHT = 0; 
let WIDTH = 0;

//Parametros de entrada
let PORCENTAJE_PUEDE_MUTAR = 100
let PORCENTAJE_PUEDE_COMBINARSE = 100
let MAXLINEAS = 10; //Maxima cantidad de lineas por individuo 
let TAMPOBLACION = 5;
let GENERACIONES = 5;

class Individuo{
    constructor(cromosoma = null){
        if(cromosoma === null){
            this.cromosoma = this.cromosomaAleatorio()
        }else{
            this.cromosoma = JSON.parse(JSON.stringify(cromosoma));
        }
        this.fitness = null
    }
    cromosomaAleatorio(){
        let puntosAleatoriosH = [];
        let puntosAleatoriosW = [];
        let rectasAleatorias = [];

        let cantidadLineas = Math.floor(1+(Math.random() * MAXLINEAS))
        for(let i = 0; i < cantidadLineas; i++) {
            for(let j=0; j < 4; j++){
                puntosAleatoriosW.push(Math.floor(Math.random() * WIDTH));
                puntosAleatoriosH.push(Math.floor(Math.random() * HEIGHT))
            }
            rectasAleatorias.push([[puntosAleatoriosH[0],puntosAleatoriosW[0]]
                                 , [puntosAleatoriosH[1],puntosAleatoriosW[1]]])
            puntosAleatoriosH = []
            puntosAleatoriosW = []
        }                                                        //Deberia de ser hasta TAMAÑO DE LA IMAGEM
        return rectasAleatorias;
    }

    cruzar(alter, cantidadGenes = null) {
        if(cantidadGenes === null)
            cantidadGenes = Math.floor(this.cromosoma.length*(PORCENTAJE_PUEDE_COMBINARSE/100))
    
        let nuevoIndividuo = new Individuo(this.cromosoma)

        let posicionesAleatorias = []
        for(let i = 0; i<cantidadGenes; i++)
            posicionesAleatorias.push(Math.floor((Math.random() * cantidadGenes)))

        for(let i = 0; i<posicionesAleatorias.length; i++)
            nuevoIndividuo.cromosoma[posicionesAleatorias[i]] = alter.cromosoma[posicionesAleatorias[i]] // ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA
        
        return nuevoIndividuo
    }
 
    mutar(cantidadGenes = null) {
        if(cantidadGenes === null)
            cantidadGenes = Math.floor(this.cromosoma.length*(PORCENTAJE_PUEDE_MUTAR/100))


        let nuevoIndividuo = new Individuo(this.cromosoma)

        /**
         * Recordatorio: aqui se seleccionan DE FORMA ALEATORIA cuales seran las rectas que se modificaran
         *  PUEDE QUE SE MODIFIQUE LA MISMA RECTA 2 VECES O NIGUNA VEZ
         */
        let posicionesAleatorias = []
        for(let i = 0; i<cantidadGenes; i++)
            posicionesAleatorias.push(Math.floor((Math.random() * this.cromosoma.length)))
        
        let punto0 = 0
        let punto1 = 0
        for(let i = 0; i<posicionesAleatorias.length; i++){
            punto1 = Math.round((Math.random() * 1))
            punto0 = Math.round((Math.random() * 1))

            console.log()
            if(punto0)  
                nuevoIndividuo.cromosoma[posicionesAleatorias[i]][0][0] += (10*((-1)**(Math.round(Math.random()))))// ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA 
            else
                nuevoIndividuo.cromosoma[posicionesAleatorias[i]][0][1] += (10*((-1)**(Math.round(Math.random()))))// ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA 
            
            if(punto1)  
                nuevoIndividuo.cromosoma[posicionesAleatorias[i]][1][0] += (10*((-1)**(Math.round(Math.random()))))// ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA 
            else
                nuevoIndividuo.cromosoma[posicionesAleatorias[i]][1][1] += (10*((-1)**(Math.round(Math.random()))))// ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA 
            
        }
        return nuevoIndividuo
    }
    calcularFitness(objetivo){
            
        let imagenIndividuo = new cv.Mat(WIDTH, HEIGHT, cv.CV_8U); //Segun el tamaño de la imagen objetivo
        imagenIndividuo.setTo(new cv.Scalar(255));
        let punto1 = null
        let punto2 = null
        for(let j = 0; j<this.cromosoma.length; j++){
            punto1 = new cv.Point(this.cromosoma[j][0][0],this.cromosoma[j][0][1])
            punto2 = new cv.Point(this.cromosoma[j][1][0],this.cromosoma[j][1][1])
            cv.line(imagenIndividuo, punto1, punto2, [0, 0, 0, 0], 3)
        }
        /**
         * UNA VEZ GENERADA LA IMAGEN DEBERIA DE COMPARAR CON EL OBJETIVO AQUI
         * Y generar un fitnes y guardarlo
         * ESTO ES LO QUE SE DEBE DE CAMBIAR
         */
        let acummulador = 0;
        for(let i = 0; i<HEIGHT;i++){
            for(let j = 0; j<WIDTH; j++){
                if(objetivo.ucharPtr(i,j)[0] !== imagenIndividuo.ucharPtr(i,j)[0]){//Si los pixeles son diferentes
                    acummulador += 1
                }
            }
        }
        this.fitness = acummulador
        cv.imshow('canvasOutput', imagenIndividuo);
        return this.cromosoma
    }
}

class Poblacion{
    constructor(poblacion = null){
        this.poblacion = []
        if(poblacion === null){
            for(let i = 0; i < TAMPOBLACION;i++){
                this.poblacion.push(new Individuo())
            }
        }else{
     
            for(let i = 0; i<poblacion.length; i++)
                this.poblacion.push(poblacion[i]);
        }
        this.mejorFitness = 0
    }

    ordenarFitness(objetivo){
        for(let i = 0; i<this.poblacion.length; i++){
            this.poblacion[i].calcularFitness(objetivo);
        }    

        const ordenada = this.poblacion.sort(function (a,b){
                return a.fitness - b.fitness; //Ordena la poblacion por el fitness en orden ascendente
            });
        this.mejorFitness = ordenada[0]
        return ordenada
    }

    nuevaPoblacion(objetivo){
        this.poblacion = this.ordenarFitness(objetivo)
        
        const seleccion = this.poblacion.slice(0,Math.round(TAMPOBLACION*0.1)) //El 10% de la poblacion
        this.mejorFitness = seleccion[0].fitness
        console.log(this.poblacion)
        let temp = []
        for(let i = 0; i < seleccion.length*3; i++) //Se generan clones de la seleccion
            temp = temp.concat(seleccion)

      //  console.log(temp)
        const mutados = []
        for(let i = 0; i < temp.length; i++){//Se mutan los clones (30%)
            mutados.push(temp[i].mutar())
        }
        //console.log(mutados)
        let combinaciones = []
        for(let i = 0;i<temp.length; i++){
            combinaciones.push(temp[i]) //Se preparan los clones para cruzarlos 
        }
        for (let i = combinaciones.length - 1; i > 0; i--) {//Shuffle de clones
            let j = Math.floor(Math.random() * (i + 1));
            [combinaciones[i], combinaciones[j]] = [combinaciones[j], combinaciones[i]];
        }
        for (let i = 1; i < combinaciones.length - 2; i++){ //Se cruzan los clones (30%)
            combinaciones[i-1] = combinaciones[i].cruzar(combinaciones[i-1])
        }
        
        let combinacionesMutados = []
        for (let i = 0; i < combinaciones.length ; i++){
            combinacionesMutados.push(combinaciones[i].mutar()) //Se clonan los clones cruzados y se mutan (30%)
        }

        //Se unen los individuos Mutados y cruzados
        const nuevaPoblacion =  new Poblacion([].concat(seleccion, mutados, combinaciones, combinacionesMutados)) 
        
        return nuevaPoblacion
    }
}




/**
 *ESTA PARTE PA ABAJO ES PARA PROBAR
 * CARGA LA IMAGEN AUTOMATICAMENTE Y GENERA LA POBLACION CON DATOS PREDETERMINADOS
 */
//  
function temp(){

    let divImagen = document.getElementById('imageSrc');//CARGA LA IMAGEN AUTOMATICAMENTE
    divImagen.src = "img/img1.png"
    let mat = cv.imread(divImagen);
    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);
    let img = document.getElementById('imageId');
    
    WIDTH = divImagen.naturalWidth
    HEIGHT = divImagen.naturalHeight

    let goal = mat // El objetivo

    let nuevaPoblacion = new Poblacion()  
    for(let i = 0; i<GENERACIONES; i++){
        nuevaPoblacion = nuevaPoblacion.nuevaPoblacion(goal)

    }
    


/*let imgElement = document.getElementById('imagen1');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
    }, false);
imgElement.onload = function(){
} */

}//COMO SACAR PUNTOS DE LA IMAGEN 
/* 
    let p1 = new cv.Point(0, 0);
    let p2 = new cv.Point(20, 20);
    let p3 = new cv.Point(10, 0);
    let p4 = new cv.Point(65, 65);

    let indiv = new cv.Mat(500, 500, cv.CV_8U);//Imagen de 500*500
    indiv.setTo(new cv.Scalar(255));
    
    cv.line(indiv, p1, p2, [0, 0, 0, 0], 1)
    cv.line(indiv, p2, p3, [0, 0, 0, 0], 1)
    cv.line(indiv, p3, p4, [0, 0, 0, 0], 2)
    
    cv.imshow('canvasOutput', indiv);
    mat.delete();
  
  var Module = {
    // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
    onRuntimeInitialized() {
    }
}
}*/