/**
 * get Assycronus object for autocomplete - Only Call
 * @param {type} param1
 * @param {type} param2
 */

function IdentifyStepPopUpController($scope, $mdDialog, stepsList, $http, $q, ApexService, Flash, $translate, CircuitList, $filter, viewType) {


    $scope.First = [];
    $scope.Last = [];
    $scope.allStepsLast = [];
    $scope.allStepsFirst = [];
    $scope.allStepsLastIds = [];
    $scope.allStepsFirstIds = [];
    $scope.formSubmitted = false;
    $scope.First = [];
    $scope.Last = [];


    //validate insert new step
    $scope.validate = function () {
        $scope.formSubmitted = false;
        if ($scope.First.length == 0) {
            var message = $translate.instant("SELECT_FIRST_STEP");
            var id = Flash.create('danger', message);
            return false;
        }
        if ($scope.Last.length == 0) {
            var message = $translate.instant("SELECT_LAST_STEP");
            var id = Flash.create('danger', message);
            return false;
        }
        return true;
    };

    //Query Search in all groups or all users
    $scope.querySearch = function (query, onlyOne) {

        if (onlyOne) {
            var r = query ? $scope.allStepsFirst.filter($scope.createFilterFor(query)) : [];
        } else {
            var r = query ? $scope.allStepsLast.filter($scope.createFilterFor(query)) : [];
        }

        if ($scope.First.length > 0 && onlyOne) {
            return false;
        }
        return r;
    };

    $scope.createFilterFor = function (query) {

        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (item._lowername.indexOf(lowercaseQuery) != -1);
            ;
        };
    };

    /**
     * 
     * @returns {undefined}
     */
    $scope.finStepById = function (id) {
        var found = false;
        angular.forEach(stepsList, function (step) {
            if (step.id == id) {
                found = {id: step.idStepBD, description: step.description, _lowername: step.name.toLowerCase(), name: step.name, idSeq :step.id};
            }
        });
        return found;
    };


    $scope.uniqueArray = function (origArr) {
        var newArr = [],
                origLen = origArr.length,
                found,
                x, y;

        for (x = 0; x < origLen; x++) {
            found = undefined;
            for (y = 0; y < newArr.length; y++) {
                if (origArr[x] === newArr[y]) {
                    found = true;
                    break;
                }
            }
            if (!found)
                newArr.push(origArr[x]);
        }
        return newArr;
    }

    /**
     * 
     * @returns {undefined}
     */
    $scope.setSetps = function () {

        var parents = [];
        var childs = [];

        angular.forEach(CircuitList, function (circuit) {
            parents.push(circuit.stepParent);
            childs.push(circuit.stepChild);
            if (viewType) {
                if (circuit.inout_parent) {
                    $scope.First.push($scope.finStepById(circuit.stepParent));
                }
                if (circuit.inout_child) {
                    $scope.Last.push($scope.finStepById(circuit.stepChild));
                }
            }
        });
        parents = $scope.uniqueArray(parents);
        childs = $scope.uniqueArray(childs);

        angular.forEach(parents, function (parent) {
            var st = $scope.finStepById(parent);
            if (st) {
                $scope.allStepsFirst.push(st);
                $scope.allStepsFirstIds.push(parent);
            }
        });
        angular.forEach(childs, function (child) {
            var st = $scope.finStepById(child);
            if (st) {
                $scope.allStepsLast.push(st);
                $scope.allStepsLastIds.push(child);
            }
        });
    };

    $scope.setSetps();

    //validate seteps collection inserted new
    $scope.ok = function () {
        var lasts = [];
        var frts = [];
        angular.forEach($scope.First, function (first) {
            frts.push(first.idSeq);
        });
        angular.forEach($scope.Last, function (last) {
            lasts.push(last.idSeq);
        });
        if ($scope.validate()) {
            var result = {allStepsFirst: $scope.allStepsFirst, allStepsLast: $scope.allStepsLast,
                allStepsFirstIds: frts, allStepsLastIds: lasts ,
            };
            $mdDialog.hide(result);
        }
    };


    $scope.cancel = function () {
        $scope.formSubmitted = false;
        $mdDialog.cancel();
    };

}
