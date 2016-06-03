/* 
 * Add new Step controller
 */
appWorkflow.controller("workflowFormController", function ($scope, $location, $mdDialog, $mdToast, $translate, $filter, $http,
        $q, $timeout, $interval, $log, ApexService, Flash, $anchorScroll, $routeParams, $document, $route) {
    $scope.langsAvailable = CONFIGURATION.LANGS;
    $scope.workflowDescription;
    $scope.workflowName;
    $scope.workflowTypes = [];
    $scope.workflowAdmins = [];
    $scope.errorMessage;
    $scope.LangSeleted = LangSeleted;
    $scope.network;
    $scope.dataNetwork = null;
    $scope.networkOptions;
    $scope.xNetwork = 0;
    $scope.yNetwork = 0;
    $scope.Actions = [];
    $scope.IHMs = [];
    $scope.accordian = 0;
    $scope.allUsers = [];
    $scope.GroupID = 0;
    $scope.simulateQuery = true;
    $scope.loadStep;
    $scope.workflowType;
    $scope.workflowAdmin;
    $scope.imgPath = CONFIGURATION.IMAGE_PATH;
    $scope.isCloneView = false;
    $scope.isNewView = false;
    $scope.isEditView = false;

    //view Type CLONE, EDIT, NEW

    //USERS LOAD GROUPS INFORMATION


    /**
     * 
     * @param {type} query
     * @returns {Function}
     */
    $scope.createFilterForUsersGroups = function (query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (item._lowername.indexOf(lowercaseQuery) != -1);
            ;
        };
    };
    //END USERS / GROUPS LOAD INFORMATION

    $scope.selectedLang = function () {
        $translate.use(LangSeleted);
    };

    /**
     * Get all Steps Actions
     * @returns {undefined}
     */
    $scope.getAllStepActions = function () {

        ApexService.getAllStepActions().then(function (list) {
            angular.forEach(list, function (value) {
                $scope.Actions.push({id: value.ID_ACTION, description: value.DESCRIPTION_ACTION, selected: false});
            });
        });
    };


    /**
     * Get all IHMs
     * @returns {undefined}
     */
    $scope.getAllStepIHMS = function () {
        ApexService.getAllStepIHMS().then(function (list) {
            angular.forEach(list, function (value) {
                $scope.IHMs.push({id: value.ID_IHM, description: value.DESCRIPTION_IHM, selected: false});
            });
        });
    };

    /**
     * Get Users by search and return filtered results
     * @returns {undefined}
     */
    $scope.getUsers = function (querySearchLike) {
        var params = "/?text=" + querySearchLike,
                allUsersAux = [];

        return ApexService.getActores(params).then(function (list) {
            angular.forEach(list, function (value) {
                var isGroupIcon = $scope.getActorType(value.ACTOR_TYPE);
                allUsersAux.push({id: value.ID_TARGET, description: value.NAME_TARGET,
                    _lowername: value.NAME_TARGET.toLowerCase(), name: value.NAME_TARGET,
                    image: isGroupIcon, logo: isGroupIcon, is_group: value.ACTOR_TYPE});
            });
            $scope.allUsers = querySearchLike ? allUsersAux.filter($scope.createFilterForUsersGroups(querySearchLike)) : [];
            return $scope.allUsers;
        });
    };

    $scope.getActorType = function (type) {
        return type == 2 ? "person" : "people"; // 2 - user, 5- Group 
    };


    $scope.searchTextChange = function (text) {
        $scope.searchTextPeopleChange = text;
    }

    $scope.selectedItemChange = function (item) {
        //return JSON.stringify(item);
        $scope.selectedItemPeopleChange = item;
    }


    //Accordian Operations in Masse
    $scope.IsVisible = false;
    $scope.ShowHide = function () {
        //If DIV is visible it will be hidden and vice versa.
        $scope.IsVisible = $scope.IsVisible ? false : true;
    }

    /**
     * Add new People  
     * @returns {undefined}
     */
    $scope.addNewPeople = function () {
        if ($scope.searchText) {
            var userGroup = $filter("filter")($scope.allUsers, {id: $scope.selectedItemPeopleChange.id,
                is_group: $scope.selectedItemPeopleChange.is_group}, true);
            var itemExists = $filter("filter")($scope.ActualStep.people, {id: $scope.selectedItemPeopleChange.id,
                is_group: $scope.selectedItemPeopleChange.is_group}, true);
            if (userGroup.length && itemExists.length == 0) {
                $scope.addNewPeopleActionsAndIhmsClear();
                userGroup[0].ihms = angular.copy($scope.IHMs);
                userGroup[0].actions = angular.copy($scope.Actions);
                userGroup[0].exclude = false;
                userGroup[0].is_cc = false;
                userGroup[0].selected = false;

                $scope.ActualStep.people.push(userGroup[0]);
            }
        }
        $scope.searchText = null;
    }

    $scope.addNewPeopleActionsAndIhmsClear = function () {
        angular.forEach($scope.Actions, function (action, index) {
            if (action.selected) {
                $scope.Actions[index].selected = false;
            }
        });
        angular.forEach($scope.IHMs, function (ihm, index) {
            if (ihm.selected) {
                $scope.IHMs[index].selected = false;
            }
        });
    };

    /**
     * Remove people Off the List
     * @param {type} person
     * @returns {undefined}
     */
    $scope.removePeopleList = function (person) {
        var index = $scope.ActualStep.people.indexOf(person);
        $scope.ActualStep.people.splice(index, 1);
    };

    /**
     * Remove people Off the List
     * @param {type} person
     * @returns {undefined}
     */
    $scope.exclueThisStep = function (person) {
        var index = $scope.ActualStep.people.indexOf(person);
        $scope.ActualStep.people[index].exclude = true;
        angular.forEach($scope.ActualStep.people[index].actions, function (action, indexAction) {
            $scope.ActualStep.people[index].actions[indexAction].selected = false;
        });
        angular.forEach($scope.ActualStep.people[index].ihms, function (ihms, indexIHms) {
            $scope.ActualStep.people[index].ihms[indexIHms].selected = false;
        });
    };

    /**
     * Remove people Off the List
     * @param {type} person
     * @returns {undefined}
     */
    $scope.includeThisStep = function (person) {
        var index = $scope.ActualStep.people.indexOf(person);
        $scope.ActualStep.people[index].exclude = false;
    };

    /**
     * Apply to actions and Selected Users
     * @returns {undefined}
     */
    $scope.applyActionsSelectedUsers = function () {
        angular.forEach($scope.ActualStep.people, function (people, objectIndex) {
            if (people.selected) {
                angular.forEach(people.actions, function (action, index) {
                    $scope.ActualStep.people[objectIndex].actions[index].selected = false;
                    angular.forEach($scope.getDefaultActionsIdsSelected(), function (idAction) {
                        if (action.id === idAction) {
                            $scope.ActualStep.people[objectIndex].actions[index].selected = true;
                        }
                    });
                });
            }
        });
    };

    /*[$separator$]*/
    $scope.applyIHMSSelectedUsers = function () {
        angular.forEach($scope.ActualStep.people, function (people, objectIndex) {
            if (people.selected) {
                angular.forEach(people.ihms, function (ihm, index) {
                    $scope.ActualStep.people[objectIndex].ihms[index].selected = false;
                    angular.forEach($scope.getDefaultIHMSIdsSelected(), function (idIHM) {
                        if (ihm.id === idIHM) {
                            $scope.ActualStep.people[objectIndex].ihms[index].selected = true;
                        }
                    });
                });
            }
        });
    };

    $scope.unSelectedActionsSelectedUsers = function () {
        angular.forEach($scope.ActualStep.people, function (people, objectIndex) {
            if (people.selected) {
                angular.forEach(people.ihms, function (ihm, index) {
                    $scope.ActualStep.people[objectIndex].actions[index].selected = false;
                    angular.forEach(people.actions, function (action, index) {
                        angular.forEach($scope.getDefaultActionsIdsSelected(), function (idAction) {
                            if (action.id === idAction && $scope.ActualStep.people[objectIndex].actions[index].selected) {
                                $scope.ActualStep.people[objectIndex].actions[index].selected = false;
                            }
                        });
                    });
                });
            }
        });
    };

    $scope.unSelectedIhmsSelectedUsers = function () {
        angular.forEach($scope.ActualStep.people, function (people, objectIndex) {
            if (people.selected) {
                angular.forEach(people.ihms, function (ihm, index) {
                    $scope.ActualStep.people[objectIndex].ihms[index].selected = false;
                    angular.forEach($scope.getDefaultIHMSIdsSelected(), function (idIHM) {
                        if (ihm.id === idIHM && $scope.ActualStep.people[objectIndex].ihms[index].selected) {
                            $scope.ActualStep.people[objectIndex].ihms[index].selected = false;
                        }
                    });
                });
            }
        });
    };

    $scope.getDefaultActionsIdsSelected = function () {
        var actionsSelectedIds = [];
        angular.forEach($scope.Actions, function (action) {
            if (action.selected) {
                actionsSelectedIds.push(action.id);
            }
        });
        return actionsSelectedIds;
    }

    $scope.getDefaultIHMSIdsSelected = function () {
        var ihmsSelectedIds = [];
        angular.forEach($scope.IHMs, function (ihm) {
            if (ihm.selected) {
                ihmsSelectedIds.push(ihm.id);
            }
        });
        return ihmsSelectedIds;
    }

    //Person Selected
    $scope.personSelected = function (item) {
        var idx = $scope.ActualStep.people.indexOf(item);
        if (idx > -1) {
            if (!$scope.ActualStep.people[idx].selected) {
                $scope.ActualStep.people[idx].selected = true;
            } else {
                $scope.ActualStep.people[idx].selected = false;
            }
        }
    };


    //loading information
    $scope.loadInformation = function () {
        $scope.selectedLang();
        $scope.filterSelected = true;
        $scope.getAllStepActions();
        $scope.getAllStepIHMS();
        //setp List current and actual
        $scope.StepList = [];
        // Circuit List
        $scope.CircuitList = [];
    };

    $scope.loadInformation();

    //Inicialize the steps selected
    $scope.IdSelectedSteps = 0;//1;

    //Current Setp
    $scope.ActualStep = $scope.StepList[0];

    // Actual Setp Load
    $scope.ActualStepFunc = function () {
        var idSelectedStep = $scope.IdSelectedSteps;
        angular.forEach($scope.StepList, function (step) {
            if (step.id === idSelectedStep) {
                $scope.ActualStep = step;
            }
        });
    };

    // Go to Next Step
    $scope.NextSteps = function () {

        var idSelectedStep = $scope.IdSelectedSteps;
        var resultNextSteps = [];
        var childs = [];

        // find in CircuitList steps childs
        angular.forEach($scope.CircuitList, function (circuit) {
            if (circuit.stepParent === idSelectedStep) {
                childs.push(circuit.stepChild);
            }
        });
        // find in StepList steps objects
        angular.forEach($scope.StepList, function (step) {
            angular.forEach(childs, function (child) {
                if (step.id === child) {
                    resultNextSteps.push(step);
                }
            });
        });

        // return next stpes finded
        return resultNextSteps;
    };

    //Previous Sets Go to Previous Setp
    $scope.PreviousSteps = function () {
        var idSelectedStep = $scope.IdSelectedSteps;
        var resultPrviousSteps = [];
        var parents = [];
        // find in CircuitList steps Parents
        angular.forEach($scope.CircuitList, function (circuit) {
            if (circuit.stepChild === idSelectedStep) {
                parents.push(circuit.stepParent);
            }
        });

        // find in StepList steps objects
        angular.forEach($scope.StepList, function (step) {
            angular.forEach(parents, function (parent) {
                if (step.id === parent) {
                    resultPrviousSteps.push(step);
                }
            });
        });

        // return previous stpes finded
        return resultPrviousSteps;

    };


    //Change Selected Index
    $scope.ChangeSelectedIndex = function (idStep) {
        $scope.IdSelectedSteps = idStep;
        $scope.ActualStepFunc();
        $scope.changeSelectedNodeNetwork(idStep);
    };
    //call actual Setp Funcion
    $scope.ActualStepFunc();


    //Add New Step Function New Setp
    function AddNewStep(stepName, isDisabled) {
        var idSequence = $scope.StepSequenceNext();
        var disabled = isDisabled == 2 ? true : false; //Load new Step, not change data.
        $scope.StepList.push({idWorkflow: -1, idStepBD: -1, id: idSequence,
            name: stepName, description: "", color: $scope.generateNodeColor(),
            people: [], isDisabled: disabled});

        if (idSequence > 1 && !$scope.existCircuitInList($scope.IdSelectedSteps, idSequence)) {
            $scope.CircuitList.push({stepParent: $scope.IdSelectedSteps, stepChild: idSequence});
        } else {
            $scope.ActualStep = $scope.StepList[0];
        }
        $scope.ChangeSelectedIndex(idSequence);
    }
    ;
    /*[$separator$]*/
    //add net Setp From DB -  VER DEVE TER UM ERRO!!!!
    function AddNewStepFromDB(step) {

        var idSequence = $scope.StepSequenceNext();
        var disabled = $scope.optionSelected == 2 ? true : false; // load new step
        var isClone = $scope.optionSelected == 3;

        //when option is clone idStepBD and idWorkflow is -1
        if (isClone) {
            step.idStepBD = -1;
            step.idWorkflow = -1;
        }
        step.id = idSequence;
        step.isDisabled = disabled;
        $scope.StepList.push(step);

        if (idSequence > 1 && !$scope.existCircuitInList($scope.IdSelectedSteps, idSequence)) {
            $scope.CircuitList.push({stepParent: $scope.IdSelectedSteps, stepChild: idSequence});
        } else {
            $scope.ActualStep = $scope.StepList[0];

        }
        $scope.ChangeSelectedIndex(idSequence);
        $scope.createNetwork(); //call again
    }
    ;

    //Exists object in circuit list
    $scope.existCircuitInList = function (parentId, childId) {
        var found = $filter("filter")($scope.CircuitList, {stepParent: parentId, stepChild: childId}, true);
        if (found.length) {
            return found;
        } else {
            return false;
        }
    };


    /**
     * Generate Node Color
     * @returns {String}
     */
    $scope.generateNodeColor = function () {
        return "#" + (Math.round(Math.random() * 0XFFFFFF)).toString(16);
    };

    //Create Diagram network
    $scope.createNetwork = function (id) {
        var elementID = id == undefined ? "network" : id;
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
        var container = document.getElementById(elementID);
        $scope.dataNetwork = {
            nodes: nodes,
            edges: edges
        };




        $scope.networkOptions = {
            nodes: {
                shape: "dot",
                size: id == undefined ? 40 : 20,
                font: {
                    size: id == undefined ? 20 : 10,
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
                navigationButtons: id == undefined,
                keyboard: {
                    enabled: true,
                    bindToWindow: false
                }
            }
        };
        $scope.network = new vis.Network(container, $scope.dataNetwork, $scope.networkOptions);
    };

    // remove network Node
    $scope.removeNetworkNode = function (id) {
        var container = document.getElementById("network");
        //$scope.dataNetwork.nodes.splice(id, 1);
        delete $scope.dataNetwork.nodes._data[id];
        $scope.network = new vis.Network(container, $scope.dataNetwork, $scope.networkOptions);
    };


    //set color current Setp
    $scope.changeSelectedNodeNetwork = function (idSetp) {
        var container = document.getElementById("network");
        if ($scope.dataNetwork !== null) {
            angular.forEach($scope.dataNetwork.nodes._data, function (node) {
                if ($scope.idSetp == node.id) {
                    $scope.dataNetwork.nodes._data[node.id].color = "lime";
                    $scope.network = new vis.Network(container, $scope.dataNetwork, $scope.networkOptions);
                }
            });
        }
    };

    //change NetWorkSetpName
    $scope.changeNetworkSetpName = function () {
        var container = document.getElementById("network");
        angular.forEach($scope.dataNetwork.nodes._data, function (node) {
            if ($scope.ActualStep.id == node.id) {
                $scope.dataNetwork.nodes._data[node.id].label = $scope.ActualStep.name
            }
        });
        $scope.network = new vis.Network(container, $scope.dataNetwork, $scope.networkOptions);
    };

    //new ID next Setp
    $scope.StepSequenceNext = function () {
        var result = Math.max.apply(Math, $scope.StepList.map(function (o) {
            return o.id;
        }));
        result = parseInt(result) ? result : 0;
        return (result + 1);
    };


    /**
     * Validate if exists actions or ihms selected
     * @returns {undefined}
     */
    $scope.getPeople = function () {
        var peopleSelected = []; // one action selected
        angular.forEach($scope.ActualStep.people, function (people, objectIndex) {
            peopleSelected.push(people);
        });
        return peopleSelected;
    }

    /**
     * Validate Selected 
     * @returns {Boolean}
     */
    $scope.peopleSelectedValidateIhmsOrActionsSelected = function (people) {
        var oneOrMoreSelectedIms = 0;
        var oneOrMoreSelectedActions = 0;
        var list = people == undefined ? $scope.getPeople() : people;
        angular.forEach(list, function (people, objectIndex) {
            angular.forEach(people.ihms, function (ihm, index) {
                if (ihm.selected) {
                    oneOrMoreSelectedIms++;
                }
                angular.forEach(people.actions, function (action, index) {
                    if (action.selected) {
                        oneOrMoreSelectedActions++;
                    }
                });
            });
        });
        return oneOrMoreSelectedIms > 0;
    };

    $scope.AddNewStepDialog = function (ev) {

        $scope.formSubmitted = false;

        if ($scope.StepList.length > 0) {
            //validate form
            if ($scope.workflowName == undefined || $scope.workflowDescription == undefined
                    || $scope.ActualStep.name == undefined || ($scope.ActualStep.description == undefined || $scope.ActualStep.description == "")) {
                $scope.formSubmitted = true;
                $scope.showMessage("ERROR_SET_ALL_INPUTS", "danger");
                return false;
            } else if (!$scope.peopleSelectedValidateIhmsOrActionsSelected()) {
                $scope.showMessage("ERROR_ONE_OR_MORE_IHMS", "danger");
                return false;
            } else if (!$scope.validateUsersIsCC($scope.ActualStep.people)) {
                $scope.showMessage("ERROR_IS_NECESSARY_USER_WITHOUT_CC", "danger");
                return false;
            }
        }
        $mdDialog.show({
            controller: AddNewStepPopUpController,
            templateUrl: CONFIGURATION.ROUTES.DIALOG.TEMPLATE,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            locals: {
                stepsList: $scope.StepList,
            }
        })
                .then(function (param) {
                    // ok function
                    // if is first element
                    if ($scope.StepList.length == 0) {
                        $scope.workflowDescription = param.WorkflowDescription;
                        $scope.workflowName = param.WorkflowName;
                        $scope.workflowTypes = param.workflowTypes;
                        $scope.workflowType = param.workflowType;
                        $scope.workflowAdmins = param.workflowAdmins;
                        $scope.workflowAdmin = param.workflowAdmin;
                    }


                    //CHANGE THIS LOGIC!!!!!!
                    $scope.optionSelected = param.selectedOption;
                    //SELECT NEW SET
                    if (param.Step.idWorkflow == -1) // step exist in current workflow
                    {

                        if (!$scope.existCircuitInList($scope.IdSelectedSteps, param.Step.idStep)) {
                            // put step befor
                            $scope.CircuitList.push({stepParent: $scope.IdSelectedSteps, stepChild: param.Step.idStep});
                            $scope.ChangeSelectedIndex(param.Step.idStep);
                        }

                    } else if (param.Step.idWorkflow > 0) // step exist in BD
                    {
                        if (param.StepPosition != 1) {
                            // put step befor
                            $scope.loadByDatabaseById(param);
                        } else {
                            // error: do not create new step befor another step because new step do not parent
                        }
                    } else // create new step
                    {
                        if (param.StepPosition == 1) {
                            // put step before
                            AddNewStep(param.Step.StepName, $scope.optionSelected);
                        } else {
                            // error: do not create new step befor another step because new step do not parent
                        }
                    }
                    //clone from database 
                    if ($scope.optionSelected == 3) {
                        //code for clone...
                    }
                    $scope.createNetwork();
                }, function () {
                    // cancel function
                    console.log("cancel");
                });

    };


    /*[$separator$]*/
    /**
     * Load Datase by ID
     * @param {type} idWorkFlow
     * @returns {undefined}
     */
    $scope.loadByDatabaseById = function (param) {
        // @TODO: get step info in BD with "param.Step.idStep"
        var infoBD = [];
        var params = "/?idWorkflow=" + param.Step.idWorkflow + "&idStep=" + param.Step.idStep;
        ApexService.getByDatabaseById(params).then(function (details) {
            $scope.loadStep = $scope.getWorkFlowObject(details);
        }).finally(function () {
            AddNewStepFromDB($scope.loadStep);
        });
    };

    $scope.getWorkFlowObject = function (workflow) {

        var infoBD = {
            idWorkflow: workflow.ID_WORKFLOW,
            id: 0,
            idStepBD: workflow.ID_STEP,
            name: workflow.STEP_NAME,
            description: workflow.STEP_DESCRIPTION,
            color: $scope.generateNodeColor(),
            people: [],
            isDisabled: false
        };
        angular.forEach(workflow.ACTOR_LIST, function (target) {
            var userData = {
                id: target.ID_ACTOR,
                description: target.ACTOR_NAME,
                _lowername: target.ACTOR_NAME.toLowerCase(),
                name: target.ACTOR_NAME,
                image: $scope.getActorType(target.ID_ACTOR_TYPE),
                logo: $scope.getActorType(target.ID_ACTOR_TYPE),
                is_group: target.ID_ACTOR_TYPE,
                ihms: angular.copy($scope.IHMs),
                actions: angular.copy($scope.Actions),
                exclude: target.IS_EXCLUDE == 1, //exclude!
                is_cc: target.IS_CC == 1, // is cc
                selected: true,
            };
            angular.forEach(userData.ihms, function (ihm, index) {
                angular.forEach(target.IHMS, function (ihmID) {
                    if (ihmID == ihm.id) {
                        userData.ihms[index].selected = true;
                    }

                });
            });
            angular.forEach(userData.actions, function (action, index) {
                angular.forEach(target.ACTIONS, function (actionId) {
                    if (actionId == action.id) {
                        userData.actions[index].selected = true;
                    }

                });
            });
            infoBD.people.push(userData);
        });
        return infoBD;
    };


    $scope.cloneView = function (param) {
        $scope.loadCloneEditInformation();
    };

    $scope.editView = function (param) {
        var params = "/?idWorkflow=" + $routeParams.idType;
        ApexService.getByWorkflowId(params).finally(function (details) {
            $scope.loadCloneEditInformation(details);
        });
    };

    // get Workflow Types 
    $scope.getWorkflowTypes = function (details) {
        var types = [];
        var selected;
        ApexService.getWorkflowTypes().then(function (list) {
            angular.forEach(list, function (value) {
                var is_default = value.IS_DEFAULT == 1;
                var object = {id: value.ID_WF_TYPE, description: value.DESCRIPTION_WF_TYPE, is_default: is_default};
                types.push(object);

                if (details.ID_WF_TYPE == value.ID_WF_TYPE) {
                    selected = object;
                }
            });
            $scope.workflowTypes = types;
        }).finally(function () {
            $scope.workflowType = selected;
        });
    };

    $scope.getWorkflowAdmins = function (details) {
        var groups = [];
        var selected;
        ApexService.getWorkflowUserAdmins().then(function (list) {
            angular.forEach(list, function (value) {
                var item = {id: value.ID_TARGET, name: value.NAME_TARGET, actor_type: value.ACTOR_TYPE};
                groups.push(item);
                if (details.ID_USER_ADMINISTRATOR == value.ID_TARGET) {
                    selected = item;
                }
            });
            $scope.workflowAdmins = groups;
        }).finally(function () {
            $scope.workflowAdmin = selected;
        });
    };

    $scope.setCloneEditData = function () {
        var params = "/?idWorkflow=" + $routeParams.idType;
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
                        image: $scope.getActorType(actor.ID_ACTOR_TYPE),
                        logo: $scope.getActorType(actor.ID_ACTOR_TYPE),
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

                var nextSequence = $scope.StepSequenceNext();


                var idWorkflow = $scope.isEditView ? details.ID_WORKFLOW : -1;
                var idStep = $scope.isEditView ? step.ID_STEP : -1;


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
                $scope.CircuitList.push({stepParent: circuit.ID_EXT_PARENT, stepChild: circuit.ID_EXT_CHILD,
                    inout_parent: circuit.INOUT_PARENT, inout_child: circuit.INOUT_CHILD, 
                    wf_step_parent: circuit.ID_WF_STEP_PARENT , wf_step_child: circuit.ID_WF_STEP_CHILD});
            });
           
            $scope.IdSelectedSteps = 1;
            $scope.ActualStep = $scope.StepList[0];
            $scope.createNetwork();
        }).finally(function () {
        });
    };


    $scope.loadCloneEditInformation = function () {

        $scope.CircuitList = [];
        $scope.StepList = [];
        //WORKFLOW DATA!
        $scope.setCloneEditData();
    };



    // VIEWS
    if ($routeParams.type == "clone") {
        $scope.isCloneView = true;
        $scope.cloneView($routeParams.idType);
    } else if ($routeParams.type == "edit") {
        $scope.isEditView = true;
        $scope.editView($routeParams.idType);
    } else {
        $scope.isNewView = true;
        $scope.AddNewStepDialog(null);
    }



    //show error Message
    $scope.showMessage = function (msg, type) {
        var message = $translate.instant(msg);
        var id = Flash.create(type, message);
        $anchorScroll();//scroll to top!
    };

    /**
     * Validate Selected 
     * @returns {Boolean}
     */
    $scope.validateUsersIsCC = function (people) {
        var notIsCC = 0;
        var list = people == undefined ? $scope.getPeople() : people;
        angular.forEach(list, function (people) {
            if (!people.is_cc) {
                notIsCC++;
            }
        });
        return notIsCC > 0;
    };


    /**
     * And Validate in the Save workflow
     * @returns {undefined}
     */
    $scope.SaveWorkflow = function () {
        var validateErrorMessage = false,
                message = "",
                peopleSelected = [],
                saveObject,
                error = false;
        $scope.formSubmitted = false;

        angular.forEach($scope.StepList, function (step) {
            if (step.name !== "" && step.description !== "") {
                if (!$scope.peopleSelectedValidateIhmsOrActionsSelected(step.people)) {
                    validateErrorMessage = "ERROR_ONE_OR_MORE_IHMS";
                } else if (!$scope.validateUsersIsCC(step.people)) {
                    validateErrorMessage = "ERROR_IS_NECESSARY_USER_WITHOUT_CC";
                }
            } else {
                validateErrorMessage = "ERROR_SET_ALL_INPUTS";
                $scope.formSubmitted = true;
            }
        });
        //more > 2
        if ($scope.StepList.length == 1) {
            validateErrorMessage = "ERROR_ADD_STEPS_TO_LIST";
        }
        if (validateErrorMessage) {
            $scope.showMessage(validateErrorMessage, "danger"); // warning , info ,  success , danger
        } else {

            //Open New PopUp To Select.
            $scope.identifyStep();
        }
        return false;
    };



    /**
     *  Identify Step
     * @param {type} ev
     * @returns {undefined}
     */
    $scope.identifyStep = function (ev) {
        $mdDialog.show({
            controller: IdentifyStepPopUpController,
            templateUrl: CONFIGURATION.ROUTES.DIALOG_IDENTIFY.TEMPLATE,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            locals: {
                stepsList: $scope.StepList,
                CircuitList: $scope.CircuitList,
                viewType: $scope.isCloneView || $scope.isEditView
            },
            onComplete: function () {
                $scope.createNetwork("network-pop");
            }
        }).then(function (param) {
            // ok function

            saveObject = $scope.saveObject(param);
            $scope.saveCallWorkflow(saveObject);
        }, function () {
            // cancel function
            console.log("cancel");
        });
    };

    /**
     * Save Call Workflow
     * @returns {undefined}
     */
    $scope.saveCallWorkflow = function (saveObject) {
        var parameter = JSON.stringify(saveObject);
        if (saveObject.ID_WORKFLOW > 0 && $scope.isEditView) {
            var response = ApexService.editWorkflowAndSteps(parameter);
        } else {
            var response = ApexService.saveWorkflow(parameter);
        }
        if (response) {
            $scope.showMessage("WORKFLOW_SAVED_SUCCESS", "success");
            $location.path(CONFIGURATION.ROUTES.HOME.PATH);
            $route.reload();

        }
    };


    $scope.getInOutParent = function (stepId, param, circuit) {
        return param.allStepsFirstIds.indexOf(circuit.stepParent) != -1;
    };

    $scope.getInOutChild = function (stepId, param, circuit) {

        return param.allStepsLastIds.indexOf(circuit.stepChild) != -1;

    };

    $scope.saveObject = function (param) {
        var object = {};
        var id = 0;
        object.ID_WORKFLOW = $scope.isEditView ? parseInt($routeParams.idType) : id; // new and EDIT and CLONE
        object.WORKFLOW_NAME = $scope.workflowName;
        object.WORKFLOW_DESCRIPTION = $scope.workflowDescription;
        object.ID_USER_ADMINISTRATOR = $scope.workflowAdmin.id;

        object.ID_WF_TYPE = $scope.workflowType.id;
        object.ID_WORKFLOW_PARENT = "";
        object.STEP_LIST = [];
        object.CIRCUIT_LIST = [];


        console.log(param.allStepsFirstIds);
        console.log(param.allStepsLastIds);
        
        
        
        angular.forEach($scope.CircuitList, function (circuit) {

            object.CIRCUIT_LIST.push({
                ID_EXT_PARENT: circuit.stepParent,
                ID_EXT_CHILD: circuit.stepChild,
                ID_WF_STEP_PARENT: $scope.isEditView ? circuit.wf_step_parent : 0,
                ID_WF_STEP_CHILD: $scope.isEditView ?  circuit.wf_step_child : 0,
                INOUT_PARENT: $scope.getInOutParent(circuit.stepParent, param, circuit) ? 1 : 0 ,
                INOUT_CHILD: $scope.getInOutChild(circuit.stepChild, param, circuit) ? 1 : 0

            });
        });
        angular.forEach($scope.StepList, function (step) {
            var stepItem = {};
            var actorList = [];
            stepItem.ID_EXT = step.id;
            stepItem.ID_STEP = step.idStepBD;
            stepItem.ID_WORKFLOW = step.idWorkflow;
            stepItem.STEP_DESCRIPTION = step.description;
            stepItem.STEP_NAME = step.name;
            angular.forEach(step.people, function (actor) {
                var ihms = [];
                var actions = [];
                angular.forEach(actor.actions, function (action) {
                    if (action.selected) {
                        actions.push(action.id);
                    }
                });
                angular.forEach(actor.ihms, function (ihm) {
                    if (ihm.selected) {
                        ihms.push(ihm.id);
                    }
                });
                //@TODO is CC
                var exclude = actor.exclude ? 1 : 0;
                var is_cc = actor.is_cc ? 1 : 0;
                actorList.push({ID_ACTOR: actor.id, ACTOR_NAME: actor.name, ID_ACTOR_TYPE: actor.is_group,
                    IS_EXCLUDE: exclude, IS_CC: is_cc, ACTIONS: actions, IHMS: ihms});
            });
            stepItem.ACTOR_LIST = actorList;
            object.STEP_LIST.push(stepItem);
        });
        return object;
    };

    //Remove Setp
    $scope.RemoveStep = function (ev) {
        var currentStep = $scope.IdSelectedSteps;
        var isParent = false;
        var indexCircuit = [];
        var indexStep = [];
        angular.forEach($scope.CircuitList, function (circuit) {
            if (circuit.stepParent == currentStep)
                isParent = true;
            if (circuit.stepChild == currentStep) {
                indexCircuit.push($scope.CircuitList.indexOf(circuit));
                angular.forEach($scope.StepList, function (step) {
                    if (step.id == currentStep)
                        indexStep.push($scope.StepList.indexOf(step));
                });
            }
        });
        if (isParent || indexCircuit.length == 0) {
            // send message alert do not remeve this step
            $scope.showAlert(ev, $translate.instant("SUPPRESSION_TITLE"), $translate.instant("SUPPRESSION"));
            return;
        }

        var sendCurrentStep = $scope.CircuitList[indexCircuit[0]].stepParent;
        // remove step anda update ActualStep
        angular.forEach(indexCircuit, function (index) {
            $scope.CircuitList.splice(index, 1);
        });
        angular.forEach(indexStep, function (index) {
            $scope.StepList.splice(index, 1);
            $scope.removeNetworkNode(index);
        });
        $scope.ChangeSelectedIndex(sendCurrentStep);
        $scope.showAlert(ev, $translate.instant("SUPPRESSION_TITLE"), $translate.instant("SUPPRESSION_COMPLETE"));
        $scope.createNetwork();
    };

    /*[$separator$]*/
    //cancel workflow
    $scope.CancelWorkflow = function (ev) {
        var confirm = $mdDialog.confirm()
                .title($translate.instant("SUPPRESSION_TITLE"))
                .textContent($translate.instant("SAVED"))
                .ariaLabel("Alert Dialog Demo")
                .targetEvent(ev)
                .ok($translate.instant("BUTTON_INSERT"))
                .cancel($translate.instant("BUTTON_CANCEL"));
        $mdDialog.show(confirm).then(function () {
            // ok function
            $location.path("#/");
        }, function () {
            // cancel function
        });
    };

    //show dialog demo
    $scope.showAlert = function (ev, title, text) {
        $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.querySelector(".StepPopupContainer")))
                .clickOutsideToClose(true)
                .title(title)
                .textContent(text)
                .ariaLabel("Alert Dialog Demo")
                .ok($translate.instant("BUTTON_INSERT"))
                .targetEvent(ev)
                );
    };

    //change country
    $scope.changeLanguage = function (key) {
        $translate.use(key);
        LangSeleted = key;
        $scope.LangSeleted = key;
    };

    $scope.selectLanguage = function (key) {
        $translate.use(key);
        LangSeleted = key;
        $scope.LangSeleted = key;
    };

    $scope.langSelected = function (lang) {
        return LangSeleted == lang ? "selected" : "";
    };

    $scope.buildMenu = function () {
        $scope.addLabel = "MENU_ADD_NEW_ETAP"
        $scope.removeLabel = "MENU_DELETE_ETAP";
        $scope.saveLabel = "MENU_SAVE_WORKFLOW";
        $scope.cancelLabel = "MENU_CANCEL_WORKFLOW";
        $scope.menuLabel = "MENUCLOSE";
    };
    $scope.buildMenu();
});
