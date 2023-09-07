import * as _ from "lodash";
import { IMachine, PatternDef, PatternDefPunch, AvailableMacro, PatternDefPunchError } from "../../../../core/dto";
import { Ams } from "../../../../amsconfig";
import DetailTemplate from "./punch-pattern-detail.html";
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { UserHasRole } from '../../../../core/services/store/user/selectors';

const PunchPatternDetail = {
   selector: "punchPatternDetail",
   bindings: {},
   template: DetailTemplate,
   /** @ngInject */
   controller: ['clientDataStore', '$http', '$stateParams', '$mdToast', '$filter', '$mdDialog', '$scope', '$document', '$location', '$rootScope', class PunchPatternDetailComponent {
      patternId: string;
      unmodifiedPattern: PatternDef;
      pattern: PatternDef;
      machines: IMachine[] = [];
      xlPatterns = [];
      punches: (PatternDefPunch & {resultingPunches: PatternDefPunch[], errors: PatternDefPunchError[], isDeleted: boolean})[];

      punchColumns = [
         {
            field: "idType",
            displayName: "punchType",
         },
         {
            field: "toolId",
            displayName: "tool",
         },
         {
            field: "xOffset",
            displayName: "xOffset",
         },
         {
            field: "xReference",
            displayName: "xReference",
         },
         {
            field: "yOffset",
            displayName: "yOffset",
         },
         {
            field: "yReference",
            displayName: "yReference",
         },
      ];
      xlPatternsColumns = [
         {
            field: "machineNumber",
            displayName: "Machine",
         },
         {
            field: "pattern",
            displayName: "pattern",
         },
         {
            field: "operations",
            displayName: "punchCount",
         },
         {
            field: "status",
            displayName: "Status",
         },
      ];
      xlPatternSubColumns = [
         {
            field: "idType",
            displayName: "type",
         },
         {
            field: "tool",
            displayName: "tool",
         },
         {
            field: "xOffset",
            displayName: "xOffset",
         },
         {
            field: "xReference",
            displayName: "xReference",
         },
         {
            field: "yOffset",
            displayName: "yOffset",
         },
         {
            field: "yReference",
            displayName: "yReference",
         },
      ];

      patternIsModified = false;
      patternIsNew = false;
      disableSave = false;
      selectedTabIndex = 0;
      availableMacros: AvailableMacro[] = [];
      userHasEditorRole = false;

      newPunch = {
         idType: '',
         xOffset: 0,
         yOffset: 0,
         xReference: '',
         yReference: '',
         toolId: 0,
         macroPatternName: '',
         resultingPunches: [],
         errors: [],
         isDeleted: false,
     }

      addNew = false;

      constructor(
         private clientDataStore: ClientDataStore,
         private $http: ng.IHttpService,
         $stateParams: { id: string },
         private $mdToast,
         private $filter,
         private $mdDialog,
         $scope,
         $document,
         private $location: ng.ILocationService,
         private $rootScope
      ) {
         this.patternId = $stateParams.id;

         // we are using 'new' as a magic string to indicate a new pattern. However, in some ways, it's acting like a different route.
         if (this.patternId === "new") {
            this.patternIsNew = true;
            this.pattern = {
               id: '',
               patternName: '',
               punches: [],
               defaultLength: 0,
               option: '',
               importDate: null,
               isPermanent: false,
               hash: '',
               lastUsedDate: null,
               patternNumber: 0,
               isMacro: false,
               changeId: 0,
               machinePatterns: [],
            };
            this.unmodifiedPattern = _.cloneDeep(this.pattern);
            this.punches = [];
            const queryString = this.$location.search();
            if (queryString.name) {
               this.pattern.patternName = queryString.name;
               this.patternIsModified = true;
               this.$rootScope.$broadcast('warningSaved', true);
            }
         } else {
            $http
               .get<PatternDef>(
                  `${Ams.Config.BASE_URL}/_api/punchpatterns/${this.patternId}`
               )
               .then((response) => {
                  this.pattern = response.data;
                  this.unmodifiedPattern = _.cloneDeep(this.pattern);
                  this.punches = this.pattern.punches.map(p=>{return {...p, resultingPunches: [], errors: [], isDeleted: false}});
               });
         }
         $http
            .get<AvailableMacro[]>(
               `${Ams.Config.BASE_URL}/_api/punchpatterns/${this.patternId}/availableMacros`
            )
            .then((response) => {
               this.availableMacros = response.data;
            });



         clientDataStore
            .Selector(UserHasRole('pattern-editor'))
            .subscribe(userHasEditorRole => {
            this.userHasEditorRole = userHasEditorRole;
            });

         const handleKeyDown = function(event) { console.log('event', $scope)
            if(event.altKey && event.keyCode === 80){
               $scope.$ctrl.addPunch();
               $scope.editableForm.$show();
               return false;
           }
         };

         $document.on('keydown', handleKeyDown);

         $scope.$on('$destroy', function() {
            $document.unbind('keydown', handleKeyDown);
            this.$rootScope.$broadcast('warningSaved', false);
         });
      }

      onChangeDetail(value, field) {}

      onClose(selectedItem) {
         selectedItem.isOpen = !selectedItem.isOpen;
      }

      $onDestroy() {}

      saveChanges() {
         if (!this.userHasEditorRole) {
           this.toast('You do not have permission to edit patterns');
           return;
         }
         // expand punches for saving...
         let seq = 1;
         this.pattern.punches = this.punches.filter(p=>!p.isDeleted).flatMap(p => {
            return p.resultingPunches.flatMap(pp => {
               return {...pp, sequence: seq++ };
            });
         });

         if (this.patternIsNew) {
            // create new pattern and redirect to edit page
            if (!this.pattern.patternName) {
               this.toast('Pattern Name is required.');
               return;
            }
            this.$http
               .put<PatternDef>(Ams.Config.BASE_URL + '/_api/punchpatterns', this.pattern)
               .then(response => {
                  // if we're good, redirect to this same page, but with the new id
                  if (response.data.id) {
                     this.$location.path(`/punch-patterns/${response.data.id}`);
                  }
               })
               .catch(err => {
                  console.log('err', err);
                  this.toast('Error saving pattern: ' + err.data.errors.join(' '));
               });
         } else {
            this.$http
               .put<PatternDef>(
                  Ams.Config.BASE_URL + "/_api/punchpatterns/" + this.patternId,
                  this.pattern
               )
               .then(
                  (response) => {
                     this.pattern = response.data;
                     this.unmodifiedPattern = _.cloneDeep(this.pattern);
                     this.punches = this.pattern.punches.map(p=>{return {...p, resultingPunches: [], errors: [], isDeleted: false}});
                     this.patternIsModified = false;
                     this.$rootScope.$broadcast('warningSaved', false);
                     this.toast("Punch updated successfully");
                  },
                  (ex) => {
                     this.toast(
                        "Punch change was not saved. " + ex.data.errors.join(" ")
                     );
                  }
               );
         }
      }

      onChangePatternDetail(value: number | string, path: string) {
        console.log('onChangePatternDetail', value, path);
        this.patternIsModified = true;
        this.$rootScope.$broadcast('warningSaved', true);
      }

      cancelUnsavedChanges() {
         this.pattern = _.cloneDeep(this.unmodifiedPattern);
         this.patternIsModified = false;
         this.$rootScope.$broadcast('warningSaved', false);
         this.punches = this.pattern.punches.map(p=>{return {...p, resultingPunches: [], errors: [], isDeleted: false}});
      }

      updatePunchDetail() {
         this.patternIsModified = true;
         this.$rootScope.$broadcast('warningSaved', true);
         this.disableSave = this.punches.flatMap(p=>p.errors).length > 0;
         console.log('disableSave', this.disableSave);
      }

      selectTab(index) {
         this.selectedTabIndex = index;
      }

      deletePunchRow(sequence) {
         console.log(`del ${sequence}`)
         let remainingPunches = [];
         this.punches.map((item) => {
            if (item.sequence < sequence) {
               remainingPunches.push(item);
            } else if (item.sequence > sequence) {
               const newItem = {
                  ...item,
                  sequence: item.sequence - 1,
               };
               remainingPunches.push(newItem);
            }
         });
         this.punches = remainingPunches;
         this.patternIsModified = true;
         this.$rootScope.$broadcast('warningSaved', true);
      }
      addPunch() {
         this.newPunch = {
            ...this.newPunch,
            idType: 'Tool',
            xReference: '',
            yReference: '',
            resultingPunches: [],
            errors: [],
            isDeleted: false
        };
         this.addNew = true;
      }

      saveNewPunch() {
         setTimeout(() => {
            this.punches.push({
               ...this.newPunch,
               sequence: this.punches.length + 1,
            });
            this.patternIsModified = true;
            this.addNew = false;
            this.newPunch = {
               idType: 'Tool',
               xOffset: 0,
               yOffset: 0,
               xReference: '',
               yReference: '',
               toolId: 0,
               macroPatternName: '',
               resultingPunches: [],
               errors: [],
               isDeleted: false
           }
           this.$rootScope.$broadcast('warningSaved', true);
         }, 200);
      }

      cancelNewPunch() {
         this.addNew = false;
         this.newPunch = {
            idType: 'Tool',
            xOffset: 0,
            yOffset: 0,
            xReference: '',
            yReference: '',
            toolId: 0,
            macroPatternName: '',
            resultingPunches: [],
            errors: [],
            isDeleted: false
        }
      }

      movePunchDown(punchIdx: number) {
         // Note that moving a punch up is the same thing as moving the one above
         // it down. Thus, we only need this one function.
         const by = (selector) => (e1, e2) =>
            selector(e1) > selector(e2) ? 1 : -1;

         // punchIdx is assigned, by the view, after a sort.
         // We rely on that sort order here.
         this.punches.sort(by((x) => x.sequence));
         let punches = this.punches;
         let pos = punchIdx;
         let tmp = punches[pos].sequence;
         punches[pos].sequence = punches[pos + 1].sequence;
         punches[pos + 1].sequence = tmp;
         this.punches.sort(by((x) => x.sequence));
         this.patternIsModified = true;
         this.$rootScope.$broadcast('warningSaved', true);
      }
      focusSelect = (form) => {
         const input = form.$editables[0].inputEl;
         setTimeout(() => {
            input.select();
         }, 0);
      };

      private toast(textContent: string) {
         this.$mdToast.show(
            this.$mdToast
               .simple()
               .textContent(textContent)
               .position("top right")
               .hideDelay(2000)
               .parent("#content")
         );
      }
   }],
};

export default PunchPatternDetail;
