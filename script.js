//Variables globales
let NUMLENGHT = null;
let MAXLINEAS = 50;
let TAMPOBLACION = 5;
let GENERACIONES = 1000;

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
        let puntosAleatorios = [];
        let rectasAleatorias = [];

        let cantidadLineas = Math.floor(Math.random() * MAXLINEAS)
        for(let i = 0; i < cantidadLineas; i++) {
            for(let j=0; j < 4; j++)
                puntosAleatorios.push(Math.floor(Math.random() * 500));//Numero aleatorio de 0 a 500 tambien es temp
            rectasAleatorias.push([[puntosAleatorios[0],puntosAleatorios[1]]
                                 , [puntosAleatorios[2],puntosAleatorios[3]]])
            puntosAleatorios = []
        }                                                        //Deberia de ser hasta TAMAÑO DE LA IMAGEM
        return rectasAleatorias;
    }

    cruzar(alter, cantidadGenes = null) {
        if(cantidadGenes === null)
            cantidadGenes = Math.floor((Math.random() * Math.min(this.cromosoma.length, alter.cromosoma.length)))
    
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
            cantidadGenes = Math.floor((Math.random() * this.cromosoma.length))

        let nuevoIndividuo = new Individuo(this.cromosoma)

        let posicionesAleatorias = []
        for(let i = 0; i<cantidadGenes; i++)
            posicionesAleatorias.push(Math.floor((Math.random() * this.cromosoma.length)))
        
        let punto0 = 0
        let punto1 = 0
        for(let i = 0; i<posicionesAleatorias.length; i++){
            punto1 = Math.round((Math.random() * 1))
            punto0 = Math.round((Math.random() * 1))

            if(punto0)  
                nuevoIndividuo.cromosoma[posicionesAleatorias[i]][0][0] += (10*(-1)**(Math.round(Math.random())))// ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA 
            else
                nuevoIndividuo.cromosoma[posicionesAleatorias[i]][0][1] += (10*(-1)**(Math.round(Math.random())))// ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA 
            
            if(punto1)  
                nuevoIndividuo.cromosoma[posicionesAleatorias[i]][1][0] += (10*(-1)**(Math.round(Math.random())))// ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA 
            else
                nuevoIndividuo.cromosoma[posicionesAleatorias[i]][1][1] += (10*(-1)**(Math.round(Math.random())))// ESTA PARTE PUEDE CAMBIAR YA QUE ES ALEATORIA 
            
            return nuevoIndividuo
        }
    }
    calcularFitness(objetivo){
            
        let indiv = new cv.Mat(500, 500, cv.CV_8U);//Imagen de 500*500
        indiv.setTo(new cv.Scalar(255));
        let tempp = null
        let temppp = null
        for(let j = 0; j<this.cromosoma.length; j++){
            tempp = new cv.Point(this.cromosoma[j][0][0],this.cromosoma[j][0][1])
            temppp = new cv.Point(this.cromosoma[j][1][0],this.cromosoma[j][1][1])
            cv.line(indiv, tempp, temppp, [0, 0, 0, 0], 1)
        }
        /**
         * UNA VEZ GENERADA LA IMAGEN DEBERIA DE COMPARAR CON EL OBJETIVO AQUI
         * Y generar un fitnes y guardarlo
         * TO DO
         */
        this.fitness = 0
        cv.imshow('canvasOutput', indiv);
        return this.cromosoma
    }
}

class Poblacion{
    constructor(poblacion = null){
        if(poblacion === null){
            this.poblacion = []
            for(let i = 0; i < TAMPOBLACION;i++){
                this.poblacion.push(new Individuo())
            }
        }else{
            this.poblacion = JSON.parse(JSON.stringify(poblacion));
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
        const seleccion = this.poblacion.slice(0,10)// DEBERIA DE SER EL 10% de POBLACIONLENGTH
        let temp = []
        for(let i = 0; i < 3; i++)//deberia de ser el 30% 
            temp = temp.concat(seleccion)
        console.log(temp)
        const mutados = []
        for(let i = 0; i < seleccion.length; i++){//30%
            mutados.push(temp[i].mutar())
        }

        let combinaciones = []//30%
        for(let i = 0;i<temp.length; i++){
            combinaciones.push(temp[i])
        }
        for (let i = combinaciones.length - 1; i > 0; i--) {//Shuffle de individuos
            let j = Math.floor(Math.random() * (i + 1));
            [combinaciones[i], combinaciones[j]] = [combinaciones[j], combinaciones[i]];
        }
        for (let i = 1; i < combinaciones.length - 2; i++){
            combinaciones[i-1] = combinaciones[i].cruzar(combinaciones[i-1])
        }
        
        let combinacionesMutados = []
        for (let i = 0; i < combinaciones.length ; i++){
            combinacionesMutados.push(combinaciones[i].mutar())
        }
        return new Poblacion(seleccion + mutados + combinaciones + combinacionesMutados)
    }
}





//  ESTA PARTE PA ABAJO ES PARA PROBAR
function temp(){
let primeraPoblacion = new Poblacion()
let goal = null // deberia definirse como el objetivo
let nuevaPoblacion = null
for(let i = 0; i<2; i++){
    nuevaPoblacion = primeraPoblacion.nuevaPoblacion()
} 
}
/*    let mat = cv.imread(imgElement);
    console.log(mat.ucharPtr(100,100))//COMO SACAR PUNTOS DE LA IMAGEN 

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