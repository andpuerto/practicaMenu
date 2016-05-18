angular.module('starter.controllers', [])

  //**********************************
  //Controlador de la aplicacion
  //**********************************
  .controller('AppCtrl', ['$state', function($state) {

    var self = this;

    //------------------------
    //Funcion para hacer el logout
    //------------------------
    self.logout = function(){
      //Eliminamos el usuario de la sesion y volvemos a la pantalla de login
      sessionStorage.usuario = null;
      $state.go('login');
    };


    //------------------------
    //Devuelve el numero de elementos de pedido almacenados
    //------------------------
    self.getNumItems = function(){
      var ped = JSON.parse(localStorage.getItem("pedido"));
      return ped==null ? 0 : ped.length;
    };
  }])



  //**********************************
  //Controlador para las funciones de login
  //**********************************
  .controller('LoginCtrl', ['$ionicPopup', '$state', 'Login', 'Preloader', function($ionicPopup, $state, Login, Preloader) {
    var self=this;

    self.logindata = {};


    //------------------------
    //Funcion que se llamara cuando se realice el login
    //------------------------
    self.login = function() {
      //Mostramos un spinner indicando que se esta cargando la pagina
      Preloader.showSpinner();
      //Llamamos al servicio de login para que se envien los datos al servidor
      Login.enter(self.logindata.username, self.logindata.password)
        .success(function (data) {
          //Si la atransmision ha sido correcta, comprobamos el estado
          if(data.status=='OK'){
            //Si recibimos OK (login y password correctos)
            //Guardamos el nombre de usuario en la sesion
            sessionStorage.usuario = self.logindata.username;
            //pasamos a la siguiente pantalla, borrando antes los datos de login
            self.logindata = {};
            $state.go('app.tab.libros');
          }else{
            //Si recibimos un KO avisamos al usuario de que los datos no son correctos
            $ionicPopup.alert({
              title: 'Error',
              template: 'Nombre de usuario o contraseña incorrectos'
            });
          }
        })
        .error(function () {
          //Si falla la transmision, avisamos al usuario
          $ionicPopup.alert({
            title: 'Error',
            template: 'No se ha podido contactar con el servidor'
          });
        }).finally(function() {
        //Pase lo que pase ocultamos el spinner
        Preloader.hideSpinner();
      });
    };
  }])


  //**********************************
  //Controlador para la lista de libros
  //**********************************
  .controller('LibrosCtrl', ['$ionicPopup', 'Libros', '$scope', '$state', 'Preloader', function($ionicPopup, Libros, $scope, $state, Preloader) {
    var self = this;
    //Pagina cargada actualmente
    self.paginaLibros=0;
    //Boolean para indicar si se han cargado todos los libros del servidor
    self.todosCargados=false;
    //Array con todos los libros de la lista
    self.listaLibros=[];

    //Controlamos si se ha realizado el proceso de login. Si no es asi, se vuelve a la pantalla de login.
    if(sessionStorage.usuario == null){
      $state.go('login');
    }

    //------------------------
    //Funcion para cargar mas libros. Se le llamara cada vez que se quiera cargar una
    //Pagina nueva
    //------------------------
    self.cargarMasLibros = function(){
      //Mensajes de error
      var errordatos='No se pudieron leer los datos';
      var tituloerror='Error';

      //Obtenemos los datos desde el servicio de libros. Le pasamos el siguiente numero de pagina
      //Si vamos a cargar la primera pagina, mostramos el spinner. En paginas posteriores no se hace
      //porque la propia lista muestra un spiner en la parte inferior
      if(self.paginaLibros == 0){
        Preloader.showSpinner();
      }
      Libros.getLista(++self.paginaLibros)
        .success(function (data) {
          //Si la recepcion de informacion ha sido correcta, tenemos que comprobar el estado
          if(data.status!='KO'){
            //Si no recibimos KO, lo que tenemos en data son los objetos de la lista.
            //Los agregamos a la lista y avisamos de que se ha terminado la accion para
            //el infinite scroll
            for (var i in data){
              self.listaLibros.push(data[i]);
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }else{
            //Si recibimos KO, lo mas probable es que hayamos alcanzado la ultima
            //pagina, por lo que establecemos a verdadero el valor de la variable
            //Aun asi, si recibimos un KO en la primera pagina, avisamos al usuario de que
            //no se han podido cargar los datos
            self.todosCargados = true;
            if(self.paginaLibros==1){
              $ionicPopup.alert({
                title: tituloerror,
                template: errordatos
              });
            }
          }
        })
        //Si ha fallado la obtencion de datos, avisamos al usuario
        .error(function () {
          $ionicPopup.alert({
            title: tituloerror,
            template: errordatos
          })
          ;
        })
        //En cualquier caso, ocultamos el spinner
        .finally(function () {
          Preloader.hideSpinner();
        });

    }
  }])


  //**********************************
  //Controlador para el detalle del libro
  //**********************************
  .controller('DetalleLibroCtrl', ['$stateParams', '$ionicPopup', '$ionicPopover', 'DetalleLibro', '$scope', '$state', 'Preloader',
    function($stateParams,$ionicPopup, $ionicPopover, DetalleLibro, $scope, $state, Preloader) {
      var self = this;

      //Cantidad del libro para añadir al pedido en caso de que se pulse el boton
      self.cantidad = 1;

      //Controlamos si se ha realizado el proceso de login. Si no es asi, se vuelve a la pantalla de login.
      if(sessionStorage.usuario == null){
        $state.go('login');
      }

      //Mensajes de error
      var errordatos='No se pudieron obtener los datos del libro';
      var tituloerror='Error';

      //Creamos un objeto libro con todos los campos vacios, para evitar posibles problemas con valores nulos
      self.libro = {id:"", title:"", price:"", cover:"", author:"", review:""};

      //Utilizamos un popover para mostrar con mas detalle la parte de la review.
      //Aqui lo inicializamos
      $ionicPopover.fromTemplateUrl('review-popover.html', {
        scope: $scope
      }).then(function(popover) {
        self.popover = popover;
      });

      //Mostramos el spinner avisando del proceso de carga
      Preloader.showSpinner();
      //Tratamos de obtener los detalles del libro
      DetalleLibro.getDetalles($stateParams.libroId)
        .success(function (data) {
          //Si la recepcion de informacion ha sido correcta, tenemos que comprobar el estado
          if(data.status!='KO'){
            //Si no recibimos KO, lo que tenemos en data campos del detalle del libro
            //Establecemos los datos como atributo libro
            self.libro = data;
          }else{
            //Si recibimos KO, avisamos al usuario
            $ionicPopup.alert({
              title: tituloerror,
              template: errordatos
            });
          }
        })
        //Si ha fallado la obtencion de datos, avisamos al usuario
        .error(function () {
          $ionicPopup.alert({
            title: tituloerror,
            template: errordatos
          });
        })
        .finally(function () {
          //Ocultamos el spinner
          Preloader.hideSpinner();
        });


      //------------------------
      //Funcion para abrir el popover cuando se quiera ver la review completa
      //------------------------
      self.openPopover = function($event){
        self.popover.show($event);
      };

      //------------------------
      //Cierra el popover
      //------------------------
      self.closePopover = function() {
        self.popover.hide();
      };

      //------------------------
      //Elimina el popover cuando ya no se necesita
      //------------------------
      $scope.$on('$destroy', function() {
        self.popover.remove();
      });


      //------------------------
      //Agrega el libro al pedido
      //------------------------
      self.agregarLibro = function(){

        //Tomamos del almacenamiento posibles datos anteriores para ese libro
        var pedidoAnt = null;
        var pedidos = JSON.parse(localStorage.getItem("pedido"));
        if(pedidos == null){
          pedidos = [];
        }
        var posicion = -1;
        for(var i=0; i<pedidos.length; i++){
          if(pedidos[i].id == self.libro.id){
            pedidoAnt = pedidos[i];
            posicion = i;
            break;
          }
        }

        //Nos aseguramos de que la cantidad sea mayor que cero
        self.comprobarCantidadCero();
        var nuevaCantidad = self.cantidad;
        //Si hay datos anteriores para ese libro, la cantidad a introducir sera la suma de la anterior y la nueva
        if(pedidoAnt != null){
          pedidos[posicion].cantidad = self.cantidad + parseInt(pedidoAnt.cantidad);
        }else{
          //Si el pedido no estaba, introducimos un nuevo elemento en el array
          pedidos.push({id:self.libro.id, title:self.libro.title, cantidad:nuevaCantidad, precioU:self.libro.price});
        }

        //Metemos los datos en el almacenamiento
        localStorage.setItem("pedido", JSON.stringify(pedidos));
      };


      //------------------------
      //Comprueba se la cantidad es cero y, en tal caso, la pone a uno
      //------------------------
      self.comprobarCantidadCero = function(){
        if(self.cantidad == null || self.cantidad <= 0){
          self.cantidad = 1;
        }
      };


    }])


  //**********************************
  //Controlador para el pedido
  //**********************************
  .controller('PedidosCtrl', ['$ionicPopup', '$scope', '$state', function($ionicPopup, $scope, $state) {
    var self=this;

    self.precioTotal = 0;

    //Controlamos si se ha realizado el proceso de login. Si no es asi, se vuelve a la pantalla de login.
    if(sessionStorage.usuario == null){
      $state.go('login');
    }

    //Utilizamos el evento beforeEnter para recargar la lista de pedidos cada vez que se muestra la vista
    //Puede ser que se haya actualizado en la vista del detalle de libro y, por tanto, debemos volver a cargarla
    $scope.$on("$ionicView.beforeEnter", function(){
      self.recargarPedidos();
    });


    //------------------------
    //Cargamos los elementos del pedido desde el almacenamiento.
    //------------------------
    self.recargarPedidos = function(){
      self.pedidos = [];

      //Cargamos el array de pedidos anteriores del almacenamiento
      self.pedidos = JSON.parse(localStorage.getItem("pedido"));

      //Calculamos el total
      self.calcularTotal();
    };


    //------------------------
    //Devuelve verdadero si hay algun elemento en la lista de pedidos
    //------------------------
    self.hayPedidos = function(){
      return self.pedidos.length > 0;
    };


    //------------------------
    //Almacena de nuevo el elemento que recibe como parametro
    //------------------------
    self.cambiarCantidad = function(elemento){


      //Si la cantidad es mayor que cero, guardamos los datos
      //Hay que considerar este caso porque el usuario puede borrar el numero para editarlo
      if(elemento.cantidad > 0) {
        //Actualizamos la cantidad del elemento cambiado
        for(var i=0; i<self.pedidos.length; i++){
          if(self.pedidos[i].id == elemento.id){
            self.pedidos[i].cantidad = elemento.cantidad;
            break;
          }
        }
        //Almacenamos el array
        localStorage.setItem("pedido", JSON.stringify(self.pedidos));

        //Recalculamos el precio total
        self.calcularTotal();
      }
    };


    //------------------------
    //Comprueba si la cantidad introducida es cero o nulo
    //------------------------
    self.comprobarCantidadCero = function(elemento){
      //Si el campo esta vacio, lo ponemos a cero para evitar problemas
      if(elemento.cantidad === null){
        elemento.cantidad=0;
      }
      //Si la cantidad especificada es 0, eliminamos el elemento
      if(elemento.cantidad <= 0) {
        self.eliminarElemento(elemento);
      }
    };


    //------------------------
    //Calcula el importe total del pedido
    //------------------------
    self.calcularTotal = function(){
      self.precioTotal = 0;
      for(var i=0; i<self.pedidos.length; i++){
        self.precioTotal += parseFloat(self.pedidos[i].precioU) * parseInt(self.pedidos[i].cantidad);
      }
    };


    //------------------------
    //Pide confirmacion para eliminar el elemento
    //Si se confirma, se borra del almacenamiento y se recarga la lista
    //------------------------
    self.eliminarElemento = function(elemento){
      $ionicPopup.confirm({
          title: 'Eliminar elemento',
          template: '¿Eliminar el elemento del pedido?'
        })
        .then(function(res) {
          if(res) {
            //Hallamos la posicion del elemento a eliminar
            var posicion=-1;
            for(var i=0; i<self.pedidos.length; i++){
              if(self.pedidos[i].id == elemento.id){
                posicion=i;
                break;
              }
            }
            //Eliminamos el elemento del array y lo pasamos al almacenamiento
            if(posicion >=0 ) {
              self.pedidos.splice(posicion,1);
              localStorage.setItem("pedido", JSON.stringify(self.pedidos));
            }

            //Recargamos la lista de pedidos tras la eliminacion
            self.recargarPedidos();
          }else{
            //Si se cancela y se habia establecido la cantidad en 0, la dejamos en 1
            if(elemento.cantidad <= 0) {
              elemento.cantidad = 1;
              self.cambiarCantidad(elemento);
            }
          }
        });
    };


  }]);
