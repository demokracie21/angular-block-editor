angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/block.html',
    '<div class="row block-editor-block-edit" ng-show="block.editing"><div class="col-sm-12"><div ng-include="config.editTemplate"></div></div></div><div class="row block-editor-block-preview" ng-hide="block.editing"><div class="col-sm-10"><div ng-include="config.previewTemplate"></div></div><div class="col-sm-2 block-editor-block-toggles" ng-show="editEnabled != \'false\'"><a href="" ng-click="moveUp()" ng-class="{\'block-editor-block-toggle-disabled\': ! block.canMoveUp}"><i class="glyphicon glyphicon-arrow-up"></i></a> <a href="" ng-click="moveDown()" ng-class="{\'block-editor-block-toggle-disabled\': ! block.canMoveDown}"><i class="glyphicon glyphicon-arrow-down"></i></a> <a href="" ng-click="edit()"><i class="glyphicon glyphicon-pencil"></i></a> <a href="" class="text-danger" ng-click="remove()"><i class="glyphicon glyphicon-remove"></i></a></div></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/editor.html',
    '<block-editor-block block="block" ng-repeat="block in blocks" edit="{{ ! ngDisabled }}"></block-editor-block><div class="block-editor-toolbar"><div ng-hide="addingNewBlock"><a href="" ng-click="startAddingNewBlock()" ng-hide="ngDisabled">Add a new block</a></div><div ng-show="addingNewBlock"><a ng-repeat="blockType in blockTypes" href="" class="btn btn-default btn-sm" role="button" ng-click="addNew(blockType.type)"><i class="glyphicon glyphicon-plus"></i> &nbsp;{{ blockType.displayName }}</a> <a href="" ng-click="cancelAddingNewBlock()">Cancel</a></div></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/preview.html',
    '<div class="block-editor-preview"><d-block-editor-block block="block" edit="false" ng-repeat="block in blocks"></d-block-editor-block></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/edit/embed.html',
    '<div ng-form="form" class="form-horizontal"><div class="form-group"><label class="col-sm-2 control-label">Service</label><div class="col-sm-10"><select ng-model="block.content.provider" class="form-control" ng-options="e.provider as e.displayName for e in embeddables" required></select></div></div><div class="form-group"><label class="col-sm-2 control-label">URL</label><div class="col-sm-10"><input type="url" ng-model="block.content.url" class="form-control" required ng-pattern="e.regex"></div></div><div class="form-group"><div class="col-sm-offset-2 col-sm-10"><a href="" class="btn btn-primary btn-sm" ng-click="save()" ng-disabled="! isValid"><i class="glyphicon glyphicon-ok"></i> &nbsp;Done</a> <a href="" class="btn btn-link btn-sm" ng-click="cancel()"><i class="glyphicon glyphicon-remove"></i> &nbsp;Cancel</a></div></div></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/edit/link.html',
    '<div ng-form="form" class="form-horizontal"><div class="form-group"><label class="col-sm-2 control-label">Label</label><div class="col-sm-10"><input type="text" class="form-control" ng-model="block.content.label"></div></div><div class="form-group"><label class="col-sm-2 control-label">URL</label><div class="col-sm-10"><input type="url" class="form-control" ng-model="block.content.url" required></div></div><div class="form-group"><div class="col-sm-offset-2 col-sm-10"><a href="" class="btn btn-primary btn-sm" ng-click="save()" ng-disabled="form.$invalid"><i class="glyphicon glyphicon-ok"></i> &nbsp;Done</a> <a href="" class="btn btn-link btn-sm" ng-click="cancel()"><i class="glyphicon glyphicon-remove"></i> &nbsp;Cancel</a></div></div></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/edit/text.html',
    '<div ng-form="form" class="form-horizontal"><textarea ng-model="block.content.html" required></textarea><div class="form-group"><div class="col-sm-offset-2 col-sm-10"><a href="" class="btn btn-primary btn-sm" ng-click="save()" ng-disabled="form.$invalid"><i class="glyphicon glyphicon-ok"></i> &nbsp;Done</a> <a href="" class="btn btn-link btn-sm" ng-click="cancel()"><i class="glyphicon glyphicon-remove"></i> &nbsp;Cancel</a></div></div></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/preview/embed.html',
    '<ng-include ng-if="isValid" src="\'ng-block-editor/preview/embed/\' + block.content.provider + \'.html\'"></ng-include>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/preview/link.html',
    '<a href="{{ block.content.url }}" target="_blank">{{ block.content.label || block.content.url }}</a>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/preview/text.html',
    '<div ng-bind-html="trustedHtmlCode(block.content.html)"></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/preview/embed/soundcloud.html',
    '<iframe width="100%" height="450" scrolling="no" frameborder="no" src="{{ trustedConcat(\'https://w.soundcloud.com/player/?url=https://\', contentId, \'&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true\') }}"></iframe>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/preview/embed/youtube.html',
    '<iframe width="420" height="315" src="{{ trustedConcat(\'http://www.youtube.com/embed/\', contentId) }}"></iframe>');
}]);
