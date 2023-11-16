//Variables globales
//Dimensiones de la imagen objetivo
let HEIGHT = 0; 
let WIDTH = 0;

//Parametros de entrada
let PORCENTAJE_PUEDE_MUTAR = 0.3
let PORCENTAJE_PUEDE_COMBINARSE = 0.6
let PORCENTAJE_SELECCIONADO = 0.1

let MAXLINEAS = 5; //Maxima cantidad de lineas por individuo 
let CANT_INDIVIDUOSxGENERACION = 5;//El tamaño de la poblacion por generacion 
let CANT_GENERACIONES = 5;

let GOAL = null //La imagen objetivo

let NUEVAPOBLACION = null //Poblacion sobre la que se va iterar

//Para el coronometro
let SEGUNDOS = 0;
let MINUTOS = 0;

/**
 * @description Clase que posee dos puntos y la funcion de la recta que pasa por estos dos puntos en un plano cartesiano. Se puede pensar cada Gen como una recta en la imagen 
 */
class Gen{
    /**
     * 
     * @param {object} inPunto1 Un punto de inicio de la recta
     * @param {object} inPunto2 Un punto de final de la recta
     * @constructor Toma dos puntos y los copia en la clase y si no se toman como parametro se generan aleatoriamente en la imagen
     */
    constructor(inPunto1 = null, inPunto2 = null){
        if(inPunto1 === null){
            this.punto1 = { x : Math.floor(Math.random() * WIDTH),
                            y : Math.floor(Math.random() * HEIGHT)}
            this.punto2 = { x : Math.floor(Math.random() * WIDTH),
                            y : Math.floor(Math.random() * HEIGHT)}
        }
        else{
            this.punto1 = JSON.parse(JSON.stringify(inPunto1))
            this.punto2 = JSON.parse(JSON.stringify(inPunto2))
        }
        this.calcularFuncion()//Se calcula la funcion que para por los dos puntos
    }
    /**
     * @description Calcula la formula de la recta que pasa por los dos puntos del Gen
     */
    calcularFuncion(){
        if(this.punto2.x - this.punto1.x === 0)//Se confirma si es 0 para no dividir entre 0
            this.m = 100 //(una recta casi vertical por lo tanto se genera con una pendiente altisima)
        else
            this.m = (this.punto2.y - this.punto1.y)
                    /(this.punto2.x - this.punto1.x)
        
        this.b = -(this.m*this.punto1.x)+this.punto1.y
    }
    /**
     * 
     * @param {Int} x El "x" (la columna) en donde se ubicara la evaluacion de nuestra funcion 
     * @returns El "y" (la fila) correspondiente  despues de aplicar formula 
     */
    funcion(x){
        return Math.round((x*this.m)+this.b)
    }
    copy(){
        return  new Gen(this.punto1,this.punto2)
    }
}


/**
 * @description El individuo tendra un array de Genes, en este caso estamos hablando que el individuo es el que tiene la receta para formar la imagen
 */
