class TimeUtil {

    constructor(){}

    getTimeStamp() {
        return (Date.now() / 1000 | 0).toString();
    }
}