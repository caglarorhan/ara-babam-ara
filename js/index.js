let aba = {
    version: '2024.0.1',
    name: 'Ara (Ba) bam (Ara)',
    target_url: 'https://www.arabam.com/ikinci-el',
    defPrompt:null,
    bread_crumb:[],
    categoryMemory:{},
    followUpMemory:[],
    init(){
        this.firstCheck();
        this.registerSW();
        this.beforeInstallPrompt();
        this.initInstallPrompt();
        this.afterInstalled();

        //
        this.showTheCategories(this.target_url).then(r=>r);
    },
    followUpACategory(dataObj){

        if(document.querySelector('#followUpDialog')){
            document.querySelector('#followUpDialog').remove();
        }
        console.log('follow button clicked');
        let path = this.bread_crumb.map(bc=>bc.title).join(' > ');
        let absoluteUrl = this.bread_crumb[this.bread_crumb.length-1].absoluteUrl;
        let categoryData = {path, absoluteUrl};
        let theDialog =  this.putInTemplate["followUp"](categoryData);
        document.body.insertAdjacentHTML('beforeend',theDialog);
        document.getElementById('followUpDialog').showModal();

        document.getElementById('save_button').addEventListener('click', ()=>{

            let isAlreadyFollowed = this.followUpMemory.findIndex(savedItem=>savedItem.absoluteUrl === absoluteUrl);
            console.log(isAlreadyFollowed);
            if(isAlreadyFollowed !== -1){
                document.getElementById('followUpDialog').innerHTML="Zaten takipteymisiz!!"
                setTimeout(()=>{
                    document.getElementById('followUpDialog').close();
                },1500);
                return;
            }
            this.followUpMemory.push(categoryData);
            console.log(this.followUpMemory);
            document.getElementById('followUpDialog').innerHTML="Basariyla takibe alindi!"
            setTimeout(()=>{
                document.getElementById('followUpDialog').close();
            },1500);
        })
    },
    memorizeCategories(path=[]){
        if(!path || !Array.isArray(path)) {return false;}


    },
    reCallCategories(){

    },
    firstCheck(){
        if(window.matchMedia('(display-mode: standalone)').matches){
            const installButton = document.getElementById('install');
            installButton.style.display = 'none';
        }
        this.createBreadCrumb({title:'Ikinci El', absoluteUrl: ''});
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
                        //console.log('User accepted the A2HS prompt');
                    } else {
                        //console.log('User dismissed the A2HS prompt');
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
        //console.log('Registering SW');
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    //console.log('Service Worker registered with scope: ', registration.scope);
                    registration.update();
                })
                .catch((err) => {
                    //console.log('Service Worker registration failed: ', err);
                });
        }
    },
    createBreadCrumb(crumbObject){
        if(crumbObject){
            this.bread_crumb.push(crumbObject);
            console.log(`Yeni kayıt eklendi: ${crumbObject.title} - ${crumbObject.absoluteUrl}`);
            console.log(this.bread_crumb);
        }
        this.createBreadCrumbRoute();
    },
    createBreadCrumbRoute(){
        document.querySelector('.bread_crumb').innerHTML = '';
        this.bread_crumb.forEach((crumb, index)=>{
            let theCrumb = document.createElement('span');
            theCrumb.classList.add('crumb');
            theCrumb.innerHTML = ">   " + crumb.title;
            theCrumb.dataset.depth = index.toString();
            document.querySelector('.bread_crumb').appendChild(theCrumb);
        })
        //console.log(this.bread_crumb);
        document.querySelectorAll('.bread_crumb span').forEach((theCrumb, index)=>{
            theCrumb.addEventListener('click',(event)=>{

                this.resizeBreadCrumb(index);
                this.deleteClusterDivs(index);
            })
        })
    },
    resizeBreadCrumb(index){
        index = parseInt(index);
        console.log(`bread crumb icin kullanilacak resize sayisi: ${index}`);
        console.log(`bread crumb size: ${this.bread_crumb.length}`);
        this.bread_crumb.length = index;
        this.createBreadCrumbRoute();
    },
    async showTheCategories(targetURL){
            let categories = document.createElement('div');
            categories.classList.add('cluster');
            categories.innerHTML = `<div class="loader"></div>`;
            document.querySelector('.container').appendChild(categories);
       // console.log(await this.getFacets(targetURL));
        const categoryItems = await this.getFacets(targetURL);
        console.log(categoryItems);
        console.log(this.bread_crumb);
        if(categoryItems===Error){
            categories.innerHTML =  this.putInTemplate["Error"]({Error});
            return;
        }
        let isAlreadyThere = this.bread_crumb.find(crumb=> {
            console.log(crumb.title, categoryItems[0].FriendlyUrl);
            return crumb.title === categoryItems[0].FriendlyUrl
        });
        if(isAlreadyThere){
            console.log('Already there');
            categories.innerHTML =  this.putInTemplate["ProcessButtons"]({});
            categories.id='process_buttons';
            document.getElementById('show_button').addEventListener('click', ()=>{
                this.showTheList(this.target_url+'/'+this.bread_crumb[this.bread_crumb.length-1].absoluteUrl);
            })
            document.getElementById('follow_button').addEventListener('click', ()=>{
                this.followUpACategory();
            })
            return;
        }
        categories.innerHTML =  this.putInTemplate["mainCategories"]({breadCrumbLength: this.bread_crumb.length, items: categoryItems});
        categories.querySelectorAll('li').forEach((item)=>{
            item.addEventListener('click',()=>{
                categories.querySelector('li.chosen')?.classList.remove('chosen');
                item.classList.add("chosen");
                this.resizeBreadCrumb(item.dataset.crumbDepth)
                this.createBreadCrumb({title:item.dataset.displayValue, absoluteUrl:item.dataset.absoluteUrl});
                this.deleteClusterDivs(item.dataset.crumbDepth);
                this.showTheCategories(this.target_url +"/"+ item.dataset.absoluteUrl);
            })
        })


    },
    async showTheList(targetURL){
        if(document.querySelector('#item_list')){
            document.querySelector('#item_list').remove();
        }
        let categories = document.createElement('div');
        categories.classList.add('cluster');
        categories.id='item_list';
        let clusterDivCount = document.querySelectorAll('.cluster').length;
        categories.style.width= 100- (10*clusterDivCount) + '%';
        categories.innerHTML = `<div class="loader"></div>`;
        document.querySelector('.container').appendChild(categories);
        let listItems = await this.getJSON(targetURL);
        console.log(listItems);
        if(listItems===Error){
            categories.innerHTML =  this.putInTemplate["Error"]({Error});
            return;
        }
        categories.innerHTML = this.putInTemplate["showItems"](listItems);
    },
    deleteClusterDivs(crumbDepth){
        let counter=0;
        document.querySelectorAll('.cluster').forEach((cluster)=>{
            if(counter>=crumbDepth){
                cluster.remove();
            }
            // if(counter===crumbDepth) {
            //     cluster.querySelector('.chosen').classList.remove('chosen');
            // }
            counter++;
        })
    },
    async getFacets(targetURL=this.target_url){
        //console.log(targetURL);
        let parser = new DOMParser();
        let options = {
            method: 'GET',
            mode: 'cors',
            cache: 'default'
        }
        try {
            let response = await fetch(targetURL, options);
            //console.log(response.ok);
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
                       // console.log(targetObject);
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
            return error;
        }
    },
    async getJSON(targetURL){
        //application/ld+json
        //console.log(targetURL);
        let parser = new DOMParser();
        let options = {
            method: 'GET',
            mode: 'cors',
            cache: 'default'
        }
        try {
            let response = await fetch(targetURL, options);
            //console.log(response.ok);
            let text = await response.text();
            let html = parser.parseFromString(text, 'text/html');

            let ldJSON = JSON.parse(html.querySelector('script[type="application/ld+json"]').innerText);
            console.log(ldJSON)
            return {ldJSON, targetURL};
        } catch (error) {
            console.error('Error:', error);
            return error;
        }
    },
    putInTemplate:{
        "Error":(Error)=>{return Error},
        "showItems":(dataObj)=>{
            console.log(dataObj);
            let target_url = dataObj.targetURL;
            let template=``;
            for(let item of dataObj.ldJSON){
                if(item["@type"] === "Car") {
                    template+=`<div class="item">`;
                    template+=`<img src="${item?.image}" alt="" /> `;
                    template+=`<span>${item?.name}</span>`;
                    template+=`<span>${item?.vehicleModelDate}</span>`;
                    template+=`<span>${item?.mileageFromOdometer?.value} ${item?.mileageFromOdometer?.unitCode}</span>`;
                    template+=`<span>${item?.offers?.price} ${item?.offers?.priceCurrency}</span>`;
                    template+=`</div>`;
                }
            }
            return template;
        },
        "ProcessButtons":(dataObj)=>{
            let template=``;
            template+=`<button id="follow_button">Takibe Al</button>`;
            template+=`<button id="show_button">Goster</button>`;
            return template;
        },
        "followUp":(dataObj={})=>{
            return `
                                        <dialog id="followUpDialog">
                                        <p>Asagida detaylari gorunen araci sinifini takibe alacaksiniz. Push NotificationbBildirim sikligi defult olarak 3 saattir.</p>
                                        <form method="dialog">
                                        <div>PATH: ${dataObj.path}</div>
                                        <div>ABSOLUTE URL: ${dataObj.absoluteUrl}</div>
                                        <button id="save_button">SAVE</button>
                                        <button value="cancel" formmethod="dialog">IPTAL</button>
                                        </form>
                                        </dialog>`;
        },
        "mainCategories":(dataObj)=>{
            //console.log(dataObj);
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


