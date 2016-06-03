/**
 * get Assycronus object for autocomplete - Only Call
 * @param {type} param1
 * @param {type} param2
 */

function AddNewStepPopUpController($scope, $mdDialog, stepsList, $translate, $http, $q, ApexService, Flash, $translate) {

    $scope.steps = [];
    $scope.stepsCurrent = [];
    $scope.ck_selected = 1;
    $scope.selectedItem;
    $scope.selectedItemPrevious;
    $scope.searchText;
    $scope.NewStepName;
    $scope.workflowDesc;
    $scope.workfName;
    $translate.use(LangSeleted);
    $scope.stepsBD = [];
    $scope.workflowTypes = [];
    $scope.workflowAdmins = [];
    $scope.workflowType;
    $scope.workflowAdmin;
    $scope.formSubmitted = false;
    $scope.listDbFilled = false;
    $scope.listCurrentFilled = false;
    /**
     * Validate Result @TODO - Resolve messages
     * @param {type} type
     * @returns {Boolean}
     */
    $scope.validateResultSetpNamesWorkflowList = function (type) {
        switch (type) {
            case 1 :
                return true;
                break;
            case  0 :
            case -2 :
            case -1 :
                return false;
                break;
            default :
                return false;
        }
    };


    $scope.getWorkflowTypes = function () {
        ApexService.getWorkflowTypes().then(function (list) {
            angular.forEach(list, function (value) {
                var is_default = value.IS_DEFAULT == 1;
                var object = {id: value.ID_WF_TYPE, description: value.DESCRIPTION_WF_TYPE, is_default: is_default};
                $scope.workflowTypes.push(object);
                if (is_default) {
                    $scope.workflowType = object;
                }
            });
        });
    };

    $scope.getWorkflowAdmins = function () {
        var groups = [];
        ApexService.getWorkflowUserAdmins().then(function (list) {
            angular.forEach(list, function (value) {
                groups.push({id: value.ID_TARGET, name: value.NAME_TARGET, actor_type: value.ACTOR_TYPE});
            });
            $scope.workflowAdmins = groups;
        });
    };

    $scope.loadCurrentStepsCollection = function() {
        // If there are previous actions, populate array with current actions for this workflow
            if (!$scope.listCurrentFilled) {
                angular.forEach(stepsList, function (step) {
                    if (step.name.trim() != "") {
                        $scope.steps.push({idWorkflow: step.idWorkflow, WorkflowName: "current", idStep: step.id, StepName: step.name});
                        $scope.stepsCurrent.push({idWorkflow: step.idWorkflow, WorkflowName: "current", idStep: step.id, StepName: step.name});
                    }
                });
                $scope.listCurrentFilled = true;
            }
    };

    //loadSetpts CollectionByDatabase
    $scope.StepPosition = 1;

    $scope.loadCurrentStepsCollection();
    $scope.getWorkflowTypes();
    $scope.getWorkflowAdmins();

    //next search item
    $scope.querySearch = function (query, isPrevious) {
        
        return ApexService.getExistingWorkflowActions().then(function(list){

            // populate steps array with actions from the database
            if (!$scope.listDbFilled) {
                angular.forEach(list, function (value) {
                    $scope.steps.push({idWorkflow: value.ID_WORKFLOW, WorkflowName: value.NAME_WORKFLOW, idStep: value.ID_STEP, StepName: value.STEP_NAME});
                });
                $scope.listDbFilled = true;
            }
            
            if (isPrevious) {
                return query ? $scope.stepsCurrent.filter($scope.createFilterFor(query)) : [];
            } else {
                return query ? $scope.steps.filter($scope.createFilterFor(query)) : [];
            }
        });
    };

    /**
     *
     * Filter list by query
     *
     */ 
    $scope.createFilterFor = function (query) {
        return function filterFn(step) {
            //usage of toString to ensure that we have strings so that indexOf can be used
            var aux = step.StepName.toString().toLowerCase();
            return (aux.indexOf(query) != -1);
        };
    };


    //validate insert new step
    $scope.validate = function () {
        $scope.formSubmitted = false;
        //first time validation
        if ($scope.stepsCurrent.length == 0) {
            if ($scope.workflowName == undefined || $scope.workflowDescription == undefined || $scope.workflowAdmin == undefined || 
                        $scope.workflowType == undefined || $scope.NewStepName == undefined ) {
                     var message = $translate.instant("ERROR_SET_ALL_INPUTS");
                     var id = Flash.create("danger", message);

                     $scope.formSubmitted = true;
                return false;
            }
            $scope.workflowDesc = $scope.workflowDescription;
            $scope.workfName = $scope.workflowName;

        }
        if ($scope.StepPosition == 1) {
            //this validation and Arrays!
            if (($scope.StepPosition == 1 && ($scope.ck_selected == 2 || $scope.ck_selected == 3)
                    && $scope.selectedItem == undefined
                    || ($scope.ck_selected == 1 && $scope.NewStepName == undefined))) {
                return false;
            }
        } else {
            if ($scope.selectedItemPrevious == undefined) {
                return false;
            }
        }
        return true;
    };


    //validate seteps collection inserted new
    $scope.ok = function () {

        if ($scope.validate()) {
            var item = $scope.StepPosition == 1 ? $scope.selectedItem : $scope.selectedItemPrevious;
            var result = {Step: item, StepPosition: $scope.ck_selected, WorkflowDescription: $scope.workflowDesc,
                WorkflowName: $scope.workfName,
                selectedOption: $scope.ck_selected,
                workflowTypes: $scope.workflowTypes,
                workflowAdmins: $scope.workflowAdmins,
                workflowType: $scope.workflowType,
                workflowAdmin: $scope.workflowAdmin,
                postionGraph : $scope.StepPosition
            };
            if ($scope.StepPosition == 1 && $scope.ck_selected == 1) {
                result.Step = {idWorkflow: -2, WorkflowName: "", idStep: 0, StepName: $scope.NewStepName}
            }


            $mdDialog.hide(result);
        }
    };

    //cancel event
    $scope.cancel = function () {
        $scope.formSubmitted = false;
        if ($scope.stepsCurrent.length == 0) {
            $mdDialog.cancel();
            window.location.href = "#";
        } else {
            $mdDialog.cancel();
        }
    };

}
