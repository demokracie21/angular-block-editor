angular.module 'ngBlockEditor', []

.provider 'BlockEditor', ->
    @blockTypes = {}
    @editorTemplateUrl = 'ng-block-editor/editor.html'
    @blockTemplateUrl = 'ng-block-editor/block.html'
    @dragAndDropEnabled = no
    @toolbar = []
    @messages =
        removeBlockConfirm: 'Are you sure you want to remove this block?'

    try
        angular.module 'angular-sortable-view'
        @dragAndDropEnabled = yes
    catch e
        @dragAndDropEnabled = no

    @registerBlockType = (id, config) ->
        config.type = id
        @blockTypes[id] = config

    self = @

    @$get = ['$injector', '$log', ($injector, $log) ->
        return {
            editorTemplateUrl: self.editorTemplateUrl
            blockTemplateUrl: self.blockTemplateUrl
            blockTypes: self.blockTypes
            dragAndDropEnabled: self.dragAndDropEnabled
            toolbar: self.toolbar,
            getMessage: (_id, editor, block) ->
                if not self.messages[_id]?
                    $log.error '[ngBlockEditor] No message with _id ' + _id

                # DI enabled function
                if _.isFunction(self.messages[_id]) or _.isArray(self.messages[_id])
                    return $injector.invoke(self.messages[_id], {$editor: editor, $block: block})

                return self.messages[_id]
        }
    ]

    return @


.controller 'BlockEditorEmbedController', ($scope, $timeout, $sce, $block) ->
    $scope.embeddables = [
        {
            provider: 'youtube'
            displayName: 'YouTube'
            regex: /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
        },
        {
            provider: 'soundcloud'
            displayName: 'SoundCloud'
            regex: /https?:\/\/(soundcloud.com\/[a-zA-Z0-9\/_-]*)/
        }
    ]
    $scope.data =
        url: ''
        isValid: no
        contentId: undefined

    $scope.trustedConcat = ->
        # The regular expressions protect us from XSS.
        args = Array.prototype.slice.call arguments
        return $sce.trustAsResourceUrl(args.join '')

    _update = _.debounce (url) ->
        $timeout ->
            if not url?
                delete $block.content.provider
                delete $block.content.url
                $scope.data.contentId = undefined
                $scope.data.isValid = no
            else
                service = _.find $scope.embeddables, (e) -> e.regex.test url

                if service
                    $block.content.provider = service.provider
                    $block.content.url = url
                    $scope.data.contentId = service.regex.exec(url)[1]
                    $scope.data.isValid = yes
                    $scope.data.url = url
                else
                    delete $block.content.provider
                    delete $block.content.url
                    $scope.data.contentId = undefined
                    $scope.data.isValid = no

    , 500, {leading: yes, trailing: no}

    if $block.content?.url?
        _update $block.content.url
    else
        _update ''

    $scope.$watch 'data.url', _update

