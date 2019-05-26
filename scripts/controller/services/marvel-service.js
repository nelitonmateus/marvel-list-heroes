class MarvelHeroService {

    constructor() {
        // this.privateKey = '68e40387a4be21cef729530c44056d0a2cae12e9';
        // this.publicKey = '102d70bd77e4d3b71b2017320da567a3';

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

        /* Pagination variables */
        this.totalItems = 0;
        this.visiblePages = 6;
        this.selectedPage = 1;

        /* DOM Elements */
        this.tableBody = document.querySelector("tbody");
        this.input = document.querySelector("input");
        this.headerPersonagemCol = document.querySelector("#headerPersonagemCol");
        this.paginatorPages = document.querySelector("#pages");

        /* Backspace, Enter, Blank space, Delete */
        this.specialSearchKeyCodes = [8, 13, 32, 46];

        this.initEventListeners();
        this.getHeroes(this.baseUrl, this.timeUtil.getTimeStamp());
    }

    initEventListeners() {
        var instance = this;

        this.input.addEventListener('keyup', this.debounce((e) => {
            if ((e.keyCode >= 40 && e.keyCode <= 90) || this.specialSearchKeyCodes.indexOf(e.keyCode) > -1) {
                this.searchHeroByName(this.input.value.trimLeft().trimRight());
            }
        }, 400));

        window.onload = function (e) {
            instance.checkTableHeaderName();
        };

        window.addEventListener('resize', () => {
            instance.checkTableHeaderName();
        })

        this.addPaginatorEventListener();
    }

    searchHeroByName(heroName) {
        this.removeAllChildrens(this.tableBody);
        this.selectedPage = 1;

        if (heroName) {
            this.getHeroes(`${this.baseUrl}nameStartsWith=${heroName}&`, this.timeUtil.getTimeStamp())
        } else {
            this.getHeroes(this.baseUrl, this.timeUtil.getTimeStamp());
        }
    }

    getHeroes(baseUrl, timestamp) {
        var instance = this;
        instance.ajax.open("GET", `${baseUrl}orderBy=${this.orderBy}&limit=${this.limit}&ts=${timestamp}&apikey=${this.publicKey}&hash=${this.getHash(timestamp)}`, true);
        instance.ajax.send();
        instance.ajax.onreadystatechange = function () {

            if (instance.ajax.readyState == 4 && instance.ajax.status == 200) {

                var data = instance.ajax.responseText;
                var results = JSON.parse(data).data.results;

                instance.updatePagination(JSON.parse(data).data.total);

                results.map((character, row) => {
                    instance.addRow(row, character)
                })

            }
        }

    }

    checkTableHeaderName() {
        if (window.innerWidth <= 576) {
            this.headerPersonagemCol.innerHTML = 'Nome';
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

        var characterCell = row.insertCell(0);
        var seriesCell = row.insertCell(1);
        var eventsCell = row.insertCell(2);

        characterCell.innerHTML = `
        <div class="item-personagem">
            <img src="${character.getThumbnail()}"
                alt="Character thumbnail">

            <h3>${character.getName()}</h3>
        </div>`;

        if (characterSeries.length === 0) {
            seriesCell.innerHTML = `
                <h3> Não possui séries </h3>
            `;
        } else {
            seriesCell.innerHTML = `
                <h3>${characterSeries[0] ? characterSeries[0] : ' '}</h3>
                <h3>${characterSeries[1] ? characterSeries[1] : ' '}</h3>
                <h3>${characterSeries[2] ? characterSeries[2] : ' '}</h3>
            `;
        }

        if (characterEvents.length === 0) {
            eventsCell.innerHTML = `
                <h3> Não possui eventos </h3>
            `;
        } else {
            eventsCell.innerHTML = `
                <h3>${characterEvents[0] ? characterEvents[0] : ' '}</h3>
                <h3>${characterEvents[1] ? characterEvents[1] : ' '}</h3>
                <h3>${characterEvents[2] ? characterEvents[2] : ' '}</h3>
            `;
        }
    }

    getHash(timeStamp) {
        return this.MD5.HASH(timeStamp + this.privateKey + this.publicKey).toLowerCase();
    }

    addPaginatorEventListener() {
        document.querySelectorAll('.paginator-item').forEach(btn => {
            btn.addEventListener('click', (event) => {
                this.removeAllClass(document.querySelectorAll('.paginator-item'),'paginator-item-active');
                event.target.classList.add('paginator-item-active');
                this.selectedPage = +event.target.innerHTML;
                this.goToPage(event.target.innerHTML);
            })
        })
    }

    goToPage(page) {
        this.removeAllChildrens(this.tableBody);
        this.getHeroes(`${this.baseUrl}&offset=${(page - 1) * this.limit}`, this.timeUtil.getTimeStamp());
    }

    updatePagination(total) {
        let paginationInfo = this.paginatorUtil.paginate(total, this.selectedPage, this.limit, this.visiblePages);

        this.removeAllChildrens(this.paginatorPages);

        paginationInfo.pages.forEach((e) => {
            let pageElement = document.createElement('div');
            pageElement.classList.add('paginator-item');
            pageElement.innerHTML = e;

            if (e == this.selectedPage) {
                pageElement.classList.add('paginator-item-active');
            }

            this.paginatorPages.appendChild(pageElement);
        })

        this.addPaginatorEventListener();

        this.removeAllClass(document.querySelectorAll('.paginator-arrow-left'),'paginator-arrow-left-disabled');
        this.removeAllClass(document.querySelectorAll('.paginator-arrow-right'),'paginator-arrow-right-disabled');

        console.log(paginationInfo);

        if(paginationInfo.currentPage == paginationInfo.startPage){
            document.querySelector('.paginator-arrow-left').classList.add('paginator-arrow-left-disabled');
        }

        if(paginationInfo.currentPage == paginationInfo.totalPages){
            document.querySelector('.paginator-arrow-right').classList.add('paginator-arrow-right-disabled');
        }

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
