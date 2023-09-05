import * as moment from "moment";
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { ISystemPreferences, ILanguage } from '../../../../core/dto';
import { IApiService } from "../../../../reference";
import { FeatureFlagService } from '../../../../core/services/featureflag.service';
import Temp from './system-preferences.html';

const SystemPreferences_ = {
    selector: 'systemPreferences',
    template: Temp,
    controller: ['$scope', 'api', '$translate', '$mdToast', 'unitsService', 'clientDataStore', 'featureFlagService', class SystemPreferencesController {
        systemPreferences: ISystemPreferences;
        languages: ILanguage[] = [];
        selectedLanguage: any;
        units: any[];
        selectedUnit: any;
        experimentalFeatures: boolean;
        /** @ngInject */
        constructor(
            $scope: angular.IScope,
            private api: IApiService,
            private $translate,
            private $mdToast,
            private unitsService,
            clientDataStore: ClientDataStore,
            private featureFlagService: FeatureFlagService
        ) {
            this.getLanguages();
            clientDataStore.SelectSystemPreferences()
                .subscribe(preferences => {
                    this.systemPreferences = preferences;
                    this.selectTheLanguage();

                    this.units = unitsService.getBaseUnits();
                    this.units.forEach(unit => {
                        this.units[unit.key] = unit;
                    });
                    this.selectedUnit = this.units[this.systemPreferences.inchesUnit];
            });

            this.experimentalFeatures =
                !featureFlagService.featureDisabled('experimental');
        }

        getLanguages() {
            this.api.system.languages.get(
                {},
                data => {
                    console.log('languages', data);
                    this.languages = data;
                    this.selectTheLanguage();
                },
                error => {
                    console.log(error);
                }
            );
        }

        selectTheLanguage() {
            if (this.systemPreferences && this.systemPreferences.systemLanguage) {
                if (this.languages.length > 0) {
                    this.selectedLanguage = this.languages.find(l=>l.code === this.systemPreferences.systemLanguage);
                }
            }
        }

        /**
         * Change Language Preference
         */
        updatePrefs(lang) {
            this.systemPreferences.systemLanguage = lang.code;
            this.api.systemPreferences.save({systemLanguage: lang.code});
        }

        /**
         * Change Language Preference
         */
        changeLanguage(lang) {
            this.selectedLanguage = lang;
            this.$translate.use(lang.code);
            moment.locale(lang.code);
            this.updatePrefs(lang);
        }

        changeUnit(unit) {
            this.selectedUnit = unit;
            this.systemPreferences.inchesUnit = unit.key;
            this.unitsService.currentInchesKey = unit.key;
            this.api.systemPreferences.save({inchesUnit: unit.key});
        }

        setExperimentalFeatures() {
            this.featureFlagService
                .setFeature('experimental', this.experimentalFeatures)
                .then(() => document.location.reload());
        }

        update(property: string) {
            this.api.systemPreferences.save({[property]: this.systemPreferences[property]});
        }
    }],
};

export default SystemPreferences_;
