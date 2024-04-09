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
        this.showTheCategories(this.target_url).then(r=>r);
    },
    firstCheck(){
        if(window.matchMedia('(display-mode: standalone)').matches){
            const installButton = document.getElementById('install');
            installButton.style.display = 'none';
        }
        this.createBreadCrumb({title:'Ikinci El'});
    },
    createBreadCrumb(crumbObject={title:String}){
        let firstCrumb = document.createElement('span');
        firstCrumb.classList.add('crumb');
        firstCrumb.innerHTML = ">   " + crumbObject.title;
        document.querySelector('.bread_crumb').appendChild(firstCrumb);
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
    async showTheCategories(targetURL){
        let categories = document.createElement('div');
        categories.classList.add('cluster');
        categories.innerHTML = `<div class="loader"></div>`;
        document.querySelector('.container').appendChild(categories);
        categories.innerHTML =  this.putInTemplate["mainCategories"](await this.getFacets(targetURL));
        categories.querySelectorAll('li').forEach((item)=>{
            item.addEventListener('click',()=>{
                console.log(targetURL +"/"+ item.dataset.absoluteUrl);
                this.showTheCategories(item.dataset.absoluteUrl);
                this.createBreadCrumb({title:item.dataset.displayValue});
            })
        })


    },
    async getFacets(targetURL=this.target_url){
        let parser = new DOMParser();
        let options = {
            method: 'GET',
            mode: 'cors',
            cache: 'default'
        }
        try {
            let response = await fetch(targetURL, options);
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
                        let targetObject = (JSON.parse(`{"facets":${facetsValue}}`)).facets[0];
                        console.log(targetObject);
                        if(targetObject.SelectedCategory.SubCategories.length){
                            return targetObject.SelectedCategory.SubCategories;
                        }else{
                            return targetObject.Items;
                        }
                    }
                }
            }


        } catch (error) {
            console.error('Error:', error);
        }
    },
    putInTemplate:{
        "mainCategories":(dataObj)=>{
            console.log(dataObj);
            let template = `<ul>`;
            for (let item of dataObj) {
                template += `<li data-absolute-url="${item.AbsoluteUrl}" data-display-value="${item.DisplayValue}">${item.FriendlyUrl}</li>`;
            }
            template += `</ul>`;
            return template
        }
    }


}


window.addEventListener('load', () => {
    aba.init();
})


