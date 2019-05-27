class CharacterInfo {

    constructor(character) {
        this.characterData = character;
    }

    getThumbnail() {
        return this.characterData.thumbnail.path + '.' + this.characterData.thumbnail.extension;
    }

    getName() {
        return this.characterData.name;
    }

    getSeries() {
        var series = this.characterData.series.items.slice(0,3);
        var result = [];

        for (let i = 0; i < series.length; i++) {
            result.push(series[i].name);            
        }
        
        return result;
    }

    getEvents() {
        var events = this.characterData.events.items.slice(0,3);
        var result = [];

        for (let i = 0; i < events.length; i++) {
            result.push(events[i].name);            
        }
        
        return result;
    }

    getId() {
        return this.characterData.id;
    }
}