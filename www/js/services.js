angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

//Servicio de login
  .factory('Login', function($http) {

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
  })

//Servicio para la lista de libros
  .factory('Libros', function($http) {
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
  })

  //Servicio para detalles del libro
  .factory('DetalleLibro', function($http) {
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
        console.log("id"+idLibro);
        var dataStr = "id="+idLibro;
        return $http.post(url, dataStr, config);
      }
    };
  });
