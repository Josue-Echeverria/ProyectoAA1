//Variables globales
//Dimensiones de la imagen objetivo
let HEIGHT = 0; 
let WIDTH = 0;

//Parametros de entrada
let PORCENTAJE_PUEDE_MUTAR = 0.3
let PORCENTAJE_PUEDE_COMBINARSE = 0.3
let PORCENTAJE_SELECCIONADO = 0.1

let MAXLINEAS = 5; //Maxima cantidad de lineas por individuo 
let CANT_INDIVIDUOSxGENERACION = 5;//El tamaño de la poblacion por generacion 
let CANT_GENERACIONES = 3;

let GOAL = null


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
            cantidadGenes = Math.floor(Math.random()*this.cromosoma.length) + 1
    
        let nuevoIndividuo = new Individuo(this.cromosoma)

        let posicionesAleatorias = []
        for(let i = 0; i<cantidadGenes; i++)
            posicionesAleatorias.push(Math.floor((Math.random() * cantidadGenes)))

        for(let i = 0; i<posicionesAleatorias.length; i++)
            nuevoIndividuo.cromosoma[posicionesAleatorias[i]] = alter.cromosoma[Math.floor(Math.random()*alter.cromosoma.length)] // ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA
        
        return nuevoIndividuo
    }
 
    mutar(cantidadGenes = null) {
        if(cantidadGenes === null)
            cantidadGenes = Math.floor(Math.random()*this.cromosoma.length) + 1

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
        let imagenIndividuo = constructImg(this.cromosoma)
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
        this.imagen = imagenIndividuo
        this.fitness = acummulador
        return this.cromosoma
    }
}

class Poblacion{
    constructor(poblacion = null){
        this.poblacion = []
        if(poblacion === null){
            for(let i = 0; i < CANT_INDIVIDUOSxGENERACION;i++){
                this.poblacion.push(new Individuo())
            }
        }else{
     
            for(let i = 0; i<poblacion.length; i++)
                this.poblacion.push(poblacion[i]);
        }
        this.mejorFitness = null
    }

    ordenarFitness(objetivo){
        for(let i = 0; i<this.poblacion.length; i++){
            this.poblacion[i].calcularFitness(objetivo);
        }    

        const ordenada = this.poblacion.sort(function (a,b){
                return a.fitness - b.fitness; //Ordena la poblacion por el fitness en orden ascendente
            });
        return ordenada
    }

    async nuevaPoblacion(objetivo){
        this.poblacion = this.ordenarFitness(objetivo)
        
        const seleccion = this.poblacion.slice(0, Math.round(this.poblacion.length*PORCENTAJE_SELECCIONADO)) //El 10% de la poblacion

        const mutados = this.poblacion.slice(0, Math.round(this.poblacion.length*PORCENTAJE_SELECCIONADO))
        for(let i = 0; i < mutados.length; i++){//Se mutan los clones (30%)
            mutados[i].mutar()
        }
        
        let combinaciones = this.poblacion.slice(0,Math.round(this.poblacion.length*PORCENTAJE_PUEDE_COMBINARSE))
        for (let i = combinaciones.length - 1; i > 0; i--) {//Shuffle de clones
            let j = Math.floor(Math.random() * (i + 1));
            [combinaciones[i], combinaciones[j]] = [combinaciones[j], combinaciones[i]];
        }
        for (let i = 1; i < combinaciones.length - 2; i++){ //Se cruzan los clones (30%)
            combinaciones[i-1] = combinaciones[i].cruzar(combinaciones[i-1])
        }
        
        let combinacionesMutados = []
        for (let i = 0; i < combinaciones.length ; i++){
           // console.log(combinaciones[i])
            combinacionesMutados.push(combinaciones[i].mutar()) //Se clonan los clones cruzados y se mutan (30%)
        }

        //Se unen los individuos Mutados y cruzados
        const nuevaPoblacion =  new Poblacion([].concat(seleccion, mutados, combinaciones, combinacionesMutados)) 
        nuevaPoblacion.mejorFitness = seleccion[0]
        return nuevaPoblacion
    }
}

