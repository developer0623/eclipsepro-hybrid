import { AvailableMacro, PatternDefPunch, PatternDefPunchError, ReferenceColumnsDef } from '../../../../core/dto';


const PunchRowComp = {
   selector: 'punchRow',
   bindings: {
      punch: '<',
      isMacro: '<',
      availableMacros: '<',
      index: '<',
      isFirst: '<',
      isLast: '<',
      isNew: '<',
      updateDetail: '&',
      moveDown: '&',
      delete: '&',
      cancel: '&',
      saveNew: '&',
   },
   template:`
<div ng-class="{'deleted-cell':$ctrl.punch.isDeleted,'error-cell':$ctrl.punch.errors.length > 0,'color-green':$ctrl.punch.resultingPunches.length > 1}">
   <form class="material-usage-item" ng-click="rowForm.$show();" blur="submit" editable-form name="rowForm">
      <div class="main-con punch-pattern-detail-edit">
         <div editable-select="$ctrl.punch.idType" buttons="no" e-ng-options="s as s for s in $ctrl.typeList"
            onaftersave="$ctrl.updatePunchDetail();">
            {{$ctrl.punch.idType}}
         </div>
      </div>
      <div ng-if="$ctrl.punch.idType !== 'Macro'" class="main-con punch-pattern-detail-edit">
         <div editable-text="$ctrl.toolId" buttons="no" e-step="any" e-min="0"
            onaftersave="$ctrl.updatePunchDetail();">
            {{$ctrl.toolId}}
         </div>
      </div>
      <div ng-if="$ctrl.punch.idType === 'Macro'" class="main-con punch-pattern-detail-edit">
         <div editable-select="$ctrl.punch.macroPatternName" buttons="no"
            e-ng-options="s.macroName as s.macroName for s in $ctrl.availableMacros"
            onaftersave="$ctrl.updatePunchDetail();">
            {{$ctrl.punch.macroPatternName}}
         </div>
      </div>
      <div class="main-con punch-pattern-detail-edit">
         <div editable-text="$ctrl.xOffset" buttons="no" e-step="any" e-min="0"
            onaftersave="$ctrl.updatePunchDetail();">
            {{$ctrl.xOffset}}
         </div>
      </div>
      <div class="main-con punch-pattern-detail-edit">
         <div ng-if="!$ctrl.isMacro" editable-select="$ctrl.xReference" buttons="no"
            e-ng-options="s.value as s.text for s in $ctrl.referenceColumns" onaftersave="$ctrl.updatePunchDetail();">
            {{$ctrl.onGetReferenceValue('x', $ctrl.xReference)}}
         </div>
         <div ng-style="$ctrl.onGetXreferenceError($ctrl.xReference)" ng-if="$ctrl.isMacro"
            editable-select="$ctrl.xReference" buttons="no"
            e-ng-options="s.value as s.text for s in $ctrl.macroReferenceColumns"
            onaftersave="$ctrl.updatePunchDetail();">
            {{$ctrl.onGetReferenceValue('x', $ctrl.xReference)}}
         </div>
      </div>
      <div class="main-con punch-pattern-detail-edit">
         <div editable-text="$ctrl.yOffset" buttons="no" e-step="any" e-min="0"
            onaftersave="$ctrl.updatePunchDetail();">
            {{$ctrl.yOffset}}
         </div>
      </div>
      <div class="main-con punch-pattern-detail-edit">
         <div editable-select="$ctrl.yReference" buttons="no"
            e-ng-options="s.value as s.text for s in $ctrl.yReferenceColumns"
            onaftersave="$ctrl.updatePunchDetail();">
            {{$ctrl.onGetReferenceValue('y', $ctrl.yReference)}}
         </div>
      </div>
      <div class="main-con punch-pattern-detail-edit action-con" ng-if="!$ctrl.isNew">
         <!-- Moving a punch up is the same operation as moving the one above it down. -->

         <md-button class="md-icon-button arrow-btn" ng-if="!$ctrl.isFirst"
            ng-click="$ctrl.movePunchDown($ctrl.index-1); $event.stopPropagation();">
            <md-icon md-font-icon="mdi-arrow-up" class="mdi"></md-icon>
         </md-button>
         <md-button class="md-icon-button arrow-btn" ng-if="$ctrl.isFirst">
         </md-button>
         <md-button class="md-icon-button arrow-btn" ng-if="!$ctrl.isLast"
            ng-click="$ctrl.movePunchDown($ctrl.index); $event.stopPropagation();">
            <md-icon md-font-icon="mdi-arrow-down" class="mdi"></md-icon>
         </md-button>
         <md-button class="md-icon-button arrow-btn" ng-if="$ctrl.isLast">
         </md-button>
      </div>
      <div class="main-con" ng-if="$ctrl.isNew"></div>

      <div class="main-con punch-pattern-detail-edit action-con" ng-show="!rowForm.$visible" ng-if="!$ctrl.isNew">
         <!-- Edit icon -->
         <md-button class="md-icon-button arrow-btn"
            ng-click="rowForm.$show(); $event.stopPropagation();">
            <md-icon md-font-icon="mdi-pencil" class="mdi"></md-icon>
         </md-button>

         <md-button class="md-icon-button punch-deletebtn"
            ng-click="$ctrl.deletePunchRow(punch.sequence); $event.stopPropagation();">
            <md-icon ng-if="!$ctrl.punch.isDeleted" md-font-icon="mdi-delete" class="mdi"></md-icon>
            <md-icon ng-if="$ctrl.punch.isDeleted" md-font-icon="mdi-delete-restore" class="mdi"></md-icon>
         </md-button>
      </div>

      <div class="main-con punch-pattern-detail-edit action-con" ng-show="rowForm.$visible" ng-if="!$ctrl.isNew">
         <!-- Save or Cancel -->
         <md-button class="md-icon-button punch-deletebtn" type="submit" ng-click=" $event.stopPropagation();">
            <md-icon md-font-icon="mdi-content-save" class="mdi"></md-icon>
         </md-button>
         <md-button class="md-icon-button arrow-btn"
            ng-click="rowForm.$cancel(); $ctrl.onCancel(); $event.stopPropagation();">
            <md-icon md-font-icon="mdi-cancel" class="mdi"></md-icon>
         </md-button>
      </div>
      <div class="main-con punch-pattern-detail-edit action-con" ng-if="$ctrl.isNew">
         <md-button class="md-icon-button punch-deletebtn" type="submit"
            ng-click="$ctrl.saveNewPunch()">
            <md-icon md-font-icon="mdi-content-save" class="mdi"></md-icon>
         </md-button>
         <md-button class="md-icon-button arrow-btn"
            ng-click="$ctrl.cancelNewPunch(); editableForm.$cancel()">
            <md-icon md-font-icon="mdi-cancel" class="mdi"></md-icon>
         </md-button>
      </div>
   </form>
</div>`,
   controller: ['$filter', 'unitsService', class PunchRow {

      referenceColumns: ReferenceColumnsDef[] = [
         { value: "LeadingEdge", text: "Leading Edge" },
         { value: "TrailingEdge", text: "Trailing Edge" },
         { value: "LeadingCenter", text: "Leading Center" },
         { value: "TrailingCenter", text: "Trailing Center" },
         { value: "EdgeMirror", text: "Edge Mirror", resultingRefValue: ["LeadingEdge", "TrailingEdge"] },
         { value: "CenterMirror", text: "Center Mirror", resultingRefValue: ["LeadingCenter", "TrailingCenter"] },
         { value: "EvenSpacing", text: "Even Spacing" },
         { value: "SpacingLimit", text: "Spacing Limit" },
         { value: "ProportionalMin", text: "ProportionalMin" },
         { value: "ProportionalMax", text: "ProportionalMax" },
         { value: "ProportionalLimit", text: "ProportionalLimit" },
         { value: "KerfAdjust", text: "Kerf Adjust" },
         { value: "Independent", text: "Independent" },
      ];
      macroReferenceColumns: ReferenceColumnsDef[] = [
         { value: "LeadingCenter", text: "Leading Center" },
         { value: "TrailingCenter", text: "Trailing Center" },
         { value: "CenterMirror", text: "Center Mirror", resultingRefValue: ["LeadingCenter", "TrailingCenter"] },
      ];

      yReferenceColumns: ReferenceColumnsDef[] = [
         { value: "None", text: "None" },
         { value: "CenterPlus", text: "Center+" },
         { value: "CenterMinus", text: "Center-" },
         { value: "PlusEdge", text: "+Edge" },
         { value: "MinusEdge", text: "-Edge" },
         { value: "MacroPlus", text: "Macro+" },
         { value: "MacroMinus", text: "Macro-" },
         { value: "CenterMirror", text: "Center Mirror", resultingRefValue: ["CenterPlus", "CenterMinus"] },
         { value: "EdgeMirror", text: "Edge Mirror", resultingRefValue: ["PlusEdge", "MinusEdge"] },
      ];

      typeList = ["Tool", "Shape", "Macro"];

      references = this.referenceColumns;

      punch: PatternDefPunch & {resultingPunches: PatternDefPunch[], errors: PatternDefPunchError[], isDeleted: boolean};
      isMacro: boolean;
      availableMacros: AvailableMacro[];
      index: number;
      isFirst: boolean;
      isLast: boolean;
      isNew: boolean;

      // upstream methods
      updateDetail;
      moveDown;
      delete;
      cancel;
      saveNew;

      // expandable properties
      toolId: string;
      xReference: string;
      yReference: string;
      xOffset: string;
      yOffset: string;

      constructor(
         private $filter, private unitsService) {

      }

      $onChanges() {
         this.references = this.isMacro ? this.macroReferenceColumns : this.referenceColumns;

         if (this.punch?.resultingPunches) {
            // maybe we have already expanded???
            if (this.punch.resultingPunches.length === 0) {
               this.toolId = this.punch.toolId.toString();
               this.xReference = this.punch.xReference ? this.punch.xReference : this.references[0].value;
               this.yReference = this.punch.yReference ? this.punch.yReference : this.yReferenceColumns[0].value;
               this.xOffset = this.formatIn(this.punch.xOffset);
               this.yOffset = this.formatIn(this.punch.yOffset);
               let {resultingPunches, ...rest} = this.punch;
               this.punch.resultingPunches.push(rest);
            } else {
               // this is already expanded, maybe it's ok???
               console.log('already expanded', this.punch);
               // but I think we need to csv the list of resultingPunches for display
               this.toolId = this.punch.resultingPunches
                  .map(p=>p.toolId.toString())
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .reduce((acc, val) => acc + ', ' + val);
               this.xReference = this.punch.xReference;
               this.yReference = this.punch.yReference;
               this.xOffset = this.punch.resultingPunches
                  .map(p=>this.formatIn(p.xOffset))
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .reduce((acc, val) => acc + ', ' + val); // todo: localize inch value
               this.yOffset = this.punch.resultingPunches
                  .map(p=>this.formatIn(p.yOffset))
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .reduce((acc, val) => acc + ', ' + val); // todo: localize inch value
            }
         }
      }
      onGetReferenceValue(type, val) {
         if (type === "x") {
            const selected = this.$filter("filter")(this.references, {
               value: val,
            });
            return selected.length ? selected[0].text : "";
         } else {
            const selected = this.$filter("filter")(this.yReferenceColumns, {
               value: val,
            });
            return selected.length ? selected[0].text : "";
         }
      }
      onGetXreferenceError(reference) {
         const selected = this.$filter("filter")(this.macroReferenceColumns, {
            value: reference,
         });
         return selected.length ? { color: 'black' } : { color: 'red' };
      }

      movePunchDown(dir){
         console.log(`move ${this.index} to ${dir}`);
         this.moveDown({punchIdx: dir});
      }

      deletePunchRow(){
         console.log(`delete ${this.punch.sequence}`);
         //this.delete({sequence: this.punch.sequence});
         this.punch.isDeleted = !this.punch.isDeleted;
         this.updatePunchDetail();

         // if we are deleting, no need to show any errors
         if (this.punch.isDeleted) {
            this.punch.errors = [];
            this.updateDetail();
         }
      }

      onCancel(){
         console.log(`cancel`);
         this.cancel();
      }

      cancelNewPunch(){
         console.log(`cancel new`);
         this.cancel();
      }

      saveNewPunch(){
         console.log(`save new`);
         this.updatePunchDetail();
         this.saveNew();
      }

      updatePunchDetail() {
         // clear the errors
         let newErrors: PatternDefPunchError[] = [];
         // are there any expanding features?
         // - Mirror References
         // - commas in offsets and tools
         let tools = this.toolId.split(',').map(t=>this.parseInt(t, 'toolId', newErrors));
         let xOffs = this.xOffset.split(',').map(x=>this.parseLengthToInch(x, 'xOffset', newErrors));
         let yOffs = this.yOffset.split(',').map(x=>this.parseLengthToInch(x, 'yOffset', newErrors));
         // todo: validate results ^^^

         let xRef = this.references.find(r=>r.value===this.xReference) ?? this.references[0]; // instead of defaulting, it should probably error
         let xRefs = xRef.resultingRefValue ? xRef.resultingRefValue : [this.xReference];
         let yRef = this.yReferenceColumns.find(r=>r.value === this.yReference) ?? this.yReferenceColumns[0];
         let yRefs = yRef.resultingRefValue ? yRef.resultingRefValue : [this.yReference];
         let index = 0;

         this.punch.resultingPunches = yRefs.flatMap(yr => {
            return xRefs.flatMap(xr => {
               return xOffs.flatMap(x => {
                  return yOffs.flatMap(y => {
                     return tools.flatMap(t=>{
                        let {resultingPunches, ...rest} = this.punch;
                        return {...rest,
                           toolId: t,
                           xOffset: x,
                           yOffset: y,
                           xReference: xr,
                           yReference: yr,
                           punchId: (index++ === 0 ? this.punch.punchId : undefined),
                        };
                     });
                  });
               });
            });
         });
         console.log('results', this.punch.resultingPunches, newErrors);
         this.punch.errors = newErrors;
         this.updateDetail();
      }

      parseLengthToInch(s: string, field: string, errors: PatternDefPunchError[]): number {
         // todo: a bunch more stuff
         let i = parseFloat(s);
         if (isNaN(i)) {
            errors.push({
               field: field,
               input: s,
               error: "Could not convert"
            });
            return 0; // ????
         }

         let x = this.unitsService.convertUnits(i, this.unitsService.getUserUnits('in', true), 3, 'in');
         //console.log(`parseLengthToInch: ${s} => ${x}`);
         return x;
      }

      parseInt(s: string, field: string, errors: PatternDefPunchError[]): number {
         // todo: a bunch more stuff
         let i = parseInt(s);
         if (isNaN(i)) {
            errors.push({
               field: field,
               input: s,
               error: "Could not convert"
            });
            return 0; // ????
         }

         return i;
      }

      formatIn(i: number): string {
         let x = this.unitsService.formatUserUnits(i, 'in', 3, true, '', true);
         //console.log(`formatIn: ${i} => ${x}`);
         return x;
      }
   }],
}

export default PunchRowComp;
