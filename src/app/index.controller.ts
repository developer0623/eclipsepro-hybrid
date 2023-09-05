AppController.$inject = ['eclipseProTheming']
export function AppController(eclipseProTheming) {
    let vm = this;

    console.log('test')

    // Data
    vm.themes = eclipseProTheming.themes;

    //////////
}
