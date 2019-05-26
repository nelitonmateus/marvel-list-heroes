class MarvelHeroService {

    constructor() {
        // var privateKey = '68e40387a4be21cef729530c44056d0a2cae12e9';
        // var publicKey = '102d70bd77e4d3b71b2017320da567a3';

        this.timeUtil = new TimeUtil();
        this.MD5 = new MD5Util();
        this.ajax = new XMLHttpRequest();

        this.baseUrl = 'https://gateway.marvel.com:443/v1/public/characters?orderBy=name&limit=10&';
        this.publicKey = '4c0dc4701d397d82609a8906ef642407';
        this.privateKey = '3432c61dd5d29334205e54a350807b961f47524a';

        this.timeStamp = this.timeUtil.getTimeStamp();
        this.tableBody = document.querySelector("tbody");
        this.getHeroes(this.ajax);
    }

    getHeroes(ajax) {
        var instance = this;
        ajax.open("GET", `${this.baseUrl}ts=${this.timeStamp}&apikey=${this.publicKey}&hash=${this.getHash(this.timeStamp)}`, true);
        ajax.send();
        ajax.onreadystatechange = function () {

            if (ajax.readyState == 4 && ajax.status == 200) {

                var data = ajax.responseText;
                var results = JSON.parse(data).data.results;

                results.map((character, row) => {
                    instance.addRow(row, character)
                })

            }
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

}
