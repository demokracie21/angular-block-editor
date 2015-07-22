(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('ngBlockEditor', ['ngSanitize']).provider('BlockEditorRegistry', function() {
    var blockTypes;
    blockTypes = {};
    this.registerBlockType = function(id, config) {
      config.type = id;
      return blockTypes[id] = config;
    };
    this.$get = [
      function() {
        return {
          getBlockTypes: function() {
            return blockTypes;
          }
        };
      }
    ];
    return this;
  }).controller('BlockEditorTextController', function($scope, $sce) {
    return $scope.trustedHtmlCode = $sce.trustAsHtml;
  }).controller('BlockEditorEmbedController', function($scope, $sce, $block) {
    var _update;
    $scope.embeddables = [
      {
        provider: 'youtube',
        displayName: 'YouTube',
        regex: /https?:\/\/www.youtube.com\/watch\?v=([a-zA-Z0-9_-]*)/
      }, {
        provider: 'soundcloud',
        displayName: 'SoundCloud',
        regex: /https?:\/\/(soundcloud.com\/[a-zA-Z0-9\/_-]*)/
      }
    ];
    $scope.pattern = null;
    $scope.isValid = false;
    $scope.trustedConcat = function() {
      var args;
      args = Array.prototype.slice.call(arguments);
      return $sce.trustAsResourceUrl(args.join(''));
    };
    _update = function() {
      var ref;
      if (($scope.pattern != null) && (((ref = $block.content) != null ? ref.url : void 0) != null)) {
        $scope.contentId = $scope.pattern.exec($block.content.url)[1];
        return $scope.isValid = $scope.pattern.test($block.content.url);
      } else {
        $scope.contentId = void 0;
        return $scope.isValid = false;
      }
    };
    $scope.$watch('block.content.provider', function(provider) {
      if (provider) {
        $scope.pattern = _.findWhere($scope.embeddables, {
          provider: provider
        }).regex;
      }
      return _update();
    });
    return $scope.$watch('block.content.url', _update);
  }).config(function(BlockEditorRegistryProvider) {
    BlockEditorRegistryProvider.registerBlockType('text', {
      icon: 'glyphicon glyphicon-align-justify',
      displayName: 'Text',
      editTemplate: 'ng-block-editor/edit/text.html',
      previewTemplate: 'ng-block-editor/preview/text.html',
      editController: 'BlockEditorTextController',
      renderController: 'BlockEditorTextController'
    });
    BlockEditorRegistryProvider.registerBlockType('link', {
      icon: 'glyphicon glyphicon-link',
      displayName: 'Link',
      editTemplate: 'ng-block-editor/edit/link.html',
      previewTemplate: 'ng-block-editor/preview/link.html'
    });
    return BlockEditorRegistryProvider.registerBlockType('embed', {
      icon: 'glyphicon glyphicon-facetime-video',
      displayName: 'Embed',
      editTemplate: 'ng-block-editor/edit/embed.html',
      previewTemplate: 'ng-block-editor/preview/embed.html',
      editController: 'BlockEditorEmbedController',
      renderController: 'BlockEditorTextController'
    });
  }).directive('beEditor', function(BlockEditorRegistry) {
    var blockTypes;
    blockTypes = BlockEditorRegistry.getBlockTypes();
    return {
      restrict: 'E',
      templateUrl: 'ng-block-editor/editor.html',
      require: ['beEditor', 'ngModel'],
      scope: {
        enabledBlockTypes: '=blocks',
        ngModel: '=ngModel',
        ngDisabled: '='
      },
      controller: function($scope) {
        var _rollbackStorage, getIdx, updateMovementToggles;
        _rollbackStorage = {};
        getIdx = function(block) {
          return _.indexOf($scope.blocks, block);
        };
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
          return $scope.blocks[getIdx(block)].editing = true;
        };
        this.submitBlockEdit = function(block) {
          block = $scope.blocks[getIdx(block)];
          block.saved = true;
          return block.editing = false;
        };
        this.rollbackBlockEdit = function(block) {
          var rollbackData;
          block = $scope.blocks[getIdx(block)];
          if (!block.saved) {
            return this.removeBlock(block);
          } else {
            rollbackData = _.cloneDeep(_rollbackStorage[block.$$hashKey]);
            _.merge(block, rollbackData);
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
            index = getIdx(block);
            if (index > 0) {
              current = $scope.blocks[index];
              previous = $scope.blocks[index - 1];
              $scope.blocks.splice(index - 1, 2, current, previous);
              return updateMovementToggles();
            }
          }
        };
        return this.moveDown = function(block) {
          var current, index, next;
          if (block.canMoveDown) {
            index = getIdx(block);
            if (index < $scope.blocks.length - 1) {
              current = $scope.blocks[index];
              next = $scope.blocks[index + 1];
              $scope.blocks.splice(index, 2, next, current);
              return updateMovementToggles();
            }
          }
        };
      },
      link: function(scope, element, attrs, controllers) {
        var _id, controller, ngModel;
        controller = controllers[0];
        ngModel = controllers[1];
        _id = "be-editor-" + (new Date().getTime());
        element.addClass('be-editor');
        element.attr('id', _id);
        ngModel.$formatters.push(function(value) {
          var blocks;
          blocks = angular.copy(value);
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
        if (scope.enabledBlockTypes) {
          scope.blockTypes = _.filter(blockTypes, function(bt) {
            var ref;
            return ref = bt.type, indexOf.call(scope.enabledBlockTypes, ref) >= 0;
          });
        } else {
          scope.blockTypes = blockTypes;
        }
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
          return ngModel.$setViewValue(_.cloneDeep(value));
        }, true);
      }
    };
  }).directive('beBlock', function($window, $log, $controller, BlockEditorRegistry) {
    return {
      restrict: 'E',
      templateUrl: 'ng-block-editor/block.html',
      require: '^beEditor',
      scope: {
        block: '=',
        editEnabled: '@edit'
      },
      link: function(scope, element, attrs, blockEditor) {
        var ctrlInstance, ctrlLocals;
        element.addClass('be-block');
        scope.config = BlockEditorRegistry.getBlockTypes()[scope.block.kind];
        if (!scope.config) {
          $log.error("[ngBlockEditor] Unknown block type: " + scope.block.kind);
          return;
        }
        scope.edit = function() {
          return blockEditor.editBlock(scope.block);
        };
        scope.remove = function() {
          if ($window.confirm('Are you sure you want to remove this block?')) {
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
  }).directive('beRender', function() {
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
  }).directive('beRenderBlock', function($controller, BlockEditorRegistry) {
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
        scope.config = BlockEditorRegistry.getBlockTypes()[scope.block.kind];
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
  });

}).call(this);
