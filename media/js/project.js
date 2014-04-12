function ProjectCtrl($scope) {
  $scope.people = [
  ];

  $scope.addPerson = function() {
    $scope.people.push({text:$scope.personText});
    $scope.personText = '';
  };

}
