<div class="slide [#if cmsfn.isEditMode()]cell-1of${ctx.cell!1}[/#if]">
    <div class="slide-inner [#if cmsfn.isEditMode()]-relative[/#if]">
        [#if content.title?has_content || content.text?has_content]
        <div class="foreground is-vertical o-section has-no-top-space has-no-bottom-space">
            [#include "../editorial.ftl"]
        </div>
        [/#if]
        [#if content.asset?has_content && damfn.getAsset(content.asset)??]
            [#assign asset = damfn.getAsset(content.asset)]
            [#if asset.isAsset() && !cmsfn.nodeById(asset.getItemKey().getAssetId(), 'dam').hasProperty('mgnl:deleted')] {#--is not a folder--#}
                <div class="background">
                    [#include "../../macros/lazyMedia.ftl"]
                    [#assign assetKey = asset.getItemKey().asString()]
                    <div class="o-lazy-media">
                        [@lazyMedia lazyMediaContent=content itemKey=assetKey! itemRatio=ctx.itemRatio! isInstantly=ctx.isInstantly! asHero=ctx.asHero! isCover=ctx.isCover! maxRenditionWidth=ctx.maxRenditionWidth!][/@lazyMedia]
                    </div>
                </div>
            [/#if]
        [/#if]
    </div>
</div>
