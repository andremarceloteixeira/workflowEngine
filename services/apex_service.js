
var domain = CONFIGURATION.WEBSERVICE_PATH;
var GET_WORKFLOW_LIST_ACTION = CONFIGURATION.WEBSERVICE_CALLS.GET_WORKFLOW_LIST_ACTION;
var GET_WORKFLOW_EXISTS_ACTION = CONFIGURATION.WEBSERVICE_CALLS.GET_WORKFLOW_EXISTS_ACTION;
var GET_WORKFLOW_ACTIONS = CONFIGURATION.WEBSERVICE_CALLS.GET_WORKFLOW_ACTIONS;
var GET_WORKFLOW_IHM = CONFIGURATION.WEBSERVICE_CALLS.GET_WORKFLOW_IHM;
var LOAD_STEP_ACTION = CONFIGURATION.WEBSERVICE_CALLS.LOAD_STEP_ACTION;
var SAVE_STEP = CONFIGURATION.WEBSERVICE_CALLS.SAVE_STEP;
var GET_WORKFLOW_USERS = CONFIGURATION.WEBSERVICE_CALLS.GET_WORKFLOW_USERS;
var GET_WORKFLOW_TYPES = CONFIGURATION.WEBSERVICE_CALLS.GET_WORKFLOW_TYPES;
var GET_ALL_GROUPS = CONFIGURATION.WEBSERVICE_CALLS.GET_ALL_GROUPS;
var GET_WORKFLOW_DETAILS_BY_ID = CONFIGURATION.WEBSERVICE_CALLS.GET_WORKFLOW_DETAILS_BY_ID;
var DELETE_WORKFLOW = CONFIGURATION.WEBSERVICE_CALLS.DELETE;
var EDIT_WTF =  CONFIGURATION.WEBSERVICE_CALLS.EDIT_WTF;
var error = false;
appWorkflow.service("ApexService", function ($http, $location, Flash, $translate) {

    // In the Future.
    exceptionsErrorHandling = function (type, messages) {

        switch (type) {
            case 1 :
                return true;
                break;
            case  0 : // autentication failed
                error =  true;
                var id = Flash.create("danger", messages.MESSAGE);
            case -2 : // ERROR!
            case -1 : //No Data!
               // var id = Flash.create("info", messages.MESSAGE);
                return false;
                break;
            default :
                var id = Flash.create("danger", $translate.instant("ERROR_OCCURRED"));
                return false;
        }
    };
    
    

    return {
       
        getActores: function (params) {
            var data = [];
            return $http.get(domain + GET_WORKFLOW_USERS + params)
                    .then(function (result) {
                        if (exceptionsErrorHandling(parseInt(result.data.TYPE_RESULT), result.data.ERROR)) {
                            data = result.data.DATA.USERS_AND_GROUPS;
                        }

                        return data;
                    });
        },
        getAllStepAndWorflows: function () {
            var data = [];
            return $http.get(domain + GET_WORKFLOW_EXISTS_ACTION)
                    .then(function (result) {
                        if (exceptionsErrorHandling(parseInt(result.data.TYPE_RESULT), result.data.ERROR)) {
                            data = result.data.DATA.STEPS_AND_WORKFLOW_LIST;
                        }
                        return data;
                    });
        },
        getAllStepActions: function () {
            var data = [];
            return $http.get(domain + GET_WORKFLOW_ACTIONS)
                    .then(function (result) {
                        if (exceptionsErrorHandling(parseInt(result.data.TYPE_RESULT), result.data.ERROR)) {
                            data = result.data.DATA.STEP_ACTION;
                        }
                        return data;
                    });
        },
        getWorkflowTypes: function () {
            var data = [];
            return $http.get(domain + GET_WORKFLOW_TYPES)
                    .then(function (result) {
                        if (exceptionsErrorHandling(parseInt(result.data.TYPE_RESULT), result.data.ERROR)) {
                            data = result.data.DATA.WORKFLOW_TYPE;
                        }
                        return data;
                    });
        },
        getAllStepIHMS: function () {
            var data = [];
            return $http.get(domain + GET_WORKFLOW_IHM)
                    .then(function (result) {
                        if (exceptionsErrorHandling(parseInt(result.data.TYPE_RESULT), result.data.ERROR)) {
                            data = result.data.DATA.STEP_IHM;
                        }
                        return data;
                    });
        },
        getByDatabaseById: function (params) {
            var data = [];
            return $http.get(domain + LOAD_STEP_ACTION + params)
                    .then(function (result) {
                        if (exceptionsErrorHandling(parseInt(result.data.TYPE_RESULT), result.data.ERROR)) {
                            data = result.data.DATA.STEP_DETAILS;
                        }
                        return data;
                    });
        },
        
        deleteWorkflow: function (parameter) {
            return $http.post(domain + DELETE_WORKFLOW, parameter, {headers: {"Content-Type": "application/json"}}).then().
                    success(function (response) {
                        return true;
                    });
        },
        
        editWorkflowAndSteps: function (parameter) {
            return $http.post(domain + EDIT_WTF, parameter, {headers: {"Content-Type": "application/json"}}).then().
                    success(function (response) {
                        return true;
                    });
        },
        getByWorkflowId: function (params) {
            var data = [];
            return $http.get(domain + GET_WORKFLOW_DETAILS_BY_ID + params)
                    .then(function (result) {
                        if (exceptionsErrorHandling(parseInt(result.data.TYPE_RESULT), result.data.ERROR)) {
                            data = result.data.DATA.WORKFLOW_DETAILS;
                        }
                        return data;
                    });
        },
        getWorkflowUserAdmins: function (params) {
            var data = [];
            return $http.get(domain + GET_ALL_GROUPS)
                    .then(function (result) {
                        if (exceptionsErrorHandling(parseInt(result.data.TYPE_RESULT), result.data.ERROR)) {
                            data = result.data.DATA.GROUPS;
                        }
                        return data;
                    });
        },
        saveWorkflow: function (parameter) {
            return $http.post(domain + SAVE_STEP, parameter, {headers: {"Content-Type": "application/json"}}).then().
                    success(function (response) {
                        return true;
                    });
        },
        /**
         * Get all Steps Actions
         * @returns {undefined}
         */
        getWorkflowList: function () {
            var data = [];
            return $http.get(domain + GET_WORKFLOW_LIST_ACTION)
                    .then(function (result) {
                        if (exceptionsErrorHandling(parseInt(result.data.TYPE_RESULT), result.data.ERROR)) {
                            success = true;
                            data = result.data.DATA.WORKFLOW_LIST;
                        }
                        return data;
                    }).catch(function (response) {
                        success = false;
                        if (response.status == 500) {
                            //error 
                        }
                    });
        },

        /**
         * Get all existing workflow actions
         *
         */
        getExistingWorkflowActions: function() {

            var data = [];

            return $http.get(domain + GET_WORKFLOW_EXISTS_ACTION)
                    .then(function(result) {
                        if (exceptionsErrorHandling(parseInt(result.data.TYPE_RESULT), result.data.ERROR)) {
                            data = result.data.DATA.STEPS_AND_WORKFLOW_LIST;
                        }

                        return data;
                    });
        }
    };
});
