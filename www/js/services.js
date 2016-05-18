angular.module('starter.services', [])

  //**********************************
  //Servicio de login
  //**********************************
  .factory('Login', ['$http', function($http) {

    //Configuracion y url para enviar los datos de login
    var config = {
      headers : {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    var url='http://multimedia.uoc.edu/frontend/auth.php';

    return {
      //La funcion enter se usa para enviar los datos de login al servidor
      enter: function(usuario, pass) {
        //Devolvemos el resultado del post al servidor
        var dataStr = "user="+usuario+"&"+"passwd="+pass;
        return $http.post(url, dataStr, config);
        }
    };
  }])


  //**********************************
  //Servicio para la lista de libros
  //**********************************
  .factory('Libros', ['$http', function($http) {
    var config = {
      headers : {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    var url='http://multimedia.uoc.edu/frontend/getbooks.php';

    return {
      //La funcion getLista obtiene la parte de la lista de libros correspondiente
      //al numero de pagina que recibe como parametro.
      //Devuelve el resultado del post
      getLista: function(pagina) {
        var dataStr = "page="+pagina;
        return $http.post(url, dataStr, config);
      }
    };
  }])


  //**********************************
  //Servicio para detalles del libro
  //**********************************
  .factory('DetalleLibro', ['$http', function($http) {
    var config = {
      headers : {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    var url='http://multimedia.uoc.edu/frontend/bookdetail.php';

    return {
      //La funcion getLista obtiene la parte de la lista de libros correspondiente
      //al numero de pagina que recibe como parametro.
      //Devuelve el resultado del post
      getDetalles: function(idLibro) {
        var dataStr = "id="+idLibro;
        return $http.post(url, dataStr, config);
      }
    };
  }])


  //**********************************
  //Servicio para mostrar el spinner en las cargas.
  //Se ha implementado como servicio porque se utiliza en diversos controladores
  //y asi pueden acceder todos al mismo codigo
  //**********************************
  .factory('Preloader', ['$ionicLoading', function($ionicLoading) {
    //Plantilla para el spinner
    var spinnerTemplate='<p>Cargando...</p><ion-spinner></ion-spinner>';

    return {
      //Muestra el spinner
      showSpinner: function() {
        $ionicLoading.show({
          template: spinnerTemplate,
          animation: 'fade-in',
          showBackdrop: false,
          //Establecemos un retraso, de forma que si la lectura es rapida no aparezca el spinner, ya que
          //solo ralentizaria y afearia la transicion
          showDelay: 200
        });
      },
      //Oculta el spinner
      hideSpinner: function(){
        $ionicLoading.hide();
      }

    };
  }]);
