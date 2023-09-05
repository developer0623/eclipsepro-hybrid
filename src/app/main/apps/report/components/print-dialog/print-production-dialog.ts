export function PrintDialogController(
    $mdDialog,
    $timeout,
    data,
    duration,
    startDate,
    endDate,
    shift,
    factoryName
) {
    let ctrl = this;
    this.init = function () {
        ctrl.sizes = [
            { id: 0, size: '8.5 x 11' },
            { id: 1, size: '11 x 17' },
        ];
        ctrl.selectedSize = 0;
        ctrl.printStyles = [
            { id: 0, value: "Don't Include" },
            { id: 1, value: 'Side, On Next Page' },
            { id: 2, value: 'Stacked' },
        ];
        ctrl.selectedStyle = 0;
        ctrl.duration = duration;
        ctrl.data = data;
        ctrl.startDate = startDate;
        ctrl.endDate = endDate;
        ctrl.shift = shift;
        ctrl.nextPage = 0;
        ctrl.factoryName = factoryName;
    };
    this.setPageSize = () => {
        let style = document.createElement('style');
        if (!this.selectedSize) {
            style.innerHTML = '@page {size: 8.5in 11in}';
        } else {
            style.innerHTML = '@page {size: 11in 17in}';
        }
        document.head.appendChild(style);
    };

    this.change = () => {
        ctrl.nextPage = 0;
    };

    this.cancel = () => {
        $mdDialog.hide();
    };

    this.print = () => {
        if (ctrl.selectedStyle === 0 && !ctrl.nextPage) {
            ctrl.nextPage = 1;
        } else {
            this.setPageSize();
            let printContents = document.getElementById('main-print-body').innerHTML;
            let mainComp = document.getElementById('print-body');
            mainComp.innerHTML = printContents;
            window.print();
            mainComp.innerHTML = '';
        }
    };

    $timeout(function () {
        ctrl.init();
    });
}