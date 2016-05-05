angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/loginant.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})



//Controlador para las funciones de login
  .controller('LoginCtrl', ['$ionicPopup', '$state', 'Login', function($ionicPopup, $state, Login) {
    var self=this;

    self.logindata = {};


    //Funcion que se llamara cuando se realice el login
    self.login = function() {
      //Llamamos al servicio de login para que se envien los datos al servidor
      Login.enter(self.logindata.username, self.logindata.password)
        .success(function (data, status, headers, config) {
          //Si la atransmision ha sido correcta, comprobamos el estado
          if(data.status=='OK'){
            //Si recibimos OK (login y password correctos), pasamos a la siguiente pantalla
            $state.go('app.tab.libros');
          }else{
            //Si recibimos un KO avisamos al usuario de que los datos no son correctos
            $ionicPopup.alert({
              title: 'Error',
              template: 'Nombre de usuario o contraseña incorrectos'
            });
          }
        })
        .error(function (data, status, header, config) {
          //Si falla la transmision, avisamos al usuario
          $ionicPopup.alert({
            title: 'Error',
            template: 'No se ha podido contactar con el servidor'
          });
        });
    }
  }])


  //Controlador para la lista de libros
  .controller('LibrosCtrl', ['$ionicPopup', 'Libros', '$scope', function($ionicPopup, Libros, $scope) {
    var self = this;
    //Pagina cargada actualmente
    self.paginaLibros=0;
    //Boolean para indicar si se han cargado todos los libros del servidor
    self.todosCargados=false;
    //Array con todos los libros de la lista
    self.listaLibros=[];

    //Funcion para cargar mas libros. Se le llamara cada vez que se quiera cargar una
    //Pagina nueva
    self.cargarMasLibros = function(){
      //Mensajes de error
      var errordatos='No se pudieron leer los datos';
      var tituloerror='Error';

      //Obtenemos los datos desde el servicio de libros. Le pasamos el siguiente numero de pagina
      Libros.getLista(++self.paginaLibros)
        .success(function (data, status, headers, config) {
          //Si la recepcion de informacion ha sido correcta, tenemos que comprobar el estado
          if(data.status!='KO'){
            //Si no recibimos KO, lo que tenemos en data son los objetos de la lista.
            //Los agregamos a la lista y avisamos de que se ha terminado la accion para
            //el infinite scroll
            for (i in data){
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
        .error(function (data, status, header, config) {
          $ionicPopup.alert({
            title: tituloerror,
            template: errordatos
          });
        });

    }

  }])

  //Controlador para el detalle del libro
  .controller('DetalleLibroCtrl', ['$stateParams', '$ionicPopup', '$ionicPopover', 'DetalleLibro', '$scope', function($stateParams,$ionicPopup, $ionicPopover, DetalleLibro, $scope) {
    var self = this;

    //Cantidad del libro para añadir al pedido en caso de que se pulse el boton
    self.cantidad = 1;

    //Para depuracion: eliminamos todos los datos de pedidos. Descomentar para vaciar la lista en las pruebas
    //localStorage.clear();

    //Para depuracion. Imprimimos todos los elementos almacenados en el localstorage
    var ids = Object.keys(localStorage);
    var i = 0;
    for(i=0; i<ids.length; i++) {
      //values.push( localStorage.getItem(keys[i]) );
      var elemento = JSON.parse(localStorage.getItem(ids[i]));
      console.log(elemento);
      console.log("ID: " + ids[i] + ". Titulo: " + elemento.title + ". Cantidad: " + elemento.cantidad);
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

    //Tratamos de obtener los detalles del libro
    DetalleLibro.getDetalles($stateParams.libroId)
      .success(function (data, status, headers, config) {
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
      .error(function (data, status, header, config) {
        $ionicPopup.alert({
          title: tituloerror,
          template: errordatos
        });
      });


    //Funcion para abrir el popover cuando se quiera ver la review completa
    self.openPopover = function($event){
      self.popover.show($event);
    };

    //Cierra el popover
    self.closePopover = function() {
      self.popover.hide();
    };

    //Elimina el popover cuando ya no se necesita
    $scope.$on('$destroy', function() {
      self.popover.remove();
    });

    self.agregarLibro = function(){
      //Agregamos al array el id del libro y la cantidad
      //Tomamos del almacenamiento posibles datos anteriores para ese libro
      var pedidoAnt = JSON.parse(localStorage.getItem(self.libro.id));
      var nuevaCantidad = self.cantidad;
      //Si hay datos anteriores para ese libro, la cantidad a introducir sera la suma de la anterior y la nueva
      if(pedidoAnt != null){
        nuevaCantidad = self.cantidad + parseInt(pedidoAnt.cantidad);
      }
      //Para depuracion
      console.log("Voy a meter: ID: " +  self.libro.id + ". Titulo: " + self.libro.title + ". Cantidad: " + nuevaCantidad);
      //Metemos en el almacenamiento el nuevo libro con la cantidad calculada en su caso
      var pedidoTmp = {title:self.libro.title, cantidad:nuevaCantidad, precioU:self.libro.price};
      localStorage.setItem(self.libro.id, JSON.stringify(pedidoTmp));

      //$scope.pedido.push(self.libro.title);
      //Mostrar mensaje (¿toast?) avisando de la insercion correcta
    };


  }])


  //Controlador para el pedido
  .controller('PedidosCtrl', ['$ionicPopup', '$scope', 'Login', function($ionicPopup, $scope, Login) {
    var self=this;

    self.precioTotal = 0;

    //Utilizamos el evento beforeEnter para recargar la lista de pedidos cada vez que se muestra la vista
    //Puede ser que se haya actualizado en la vista del detalle de libro y, por tanto, debemos volver a cargarla
    $scope.$on("$ionicView.beforeEnter", function(event, data){
      self.recargarPedidos();
    });


    //Cargamos los elementos del pedido desde el almacenamiento.
    self.recargarPedidos = function(){
      self.pedidos = [];
      //Tomamos todos los elementos del localStorage y los agregamos al array
      var ids = Object.keys(localStorage);
      for(var i=0; i<ids.length; i++) {
        var elemento = JSON.parse(localStorage.getItem(ids[i]));
        self.pedidos.push({id:ids[i], title:elemento.title, cantidad:elemento.cantidad, precioU:elemento.precioU});
      }
      //Calculamos el total
      self.calcularTotal();
    };


    //Devuelve verdadero si hay algun elemento en la lista de pedidos
    self.hayPedidos = function(){
      return self.pedidos.length > 0;
    };


    //Almacena de nuevo el elemento que recibe como parametro
    self.cambiarCantidad = function(elemento){
      //Si la cantidad especificada es 0, eliminamos el elemento
      if(elemento.cantidad <= 0) {
        self.eliminarElemento(elemento);
      }
      //Si no, almacenamos de nuevo el elemento
      else {
        localStorage.setItem(elemento.id, JSON.stringify({
          title: elemento.title,
          cantidad: elemento.cantidad,
          precioU: elemento.precioU
        }));
        //Recalculamos el precio total
        self.calcularTotal();
      }
    };


    //Calcula el importe total del pedido
    self.calcularTotal = function(){
      self.precioTotal = 0;
      for(var i=0; i<self.pedidos.length; i++){
        self.precioTotal += parseFloat(self.pedidos[i].precioU) * parseInt(self.pedidos[i].cantidad);
      }
    };


    //Pide confirmacion para eliminar el elemento
    //Si se confirma, se borra del almacenamiento y se recarga la lista
    self.eliminarElemento = function(elemento){
      $ionicPopup.confirm({
          title: 'Eliminar elemento',
          template: '¿Eliminar el elemento del pedido?'
        })
        .then(function(res) {
          if(res) {
            localStorage.removeItem(elemento.id);
            //Recargamos la lista de pedidos tras la eliminacion
            self.recargarPedidos();
          }else{
            //Si se cancela y se habia establecido la cantidad en 0, la dejamos en 1
            if(elemento.cantidad <= 0) {
              elemento.cantidad = 1;
            }
          }
        });
    };



  }]);
