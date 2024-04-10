let aba = {
    version: '2024.0.1',
    name: 'Ara (Ba) bam (Ara)',
    target_url: 'https://www.arabam.com/ikinci-el',
    defPrompt:null,
    bread_crumb:[],
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
    createBreadCrumb(crumbObject){
        document.querySelector('.bread_crumb').innerHTML = '';
        if(crumbObject){
            this.bread_crumb.push(crumbObject);
        console.log(this.bread_crumb);
        }
        this.bread_crumb.forEach((crumb, index)=>{
            let theCrumb = document.createElement('span');
            theCrumb.classList.add('crumb');
            theCrumb.innerHTML = ">   " + crumb.title;
            document.querySelector('.bread_crumb').appendChild(theCrumb);
        })
        console.log(this.bread_crumb);
        document.querySelectorAll('.bread_crumb span').forEach((theCrumb, index)=>{
            theCrumb.addEventListener('click',()=>{
                this.deleteClusterDivs(index);
                console.log('---------------------------------------')
                console.log(index);
                console.log(this.bread_crumb)
                console.log('---------------------------------------')
                //this.showTheCategories(this.target_url +"/"+ crumb.absoluteUrl);
                this.createBreadCrumb();
            })
        })
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
        console.log(await this.getFacets(targetURL));
        categories.innerHTML =  this.putInTemplate["mainCategories"]({breadCrumbLength: this.bread_crumb.length,items:await this.getFacets(targetURL)});
        categories.querySelectorAll('li').forEach((item)=>{
            item.addEventListener('click',()=>{
                categories.querySelectorAll('li').forEach((li) => {
                    li.classList.remove('chosen');
                });
                item.classList.add("chosen");
                this.deleteClusterDivs(item.dataset.crumbDepth)
                console.log(targetURL +"/"+ item.dataset.absoluteUrl);
                this.showTheCategories(this.target_url +"/"+ item.dataset.absoluteUrl);
                this.createBreadCrumb({title:item.dataset.displayValue, absoluteUrl:item.dataset.absoluteUrl});
            })
        })


    },
    deleteClusterDivs(crumbDepth){
        let counter=0;
        document.querySelectorAll('.cluster').forEach((cluster)=>{
            if(counter>crumbDepth){
                cluster.remove();
            }
            if(counter===crumbDepth) {
                cluster.querySelector('.chosen').classList.remove('chosen');
            }
            counter++;
        })
        document.querySelectorAll('.cluster').forEach((cluster)=>{
        this.bread_crumb.length = crumbDepth;
        })
    },
    async getFacets(targetURL=this.target_url){
        console.log(targetURL);
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
                        if(targetObject.SelectedCategory.SubCategories.length && targetObject.Items.length){
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
            for (let item of dataObj.items) {
                template += `<li data-crumb-depth="${dataObj.breadCrumbLength}" data-absolute-url="${item.AbsoluteUrl}" data-display-value="${item.DisplayValue}">${item.FriendlyUrl}</li>`;
            }
            template += `</ul>`;
            return template
        }
    }


}


window.addEventListener('load', () => {
    aba.init();
})


