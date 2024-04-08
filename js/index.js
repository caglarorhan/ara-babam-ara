let aba = {
    version: '2024.0.1',
    name: 'Ara (Ba) bam (Ara)',
    target_url: 'https://www.arabam.com/',
    defPrompt:null,
    init(){
        this.registerSW();
        this.beforeInstallPrompt();
        this.initInstallPrompt();
    },
    beforeInstallPrompt(){
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.defPrompt = e; //test
        });
    },
    initInstallPrompt(){
        const button = document.getElementById('install');
        button.addEventListener('click', () => {
            this.defPrompt.prompt();
            this.defPrompt.userChoice
                .then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the A2HS prompt');
                    } else {
                        console.log('User dismissed the A2HS prompt');
                    }
                    this.defPrompt = null;
                });
        });
    },
    registerSW(){
        console.log('Registering SW');
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    console.log('Service Worker registered with scope: ', registration.scope);
                    //registration.update();
                })
                .catch((err) => {
                    console.log('Service Worker registration failed: ', err);
                });
        }
    },


}


window.addEventListener('load', () => {
    aba.init();
})


