let aba = {
    version: '2024.0.1',
    name: 'Ara (Ba) bam (Ara)',
    target_url: 'https://www.arabam.com/ikinci-el',
    defPrompt:null,
    init(){
        this.firstCheck();
        this.registerSW();
        this.beforeInstallPrompt();
        this.initInstallPrompt();
        this.afterInstalled();
        //
        this.showMainCategories();
    },
    firstCheck(){
        if(window.matchMedia('(display-mode: standalone)').matches){
            const installButton = document.getElementById('install');
            installButton.style.display = 'none';
        }
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
    afterInstalled(){
        window.addEventListener('appinstalled', (evt) => {
            // App was installed, hide the install button
            const installButton = document.getElementById('install');
            installButton.style.display = 'none';
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
    async showMainCategories(){
        document.body.innerHTML += this.putInTemplate["mainCategories"](await this.getFacets());//this.showmainCategories(await this.getFacets());
    },
    async getFacets(){
        let parser = new DOMParser();
        let options = {
            method: 'GET',
            mode: 'cors',
            cache: 'default'
        }
        try {
            let response = await fetch(this.target_url, options);
            console.log(response.ok);
            let text = await response.text();
            let html = parser.parseFromString(text, 'text/html');

            let scripts = html.getElementsByTagName('script');
            for (let script of scripts) {
                // Check if the script contains the "facets" variable
                if (script.textContent.includes('var facets =')) {
                    // Extract the value of the "facets" variable using a regular expression
                    let match = script.textContent.match(/var facets = (.*?);/);
                    if (match) {
                        let facetsValue = match[1];
                        console.log(JSON.parse(`{"facets":${facetsValue}}`));
                        return (JSON.parse(`{"facets":${facetsValue}}`)).facets[0].Items;
                    }
                }
            }


        } catch (error) {
            console.error('Error:', error);
        }
    },
    putInTemplate:{
        "mainCategories":(dataObj)=>{
            let template = `<table>`;
            for (let item of dataObj) {
                template += `<tr><td>${item.FriendlyUrl}</td></tr>`;
            }
            template += `</table>`;
            return template
        }
    }


}


window.addEventListener('load', () => {
    aba.init();
})


