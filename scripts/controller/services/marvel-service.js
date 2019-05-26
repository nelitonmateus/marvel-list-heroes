class MarvelHeroService {

    constructor() {

        /* Class Objects */
        this.paginatorUtil = new PaginatorUtil();
        this.timeUtil = new TimeUtil();
        this.MD5 = new MD5Util();
        this.ajax = new XMLHttpRequest();

        /* Req variables */
        this.baseUrl = 'https://gateway.marvel.com:443/v1/public/characters?';
        this.publicKey = '4c0dc4701d397d82609a8906ef642407';
        this.privateKey = '3432c61dd5d29334205e54a350807b961f47524a';
        this.limit = 10;
        this.orderBy = 'name';
        this.lastFilter = '';
        this.lastInputText = '';

        /* Pagination variables */
        this.totalItems = 0;
        this.visiblePages = 6;
        this.selectedPage = 1;

        this.triggeredSmartphoneResolution = false;

        /* DOM Elements */
        this.tableBody = document.querySelector("tbody");
        this.input = document.querySelector("input");
        this.headerPersonagemCol = document.querySelector("#headerPersonagemCol");
        this.paginatorPages = document.querySelector("#pages");
        this.loader = document.querySelector('#loader');
        this.content = document.querySelector('#content');
        this.noDataToShowMessage = document.querySelector('#content h2');
        this.prevPageArrow = document.querySelector('#prev-page');
        this.nextPageArrow = document.querySelector('#next-page');

        /* Backspace, Enter, Blank space, Delete */
        this.specialSearchKeyCodes = [8, 13, 32, 46];

        this.initEventListeners();
        this.getHeroes(this.baseUrl, this.timeUtil.getTimeStamp());
    }

    initEventListeners() {
        var instance = this;

        this.input.addEventListener('keyup', this.debounce((e) => {
            if (((e.keyCode >= 40 && e.keyCode <= 90) || this.specialSearchKeyCodes.indexOf(e.keyCode) > -1) || this.lastInputText != this.input.value) {
                this.lastInputText = this.input.value;
                this.searchHeroByName(this.input.value.trimLeft().trimRight());
            }
        }, 400));

        window.onload = function (e) {
            instance.checkResolution();
        };

        window.addEventListener('resize', () => {
            instance.checkResolution();
            if(this.triggeredSmartphoneResolution){                
                location.reload();
            }
        })

        this.prevPageArrow.addEventListener('click', (e) => {
            this.selectedPage--;
            this.goToPage(this.selectedPage);
        })

        this.nextPageArrow.addEventListener('click', (e) => {
            this.selectedPage++;
            this.goToPage(this.selectedPage);
        })

        this.addPaginatorEventListener();
    }

    searchHeroByName(heroName) {
        this.removeAllChildrens(this.tableBody);
        this.selectedPage = 1;

        if (heroName) {
            this.lastFilter = `${this.baseUrl}nameStartsWith=${heroName}`;
            this.getHeroes(`${this.baseUrl}nameStartsWith=${heroName}&`, this.timeUtil.getTimeStamp())
        } else {
            this.lastFilter = '';
            this.getHeroes(this.baseUrl, this.timeUtil.getTimeStamp());
        }
    }

    getHeroes(baseUrl, timestamp) {
        this.startLoading();

        var instance = this;
        instance.ajax.open("GET", `${baseUrl}orderBy=${this.orderBy}&limit=${this.limit}&ts=${timestamp}&apikey=${this.publicKey}&hash=${this.getHash(timestamp)}`, true);
        instance.ajax.send();
        instance.ajax.onreadystatechange = function () {

            if (instance.ajax.readyState == 4 && instance.ajax.status == 200) {

                var data = instance.ajax.responseText;
                var results = JSON.parse(data).data.results;

                instance.updatePagination(JSON.parse(data).data.total);

                if (results.length === 0) {
                    instance.noDataToShow();
                } else {
                    instance.showPagination();
                    results.map((character, row) => {
                        instance.addRow(row, character)
                    })
                }

                instance.stopLoading();
            } else if (instance.ajax.readyState == 4) {
                instance.stopLoading();
                instance.noCharacterToShow();
            }
        }

    }

    startLoading() {
        this.content.style.display = 'none';
        this.loader.style.display = 'block';
    }

    stopLoading() {
        this.content.style.display = 'flex';
        this.loader.style.display = 'none';
    }

    checkResolution() {
        if (window.innerWidth <= 576) {
            this.headerPersonagemCol.innerHTML = 'Nome';
            this.visiblePages = 3;
            this.triggeredSmartphoneResolution = true;
        } else {
            this.headerPersonagemCol.innerHTML = 'Personagem';
        }
    }

    debounce = (fn, time) => {
        let timeout;

        return function () {
            const functionCall = () => fn.apply(this, arguments);

            clearTimeout(timeout);
            timeout = setTimeout(functionCall, time);
        }
    }

    addRow(rowNumber, characterInfo) {
        var character = new CharacterInfo(characterInfo);
        var characterSeries = character.getSeries();
        var characterEvents = character.getEvents();

        var row = this.tableBody.insertRow(rowNumber);   

        this.addCharacterColumn(row, character);
        this.addCharacterSeriesColumn(row, characterSeries);
        this.addCharacterEventsColumn(row, characterEvents);
    }

    addCharacterColumn(row, character) {
        var characterCell = row.insertCell(0);
        characterCell.innerHTML = `
            <div class="item-personagem">
                <img src="${character.getThumbnail()}"
                    alt="Character thumbnail">

                <h3>${character.getName()}</h3>
            </div>
        `;
    }

    addCharacterSeriesColumn(row, characterSeries) {
        var seriesCell = row.insertCell(1);
        if (characterSeries.length === 0) {
            seriesCell.innerHTML = `
                <h3> Não possui séries </h3>
            `;
        }
        else {
            seriesCell.innerHTML = `
                <h3>${characterSeries[0] ? characterSeries[0] : ' '}</h3>
                <h3>${characterSeries[1] ? characterSeries[1] : ' '}</h3>
                <h3>${characterSeries[2] ? characterSeries[2] : ' '}</h3>
            `;
        }
    }

    addCharacterEventsColumn(row, characterEvents) {
        var eventsCell = row.insertCell(2);
        if (characterEvents.length === 0) {
            eventsCell.innerHTML = `
                <h3> Não possui eventos </h3>
            `;
        }
        else {
            eventsCell.innerHTML = `
                <h3>${characterEvents[0] ? characterEvents[0] : ' '}</h3>
                <h3>${characterEvents[1] ? characterEvents[1] : ' '}</h3>
                <h3>${characterEvents[2] ? characterEvents[2] : ' '}</h3>
            `;
        }
    }

    noDataToShow() {
        this.noDataToShowMessage.style.display = 'block';
        this.nextPageArrow.style.display = 'none';
        this.prevPageArrow.style.display = 'none';
    }

    showPagination() {
        this.noDataToShowMessage.style.display = 'none';
        this.nextPageArrow.style.display = 'block';
        this.prevPageArrow.style.display = 'block';
    }

    getHash(timeStamp) {
        return this.MD5.HASH(timeStamp + this.privateKey + this.publicKey).toLowerCase();
    }

    addPaginatorEventListener() {
        document.querySelectorAll('.paginator-item').forEach(btn => {
            btn.addEventListener('click', (event) => {
                this.removeAllClass(document.querySelectorAll('.paginator-item'), 'paginator-item-active');
                event.target.classList.add('paginator-item-active');
                this.selectedPage = +event.target.innerHTML;
                this.goToPage(event.target.innerHTML);
            })
        });
    }

    goToPage(page) {
        this.removeAllChildrens(this.tableBody);
        this.getHeroes(`${(this.lastFilter != '' ? this.lastFilter : this.baseUrl)}&offset=${(page - 1) * this.limit}`, this.timeUtil.getTimeStamp());
    }

    updatePagination(total) {
        let paginationInfo = this.paginatorUtil.paginate(total, this.selectedPage, this.limit, this.visiblePages);

        this.removeAllChildrens(this.paginatorPages);

        this.addPaginatorItems(paginationInfo);
        this.addPaginatorEventListener();

        this.removeAllClass(document.querySelectorAll('.paginator-arrow-left'), 'paginator-arrow-left-disabled');
        this.removeAllClass(document.querySelectorAll('.paginator-arrow-right'), 'paginator-arrow-right-disabled');

        if (paginationInfo.currentPage == paginationInfo.startPage) {
            document.querySelector('.paginator-arrow-left').classList.add('paginator-arrow-left-disabled');
        }

        if (paginationInfo.currentPage == paginationInfo.totalPages) {
            document.querySelector('.paginator-arrow-right').classList.add('paginator-arrow-right-disabled');
        }

    }

    addPaginatorItems(paginationInfo) {
        paginationInfo.pages.forEach((e) => {

            let pageElement = document.createElement('div');
            pageElement.classList.add('paginator-item');
            pageElement.innerHTML = e;

            if (e == this.selectedPage) {
                pageElement.classList.add('paginator-item-active');
            }
            this.paginatorPages.appendChild(pageElement);
        });
    }

    removeAllClass(elements, classToRemove) {
        elements.forEach(element => {
            element.classList.remove(classToRemove);
        })
    }


    removeAllChildrens(element) {
        while (element.hasChildNodes()) {
            element.removeChild(element.firstChild);
        }
    }
}