.controller 'BlockEditorLinkController', ($scope, $timeout, $block) ->
    sanitize = (url) ->
        if not (new RegExp(/https?:\/\//)).test(url)
            return 'http://' + (url || '')
        return url

    $block.content.url = sanitize $block.content?.url

    return {
        preSaveHook: () ->
            $block.content.url = sanitize $block.content?.url
    }

.config (BlockEditorProvider) ->
    BlockEditorProvider.registerBlockType 'text',
        icon: 'glyphicon glyphicon-align-justify'
        displayName: 'Text'
        editTemplate: 'ng-block-editor/edit/text.html'
        previewTemplate: 'ng-block-editor/preview/text.html'

    BlockEditorProvider.registerBlockType 'link',
        icon: 'glyphicon glyphicon-link'
        displayName: 'Link'
        editTemplate: 'ng-block-editor/edit/link.html'
        previewTemplate: 'ng-block-editor/preview/link.html'
        editController: 'BlockEditorLinkController'

    BlockEditorProvider.registerBlockType 'embed',
        icon: 'glyphicon glyphicon-facetime-video'
        displayName: 'Embed'
        editTemplate: 'ng-block-editor/edit/embed.html'
        previewTemplate: 'ng-block-editor/preview/embed.html'
        editController: 'BlockEditorEmbedController'
        renderController: 'BlockEditorEmbedController'

    BlockEditorProvider.toolbar = ['text', 'link', 'embed']


.directive 'beEditor', (BlockEditor) ->
    allBlockTypes = BlockEditor.blockTypes

    return {
        restrict: 'E'
        templateUrl: BlockEditor.editorTemplateUrl
        require: ['beEditor', 'ngModel']
        scope:
            toolbar: '='
            ngModel: '=ngModel'
            ngDisabled: '='

        controller: ($scope) ->
            _rollbackStorage = {}

            updateMovementToggles = ->
                _.each $scope.blocks, (b, idx) ->
                    b.canMoveUp = idx > 0
                    b.canMoveDown = idx < $scope.blocks.length - 1

            this.addBlock = (block) ->
                $scope.blocks.push block
                updateMovementToggles()

            this.editBlock = (block) ->
                _rollbackStorage[block.$$hashKey] = _.cloneDeep block
                block.editing = yes

            this.submitBlockEdit = (block) ->
                block.saved = yes
                block.editing = no

            this.rollbackBlockEdit = (block) ->

                # If block wasn't previously saved, delete it right away
                if not block.saved
                    this.removeBlock block
                # Otherwise, rollback to previous state
                else
                    rollbackData = _.cloneDeep _rollbackStorage[block.$$hashKey]
                    _.forOwn rollbackData, (val, key) ->
                        block[key] = val
                    _.forOwn block, (val, key) ->
                        if not _.has rollbackData, key
                            delete block[key]

                    delete _rollbackStorage[block]
                    block.editing = no

            this.removeBlock = (block) ->
                $scope.blocks = _.without $scope.blocks, block
                updateMovementToggles()

            this.moveUp = (block) ->
                if block.canMoveUp
                    index = _.indexOf $scope.blocks, block

                    if index > 0
                        current = $scope.blocks[index]
                        previous = $scope.blocks[index - 1]
                        $scope.blocks.splice(index - 1, 2, current, previous)
                        updateMovementToggles()

            this.moveDown = (block) ->
                if block.canMoveDown
                    index = _.indexOf $scope.blocks, block

                    if index < $scope.blocks.length - 1
                        current = $scope.blocks[index]
                        next = $scope.blocks[index + 1]
                        $scope.blocks.splice(index, 2, next, current)
                        updateMovementToggles()

            this.isEditing = ->
                return $scope.editing

        link: (scope, element, attrs, controllers) ->
            controller = controllers[0]
            ngModel = controllers[1]

            _id = "be-editor-#{new Date().getTime()}"

            element.addClass 'be-editor'
            element.attr 'id', _id

            scope.editing = no

            ngModel.$formatters.push (value) ->
                blocks = angular.copy(value or [])
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

            # Register all type-specific validators.
            _.each BlockEditor.blockTypes, (blockType) ->
                if blockType.validator
                    ngModel.$validators[blockType.type] = (value) ->
                        _(value).filter({kind: blockType.type}).map(blockType.validator).all()

            _toolbar = scope.toolbar or BlockEditor.toolbar
            scope.blockTypes = _(allBlockTypes)
                .filter (bt) -> -> bt.type in _toolbar
                .sortBy (bt) -> _.indexOf _toolbar, bt.type
                .value()

            scope.dragAndDropEnabled = BlockEditor.dragAndDropEnabled

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
                scope.editing = _(value).chain().map('editing').some().value()
                element.toggleClass 'be-editor-editing', scope.editing
            , true

    }


.directive 'beBlock', ($window, $log, $controller, BlockEditor) ->
    restrict: 'E'
    templateUrl: BlockEditor.blockTemplateUrl
    require: '^beEditor'
    scope:
        block: '='
        editEnabled: '@edit'
    link: (scope, element, attrs, blockEditor) ->
        element.addClass 'be-block'

        scope.$editor = blockEditor
        scope.config = BlockEditor.blockTypes[scope.block.kind]

        if not scope.config
            $log.error "[ngBlockEditor] Unknown block type: #{scope.block.kind}"
            return

        if scope.config.editController?
            ctrlLocals =
                $scope: scope
                $block: scope.block
                $editor: blockEditor
            ctrlInstance = $controller scope.config.editController, ctrlLocals

        scope.edit = ->
            blockEditor.editBlock scope.block

        scope.remove = ->
            if $window.confirm BlockEditor.getMessage('removeBlockConfirm', blockEditor, scope.block)
                blockEditor.removeBlock scope.block

        scope.moveUp = ->
            blockEditor.moveUp scope.block

        scope.moveDown = ->
            blockEditor.moveDown scope.block

        scope.save = ->
            if ctrlInstance?.preSaveHook
                ctrlInstance.preSaveHook()
            blockEditor.submitBlockEdit scope.block

        scope.cancel = ->
            blockEditor.rollbackBlockEdit scope.block


.directive 'beRender', ->
    restrict: 'EA'
    template: '<div be-render-block="block" ng-repeat="block in blocks"></div>'
    scope:
        blocks: '=beRender'
    link: (scope, element, attrs) ->
        element.addClass 'be-render'


.directive 'beRenderBlock', ($log, $controller, BlockEditor) ->
    restrict: 'EA'
    template: '<div ng-include="config.previewTemplate"></div>'
    scope:
        block: '=beRenderBlock'
    replace: yes
    link: (scope, element, attrs) ->
        element.addClass 'be-render-block'

        scope.config = BlockEditor.blockTypes[scope.block.kind]

        if not scope.config
            $log.error "[ngBlockEditor] Unknown block type: #{scope.block.kind}"
            return

        if scope.config.renderController?
            ctrlLocals =
                $scope: scope
                $block: scope.block
            ctrlInstance = $controller scope.config.renderController, ctrlLocals
