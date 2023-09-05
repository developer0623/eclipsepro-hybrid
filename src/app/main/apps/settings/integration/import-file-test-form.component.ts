import angular from 'angular';
import { Ams } from '../../../../amsconfig';
import { FileMapAndValidateResult } from './types';

const ImportFileTestForm = {
  selector: 'importFileTestForm',
  template: `
        <form>
          <div>
            <h2>Test an import file 🧪</h2>
          </div>

          <div layout="column" flex>

            <!-- For reasons I can't explain, putting this inside a md-input-container makes it stop accepting clicks. -->
            <div>
              <input class="ng-hide" id="input-file-id" type="file" />
              <label for="input-file-id" class="md-button md-raised md-primary">Choose File</label>
            </div>

            <md-input-container class="md-block">
              <label>Import file type</label>
              <md-select ng-model="$ctrl.selectedParser" placeholder="Import file type">
                <md-option ng-repeat="parser in $ctrl.availableParsers" value="{{parser}}">
                    {{parser}}
                </md-option>
              </md-select>
            </md-input-container>
          </div>
          <div layout="column" flex>
            <md-input-container class="md-block">
              <md-button class="md-raised md-primary" aria-label="Save" ng-click="$ctrl.onTest()">
                Test
              </md-button>
            </md-input-container>
          </div>

          <div layout="column" class="message-container">
            <div ng-repeat="message in $ctrl.messages track by $index">
              {{message}}
            </div>
          </div>

          <div layout="column" ng-if="$ctrl.testResult">
            <h3>Test results</h3>
            <div ng-if="$ctrl.testResult.errors">
              <h4>There were errors</h4>
              <div ng-repeat="err in $ctrl.testResult.errors track by $index">
                {{err}}
              </div>
            </div>
            <div ng-if="!$ctrl.testResult.errors">
              <h3>File import was successful</h3>
              <div>
                {{$ctrl.testResult.success}} records imported
              </div>
              <div>
                {{$ctrl.testResult.fails}} records failed
              </div>
            </div>
          </div>
        </form>
    `,
  bindings: {
    doTestFunc: '<',
    availableParsers: '<',
  },
  controller: ['$http', class ImportFileTestFormComponent {
    availableParsers = [
      'AmsBundleFileParser',
      'AmsOrdinFileParser',
      'BeckFileParser',
    ];
    selectedParser: string;
    messages: string[] = [];
    testResult: FileMapAndValidateResult;

    /** @ngInject */
    constructor(private $http: angular.IHttpService) { }

    doTest(parser: string, file: File) {
      let payload = new FormData();
      payload.append('file', file);
      payload.append('fileParserName', parser);

      return Rx.Observable.fromPromise(
        this.$http<FileMapAndValidateResult>({
          // Per https://stackoverflow.com/a/37414923/947
          url: `${Ams.Config.BASE_URL}/_api/integration/testImportFile`,
          method: 'POST',
          data: payload,
          headers: { 'Content-Type': undefined },
          transformRequest: angular.identity,
        })
      ).map(r => r.data);
    }

    onTest() {
      const importTestFile = document.getElementById(
        'input-file-id'
      ) as HTMLInputElement;
      if (importTestFile.files.length === 0) {
        this.messages = ['No import file selected'];
        return;
      }

      if (!this.selectedParser) {
        this.messages = ['Choose an import file type'];
        return;
      }

      this.messages = ['Testing...'];

      this.testResult = null;
      this.doTest(this.selectedParser, importTestFile.files[0]).subscribe(
        result => {
          this.messages = ['Test result complete'];
          this.testResult = result;
        },
        ex => {
          this.messages = ex.data.errors;
        }
      );
    }
  }],
};

export default ImportFileTestForm;