class Individuo{
    /**
     * 
     * @param {Array<Gen>} cromosoma Conjunto de genes de entrada 
     * 
     * @constructor Genera el cromosoma si no se recibe como entrada
     */
    constructor(cromosoma = null, fitness = null){
        this.cromosoma = []
        if(cromosoma === null)
            this.cromosoma = this.cromosomaAleatorio()
        else
            for(let i = 0; i<cromosoma.length; i++)
                this.cromosoma.push(cromosoma[i].copy())
        if(fitness)
            this.fitness = fitness
        else
            this.fitness = null
    }
    /**
     * 
     * @returns Array de genes
     * 
     * @description Genera el array de Genes para un nuevo individuo
     */
    cromosomaAleatorio(){
        let rectasAleatorias = [];

        let cantidadLineas = Math.floor(1+(Math.random() * MAXLINEAS))//La cantidad de genes sera aleatoria pero con un tope especificado por user 
        for(let i = 0; i < cantidadLineas; i++) {
            rectasAleatorias.push(new Gen())
        }                                                        
        return rectasAleatorias;
    }
    /**
     * 
     * @param {Individuo} alter El individuo con el que se cruzara el individuo actual(this)
     * @param {Int} cantidadGenes La cantidad de genes que se intercambiaran (Si no se introduce como entrada se genera de forma aleatoria)
     * @returns Un nuevo individuo con los genes cruzados del inviduo actual(this) y el de entrada
     * 
     * @description Cruza los genes de dos individuos 
     */
    cruzar(alter, cantidadGenes = null) {
        if(cantidadGenes === null)//Si la cantidad de genes no es especificada
            cantidadGenes = Math.floor(Math.random()*this.cromosoma.length) + 1 //Se genera de forma aleatoria
    
        let nuevoIndividuo = new Individuo(this.cromosoma)

        let posicionesAleatorias = []
        for(let i = 0; i<cantidadGenes; i++)
            posicionesAleatorias.push(Math.floor((Math.random() * cantidadGenes)))

        for(let i = 0; i<posicionesAleatorias.length; i++)
            nuevoIndividuo.cromosoma[posicionesAleatorias[i]] = alter.cromosoma[Math.floor(Math.random()*alter.cromosoma.length)].copy()
        
        return nuevoIndividuo
    }
    /**
     * 
     * @param {Int} cantidadGenes La cantidad de genes que se quieran mutar (Si no se introduce como entrada se genera de forma aleatoria)
     * @returns Un nuevo individuo con los Genes mutados
     * 
     * @description Modifica el punto 1 o el punto 2 al cambiar el "x" y el "y" por sumando (1) o (-1)
     */
    mutar(cantidadGenes = null) {
        if(cantidadGenes === null)
            cantidadGenes = Math.floor(Math.random()*this.cromosoma.length) + 1

        let nuevoIndividuo = new Individuo(this.cromosoma)

        //Se generan las posiciones aleatorias de los cromosomas que cambiaran
        let posicionesAleatorias = []
        for(let i = 0; i<cantidadGenes; i++)
            posicionesAleatorias.push(Math.floor((Math.random() * this.cromosoma.length)))
        
        let punto0 = 0
        for(let i = 0; i<posicionesAleatorias.length; i++){
            //Se elige el si se cambia el punto 1 o el punto 2 del Gen
            punto0 = Math.round((Math.random() * 1))
            if(punto0){//Si cambia el punto 1
                if(nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.x <= 0)
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.x += 2//Si el x se esta saliendo de la imagen 
                else
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.x += (2*((-1)**(Math.round(Math.random())))) 
                if(nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.x >= WIDTH )
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.x -= 2
                else
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.x += (2*((-1)**(Math.round(Math.random()))))
                
                if(nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.y <= 0)
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.y += 2//Si el y se esta saliendo de la imagen 
                else
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.y += (2*((-1)**(Math.round(Math.random())))) 
                if(nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.y >= HEIGHT )
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.y -= 2
                else
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto1.y += (2*((-1)**(Math.round(Math.random())))) 
            }
            else{
                if(nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.x <= 0)
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.x += 1//Si el x se esta saliendo de la imagen 
                else
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.x += (2*((-1)**(Math.round(Math.random()))))              
                if(nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.x >= WIDTH )
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.x -= 2
                else
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.x += (2*((-1)**(Math.round(Math.random()))))

                if(nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.y <= 0)
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.y += 2//Si el y se esta saliendo de la imagen 
                else
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.y += (2*((-1)**(Math.round(Math.random()))))            
                if(nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.y >= HEIGHT )
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.y -= 2
                else
                    nuevoIndividuo.cromosoma[posicionesAleatorias[i]].punto2.y += (2*((-1)**(Math.round(Math.random())))) 
            }
            //Se calcula de nuevo la funcion del Gen con los puntos cambiados

            nuevoIndividuo.cromosoma[posicionesAleatorias[i]].calcularFuncion();
        }
        return nuevoIndividuo
    }
    /**
     * 
     * @param {cv.Mat} objetivo La imagen base para calcular el fitness 
     * @returns 
     * 
     * @description Resta todos los pixeles que se acercan a los pixeles del objectivo  y suma aquellos que no esten con un pixel negro 
     */
    calcularFitness(objetivo){           
        let y = 0;
        let acumulador = 0; 
        for(let i = 0; i < this.cromosoma.length; i++){
            this.cromosoma[i].calcularFuncion()
            // console.log(this.cromosoma[i].b)
            // console.log(this.cromosoma[i].m)
            // console.log(this.cromosoma[i].punto1)
            // console.log(this.cromosoma[i].punto2)

            for(let j = Math.min(this.cromosoma[i].punto1.x,this.cromosoma[i].punto2.x)//Se toma el x mas a la izquierda
                ; j <= Math.max(this.cromosoma[i].punto1.x,this.cromosoma[i].punto2.x)//Hasta llegar al y mas a la derecha
                ; j++){   
                    y = this.cromosoma[i].funcion(j)
                    if(objetivo.ucharPtr(j, y)[0] === 0)
                        acumulador -= 25
                    else
                        acumulador += 50
                    if(objetivo.ucharPtr(j-1, y)[0] === 0)
                        acumulador -= 10
                    else
                        acumulador += 25
                    if(objetivo.ucharPtr(j-1, y)[0] === 0)
                        acumulador -= 10
                    else
                        acumulador += 25
            }
        }
        this.fitness = acumulador
        return this.cromosoma
    }
    /**
     * 
     * @returns Copia del individuo actual(this)
     */
    copy(){
        let copiaCromosoma = []
        for(let i = 0; i<this.cromosoma.length; i++){
            copiaCromosoma.push(this.cromosoma[i].copy())
        }
        return new Individuo(copiaCromosoma, this.fitness)
    }
}

