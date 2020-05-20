[#if content.carouselTypeimageFolder?has_content]
    [#assign imageFolder = damfn.getFolder(content.carouselTypeimageFolder)!]

    [#if imageFolder?has_content]

        [#assign editModeMaxCell = 1]
        [#if def.parameters.editModeMaxCell?has_content]
            [#assign editModeMaxCell = def.parameters.editModeMaxCell]
        [/#if]

        [#assign cellNb = 0]
        [#list imageFolder.getChildren() as asset]
            [#if asset.isAsset() && !cmsfn.nodeById(asset.getItemKey().getAssetId(), 'dam').hasProperty('mgnl:deleted')] {#--is not a folder--#}
                [#assign cellNb = cellNb + 1]
            [/#if]
        [/#list]

        [#if cellNb > editModeMaxCell || cellNb == 0]
            [#assign cellNb = editModeMaxCell]
        [/#if]
        <div class="o-flex is-multiline has-gutter">

            [#list imageFolder.getChildren() as asset]
                [#if asset.isAsset() && !cmsfn.nodeById(asset.getItemKey().getAssetId(), 'dam').hasProperty('mgnl:deleted')] {#--is not a folder--#}
                    [#assign assetKey = asset.getItemKey().asString()]

                    [#assign isCover = true]
                    [#assign isInstantly = content.isInstantly?? && content.isInstantly == true]
                    [#assign isAutoplay = true]

                    [#assign asset = damfn.getAsset(asset.getItemKey().asString())]
                    [#assign assetMap = damfn.getAssetMap(asset)!]

                    [#if !cmsfn.nodeById(asset.getItemKey().getAssetId(), 'dam').hasProperty('mgnl:deleted')]
                    <div class="cell-1of${cellNb!} cell-1of1-sm">
                        [#assign itemRatio = content.itemRatio!""]
                        <div class="o-lazy-media">
                            [@lazyMedia lazyMediaContent=content itemKey=assetKey! itemRatio=itemRatio! itemWidth=itemWidth! itemHeight=itemHeight! asHero=asHero! isCover=isCover! maxRenditionWidth=ctx.maxRenditionWidth!][/@lazyMedia]
                        </div>
                    </div>
                    [/#if]

                [/#if]
            [/#list]
        </div>
    [/#if]
[/#if]
