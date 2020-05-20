[#include "../../../macros/lazyMedia.ftl"]

[#macro carousel isFolder=false]

    [#assign hasGutter = content.hasGutter?? && content.hasGutter == true]

    [#assign asHero = def.parameters.asHero!false]
    [#assign isCover = def.parameters.isCover!false]
    [#assign maxRenditionWidth = def.parameters.maxRenditionWidth!false]
    [#assign showBulletsDesktop = def.parameters.showBulletsDesktop!false]
    [#assign itemRatio = ""]
    [#assign itemWidth = ""]
    [#assign itemHeight = ""]
    [#assign isInfinite = (content.isInfinite?has_content && content.isInfinite) ||
        (content.renderType?has_content && content.renderType == "slideshow" && (content.renderTypeslideshow?? && content.renderTypeslideshow))]

    [#if content.asHero?? && content.asHero == true]
        [#assign asHero = true]
        [#assign isCover = true]
    [/#if]

    [#if asHero == false]
        [#assign itemRatio = def.parameters.itemRatio!""]
        [#if content.itemRatio?has_content && content.itemRatio != "none"][#assign itemRatio = content.itemRatio!itemRatio!][/#if]
        [#assign itemWidth = def.parameters.width!""]
        [#assign itemHeight = def.parameters.height!""]

        [#if itemRatio?has_content]
            [#assign imageRatio = 1 / (itemRatio?eval) * 100]
            [#assign hasRatio = true]
        [#elseif content.width?has_content && content.width?eval > 0
                && content.height?has_content && content.height?eval > 0]
            [#assign imageRatio = 1 / (content.width?eval / content.height?eval) * 100]
            [#assign itemWidth = content.width?eval]
            [#assign itemHeight = content.height?eval]
            [#assign itemRatio = "${itemWidth!}/${itemHeight!}"]
            [#assign hasRatio = true]
        [#elseif itemWidth?has_content && itemHeight?has_content]
            [#assign imageRatio = 1 / (itemWidth?eval / itemHeight?eval) * 100]
            [#assign itemWidth = itemWidth?eval]
            [#assign itemHeight = itemHeight?eval]
            [#assign itemRatio = "${itemWidth!}/${itemHeight!}"]
            [#assign hasRatio = true]
        [/#if]
    [/#if]

    <div class="o-carousel-wrapper o-component">
        [#if !cmsfn.isEditMode()]
            <multi-carousel v-bind:transition-delay="${content.transitionDelay!'350'}"
                            v-bind:delay="${content.delay!'5000'}"
                            v-bind:autoplay="${(content.autoplay!false)?c}"
                            v-bind:as-hero="${(asHero!false)?c}"
                            v-bind:start-at="${(content.startAt!0)?number}"
                            v-bind:render-type="'${content.renderType!'slideshow'}'"
                            v-bind:orientation="'${content.orientation!'horizontal'}'"
                            v-bind:is-infinite="${isInfinite?c}"
                            [#if imageRatio??]v-bind:slide-ratio="${imageRatio?string.computer!0}"[/#if]
                            [#if content.columns??]v-bind:columns="${content.columns!'0'}"[/#if]
                            [#if content.minWidth??]v-bind:min-width="${content.minWidth!'0'}"[/#if]
                            [#if content.maxWidth??]v-bind:max-width="${content.maxWidth!'0'}"[/#if]
                            class="o-carousel o-component [#if hasGutter]has-inner-gutter[/#if] [#if showBulletsDesktop]show-bullets[/#if]" [#if asHero == true]style="height: 100vh"[/#if]>
                <template slot="slides">
                    [#if isFolder]
                        [#include "carouselFolderPreviewModeSlides.ftl"]
                    [#else]
                        [#include "carouselPreviewModeSlides.ftl"]
                    [/#if]
                </template>
            </multi-carousel>
        [#else]
            [#if isFolder]
                [#include "carouselFolderEditModeSlides.ftl"]
            [#else]
                [#include "carouselEditModeSlides.ftl"]
            [/#if]
        [/#if]
    </div>
[/#macro]
