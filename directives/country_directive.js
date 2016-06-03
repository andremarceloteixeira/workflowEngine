appWorkflow.directive("countryDirective", function () {
    return {
        restrict: "E",
        template: "<md-select md-container-class=\"custom-top\" class= \"margin-null\" ng-model=\"language\" style=\"font-size: 70%;\">\n\
                        <md-option ng-selected=\"LangSeleted == lang\" ? \"selected\" : \"\"  ng-click=\"changeLanguage(lang)\" ng-repeat=\"lang in langsAvailable\">\n\
                        \n\
                                <img ng-src=\"{{imgPath}}assets/img/{{lang}}.gif\" alt=\"{{lang}}\"/>\n\
                        <span>{{lang | translate}}</span>\n\
                       </md-option>\n\
                      </md-select>"
    };
});        