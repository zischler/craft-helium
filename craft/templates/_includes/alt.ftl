[#macro alt map]
[@compress single_line=true]
[#assign desc = map.metadata.dc.description!]
[#assign title = map.metadata.dc.title!]

[#if title?has_content || desc?has_content]
    [#if title?has_content]
        title="${title!}"
    [#else]
        title="${desc!}"
    [/#if]
[/#if]

alt="${desc!}"
[/@compress]
[/#macro]
