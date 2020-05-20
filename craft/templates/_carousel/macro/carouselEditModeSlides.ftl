[#assign editModeMaxCell = 1]
[#if def.parameters.editModeMaxCell?has_content]
    [#assign editModeMaxCell = def.parameters.editModeMaxCell]
[/#if]

[#if content.slides?has_content]
    [#assign cellNb = cmsfn.children(content.slides)?size!]
    [#if cellNb > editModeMaxCell || cellNb == 0]
        [#assign cellNb = editModeMaxCell]
    [/#if]
[/#if]

<div class="o-flex is-multiline [#if hasGutter]has-gutter[/#if]">
    [@cms.area name="slides" contextAttributes={"cell": cellNb!,"itemRatio":itemRatio!,"itemWidth":itemWidth!,"itemHeight":itemHeight!,"asHero":asHero!,"isCover":isCover!,"maxRenditionWidth":maxRenditionWidth!} /]
</div>