function constructImg(cromosoma){
    let img = new cv.Mat(WIDTH, HEIGHT, cv.CV_8U); //Segun el tamaño de la imagen objetivo
    img.setTo(new cv.Scalar(255));
    let punto1 = null
    let punto2 = null
    for(let j = 0; j<cromosoma.length; j++){
        punto1 = new cv.Point(cromosoma[j][0][0],cromosoma[j][0][1])
        punto2 = new cv.Point(cromosoma[j][1][0],cromosoma[j][1][1])
        cv.line(img, punto1, punto2, [0, 0, 0, 0], 3)
    }
    return img
}


/**
 *ESTA PARTE PA ABAJO ES PARA PROBAR
 * CARGA LA IMAGEN AUTOMATICAMENTE Y GENERA LA POBLACION CON DATOS PREDETERMINADOS
 */
//  


async function comenzar(){
    //AQUI CARGA LA IMAGEN AUTOMATICAMENTE
    let divImagen = document.getElementById('imageSrc');
    divImagen.src = "img/img1.png"
    const goal = cv.imread(divImagen);
    cv.cvtColor(goal, goal, cv.COLOR_RGBA2GRAY);
    GOAL = goal
    //CAUNDO NO SE QUIERA CARGAR AUTO: ELIMINAR LAs LINEAs DE ARRIBA
    
    if(GOAL === null){
        alert("No se puede comenzar sin una imagen")
        return
    }

    WIDTH =  divImagen.naturalWidth
    HEIGHT = divImagen.naturalHeight

    let mejorIndividuo = null
    let nuevaPoblacion = new Poblacion()  
    for(let i = 0; i<CANT_GENERACIONES; i++){
       
        nuevaPoblacion = await nuevaPoblacion.nuevaPoblacion(GOAL)        
        mejorIndividuo = await constructImg(nuevaPoblacion.mejorFitness.cromosoma)
        await new Promise(resolve => setTimeout(resolve, 0)); // Permitir que otros eventos se procesen
        await cv.imshow('canvasOutput', mejorIndividuo); 
    }
}


async function esperar(segundos){
    await setTimeout(segundos*1000)
}

function actualizarCombinados(){
    PORCENTAJE_PUEDE_COMBINARSE = parseInt(document.getElementById("porcentajeIndividuosCombinados").value)/100
}

function actualizarSeleccionados(){
    PORCENTAJE_SELECCIONADO = parseInt(document.getElementById("porcentajeIndividuosSeleccionados").value)/100

}

function actualizarMutados(){
    PORCENTAJE_PUEDE_MUTAR = parseInt(document.getElementById("porcentajeIndividuosMutados").value)/100
}

document.getElementById('porcentajeIndividuosSeleccionados').oninput = function() {
    document.getElementById('spanSeleccionados').textContent = this.value + '%';
}

document.getElementById('porcentajeIndividuosMutados').oninput = function() {
    document.getElementById('spanMutados').textContent = this.value + '%';
}

document.getElementById('porcentajeIndividuosCombinados').oninput = function() {
    document.getElementById('spanCombinados').textContent = this.value + '%';
}

function actualizarMaxGeneraciones(input){
    CANT_GENERACIONES = parseInt(input.value)
}
function actualizarCantIndividuos(input){
    CANT_INDIVIDUOSxGENERACION = parseInt(input.value)
}

document.getElementById("fileInput").addEventListener('change', (e) => { 
    document.getElementById("imageSrc").src = URL.createObjectURL(e.target.files[0]); 
    const goal = cv.imread(document.getElementById("imageSrc"));
    cv.cvtColor(goal, goal, cv.COLOR_RGBA2GRAY);
    GOAL = goal
}, false); 
