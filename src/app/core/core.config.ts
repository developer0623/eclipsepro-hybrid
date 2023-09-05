import toastr from 'toastr';
import { Ams } from '../amsconfig';

config.$inject = ['$ariaProvider','$logProvider', 'msScrollConfigProvider', '$translateProvider', '$provide', 'eclipseProConfigProvider'];
export function config(
    $ariaProvider,
    $logProvider,
    msScrollConfigProvider,
    $translateProvider,
    $provide,
    eclipseProConfigProvider
) {
   // config Raygun error logging
   $provide.decorator('$exceptionHandler', ['$delegate', 'errors', function ($delegate, errors) {
      return function exceptionHandlerProxy(error, cause) {
         errors.reportError(error);
         $delegate(error, cause);
      };
   }]);

    // ng-aria configuration
    $ariaProvider.config({
        tabindex: false
    });

    // Enable debug logging
    $logProvider.debugEnabled(true);

    // msScroll configuration
    msScrollConfigProvider.config({
        wheelPropagation: true
    });

    // toastr configuration
    toastr.options.timeOut = 3000;
    toastr.options.positionClass = 'toast-top-right';
    toastr.options.preventDuplicates = true;
    toastr.options.progressBar = true;

    // angular-translate configuration using English as fallback
    $translateProvider.preferredLanguage('en');
    // Get languages from api.
    $translateProvider.useUrlLoader(Ams.Config.BASE_URL + '/api/i18n', {
        queryParameter: 'languageCode'
    });
    // Save preference to local storage
    $translateProvider.useLocalStorage();
    $translateProvider.useSanitizeValueStrategy('sanitize');

   //  // Text Angular options
    $provide.decorator('taOptions', [
        '$delegate', function (taOptions) {
            taOptions.forceTextAngularSanitize = false;
            taOptions.toolbar = [
                ['bold', 'italics', 'underline', 'ul', 'ol', 'quote']
            ];

            taOptions.classes = {
                focussed: 'focussed',
                toolbar: 'ta-toolbar',
                toolbarGroup: 'ta-group',
                toolbarButton: 'md-button',
                toolbarButtonActive: 'active',
                disabled: '',
                textEditor: 'form-control',
                htmlEditor: 'form-control'
            };

            return taOptions;
        }
    ]);

    // Text Angular tools
    $provide.decorator('taTools', [
        '$delegate', 'taTools', function (taTools) {
            taTools.bold.iconclass = 'icon-format-bold';
            taTools.italics.iconclass = 'icon-format-italic';
            taTools.underline.iconclass = 'icon-format-underline';
            taTools.ul.iconclass = 'icon-format-list-bulleted';
            taTools.ol.iconclass = 'icon-format-list-numbers';
            taTools.quote.iconclass = 'icon-format-quote';

            return taTools;
        }
    ]);

    // Eclipse Pro theme configurations
    eclipseProConfigProvider.config({
        'disableCustomScrollbars': false,
        'disableCustomScrollbarsOnMobile': true,
        'disableMdInkRippleOnMobile': false
    });
}
