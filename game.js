//podemos entrar a ese arreglo de mapas desde nuestro archivo de game.js
console.log(maps)
/* 
i=nuestro jugador
o=la posicion inicial desde donde ingresa nuestro jugador
--=representamos los espacios en blanco donde no debemos renderizar nada
x=obstaculos, posiciones que nos quitan vida, nos hacen volver al principio son BOMBAS
*/




const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector("#record");
const pResult = document.querySelector("#result")



let canvasSize;
let elementsSize;//si nosotros le restamos a x o y, nos vamos a dirigir hacia arriba o hacia la izquierda, pero si lo sumamos nos va a llevar a la derecha o hacia abajo
let level = 0;
let lives =3;
let timeStart;
let timePlayer;
let timeInterval;

//es una variable global asique podemos entrar a e;
// playerPosition, para saber donde posionarse
const playerPosition ={//posicion del jugador
  x: undefined,
  y: undefined
}

//Nos va a yudar a detectar colisiones
const giftPosition = { //es igual al elementsSize porque esta ubicado en la misma poscion
  x: undefined,
  y: undefined,
}

let enemyPositions = [];



window.addEventListener('load',setCanvasSize);//ejecutamos esta funcion cada vez que cargamos nuestro
window.addEventListener('resize',setCanvasSize); //cambia el alto y ancho cada vez que haga resize


    // Lo primero que hacemos apenas carga el juego
    function setCanvasSize(){
  //ahora que la altura es mas baja que el ancho estamos agarrando el 80% de altura
  if(innerHeight > window.innerWidth){ //si el alto es mayor que el ancho
    canvasSize = window.innerWidth * 0.7 //si estamos en un alto de pantalla mayor al ancho vamos agarrar el widht
  }else{
      canvasSize = window.innerHeight * 0.7 //si no es el alto el que es mayor que el ancho
  }


  canvasSize = Number(canvasSize.toFixed(0)); //para que me de un numero de medida mas acertado, le quitamos los decimales

  canvas.setAttribute('width',canvasSize);
  canvas.setAttribute('height',canvasSize)
   elementsSize = canvasSize / 10; //aca podemos agarrar las posiciones para nuestros elementos, donde caben 10 elementos de ariba a abajo y de izquierda a derecha
   
   //Para que cuando hagamos responsive la calavera se quede en la misma posicion
   playerPosition.x = undefined;
   playerPosition.y = undefined;

   startGame(); //luego de hacer todo renderiza el mapa y el jugador
    }

    function startGame(){//el codigo que se debe ejecutar al principio de nuestro juego

        game.font = elementsSize + 'px Verdana';//para aumentar el tamanio de fuente
        game.textAlign = 'end';
    

        const map = maps[level];//le decimos cual quremos que sea el nivel

        if(!map){ //sino hay ninguna posicion dentro de nuestro arreglo de mapa
          gameWin(); //para terminar el juego
          return;//termina la ejeccuion de startGame()
        }

        if(!timeStart){ //si el timepo que inicia no tiene ningun valor
          timeStart = Date.now();
          timeInterval = setInterval(showTimes,100); //timeInterval lo voy a ejecutar cada 100 milisegundos
          showRecord();
        }

        const mapRows = map.trim().split('\n'); //para conseguir as filas de nuestro mapas, con algunos espacios de la fila 2 en adelante
        const mapRowCols = mapRows.map(row =>row.trim().split(''))//estamos creando un NUEVO arreglo que por cada fila,estamos diciendo a cada filo donde cada letra es un elemento de la columna

        enemyPositions = []; //Cada vez que nos movemos estamos limpiando el arreglo
        game.clearRect(0, 0, canvasSize,canvasSize) //BORRAMOS TODO

        showLives()//para insertar los corazones desde el principio

        mapRowCols.forEach((row, rowI) => {
          row.forEach((col, colI) => {
            const emoji = emojis[col];
            const posX = elementsSize * (colI + 1);
            const posY = elementsSize * (rowI + 1);


            //Cada vez que nos encontramos una O es la posicion incial
            if(col == 'O'){ //si nuestra columna es una o
              if(!playerPosition.x && !playerPosition.y){//Si no tienen nada le vamos aa asignar algun valor, en cambio si tiene algo no vamos a ejecutar lo que esta abajo
                playerPosition.x = posX;
                playerPosition.y = posY;
              }
           

             //playerPosition({posX, posY}) //esta en la primera possicon de la ultima linea= posicion incial del jugador
            } else if(col == 'I'){ //para el regalo
              giftPosition.x = posX;
              giftPosition.y = posY;
            } else if(col == 'X'){ //si es un enemigo
             enemyPositions.push({
              x:posX,
              y:posY
             })
            }



            game.fillText(emoji, posX, posY);
          });
        });

        movePlayer()//apenas renderizemos nuestro mapa yo quiero mover nuestro jugador 
      }

      //
      function movePlayer(){
        const gifCollisionX= playerPosition.x.toFixed(3) == giftPosition.x.toFixed(3) //si hace colis
        const gifCollisionY = playerPosition.y.toFixed(3) == giftPosition.y.toFixed(3);
        const giftCollision = gifCollisionX && gifCollisionY //si ambas colisiones se cumplen
        if(giftCollision){
          levelWin();
          console.log('Subiste de niev')
        }

        //como coincidieron esas cordenas en x y y, por eso nos dice chocaste!
     
          const enemyCollision = enemyPositions.find(enemy => {
            const enemyCollisionX = enemy.x.toFixed(3) == playerPosition.x.toFixed(3);
            const enemyCollisionY = enemy.y.toFixed(3) == playerPosition.y.toFixed(3);
            return enemyCollisionX && enemyCollisionY;
          });
          
          if (enemyCollision) {
            levelFail();
          }

        game.fillText(emojis['PLAYER'],playerPosition.x,playerPosition.y)//ahora esta la calavera en la possion incial es decir la puerta
        
      }
      
      function levelWin() {
        console.log('Subiste de nivel');
        level++; //para incrementa el nivel
        startGame()
      }

      function levelFail(){
        lives--; //parea que se reste la vida

        if(lives <= 0){//si mis vidas son menores o iguales a 0
          level   =0; //perdiste pero...
          lives = 3 //pero como perdiste te vuevlo a resetear las 3 vidas
          timeStart = undefined; //cuando perdamos empezamos de cero las vidas y el contador
        }
        playerPosition.x = undefined;
        playerPosition.y = undefined;
        startGame() 
        
      }

      function gameWin(){ //funcion cunado ganas el juego
        console.log('terminaste el juego')
        clearInterval(timeInterval) //para terminar el tiempo del juego
        const playerTime = Date.now() - timeStart; //El tiempo que lleva jugando
        const recordTime = localStorage.getItem('record_time')//vamos a preguntar si teniamos algo guardado en record time
        //es la logica de si ya existia un record time en nuestro juego
        if(recordTime){// si recordTime existe 

          if(recordTime >= playerTime){
            localStorage.setItem('record_time', playerTime); //tenemos un nuevo record, y ese record es lo que tardaron nuestros jugadores en completar el juegp
           pResult.innerHTML = 'Superaste el record'
          }else{ //sino superaron ese tiempo
            pResult.innerHTML = 'Lo siento no superaste el record🥲'
          }
        }else { //si nunca jugaste, aca definimos el record
          localStorage.setItem('record_time', playerTime);
         
        }

        console.log({recordTime, playerTime});
        
      }

        //Forma de multiplicar el elemento 10 veces
        //inicializamos en 1 para que se pueda ver ese regalito
        /*for(let row = 1; row <=10; row++){//esta va aser de filas
            for (let col = 1; col <= 10; col++) {//columnas
                //funciona porque agarramos al emoji que nos de cada uno de nuestros indices de filas y columnas
                game.fillText(emojis[mapRowCols[row -1][col -1]], elementsSize * col ,elementsSize * row) //estamos multiplicando el valor de x por el numero que tengamos en nuestro ciclo for 
             }//mapRowCols[row][col], estos nos va a dar las letras del arrrglo maps
          
        }
    }*/

    
  //  game.fillRect(0, 100, 0, 0);
    //game.clearRect(0,0,50,50);


    //funcion para mostrarle al jugador cuantas vidas le quedan
    function showLives(){
      const heartsArray = Array(lives).fill(emojis['HEART']); //voy a crear un array , con las posiciones de mi variable lives
 
      spanLives.innerHTML = "" //se limpie cada vez que recarguemos
      heartsArray.forEach(heart =>spanLives.append(heart))//voy a recorrer mi arrreglo de corazones y por cada uno, vamos a insertar un cprazon
     // spanLives.innerHTML = emojis['HEART'] //Para ingresar al emoji de corazones
    }

    //para mostrar el tiempo que lleva jugando nuestro jugador
    function showTimes(){
     spanTime.innerHTML = Date.now() - timeStart;
    }
 
    function showRecord(){ //
      spanRecord.innerHTML = localStorage.getItem('record_time')
    }

    window.addEventListener('keydown', moveByKeys)
    btnUp.addEventListener('click', moveUp);
    btnLeft.addEventListener('click', moveLeft);
    btnRight.addEventListener('click', moveRight);
    btnDown.addEventListener('click', moveDown);

    function moveByKeys(event){//aca escuchamos lasm teclas que podemos presionar
      if(event.key == 'ArrowUp'){
        moveUp()
      } else if(event.key == 'ArrowLeft'){
        moveLeft()
      }else if(event.key == 'ArrowRight'){
        moveRight()
      }else if(event.key == 'ArrowDown'){
        moveDown()
      }


      console.log(event)
    }

    //Movernos hacia arriba
    function moveUp(){
      console.log('Me quiero mover hacia arriba');
      if( (playerPosition.y - elementsSize) < elementsSize){//si esta resta nos da un numero menor a el elementsSize=40
      console.log('Nos saca del mapa')
      }else{
        playerPosition.y -= elementsSize  //para movernos hacia arriba  o hacia la izquierda
        startGame()
      }
    }
    function moveLeft(){
      console.log('Me quiero mover hacia izquierda')
      if( (playerPosition.x - elementsSize) < elementsSize){//si esta resta nos da un numero menor a el elementsSize=40
        console.log('Nos saca del mapa')
        }else{
          playerPosition.x -= elementsSize  //para movernos hacia arriba  o hacia la izquierda
          startGame()
        }
    
    }
    function moveRight(){
      console.log('Me quiero mover hacia derecha')
      if( (playerPosition.x + elementsSize) > canvasSize){//no puede pasar la medida del canva
        console.log('Nos saca del mapa')
        }else{
          playerPosition.x += elementsSize  //para movernos hacia arriba  o hacia la izquierda
          startGame()
        }
    }
    function moveDown(){//debe subir para irnos hacia abajo
      console.log('Me quiero mover hacia abajo')
      if( (playerPosition.y + elementsSize) > canvasSize){///no puede pasar la medida del canva
        console.log('Nos saca del mapa')
        }else{
          playerPosition.y += elementsSize  //para movernos hacia arriba  o hacia la izquierda
          startGame()
        }
    }