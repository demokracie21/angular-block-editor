angular.module 'ngBlockEditor', ['ngSanitize']

.provider 'BlockEditorRegistry', ->
    blockTypes = {}

    @registerBlockType = (id, config) ->
        config.type = id
        blockTypes[id] = config

    @$get = [() ->
        return {
            getBlockTypes: ->
                return blockTypes
        }
    ]

    return @


.controller 'BlockEditorTextController', ($scope, $sce) ->
    $scope.trustedHtmlCode = $sce.trustAsHtml


.controller 'BlockEditorEmbedController', ($scope, $sce, $block) ->
    $scope.embeddables = [
        {
            provider: 'youtube'
            displayName: 'YouTube'
            regex: /https?:\/\/www.youtube.com\/watch\?v=([a-zA-Z0-9_-]*)/
        },
        {
            provider: 'soundcloud'
            displayName: 'SoundCloud'
            regex: /https?:\/\/(soundcloud.com\/[a-zA-Z0-9\/_-]*)/
        }
    ]
    $scope.pattern = null
    $scope.isValid = no

    $scope.trustedConcat = ->
        args = Array.prototype.slice.call arguments
        return $sce.trustAsResourceUrl(args.join '')

    _update = ->
        if $scope.pattern? and $block.content?.url?
            $scope.contentId = $scope.pattern.exec($block.content.url)[1]
            $scope.isValid = $scope.pattern.test($block.content.url)
        else
            $scope.contentId = undefined
            $scope.isValid = no

    $scope.$watch 'block.content.provider', (provider) ->
        if provider
            $scope.pattern = _.findWhere($scope.embeddables, provider: provider).regex

        _update()

    $scope.$watch 'block.content.url', _update


.config (BlockEditorRegistryProvider) ->
    BlockEditorRegistryProvider.registerBlockType 'text',
        icon: 'glyphicon glyphicon-align-justify'
        displayName: 'Text'
        editTemplate: 'ng-block-editor/edit/text.html'
        previewTemplate: 'ng-block-editor/preview/text.html'
        controller: 'BlockEditorTextController'

    BlockEditorRegistryProvider.registerBlockType 'link',
        icon: 'glyphicon glyphicon-link'
        displayName: 'Link'
        editTemplate: 'ng-block-editor/edit/link.html'
        previewTemplate: 'ng-block-editor/preview/link.html'

    BlockEditorRegistryProvider.registerBlockType 'embed',
        icon: 'glyphicon glyphicon-facetime-video'
        displayName: 'Embed'
        editTemplate: 'ng-block-editor/edit/embed.html'
        previewTemplate: 'ng-block-editor/preview/embed.html'
        controller: 'BlockEditorEmbedController'


.directive 'blockEditor', (BlockEditorRegistry) ->
    blockTypes = BlockEditorRegistry.getBlockTypes()

    return {
        restrict: 'E'
        templateUrl: 'ng-block-editor/editor.html'
        require: ['blockEditor', 'ngModel']
        scope:
            enabledBlockTypes: '=blocks'
            ngModel: '=ngModel'
            ngDisabled: '='

        controller: ($scope) ->
            _rollbackStorage = {}

            getIdx = (block) ->
                return _.indexOf $scope.blocks, block

            updateMovementToggles = ->
                _.each $scope.blocks, (b, idx) ->
                    b.canMoveUp = idx > 0
                    b.canMoveDown = idx < $scope.blocks.length - 1

            this.addBlock = (block) ->
                $scope.blocks.push block

            this.editBlock = (block) ->
                _rollbackStorage[block.$$hashKey] = _.cloneDeep block
                $scope.blocks[getIdx(block)].editing = yes

            this.submitBlockEdit = (block) ->
                block = $scope.blocks[getIdx block]
                block.saved = yes
                block.editing = no

            this.rollbackBlockEdit = (block) ->
                block = $scope.blocks[getIdx block]

                # If block wasn't previously saved, delete it right away
                if not block.saved
                    this.removeBlock block
                # Otherwise, rollback to previous state
                else
                    rollbackData = _.cloneDeep _rollbackStorage[block.$$hashKey]
                    _.merge block, rollbackData
                    delete _rollbackStorage[block]
                    block.editing = no

            this.removeBlock = (block) ->
                $scope.blocks = _.without $scope.blocks, block

            this.moveUp = (block) ->
                if block.canMoveUp
                    index = getIdx block

                    if index > 0
                        current = $scope.blocks[index]
                        previous = $scope.blocks[index - 1]
                        $scope.blocks.splice(index - 1, 2, current, previous)
                        updateMovementToggles()

            this.moveDown = (block) ->
                if block.canMoveDown
                    index = getIdx block

                    if index < $scope.blocks.length - 1
                        current = $scope.blocks[index]
                        next = $scope.blocks[index + 1]
                        $scope.blocks.splice(index, 2, next, current)
                        updateMovementToggles()

        link: (scope, element, attrs, controllers) ->
            controller = controllers[0]
            ngModel = controllers[1]

            _id = "block-editor-#{new Date().getTime()}"

            element.addClass 'block-editor'
            element.attr 'id', _id

            ngModel.$formatters.push (value) ->
                blocks = angular.copy value
                _.each blocks, (block, idx) ->
                    block.saved = yes
                    block.canMoveUp = idx > 0
                    block.canMoveDown = idx < blocks.length - 1
                scope.blocks = blocks

            ngModel.$parsers.push (value) ->
                v = _.map value, (b) -> _.omit(b, ['saved', 'editing', 'canMoveUp', 'canMoveDown'])
                return v

            ngModel.$isEmpty = (value) ->
                return _.isArray(value) and value.length > 0

            if scope.enabledBlockTypes
                scope.blockTypes = _.filter blockTypes, (bt) -> bt.type in scope.enabledBlockTypes
            else
                scope.blockTypes = blockTypes

            scope.startAddingNewBlock = ->
                scope.addingNewBlock = yes

            scope.cancelAddingNewBlock = ->
                scope.addingNewBlock = no

            scope.addNew = (type) ->
                newBlock =
                    kind: type
                    content: {}
                    saved: no

                # Add ...
                controller.addBlock newBlock
                # ... and edit right away.
                controller.editBlock(newBlock)
                scope.addingNewBlock = no

            scope.$watch 'blocks', (value) ->
                ngModel.$setViewValue _.cloneDeep value
            , true

    }


.directive 'blockEditorBlock', ($window, $sce, $log, $controller, BlockEditorRegistry) ->
    restrict: 'E'
    templateUrl: 'ng-block-editor/block.html'
    require: '^blockEditor'
    scope:
        block: '='
        editEnabled: '@edit'
    link: (scope, element, attrs, blockEditor) ->
        element.addClass 'block-editor-block'

        scope.config = BlockEditorRegistry.getBlockTypes()[scope.block.kind]

        if not scope.config
            $log.error "[ngBlockEditor] Unknown block type: #{scope.block.kind}"
            return

        scope.edit = ->
            blockEditor.editBlock scope.block

        scope.remove = ->
            if $window.confirm 'Are you sure you want to remove this block?'
                blockEditor.removeBlock scope.block

        scope.moveUp = ->
            blockEditor.moveUp scope.block

        scope.moveDown = ->
            blockEditor.moveDown scope.block

        scope.save = ->
            blockEditor.submitBlockEdit scope.block

        scope.cancel = ->
            blockEditor.rollbackBlockEdit scope.block

        if scope.config.controller?
            ctrlLocals =
                $scope: scope
                $block: scope.block
                $editor: blockEditor
            ctrlInstance = $controller scope.config.controller, ctrlLocals