/**
 * @description La poblacion de individuos(Imagenes)
 */
class Poblacion{
    /**
     * 
     * @param {Array<Individuo>} poblacion El array de individuos de entrada
     * @description En caso de recibir una poblacion de entrada, solo la copia, sino, la genera  
     */
    constructor(poblacion = null){
        this.poblacion = []
        if(poblacion === null){
            for(let i = 0; i < CANT_INDIVIDUOSxGENERACION;i++)
                this.poblacion.push(new Individuo())            
        }else{
            for(let i = 0; i<poblacion.length; i++)
                this.poblacion.push(poblacion[i].copy());
        }
        this.mejorFitness = null
    }
    /**
     * 
     * @param {cv.Mat} objetivo La imagen a la que la poblacion intentara converger
     * @returns La poblacion ordenada en base al objetivo de entrada
     * 
     * @description Ordena la poblacion actual(this) en forma ascendente segun su fitness
     */
    async ordenarFitness(objetivo){
        for(let i = 0; i<this.poblacion.length; i++){
            this.poblacion[i].calcularFitness(objetivo);//Calcula el fitness de toda la poblacion
        }    

        const ordenada = this.poblacion.sort(function (a,b){
                return a.fitness - b.fitness; //Ordena la poblacion por el fitness en orden ascendente
            });
        return ordenada
    }
    /**
     * 
     * @param {cv.Mat} objetivo La imagen a la que la poblacion tiene que converger
     * 
     * @description Genera una nueva poblacion, pero aplicando mutaciones y combinaciones de forma que la nueva poblacion se pueda considerar una nueva generacion
     */
    async nuevaPoblacion(objetivo){
        this.poblacion = await this.ordenarFitness(objetivo)

        let seleccion = []
        //Se selecciona una porcion de la poblacion
        for(let i = 0; i < Math.round(this.poblacion.length*PORCENTAJE_SELECCIONADO); i++)
            seleccion.push(this.poblacion[i].copy())

        let mutados = []
        //Se selecciona una porcion de la poblacion para mutar
        for(let i = 0; i < Math.round(this.poblacion.length*PORCENTAJE_PUEDE_MUTAR); i++){
            mutados.push(this.poblacion[i].copy().mutar() )
        }

        let combinaciones = []
        //Se selecciona una porcion de la poblacion para combinar
        for(let i = 0; i < Math.round(this.poblacion.length*PORCENTAJE_PUEDE_MUTAR); i++)
            combinaciones.push(this.poblacion[i].copy())
        for (let i = combinaciones.length - 1; i > 0; i--) {//Shuffle
            let j = Math.floor(Math.random() * (i + 1));
            [combinaciones[i], combinaciones[j]] = [combinaciones[j], combinaciones[i]];
        }
        for (let i = 1; i < combinaciones.length - 1; i++){ //Se cruzan
            combinaciones[i-1] = combinaciones[i].cruzar(combinaciones[i-1])
        }
        
        let combinacionesMutados = []
        //Se seleccionan los combinados para mutarlos
        for(let i = 0; i < combinaciones.length; i++)
            combinacionesMutados.push(combinaciones[i].copy().mutar())

        //Se unen los individuos Mutados y cruzados
        const nuevaPoblacion =  new Poblacion(([].concat(seleccion, mutados, combinaciones, combinacionesMutados)))

        nuevaPoblacion.mejorFitness = seleccion[0].fitness
        return nuevaPoblacion
    }
}

