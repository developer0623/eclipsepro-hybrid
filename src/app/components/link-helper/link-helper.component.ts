import tempHtml from './link-helper.html';

const LinkHelper = {
  selector: "linkHelper",
  bindings: {
    documentId: '=',
    label: '=',
    hideType: '='
  },

  template: tempHtml,
  controller: [class LinkHelperComponent {
    constructor() {}

    documentId: string;
    label: string;
    docType: string;
    hideType: boolean;
    knownType: boolean = false;
    id: string;
    idFound: boolean = false;
    mainData;

    $onChanges(changes) {
      this.docType = this.documentId.split('/')[0];
      this.id = this.documentId.substring(this.documentId.indexOf('/')+1);
      this.idFound = Boolean(this.id) ? !(this.id === 'null' || this.id === '0') : false;

      switch (this.docType) {
        case 'JobDetail':
          this.knownType = true;
          break;
        case 'Coil':
          this.knownType = true;
          break;
        case 'PunchPattern':
          this.knownType = true;
          break;
        case 'Material':
          if (this.id === 'NO COIL MATCH') {
            this.idFound = false;
          }
          this.knownType = true;
          break;
        default:
          console.log(`Unknown type:${this.docType}`);
          break;
      }
    }

  }],
  controllerAs: '$ctrl'
};

export default LinkHelper;
