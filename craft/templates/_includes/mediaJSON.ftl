[@compress single_line=true]
[#assign objStart = "{"]

    [#if itemKey?has_content && damfn.getAsset(itemKey)??]
    [#assign asset = damfn.getAsset(itemKey)!]
        [#if asset?has_content]

            [#if !cmsfn.nodeById(asset.getItemKey().getAssetId(), 'dam').hasProperty('mgnl:deleted')]
                [#assign assetMap = damfn.getAssetMap(itemKey)!]
                [#assign extension = cmsfn.fileExtension(assetMap.name)?lower_case]
                [#if asset.getMimeType()?starts_with("image")]
                    [#assign picStart = '\"picture\":{' ]
                        [#assign picLink = '\"link\":\"' + asset.getLink() + '\",' ]
                        [#assign picId = '\"id\":\"' + asset.getItemKey().getAssetId() + '\",' ]
                        [#assign picExt = '\"extension\":\"' + extension + '\",' ]
                        [#assign picW = '\"width\":\"' + assetMap.metadata.mgnl.width?string.computer + '\",' ]
                        [#assign picH = '\"height\":\"' + assetMap.metadata.mgnl.height?string.computer + '\",' ]

                        [#assign picSrcsStart = '\"sources\":{' ]

                        [#if extension != "gif"]
                            [#assign picSrc1 = '\"375px\":\"' +  damfn.getRendition(asset, "resize-w375").getLink() + ', ' +  damfn.getRendition(asset, "resize-w375-2x").getLink() + ' 2x\",' ]
                            [#assign picSrc2 = '\"768px\":\"' +  damfn.getRendition(asset, "resize-w768").getLink() + ', ' +  damfn.getRendition(asset, "resize-w768-2x").getLink() + ' 2x\",' ]
                            [#assign picSrc3 = '\"1024px\":\"' +  damfn.getRendition(asset, "resize-w1024").getLink() + ', ' +  damfn.getRendition(asset, "resize-w1024-2x").getLink() + ' 2x\",' ]
                            [#assign picSrc4 = '\"1440px\":\"' +  damfn.getRendition(asset, "resize-w1440").getLink() + ', ' +  damfn.getRendition(asset, "resize-w1440-2x").getLink() + ' 2x\",' ]
                            [#assign picSrc5 = '\"2560px\":\"' +  damfn.getRendition(asset, "resize-w2560").getLink() + '\",' ]
                            [#assign picSrc = '\"all\":\"' +  damfn.getRendition(asset, "resize-w2560").getLink() + '\"' ]
                            [#assign picSources = picSrc1 + picSrc2 + picSrc3 + picSrc4 + picSrc5 + picSrc ]
                        [#else]
                            [#assign picSources = '\"all\":\"' +  asset.getLink() + '\"' ]
                        [/#if]

                        [#assign picSrcsEnd = '}' ]
                    [#assign picEnd = '},' ]

                    [#assign assetProps = picStart + picLink + picId + picExt + picW + picSrcsStart + picSources + picSrcsEnd + picEnd]

                [#elseif asset.getMimeType()?starts_with("video")]
                    [#assign videoStart = '\"video\":{' ]
                        [#assign videoLink = '\"link\":\"' + asset.getLink() + '\",' ]
                        [#assign videoId = '\"id\":\"' + asset.getItemKey().getAssetId() + '\",' ]
                        [#assign videoExt = '\"extension\":\"' + cmsfn.fileExtension(assetMap.name)?lower_case + '\",' ]
                        [#if content.poster?has_content && damfn.getAsset(content.poster)?? && !cmsfn.nodeById(damfn.getAsset(content.poster).getItemKey().getAssetId(), 'dam').hasProperty('mgnl:deleted')]
                            [#assign videoPoster = '\"poster\":\"' + damfn.getRendition(content.poster, "resize-w1024").getLink() + '\"' ]
                        [#else]
                            [#assign videoPoster = '\"poster\":\"\"' ]
                        [/#if]
                    [#assign videoEnd = '},' ]

                    [#assign assetProps = videoStart + videoLink + videoId + videoExt + videoPoster + videoEnd]
                [/#if]
            [/#if]
        [/#if]
    [/#if]

    [#assign mdStart = '\"metadata\":{']
        [#assign mdMimetype = '\"mimetype\":\"' + asset.getMimeType() + '\",' ]
        [#assign mdTitle = '\"title\":\"' + assetMap.metadata.dc.title + '\",' ]
        [#assign mdDescription = '\"description\":\"' + assetMap.metadata.dc.description + '\",' ]
        [#assign mdCaption = '\"caption\":\"' + assetMap.caption + '\"' ]
    [#assign mdEnd = '}']

    [#assign metadata = mdStart + mdMimetype + mdTitle + mdDescription + mdCaption + mdEnd]

[#assign objEnd = "}"]

[#assign dataJson = objStart + assetProps + metadata + objEnd]

[/@compress]
