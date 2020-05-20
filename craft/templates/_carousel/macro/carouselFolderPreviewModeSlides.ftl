[#if content.carouselTypeimageFolder?has_content]
    [#assign imageFolder = damfn.getFolder(content.carouselTypeimageFolder)!]

    [#if imageFolder?has_content]
        [#list imageFolder.getChildren() as asset]

            [#if asset.isAsset() && !cmsfn.nodeById(asset.getItemKey().getAssetId(), 'dam').hasProperty('mgnl:deleted')] {#--is not a folder--#}
                [#assign assetKey = asset.getItemKey().asString()]

                <div class="slide [#if cmsfn.isEditMode()]cell-1of1[/#if]">
                    <div class="slide-inner">
                        <div class="slide-content">
                            <div class="slide-content-inner">
                                <div class="background">

                                    <div class="o-lazy-media">
                                        [@lazyMedia lazyMediaContent=content itemKey=assetKey! itemRatio=ctx.itemRatio! isInstantly=ctx.isInstantly! itemWidth=itemWidth! itemHeight=itemHeight! asHero=asHero! isCover=isCover! maxRenditionWidth=ctx.maxRenditionWidth!][/@lazyMedia]
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            [/#if]
        [/#list]
    [/#if]
[/#if]
