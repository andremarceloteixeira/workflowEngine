/* 
 * List Controller.
 */
appWorkflow.controller("detailsController", function ($scope, $translate, $http, ApexService, $location, $mdDialog, $routeParams) {
    /**
     * Workflow List
     */

    $scope.imgPath = CONFIGURATION.IMAGE_PATH;
    $scope.langsAvailable = CONFIGURATION.LANGS;
    $scope.workflowID = $routeParams.idWorkFlow;
    $scope.workflowName;
    $scope.workflowDescription;
    $scope.workflowAdmin;
    $scope.workflowType;
    $scope.network;
    $scope.StepList = [];
    $scope.CircuitList = [];
    $scope.status = {
        isFirstOpen: true,
        oneAtATime: true
    };

    /**
     * Set Languagues
     */
    $scope.setLanguagues = function () {
        $scope.LangSeleted = LangSeleted;
        $translate.use(LangSeleted);
    };

    $scope.setLanguagues();


    $scope.createNetwork = function () {
        var nodesNetwork = [];
        var edgesNetwork = [];
        var arrows = "to";
        angular.forEach($scope.StepList, function (step) {
            nodesNetwork.push({id: step.id, label: step.name, group: step.id, color: {background: step.color, border: "black", highlight: {border: "black"}}});
        });
        if (nodesNetwork.length > 0) {
            angular.forEach($scope.CircuitList, function (circuit, index) {
                edgesNetwork.push({from: circuit.stepParent, to: circuit.stepChild, arrows: arrows, length: 400});
            });
        }
        var nodes = new vis.DataSet(nodesNetwork);
        // create an array with edges
        var edges = new vis.DataSet(edgesNetwork);
        // create a network
        var container = document.getElementById("network");
        $scope.dataNetwork = {
            nodes: nodes,
            edges: edges
        };
        $scope.networkOptions = {
            nodes: {
                shape: "dot",
                size: 40,
                font: {
                    size: 20
                },
                borderWidth: 2,
                shadow: true
            },
            layout: {
                hierarchical: {
                    sortMethod: "hubsize"
                }
            },
            edges: {
                width: 4,
                shadow: true,
                arrows: {to: true}
            },
            interaction: {
                navigationButtons: true,
                keyboard: true
            }
        };
        $scope.network = new vis.Network(container, $scope.dataNetwork, $scope.networkOptions);
    };

    /**
     * Change Languague
     * @param {type} key
     * @returns {undefined}
     */
    $scope.changeLanguage = function (key) {
        $translate.use(key);
        LangSeleted = key;
        $scope.LangSeleted = key;
    };

    $scope.generateNodeColor = function () {
        return "#" + (Math.round(Math.random() * 0XFFFFFF)).toString(16);
    };

    $scope.StepSequenceNext = function () {
        var result = Math.max.apply(Math, $scope.StepList.map(function (o) {
            return o.id;
        }));
        result = parseInt(result) ? result : 0;
        return (result + 1);
    };

    // get Workflow Types 
    $scope.getWorkflowTypes = function (details) {
        var selected;
        ApexService.getWorkflowTypes().then(function (list) {
            angular.forEach(list, function (value) {
                if (details.ID_WF_TYPE == value.ID_WF_TYPE) {
                    selected = value.DESCRIPTION_WF_TYPE;
                }
            });
        }).finally(function () {
            $scope.workflowType = selected;
        });
    };

    $scope.getWorkflowAdmins = function (details) {
        var selected;
        ApexService.getWorkflowUserAdmins().then(function (list) {
            angular.forEach(list, function (value) {
                if (details.ID_USER_ADMINISTRATOR == value.ID_TARGET) {
                    selected = value.NAME_TARGET;
                }
            });
        }).finally(function () {
            $scope.workflowAdmin = selected;
        });
    };


    $scope.details = function () {
        var params = "/?idWorkflow=" + $routeParams.idWorkFlow;
        ApexService.getByWorkflowId(params).then(function (details) {
            $scope.workflowName = details.WORKFLOW_NAME;
            $scope.workflowDescription = details.WORKFLOW_DESCRIPTION;
            $scope.getWorkflowTypes(details);
            $scope.getWorkflowAdmins(details);
            angular.forEach(details.STEP_LIST, function (step) {
                var people = [];
                angular.forEach(step.ACTOR_LIST, function (actor) {
                    var userData = {
                        id: actor.ID_ACTOR,
                        description: actor.ACTOR_NAME,
                        _lowername: actor.ACTOR_NAME.toLowerCase(),
                        name: actor.ACTOR_NAME,
                        is_group: actor.ID_ACTOR_TYPE,
                        ihms: [],
                        actions: [],
                        exclude: actor.IS_EXCLUDE == 1, //exclude!
                        is_cc: actor.IS_CC == 1, // is cc
                        selected: true,
                    };

                    ApexService.getAllStepIHMS().then(function (list) {
                        angular.forEach(list, function (value) {
                            userData.ihms.push({id: value.ID_IHM, description: value.DESCRIPTION_IHM, selected: false});
                        });
                    }).finally(function () {
                        angular.forEach(userData.ihms, function (ihm, index) {
                            angular.forEach(actor.IHMS, function (ihmID) {
                                if (ihmID == ihm.id) {
                                    userData.ihms[index].selected = true;
                                }
                            });
                        });
                    });

                    ApexService.getAllStepActions().then(function (list) {
                        angular.forEach(list, function (value) {
                            userData.actions.push({id: value.ID_ACTION, description: value.DESCRIPTION_ACTION, selected: false});
                        });
                    }).finally(function () {
                        angular.forEach(userData.actions, function (action, index) {
                            angular.forEach(actor.ACTIONS, function (idaction) {
                                if (idaction == action.id) {
                                    userData.actions[index].selected = true;
                                }
                            });
                        });
                    });
                    people.push(userData);
                });

                var idWorkflow = details.ID_WORKFLOW;
                var idStep = step.ID_STEP;
                var nextSequence = $scope.StepSequenceNext();

                $scope.StepList.push({idWorkflow: idWorkflow, idStepBD: idStep, id: nextSequence,
                    name: step.STEP_NAME, description: step.STEP_DESCRIPTION, color: $scope.generateNodeColor(),
                    people: people, isDisabled: false
                });

                angular.forEach(details.CIRCUIT_LIST, function (circuit) {
                    if (circuit.ID_WF_STEP_PARENT == step.ID_STEP) {
                        circuit.ID_EXT_PARENT = nextSequence
                    }

                    if (circuit.ID_WF_STEP_CHILD == step.ID_STEP) {
                        circuit.ID_EXT_CHILD = nextSequence
                    }
                });
            });
            angular.forEach(details.CIRCUIT_LIST, function (circuit) {
                $scope.CircuitList.push({stepParent: circuit.ID_EXT_PARENT, stepChild: circuit.ID_EXT_CHILD});
            });

        }).finally(function () {
            $scope.createNetwork();
        });
    };
    $scope.details();
});



