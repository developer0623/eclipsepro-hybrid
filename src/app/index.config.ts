httpConfig.$inject = ['$httpProvider'];
export function httpConfig($httpProvider) {
    // So our auth cookie is included on xhr requests
    $httpProvider.defaults.withCredentials = true;

    // Put your custom configurations here
}
