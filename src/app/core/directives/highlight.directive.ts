import * as angular from "angular";
import * as hljs from "highlight.js";

export function hljsDirective($timeout, $q, $interpolate) {
    return {
        restrict: 'EA',
        compile : function (tElement, tAttrs)
        {
            let code;
            //No attribute? code is the content
            if ( !tAttrs.code )
            {
                code = tElement.html();
                tElement.empty();
            }

            return function (scope, iElement, iAttrs)
            {
                if ( iAttrs.code )
                {
                    // Attribute? code is the evaluation
                    code = scope.$eval(iAttrs.code);
                }
                let shouldInterpolate = scope.$eval(iAttrs.shouldInterpolate);

                $q.when(code).then(function (code)
                {
                    if ( code )
                    {
                        if ( shouldInterpolate )
                        {
                            code = $interpolate(code)(scope);
                        }

                        let contentParent = angular.element(
                            '<pre><code class="highlight" ng-non-bindable></code></pre>'
                        );

                        iElement.append(contentParent);

                        // Defer highlighting 1-frame to prevent GA interference...
                        $timeout(function ()
                        {
                            render(code, contentParent);
                        }, 34, false);
                    }
                });

                function render(contents, parent)
                {
                    let codeElement = parent.find('code');
                    let lines = contents.split('\n');

                    // Remove empty lines
                    lines = lines.filter(function (line)
                    {
                        return line.trim().length;
                    });

                    // Make it so each line starts at 0 whitespace
                    let firstLineWhitespace = lines[0].match(/^\s*/)[0];
                    let startingWhitespaceRegex = new RegExp('^' + firstLineWhitespace);

                    lines = lines.map(function (line)
                    {
                        return line
                            .replace(startingWhitespaceRegex, '')
                            .replace(/\s+$/, '');
                    });

                    let highlightedCode = hljs.highlight(iAttrs.language || iAttrs.lang, lines.join('\n'), true);
                    highlightedCode.value = highlightedCode.value
                        .replace(/=<span class="hljs-value">""<\/span>/gi, '')
                        .replace('<head>', '')
                        .replace('<head/>', '');
                    codeElement.append(highlightedCode.value).addClass('highlight');
                }
            };
        }
    };
}