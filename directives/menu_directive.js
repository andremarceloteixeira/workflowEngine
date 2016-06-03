appWorkflow.directive("menuDirective", function() {
    return {
        restrict: "E",
        template : "<nav mfb-menu position=\"br\" effect=\"slidein-spring\" label=\"{{menuLabel | translate}}\" \n\
id=\"menu\" active-icon=\"removeWorkflow\" resting-icon=\"menu\" template-url=\"ng-mfb-menu-md.tpl.html\" \n\
toggling-method=\"click\"> <button template-url=\"ng-mfb-button-md.tpl.html\" id=\"add\" mfb-button mfb-button-close icon=\"addStep\" \n\
label=\"{{ addLabel | translate }}\" ng-click=\"AddNewStepDialog($event)\">\n\
</button><button template-url=\"ng-mfb-button-md.tpl.html\" id=\"remove\" \n\
mfb-button mfb-button-close icon=\"remveStep\" label=\"{{ removeLabel | translate }}\" \n\
ng-click=\"RemoveStep($event)\"></button><button template-url=\"ng-mfb-button-md.tpl.html\"\n\
 id=\"save\" mfb-button icon=\"saveWorkflow\"  label=\"{{ saveLabel | translate }}\" \n\
 ng-click=\"SaveWorkflow($event)\"></button><button template-url=\"ng-mfb-button-md.tpl.html\"\n\
 id=\"cancel\" mfb-button icon=\"close\" label=\"{{ cancelLabel | translate }}\" ng-click=\"CancelWorkflow($event)\"></button></nav> "
    };
});    