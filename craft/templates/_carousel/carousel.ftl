[#include "macro/carouselMacro.ftl"]

[#assign isFolder = content.carouselType?has_content && content.carouselType == "imageFolder"]

[@carousel isFolder=isFolder][/@carousel]