var data = [];

let tieneAdvertencia = true
async function main(){
    //AQUI CARGA LA IMAGEN AUTOMATICAMENTE
    let divImagen = document.getElementById('imageSrc');
    console.log()
     if(divImagen.src.length === 0){
        alert("No se puede comenzar sin una imagen")
        return
    }
    WIDTH =  divImagen.naturalWidth
    HEIGHT = divImagen.naturalHeight
    const goal = cv.imread(divImagen);
    GOAL = new cv.Mat()

    cv.threshold(goal, GOAL, 254, 255, cv.THRESH_BINARY);

    //CAUNDO NO SE QUIERA CARGAR AUTO: ELIMINAR LAs LINEAs DE ARRIBA

   
    if(((PORCENTAJE_SELECCIONADO + PORCENTAJE_PUEDE_COMBINARSE + PORCENTAJE_PUEDE_MUTAR < 1) || (PORCENTAJE_SELECCIONADO + PORCENTAJE_PUEDE_COMBINARSE + PORCENTAJE_PUEDE_MUTAR > 1)) &&(tieneAdvertencia)){
        alert("Note que sus porcentajes de individuos que se combinan, mutan y se seleccionan por generacion no añaden a 100%, esto puede llevar a comportamiento inesperado. Por favor considere en cambiarlos")
        tieneAdvertencia = false
        return
    }

    WIDTH =  divImagen.naturalWidth
    HEIGHT = divImagen.naturalHeight

    if(NUEVAPOBLACION === null)
        NUEVAPOBLACION = new Poblacion()

    //Para el cronometro
    SEGUNDOS = 0
    MINUTOS = 0
    let temporizador = setInterval(function() {
        SEGUNDOS++;
        if(SEGUNDOS === 60){
            MINUTOS++;
            SEGUNDOS = 0
        }if(SEGUNDOS<10){
            document.getElementById("timer").textContent = MINUTOS+":0"+SEGUNDOS;
        }else{
            document.getElementById("timer").textContent = MINUTOS+":"+SEGUNDOS;
        }
    }, 1000);
    
    let tiempoInicio;
    let tiempoFinal
    let tiempos = 0;
    let contadorGeneraciones = 0
    let punto1 = null
    let punto2 = null
    let img = null
    data = []
    for(let i = 0; i<CANT_GENERACIONES; i++){
        contadorGeneraciones += 1

        tiempoInicio = performance.now()

        NUEVAPOBLACION = await NUEVAPOBLACION.nuevaPoblacion(GOAL) 

        tiempoFinal = performance.now()
        tiempos += (tiempoFinal - tiempoInicio)
        document.getElementById("tiempoPromedio").textContent = (((tiempos/contadorGeneraciones)/100).toFixed(3)) + "s"
        console.log(NUEVAPOBLACION)
        
        img = new cv.Mat(WIDTH, HEIGHT, cv.CV_8U); //Segun el tamaño de la imagen objetivo
        img.setTo(new cv.Scalar(255));
        for(let j = 0; j<NUEVAPOBLACION.poblacion[0].cromosoma.length; j++){    
            punto1 = new cv.Point(NUEVAPOBLACION.poblacion[0].cromosoma[j].punto1.y,NUEVAPOBLACION.poblacion[0].cromosoma[j].punto1.x)
            punto2 = new cv.Point(NUEVAPOBLACION.poblacion[0].cromosoma[j].punto2.y,NUEVAPOBLACION.poblacion[0].cromosoma[j].punto2.x)
            
            cv.line(img,punto1,punto2, new cv.Scalar(0, 0, 0, 255),1)
        }
        cv.imshow('canvasOutput', img); 
        img.delete()    
        
        data.push({Fitness: NUEVAPOBLACION.mejorFitness, Generacion : contadorGeneraciones})
        draw(data)

        await new Promise(resolve => setTimeout(resolve, 0)); // Permitir que otros eventos se procesen
        console.log()
    }
    nuevaPoblacion = null;
    clearInterval(temporizador);

}

