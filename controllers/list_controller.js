/* 
 * List Controller.
 */
appWorkflow.controller("workflowListController", function ($scope, $translate, $http, ApexService, $location, $mdDialog, Flash, $anchorScroll, $route) {
    /**
     * Workflow List
     */
    $scope.workflowList = [];
    $scope.imgPath = CONFIGURATION.IMAGE_PATH;
    $scope.langsAvailable = CONFIGURATION.LANGS;

    /**
     * 
     * @param {type} type
     * @returns {Array}
     */
    $scope.GetWorkflowToType = function (type) {
        var aux = [];
        for (i = 0; i < $scope.workflowList.length; i++)
        {
            if ($scope.workflowList[i].ID_TYPE_WORKFLOW == type) {
                aux.push($scope.workflowList[i]);
            }
        }
        return aux;
    };

    /**
     * Filter By workflow
     * @returns {Array}
     */
    $scope.GetUniqueType = function () {
        var origArr = $scope.workflowList != undefined ? $scope.workflowList : [];
        var newArr = [],
                origLen = 0,
                found, x, y;
        if ($scope.workflowList != undefined && $scope.workflowList.length > 0) {
            origLen = origArr.length
        }

        for (x = 0; x < origLen; x++) {
            found = undefined;
            for (y = 0; y < newArr.length; y++) {
                if (origArr[x].ID_TYPE_WORKFLOW === newArr[y].ID_TYPE_WORKFLOW) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                newArr.push(origArr[x]);
            }
        }
        return newArr;
    };

    /**
     *  @TODO - Resolve messages
     * @returns array off workflow List
     */
    $scope.getWorkflowList = function () {
        ApexService.getWorkflowList().then(function (list) {
            $scope.workflowList = list;
        }).finally(function () {
            $scope.disabledClicks = $scope.workflowList.length == 0;
        });
    };

    /**
     * Set Languagues
     */
    $scope.setLanguagues = function () {
        $scope.LangSeleted = LangSeleted;
        $translate.use(LangSeleted);
    };

    $scope.setLanguagues();
    $scope.getWorkflowList();

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

    $scope.addStep = function () {
        $location.path(CONFIGURATION.ROUTES.NEW_WORKFLOW.PATH);
    };

    //show error Message
    $scope.showMessage = function (msg, type) {
        var message = $translate.instant(msg);
        var id = Flash.create(type, message);
        $anchorScroll();//scroll to top!
    };


    $scope.deletePopUp = function (idWorflow) {

        var confirm = $mdDialog.confirm()
                .title($translate.instant("DELETE_TITLE"))
                .textContent($translate.instant("DELETE_WORKFLOW"))
                .ariaLabel("Alert Dialog Demo")
                .ok($translate.instant("BUTTON_REMOVE"))
                .cancel($translate.instant("BUTTON_CANCEL"));

        $mdDialog.show(confirm).then(function () {

            ApexService.deleteWorkflow(JSON.stringify({"ID_WORKFLOW": idWorflow})).then(function () {
                $scope.showMessage("WORKFLOW_DELETED_SUCCESS", "success");
            }).finally(function () {
                $location.path(CONFIGURATION.ROUTES.HOME.PATH);
                $route.reload();
            });
        }, function () {
            // cancel function
        });
    };
});
