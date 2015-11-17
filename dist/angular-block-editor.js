(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('ngBlockEditor', ['ngSanitize']).provider('BlockEditor', function() {
    var e, self;
    this.blockTypes = {};
    this.editorTemplateUrl = 'ng-block-editor/editor.html';
    this.blockTemplateUrl = 'ng-block-editor/block.html';
    this.dragAndDropEnabled = false;
    this.toolbar = [];
    this.messages = {
      removeBlockConfirm: 'Are you sure you want to remove this block?'
    };
    try {
      angular.module('angular-sortable-view');
      this.dragAndDropEnabled = true;
    } catch (_error) {
      e = _error;
      this.dragAndDropEnabled = false;
    }
    this.registerBlockType = function(id, config) {
      config.type = id;
      return this.blockTypes[id] = config;
    };
    self = this;
    this.$get = [
      '$injector', '$log', function($injector, $log) {
        return {
          editorTemplateUrl: self.editorTemplateUrl,
          blockTemplateUrl: self.blockTemplateUrl,
          blockTypes: self.blockTypes,
          dragAndDropEnabled: self.dragAndDropEnabled,
          toolbar: self.toolbar,
          getMessage: function(_id, editor, block) {
            if (self.messages[_id] == null) {
              $log.error('[ngBlockEditor] No message with _id ' + _id);
            }
            if (_.isFunction(self.messages[_id]) || _.isArray(self.messages[_id])) {
              return $injector.invoke(self.messages[_id], {
                $editor: editor,
                $block: block
              });
            }
            return self.messages[_id];
          }
        };
      }
    ];
    return this;
  }).controller('BlockEditorEmbedController', ["$scope", "$timeout", "$sce", "$block", function($scope, $timeout, $sce, $block) {
    var _update, ref;
    $scope.embeddables = [
      {
        provider: 'youtube',
        displayName: 'YouTube',
        regex: /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
      }, {
        provider: 'soundcloud',
        displayName: 'SoundCloud',
        regex: /https?:\/\/(soundcloud.com\/[a-zA-Z0-9\/_-]*)/
      }
    ];
    $scope.data = {
      url: '',
      isValid: false,
      contentId: void 0
    };
    $scope.trustedConcat = function() {
      var args;
      args = Array.prototype.slice.call(arguments);
      return $sce.trustAsResourceUrl(args.join(''));
    };
    _update = _.debounce(function(url) {
      return $timeout(function() {
        var service;
        if (url == null) {
          delete $block.content.provider;
          delete $block.content.url;
          $scope.data.contentId = void 0;
          return $scope.data.isValid = false;
        } else {
          service = _.find($scope.embeddables, function(e) {
            return e.regex.test(url);
          });
          if (service) {
            $block.content.provider = service.provider;
            $block.content.url = url;
            $scope.data.contentId = service.regex.exec(url)[1];
            $scope.data.isValid = true;
            return $scope.data.url = url;
          } else {
            delete $block.content.provider;
            delete $block.content.url;
            $scope.data.contentId = void 0;
            return $scope.data.isValid = false;
          }
        }
      });
    }, 1000, {
      leading: true,
      trailing: false
    });
    if (((ref = $block.content) != null ? ref.url : void 0) != null) {
      _update($block.content.url);
    } else {
      _update('');
    }
    return $scope.$watch('data.url', _update);
  }]).config(["BlockEditorProvider", function(BlockEditorProvider) {
    BlockEditorProvider.registerBlockType('text', {
      icon: 'glyphicon glyphicon-align-justify',
      displayName: 'Text',
      editTemplate: 'ng-block-editor/edit/text.html',
      previewTemplate: 'ng-block-editor/preview/text.html'
    });
    BlockEditorProvider.registerBlockType('link', {
      icon: 'glyphicon glyphicon-link',
      displayName: 'Link',
      editTemplate: 'ng-block-editor/edit/link.html',
      previewTemplate: 'ng-block-editor/preview/link.html'
    });
    BlockEditorProvider.registerBlockType('embed', {
      icon: 'glyphicon glyphicon-facetime-video',
      displayName: 'Embed',
      editTemplate: 'ng-block-editor/edit/embed.html',
      previewTemplate: 'ng-block-editor/preview/embed.html',
      editController: 'BlockEditorEmbedController',
      renderController: 'BlockEditorEmbedController'
    });
    return BlockEditorProvider.toolbar = ['text', 'link', 'embed'];
  }]).directive('beEditor', ["BlockEditor", function(BlockEditor) {
    var allBlockTypes;
    allBlockTypes = BlockEditor.blockTypes;
    return {
      restrict: 'E',
      templateUrl: BlockEditor.editorTemplateUrl,
      require: ['beEditor', 'ngModel'],
      scope: {
        toolbar: '=',
        ngModel: '=ngModel',
        ngDisabled: '='
      },
      controller: ["$scope", function($scope) {
        var _rollbackStorage, updateMovementToggles;
        _rollbackStorage = {};
        updateMovementToggles = function() {
          return _.each($scope.blocks, function(b, idx) {
            b.canMoveUp = idx > 0;
            return b.canMoveDown = idx < $scope.blocks.length - 1;
          });
        };
        this.addBlock = function(block) {
          $scope.blocks.push(block);
          return updateMovementToggles();
        };
        this.editBlock = function(block) {
          _rollbackStorage[block.$$hashKey] = _.cloneDeep(block);
          return block.editing = true;
        };
        this.submitBlockEdit = function(block) {
          block.saved = true;
          return block.editing = false;
        };
        this.rollbackBlockEdit = function(block) {
          var rollbackData;
          if (!block.saved) {
            return this.removeBlock(block);
          } else {
            rollbackData = _.cloneDeep(_rollbackStorage[block.$$hashKey]);
            _.forOwn(rollbackData, function(val, key) {
              return block[key] = val;
            });
            _.forOwn(block, function(val, key) {
              if (!_.has(rollbackData, key)) {
                return delete block[key];
              }
            });
            delete _rollbackStorage[block];
            return block.editing = false;
          }
        };
        this.removeBlock = function(block) {
          $scope.blocks = _.without($scope.blocks, block);
          return updateMovementToggles();
        };
        this.moveUp = function(block) {
          var current, index, previous;
          if (block.canMoveUp) {
            index = _.indexOf($scope.blocks, block);
            if (index > 0) {
              current = $scope.blocks[index];
              previous = $scope.blocks[index - 1];
              $scope.blocks.splice(index - 1, 2, current, previous);
              return updateMovementToggles();
            }
          }
        };
        this.moveDown = function(block) {
          var current, index, next;
          if (block.canMoveDown) {
            index = _.indexOf($scope.blocks, block);
            if (index < $scope.blocks.length - 1) {
              current = $scope.blocks[index];
              next = $scope.blocks[index + 1];
              $scope.blocks.splice(index, 2, next, current);
              return updateMovementToggles();
            }
          }
        };
        return this.isEditing = function() {
          return $scope.editing;
        };
      }],
      link: function(scope, element, attrs, controllers) {
        var _id, _toolbar, controller, ngModel;
        controller = controllers[0];
        ngModel = controllers[1];
        _id = "be-editor-" + (new Date().getTime());
        element.addClass('be-editor');
        element.attr('id', _id);
        scope.editing = false;
        ngModel.$formatters.push(function(value) {
          var blocks;
          blocks = angular.copy(value || []);
          _.each(blocks, function(block, idx) {
            block.saved = true;
            block.canMoveUp = idx > 0;
            return block.canMoveDown = idx < blocks.length - 1;
          });
          return scope.blocks = blocks;
        });
        ngModel.$parsers.push(function(value) {
          var v;
          v = _.map(value, function(b) {
            return _.omit(b, ['saved', 'editing', 'canMoveUp', 'canMoveDown']);
          });
          return v;
        });
        ngModel.$isEmpty = function(value) {
          return _.isArray(value) && value.length > 0;
        };
        _.each(BlockEditor.blockTypes, function(blockType) {
          if (blockType.validator) {
            return ngModel.$validators[blockType.type] = function(value) {
              return _(value).filter({
                kind: blockType.type
              }).map(blockType.validator).all();
            };
          }
        });
        _toolbar = scope.toolbar || BlockEditor.toolbar;
        scope.blockTypes = _(allBlockTypes).filter(function(bt) {
          return function() {
            var ref;
            return ref = bt.type, indexOf.call(_toolbar, ref) >= 0;
          };
        }).sortBy(function(bt) {
          return _.indexOf(_toolbar, bt.type);
        }).value();
        scope.dragAndDropEnabled = BlockEditor.dragAndDropEnabled;
        scope.startAddingNewBlock = function() {
          return scope.addingNewBlock = true;
        };
        scope.cancelAddingNewBlock = function() {
          return scope.addingNewBlock = false;
        };
        scope.addNew = function(type) {
          var newBlock;
          newBlock = {
            kind: type,
            content: {},
            saved: false
          };
          controller.addBlock(newBlock);
          controller.editBlock(newBlock);
          return scope.addingNewBlock = false;
        };
        return scope.$watch('blocks', function(value) {
          ngModel.$setViewValue(_.cloneDeep(value));
          scope.editing = _(value).chain().map('editing').some().value();
          return element.toggleClass('be-editor-editing', scope.editing);
        }, true);
      }
    };
  }]).directive('beBlock', ["$window", "$log", "$controller", "BlockEditor", function($window, $log, $controller, BlockEditor) {
    return {
      restrict: 'E',
      templateUrl: BlockEditor.blockTemplateUrl,
      require: '^beEditor',
      scope: {
        block: '=',
        editEnabled: '@edit'
      },
      link: function(scope, element, attrs, blockEditor) {
        var ctrlInstance, ctrlLocals;
        element.addClass('be-block');
        scope.$editor = blockEditor;
        scope.config = BlockEditor.blockTypes[scope.block.kind];
        if (!scope.config) {
          $log.error("[ngBlockEditor] Unknown block type: " + scope.block.kind);
          return;
        }
        scope.edit = function() {
          return blockEditor.editBlock(scope.block);
        };
        scope.remove = function() {
          if ($window.confirm(BlockEditor.getMessage('removeBlockConfirm', blockEditor, scope.block))) {
            return blockEditor.removeBlock(scope.block);
          }
        };
        scope.moveUp = function() {
          return blockEditor.moveUp(scope.block);
        };
        scope.moveDown = function() {
          return blockEditor.moveDown(scope.block);
        };
        scope.save = function() {
          return blockEditor.submitBlockEdit(scope.block);
        };
        scope.cancel = function() {
          return blockEditor.rollbackBlockEdit(scope.block);
        };
        if (scope.config.editController != null) {
          ctrlLocals = {
            $scope: scope,
            $block: scope.block,
            $editor: blockEditor
          };
          return ctrlInstance = $controller(scope.config.editController, ctrlLocals);
        }
      }
    };
  }]).directive('beRender', function() {
    return {
      restrict: 'EA',
      template: '<div be-render-block="block" ng-repeat="block in blocks"></div>',
      scope: {
        blocks: '=beRender'
      },
      link: function(scope, element, attrs) {
        return element.addClass('be-render');
      }
    };
  }).directive('beRenderBlock', ["$log", "$controller", "BlockEditor", function($log, $controller, BlockEditor) {
    return {
      restrict: 'EA',
      template: '<div ng-include="config.previewTemplate"></div>',
      scope: {
        block: '=beRenderBlock'
      },
      replace: true,
      link: function(scope, element, attrs) {
        var ctrlInstance, ctrlLocals;
        element.addClass('be-render-block');
        scope.config = BlockEditor.blockTypes[scope.block.kind];
        if (!scope.config) {
          $log.error("[ngBlockEditor] Unknown block type: " + scope.block.kind);
          return;
        }
        if (scope.config.renderController != null) {
          ctrlLocals = {
            $scope: scope,
            $block: scope.block
          };
          return ctrlInstance = $controller(scope.config.renderController, ctrlLocals);
        }
      }
    };
  }]);

}).call(this);
