export function newBundlerRuleController(
    $mdDialog,
    type: string
) {
    let ctrl = this;
    ctrl.type = type;
    ctrl.result = {
        type,
        customer: '',
        tooling: '',
    };

    ctrl.add = function () {
        console.log(
            `adding type ${this.type} customer:${this.result.customer}, tooling:${this.result.tooling}`
        );
        $mdDialog.hide(ctrl.result);
    };
}