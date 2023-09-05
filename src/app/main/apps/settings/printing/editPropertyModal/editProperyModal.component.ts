import Temp from './editPropertyModal.html';
const EditProperyModal = {
    selector: 'editPropertyModal',
    template: Temp,
    controllerAs: '$ctrl',
    /** @ngInject */
    controller: ['$mdDialog', '$http', 'type', 'properties', class EditProperyModalComponent {
        properties = [];
        mainType;
        constructor(
            private $mdDialog,
            private $http: ng.IHttpService,
            type: string,
            properties: any
        ) {
            this.properties = Object.keys(properties).map(item => {
                return {
                    key: item,
                    value: properties[item]
                }
            });
            this.mainType = type;

        }

        addProperty() {
            const newProperty = {
                key: "",
                value: ""
            };
            this.properties = [...this.properties, newProperty];
        }

        deletePorpery(index) {
            this.properties.splice(index, 1);
        }

        cancel() {
            this.$mdDialog.cancel();
        }

        onChangeDetail(val, type, index) {
            this.properties[index] = {
                ...this.properties[index],
                [type]: val
            };
        }

        save() {
            let objProperties = {};
            this.properties.forEach((item) => {
                if (item.key) {
                    objProperties = {
                        ...objProperties,
                        [item.key]: item.value
                    }
                }
            });
            this.$mdDialog.hide(objProperties);
        }
    }],
};

export default EditProperyModal;
