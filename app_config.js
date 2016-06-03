/* 
 * Config Module.
 */
var appWorkflow = angular.module("appWorkflow", ["agora.plus.customHeader", "ngMaterial", "ngRoute", "ng-mfb", "ngMessages", "pascalprecht.translate", "ngCookies", "ngFlash", "ui.bootstrap"]);
var DEFAULT_LANG = "fr";
var LANG_EN = "en";
var LANG_PT = "pt";
var LangSeleted = null;

appWorkflow.config(function ($routeProvider, $locationProvider, $mdThemingProvider, $mdIconProvider, $translateProvider) {
    $routeProvider
            .when(CONFIGURATION.ROUTES.HOME.PATH, {
                templateUrl: CONFIGURATION.ROUTES.HOME.TEMPLATE,
                controller: CONFIGURATION.ROUTES.HOME.CONTROLLER
            })
            .when(CONFIGURATION.ROUTES.NEW_WORKFLOW.PATH, {
                templateUrl: CONFIGURATION.ROUTES.NEW_WORKFLOW.TEMPLATE,
                controller: CONFIGURATION.ROUTES.NEW_WORKFLOW.CONTROLLER
            })
            .when(CONFIGURATION.ROUTES.EDIT_WORKFLOW.PATH, {
                templateUrl: CONFIGURATION.ROUTES.EDIT_WORKFLOW.TEMPLATE,
                controller: CONFIGURATION.ROUTES.EDIT_WORKFLOW.CONTROLLER
            }).
            when(CONFIGURATION.ROUTES.CLONE_WORKFLOW.PATH, {
                templateUrl: CONFIGURATION.ROUTES.CLONE_WORKFLOW.TEMPLATE,
                controller: CONFIGURATION.ROUTES.CLONE_WORKFLOW.CONTROLLER
            }).
            when(CONFIGURATION.ROUTES.DETAILS_WORKFLOW.PATH, {
                templateUrl: CONFIGURATION.ROUTES.DETAILS_WORKFLOW.TEMPLATE,
                controller: CONFIGURATION.ROUTES.DETAILS_WORKFLOW.CONTROLLER
            })
            .otherwise({
                redirectTo: CONFIGURATION.ROUTES.HOME.PATH
            });
    $mdIconProvider
            .icon("menu", CONFIGURATION.IMAGE_PATH + "assets/img/menu.svg", 24)
            .icon("star", CONFIGURATION.IMAGE_PATH + "assets/img/star.svg", 24)
            .icon("close", CONFIGURATION.IMAGE_PATH + "assets/img/close.svg", 24)
            .icon("removeWorkflow", CONFIGURATION.IMAGE_PATH + "assets/img/circle.svg", 24)
            .icon("remveStep", CONFIGURATION.IMAGE_PATH + "assets/img/delete.svg", 24)
            .icon("saveWorkflow", CONFIGURATION.IMAGE_PATH + "assets/img/save.svg", 24)
            .icon("addStep", CONFIGURATION.IMAGE_PATH + "assets/img/add.svg", 24);

    $mdThemingProvider.theme("primary")
            .primaryPalette("blue")
            .accentPalette("blue");

    $translateProvider.translations("en", languageEN);
    $translateProvider.translations("fr", languageFR);
    $translateProvider.translations("pt", languagePT);
    $translateProvider.registerAvailableLanguageKeys(["en", "pt", "fr"], {
        en_US: "en",
        en_UK: "en",
        fr_FR: "fr",
        pt_PT: "pt"
    });
    // add translation tables
    LangSeleted = LangSeleted !== null ? LangSeleted : DEFAULT_LANG;
    $translateProvider.preferredLanguage(LangSeleted);
    $translateProvider.fallbackLanguage(LangSeleted);
    $translateProvider.useSanitizeValueStrategy("escape");
    //$translateProvider.useCookieStorage(); //save in cookie last lanngua 
    // $translateProvider.useLocalStorage(); -> Save in cokie if necessary!// remember language



});


appWorkflow.constant("constant", {
    langsAvailable: ["fr", "en", "pt"],
    defaultLanguage: "fr",
    imgPath: CONFIGURATION.IMG_PATH
});

appWorkflow.config(["$httpProvider", function ($httpProvider) {
        $httpProvider.defaults.timeout = 5000;
}]);

// To increase angular performance
appWorkflow.config(["$compileProvider", function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);

//send headers by deflaut
appWorkflow.run(function ($http) {
    $http.defaults.headers.common.session_id = SESSION_ID != undefined ?SESSION_ID : "" ;
});