/**
 * 
 * @param {object} data {Fitnes: y,Generacion: x}
 * 
 * @description Usando la libreria d3, dibuja una grafica del fitness por generacion y el promedio de fitness
 */
function draw(data) {
    var svgWidth = 900, svgHeight = 200;
    var margin = { top: 20, right: 20, bottom: 30, left: 50};
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;
  
    var svg = d3.select("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
  
    svg.selectAll("*").remove();

    var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    var x = d3.scaleLinear().rangeRound([0, width]);
    var y = d3.scaleLinear().rangeRound([height, 0]);
  


    var line = d3.line()
    .x(function(d) { return x(d.Generacion); })
    .y(function(d) { return y(d.Fitness); });
  
    x.domain(d3.extent(data, function(d) { return d.Generacion; }));
    y.domain(d3.extent(data, function(d) { return d.Fitness; }));

    g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5))
    .select(".domain")
    .text("Generacion")
    .remove();
  
    g.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Fitness");
  
    g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", line);
      // Calcular el promedio del tiempo
      var tiempoPromedio = d3.mean(data, function(d) { return d.Fitness; });

    // Dibujar la línea de promedio
    g.append("line")
    .attr("x1", 0)
    .attr("y1", y(tiempoPromedio))
    .attr("x2", width)
    .attr("y2", y(tiempoPromedio))
    .attr("stroke", "red")
    .attr("stroke-dasharray", "5,5");

    // Agregar etiqueta para la línea de promedio
    g.append("text")
    .attr("x", width)
    .attr("y", y(tiempoPromedio))
    .attr("dy", "-0.3em")
    .attr("text-anchor", "end")
    .text("Promedio");
    // ... código para dibujar el gráfico ...
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
    console.log(CANT_GENERACIONES)
}
function actualizarCantIndividuos(input){
    CANT_INDIVIDUOSxGENERACION = parseInt(input.value)
    console.log(CANT_INDIVIDUOSxGENERACION)
}

function prueba(combinaciones){
    console.log(combinaciones)
    for(let i = 0; i<combinaciones.length; i++){
        console.log(combinaciones[i])
        console.log(combinaciones[i].cromosoma[0].b)
        console.log(combinaciones[i].cromosoma[0].m)
        console.log(combinaciones[i].cromosoma[0].punto1)
        console.log(combinaciones[i].cromosoma[0].punto2)
    }
}

document.getElementById("fileInput").addEventListener('change', (e) => { 
    document.getElementById("imageSrc").src = URL.createObjectURL(e.target.files[0]); 
    const goal = cv.imread(document.getElementById("imageSrc"));
    cv.cvtColor(goal, goal, cv.COLOR_RGBA2GRAY);
    GOAL = goal
}, false); 
