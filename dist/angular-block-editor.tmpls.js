angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/block.html',
    '<div class="row be-block-edit" ng-show="block.editing"><div class="col-sm-12"><div ng-include="config.editTemplate"></div></div></div><div class="row be-block-preview" ng-hide="block.editing"><div class="col-sm-1" ng-show="$editor.dragAndDropEnabled"><i class="glyphicon glyphicon-menu-hamburger" sv-handle></i></div><div class="col-sm-9"><div ng-include="config.previewTemplate"></div></div><div class="be-block-toggles" ng-class="{\'col-sm-3\': ! $editor.dragAndDropEnabled, \'col-sm-2\': $editor.dragAndDropEnabled}" role="group" ng-show="editEnabled != \'false\'"><div class="btn-group"><a class="btn btn-default btn-xs" ng-if="! $editor.dragAndDropEnabled" href="" ng-click="moveUp()" ng-class="{\'be-block-toggle-disabled\': ! block.canMoveUp}"><i class="glyphicon glyphicon-arrow-up"></i></a> <a class="btn btn-default btn-xs" ng-if="! $editor.dragAndDropEnabled" href="" ng-click="moveDown()" ng-class="{\'be-block-toggle-disabled\': ! block.canMoveDown}"><i class="glyphicon glyphicon-arrow-down"></i></a> <a class="btn btn-default btn-xs" href="" ng-click="edit()"><i class="glyphicon glyphicon-pencil"></i></a> <a class="btn btn-danger btn-xs" href="" class="text-danger" ng-click="remove()"><i class="glyphicon glyphicon-remove"></i></a></div></div></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/editor.html',
    '<div sv-root sv-part="blocks"><be-block block="block" ng-repeat="block in blocks" edit="{{ ! ngDisabled }}" sv-element></be-block><div class="be-toolbar"><div ng-hide="addingNewBlock"><a href="" class="btn btn-default" ng-click="startAddingNewBlock()" ng-hide="ngDisabled">Add a new block</a></div><div ng-show="addingNewBlock"><a ng-repeat="blockType in ::blockTypes" href="" class="btn btn-default btn-sm" role="button" ng-click="addNew(blockType.type)"><i ng-class="::blockType.icon" ng-show="::blockType.icon"></i> &nbsp;{{ ::blockType.displayName }}</a> <a href="" ng-click="cancelAddingNewBlock()">Cancel</a></div></div></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/preview/embed.html',
    '<ng-include ng-if="data.isValid" src="\'ng-block-editor/preview/embed/\' + block.content.provider + \'.html\'"></ng-include>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/preview/link.html',
    '<a href="{{ block.content.url }}" target="_blank">{{ block.content.label || block.content.url }}</a>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/preview/text.html',
    '<div ng-bind-html="block.content.html"></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/edit/embed.html',
    '<div ng-form="form" class="form-horizontal"><span>Supported services: <strong ng-repeat="e in embeddables">{{ e.displayName }}<span ng-show="! $last">,&nbsp;</span></strong></span><div class="form-group"><label class="col-sm-2 control-label">URL</label><div class="col-sm-10"><input type="url" ng-model="data.url" class="form-control" required> <input type="hidden" ng-model="block.content.url" required><p class="help-block" ng-show="block.content.url && ! data.isValid">Could not find any service matching provided URL.</p></div></div><div class="form-group"><div class="col-sm-offset-2 col-sm-10"><a href="" class="btn btn-primary btn-sm" ng-click="save()" ng-disabled="! data.isValid"><i class="glyphicon glyphicon-ok"></i> &nbsp;Done</a> <a href="" class="btn btn-link btn-sm" ng-click="cancel()"><i class="glyphicon glyphicon-remove"></i> &nbsp;Cancel</a></div></div></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/edit/link.html',
    '<div ng-form="form" class="form-horizontal"><div class="form-group"><label class="col-sm-2 control-label">Label</label><div class="col-sm-10"><input type="text" class="form-control" ng-model="block.content.label"></div></div><div class="form-group"><label class="col-sm-2 control-label">URL</label><div class="col-sm-10"><input type="url" class="form-control" ng-model="block.content.url" required></div></div><div class="form-group"><div class="col-sm-offset-2 col-sm-10"><a href="" class="btn btn-primary btn-sm" ng-click="save()" ng-disabled="form.$invalid"><i class="glyphicon glyphicon-ok"></i> &nbsp;Done</a> <a href="" class="btn btn-link btn-sm" ng-click="cancel()"><i class="glyphicon glyphicon-remove"></i> &nbsp;Cancel</a></div></div></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/edit/text.html',
    '<div ng-form="form" class="form-horizontal"><div class="form-group"><label class="col-sm-2 control-label">Text</label><div class="col-sm-10"><textarea class="form-control" ng-model="block.content.html" required></textarea></div></div><div class="form-group"><div class="col-sm-offset-2 col-sm-10"><a href="" class="btn btn-primary btn-sm" ng-click="save()" ng-disabled="form.$invalid"><i class="glyphicon glyphicon-ok"></i> &nbsp;Done</a> <a href="" class="btn btn-link btn-sm" ng-click="cancel()"><i class="glyphicon glyphicon-remove"></i> &nbsp;Cancel</a></div></div></div>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/preview/embed/soundcloud.html',
    '<iframe width="100%" height="450" scrolling="no" frameborder="no" src="{{ trustedConcat(\'https://w.soundcloud.com/player/?url=https://\', data.contentId, \'&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true\') }}"></iframe>');
}]);

angular.module('ngBlockEditor').run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-block-editor/preview/embed/youtube.html',
    '<iframe width="100%" height="450" src="{{ trustedConcat(\'https://www.youtube.com/embed/\', data.contentId) }}"></iframe>');
}]);
