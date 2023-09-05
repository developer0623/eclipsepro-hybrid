import * as angular from "angular";
import * as moment from "moment";
import { IApiResolverService, IAuthService } from "../reference";
import { Fx } from "./dto";
import { AddSubscription } from "./services/clientData.actions";
import { ClientDataEffects } from "./services/clientData.effects";
import { ClientDataStore } from "./services/clientData.store";
import { Dispatcher, EffectsModule } from "./services/lib/store";
import { ProductionExplorerEffects } from "./services/store/productionexplorer/effects";
import { SchedulerEffects } from "./services/store/scheduler/effects";
import { SubscriptionService } from "./services/subscription.service";
import { OrderEffects } from "./services/store/order/effects";

runBlock.$inject = ['eclipseProGenerator', 'eclipseProConfig', 'eclipseProHelper', 'featureFlagService', 'clientDataStore',
   'clientDataDispatcher', 'subscriptionService', 'apiResolver', 'authService', '$location', '$translate',
   '$mdToast', '$http', 'editableOptions',  '$rootScope','$transitions'];
export function runBlock(
    eclipseProGenerator,
    eclipseProConfig,
    eclipseProHelper,
    featureFlagService,
    clientDataStore: ClientDataStore,
    clientDataDispatcher: Dispatcher,
    subscriptionService: SubscriptionService,
    apiResolver: IApiResolverService,
    authService: IAuthService,
    $location,
    $translate,
    $mdToast,
    $http,
    editableOptions,
    $rootScope,
    $transitions
) {
    /**
     * Generate extra classes based on registered themes so we
     * can use same colors with non-angular-material elements
     */
    eclipseProGenerator.generate();
    editableOptions.theme = 'bs3';

    // It's important that the client data effects are set up *before* any collection subscriptions are created. Because
    // the effects have a role in those subscriptions.
    const effects = new ClientDataEffects(clientDataDispatcher, subscriptionService, clientDataStore, apiResolver, $mdToast, $rootScope );
    const prodExpEffects = new ProductionExplorerEffects(clientDataDispatcher, apiResolver, clientDataDispatcher);
    const schedulerEffects = new SchedulerEffects(clientDataDispatcher, apiResolver, clientDataDispatcher, clientDataStore, $mdToast);
    const orderEffects = new OrderEffects(clientDataDispatcher, apiResolver, $http, clientDataDispatcher, $mdToast, $rootScope)

    EffectsModule.run(clientDataDispatcher, [effects, prodExpEffects, schedulerEffects, orderEffects]);

    // User may already be authenticated (we'd have a cookie or similar) so attempt
    // to get the session object. This is important as claims are delivered on this
    // UserSession object, and they may have changed.
    authService.getSession();

    clientDataStore.SelectSystemPreferences()
        .subscribe(prefs => {
            $translate.use(prefs.systemLanguage);
            moment.locale(prefs.systemLanguage);
        });

    // Entire app gets a subscription to this one.
    clientDataDispatcher.dispatch(new AddSubscription(new Fx.Subscription('SystemInfo', new Fx.All())))

    featureFlagService.refresh();

    /**
     * Disable md-ink-ripple effects on mobile
     * if 'disableMdInkRippleOnMobile' config enabled
     */
    if (eclipseProHelper.isMobile()) {
        let body = angular.element(document.body);
        body.attr('md-no-tooltip', 'true');

        if (eclipseProConfig.getConfig('disableMdInkRippleOnMobile')) {
            body.attr('md-no-ink', 'true');
        }
    }


    clientDataStore.SelectSystemPreferences()
        .subscribe(pref => {
            if ($location.host() === 'localhost' && pref.redirectFromLocalhost && pref.intranetUrl) {
                console.log('Localhost detected. Redirecting to ' + pref.intranetUrl);
                window.location.href = pref.intranetUrl;
            }
        });


}
