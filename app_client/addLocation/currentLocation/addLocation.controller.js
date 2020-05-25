(function () {

    angular
      .module('loc8rApp')
      .controller('addLocationCtrl', addLocationCtrl);
  
    addLocationCtrl.$inject = ['$location','authentication','loc8rData','geolocation'];
    function addLocationCtrl($location, authentication, loc8rData, geolocation) {
      var vm = this;
      vm.location = {};
      vm.pageHeader = {
        title: 'Add Location',
        strapline: 'Add location to others to find and enjoy!'
      };
  
      vm.onSubmit = function () {
        vm.formError = "";
        console.log("location: " + JSON.stringify(vm.location));
        if (!vm.location.name || !vm.location.address || 
            !vm.location.facilities ||
            !vm.location.openingTimes.days || 
            !vm.location.openingTimes.opening ||
            !vm.location.openingTimes.closing) {
          vm.formError = "All fields required, please try again";
          return false;
        } else {
          if(!vm.location.lat || !vm.location.lng){
            vm.formError = "Get you location failed";
            return false;
          }
          vm.doAddLocation();
        }
      };
  
      vm.doAddLocation = function() {
        vm.formError = "";

        loc8rData
          .addLocation(vm.location)
          .error(function(err){
            vm.formError = err;
          })
          .then(function(){
            $location.search('page', null); 
            $location.path(vm.returnPage);
          });
      };
      
      vm.getData = function (position) {
        vm.location.lat = position.coords.latitude;
        vm.location.lng = position.coords.longitude;
      };
      
      vm.showError = function (error) {
        $scope.$apply(function() {
          vm.message = error.message;
          switch (error.code){
            case 1:
              vm.message += ' Sem permissão para usar sua Geolocalização.';
              break;
            case 2:
              vm.message += ' A localização do dispositivo não pôde ser determinada.';
              break;
            default:
              vm.message += ' Erro ao obter localização código: ' + error.code;
          }
        });
      };
      
      vm.noGeo = function () {
        $scope.$apply(function() {
          vm.message = "Geolocation is not supported by this browser.";
        });
      };

      geolocation.getPosition(vm.getData,vm.showError,vm.noGeo);
      
    }
  
  })();